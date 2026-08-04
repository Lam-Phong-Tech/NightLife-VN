import { BadRequestException } from '@nestjs/common';
import { CampaignStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CampaignsService } from './campaigns.service';

describe('CampaignsService', () => {
  const prisma = {
    campaign: {
      updateMany: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    store: {
      findUnique: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn((cb: any) => cb(prisma)),
  } as unknown as jest.Mocked<PrismaService>;

  let service: CampaignsService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.campaign.updateMany.mockResolvedValue({ count: 0 } as never);
    prisma.campaign.findMany.mockResolvedValue([] as never);
    prisma.campaign.count.mockResolvedValue(0 as never);
    prisma.campaign.findUnique.mockResolvedValue(null as never);
    (prisma.store.findUnique as jest.Mock).mockResolvedValue(null as never);
    (prisma.$transaction as jest.Mock).mockImplementation((cb: any) => cb(prisma));
    service = new CampaignsService(prisma);
  });

  it('pauses active or expired campaigns whose end time has passed', async () => {
    const now = new Date('2026-07-22T08:00:00.000Z');

    await service.pauseEndedCampaigns(now);

    expect(prisma.campaign.updateMany).toHaveBeenCalledWith({
      where: {
        status: { in: [CampaignStatus.ACTIVE, CampaignStatus.EXPIRED] },
        endsAt: { lte: now },
      },
      data: { status: CampaignStatus.PAUSED },
    });
  });

  it('runs campaign expiry cleanup every scheduled minute', async () => {
    prisma.campaign.updateMany.mockResolvedValueOnce({ count: 2 } as never);

    await expect(service.pauseEndedCampaignsOnSchedule()).resolves.toBe(2);

    expect(prisma.campaign.updateMany).toHaveBeenCalledTimes(1);
  });

  it('rejects percentage discounts above 100%', async () => {
    await expect(
      service.create(
        {
          name: 'Invalid percent campaign',
          discountType: 'PERCENT',
          discountValue: 101,
          status: CampaignStatus.DRAFT,
        },
        { id: 'admin-1', role: 'ADMIN' } as never,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('syncs ended campaigns before returning admin lists', async () => {
    await service.findAll({ skip: 0, take: 10 });

    expect(prisma.campaign.updateMany).toHaveBeenCalledTimes(1);
    expect(prisma.campaign.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.campaign.updateMany.mock.invocationCallOrder[0]).toBeLessThan(
      prisma.campaign.findMany.mock.invocationCallOrder[0],
    );
  });

  it('falls back to the related area district for campaign stores', async () => {
    prisma.campaign.findMany.mockResolvedValueOnce([
      {
        id: 'campaign-1',
        targetStore: {
          id: 'store-1',
          district: ' ',
          area: { district: 'Ba Dinh' },
        },
      },
    ] as never);
    prisma.campaign.count.mockResolvedValueOnce(1 as never);

    const result = await service.findAll({ skip: 0, take: 10 });

    expect(result.data[0]?.targetStore?.district).toBe('Ba Dinh');
  });

  it('rejects setting campaign to ACTIVE if no target store is linked', async () => {
    await expect(
      service.create(
        {
          name: 'Active campaign without store',
          discountType: 'PERCENT',
          discountValue: 10,
          status: CampaignStatus.ACTIVE,
        },
        { id: 'admin-1', role: 'ADMIN' } as never,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects setting campaign to ACTIVE if target store is not ACTIVE', async () => {
    (prisma.store.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 'store-1',
      status: 'CLOSED',
      deletedAt: null,
    });

    await expect(
      service.create(
        {
          name: 'Active campaign for closed store',
          discountType: 'PERCENT',
          discountValue: 10,
          status: CampaignStatus.ACTIVE,
          targetStore: { connect: { id: 'store-1' } },
        },
        { id: 'admin-1', role: 'ADMIN' } as never,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('allows setting campaign to ACTIVE if target store is ACTIVE', async () => {
    (prisma.store.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 'store-1',
      status: 'ACTIVE',
      deletedAt: null,
    });
    (prisma.campaign.create as jest.Mock).mockResolvedValueOnce({
      id: 'campaign-1',
      name: 'Active campaign',
      discountType: 'PERCENT',
      discountValue: 10,
      status: CampaignStatus.ACTIVE,
      targetStoreId: 'store-1',
    });

    const result = await service.create(
      {
        name: 'Active campaign',
        discountType: 'PERCENT',
        discountValue: 10,
        status: CampaignStatus.ACTIVE,
        targetStore: { connect: { id: 'store-1' } },
      },
      { id: 'admin-1', role: 'ADMIN' } as never,
    );

    expect(result.status).toBe(CampaignStatus.ACTIVE);
  });
});
