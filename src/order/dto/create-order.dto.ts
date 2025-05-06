import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { CartItemType } from 'src/common/utils/type';

export class CreateOrderDto {
  @IsArray()
  items: CartItemType[];

  @IsNumber()
  total: number;

  @IsOptional()
  @IsString()
  couponId?: string;

  @IsString()
  orderName: string;
}
