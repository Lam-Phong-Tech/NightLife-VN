import { UnprocessableEntityException } from '@nestjs/common';
import { AccessService } from '../access/access.service';
import { PrismaService } from '../prisma/prisma.service';
import { NightlifeDataService } from './nightlife-data.service';

describe('NightlifeDataService', () => {
  const prisma = {
    coupon: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    guest: {
      create: jest.fn(),
    },
    couponIssue: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    store: {
      findMany: jest.fn(),
    },
    booking: {
      findMany: jest.fn(),
    },
    bill: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as jest.Mocked<PrismaService>;

  const accessService = {
    getAccessibleStoreIds: jest.fn(),
  } as unknown as jest.Mocked<AccessService>;

  let service: NightlifeDataService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NightlifeDataService(prisma, accessService);
  });

  it('limits partner bookings to the stores in their access scope', async () => {
    accessService.getAccessibleStoreIds.mockResolvedValue(['store-1']);
    prisma.booking.findMany.mockResolvedValue([] as never);

    await service.listPartnerBookings({
      id: 'partner-1',
      role: 'PARTNER',
    });

    expect(prisma.booking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          storeId: { in: ['store-1'] },
          deletedAt: null,
        }),
      }),
    );
  });

  it('does not add a store filter for admin access', async () => {
    accessService.getAccessibleStoreIds.mockResolvedValue(undefined);
    prisma.bill.findMany.mockResolvedValue([] as never);

    await service.listPartnerBills({
      id: 'admin-1',
      role: 'ADMIN',
    });

    expect(prisma.bill.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deletedAt: null },
      }),
    );
  });

  it('claims a coupon for a guest without linking member history', async () => {
    prisma.coupon.findFirst.mockResolvedValue({
      id: 'coupon-1',
      code: 'WELCOME',
      name: 'Welcome',
      endsAt: null,
      usageLimit: null,
      usedCount: 0,
    } as never);
    prisma.guest.create.mockResolvedValue({ id: 'guest-1' } as never);
    prisma.couponIssue.create.mockResolvedValue({
      id: 'issue-1',
      code: 'GUEST-code',
      status: 'ISSUED',
      coupon: { id: 'coupon-1', code: 'WELCOME', name: 'Welcome' },
    } as never);

    await service.claimGuestCoupon('coupon-1', {
      email: 'GUEST@example.com',
      phone: '+84901234567',
    });

    expect(prisma.guest.create).toHaveBeenCalledWith({
      data: {
        displayName: undefined,
        phone: '+84901234567',
        email: 'guest@example.com',
      },
      select: { id: true },
    });
    expect(prisma.couponIssue.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({
          userId: expect.any(String),
        }),
      }),
    );
    expect(prisma.couponIssue.findMany).not.toHaveBeenCalled();
  });

  it('rejects a guest claim when the usage limit is exhausted', async () => {
    prisma.coupon.findFirst.mockResolvedValue({
      id: 'coupon-1',
      endsAt: null,
      usageLimit: 1,
      usedCount: 1,
    } as never);

    await expect(
      service.claimGuestCoupon('coupon-1', { phone: '+84901234567' }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });
});
