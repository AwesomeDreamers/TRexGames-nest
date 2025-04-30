import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('create')
  create(@Body() dto: CreateCouponDto) {
    return this.couponService.create(dto);
  }

  @Get('all')
  findAll() {
    return this.couponService.findAll();
  }

  @Delete('delete/:id')
  delete(@Param('id') id: string) {
    return this.couponService.delete(id);
  }

  @Delete('deletes')
  deletes(@Body() ids: string[]) {
    return this.couponService.deletes(ids);
  }
}
