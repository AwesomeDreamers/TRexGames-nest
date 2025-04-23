import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Public } from 'src/auth/decorator/public.decorator';
import { Roles } from 'src/auth/decorator/role.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Roles('ADMIN')
  @Post('create')
  async create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Public()
  @Get('all')
  async findAll(@Query('title') title?: string) {
    return await this.productService.findAll(title);
  }

  @Public()
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return await this.productService.findById(id);
  }

  @Roles('ADMIN')
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete('deletes')
  async deletes(@Body() ids: number[]) {
    return this.productService.deletes(ids);
  }

  @Roles('ADMIN')
  @Delete('delete/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.productService.delete(id);
  }
}
