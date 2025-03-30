import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CommonModule } from './common/common.module';

@Module({
  imports: [CommonModule],
  providers: [PrismaService],
})
export class AppModule {}
