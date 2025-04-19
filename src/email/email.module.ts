import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisModule } from 'src/redis/redis.module';
import { EmailService } from './email.service';

@Module({
  imports: [RedisModule],
  providers: [EmailService, PrismaService],
})
export class EmailModule {}
