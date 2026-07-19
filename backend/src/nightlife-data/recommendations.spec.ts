import { StoreCategory } from '@prisma/client';
import { NightlifeDataService } from './nightlife-data.service';
import { PrismaService } from '../prisma/prisma.service';
import { AccessService } from '../access/access.service';

describe('NightlifeDataService - Tonight Recommendations (Đề xuất tối nay)', () => {
  const prisma = {
    rankingConfig: {
      findMany: jest.fn(),
    },
    store: {
      findMany: jest.fn(),
    },
    auditLog: {
      groupBy: jest.fn(),
    },
    booking: {
      groupBy: jest.fn(),
    },
  } as unknown as jest.Mocked<PrismaService>;

  const accessService = {} as unknown as jest.Mocked<AccessService>;

  let service: NightlifeDataService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NightlifeDataService(
      prisma,
      accessService,
      undefined,
      undefined,
      undefined,
      undefined,
    );
  });

  describe('Edge Case: Empty Configuration (Fallback to Personalization)', () => {
    it('should fallback to personalized recommendations when no ranking configurations are active', async () => {
      // 1. Return no pinned ranking configurations
      prisma.rankingConfig.findMany.mockResolvedValue([]);

      // 2. Mock fallback stores query
      prisma.store.findMany.mockResolvedValue([
        {
          id: 'store-fallback-1',
          name: 'Fallback Store 1',
          slug: 'fallback-1',
          category: 'BAR',
          description: 'A great bar',
          city: 'Hanoi',
          district: 'Tay Ho',
          areaId: 'area-1',
          area: {
            id: 'area-1',
            code: 'hn-tayho',
            name: 'Tay Ho',
            city: 'Hanoi',
            district: 'Tay Ho',
          },
          media: [],
          coupons: [],
        },
        {
          id: 'store-fallback-2',
          name: 'Fallback Store 2',
          slug: 'fallback-2',
          category: 'CLUB',
          description: 'A wild club',
          city: 'Hanoi',
          district: 'Hoan Kiem',
          areaId: 'area-2',
          area: {
            id: 'area-2',
            code: 'hn-hoankiem',
            name: 'Hoan Kiem',
            city: 'Hanoi',
            district: 'Hoan Kiem',
          },
          media: [],
          coupons: [],
        },
      ] as any);

      // 3. Mock signals (views/bookings) as empty
      prisma.auditLog.groupBy.mockResolvedValue([]);
      prisma.booking.groupBy.mockResolvedValue([]);

      const result = await service.listPublicHomeRecommendations({
        cityCode: 'hn',
        limit: 8,
      });

      // Should return both fallback stores
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('store-fallback-1');
      expect(result[1].id).toBe('store-fallback-2');

      // Verify that prisma.store.findMany was called with the fallback filters (from buildPublicStoreWhere)
      expect(prisma.store.findMany).toHaveBeenLastCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
            status: 'ACTIVE',
          }),
        }),
      );
    });

    it('should fallback to personalization when ranking configurations return targetIds, but stores are not found or inactive', async () => {
      // 1. Pinned stores exist in configuration
      prisma.rankingConfig.findMany.mockResolvedValue([
        { targetId: 'store-pinned-inactive', pinRank: 1 },
      ] as any);

      // 2. Pinned store is inactive/deleted in store table (returns empty)
      prisma.store.findMany
        .mockResolvedValueOnce([]) // First call for pinned stores returns empty
        .mockResolvedValueOnce([
          // Second call for fallback personalized recommendations
          {
            id: 'store-personalized-active',
            name: 'Personalized Active Store',
            slug: 'personalized-active',
            category: 'LOUNGE',
            description: 'Cozy lounge',
            city: 'Hanoi',
            district: 'Tay Ho',
            areaId: 'area-1',
            area: {
              id: 'area-1',
              code: 'hn-tayho',
              name: 'Tay Ho',
              city: 'Hanoi',
              district: 'Tay Ho',
            },
            media: [],
            coupons: [],
          },
        ] as any);

      prisma.auditLog.groupBy.mockResolvedValue([]);
      prisma.booking.groupBy.mockResolvedValue([]);

      const result = await service.listPublicHomeRecommendations({
        cityCode: 'hn',
        limit: 8,
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('store-personalized-active');
    });
  });

  describe('Edge Case: Active vs Inactive/Deleted Stores filtering', () => {
    it('should only return active, non-deleted pinned stores', async () => {
      // 1. Return two configurations
      prisma.rankingConfig.findMany.mockResolvedValue([
        { targetId: 'store-active-1', pinRank: 1 },
        { targetId: 'store-deleted-2', pinRank: 2 },
      ] as any);

      // 2. Only return the active store from the store query (matching what where clause filters)
      prisma.store.findMany.mockResolvedValue([
        {
          id: 'store-active-1',
          name: 'Active Store',
          slug: 'active-store',
          category: 'BAR',
          description: 'Open',
          city: 'Hanoi',
          district: 'Tay Ho',
          areaId: 'area-1',
          area: {
            id: 'area-1',
            code: 'hn-tayho',
            name: 'Tay Ho',
            city: 'Hanoi',
            district: 'Tay Ho',
          },
          media: [],
          coupons: [],
        },
      ] as any);

      prisma.auditLog.groupBy.mockResolvedValue([]);
      prisma.booking.groupBy.mockResolvedValue([]);

      const result = await service.listPublicHomeRecommendations({
        cityCode: 'hn',
        limit: 8,
      });

      // Verifies that only active store is returned, even though config pinned two
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('store-active-1');

      // Verify DB query filters active, non-deleted stores
      expect(prisma.store.findMany).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          where: expect.objectContaining({
            id: { in: ['store-active-1', 'store-deleted-2'] },
            deletedAt: null,
            status: 'ACTIVE',
          }),
        }),
      );
    });

    it('should include pinned stores from every city when cityCode is all', async () => {
      prisma.rankingConfig.findMany.mockResolvedValue([
        { targetId: 'store-all', cityCode: 'all', pinRank: 1 },
        { targetId: 'store-hn', cityCode: 'hn', pinRank: 2 },
        { targetId: 'store-hcm', cityCode: 'hcm', pinRank: 3 },
      ] as any);

      prisma.store.findMany.mockResolvedValue([
        {
          id: 'store-all',
          name: 'All City Store',
          slug: 'all-city-store',
          category: 'CLUB',
          description: 'Pinned for all',
          city: 'Da Nang',
          district: 'Hai Chau',
          areaId: 'area-dn',
          area: {
            id: 'area-dn',
            code: 'dn-haichau',
            name: 'Hai Chau',
            city: 'Da Nang',
            district: 'Hai Chau',
          },
          media: [],
          coupons: [],
        },
        {
          id: 'store-hn',
          name: 'Hanoi Store',
          slug: 'hanoi-store',
          category: 'BAR',
          description: 'Pinned for Hanoi',
          city: 'Hanoi',
          district: 'Hoan Kiem',
          areaId: 'area-hn',
          area: {
            id: 'area-hn',
            code: 'hn-hoankiem',
            name: 'Hoan Kiem',
            city: 'Hanoi',
            district: 'Hoan Kiem',
          },
          media: [],
          coupons: [],
        },
        {
          id: 'store-hcm',
          name: 'HCM Store',
          slug: 'hcm-store',
          category: 'LOUNGE',
          description: 'Pinned for HCM',
          city: 'Ho Chi Minh City',
          district: 'District 1',
          areaId: 'area-hcm',
          area: {
            id: 'area-hcm',
            code: 'hcm-district-1',
            name: 'District 1',
            city: 'Ho Chi Minh City',
            district: 'District 1',
          },
          media: [],
          coupons: [],
        },
      ] as any);

      prisma.auditLog.groupBy.mockResolvedValue([]);
      prisma.booking.groupBy.mockResolvedValue([]);

      const result = await service.listPublicHomeRecommendations({
        cityCode: 'all',
        limit: 8,
      });
      const rankingFindArgs = (prisma.rankingConfig.findMany as jest.Mock).mock
        .calls[0][0];

      expect(rankingFindArgs.where).not.toHaveProperty('cityCode');
      expect(result.map((store) => store.id)).toEqual([
        'store-all',
        'store-hn',
        'store-hcm',
      ]);
    });
  });

  describe('Validation & Maximum Limits', () => {
    it('should return exactly 8 stores when limit 8 is requested and enough stores exist', async () => {
      // 1. Mock 10 pinned ranking configs
      const configs = Array.from({ length: 10 }, (_, i) => ({
        targetId: `store-${i + 1}`,
        pinRank: i + 1,
      }));
      prisma.rankingConfig.findMany.mockResolvedValue(configs as any);

      // 2. Mock 10 stores
      const stores = Array.from({ length: 10 }, (_, i) => ({
        id: `store-${i + 1}`,
        name: `Store ${i + 1}`,
        slug: `store-${i + 1}-slug`,
        category: 'BAR',
        description: 'Bar',
        city: 'Hanoi',
        district: 'Tay Ho',
        areaId: 'area-1',
        area: {
          id: 'area-1',
          code: 'hn-tayho',
          name: 'Tay Ho',
          city: 'Hanoi',
          district: 'Tay Ho',
        },
        media: [],
        coupons: [],
      }));
      prisma.store.findMany.mockResolvedValue(stores as any);

      prisma.auditLog.groupBy.mockResolvedValue([]);
      prisma.booking.groupBy.mockResolvedValue([]);

      const result = await service.listPublicHomeRecommendations({
        cityCode: 'hn',
        limit: 8,
      });

      // Capped at requested limit of 8
      expect(result).toHaveLength(8);
      expect(result.map((s) => s.id)).toEqual([
        'store-1',
        'store-2',
        'store-3',
        'store-4',
        'store-5',
        'store-6',
        'store-7',
        'store-8',
      ]);
    });

    it('should cap the recommendations limit at 16 even if a higher limit (e.g. 24) is passed', async () => {
      const configs = Array.from({ length: 20 }, (_, i) => ({
        targetId: `store-${i + 1}`,
        pinRank: i + 1,
      }));
      prisma.rankingConfig.findMany.mockResolvedValue(configs as any);

      const stores = Array.from({ length: 20 }, (_, i) => ({
        id: `store-${i + 1}`,
        name: `Store ${i + 1}`,
        slug: `store-${i + 1}-slug`,
        category: 'BAR',
        description: 'Bar',
        city: 'Hanoi',
        district: 'Tay Ho',
        areaId: 'area-1',
        area: {
          id: 'area-1',
          code: 'hn-tayho',
          name: 'Tay Ho',
          city: 'Hanoi',
          district: 'Tay Ho',
        },
        media: [],
        coupons: [],
      }));
      prisma.store.findMany.mockResolvedValue(stores as any);

      prisma.auditLog.groupBy.mockResolvedValue([]);
      prisma.booking.groupBy.mockResolvedValue([]);

      const result = await service.listPublicHomeRecommendations({
        cityCode: 'hn',
        limit: 24,
      });

      // Capped at 16 in the service logic (resolvePublicHomeLimit)
      expect(result).toHaveLength(16);
    });

    it('should fallback to default limit of 8 when limit is undefined or invalid', async () => {
      prisma.rankingConfig.findMany.mockResolvedValue([]);
      prisma.store.findMany.mockResolvedValue([]);
      prisma.auditLog.groupBy.mockResolvedValue([]);
      prisma.booking.groupBy.mockResolvedValue([]);

      // Invalid limit should default to 8
      await service.listPublicHomeRecommendations({
        cityCode: 'hn',
        limit: undefined,
      });
      expect(prisma.store.findMany).toHaveBeenLastCalledWith(
        expect.objectContaining({
          take: 32, // limit * 4 = 8 * 4 = 32
        }),
      );
    });
  });

  describe('Personalization Scoring Algorithm & Ordering', () => {
    it('should apply personalized score boosts correctly and sort stores by score in descending order', async () => {
      prisma.rankingConfig.findMany.mockResolvedValue([]);

      // Mock 3 stores:
      // Store A: category BAR, area area-1, no coupons, no views, no bookings.
      // Store B: category CLUB, area area-2, has coupon, no views, no bookings.
      // Store C: category BAR, area area-1, has coupon, has views (10), has bookings (5).
      const storeA = {
        id: 'store-a',
        name: 'Store A',
        slug: 'store-a',
        category: 'BAR' as StoreCategory,
        areaId: 'area-1',
        city: 'Hanoi',
        district: 'Tay Ho',
        area: {
          id: 'area-1',
          code: 'hn-tayho',
          name: 'Tay Ho',
          city: 'Hanoi',
          district: 'Tay Ho',
        },
        media: [],
        coupons: [],
      };
      const storeB = {
        id: 'store-b',
        name: 'Store B',
        slug: 'store-b',
        category: 'CLUB' as StoreCategory,
        areaId: 'area-2',
        city: 'Hanoi',
        district: 'Hoan Kiem',
        area: {
          id: 'area-2',
          code: 'hn-hoankiem',
          name: 'Hoan Kiem',
          city: 'Hanoi',
          district: 'Hoan Kiem',
        },
        media: [],
        coupons: [
          {
            id: 'coupon-1',
            name: 'Discount',
            discountType: 'PERCENT',
            discountValue: 10,
          },
        ],
      };
      const storeC = {
        id: 'store-c',
        name: 'Store C',
        slug: 'store-c',
        category: 'BAR' as StoreCategory,
        areaId: 'area-1',
        city: 'Hanoi',
        district: 'Tay Ho',
        area: {
          id: 'area-1',
          code: 'hn-tayho',
          name: 'Tay Ho',
          city: 'Hanoi',
          district: 'Tay Ho',
        },
        media: [],
        coupons: [
          {
            id: 'coupon-2',
            name: 'Discount 2',
            discountType: 'FIXED_AMOUNT',
            discountValue: 50000,
          },
        ],
      };

      // Mock the two calls to store.findMany:
      // First call (viewedStores lookup for store-a):
      prisma.store.findMany.mockResolvedValueOnce([storeA] as any);
      // Second call (fallback stores list):
      prisma.store.findMany.mockResolvedValueOnce([
        storeA,
        storeB,
        storeC,
      ] as any);

      // Audit logs: C has 10 views
      prisma.auditLog.groupBy.mockResolvedValue([
        { targetId: 'store-c', _count: { _all: 10 } },
      ] as any);

      // Bookings: C has 5 bookings
      prisma.booking.groupBy.mockResolvedValue([
        { storeId: 'store-c', _count: { _all: 5 } },
      ] as any);

      // User behavior setup:
      // Preferred categories: BAR
      // Preferred slugs: store-a (implies interested in area-1, category BAR)
      const result = await service.listPublicHomeRecommendations({
        cityCode: 'hn',
        categories: 'BAR',
        storeSlugs: 'store-a',
        limit: 3,
      });

      // Calculate expected scores:
      // Base score starts at 100 - index from DB results.
      // Database results mock return [storeA, storeB, storeC].
      // Index in array: storeA = 0 (base 100), storeB = 1 (base 99), storeC = 2 (base 98).
      //
      // Behavior categories: BAR (from query.categories) + BAR (from store-a category)
      // So behaviorCategories has { BAR }.
      // Behavior areas: area-1 (from store-a).
      //
      // Store A:
      // Base score = 100
      // Matches category BAR? Yes -> +36
      // Matches area area-1? Yes -> +24
      // Has coupon? No
      // Views: 0, Bookings: 0
      // Total Score = 100 + 36 + 24 = 160
      //
      // Store B:
      // Base score = 99
      // Matches category BAR? No (is CLUB)
      // Matches area area-1? No (is area-2)
      // Has coupon? Yes -> +18
      // Views: 0, Bookings: 0
      // Total Score = 99 + 18 = 117
      //
      // Store C:
      // Base score = 98
      // Matches category BAR? Yes -> +36
      // Matches area area-1? Yes -> +24
      // Has coupon? Yes -> +18
      // Views: 10 -> +10
      // Bookings: 5 -> +10 (5 * 2 = 10)
      // Total Score = 98 + 36 + 24 + 18 + 10 + 10 = 196
      //
      // Sorted in descending order: Store C (196), Store A (160), Store B (117)

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('store-c');
      expect(result[0].score).toBe(196);
      expect(result[1].id).toBe('store-a');
      expect(result[1].score).toBe(160);
      expect(result[2].id).toBe('store-b');
      expect(result[2].score).toBe(117);
    });
  });
});
