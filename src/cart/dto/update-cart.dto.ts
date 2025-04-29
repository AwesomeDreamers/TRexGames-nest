import { PartialType } from '@nestjs/mapped-types';
import { CreateCartDto } from './create-cart.dto';

export class UpdateCarttDto extends PartialType(CreateCartDto) {}
