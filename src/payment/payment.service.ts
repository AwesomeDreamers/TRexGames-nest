import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentApproveDto } from './dto/payment-approve.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: CreatePaymentDto) {
    const { orderId, amount, status, orderName } = dto;

    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        amount,
        status,
        orderName,
      },
    });

    return { status: 201, message: '결제가 완료되었습니다.', payload: payment };
  }

  findAll() {
    return `This action returns all payment`;
  }

  async findPaymentByOrderId(orderId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: {
        orderId,
      },
    });
    return { status: 200, message: null, payload: payment };
  }

  async update(dto: PaymentApproveDto) {
    const {
      orderId,
      paymentKey,
      amount,
      method,
      receiptUrl,
      approvedAt,
      orderStatus,
      status,
      failureCode,
      failureMessage,
      cardNumber,
      type,
      mId,
      requestedAt,
      cardType,
      checkoutUrl,
    } = dto;
    const payment = await this.prisma.payment.update({
      where: {
        orderId,
      },
      data: {
        paymentKey,
        method,
        receiptUrl,
        approvedAt,
        amount,
        failureCode,
        failureMessage,
        status,
        cardNumber,
        type,
        mId,
        requestedAt,
        cardType,
        checkoutUrl,
      },
    });

    await this.prisma.order.update({
      where: {
        id: payment.orderId,
      },
      data: {
        status: orderStatus,
      },
    });

    return { status: 200, message: '결제가 완료되었습니다.', payload: payment };
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
