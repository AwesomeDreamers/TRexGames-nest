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
import { FilterProductDto } from './dto/fitlter-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Roles('ADMIN')
  @Post('create')
  async createProduct(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto);
  }

  @Public()
  @Get('all')
  async findProductsAll(@Query() dto: FilterProductDto) {
    return await this.productService.findProductsAll(dto);
  }

  @Public()
  @Get(':id')
  async findProductById(@Param('id', ParseIntPipe) id: number) {
    return await this.productService.findProductById(id);
  }

  @Roles('ADMIN')
  @Put(':id')
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productService.updateProduct(id, dto);
  }

  @Roles('ADMIN')
  @Delete('delete-many')
  async deleteManyProducts(@Body() ids: number[]) {
    return this.productService.deleteManyProducts(ids);
  }

  @Roles('ADMIN')
  @Delete('delete/:id')
  async deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productService.deleteProduct(id);
  }
}
