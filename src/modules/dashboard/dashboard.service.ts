import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment from 'moment';
import { LowStockEntity } from 'src/entites/low_stock.entity';
import { OrderEntity, OrderStatus } from 'src/entites/order.entity';
import { ProductEntity } from 'src/entites/product.entity';
import { Between, Repository } from 'typeorm';
import { GetDashboardDataDto, GetLowStockDto } from './dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(OrderEntity)
    private orderRepository: Repository<OrderEntity>,
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
    @InjectRepository(LowStockEntity)
    private lowStockRepository: Repository<LowStockEntity>,
  ) {}

  async getDashboardReport(queries: GetDashboardDataDto) {
    const { date, start_date, end_date } = queries;

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (date) {
      // single date
      startDate = moment(date).startOf('day').toDate();
      endDate = moment(date).endOf('day').toDate();
    } else if (start_date && end_date) {
      // date range
      startDate = moment(start_date).startOf('day').toDate();
      endDate = moment(end_date).endOf('day').toDate();
    }

    // --- Total Orders ---
    const totalOrders = await this.orderRepository.count({
      where:
        startDate && endDate ? { created_at: Between(startDate, endDate) } : {},
    });

    // --- Pending Orders ---
    const pendingOrders = await this.orderRepository.count({
      where:
        startDate && endDate
          ? {
              status: OrderStatus.PENDING,
              created_at: Between(startDate, endDate),
            }
          : { status: OrderStatus.PENDING },
    });

    // --- Delivered Orders ---
    const completedOrders = await this.orderRepository.count({
      where:
        startDate && endDate
          ? {
              status: OrderStatus.DELIVERED,
              created_at: Between(startDate, endDate),
            }
          : { status: OrderStatus.DELIVERED },
    });

    // --- Cancelled Orders ---
    const cancelledOrders = await this.orderRepository.count({
      where:
        startDate && endDate
          ? {
              status: OrderStatus.CANCELLED,
              created_at: Between(startDate, endDate),
            }
          : { status: OrderStatus.CANCELLED },
    });

    // --- Low Stock Items ---
    const lowStockQuery = this.productRepository
      .createQueryBuilder('product')
      .where('product.stock_quantity <= product.minimum_stock_threshold');

    // --- Revenue ---
    const revenueQuery = this.orderRepository
      .createQueryBuilder('order')
      .select('COALESCE(SUM(order.total_amount), 0)', 'total')
      .where('order.status = :status', { status: OrderStatus.DELIVERED });

    if (startDate && endDate) {
      revenueQuery.andWhere('order.created_at BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      });
      lowStockQuery.andWhere('product.created_at BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      });
    }
    const revenueResult = await revenueQuery.getRawOne<{ total: number }>();
    const lowStockCount = await lowStockQuery.getCount();

    const result = {
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      lowStockCount,
      revenue: Number(revenueResult?.total || 0),
    };

    return {
      success: true,
      message: 'Dashboard data fetched successfully',
      data: result,
    };
  }

  async getLowStockItems(queries: GetLowStockDto) {
    const { page = 1, limit = 10 } = queries;
    const lowStockItems = await this.lowStockRepository.find({
      order: {
        created_at: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      success: true,
      message: 'Low stock items fetched successfully',
      data: lowStockItems,
    };
  }
}
