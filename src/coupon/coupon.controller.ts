import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Message } from 'src/common/decorator/message.decorator';
import { ResponseMessage } from 'src/common/enum/response-message.enum';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('create')
  @Message(ResponseMessage.CREATE_COUPON_SUCCESS)
  createCoupon(@Body() dto: CreateCouponDto) {
    return this.couponService.createCoupon(dto);
  }

  @Get('all')
  findCouponsAll() {
    return this.couponService.findCouponsAll();
  }

  @Delete('delete/:id')
  @Message(ResponseMessage.DELETE_COUPON_SUCCESS)
  deleteCoupon(@Param('id') id: string) {
    return this.couponService.deleteCoupon(id);
  }

  @Delete('delete-many')
  @Message(ResponseMessage.DELETE_COUPON_SUCCESS)
  deleteManyCoupons(@Body() ids: string[]) {
    return this.couponService.deleteManyCoupons(ids);
  }
}
