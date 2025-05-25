import { Body, Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { Message } from 'src/common/decorator/message.decorator';
import { ResponseMessage } from 'src/common/enum/response-message.enum';
import { Payload } from 'src/common/utils/type';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('create')
  async createCart(@Body() dto: CreateCartDto, @CurrentUser() user: Payload) {
    return this.cartService.createCart(dto, user.id);
  }

  @Get('all')
  async getAllCarts(@CurrentUser() user: Payload) {
    return this.cartService.findAll(user.id);
  }

  @Get('count')
  async getCartCount(@CurrentUser() user: Payload) {
    return this.cartService.count(user.id);
  }

  @Put('update')
  @Message(ResponseMessage.UPDATE_CART_SUCCESS)
  async updateCart(@Body() dto: UpdateCartDto, @CurrentUser() user: Payload) {
    return this.cartService.update(dto, user.id);
  }

  @Delete('delete')
  @Message(ResponseMessage.DELETE_CART_SUCCESS)
  async deleteCart(@Body() dto: UpdateCartDto, @CurrentUser() user: Payload) {
    return this.cartService.delete(dto, user.id);
  }
}
