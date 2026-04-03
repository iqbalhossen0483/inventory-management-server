import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Name of the category',
    example: 'Electronics',
  })
  @IsNotEmpty({ message: 'Category name is required' })
  @IsString({ message: 'Category name must be a string' })
  name: string;

  @ApiProperty({
    description: 'Description of the category',
    example: 'Electronics category for storing electronic items',
  })
  @IsNotEmpty({ message: 'Category description is required' })
  @IsString({ message: 'Category description must be a string' })
  description: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    description: 'Name of the category',
    example: 'Electronics',
  })
  @IsOptional()
  @IsString({ message: 'Category name must be a string' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Description of the category',
    example: 'Electronics category for storing electronic items',
  })
  @IsString({ message: 'Category description must be a string' })
  description?: string;
}

export class GetCategoriesDto {
  @ApiPropertyOptional({
    description: 'Search query for filtering categories',
    example: 'Electronics',
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
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page for pagination',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
