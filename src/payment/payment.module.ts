import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [CommonModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
