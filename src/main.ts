import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { winstonLogger } from './common/utils/winston.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = winstonLogger;
  app.useLogger(logger);
  await app.listen(8000);
}
bootstrap();
