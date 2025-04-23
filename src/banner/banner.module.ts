import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { BannerController } from './banner.controller';
import { BannerService } from './banner.service';

@Module({
  imports: [CommonModule],
  controllers: [BannerController],
  providers: [BannerService],
})
export class BannerModule {}
