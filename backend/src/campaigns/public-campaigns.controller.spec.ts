import { PublicCampaignsController } from './public-campaigns.controller';

describe('PublicCampaignsController', () => {
  const campaignsService = {
    findAll: jest.fn(),
  };

  let controller: PublicCampaignsController;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-22T08:00:00.000Z'));
    jest.clearAllMocks();
    campaignsService.findAll.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 50,
    });
    controller = new PublicCampaignsController(campaignsService as never);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('only queries campaigns currently active in real time', async () => {
    const now = new Date('2026-07-22T08:00:00.000Z');

    await controller.findPublicCampaigns();

    expect(campaignsService.findAll).toHaveBeenCalledWith({
      skip: 0,
      take: 50,
      where: {
        status: 'ACTIVE',
        targetStoreId: { not: null },
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
        ],
      },
    });
  });
});
