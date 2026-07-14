import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, CampaignStatus } from '@prisma/client';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.CampaignWhereInput;
    orderBy?: Prisma.CampaignOrderByWithRelationInput;
  }) {
    const { skip = 0, take = 50, where, orderBy } = params;
    
    const [data, total] = await Promise.all([
      this.prisma.campaign.findMany({
        skip,
        take,
        where,
        orderBy: orderBy || { createdAt: 'desc' },
        include: { targetStore: { select: { id: true, name: true, category: true, area: true, slug: true } } }
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return {
      data,
      total,
      page: Math.floor(skip / take) + 1,
      limit: take,
    };
  }

  async findOne(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: { targetStore: { select: { id: true, name: true, category: true, area: true, slug: true } } }
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return campaign;
  }

  async create(data: Prisma.CampaignCreateInput) {
    return this.prisma.campaign.create({
      data,
      include: { targetStore: { select: { id: true, name: true, category: true, area: true, slug: true } } }
    });
  }

  async update(id: string, data: Prisma.CampaignUpdateInput) {
    return this.prisma.campaign.update({
      where: { id },
      data,
      include: { targetStore: { select: { id: true, name: true, category: true, area: true, slug: true } } }
    });
  }

  async remove(id: string) {
    return this.prisma.campaign.delete({
      where: { id },
    });
  }
}
