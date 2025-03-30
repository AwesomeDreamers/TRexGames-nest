import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CreateMemberDto } from 'src/member/dto/create-member.dto';
import { MemberService } from 'src/member/member.service';
import { AuthService } from './auth.service';
import { Public } from './decorator/public.decorator';
import { LoginDto } from './dto/auth.dto';
import { RefreshJwtGuard } from './guards/refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly memberService: MemberService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: CreateMemberDto) {
    return await this.memberService.create(dto);
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @Public()
  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  async refresh(@Req() req) {
    return await this.authService.refreshToken(req.user);
  }
}
