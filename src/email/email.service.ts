import Mail = require('nodemailer/lib/mailer');
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import * as uuid from 'uuid';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private transporter: Mail;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  async sendVerificationMail(email: string, type: 'signup' | 'reset') {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (type === 'signup' && user) {
      throw new ConflictException('이미 존재하는 이메일 입니다.');
    } else if (type === 'reset' && !user) {
      throw new NotFoundException('존재하지 않는 이메일 입니다.');
    } else if (type === 'reset' && user.provider !== 'credentials') {
      throw new ConflictException(
        '소셜 로그인 유저는 비밀번호 찾기를 이용할 수 없습니다.',
      );
    }

    const token = uuid.v4();
    const value = `${process.env.PROJECT_NAME}:${type}:${email}`;
    await this.redis.setData(token, value, 86400);

    const url = this.generateUrl(type, token);
    const mailOptions = this.generateMailOptions(email, type, url);

    await this.transporter.sendMail(mailOptions);

    return {
      message: '이메일을 성공적으로 보냈습니다. 링크를 통해 진행해주세요.',
    };
  }

  private generateUrl(type: 'signup' | 'reset', token: string): string {
    const CLIENT_URL = process.env.CLIENT_URL;
    return type === 'signup'
      ? `${CLIENT_URL}/signup/${token}`
      : `${CLIENT_URL}/reset-password/${token}`;
  }

  private generateMailOptions(
    email: string,
    type: 'signup' | 'reset',
    url: string,
  ): EmailOptions {
    const subject =
      type === 'signup'
        ? `${process.env.APP_NAME} - 회원가입 메일`
        : `${process.env.APP_NAME} - 비밀번호 찾기`;
    const actionText = type === 'signup' ? '회원가입이' : '비밀번호 찾기가';
    const description =
      type === 'signup'
        ? '회원가입을 진행해주세요.'
        : '비밀번호 찾기를 진행해주세요.';
    const buttonText = type === 'signup' ? '회원가입' : '비밀번호 찾기';

    return {
      to: email,
      subject,
      html: `
        <div style="width: 100%; min-height: 1300px">
          <div
            style="
              text-align: center;
              width: 800px;
              margin: 30px auto;
              padding: 40px 80px;
              border: 1px solid #ededed;
              background: #fff;
              box-sizing: border-box;
            "
          >
            <img
              style="width: 150px"
              src=${process.env.APP_LOGO}
              alt="logo"
            />
            <h1>${process.env.APP_NAME}</h1>
            <p
              style="
                padding-top: 20px;
                font-weight: 700;
                font-size: 20px;
                line-height: 1.5;
                color: #222;
              "
            >
              ${description}
            </p>
            <p
              style="
                font-size: 16px;
                font-weight: 400;
                line-height: 1.5;
                margin-bottom: 40px;
                color: #6a7282;
              "
            >
              하단 버튼을 누르시면 ${actionText} 계속 진행됩니다.
            </p>
            <a href=${url} target=${'_self'} style="background: #404040;text-decoration: none;padding: 10px 24px;font-size: 18px;color: #fff;font-weight: 400;border-radius: 4px;">${buttonText}</a>
          </div>
        </div>
      `,
    };
  }
}
