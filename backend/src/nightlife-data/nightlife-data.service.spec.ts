import {
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
      findMany: jest.fn(),
      update: jest.fn(),
    },
    store: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
    },
    area: {
      findMany: jest.fn(),
    },
    cast: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
    },
    rankingConfig: {
      findMany: jest.fn(),
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
    prisma.cast.count.mockResolvedValue(1);
    prisma.rankingConfig.findMany.mockResolvedValue([] as never);
    service = new NightlifeDataService(
      prisma,
      accessService,
      adminNotificationService as never,
    );
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
    prisma.store.findFirst.mockResolvedValue({
      id: 'store-1',
      name: 'Neon Club',
      slug: 'neon-club',
    });
    prisma.guest.create.mockResolvedValue({ id: 'guest-1' });
    prisma.booking.create.mockResolvedValue({
      id: 'booking-1',
      status: 'REQUESTED',
    });

    await service.createGuestBooking({
      storeSlug: 'neon-club',
      displayName: 'Guest Name',
      phone: '+84901234567',
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
        phone: '+84901234567',
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
    expect(adminNotificationService.notifyBookingCreated).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'booking-1',
        status: 'REQUESTED',
      }),
    );
  });

  it('creates a member booking request for a cast with a contact snapshot', async () => {
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
    prisma.booking.findFirst.mockResolvedValue({
      id: 'booking-1',
      status: 'REQUESTED',
      scheduledAt: new Date('2026-06-30T14:00:00.000Z'),
      partySize: 2,
    });
    prisma.booking.update.mockResolvedValue({
      id: 'booking-1',
      status: 'CANCELLED',
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      guest: { id: 'guest-1', displayName: 'Guest', phone: '+84901234567' },
    });

    await service.cancelMemberBooking(
      { id: 'member-1', role: 'USER' },
      'booking-1',
      { reason: 'Change of plans' },
    );

    expect(prisma.booking.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'booking-1',
        userId: 'member-1',
        deletedAt: null,
      },
      select: {
        id: true,
        status: true,
        scheduledAt: true,
        partySize: true,
      },
    });
    expect(prisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'booking-1' },
        data: expect.objectContaining({
          status: 'CANCELLED',
          cancelledAt: expect.any(Date),
        }),
      }),
    );
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
      endsAt: null,
      usageLimit: null,
      usedCount: 0,
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
      endsAt: couponEndsAt,
      usageLimit: null,
      usedCount: 0,
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
      discountType: 'PERCENT',
      discountValue: 8,
      maxDiscountVnd: 800000,
      minSpendVnd: null,
      endsAt: null,
      usageLimit: null,
      usedCount: 0,
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
    });
    prisma.couponIssue.update.mockResolvedValue({ id: 'issue-1' });

    await service.scanCouponIssue('GUEST-code', {
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
    });
    prisma.couponIssue.update.mockResolvedValue({ id: 'issue-1' });
    prisma.coupon.update.mockResolvedValue({ id: 'coupon-1' });
    prisma.booking.update.mockResolvedValue({ id: 'booking-1' });

    await service.confirmCouponIssueCheckIn('issue-1', {
      id: 'partner-1',
      role: 'PARTNER',
    });

    expect(accessService.ensureStoreAccess).toHaveBeenCalledWith(
      { id: 'partner-1', role: 'PARTNER' },
      'store-1',
      'checkin.confirm',
    );
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

  it('submits a member bill and sends the admin alert', async () => {
    prisma.booking.findFirst.mockResolvedValue({
      id: 'booking-1',
      status: 'CONFIRMED',
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
          totalVnd: 1800000,
          paidVnd: 1800000,
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

  it('submits a partner request and sends the admin alert', async () => {
    const result = await service.createPartnerRequest({
      businessName: 'Neon Club',
      businessType: 'Club',
      area: 'Ha Noi',
      contactName: 'Owner',
      contactPhone: '+84901234567',
      contactEmail: 'owner@example.com',
      note: 'Please call after 6PM',
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(/^PARTNER-/),
        status: 'PENDING_REVIEW',
        message: 'Partner request submitted for admin review',
      }),
    );
    expect(adminNotificationService.notifyPartnerRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        id: result.id,
        businessName: 'Neon Club',
        businessType: 'Club',
        area: 'Ha Noi',
        contactName: 'Owner',
        contactPhone: '+84901234567',
        contactEmail: 'owner@example.com',
        note: 'Please call after 6PM',
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
