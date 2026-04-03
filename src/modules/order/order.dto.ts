import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { OrderStatus } from 'src/entites/order.entity';

export class OrderedProductDto {
  @ApiProperty({
    description: 'ID of the product',
    example: 1,
  })
  @IsNotEmpty({ message: 'Product ID is required' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Product ID must be a number' })
  product_id: number;

  @ApiProperty({
    description: 'Quantity of the product',
    example: 2,
  })
  @IsNotEmpty({ message: 'Quantity is required' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Quantity must be a number' })
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Customer name',
    example: 'John Doe',
  })
  @IsNotEmpty({ message: 'Customer name is required' })
  @IsString({ message: 'Customer name must be a string' })
  customer_name: string;

  @ApiProperty({
    description: 'Customer phone number',
    example: '1234567890',
  })
  @IsNotEmpty({ message: 'Customer phone number is required' })
  @IsString({ message: 'Customer phone number must be a string' })
  @Length(11, 11, {
    message: 'Customer phone number must be exactly 11 characters',
  })
  customer_phone: string;

  @ApiProperty({
    description: 'Customer address',
    example: '123 Main St, Anytown, USA',
  })
  @IsNotEmpty({ message: 'Customer address is required' })
  @IsString({ message: 'Customer address must be a string' })
  customer_address: string;

  @ApiProperty({
    description: 'Status of order',
    example: OrderStatus.PENDING,
  })
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(OrderStatus, { message: 'Status must be a valid enum value' })
  status: OrderStatus;

  @ApiProperty({
    description: 'List of ordered products',
    type: [OrderedProductDto],
    example: [{ product_id: 1, quantity: 2 }],
  })
  @IsNotEmpty({ message: 'Ordered products are required' })
  @IsArray({ message: 'Ordered products must be an array' })
  @ValidateNested({ each: true })
  @Type(() => OrderedProductDto)
  ordered_products: OrderedProductDto[];
}

export class UpdateOrderDto {
  @ApiPropertyOptional({
    description: 'Customer name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString({ message: 'Customer name must be a string' })
  customer_name?: string;

  @ApiPropertyOptional({
    description: 'Customer phone number',
    example: '1234567890',
  })
  @IsOptional()
  @IsString({ message: 'Customer phone number must be a string' })
  @Length(11, 11, {
    message: 'Customer phone number must be exactly 11 characters',
  })
  customer_phone?: string;

  @ApiPropertyOptional({
    description: 'List of ordered products',
    type: [OrderedProductDto],
    example: [{ product_id: 1, quantity: 2 }],
  })
  @IsOptional()
  @IsArray({ message: 'Ordered products must be an array' })
  @ValidateNested({ each: true })
  @Type(() => OrderedProductDto)
  ordered_products?: OrderedProductDto[];
}

export class UpdateOrderStatusDto {
  @ApiPropertyOptional({
    description: 'Status of order',
    example: OrderStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Status must be a valid enum value' })
  status?: OrderStatus;
}

export class GetOrdersFilterDto {
  @ApiPropertyOptional({
    description: 'Status of order',
    example: OrderStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Status must be a valid enum value' })
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Minimum total amount of order',
    example: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Minimum total amount must be a number' })
  min_total_amount?: number;

  @ApiPropertyOptional({
    description: 'Maximum total amount of order',
    example: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Maximum total amount must be a number' })
  max_total_amount?: number;

  @ApiPropertyOptional({
    description: 'Start date for order creation',
    example: '2024-01-01',
  })
  @IsOptional()
  @Type(() => Date)
  created_after?: Date;

  @ApiPropertyOptional({
    description: 'End date for order creation',
    example: '2024-12-31',
  })
  @IsOptional()
  @Type(() => Date)
  created_before?: Date;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Page number must be a number' })
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page for pagination',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Items per page must be a number' })
  limit?: number;
}
