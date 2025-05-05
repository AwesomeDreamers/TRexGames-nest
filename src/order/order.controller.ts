import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Roles } from 'src/auth/decorator/role.decorator';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { Payload } from 'src/common/utils/type';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  async createOrder(@Body() dto: CreateOrderDto, @CurrentUser() user: Payload) {
    return await this.orderService.createOrder(dto, user.id);
  }

  @Get('order-id/:orderId')
  async findOrderByOrderId(
    @Param('orderId') orderId: string,
    @CurrentUser() user: Payload,
  ) {
    return await this.orderService.findOrderByOrderId(orderId, user.id);
  }

  @Get('user-id')
  async findOrderByUserId(@CurrentUser() user: Payload) {
    return await this.orderService.findOrderByUserId(user.id);
  }

  @Roles('ADMIN')
  @Get('all')
  async findOrdersAllForAdmin(@CurrentUser() user: Payload) {
    return await this.orderService.findOrdersAllForAdmin(user.id);
  }
}
