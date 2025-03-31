import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { MemberService } from 'src/member/member.service';
import { LoginDto } from './dto/auth.dto';

const EXPIRE_TIME = 20 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private memberService: MemberService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const member = await this.validateUser(dto);
    const payload = {
      email: member.email,
      role: member.role,
      sub: {
        name: member.name,
      },
    };
    return {
      member,
      serverTokens: await this.generateTokens(payload),
    };
  }

  async refreshToken(member: any) {
    const payload = {
      email: member.email,
      role: member.role,
      sub: member.sub,
    };

    return await this.generateTokens(payload);
  }

  async validateUser(dto: LoginDto) {
    const member = await this.memberService.findByEmail(dto.email);
    if (member && (await compare(dto.password, member.password))) {
      const { password, ...result } = member;
      return result;
    } else {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }
  }
  private async generateTokens(payload: any) {
    return {
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: '1h',
        secret: process.env.JWT_SECRET_KEY,
      }),
      refresh_token: await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: process.env.JWT_REFRESH_TOKEN_KEY,
      }),
      expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
    };
  }
}
