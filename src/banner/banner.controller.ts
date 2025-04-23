import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { Public } from 'src/auth/decorator/public.decorator';
import { BannerService } from './banner.service';
import { CreateBannerDto } from './dto/create-banner.dto';

@Controller('banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Post('create')
  create(@Body() dto: CreateBannerDto) {
    return this.bannerService.create(dto);
  }

  @Public()
  @Get('all')
  findAll() {
    return this.bannerService.findAll();
  }

  @Delete('delete')
  deletes(@Body('ids') ids: number[]) {
    return this.bannerService.deletes(ids);
  }

  @Delete('delete/:id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.bannerService.delete(id);
  }
}
