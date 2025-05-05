import { IsNumber, IsOptional, IsString } from 'class-validator';

export class PaymentApproveDto {
  @IsString()
  @IsOptional()
  orderId: string;

  @IsNumber()
  @IsOptional()
  amount: number;

  @IsString()
  @IsOptional()
  paymentKey: string;

  @IsString()
  @IsOptional()
  method: string;

  @IsString()
  @IsOptional()
  receiptUrl: string;

  @IsString()
  @IsOptional()
  approvedAt: string;

  @IsString()
  @IsOptional()
  requestedAt: string;

  @IsString()
  @IsOptional()
  orderStatus: 'PENDING' | 'FAILED' | 'SUCCESS';

  @IsString()
  @IsOptional()
  status:
    | 'READY'
    | 'IN_PROGRESS'
    | 'WAITING_FOR_DEPOSIT'
    | 'DONE'
    | 'CANCELED'
    | 'PARTIAL_CANCELED'
    | 'ABORTED'
    | 'EXPIRED';

  @IsString()
  @IsOptional()
  failureCode?: string;

  @IsString()
  @IsOptional()
  failureMessage?: string;

  @IsString()
  @IsOptional()
  cardNumber: string;

  @IsString()
  @IsOptional()
  type?: 'NORMAL' | 'BILLING' | 'BRANDPAY';

  @IsString()
  @IsOptional()
  mId?: string;

  @IsString()
  @IsOptional()
  cardType?: string;

  @IsString()
  @IsOptional()
  checkoutUrl?: string;
}
