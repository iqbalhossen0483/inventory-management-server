import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import { UserEntity } from 'src/entites/user.entity';
import { Repository } from 'typeorm';
import { createUserDto, getUserDto, updateUserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getAllUsers(queries: getUserDto, currentUserId: number) {
    const { page = 1, limit = 10, email } = queries;

    const query = this.userRepository.createQueryBuilder('user');

    // skip current user
    query.where('user.id != :currentUserId', { currentUserId });

    if (email) {
      query.where('user.email ILIKE :email', { email: `%${email}%` });
    }

    query.skip((page - 1) * limit).take(limit);

    const [users, total] = await query.getManyAndCount();

    const meta = {
      total,
      limit,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
    return {
      success: true,
      message: 'Users fetched successfully',
      data: users,
      meta,
    };
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      success: true,
      message: 'User fetched successfully',
      data: user,
    };
  }

  async createUser(payload: createUserDto) {
    const isExist = await this.userRepository.findOneBy({
      email: payload.email,
    });
    if (isExist) {
      throw new ConflictException('User already exist');
    }

    // hash pass
    const hashedPassword = await bcrypt.hash(payload.password, 10);
    payload.password = hashedPassword;

    const user = this.userRepository.create(payload);
    await this.userRepository.save(user);
    return {
      success: true,
      message: 'User created successfully',
      data: user,
    };
  }

  async updateUser(id: number, payload: updateUserDto) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.update({ id }, payload);
    return {
      success: true,
      message: 'User updated successfully',
      data: user,
    };
  }

  async softDeleteUser(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.softRemove(user);
    return {
      success: true,
      message: 'User deleted successfully',
      data: user,
    };
  }

  async toggleActiveUser(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.update({ id }, { is_active: !user.is_active });
    return {
      success: true,
      message: 'User updated successfully',
      data: user,
    };
  }
}
