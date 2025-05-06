import { Product } from '.prisma/client';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/fitlter-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(dto: CreateProductDto) {
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
      const movedImages = [];
      const slugDir = path.join(process.cwd(), 'uploads/images', slug);
      if (!fs.existsSync(slugDir)) {
        await fs.promises.mkdir(slugDir, { recursive: true });
        console.log(`폴더 생성: ${slugDir}`);
      }

      for (const imageUrl of images) {
        const imageFilename = path.basename(imageUrl);
        const newImageFilename = `${slug}_${imageFilename}`;
        const imageTempPath = path.join(
          process.cwd(),
          'uploads/temp',
          imageFilename,
        );
        const imageFinalPath = path.join(slugDir, newImageFilename);

        try {
          await fs.promises.rename(imageTempPath, imageFinalPath);
          movedImages.push(
            `${process.env.SERVER_URL}/uploads/images/${slug}/${newImageFilename}`,
          );
        } catch (error) {
          console.error(`이미지 이동 실패: ${imageTempPath}`, error);
          throw new InternalServerErrorException(
            '이미지 파일 이동 중 오류가 발생했습니다.',
          );
        }
      }

      await prisma.image.createMany({
        data: movedImages.map((url) => ({ url, productId })),
      });
      await prisma.spec.create({
        data: {
          ...minSpec,
          type: 'MIN',
          productId,
        },
      });
      await prisma.spec.create({
        data: {
          ...recSpec,
          type: 'REC',
          productId,
        },
      });
      return {
        status: 201,
        message: '상품 등록 성공하였습니다.',
        payload: product,
      };
    });
  }

  async findProductsAll(dto: FilterProductDto) {
    const {
      categories,
      platforms,
      minPrice,
      maxPrice,
      page,
      take,
      sortBy,
      sortOrder,
      name,
    } = dto;

    const where: any = {};

    if (categories && categories.length > 0) {
      where.category = {
        name: {
          in: categories,
        },
      };
    }

    if (platforms && platforms.length > 0) {
      where.platform = {
        name: {
          in: platforms,
        },
      };
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      where.price = {
        gte: minPrice,
        lte: maxPrice,
      };
    }

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }
    const skip = (page - 1) * take;
    const orderBy = { [sortBy || 'createdAt']: sortOrder };

    const [products, totalCount] = await Promise.all([
      this.prisma.product.findMany({
        where,
        take,
        skip,
        orderBy,
        include: {
          images: true,
          platform: true,
          category: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      status: 200,
      message: null,
      payload: {
        products,
        totalCount,
      },
    };
  }

  async findProductById(id: number) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        images: {
          select: {
            url: true,
          },
        },
        platform: true,
        category: true,
        specs: {
          where: {
            productId: id,
          },
        },
      },
    });
    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다.');
    }

    return { status: 200, message: null, payload: product };
  }

  async updateProduct(id: number, dto: UpdateProductDto) {
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
      const existingProduct = await prisma.product.findUnique({
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
          slug,
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

        await prisma.image.deleteMany({
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
          slug,
          newImageFilename,
        );

        try {
          await fs.promises.rename(imageTempPath, imageFinalPath);
          movedImages.push(
            `${process.env.SERVER_URL}/uploads/images/${slug}/${newImageFilename}`,
          );
        } catch (error) {
          console.error(`이미지 이동 실패: ${imageTempPath}`, error);
          throw new InternalServerErrorException(
            '이미지 파일 이동 중 오류가 발생했습니다.',
          );
        }
      }

      await prisma.image.createMany({
        data: movedImages.map((url) => ({ url, productId: id })),
      });

      const updatedProduct = await prisma.product.update({
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
        await prisma.spec.updateMany({
          where: { productId: id, type: 'MIN' },
          data: minSpec,
        });
      }

      if (recSpec) {
        await prisma.spec.updateMany({
          where: { productId: id, type: 'REC' },
          data: recSpec,
        });
      }

      return {
        status: 200,
        message: '상품이 성공적으로 업데이트되었습니다.',
        payload: updatedProduct,
      };
    });
  }

  async deleteManyProducts(ids: number[]) {
    return await this.prisma.$transaction(async (prisma) => {
      const products = await prisma.product.findMany({
        where: {
          id: {
            in: ids,
          },
        },
        include: { images: true },
      });

      if (products.length === 0) {
        throw new NotFoundException('삭제할 상품을 찾을 수 없습니다.');
      }

      await prisma.image.deleteMany({
        where: {
          productId: {
            in: ids,
          },
        },
      });

      await prisma.product.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });

      await this.deleteAssetContents(products);

      return {
        status: 200,
        message: '상품이 성공적으로 삭제되었습니다.',
        payload: null,
      };
    });
  }

  async deleteProduct(id: number) {
    return await this.prisma.$transaction(async (prisma) => {
      const product = await prisma.product.findUnique({
        where: { id },
        include: { images: true },
      });
      if (!product) {
        throw new NotFoundException('상품을 찾을 수 없습니다.');
      }

      await prisma.image.deleteMany({
        where: { productId: id },
      });

      await prisma.product.delete({
        where: { id },
      });

      await this.deleteAssetContents([product]);

      return {
        status: 200,
        message: '상품이 성공적으로 삭제되었습니다.',
        payload: null,
      };
    });
  }

  private async deleteAssetContents(products: Product[]) {
    for (const product of products) {
      const slugDir = path.join(process.cwd(), 'uploads/images', product.slug);
      try {
        if (fs.existsSync(slugDir)) {
          await fs.promises.rmdir(slugDir, { recursive: true });
          console.log(`폴더 삭제 성공: ${slugDir}`);
        }
      } catch (error) {
        console.error(`폴더 삭제 실패: ${slugDir}`, error);
        throw new InternalServerErrorException(
          '이미지 폴더 삭제 중 오류가 발생했습니다.',
        );
      }

      const imageUrlsInDescription = this.extractImageUrls(product.description);
      for (const contentsImageUrl of imageUrlsInDescription) {
        const imageSlug = this.extractSlugFromUrl(contentsImageUrl);
        if (imageSlug) {
          const descriptionSlugDir = path.join(
            process.cwd(),
            'uploads/contents',
            imageSlug,
          );
          try {
            if (fs.existsSync(descriptionSlugDir)) {
              await fs.promises.rmdir(descriptionSlugDir, {
                recursive: true,
              });
              console.log(`폴더 삭제 성공: ${descriptionSlugDir}`);
            }
          } catch (error) {
            console.error(`폴더 삭제 실패: ${descriptionSlugDir}`, error);
            throw new InternalServerErrorException(
              '설명 이미지 폴더 삭제 중 오류가 발생했습니다.',
            );
          }
        }
      }
    }
  }

  private extractImageUrls(description: string): string[] {
    const imgSrcRegex = /<img[^>]+src="([^">]+)"/g;
    const urls: string[] = [];
    let match;

    while ((match = imgSrcRegex.exec(description)) !== null) {
      urls.push(match[1]);
    }

    return urls;
  }

  private extractSlugFromUrl(url: string): string | null {
    const match = url.match(/\/uploads\/contents\/([^/]+)\//);
    return match ? match[1] : null;
  }
}
