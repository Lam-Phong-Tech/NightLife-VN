import {
  ForbiddenException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
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
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    store: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
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
      updateMany: jest.fn(),
    },
    content: {
      create: jest.fn(),
      updateMany: jest.fn(),
      findFirst: jest.fn(),
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
    booking: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    bill: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    notificationLog: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
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

  let service: NightlifeDataService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.store.count.mockResolvedValue(1);
    prisma.store.create.mockResolvedValue({
      id: 'store-draft-1',
      name: 'Neon Club',
      slug: 'neon-club-partner-test',
      status: 'PENDING_REVIEW',
    } as never);
    prisma.store.update.mockResolvedValue({ id: 'store-draft-1' } as never);
    prisma.cast.count.mockResolvedValue(1);
    prisma.cast.create.mockResolvedValue({ id: 'cast-draft-1' } as never);
    prisma.cast.updateMany.mockResolvedValue({ count: 1 } as never);
    prisma.media.create.mockResolvedValue({ id: 'media-draft-1' } as never);
    prisma.media.updateMany.mockResolvedValue({ count: 1 } as never);
    prisma.content.create.mockResolvedValue({ id: 'content-draft-1' } as never);
    prisma.content.updateMany.mockResolvedValue({ count: 1 } as never);
    prisma.content.findFirst.mockResolvedValue(null as never);
    prisma.rankingConfig.findMany.mockResolvedValue([] as never);
    prisma.rankingConfig.findFirst.mockResolvedValue(null as never);
    prisma.couponIssue.findFirst.mockResolvedValue(null as never);
    prisma.couponIssue.updateMany.mockResolvedValue({ count: 1 } as never);
    prisma.notificationLog.create.mockResolvedValue({
      id: 'notification-1',
    } as never);
    prisma.notificationLog.update.mockResolvedValue({
      id: 'notification-1',
      status: 'SENT',
      payload: {},
      error: null,
      sentAt: null,
      createdAt: new Date('2026-06-30T10:00:00.000Z'),
    } as never);
    prisma.notificationLog.findMany.mockResolvedValue([] as never);
    prisma.auditLog.findMany.mockResolvedValue([] as never);
    service = new NightlifeDataService(
      prisma,
      accessService,
      adminNotificationService as never,
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

    expect(result.data).toEqual([
      expect.objectContaining({
        slug: 'neon-club',
        category: 'CLUB',
        cityCode: 'hn',
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
            url: 'https://videos.pexels.com/video-files/7271837/7271837-uhd_3840_2160_25fps.mp4',
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

    prisma.store.findFirst.mockResolvedValue({ id: storeId } as never);
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
    } as never);
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
        targetImage: '/media/demo/stores/neon-club.jpg',
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
  });

  it('rejects duplicate admin ranking pins in the same city/category/scope', async () => {
    const storeId = '11111111-1111-4111-8111-111111111111';

    prisma.store.findFirst.mockResolvedValue({ id: storeId } as never);
    prisma.rankingConfig.findFirst.mockResolvedValue({
      id: 'existing-ranking',
      targetId: 'other-store',
    } as never);

    await expect(
      service.createAdminRankingConfig(
        { id: 'admin-1', role: 'ADMIN' },
        {
          targetType: 'STORE',
          targetId: storeId,
          cityCode: 'hn',
          category: 'club',
          scope: 'global',
          pinRank: 1,
        },
      ),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
    expect(prisma.rankingConfig.create).not.toHaveBeenCalled();
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
      publicBio: 'Public introduction for Aya.',
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
          bio: true,
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
        publicBio: 'Public introduction for Aya.',
        monthOfBirth: null,
        zodiacSign: null,
        heightCm: null,
        measurements: null,
        interests: [],
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
          bookingCode: 'BK-BOOKING-',
          qrPayload: expect.stringContaining('NLBOOKING|booking-1|BK-BOOKING-'),
          qrImageUrl: expect.stringContaining('api.qrserver.com'),
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

  it.each([
    ['a past booking date', '2026-06-19T14:00:00.000Z', 'scheduledAt cannot be in the past'],
    [
      'a booking date after the 2 week window',
      '2026-07-05T14:00:00.000Z',
      'scheduledAt can only be within 14 days',
    ],
  ])('rejects %s before creating a guest contact', async (_, scheduledAt, message) => {
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
  });

  it('creates a guest booking with an optional coupon campaign link', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-20T10:00:00.000Z'));
    prisma.store.findFirst.mockResolvedValue({
      id: 'store-1',
      name: 'Neon Club',
      slug: 'neon-club',
    });
    prisma.coupon.findFirst.mockResolvedValue({
      id: 'coupon-1',
    });
    prisma.guest.create.mockResolvedValue({ id: 'guest-1' });
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
          couponIssueId: undefined,
        }),
      }),
    );
  });

  it('creates a member booking request for a cast with a contact snapshot', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-20T10:00:00.000Z'));
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
      status: 'REQUESTED',
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
        }),
      }),
    );
    expect(adminNotificationService.notifyBookingCreated).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'booking-1',
        status: 'REQUESTED',
      }),
    );
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

  it('claims a coupon for a guest without linking member history', async () => {
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

  it('caps guest coupon expiry to 24 hours', async () => {
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

  it('caps guest coupon expiry to coupon end when it is earlier than 24 hours', async () => {
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

  it('claims a coupon for a member with 7-day expiry and tier snapshot', async () => {
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

  it('claims a coupon for a regular member with an 8 percent snapshot', async () => {
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
    prisma.couponIssue.updateMany.mockResolvedValue({ count: 1 } as never);

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
    prisma.couponIssue.updateMany.mockResolvedValue({ count: 1 } as never);
    prisma.coupon.update.mockResolvedValue({ id: 'coupon-1' });
    prisma.booking.update.mockResolvedValue({
      id: 'booking-1',
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
    prisma.couponIssue.updateMany.mockResolvedValue({ count: 0 } as never);

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
    } as never);

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
    } as never);

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
        actor: { id: 'partner-1', displayName: 'Partner Staff', role: 'PARTNER' },
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
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      guest: { id: 'guest-1', displayName: 'Guest', phone: '+84901234567' },
      coupon: { id: 'coupon-1', code: 'WELCOME20', name: 'Welcome 20%' },
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
  });

  it('submits a member bill with a coupon issue without requiring a booking', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-01T10:00:00.000Z'));
    prisma.store.findFirst.mockResolvedValue({
      id: 'store-1',
      name: 'Neon Club',
      slug: 'neon-club',
    } as never);
    prisma.couponIssue.findFirst.mockResolvedValue({
      id: 'issue-1',
      code: 'MEMBER-code',
      couponId: 'coupon-1',
      userId: 'member-1',
      guestId: null,
      status: 'USED',
      expiresAt: null,
      bill: null,
      coupon: {
        id: 'coupon-1',
        code: 'WELCOME20',
        name: 'Welcome 20%',
        storeId: 'store-1',
      },
    } as never);
    prisma.bill.create.mockResolvedValue({
      id: 'bill-1',
      billNumber: 'BILL-20260701-ABC12345',
      status: 'SUBMITTED',
      totalVnd: 1800000,
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      booking: null,
      coupon: { id: 'coupon-1', code: 'WELCOME20', name: 'Welcome 20%' },
      couponIssue: { id: 'issue-1', code: 'MEMBER-code', status: 'USED' },
    } as never);

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
  });

  it('rejects member bill submissions after the 10 day deadline', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-01T10:00:00.000Z'));
    prisma.store.findFirst.mockResolvedValue({
      id: 'store-1',
      name: 'Neon Club',
      slug: 'neon-club',
    } as never);

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

  it('submits a partner bill within the accessible store scope', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-01T10:00:00.000Z'));
    prisma.store.findFirst.mockResolvedValue({
      id: 'store-1',
      name: 'Neon Club',
      slug: 'neon-club',
    } as never);
    prisma.bill.create.mockResolvedValue({
      id: 'bill-1',
      billNumber: 'BILL-20260701-ABC12345',
      status: 'SUBMITTED',
      totalVnd: 1800000,
      usedAt: new Date('2026-06-30T14:00:00.000Z'),
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      booking: null,
      guest: null,
    } as never);

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
  });

  it('submits a partner bill with a guest coupon issue without requiring a booking', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-01T10:00:00.000Z'));
    prisma.store.findFirst.mockResolvedValue({
      id: 'store-1',
      name: 'Neon Club',
      slug: 'neon-club',
    } as never);
    prisma.couponIssue.findFirst.mockResolvedValue({
      id: 'issue-guest-1',
      code: 'GUEST-code',
      couponId: 'coupon-guest-1',
      userId: null,
      guestId: 'guest-1',
      status: 'USED',
      expiresAt: null,
      bill: null,
      coupon: {
        id: 'coupon-guest-1',
        code: 'GUEST20',
        name: 'Guest 20%',
        storeId: 'store-1',
      },
    } as never);
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
    } as never);

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
  });

  it('submits a partner request and sends the admin alert', async () => {
    prisma.store.create.mockResolvedValueOnce({
      id: 'store-draft-1',
      name: 'Neon Club Tay Ho',
      slug: 'neon-club-tay-ho-partner-abc12345',
      status: 'PENDING_REVIEW',
    } as never);
    prisma.cast.create.mockResolvedValueOnce({ id: 'cast-draft-1' } as never);
    prisma.media.create
      .mockResolvedValueOnce({ id: 'cast-media-1' } as never)
      .mockResolvedValueOnce({ id: 'store-media-1' } as never);
    prisma.content.create.mockResolvedValueOnce({
      id: 'content-draft-1',
    } as never);

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
  });

  it('lists partner requests from admin Telegram notification logs', async () => {
    prisma.notificationLog.findMany.mockResolvedValue([
      {
        id: 'notification-1',
        status: 'SENT',
        payload: {
          requestId: 'PARTNER-ABC12345',
          businessName: 'Neon Club',
          businessType: 'Club',
          area: 'Ha Noi',
          contactName: 'Owner',
          contactPhone: '+84901234567',
          contactEmail: 'owner@example.com',
          note: 'Please call after 6PM',
          status: 'PENDING_REVIEW',
          draftStoreId: 'store-draft-1',
          draftStoreName: 'Neon Club Tay Ho',
          draftStoreSlug: 'neon-club-tay-ho-partner-abc12345',
          draftCastIds: ['cast-draft-1'],
          draftMediaIds: ['store-media-1'],
          draftContentIds: ['content-draft-1'],
          storeDescription: 'Live DJ and private table service',
          menuSummary: 'Bottle service from 2,500,000 VND',
          submittedAt: '2026-06-30T10:00:00.000Z',
        },
        error: null,
        sentAt: new Date('2026-06-30T10:00:01.000Z'),
        createdAt: new Date('2026-06-30T10:00:00.000Z'),
      },
    ] as never);

    await expect(service.listAdminPartnerRequests()).resolves.toEqual([
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
    expect(prisma.notificationLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          templateKey: 'telegram.admin.partner.requested.v1',
          channel: 'TELEGRAM',
        }),
      }),
    );
  });

  it('approves a partner request and publishes submitted drafts', async () => {
    prisma.notificationLog.findMany.mockResolvedValue([
      {
        id: 'notification-1',
        status: 'SENT',
        payload: {
          requestId: 'PARTNER-ABC12345',
          status: 'PENDING_REVIEW',
          businessName: 'Neon Club',
          contactName: 'Owner',
          contactPhone: '+84901234567',
          draftStoreId: 'store-draft-1',
          draftStoreName: 'Neon Club Tay Ho',
          draftCastIds: ['cast-draft-1'],
          draftMediaIds: ['media-draft-1'],
          draftContentIds: ['content-draft-1'],
          submittedAt: '2026-06-30T10:00:00.000Z',
        },
        error: null,
        sentAt: new Date('2026-06-30T10:00:01.000Z'),
        createdAt: new Date('2026-06-30T10:00:00.000Z'),
      },
    ] as never);
    prisma.notificationLog.update.mockImplementation((args) =>
      Promise.resolve({
        id: 'notification-1',
        status: 'SENT',
        payload: args.data?.payload,
        error: null,
        sentAt: new Date('2026-06-30T10:00:01.000Z'),
        createdAt: new Date('2026-06-30T10:00:00.000Z'),
      } as never),
    );

    const result = await service.reviewPartnerRequest(
      'admin-1',
      'PARTNER-ABC12345',
      {
        approve: true,
        reason: 'Thong tin hop le',
      },
    );

    expect(prisma.store.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'store-draft-1' },
        data: { status: 'ACTIVE' },
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
    expect(prisma.notificationLog.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'notification-1' },
        data: expect.objectContaining({
          payload: expect.objectContaining({
            status: 'APPROVED',
            reviewReason: 'Thong tin hop le',
            reviewedById: 'admin-1',
            publicState: 'PUBLIC',
          }),
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
        }),
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: 'PARTNER-ABC12345',
        status: 'APPROVED',
        reviewReason: 'Thong tin hop le',
        reviewedById: 'admin-1',
        publicState: 'PUBLIC',
      }),
    );
  });

  it('rejects a partner request with a reason and keeps drafts non-public', async () => {
    prisma.notificationLog.findMany.mockResolvedValue([
      {
        id: 'notification-1',
        status: 'SENT',
        payload: {
          requestId: 'PARTNER-ABC12345',
          status: 'PENDING_REVIEW',
          businessName: 'Neon Club',
          contactName: 'Owner',
          contactPhone: '+84901234567',
          draftStoreId: 'store-draft-1',
          draftCastIds: ['cast-draft-1'],
          draftMediaIds: ['media-draft-1'],
          draftContentIds: ['content-draft-1'],
          submittedAt: '2026-06-30T10:00:00.000Z',
        },
        error: null,
        sentAt: new Date('2026-06-30T10:00:01.000Z'),
        createdAt: new Date('2026-06-30T10:00:00.000Z'),
      },
    ] as never);
    prisma.notificationLog.update.mockImplementation((args) =>
      Promise.resolve({
        id: 'notification-1',
        status: 'SENT',
        payload: args.data?.payload,
        error: null,
        sentAt: new Date('2026-06-30T10:00:01.000Z'),
        createdAt: new Date('2026-06-30T10:00:00.000Z'),
      } as never),
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
    expect(result).toEqual(
      expect.objectContaining({
        status: 'REJECTED',
        reviewReason: 'Thieu giay to va anh ro net',
        publicState: 'HIDDEN',
      }),
    );
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
          previousStatus: 'SUBMITTED',
          nextStatus: 'VERIFIED',
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
      },
    ] as never);

    await expect(
      service.listSensitiveBillsForAdmin({
        id: 'admin-1',
        role: 'ADMIN',
      }),
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
      }),
    ]);

    expect(prisma.bill.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          booking: { select: { id: true, status: true, scheduledAt: true } },
          coupon: { select: { id: true, code: true, name: true } },
          couponIssue: { select: { id: true, code: true, status: true } },
        }),
      }),
    );
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

  it('rejects a guest claim when the usage limit is exhausted', async () => {
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
});
