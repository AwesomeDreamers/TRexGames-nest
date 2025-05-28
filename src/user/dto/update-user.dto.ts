import { PartialType } from '@nestjs/mapped-types';
import { Role } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsOptional()
  newPassword: string;

  @IsString()
  @IsOptional()
  confirmNewPassword: string;

  @IsString()
  @IsOptional()
  image: string;

  @IsString()
  @IsOptional()
  role: Role;
}
