import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApiInterceptor } from './common/api/api.interceptor';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';
import { winstonLogger } from './common/utils/winston.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = winstonLogger;
  app.useLogger(logger);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  const reflector = app.get(Reflector);
  app.useGlobalFilters(new HttpExceptionFilter(logger));
  app.useGlobalInterceptors(new ApiInterceptor(reflector));
  await app.listen(process.env.PORT);
}
bootstrap();
