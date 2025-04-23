import { IsString } from 'class-validator';

export class CreateBannerDto {
  @IsString()
  link: string;

  @IsString()
  image: string;

  @IsString()
  title: string;
}
