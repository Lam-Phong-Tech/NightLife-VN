import { Controller, Get, Req, UseGuards, Post, Body } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type * as express from 'express';
import { PublicUserDto } from '../auth/dto/auth-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AdminCheckResponseDto } from './dto/users-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsersService } from './users.service';

type RequestWithUser = express.Request & {
  user: {
    id: string;
  };
};

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Lấy thông tin profile người dùng hiện tại' })
  @ApiOkResponse({ type: PublicUserDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() request: RequestWithUser) {
    const user = await this.usersService.findByIdOrThrow(request.user.id);

    return this.usersService.toPublicUser(user);
  }

  @ApiOperation({ summary: 'Đổi mật khẩu người dùng' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Req() request: RequestWithUser,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(request.user.id, dto);
    return { success: true };
  }

  @ApiOperation({ summary: 'Kiểm tra quyền Partner/Admin' })
  @ApiOkResponse({ type: AdminCheckResponseDto })
  @ApiBearerAuth()
  @Roles('ADMIN', 'PARTNER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('partner-admin-check')
  partnerAdminCheck() {
    return { ok: true };
  }
}
