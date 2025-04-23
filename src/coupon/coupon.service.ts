import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';

@Injectable()
export class CouponService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCouponDto) {
    const { code, discount, startDate, endDate, usageLimit } = dto;
    const coupon = await this.prisma.coupon.create({
      data: {
        code,
        discount,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        usageLimit,
        usageCount: 0,
      },
    });
    return { status: 201, message: '쿠폰이 생성되었습니다.', payload: coupon };
  }

  async findAll() {
    const coupons = await this.prisma.coupon.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return { status: 200, message: null, payload: coupons };
  }

  async delete(id: number) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });
    if (!coupon) {
      throw new NotFoundException('쿠폰을 찾을 수 없습니다.');
    }
    await this.prisma.coupon.delete({
      where: { id },
    });
    return {
      status: 200,
      message: '쿠폰이 성공적으로 삭제되었습니다.',
      payload: null,
    };
  }

  async deletes(ids: number[]) {
    const coupons = await this.prisma.coupon.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    if (coupons.length === 0) {
      throw new NotFoundException('삭제할 쿠폰을 찾을 수 없습니다.');
    }

    await this.prisma.coupon.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return {
      status: 200,
      message: '쿠폰이 성공적으로 삭제되었습니다.',
      payload: null,
    };
  }
}
