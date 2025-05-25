import { Injectable } from '@nestjs/common';
import { compareSync, hashSync } from 'bcrypt';
import { ErrorCode } from 'src/common/enum/error-code.enum';
import { ApiException } from 'src/common/error/api.exception';
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
      throw new ApiException(ErrorCode.SAME_ORIGINAL_PASSWORD);
    }

    await this.prisma.user.update({
      where: {
        email,
      },
      data: {
        password: await hashSync(password, 10),
      },
    });
    return await this.redis.deleteData(token);
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new ApiException(ErrorCode.USER_NOT_FOUND);
    }
    return user;
  }

  async findUsersAll(name: string) {
    const where: any = {};
    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    const users = await this.prisma.user.findMany(where);

    return users;
  }

  async findUserByUserId(userId: string) {
    if (!userId) {
      throw new ApiException(ErrorCode.REQUIRED_LOGIN);
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    const { password, ...rest } = user;

    return { status: 200, message: null, payload: { rest } };
  }

  async updateUser(dto: UpdateUserDto, userId: string) {
    const { name, image } = dto;
    if (!userId) {
      throw new ApiException(ErrorCode.REQUIRED_LOGIN);
    }

    const upadteUser = await this.prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        name,
        image,
      },
    });

    return upadteUser;
  }

  async deleteUser(userId: string) {
    if (!userId) {
      throw new ApiException(ErrorCode.REQUIRED_LOGIN);
    }

    await this.prisma.user.delete({
      where: {
        id: userId,
      },
    });
    return null;
  }
}
