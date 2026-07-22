import { Controller, Get, Query } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { Prisma } from '@prisma/client';

@Controller('public/campaigns')
export class PublicCampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  async findPublicCampaigns(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const skip = page ? (Number(page) - 1) * (Number(limit) || 50) : 0;
    const take = limit ? Number(limit) : 50;
    const now = new Date();

    const where: Prisma.CampaignWhereInput = {
      status: 'ACTIVE',
      targetStoreId: { not: null }, // Only campaigns with a target store
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
      ],
    };

    const result = await this.campaignsService.findAll({ skip, take, where });

    return {
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / take),
      },
    };
  }
}
