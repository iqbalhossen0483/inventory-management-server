import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUserId } from 'src/decorators/currentUserId';
import { AuthGaurd } from 'src/guards/AuthGaurd';
import { CreateProductDto, GetProductsDto } from './product.dto';
import { ProductService } from './product.service';

@UseGuards(AuthGaurd)
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('create')
  async createProduct(
    @Body() payload: CreateProductDto,
    @CurrentUserId() currentUserId: number,
  ) {
    return this.productService.createProduct(payload, currentUserId);
  }

  @Get('get-all')
  async getAllProducts(@Query() payload: GetProductsDto) {
    return this.productService.getAllProducts(payload);
  }

  @Get('get-single/:id')
  async getProductById(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getProductById(id);
  }

  @Put('update/:id')
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: CreateProductDto,
  ) {
    return this.productService.updateProduct(id, payload);
  }

  @Delete('delete/:id')
  async softDeleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productService.softDeleteProduct(id);
  }
}
