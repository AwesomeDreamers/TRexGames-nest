import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { Message } from 'src/common/decorator/message.decorator';
import { ResponseMessage } from 'src/common/enum/response-message.enum';
import { Payload } from 'src/common/utils/type';
import { EmailService } from 'src/email/email.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { Public } from './decorator/public.decorator';
import { LoginDto } from './dto/auth.dto';
import { RefreshJwtGuard } from './guards/refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}

  @Public()
  @Post('signup')
  @Message(ResponseMessage.SIGNUP_SUCCESS)
  async signup(@Body() dto: CreateUserDto) {
    return await this.userService.signup(dto);
  }

  @Public()
  @Post('reset-password')
  @Message(ResponseMessage.RESET_PASSWORD_SUCCESS)
  async resetPassword(@Body() dto: UpdateUserDto) {
    return await this.userService.resetPassword(dto);
  }

  @Public()
  @Post('login')
  @Message(ResponseMessage.LOGIN_SUCCESS)
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @Public()
  @Get('verify-token')
  async verifyToken(@Query('token') token: string) {
    return await this.authService.verifyToken(token);
  }

  @Public()
  @Post('send-signup-email')
  @Message(ResponseMessage.SEND_EMAIL_SUCCESS)
  async sendSignupEmail(@Body('email') email: string) {
    return await this.emailService.sendVerificationMail(email, 'signup');
  }

  @Public()
  @Post('send-reset-password-email')
  @Message(ResponseMessage.SEND_EMAIL_SUCCESS)
  async sendResetPasswordEmail(@Body('email') email: string) {
    return await this.emailService.sendVerificationMail(email, 'reset');
  }

  @Public()
  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  async refresh(@CurrentUser() user: Payload) {
    return await this.authService.refreshToken(user);
  }

  @Public()
  @Post('social-login')
  @Message(ResponseMessage.LOGIN_SUCCESS)
  async socialLogin(@Body() dto: CreateUserDto) {
    console.log('dto', dto);
    return await this.authService.socialLogin(dto);
  }
}
