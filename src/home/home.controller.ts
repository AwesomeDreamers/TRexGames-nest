import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/auth/decorator/public.decorator';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Public()
  @Get('latest')
  findlatestProductsAll() {
    return this.homeService.findlatestProductsAll();
  }

  @Public()
  @Get('popular')
  findPopularProductsAll() {
    return this.homeService.findPopularProductsAll();
  }

  @Public()
  @Get('swiper')
  findSwiperBannersAll() {
    return this.homeService.findSwiperBannersAll();
  }
}
