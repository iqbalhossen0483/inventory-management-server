import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Iqbal' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({ example: 'iqbal@gmail.com' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: 'Iqbal0483' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'iqbal@gmail.com' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: 'Iqbal0483' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
