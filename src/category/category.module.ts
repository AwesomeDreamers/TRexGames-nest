import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

@Module({
  imports: [CommonModule],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
