import { Injectable } from '@nestjs/common';
import { ErrorCode } from 'src/common/enum/error-code.enum';
import { ApiException } from 'src/common/error/api.exception';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';

@Injectable()
export class CouponService {
  constructor(private readonly prisma: PrismaService) {}

  async createCoupon(dto: CreateCouponDto) {
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
    return coupon;
  }

  async findCouponsAll() {
    const coupons = await this.prisma.coupon.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return coupons;
  }

  async deleteCoupon(id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });
    if (!coupon) {
      throw new ApiException(ErrorCode.COUPON_NOT_FOUND);
    }
    await this.prisma.coupon.delete({
      where: { id },
    });
    return null;
  }

  async deleteManyCoupons(ids: string[]) {
    const coupons = await this.prisma.coupon.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    if (coupons.length === 0) {
      throw new ApiException(ErrorCode.COUPON_NOT_FOUND);
    }

    await this.prisma.coupon.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return null;
  }
}
