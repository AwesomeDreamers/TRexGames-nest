import { Module } from '@nestjs/common';
import { RedisModule } from 'src/redis/redis.module';
import { CommonModule } from './../common/common.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [CommonModule, RedisModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
