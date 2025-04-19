import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compareSync } from 'bcrypt';
import { Payload } from 'src/common/utils/type';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/auth.dto';

const ACCESS_TOKEN_EXPIRES_IN = parseInt(process.env.JWT_SECRET_KEY_EXPIRES_IN);
const REFRESH_TOKEN_EXPIRES_IN = parseInt(
  process.env.JWT_REFRESH_TOKEN_KEY_EXPIRES_IN,
);
const EXPIRE_TIME = ACCESS_TOKEN_EXPIRES_IN * 1000;
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
  ) {}
  async login(dto: LoginDto) {
    const user = await this.vailidateUser(dto);
    const payload = {
      id: user.id,
      role: user.role,
    };
    return {
      user,
      serverTokens: await this.generateTokens(payload),
    };
  }

  async refreshToken(user: Payload) {
    const payload = {
      id: user.id,
      role: user.role,
    };

    return await this.generateTokens(payload);
  }

  private async generateTokens(payload: Payload) {
    return {
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
        secret: process.env.JWT_SECRET_KEY,
      }),
      refresh_token: await this.jwtService.signAsync(payload, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        secret: process.env.JWT_REFRESH_TOKEN_KEY,
      }),
      expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
    };
  }

  private async vailidateUser(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (user && (await compareSync(dto.password, user.password))) {
      const { password, ...rest } = user;
      return rest;
    } else {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }
  }

  async verifyToken(token: string) {
    const value = await this.redis.getData(token);
    if (value) {
      const email = value.split(':')[2];
      return email;
    } else {
      throw new UnauthorizedException('잘못된 접근입니다.');
    }
  }

  async kakaoLogin(dto: CreateUserDto) {
    let user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      user = await this.userService.signup(dto);
    }
    const payload = {
      id: user.id,
      role: user.role,
    };
    return {
      user,
      serverTokens: await this.generateTokens(payload),
    };
  }

  async googleLogin(dto: CreateUserDto) {
    let user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      user = await this.userService.signup(dto);
    }
    const payload = {
      id: user.id,
      role: user.role,
    };
    return {
      user,
      serverTokens: await this.generateTokens(payload),
    };
  }
}
