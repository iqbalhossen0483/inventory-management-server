import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment from 'moment';
import { ActivityEntity } from 'src/entites/activity.entity';
import { CategoryEntity } from 'src/entites/category.entity';
import { LowStockEntity } from 'src/entites/low_stock.entity';
import { ProductEntity } from 'src/entites/product.entity';
import { UserEntity, UserRole } from 'src/entites/user.entity';
import { API_Meta } from 'src/types/common';
import { Repository } from 'typeorm';
import {
  CreateProductDto,
  GetProductsDto,
  UpdateProductDto,
  updateStockDto,
  UpdateStockType,
} from './product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ActivityEntity)
    private activityRepository: Repository<ActivityEntity>,
    @InjectRepository(LowStockEntity)
    private lowStockRepository: Repository<LowStockEntity>,
  ) {}

  async createProduct(payload: CreateProductDto, currentUserId: number) {
    const existingProduct = await this.productRepository.findOne({
      where: { name: payload.name },
    });
    if (existingProduct) {
      throw new ConflictException('Product with the same name already exists');
    }

    // save the new product to the database
    const newProduct = this.productRepository.create(payload);
    newProduct.created_by = { id: currentUserId } as UserEntity;
    newProduct.category = { id: payload.category_id } as CategoryEntity;
    await this.productRepository.save(newProduct);

    return {
      success: true,
      message: 'Product created successfully',
      data: newProduct,
    };
  }

  async getAllProducts(payload: GetProductsDto) {
    const { page = 1, limit = 10, search } = payload;

    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.created_by', 'created_by');

    if (search) {
      query.where('product.name ILIKE :search', { search: `%${search}%` });
    }

    const [products, total] = await query
      .orderBy('product.created_at', 'DESC')
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
      message: 'Products fetched successfully',
      data: products,
      meta,
    };
  }

  async getProductById(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'created_by'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      success: true,
      message: 'Product fetched successfully',
      data: product,
    };
  }

  async updateProduct(id: number, payload: UpdateProductDto) {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check for name uniqueness if name is being updated
    if (payload.name && payload.name !== product.name) {
      const existingProduct = await this.productRepository.findOne({
        where: { name: payload.name },
      });
      if (existingProduct) {
        throw new ConflictException(
          'Product with the same name already exists',
        );
      }
    }

    // Update the product with new values
    Object.assign(product, payload);
    await this.productRepository.save(product);

    return {
      success: true,
      message: 'Product updated successfully',
      data: product,
    };
  }

  async updateProductStock(
    id: number,
    payload: updateStockDto,
    currentUserId: number,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
    });

    if (!user) {
      throw new UnauthorizedException('Unauthorized user');
    }

    if (
      payload.type === UpdateStockType.DECREASE &&
      user.role !== UserRole.ADMIN
    ) {
      throw new UnauthorizedException('Unauthorized user access');
    }
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (payload.type === UpdateStockType.INCREASE) {
      product.stock_quantity += payload.stock_quantity;
    } else if (payload.type === UpdateStockType.DECREASE) {
      product.stock_quantity -= payload.stock_quantity;
    }

    await this.productRepository.save(product);

    // Create activity
    const time = moment().utc().format('YYYY-MM-DD HH:mm:ss');
    const activity = this.activityRepository.create({
      description: `${time} - Stock updated for "${product.name}" by ${user.name}`,
    });
    await this.activityRepository.save(activity);

    // remove from low stock queue if stock is increased
    if (payload.type === UpdateStockType.INCREASE) {
      const lowStock = await this.lowStockRepository.findOne({
        where: { product: { id: product.id } },
      });
      if (lowStock) {
        await this.lowStockRepository.remove(lowStock);
      }
    }

    return {
      success: true,
      message: 'Product stock updated successfully',
      data: product,
    };
  }

  async softDeleteProduct(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.softDelete(id);

    return {
      success: true,
      message: 'Product deleted successfully',
    };
  }
}
