import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HomeService {
  constructor(private readonly prisma: PrismaService) {}
  async findlatestProductsAll() {
    const products = await this.prisma.product.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        category: true,
        images: true,
        platform: true,
      },
      take: 8,
    });
    return { status: 200, message: null, payload: products };
  }

  async findPopularProductsAll() {
    const products = await this.prisma.product.findMany({
      orderBy: {
        rating: 'desc',
      },
      include: {
        category: true,
        images: true,
        platform: true,
      },
      take: 8,
    });
    return { status: 200, message: null, payload: products };
  }

  async findSwiperBannersAll() {
    const banners = await this.prisma.banner.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        images: {
          select: {
            url: true,
          },
        },
      },
      take: 6,
    });
    return { status: 200, message: null, payload: banners };
  }
}
