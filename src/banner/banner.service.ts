import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Banner } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';

@Injectable()
export class BannerService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: CreateBannerDto) {
    const { link, image, title } = dto;
    return this.prisma.$transaction(async (prisma) => {
      const bannerDir = path.join(process.cwd(), 'uploads/banners');

      if (!fs.existsSync(bannerDir)) {
        await fs.promises.mkdir(bannerDir, { recursive: true });
        console.log(`폴더 생성: ${bannerDir}`);
      }

      const imageFilename = path.basename(image);
      const imageTempPath = path.join(
        process.cwd(),
        'uploads/temp',
        imageFilename,
      );
      const imageFinalPath = path.join(bannerDir, imageFilename);

      try {
        await fs.promises.rename(imageTempPath, imageFinalPath);
        const bannerImagePath = `${process.env.SERVER_URL}/uploads/banners/${imageFilename}`;

        await prisma.banner.create({
          data: {
            link,
            title,
            image: {
              create: {
                url: bannerImagePath,
              },
            },
          },
        });
      } catch (error) {
        console.error(`이미지 이동 실패: ${imageTempPath}`, error);
        throw new InternalServerErrorException(
          '이미지 파일 이동 중 오류가 발생했습니다.',
        );
      }

      return {
        status: 201,
        message: '배너가 성공적으로 등록되었습니다.',
        payload: null,
      };
    });
  }

  async findAll() {
    const banners = await this.prisma.banner.findMany({
      include: { image: true },
      orderBy: { createdAt: 'desc' },
    });
    return { status: 200, message: null, payload: banners };
  }

  async delete(id: number) {
    return await this.prisma.$transaction(async (prisma) => {
      const banner = await prisma.banner.findUnique({
        where: { id },
      });
      if (!banner) {
        throw new NotFoundException('배너를 찾을 수 없습니다.');
      }

      await this.deleteAssetBanners([banner]);

      await prisma.banner.delete({
        where: { id },
      });

      return {
        status: 200,
        message: '배너가 성공적으로 삭제되었습니다.',
        payload: null,
      };
    });
  }

  async deletes(ids: number[]) {
    return await this.prisma.$transaction(async (prisma) => {
      const banners = await prisma.banner.findMany({
        where: { id: { in: ids } },
        include: { image: true },
      });
      if (banners.length === 0) {
        throw new NotFoundException('배너를 찾을 수 없습니다.');
      }

      await this.deleteAssetBanners(banners);

      await prisma.banner.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });

      return {
        status: 200,
        message: '배너가 성공적으로 삭제되었습니다.',
        payload: null,
      };
    });
  }

  private async deleteAssetBanners(banners: Banner[]) {
    for (const banner of banners) {
      const image = await this.prisma.image.findUnique({
        where: { id: banner.imageId },
      });

      if (!image) {
        console.warn(`이미지를 찾을 수 없습니다: ${banner.imageId}`);
        continue;
      }

      const imageFilename = path.basename(image.url);
      const imagePath = path.join(
        process.cwd(),
        'uploads/banners',
        imageFilename,
      );

      try {
        if (fs.existsSync(imagePath)) {
          await fs.promises.unlink(imagePath);
          console.log(`이미지 삭제 성공: ${imagePath}`);
        } else {
          console.warn(`이미지 파일이 존재하지 않습니다: ${imagePath}`);
        }
      } catch (error) {
        console.error(`이미지 삭제 실패: ${imagePath}`, error);
        throw new InternalServerErrorException(
          '이미지 파일 삭제 중 오류가 발생했습니다.',
        );
      }
    }
  }
}
