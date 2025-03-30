import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';
import { winstonLogger } from './common/utils/winston.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = winstonLogger;
  app.useLogger(logger);
  app.useGlobalFilters(new HttpExceptionFilter(logger));
  await app.listen(8000);
}
bootstrap();
