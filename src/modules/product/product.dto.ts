import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ProductStatus } from 'src/entites/product.entity';

export class CreateProductDto {
  @ApiProperty({
    description: 'Name of the product',
    example: 'iPhone 13',
  })
  @IsNotEmpty({ message: 'Product name is required' })
  @IsString({ message: 'Product name must be a string' })
  name: string;

  @ApiProperty({
    description: 'Sale price of the product',
    example: 999,
  })
  @IsNotEmpty({ message: 'Sale price is required' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Sale price must be a number' })
  sale_price: number;

  @ApiProperty({
    description: 'Discount price of the product',
    example: 899,
  })
  @IsNotEmpty({ message: 'Discount price is required' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Discount price must be a number' })
  discount_price: number;

  @ApiProperty({
    description: 'Purchase price of the product',
    example: 799,
  })
  @IsNotEmpty({ message: 'Purchase price is required' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Purchase price must be a number' })
  purchase_price: number;

  @ApiProperty({
    description: 'Stock quantity of the product',
    example: 100,
  })
  @IsNotEmpty({ message: 'Stock quantity is required' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Stock quantity must be a number' })
  stock_quantity: number;

  @ApiProperty({
    description: 'Minimum stock threshold of the product',
    example: 10,
  })
  @IsNotEmpty({ message: 'Minimum stock threshold is required' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Minimum stock threshold must be a number' })
  minimum_stock_threshold: number;

  @ApiProperty({
    description: 'Category ID of the product',
    example: 1,
  })
  @IsNotEmpty({ message: 'Category ID is required' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Category ID must be a number' })
  category_id: number;

  @ApiProperty({
    description: 'Status of the product',
    example: ProductStatus.ACTIVE,
  })
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(ProductStatus, {
    message: 'Status must be either active or out_of_stock',
  })
  status: ProductStatus;
}

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: 'Name of the product',
    example: 'iPhone 13',
  })
  @IsOptional()
  @IsString({ message: 'Product name must be a string' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Sale price of the product',
    example: 999,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Sale price must be a number' })
  sale_price?: number;

  @ApiPropertyOptional({
    description: 'Discount price of the product',
    example: 899,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Discount price must be a number' })
  discount_price?: number;

  @ApiPropertyOptional({
    description: 'Purchase price of the product',
    example: 799,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Purchase price must be a number' })
  purchase_price?: number;

  @ApiPropertyOptional({
    description: 'Stock quantity of the product',
    example: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Stock quantity must be a number' })
  stock_quantity?: number;

  @ApiPropertyOptional({
    description: 'Minimum stock threshold of the product',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Minimum stock threshold must be a number' })
  minimum_stock_threshold?: number;

  @ApiPropertyOptional({
    description: 'Category ID of the product',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Category ID must be a number' })
  category_id?: number;

  @ApiPropertyOptional({
    description: 'Status of the product',
    example: ProductStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ProductStatus, {
    message: 'Status must be either active or out_of_stock',
  })
  status?: ProductStatus;
}

export class GetProductsDto {
  @ApiPropertyOptional({
    description: 'Search query for filtering products',
    example: 'iPhone',
  })
  @IsOptional()
  @IsString({ message: 'Search query must be a string' })
  search?: string;

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
  @IsNumber({}, { message: 'Limit must be a number' })
  limit?: number;
}
