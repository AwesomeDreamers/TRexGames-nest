import { Module } from '@nestjs/common';
import { MemberService } from 'src/member/member.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, MemberService],
})
export class AuthModule {}
