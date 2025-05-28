import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorator/role.decorator';
import { Message } from 'src/common/decorator/message.decorator';
import { ResponseMessage } from 'src/common/enum/response-message.enum';
import { BannerService } from './banner.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { FilterBannertDto } from './dto/fitlter-banner.dto';

@Controller('banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Post('create')
  @Message(ResponseMessage.CREATE_BANNER_SUCCESS)
  createBanner(@Body() dto: CreateBannerDto) {
    return this.bannerService.createBanner(dto);
  }

  @Roles('ADMIN')
  @Get('all')
  findBannersAll(@Query() dto: FilterBannertDto) {
    return this.bannerService.findBannersAll(dto);
  }

  @Delete('delete')
  @Message(ResponseMessage.DELETE_BANNER_SUCCESS)
  deleteManyBanners(@Body('ids') ids: string[]) {
    return this.bannerService.deleteManyBanners(ids);
  }

  @Delete('delete/:id')
  @Message(ResponseMessage.DELETE_BANNER_SUCCESS)
  deleteBanner(@Param('id') id: string) {
    return this.bannerService.deleteBanner(id);
  }
}
