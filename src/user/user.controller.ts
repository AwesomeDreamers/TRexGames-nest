import { Body, Controller, Delete, Get, Put, Query } from '@nestjs/common';
import { Roles } from 'src/auth/decorator/role.decorator';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { Payload } from 'src/common/utils/type';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles('ADMIN')
  @Get('all')
  async findUsersAll(@Query('name') name: string) {
    return await this.userService.findUsersAll(name);
  }

  @Get('me')
  async findUserByUserId(@CurrentUser() user: Payload) {
    return await this.userService.findUserByUserId(user.id);
  }

  @Put()
  async updateUser(@Body() dto: UpdateUserDto, @CurrentUser() user: Payload) {
    return await this.userService.updateUser(dto, user.id);
  }

  @Delete()
  async deleteUser(@CurrentUser() user: Payload) {
    return await this.userService.deleteUser(user.id);
  }
}
