import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { Payload } from 'src/common/utils/type';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get('all')
  async findWishlistsAll(@CurrentUser() user: Payload) {
    return this.wishlistService.findWishlistsAll(user.id);
  }

  @Post('add')
  async addWishlist(
    @Body('productId') productId: number,
    @CurrentUser() user: Payload,
  ) {
    return this.wishlistService.addWishlist(productId, user.id);
  }

  @Delete('delete')
  async deleteWishlist(
    @Body('productId') productId: number,
    @CurrentUser() user: Payload,
  ) {
    return this.wishlistService.deleteWishlist(productId, user.id);
  }
}
