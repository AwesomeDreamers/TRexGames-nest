import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { JwtGuard } from './auth/guards/jwt.guard';
import { RoleGuard } from './auth/guards/role.guard';
import { CategoryModule } from './category/category.module';
import { CommonModule } from './common/common.module';
import { RequestMiddleware } from './common/utils/logger.middleware';
import { FileModule } from './file/file.module';
import { PlatformModule } from './platform/platform.module';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';
import { CouponModule } from './coupon/coupon.module';
import { BannerModule } from './banner/banner.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CommonModule,
    AuthModule,
    UserModule,
    ProductModule,
    CategoryModule,
    PlatformModule,
    FileModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads/',
    }),
    CouponModule,
    BannerModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
