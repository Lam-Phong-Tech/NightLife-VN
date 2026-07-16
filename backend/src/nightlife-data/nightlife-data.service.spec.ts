import {
  ForbiddenException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { createHash, createHmac } from 'node:crypto';
import QRCode from 'qrcode';
import { AccessService } from '../access/access.service';
import { PrismaService } from '../prisma/prisma.service';
import { NightlifeDataService } from './nightlife-data.service';

describe('NightlifeDataService', () => {
  const prisma = {
    $transaction: jest.fn(),
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    partnerAccount: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    storePermission: {
      upsert: jest.fn(),
    },
    partnerRequest: {
      count: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    pointLedger: {
      upsert: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
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
      count: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    adminCoupon: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    adminCouponIssue: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    store: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    area: {
      findMany: jest.fn(),
    },
    cast: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
    },
    media: {
      create: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    content: {
      create: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    rankingConfig: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    memberFavoriteCast: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    },
    memberFavoriteStore: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    },
    booking: {
      create: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    bookingQr: {
      count: jest.fn(),
    },
    bill: {
      create: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    commissionConfig: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    notificationLog: {
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  } as unknown as jest.Mocked<PrismaService>;

  const accessService = {
    getAccessibleStoreIds: jest.fn(),
    ensureStoreAccess: jest.fn(),
  } as unknown as jest.Mocked<AccessService>;

  const adminNotificationService = {
    notifyBookingCreated: jest.fn(),
    notifyBookingCancelled: jest.fn(),
    notifyBillSubmitted: jest.fn(),
    notifyBillReviewed: jest.fn(),
    notifyPartnerRequest: jest.fn(),
  };

  const emailNotificationService = {
    sendBookingQrEmail: jest.fn(),
  };
  const passwordService = {
    hash: jest.fn(),
  };

  const partnerRequestRecord = (
    overrides: Record<string, unknown> = {},
  ): Record<string, unknown> => {
    const store = {
      id: 'store-draft-1',
      name: 'Neon Club Tay Ho',
      slug: 'neon-club-tay-ho-partner-abc12345',
      status: 'PENDING_REVIEW',
      ...((overrides.store as Record<string, unknown> | undefined) ?? {}),
    };

    return {
      id: 'PARTNER-ABC12345',
      status: 'PENDING_REVIEW',
      businessName: 'Neon Club',
      businessType: 'Club',
      area: 'Ha Noi',
      contactName: 'Owner',
      contactPhone: '+84901234567',
      contactEmail: 'owner@example.com',
      passwordHash: 'hashed-password-123',
      note: 'Please call after 6PM',
      storeDescription: 'Live DJ and private table service',
      storeAddress: '12 Dang Thai Mai',
      storeCity: 'Ha Noi',
      storeDistrict: 'Tay Ho',
      openingHours: '18:00 - 02:00',
      menuSummary: 'Bottle service from 2,500,000 VND',
      mediaUrls: ['https://cdn.example.com/store.jpg'],
      castProfiles: [],
      draftCastIds: ['cast-draft-1'],
      draftMediaIds: ['media-draft-1'],
      draftContentIds: ['content-draft-1'],
      reviewReason: null,
      publicState: 'HIDDEN',
      submittedAt: new Date('2026-06-30T10:00:00.000Z'),
      reviewedAt: null,
      reviewedById: null,
      partnerUserId: null,
      partnerAccountId: null,
      createdAt: new Date('2026-06-30T10:00:00.000Z'),
      store,
      notificationLog: {
        id: 'notification-1',
        status: 'SENT',
        error: null,
        sentAt: new Date('2026-06-30T10:00:01.000Z'),
      },
      ...overrides,
      store,
    };
  };

  let service: NightlifeDataService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation((callback) => callback(prisma));
    accessService.getAccessibleStoreIds.mockResolvedValue(undefined);
    accessService.ensureStoreAccess.mockResolvedValue(undefined);
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'partner-user-1',
      email: 'owner@example.com',
    });
    prisma.user.update.mockResolvedValue({
      id: 'partner-user-1',
      email: 'owner@example.com',
    });
    prisma.partnerAccount.findFirst.mockResolvedValue(null);
    prisma.partnerAccount.create.mockResolvedValue({
      id: 'partner-account-1',
    });
    prisma.partnerAccount.update.mockResolvedValue({
      id: 'partner-account-1',
    });
    prisma.storePermission.upsert.mockResolvedValue({
      id: 'store-permission-1',
    });
    prisma.partnerRequest.updateMany.mockResolvedValue({ count: 1 });
    prisma.partnerRequest.update.mockResolvedValue({
      id: 'PARTNER-ABC12345',
    });
    prisma.pointLedger.upsert.mockResolvedValue({
      id: 'point-ledger-1',
    });
    prisma.pointLedger.findFirst.mockResolvedValue(null);
    prisma.pointLedger.findMany.mockResolvedValue([] as never);
    prisma.pointLedger.updateMany.mockResolvedValue({ count: 0 });
    prisma.commissionConfig.findMany.mockResolvedValue([] as never);
    prisma.commissionConfig.findFirst.mockResolvedValue(null);
    prisma.commissionConfig.update.mockResolvedValue({
      id: 'commission-config-1',
    });
    passwordService.hash.mockResolvedValue('scrypt:test:hash');
    jest
      .spyOn(QRCode, 'toDataURL')
      .mockResolvedValue('data:image/png;base64,test-booking-qr');
    prisma.store.count.mockResolvedValue(1);
    prisma.store.create.mockResolvedValue({
      id: 'store-draft-1',
      name: 'Neon Club',
      slug: 'neon-club-partner-test',
      status: 'PENDING_REVIEW',
    });
    prisma.store.update.mockResolvedValue({ id: 'store-draft-1' });
    prisma.area.findMany.mockResolvedValue([] as never);
    prisma.cast.count.mockResolvedValue(1);
    prisma.cast.create.mockResolvedValue({ id: 'cast-draft-1' });
    prisma.cast.updateMany.mockResolvedValue({ count: 1 });
    prisma.media.create.mockResolvedValue({ id: 'media-draft-1' });
    prisma.media.findMany.mockResolvedValue([] as never);
    prisma.media.updateMany.mockResolvedValue({ count: 1 });
    prisma.content.create.mockResolvedValue({ id: 'content-draft-1' });
    prisma.content.updateMany.mockResolvedValue({ count: 1 });
    prisma.content.findFirst.mockResolvedValue(null);
    prisma.rankingConfig.findMany.mockResolvedValue([] as never);
    prisma.rankingConfig.findFirst.mockResolvedValue(null);
    prisma.couponIssue.findFirst.mockResolvedValue(null);
    prisma.couponIssue.count.mockResolvedValue(0);
    prisma.couponIssue.updateMany.mockResolvedValue({ count: 1 });
    prisma.notificationLog.create.mockResolvedValue({
      id: 'notification-1',
    });
    prisma.notificationLog.update.mockResolvedValue({
      id: 'notification-1',
      status: 'SENT',
      payload: {},
      error: null,
      sentAt: null,
      createdAt: new Date('2026-06-30T10:00:00.000Z'),
    });
    prisma.notificationLog.updateMany.mockResolvedValue({ count: 1 });
    prisma.notificationLog.count.mockResolvedValue(0);
    adminNotificationService.notifyPartnerRequest.mockResolvedValue(
      'notification-1',
    );
    prisma.notificationLog.findMany.mockResolvedValue([] as never);
    prisma.auditLog.findMany.mockResolvedValue([] as never);
    prisma.auditLog.count.mockResolvedValue(0);
    prisma.booking.count.mockResolvedValue(0);
    prisma.booking.findFirst.mockResolvedValue(null);
    prisma.bookingQr.count.mockResolvedValue(0);
    prisma.bill.count.mockResolvedValue(0);
    prisma.bill.findFirst.mockResolvedValue(null);
    emailNotificationService.sendBookingQrEmail.mockResolvedValue({
      messageId: 'smtp-message-1',
    });
    service = new NightlifeDataService(
      prisma,
      accessService,
      adminNotificationService as never,
      undefined,
      emailNotificationService as never,
      passwordService as never,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('lists public areas for supported city filters', async () => {
    prisma.area.findMany.mockResolvedValue([
      {
        id: 'area-hcm',
        code: 'hcm-q1',
        name: 'Quan 1',
        city: 'Ho Chi Minh',
        district: 'Quan 1',
        ward: 'Ben Nghe',
      },
    ] as never);

    await expect(service.listPublicAreas({ city: 'hcm' })).resolves.toEqual([
      expect.objectContaining({
        code: 'hcm-q1',
        cityCode: 'hcm',
      }),
    ]);
    expect(prisma.area.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          status: 'ACTIVE',
          code: { startsWith: 'hcm-' },
        },
      }),
    );
  });

  it('lists public areas from every active city when city is all', async () => {
    prisma.area.findMany.mockResolvedValue([
      {
        id: 'area-dn',
        code: 'dn-sontra',
        name: 'Son Tra',
        city: 'Da Nang',
        district: 'Son Tra',
        ward: null,
      },
    ] as never);

    await expect(service.listPublicAreas({ city: 'all' })).resolves.toEqual([
      expect.objectContaining({
        code: 'dn-sontra',
        cityCode: 'dn',
      }),
    ]);
    expect(prisma.area.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          status: 'ACTIVE',
        },
      }),
    );
  });

  it('searches public stores by name with category and area filters', async () => {
    prisma.store.findMany.mockResolvedValue([
      {
        id: 'store-neon',
        createdAt: new Date('2026-06-20T00:00:00.000Z'),
        name: 'Neon Club',
        slug: 'neon-club',
        category: 'CLUB',
        description: 'EDM club',
        address: 'Tay Ho',
        city: 'Ha Noi',
        district: 'Tay Ho',
        tags: ['dj', 'vip'],
        latitude: '21.063',
        longitude: '105.822',
        openingHours: { monday: { open: '19:00', close: '02:00' } },
        pricingInfo: {
          items: [{ name: 'VIP table', amountVnd: 2500000 }],
        },
        area: {
          id: 'area-hn',
          code: 'hn-tayho',
          name: 'Tay Ho',
          city: 'Ha Noi',
          district: 'Tay Ho',
        },
        media: [{ url: 'https://example.com/neon.jpg' }],
        casts: [{ hourlyRateVnd: 700000 }],
        coupons: [
          {
            id: 'coupon-list-1',
            code: 'LIST20',
            name: 'List 20%',
            description: '20% off',
            discountType: 'PERCENT',
            discountValue: 20,
            maxDiscountVnd: 200000,
            minSpendVnd: 1000000,
            startsAt: new Date('2026-06-01T00:00:00.000Z'),
            endsAt: new Date('2026-07-01T00:00:00.000Z'),
            usageLimit: 100,
            usedCount: 3,
          },
        ],
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

    expect(result.data).toEqual([
      expect.objectContaining({
        slug: 'neon-club',
        category: 'CLUB',
        cityCode: 'hn',
        tags: ['dj', 'vip'],
        openingHours: { monday: { open: '19:00', close: '02:00' } },
        priceReference: expect.objectContaining({
          currency: 'VND',
          startingFromVnd: 2500000,
        }),
        activeCoupon: expect.objectContaining({
          code: 'LIST20',
          name: 'List 20%',
        }),
        distanceKm: expect.any(Number),
      }),
    ]);
    expect(result.meta).toEqual(
      expect.objectContaining({
        total: 1,
        page: 1,
        limit: 24,
        offset: 0,
        hasMore: false,
        sort: 'nearest',
      }),
    );
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
                  OR: [
                    { code: { startsWith: 'hn-' } },
                    { code: { startsWith: 'hanoi-' } },
                  ],
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

  it('does not limit public stores to Hanoi and HCM when city is all', async () => {
    prisma.store.findMany.mockResolvedValue([
      {
        id: 'store-dragon',
        createdAt: new Date('2026-07-09T00:00:00.000Z'),
        name: 'Dragon Rooftop Club',
        slug: 'dragon-rooftop-club',
        category: 'CLUB',
        description: null,
        address: '36 Bach Dang',
        city: 'Da Nang',
        district: 'Hai Chau',
        latitude: null,
        longitude: null,
        area: {
          id: 'area-dn',
          code: 'dn-haichau',
          name: 'Hai Chau',
          city: 'Da Nang',
          district: 'Hai Chau',
        },
        media: [],
      },
    ] as never);

    const result = await service.listPublicStores({ city: 'all' });

    expect(result.data).toEqual([
      expect.objectContaining({
        slug: 'dragon-rooftop-club',
        cityCode: 'dn',
      }),
    ]);
    expect(prisma.store.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          status: 'ACTIVE',
        },
      }),
    );
  });

  it('includes active all-city stores without an area relation', async () => {
    prisma.store.findMany.mockResolvedValue([
      {
        id: 'store-meo-meo',
        createdAt: new Date('2026-07-09T00:00:00.000Z'),
        name: 'Meo Meo',
        slug: 'meo-meo',
        category: 'CLUB',
        description: null,
        address: 'Kim Thanh, Ninh Binh',
        city: 'Tinh Ninh Binh',
        district: null,
        latitude: null,
        longitude: null,
        area: null,
        media: [],
      },
    ] as never);

    const result = await service.listPublicStores({ city: 'all' });

    expect(result.data).toEqual([
      expect.objectContaining({
        slug: 'meo-meo',
        city: 'Tinh Ninh Binh',
        area: null,
      }),
    ]);
    expect(prisma.store.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          status: 'ACTIVE',
        },
      }),
    );
  });

  it('filters public stores by newly seeded province area codes', async () => {
    prisma.store.findMany.mockResolvedValue([
      {
        id: 'store-meo-meo',
        createdAt: new Date('2026-07-09T00:00:00.000Z'),
        name: 'Meo Meo',
        slug: 'meo-meo',
        category: 'CLUB',
        description: null,
        address: 'Kim Thanh, Ninh Binh',
        city: 'Tinh Ninh Binh',
        district: null,
        latitude: null,
        longitude: null,
        area: {
          id: 'area-ninhbinh-general',
          code: 'ninhbinh-tong-hop',
          name: 'Tong hop',
          city: 'Ninh Binh',
          district: 'Tong hop',
        },
        media: [],
      },
    ] as never);

    const result = await service.listPublicStores({ city: 'ninhbinh' });

    expect(result.data).toEqual([
      expect.objectContaining({
        slug: 'meo-meo',
        cityCode: 'ninhbinh',
      }),
    ]);
    expect(prisma.store.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            {
              area: {
                is: {
                  deletedAt: null,
                  status: 'ACTIVE',
                  code: { startsWith: 'ninhbinh-' },
                },
              },
            },
          ]),
        }),
      }),
    );
  });

  it('assigns the general province area when admin creates a store', async () => {
    prisma.store.findUnique.mockResolvedValue(null);
    prisma.area.findMany.mockResolvedValue([
      {
        id: 'area-ninhbinh-general',
        code: 'ninhbinh-tong-hop',
        name: 'Tong hop',
        city: 'Ninh Binh',
        district: 'Tong hop',
        ward: null,
      },
    ] as never);
    prisma.store.create.mockResolvedValue({
      id: 'store-meo-meo',
      name: 'Meo Meo',
      slug: 'meo-meo',
      status: 'ACTIVE',
      areaId: 'area-ninhbinh-general',
    });

    const result = await service.createAdminStore({
      name: 'Meo Meo',
      category: 'CLUB',
      city: 'Tinh Ninh Binh',
      address: 'Kim Thanh, Tinh Ninh Binh',
      status: 'ACTIVE',
    } as never);

    expect(result).toEqual(
      expect.objectContaining({
        id: 'store-meo-meo',
        areaId: 'area-ninhbinh-general',
      }),
    );
    expect(prisma.area.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
          status: 'ACTIVE',
          OR: expect.arrayContaining([
            {
              code: { startsWith: 'ninhbinh-' },
            },
            expect.objectContaining({
              city: expect.objectContaining({
                in: expect.arrayContaining(['Ninh Bình', 'Tinh Ninh Binh']),
              }),
            }),
          ]),
        }),
      }),
    );
    expect(prisma.store.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Meo Meo',
          areaId: 'area-ninhbinh-general',
        }),
      }),
    );
  });

  it('sorts public stores nearest first when coordinates are provided', async () => {
    prisma.store.findMany.mockResolvedValue([
      {
        id: 'far-store',
        createdAt: new Date('2026-06-18T00:00:00.000Z'),
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
        createdAt: new Date('2026-06-19T00:00:00.000Z'),
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

    expect(result.data.map((store) => store.slug)).toEqual([
      'near-store',
      'far-store',
    ]);
  });

  it('filters public stores by active coupons and returns pagination metadata', async () => {
    prisma.store.count.mockResolvedValue(3);
    prisma.store.findMany.mockResolvedValue([
      {
        id: 'store-coupon',
        createdAt: new Date('2026-06-21T00:00:00.000Z'),
        name: 'Coupon Store',
        slug: 'coupon-store',
        category: 'BAR',
        description: null,
        address: null,
        city: 'Ha Noi',
        district: 'Hoan Kiem',
        latitude: null,
        longitude: null,
        area: {
          id: 'area-hn',
          code: 'hn-hoankiem',
          name: 'Hoan Kiem',
          city: 'Ha Noi',
          district: 'Hoan Kiem',
        },
        media: [],
      },
    ] as never);

    const result = await service.listPublicStores({
      hasActiveCoupon: 'true',
      limit: '1',
      page: '2',
      sort: 'newest',
    });

    expect(result.meta).toEqual({
      total: 3,
      page: 2,
      limit: 1,
      offset: 1,
      hasMore: true,
      sort: 'newest',
    });
    expect(prisma.store.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 1,
        take: 1,
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              coupons: {
                some: expect.objectContaining({
                  status: 'ACTIVE',
                  deletedAt: null,
                  startsAt: expect.objectContaining({ lte: expect.any(Date) }),
                  OR: expect.any(Array),
                }),
              },
            }),
          ]),
        }),
      }),
    );
  });

  it('gets public store detail by slug with gallery, casts, coupons, related stores, and seo', async () => {
    prisma.store.findFirst.mockResolvedValue({
      id: 'store-neon',
      areaId: 'area-hn',
      createdAt: new Date('2026-06-20T00:00:00.000Z'),
      updatedAt: new Date('2026-06-21T00:00:00.000Z'),
      name: 'Neon Club',
      slug: 'neon-club',
      category: 'CLUB',
      description: 'Late-night club by West Lake.',
      address: '200 Nghi Tam',
      city: 'Ha Noi',
      district: 'Tay Ho',
      phone: '+84243456007',
      latitude: '21.063',
      longitude: '105.822',
      openingHours: { monday: { open: '19:00', close: '02:00' } },
      holidaySchedule: { specialClosures: [] },
      pricingInfo: {
        groups: [
          {
            id: 'g1',
            name: 'Set menu',
            items: [
              {
                id: 'menu-1',
                name: 'VIP bottle set',
                desc: 'For 4 guests',
                tier: 3,
                hot: true,
                thumb: 'https://example.com/menu-vip.jpg',
              },
              {
                name: 'Sushi omakase',
                description: 'Partner listing menu item',
                priceTier: '$$',
                isHot: true,
                imageUrl: 'https://example.com/menu-sushi.jpg',
              },
            ],
          },
        ],
      },
      mapUrl: 'https://maps.google.com/?q=21.063,105.822',
      googlePlaceId: 'place-neon',
      area: {
        id: 'area-hn',
        code: 'hn-tayho',
        name: 'Tay Ho',
        city: 'Ha Noi',
        district: 'Tay Ho',
        ward: 'Quang An',
      },
      media: [
        {
          id: 'media-hero',
          type: 'IMAGE',
          url: 'https://example.com/neon.jpg',
          purpose: 'store-hero',
          mimeType: 'image/jpeg',
          originalName: 'Neon hero',
          createdAt: new Date('2026-06-20T00:00:00.000Z'),
        },
        {
          id: 'media-video',
          type: 'VIDEO',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          purpose: 'store-video',
          mimeType: 'video/mp4',
          originalName: 'Neon video',
          createdAt: new Date('2026-06-19T00:00:00.000Z'),
        },
      ],
      casts: [
        {
          id: 'cast-yuna',
          slug: 'yuna-neon',
          stageName: 'Yuna',
          publicAlias: 'Yuna Neon',
          publicHeadline: 'Party host',
          tags: ['club', 'vip'],
          languages: ['ja', 'vi'],
          hourlyRateVnd: 700000,
          media: [{ url: 'https://example.com/yuna.jpg' }],
        },
      ],
      coupons: [
        {
          id: 'coupon-1',
          code: 'WELCOME20',
          name: 'Welcome 20%',
          description: '20% off',
          discountType: 'PERCENT',
          discountValue: 20,
          maxDiscountVnd: 200000,
          minSpendVnd: 1000000,
          startsAt: new Date('2026-06-01T00:00:00.000Z'),
          endsAt: new Date('2026-07-01T00:00:00.000Z'),
          usageLimit: 100,
          usedCount: 10,
        },
      ],
    });
    prisma.store.findMany.mockResolvedValue([
      {
        id: 'store-related',
        name: 'Crimson Bar',
        slug: 'crimson-bar',
        category: 'BAR',
        city: 'Ha Noi',
        district: 'Hoan Kiem',
        area: null,
        media: [{ url: 'https://example.com/crimson.jpg' }],
      },
    ] as never);

    const result = await service.getPublicStoreBySlug('Neon Club');

    expect(result).toEqual(
      expect.objectContaining({
        id: 'store-neon',
        slug: 'neon-club',
        mapUrl: 'https://maps.google.com/?q=21.063,105.822',
        openingHours: { monday: { open: '19:00', close: '02:00' } },
        holidaySchedule: { specialClosures: [] },
        gallery: expect.arrayContaining([
          expect.objectContaining({
            id: 'media-hero',
            type: 'IMAGE',
            url: 'https://example.com/neon.jpg',
          }),
          expect.objectContaining({
            id: 'media-video',
            type: 'VIDEO',
            url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          }),
        ]),
        casts: [
          expect.objectContaining({
            id: 'cast-yuna',
            slug: 'yuna-neon',
            publicAlias: 'Yuna Neon',
            thumbnailUrl: 'https://example.com/yuna.jpg',
            tags: ['club', 'vip'],
            languages: ['ja', 'vi'],
          }),
        ],
        priceReference: expect.objectContaining({
          currency: 'VND',
          startingFromVnd: 700000,
          items: expect.arrayContaining([
            expect.objectContaining({
              label: 'VIP bottle set',
              group: 'Set menu',
              imageUrl: 'https://example.com/menu-vip.jpg',
              tier: 3,
              hot: true,
              displayPrice: '$$$',
            }),
            expect.objectContaining({
              label: 'Sushi omakase',
              note: 'Partner listing menu item',
              group: 'Set menu',
              imageUrl: 'https://example.com/menu-sushi.jpg',
              tier: 2,
              hot: true,
              displayPrice: '$$',
            }),
          ]),
        }),
        activeCoupons: [
          expect.objectContaining({
            id: 'coupon-1',
            code: 'WELCOME20',
          }),
        ],
        campaigns: [
          expect.objectContaining({
            source: 'coupon',
            couponId: 'coupon-1',
          }),
        ],
        relatedStores: [
          expect.objectContaining({
            slug: 'crimson-bar',
            thumbnailUrl: 'https://example.com/crimson.jpg',
            relatedReason: 'same-city',
          }),
        ],
        seo: expect.objectContaining({
          title: 'Neon Club | NightLife VN',
          canonicalPath: '/stores/neon-club',
          ogImage: 'https://example.com/neon.jpg',
        }),
      }),
    );
    expect(prisma.store.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          slug: 'neon-club',
          deletedAt: null,
          status: 'ACTIVE',
        },
      }),
    );
  });

  it('resolves legacy public store slugs before fetching detail', async () => {
    prisma.store.findFirst.mockResolvedValue({
      id: 'store-neon',
      areaId: null,
      createdAt: new Date('2026-06-20T00:00:00.000Z'),
      updatedAt: new Date('2026-06-21T00:00:00.000Z'),
      name: 'Neon Club',
      slug: 'neon-club',
      category: 'CLUB',
      description: null,
      address: '200 Nghi Tam',
      city: 'Ha Noi',
      district: 'Tay Ho',
      phone: '+84243456007',
      latitude: null,
      longitude: null,
      openingHours: null,
      holidaySchedule: null,
      mapUrl: 'https://maps.google.com/?q=21.063,105.822',
      googlePlaceId: null,
      area: null,
      media: [],
      casts: [],
      coupons: [],
    });
    prisma.store.findMany.mockResolvedValue([] as never);

    const result = await service.getPublicStoreBySlug('club-lumiere');

    expect(result.slug).toBe('neon-club');
    expect(result.seo.canonicalPath).toBe('/stores/neon-club');
    expect(prisma.store.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          slug: 'neon-club',
          deletedAt: null,
          status: 'ACTIVE',
        },
      }),
    );
  });

  it('resolves the legacy yakitori public slug before fetching detail', async () => {
    prisma.store.findFirst.mockResolvedValue({
      id: 'store-tokyo',
      areaId: null,
      createdAt: new Date('2026-06-20T00:00:00.000Z'),
      updatedAt: new Date('2026-06-21T00:00:00.000Z'),
      name: 'Tokyo Kitchen',
      slug: 'tokyo-kitchen',
      category: 'RESTAURANT',
      description: null,
      address: '12 Linh Lang',
      city: 'Ha Noi',
      district: 'Ba Dinh',
      phone: '+84243456008',
      latitude: null,
      longitude: null,
      openingHours: null,
      holidaySchedule: null,
      mapUrl: 'https://maps.google.com/?q=21.034,105.812',
      googlePlaceId: null,
      area: null,
      media: [],
      casts: [],
      coupons: [],
    });
    prisma.store.findMany.mockResolvedValue([] as never);

    const result = await service.getPublicStoreBySlug('yakitori-hanoi');

    expect(result.slug).toBe('tokyo-kitchen');
    expect(result.seo.canonicalPath).toBe('/stores/tokyo-kitchen');
    expect(result.priceReference.note).toBeNull();
    expect(result.priceReference.items).toEqual([]);
    expect(prisma.store.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          slug: 'tokyo-kitchen',
          deletedAt: null,
          status: 'ACTIVE',
        },
      }),
    );
  });

  it('returns not found for a missing public store slug', async () => {
    prisma.store.findFirst.mockResolvedValue(null);

    await expect(
      service.getPublicStoreBySlug('missing-store'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.store.findMany).not.toHaveBeenCalled();
  });

  it('sorts public stores by manual priority ranking', async () => {
    prisma.store.count.mockResolvedValue(2);
    prisma.store.findMany.mockResolvedValue([
      {
        id: 'store-low',
        createdAt: new Date('2026-06-22T00:00:00.000Z'),
        name: 'Low Priority Store',
        slug: 'low-priority-store',
        category: 'BAR',
        description: null,
        address: null,
        city: 'Ha Noi',
        district: 'Hoan Kiem',
        latitude: null,
        longitude: null,
        area: {
          id: 'area-hn',
          code: 'hn-hoankiem',
          name: 'Hoan Kiem',
          city: 'Ha Noi',
          district: 'Hoan Kiem',
        },
        media: [],
      },
      {
        id: 'store-top',
        createdAt: new Date('2026-06-19T00:00:00.000Z'),
        name: 'Top Priority Store',
        slug: 'top-priority-store',
        category: 'CLUB',
        description: null,
        address: null,
        city: 'Ha Noi',
        district: 'Tay Ho',
        latitude: null,
        longitude: null,
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
    prisma.rankingConfig.findMany.mockResolvedValue([
      { targetId: 'store-top', manualScore: 50, pinRank: 1 },
      { targetId: 'store-low', manualScore: 1, pinRank: null },
    ] as never);

    const result = await service.listPublicStores({ sort: 'priority' });

    expect(result.data.map((store) => store.slug)).toEqual([
      'top-priority-store',
      'low-priority-store',
    ]);
    expect(prisma.rankingConfig.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          targetType: 'STORE',
          targetId: { in: ['store-low', 'store-top'] },
          status: 'ACTIVE',
          deletedAt: null,
        }),
      }),
    );
  });

  it('creates an admin ranking config with scoped pin and sponsored flag', async () => {
    const storeId = '11111111-1111-4111-8111-111111111111';
    const rankingId = '22222222-2222-4222-8222-222222222222';
    const now = new Date('2026-06-30T10:00:00.000Z');

    prisma.store.findFirst.mockResolvedValue({ id: storeId });
    prisma.rankingConfig.create.mockResolvedValue({
      id: rankingId,
      targetType: 'STORE',
      targetId: storeId,
      areaId: null,
      cityCode: 'hn',
      category: 'CLUB',
      scope: 'global',
      manualScore: 100,
      pinRank: 1,
      sponsored: true,
      reason: 'Top club tháng 7',
      status: 'ACTIVE',
      startsAt: null,
      endsAt: null,
      createdAt: now,
      updatedAt: now,
      area: null,
    });
    prisma.store.findMany.mockResolvedValue([
      {
        id: storeId,
        name: 'Neon Club',
        slug: 'neon-club',
        category: 'CLUB',
        status: 'ACTIVE',
        city: 'Ha Noi',
        district: 'Tay Ho',
        area: { name: 'Tay Ho', city: 'Ha Noi' },
        media: [
          { url: 'https://example.com/neon-gallery.jpg', purpose: 'gallery' },
          { url: 'https://example.com/neon-hero.jpg', purpose: 'hero' },
        ],
      },
    ] as never);

    const result = await service.createAdminRankingConfig(
      { id: 'admin-1', role: 'ADMIN' },
      {
        targetType: 'STORE',
        targetId: storeId,
        cityCode: 'hn',
        category: 'club',
        scope: 'global',
        pinRank: 1,
        manualScore: 100,
        sponsored: true,
        reason: 'Top club tháng 7',
      },
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: rankingId,
        targetName: 'Neon Club',
        targetSlug: 'neon-club',
        targetImage: 'https://example.com/neon-hero.jpg',
        cityCode: 'hn',
        category: 'CLUB',
        pinRank: 1,
        sponsored: true,
      }),
    );
    expect(prisma.rankingConfig.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          createdById: 'admin-1',
          targetType: 'STORE',
          targetId: storeId,
          cityCode: 'hn',
          category: 'CLUB',
          scope: 'global',
          pinRank: 1,
          manualScore: 100,
          sponsored: true,
        }),
      }),
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: 'admin-1',
        action: 'ranking.config.create',
        targetType: 'RankingConfig',
        targetId: rankingId,
        metadata: expect.objectContaining({
          actorId: 'admin-1',
          action: 'ranking.config.create',
          ref_id: rankingId,
          occurredAt: expect.any(String),
        }),
      }),
    });
    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        channel: 'IN_APP',
        recipient: `RankingConfig:${rankingId}`,
        templateKey: 'audit.ranking.config.create.v1',
        payload: expect.objectContaining({
          actorId: 'admin-1',
          action: 'ranking.config.create',
          ref_id: rankingId,
          occurredAt: expect.any(String),
        }),
      }),
    });
  });

  it('logs minimal audit and notification fields when updating a ranking config', async () => {
    const storeId = '11111111-1111-4111-8111-111111111111';
    const rankingId = '22222222-2222-4222-8222-222222222222';
    const createdAt = new Date('2026-06-30T10:00:00.000Z');
    const updatedAt = new Date('2026-07-01T10:00:00.000Z');
    const current = {
      id: rankingId,
      targetType: 'STORE',
      targetId: storeId,
      areaId: null,
      cityCode: 'hn',
      category: 'CLUB',
      scope: 'global',
      manualScore: 100,
      pinRank: 1,
      sponsored: true,
      status: 'ACTIVE',
      startsAt: null,
      endsAt: null,
      createdAt,
      updatedAt: createdAt,
      area: null,
    };

    prisma.rankingConfig.findFirst
      .mockResolvedValueOnce(current)
      .mockResolvedValueOnce(null);
    prisma.rankingConfig.update.mockResolvedValue({
      ...current,
      manualScore: 120,
      status: 'PAUSED',
      updatedAt,
    });
    prisma.store.findMany.mockResolvedValue([
      {
        id: storeId,
        name: 'Neon Club',
        slug: 'neon-club',
        category: 'CLUB',
        status: 'ACTIVE',
        city: 'Ha Noi',
        district: 'Tay Ho',
        area: { name: 'Tay Ho', city: 'Ha Noi' },
        media: [],
      },
    ] as never);

    const result = await service.updateAdminRankingConfig(
      { id: 'admin-2', role: 'ADMIN' },
      rankingId,
      { manualScore: 120, status: 'PAUSED' },
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: rankingId,
        manualScore: 120,
        status: 'PAUSED',
      }),
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: 'admin-2',
        action: 'ranking.config.update',
        targetType: 'RankingConfig',
        targetId: rankingId,
        metadata: expect.objectContaining({
          actorId: 'admin-2',
          action: 'ranking.config.update',
          ref_id: rankingId,
          occurredAt: expect.any(String),
        }),
      }),
    });
    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        channel: 'IN_APP',
        recipient: `RankingConfig:${rankingId}`,
        templateKey: 'audit.ranking.config.update.v1',
        payload: expect.objectContaining({
          actorId: 'admin-2',
          action: 'ranking.config.update',
          ref_id: rankingId,
          occurredAt: expect.any(String),
        }),
      }),
    });
  });

  it('does not limit public casts to Hanoi and HCM when city is all', async () => {
    prisma.cast.findMany.mockResolvedValue([
      {
        id: 'cast-mika',
        createdAt: new Date('2026-07-09T00:00:00.000Z'),
        slug: 'mika-dragon',
        stageName: 'Mika',
        publicAlias: 'Mika',
        publicHeadline: 'Da Nang skyline host',
        tags: ['club'],
        languages: ['vi'],
        hourlyRateVnd: 500000,
        media: [],
        store: {
          id: 'store-dragon',
          name: 'Dragon Rooftop Club',
          slug: 'dragon-rooftop-club',
          category: 'CLUB',
          city: 'Da Nang',
          district: 'Hai Chau',
          latitude: null,
          longitude: null,
          area: {
            id: 'area-dn',
            code: 'dn-haichau',
            name: 'Hai Chau',
            city: 'Da Nang',
            district: 'Hai Chau',
          },
        },
      },
    ] as never);

    const result = await service.listPublicCasts({ city: 'all' });

    expect(result.data).toEqual([
      expect.objectContaining({
        slug: 'mika-dragon',
        store: expect.objectContaining({
          slug: 'dragon-rooftop-club',
          cityCode: 'dn',
        }),
      }),
    ]);
    expect(prisma.cast.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          store: {
            deletedAt: null,
            status: 'ACTIVE',
          },
        }),
      }),
    );
  });

  it('includes active public all-city casts when their active store has no area', async () => {
    prisma.cast.findMany.mockResolvedValue([
      {
        id: 'cast-yuki',
        createdAt: new Date('2026-07-09T00:00:00.000Z'),
        slug: 'yuki-meo-meo',
        stageName: 'Yuki',
        publicAlias: 'Yuki',
        publicHeadline: 'Host at Meo Meo',
        tags: ['hostess'],
        languages: ['vi', 'ja'],
        hourlyRateVnd: 400000,
        media: [],
        store: {
          id: 'store-meo-meo',
          name: 'Meo Meo',
          slug: 'meo-meo',
          category: 'CLUB',
          city: 'Tinh Ninh Binh',
          district: null,
          latitude: null,
          longitude: null,
          area: null,
        },
      },
    ] as never);

    const result = await service.listPublicCasts({ city: 'all' });

    expect(result.data).toEqual([
      expect.objectContaining({
        slug: 'yuki-meo-meo',
        store: expect.objectContaining({
          slug: 'meo-meo',
          city: 'Tinh Ninh Binh',
          area: null,
        }),
      }),
    ]);
    expect(prisma.cast.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          store: {
            deletedAt: null,
            status: 'ACTIVE',
          },
        }),
      }),
    );
  });

  it('searches public casts by cast or store name and store filters', async () => {
    prisma.cast.findMany.mockResolvedValue([
      {
        id: 'cast-mika',
        createdAt: new Date('2026-06-20T00:00:00.000Z'),
        slug: 'mika-harbor-ktv',
        stageName: 'Mika',
        publicAlias: 'Mika',
        publicHeadline: 'KTV duet host',
        tags: ['ktv'],
        languages: ['vi', 'ja'],
        hourlyRateVnd: 430000,
        media: [],
        store: {
          id: 'store-hcm',
          name: 'Golden Voice KTV Quan 7',
          slug: 'golden-voice-ktv-quan-7',
          category: 'KARAOKE',
          city: 'Ho Chi Minh',
          district: 'Quan 7',
          latitude: '10.7385',
          longitude: '106.7219',
          area: {
            id: 'area-hcm',
            code: 'hcm-q7',
            name: 'Quan 7',
            city: 'Ho Chi Minh',
            district: 'Quan 7',
          },
        },
      },
    ] as never);

    const result = await service.listPublicCasts({
      q: 'mika',
      city: 'hcm',
      category: 'ktv',
      language: 'ja',
      storeSlug: 'golden-voice-ktv-quan-7',
      tag: 'ktv',
      lat: '10.738',
      lng: '106.722',
    });

    expect(result.data).toEqual([
      expect.objectContaining({
        slug: 'mika-harbor-ktv',
        name: 'Mika',
        distanceKm: expect.any(Number),
        store: expect.objectContaining({
          slug: 'golden-voice-ktv-quan-7',
          category: 'KARAOKE',
          cityCode: 'hcm',
        }),
      }),
    ]);
    expect(result.meta).toEqual(
      expect.objectContaining({
        total: 1,
        sort: 'nearest',
      }),
    );
    expect(prisma.cast.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
          status: 'ACTIVE',
          isPublic: true,
          languages: { has: 'ja' },
          tags: { has: 'ktv' },
          store: expect.objectContaining({
            deletedAt: null,
            status: 'ACTIVE',
            category: 'KARAOKE',
            slug: 'golden-voice-ktv-quan-7',
          }),
          OR: expect.arrayContaining([
            { stageName: { contains: 'mika', mode: 'insensitive' } },
          ]),
        }),
      }),
    );
  });

  it('gets public cast detail by slug without exposing private fields', async () => {
    prisma.cast.findFirst.mockResolvedValue({
      id: 'cast-aya',
      slug: 'aya-velvet',
      storeId: 'store-velvet',
      stageName: 'Aya',
      publicAlias: 'Aya',
      publicHeadline: 'VIP host',
      bio: 'Admin introduction for Aya.',
      publicBio: null,
      birthMonth: 8,
      zodiacSign: 'Leo',
      heightCm: 168,
      measurements: '82-58-86',
      hobbies: ['wine', 'piano'],
      styleTags: ['vip'],
      youtubeLinks: ['https://youtu.be/aya-intro'],
      tags: ['vip', 'wine-expert'],
      languages: ['ja', 'vi'],
      hourlyRateVnd: 700000,
      media: [
        {
          id: 'media-image',
          type: 'IMAGE',
          url: 'https://example.com/aya.jpg',
          purpose: 'cast-gallery',
          mimeType: 'image/jpeg',
          originalName: 'Aya profile',
          createdAt: new Date('2026-06-20T00:00:00.000Z'),
        },
        {
          id: 'media-video',
          type: 'VIDEO',
          url: 'https://example.com/aya.mp4',
          purpose: 'intro-video',
          mimeType: 'video/mp4',
          originalName: 'Aya intro',
          createdAt: new Date('2026-06-21T00:00:00.000Z'),
        },
      ],
      store: {
        id: 'store-velvet',
        name: 'Velvet Club',
        slug: 'velvet-club',
        category: 'CLUB',
        description: 'VIP club',
        address: 'Quan 1',
        city: 'Ho Chi Minh',
        district: 'Quan 1',
        phone: '+842812345678',
        latitude: '10.7731',
        longitude: '106.7042',
        mapUrl: 'https://maps.example/velvet',
        googlePlaceId: null,
        media: [
          { url: 'https://example.com/velvet-hero.jpg', purpose: 'store-hero' },
        ],
        area: {
          id: 'area-hcm',
          code: 'hcm-q1',
          name: 'Quan 1',
          city: 'Ho Chi Minh',
          district: 'Quan 1',
          ward: 'Ben Nghe',
        },
      },
    });
    prisma.cast.findMany.mockResolvedValue([
      {
        id: 'cast-rina',
        slug: 'rina-velvet',
        storeId: 'store-velvet',
        stageName: 'Rina',
        publicAlias: 'Rina',
        publicHeadline: 'Party host',
        tags: ['party', 'vip'],
        languages: ['ja', 'vi'],
        hourlyRateVnd: 600000,
        media: [{ url: 'https://example.com/rina.jpg' }],
        store: {
          id: 'store-velvet',
          name: 'Velvet Club',
          slug: 'velvet-club',
          category: 'CLUB',
          description: 'VIP club',
          address: 'Quan 1',
          city: 'Ho Chi Minh',
          district: 'Quan 1',
          latitude: '10.7731',
          longitude: '106.7042',
          area: {
            id: 'area-hcm',
            code: 'hcm-q1',
            name: 'Quan 1',
            city: 'Ho Chi Minh',
            district: 'Quan 1',
            ward: 'Ben Nghe',
          },
        },
      },
    ] as never);

    const result = await service.getPublicCastBySlug('aiko');

    expect(prisma.cast.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          slug: 'aya-velvet',
          deletedAt: null,
          status: 'ACTIVE',
          isPublic: true,
          store: {
            deletedAt: null,
            status: 'ACTIVE',
          },
        }),
        select: expect.not.objectContaining({
          status: true,
          isPublic: true,
          deletedAt: true,
          userId: true,
        }),
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: 'cast-aya',
        slug: 'aya-velvet',
        name: 'Aya',
        publicBio: 'Admin introduction for Aya.',
        monthOfBirth: 8,
        zodiacSign: 'Leo',
        heightCm: 168,
        measurements: '82-58-86',
        interests: ['wine', 'piano'],
        styleTags: ['vip'],
        thumbnailUrl: 'https://example.com/aya.jpg',
        gallery: expect.arrayContaining([
          expect.objectContaining({
            id: 'media-image',
            type: 'IMAGE',
            url: 'https://example.com/aya.jpg',
            purpose: 'cast-gallery',
          }),
          expect.objectContaining({
            id: 'media-video',
            type: 'VIDEO',
            url: 'https://example.com/aya.mp4',
            purpose: 'intro-video',
          }),
          expect.objectContaining({
            id: 'youtube-1',
            type: 'VIDEO',
            url: 'https://youtu.be/aya-intro',
            purpose: 'youtube-link',
          }),
        ]),
        relatedCasts: [
          expect.objectContaining({
            slug: 'rina-velvet',
            relatedReason: 'same-store',
            thumbnailUrl: 'https://example.com/rina.jpg',
          }),
        ],
        store: expect.objectContaining({
          slug: 'velvet-club',
          cityCode: 'hcm',
          phone: '+842812345678',
          thumbnailUrl: 'https://example.com/velvet-hero.jpg',
          mapUrl: 'https://maps.example/velvet',
        }),
        seo: expect.objectContaining({
          title: 'Aya tại Velvet Club | NightLife VN',
          canonicalPath: '/casts/aya-velvet',
          ogImage: 'https://example.com/aya.jpg',
        }),
      }),
    );
    expect(result).not.toHaveProperty('bio');
    expect(result).not.toHaveProperty('status');
    expect(result).not.toHaveProperty('isPublic');
    expect(result).not.toHaveProperty('deletedAt');
  });

  it('falls back to ranked casts when no same-store cast is available', async () => {
    prisma.cast.findFirst.mockResolvedValue({
      id: 'cast-aya',
      slug: 'aya-velvet',
      storeId: 'store-velvet',
      stageName: 'Aya',
      publicAlias: 'Aya',
      publicHeadline: 'VIP host',
      bio: 'Admin introduction for Aya.',
      publicBio: null,
      birthMonth: 8,
      zodiacSign: 'Leo',
      heightCm: 168,
      measurements: null,
      hobbies: [],
      styleTags: [],
      youtubeLinks: [],
      tags: ['vip'],
      languages: ['ja', 'vi'],
      hourlyRateVnd: 700000,
      media: [
        {
          id: 'media-image',
          type: 'IMAGE',
          url: 'https://example.com/aya.jpg',
          purpose: 'cast-gallery',
          mimeType: 'image/jpeg',
          originalName: 'Aya profile',
          createdAt: new Date('2026-06-20T00:00:00.000Z'),
        },
      ],
      store: {
        id: 'store-velvet',
        name: 'Velvet Club',
        slug: 'velvet-club',
        category: 'CLUB',
        description: 'VIP club',
        address: 'Quan 1',
        city: 'Ho Chi Minh',
        district: 'Quan 1',
        phone: '+842812345678',
        latitude: '10.7731',
        longitude: '106.7042',
        mapUrl: 'https://maps.example/velvet',
        googlePlaceId: null,
        media: [
          { url: 'https://example.com/velvet-hero.jpg', purpose: 'store-hero' },
        ],
        area: {
          id: 'area-hcm',
          code: 'hcm-q1',
          name: 'Quan 1',
          city: 'Ho Chi Minh',
          district: 'Quan 1',
          ward: 'Ben Nghe',
        },
      },
    });
    prisma.cast.findMany
      .mockResolvedValueOnce([] as never)
      .mockResolvedValueOnce([
        {
          id: 'cast-mika',
          slug: 'mika-ktv',
          storeId: 'store-neon',
          stageName: 'Mika',
          publicAlias: 'Mika KTV',
          publicHeadline: 'Ranked host',
          tags: ['party'],
          languages: ['vi'],
          hourlyRateVnd: 650000,
          media: [{ url: 'https://example.com/mika.jpg' }],
          store: {
            id: 'store-neon',
            name: 'Neon Club',
            slug: 'neon-club',
            category: 'CLUB',
            description: 'Ranked club',
            address: 'Quan 3',
            city: 'Ho Chi Minh',
            district: 'Quan 3',
            latitude: '10.7810',
            longitude: '106.6900',
            area: {
              id: 'area-hcm-q3',
              code: 'hcm-q3',
              name: 'Quan 3',
              city: 'Ho Chi Minh',
              district: 'Quan 3',
              ward: null,
            },
          },
        },
      ] as never)
      .mockResolvedValueOnce([] as never);
    prisma.rankingConfig.findMany.mockResolvedValueOnce([
      { targetId: 'cast-mika' },
    ] as never);

    const result = await service.getPublicCastBySlug('aya-velvet');

    expect(prisma.rankingConfig.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          targetType: 'CAST',
          scope: 'global',
          status: 'ACTIVE',
          deletedAt: null,
        }),
      }),
    );
    expect(result.relatedCasts).toEqual([
      expect.objectContaining({
        slug: 'mika-ktv',
        relatedReason: 'ranking',
        thumbnailUrl: 'https://example.com/mika.jpg',
      }),
    ]);
  });

  it('returns 404 when cast detail is not public', async () => {
    prisma.cast.findFirst.mockResolvedValue(null);

    await expect(
      service.getPublicCastBySlug('hidden-cast'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('saves and removes a cast favorite for a member', async () => {
    prisma.cast.findFirst.mockResolvedValue({
      id: 'cast-aya',
      slug: 'aya-velvet',
    });
    prisma.memberFavoriteCast.upsert.mockResolvedValue({
      id: 'fav-1',
    });
    prisma.memberFavoriteCast.deleteMany.mockResolvedValue({
      count: 1,
    });

    await expect(
      service.favoriteMemberCast({ id: 'user-1', role: 'USER' }, 'aiko'),
    ).resolves.toEqual({
      castId: 'cast-aya',
      castSlug: 'aya-velvet',
      favorited: true,
    });
    expect(prisma.memberFavoriteCast.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId_castId: {
            userId: 'user-1',
            castId: 'cast-aya',
          },
        },
      }),
    );

    await expect(
      service.unfavoriteMemberCast({ id: 'user-1', role: 'USER' }, 'aiko'),
    ).resolves.toEqual({
      castId: 'cast-aya',
      castSlug: 'aya-velvet',
      favorited: false,
    });
    expect(prisma.memberFavoriteCast.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        castId: 'cast-aya',
      },
    });
  });

  it('saves and removes a store favorite for a member', async () => {
    prisma.store.findFirst.mockResolvedValue({
      id: 'store-neon',
      slug: 'neon-club',
    });
    prisma.memberFavoriteStore.upsert.mockResolvedValue({
      id: 'fav-store-1',
    });
    prisma.memberFavoriteStore.deleteMany.mockResolvedValue({
      count: 1,
    });

    await expect(
      service.favoriteMemberStore({ id: 'user-1', role: 'USER' }, 'neon'),
    ).resolves.toEqual({
      storeId: 'store-neon',
      storeSlug: 'neon-club',
      favorited: true,
    });
    expect(prisma.memberFavoriteStore.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId_storeId: {
            userId: 'user-1',
            storeId: 'store-neon',
          },
        },
      }),
    );

    await expect(
      service.unfavoriteMemberStore({ id: 'user-1', role: 'USER' }, 'neon'),
    ).resolves.toEqual({
      storeId: 'store-neon',
      storeSlug: 'neon-club',
      favorited: false,
    });
    expect(prisma.memberFavoriteStore.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        storeId: 'store-neon',
      },
    });
  });

  it('limits partner bookings to the stores in their access scope', async () => {
    accessService.getAccessibleStoreIds.mockResolvedValue(['store-1']);
    prisma.booking.findMany.mockResolvedValue([] as never);

    await service.listPartnerBookings({
      id: 'partner-1',
      role: 'PARTNER',
    });

    expect(accessService.getAccessibleStoreIds).toHaveBeenCalledWith(
      { id: 'partner-1', role: 'PARTNER' },
      'booking.partner.view',
    );
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

  it('lists admin bookings when searching by the BK code prefix', async () => {
    const booking = {
      id: 'booking-5542',
      bookingCode: 'BK-5542',
      user: null,
      guest: {
        displayName: 'Minh Tu Nguyen Dang',
        phone: '0900000000',
        email: 'guest@example.com',
      },
      store: { name: 'Opera Spa Hai Phong' },
      cast: null,
      partySize: 4,
      scheduledAt: new Date('2026-07-09T14:00:00.000Z'),
      status: 'REQUESTED',
      note: null,
    };
    prisma.booking.findMany.mockResolvedValueOnce([booking] as never);
    prisma.booking.count
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);

    const result = await service.listAdminBookings({ search: 'BK' });

    expect(result.data).toEqual([
      expect.objectContaining({
        id: 'booking-5542',
        bookingCode: 'BK-5542',
      }),
    ]);
    expect(result.meta).toEqual(
      expect.objectContaining({
        total: 1,
        all: 1,
        new: 1,
      }),
    );
  });

  it('creates a guest booking request for an active store', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-20T10:00:00.000Z'));
    prisma.store.findFirst.mockResolvedValue({
      id: 'store-1',
      name: 'Neon Club',
      slug: 'neon-club',
    });
    prisma.guest.create.mockResolvedValue({ id: 'guest-1' });
    prisma.booking.create.mockResolvedValue({
      id: 'booking-1',
      status: 'REQUESTED',
      scheduledAt: new Date('2026-06-30T14:00:00.000Z'),
      partySize: 4,
      storeId: 'store-1',
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      guest: {
        id: 'guest-1',
        displayName: 'Guest Name',
        phone: null,
        email: 'guest@example.com',
      },
    });

    await service.createGuestBooking({
      storeSlug: 'neon-club',
      displayName: 'Guest Name',
      email: 'GUEST@example.com',
      scheduledAt: '2026-06-30T14:00:00.000Z',
      partySize: 4,
      note: 'VIP room',
    });

    expect(prisma.store.findFirst).toHaveBeenCalledWith({
      where: {
        slug: 'neon-club',
        deletedAt: null,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        openingHours: true,
        slug: true,
      },
    });
    expect(prisma.guest.create).toHaveBeenCalledWith({
      data: {
        displayName: 'Guest Name',
        phone: undefined,
        email: 'guest@example.com',
      },
      select: { id: true },
    });
    expect(prisma.booking.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          guestId: 'guest-1',
          storeId: 'store-1',
          castId: undefined,
          status: 'REQUESTED',
          partySize: 4,
          note: 'VIP room',
          discountSnapshot: {
            couponId: null,
            couponIssueId: null,
          },
        }),
      }),
    );
    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        guestId: 'guest-1',
        storeId: 'store-1',
        bookingId: 'booking-1',
        channel: 'EMAIL',
        status: 'QUEUED',
        recipient: 'guest@example.com',
        templateKey: 'customer.booking.qr_email.v1',
        payload: expect.objectContaining({
          bookingId: 'booking-1',
          bookingCode: expect.stringMatching(/^BK-/),
          qrPayload: expect.stringContaining('NLBOOKING|booking-1|BK-'),
          qrImageUrl: expect.stringContaining('api.qrserver.com'),
          amountLabel: 'Miễn phí - không thu cọc',
        }),
      }),
    });
    expect(emailNotificationService.sendBookingQrEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'guest@example.com',
        bookingId: 'booking-1',
        bookingCode: expect.stringMatching(/^BK-/),
        qrPayload: expect.stringContaining('NLBOOKING|booking-1|BK-'),
        qrImageDataUrl: expect.stringContaining('data:image/png;base64,'),
      }),
    );
    expect(prisma.notificationLog.update).toHaveBeenCalledWith({
      where: { id: 'notification-1' },
      data: expect.objectContaining({
        status: 'SENT',
        error: null,
        payload: expect.objectContaining({
          providerMessageId: 'smtp-message-1',
        }),
      }),
    });
    expect(adminNotificationService.notifyBookingCreated).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'booking-1',
        status: 'REQUESTED',
      }),
    );
  });

  it('normalizes Vietnamese guest names before creating a booking', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-20T10:00:00.000Z'));
    prisma.store.findFirst.mockResolvedValue({
      id: 'store-1',
      name: 'Neon Club',
      slug: 'neon-club',
      openingHours: null,
    });
    prisma.guest.create.mockResolvedValue({ id: 'guest-1' });
    prisma.booking.create.mockResolvedValue({
      id: 'booking-1',
      status: 'REQUESTED',
      scheduledAt: new Date('2026-06-30T14:00:00.000Z'),
      partySize: 4,
      storeId: 'store-1',
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      guest: {
        id: 'guest-1',
        displayName: 'Nguyễn Văn A',
        phone: null,
        email: 'guest@example.com',
      },
    });

    await service.createGuestBooking({
      storeSlug: 'neon-club',
      displayName: 'Nguye\u0302\u0303n Va\u0306n A',
      email: 'guest@example.com',
      scheduledAt: '2026-06-30T14:00:00.000Z',
      partySize: 4,
    });

    expect(prisma.guest.create).toHaveBeenCalledWith({
      data: {
        displayName: 'Nguyễn Văn A',
        phone: undefined,
        email: 'guest@example.com',
      },
      select: { id: true },
    });
  });

  it.each([
    [
      'a past booking date',
      '2026-06-19T14:00:00.000Z',
      'scheduledAt cannot be in the past',
    ],
    [
      'a booking date after the 2 week window',
      '2026-07-05T14:00:00.000Z',
      'scheduledAt can only be within 14 days',
    ],
  ])(
    'rejects %s before creating a guest contact',
    async (_, scheduledAt, message) => {
      jest.useFakeTimers().setSystemTime(new Date('2026-06-20T10:00:00.000Z'));
      prisma.store.findFirst.mockResolvedValue({
        id: 'store-1',
        name: 'Neon Club',
        slug: 'neon-club',
      });

      await expect(
        service.createGuestBooking({
          storeSlug: 'neon-club',
          displayName: 'Guest Name',
          email: 'guest@example.com',
          scheduledAt,
          partySize: 4,
        }),
      ).rejects.toThrow(message);

      expect(prisma.guest.create).not.toHaveBeenCalled();
      expect(prisma.booking.create).not.toHaveBeenCalled();
    },
  );

  it('creates a guest booking with an optional coupon campaign link', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-20T10:00:00.000Z'));
    prisma.store.findFirst.mockResolvedValue({
      id: 'store-1',
      name: 'Neon Club',
      slug: 'neon-club',
    });
    prisma.coupon.findFirst.mockResolvedValue({
      id: 'coupon-1',
      code: 'WELCOME',
      name: 'Welcome',
      storeId: 'store-1',
      discountType: 'PERCENT',
      discountValue: 5,
      maxDiscountVnd: null,
      minSpendVnd: null,
      endsAt: null,
      usageLimit: null,
      usedCount: 0,
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
    });
    prisma.guest.create.mockResolvedValue({ id: 'guest-1' });
    prisma.couponIssue.create.mockResolvedValue({
      id: 'issue-1',
      code: 'GUEST-code',
      couponId: 'coupon-1',
      status: 'ISSUED',
      metadata: {},
      coupon: { storeId: 'store-1' },
    });
    prisma.booking.create.mockResolvedValue({
      id: 'booking-1',
      status: 'REQUESTED',
    });

    await service.createGuestBooking({
      storeSlug: 'neon-club',
      couponId: 'coupon-1',
      displayName: 'Guest Name',
      phone: '+84901234567',
      scheduledAt: '2026-06-30T14:00:00.000Z',
      partySize: 4,
    });

    expect(prisma.coupon.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'coupon-1',
          storeId: 'store-1',
          status: 'ACTIVE',
          deletedAt: null,
        }),
      }),
    );
    expect(prisma.booking.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          storeId: 'store-1',
          couponId: 'coupon-1',
          couponIssueId: 'issue-1',
          discountSnapshot: {
            couponId: 'coupon-1',
            couponIssueId: 'issue-1',
          },
        }),
      }),
    );
  });

  it('automatically resolves and links VIP10 coupon on normal bookings for VIP users', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-20T10:00:00.000Z'));
    prisma.store.findFirst.mockResolvedValue({
      id: 'store-1',
      name: 'Neon Club',
      slug: 'neon-club',
    });
    prisma.coupon.findFirst.mockResolvedValueOnce({
      id: 'vip-coupon-1',
      code: 'VIP10',
      name: 'VIP 10%',
      storeId: 'moonlight-bar',
      discountType: 'PERCENT',
      discountValue: 10,
      maxDiscountVnd: null,
      minSpendVnd: null,
      endsAt: null,
      usageLimit: null,
      usedCount: 0,
    });
    prisma.coupon.findFirst.mockResolvedValueOnce({
      id: 'vip-coupon-1',
      code: 'VIP10',
      name: 'VIP 10%',
      storeId: 'moonlight-bar',
      discountType: 'PERCENT',
      discountValue: 10,
      maxDiscountVnd: null,
      minSpendVnd: null,
      endsAt: null,
      usageLimit: null,
      usedCount: 0,
      store: {
        id: 'moonlight-bar',
        name: 'Moonlight Bar',
        slug: 'moonlight-bar',
      },
    });

    prisma.guest.create.mockResolvedValue({ id: 'guest-1' });
    prisma.couponIssue.create.mockResolvedValue({
      id: 'vip-issue-1',
      code: 'MEMBER-vip-issue-1',
      couponId: 'vip-coupon-1',
      status: 'ISSUED',
      metadata: {},
      coupon: { storeId: 'moonlight-bar' },
    });
    prisma.booking.create.mockResolvedValue({
      id: 'booking-1',
      status: 'REQUESTED',
    });

    await service.createMemberBooking(
      { id: 'member-1', role: 'USER', tier: 'VIP' },
      {
        storeSlug: 'neon-club',
        displayName: 'VIP Member',
        phone: '+84901234567',
        scheduledAt: '2026-06-30T14:00:00.000Z',
        partySize: 2,
      },
    );

    expect(prisma.coupon.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          code: 'VIP10',
          status: 'ACTIVE',
        }),
      }),
    );
    expect(prisma.booking.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          couponId: 'vip-coupon-1',
          couponIssueId: 'vip-issue-1',
        }),
      }),
    );
  });

  it('creates a member booking request for a cast with a contact snapshot', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-20T10:00:00.000Z'));
    prisma.coupon.findFirst.mockResolvedValue(null);
    prisma.cast.findFirst.mockResolvedValue({
      id: 'cast-1',
      slug: 'yuna-neon',
      stageName: 'Yuna',
      publicAlias: 'Yuna',
      store: {
        id: 'store-1',
        name: 'Neon Club',
        slug: 'neon-club',
      },
    });
    prisma.guest.create.mockResolvedValue({ id: 'guest-1' });
    prisma.booking.create.mockResolvedValue({
      id: 'booking-1',
      bookingCode: 'BK-BOOKING-',
      status: 'REQUESTED',
      storeId: 'store-1',
      scheduledAt: new Date('2026-06-30T14:00:00.000Z'),
      partySize: 2,
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      cast: {
        id: 'cast-1',
        slug: 'yuna-neon',
        stageName: 'Yuna',
        publicAlias: 'Yuna',
      },
      user: {
        id: 'member-1',
        email: 'member@example.com',
        displayName: 'Member',
        tier: 'FREE',
      },
      guest: {
        id: 'guest-1',
        displayName: 'Minh Nguyen',
        phone: '+84907654321',
        email: 'member@example.com',
      },
    });

    await service.createMemberBooking(
      { id: 'member-1', role: 'USER' },
      {
        castSlug: 'yuna-neon',
        displayName: 'Minh Nguyen',
        phone: '+84907654321',
        scheduledAt: '2026-06-30T14:00:00.000Z',
        partySize: 2,
      },
    );

    expect(prisma.cast.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          slug: 'yuna-neon',
          deletedAt: null,
          status: 'ACTIVE',
          isPublic: true,
        }),
      }),
    );
    expect(prisma.guest.create).toHaveBeenCalledWith({
      data: {
        convertedUserId: 'member-1',
        displayName: 'Minh Nguyen',
        phone: '+84907654321',
        email: '',
      },
      select: { id: true },
    });
    expect(prisma.booking.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'member-1',
          guestId: 'guest-1',
          storeId: 'store-1',
          castId: 'cast-1',
          status: 'REQUESTED',
          partySize: 2,
          discountSnapshot: {
            couponId: null,
            couponIssueId: null,
          },
        }),
      }),
    );
    expect(adminNotificationService.notifyBookingCreated).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'booking-1',
        status: 'REQUESTED',
      }),
    );
    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'member-1',
        guestId: 'guest-1',
        storeId: 'store-1',
        bookingId: 'booking-1',
        channel: 'IN_APP',
        status: 'QUEUED',
        recipient: 'member-1',
        templateKey: 'customer.booking.cast_created.v1',
        payload: expect.objectContaining({
          bookingId: 'booking-1',
          bookingCode: 'BK-BOOKING-',
        }),
      }),
    });
  });

  it('rejects a duplicate guest booking for the same store and time slot', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-20T10:00:00.000Z'));
    const scheduledAt = '2026-06-30T14:00:00.000Z';
    prisma.store.findFirst.mockResolvedValue({
      id: 'store-1',
      name: 'Neon Club',
      slug: 'neon-club',
      openingHours: null,
    });
    prisma.booking.findFirst.mockResolvedValueOnce({
      id: 'booking-duplicate',
    });

    await expect(
      service.createGuestBooking({
        storeSlug: 'neon-club',
        displayName: 'Guest Name',
        email: 'guest@example.com',
        scheduledAt,
        partySize: 4,
      }),
    ).rejects.toThrow(
      'You already have an active booking at this store for this time slot.',
    );

    expect(prisma.booking.findFirst).toHaveBeenCalledWith({
      where: {
        storeId: 'store-1',
        scheduledAt: new Date(scheduledAt),
        deletedAt: null,
        status: { in: ['REQUESTED', 'CONFIRMED', 'CHECKED_IN'] },
        OR: [{ guest: { is: { email: 'guest@example.com' } } }],
      },
      select: { id: true },
    });
    expect(prisma.guest.create).not.toHaveBeenCalled();
    expect(prisma.booking.create).not.toHaveBeenCalled();
  });

  it('rejects a duplicate member cast booking for the same store and time slot', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-20T10:00:00.000Z'));
    const scheduledAt = '2026-06-30T14:00:00.000Z';
    prisma.cast.findFirst.mockResolvedValue({
      id: 'cast-1',
      slug: 'yuna-neon',
      stageName: 'Yuna',
      publicAlias: 'Yuna',
      store: {
        id: 'store-1',
        name: 'Neon Club',
        slug: 'neon-club',
        openingHours: null,
      },
    });
    prisma.booking.findFirst.mockResolvedValueOnce({
      id: 'booking-duplicate',
    });

    await expect(
      service.createMemberBooking(
        { id: 'member-1', role: 'USER' },
        {
          castSlug: 'yuna-neon',
          displayName: 'Minh Nguyen',
          email: 'member@example.com',
          scheduledAt,
          partySize: 2,
        },
      ),
    ).rejects.toThrow(
      'You already have an active booking at this store for this time slot.',
    );

    expect(prisma.booking.findFirst).toHaveBeenCalledWith({
      where: {
        storeId: 'store-1',
        scheduledAt: new Date(scheduledAt),
        deletedAt: null,
        status: { in: ['REQUESTED', 'CONFIRMED', 'CHECKED_IN'] },
        OR: [
          { userId: 'member-1' },
          { guest: { is: { convertedUserId: 'member-1' } } },
          { guest: { is: { email: 'member@example.com' } } },
        ],
      },
      select: { id: true },
    });
    expect(prisma.guest.create).not.toHaveBeenCalled();
    expect(prisma.booking.create).not.toHaveBeenCalled();
  });

  it('rechecks duplicate booking inside the create transaction', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-20T10:00:00.000Z'));
    const scheduledAt = '2026-06-30T14:00:00.000Z';
    prisma.store.findFirst.mockResolvedValue({
      id: 'store-1',
      name: 'Neon Club',
      slug: 'neon-club',
      openingHours: null,
    });
    prisma.booking.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: 'booking-duplicate',
    });
    prisma.guest.create.mockResolvedValue({ id: 'guest-1' });

    await expect(
      service.createGuestBooking({
        storeSlug: 'neon-club',
        displayName: 'Guest Name',
        email: 'guest@example.com',
        scheduledAt,
        partySize: 4,
      }),
    ).rejects.toThrow(
      'You already have an active booking at this store for this time slot.',
    );

    expect(prisma.booking.findFirst).toHaveBeenCalledTimes(2);
    expect(prisma.booking.findFirst).toHaveBeenLastCalledWith({
      where: {
        storeId: 'store-1',
        scheduledAt: new Date(scheduledAt),
        deletedAt: null,
        status: { in: ['REQUESTED', 'CONFIRMED', 'CHECKED_IN'] },
        OR: [{ guest: { is: { email: 'guest@example.com' } } }],
      },
      select: { id: true },
    });
    expect(prisma.booking.create).not.toHaveBeenCalled();
  });

  it('cancels a member booking and sends the admin alert', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-30T12:30:00.000Z'));
    prisma.booking.findFirst.mockResolvedValue({
      id: 'booking-1',
      userId: 'member-1',
      guestId: 'guest-1',
      status: 'REQUESTED',
      scheduledAt: new Date('2026-06-30T14:00:00.000Z'),
      cancelledAt: null,
    });
    prisma.booking.update.mockResolvedValue({
      id: 'booking-1',
      bookingCode: 'BK-BOOKING-',
      status: 'CANCELLED',
      scheduledAt: new Date('2026-06-30T14:00:00.000Z'),
      cancelledAt: new Date('2026-06-30T12:30:00.000Z'),
      user: { id: 'member-1', displayName: 'Member', tier: 'REGULAR' },
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      guest: { id: 'guest-1', displayName: 'Guest', phone: '+84901234567' },
    });
    prisma.auditLog.create.mockResolvedValue({ id: 'audit-1' });

    await service.cancelMemberBooking(
      { id: 'member-1', role: 'USER' },
      'booking-1',
      { reason: 'Change of plans' },
    );

    expect(prisma.booking.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'booking-1',
          userId: 'member-1',
          deletedAt: null,
        },
        select: expect.objectContaining({
          id: true,
          userId: true,
          guestId: true,
          status: true,
          scheduledAt: true,
          cancelledAt: true,
        }),
      }),
    );
    expect(prisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'booking-1' },
        data: expect.objectContaining({
          status: 'CANCELLED',
          cancelledAt: expect.any(Date),
        }),
      }),
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: 'member-1',
        action: 'BOOKING_CANCELLED',
        targetType: 'Booking',
        targetId: 'booking-1',
        beforeJson: expect.objectContaining({
          id: 'booking-1',
          status: 'REQUESTED',
          userId: 'member-1',
          guestId: 'guest-1',
        }),
        afterJson: expect.objectContaining({
          id: 'booking-1',
          status: 'CANCELLED',
          userId: 'member-1',
          guestId: 'guest-1',
        }),
        metadata: expect.objectContaining({
          actorType: 'MEMBER',
          actorId: 'member-1',
          reason: 'Change of plans',
          beforeStatus: 'REQUESTED',
          afterStatus: 'CANCELLED',
        }),
      }),
    });
    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'member-1',
        guestId: 'guest-1',
        storeId: 'store-1',
        bookingId: 'booking-1',
        channel: 'IN_APP',
        status: 'QUEUED',
        recipient: 'member-1',
        templateKey: 'customer.booking.cancelled.v1',
        payload: expect.objectContaining({
          bookingId: 'booking-1',
          bookingCode: 'BK-BOOKING-',
          status: 'CANCELLED',
          reason: 'Change of plans',
          actorType: 'MEMBER',
        }),
      }),
    });
    expect(
      adminNotificationService.notifyBookingCancelled,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'booking-1',
        status: 'CANCELLED',
      }),
      { reason: 'Change of plans' },
    );
  });

  it('blocks member booking cancellation inside the 1 hour cutoff', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-30T13:10:00.000Z'));
    prisma.booking.findFirst.mockResolvedValue({
      id: 'booking-1',
      userId: 'member-1',
      guestId: 'guest-1',
      status: 'REQUESTED',
      scheduledAt: new Date('2026-06-30T14:00:00.000Z'),
      cancelledAt: null,
    });

    await expect(
      service.cancelMemberBooking(
        { id: 'member-1', role: 'USER' },
        'booking-1',
        { reason: 'Change of plans' },
      ),
    ).rejects.toThrow(
      'Booking can only be cancelled at least 1 hour before scheduled time',
    );

    expect(prisma.booking.update).not.toHaveBeenCalled();
    expect(prisma.auditLog.create).not.toHaveBeenCalled();
    expect(prisma.notificationLog.create).not.toHaveBeenCalled();
    expect(
      adminNotificationService.notifyBookingCancelled,
    ).not.toHaveBeenCalled();
  });

  it('cancels a guest booking by matching the submitted phone', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-30T12:30:00.000Z'));
    prisma.booking.findFirst.mockResolvedValue({
      id: 'booking-1',
      userId: null,
      guestId: 'guest-1',
      status: 'REQUESTED',
      scheduledAt: new Date('2026-06-30T14:00:00.000Z'),
      cancelledAt: null,
    });
    prisma.booking.update.mockResolvedValue({
      id: 'booking-1',
      bookingCode: 'BK-BOOKING-',
      status: 'CANCELLED',
      scheduledAt: new Date('2026-06-30T14:00:00.000Z'),
      cancelledAt: new Date('2026-06-30T12:30:00.000Z'),
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      guest: { id: 'guest-1', displayName: 'Guest', phone: '+84901234567' },
    });
    prisma.auditLog.create.mockResolvedValue({ id: 'audit-1' });

    await service.cancelGuestBooking('booking-1', {
      phone: ' +84901234567 ',
      reason: 'Change of plans',
    });

    expect(prisma.booking.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'booking-1',
          userId: null,
          deletedAt: null,
          guest: { is: { phone: '+84901234567' } },
        },
        select: expect.objectContaining({
          id: true,
          userId: true,
          guestId: true,
          status: true,
          scheduledAt: true,
          cancelledAt: true,
        }),
      }),
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: undefined,
        action: 'BOOKING_CANCELLED',
        targetType: 'Booking',
        targetId: 'booking-1',
        metadata: expect.objectContaining({
          actorType: 'GUEST',
          actorId: null,
          reason: 'Change of plans',
          beforeStatus: 'REQUESTED',
          afterStatus: 'CANCELLED',
        }),
      }),
    });
    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: undefined,
        guestId: 'guest-1',
        storeId: 'store-1',
        bookingId: 'booking-1',
        channel: 'LINE',
        status: 'QUEUED',
        recipient: '+84901234567',
        templateKey: 'customer.booking.cancelled.v1',
        payload: expect.objectContaining({
          bookingId: 'booking-1',
          bookingCode: 'BK-BOOKING-',
          status: 'CANCELLED',
          reason: 'Change of plans',
          actorType: 'GUEST',
        }),
      }),
    });
    expect(
      adminNotificationService.notifyBookingCancelled,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'booking-1',
        status: 'CANCELLED',
      }),
      { reason: 'Change of plans' },
    );
  });

  it('lets admin cancel a customer booking with a reason without the self-service cutoff', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-30T13:30:00.000Z'));
    prisma.booking.findFirst.mockResolvedValue({
      id: 'booking-1',
      storeId: 'store-1',
      userId: 'member-1',
      guestId: 'guest-1',
      status: 'CONFIRMED',
      scheduledAt: new Date('2026-06-30T14:00:00.000Z'),
      cancelledAt: null,
    });
    prisma.booking.update.mockResolvedValue({
      id: 'booking-1',
      bookingCode: 'BK-BOOKING-',
      storeId: 'store-1',
      status: 'CANCELLED',
      scheduledAt: new Date('2026-06-30T14:00:00.000Z'),
      cancelledAt: new Date('2026-06-30T13:30:00.000Z'),
      user: { id: 'member-1', displayName: 'Member', tier: 'REGULAR' },
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      guest: { id: 'guest-1', displayName: 'Guest', phone: '+84901234567' },
    });
    prisma.auditLog.create.mockResolvedValue({ id: 'audit-1' });

    await service.cancelAdminBooking(
      { id: 'admin-1', role: 'ADMIN' },
      'booking-1',
      { reason: 'Customer called admin' },
    );

    expect(accessService.ensureStoreAccess).toHaveBeenCalledWith(
      { id: 'admin-1', role: 'ADMIN' },
      'store-1',
      'booking.cancel',
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: 'admin-1',
        action: 'BOOKING_CANCELLED',
        targetType: 'Booking',
        targetId: 'booking-1',
        metadata: expect.objectContaining({
          actorType: 'ADMIN',
          actorId: 'admin-1',
          reason: 'Customer called admin',
          beforeStatus: 'CONFIRMED',
          afterStatus: 'CANCELLED',
        }),
      }),
    });
    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'member-1',
        bookingId: 'booking-1',
        templateKey: 'customer.booking.cancelled.v1',
        payload: expect.objectContaining({
          actorType: 'ADMIN',
          bookingCode: 'BK-BOOKING-',
          reason: 'Customer called admin',
        }),
      }),
    });
    expect(
      adminNotificationService.notifyBookingCancelled,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'booking-1',
        status: 'CANCELLED',
      }),
      { reason: 'Customer called admin' },
    );
  });

  it('looks up a guest booking by booking code and phone', async () => {
    const booking = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      bookingCode: 'BK-550E8400',
      status: 'REQUESTED',
      scheduledAt: new Date('2026-06-30T14:00:00.000Z'),
      partySize: 2,
      cancelledAt: null,
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      guest: { id: 'guest-1', displayName: 'Guest', phone: '+84901234567' },
    };
    prisma.booking.findMany.mockResolvedValue([booking]);

    await expect(
      service.getGuestBookingByCode('BK-550E8400', ' +84901234567 '),
    ).resolves.toEqual(booking);

    expect(prisma.booking.findMany).toHaveBeenCalledWith({
      where: {
        userId: null,
        deletedAt: null,
        guest: { is: { phone: '+84901234567' } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: expect.objectContaining({
        id: true,
        status: true,
        guest: {
          select: expect.objectContaining({
            id: true,
            displayName: true,
            phone: true,
            email: true,
          }),
        },
      }),
    });
  });

  it('lists member bookings by newest creation time before schedule time', async () => {
    prisma.booking.findMany.mockResolvedValue([] as never);

    await expect(service.listMemberBookings('member-1')).resolves.toEqual([]);

    expect(prisma.booking.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'member-1',
        deletedAt: null,
      },
      orderBy: [{ createdAt: 'desc' }, { scheduledAt: 'desc' }],
      select: expect.objectContaining({
        id: true,
        status: true,
        scheduledAt: true,
        createdAt: true,
        store: {
          select: expect.objectContaining({
            id: true,
            name: true,
            slug: true,
            openingHours: true,
            bookingCancelCutoffMinutes: true,
            media: expect.objectContaining({
              take: 1,
              select: { url: true },
            }),
          }),
        },
        cast: {
          select: expect.objectContaining({
            id: true,
            slug: true,
            stageName: true,
            publicAlias: true,
            media: expect.objectContaining({
              take: 1,
              select: { url: true },
            }),
          }),
        },
      }),
    });
  });

  it('rate-limits repeated member cancellation attempts', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-30T12:30:00.000Z'));
    prisma.booking.findFirst.mockResolvedValue({
      id: 'booking-1',
      userId: 'rate-member-1',
      guestId: 'guest-1',
      status: 'REQUESTED',
      scheduledAt: new Date('2026-06-30T14:00:00.000Z'),
      cancelledAt: null,
    });
    prisma.booking.update.mockResolvedValue({
      id: 'booking-1',
      storeId: 'store-1',
      status: 'CANCELLED',
      scheduledAt: new Date('2026-06-30T14:00:00.000Z'),
      cancelledAt: new Date('2026-06-30T12:30:00.000Z'),
      user: { id: 'rate-member-1', displayName: 'Member', tier: 'REGULAR' },
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      guest: { id: 'guest-1', displayName: 'Guest', phone: '+84901234567' },
    });
    prisma.auditLog.create.mockResolvedValue({ id: 'audit-1' });

    for (let index = 0; index < 5; index += 1) {
      await service.cancelMemberBooking(
        { id: 'rate-member-1', role: 'USER' },
        'booking-1',
        { reason: 'Repeated click' },
      );
    }

    await expect(
      service.cancelMemberBooking(
        { id: 'rate-member-1', role: 'USER' },
        'booking-1',
        { reason: 'Repeated click' },
      ),
    ).rejects.toThrow('Too many cancellation requests');
    expect(prisma.booking.findFirst).toHaveBeenCalledTimes(5);
  });

  it('limits partner stores to their accessible store ids', async () => {
    accessService.getAccessibleStoreIds.mockResolvedValue(['store-a']);
    prisma.store.findMany.mockResolvedValue([
      { id: 'store-a', name: 'Partner A Store' },
    ] as never);

    await service.listPartnerStores({
      id: 'partner-a',
      role: 'PARTNER',
    });

    expect(accessService.getAccessibleStoreIds).toHaveBeenCalledWith(
      { id: 'partner-a', role: 'PARTNER' },
      'store.partner.view',
    );
    expect(prisma.store.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          id: { in: ['store-a'] },
        },
      }),
    );
  });

  it('loads partner listing ward from existing store address data', async () => {
    prisma.store.findFirst.mockResolvedValueOnce({
      id: 'store-a',
      name: 'Partner A Store',
      slug: 'partner-a-store',
      status: 'ACTIVE',
      category: 'CLUB',
      description: 'Night club',
      address: '123 Nguyen Hue, Xã Ngọc Đường, Tỉnh Tuyên Quang',
      city: 'Tỉnh Tuyên Quang',
      district: null,
      phone: '0978654578',
      openingHours: null,
      pricingInfo: null,
      mapUrl: null,
      tags: [],
      partnerAccountId: null,
      ownerId: null,
    });
    prisma.content.findFirst.mockResolvedValueOnce(null);
    prisma.partnerRequest.findFirst.mockResolvedValueOnce(null);

    await expect(
      service.getPartnerListingDraft(
        { id: 'partner-a', role: 'PARTNER' },
        '11111111-1111-4111-8111-111111111111',
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        draft: expect.objectContaining({
          storeCity: 'Tỉnh Tuyên Quang',
          ward: 'Xã Ngọc Đường',
          streetAddress: '123 Nguyen Hue',
          storeAddress: '123 Nguyen Hue, Xã Ngọc Đường, Tỉnh Tuyên Quang',
        }),
      }),
    );
  });

  it('returns a lite partner dashboard with scoped aggregate metrics only', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-03T10:00:00.000Z'));
    const previousArrivalSource = process.env.PARTNER_CUSTOMER_ARRIVAL_SOURCE;
    delete process.env.PARTNER_CUSTOMER_ARRIVAL_SOURCE;
    accessService.getAccessibleStoreIds.mockResolvedValue(['store-a']);
    prisma.store.findMany.mockResolvedValue([
      { id: 'store-a', name: 'Partner A Store', slug: 'partner-a-store' },
    ] as never);
    prisma.cast.findMany.mockResolvedValue([
      { id: 'cast-a', storeId: 'store-a' },
    ] as never);
    prisma.booking.findMany.mockResolvedValue([
      { createdAt: new Date('2026-07-01T20:00:00.000Z') },
      { createdAt: new Date('2026-07-03T21:00:00.000Z') },
    ] as never);
    prisma.booking.count.mockResolvedValueOnce(3).mockResolvedValueOnce(3);
    prisma.auditLog.count.mockResolvedValueOnce(5).mockResolvedValueOnce(5);
    prisma.couponIssue.count.mockResolvedValueOnce(2).mockResolvedValueOnce(2);
    prisma.bill.count.mockResolvedValueOnce(1);

    try {
      const result = await service.getPartnerLiteDashboard(
        { id: 'partner-a', role: 'PARTNER' },
        'seven',
      );

      expect(accessService.getAccessibleStoreIds).toHaveBeenCalledWith(
        { id: 'partner-a', role: 'PARTNER' },
        'store.partner.view',
      );
      expect(prisma.booking.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          deletedAt: null,
          storeId: { in: ['store-a'] },
        }),
      });
      expect(prisma.auditLog.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          action: 'PROFILE_VIEW_RECORDED',
          OR: [
            { targetType: 'STORE', targetId: { in: ['store-a'] } },
            { targetType: 'CAST', targetId: { in: ['cast-a'] } },
          ],
        }),
      });
      expect(result).toEqual(
        expect.objectContaining({
          bookingCount: 3,
          profileViewCount: 5,
          customerArrivalCount: 2,
          customerArrivalSource: 'QR_USED',
          qrUsedCount: 2,
          billApprovedCount: 1,
          storeCount: 1,
          privacy: {
            customerDetailVisible: false,
            note: 'Partner dashboard returns aggregate metrics only.',
          },
        }),
      );
      expect(result.stores).toEqual([
        expect.objectContaining({
          id: 'store-a',
          bookingCount: 3,
          profileViewCount: 5,
          customerArrivalCount: 2,
        }),
      ]);
      expect(JSON.stringify(result)).not.toContain('phone');
      expect(JSON.stringify(result)).not.toContain('email');
      expect(result.weeklyBookings).toHaveLength(7);
    } finally {
      if (previousArrivalSource === undefined) {
        delete process.env.PARTNER_CUSTOMER_ARRIVAL_SOURCE;
      } else {
        process.env.PARTNER_CUSTOMER_ARRIVAL_SOURCE = previousArrivalSource;
      }
    }
  });

  it('can count partner customer arrivals from approved bills', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-03T10:00:00.000Z'));
    const previousArrivalSource = process.env.PARTNER_CUSTOMER_ARRIVAL_SOURCE;
    process.env.PARTNER_CUSTOMER_ARRIVAL_SOURCE = 'BILL_APPROVED';
    accessService.getAccessibleStoreIds.mockResolvedValue(['store-a']);
    prisma.store.findMany.mockResolvedValue([
      { id: 'store-a', name: 'Partner A Store', slug: 'partner-a-store' },
    ] as never);
    prisma.cast.findMany.mockResolvedValue([] as never);
    prisma.booking.findMany.mockResolvedValue([] as never);
    prisma.booking.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);
    prisma.auditLog.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);
    prisma.couponIssue.count.mockResolvedValueOnce(9);
    prisma.bill.count.mockResolvedValueOnce(4).mockResolvedValueOnce(4);

    try {
      const result = await service.getPartnerLiteDashboard({
        id: 'partner-a',
        role: 'PARTNER',
      });

      expect(result.customerArrivalSource).toBe('BILL_APPROVED');
      expect(result.customerArrivalCount).toBe(4);
      expect(result.qrUsedCount).toBe(9);
      expect(result.billApprovedCount).toBe(4);
      expect(result.stores[0]).toEqual(
        expect.objectContaining({
          customerArrivalCount: 4,
        }),
      );
    } finally {
      if (previousArrivalSource === undefined) {
        delete process.env.PARTNER_CUSTOMER_ARRIVAL_SOURCE;
      } else {
        process.env.PARTNER_CUSTOMER_ARRIVAL_SOURCE = previousArrivalSource;
      }
    }
  });

  it('records public profile views without visitor metadata', async () => {
    prisma.store.findFirst.mockResolvedValue({ id: 'store-a' });
    prisma.auditLog.create.mockResolvedValue({ id: 'audit-profile-1' });

    await expect(
      service.recordPublicProfileView({
        targetType: 'STORE',
        targetId: 'store-a',
      }),
    ).resolves.toEqual({ recorded: true });

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        actorId: null,
        action: 'PROFILE_VIEW_RECORDED',
        targetType: 'STORE',
        targetId: 'store-a',
        metadata: {
          source: 'public_profile',
        },
      },
    });
    const createArgs = prisma.auditLog.create.mock.calls[0][0] as {
      data: { metadata: Record<string, unknown> };
    };
    expect(createArgs.data.metadata).not.toHaveProperty('ip');
    expect(createArgs.data.metadata).not.toHaveProperty('device');
    expect(createArgs.data.metadata).not.toHaveProperty('session');
  });

  it('does not add a store filter for admin access', async () => {
    accessService.getAccessibleStoreIds.mockResolvedValue(undefined);
    prisma.bill.findMany.mockResolvedValue([] as never);

    await service.listPartnerBills({
      id: 'admin-1',
      role: 'ADMIN',
    });

    expect(accessService.getAccessibleStoreIds).toHaveBeenCalledWith(
      { id: 'admin-1', role: 'ADMIN' },
      'bill.partner.view',
    );
    expect(prisma.bill.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deletedAt: null },
      }),
    );
  });

  it('lists member bill history with protected evidence media', async () => {
    prisma.bill.findMany.mockResolvedValue([
      {
        id: 'bill-member-1',
        storeId: 'store-1',
        billNumber: 'BILL-20260701-MEMBER01',
        status: 'SUBMITTED',
        submitterType: 'MEMBER',
        totalVnd: 1800000,
        usedAt: new Date('2026-07-01T10:00:00.000Z'),
        store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
        booking: null,
        coupon: null,
        couponIssue: null,
        media: [
          {
            id: 'media-bill-1',
            storageKey: 'bill-proof.png',
            originalName: 'bill-proof.png',
            mimeType: 'image/png',
            access: 'PROTECTED',
            url: 'http://localhost:3001/storage/files/bill-proof.png',
          },
        ],
      },
    ] as never);

    await expect(
      service.listMemberBills({ id: 'member-1', role: 'USER' }),
    ).resolves.toEqual([
      expect.objectContaining({
        id: 'bill-member-1',
        submitterType: 'MEMBER',
        media: [
          expect.objectContaining({
            id: 'media-bill-1',
            access: 'PROTECTED',
          }),
        ],
      }),
    ]);

    expect(prisma.bill.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          OR: [{ userId: 'member-1' }, { submittedByUserId: 'member-1' }],
        },
        select: expect.objectContaining({
          submitterType: true,
          media: expect.objectContaining({
            select: expect.objectContaining({ access: true, url: true }),
          }),
        }),
      }),
    );
  });

  it('rejects independent guest coupon claim after the Booking QR scope change', async () => {
    await expect(
      service.claimGuestCoupon('coupon-1', {
        email: 'GUEST@example.com',
        phone: '+84901234567',
      }),
    ).rejects.toThrow('Independent coupon claim is not part of MVP v3.2');
    expect(prisma.couponIssue.create).not.toHaveBeenCalled();
    return;

    prisma.coupon.findFirst.mockResolvedValue({
      id: 'coupon-1',
      code: 'WELCOME',
      name: 'Welcome',
      storeId: 'store-1',
      discountType: 'PERCENT',
      discountValue: 5,
      maxDiscountVnd: 500000,
      minSpendVnd: null,
      endsAt: null,
      usageLimit: null,
      usedCount: 0,
      store: { id: 'store-1', name: 'Store', slug: 'store' },
    });
    prisma.guest.create.mockResolvedValue({ id: 'guest-1' });
    prisma.couponIssue.create.mockResolvedValue({
      id: 'issue-1',
      code: 'GUEST-code',
      status: 'ISSUED',
      coupon: { id: 'coupon-1', code: 'WELCOME', name: 'Welcome' },
    });

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
          metadata: expect.objectContaining({
            recipientType: 'GUEST',
            userType: 'GUEST',
            validityHours: 24,
            statusLabel: 'Đang giữ chỗ',
            discountPercent: 5,
            discountRuleSnapshot: expect.objectContaining({
              type: 'PERCENT',
              value: 5,
              discountPercent: 5,
              userType: 'GUEST',
              tier: null,
              sourceType: 'PERCENT',
              sourceValue: 5,
            }),
            qrPayload: expect.stringContaining('scanToken='),
            campaignSnapshot: expect.objectContaining({
              id: 'coupon-1',
              code: 'WELCOME',
              storeId: 'store-1',
            }),
          }),
          qrPayloadHash: expect.any(String),
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

  it('keeps independent guest coupon expiry disabled after Booking QR scope change', async () => {
    await expect(
      service.claimGuestCoupon('coupon-1', { phone: '+84901234567' }),
    ).rejects.toThrow('Independent coupon claim is not part of MVP v3.2');
    expect(prisma.couponIssue.create).not.toHaveBeenCalled();
    return;

    const now = new Date();
    const couponEndsAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    prisma.coupon.findFirst.mockResolvedValue({
      id: 'coupon-1',
      code: 'WELCOME',
      name: 'Welcome',
      storeId: 'store-1',
      discountType: 'PERCENT',
      discountValue: 5,
      maxDiscountVnd: 500000,
      minSpendVnd: null,
      endsAt: couponEndsAt,
      usageLimit: null,
      usedCount: 0,
      store: { id: 'store-1', name: 'Store', slug: 'store' },
    });
    prisma.guest.create.mockResolvedValue({ id: 'guest-1' });
    prisma.couponIssue.create.mockResolvedValue({ id: 'issue-1' });

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

  it('keeps independent guest coupon end-date capping disabled after Booking QR scope change', async () => {
    await expect(
      service.claimGuestCoupon('coupon-1', { phone: '+84901234567' }),
    ).rejects.toThrow('Independent coupon claim is not part of MVP v3.2');
    expect(prisma.couponIssue.create).not.toHaveBeenCalled();
    return;

    const now = new Date();
    const couponEndsAt = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    prisma.coupon.findFirst.mockResolvedValue({
      id: 'coupon-1',
      code: 'WELCOME',
      name: 'Welcome',
      storeId: 'store-1',
      discountType: 'PERCENT',
      discountValue: 5,
      maxDiscountVnd: 500000,
      minSpendVnd: null,
      endsAt: couponEndsAt,
      usageLimit: null,
      usedCount: 0,
      store: { id: 'store-1', name: 'Store', slug: 'store' },
    });
    prisma.guest.create.mockResolvedValue({ id: 'guest-1' });
    prisma.couponIssue.create.mockResolvedValue({ id: 'issue-1' });

    await service.claimGuestCoupon('coupon-1', { phone: '+84901234567' });

    const createArgs = prisma.couponIssue.create.mock.calls[0][0] as {
      data: { expiresAt: Date };
    };
    expect(createArgs.data.expiresAt.getTime()).toBe(couponEndsAt.getTime());
  });

  it('rejects independent member coupon claim after the Booking QR scope change', async () => {
    await expect(
      service.claimMemberCoupon('coupon-1', {
        id: 'user-1',
        role: 'USER',
        tier: 'VIP',
      }),
    ).rejects.toThrow('Independent coupon claim is not part of MVP v3.2');
    expect(prisma.couponIssue.create).not.toHaveBeenCalled();
    return;

    prisma.coupon.findFirst.mockResolvedValue({
      id: 'coupon-1',
      code: 'MEMBER8',
      name: 'Member',
      storeId: 'store-1',
      discountType: 'PERCENT',
      discountValue: 8,
      maxDiscountVnd: 800000,
      minSpendVnd: null,
      endsAt: null,
      usageLimit: null,
      usedCount: 0,
      store: { id: 'store-1', name: 'Store', slug: 'store' },
    });
    prisma.couponIssue.create.mockResolvedValue({ id: 'issue-1' });

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
            userType: 'VIP',
            tier: 'VIP',
            validityDays: 7,
            statusLabel: 'Đang giữ chỗ',
            discountPercent: 10,
            qrPayload: expect.stringContaining('scanToken='),
            campaignSnapshot: expect.objectContaining({
              id: 'coupon-1',
              code: 'MEMBER8',
              storeId: 'store-1',
            }),
            discountRuleSnapshot: expect.objectContaining({
              type: 'PERCENT',
              value: 10,
              discountPercent: 10,
              maxDiscountVnd: 800000,
              minSpendVnd: null,
              userType: 'VIP',
              tier: 'VIP',
              sourceType: 'PERCENT',
              sourceValue: 8,
            }),
          }),
          qrPayloadHash: expect.any(String),
        }),
      }),
    );
  });

  it('keeps independent regular member coupon claim disabled after Booking QR scope change', async () => {
    await expect(
      service.claimMemberCoupon('coupon-1', {
        id: 'user-1',
        role: 'USER',
        tier: 'FREE',
      }),
    ).rejects.toThrow('Independent coupon claim is not part of MVP v3.2');
    expect(prisma.couponIssue.create).not.toHaveBeenCalled();
    return;

    prisma.coupon.findFirst.mockResolvedValue({
      id: 'coupon-1',
      code: 'MEMBER8',
      name: 'Member',
      storeId: 'store-1',
      discountType: 'PERCENT',
      discountValue: 8,
      maxDiscountVnd: 800000,
      minSpendVnd: null,
      endsAt: null,
      usageLimit: null,
      usedCount: 0,
      store: { id: 'store-1', name: 'Store', slug: 'store' },
    });
    prisma.couponIssue.create.mockResolvedValue({ id: 'issue-1' });

    await service.claimMemberCoupon('coupon-1', {
      id: 'user-1',
      role: 'USER',
      tier: 'FREE',
    });

    expect(prisma.couponIssue.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          metadata: expect.objectContaining({
            userType: 'MEMBER',
            tier: 'FREE',
            discountPercent: 8,
            discountRuleSnapshot: expect.objectContaining({
              type: 'PERCENT',
              value: 8,
              discountPercent: 8,
              userType: 'MEMBER',
              tier: 'FREE',
              sourceValue: 8,
            }),
          }),
        }),
      }),
    );
  });

  it('creates a Booking QR coupon issue from a guest booking and expires it from scheduledAt', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-01T10:00:00.000Z'));
    const scheduledAt = new Date('2026-07-05T20:00:00.000Z');
    prisma.store.findFirst.mockResolvedValue({
      id: 'store-1',
      name: 'Neon Club',
      slug: 'neon-club',
    });
    prisma.coupon.findFirst.mockResolvedValue({
      id: 'coupon-1',
      code: 'WELCOME',
      name: 'Welcome',
      storeId: 'store-1',
      discountType: 'PERCENT',
      discountValue: 5,
      maxDiscountVnd: 500000,
      minSpendVnd: null,
      endsAt: null,
      usageLimit: null,
      usedCount: 0,
      store: { id: 'store-1', name: 'Store', slug: 'store' },
    });
    prisma.guest.create.mockResolvedValue({ id: 'guest-1' });
    prisma.couponIssue.create.mockResolvedValue({
      id: 'issue-1',
      code: 'GUEST-code',
      couponId: 'coupon-1',
      status: 'ISSUED',
      metadata: {},
      coupon: { storeId: 'store-1' },
    });
    prisma.booking.create.mockResolvedValue({
      id: 'booking-1',
      storeId: 'store-1',
      status: 'REQUESTED',
      scheduledAt,
      partySize: 4,
      guest: {
        id: 'guest-1',
        displayName: 'Guest Name',
        phone: '+84901234567',
        email: null,
      },
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      coupon: { id: 'coupon-1', code: 'WELCOME', name: 'Welcome' },
      couponIssue: {
        id: 'issue-1',
        code: 'GUEST-code',
        status: 'ISSUED',
      },
    });

    await service.createGuestBooking({
      storeSlug: 'neon-club',
      couponId: 'coupon-1',
      displayName: 'Guest Name',
      phone: '+84901234567',
      scheduledAt: scheduledAt.toISOString(),
      partySize: 4,
    });

    const createArgs = prisma.couponIssue.create.mock.calls[0][0] as {
      data: { expiresAt: Date; metadata: Record<string, unknown> };
    };
    expect(createArgs.data.expiresAt.toISOString()).toBe(
      '2026-07-06T20:00:00.000Z',
    );
    expect(createArgs.data.metadata).toEqual(
      expect.objectContaining({
        sourceFlow: 'BOOKING_QR',
        recipientType: 'GUEST',
        userType: 'GUEST',
        validityHours: 24,
        expiresFrom: 'BOOKING_SCHEDULED_AT',
        bookingScheduledAt: scheduledAt.toISOString(),
        qrPayload: expect.stringContaining('scanToken='),
        campaignSnapshot: expect.objectContaining({
          id: 'coupon-1',
          code: 'WELCOME',
          storeId: 'store-1',
        }),
      }),
    );
    expect(prisma.booking.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          couponId: 'coupon-1',
          couponIssueId: 'issue-1',
        }),
      }),
    );
  });

  it('records Booking QR claim analytics and fraud signals with request context', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-01T10:00:00.000Z'));
    const scheduledAt = new Date('2026-07-05T20:00:00.000Z');
    prisma.store.findFirst.mockResolvedValue({
      id: 'store-1',
      name: 'Neon Club',
      slug: 'neon-club',
    });
    prisma.coupon.findFirst.mockResolvedValue({
      id: 'coupon-1',
      code: 'WELCOME',
      name: 'Welcome',
      storeId: 'store-1',
      discountType: 'PERCENT',
      discountValue: 5,
      maxDiscountVnd: 500000,
      minSpendVnd: null,
      endsAt: null,
      usageLimit: null,
      usedCount: 0,
      store: { id: 'store-1', name: 'Store', slug: 'store' },
    });
    prisma.guest.create.mockResolvedValue({ id: 'guest-1' });
    prisma.couponIssue.create.mockResolvedValue({
      id: 'issue-1',
      code: 'GUEST-code',
      couponId: 'coupon-1',
      status: 'ISSUED',
      metadata: {},
      coupon: { storeId: 'store-1' },
    });
    prisma.booking.create.mockResolvedValue({
      id: 'booking-1',
      storeId: 'store-1',
      status: 'REQUESTED',
      scheduledAt,
      partySize: 4,
      guest: {
        id: 'guest-1',
        displayName: 'Guest Name',
        phone: '+84901234567',
        email: null,
      },
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      couponIssue: {
        id: 'issue-1',
        code: 'GUEST-code',
        status: 'ISSUED',
      },
    });

    await service.createGuestBooking(
      {
        storeSlug: 'neon-club',
        couponId: 'coupon-1',
        displayName: 'Guest Name',
        phone: '+84901234567',
        scheduledAt: scheduledAt.toISOString(),
        partySize: 4,
      },
      {
        ip: '203.0.113.10',
        userAgent: 'NightLife Test Browser',
        deviceId: 'device-1',
        sessionId: 'session-1',
      },
    );

    expect(prisma.notificationLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          recipient: 'phone:+84901234567',
          templateKey: 'coupon.analytics.claimed.v1',
          payload: expect.objectContaining({
            couponId: 'coupon-1',
            couponIssueId: 'issue-1',
            context: expect.objectContaining({
              ip: '203.0.113.10',
              deviceId: 'device-1',
              sessionId: 'session-1',
            }),
          }),
        }),
      }),
    );
    expect(prisma.notificationLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          recipient: expect.stringMatching(/^coupon:fraud:ip:/),
          templateKey: 'coupon.fraud.claim_signal.v1',
          payload: expect.objectContaining({
            signalKind: 'IP',
            couponIssueId: 'issue-1',
          }),
        }),
      }),
    );
    expect(prisma.notificationLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          recipient: expect.stringMatching(/^coupon:fraud:device:/),
          templateKey: 'coupon.fraud.claim_signal.v1',
        }),
      }),
    );
    expect(prisma.notificationLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          recipient: expect.stringMatching(/^coupon:fraud:session:/),
          templateKey: 'coupon.fraud.claim_signal.v1',
        }),
      }),
    );
  });

  it('raises a fraud alert when Booking QR claims burst from the same IP signal', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-01T10:00:00.000Z'));
    const scheduledAt = new Date('2026-07-05T20:00:00.000Z');
    const ipSignal = `coupon:fraud:ip:${createHash('sha256')
      .update('203.0.113.10')
      .digest('hex')
      .slice(0, 16)}`;
    prisma.notificationLog.findMany.mockImplementation((args: unknown) => {
      const where = (args as { where?: { templateKey?: string } }).where;
      if (where?.templateKey === 'coupon.fraud.claim_signal.v1') {
        return Promise.resolve(
          Array.from({ length: 5 }, (_, index) => ({
            id: `signal-${index}`,
            recipient: ipSignal,
          })),
        ) as never;
      }

      return Promise.resolve([]) as never;
    });
    prisma.store.findFirst.mockResolvedValue({
      id: 'store-1',
      name: 'Neon Club',
      slug: 'neon-club',
    });
    prisma.coupon.findFirst.mockResolvedValue({
      id: 'coupon-1',
      code: 'WELCOME',
      name: 'Welcome',
      storeId: 'store-1',
      discountType: 'PERCENT',
      discountValue: 5,
      maxDiscountVnd: 500000,
      minSpendVnd: null,
      endsAt: null,
      usageLimit: null,
      usedCount: 0,
      store: { id: 'store-1', name: 'Store', slug: 'store' },
    });
    prisma.guest.create.mockResolvedValue({ id: 'guest-1' });
    prisma.couponIssue.create.mockResolvedValue({
      id: 'issue-1',
      code: 'GUEST-code',
      couponId: 'coupon-1',
      status: 'ISSUED',
      metadata: {},
      coupon: { storeId: 'store-1' },
    });
    prisma.booking.create.mockResolvedValue({
      id: 'booking-1',
      storeId: 'store-1',
      status: 'REQUESTED',
      scheduledAt,
      partySize: 4,
      guest: {
        id: 'guest-1',
        displayName: 'Guest Name',
        phone: '+84901234567',
        email: null,
      },
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      couponIssue: {
        id: 'issue-1',
        code: 'GUEST-code',
        status: 'ISSUED',
      },
    });

    await service.createGuestBooking(
      {
        storeSlug: 'neon-club',
        couponId: 'coupon-1',
        displayName: 'Guest Name',
        phone: '+84901234567',
        scheduledAt: scheduledAt.toISOString(),
        partySize: 4,
      },
      { ip: '203.0.113.10' },
    );

    expect(prisma.notificationLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          recipient: 'admin',
          templateKey: 'coupon.fraud.claim_burst.v1',
          payload: expect.objectContaining({
            suspiciousSignals: [
              expect.objectContaining({
                kind: 'IP',
                count: 5,
              }),
            ],
          }),
        }),
      }),
    );
  });

  it('accepts previous QR secrets during token rotation', () => {
    const originalSecret = process.env.COUPON_QR_SECRET;
    const originalPreviousSecrets = process.env.COUPON_QR_PREVIOUS_SECRETS;
    process.env.COUPON_QR_SECRET = 'current-secret';
    process.env.COUPON_QR_PREVIOUS_SECRETS = 'previous-secret';
    const encodedPayload = Buffer.from(
      JSON.stringify({
        v: 1,
        type: 'coupon_issue',
        issueId: 'issue-rotated',
      }),
    ).toString('base64url');
    const signature = createHmac('sha256', 'previous-secret')
      .update(encodedPayload)
      .digest('base64url');

    try {
      const qrService = service as unknown as {
        resolveCouponIssueIdFromQrPayload(payload: string): string;
      };
      expect(
        qrService.resolveCouponIssueIdFromQrPayload(
          `https://nightlife.vn/partner?scanToken=${encodedPayload}.${signature}`,
        ),
      ).toBe('issue-rotated');
    } finally {
      if (originalSecret === undefined) {
        delete process.env.COUPON_QR_SECRET;
      } else {
        process.env.COUPON_QR_SECRET = originalSecret;
      }
      if (originalPreviousSecrets === undefined) {
        delete process.env.COUPON_QR_PREVIOUS_SECRETS;
      } else {
        process.env.COUPON_QR_PREVIOUS_SECRETS = originalPreviousSecrets;
      }
    }
  });

  it('fails closed without a production QR secret', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalSecret = process.env.COUPON_QR_SECRET;
    delete process.env.COUPON_QR_SECRET;
    process.env.NODE_ENV = 'production';

    try {
      const qrService = service as unknown as {
        buildCouponQrPayload(issueId: string): string;
      };
      expect(() => qrService.buildCouponQrPayload('issue-no-secret')).toThrow(
        'COUPON_QR_SECRET is required in production for Booking QR signing.',
      );
    } finally {
      if (originalNodeEnv === undefined) {
        delete process.env.NODE_ENV;
      } else {
        process.env.NODE_ENV = originalNodeEnv;
      }
      if (originalSecret === undefined) {
        delete process.env.COUPON_QR_SECRET;
      } else {
        process.env.COUPON_QR_SECRET = originalSecret;
      }
    }
  });

  it('scans a coupon issue only after store access and without guest phone', async () => {
    prisma.couponIssue.findUnique.mockResolvedValue({
      id: 'issue-1',
      couponId: 'coupon-1',
      code: 'GUEST-code',
      guestId: 'guest-1',
      userId: null,
      status: 'ISSUED',
      expiresAt: null,
      usedAt: null,
      metadata: { userType: 'GUEST', discountPercent: 5 },
      booking: null,
      coupon: {
        id: 'coupon-1',
        code: 'GUEST5',
        name: 'Guest',
        storeId: 'store-1',
        store: { id: 'store-1', name: 'Store', slug: 'store' },
      },
    });
    prisma.couponIssue.update.mockResolvedValue({
      id: 'issue-1',
      couponId: 'coupon-1',
      code: 'GUEST-code',
      guestId: 'guest-1',
      userId: null,
      status: 'ISSUED',
      expiresAt: null,
      usedAt: null,
      metadata: { userType: 'GUEST', discountPercent: 5 },
      booking: null,
      coupon: {
        id: 'coupon-1',
        code: 'GUEST5',
        name: 'Guest',
        discountType: 'PERCENT',
        discountValue: 5,
        maxDiscountVnd: null,
        minSpendVnd: null,
        store: { id: 'store-1', name: 'Store', slug: 'store' },
      },
    });

    const result = await service.scanCouponIssue('GUEST-code', {
      id: 'partner-1',
      role: 'PARTNER',
    });

    expect(accessService.ensureStoreAccess).toHaveBeenCalledWith(
      { id: 'partner-1', role: 'PARTNER' },
      'store-1',
      'coupon.scan',
    );
    expect(prisma.couponIssue.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { scannedById: 'partner-1' },
      }),
    );
    const updateArgs = prisma.couponIssue.update.mock.calls[0][0] as {
      select: Record<string, unknown>;
    };
    expect(updateArgs.select).not.toHaveProperty('user');
    expect(updateArgs.select).not.toHaveProperty('guest');
    expect(result).toMatchObject({
      id: 'issue-1',
      code: 'GUEST-code',
      status: 'ISSUED',
      customer: { type: 'GUEST', label: 'Khách vãng lai' },
    });
    expect(result).not.toHaveProperty('user');
    expect(result).not.toHaveProperty('guest');
  });

  it('rejects a partner scanning a coupon issue from another store', async () => {
    prisma.couponIssue.findUnique.mockResolvedValue({
      id: 'issue-2',
      couponId: 'coupon-2',
      code: 'OTHER-store-code',
      guestId: 'guest-2',
      userId: null,
      status: 'ISSUED',
      expiresAt: null,
      usedAt: null,
      metadata: { userType: 'GUEST' },
      booking: null,
      coupon: {
        id: 'coupon-2',
        code: 'OTHER5',
        name: 'Other store coupon',
        storeId: 'store-2',
        store: { id: 'store-2', name: 'Other Store', slug: 'other-store' },
      },
    });
    accessService.ensureStoreAccess.mockRejectedValueOnce(
      new ForbiddenException('No access to this store'),
    );

    await expect(
      service.scanCouponIssue('OTHER-store-code', {
        id: 'partner-1',
        role: 'PARTNER',
      }),
    ).rejects.toThrow('No access to this store');

    expect(accessService.ensureStoreAccess).toHaveBeenCalledWith(
      { id: 'partner-1', role: 'PARTNER' },
      'store-2',
      'coupon.scan',
    );
    expect(prisma.couponIssue.update).not.toHaveBeenCalled();
    expect(prisma.auditLog.create).not.toHaveBeenCalled();
    expect(prisma.notificationLog.create).not.toHaveBeenCalled();
  });

  it('scans an AdminCouponIssue successfully', async () => {
    prisma.couponIssue.findUnique.mockResolvedValue(null);
    prisma.adminCouponIssue.findUnique.mockResolvedValue({
      id: 'admin-issue-1',
      adminCouponId: 'admin-coupon-1',
      code: 'GLOBAL20-code',
      userId: 'member-1',
      status: 'ISSUED',
      expiresAt: null,
      metadata: { recipientType: 'MEMBER' },
      adminCoupon: {
        id: 'admin-coupon-1',
        code: 'GLOBAL20',
        name: 'Global 20%',
        discountType: 'PERCENT',
        discountValue: 20,
        targetStores: [],
      },
      store: null,
    });
    prisma.adminCouponIssue.findFirst.mockResolvedValue({
      id: 'admin-issue-1',
      adminCouponId: 'admin-coupon-1',
      code: 'GLOBAL20-code',
      userId: 'member-1',
      status: 'ISSUED',
      expiresAt: null,
      metadata: { recipientType: 'MEMBER' },
      adminCoupon: {
        id: 'admin-coupon-1',
        code: 'GLOBAL20',
        name: 'Global 20%',
        discountType: 'PERCENT',
        discountValue: 20,
        targetStores: [],
      },
      store: null,
    });
    accessService.getAccessibleStoreIds.mockResolvedValue(['store-1']);
    prisma.adminCouponIssue.update.mockResolvedValue({
      id: 'admin-issue-1',
      adminCouponId: 'admin-coupon-1',
      code: 'GLOBAL20-code',
      userId: 'member-1',
      status: 'ISSUED',
      expiresAt: null,
      metadata: { recipientType: 'MEMBER' },
      adminCoupon: {
        id: 'admin-coupon-1',
        code: 'GLOBAL20',
        name: 'Global 20%',
        discountType: 'PERCENT',
        discountValue: 20,
        targetStores: [],
      },
      store: null,
    });

    const result = await service.scanCouponIssue('GLOBAL20-code', {
      id: 'partner-1',
      role: 'PARTNER',
    });

    expect(accessService.getAccessibleStoreIds).toHaveBeenCalledWith(
      { id: 'partner-1', role: 'PARTNER' },
      'coupon.scan',
    );
    expect(prisma.adminCouponIssue.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'admin-issue-1' },
        data: { scannedByUserId: 'partner-1', storeId: 'store-1' },
      }),
    );
    expect(result).toMatchObject({
      id: 'admin-issue-1',
      code: 'GLOBAL20-code',
      status: 'ISSUED',
      customer: { type: 'MEMBER', label: 'Hội viên' },
      coupon: expect.objectContaining({
        code: 'GLOBAL20',
        discountValue: 20,
      }),
    });
  });

  it('marks an expired coupon issue before rejecting QR scan', async () => {
    prisma.couponIssue.findUnique.mockResolvedValue({
      id: 'issue-1',
      couponId: 'coupon-1',
      code: 'GUEST-code',
      guestId: 'guest-1',
      userId: null,
      status: 'ISSUED',
      expiresAt: new Date(Date.now() - 60_000),
      usedAt: null,
      metadata: { userType: 'GUEST' },
      booking: null,
      coupon: {
        id: 'coupon-1',
        code: 'GUEST5',
        name: 'Guest',
        storeId: 'store-1',
        store: { id: 'store-1', name: 'Store', slug: 'store' },
      },
    });
    prisma.couponIssue.updateMany.mockResolvedValue({ count: 1 });

    await expect(
      service.scanCouponIssue('GUEST-code', {
        id: 'partner-1',
        role: 'PARTNER',
      }),
    ).rejects.toThrow('Coupon issue has expired');

    expect(accessService.ensureStoreAccess).toHaveBeenCalledWith(
      { id: 'partner-1', role: 'PARTNER' },
      'store-1',
      'coupon.scan',
    );
    expect(prisma.couponIssue.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'issue-1',
        status: 'ISSUED',
        expiresAt: { lte: expect.any(Date) },
      },
      data: { status: 'EXPIRED' },
    });
    expect(prisma.couponIssue.update).not.toHaveBeenCalled();
  });

  it('confirms check-in by using a coupon issue and updating linked booking', async () => {
    prisma.couponIssue.findUnique
      .mockResolvedValueOnce({
        id: 'issue-1',
        code: 'GUEST-code',
        couponId: 'coupon-1',
        userId: 'member-1',
        guestId: 'guest-1',
        status: 'ISSUED',
        expiresAt: null,
        usedAt: null,
        scannedById: null,
        metadata: { userType: 'VIP', discountPercent: 10 },
        coupon: { storeId: 'store-1' },
        booking: {
          id: 'booking-1',
          userId: 'member-1',
          guestId: 'guest-1',
          status: 'CONFIRMED',
          scheduledAt: new Date('2026-06-30T14:00:00.000Z'),
          cancelledAt: null,
        },
      })
      .mockResolvedValueOnce({
        id: 'issue-1',
        couponId: 'coupon-1',
        code: 'GUEST-code',
        userId: 'member-1',
        guestId: 'guest-1',
        status: 'USED',
        expiresAt: null,
        usedAt: new Date(),
        scannedById: 'partner-1',
        metadata: { userType: 'VIP', discountPercent: 10 },
        coupon: {
          id: 'coupon-1',
          code: 'GUEST5',
          name: 'Guest',
          store: { id: 'store-1', name: 'Store', slug: 'store' },
        },
      });
    prisma.couponIssue.updateMany.mockResolvedValue({ count: 1 });
    prisma.coupon.update.mockResolvedValue({ id: 'coupon-1' });
    prisma.booking.update.mockResolvedValue({
      id: 'booking-1',
      bookingCode: 'BK-BOOKING-',
      storeId: 'store-1',
      status: 'CHECKED_IN',
      scheduledAt: new Date('2026-06-30T14:00:00.000Z'),
      cancelledAt: null,
      user: { id: 'member-1', displayName: 'Member', tier: 'REGULAR' },
      store: { id: 'store-1', name: 'Store', slug: 'store' },
      guest: { id: 'guest-1', displayName: 'Guest', phone: '+84901234567' },
    });

    const result = await service.confirmCouponIssueCheckIn('issue-1', {
      id: 'partner-1',
      role: 'PARTNER',
    });

    expect(accessService.ensureStoreAccess).toHaveBeenCalledWith(
      { id: 'partner-1', role: 'PARTNER' },
      'store-1',
      'checkin.confirm',
    );
    expect(prisma.couponIssue.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'issue-1',
          status: 'ISSUED',
        }),
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
    expect(prisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'booking-1' },
        data: { status: 'CHECKED_IN' },
      }),
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: 'partner-1',
        action: 'COUPON_ISSUE_USED',
        targetType: 'CouponIssue',
        targetId: 'issue-1',
        beforeJson: expect.objectContaining({
          id: 'issue-1',
          status: 'ISSUED',
          couponId: 'coupon-1',
        }),
        afterJson: expect.objectContaining({
          id: 'issue-1',
          status: 'USED',
          couponId: 'coupon-1',
          scannedById: 'partner-1',
        }),
        metadata: expect.objectContaining({
          actorId: 'partner-1',
          action: 'COUPON_ISSUE_USED',
          ref_id: 'issue-1',
          occurredAt: expect.any(String),
          source: 'PARTNER_CONFIRM_CHECK_IN',
          couponId: 'coupon-1',
          previousStatus: 'ISSUED',
          nextStatus: 'USED',
        }),
      }),
    });
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: 'partner-1',
        action: 'BOOKING_STATUS_CHANGED',
        targetType: 'Booking',
        targetId: 'booking-1',
        metadata: expect.objectContaining({
          actorType: 'PARTNER',
          reason: 'Coupon check-in confirmed',
          beforeStatus: 'CONFIRMED',
          afterStatus: 'CHECKED_IN',
        }),
      }),
    });
    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'member-1',
        guestId: 'guest-1',
        storeId: 'store-1',
        recipient: 'couponIssue:issue-1',
        templateKey: 'coupon.issue.used.v1',
        payload: expect.objectContaining({
          actorId: 'partner-1',
          action: 'COUPON_ISSUE_USED',
          ref_id: 'issue-1',
          occurredAt: expect.any(String),
          couponIssueId: 'issue-1',
          status: 'USED',
          source: 'PARTNER_CONFIRM_CHECK_IN',
        }),
      }),
    });
    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'member-1',
        bookingId: 'booking-1',
        templateKey: 'customer.booking.checked_in.v1',
        payload: expect.objectContaining({
          bookingId: 'booking-1',
          bookingCode: 'BK-BOOKING-',
        }),
      }),
    });
    expect(result).toMatchObject({
      id: 'issue-1',
      status: 'USED',
      customer: { type: 'VIP', label: 'Hội viên VIP' },
    });
    expect(result).not.toHaveProperty('user');
    expect(result).not.toHaveProperty('guest');
  });

  it('does not reuse a coupon issue when the one-time update loses the race', async () => {
    prisma.couponIssue.findUnique.mockResolvedValue({
      id: 'issue-1',
      couponId: 'coupon-1',
      status: 'ISSUED',
      expiresAt: null,
      coupon: { storeId: 'store-1' },
      booking: null,
    });
    prisma.couponIssue.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.confirmCouponIssueCheckIn('issue-1', {
        id: 'partner-1',
        role: 'PARTNER',
      }),
    ).rejects.toThrow('Coupon issue has already been used');

    expect(prisma.coupon.update).not.toHaveBeenCalled();
    expect(prisma.booking.update).not.toHaveBeenCalled();
  });

  it('expires stale member coupon issues before returning the wallet', async () => {
    prisma.couponIssue.findMany.mockResolvedValue([
      {
        id: 'issue-1',
        code: 'MEMBER-code',
        status: 'EXPIRED',
        expiresAt: new Date(Date.now() - 60_000),
        usedAt: null,
        metadata: {
          userType: 'MEMBER',
          qrPayload: 'MEMBER-code',
          discountPercent: 8,
          discountRuleSnapshot: {
            type: 'PERCENT',
            value: 8,
            discountPercent: 8,
          },
        },
        coupon: {
          id: 'coupon-1',
          code: 'MEMBER8',
          name: 'Member',
          discountType: 'PERCENT',
          discountValue: 8,
          maxDiscountVnd: 800000,
          minSpendVnd: null,
          store: { id: 'store-1', name: 'Store', slug: 'store' },
        },
      },
    ] as never);

    await expect(service.listMemberCouponIssues('user-1')).resolves.toEqual([
      expect.objectContaining({
        id: 'issue-1',
        status: 'EXPIRED',
        statusLabel: 'Hết hạn',
        qrPayload: 'MEMBER-code',
        userType: 'MEMBER',
        discountPercent: 8,
      }),
    ]);

    expect(prisma.couponIssue.updateMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        status: 'ISSUED',
        expiresAt: { lte: expect.any(Date) },
      },
      data: { status: 'EXPIRED' },
    });
  });

  it('expires issued coupon issues from the scheduled maintenance job', async () => {
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    prisma.couponIssue.updateMany.mockResolvedValueOnce({
      count: 3,
    });

    await expect(service.expireCouponIssuesEveryFiveMinutes()).resolves.toEqual(
      { count: 3 },
    );

    expect(prisma.couponIssue.updateMany).toHaveBeenCalledWith({
      where: {
        status: 'ISSUED',
        expiresAt: { lte: expect.any(Date) },
      },
      data: { status: 'EXPIRED' },
    });
    expect(logSpy).toHaveBeenCalledWith(
      'Expired 3 coupon issue(s) from scheduled maintenance.',
    );
    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        recipient: 'system',
        templateKey: 'coupon.issue.expired.v1',
        payload: expect.objectContaining({
          expiredCount: 3,
        }),
      }),
    });
    logSpy.mockRestore();
  });

  it('does not write maintenance logs when no coupon issue expires', async () => {
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    prisma.couponIssue.updateMany.mockResolvedValueOnce({
      count: 0,
    });

    await expect(service.expireCouponIssuesEveryFiveMinutes()).resolves.toEqual(
      { count: 0 },
    );

    expect(logSpy).not.toHaveBeenCalled();
    expect(prisma.notificationLog.create).not.toHaveBeenCalled();
    logSpy.mockRestore();
  });

  it('lists admin coupon issues by store, coupon, and status', async () => {
    prisma.couponIssue.findMany.mockResolvedValue([
      {
        id: 'issue-1',
        code: 'MEMBER-code',
        status: 'ISSUED',
        qrPayloadHash: 'hash-issued-1',
        expiresAt: null,
        usedAt: null,
        createdAt: new Date('2026-06-30T10:00:00.000Z'),
        metadata: {
          qrPayload:
            'https://nightlife.vn/partner?scanToken=opaque-token.signature',
          discountPercent: 8,
          campaignSnapshot: {
            id: 'coupon-1',
            code: 'MEMBER8',
            name: 'Member',
            storeId: 'store-1',
          },
        },
        user: { id: 'user-1', displayName: 'Member', tier: 'FREE' },
        guest: null,
        scannedBy: null,
        booking: {
          id: 'booking-1',
          status: 'CONFIRMED',
          scheduledAt: new Date('2026-07-01T14:00:00.000Z'),
        },
        bill: {
          id: 'bill-1',
          billNumber: 'BILL-20260701-ABC12345',
          status: 'SUBMITTED',
          totalVnd: 1800000,
        },
        coupon: {
          id: 'coupon-1',
          code: 'MEMBER8',
          name: 'Member',
          discountType: 'PERCENT',
          discountValue: 8,
          maxDiscountVnd: 800000,
          minSpendVnd: null,
          store: { id: 'store-1', name: 'Store', slug: 'store' },
        },
      },
    ] as never);
    prisma.auditLog.findMany.mockResolvedValue([
      {
        id: 'audit-1',
        action: 'COUPON_ISSUE_SCANNED',
        actorId: 'partner-1',
        targetId: 'issue-1',
        metadata: { source: 'signed_qr' },
        beforeJson: null,
        afterJson: { status: 'ISSUED' },
        createdAt: new Date('2026-06-30T10:05:00.000Z'),
        actor: {
          id: 'partner-1',
          displayName: 'Partner Staff',
          role: 'PARTNER',
        },
      },
    ] as never);

    await expect(
      service.listAdminCouponIssues({
        storeId: 'store-1',
        couponId: 'coupon-1',
        status: 'ISSUED',
        limit: 25,
      }),
    ).resolves.toEqual([
      expect.objectContaining({
        id: 'issue-1',
        status: 'ISSUED',
        qrPayloadHash: 'hash-issued-1',
        booking: expect.objectContaining({
          id: 'booking-1',
          status: 'CONFIRMED',
          scheduledAt: new Date('2026-07-01T14:00:00.000Z'),
        }),
        bill: expect.objectContaining({
          id: 'bill-1',
          billNumber: 'BILL-20260701-ABC12345',
          status: 'SUBMITTED',
        }),
        qrImageDataUrl: expect.stringContaining('data:image/png;base64,'),
        discountPercent: 8,
        campaignSnapshot: expect.objectContaining({
          code: 'MEMBER8',
          storeId: 'store-1',
        }),
        auditLogs: [
          expect.objectContaining({
            id: 'audit-1',
            action: 'COUPON_ISSUE_SCANNED',
            targetId: 'issue-1',
          }),
        ],
      }),
    ]);

    expect(prisma.couponIssue.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          couponId: 'coupon-1',
          status: 'ISSUED',
          coupon: {
            deletedAt: null,
            storeId: 'store-1',
          },
        },
        take: 25,
        select: expect.objectContaining({
          qrPayloadHash: true,
          booking: { select: { id: true, status: true, scheduledAt: true } },
          bill: {
            select: {
              id: true,
              billNumber: true,
              status: true,
              totalVnd: true,
            },
          },
        }),
      }),
    );
    expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
      where: {
        targetType: 'CouponIssue',
        targetId: { in: ['issue-1'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: expect.objectContaining({
        id: true,
        action: true,
        targetId: true,
      }),
    });
  });

  it('previews bill OCR suggestions from extracted text', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-04T00:00:00.000Z'));

    expect(
      service.previewBillOcr(
        { id: 'member-1', role: 'USER' },
        {
          fileName: 'bill-total-1800000-used-2026-07-03-21-30.txt',
          text: 'Tong cong: 1.800.000 VND\nNgay: 03/07/2026 21:30',
        },
      ),
    ).toEqual(
      expect.objectContaining({
        phase: 'P2_OCR_PREVIEW',
        source: 'HEURISTIC_OCR_AI_MVP',
        model: 'rule-based-v1',
        suggestions: {
          totalVnd: 1800000,
          usedAt: '2026-07-03T14:30:00.000Z',
        },
        extractedFields: expect.objectContaining({
          totalVnd: expect.objectContaining({ confidence: 0.86 }),
          usedAt: expect.objectContaining({ confidence: 0.76 }),
        }),
        nextAction: 'CAN_PREFILL_FORM',
        requiresManualReview: false,
      }),
    );
  });

  it('submits a member bill and sends the admin alert', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-01T10:00:00.000Z'));
    prisma.booking.findFirst.mockResolvedValue({
      id: 'booking-1',
      status: 'CONFIRMED',
      userId: 'member-1',
      storeId: 'store-1',
      guestId: 'guest-1',
      couponId: 'coupon-1',
      couponIssueId: 'issue-1',
      scheduledAt: new Date('2026-06-30T14:00:00.000Z'),
      qr: {
        usedAt: new Date('2026-06-30T14:00:00.000Z'),
      },
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      guest: { id: 'guest-1', displayName: 'Guest', phone: '+84901234567' },
      coupon: { id: 'coupon-1', code: 'WELCOME20', name: 'Welcome 20%' },
      couponIssue: {
        id: 'issue-1',
        code: 'MEMBER-code',
        status: 'USED',
        usedAt: new Date('2026-06-30T14:00:00.000Z'),
      },
    });
    prisma.bill.findFirst.mockResolvedValue(null);
    prisma.bill.create.mockResolvedValue({
      id: 'bill-1',
      billNumber: 'BILL-20260630-ABC12345',
      status: 'SUBMITTED',
      totalVnd: 1800000,
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      booking: { id: 'booking-1', status: 'CONFIRMED' },
      guest: { id: 'guest-1', displayName: 'Guest', phone: '+84901234567' },
    });

    await service.submitMemberBill(
      { id: 'member-1', role: 'USER' },
      {
        bookingId: 'booking-1',
        totalVnd: 1800000,
        usedAt: '2026-06-30T14:00:00.000Z',
      },
    );

    expect(prisma.bill.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          bookingId: 'booking-1',
          userId: 'member-1',
          guestId: 'guest-1',
          storeId: 'store-1',
          couponId: 'coupon-1',
          couponIssueId: 'issue-1',
          submitterType: 'MEMBER',
          submittedByUserId: 'member-1',
          status: 'SUBMITTED',
          subtotalVnd: 1800000,
          discountVnd: 0,
          serviceChargeVnd: 0,
          taxVnd: 0,
          totalVnd: 1800000,
          paidVnd: 1800000,
          usedAt: new Date('2026-06-30T14:00:00.000Z'),
          submittedAt: expect.any(Date),
        }),
      }),
    );
    expect(adminNotificationService.notifyBillSubmitted).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'bill-1',
        status: 'SUBMITTED',
      }),
    );
    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'member-1',
        storeId: 'store-1',
        bookingId: 'booking-1',
        billId: 'bill-1',
        channel: 'IN_APP',
        status: 'QUEUED',
        recipient: 'user:member-1',
        templateKey: 'customer.bill.submitted.v1',
        payload: expect.objectContaining({
          source: 'member_bill_submission',
          nextStatus: 'SUBMITTED',
          billNumber: 'BILL-20260630-ABC12345',
        }),
      }),
    });
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actorId: 'member-1',
          action: 'bill.submit',
          targetType: 'Bill',
          targetId: 'bill-1',
          metadata: expect.objectContaining({
            submitterType: 'MEMBER',
            storeId: 'store-1',
            bookingId: 'booking-1',
            submittedByUserId: 'member-1',
            submittedByPartnerAccountId: null,
            totalVnd: 1800000,
          }),
        }),
      }),
    );
  });

  it('uses the admin booking confirmation time when QR check-in is not available', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-01T10:00:00.000Z'));
    prisma.booking.findFirst.mockResolvedValue({
      id: 'booking-1',
      status: 'CONFIRMED',
      userId: 'member-1',
      storeId: 'store-1',
      guestId: null,
      couponId: null,
      couponIssueId: null,
      scheduledAt: new Date('2026-07-22T13:00:00.000Z'),
      updatedAt: new Date('2026-07-01T09:30:00.000Z'),
      qr: { usedAt: null },
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      guest: null,
      coupon: null,
      couponIssue: null,
    });
    prisma.bill.findFirst.mockResolvedValue(null);
    prisma.bill.create.mockResolvedValue({
      id: 'bill-admin-confirmed',
      billNumber: 'BILL-20260701-ADMIN',
      status: 'SUBMITTED',
      totalVnd: 1800000,
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      booking: { id: 'booking-1', status: 'CONFIRMED' },
      guest: null,
    });

    await service.submitMemberBill(
      { id: 'member-1', role: 'USER' },
      {
        bookingId: 'booking-1',
        totalVnd: 1800000,
        usedAt: '2026-07-22T13:00:00.000Z',
      },
    );

    expect(prisma.bill.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          bookingId: 'booking-1',
          usedAt: new Date('2026-07-01T09:30:00.000Z'),
        }),
      }),
    );
  });

  it('rejects a linked member booking bill before admin or partner confirms usage time', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-01T10:00:00.000Z'));
    prisma.booking.findFirst.mockResolvedValue({
      id: 'booking-1',
      status: 'CONFIRMED',
      userId: 'member-1',
      storeId: 'store-1',
      guestId: null,
      couponId: null,
      couponIssueId: null,
      scheduledAt: new Date('2026-06-30T14:00:00.000Z'),
      qr: { usedAt: null },
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      guest: null,
      coupon: null,
      couponIssue: null,
    });
    prisma.bill.findFirst.mockResolvedValue(null);

    await expect(
      service.submitMemberBill(
        { id: 'member-1', role: 'USER' },
        {
          bookingId: 'booking-1',
          totalVnd: 1800000,
          usedAt: '2026-06-30T14:00:00.000Z',
        },
      ),
    ).rejects.toThrow(UnprocessableEntityException);

    expect(prisma.bill.create).not.toHaveBeenCalled();
  });

  it('shows submitted member bills in the admin pending bill queue', async () => {
    const createdAt = new Date('2026-07-01T10:05:00.000Z');
    prisma.bill.aggregate.mockResolvedValue({
      _sum: { totalVnd: 1800000 },
    });
    prisma.bill.findMany.mockResolvedValue([
      {
        id: 'bill-1',
        billNumber: 'BILL-20260701-ABC12345',
        status: 'SUBMITTED',
        totalVnd: 1800000,
        discountVnd: 0,
        commissionAmountVnd: 0,
        pointsEarned: 0,
        rejectReason: null,
        createdAt,
        store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
        user: { id: 'member-1', displayName: 'Minh', tier: 'Member' },
        guest: null,
        booking: null,
        media: [],
      },
    ] as never);
    prisma.media.findMany.mockResolvedValue([
      { billId: 'bill-1', url: '/storage/files/bill-1.png' },
    ] as never);
    prisma.bill.count
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);

    const result = await service.listAdminBills({
      status: 'pending',
      page: 1,
      limit: 8,
    });

    expect(prisma.bill.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
          status: 'SUBMITTED',
        }),
        skip: 0,
        take: 8,
        select: expect.objectContaining({
          store: { select: { name: true, slug: true } },
          user: { select: { id: true, displayName: true, tier: true, role: true } },
          guest: { select: { id: true, displayName: true } },
        }),
      }),
    );
    expect(prisma.media.findMany).toHaveBeenCalledWith({
      where: { billId: { in: ['bill-1'] }, deletedAt: null },
      select: { billId: true, url: true },
    });
    expect(result.data).toEqual([
      expect.objectContaining({
        id: 'bill-1',
        billNumber: 'BILL-20260701-ABC12345',
        store: 'Neon Club',
        amount: 1800000,
        sender: 'Minh',
        status: 'SUBMITTED',
        hasImage: true,
        images: ['/storage/files/bill-1.png'],
      }),
    ]);
    expect(result.meta).toEqual(
      expect.objectContaining({
        total: 1,
        page: 1,
        limit: 8,
        totalPages: 1,
      }),
    );
    expect(result.stats).toEqual(
      expect.objectContaining({
        pendingCount: 1,
        approvedCount: 0,
        rejectedCount: 0,
        totalAmountPending: 1800000,
      }),
    );
  });

  it('keeps the admin pending bill queue available when bill evidence lookup fails', async () => {
    const createdAt = new Date('2026-07-01T10:05:00.000Z');
    prisma.bill.aggregate.mockResolvedValue({
      _sum: { totalVnd: 900000 },
    });
    prisma.bill.findMany.mockResolvedValue([
      {
        id: 'bill-2',
        billNumber: 'BILL-20260701-XYZ98765',
        status: 'SUBMITTED',
        totalVnd: 900000,
        discountVnd: 0,
        commissionAmountVnd: 0,
        pointsEarned: 0,
        rejectReason: null,
        createdAt,
        store: { id: 'store-2', name: 'Moonlight Bar', slug: 'moonlight-bar' },
        user: null,
        guest: { id: 'guest-1', displayName: 'Guest Minh' },
        booking: null,
      },
    ] as never);
    prisma.media.findMany.mockRejectedValue(new Error('media relation failed'));
    prisma.bill.count
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);

    const result = await service.listAdminBills({
      status: 'pending',
      page: 1,
      limit: 8,
    });

    expect(result.data).toEqual([
      expect.objectContaining({
        id: 'bill-2',
        store: 'Moonlight Bar',
        sender: 'Guest Minh',
        hasImage: false,
        images: [],
      }),
    ]);
  });

  it('submits a member bill with a coupon issue without requiring a booking', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-01T10:00:00.000Z'));
    prisma.store.findFirst.mockResolvedValue({
      id: 'store-1',
      name: 'Neon Club',
      slug: 'neon-club',
    });
    prisma.couponIssue.findFirst.mockResolvedValue({
      id: 'issue-1',
      code: 'MEMBER-code',
      couponId: 'coupon-1',
      userId: 'member-1',
      guestId: null,
      status: 'USED',
      usedAt: new Date('2026-06-30T14:00:00.000Z'),
      expiresAt: null,
      bill: null,
      coupon: {
        id: 'coupon-1',
        code: 'WELCOME20',
        name: 'Welcome 20%',
        storeId: 'store-1',
      },
    });
    prisma.bill.create.mockResolvedValue({
      id: 'bill-1',
      billNumber: 'BILL-20260701-ABC12345',
      status: 'SUBMITTED',
      totalVnd: 1800000,
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      booking: null,
      coupon: { id: 'coupon-1', code: 'WELCOME20', name: 'Welcome 20%' },
      couponIssue: { id: 'issue-1', code: 'MEMBER-code', status: 'USED' },
    });

    await service.submitMemberBill(
      { id: 'member-1', role: 'USER' },
      {
        storeSlug: 'neon-club',
        couponIssueId: 'issue-1',
        totalVnd: 1800000,
        usedAt: '2026-06-30T14:00:00.000Z',
      },
    );

    expect(prisma.bill.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          bookingId: null,
          userId: 'member-1',
          storeId: 'store-1',
          couponId: 'coupon-1',
          couponIssueId: 'issue-1',
          status: 'SUBMITTED',
        }),
      }),
    );
    expect(adminNotificationService.notifyBillSubmitted).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'bill-1',
        status: 'SUBMITTED',
      }),
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actorId: 'member-1',
          action: 'bill.coupon.link',
          targetType: 'Bill',
          targetId: 'bill-1',
          metadata: expect.objectContaining({
            source: 'direct',
            actorRole: 'USER',
            storeId: 'store-1',
            bookingId: null,
            couponId: 'coupon-1',
            couponIssueId: 'issue-1',
            couponIssueStatus: 'USED',
          }),
        }),
      }),
    );
  });

  it('lists member in-app bill notifications with unread count', async () => {
    prisma.notificationLog.findMany.mockResolvedValue([
      {
        id: 'notification-bill-1',
        status: 'QUEUED',
        templateKey: 'customer.bill.verified.v1',
        payload: {
          pointsEarned: 18,
        },
        createdAt: new Date('2026-07-03T10:00:00.000Z'),
        sentAt: null,
        billId: 'bill-1',
        bookingId: 'booking-1',
        store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
        booking: {
          id: 'booking-1',
          status: 'CONFIRMED',
          scheduledAt: new Date('2026-07-03T14:00:00.000Z'),
          store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
        },
        bill: {
          id: 'bill-1',
          billNumber: 'BILL-20260703-ABC12345',
          status: 'VERIFIED',
          totalVnd: 1800000,
          pointsEarned: 18,
          rejectReason: null,
          submittedAt: new Date('2026-07-03T09:00:00.000Z'),
          reviewedAt: new Date('2026-07-03T10:00:00.000Z'),
          verifiedAt: new Date('2026-07-03T10:00:00.000Z'),
          rejectedAt: null,
          store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
        },
      },
    ] as never);
    prisma.notificationLog.count.mockResolvedValue(1);

    const result = await service.listMemberNotifications(
      { id: 'member-1', role: 'USER' },
      { limit: '5' },
    );

    expect(prisma.notificationLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 'member-1',
          channel: 'IN_APP',
          templateKey: { startsWith: 'customer.' },
        }),
        take: 5,
      }),
    );
    expect(result.unreadCount).toBe(1);
    expect(result.data[0]).toEqual(
      expect.objectContaining({
        id: 'notification-bill-1',
        title: 'Hóa đơn đã được duyệt',
        actionLabel: 'Xem kết quả',
        href: '/gui-hoa-don?billId=bill-1',
        unread: true,
        category: 'bill',
      }),
    );
  });

  it('formats cast booking notifications separately for members', async () => {
    prisma.notificationLog.findMany.mockResolvedValue([
      {
        id: 'notification-booking-cast-1',
        status: 'QUEUED',
        templateKey: 'customer.booking.cast_created.v1',
        payload: {
          castName: 'Kotone',
          storeName: 'Tokyo Kitchen',
          scheduledAt: '2026-07-09T14:00:00.000Z',
        },
        createdAt: new Date('2026-07-03T10:00:00.000Z'),
        sentAt: null,
        billId: null,
        bookingId: 'booking-cast-1',
        store: { id: 'store-1', name: 'Tokyo Kitchen', slug: 'tokyo-kitchen' },
        booking: {
          id: 'booking-cast-1',
          status: 'REQUESTED',
          scheduledAt: new Date('2026-07-09T14:00:00.000Z'),
          store: {
            id: 'store-1',
            name: 'Tokyo Kitchen',
            slug: 'tokyo-kitchen',
          },
          cast: {
            id: 'cast-1',
            slug: 'kotone-tokyo',
            stageName: 'Kotone',
            publicAlias: 'Kotone',
          },
        },
        bill: null,
      },
    ] as never);
    prisma.notificationLog.count.mockResolvedValue(1);

    const result = await service.listMemberNotifications(
      { id: 'member-1', role: 'USER' },
      { limit: 10 },
    );

    expect(result.data[0]).toEqual(
      expect.objectContaining({
        title: 'Đặt bàn theo cast thành công',
        category: 'booking',
        tone: 'amber',
        actionLabel: 'Xem lịch đặt',
        href: '/lich-su-dat-cho?bookingId=booking-cast-1',
      }),
    );
    expect(result.data[0].body).toContain('Kotone @ Tokyo Kitchen');
  });

  it('formats legacy created booking notifications as cast bookings when the booking has a cast', async () => {
    prisma.notificationLog.findMany.mockResolvedValue([
      {
        id: 'notification-booking-legacy-cast-1',
        status: 'QUEUED',
        templateKey: 'customer.booking.created.v1',
        payload: {
          storeName: 'Tokyo Kitchen',
          scheduledAt: '2026-07-09T14:00:00.000Z',
        },
        createdAt: new Date('2026-07-03T10:00:00.000Z'),
        sentAt: null,
        billId: null,
        bookingId: 'booking-legacy-cast-1',
        store: { id: 'store-1', name: 'Tokyo Kitchen', slug: 'tokyo-kitchen' },
        booking: {
          id: 'booking-legacy-cast-1',
          status: 'REQUESTED',
          scheduledAt: new Date('2026-07-09T14:00:00.000Z'),
          store: {
            id: 'store-1',
            name: 'Tokyo Kitchen',
            slug: 'tokyo-kitchen',
          },
          cast: {
            id: 'cast-1',
            slug: 'aoi-tokyo',
            stageName: 'Aoi',
            publicAlias: 'Aoi',
          },
        },
        bill: null,
      },
    ] as never);
    prisma.notificationLog.count.mockResolvedValue(1);

    const result = await service.listMemberNotifications(
      { id: 'member-1', role: 'USER' },
      { limit: 10 },
    );

    expect(result.data[0]).toEqual(
      expect.objectContaining({
        title: 'Đặt bàn theo cast thành công',
        category: 'booking',
        tone: 'amber',
      }),
    );
    expect(result.data[0].body).toContain('Aoi @ Tokyo Kitchen');
  });

  it('formats tour booking notifications separately for members', async () => {
    prisma.notificationLog.findMany.mockResolvedValue([
      {
        id: 'notification-booking-tour-1',
        status: 'QUEUED',
        templateKey: 'customer.booking.tour_created.v1',
        payload: {
          storeName: 'Tokyo Kitchen',
          scheduledAt: '2026-07-09T14:00:00.000Z',
          note: 'Tour: Bar Hopping VIP | Diem dung: Tokyo Kitchen > Crimson Bar',
        },
        createdAt: new Date('2026-07-03T10:00:00.000Z'),
        sentAt: null,
        billId: null,
        bookingId: 'booking-tour-1',
        store: { id: 'store-1', name: 'Tokyo Kitchen', slug: 'tokyo-kitchen' },
        booking: {
          id: 'booking-tour-1',
          status: 'REQUESTED',
          scheduledAt: new Date('2026-07-09T14:00:00.000Z'),
          note: 'Tour: Bar Hopping VIP | Diem dung: Tokyo Kitchen > Crimson Bar',
          store: {
            id: 'store-1',
            name: 'Tokyo Kitchen',
            slug: 'tokyo-kitchen',
          },
          cast: null,
        },
        bill: null,
      },
    ] as never);
    prisma.notificationLog.count.mockResolvedValue(1);

    const result = await service.listMemberNotifications(
      { id: 'member-1', role: 'USER' },
      { limit: 10 },
    );

    expect(result.data[0]).toEqual(
      expect.objectContaining({
        title: 'Đặt tour thành công',
        category: 'booking',
        tone: 'amber',
        actionLabel: 'Xem lịch đặt',
        href: '/lich-su-dat-cho?bookingId=booking-tour-1',
      }),
    );
    expect(result.data[0].body).toContain('Bar Hopping VIP');
    expect(result.data[0].body).toContain('quán và cast');
  });

  it('marks member notifications as read inside the customer scope', async () => {
    await expect(
      service.markMemberNotificationRead(
        { id: 'member-1', role: 'USER' },
        'notification-bill-1',
      ),
    ).resolves.toEqual({ id: 'notification-bill-1', read: true });

    expect(prisma.notificationLog.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'notification-bill-1',
        userId: 'member-1',
        channel: 'IN_APP',
        templateKey: { startsWith: 'customer.' },
      },
      data: {
        status: 'SENT',
        sentAt: expect.any(Date),
      },
    });
  });

  it('requires an active coupon campaign for direct bill couponId links', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-01T10:00:00.000Z'));
    prisma.store.findFirst.mockResolvedValue({
      id: 'store-1',
      name: 'Neon Club',
      slug: 'neon-club',
    });
    prisma.coupon.findFirst.mockResolvedValue({
      id: 'coupon-1',
      code: 'WELCOME20',
      name: 'Welcome 20%',
    });
    prisma.bill.create.mockResolvedValue({
      id: 'bill-direct-coupon',
      billNumber: 'BILL-20260701-DIRECT01',
      status: 'SUBMITTED',
      totalVnd: 1800000,
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      booking: null,
      coupon: { id: 'coupon-1', code: 'WELCOME20', name: 'Welcome 20%' },
      couponIssue: null,
    });

    await service.submitMemberBill(
      { id: 'member-1', role: 'USER' },
      {
        storeSlug: 'neon-club',
        couponId: 'coupon-1',
        totalVnd: 1800000,
        usedAt: '2026-06-30T14:00:00.000Z',
      },
    );

    expect(prisma.coupon.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'coupon-1',
          storeId: 'store-1',
          deletedAt: null,
          status: 'ACTIVE',
          OR: [{ endsAt: null }, { endsAt: { gt: expect.any(Date) } }],
        }),
      }),
    );
    expect(prisma.bill.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          bookingId: null,
          couponId: 'coupon-1',
          couponIssueId: undefined,
        }),
      }),
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'bill.coupon.link',
          targetId: 'bill-direct-coupon',
          metadata: expect.objectContaining({
            source: 'direct',
            couponId: 'coupon-1',
            couponIssueId: null,
          }),
        }),
      }),
    );
  });

  it('rejects member bill submissions after the 10 day deadline', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-01T10:00:00.000Z'));
    prisma.store.findFirst.mockResolvedValue({
      id: 'store-1',
      name: 'Neon Club',
      slug: 'neon-club',
    });

    await expect(
      service.submitMemberBill(
        { id: 'member-1', role: 'USER' },
        {
          storeSlug: 'neon-club',
          totalVnd: 1800000,
          usedAt: '2026-06-20T09:59:59.000Z',
        },
      ),
    ).rejects.toThrow(UnprocessableEntityException);

    expect(prisma.bill.create).not.toHaveBeenCalled();
  });

  it('blocks likely duplicate member bill submissions by user, store, total, and usedAt', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-01T10:00:00.000Z'));
    prisma.store.findFirst.mockResolvedValue({
      id: 'store-1',
      name: 'Neon Club',
      slug: 'neon-club',
    });
    prisma.bill.findFirst.mockResolvedValue({
      id: 'bill-duplicate',
      billNumber: 'BILL-20260701-DUP',
    });

    await expect(
      service.submitMemberBill(
        { id: 'member-1', role: 'USER' },
        {
          storeSlug: 'neon-club',
          totalVnd: 1800000,
          usedAt: '2026-06-30T14:00:00.000Z',
        },
      ),
    ).rejects.toThrow(UnprocessableEntityException);

    expect(prisma.bill.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          storeId: 'store-1',
          totalVnd: 1800000,
          OR: [{ userId: 'member-1' }, { submittedByUserId: 'member-1' }],
        }),
      }),
    );
    expect(prisma.bill.create).not.toHaveBeenCalled();
  });

  it('rate limits repeated member bill submissions in the same store window', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-01T10:00:00.000Z'));
    prisma.store.findFirst.mockResolvedValue({
      id: 'store-1',
      name: 'Neon Club',
      slug: 'neon-club',
    });
    prisma.bill.count.mockResolvedValue(5);

    await expect(
      service.submitMemberBill(
        { id: 'member-1', role: 'USER' },
        {
          storeSlug: 'neon-club',
          totalVnd: 1800000,
          usedAt: '2026-06-30T14:00:00.000Z',
        },
      ),
    ).rejects.toThrow(UnprocessableEntityException);

    expect(prisma.bill.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          storeId: 'store-1',
          submitterType: 'MEMBER',
          OR: [{ userId: 'member-1' }, { submittedByUserId: 'member-1' }],
        }),
      }),
    );
    expect(prisma.bill.create).not.toHaveBeenCalled();
  });

  it('submits a partner bill within the accessible store scope', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-01T10:00:00.000Z'));
    prisma.partnerAccount.findFirst.mockResolvedValue({
      id: 'partner-account-1',
    });
    prisma.store.findFirst.mockResolvedValue({
      id: 'store-1',
      name: 'Neon Club',
      slug: 'neon-club',
    });
    prisma.bill.create.mockResolvedValue({
      id: 'bill-1',
      billNumber: 'BILL-20260701-ABC12345',
      status: 'SUBMITTED',
      totalVnd: 1800000,
      usedAt: new Date('2026-06-30T14:00:00.000Z'),
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      booking: null,
      guest: null,
    });

    await service.submitPartnerBill(
      { id: 'partner-1', role: 'PARTNER' },
      {
        storeSlug: 'neon-club',
        totalVnd: 1800000,
        usedAt: '2026-06-30T14:00:00.000Z',
      },
    );

    expect(accessService.ensureStoreAccess).toHaveBeenCalledWith(
      { id: 'partner-1', role: 'PARTNER' },
      'store-1',
      'bill.partner.view',
    );
    expect(prisma.bill.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          storeId: 'store-1',
          submitterType: 'PARTNER',
          submittedByUserId: null,
          submittedByPartnerAccountId: 'partner-account-1',
          status: 'SUBMITTED',
          subtotalVnd: 1800000,
          discountVnd: 0,
          serviceChargeVnd: 0,
          taxVnd: 0,
          totalVnd: 1800000,
          paidVnd: 1800000,
          usedAt: new Date('2026-06-30T14:00:00.000Z'),
        }),
      }),
    );
    expect(adminNotificationService.notifyBillSubmitted).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'bill-1',
        status: 'SUBMITTED',
      }),
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actorId: 'partner-1',
          action: 'bill.submit',
          targetType: 'Bill',
          targetId: 'bill-1',
          metadata: expect.objectContaining({
            submitterType: 'PARTNER',
            storeId: 'store-1',
            submittedByUserId: null,
            submittedByPartnerAccountId: 'partner-account-1',
            totalVnd: 1800000,
          }),
        }),
      }),
    );
  });

  it('rejects partner bill submissions outside the partner store scope with 403', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-01T10:00:00.000Z'));
    prisma.store.findFirst.mockResolvedValue({
      id: 'store-other',
      name: 'Other Club',
      slug: 'other-club',
    });
    accessService.ensureStoreAccess.mockRejectedValue(
      new ForbiddenException('Forbidden resource'),
    );

    await expect(
      service.submitPartnerBill(
        { id: 'partner-1', role: 'PARTNER' },
        {
          storeSlug: 'other-club',
          totalVnd: 1800000,
          usedAt: '2026-06-30T14:00:00.000Z',
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(accessService.ensureStoreAccess).toHaveBeenCalledWith(
      { id: 'partner-1', role: 'PARTNER' },
      'store-other',
      'bill.partner.view',
    );
    expect(prisma.bill.create).not.toHaveBeenCalled();
  });

  it('submits a partner bill with a guest coupon issue without requiring a booking', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-01T10:00:00.000Z'));
    prisma.store.findFirst.mockResolvedValue({
      id: 'store-1',
      name: 'Neon Club',
      slug: 'neon-club',
    });
    prisma.couponIssue.findFirst.mockResolvedValue({
      id: 'issue-guest-1',
      code: 'GUEST-code',
      couponId: 'coupon-guest-1',
      userId: null,
      guestId: 'guest-1',
      status: 'USED',
      usedAt: new Date('2026-06-30T14:00:00.000Z'),
      expiresAt: null,
      bill: null,
      coupon: {
        id: 'coupon-guest-1',
        code: 'GUEST20',
        name: 'Guest 20%',
        storeId: 'store-1',
      },
    });
    prisma.bill.create.mockResolvedValue({
      id: 'bill-guest-1',
      billNumber: 'BILL-20260701-GUEST001',
      status: 'SUBMITTED',
      totalVnd: 2200000,
      usedAt: new Date('2026-06-30T14:00:00.000Z'),
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      booking: null,
      guest: { id: 'guest-1', displayName: 'Guest', phone: '+84901234567' },
      coupon: { id: 'coupon-guest-1', code: 'GUEST20', name: 'Guest 20%' },
      couponIssue: { id: 'issue-guest-1', code: 'GUEST-code', status: 'USED' },
    });

    await service.submitPartnerBill(
      { id: 'partner-1', role: 'PARTNER' },
      {
        storeSlug: 'neon-club',
        couponIssueId: 'issue-guest-1',
        totalVnd: 2200000,
        usedAt: '2026-06-30T14:00:00.000Z',
      },
    );

    expect(accessService.ensureStoreAccess).toHaveBeenCalledWith(
      { id: 'partner-1', role: 'PARTNER' },
      'store-1',
      'bill.partner.view',
    );
    expect(prisma.bill.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          bookingId: null,
          userId: null,
          guestId: 'guest-1',
          storeId: 'store-1',
          couponId: 'coupon-guest-1',
          couponIssueId: 'issue-guest-1',
          status: 'SUBMITTED',
        }),
      }),
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actorId: 'partner-1',
          action: 'bill.coupon.link',
          targetType: 'Bill',
          targetId: 'bill-guest-1',
          metadata: expect.objectContaining({
            source: 'direct',
            actorRole: 'PARTNER',
            storeId: 'store-1',
            bookingId: null,
            couponId: 'coupon-guest-1',
            couponIssueId: 'issue-guest-1',
            couponIssueStatus: 'USED',
          }),
        }),
      }),
    );
  });

  it('submits a partner request atomically, creates the CMS record, and sends the admin alert', async () => {
    prisma.store.create.mockResolvedValueOnce({
      id: 'store-draft-1',
      name: 'Neon Club Tay Ho',
      slug: 'neon-club-tay-ho-partner-abc12345',
      status: 'PENDING_REVIEW',
    });
    prisma.cast.create.mockResolvedValueOnce({ id: 'cast-draft-1' });
    prisma.media.create
      .mockResolvedValueOnce({ id: 'cast-media-1' })
      .mockResolvedValueOnce({ id: 'store-media-1' });
    prisma.content.create.mockResolvedValueOnce({
      id: 'content-draft-1',
    });
    prisma.partnerRequest.create.mockImplementation(
      (args) =>
        Promise.resolve(
          partnerRequestRecord({
            id: args.data?.id,
            status: args.data?.status,
            businessName: args.data?.businessName,
            businessType: args.data?.businessType,
            area: args.data?.area,
            contactName: args.data?.contactName,
            contactPhone: args.data?.contactPhone,
            contactEmail: args.data?.contactEmail,
            note: args.data?.note,
            storeDescription: args.data?.storeDescription,
            storeAddress: args.data?.storeAddress,
            storeCity: args.data?.storeCity,
            storeDistrict: args.data?.storeDistrict,
            openingHours: args.data?.openingHours,
            menuSummary: args.data?.menuSummary,
            mediaUrls: args.data?.mediaUrls,
            draftCastIds: args.data?.draftCastIds,
            draftMediaIds: args.data?.draftMediaIds,
            draftContentIds: args.data?.draftContentIds,
            submittedAt: args.data?.submittedAt,
          }),
        ) as never,
    );

    const result = await service.createPartnerRequest({
      businessName: 'Neon Club',
      businessType: 'Club',
      area: 'Ha Noi',
      storeName: 'Neon Club Tay Ho',
      storeCategory: 'CLUB',
      storeDescription: 'Live DJ and private table service',
      storeAddress: '12 Dang Thai Mai',
      storeCity: 'Ha Noi',
      storeDistrict: 'Tay Ho',
      openingHours: '18:00 - 02:00',
      menuSummary: 'Bottle service from 2,500,000 VND',
      mediaUrls: ['https://cdn.example.com/store.jpg'],
      castProfiles: [
        {
          stageName: 'Yuna',
          bio: 'English speaking hostess',
          tags: ['hostess'],
          languages: ['en', 'ja'],
          hourlyRateVnd: 1200000,
          mediaUrls: ['https://cdn.example.com/yuna.jpg'],
        },
      ],
      contactName: 'Owner',
      contactPhone: '+84901234567',
      contactEmail: 'owner@example.com',
      note: 'Please call after 6PM',
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(/^PARTNER-/),
        status: 'PENDING_REVIEW',
        draft: {
          storeId: 'store-draft-1',
          storeName: 'Neon Club Tay Ho',
          storeSlug: 'neon-club-tay-ho-partner-abc12345',
          castCount: 1,
          mediaCount: 2,
          contentCount: 1,
        },
        message: 'Partner request submitted for admin review',
      }),
    );
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.store.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Neon Club Tay Ho',
          category: 'CLUB',
          description: 'Live DJ and private table service',
          address: '12 Dang Thai Mai',
          city: 'Ha Noi',
          district: 'Tay Ho',
          phone: '+84901234567',
          openingHours: { summary: '18:00 - 02:00' },
          status: 'PENDING_REVIEW',
        }),
      }),
    );
    expect(prisma.cast.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          storeId: 'store-draft-1',
          stageName: 'Yuna',
          isPublic: false,
          status: 'DRAFT',
        }),
      }),
    );
    expect(prisma.media.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          castId: 'cast-draft-1',
          access: 'PROTECTED',
          status: 'HIDDEN',
        }),
      }),
    );
    expect(prisma.media.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          storeId: 'store-draft-1',
          access: 'PROTECTED',
          status: 'HIDDEN',
        }),
      }),
    );
    expect(prisma.content.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          storeId: 'store-draft-1',
          type: 'STORE_POST',
          status: 'DRAFT',
          body: 'Bottle service from 2,500,000 VND',
        }),
      }),
    );
    expect(prisma.partnerRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: result.id,
          storeId: 'store-draft-1',
          status: 'PENDING_REVIEW',
          businessName: 'Neon Club',
          contactEmail: 'owner@example.com',
          draftCastIds: ['cast-draft-1'],
          draftMediaIds: ['cast-media-1', 'store-media-1'],
          draftContentIds: ['content-draft-1'],
          publicState: 'HIDDEN',
        }),
      }),
    );
    expect(adminNotificationService.notifyPartnerRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        id: result.id,
        draftStoreId: 'store-draft-1',
        draftCastIds: ['cast-draft-1'],
        draftMediaIds: ['cast-media-1', 'store-media-1'],
        draftContentIds: ['content-draft-1'],
        businessName: 'Neon Club',
        businessType: 'Club',
        area: 'Ha Noi',
        contactName: 'Owner',
        contactPhone: '+84901234567',
        contactEmail: 'owner@example.com',
        note: 'Please call after 6PM',
        storeDescription: 'Live DJ and private table service',
        menuSummary: 'Bottle service from 2,500,000 VND',
      }),
    );
    expect(prisma.partnerRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: result.id },
        data: { notificationLogId: 'notification-1' },
      }),
    );
    expect(
      prisma.partnerRequest.create.mock.invocationCallOrder[0],
    ).toBeLessThan(
      adminNotificationService.notifyPartnerRequest.mock.invocationCallOrder[0],
    );
  });

  it('keeps the CMS partner request when Telegram delivery fails', async () => {
    prisma.store.create.mockResolvedValueOnce({
      id: 'store-draft-1',
      name: 'Neon Club Tay Ho',
      slug: 'neon-club-tay-ho-partner-abc12345',
      status: 'PENDING_REVIEW',
    });
    prisma.partnerRequest.create.mockImplementation(
      (args) =>
        Promise.resolve(
          partnerRequestRecord({
            id: args.data?.id,
            draftCastIds: [],
            draftMediaIds: [],
            draftContentIds: [],
            submittedAt: args.data?.submittedAt,
          }),
        ) as never,
    );
    adminNotificationService.notifyPartnerRequest.mockRejectedValueOnce(
      new Error('Telegram down'),
    );

    await expect(
      service.createPartnerRequest({
        businessName: 'Neon Club',
        businessType: 'Club',
        area: 'Ha Noi',
        storeName: 'Neon Club Tay Ho',
        contactName: 'Owner',
        contactPhone: '+84901234567',
        contactEmail: 'owner@example.com',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        status: 'PENDING_REVIEW',
        message: 'Partner request submitted for admin review',
      }),
    );

    expect(prisma.partnerRequest.create).toHaveBeenCalled();
    expect(prisma.partnerRequest.update).not.toHaveBeenCalled();
  });

  it('assigns province areas to partner draft stores', async () => {
    prisma.area.findMany.mockResolvedValueOnce([
      {
        id: 'area-ninhbinh-general',
        code: 'ninhbinh-tong-hop',
        name: 'Tong hop',
        city: 'Ninh Binh',
        district: 'Tong hop',
        ward: null,
      },
    ] as never);
    prisma.store.create.mockResolvedValueOnce({
      id: 'store-draft-1',
      name: 'Meo Meo',
      slug: 'meo-meo-partner-abc12345',
      status: 'PENDING_REVIEW',
    });
    prisma.partnerRequest.create.mockImplementation(
      (args) =>
        Promise.resolve(
          partnerRequestRecord({
            id: args.data?.id,
            status: args.data?.status,
            businessName: args.data?.businessName,
            area: args.data?.area,
            contactName: args.data?.contactName,
            contactPhone: args.data?.contactPhone,
            draftCastIds: args.data?.draftCastIds,
            draftMediaIds: args.data?.draftMediaIds,
            draftContentIds: args.data?.draftContentIds,
            submittedAt: args.data?.submittedAt,
          }),
        ) as never,
    );

    await expect(
      service.createPartnerRequest({
        businessName: 'Meo Meo',
        businessType: 'Club',
        area: 'Tinh Ninh Binh',
        contactName: 'Owner',
        contactPhone: '+84901234567',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        status: 'PENDING_REVIEW',
      }),
    );

    expect(prisma.store.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          city: 'Ninh Bình',
          areaId: 'area-ninhbinh-general',
          status: 'PENDING_REVIEW',
        }),
      }),
    );
  });

  it('lists partner requests from durable CMS records with filters', async () => {
    prisma.partnerRequest.findMany.mockResolvedValue([
      partnerRequestRecord(),
    ] as never);

    await expect(
      service.listAdminPartnerRequests({
        status: 'PENDING_REVIEW',
        keyword: 'Neon',
        submittedFrom: '2026-06-30T00:00:00.000Z',
        submittedTo: '2026-07-01T00:00:00.000Z',
        page: 2,
        limit: 10,
      }),
    ).resolves.toEqual([
      expect.objectContaining({
        id: 'PARTNER-ABC12345',
        notificationId: 'notification-1',
        notificationStatus: 'SENT',
        status: 'PENDING_REVIEW',
        draftStoreId: 'store-draft-1',
        draftCastCount: 1,
        draftMediaCount: 1,
        draftContentCount: 1,
        businessName: 'Neon Club',
        contactPhone: '+84901234567',
        storeDescription: 'Live DJ and private table service',
        menuSummary: 'Bottle service from 2,500,000 VND',
      }),
    ]);
    expect(prisma.partnerRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'PENDING_REVIEW',
          submittedAt: expect.objectContaining({
            gte: new Date('2026-06-30T00:00:00.000Z'),
            lte: new Date('2026-07-01T00:00:00.000Z'),
          }),
          OR: expect.any(Array),
        }),
        skip: 10,
        take: 10,
      }),
    );
  });

  it('approves a partner request transactionally, publishes drafts, and onboards the partner account', async () => {
    prisma.partnerRequest.findFirst.mockResolvedValue(partnerRequestRecord());
    prisma.partnerRequest.findUniqueOrThrow.mockResolvedValue(
      partnerRequestRecord({
        status: 'APPROVED',
        reviewReason: 'Thong tin hop le',
        reviewedAt: new Date('2026-06-30T10:05:00.000Z'),
        reviewedById: 'admin-1',
        publicState: 'PUBLIC',
        partnerUserId: 'partner-user-1',
        partnerAccountId: 'partner-account-1',
        store: { status: 'ACTIVE' },
      }),
    );

    const result = await service.reviewPartnerRequest(
      'admin-1',
      'PARTNER-ABC12345',
      {
        approve: true,
        reason: 'Thong tin hop le',
      },
    );

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.partnerRequest.updateMany).toHaveBeenCalledWith({
      where: { id: 'PARTNER-ABC12345', status: 'PENDING_REVIEW' },
      data: expect.objectContaining({
        status: 'APPROVED',
        reviewReason: 'Thong tin hop le',
        reviewedById: 'admin-1',
        publicState: 'PUBLIC',
      }),
    });
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'owner@example.com',
          role: 'PARTNER',
          passwordHash: 'hashed-password-123',
        }),
      }),
    );
    expect(prisma.partnerAccount.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'partner-user-1',
          businessName: 'Neon Club',
          status: 'ACTIVE',
        }),
      }),
    );
    expect(prisma.storePermission.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId_storeId: {
            userId: 'partner-user-1',
            storeId: 'store-draft-1',
          },
        },
        create: expect.objectContaining({
          permissions: [
            'store.partner.view',
            'booking.partner.view',
            'bill.partner.view',
            'coupon.scan',
          ],
        }),
      }),
    );
    expect(prisma.store.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'store-draft-1' },
        data: {
          status: 'ACTIVE',
          ownerId: 'partner-user-1',
          partnerAccountId: 'partner-account-1',
        },
      }),
    );
    expect(prisma.cast.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['cast-draft-1'] } },
      data: { status: 'ACTIVE', isPublic: true },
    });
    expect(prisma.media.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['media-draft-1'] } },
      data: { status: 'READY', access: 'PUBLIC' },
    });
    expect(prisma.content.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ['content-draft-1'] } },
        data: expect.objectContaining({ status: 'PUBLISHED' }),
      }),
    );
    expect(prisma.partnerRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'PARTNER-ABC12345' },
        data: expect.objectContaining({
          partnerUserId: 'partner-user-1',
          partnerAccountId: 'partner-account-1',
        }),
      }),
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actorId: 'admin-1',
          action: 'PARTNER_REQUEST_APPROVED',
          targetType: 'PARTNER_REQUEST',
          targetId: 'PARTNER-ABC12345',
          metadata: expect.objectContaining({
            actorId: 'admin-1',
            action: 'PARTNER_REQUEST_APPROVED',
            ref_id: 'PARTNER-ABC12345',
            occurredAt: expect.any(String),
          }),
        }),
      }),
    );
    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        channel: 'IN_APP',
        storeId: 'store-draft-1',
        recipient: 'partnerRequest:PARTNER-ABC12345',
        templateKey: 'audit.partner_request.review.v1',
        payload: expect.objectContaining({
          actorId: 'admin-1',
          action: 'PARTNER_REQUEST_APPROVED',
          ref_id: 'PARTNER-ABC12345',
          occurredAt: expect.any(String),
        }),
      }),
    });
    expect(result).toEqual(
      expect.objectContaining({
        id: 'PARTNER-ABC12345',
        status: 'APPROVED',
        reviewReason: 'Thong tin hop le',
        reviewedById: 'admin-1',
        publicState: 'PUBLIC',
        partnerUserId: 'partner-user-1',
        partnerAccountId: 'partner-account-1',
      }),
    );
  });

  it('rejects a partner request with a reason and keeps drafts non-public', async () => {
    prisma.partnerRequest.findFirst.mockResolvedValue(partnerRequestRecord());
    prisma.partnerRequest.findUniqueOrThrow.mockResolvedValue(
      partnerRequestRecord({
        status: 'REJECTED',
        reviewReason: 'Thieu giay to va anh ro net',
        reviewedAt: new Date('2026-06-30T10:05:00.000Z'),
        reviewedById: 'admin-1',
        publicState: 'HIDDEN',
      }),
    );

    const result = await service.reviewPartnerRequest(
      'admin-1',
      'PARTNER-ABC12345',
      {
        approve: false,
        reason: 'Thieu giay to va anh ro net',
      },
    );

    expect(prisma.store.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'store-draft-1' },
        data: { status: 'DRAFT' },
      }),
    );
    expect(prisma.cast.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['cast-draft-1'] } },
      data: { status: 'DRAFT', isPublic: false },
    });
    expect(prisma.media.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['media-draft-1'] } },
      data: { status: 'HIDDEN', access: 'PROTECTED' },
    });
    expect(prisma.content.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['content-draft-1'] } },
      data: { status: 'DRAFT', publishedAt: null },
    });
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'PARTNER_REQUEST_REJECTED',
          metadata: expect.objectContaining({
            reason: 'Thieu giay to va anh ro net',
            approve: false,
          }),
        }),
      }),
    );
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.partnerAccount.create).not.toHaveBeenCalled();
    expect(result).toEqual(
      expect.objectContaining({
        status: 'REJECTED',
        reviewReason: 'Thieu giay to va anh ro net',
        publicState: 'HIDDEN',
      }),
    );
  });

  it('blocks concurrent double review before publishing any draft content', async () => {
    prisma.partnerRequest.findFirst.mockResolvedValue(partnerRequestRecord());
    prisma.partnerRequest.updateMany.mockResolvedValueOnce({
      count: 0,
    });

    await expect(
      service.reviewPartnerRequest('admin-1', 'PARTNER-ABC12345', {
        approve: true,
        reason: 'Already handled elsewhere',
      }),
    ).rejects.toThrow(UnprocessableEntityException);

    expect(prisma.store.update).not.toHaveBeenCalled();
    expect(prisma.cast.updateMany).not.toHaveBeenCalled();
    expect(prisma.media.updateMany).not.toHaveBeenCalled();
    expect(prisma.content.updateMany).not.toHaveBeenCalled();
  });

  it('requires contact email before approve can onboard a partner account', async () => {
    prisma.partnerRequest.findFirst.mockResolvedValue(
      partnerRequestRecord({ contactEmail: null }),
    );

    await expect(
      service.reviewPartnerRequest('admin-1', 'PARTNER-ABC12345', {
        approve: true,
        reason: 'Thong tin hop le',
      }),
    ).rejects.toThrow(UnprocessableEntityException);

    expect(prisma.store.update).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.partnerAccount.create).not.toHaveBeenCalled();
  });

  it('stores the admin reviewer when reviewing a sensitive bill', async () => {
    prisma.bill.findFirst.mockResolvedValue({
      id: 'bill-1',
      status: 'SUBMITTED',
      reviewedAt: null,
      verifiedAt: null,
      rejectedAt: null,
      reviewedById: null,
      verifiedById: null,
      rejectedById: null,
      rejectReason: null,
      totalVnd: 1800000,
      commissionAmountVnd: 180000,
      pointsEarned: 180,
    });
    prisma.bill.update.mockResolvedValue({
      id: 'bill-1',
      status: 'VERIFIED',
      billNumber: 'BILL-20260630-ABC12345',
      reviewedAt: new Date('2026-06-26T10:15:00.000Z'),
      verifiedAt: new Date('2026-06-26T10:15:00.000Z'),
      rejectedAt: null,
      reviewedById: 'admin-1',
      verifiedById: 'admin-1',
      rejectedById: null,
      rejectReason: null,
      totalVnd: 1800000,
      commissionAmountVnd: 180000,
      pointsEarned: 180,
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      booking: { id: 'booking-1', status: 'CONFIRMED' },
      user: { id: 'member-1', displayName: 'Minh', tier: 'VIP' },
      guest: null,
    });
    prisma.auditLog.create.mockResolvedValue({ id: 'audit-1' });

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
        beforeJson: expect.objectContaining({
          id: 'bill-1',
          status: 'SUBMITTED',
          totalVnd: 1800000,
        }),
        afterJson: expect.objectContaining({
          id: 'bill-1',
          status: 'VERIFIED',
          reviewedById: 'admin-1',
        }),
        metadata: expect.objectContaining({
          actorId: 'admin-1',
          action: 'bill.review.approve',
          ref_id: 'bill-1',
          occurredAt: expect.any(String),
          previousStatus: 'SUBMITTED',
          nextStatus: 'VERIFIED',
        }),
      }),
    });
    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        channel: 'IN_APP',
        recipient: 'bill:bill-1',
        billId: 'bill-1',
        templateKey: 'audit.bill.review.v1',
        payload: expect.objectContaining({
          actorId: 'admin-1',
          action: 'bill.review.approve',
          ref_id: 'bill-1',
          occurredAt: expect.any(String),
        }),
      }),
    });
    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'member-1',
        storeId: 'store-1',
        bookingId: 'booking-1',
        billId: 'bill-1',
        channel: 'IN_APP',
        status: 'QUEUED',
        recipient: 'user:member-1',
        templateKey: 'customer.bill.verified.v1',
        payload: expect.objectContaining({
          source: 'admin_bill_review',
          previousStatus: 'SUBMITTED',
          nextStatus: 'VERIFIED',
          billNumber: 'BILL-20260630-ABC12345',
          pointsEarned: 180,
        }),
      }),
    });
    expect(adminNotificationService.notifyBillReviewed).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'bill-1',
        status: 'VERIFIED',
      }),
      { approve: true, reviewedById: 'admin-1' },
    );
  });

  it('automatically reverses an approved bill and posts a negative loyalty ledger', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-03T10:00:00.000Z'));
    prisma.bill.findFirst.mockResolvedValue({
      id: 'bill-reverse-1',
      billNumber: 'BILL-20260701-VERIFIED',
      status: 'VERIFIED',
      reviewedAt: new Date('2026-07-01T10:00:00.000Z'),
      verifiedAt: new Date('2026-07-01T10:00:00.000Z'),
      rejectedAt: null,
      reviewedById: 'admin-1',
      verifiedById: 'admin-1',
      rejectedById: null,
      rejectReason: null,
      subtotalVnd: 1800000,
      discountVnd: 0,
      totalVnd: 1800000,
      paidVnd: 1800000,
      commissionAmountVnd: 180000,
      pointsEarned: 18,
      discountRuleSnapshot: null,
      commissionRuleSnapshot: null,
    });
    prisma.pointLedger.findFirst.mockResolvedValue({
      id: 'ledger-earn-1',
      userId: 'member-1',
      bookingId: null,
      amountVnd: 1800000,
      points: 18,
    });
    prisma.bill.update.mockResolvedValue({
      id: 'bill-reverse-1',
      billNumber: 'BILL-20260701-VERIFIED',
      status: 'VOIDED',
      reviewedAt: new Date('2026-07-03T10:00:00.000Z'),
      verifiedAt: null,
      rejectedAt: new Date('2026-07-03T10:00:00.000Z'),
      reviewedById: 'admin-2',
      verifiedById: null,
      rejectedById: 'admin-2',
      rejectReason: 'Duplicate/fake bill confirmed',
      subtotalVnd: 1800000,
      discountVnd: 0,
      totalVnd: 1800000,
      paidVnd: 1800000,
      commissionAmountVnd: 0,
      pointsEarned: 0,
    });

    await service.reverseSensitiveBill('admin-2', 'bill-reverse-1', {
      reason: 'Duplicate/fake bill confirmed',
    });

    expect(prisma.bill.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'bill-reverse-1' },
        data: expect.objectContaining({
          status: 'VOIDED',
          commissionAmountVnd: 0,
          pointsEarned: 0,
          rejectedById: 'admin-2',
          rejectReason: 'Duplicate/fake bill confirmed',
        }),
      }),
    );
    expect(prisma.pointLedger.updateMany).toHaveBeenCalledWith({
      where: { id: 'ledger-earn-1', status: 'POSTED' },
      data: { status: 'REVERSED' },
    });
    expect(prisma.pointLedger.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          billId_type: {
            billId: 'bill-reverse-1',
            type: 'REVERSE',
          },
        },
        create: expect.objectContaining({
          userId: 'member-1',
          billId: 'bill-reverse-1',
          reversedLedgerId: 'ledger-earn-1',
          type: 'REVERSE',
          status: 'POSTED',
          amountVnd: -1800000,
          points: -18,
        }),
      }),
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: 'admin-2',
        action: 'bill.reversal',
        targetType: 'Bill',
        targetId: 'bill-reverse-1',
        metadata: expect.objectContaining({
          previousStatus: 'VERIFIED',
          nextStatus: 'VOIDED',
          pointsReversed: 18,
        }),
      }),
    });
  });

  it('dry-runs auto reversal candidates for suspicious evidence bills', async () => {
    prisma.bill.findMany
      .mockResolvedValueOnce([
        {
          id: 'bill-fake-1',
          billNumber: 'BILL-FAKE-001',
          status: 'VERIFIED',
          storeId: 'store-1',
          totalVnd: 1800000,
          usedAt: new Date('2026-07-03T14:00:00.000Z'),
          submittedAt: new Date('2026-07-03T14:30:00.000Z'),
          store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
          booking: null,
          coupon: null,
          couponIssue: null,
          media: [
            {
              id: 'media-fake-1',
              access: 'PROTECTED',
              originalName: 'fake-bill-template.png',
              mimeType: 'image/png',
            },
          ],
        },
      ] as never)
      .mockResolvedValueOnce([] as never);

    const result = await service.autoReverseSensitiveBills('admin-2', {
      limit: 5,
    });

    expect(result).toEqual(
      expect.objectContaining({
        mode: 'DRY_RUN',
        scannedCount: 1,
        candidateCount: 1,
        reversedCount: 0,
      }),
    );
    expect(result.candidates[0]).toEqual(
      expect.objectContaining({
        billId: 'bill-fake-1',
        warningCodes: ['SUSPICIOUS_EVIDENCE_FILE'],
        reversed: false,
      }),
    );
    expect(prisma.bill.update).not.toHaveBeenCalled();
  });

  it('calculates net revenue without service charge or tax when approving', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-03T10:00:00.000Z'));
    prisma.bill.findFirst.mockResolvedValue({
      id: 'bill-revenue-1',
      billNumber: 'BILL-20260703-ABC12345',
      status: 'SUBMITTED',
      reviewedAt: null,
      verifiedAt: null,
      rejectedAt: null,
      reviewedById: null,
      verifiedById: null,
      rejectedById: null,
      rejectReason: null,
      subtotalVnd: 2000000,
      discountVnd: 0,
      serviceChargeVnd: 100000,
      taxVnd: 50000,
      totalVnd: 2150000,
      paidVnd: 2150000,
      commissionAmountVnd: 0,
      pointsEarned: 0,
      discountRuleSnapshot: null,
      commissionRuleSnapshot: null,
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      booking: { id: 'booking-1', status: 'CONFIRMED' },
      coupon: {
        id: 'coupon-1',
        code: 'MEMBER8',
        name: 'Member 8%',
        discountType: 'PERCENT',
        discountValue: 8,
        maxDiscountVnd: null,
        minSpendVnd: null,
      },
      couponIssue: {
        id: 'issue-1',
        code: 'MEMBER-code',
        status: 'USED',
        metadata: {
          discountPercent: 8,
          discountRuleSnapshot: {
            type: 'PERCENT',
            value: 8,
            discountPercent: 8,
            userType: 'MEMBER',
          },
        },
      },
      user: {
        id: 'member-1',
        displayName: 'Minh',
        role: 'USER',
        tier: 'MEMBER',
      },
      guest: null,
    });
    prisma.commissionConfig.findFirst.mockResolvedValue({
      id: 'commission-1',
      commissionType: 'PERCENT',
      commissionValue: 12,
      minBillVnd: null,
      ruleSnapshot: {
        formula:
          'Admin commission = Original bill x (12% - customer discount %)',
      },
      activeFrom: new Date('2026-01-01T00:00:00.000Z'),
      activeTo: null,
    });
    prisma.bill.update.mockResolvedValue({
      id: 'bill-revenue-1',
      status: 'VERIFIED',
      reviewedAt: new Date('2026-07-03T10:00:00.000Z'),
      verifiedAt: new Date('2026-07-03T10:00:00.000Z'),
      rejectedAt: null,
      reviewedById: 'admin-1',
      verifiedById: 'admin-1',
      rejectedById: null,
      rejectReason: null,
      subtotalVnd: 2000000,
      discountVnd: 160000,
      serviceChargeVnd: 100000,
      taxVnd: 50000,
      totalVnd: 1840000,
      paidVnd: 1990000,
      commissionAmountVnd: 80000,
      pointsEarned: 20,
      discountRuleSnapshot: {
        effectiveDiscountPercent: 8,
        discountVnd: 160000,
      },
      commissionRuleSnapshot: {
        commissionPercent: 12,
        discountPercent: 8,
        commissionVnd: 80000,
      },
    });

    await service.reviewSensitiveBill('admin-1', 'bill-revenue-1', {
      approve: true,
    });

    expect(prisma.commissionConfig.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          storeId: 'store-1',
          status: 'ACTIVE',
          activeFrom: { lte: new Date('2026-07-03T10:00:00.000Z') },
        }),
      }),
    );
    expect(prisma.bill.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'VERIFIED',
          subtotalVnd: 2000000,
          discountVnd: 160000,
          totalVnd: 1840000,
          paidVnd: 1990000,
          commissionAmountVnd: 80000,
          pointsEarned: 20,
          discountRuleSnapshot: expect.objectContaining({
            version: 'ba-v3.2',
            basis: 'bill_gross_before_discount',
            source: 'COUPON_ISSUE_SNAPSHOT',
            grossVnd: 2000000,
            discountVnd: 160000,
            grossRevenueVnd: 2000000,
            netRevenueVnd: 1840000,
            payableVnd: 1990000,
            serviceChargeVnd: 100000,
            taxVnd: 50000,
            effectiveDiscountPercent: 8,
          }),
          commissionRuleSnapshot: expect.objectContaining({
            version: 'ba-v3.2',
            basis: 'bill_gross_before_discount',
            formula: 'grossVnd * (commission_rate - discount_rate)',
            source: 'STORE_COMMISSION_CONFIG',
            grossVnd: 2000000,
            discountVnd: 160000,
            netRevenueVnd: 1840000,
            payableVnd: 1990000,
            serviceChargeVnd: 100000,
            taxVnd: 50000,
            grossCommissionVnd: 240000,
            commissionVnd: 80000,
            commissionAmountVnd: 80000,
            commissionPercent: 12,
            discountPercent: 8,
            requiresPmBaConfirmation: false,
          }),
        }),
      }),
    );
    expect(prisma.pointLedger.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          amountVnd: 2000000,
          points: 20,
        }),
      }),
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        metadata: expect.objectContaining({
          revenueSnapshot: expect.objectContaining({
            grossVnd: 2000000,
            discountVnd: 160000,
            netVnd: 1840000,
            payableVnd: 1990000,
            commissionVnd: 80000,
          }),
        }),
      }),
    });
  });

  it('rejects bill approval when active CommissionConfig is missing', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-03T10:00:00.000Z'));
    prisma.bill.findFirst.mockResolvedValue({
      id: 'bill-missing-commission-config',
      billNumber: 'BILL-20260703-NOCONFIG',
      status: 'SUBMITTED',
      reviewedAt: null,
      verifiedAt: null,
      rejectedAt: null,
      reviewedById: null,
      verifiedById: null,
      rejectedById: null,
      rejectReason: null,
      subtotalVnd: 2000000,
      discountVnd: 0,
      serviceChargeVnd: 100000,
      taxVnd: 50000,
      totalVnd: 2150000,
      paidVnd: 2150000,
      commissionAmountVnd: 0,
      pointsEarned: 0,
      discountRuleSnapshot: null,
      commissionRuleSnapshot: null,
      store: {
        id: 'store-without-config',
        name: 'No Config Club',
        slug: 'no-config',
      },
      booking: { id: 'booking-1', status: 'CONFIRMED' },
      coupon: {
        id: 'coupon-1',
        code: 'MEMBER8',
        name: 'Member 8%',
        discountType: 'PERCENT',
        discountValue: 8,
        maxDiscountVnd: null,
        minSpendVnd: null,
      },
      couponIssue: null,
      user: {
        id: 'member-1',
        displayName: 'Minh',
        role: 'USER',
        tier: 'MEMBER',
      },
      guest: null,
    });
    prisma.commissionConfig.findFirst.mockResolvedValue(null);

    expect.assertions(6);
    try {
      await service.reviewSensitiveBill(
        'admin-1',
        'bill-missing-commission-config',
        {
          approve: true,
        },
      );
      throw new Error('Expected approval to require active CommissionConfig');
    } catch (error) {
      expect(error).toBeInstanceOf(UnprocessableEntityException);
      const exception = error as UnprocessableEntityException;
      expect(exception.getStatus()).toBe(422);
      expect(exception.getResponse()).toEqual(
        expect.objectContaining({
          code: 'MISSING_ACTIVE_COMMISSION_CONFIG',
          flags: ['MISSING_ACTIVE_COMMISSION_CONFIG'],
          reason:
            'Bill approval requires an active CommissionConfig before commission can be calculated.',
          store: expect.objectContaining({
            id: 'store-without-config',
            name: 'No Config Club',
          }),
        }),
      );
    }

    expect(prisma.bill.update).not.toHaveBeenCalled();
    expect(prisma.auditLog.create).not.toHaveBeenCalled();
    expect(adminNotificationService.notifyBillReviewed).not.toHaveBeenCalled();
  });

  it('flags bill approval when discount makes admin commission negative', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-03T10:00:00.000Z'));
    prisma.bill.findFirst.mockResolvedValue({
      id: 'bill-negative-commission',
      billNumber: 'BILL-20260703-NEGATIVE',
      status: 'SUBMITTED',
      reviewedAt: null,
      verifiedAt: null,
      rejectedAt: null,
      reviewedById: null,
      verifiedById: null,
      rejectedById: null,
      rejectReason: null,
      subtotalVnd: 1000000,
      discountVnd: 0,
      serviceChargeVnd: 0,
      taxVnd: 0,
      totalVnd: 1000000,
      paidVnd: 1000000,
      commissionAmountVnd: 0,
      pointsEarned: 0,
      discountRuleSnapshot: null,
      commissionRuleSnapshot: null,
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      booking: null,
      coupon: {
        id: 'coupon-1',
        code: 'VIP8',
        name: 'VIP 8%',
        discountType: 'PERCENT',
        discountValue: 8,
        maxDiscountVnd: null,
        minSpendVnd: null,
      },
      couponIssue: {
        id: 'issue-negative',
        code: 'VIP-code',
        status: 'USED',
        metadata: {
          discountPercent: 8,
          discountRuleSnapshot: {
            type: 'PERCENT',
            value: 8,
            discountPercent: 8,
            userType: 'VIP',
          },
        },
      },
      user: null,
      guest: { id: 'guest-1', displayName: 'Walk-in', phone: '+84901234567' },
    });
    prisma.commissionConfig.findFirst.mockResolvedValue({
      id: 'commission-low',
      commissionType: 'PERCENT',
      commissionValue: 5,
      minBillVnd: null,
      ruleSnapshot: {
        formula:
          'Admin commission = Original bill x (5% - customer discount %)',
      },
      activeFrom: new Date('2026-01-01T00:00:00.000Z'),
      activeTo: null,
    });
    prisma.bill.update.mockResolvedValue({
      id: 'bill-negative-commission',
      status: 'PENDING_PM_BA',
      reviewedAt: new Date('2026-07-03T10:00:00.000Z'),
      verifiedAt: null,
      rejectedAt: null,
      reviewedById: 'admin-1',
      verifiedById: null,
      rejectedById: null,
      rejectReason: null,
      subtotalVnd: 1000000,
      discountVnd: 80000,
      totalVnd: 920000,
      paidVnd: 920000,
      commissionAmountVnd: -30000,
      pointsEarned: 0,
      discountRuleSnapshot: {
        effectiveDiscountPercent: 8,
        discountVnd: 80000,
      },
      commissionRuleSnapshot: {
        commissionPercent: 5,
        discountPercent: 8,
        commissionVnd: -30000,
        requiresPmBaConfirmation: true,
      },
    });

    await service.reviewSensitiveBill('admin-1', 'bill-negative-commission', {
      approve: true,
    });

    expect(prisma.bill.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'PENDING_PM_BA',
          verifiedAt: null,
          verifiedById: null,
          subtotalVnd: 1000000,
          discountVnd: 80000,
          totalVnd: 920000,
          paidVnd: 920000,
          commissionAmountVnd: -30000,
          commissionRuleSnapshot: expect.objectContaining({
            grossCommissionVnd: 50000,
            commissionVnd: -30000,
            commissionPercent: 5,
            discountPercent: 8,
            requiresPmBaConfirmation: true,
            workflowStatus: 'PENDING_PM_BA',
            pmBaConfirmationRequired: true,
            pmBaConfirmationConfirmed: false,
            pmBaConfirmationReason:
              'Commission is negative because discount rate is higher than commission rate.',
            flags: ['NEGATIVE_COMMISSION_PM_BA_CONFIRMATION_REQUIRED'],
          }),
        }),
      }),
    );
    expect(adminNotificationService.notifyBillReviewed).not.toHaveBeenCalled();
  });

  it('verifies a negative commission bill after PM/BA confirmation with reason', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-03T10:00:00.000Z'));
    prisma.bill.findFirst.mockResolvedValue({
      id: 'bill-negative-confirm',
      billNumber: 'BILL-20260703-PMBA',
      status: 'PENDING_PM_BA',
      reviewedAt: new Date('2026-07-03T09:00:00.000Z'),
      verifiedAt: null,
      rejectedAt: null,
      reviewedById: 'admin-1',
      verifiedById: null,
      rejectedById: null,
      rejectReason: null,
      subtotalVnd: 1000000,
      discountVnd: 0,
      serviceChargeVnd: 0,
      taxVnd: 0,
      totalVnd: 1000000,
      paidVnd: 1000000,
      commissionAmountVnd: -30000,
      pointsEarned: 0,
      discountRuleSnapshot: null,
      commissionRuleSnapshot: {
        flags: ['NEGATIVE_COMMISSION_PM_BA_CONFIRMATION_REQUIRED'],
      },
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      booking: null,
      coupon: {
        id: 'coupon-1',
        code: 'VIP8',
        name: 'VIP 8%',
        discountType: 'PERCENT',
        discountValue: 8,
        maxDiscountVnd: null,
        minSpendVnd: null,
      },
      couponIssue: {
        id: 'issue-negative',
        code: 'VIP-code',
        status: 'USED',
        metadata: { discountPercent: 8 },
      },
      user: null,
      guest: { id: 'guest-1', displayName: 'Walk-in', phone: '+84901234567' },
    });
    prisma.commissionConfig.findFirst.mockResolvedValue({
      id: 'commission-low',
      commissionType: 'PERCENT',
      commissionValue: 5,
      minBillVnd: null,
      ruleSnapshot: {},
      activeFrom: new Date('2026-01-01T00:00:00.000Z'),
      activeTo: null,
    });
    prisma.bill.update.mockResolvedValue({
      id: 'bill-negative-confirm',
      status: 'VERIFIED',
      reviewedAt: new Date('2026-07-03T10:00:00.000Z'),
      verifiedAt: new Date('2026-07-03T10:00:00.000Z'),
      rejectedAt: null,
      reviewedById: 'admin-1',
      verifiedById: 'admin-1',
      rejectedById: null,
      rejectReason: null,
      subtotalVnd: 1000000,
      discountVnd: 80000,
      totalVnd: 920000,
      paidVnd: 920000,
      commissionAmountVnd: -30000,
      pointsEarned: 0,
      discountRuleSnapshot: null,
      commissionRuleSnapshot: {},
    });

    await service.reviewSensitiveBill('admin-1', 'bill-negative-confirm', {
      approve: true,
      confirmNegativeCommission: true,
      pmBaReason: 'PM approved campaign loss leader.',
    });

    expect(prisma.bill.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'VERIFIED',
          verifiedById: 'admin-1',
          commissionRuleSnapshot: expect.objectContaining({
            workflowStatus: 'VERIFIED',
            pmBaConfirmationRequired: true,
            pmBaConfirmationConfirmed: true,
            pmBaConfirmation: expect.objectContaining({
              status: 'CONFIRMED',
              reason: 'PM approved campaign loss leader.',
            }),
          }),
        }),
      }),
    );
    expect(adminNotificationService.notifyBillReviewed).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'bill-negative-confirm',
        status: 'VERIFIED',
      }),
      expect.objectContaining({ approve: true, reviewedById: 'admin-1' }),
    );
  });

  it('voids a verified bill and writes an idempotent point reversal ledger', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-04T10:00:00.000Z'));
    prisma.bill.findFirst.mockResolvedValue({
      id: 'bill-void-1',
      billNumber: 'BILL-VOID-1',
      status: 'VERIFIED',
      reviewedAt: new Date('2026-07-03T10:00:00.000Z'),
      verifiedAt: new Date('2026-07-03T10:00:00.000Z'),
      rejectedAt: null,
      reviewedById: 'admin-1',
      verifiedById: 'admin-1',
      rejectedById: null,
      rejectReason: null,
      subtotalVnd: 2000000,
      discountVnd: 0,
      serviceChargeVnd: 0,
      taxVnd: 0,
      totalVnd: 2000000,
      paidVnd: 2000000,
      commissionAmountVnd: 200000,
      pointsEarned: 20,
      discountRuleSnapshot: null,
      commissionRuleSnapshot: null,
      pointRuleSnapshot: null,
      submittedAt: new Date('2026-07-03T09:00:00.000Z'),
      updatedAt: new Date('2026-07-03T10:00:00.000Z'),
      usedAt: new Date('2026-07-03T09:00:00.000Z'),
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      booking: { id: 'booking-1', status: 'CONFIRMED', scheduledAt: null },
      coupon: null,
      couponIssue: null,
      user: { id: 'member-1', displayName: 'Minh', tier: 'MEMBER' },
      guest: null,
      pointLedgers: [
        {
          id: 'ledger-earn-1',
          userId: 'member-1',
          bookingId: 'booking-1',
          amountVnd: 2000000,
          points: 20,
          ruleSnapshot: null,
          postedAt: new Date('2026-07-03T10:00:00.000Z'),
        },
      ],
    });
    prisma.bill.update.mockResolvedValue({
      id: 'bill-void-1',
      status: 'VOIDED',
      reviewedAt: new Date('2026-07-04T10:00:00.000Z'),
      verifiedAt: new Date('2026-07-03T10:00:00.000Z'),
      rejectedAt: null,
      reviewedById: 'admin-2',
      verifiedById: 'admin-1',
      rejectedById: null,
      rejectReason: 'Refunded',
      subtotalVnd: 2000000,
      discountVnd: 0,
      totalVnd: 2000000,
      paidVnd: 2000000,
      commissionAmountVnd: 200000,
      pointsEarned: 0,
      discountRuleSnapshot: null,
      commissionRuleSnapshot: null,
      pointRuleSnapshot: null,
    });

    await service.voidSensitiveBill('admin-2', 'bill-void-1', {
      reason: 'Refunded',
      refundReference: 'REF-1',
    });

    expect(prisma.pointLedger.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { billId_type: { billId: 'bill-void-1', type: 'REVERSE' } },
        create: expect.objectContaining({
          userId: 'member-1',
          billId: 'bill-void-1',
          reversedLedgerId: 'ledger-earn-1',
          type: 'REVERSE',
          status: 'POSTED',
          amountVnd: -2000000,
          points: -20,
        }),
      }),
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'bill.review.void',
        targetId: 'bill-void-1',
        metadata: expect.objectContaining({
          reversedPoints: 20,
          refundReference: 'REF-1',
        }),
      }),
    });
  });

  it('creates a campaign commission override inside CommissionConfig ruleSnapshot', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-04T10:00:00.000Z'));
    prisma.commissionConfig.findFirst.mockResolvedValue({
      id: 'commission-config-1',
      storeId: 'store-1',
      commissionType: 'PERCENT',
      commissionValue: 15,
      ruleSnapshot: { version: 'ba-v3.2' },
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
    });
    prisma.coupon.findFirst.mockResolvedValue({
      id: 'coupon-1',
      code: 'WELCOME20',
      name: 'Welcome 20%',
      storeId: 'store-1',
    });
    prisma.commissionConfig.update.mockResolvedValue({
      id: 'commission-config-1',
      storeId: 'store-1',
      commissionType: 'PERCENT',
      commissionValue: 15,
      ruleSnapshot: {},
      updatedAt: new Date('2026-07-04T10:00:00.000Z'),
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
    });

    await service.createAdminCommissionOverride('admin-1', {
      storeId: 'store-1',
      couponId: 'coupon-1',
      commissionPercent: 18,
      note: 'PM override',
      active: true,
    });

    expect(prisma.commissionConfig.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'commission-config-1' },
        data: {
          ruleSnapshot: expect.objectContaining({
            version: 'ba-v3.2',
            campaignCommissionOverrides: [
              expect.objectContaining({
                couponId: 'coupon-1',
                couponCode: 'WELCOME20',
                commissionPercent: 18,
                active: true,
              }),
            ],
            campaignCommissionRates: expect.objectContaining({
              'coupon-1': expect.objectContaining({ commissionPercent: 18 }),
              WELCOME20: expect.objectContaining({ commissionPercent: 18 }),
            }),
          }),
        },
      }),
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'commission.override.create',
        targetType: 'CommissionConfig',
        targetId: 'commission-config-1',
      }),
    });
  });

  it('returns the member point balance from posted point ledgers', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-03T10:00:00.000Z'));
    prisma.pointLedger.findMany.mockResolvedValue([
      {
        id: 'ledger-earn-active',
        type: 'EARN',
        amountVnd: 18000000,
        points: 180,
        billId: 'bill-1',
        bookingId: 'booking-1',
        description: 'Approved bill points',
        expiresAt: new Date('2027-07-03T10:00:00.000Z'),
        postedAt: new Date('2026-07-03T10:00:00.000Z'),
        createdAt: new Date('2026-07-03T10:00:00.000Z'),
      },
      {
        id: 'ledger-adjust-active',
        type: 'ADJUST',
        amountVnd: 0,
        points: 6,
        billId: null,
        bookingId: null,
        description: 'Manual point adjustment',
        expiresAt: new Date('2026-07-10T10:00:00.000Z'),
        postedAt: new Date('2026-07-02T10:00:00.000Z'),
        createdAt: new Date('2026-07-02T10:00:00.000Z'),
      },
      {
        id: 'ledger-redeem',
        type: 'REDEEM',
        amountVnd: 0,
        points: 20,
        billId: null,
        bookingId: null,
        description: 'Redeemed points',
        expiresAt: null,
        postedAt: new Date('2026-07-01T10:00:00.000Z'),
        createdAt: new Date('2026-07-01T10:00:00.000Z'),
      },
      {
        id: 'ledger-reverse',
        type: 'REVERSE',
        amountVnd: 0,
        points: 10,
        billId: 'bill-reversed',
        bookingId: null,
        description: 'Reversed points',
        expiresAt: null,
        postedAt: new Date('2026-06-30T10:00:00.000Z'),
        createdAt: new Date('2026-06-30T10:00:00.000Z'),
      },
      {
        id: 'ledger-expired',
        type: 'EARN',
        amountVnd: 4000000,
        points: 40,
        billId: 'bill-old',
        bookingId: null,
        description: 'Expired bill points',
        expiresAt: new Date('2026-06-01T10:00:00.000Z'),
        postedAt: new Date('2025-06-01T10:00:00.000Z'),
        createdAt: new Date('2025-06-01T10:00:00.000Z'),
      },
    ] as never);

    const summary = await service.getMemberPointSummary('member-1');

    expect(prisma.pointLedger.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: 'member-1',
          status: 'POSTED',
        },
      }),
    );
    expect(summary).toMatchObject({
      availablePoints: 156,
      earnedPoints: 186,
      spentPoints: 30,
      expiredPoints: 40,
      expiringSoonPoints: 6,
      nextTierName: 'Premium+',
      nextTierThreshold: 250,
      pointsToNextTier: 94,
      progressPercent: 62,
      asOf: '2026-07-03T10:00:00.000Z',
    });
    expect(summary.recentLedgers).toHaveLength(5);
  });

  it('adds a posted loyalty point ledger for member bills after approval', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-03T10:00:00.000Z'));
    prisma.bill.findFirst.mockResolvedValue({
      id: 'bill-member-1',
      status: 'SUBMITTED',
      reviewedAt: null,
      verifiedAt: null,
      rejectedAt: null,
      reviewedById: null,
      verifiedById: null,
      rejectedById: null,
      rejectReason: null,
      subtotalVnd: 1800000,
      totalVnd: 2080000,
      commissionAmountVnd: 180000,
      pointsEarned: 0,
      booking: { id: 'booking-1', status: 'CONFIRMED' },
      user: { id: 'member-1', displayName: 'Minh', role: 'USER', tier: 'VIP' },
      guest: null,
    });
    prisma.bill.update.mockResolvedValue({
      id: 'bill-member-1',
      status: 'VERIFIED',
      reviewedAt: new Date('2026-07-03T10:00:00.000Z'),
      verifiedAt: new Date('2026-07-03T10:00:00.000Z'),
      rejectedAt: null,
      reviewedById: 'admin-1',
      verifiedById: 'admin-1',
      rejectedById: null,
      rejectReason: null,
      subtotalVnd: 1800000,
      totalVnd: 2080000,
      commissionAmountVnd: 180000,
      pointsEarned: 18,
    });

    await service.reviewSensitiveBill('admin-1', 'bill-member-1', {
      approve: true,
    });

    expect(prisma.bill.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'VERIFIED',
          pointsEarned: 18,
          pointRuleSnapshot: expect.objectContaining({
            version: 'v2.2',
            basis: 'bill_subtotal_vnd',
            amountVnd: 1800000,
            vndPerPoint: 100000,
            pointsPerMillionVnd: 10,
            expiresAfterDays: 365,
          }),
        }),
      }),
    );
    expect(prisma.pointLedger.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          billId_type: {
            billId: 'bill-member-1',
            type: 'EARN',
          },
        },
        create: expect.objectContaining({
          userId: 'member-1',
          bookingId: 'booking-1',
          billId: 'bill-member-1',
          type: 'EARN',
          status: 'POSTED',
          amountVnd: 1800000,
          points: 18,
          expiresAt: new Date('2027-07-03T10:00:00.000Z'),
          postedAt: new Date('2026-07-03T10:00:00.000Z'),
          ruleSnapshot: expect.objectContaining({
            version: 'v2.2',
            amountVnd: 1800000,
            vndPerPoint: 100000,
          }),
        }),
        update: expect.objectContaining({
          userId: 'member-1',
          amountVnd: 1800000,
          points: 18,
          status: 'POSTED',
        }),
      }),
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        metadata: expect.objectContaining({
          loyaltyPoints: 18,
          loyaltyAmountVnd: 1800000,
          loyaltyExpiresAt: '2027-07-03T10:00:00.000Z',
        }),
      }),
    });
  });

  it('does not add loyalty points for guest bills', async () => {
    prisma.bill.findFirst.mockResolvedValue({
      id: 'bill-guest-1',
      status: 'SUBMITTED',
      reviewedAt: null,
      verifiedAt: null,
      rejectedAt: null,
      reviewedById: null,
      verifiedById: null,
      rejectedById: null,
      rejectReason: null,
      subtotalVnd: 1800000,
      totalVnd: 1800000,
      commissionAmountVnd: 180000,
      pointsEarned: 0,
      booking: null,
      user: null,
      guest: { id: 'guest-1', displayName: 'Walk-in', phone: '+84901234567' },
    });
    prisma.bill.update.mockResolvedValue({
      id: 'bill-guest-1',
      status: 'VERIFIED',
      reviewedAt: new Date('2026-07-03T10:00:00.000Z'),
      verifiedAt: new Date('2026-07-03T10:00:00.000Z'),
      rejectedAt: null,
      reviewedById: 'admin-1',
      verifiedById: 'admin-1',
      rejectedById: null,
      rejectReason: null,
      totalVnd: 1800000,
      commissionAmountVnd: 180000,
      pointsEarned: 0,
    });

    await service.reviewSensitiveBill('admin-1', 'bill-guest-1', {
      approve: true,
    });

    expect(prisma.bill.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'VERIFIED',
          pointsEarned: 0,
        }),
      }),
    );
    expect(prisma.pointLedger.upsert).not.toHaveBeenCalled();
  });

  it('does not add loyalty points when rejecting a bill', async () => {
    prisma.bill.findFirst.mockResolvedValue({
      id: 'bill-reject-1',
      status: 'SUBMITTED',
      reviewedAt: null,
      verifiedAt: null,
      rejectedAt: null,
      reviewedById: null,
      verifiedById: null,
      rejectedById: null,
      rejectReason: null,
      subtotalVnd: 1800000,
      totalVnd: 1800000,
      commissionAmountVnd: 180000,
      pointsEarned: 0,
      user: { id: 'member-1', displayName: 'Minh', role: 'USER', tier: 'VIP' },
      guest: null,
    });
    prisma.bill.update.mockResolvedValue({
      id: 'bill-reject-1',
      status: 'REJECTED',
      reviewedAt: new Date('2026-07-03T10:00:00.000Z'),
      verifiedAt: null,
      rejectedAt: new Date('2026-07-03T10:00:00.000Z'),
      reviewedById: 'admin-1',
      verifiedById: null,
      rejectedById: 'admin-1',
      rejectReason: 'Invalid receipt',
      totalVnd: 1800000,
      commissionAmountVnd: 180000,
      pointsEarned: 0,
    });

    await service.reviewSensitiveBill('admin-1', 'bill-reject-1', {
      approve: false,
      rejectReason: 'Invalid receipt',
    });

    expect(prisma.pointLedger.upsert).not.toHaveBeenCalled();
    expect(prisma.bill.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'REJECTED',
          rejectReason: 'Invalid receipt',
        }),
      }),
    );
  });

  it('returns not found before updating when reviewing a missing sensitive bill', async () => {
    prisma.bill.findFirst.mockResolvedValue(null);

    await expect(
      service.reviewSensitiveBill('admin-1', 'missing-bill', {
        approve: true,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.bill.update).not.toHaveBeenCalled();
    expect(prisma.auditLog.create).not.toHaveBeenCalled();
  });

  it('returns booking, coupon, and coupon issue relations for admin sensitive bills', async () => {
    prisma.bill.findMany.mockResolvedValue([
      {
        id: 'bill-1',
        billNumber: 'BILL-20260701-ABC12345',
        status: 'SUBMITTED',
        submitterType: 'MEMBER',
        totalVnd: 1800000,
        store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
        booking: {
          id: 'booking-1',
          status: 'CONFIRMED',
          scheduledAt: new Date('2026-07-01T14:00:00.000Z'),
        },
        coupon: {
          id: 'coupon-1',
          code: 'WELCOME20',
          name: 'Welcome 20%',
        },
        couponIssue: {
          id: 'issue-1',
          code: 'MEMBER-code',
          status: 'USED',
        },
        user: null,
        guest: null,
        media: [
          {
            id: 'media-bill-1',
            storageKey: 'bill-proof.png',
            originalName: 'bill-proof.png',
            mimeType: 'image/png',
            access: 'PROTECTED',
            url: 'http://localhost:3001/storage/files/bill-proof.png',
          },
        ],
      },
    ] as never);

    await expect(
      service.listSensitiveBillsForAdmin(
        {
          id: 'admin-1',
          role: 'ADMIN',
        },
        {
          bookingId: 'booking-1',
          bookingCode: 'BK-BOOKING-',
          couponId: 'coupon-1',
          couponIssueId: 'issue-1',
        },
      ),
    ).resolves.toEqual([
      expect.objectContaining({
        booking: {
          id: 'booking-1',
          status: 'CONFIRMED',
          scheduledAt: new Date('2026-07-01T14:00:00.000Z'),
        },
        coupon: {
          id: 'coupon-1',
          code: 'WELCOME20',
          name: 'Welcome 20%',
        },
        couponIssue: {
          id: 'issue-1',
          code: 'MEMBER-code',
          status: 'USED',
        },
        submitterType: 'MEMBER',
        media: [
          expect.objectContaining({
            id: 'media-bill-1',
            access: 'PROTECTED',
          }),
        ],
      }),
    ]);

    expect(prisma.bill.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          bookingId: 'booking-1',
          couponId: 'coupon-1',
          couponIssueId: 'issue-1',
        }),
        select: expect.objectContaining({
          submitterType: true,
          booking: { select: { id: true, status: true, scheduledAt: true } },
          coupon: {
            select: expect.objectContaining({
              id: true,
              code: true,
              name: true,
              minSpendVnd: true,
            }),
          },
          couponIssue: { select: { id: true, code: true, status: true } },
          media: expect.objectContaining({
            select: expect.objectContaining({ access: true, url: true }),
          }),
        }),
      }),
    );
  });

  it('adds fraud warnings for duplicate or fake bill evidence', async () => {
    prisma.bill.findMany
      .mockResolvedValueOnce([
        {
          id: 'bill-fraud-1',
          billNumber: 'BILL-FRAUD-1',
          storeId: 'store-1',
          status: 'SUBMITTED',
          submitterType: 'MEMBER',
          totalVnd: 500000,
          usedAt: new Date('2026-07-01T10:00:00.000Z'),
          store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
          booking: null,
          coupon: {
            id: 'coupon-1',
            code: 'WELCOME20',
            name: 'Welcome 20%',
            minSpendVnd: 1000000,
          },
          couponIssue: null,
          user: null,
          guest: null,
          media: [],
        },
      ] as never)
      .mockResolvedValueOnce([
        {
          id: 'bill-duplicate-1',
          billNumber: 'BILL-DUPLICATE-1',
          status: 'SUBMITTED',
        },
      ] as never);

    const result = await service.listSensitiveBillsForAdmin({
      id: 'admin-1',
      role: 'ADMIN',
    });
    const firstBill = result[0] as {
      fraudWarnings: Array<{ code: string }>;
    };

    expect(firstBill.fraudWarnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'NO_EVIDENCE_MEDIA' }),
        expect.objectContaining({ code: 'TOTAL_BELOW_MIN_SPEND' }),
        expect.objectContaining({ code: 'POSSIBLE_DUPLICATE_BILL' }),
      ]),
    );
  });

  it('returns the P0 revenue report grouped by used date, store, and coupon', async () => {
    prisma.bill.findMany.mockResolvedValue([
      {
        id: 'bill-1',
        billNumber: 'BILL-20260701-ABC12345',
        status: 'VERIFIED',
        usedAt: new Date('2026-07-01T14:00:00.000Z'),
        subtotalVnd: 2000000,
        discountVnd: 200000,
        serviceChargeVnd: 100000,
        taxVnd: 50000,
        totalVnd: 1800000,
        paidVnd: 1950000,
        commissionAmountVnd: 180000,
        store: {
          id: 'store-1',
          name: 'Neon Club',
          slug: 'neon-club',
          city: 'Ho Chi Minh City',
          district: 'District 1',
          partnerAccount: {
            id: 'partner-1',
            businessName: 'Neon Partner',
            status: 'ACTIVE',
          },
          area: {
            id: 'area-1',
            code: 'D1',
            name: 'District 1',
            city: 'Ho Chi Minh City',
            district: 'District 1',
          },
        },
        coupon: { id: 'coupon-1', code: 'WELCOME20', name: 'Welcome 20%' },
        couponIssue: { id: 'issue-1', code: 'MEMBER-code', status: 'USED' },
        booking: {
          id: 'booking-1',
          bookingCode: 'BOOK-1',
          cast: { id: 'cast-1', stageName: 'Mika', slug: 'mika' },
        },
      },
      {
        id: 'bill-2',
        billNumber: 'BILL-20260701-DEF67890',
        status: 'PAID',
        usedAt: new Date('2026-07-01T16:00:00.000Z'),
        subtotalVnd: 1000000,
        discountVnd: 0,
        serviceChargeVnd: 0,
        taxVnd: 0,
        totalVnd: 1000000,
        paidVnd: 1000000,
        commissionAmountVnd: 100000,
        store: {
          id: 'store-1',
          name: 'Neon Club',
          slug: 'neon-club',
          city: 'Ho Chi Minh City',
          district: 'District 1',
          partnerAccount: {
            id: 'partner-1',
            businessName: 'Neon Partner',
            status: 'ACTIVE',
          },
          area: {
            id: 'area-1',
            code: 'D1',
            name: 'District 1',
            city: 'Ho Chi Minh City',
            district: 'District 1',
          },
        },
        coupon: { id: 'coupon-1', code: 'WELCOME20', name: 'Welcome 20%' },
        couponIssue: null,
        booking: null,
      },
      {
        id: 'bill-3',
        billNumber: 'BILL-20260702-GHI13579',
        status: 'VERIFIED',
        usedAt: new Date('2026-07-02T13:00:00.000Z'),
        subtotalVnd: 500000,
        discountVnd: 0,
        serviceChargeVnd: 0,
        taxVnd: 0,
        totalVnd: 500000,
        paidVnd: 500000,
        commissionAmountVnd: 50000,
        store: { id: 'store-2', name: 'Velvet Lounge', slug: 'velvet' },
        coupon: null,
        couponIssue: null,
        booking: null,
      },
    ] as never);

    const report = await service.getAdminRevenueReport(
      { id: 'admin-1', role: 'ADMIN' },
      {
        from: '2026-07-01T00:00:00.000Z',
        to: '2026-07-02T23:59:59.999Z',
        timezone: 'UTC',
      },
    );

    expect(report).toMatchObject({
      filters: {
        from: '2026-07-01T00:00:00.000Z',
        to: '2026-07-02T23:59:59.999Z',
        fromDate: '2026-07-01',
        toDate: '2026-07-02',
        timezone: 'UTC',
        dateField: 'usedAt',
        statusIn: ['VERIFIED', 'PAID'],
        billStatusIncluded: ['VERIFIED', 'PAID'],
        storeId: null,
        couponId: null,
        flag: null,
        partnerAccountId: null,
        areaId: null,
        castId: null,
        exportEnabled: false,
        exportFormats: [],
      },
      meta: expect.objectContaining({
        billStatusIncluded: ['VERIFIED', 'PAID'],
        timezone: 'UTC',
        generatedAt: expect.any(String),
        exportEnabled: false,
        exportFormats: [],
        formula: {
          grossVnd: 'subtotalVnd',
          discountVnd: 'discountVnd',
          netVnd: 'subtotalVnd - discountVnd',
          payableVnd: 'netVnd + serviceChargeVnd + taxVnd',
          commissionVnd: 'commissionAmountVnd',
        },
      }),
      totals: {
        billCount: 3,
        grossVnd: 3500000,
        discountVnd: 200000,
        netVnd: 3300000,
        payableVnd: 3450000,
        commissionVnd: 330000,
      },
      days: [
        {
          date: '2026-07-01',
          billCount: 2,
          grossVnd: 3000000,
          discountVnd: 200000,
          netVnd: 2800000,
          payableVnd: 2950000,
          commissionVnd: 280000,
          stores: [
            {
              store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
              billCount: 2,
              grossVnd: 3000000,
              discountVnd: 200000,
              netVnd: 2800000,
              payableVnd: 2950000,
              commissionVnd: 280000,
              coupons: [
                {
                  coupon: {
                    id: 'coupon-1',
                    code: 'WELCOME20',
                    name: 'Welcome 20%',
                  },
                  billCount: 2,
                  grossVnd: 3000000,
                  discountVnd: 200000,
                  netVnd: 2800000,
                  payableVnd: 2950000,
                  commissionVnd: 280000,
                  bills: [
                    expect.objectContaining({
                      id: 'bill-1',
                      billNumber: 'BILL-20260701-ABC12345',
                      status: 'VERIFIED',
                      usedAt: '2026-07-01T14:00:00.000Z',
                      billCount: 1,
                      grossVnd: 2000000,
                      discountVnd: 200000,
                      netVnd: 1800000,
                      commissionVnd: 180000,
                    }),
                    expect.objectContaining({
                      id: 'bill-2',
                      billNumber: 'BILL-20260701-DEF67890',
                      status: 'PAID',
                      usedAt: '2026-07-01T16:00:00.000Z',
                      billCount: 1,
                      grossVnd: 1000000,
                      discountVnd: 0,
                      netVnd: 1000000,
                      commissionVnd: 100000,
                    }),
                  ],
                },
              ],
            },
          ],
        },
        {
          date: '2026-07-02',
          billCount: 1,
          grossVnd: 500000,
          discountVnd: 0,
          netVnd: 500000,
          payableVnd: 500000,
          commissionVnd: 50000,
          stores: [
            {
              store: { id: 'store-2', name: 'Velvet Lounge', slug: 'velvet' },
              billCount: 1,
              grossVnd: 500000,
              discountVnd: 0,
              netVnd: 500000,
              payableVnd: 500000,
              commissionVnd: 50000,
              coupons: [
                {
                  coupon: {
                    id: null,
                    code: 'NO_COUPON',
                    name: 'Khong dung ma',
                  },
                  billCount: 1,
                  grossVnd: 500000,
                  discountVnd: 0,
                  netVnd: 500000,
                  payableVnd: 500000,
                  commissionVnd: 50000,
                  bills: [
                    expect.objectContaining({
                      id: 'bill-3',
                      billNumber: 'BILL-20260702-GHI13579',
                      status: 'VERIFIED',
                      usedAt: '2026-07-02T13:00:00.000Z',
                      billCount: 1,
                      grossVnd: 500000,
                      discountVnd: 0,
                      netVnd: 500000,
                      commissionVnd: 50000,
                    }),
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
    expect(report).not.toHaveProperty('breakdowns');
    expect(report).not.toHaveProperty('funnel');
    expect(report).not.toHaveProperty('comparison');

    expect(prisma.bill.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
          status: { in: ['VERIFIED', 'PAID'] },
          usedAt: {
            gte: new Date('2026-07-01T00:00:00.000Z'),
            lte: new Date('2026-07-02T23:59:59.999Z'),
          },
        }),
        select: expect.objectContaining({
          billNumber: true,
          status: true,
          usedAt: true,
          subtotalVnd: true,
          discountVnd: true,
          serviceChargeVnd: true,
          taxVnd: true,
          totalVnd: true,
          paidVnd: true,
          commissionAmountVnd: true,
          store: {
            select: expect.objectContaining({
              id: true,
              name: true,
              slug: true,
            }),
          },
          coupon: { select: { id: true, code: true, name: true } },
          couponIssue: { select: { id: true, code: true, status: true } },
          booking: {
            select: expect.objectContaining({
              id: true,
            }),
          },
        }),
      }),
    );
  });

  it('filters the revenue report by commission snapshot flag', async () => {
    prisma.bill.findMany.mockResolvedValue([] as never);

    await expect(
      service.getAdminRevenueReport(
        { id: 'admin-1', role: 'ADMIN' },
        {
          from: '2026-07-01T00:00:00.000Z',
          to: '2026-07-02T23:59:59.999Z',
          flag: 'NEGATIVE_COMMISSION_PM_BA_CONFIRMATION_REQUIRED',
        },
      ),
    ).resolves.toMatchObject({
      filters: {
        flag: 'NEGATIVE_COMMISSION_PM_BA_CONFIRMATION_REQUIRED',
      },
      totals: {
        billCount: 0,
        payableVnd: 0,
      },
      days: [],
    });

    expect(prisma.bill.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          commissionRuleSnapshot: {
            path: ['flags'],
            array_contains: ['NEGATIVE_COMMISSION_PM_BA_CONFIRMATION_REQUIRED'],
          },
        }),
      }),
    );
  });

  it('uses Asia/Ho_Chi_Minh date boundaries for service usage dates', async () => {
    prisma.bill.findMany.mockResolvedValue([
      {
        id: 'bill-vn-0030',
        billNumber: 'BILL-VN-0030',
        status: 'VERIFIED',
        usedAt: new Date('2026-06-30T17:30:00.000Z'),
        subtotalVnd: 2000000,
        discountVnd: 160000,
        serviceChargeVnd: 0,
        taxVnd: 0,
        totalVnd: 1840000,
        paidVnd: 1840000,
        commissionAmountVnd: 80000,
        store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
        coupon: { id: 'coupon-1', code: 'MEMBER8', name: 'Member 8%' },
        couponIssue: { id: 'issue-1', code: 'MEMBER-code', status: 'USED' },
      },
      {
        id: 'bill-vn-2330',
        billNumber: 'BILL-VN-2330',
        status: 'PAID',
        usedAt: new Date('2026-07-01T16:30:00.000Z'),
        subtotalVnd: 1000000,
        discountVnd: 0,
        serviceChargeVnd: 0,
        taxVnd: 0,
        totalVnd: 1000000,
        paidVnd: 1000000,
        commissionAmountVnd: 100000,
        store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
        coupon: null,
        couponIssue: null,
      },
    ] as never);

    const report = await service.getAdminRevenueReport(
      { id: 'admin-1', role: 'ADMIN' },
      {
        fromDate: '2026-07-01',
        toDate: '2026-07-01',
        timezone: 'Asia/Ho_Chi_Minh',
      },
    );

    expect(prisma.bill.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
          status: { in: ['VERIFIED', 'PAID'] },
          usedAt: {
            gte: new Date('2026-06-30T17:00:00.000Z'),
            lte: new Date('2026-07-01T16:59:59.999Z'),
          },
        }),
      }),
    );
    expect(report.filters).toEqual(
      expect.objectContaining({
        from: '2026-06-30T17:00:00.000Z',
        to: '2026-07-01T16:59:59.999Z',
        fromDate: '2026-07-01',
        toDate: '2026-07-01',
        timezone: 'Asia/Ho_Chi_Minh',
        billStatusIncluded: ['VERIFIED', 'PAID'],
        exportEnabled: false,
        exportFormats: [],
      }),
    );
    expect(report.meta).toEqual(
      expect.objectContaining({
        billStatusIncluded: ['VERIFIED', 'PAID'],
        timezone: 'Asia/Ho_Chi_Minh',
        generatedAt: expect.any(String),
      }),
    );
    expect(report.days).toHaveLength(1);
    expect(report.days[0]).toEqual(
      expect.objectContaining({
        date: '2026-07-01',
        billCount: 2,
        grossVnd: 3000000,
        discountVnd: 160000,
        netVnd: 2840000,
        commissionVnd: 180000,
      }),
    );
    expect(report.days[0].stores[0].coupons).toEqual([
      expect.objectContaining({
        coupon: { id: 'coupon-1', code: 'MEMBER8', name: 'Member 8%' },
        billCount: 1,
        bills: [expect.objectContaining({ id: 'bill-vn-0030' })],
      }),
      expect.objectContaining({
        coupon: { id: null, code: 'NO_COUPON', name: 'Khong dung ma' },
        billCount: 1,
        bills: [expect.objectContaining({ id: 'bill-vn-2330' })],
      }),
    ]);
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
        role: 'OPERATOR',
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

  it('rejects legacy guest claim before usage-limit checks after Booking QR scope change', async () => {
    await expect(
      service.claimGuestCoupon('coupon-1', { phone: '+84901234567' }),
    ).rejects.toThrow('Independent coupon claim is not part of MVP v3.2');
    expect(prisma.coupon.findFirst).not.toHaveBeenCalled();
    return;

    prisma.coupon.findFirst.mockResolvedValue({
      id: 'coupon-1',
      endsAt: null,
      usageLimit: 1,
      usedCount: 1,
    });

    await expect(
      service.claimGuestCoupon('coupon-1', { phone: '+84901234567' }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });
  describe('getAdminDashboardStats', () => {
    it('returns dashboard stats correctly mapped', async () => {
      prisma.store.count.mockResolvedValueOnce(5); // activeStores
      prisma.store.count.mockResolvedValueOnce(3); // activeStoresHn
      prisma.store.count.mockResolvedValueOnce(2); // activeStoresHcm
      prisma.content.count.mockResolvedValue(10);
      prisma.cast.count.mockResolvedValueOnce(20); // totalCasts
      prisma.bill.count.mockResolvedValue(15); // pendingBills
      prisma.bill.aggregate.mockResolvedValue({
        _sum: { totalVnd: 500000, commissionAmountVnd: 50000 },
      });
      prisma.cast.count.mockResolvedValueOnce(2); // pendingCasts
      prisma.partnerRequest.count.mockResolvedValue(4); // pendingPartners
      prisma.booking.count.mockResolvedValue(8); // todayBookings (called multiple times)

      prisma.booking.findMany.mockResolvedValue([]);
      prisma.notificationLog.findMany.mockResolvedValue([]);

      const result = await service.getAdminDashboardStats({
        timeframe: 'today',
      });

      expect(prisma.store.count).toHaveBeenCalledWith({
        where: { status: 'ACTIVE', deletedAt: null },
      });
      expect(prisma.cast.count).toHaveBeenCalledWith({
        where: { deletedAt: null },
      });
      expect(prisma.bill.count).toHaveBeenCalledWith({
        where: { status: 'SUBMITTED' },
      });
      expect(prisma.partnerRequest.count).toHaveBeenCalledWith({
        where: { status: 'PENDING_REVIEW' },
      });
      expect(prisma.bill.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { in: ['VERIFIED', 'PAID'] },
          }),
        }),
      );
      expect(result.pendingBills).toBe(15);
      expect(result.pendingPartners).toBe(4);
      expect(result.monthlyRevenue).toBe(500000);
      expect(result.commissionAmount).toBe(50000);
      expect(result.telegramLogs).toEqual([]);
    });
  });
});
