import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';

@Module({
  imports: [CommonModule],
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
