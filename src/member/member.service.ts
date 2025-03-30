import { ConflictException, Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';

@Injectable()
export class MemberService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return await this.prisma.member.findUnique({
      where: {
        email,
      },
    });
  }

  async create(dto: CreateMemberDto) {
    const member = await this.findByEmail(dto.email);
    if (member) {
      throw new ConflictException('이미 존재하는 이메일 입니다.');
    }
    await this.prisma.member.create({
      data: {
        ...dto,
        password: await hash(dto.password, 10),
      },
    });
    return { status: 201, message: '회원가입 성공!' };
  }
}
