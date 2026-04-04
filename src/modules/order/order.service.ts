import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment from 'moment';
import { ActivityEntity } from 'src/entites/activity.entity';
import { LowStockEntity, StockLevel } from 'src/entites/low_stock.entity';
import {
  OrderedProductEntity,
  OrderEntity,
  OrderStatus,
} from 'src/entites/order.entity';
import { ProductEntity, ProductStatus } from 'src/entites/product.entity';
import { UserEntity } from 'src/entites/user.entity';
import { API_Meta } from 'src/types/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import {
  CreateOrderDto,
  GetOrdersFilterDto,
  OrderedProductDto,
  UpdateOrderDto,
} from './order.dto';

type ProductValidList = {
  id: number;
  price_at_order_time: number;
  quantity: number;
  total_price: number;
};

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private orderRepository: Repository<OrderEntity>,
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
    private dataSource: DataSource,
  ) {}

  async validateOrderedProducts(orderedProducts: OrderedProductDto[]) {
    // validate duplication
    const uniqueIds = new Set();
    for (const item of orderedProducts) {
      if (uniqueIds.has(item.product_id)) {
        throw new ConflictException(
          `Product ID ${item.product_id} is duplicated`,
        );
      }
      uniqueIds.add(item.product_id);
    }

    let totalAmount = 0;
    const insufficientStockProducts: number[] = [];
    const nonExistentProducts: number[] = [];
    const validProducts: ProductValidList[] = [];
    for (const item of orderedProducts) {
      const product = await this.productRepository.findOne({
        where: { id: item.product_id },
      });
      if (!product) {
        nonExistentProducts.push(item.product_id);
        continue;
      }

      if (product.status === ProductStatus.INACTIVE) {
        throw new BadRequestException(
          `Product ID ${item.product_id} currently unavailable`,
        );
      }

      if (product.stock_quantity < item.quantity) {
        insufficientStockProducts.push(item.product_id);
        continue;
      }
      const total = product.sale_price * item.quantity;
      validProducts.push({
        id: product.id,
        price_at_order_time: product.sale_price,
        quantity: item.quantity,
        total_price: total,
      });
      totalAmount += total;
    }

    if (nonExistentProducts.length > 0) {
      throw new NotFoundException(
        `Products with IDs ${nonExistentProducts.join(', ')} not found`,
      );
    }

    if (insufficientStockProducts.length > 0) {
      let messages = `Product ID ${insufficientStockProducts.join(', ')} has insufficient stock.`;
      const validProductIds = validProducts.map((item) => item.id);
      if (validProductIds.length === 0) {
        messages += `. Only product ID: ${validProductIds.join(', ')}`;
      }
      throw new ConflictException(messages);
    }

    return { totalAmount, validProducts };
  }

  private getStockLevel(
    currentStock: number,
    minimumThreshold: number,
  ): StockLevel {
    const percentage = (currentStock / minimumThreshold) * 100;

    if (percentage > 50) return StockLevel.LOW;
    if (percentage > 20) return StockLevel.MEDIUM;
    return StockLevel.HIGH;
  }

  async queueProductForLowStock(
    queryRunner: QueryRunner,
    item: ProductValidList,
  ) {
    const product = await queryRunner.manager.findOne(ProductEntity, {
      where: { id: item.id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Mark Out of Stock if quantity is 0
    if (product.stock_quantity <= 0) {
      product.status = ProductStatus.OUT_OF_STOCK;
      await queryRunner.manager.save(product);
    }

    // Add to Low Stock / Restock Queue if below threshold
    else if (product.stock_quantity < product.minimum_stock_threshold) {
      // check if already in queue to avoid duplicates
      const existingLowStock = await queryRunner.manager.findOne(
        LowStockEntity,
        {
          where: { product: { id: product.id } },
        },
      );

      if (!existingLowStock) {
        const lowStock = queryRunner.manager.create(LowStockEntity, {
          product: product,
          stock_level: this.getStockLevel(
            product.stock_quantity,
            product.minimum_stock_threshold,
          ),
        });
        await queryRunner.manager.save(lowStock);

        // Create activity
        const time = moment().utc().format('YYYY-MM-DD HH:mm:ss');
        const activity = queryRunner.manager.create(ActivityEntity, {
          description: `${time} - Product "${product.name}" added to Restock Queue`,
        });
        await queryRunner.manager.save(activity);
      }
    }
  }

  async createOrder(payload: CreateOrderDto, currentUserId: number) {
    const orderedProducts = payload.ordered_products;

    // Validate that all products exist, have stocks and calculate total amount
    const { totalAmount, validProducts } =
      await this.validateOrderedProducts(orderedProducts);

    // query runner;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(UserEntity, {
        where: { id: currentUserId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const order = queryRunner.manager.create(OrderEntity, {
        customer_name: payload.customer_name,
        customer_address: payload.customer_address,
        customer_phone: payload.customer_phone,
        created_by: user,
        total_amount: totalAmount,
        status: payload.status,
        ordered_products: validProducts.map((item) => ({
          product: { id: item.id },
          quantity: item.quantity,
          price_at_order_time: item.price_at_order_time,
          total_price: item.total_price,
        })),
      });

      await queryRunner.manager.save(order);

      // Decrease stock quantity for each product
      for (const item of validProducts) {
        await queryRunner.manager.decrement(
          ProductEntity,
          { id: item.id },
          'stock_quantity',
          item.quantity,
        );

        // check stock and queue low stock items
        await this.queueProductForLowStock(queryRunner, item);
      }

      // Create activity
      const time = moment().utc().format('YYYY-MM-DD HH:mm:ss');
      const activity = queryRunner.manager.create(ActivityEntity, {
        description: `${time} - Order #${order.id} created by ${user.name}`,
      });
      await queryRunner.manager.save(activity);

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Order created successfully',
        data: order,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getAllOrders(queries: GetOrdersFilterDto) {
    const {
      created_after,
      created_before,
      limit = 10,
      page = 1,
      status,
      min_total_amount,
      max_total_amount,
    } = queries;

    const queryBuilder = this.orderRepository.createQueryBuilder('order');

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (min_total_amount) {
      queryBuilder.andWhere('order.total_amount >= :min_total_amount', {
        min_total_amount,
      });
    }

    if (max_total_amount) {
      queryBuilder.andWhere('order.total_amount <= :max_total_amount', {
        max_total_amount,
      });
    }

    if (created_after) {
      queryBuilder.andWhere('order.created_at >= :created_after', {
        created_after,
      });
    }

    if (created_before) {
      queryBuilder.andWhere('order.created_at <= :created_before', {
        created_before,
      });
    }

    queryBuilder.orderBy('order.created_at', 'DESC');
    queryBuilder.leftJoinAndSelect(
      'order.ordered_products',
      'ordered_products',
    );
    queryBuilder.leftJoinAndSelect('ordered_products.product', 'product');
    queryBuilder.leftJoinAndSelect('order.created_by', 'created_by');

    const [orders, total] = await queryBuilder
      .orderBy('order.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const meta: API_Meta = {
      total,
      limit,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };

    return {
      success: true,
      message: 'Orders retrieved successfully',
      data: orders,
      meta,
    };
  }

  async getOrderById(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['ordered_products', 'ordered_products.product', 'created_by'],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return {
      success: true,
      message: 'Order retrieved successfully',
      data: order,
    };
  }

  async updateOrderStatus(
    id: number,
    status: OrderStatus,
    currentUserId: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(UserEntity, {
        where: { id: currentUserId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const order = await queryRunner.manager.findOne(OrderEntity, {
        where: { id },
        relations: ['ordered_products', 'ordered_products.product'],
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      const previousStatus = order.status;

      // restore stock only when moving to cancelled
      if (
        previousStatus !== OrderStatus.CANCELLED &&
        status === OrderStatus.CANCELLED
      ) {
        for (const item of order.ordered_products) {
          await queryRunner.manager.increment(
            ProductEntity,
            { id: item.product.id },
            'stock_quantity',
            item.quantity,
          );
        }
      }

      order.status = status;

      await queryRunner.manager.save(order);

      // Create activity
      const time = moment().utc().format('YYYY-MM-DD HH:mm:ss');
      const activity = queryRunner.manager.create(ActivityEntity, {
        description: `${time} - Order #${order.id} mark as ${status} by ${user.name}`,
      });
      await queryRunner.manager.save(activity);

      await queryRunner.commitTransaction();
      return {
        success: true,
        message: 'Order status updated successfully',
        data: order,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateOrder(id: number, payload: UpdateOrderDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(OrderEntity, {
        where: { id },
        relations: ['ordered_products', 'ordered_products.product'],
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      const { ordered_products, ...orderData } = payload;

      let totalAmount = order.total_amount;

      if (ordered_products && ordered_products.length > 0) {
        const validated = await this.validateOrderedProducts(ordered_products);
        totalAmount = validated.totalAmount;

        // Restore old stock first
        for (const oldItem of order.ordered_products) {
          await queryRunner.manager.increment(
            ProductEntity,
            { id: oldItem.product.id },
            'stock_quantity',
            oldItem.quantity,
          );
        }

        // Deduct new stock
        for (const item of validated.validProducts) {
          await queryRunner.manager.decrement(
            ProductEntity,
            { id: item.id },
            'stock_quantity',
            item.quantity,
          );
        }

        // Remove previous ordered items directly via DB
        await queryRunner.manager.delete(OrderedProductEntity, {
          order: { id: order.id },
        });

        // Detach old ordered_products so cascade doesn't try to update them
        order.ordered_products = [];

        // Save order first (no cascade interference now)
        const updatedOrder = queryRunner.manager.merge(OrderEntity, order, {
          ...orderData,
          total_amount: totalAmount,
        });
        await queryRunner.manager.save(OrderEntity, updatedOrder);

        // Insert new ordered items using raw insert to bypass cascade entirely
        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(OrderedProductEntity)
          .values(
            validated.validProducts.map((item) => ({
              order: { id: order.id },
              product: { id: item.id },
              quantity: item.quantity,
              price_at_order_time: item.price_at_order_time,
              total_price: item.total_price,
            })),
          )
          .execute();

        await queryRunner.commitTransaction();

        return {
          success: true,
          message: 'Order updated successfully',
          data: updatedOrder,
        };
      }

      // No ordered_products in payload — just update order fields
      order.ordered_products = [];
      const updatedOrder = queryRunner.manager.merge(OrderEntity, order, {
        ...orderData,
        total_amount: totalAmount,
      });
      await queryRunner.manager.save(OrderEntity, updatedOrder);

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Order updated successfully',
        data: updatedOrder,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async softDeleteOrder(id: number) {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.orderRepository.softDelete(id);

    return {
      success: true,
      message: 'Order deleted successfully',
    };
  }
}
