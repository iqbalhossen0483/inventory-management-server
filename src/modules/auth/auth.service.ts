import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import type { Response } from 'express';
import { UserEntity } from 'src/entites/user.entity';
import { JWT_Payload } from 'src/types/common';
import { FindOptionsWhere, Repository } from 'typeorm';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  generateToken(user: UserEntity) {
    const token = this.jwtService.sign<JWT_Payload>({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return token;
  }

  async register(payload: RegisterDto, res: Response) {
    const { email, password, name } = payload;

    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepo.create({
      email,
      password: hashedPassword,
      name,
    });

    await this.userRepo.save(newUser);

    const token = this.generateToken(newUser);
    this.setCookies(res, token);

    const { password: _, ...rest } = newUser;

    return {
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: rest,
      },
    };
  }

  setCookies(res: Response, token: string) {
    res.cookie('token', token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
  }

  private async getUser(condition: FindOptionsWhere<UserEntity>) {
    const user = await this.userRepo.findOne({ where: condition });

    if (!user) {
      throw new UnauthorizedException('Authentication failed');
    }

    return user;
  }

  async login(payload: LoginDto, res: Response) {
    const { password, email } = payload;

    const user = await this.getUser({ email });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Authentication failed');
    }
    const { password: _, ...rest } = user;

    const token = this.generateToken(user);

    this.setCookies(res, token);

    return {
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: rest,
      },
    };
  }

  logout(res: Response) {
    res.clearCookie('token');
    return {
      success: true,
      message: 'Logout successful',
    };
  }

  async getProfile(res: Response, currentUserId: number) {
    const user = await this.userRepo.findOne({
      where: { id: currentUserId },
    });

    if (!user) {
      throw new UnauthorizedException('Authentication failed');
    }

    const { password: _, ...rest } = user;

    const token = this.generateToken(user);

    //set cookie
    this.setCookies(res, token);

    return {
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: rest,
      },
    };
  }
}
