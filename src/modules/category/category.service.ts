import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from 'src/entites/category.entity';
import { API_Meta } from 'src/types/common';
import { Repository } from 'typeorm';
import { CreateCategoryDto, GetCategoriesDto } from './category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
  ) {}

  async createCategory(payload: CreateCategoryDto) {
    const category = this.categoryRepository.create(payload);

    // check if category with the same name already exists
    const existingCategory = await this.categoryRepository.findOne({
      where: { name: payload.name },
    });

    if (existingCategory) {
      throw new ConflictException('Category with the same name already exists');
    }

    // save the new category to the database
    const newCateory = await this.categoryRepository.save(category);

    return {
      success: true,
      message: 'Category created successfully',
      data: newCateory,
    };
  }

  async getAllCategories(payload: GetCategoriesDto) {
    const { search, page = 1, limit = 10 } = payload;
    const query = this.categoryRepository.createQueryBuilder('category');

    if (search) {
      query.where('category.name ILIKE :search', { search: `%${search}%` });
    }

    if (page && limit) {
      const offset = (page - 1) * limit;
      query.skip(offset).take(limit);
    }
    const [categories, total] = await query.getManyAndCount();

    const meta: API_Meta = {
      total,
      limit,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };

    return {
      success: true,
      message: 'Categories fetched successfully',
      data: categories,
      meta,
    };
  }

  async getCategoryById(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return {
      success: true,
      message: 'Category fetched successfully',
      data: category,
    };
  }

  async updateCategory(id: number, payload: CreateCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check for name uniqueness if name is being updated
    if (payload.name && payload.name !== category.name) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name: payload.name },
      });
      if (existingCategory) {
        throw new ConflictException(
          'Category with the same name already exists',
        );
      }
    }

    // merge the existing category with the new data
    const updatedCategory = this.categoryRepository.merge(category, payload);

    // save the updated category to the database
    await this.categoryRepository.save(updatedCategory);

    return {
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory,
    };
  }

  async softDeleteCategory(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.categoryRepository.softDelete(id);

    return {
      success: true,
      message: 'Category deleted successfully',
    };
  }
}
