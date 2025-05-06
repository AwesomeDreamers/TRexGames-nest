import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { FilterReviewDto } from './dto/filter-review-dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReviewDto, userId: string) {
    return this.prisma.$transaction(async (prisma) => {
      const { title, content, productId, rating } = dto;

      if (!userId) throw new UnauthorizedException('로그인이 필요합니다.');

      const review = await prisma.review.create({
        data: {
          title,
          content,
          rating,
          product: {
            connect: {
              id: productId,
            },
          },
          user: {
            connect: { id: userId },
          },
        },
      });

      const reviews = await prisma.review.findMany({
        where: { productId },
        select: { rating: true },
      });

      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0,
      );
      const avgRating = totalRating / reviews.length;

      await prisma.product.update({
        where: { id: productId },
        data: {
          numReviews: reviews.length,
          rating: avgRating,
        },
      });

      return {
        status: 201,
        message: '리뷰가 등록되었습니다.',
        payload: review,
      };
    });
  }

  async findReviewByUserIdAndProductId(productId: number, userId: string) {
    if (!userId) throw new UnauthorizedException('로그인이 필요합니다.');
    const review = await this.prisma.review.findUnique({
      where: {
        userId,
        productId,
      },
      include: {
        product: {
          select: {
            name: true,
            category: true,
            platform: true,
            price: true,
            discount: true,
          },
        },
      },
    });

    return { status: 200, message: null, payload: review };
  }

  async update(id: string, dto: UpdateReviewDto, userId: string) {
    const { title, content, productId, rating } = dto;
    return await this.prisma.$transaction(async (prisma) => {
      if (!userId) throw new UnauthorizedException('로그인이 필요합니다.');

      const existingReview = await prisma.review.findUnique({
        where: { id, userId },
      });

      if (!existingReview || existingReview.userId !== userId) {
        throw new NotFoundException('리뷰를 찾을 수 없습니다.');
      }

      const review = await prisma.review.update({
        where: { id, userId },
        data: {
          title,
          content,
          rating,
        },
      });

      const reviews = await prisma.review.findMany({
        where: { productId },
        select: { rating: true },
      });

      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0,
      );
      const avgRating = totalRating / reviews.length;

      await prisma.product.update({
        where: { id: productId },
        data: {
          numReviews: reviews.length,
          rating: avgRating,
        },
      });
      return {
        status: 200,
        message: '리뷰가 업데이트 되었습니다.',
        payload: review,
      };
    });
  }

  async findReviewsByProductId(productId: number, dto: FilterReviewDto) {
    const { page, sortBy, sortOrder } = dto;
    const take = 5;
    const skip = (page - 1) * take;
    const orderBy = { [sortBy || 'createdAt']: sortOrder };

    const [reviews, totalCount] = await Promise.all([
      this.prisma.review.findMany({
        where: {
          productId,
        },
        skip,
        take,
        orderBy,
        include: {
          user: {
            select: {
              image: true,
              name: true,
            },
          },
          product: {
            select: {
              name: true,
            },
          },
        },
      }),
      this.prisma.review.count(),
    ]);
    return {
      status: 200,
      message: null,
      payload: { reviews, totalCount, take, page },
    };
  }

  findAll() {
    return `This action returns all review`;
  }

  findOne(id: number) {
    return `This action returns a #${id} review`;
  }

  remove(id: number) {
    return `This action removes a #${id} review`;
  }
}
