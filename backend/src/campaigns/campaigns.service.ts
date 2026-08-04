import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Campaign, CampaignStatus } from '@prisma/client';
import { AuthenticatedUser } from '../access/access.service';
import { adminAuditActorFields } from '../audit-logs/admin-audit';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(private prisma: PrismaService) {}

  private assertValidDiscount(
    discountType: Campaign['discountType'],
    discountValue: number,
  ) {
    if (!Number.isInteger(discountValue) || discountValue < 0) {
      throw new BadRequestException('Giá trị giảm phải là số nguyên không âm.');
    }

    if (discountType === 'PERCENT' && discountValue > 100) {
      throw new BadRequestException('Mức giảm theo phần trăm không được vượt quá 100%.');
    }
  }

  private campaignAuditSnapshot(campaign: Campaign) {
    return {
      name: campaign.name,
      discountType: campaign.discountType,
      discountValue: campaign.discountValue,
      targetStoreId: campaign.targetStoreId,
      startsAt: campaign.startsAt?.toISOString() ?? null,
      endsAt: campaign.endsAt?.toISOString() ?? null,
      status: campaign.status,
      homePosition: campaign.homePosition,
    } as Prisma.InputJsonValue;
  }

  private campaignChangedFields(data: Prisma.CampaignUpdateInput) {
    return Object.entries(data)
      .filter(([, value]) => value !== undefined)
      .map(([key]) => (key === 'targetStore' ? 'targetStoreId' : key));
  }

  async pauseEndedCampaigns(now = new Date()) {
    const result = await this.prisma.campaign.updateMany({
      where: {
        status: { in: [CampaignStatus.ACTIVE, CampaignStatus.EXPIRED] },
        endsAt: { lte: now },
      },
      data: { status: CampaignStatus.PAUSED },
    });

    return result.count;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async pauseEndedCampaignsOnSchedule() {
    const count = await this.pauseEndedCampaigns();
    if (count > 0) {
      this.logger.log(`Paused ${count} campaign(s) whose end time has passed.`);
    }
    return count;
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.CampaignWhereInput;
    orderBy?: Prisma.CampaignOrderByWithRelationInput;
  }) {
    const { skip = 0, take = 50, where, orderBy } = params;
    await this.pauseEndedCampaigns();

    const [data, total] = await Promise.all([
      this.prisma.campaign.findMany({
        skip,
        take,
        where,
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          targetStore: {
            select: {
              id: true,
              name: true,
              category: true,
              area: true,
              slug: true,
              city: true,
              district: true,
              media: true,
            },
          },
        },
      }),
      this.prisma.campaign.count({ where }),
    ]);

    const normalizedData = data.map((campaign) => ({
      ...campaign,
      targetStore: campaign.targetStore
        ? {
            ...campaign.targetStore,
            district:
              campaign.targetStore.district?.trim() ||
              campaign.targetStore.area?.district?.trim() ||
              null,
          }
        : null,
    }));

    return {
      data: normalizedData,
      total,
      page: Math.floor(skip / take) + 1,
      limit: take,
    };
  }

  async findOne(id: string) {
    await this.pauseEndedCampaigns();

    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        targetStore: {
          select: {
            id: true,
            name: true,
            category: true,
            area: true,
            slug: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return campaign;
  }

  async create(data: Prisma.CampaignCreateInput, actor: AuthenticatedUser) {
    this.assertValidDiscount(data.discountType, data.discountValue);

    return this.prisma.$transaction(async (tx) => {
      if (data.homePosition) {
        await tx.campaign.updateMany({
          where: { homePosition: data.homePosition },
          data: { homePosition: null },
        });
      }
      const created = await tx.campaign.create({
        data,
        include: {
          targetStore: {
            select: {
              id: true,
              name: true,
              category: true,
              area: true,
              slug: true,
            },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          ...adminAuditActorFields(actor),
          module: 'Campaign',
          action: 'campaign.create',
          targetType: 'Campaign',
          targetId: created.id,
          entityDisplayCode: `CAMP-${created.id.substring(0, 8)}`,
          beforeJson: Prisma.JsonNull,
          afterJson: this.campaignAuditSnapshot(created),
          changeSummary: `Created campaign "${created.name}"`,
          result: 'SUCCESS',
        },
      });

      return created;
    });
  }

  async update(
    id: string,
    data: Prisma.CampaignUpdateInput,
    actor: AuthenticatedUser,
  ) {
    const existing = await this.prisma.campaign.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    const discountType =
      typeof data.discountType === 'string'
        ? data.discountType
        : existing.discountType;
    const discountValue =
      typeof data.discountValue === 'number'
        ? data.discountValue
        : existing.discountValue;
    this.assertValidDiscount(discountType, discountValue);

    return this.prisma.$transaction(async (tx) => {
      if (typeof data.homePosition === 'number') {
        await tx.campaign.updateMany({
          where: { homePosition: data.homePosition, id: { not: id } },
          data: { homePosition: null },
        });
      }
      const updated = await tx.campaign.update({
        where: { id },
        data,
        include: {
          targetStore: {
            select: {
              id: true,
              name: true,
              category: true,
              area: true,
              slug: true,
            },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          ...adminAuditActorFields(actor),
          module: 'Campaign',
          action: 'campaign.update',
          targetType: 'Campaign',
          targetId: id,
          entityDisplayCode: `CAMP-${id.substring(0, 8)}`,
          beforeJson: this.campaignAuditSnapshot(existing),
          afterJson: this.campaignAuditSnapshot(updated),
          changedFields: this.campaignChangedFields(data),
          changeSummary: `Updated campaign "${updated.name}"`,
          result: 'SUCCESS',
        },
      });

      return updated;
    });
  }

  async remove(id: string, actor: AuthenticatedUser) {
    const existing = await this.prisma.campaign.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      const deleted = await tx.campaign.update({
        where: { id },
        data: { status: CampaignStatus.DELETED },
      });

      await tx.auditLog.create({
        data: {
          ...adminAuditActorFields(actor),
          module: 'Campaign',
          action: 'campaign.delete',
          targetType: 'Campaign',
          targetId: id,
          entityDisplayCode: `CAMP-${id.substring(0, 8)}`,
          beforeJson: this.campaignAuditSnapshot(existing),
          afterJson: this.campaignAuditSnapshot(deleted),
          changeSummary: `Deleted campaign "${existing.name}" (soft delete)`,
          result: 'SUCCESS',
        },
      });

      return deleted;
    });
  }
}
