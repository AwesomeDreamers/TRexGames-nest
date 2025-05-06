import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FilterProductDto extends PaginationDto {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' && value ? value.split(',').filter(Boolean) : [],
  )
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' && value ? value.split(',').filter(Boolean) : [],
  )
  @IsArray()
  @IsString({ each: true })
  platforms?: string[];

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  minPrice?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  maxPrice?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: string;

  @IsOptional()
  @IsString()
  name?: string;
}
