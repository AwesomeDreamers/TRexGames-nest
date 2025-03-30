import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';

@Module({
  imports: [CommonModule],
  controllers: [MemberController],
  providers: [MemberService],
})
export class MemberModule {}
