import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async findWishlistsAll(userId: string) {
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

  async count(userId: string) {
    if (!userId) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }
    const count = await this.prisma.wishlist.count({
      where: {
        userId,
      },
    });
    return { status: 200, message: null, payload: count };
  }

  async addWishlist(productId: number, userId: string) {
    const isInWishlist = await this.prisma.wishlist.findFirst({
      where: {
        userId,
        productId,
      },
    });

    if (isInWishlist) {
      return {
        status: 200,
        message: '찜목록에서 제거되었습니다.',
        payload: true,
      };
    }

    await this.prisma.wishlist.create({
      data: {
        userId,
        productId,
      },
    });

    return {
      status: 201,
      message: '찜목록에 추가되었습니다.',
      payload: false,
    };
  }

  async deleteWishlist(productId: number, userId: string) {
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
