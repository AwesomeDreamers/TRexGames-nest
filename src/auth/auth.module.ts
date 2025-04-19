import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { EmailService } from 'src/email/email.service';
import { RedisModule } from 'src/redis/redis.module';
import { UserService } from 'src/user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [CommonModule, RedisModule],
  controllers: [AuthController],
  providers: [AuthService, UserService, EmailService],
})
export class AuthModule {}
