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
    },
  } as unknown as jest.Mocked<PrismaService>;

  let service: CampaignsService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.campaign.updateMany.mockResolvedValue({ count: 0 } as never);
    prisma.campaign.findMany.mockResolvedValue([] as never);
    prisma.campaign.count.mockResolvedValue(0 as never);
    prisma.campaign.findUnique.mockResolvedValue(null as never);
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

  it('syncs ended campaigns before returning admin lists', async () => {
    await service.findAll({ skip: 0, take: 10 });

    expect(prisma.campaign.updateMany).toHaveBeenCalledTimes(1);
    expect(prisma.campaign.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.campaign.updateMany.mock.invocationCallOrder[0]).toBeLessThan(
      prisma.campaign.findMany.mock.invocationCallOrder[0],
    );
  });
});
