import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type * as express from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
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

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() request: RequestWithUser) {
    const user = await this.usersService.findByIdOrThrow(request.user.id);

    return this.usersService.toPublicUser(user);
  }

  @ApiBearerAuth()
  @Roles('ADMIN', 'PARTNER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('partner-admin-check')
  partnerAdminCheck() {
    return { ok: true };
  }
}
