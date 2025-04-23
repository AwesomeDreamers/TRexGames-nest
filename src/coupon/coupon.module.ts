import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';

@Module({
  imports: [CommonModule],
  controllers: [CouponController],
  providers: [CouponService],
})
export class CouponModule {}
