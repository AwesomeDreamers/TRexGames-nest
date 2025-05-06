import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Public } from 'src/auth/decorator/public.decorator';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { Payload } from 'src/common/utils/type';
import { CreateReviewDto } from './dto/create-review.dto';
import { FilterReviewDto } from './dto/filter-review-dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewService } from './review.service';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('create')
  create(@Body() dto: CreateReviewDto, @CurrentUser() user: Payload) {
    return this.reviewService.create(dto, user.id);
  }

  @Get('user-id/product-id/:productId')
  findReviewByUserIdAndProductId(
    @Param('productId') productId: number,
    @CurrentUser() user: Payload,
  ) {
    return this.reviewService.findReviewByUserIdAndProductId(
      productId,
      user.id,
    );
  }

  @Public()
  @Get('product-id/:productId')
  findReviewsByProductId(
    @Query() dto: FilterReviewDto,
    @Param('productId') productId: number,
  ) {
    return this.reviewService.findReviewsByProductId(productId, dto);
  }

  @Get()
  findAll() {
    return this.reviewService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(+id);
  }

  @Put('update/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() user: Payload,
  ) {
    return this.reviewService.update(id, dto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewService.remove(+id);
  }
}
