import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { compareSync, hashSync } from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { ErrorCode } from 'src/common/enum/error-code.enum';
import { ApiException } from 'src/common/error/api.exception';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FilterUserDto } from './dto/fitlter-user.dto';
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

  async findUsersAll(dto: FilterUserDto) {
    const { name, page, take } = dto;
    const where: any = {};
    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }
    const skip = (page - 1) * take;

    const [users, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        where,
        take,
        skip,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      totalCount,
    };
  }

  async findUserByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    const { password, ...rest } = user;

    return rest;
  }

  async editUser(dto: UpdateUserDto, userId: string) {
    const { name, image, role } = dto;
    return this.prisma.$transaction(async (prisma) => {
      const updateUser = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          name,
          role,
        },
      });

      if (
        !image ||
        image === updateUser.image ||
        !image.includes('/uploads/temp/')
      ) {
        return null;
      }

      if (updateUser.image && updateUser.image !== image) {
        try {
          const oldImagePath = updateUser.image.replace(
            `${process.env.SERVER_URL}/`,
            '',
          );
          const oldImageFullPath = path.join(process.cwd(), oldImagePath);
          if (fs.existsSync(oldImageFullPath)) {
            await fs.promises.unlink(oldImageFullPath);
          }
        } catch (error) {
          throw new ApiException(ErrorCode.IMAGE_FILES_MOVE_ERROR);
        }
      }

      const updateUserId = updateUser.id;
      const userDir = path.join(process.cwd(), 'uploads/users', updateUserId);
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }

      const imageFilename = path.basename(image);
      const ext = path.extname(imageFilename);
      const newImageFilename = `${updateUser.name}_${Date.now()}${ext}`;
      const imageTempPath = path.join(
        process.cwd(),
        'uploads/temp',
        imageFilename,
      );

      const imageFinalPath = path.join(userDir, newImageFilename);

      if (!fs.existsSync(imageTempPath)) {
        return null;
      }

      try {
        await fs.promises.rename(imageTempPath, imageFinalPath);
        const userImagePath = `${process.env.SERVER_URL}/uploads/users/${updateUserId}/${newImageFilename}`;
        const newUser = await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            image: userImagePath,
          },
        });
        return newUser;
      } catch (error) {
        // console.error(`이미지 이동 실패: ${imageTempPath}`, error);
        throw new ApiException(ErrorCode.IMAGE_FILES_MOVE_ERROR);
      }
    });
  }

  async updateUser(dto: UpdateUserDto, userId: string) {
    const { name, image } = dto;
    if (!userId) {
      throw new ApiException(ErrorCode.REQUIRED_LOGIN);
    }

    return this.prisma.$transaction(async (prisma) => {
      const updateUser = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          name,
        },
      });

      if (
        !image ||
        image === updateUser.image ||
        !image.includes('/uploads/temp/')
      ) {
        return null;
      }

      if (updateUser.image && updateUser.image !== image) {
        try {
          const oldImagePath = updateUser.image.replace(
            `${process.env.SERVER_URL}/`,
            '',
          );
          const oldImageFullPath = path.join(process.cwd(), oldImagePath);
          if (fs.existsSync(oldImageFullPath)) {
            await fs.promises.unlink(oldImageFullPath);
          }
        } catch (error) {
          throw new ApiException(ErrorCode.IMAGE_FILES_MOVE_ERROR);
        }
      }

      const updateUserId = updateUser.id;
      const userDir = path.join(process.cwd(), 'uploads/users', updateUserId);
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }

      const imageFilename = path.basename(image);
      const ext = path.extname(imageFilename);
      const newImageFilename = `${updateUser.name}_${Date.now()}${ext}`;
      const imageTempPath = path.join(
        process.cwd(),
        'uploads/temp',
        imageFilename,
      );

      const imageFinalPath = path.join(userDir, newImageFilename);

      if (!fs.existsSync(imageTempPath)) {
        return null;
      }

      try {
        await fs.promises.rename(imageTempPath, imageFinalPath);
        const userImagePath = `${process.env.SERVER_URL}/uploads/users/${updateUserId}/${newImageFilename}`;
        const newUser = await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            image: userImagePath,
          },
        });
        return newUser;
      } catch (error) {
        // console.error(`이미지 이동 실패: ${imageTempPath}`, error);
        throw new ApiException(ErrorCode.IMAGE_FILES_MOVE_ERROR);
      }
    });
  }

  async changePassword(dto: UpdateUserDto, userId: string) {
    const { password, newPassword } = dto;
    if (!userId) {
      throw new ApiException(ErrorCode.REQUIRED_LOGIN);
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || !compareSync(password, user.password)) {
      throw new ApiException(ErrorCode.PASSWORD_INCORRECT);
    }

    if (compareSync(newPassword, user.password)) {
      throw new ApiException(ErrorCode.SAME_ORIGINAL_PASSWORD);
    }

    const hashedNewPassword = await hashSync(newPassword, 10);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedNewPassword,
      },
    });

    return null;
  }

  async deleteUser(userId: string) {
    if (!userId) {
      throw new ApiException(ErrorCode.REQUIRED_LOGIN);
    }

    return this.prisma.$transaction(async (prisma) => {
      try {
        const user = await prisma.user.delete({
          where: {
            id: userId,
          },
        });
        await this.deleteAssetUsers(user);
        return null;
      } catch (error) {
        throw new ApiException(ErrorCode.DELETE_USER_FAILED);
      }
    });
  }

  async deleteManyUserByUserId(userIds: string[]) {
    return await this.prisma.$transaction(async (prisma) => {
      const users = await prisma.user.findMany({
        where: {
          id: {
            in: userIds,
          },
        },
      });

      if (users.length === 0) {
        throw new ApiException(ErrorCode.USER_NOT_FOUND);
      }

      await prisma.user.deleteMany({
        where: {
          id: {
            in: userIds,
          },
        },
      });

      for (const user of users) {
        await this.deleteAssetUsers(user);
      }

      return null;
    });
  }

  private async deleteAssetUsers(user: User) {
    const userDir = path.join(process.cwd(), 'uploads/users', user.id);
    try {
      if (fs.existsSync(userDir)) {
        await fs.promises.rmdir(userDir, { recursive: true });
        console.log(`폴더 삭제 성공: ${userDir}`);
      }
    } catch (error) {
      console.error(`폴더 삭제 실패: ${userDir}`, error);
      throw new ApiException(ErrorCode.IMAGE_FILES_MOVE_ERROR);
    }
  }
}
