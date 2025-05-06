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
import { FilterBannertDto } from './dto/fitlter-banner.dto';

@Injectable()
export class BannerService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: CreateBannerDto) {
    const { url, images, title, price } = dto;
    return this.prisma.$transaction(async (prisma) => {
      const banner = await prisma.banner.create({
        data: {
          title,
          price,
          url,
        },
      });

      const bannerId = banner.id;

      const movedImages = [];
      const bannerDir = path.join(process.cwd(), 'uploads/banners', title);

      if (!fs.existsSync(bannerDir)) {
        await fs.promises.mkdir(bannerDir, { recursive: true });
        console.log(`폴더 생성: ${bannerDir}`);
      }

      for (const imageUrl of images) {
        const imageFilename = path.basename(imageUrl);
        const newImageFilename = `${title}_${imageFilename}`;
        const imageTempPath = path.join(
          process.cwd(),
          'uploads/temp',
          imageFilename,
        );
        const imageFinalPath = path.join(bannerDir, newImageFilename);

        try {
          await fs.promises.rename(imageTempPath, imageFinalPath);
          movedImages.push(
            `${process.env.SERVER_URL}/uploads/banners/${title}/${newImageFilename}`,
          );
        } catch (error) {
          console.error(`이미지 이동 실패: ${imageTempPath}`, error);
          throw new InternalServerErrorException(
            '이미지 파일 이동 중 오류가 발생했습니다.',
          );
        }
      }

      // const imageFilename = path.basename(image);
      // const imageTempPath = path.join(
      //   process.cwd(),
      //   'uploads/temp',
      //   imageFilename,
      // );
      // const imageFinalPath = path.join(bannerDir, imageFilename);

      // await fs.promises.rename(imageTempPath, imageFinalPath);
      // const bannerImagePath = `${process.env.SERVER_URL}/uploads/banners/${imageFilename}`;

      await prisma.image.createMany({
        data: movedImages.map((url) => ({ url, bannerId })),
      });

      return {
        status: 201,
        message: '배너가 성공적으로 등록되었습니다.',
        payload: null,
      };
    });
  }

  async findBannersAll(dto: FilterBannertDto) {
    const { page, take, title } = dto;
    const where: any = {};
    if (title) {
      where.title = {
        contains: title,
        mode: 'insensitive',
      };
    }
    const skip = (page - 1) * take;
    const [banners, totalCount] = await Promise.all([
      await this.prisma.banner.findMany({
        where,
        take,
        skip,
        include: {
          images: {
            select: {
              url: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.banner.count({ where }),
    ]);

    return {
      status: 200,
      message: null,
      payload: { banners, totalCount },
    };
  }

  async delete(id: string) {
    return await this.prisma.$transaction(async (prisma) => {
      const banner = await prisma.banner.findUnique({
        where: { id },
        include: { images: true },
      });
      if (!banner) {
        throw new NotFoundException('배너를 찾을 수 없습니다.');
      }

      await prisma.image.deleteMany({
        where: { bannerId: id },
      });

      await prisma.banner.delete({
        where: { id },
      });

      await this.deleteAssetBanners([banner]);

      return {
        status: 200,
        message: '배너가 성공적으로 삭제되었습니다.',
        payload: null,
      };
    });
  }

  async deleteMany(ids: string[]) {
    return await this.prisma.$transaction(async (prisma) => {
      const banners = await prisma.banner.findMany({
        where: { id: { in: ids } },
        include: { images: true },
      });
      if (banners.length === 0) {
        throw new NotFoundException('배너를 찾을 수 없습니다.');
      }

      await prisma.image.deleteMany({
        where: {
          bannerId: {
            in: ids,
          },
        },
      });

      await prisma.banner.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });

      await this.deleteAssetBanners(banners);

      return {
        status: 200,
        message: '배너가 성공적으로 삭제되었습니다.',
        payload: null,
      };
    });
  }

  private async deleteAssetBanners(banners: Banner[]) {
    for (const banner of banners) {
      const bannerDir = path.join(
        process.cwd(),
        'uploads/banners',
        banner.title,
      );
      try {
        if (fs.existsSync(bannerDir)) {
          await fs.promises.rmdir(bannerDir, { recursive: true });
          console.log(`폴더 삭제 성공: ${bannerDir}`);
        }
      } catch (error) {
        console.error(`폴더 삭제 실패: ${bannerDir}`, error);
        throw new InternalServerErrorException(
          '이미지 폴더 삭제 중 오류가 발생했습니다.',
        );
      }
    }
  }
}
