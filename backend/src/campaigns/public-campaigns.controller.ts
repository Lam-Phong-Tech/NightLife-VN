import { Controller, Get, Query } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CampaignStatus, Prisma, StoreStatus } from '@prisma/client';
import { toPublicResponsiveImage } from '../storage/public-responsive-image';

const CAMPAIGN_IMAGE_PURPOSES = new Set([
  'store-hero',
  'hero',
  'cover',
  'store-cover',
  'PARTNER_LISTING_STORE',
]);

@Controller('public/campaigns')
export class PublicCampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  async findPublicCampaigns(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('home') home?: string,
  ) {
    const skip = page ? (Number(page) - 1) * (Number(limit) || 50) : 0;
    const take = limit ? Number(limit) : 50;
    const now = new Date();

    const where: Prisma.CampaignWhereInput = {
      status: CampaignStatus.ACTIVE,
      targetStoreId: { not: null }, // Only campaigns with a target store
      targetStore: {
        is: {
          status: StoreStatus.ACTIVE,
          deletedAt: null,
        },
      },
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
      ],
    };

    const isHomeRequest = home === 'true';
    if (isHomeRequest) {
      where.homePosition = { not: null };
    }

    const result = await this.campaignsService.findAll(
      isHomeRequest
        ? { skip, take, where, orderBy: { homePosition: 'asc' } }
        : { skip, take, where },
    );

    const data = result.data.map((campaign) => {
      if (!campaign.targetStore) return campaign;

      const media = campaign.targetStore.media.filter(
        (item) =>
          item.access === 'PUBLIC' &&
          item.status === 'READY' &&
          item.type === 'IMAGE' &&
          item.deletedAt === null,
      );
      const imageMedia =
        media.find((item) =>
          CAMPAIGN_IMAGE_PURPOSES.has(String(item.purpose ?? '').trim()),
        ) ??
        media[0] ??
        null;

      return {
        ...campaign,
        targetStore: {
          ...campaign.targetStore,
          media,
          thumbnailUrl: imageMedia?.url ?? null,
          responsiveImage: toPublicResponsiveImage(imageMedia),
        },
      };
    });

    return {
      data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / take),
      },
    };
  }
}
