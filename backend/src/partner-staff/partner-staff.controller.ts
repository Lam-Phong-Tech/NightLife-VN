/* eslint-disable */
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Req,
  Query,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type * as express from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AccessService, AuthenticatedUser } from '../access/access.service';
import { PartnerStaffService } from './partner-staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';

interface RequestWithUser extends express.Request {
  user: AuthenticatedUser;
}

@ApiTags('partner-staff')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PARTNER', 'ADMIN')
@Controller('partner/staff')
export class PartnerStaffController {
  constructor(
    private readonly partnerStaffService: PartnerStaffService,
    private readonly accessService: AccessService,
  ) {}

  @ApiOperation({ summary: 'Lấy danh sách nhân viên của quán' })
  @Get()
  async getStaff(@Req() req: RequestWithUser, @Query('storeId') storeId: string) {
    if (!storeId) {
      throw new BadRequestException('storeId query parameter is required');
    }
    await this.accessService.ensureStoreAccess(req.user, storeId);
    return this.partnerStaffService.getStaffByStore(storeId);
  }

  @ApiOperation({ summary: 'Thêm mới hoặc liên kết nhân viên vào quán' })
  @Post()
  async createStaff(@Req() req: RequestWithUser, @Body() dto: CreateStaffDto) {
    await this.accessService.ensureStoreAccess(req.user, dto.storeId);
    return this.partnerStaffService.assignStaffToStore(dto);
  }

  @ApiOperation({
    summary: 'Xóa quyền nhân viên của quán và chuyển trạng thái sang INACTIVE',
  })
  @Delete(':userId')
  async deleteStaff(
    @Req() req: RequestWithUser,
    @Param('userId') userId: string,
    @Query('storeId') storeId: string,
  ) {
    if (!storeId) {
      throw new BadRequestException('storeId query parameter is required');
    }
    await this.accessService.ensureStoreAccess(req.user, storeId);
    return this.partnerStaffService.removeStaffFromStore(userId, storeId);
  }
}
