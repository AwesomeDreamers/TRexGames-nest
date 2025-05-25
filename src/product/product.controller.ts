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
import { Message } from 'src/common/decorator/message.decorator';
import { ResponseMessage } from 'src/common/enum/response-message.enum';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/fitlter-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Roles('ADMIN')
  @Post('create')
  @Message(ResponseMessage.CREATE_PRODUCT_SUCCESS)
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
  @Message(ResponseMessage.UPDATE_PRODUCT_SUCCESS)
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productService.updateProduct(id, dto);
  }

  @Roles('ADMIN')
  @Delete('delete-many')
  @Message(ResponseMessage.DELETE_PRODUCT_SUCCESS)
  async deleteManyProducts(@Body() ids: number[]) {
    return this.productService.deleteManyProducts(ids);
  }

  @Roles('ADMIN')
  @Delete('delete/:id')
  @Message(ResponseMessage.DELETE_PRODUCT_SUCCESS)
  async deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productService.deleteProduct(id);
  }
}
