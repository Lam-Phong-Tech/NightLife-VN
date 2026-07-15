import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SystemConfigService } from './system-config.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../access/access.service';
import type * as express from 'express';

type RequestWithUser = express.Request & {
  user: AuthenticatedUser;
};

@ApiTags('system-config')
@Controller()
export class SystemConfigController {
  constructor(private readonly configService: SystemConfigService) {}

  @ApiOperation({ summary: 'Get appearance config (public)' })
  @Get('system-config/appearance')
  async getAppearanceConfig() {
    const config = await this.configService.getConfig('appearance', null);
    return { data: config };
  }

  @ApiOperation({ summary: 'Update appearance config (admin)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @Put('admin/system-config/appearance')
  async updateAppearanceConfig(@Body() body: any, @Req() req: RequestWithUser) {
    const data = body.value || body;
    const result = await this.configService.setConfig(
      'appearance',
      data,
      req.user.id,
    );
    return { data: result.value };
  }

  @ApiOperation({ summary: 'Get VPS storage config' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('admin/system-config/storage')
  async getStorageConfig() {
    const config = await this.configService.getConfig('VPS_MAX_STORAGE_GB', {
      limit: 50,
    });
    return { data: config };
  }

  @ApiOperation({ summary: 'Update VPS storage config' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Put('admin/system-config/storage')
  async updateStorageConfig(@Body() body: any, @Req() req: RequestWithUser) {
    const data = body.value || body;
    const result = await this.configService.setConfig(
      'VPS_MAX_STORAGE_GB',
      data,
      req.user.id,
    );
    return { data: result.value };
  }

  @ApiOperation({ summary: 'Get VPS storage usage' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OPERATOR)
  @Get('admin/system-config/storage/usage')
  async getStorageUsage() {
    const usage = await this.configService.getStorageUsage();
    return { data: usage };
  }
}
