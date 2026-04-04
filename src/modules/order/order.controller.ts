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
  CreateOrderDto,
  GetOrdersFilterDto,
  UpdateOrderDto,
  UpdateOrderStatusDto,
} from './order.dto';
import { OrderService } from './order.service';

@UseGuards(AuthGaurd)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  createOrder(
    @Body() payload: CreateOrderDto,
    @CurrentUserId() currentUserId: number,
  ) {
    return this.orderService.createOrder(payload, currentUserId);
  }

  @Get('all')
  getAllOrders(@Query() queries: GetOrdersFilterDto) {
    return this.orderService.getAllOrders(queries);
  }

  @Get(':id')
  getOrderById(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.getOrderById(id);
  }

  @Put('update-status/:id')
  updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateOrderStatusDto,
    @CurrentUserId() currentUserId: number,
  ) {
    return this.orderService.updateOrderStatus(
      id,
      payload.status,
      currentUserId,
    );
  }

  @Put('update/:id')
  updateOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateOrderDto,
  ) {
    return this.orderService.updateOrder(id, payload);
  }

  @Delete('delete/:id')
  softDeleteOrder(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.softDeleteOrder(id);
  }
}
