import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Message } from 'src/common/decorator/message.decorator';
import { ResponseMessage } from 'src/common/enum/response-message.enum';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentApproveDto } from './dto/payment-approve.dto';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create')
  @Message(ResponseMessage.CREATE_PAYMENT_SUCCESS)
  createPayment(@Body() dto: CreatePaymentDto) {
    return this.paymentService.createPayment(dto);
  }

  @Get(':orderId')
  findPaymentByOrderId(@Param('orderId') orderId: string) {
    return this.paymentService.findPaymentByOrderId(orderId);
  }

  @Put('update')
  @Message(ResponseMessage.CREATE_PAYMENT_SUCCESS)
  update(@Body() dto: PaymentApproveDto) {
    return this.paymentService.update(dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentService.remove(+id);
  }
}
