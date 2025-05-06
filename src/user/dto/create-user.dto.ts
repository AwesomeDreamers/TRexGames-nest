import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  id: string;

  @IsString()
  @IsOptional()
  image: string;

  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  provider: string;

  @IsString()
  @IsOptional()
  token: string;

  @IsString()
  password: string;
}
