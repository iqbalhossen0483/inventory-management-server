import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUserId } from 'src/decorators/currentUserId';
import { AuthGaurd } from 'src/guards/AuthGaurd';
import { LoginDto, RegisterDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(
    @Body() payload: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.register(payload, res);
  }

  @Post('login')
  login(@Body() payload: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(payload, res);
  }

  @UseGuards(AuthGaurd)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  @UseGuards(AuthGaurd)
  @Get('get-profile')
  getProfile(
    @Res({ passthrough: true }) res: Response,
    @CurrentUserId() currentUserId: number,
  ) {
    return this.authService.getProfile(res, currentUserId);
  }
}
