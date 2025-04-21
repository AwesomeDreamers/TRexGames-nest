import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PlatformService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const platforms = await this.prisma.platform.findMany({
      include: {
        products: true,
      },
    });
    return {
      status: 200,
      message: null,
      payload: platforms,
    };
  }
}
