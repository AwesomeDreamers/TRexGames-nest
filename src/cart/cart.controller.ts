import { Body, Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { Payload } from 'src/common/utils/type';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCarttDto } from './dto/update-cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('create')
  async createCart(@Body() dto: CreateCartDto, @CurrentUser() user: Payload) {
    return this.cartService.create(dto, user.id);
  }

  @Get('all')
  async getAllCarts(@CurrentUser() user: Payload) {
    return this.cartService.findAll(user.id);
  }

  @Put('update')
  async updateCart(@Body() dto: UpdateCarttDto, @CurrentUser() user: Payload) {
    return this.cartService.update(dto, user.id);
  }

  @Delete('delete')
  async deleteCart(@Body() dto: UpdateCarttDto, @CurrentUser() user: Payload) {
    return this.cartService.delete(dto, user.id);
  }
}
