import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class GetDashboardDataDto {
  @ApiPropertyOptional({
    description: 'Start date for order creation',
    example: '2024-01-01',
  })
  @IsOptional()
  @Type(() => Date)
  start_date?: Date;

  @ApiPropertyOptional({
    description: 'End date for order creation',
    example: '2024-01-01',
  })
  @IsOptional()
  @Type(() => Date)
  end_date?: Date;

  @ApiPropertyOptional({
    description: 'Date for order creation',
    example: '2024-01-01',
  })
  @IsOptional()
  @Type(() => Date)
  date?: Date;
}

export class GetLowStockDto {
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
