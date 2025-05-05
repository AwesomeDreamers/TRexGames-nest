import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

@Module({
  imports: [CommonModule],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
