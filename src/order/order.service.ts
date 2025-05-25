import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ErrorCode } from 'src/common/enum/error-code.enum';
import { ApiException } from 'src/common/error/api.exception';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly axios: HttpService,
  ) {}

  async createOrder(dto: CreateOrderDto, userId: string) {
    if (!userId) {
      throw new ApiException(ErrorCode.REQUIRED_LOGIN);
    }

    const { items, total, couponId, orderName } = dto;
    const order = await this.prisma.order.create({
      data: {
        userId,
        total,
        orderName,
        couponId: couponId || null,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            productName: item.name,
            productCategory: item.category.name,
            productPlatform: item.platform.name,
            productImage: item.image,
            productKey: this.generateGameKey(),
            quantity: item.quantity,
            price: item.price,
            discount: item.discount,
          })),
        },
      },
      include: {
        items: true,
        coupon: true,
      },
    });
    if (couponId) {
      await this.prisma.coupon.update({
        where: {
          id: couponId,
        },
        data: {
          usageCount: {
            increment: 1,
          },
        },
      });
    }
    await this.prisma.cartItem.deleteMany({
      where: {
        cart: {
          userId,
        },
      },
    });

    await this.prisma.cart.delete({
      where: {
        userId,
      },
    });

    return order;
  }

  async findOrderByOrderId(orderId: string, userId: string) {
    if (!userId) {
      throw new ApiException(ErrorCode.REQUIRED_LOGIN);
    }

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: true,
        coupon: true,
      },
    });

    if (!order) {
      throw new ApiException(ErrorCode.ORDER_NOT_FOUND);
    }
    return { status: 200, message: null, payload: order };
  }

  async findOrdersAllForAdmin(id: string) {
    const userId = Number(id);
    if (!userId) {
      throw new ApiException(ErrorCode.REQUIRED_LOGIN);
    }

    const orders = await this.prisma.order.findMany({
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return orders;
  }

  async findOrderByUserId(userId: string) {
    if (!userId) {
      throw new ApiException(ErrorCode.REQUIRED_LOGIN);
    }

    const orders = await this.prisma.order.findMany({
      where: {
        userId,
      },
      include: {
        items: true,
        coupon: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders;
  }

  private generateGameKey() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segmentLength = 5;
    const segments = 3;

    const generateSegment = () =>
      Array.from({ length: segmentLength })
        .map(() =>
          characters.charAt(Math.floor(Math.random() * characters.length)),
        )
        .join('');

    return Array.from({ length: segments })
      .map(() => generateSegment())
      .join('-');
  }
}
