import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { SpecDto } from './spec.dto';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsString()
  platformId: string;

  @IsString()
  categoryId: string;

  @IsNumber()
  discount: number;

  @IsObject()
  minSpec: SpecDto;

  @IsObject()
  recSpec: SpecDto;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  images: string[];
}
