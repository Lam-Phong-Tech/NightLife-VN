import { UnprocessableEntityException } from '@nestjs/common';
import { AccessService } from '../access/access.service';
import { PrismaService } from '../prisma/prisma.service';
import { NightlifeDataService } from './nightlife-data.service';

describe('NightlifeDataService', () => {
  const prisma = {
    coupon: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    guest: {
      create: jest.fn(),
    },
    couponIssue: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    store: {
      findMany: jest.fn(),
    },
    area: {
      findMany: jest.fn(),
    },
    cast: {
      findMany: jest.fn(),
    },
    booking: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    bill: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  } as unknown as jest.Mocked<PrismaService>;

  const accessService = {
    getAccessibleStoreIds: jest.fn(),
    ensureStoreAccess: jest.fn(),
  } as unknown as jest.Mocked<AccessService>;

  let service: NightlifeDataService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NightlifeDataService(prisma, accessService);
  });

  it('lists public areas for supported city filters', async () => {
    prisma.area.findMany.mockResolvedValue([
      {
        id: 'area-dn',
        code: 'dn-haichau',
        name: 'Hai Chau',
        city: 'Da Nang',
        district: 'Hai Chau',
        ward: 'Thach Thang',
      },
    ] as never);

    await expect(service.listPublicAreas({ city: 'da-nang' })).resolves.toEqual([
      expect.objectContaining({
        code: 'dn-haichau',
        cityCode: 'dn',
      }),
    ]);
    expect(prisma.area.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          status: 'ACTIVE',
          code: { startsWith: 'dn-' },
        },
      }),
    );
  });

  it('searches public stores by name with category and area filters', async () => {
    prisma.store.findMany.mockResolvedValue([
      {
        id: 'store-neon',
        name: 'Neon Club',
        slug: 'neon-club',
        category: 'CLUB',
        description: 'EDM club',
        address: 'Tay Ho',
        city: 'Ha Noi',
        district: 'Tay Ho',
        latitude: '21.063',
        longitude: '105.822',
        area: {
          id: 'area-hn',
          code: 'hn-tayho',
          name: 'Tay Ho',
          city: 'Ha Noi',
          district: 'Tay Ho',
        },
        media: [{ url: 'https://example.com/neon.jpg' }],
      },
    ] as never);

    const result = await service.listPublicStores({
      q: 'neon',
      city: 'hn',
      area: 'hn-tayho',
      category: 'club',
      lat: '21.06',
      lng: '105.82',
    });

    expect(result).toEqual([
      expect.objectContaining({
        slug: 'neon-club',
        category: 'CLUB',
        cityCode: 'hn',
        distanceKm: expect.any(Number),
      }),
    ]);
    expect(prisma.store.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
          status: 'ACTIVE',
          category: 'CLUB',
          AND: expect.arrayContaining([
            expect.objectContaining({
              OR: expect.arrayContaining([
                { name: { contains: 'neon', mode: 'insensitive' } },
              ]),
            }),
            {
              area: {
                is: {
                  code: { startsWith: 'hn-' },
                  deletedAt: null,
                  status: 'ACTIVE',
                },
              },
            },
          ]),
        }),
      }),
    );
  });

  it('sorts public stores nearest first when coordinates are provided', async () => {
    prisma.store.findMany.mockResolvedValue([
      {
        id: 'far-store',
        name: 'Far Store',
        slug: 'far-store',
        category: 'BAR',
        description: null,
        address: null,
        city: 'Ha Noi',
        district: 'Hoan Kiem',
        latitude: '21.0245',
        longitude: '105.8485',
        area: {
          id: 'area-far',
          code: 'hn-hoankiem',
          name: 'Hoan Kiem',
          city: 'Ha Noi',
          district: 'Hoan Kiem',
        },
        media: [],
      },
      {
        id: 'near-store',
        name: 'Near Store',
        slug: 'near-store',
        category: 'CLUB',
        description: null,
        address: null,
        city: 'Ha Noi',
        district: 'Tay Ho',
        latitude: '21.063',
        longitude: '105.822',
        area: {
          id: 'area-near',
          code: 'hn-tayho',
          name: 'Tay Ho',
          city: 'Ha Noi',
          district: 'Tay Ho',
        },
        media: [],
      },
    ] as never);

    const result = await service.listPublicStores({
      lat: '21.0631',
      lng: '105.8221',
    });

    expect(result.map((store) => store.slug)).toEqual([
      'near-store',
      'far-store',
    ]);
  });

  it('searches public casts by cast or store name and store filters', async () => {
    prisma.cast.findMany.mockResolvedValue([
      {
        id: 'cast-mika',
        slug: 'mika-harbor-ktv',
        stageName: 'Mika',
        publicAlias: 'Mika',
        publicHeadline: 'KTV duet host',
        tags: ['ktv'],
        languages: ['vi', 'ja'],
        hourlyRateVnd: 430000,
        media: [],
        store: {
          id: 'store-hp',
          name: 'Harbor KTV Hai Phong',
          slug: 'harbor-ktv-hai-phong',
          category: 'KARAOKE',
          city: 'Hai Phong',
          district: 'Hong Bang',
          latitude: '20.8644',
          longitude: '106.6838',
          area: {
            id: 'area-hp',
            code: 'hp-hongbang',
            name: 'Hong Bang',
            city: 'Hai Phong',
            district: 'Hong Bang',
          },
        },
      },
    ] as never);

    const result = await service.listPublicCasts({
      q: 'mika',
      city: 'hp',
      category: 'ktv',
      lat: '20.864',
      lng: '106.684',
    });

    expect(result).toEqual([
      expect.objectContaining({
        slug: 'mika-harbor-ktv',
        name: 'Mika',
        distanceKm: expect.any(Number),
        store: expect.objectContaining({
          slug: 'harbor-ktv-hai-phong',
          category: 'KARAOKE',
          cityCode: 'hp',
        }),
      }),
    ]);
    expect(prisma.cast.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
          status: 'ACTIVE',
          isPublic: true,
          store: expect.objectContaining({
            deletedAt: null,
            status: 'ACTIVE',
            category: 'KARAOKE',
          }),
          OR: expect.arrayContaining([
            { stageName: { contains: 'mika', mode: 'insensitive' } },
          ]),
        }),
      }),
    );
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
        select: expect.objectContaining({
          guest: { select: { id: true, displayName: true } },
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
        data: expect.objectContaining({
          expiresAt: expect.any(Date),
          metadata: {
            recipientType: 'GUEST',
            validityHours: 24,
          },
        }),
      }),
    );
    expect(prisma.couponIssue.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({
          userId: expect.any(String),
        }),
      }),
    );
    expect(prisma.couponIssue.findMany).not.toHaveBeenCalled();
  });

  it('caps guest coupon expiry to 24 hours', async () => {
    const now = new Date();
    const couponEndsAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    prisma.coupon.findFirst.mockResolvedValue({
      id: 'coupon-1',
      code: 'WELCOME',
      name: 'Welcome',
      endsAt: couponEndsAt,
      usageLimit: null,
      usedCount: 0,
    } as never);
    prisma.guest.create.mockResolvedValue({ id: 'guest-1' } as never);
    prisma.couponIssue.create.mockResolvedValue({ id: 'issue-1' } as never);

    await service.claimGuestCoupon('coupon-1', { phone: '+84901234567' });

    const createArgs = prisma.couponIssue.create.mock.calls[0][0] as {
      data: { expiresAt: Date };
    };
    expect(createArgs.data.expiresAt.getTime()).toBeLessThanOrEqual(
      now.getTime() + 24 * 60 * 60 * 1000 + 1000,
    );
    expect(createArgs.data.expiresAt.getTime()).toBeLessThan(
      couponEndsAt.getTime(),
    );
  });

  it('claims a coupon for a member with 7-day expiry and tier snapshot', async () => {
    prisma.coupon.findFirst.mockResolvedValue({
      id: 'coupon-1',
      code: 'MEMBER8',
      name: 'Member',
      discountType: 'PERCENT',
      discountValue: 8,
      maxDiscountVnd: 800000,
      minSpendVnd: null,
      endsAt: null,
      usageLimit: null,
      usedCount: 0,
    } as never);
    prisma.couponIssue.create.mockResolvedValue({ id: 'issue-1' } as never);

    await service.claimMemberCoupon('coupon-1', {
      id: 'user-1',
      role: 'USER',
      tier: 'VIP',
    });

    expect(prisma.couponIssue.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          couponId: 'coupon-1',
          userId: 'user-1',
          expiresAt: expect.any(Date),
          metadata: expect.objectContaining({
            recipientType: 'MEMBER',
            tier: 'VIP',
            validityDays: 7,
            discountRuleSnapshot: {
              type: 'PERCENT',
              value: 10,
              maxDiscountVnd: 800000,
              minSpendVnd: null,
              tier: 'VIP',
              sourceValue: 8,
            },
          }),
        }),
      }),
    );
  });

  it('scans a coupon issue only after store access and without guest phone', async () => {
    prisma.couponIssue.findUnique.mockResolvedValue({
      id: 'issue-1',
      code: 'GUEST-code',
      status: 'ISSUED',
      expiresAt: null,
      usedAt: null,
      user: null,
      guest: { id: 'guest-1', displayName: 'Guest' },
      booking: null,
      coupon: {
        id: 'coupon-1',
        code: 'GUEST5',
        name: 'Guest',
        storeId: 'store-1',
        store: { id: 'store-1', name: 'Store', slug: 'store' },
      },
    } as never);
    prisma.couponIssue.update.mockResolvedValue({ id: 'issue-1' } as never);

    await service.scanCouponIssue('GUEST-code', {
      id: 'partner-1',
      role: 'PARTNER',
    });

    expect(accessService.ensureStoreAccess).toHaveBeenCalledWith(
      { id: 'partner-1', role: 'PARTNER' },
      'store-1',
    );
    expect(prisma.couponIssue.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { scannedById: 'partner-1' },
        select: expect.objectContaining({
          guest: { select: { id: true, displayName: true } },
        }),
      }),
    );
  });

  it('confirms check-in by using a coupon issue and updating linked booking', async () => {
    prisma.couponIssue.findUnique.mockResolvedValue({
      id: 'issue-1',
      couponId: 'coupon-1',
      status: 'ISSUED',
      expiresAt: null,
      coupon: { storeId: 'store-1' },
      booking: { id: 'booking-1', status: 'CONFIRMED' },
    } as never);
    prisma.couponIssue.update.mockResolvedValue({ id: 'issue-1' } as never);
    prisma.coupon.update.mockResolvedValue({ id: 'coupon-1' } as never);
    prisma.booking.update.mockResolvedValue({ id: 'booking-1' } as never);

    await service.confirmCouponIssueCheckIn('issue-1', {
      id: 'partner-1',
      role: 'PARTNER',
    });

    expect(prisma.couponIssue.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'issue-1' },
        data: expect.objectContaining({
          status: 'USED',
          scannedById: 'partner-1',
          usedAt: expect.any(Date),
        }),
      }),
    );
    expect(prisma.coupon.update).toHaveBeenCalledWith({
      where: { id: 'coupon-1' },
      data: { usedCount: { increment: 1 } },
    });
    expect(prisma.booking.update).toHaveBeenCalledWith({
      where: { id: 'booking-1' },
      data: { status: 'CHECKED_IN' },
    });
  });

  it('stores the admin reviewer when reviewing a sensitive bill', async () => {
    prisma.bill.findFirst.mockResolvedValue({
      id: 'bill-1',
      status: 'SUBMITTED',
    } as never);
    prisma.bill.update.mockResolvedValue({
      id: 'bill-1',
      status: 'VERIFIED',
    } as never);
    prisma.auditLog.create.mockResolvedValue({ id: 'audit-1' } as never);

    await service.reviewSensitiveBill('admin-1', 'bill-1', { approve: true });

    expect(prisma.bill.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'VERIFIED',
          reviewedById: 'admin-1',
          verifiedById: 'admin-1',
          reviewedAt: expect.any(Date),
        }),
        select: expect.objectContaining({
          reviewedById: true,
          verifiedById: true,
          rejectedById: true,
          reviewedAt: true,
        }),
      }),
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: 'admin-1',
        action: 'bill.review.approve',
        targetType: 'Bill',
        targetId: 'bill-1',
        metadata: expect.objectContaining({
          previousStatus: 'SUBMITTED',
          nextStatus: 'VERIFIED',
        }),
      }),
    });
  });

  it('masks sensitive bill customer fields for operator review queue', async () => {
    prisma.bill.findMany.mockResolvedValue([
      {
        id: 'bill-1',
        user: {
          id: 'user-1',
          email: 'member@example.com',
          displayName: 'Member',
          phone: '+84901234567',
          tier: 'VIP',
        },
        guest: {
          id: 'guest-1',
          displayName: 'Guest',
          phone: '+84907654321',
          email: 'guest@example.com',
        },
      },
    ] as never);

    await expect(
      service.listSensitiveBillsForAdmin({
        id: 'operator-1',
        role: 'STAFF',
      }),
    ).resolves.toEqual([
      expect.objectContaining({
        user: expect.objectContaining({
          phone: '+84****567',
          email: 'me***@example.com',
        }),
        guest: expect.objectContaining({
          phone: '+84****321',
          email: 'gu***@example.com',
        }),
      }),
    ]);
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
