import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
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
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.couponService.delete(+id);
  }

  @Delete('deletes')
  deletes(@Body() ids: number[]) {
    return this.couponService.deletes(ids);
  }
}
