import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityEntity } from 'src/entites/activity.entity';
import { LowStockEntity } from 'src/entites/low_stock.entity';
import { ProductEntity } from 'src/entites/product.entity';
import { UserEntity } from 'src/entites/user.entity';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      UserEntity,
      ActivityEntity,
      LowStockEntity,
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
