import { Logger, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [PrismaService, JwtService, Logger],
  exports: [PrismaService, JwtService, Logger],
})
export class CommonModule {}
