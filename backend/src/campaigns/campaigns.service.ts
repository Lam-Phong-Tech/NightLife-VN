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

  private async assertStoreActiveForActiveCampaign(
    targetStoreId: string | null | undefined,
    status: CampaignStatus,
  ) {
    if (status !== CampaignStatus.ACTIVE) {
      return;
    }

    if (!targetStoreId) {
      throw new BadRequestException(
        'Vui lòng chọn Quán áp dụng đang hoạt động trước khi chuyển campaign sang trạng thái Hoạt động.',
      );
    }

    const store = await this.prisma.store.findUnique({
      where: { id: targetStoreId },
      select: { id: true, status: true, deletedAt: true },
    });

    if (!store || store.status !== 'ACTIVE' || store.deletedAt !== null) {
      throw new BadRequestException(
        'Quán áp dụng không ở trạng thái Hoạt động. Không thể chuyển campaign sang trạng thái Hoạt động.',
      );
    }
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
              address: true,
              media: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.campaign.count({ where }),
    ]);

    const extractWardFromAddress = (address?: string | null, areaWard?: string | null): string | null => {
      if (areaWard && areaWard.trim() && areaWard.toLowerCase() !== 'tổng hợp' && areaWard.toLowerCase() !== 'tong hop') {
        return areaWard.trim();
      }
      if (!address) return null;
      const parts = address.split(',').map((s) => s.trim());
      for (const part of parts) {
        if (/^(phường|xã|thị trấn|ward)\b/i.test(part)) {
          return part;
        }
      }
      return null;
    };

    const normalizedData = data.map((campaign) => ({
      ...campaign,
      targetStore: campaign.targetStore
        ? {
            ...campaign.targetStore,
            district:
              campaign.targetStore.district?.trim() ||
              campaign.targetStore.area?.district?.trim() ||
              null,
            ward: extractWardFromAddress(
              campaign.targetStore.address,
              campaign.targetStore.area?.ward,
            ),
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
            status: true,
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

    const targetStoreId = (data.targetStore as any)?.connect?.id;
    const campaignStatus = (data.status as CampaignStatus) || CampaignStatus.DRAFT;
    await this.assertStoreActiveForActiveCampaign(targetStoreId, campaignStatus);

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
              status: true,
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

    let targetStoreId: string | null | undefined = existing.targetStoreId;
    if ((data.targetStore as any)?.disconnect) {
      targetStoreId = null;
    } else if ((data.targetStore as any)?.connect?.id) {
      targetStoreId = (data.targetStore as any).connect.id;
    }

    const nextStatus = (data.status as CampaignStatus) || existing.status;
    await this.assertStoreActiveForActiveCampaign(targetStoreId, nextStatus);

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
              status: true,
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
        data: { status: CampaignStatus.DELETED, homePosition: null },
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
