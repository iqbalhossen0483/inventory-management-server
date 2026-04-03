import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from 'src/entites/order.entity';
import { ProductEntity } from 'src/entites/product.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, ProductEntity])],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [],
})
export class OrderModule {}
