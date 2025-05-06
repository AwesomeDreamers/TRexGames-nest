import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Public } from 'src/auth/decorator/public.decorator';
import { BannerService } from './banner.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { FilterBannertDto } from './dto/fitlter-banner.dto';

@Controller('banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Post('create')
  create(@Body() dto: CreateBannerDto) {
    return this.bannerService.create(dto);
  }

  @Public()
  @Get('all')
  findBannersAll(@Query() dto: FilterBannertDto) {
    return this.bannerService.findBannersAll(dto);
  }

  @Delete('delete')
  deleteMany(@Body('ids') ids: string[]) {
    return this.bannerService.deleteMany(ids);
  }

  @Delete('delete/:id')
  delete(@Param('id') id: string) {
    return this.bannerService.delete(id);
  }
}
