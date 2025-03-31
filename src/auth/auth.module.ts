import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { MemberService } from 'src/member/member.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [CommonModule],
  controllers: [AuthController],
  providers: [AuthService, MemberService],
})
export class AuthModule {}
