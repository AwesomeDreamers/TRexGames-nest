import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ContentsDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  urls: string[];

  @IsString()
  @IsNotEmpty()
  slug: string;
}
