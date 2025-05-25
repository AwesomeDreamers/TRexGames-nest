import { Injectable } from '@nestjs/common';
import { Banner } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { ErrorCode } from 'src/common/enum/error-code.enum';
import { ApiException } from 'src/common/error/api.exception';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { FilterBannertDto } from './dto/fitlter-banner.dto';

@Injectable()
export class BannerService {
  constructor(private readonly prisma: PrismaService) {}
  async createBanner(dto: CreateBannerDto) {
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
        // console.log(`폴더 생성: ${bannerDir}`);
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
          throw new ApiException(ErrorCode.BANNER_FILES_MOVE_ERROR);
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

      return null;
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

    return { banners, totalCount };
  }

  async deleteBanner(id: string) {
    return await this.prisma.$transaction(async (prisma) => {
      const banner = await prisma.banner.findUnique({
        where: { id },
        include: { images: true },
      });
      if (!banner) {
        throw new ApiException(ErrorCode.BANNER_NOT_FOUND);
      }

      await prisma.image.deleteMany({
        where: { bannerId: id },
      });

      await prisma.banner.delete({
        where: { id },
      });

      await this.deleteAssetBanners([banner]);

      return null;
    });
  }

  async deleteManyBanners(ids: string[]) {
    return await this.prisma.$transaction(async (prisma) => {
      const banners = await prisma.banner.findMany({
        where: { id: { in: ids } },
        include: { images: true },
      });
      if (banners.length === 0) {
        throw new ApiException(ErrorCode.BANNER_NOT_FOUND);
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

      return null;
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
        throw new ApiException(ErrorCode.BANNER_FILES_MOVE_ERROR);
      }
    }
  }
}
