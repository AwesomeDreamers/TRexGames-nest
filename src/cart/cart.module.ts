import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports: [CommonModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
