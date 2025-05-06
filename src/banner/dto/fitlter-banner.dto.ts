import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FilterBannertDto extends PaginationDto {
  @IsOptional()
  @IsString()
  title?: string;
}
