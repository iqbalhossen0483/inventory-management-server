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
import { Role } from 'src/decorators/Role.decorators';
import { UserRole } from 'src/entites/user.entity';
import { AuthGaurd } from 'src/guards/AuthGaurd';
import { RoleGaurd } from 'src/guards/RoleGaurd';
import { createUserDto, getUserDto, updateUserDto } from './user.dto';
import { UserService } from './user.service';

@UseGuards(AuthGaurd, RoleGaurd)
@Role(UserRole.ADMIN)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  async createUser(@Body() payload: createUserDto) {
    return this.userService.createUser(payload);
  }

  @Get('all')
  async getAllUsers(@Query() queries: getUserDto, @CurrentUserId() id: number) {
    return this.userService.getAllUsers(queries, id);
  }

  @Get('single-user/:id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserById(id);
  }

  @Put('update/:id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: updateUserDto,
  ) {
    return this.userService.updateUser(id, payload);
  }

  @Delete('soft-delete/:id')
  async softDeleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.softDeleteUser(id);
  }

  @Put('toggle-active/:id')
  async toggleActiveUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.toggleActiveUser(id);
  }
}
