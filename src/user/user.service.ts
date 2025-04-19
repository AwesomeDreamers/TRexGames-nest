import { ConflictException, Injectable } from '@nestjs/common';
import { compareSync, hashSync } from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async signup(dto: CreateUserDto) {
    const { token, provider, ...res } = dto;
    const user = await this.prisma.user.create({
      data: {
        ...res,
        id: provider ? undefined : dto.id,
        provider: provider ? provider : undefined,
        password: provider ? '' : await hashSync(dto.password, 10),
      },
    });
    if (provider !== null) {
      await this.redis.deleteData(dto.token);
    }
    return user;
  }

  async resetPassword(dto: UpdateUserDto) {
    const { token, password, email } = dto;
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (user && compareSync(password, user.password)) {
      throw new ConflictException('기존 비밀번호와 같습니다.');
    }

    await this.prisma.user.update({
      where: {
        email,
      },
      data: {
        password: await hashSync(password, 10),
      },
    });
    await this.redis.deleteData(token);
    return {
      message: '비밀번호가 변경되었습니다.',
    };
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new ConflictException('해당 유저가 존재하지 않습니다.');
    }
    return user;
  }
}
