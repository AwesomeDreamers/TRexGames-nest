import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ErrorCode } from 'src/common/enum/error-code.enum';
import { ApiException } from 'src/common/error/api.exception';
import { ContentsDto } from './dto/contents.dto';

@Injectable()
export class FileService {
  uploadImage(image: Express.Multer.File) {
    if (!image) {
      throw new ApiException(ErrorCode.IMAGE_NOT_FOUND);
    }
    const fileUrl = `${process.env.SERVER_URL}/uploads/temp/${image.filename}`;
    return fileUrl;
  }

  async uploadContentImage(dto: ContentsDto) {
    const { urls, slug } = dto;
    const imageUrls = [];
    const contentsDir = path.join(process.cwd(), 'uploads/contents', slug);

    if (!fs.existsSync(contentsDir)) {
      await fs.promises.mkdir(contentsDir, { recursive: true });
      console.log(`폴더 생성: ${contentsDir}`);
    }

    const existingFiles = await fs.promises.readdir(contentsDir);

    for (const url of urls) {
      if (!url) {
        console.warn('URL이 비어있어 건너뜁니다.');
        continue;
      }

      const imageFilename = path.basename(url);

      if (url.includes(`/uploads/contents/${slug}`)) {
        console.log(`기존 이미지로 간주: ${url}`);
        imageUrls.push(url);
        existingFiles.splice(existingFiles.indexOf(imageFilename), 1);
        continue;
      }

      if (url.includes('/uploads/temp')) {
        const imageTempPath = path.join(
          process.cwd(),
          'uploads/temp',
          imageFilename,
        );
        const newImageFilename = `${slug}_${imageFilename}`;
        const imageFinalPath = path.join(contentsDir, newImageFilename);

        try {
          await fs.promises.rename(imageTempPath, imageFinalPath);
          const fileUrl = `${process.env.SERVER_URL}/uploads/contents/${slug}/${newImageFilename}`;
          imageUrls.push(fileUrl);
        } catch (error) {
          console.error(
            `이미지 파일 이동 중 오류가 발생했습니다: ${error.message}`,
          );
          throw new ApiException(ErrorCode.IMAGE_FILES_MOVE_ERROR);
        }
      } else {
        console.warn(`알 수 없는 경로의 이미지 URL: ${url}`);
      }
    }

    for (const file of existingFiles) {
      const filePath = path.join(contentsDir, file);
      try {
        await fs.promises.unlink(filePath);
        console.log(`삭제된 기존 이미지: ${filePath}`);
      } catch (error) {
        console.error(`기존 이미지 삭제 중 오류 발생: ${error.message}`);
      }
    }

    return imageUrls;
  }
}
