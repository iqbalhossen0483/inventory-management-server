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
import { AuthGaurd } from 'src/guards/AuthGaurd';
import { CreateCategoryDto, GetCategoriesDto } from './category.dto';
import { CategoryService } from './category.service';

@UseGuards(AuthGaurd)
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('create')
  async createCategory(@Body() payload: CreateCategoryDto) {
    return this.categoryService.createCategory(payload);
  }

  @Get('all')
  async getAllCategories(@Query() payload: GetCategoriesDto) {
    return this.categoryService.getAllCategories(payload);
  }

  @Get('get-single/:id')
  async getCategoryById(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.getCategoryById(id);
  }

  @Put('update/:id')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: CreateCategoryDto,
  ) {
    return this.categoryService.updateCategory(id, payload);
  }

  @Delete('delete/:id')
  async softDeleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.softDeleteCategory(id);
  }
}
