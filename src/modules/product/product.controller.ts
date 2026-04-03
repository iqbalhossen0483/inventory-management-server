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
import {
  CreateProductDto,
  GetProductsDto,
  UpdateProductDto,
  updateStockDto,
} from './product.dto';
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
    @Body() payload: UpdateProductDto,
  ) {
    return this.productService.updateProduct(id, payload);
  }

  @Put('update-stock/:id')
  async updateProductStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: updateStockDto,
    @CurrentUserId() currentUserId: number,
  ) {
    return this.productService.updateProductStock(id, payload, currentUserId);
  }

  @Delete('delete/:id')
  async softDeleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productService.softDeleteProduct(id);
  }
}
