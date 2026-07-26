import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CampaignsService } from './campaigns.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuthenticatedUser } from '../access/access.service';
import { Prisma, CampaignStatus, DiscountType, UserRole } from '@prisma/client';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class CreateCampaignDto {
  @IsString()
  name: string;

  @IsEnum(DiscountType)
  discountType: DiscountType;

  @IsNumber()
  discountValue: number;

  @IsOptional()
  @IsString()
  targetStoreId?: string;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;
}

export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {}

interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

@Controller('admin/campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  create(
    @Body() createCampaignDto: CreateCampaignDto,
    @Req() req: RequestWithUser,
  ) {
    const data: Prisma.CampaignCreateInput = {
      name: createCampaignDto.name,
      discountType: createCampaignDto.discountType,
      discountValue: createCampaignDto.discountValue,
      startsAt: createCampaignDto.startsAt,
      endsAt: createCampaignDto.endsAt,
      status: createCampaignDto.status || 'DRAFT',
    };

    if (createCampaignDto.targetStoreId) {
      data.targetStore = { connect: { id: createCampaignDto.targetStoreId } };
    }

    return this.campaignsService.create(data, req.user);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OPERATOR)
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: CampaignStatus,
  ) {
    const skip = page ? (Number(page) - 1) * (Number(limit) || 50) : 0;
    const take = limit ? Number(limit) : 50;

    const where: Prisma.CampaignWhereInput = {
      status: status !== undefined ? status : { not: 'DELETED' },
    };

    return this.campaignsService.findAll({ skip, take, where });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OPERATOR)
  findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
    @Req() req: RequestWithUser,
  ) {
    const data: Prisma.CampaignUpdateInput = {
      name: updateCampaignDto.name,
      discountType: updateCampaignDto.discountType,
      discountValue: updateCampaignDto.discountValue,
      startsAt: updateCampaignDto.startsAt,
      endsAt: updateCampaignDto.endsAt,
      status: updateCampaignDto.status,
    };

    if (updateCampaignDto.targetStoreId === null) {
      data.targetStore = { disconnect: true };
    } else if (updateCampaignDto.targetStoreId) {
      data.targetStore = { connect: { id: updateCampaignDto.targetStoreId } };
    }

    return this.campaignsService.update(id, data, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    // Soft delete
    return this.campaignsService.remove(id, req.user);
  }
}
