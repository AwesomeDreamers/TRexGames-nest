import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    const {
      name,
      slug,
      description,
      price,
      platformId,
      categoryId,
      discount,
      minSpec,
      recSpec,
      images,
    } = dto;

    return await this.prisma.$transaction(async (prisma) => {
      // 1. 상품 생성
      const product = await prisma.product.create({
        data: {
          name,
          slug,
          description,
          price,
          platformId,
          categoryId,
          discount,
        },
      });

      const productId = product.id;

      // 2. 이미지 이동 및 URL 저장
      const movedImages = [];
      for (const imageUrl of images) {
        console.log('basename', path.basename(imageUrl));

        const imageFilename = path.basename(imageUrl);
        console.log('imageFilename', imageFilename);

        const newImageFilename = `${slug}_${imageFilename}`;
        const imageTempPath = path.join(
          process.cwd(),
          'uploads/temp',
          imageFilename,
        );
        const imageFinalPath = path.join(
          process.cwd(),
          'uploads/images',
          newImageFilename,
        );

        try {
          await fs.promises.rename(imageTempPath, imageFinalPath);
          movedImages.push(
            `${process.env.SERVER_URL}/uploads/images/${newImageFilename}`,
          );
        } catch (error) {
          console.error(error);
          throw new InternalServerErrorException(
            '이미지 파일 이동 중 오류가 발생했습니다.',
          );
        }
      }

      await prisma.image.createMany({
        data: movedImages.map((url) => ({ url, productId })),
      });

      // 3. 최소 사양 저장
      await prisma.spec.create({
        data: {
          ...minSpec,
          type: 'MIN',
          productId,
        },
      });

      // 4. 권장 사양 저장
      await prisma.spec.create({
        data: {
          ...recSpec,
          type: 'REC',
          productId,
        },
      });

      // 5. 성공적으로 완료된 경우 반환
      return {
        status: 201,
        message: '상품 등록 성공하였습니다.',
        payload: product,
      };
    });
  }

  async findAll(title?: string) {
    const products = await this.prisma.product.findMany({
      where: {
        name: {
          contains: title,
        },
      },
      include: {
        images: true,
        platform: true,
        category: true,
      },
    });
    return { status: 200, message: null, payload: products };
  }

  async findById(id: number) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });
    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다.');
    }

    return { status: 200, message: null, payload: product };
  }

  async update(id: number, dto: UpdateProductDto) {
    const {
      name,
      slug,
      description,
      price,
      platformId,
      categoryId,
      discount,
      minSpec,
      recSpec,
      images,
    } = dto;

    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!existingProduct) {
      throw new NotFoundException('상품을 찾을 수 없습니다.');
    }

    const existingImageUrls = existingProduct.images.map((img) => img.url);
    const imagesToDelete = existingImageUrls.filter(
      (url) => !images.includes(url),
    );
    const imagesToAdd = images.filter(
      (url) => !existingImageUrls.includes(url),
    );

    for (const imageUrl of imagesToDelete) {
      const imageFilename = path.basename(imageUrl);
      const imagePath = path.join(
        process.cwd(),
        'uploads/images',
        imageFilename,
      );

      try {
        await fs.promises.unlink(imagePath);
      } catch (error) {
        console.error(`이미지 삭제 실패: ${imagePath}`, error);
        throw new InternalServerErrorException(
          '이미지 파일 삭제 중 오류가 발생했습니다.',
        );
      }

      await this.prisma.image.deleteMany({
        where: { url: imageUrl, productId: id },
      });
    }

    const movedImages = [];
    for (const imageUrl of imagesToAdd) {
      const imageFilename = path.basename(imageUrl);
      const newImageFilename = `${slug}_${imageFilename}`;
      const imageTempPath = path.join(
        process.cwd(),
        'uploads/temp',
        imageFilename,
      );
      const imageFinalPath = path.join(
        process.cwd(),
        'uploads/images',
        newImageFilename,
      );

      try {
        await fs.promises.rename(imageTempPath, imageFinalPath);
        movedImages.push(
          `${process.env.SERVER_URL}/uploads/images/${newImageFilename}`,
        );
      } catch (error) {
        console.error(`이미지 이동 실패: ${imageTempPath}`, error);
        throw new InternalServerErrorException(
          '이미지 파일 이동 중 오류가 발생했습니다.',
        );
      }
    }

    await this.prisma.image.createMany({
      data: movedImages.map((url) => ({ url, productId: id })),
    });

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        price,
        platformId,
        categoryId,
        discount,
      },
    });

    if (minSpec) {
      await this.prisma.spec.updateMany({
        where: { productId: id, type: 'MIN' },
        data: minSpec,
      });
    }

    if (recSpec) {
      await this.prisma.spec.updateMany({
        where: { productId: id, type: 'REC' },
        data: recSpec,
      });
    }

    return {
      status: 200,
      message: '상품이 성공적으로 업데이트되었습니다.',
      payload: updatedProduct,
    };
  }

  async delete(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다.');
    }
    for (const image of product.images) {
      const imageFilename = path.basename(image.url);
      const imagePath = path.join(
        process.cwd(),
        'uploads/images',
        imageFilename,
      );

      try {
        await fs.promises.unlink(imagePath);
      } catch (error) {
        console.error(`이미지 삭제 실패: ${imagePath}`, error);
        throw new InternalServerErrorException(
          '이미지 파일 삭제 중 오류가 발생했습니다.',
        );
      }
    }

    await this.prisma.image.deleteMany({
      where: { productId: id },
    });

    // 상품 삭제
    await this.prisma.product.delete({
      where: { id },
    });

    return {
      status: 200,
      message: '상품이 성공적으로 삭제되었습니다.',
      payload: null,
    };
  }
}
