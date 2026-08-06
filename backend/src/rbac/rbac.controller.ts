import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthenticatedUser } from '../access/access.service';
import { RbacService } from './rbac.service';
import type * as express from 'express';

type RequestWithUser = express.Request & { user: AuthenticatedUser };

@ApiTags('rbac')
@Controller('admin/rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @ApiOperation({ summary: 'Get full RBAC permission matrix from database' })
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('matrix')
  getMatrix() {
    return this.rbacService.getMatrix();
  }

  @ApiOperation({ summary: 'Update permissions for a specific role' })
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('roles/:roleKey/permissions')
  updateRolePermissions(
    @Req() request: RequestWithUser,
    @Param('roleKey') roleKey: string,
    @Body() body: { permissionKeys: string[]; version: number },
  ) {
    return this.rbacService.updateRolePermissions(
      request.user,
      roleKey,
      body.permissionKeys ?? [],
      body.version ?? 0,
    );
  }
}
