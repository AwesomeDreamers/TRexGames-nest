import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [
    CommonModule,
    HttpModule.register({ timeout: 5000, maxRedirects: 5 }),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
