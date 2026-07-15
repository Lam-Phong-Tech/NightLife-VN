import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { Prisma, CampaignStatus, DiscountType } from '@prisma/client';
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

@Controller('admin/campaigns')
// TODO: Add AdminGuard if applicable
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  create(@Body() createCampaignDto: CreateCampaignDto) {
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

    return this.campaignsService.create(data);
  }

  @Get()
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
  findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
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

    return this.campaignsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // Soft delete
    return this.campaignsService.update(id, { status: 'DELETED' });
  }
}
