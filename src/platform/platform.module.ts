import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { PlatformController } from './platform.controller';
import { PlatformService } from './platform.service';

@Module({
  imports: [CommonModule],
  controllers: [PlatformController],
  providers: [PlatformService],
})
export class PlatformModule {}
