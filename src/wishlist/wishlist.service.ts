import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async findWishlistsAll(id: string) {
    const userId = Number(id);
    const wishlists = await this.prisma.wishlist.findMany({
      where: {
        userId,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            images: true,
            price: true,
            discount: true,
            rating: true,
            slug: true,
            category: true,
            platform: true,
          },
        },
      },
    });

    return { status: 200, message: null, payload: wishlists };
  }

  async addWishlist(productId: number, id: string) {
    const userId = Number(id);
    await this.prisma.wishlist.create({
      data: {
        userId,
        productId,
      },
    });

    return {
      status: 201,
      message: '위시리스트에 추가되었습니다.',
      payload: null,
    };
  }

  async deleteWishlist(productId: number, id: string) {
    const userId = Number(id);
    await this.prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    return {
      status: 200,
      message: '위시리스트에서 삭제되었습니다.',
      payload: null,
    };
  }
}
