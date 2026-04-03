import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from 'src/entites/category.entity';
import { ProductEntity } from 'src/entites/product.entity';
import { UserEntity } from 'src/entites/user.entity';
import { API_Meta } from 'src/types/common';
import { Repository } from 'typeorm';
import {
  CreateProductDto,
  GetProductsDto,
  UpdateProductDto,
} from './product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
  ) {}

  async createProduct(payload: CreateProductDto, currentUserId: number) {
    const existingProduct = await this.productRepository.findOne({
      where: { name: payload.name },
    });
    if (existingProduct) {
      throw new ConflictException('Product with the same name already exists');
    }

    // save the new product to the database
    const newProduct = this.productRepository.create(payload);
    newProduct.created_by = { id: currentUserId } as UserEntity;
    newProduct.category = { id: payload.category_id } as CategoryEntity;
    await this.productRepository.save(newProduct);

    return {
      success: true,
      message: 'Product created successfully',
      data: newProduct,
    };
  }

  async getAllProducts(payload: GetProductsDto) {
    const { page = 1, limit = 10, search } = payload;

    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.created_by', 'created_by');

    if (search) {
      query.where('product.name ILIKE :search', { search: `%${search}%` });
    }

    const [products, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const meta: API_Meta = {
      total,
      limit,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };

    return {
      success: true,
      message: 'Products fetched successfully',
      data: products,
      meta,
    };
  }

  async getProductById(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'created_by'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      success: true,
      message: 'Product fetched successfully',
      data: product,
    };
  }

  async updateProduct(id: number, payload: UpdateProductDto) {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check for name uniqueness if name is being updated
    if (payload.name && payload.name !== product.name) {
      const existingProduct = await this.productRepository.findOne({
        where: { name: payload.name },
      });
      if (existingProduct) {
        throw new ConflictException(
          'Product with the same name already exists',
        );
      }
    }

    // Update the product with new values
    Object.assign(product, payload);
    await this.productRepository.save(product);

    return {
      success: true,
      message: 'Product updated successfully',
      data: product,
    };
  }

  async softDeleteProduct(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.softDelete(id);

    return {
      success: true,
      message: 'Product deleted successfully',
    };
  }
}
