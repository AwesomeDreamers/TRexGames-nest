import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateMemberDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  profile_url: string;
}
