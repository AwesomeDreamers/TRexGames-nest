import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentApproveDto } from './dto/payment-approve.dto';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create')
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentService.create(dto);
  }

  @Get('all')
  findAll() {
    return this.paymentService.findAll();
  }

  @Get(':orderId')
  findPaymentByOrderId(@Param('orderId') orderId: string) {
    return this.paymentService.findPaymentByOrderId(orderId);
  }

  @Put('update')
  update(@Body() dto: PaymentApproveDto) {
    return this.paymentService.update(dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentService.remove(+id);
  }
}
