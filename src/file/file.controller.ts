import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/auth/decorator/role.decorator';
import { FileService } from './file.service';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  @Post('image')
  async uploadImage(@UploadedFile() image: Express.Multer.File) {
    return await this.fileService.uploadImage(image);
  }
  @Roles('ADMIN')
  @Post('content/image-path')
  async changePathContentImage(@Body('urls') urls: string[]) {
    return await this.fileService.uploadContentImage(urls);
  }
}
