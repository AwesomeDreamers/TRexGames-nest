import { BadRequestException, Injectable } from '@nestjs/common';
import { MulterOptionsFactory } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as multer from 'multer';
import * as path from 'path';
import * as uuid from 'uuid';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  dirPath: string;
  baseUrl: string;
  constructor() {
    this.dirPath = path.join(process.cwd(), 'uploads/temp');
    this.baseUrl = `${process.env.SERVER_URL}/uploads/temp`;
    this.mkdir();
  }

  mkdir() {
    try {
      fs.readdirSync(this.dirPath);
    } catch (err) {
      fs.mkdirSync(this.dirPath);
    }
  }

  createMulterOptions() {
    const dirPath = this.dirPath;
    const option = {
      storage: multer.diskStorage({
        destination(req, file, done) {
          done(null, dirPath);
        },

        filename(req, file, done) {
          const ext = path.extname(file.originalname);
          const name = path.basename(uuid.v7(), ext);
          done(null, `${name}_${Date.now()}${ext}`);
        },
      }),
      limits: { fileSize: 1000 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (file.mimetype.startsWith('image/')) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException('허용되지 않는 파일 형식입니다.'),
            false,
          );
        }
      },
    };
    return option;
  }
  getFileUrl(filename: string): string {
    return `${this.baseUrl}/${filename}`;
  }
}
