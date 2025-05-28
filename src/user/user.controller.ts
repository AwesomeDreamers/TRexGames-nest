import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorator/role.decorator';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { Message } from 'src/common/decorator/message.decorator';
import { ResponseMessage } from 'src/common/enum/response-message.enum';
import { Payload } from 'src/common/utils/type';
import { FilterUserDto } from './dto/fitlter-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles('ADMIN')
  @Get('all')
  async findUsersAll(@Query() dto: FilterUserDto) {
    return await this.userService.findUsersAll(dto);
  }

  @Roles('ADMIN')
  @Get(':userId')
  async findUserByUserId(@Param('userId') userId: string) {
    console.log(`Finding user with ID: ${userId}`);

    return await this.userService.findUserByUserId(userId);
  }

  @Roles('ADMIN')
  @Message(ResponseMessage.UPDATE_USER_SUCCESS)
  @Put('edit/:userId')
  async editUser(@Param('userId') userId: string, @Body() dto: UpdateUserDto) {
    return await this.userService.editUser(dto, userId);
  }

  @Roles('ADMIN')
  @Message(ResponseMessage.DELETE_USER_SUCCESS)
  @Delete('delete/:userId')
  async deleteUserByUserId(@Param('userId') userId: string) {
    return await this.userService.deleteUser(userId);
  }

  @Roles('ADMIN')
  @Message(ResponseMessage.DELETE_USER_SUCCESS)
  @Delete('delete-many')
  async deleteManyUserByUserId(@Body('userIds') userIds: string[]) {
    return await this.userService.deleteManyUserByUserId(userIds);
  }

  @Message(ResponseMessage.UPDATE_USER_SUCCESS)
  @Put('update')
  async updateUser(@Body() dto: UpdateUserDto, @CurrentUser() user: Payload) {
    return await this.userService.updateUser(dto, user.id);
  }

  @Message(ResponseMessage.CHANGE_PASSWORD_SUCCESS)
  @Put('change-password')
  async changePassword(
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: Payload,
  ) {
    return await this.userService.changePassword(dto, user.id);
  }

  @Message(ResponseMessage.DELETE_USER_SUCCESS)
  @Delete('delete')
  async deleteUser(@CurrentUser() user: Payload) {
    return await this.userService.deleteUser(user.id);
  }
}
