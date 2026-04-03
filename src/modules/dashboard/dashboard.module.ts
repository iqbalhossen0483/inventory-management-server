import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityEntity } from 'src/entites/activity.entity';
import { OrderEntity } from 'src/entites/order.entity';
import { ProductEntity } from 'src/entites/product.entity';
import { ActivityService } from 'src/services/activity.service';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, ProductEntity, ActivityEntity]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService, ActivityService],
})
export class DashboardModule {}
