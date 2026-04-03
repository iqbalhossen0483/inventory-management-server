import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRole } from 'src/entites/user.entity';

export class createUserDto {
  @ApiProperty({ example: 'Iqbal' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @ApiProperty({ example: 'iqbal@gmail.com' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsString({ message: 'Email must be a string' })
  email: string;

  @ApiProperty({ example: 'Iqbal0483' })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  password: string;

  @ApiProperty({ example: UserRole.MANAGER })
  @IsNotEmpty({ message: 'Role is required' })
  @IsEnum(UserRole, { message: 'Role must be a valid enum value' })
  role: UserRole;
}

export class updateUserDto {
  @ApiPropertyOptional({ example: 'Iqbal' })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name?: string;

  @ApiPropertyOptional({ example: 'iqbal@gmail.com' })
  @IsOptional()
  @IsString({ message: 'Email must be a string' })
  email?: string;

  @ApiPropertyOptional({ example: 'Iqbal0483' })
  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  password?: string;

  @ApiPropertyOptional({ example: UserRole.MANAGER })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be a valid enum value' })
  role?: UserRole;
}

export class getUserDto {
  @ApiPropertyOptional({ example: 'Iqbal' })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  email?: string;

  // page
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  // limit
  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
