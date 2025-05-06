import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBannerDto {
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  images: string[];

  @IsNumber()
  price: number;

  @IsString()
  url: string;

  @IsString()
  title: string;
}
