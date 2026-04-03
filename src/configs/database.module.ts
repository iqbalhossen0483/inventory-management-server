import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityEntity } from 'src/entites/activity.entity';
import { CategoryEntity } from 'src/entites/category.entity';
import { LowStockEntity } from 'src/entites/low_stock.entity';
import { OrderedProductEntity, OrderEntity } from 'src/entites/order.entity';
import { ProductEntity } from 'src/entites/product.entity';
import { UserEntity } from 'src/entites/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASS'),
        database: configService.get('DB_NAME'),
        entities: [
          UserEntity,
          CategoryEntity,
          ProductEntity,
          OrderEntity,
          OrderedProductEntity,
          ActivityEntity,
          LowStockEntity,
        ],
        synchronize: configService.get('NODE_ENV') !== 'production',
      }),
    }),
  ],
})
export class DatabaseModule {}
