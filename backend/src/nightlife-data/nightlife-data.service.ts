import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  Prisma,
  RankingConfigStatus,
  RankingTargetType,
  StoreCategory,
} from '@prisma/client';
import { createHash, randomUUID } from 'node:crypto';
import { AccessService, AuthenticatedUser } from '../access/access.service';
import { AdminNotificationService } from '../notifications/admin-notification.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdminRankingQueryDto,
  AdminRankingTargetOptionsQueryDto,
  CreateAdminRankingConfigDto,
  UpdateAdminRankingConfigDto,
} from './dto/admin-ranking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { ClaimGuestCouponDto } from './dto/claim-guest-coupon.dto';
import { CreateBillDto } from './dto/create-bill.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreatePartnerRequestDto } from './dto/create-partner-request.dto';
import {
  PublicDiscoveryQueryDto,
  PublicRankingQueryDto,
} from './dto/public-discovery-query.dto';
import { ReviewBillDto } from './dto/review-bill.dto';
import { TelegramService } from '../telegram/telegram.service';

const DAY_MS = 24 * 60 * 60 * 1000;
const BOOKING_CANCEL_CUTOFF_MS = 60 * 60 * 1000;
const DEFAULT_PUBLIC_LIMIT = 24;
const DEFAULT_RANKING_LIMIT = 5;
const MAX_RANKING_LIMIT = 20;
const MAX_PUBLIC_LIMIT = 100;
const DEFAULT_PUBLIC_PAGE = 1;
const MAX_PUBLIC_OFFSET = 10000;
const MAX_PUBLIC_SORT_WINDOW = 500;
const MVP_CITY_CODES = ['hn', 'hcm'] as const;
const COUPON_DISCOUNT_PERCENT_BY_USER_TYPE = {
  GUEST: 5,
  MEMBER: 8,
  VIP: 10,
} as const;
const COUPON_ISSUE_STATUS_LABELS: Record<string, string> = {
  ISSUED: 'Đang giữ chỗ',
  USED: 'Đã sử dụng',
  EXPIRED: 'Hết hạn',
  REVOKED: 'Đã hủy',
};

type CouponUserType = keyof typeof COUPON_DISCOUNT_PERCENT_BY_USER_TYPE;

const CITY_ALIASES: Record<string, string> = {
  all: 'all',
  'tat-ca': 'all',
  'tong-hop': 'all',
  hn: 'hn',
  hanoi: 'hn',
  'ha-noi': 'hn',
  'ha noi': 'hn',
  hcm: 'hcm',
  tphcm: 'hcm',
  'tp-hcm': 'hcm',
  'tp hcm': 'hcm',
  'ho-chi-minh': 'hcm',
  'tp-ho-chi-minh': 'hcm',
  'thanh-pho-ho-chi-minh': 'hcm',
  saigon: 'hcm',
  sai_gon: 'hcm',
  'sai-gon': 'hcm',
};

const CATEGORY_ALIASES: Record<string, StoreCategory> = {
  bar: 'BAR',
  club: 'CLUB',
  lounge: 'LOUNGE',
  'girls-bar': 'GIRLS_BAR',
  girlsbar: 'GIRLS_BAR',
  hostess: 'GIRLS_BAR',
  'hostess-bar': 'GIRLS_BAR',
  karaoke: 'KARAOKE',
  'karaoke-ktv': 'KARAOKE',
  ktv: 'KARAOKE',
  'massage-spa': 'MASSAGE_SPA',
  massage: 'MASSAGE_SPA',
  spa: 'MASSAGE_SPA',
  restaurant: 'RESTAURANT',
  nhahang: 'RESTAURANT',
  'nha-hang': 'RESTAURANT',
  casino: 'CASINO',
};

const STORE_SLUG_ALIASES: Record<string, string> = {
  'club-lumiere': 'neon-club',
  'yakitori-hanoi': 'tokyo-kitchen',
  'ktv-hoang-gia': 'golden-voice-ktv',
  'diamond-bar': 'crimson-bar',
  'sora-lounge': 'jade-lounge',
};

const CAST_SLUG_ALIASES: Record<string, string> = {
  aiko: 'aya-velvet',
  hana: 'hana-sakura-lounge',
  michi: 'miyuki-moonlight',
  rina: 'rina-velvet',
  yuki: 'yuki-sakura-lounge',
  'kotone-tokyo-kitchen': 'kotone-tokyo',
  'sakura-moonlight-q1': 'sakura-moonlight',
  'yuna-neon-district': 'yuna-neon',
};

const LEGACY_DEMO_VIDEO_URLS = new Set([
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtu.be/dQw4w9WgXcQ',
]);

const STORE_VIDEO_URLS = {
  nightlife:
    'https://videos.pexels.com/video-files/7271837/7271837-uhd_3840_2160_25fps.mp4',
  restaurant:
    'https://videos.pexels.com/video-files/31631562/13476222_3840_2160_25fps.mp4',
  ktv: 'https://www.pexels.com/download/video/8117118/',
  spa: 'https://www.pexels.com/download/video/6187089/',
} as const;

const STORE_CATEGORY_VIDEO_URLS: Partial<Record<StoreCategory, string>> = {
  BAR: STORE_VIDEO_URLS.nightlife,
  CLUB: STORE_VIDEO_URLS.nightlife,
  LOUNGE: STORE_VIDEO_URLS.nightlife,
  GIRLS_BAR: STORE_VIDEO_URLS.nightlife,
  CASINO: STORE_VIDEO_URLS.nightlife,
  KARAOKE: STORE_VIDEO_URLS.ktv,
  RESTAURANT: STORE_VIDEO_URLS.restaurant,
  MASSAGE_SPA: STORE_VIDEO_URLS.spa,
};

type Coordinates = {
  lat: number;
  lng: number;
};

type PublicSort = 'newest' | 'nearest' | 'priority';

type PublicPagination = {
  limit: number;
  offset: number;
  page: number;
};

type PublicSortableItem = {
  id: string;
  createdAt: Date | string;
  distanceKm: number | null;
};

type RankingScore = {
  pinRank: number | null;
  manualScore: number;
};

type PublicRankingConfig = {
  targetId: string;
  cityCode: string;
  category: StoreCategory | null;
  scope: string;
  manualScore: number;
  pinRank: number | null;
  sponsored: boolean;
  updatedAt: Date | string;
};

type PublicRankingItem = {
  rank: number;
  targetType: 'CAST' | 'STORE';
  targetId: string;
  name: string;
  slug: string;
  image: string | null;
  area: string | null;
  city: string;
  cityCode?: string;
  category: StoreCategory;
  sponsored: boolean;
  pinRank: number | null;
  manualScore: number;
  href: string;
  phone?: string | null;
};

type PublicRankingItemDraft = Omit<PublicRankingItem, 'rank'>;

type AdminRankingConfigRecord = {
  id: string;
  targetType: RankingTargetType;
  targetId: string;
  areaId: string | null;
  cityCode: string;
  category: StoreCategory | null;
  scope: string;
  manualScore: number;
  pinRank: number | null;
  sponsored: boolean;
  reason: string | null;
  status: string;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  area: {
    id: string;
    code: string;
    name: string;
    city: string;
    district: string | null;
  } | null;
};

type RankingTargetSummary = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  city: string;
  area: string | null;
  category: StoreCategory;
  status: string;
};

type BookingTarget = {
  store: {
    id: string;
    name: string;
    slug: string;
  };
  cast?: {
    id: string;
    slug: string;
    stageName: string;
    publicAlias: string | null;
  };
};

@Injectable()
export class NightlifeDataService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: AccessService,
    @Optional()
    private readonly adminNotificationService?: AdminNotificationService,
    @Optional()
    private readonly telegramService?: TelegramService,
  ) {}

  async listPublicAreas(query: PublicDiscoveryQueryDto = {}) {
    const cityCode = this.normalizeCityCode(query.city, { strict: true });
    const where: Prisma.AreaWhereInput = {
      deletedAt: null,
      status: 'ACTIVE',
      ...this.buildMvpAreaCodeWhere(cityCode),
    };

    const areas = await this.prisma.area.findMany({
      where,
      orderBy: [{ city: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        code: true,
        name: true,
        city: true,
        district: true,
        ward: true,
      },
    });

    return areas.map((area) => ({
      ...area,
      cityCode: this.cityCodeFromAreaCode(area.code),
    }));
  }

  async listPublicRankings(query: PublicRankingQueryDto = {}) {
    const targetType = this.resolveRankingTargetType(query.targetType);
    const cityCode = this.normalizeCityCode(query.city ?? 'all', {
      strict: true,
    });
    const category = this.normalizeCategory(query.category, { strict: true });
    const limit = this.resolveRankingLimit(query.limit);
    const now = new Date();
    const configs = await this.prisma.rankingConfig.findMany({
      where: {
        targetType,
        scope: 'global',
        status: 'ACTIVE',
        deletedAt: null,
        ...(cityCode
          ? { OR: [{ cityCode: 'all' }, { cityCode }] }
          : {}),
        ...(category ? { OR: [{ category: null }, { category }] } : {}),
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
        ],
      },
      orderBy: [
        { pinRank: 'asc' },
        { manualScore: 'desc' },
        { updatedAt: 'desc' },
      ],
      take: limit * 4,
      select: {
        targetId: true,
        cityCode: true,
        category: true,
        scope: true,
        manualScore: true,
        pinRank: true,
        sponsored: true,
        updatedAt: true,
      },
    });
    const configByTargetId = this.mapRankingConfigs(configs);
    const rankedItems =
      targetType === 'STORE'
        ? await this.loadStoreRankingItems(configByTargetId, {
            cityCode,
            category,
          })
        : await this.loadCastRankingItems(configByTargetId, {
            cityCode,
            category,
          });
    const fallbackItems =
      rankedItems.length < limit
        ? await this.loadRankingFallbackItems(targetType, {
            cityCode,
            category,
            excludeIds: rankedItems.map((item) => item.targetId),
            take: limit - rankedItems.length,
          })
        : [];
    const data = [...rankedItems, ...fallbackItems]
      .slice(0, limit)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

    return {
      data,
      meta: {
        targetType,
        city: cityCode ?? 'all',
        category: category ?? null,
        limit,
        total: data.length,
      },
    };
  }

  async listAdminRankingConfigs(query: AdminRankingQueryDto = {}) {
    const targetType = query.targetType
      ? this.resolveRankingTargetType(query.targetType)
      : undefined;
    const cityCode =
      query.city !== undefined && query.city !== ''
        ? this.resolveAdminRankingCityCode(query.city)
        : undefined;
    const hasCategoryFilter =
      query.category !== undefined && query.category !== '';
    const category = hasCategoryFilter
      ? this.resolveAdminRankingCategory(query.category)
      : undefined;
    const scope = this.cleanText(query.scope);

    const configs = await this.prisma.rankingConfig.findMany({
      where: {
        deletedAt: null,
        ...(targetType ? { targetType } : {}),
        ...(cityCode ? { cityCode } : {}),
        ...(hasCategoryFilter ? { category } : {}),
        ...(scope ? { scope } : {}),
      },
      orderBy: [
        { targetType: 'asc' },
        { cityCode: 'asc' },
        { category: 'asc' },
        { scope: 'asc' },
        { pinRank: 'asc' },
        { manualScore: 'desc' },
        { updatedAt: 'desc' },
      ],
      select: this.adminRankingConfigSelect(),
    });

    return this.mapAdminRankingConfigs(configs as AdminRankingConfigRecord[]);
  }

  async listAdminRankingTargetOptions(
    query: AdminRankingTargetOptionsQueryDto = {},
  ) {
    const targetType = this.resolveRankingTargetType(query.targetType);
    const cityCode = this.normalizeCityCode(query.city, { strict: true });
    const category = this.resolveAdminRankingCategory(query.category) ?? undefined;
    const q = this.cleanText(query.q);
    const limit = Math.min(query.limit ?? 50, 100);

    if (targetType === 'STORE') {
      const stores = await this.prisma.store.findMany({
        where: {
          ...this.buildPublicStoreWhere(
            { city: cityCode, category },
            { includeTextSearch: false },
          ),
          ...(q
            ? {
                OR: [
                  { name: this.containsInsensitive(q) },
                  { slug: this.containsInsensitive(this.normalizeToken(q)) },
                ],
              }
            : {}),
        },
        orderBy: [{ name: 'asc' }],
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          status: true,
          city: true,
          district: true,
          area: {
            select: {
              id: true,
              code: true,
              name: true,
              city: true,
              district: true,
            },
          },
          media: {
            where: {
              deletedAt: null,
              access: 'PUBLIC',
              status: 'READY',
              type: 'IMAGE',
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { url: true },
          },
        },
      });

      return stores.map((store) => ({
        id: store.id,
        targetType: 'STORE' as const,
        name: store.name,
        slug: store.slug,
        image: store.media[0]?.url ?? null,
        area: store.area?.name ?? store.district,
        city: store.area?.city ?? store.city,
        cityCode: store.area?.code
          ? this.cityCodeFromAreaCode(store.area.code)
          : this.normalizeCityCode(store.city),
        category: store.category,
        status: store.status,
      }));
    }

    const casts = await this.prisma.cast.findMany({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        isPublic: true,
        store: this.buildPublicStoreWhere(
          { city: cityCode, category },
          { includeTextSearch: false },
        ),
        ...(q
          ? {
              OR: [
                { stageName: this.containsInsensitive(q) },
                { publicAlias: this.containsInsensitive(q) },
                { slug: this.containsInsensitive(this.normalizeToken(q)) },
                {
                  store: {
                    name: this.containsInsensitive(q),
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: [{ stageName: 'asc' }],
      take: limit,
      select: {
        id: true,
        slug: true,
        stageName: true,
        publicAlias: true,
        status: true,
        media: {
          where: {
            deletedAt: null,
            access: 'PUBLIC',
            status: 'READY',
            type: 'IMAGE',
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { url: true },
        },
        store: {
          select: {
            category: true,
            city: true,
            district: true,
            area: {
              select: {
                id: true,
                code: true,
                name: true,
                city: true,
                district: true,
              },
            },
          },
        },
      },
    });

    return casts.map((cast) => ({
      id: cast.id,
      targetType: 'CAST' as const,
      name: cast.publicAlias ?? cast.stageName,
      slug: cast.slug,
      image: cast.media[0]?.url ?? null,
      area: cast.store.area?.name ?? cast.store.district,
      city: cast.store.area?.city ?? cast.store.city,
      cityCode: cast.store.area?.code
        ? this.cityCodeFromAreaCode(cast.store.area.code)
        : this.normalizeCityCode(cast.store.city),
      category: cast.store.category,
      status: cast.status,
    }));
  }

  async createAdminRankingConfig(
    user: AuthenticatedUser,
    dto: CreateAdminRankingConfigDto,
  ) {
    const targetType = this.resolveRankingTargetType(dto.targetType);
    const cityCode = this.resolveAdminRankingCityCode(dto.cityCode);
    const category = this.resolveAdminRankingCategory(dto.category);
    const scope = this.resolveAdminRankingScope(dto.scope);
    const pinRank = dto.pinRank ?? null;
    const manualScore = dto.manualScore ?? 0;
    const { startsAt, endsAt } = this.resolveRankingWindow(
      dto.startsAt,
      dto.endsAt,
    );

    await this.assertAdminRankingTargetExists(targetType, dto.targetId);
    await this.assertNoPinnedRankingCollision({
      targetType,
      cityCode,
      category,
      scope,
      pinRank,
    });

    const config = await this.prisma.rankingConfig.create({
      data: {
        createdById: user.id,
        targetType,
        targetId: dto.targetId,
        areaId: dto.areaId ?? null,
        cityCode,
        category,
        scope,
        pinRank,
        manualScore,
        sponsored: dto.sponsored ?? false,
        reason: this.cleanText(dto.reason ?? undefined) || null,
        status: (dto.status ?? 'ACTIVE') as RankingConfigStatus,
        startsAt,
        endsAt,
      },
      select: this.adminRankingConfigSelect(),
    });

    return (await this.mapAdminRankingConfigs([
      config as AdminRankingConfigRecord,
    ]))[0];
  }

  async updateAdminRankingConfig(
    rankingId: string,
    dto: UpdateAdminRankingConfigDto,
  ) {
    const existing = await this.prisma.rankingConfig.findFirst({
      where: { id: rankingId, deletedAt: null },
      select: this.adminRankingConfigSelect(),
    });

    if (!existing) {
      throw new NotFoundException('Ranking config not found');
    }

    const current = existing as AdminRankingConfigRecord;
    const targetType = dto.targetType
      ? this.resolveRankingTargetType(dto.targetType)
      : current.targetType;
    const targetId = dto.targetId ?? current.targetId;
    const cityCode =
      dto.cityCode !== undefined
        ? this.resolveAdminRankingCityCode(dto.cityCode)
        : current.cityCode;
    const category =
      dto.category !== undefined
        ? this.resolveAdminRankingCategory(dto.category)
        : current.category;
    const scope =
      dto.scope !== undefined
        ? this.resolveAdminRankingScope(dto.scope)
        : current.scope;
    const pinRank =
      dto.pinRank !== undefined ? (dto.pinRank ?? null) : current.pinRank;
    const startsAtInput =
      dto.startsAt !== undefined
        ? dto.startsAt
        : current.startsAt?.toISOString() ?? null;
    const endsAtInput =
      dto.endsAt !== undefined ? dto.endsAt : current.endsAt?.toISOString() ?? null;
    const { startsAt, endsAt } = this.resolveRankingWindow(
      startsAtInput,
      endsAtInput,
    );

    if (dto.targetType !== undefined || dto.targetId !== undefined) {
      await this.assertAdminRankingTargetExists(targetType, targetId);
    }
    await this.assertNoPinnedRankingCollision({
      targetType,
      cityCode,
      category,
      scope,
      pinRank,
      excludeId: rankingId,
    });

    const config = await this.prisma.rankingConfig.update({
      where: { id: rankingId },
      data: {
        ...(dto.targetType !== undefined ? { targetType } : {}),
        ...(dto.targetId !== undefined ? { targetId } : {}),
        ...(dto.areaId !== undefined ? { areaId: dto.areaId ?? null } : {}),
        ...(dto.cityCode !== undefined ? { cityCode } : {}),
        ...(dto.category !== undefined ? { category } : {}),
        ...(dto.scope !== undefined ? { scope } : {}),
        ...(dto.pinRank !== undefined ? { pinRank } : {}),
        ...(dto.manualScore !== undefined ? { manualScore: dto.manualScore } : {}),
        ...(dto.sponsored !== undefined ? { sponsored: dto.sponsored } : {}),
        ...(dto.reason !== undefined
          ? { reason: this.cleanText(dto.reason ?? undefined) || null }
          : {}),
        ...(dto.status !== undefined
          ? { status: dto.status as RankingConfigStatus }
          : {}),
        ...(dto.startsAt !== undefined ? { startsAt } : {}),
        ...(dto.endsAt !== undefined ? { endsAt } : {}),
      },
      select: this.adminRankingConfigSelect(),
    });

    return (await this.mapAdminRankingConfigs([
      config as AdminRankingConfigRecord,
    ]))[0];
  }

  async deleteAdminRankingConfig(rankingId: string) {
    const existing = await this.prisma.rankingConfig.findFirst({
      where: { id: rankingId, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Ranking config not found');
    }

    await this.prisma.rankingConfig.update({
      where: { id: rankingId },
      data: {
        status: 'DELETED',
        deletedAt: new Date(),
      },
      select: { id: true },
    });

    return { id: rankingId, deleted: true };
  }

  async listPublicStores(query: PublicDiscoveryQueryDto = {}) {
    const coordinates = this.parseCoordinates(query);
    const pagination = this.resolvePagination(query);
    const sort = this.resolveSort(query.sort, coordinates);
    const readArgs = this.resolvePublicReadArgs(sort, pagination);
    const where = this.buildPublicStoreWhere(query, { includeCastName: true });
    const [total, stores] = await Promise.all([
      this.prisma.store.count({ where }),
      this.prisma.store.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...readArgs,
        select: {
          id: true,
          createdAt: true,
          name: true,
          slug: true,
          category: true,
          description: true,
          address: true,
          city: true,
          district: true,
          latitude: true,
          longitude: true,
          area: {
            select: {
              id: true,
              code: true,
              name: true,
              city: true,
              district: true,
            },
          },
          media: {
            where: {
              deletedAt: null,
              access: 'PUBLIC',
              status: 'READY',
              type: 'IMAGE',
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              url: true,
            },
          },
        },
      }),
    ]);

    const mappedStores = stores.map((store) => ({
      id: store.id,
      createdAt: store.createdAt,
      name: store.name,
      slug: store.slug,
      category: store.category,
      description: store.description,
      address: store.address,
      city: store.city,
      cityCode: store.area?.code
        ? this.cityCodeFromAreaCode(store.area.code)
        : this.normalizeCityCode(store.city),
      district: store.district,
      area: store.area
        ? {
            id: store.area.id,
            code: store.area.code,
            name: store.area.name,
            city: store.area.city,
            district: store.area.district,
            cityCode: this.cityCodeFromAreaCode(store.area.code),
          }
        : null,
      latitude: this.toNumber(store.latitude),
      longitude: this.toNumber(store.longitude),
      thumbnailUrl: store.media[0]?.url ?? null,
      distanceKm: this.calculateDistanceKm(
        coordinates,
        store.latitude,
        store.longitude,
      ),
    }));
    const rankedStores =
      sort === 'priority'
        ? await this.loadRankingMap(
            'STORE',
            mappedStores.map((store) => store.id),
          )
        : new Map<string, RankingScore>();
    const data = this.finalizePublicItems(
      mappedStores,
      sort,
      pagination,
      rankedStores,
    );

    return this.buildPublicListResponse(data, total, pagination, sort);
  }

  async getPublicStoreBySlug(slug: string) {
    const normalizedSlug = this.normalizeStoreSlug(slug);
    if (!normalizedSlug) {
      throw new BadRequestException('slug is required');
    }

    const now = new Date();
    const store = await this.prisma.store.findFirst({
      where: {
        slug: normalizedSlug,
        deletedAt: null,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        areaId: true,
        createdAt: true,
        updatedAt: true,
        name: true,
        slug: true,
        category: true,
        description: true,
        address: true,
        city: true,
        district: true,
        phone: true,
        latitude: true,
        longitude: true,
        openingHours: true,
        holidaySchedule: true,
        mapUrl: true,
        googlePlaceId: true,
        area: {
          select: {
            id: true,
            code: true,
            name: true,
            city: true,
            district: true,
            ward: true,
          },
        },
        media: {
          where: {
            deletedAt: null,
            access: 'PUBLIC',
            status: 'READY',
            type: { in: ['IMAGE', 'VIDEO'] },
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            type: true,
            url: true,
            purpose: true,
            mimeType: true,
            originalName: true,
            createdAt: true,
          },
        },
        casts: {
          where: {
            deletedAt: null,
            status: 'ACTIVE',
            isPublic: true,
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            slug: true,
            stageName: true,
            publicAlias: true,
            publicHeadline: true,
            tags: true,
            languages: true,
            hourlyRateVnd: true,
            media: {
              where: {
                deletedAt: null,
                access: 'PUBLIC',
                status: 'READY',
                type: 'IMAGE',
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: {
                url: true,
              },
            },
          },
        },
        coupons: {
          where: this.buildActiveCouponWhere(now),
          orderBy: { startsAt: 'desc' },
          select: {
            id: true,
            code: true,
            name: true,
            description: true,
            discountType: true,
            discountValue: true,
            maxDiscountVnd: true,
            minSpendVnd: true,
            startsAt: true,
            endsAt: true,
            usageLimit: true,
            usedCount: true,
          },
        },
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const relatedStores = await this.prisma.store.findMany({
      where: {
        id: { not: store.id },
        deletedAt: null,
        status: 'ACTIVE',
        OR: [
          ...(store.areaId ? [{ areaId: store.areaId }] : []),
          { category: store.category, city: store.city },
          { city: store.city },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 4,
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        city: true,
        district: true,
        area: {
          select: {
            id: true,
            code: true,
            name: true,
            city: true,
            district: true,
            ward: true,
          },
        },
        media: {
          where: {
            deletedAt: null,
            access: 'PUBLIC',
            status: 'READY',
            type: 'IMAGE',
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            url: true,
          },
        },
      },
    });

    const gallery = store.media.map((media) => ({
      id: media.id,
      type: media.type,
      url: this.resolvePublicStoreMediaUrl(
        media.url,
        media.type,
        store.category,
      ),
      purpose: media.purpose,
      mimeType: media.mimeType,
      alt: media.originalName || store.name,
    }));
    const activeCoupons = store.coupons.map((coupon) => ({
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscountVnd: coupon.maxDiscountVnd,
      minSpendVnd: coupon.minSpendVnd,
      startsAt: coupon.startsAt,
      endsAt: coupon.endsAt,
      usageLimit: coupon.usageLimit,
      usedCount: coupon.usedCount,
    }));
    const seoDescription = this.buildStoreSeoDescription(store);

    return {
      id: store.id,
      slug: store.slug,
      name: store.name,
      category: store.category,
      description: store.description,
      area: this.mapPublicArea(store.area),
      address: store.address,
      city: store.city,
      cityCode: store.area?.code
        ? this.cityCodeFromAreaCode(store.area.code)
        : this.normalizeCityCode(store.city),
      district: store.district,
      phone: store.phone,
      latitude: this.toNumber(store.latitude),
      longitude: this.toNumber(store.longitude),
      mapUrl: store.mapUrl,
      googlePlaceId: store.googlePlaceId,
      openingHours: store.openingHours,
      holidaySchedule: store.holidaySchedule,
      gallery,
      casts: store.casts.map((cast) => ({
        id: cast.id,
        slug: cast.slug,
        stageName: cast.stageName,
        publicAlias: cast.publicAlias,
        publicHeadline: cast.publicHeadline,
        thumbnailUrl: cast.media[0]?.url ?? null,
        tags: cast.tags,
        languages: cast.languages,
        hourlyRateVnd: cast.hourlyRateVnd,
      })),
      priceReference: this.buildStorePriceReference(store.casts),
      activeCoupons,
      campaigns: activeCoupons.map((coupon) => ({
        id: coupon.id,
        title: coupon.name,
        description: coupon.description,
        source: 'coupon' as const,
        couponId: coupon.id,
      })),
      relatedStores: relatedStores.map((relatedStore) => ({
        id: relatedStore.id,
        slug: relatedStore.slug,
        name: relatedStore.name,
        category: relatedStore.category,
        city: relatedStore.city,
        district: relatedStore.district,
        area: this.mapPublicArea(relatedStore.area),
        thumbnailUrl: relatedStore.media[0]?.url ?? null,
        relatedReason:
          relatedStore.area?.id && relatedStore.area.id === store.areaId
            ? 'same-area'
            : relatedStore.category === store.category &&
                relatedStore.city === store.city
              ? 'same-category'
              : 'same-city',
      })),
      seo: {
        title: `${store.name} | NightLife VN`,
        description: seoDescription,
        canonicalPath: `/stores/${store.slug}`,
        ogImage: gallery.find((item) => item.type === 'IMAGE')?.url ?? null,
      },
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
    };
  }

  async listPublicCasts(query: PublicDiscoveryQueryDto = {}) {
    const coordinates = this.parseCoordinates(query);
    const pagination = this.resolvePagination(query);
    const sort = this.resolveSort(query.sort, coordinates);
    const readArgs = this.resolvePublicReadArgs(sort, pagination);
    const searchTerm = this.cleanText(query.q);
    const searchToken = this.normalizeToken(searchTerm);
    const language = this.normalizeToken(query.language);
    const tag = this.normalizeToken(query.tag);
    const where: Prisma.CastWhereInput = {
      deletedAt: null,
      status: 'ACTIVE',
      isPublic: true,
      store: this.buildPublicStoreWhere(query, { includeTextSearch: false }),
      ...(language ? { languages: { has: language } } : {}),
      ...(tag ? { tags: { has: tag } } : {}),
      ...(searchTerm
        ? {
            OR: [
              { stageName: this.containsInsensitive(searchTerm) },
              { publicAlias: this.containsInsensitive(searchTerm) },
              { publicHeadline: this.containsInsensitive(searchTerm) },
              { bio: this.containsInsensitive(searchTerm) },
              { publicBio: this.containsInsensitive(searchTerm) },
              ...(searchToken
                ? [
                    { tags: { has: searchToken } },
                    { languages: { has: searchToken } },
                  ]
                : []),
              {
                store: {
                  name: this.containsInsensitive(searchTerm),
                  deletedAt: null,
                  status: 'ACTIVE',
                },
              },
            ],
          }
        : {}),
    };
    const [total, casts] = await Promise.all([
      this.prisma.cast.count({ where }),
      this.prisma.cast.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...readArgs,
        select: {
          id: true,
          createdAt: true,
          slug: true,
          stageName: true,
          publicAlias: true,
          publicHeadline: true,
          tags: true,
          languages: true,
          hourlyRateVnd: true,
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
              category: true,
              city: true,
              district: true,
              latitude: true,
              longitude: true,
              area: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  city: true,
                  district: true,
                },
              },
            },
          },
          media: {
            where: {
              deletedAt: null,
              access: 'PUBLIC',
              status: 'READY',
              type: 'IMAGE',
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              url: true,
            },
          },
        },
      }),
    ]);

    const mappedCasts = casts.map((cast) => ({
      id: cast.id,
      createdAt: cast.createdAt,
      slug: cast.slug,
      stageName: cast.stageName,
      name: cast.publicAlias ?? cast.stageName,
      publicAlias: cast.publicAlias,
      publicHeadline: cast.publicHeadline,
      tags: cast.tags,
      languages: cast.languages,
      hourlyRateVnd: cast.hourlyRateVnd,
      thumbnailUrl: cast.media[0]?.url ?? null,
      distanceKm: this.calculateDistanceKm(
        coordinates,
        cast.store.latitude,
        cast.store.longitude,
      ),
      store: {
        id: cast.store.id,
        name: cast.store.name,
        slug: cast.store.slug,
        category: cast.store.category,
        city: cast.store.city,
        cityCode: cast.store.area?.code
          ? this.cityCodeFromAreaCode(cast.store.area.code)
          : this.normalizeCityCode(cast.store.city),
        district: cast.store.district,
        area: cast.store.area
          ? {
              id: cast.store.area.id,
              code: cast.store.area.code,
              name: cast.store.area.name,
              city: cast.store.area.city,
              district: cast.store.area.district,
              cityCode: this.cityCodeFromAreaCode(cast.store.area.code),
            }
          : null,
        latitude: this.toNumber(cast.store.latitude),
        longitude: this.toNumber(cast.store.longitude),
      },
    }));
    const rankedCasts =
      sort === 'priority'
        ? await this.loadRankingMap(
            'CAST',
            mappedCasts.map((cast) => cast.id),
          )
        : new Map<string, RankingScore>();
    const data = this.finalizePublicItems(
      mappedCasts,
      sort,
      pagination,
      rankedCasts,
    );

    return this.buildPublicListResponse(data, total, pagination, sort);
  }

  async getPublicCastBySlug(slug: string) {
    const normalizedSlug = this.normalizeCastSlug(slug);
    if (!normalizedSlug) {
      throw new BadRequestException('slug is required');
    }

    const cast = await this.prisma.cast.findFirst({
      where: {
        slug: normalizedSlug,
        deletedAt: null,
        status: 'ACTIVE',
        isPublic: true,
        store: {
          deletedAt: null,
          status: 'ACTIVE',
        },
      },
      select: {
        id: true,
        slug: true,
        storeId: true,
        stageName: true,
        publicAlias: true,
        publicHeadline: true,
        publicBio: true,
        tags: true,
        languages: true,
        hourlyRateVnd: true,
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            description: true,
            address: true,
            city: true,
            district: true,
            phone: true,
            latitude: true,
            longitude: true,
            mapUrl: true,
            googlePlaceId: true,
            area: {
              select: {
                id: true,
                code: true,
                name: true,
                city: true,
                district: true,
                ward: true,
              },
            },
          },
        },
        media: {
          where: {
            deletedAt: null,
            access: 'PUBLIC',
            status: 'READY',
            type: { in: ['IMAGE', 'VIDEO'] },
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            type: true,
            url: true,
            purpose: true,
            mimeType: true,
            originalName: true,
            createdAt: true,
          },
        },
      },
    });

    if (!cast) {
      throw new NotFoundException('Cast not found');
    }

    const gallery = cast.media.map((media) => ({
      id: media.id,
      type: media.type,
      url: media.url,
      purpose: media.purpose,
      mimeType: media.mimeType,
      alt: media.originalName || cast.publicAlias || cast.stageName,
    }));
    const thumbnailUrl =
      gallery.find((item) => item.type === 'IMAGE')?.url ?? null;
    const name = cast.publicAlias ?? cast.stageName;
    const seoDescription = this.buildCastSeoDescription(cast);
    const relatedCasts = await this.loadRelatedPublicCasts(cast);

    return {
      id: cast.id,
      slug: cast.slug,
      stageName: cast.stageName,
      name,
      publicAlias: cast.publicAlias,
      publicHeadline: cast.publicHeadline,
      publicBio: cast.publicBio,
      monthOfBirth: null,
      zodiacSign: null,
      heightCm: null,
      measurements: null,
      interests: [],
      tags: cast.tags,
      languages: cast.languages,
      hourlyRateVnd: cast.hourlyRateVnd,
      thumbnailUrl,
      gallery,
      relatedCasts,
      store: {
        id: cast.store.id,
        name: cast.store.name,
        slug: cast.store.slug,
        category: cast.store.category,
        description: cast.store.description,
        address: cast.store.address,
        city: cast.store.city,
        cityCode: cast.store.area?.code
          ? this.cityCodeFromAreaCode(cast.store.area.code)
          : this.normalizeCityCode(cast.store.city),
        district: cast.store.district,
        area: this.mapPublicArea(cast.store.area),
        phone: cast.store.phone,
        latitude: this.toNumber(cast.store.latitude),
        longitude: this.toNumber(cast.store.longitude),
        mapUrl: cast.store.mapUrl,
        googlePlaceId: cast.store.googlePlaceId,
      },
      seo: {
        title: `${name} tại ${cast.store.name} | NightLife VN`,
        description: seoDescription,
        canonicalPath: `/casts/${cast.slug}`,
        ogImage: thumbnailUrl,
      },
    };
  }

  listPublicCoupons() {
    const now = new Date();

    return this.prisma.coupon.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
        startsAt: { lte: now },
        OR: [{ endsAt: null }, { endsAt: { gt: now } }],
        store: {
          status: 'ACTIVE',
          deletedAt: null,
        },
      },
      orderBy: { startsAt: 'desc' },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        discountType: true,
        discountValue: true,
        maxDiscountVnd: true,
        minSpendVnd: true,
        startsAt: true,
        endsAt: true,
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            city: true,
            district: true,
          },
        },
      },
    });
  }

  async claimGuestCoupon(couponId: string, dto: ClaimGuestCouponDto) {
    const now = new Date();
    const coupon = await this.prisma.coupon.findFirst({
      where: {
        id: couponId,
        status: 'ACTIVE',
        deletedAt: null,
        store: { status: 'ACTIVE', deletedAt: null },
      },
      select: {
        id: true,
        code: true,
        name: true,
        storeId: true,
        discountType: true,
        discountValue: true,
        maxDiscountVnd: true,
        minSpendVnd: true,
        endsAt: true,
        usageLimit: true,
        usedCount: true,
        store: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!coupon || (coupon.endsAt && coupon.endsAt <= now)) {
      throw new NotFoundException('Coupon not found');
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new UnprocessableEntityException(
        'Coupon usage limit has been reached',
      );
    }

    const guest = await this.prisma.guest.create({
      data: {
        displayName: dto.displayName,
        phone: dto.phone,
        email: dto.email?.toLowerCase(),
      },
      select: { id: true },
    });
    const issueCode = `GUEST-${randomUUID()}`;
    const userType: CouponUserType = 'GUEST';
    const qrPayload = this.buildCouponQrPayload(issueCode);
    const discountRuleSnapshot = this.buildCouponDiscountRuleSnapshot(
      coupon,
      userType,
    );

    const issue = await this.prisma.couponIssue.create({
      data: {
        couponId: coupon.id,
        guestId: guest.id,
        code: issueCode,
        qrPayloadHash: this.buildCouponQrPayloadHash(qrPayload),
        expiresAt: this.capExpiry(
          new Date(now.getTime() + DAY_MS),
          coupon.endsAt,
        ),
        metadata: {
          recipientType: 'GUEST',
          userType,
          validityHours: 24,
          qrPayload,
          statusLabel: this.couponIssueStatusLabel('ISSUED'),
          discountPercent: discountRuleSnapshot.discountPercent,
          discountRuleSnapshot,
          campaignSnapshot: this.buildCouponCampaignSnapshot(coupon),
        },
      },
      select: {
        id: true,
        code: true,
        status: true,
        expiresAt: true,
        createdAt: true,
        metadata: true,
        coupon: {
          select: {
            id: true,
            code: true,
            name: true,
            discountType: true,
            discountValue: true,
            maxDiscountVnd: true,
            minSpendVnd: true,
            store: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    return {
      issue: this.decorateCouponIssue(issue),
      guest: { id: guest.id },
    };
  }

  async claimMemberCoupon(couponId: string, user: AuthenticatedUser) {
    const now = new Date();
    const coupon = await this.prisma.coupon.findFirst({
      where: {
        id: couponId,
        status: 'ACTIVE',
        deletedAt: null,
        store: { status: 'ACTIVE', deletedAt: null },
      },
      select: {
        id: true,
        code: true,
        name: true,
        storeId: true,
        discountType: true,
        discountValue: true,
        maxDiscountVnd: true,
        minSpendVnd: true,
        endsAt: true,
        usageLimit: true,
        usedCount: true,
        store: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!coupon || (coupon.endsAt && coupon.endsAt <= now)) {
      throw new NotFoundException('Coupon not found');
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new UnprocessableEntityException(
        'Coupon usage limit has been reached',
      );
    }

    const issueCode = `MEMBER-${randomUUID()}`;
    const userType = this.resolveCouponUserType(user);
    const qrPayload = this.buildCouponQrPayload(issueCode);
    const discountRuleSnapshot = this.buildCouponDiscountRuleSnapshot(
      coupon,
      userType,
      user.tier ?? 'FREE',
    );

    const issue = await this.prisma.couponIssue.create({
      data: {
        couponId: coupon.id,
        userId: user.id,
        code: issueCode,
        qrPayloadHash: this.buildCouponQrPayloadHash(qrPayload),
        expiresAt: this.capExpiry(
          new Date(now.getTime() + 7 * DAY_MS),
          coupon.endsAt,
        ),
        metadata: {
          recipientType: 'MEMBER',
          userType,
          tier: user.tier ?? 'FREE',
          validityDays: 7,
          qrPayload,
          statusLabel: this.couponIssueStatusLabel('ISSUED'),
          discountPercent: discountRuleSnapshot.discountPercent,
          discountRuleSnapshot,
          campaignSnapshot: this.buildCouponCampaignSnapshot(coupon),
        },
      },
      select: {
        id: true,
        code: true,
        status: true,
        expiresAt: true,
        createdAt: true,
        metadata: true,
        coupon: {
          select: {
            id: true,
            code: true,
            name: true,
            discountType: true,
            discountValue: true,
            maxDiscountVnd: true,
            minSpendVnd: true,
            store: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    return this.decorateCouponIssue(issue);
  }

  async listPartnerStores(user: AuthenticatedUser) {
    const storeIds = await this.accessService.getAccessibleStoreIds(
      user,
      'store.partner.view',
    );

    return this.prisma.store.findMany({
      where: {
        deletedAt: null,
        ...(storeIds ? { id: { in: storeIds } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        status: true,
        city: true,
        district: true,
        createdAt: true,
      },
    });
  }

  async listPartnerCoupons(user: AuthenticatedUser) {
    const storeIds = await this.accessService.getAccessibleStoreIds(
      user,
      'coupon.partner.view',
    );

    return this.prisma.coupon.findMany({
      where: {
        deletedAt: null,
        ...(storeIds ? { storeId: { in: storeIds } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        storeId: true,
        code: true,
        name: true,
        status: true,
        usedCount: true,
        usageLimit: true,
        startsAt: true,
        endsAt: true,
        store: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async listPartnerBookings(user: AuthenticatedUser) {
    const storeIds = await this.accessService.getAccessibleStoreIds(
      user,
      'booking.partner.view',
    );

    return this.prisma.booking.findMany({
      where: {
        deletedAt: null,
        ...(storeIds ? { storeId: { in: storeIds } } : {}),
      },
      orderBy: { scheduledAt: 'desc' },
      select: {
        id: true,
        storeId: true,
        status: true,
        scheduledAt: true,
        partySize: true,
        subtotalVnd: true,
        discountVnd: true,
        totalVnd: true,
        store: { select: { id: true, name: true, slug: true } },
        cast: {
          select: {
            id: true,
            slug: true,
            stageName: true,
            publicAlias: true,
          },
        },
        coupon: { select: { id: true, code: true, name: true } },
        user: { select: { id: true, displayName: true, tier: true } },
        guest: { select: { id: true, displayName: true } },
        note: true,
        createdAt: true,
      },
    });
  }

  async listOperatorBookings(user: AuthenticatedUser) {
    return this.listPartnerBookings(user);
  }

  async createGuestBooking(dto: CreateBookingDto) {
    const target = await this.resolveBookingTarget(dto);
    const contact = this.sanitizeBookingContact(dto);
    const guest = await this.prisma.guest.create({
      data: {
        displayName: contact.displayName,
        phone: contact.phone,
      },
      select: {
        id: true,
      },
    });

    const booking = await this.createBookingRecord({
      dto,
      target,
      note: contact.note,
      guestId: guest.id,
    });

    await this.adminNotificationService?.notifyBookingCreated(booking);
    if (this.telegramService) {
      await this.telegramService.notifyNewBooking(booking);
    }

    return booking;
  }

  async createMemberBooking(user: AuthenticatedUser, dto: CreateBookingDto) {
    const target = await this.resolveBookingTarget(dto);
    const contact = this.sanitizeBookingContact(dto);
    const guest = await this.prisma.guest.create({
      data: {
        convertedUserId: user.id,
        displayName: contact.displayName,
        phone: contact.phone,
      },
      select: {
        id: true,
      },
    });

    const booking = await this.createBookingRecord({
      dto,
      target,
      note: contact.note,
      userId: user.id,
      guestId: guest.id,
    });

    await this.adminNotificationService?.notifyBookingCreated(booking);
    if (this.telegramService) {
      await this.telegramService.notifyNewBooking(booking);
    }

    return booking;
  }

  async cancelMemberBooking(
    user: AuthenticatedUser,
    bookingId: string,
    dto: CancelBookingDto = {},
  ) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: user.id,
        deletedAt: null,
      },
      select: {
        id: true,
        status: true,
        scheduledAt: true,
        partySize: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status === 'CANCELLED') {
      throw new UnprocessableEntityException(
        'Booking has already been cancelled',
      );
    }

    if (['CHECKED_IN', 'COMPLETED', 'NO_SHOW'].includes(booking.status)) {
      throw new UnprocessableEntityException(
        'Booking cannot be cancelled in its current state',
      );
    }

    const msUntilBooking = new Date(booking.scheduledAt).getTime() - Date.now();
    if (msUntilBooking < BOOKING_CANCEL_CUTOFF_MS) {
      throw new UnprocessableEntityException(
        'Booking can only be cancelled at least 1 hour before scheduled time',
      );
    }

    const result = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
      select: this.bookingNotificationSelect(),
    });

    await this.adminNotificationService?.notifyBookingCancelled(result, {
      reason: dto.reason,
    });

    return result;
  }

  async scanCouponIssue(code: string, user: AuthenticatedUser) {
    const issue = await this.prisma.couponIssue.findUnique({
      where: { code },
      select: {
        id: true,
        code: true,
        status: true,
        expiresAt: true,
        usedAt: true,
        metadata: true,
        user: { select: { id: true, displayName: true, tier: true } },
        guest: { select: { id: true, displayName: true } },
        booking: { select: { id: true, status: true, scheduledAt: true } },
        coupon: {
          select: {
            id: true,
            code: true,
            name: true,
            storeId: true,
            store: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    if (!issue) {
      throw new NotFoundException('Coupon issue not found');
    }

    await this.accessService.ensureStoreAccess(
      user,
      issue.coupon.storeId,
      'coupon.scan',
    );
    await this.assertIssueCanBeConfirmed(issue);

    const scannedIssue = await this.prisma.couponIssue.update({
      where: { id: issue.id },
      data: { scannedById: user.id },
      select: {
        id: true,
        code: true,
        status: true,
        expiresAt: true,
        usedAt: true,
        metadata: true,
        user: { select: { id: true, displayName: true, tier: true } },
        guest: { select: { id: true, displayName: true } },
        booking: { select: { id: true, status: true, scheduledAt: true } },
        coupon: {
          select: {
            id: true,
            code: true,
            name: true,
            discountType: true,
            discountValue: true,
            maxDiscountVnd: true,
            minSpendVnd: true,
            store: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    return this.decorateCouponIssue(scannedIssue);
  }

  async confirmCouponIssueCheckIn(
    couponIssueId: string,
    user: AuthenticatedUser,
  ) {
    const issue = await this.prisma.couponIssue.findUnique({
      where: { id: couponIssueId },
      select: {
        id: true,
        couponId: true,
        status: true,
        expiresAt: true,
        coupon: { select: { storeId: true } },
        booking: { select: { id: true, status: true } },
      },
    });

    if (!issue) {
      throw new NotFoundException('Coupon issue not found');
    }

    await this.accessService.ensureStoreAccess(
      user,
      issue.coupon.storeId,
      'checkin.confirm',
    );
    await this.assertIssueCanBeConfirmed(issue);

    const now = new Date();

    const usedIssue = await this.prisma.couponIssue.updateMany({
      where: {
        id: issue.id,
        status: 'ISSUED',
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      data: {
        status: 'USED',
        usedAt: now,
        scannedById: user.id,
      },
    });

    if (usedIssue.count !== 1) {
      throw new UnprocessableEntityException(
        'Coupon issue has already been used',
      );
    }

    const updatedIssue = await this.prisma.couponIssue.findUnique({
      where: { id: issue.id },
      select: {
        id: true,
        code: true,
        status: true,
        expiresAt: true,
        usedAt: true,
        scannedById: true,
        metadata: true,
        coupon: {
          select: {
            id: true,
            code: true,
            name: true,
            discountType: true,
            discountValue: true,
            maxDiscountVnd: true,
            minSpendVnd: true,
            store: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    if (!updatedIssue) {
      throw new NotFoundException('Coupon issue not found');
    }

    await this.prisma.coupon.update({
      where: { id: issue.couponId },
      data: { usedCount: { increment: 1 } },
    });

    if (issue.booking) {
      await this.prisma.booking.update({
        where: { id: issue.booking.id },
        data: { status: 'CHECKED_IN' },
      });
    }

    return this.decorateCouponIssue(updatedIssue);
  }

  async listPartnerBills(user: AuthenticatedUser) {
    const storeIds = await this.accessService.getAccessibleStoreIds(
      user,
      'bill.partner.view',
    );

    return this.prisma.bill.findMany({
      where: {
        deletedAt: null,
        ...(storeIds ? { storeId: { in: storeIds } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        storeId: true,
        billNumber: true,
        status: true,
        subtotalVnd: true,
        discountVnd: true,
        totalVnd: true,
        submittedAt: true,
        reviewedAt: true,
        verifiedAt: true,
        rejectedAt: true,
        reviewedById: true,
        verifiedById: true,
        rejectedById: true,
        rejectReason: true,
        store: { select: { id: true, name: true, slug: true } },
        booking: { select: { id: true, status: true, scheduledAt: true } },
        coupon: { select: { id: true, code: true, name: true } },
      },
    });
  }

  async listOperatorBills(user: AuthenticatedUser) {
    return this.listPartnerBills(user);
  }

  listMemberBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { scheduledAt: 'desc' },
      select: {
        id: true,
        status: true,
        scheduledAt: true,
        partySize: true,
        subtotalVnd: true,
        discountVnd: true,
        totalVnd: true,
        store: { select: { id: true, name: true, slug: true } },
        cast: {
          select: {
            id: true,
            slug: true,
            stageName: true,
            publicAlias: true,
          },
        },
        coupon: { select: { id: true, code: true, name: true } },
        guest: { select: { id: true, displayName: true, phone: true } },
        note: true,
        createdAt: true,
      },
    });
  }

  async listMemberFavoriteCasts(userId: string) {
    const favorites = await this.prisma.memberFavoriteCast.findMany({
      where: {
        userId,
        cast: {
          deletedAt: null,
          status: 'ACTIVE',
          isPublic: true,
          store: {
            deletedAt: null,
            status: 'ACTIVE',
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        cast: {
          select: {
            id: true,
            slug: true,
            stageName: true,
            publicAlias: true,
            publicHeadline: true,
            tags: true,
            languages: true,
            hourlyRateVnd: true,
            media: {
              where: {
                deletedAt: null,
                access: 'PUBLIC',
                status: 'READY',
                type: 'IMAGE',
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { url: true },
            },
            store: {
              select: {
                id: true,
                name: true,
                slug: true,
                category: true,
                description: true,
                address: true,
                city: true,
                district: true,
                latitude: true,
                longitude: true,
                area: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                    city: true,
                    district: true,
                    ward: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return favorites.map((favorite) => ({
      favoriteId: favorite.id,
      favoritedAt: favorite.createdAt,
      cast: this.mapPublicRelatedCast(favorite.cast, 'same-store'),
    }));
  }

  async getMemberCastFavoriteState(userId: string, slug: string) {
    const cast = await this.resolvePublicCastForMemberFavorite(slug);
    const favorite = await this.prisma.memberFavoriteCast.findUnique({
      where: {
        userId_castId: {
          userId,
          castId: cast.id,
        },
      },
      select: { id: true },
    });

    return {
      castId: cast.id,
      castSlug: cast.slug,
      favorited: Boolean(favorite),
    };
  }

  async favoriteMemberCast(user: AuthenticatedUser, slug: string) {
    const cast = await this.resolvePublicCastForMemberFavorite(slug);

    await this.prisma.memberFavoriteCast.upsert({
      where: {
        userId_castId: {
          userId: user.id,
          castId: cast.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        castId: cast.id,
      },
    });

    return {
      castId: cast.id,
      castSlug: cast.slug,
      favorited: true,
    };
  }

  async unfavoriteMemberCast(user: AuthenticatedUser, slug: string) {
    const cast = await this.resolvePublicCastForMemberFavorite(slug);

    await this.prisma.memberFavoriteCast.deleteMany({
      where: {
        userId: user.id,
        castId: cast.id,
      },
    });

    return {
      castId: cast.id,
      castSlug: cast.slug,
      favorited: false,
    };
  }

  async listMemberCouponIssues(userId: string) {
    await this.expireIssuedCouponIssues({ userId });

    const issues = await this.prisma.couponIssue.findMany({
      where: {
        userId,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
        status: true,
        expiresAt: true,
        usedAt: true,
        metadata: true,
        coupon: {
          select: {
            id: true,
            code: true,
            name: true,
            discountType: true,
            discountValue: true,
            maxDiscountVnd: true,
            minSpendVnd: true,
            store: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    return issues.map((issue) => this.decorateCouponIssue(issue));
  }

  async submitMemberBill(user: AuthenticatedUser, dto: CreateBillDto) {
    const booking = dto.bookingId
      ? await this.prisma.booking.findFirst({
          where: {
            id: dto.bookingId,
            userId: user.id,
            deletedAt: null,
          },
          select: {
            id: true,
            status: true,
            storeId: true,
            guestId: true,
            couponId: true,
            couponIssueId: true,
            scheduledAt: true,
            store: { select: { id: true, name: true, slug: true } },
            guest: { select: { id: true, displayName: true, phone: true } },
            coupon: { select: { id: true, code: true, name: true } },
          },
        })
      : null;

    if (dto.bookingId && !booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking?.status === 'CANCELLED') {
      throw new UnprocessableEntityException(
        'Cancelled booking cannot submit a bill',
      );
    }

    if (booking?.id) {
      const existingBill = await this.prisma.bill.findFirst({
        where: {
          bookingId: booking.id,
          deletedAt: null,
        },
        select: { id: true },
      });

      if (existingBill) {
        throw new UnprocessableEntityException(
          'Booking already has a submitted bill',
        );
      }
    }

    const store = booking?.store ?? (await this.resolveBillStore(dto));
    const now = new Date();
    const bill = await this.prisma.bill.create({
      data: {
        bookingId: booking?.id,
        userId: user.id,
        guestId: booking?.guestId,
        storeId: store.id,
        couponId: booking?.couponId,
        couponIssueId: booking?.couponIssueId,
        status: 'SUBMITTED',
        billNumber: this.buildBillNumber(now),
        subtotalVnd: dto.subtotalVnd ?? dto.totalVnd,
        discountVnd: dto.discountVnd ?? 0,
        serviceChargeVnd: dto.serviceChargeVnd ?? 0,
        taxVnd: dto.taxVnd ?? 0,
        totalVnd: dto.totalVnd,
        paidVnd: dto.paidVnd ?? dto.totalVnd,
        submittedAt: now,
      },
      select: this.billNotificationSelect(),
    });

    await this.adminNotificationService?.notifyBillSubmitted(bill);

    return bill;
  }

  async createPartnerRequest(dto: CreatePartnerRequestDto) {
    const submittedAt = new Date();
    const request = {
      id: `PARTNER-${randomUUID().slice(0, 8).toUpperCase()}`,
      businessName: this.cleanText(dto.businessName),
      businessType: this.cleanText(dto.businessType) || null,
      area: this.cleanText(dto.area) || null,
      contactName: this.cleanText(dto.contactName),
      contactPhone: this.cleanText(dto.contactPhone),
      contactEmail: this.cleanText(dto.contactEmail) || null,
      note: this.cleanText(dto.note) || null,
      submittedAt,
    };

    await this.adminNotificationService?.notifyPartnerRequest(request);

    return {
      id: request.id,
      status: 'PENDING_REVIEW',
      submittedAt,
      message: 'Partner request submitted for admin review',
    };
  }

  async listSensitiveBillsForAdmin(user: AuthenticatedUser) {
    const bills = await this.prisma.bill.findMany({
      where: {
        deletedAt: null,
        status: { in: ['SUBMITTED', 'REJECTED'] },
      },
      orderBy: { submittedAt: 'desc' },
      select: {
        id: true,
        billNumber: true,
        status: true,
        subtotalVnd: true,
        discountVnd: true,
        serviceChargeVnd: true,
        taxVnd: true,
        totalVnd: true,
        paidVnd: true,
        commissionAmountVnd: true,
        pointsEarned: true,
        discountRuleSnapshot: true,
        commissionRuleSnapshot: true,
        pointRuleSnapshot: true,
        submittedAt: true,
        reviewedAt: true,
        verifiedAt: true,
        rejectedAt: true,
        reviewedById: true,
        verifiedById: true,
        rejectedById: true,
        rejectReason: true,
        store: { select: { id: true, name: true, slug: true } },
        booking: { select: { id: true, status: true, scheduledAt: true } },
        coupon: { select: { id: true, code: true, name: true } },
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            phone: true,
            tier: true,
          },
        },
        guest: {
          select: {
            id: true,
            displayName: true,
            phone: true,
            email: true,
          },
        },
        media: {
          select: {
            id: true,
            storageKey: true,
            originalName: true,
            mimeType: true,
            access: true,
            url: true,
          },
        },
      },
    });

    return bills.map((bill) => this.maskSensitiveBillForRole(bill, user));
  }

  async reviewSensitiveBill(
    adminId: string,
    billId: string,
    dto: ReviewBillDto,
  ) {
    const bill = await this.prisma.bill.findFirst({
      where: {
        id: billId,
        deletedAt: null,
      },
      select: {
        id: true,
        billNumber: true,
        status: true,
        reviewedAt: true,
        verifiedAt: true,
        rejectedAt: true,
        reviewedById: true,
        verifiedById: true,
        rejectedById: true,
        rejectReason: true,
        totalVnd: true,
        commissionAmountVnd: true,
        pointsEarned: true,
        store: { select: { id: true, name: true, slug: true } },
        booking: { select: { id: true, status: true, scheduledAt: true } },
        coupon: { select: { id: true, code: true, name: true } },
        user: { select: { id: true, displayName: true, tier: true } },
        guest: { select: { id: true, displayName: true, phone: true } },
      },
    });

    if (!bill) {
      throw new NotFoundException('Bill not found');
    }

    if (bill.status === 'VERIFIED') {
      throw new UnprocessableEntityException('Bill has already been verified');
    }

    const now = new Date();

    const result = await this.prisma.bill.update({
      where: { id: billId },
      data: dto.approve
        ? {
            status: 'VERIFIED',
            verifiedAt: now,
            reviewedById: adminId,
            verifiedById: adminId,
            reviewedAt: now,
            rejectedAt: null,
            rejectedById: null,
            rejectReason: null,
          }
        : {
            status: 'REJECTED',
            rejectedAt: now,
            reviewedById: adminId,
            rejectedById: adminId,
            reviewedAt: now,
            verifiedById: null,
            verifiedAt: null,
            rejectReason: dto.rejectReason ?? 'Rejected by admin review',
          },
      select: this.billNotificationSelect(),
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: dto.approve ? 'bill.review.approve' : 'bill.review.reject',
        targetType: 'Bill',
        targetId: billId,
        beforeJson: this.buildBillReviewAuditSnapshot(bill),
        afterJson: this.buildBillReviewAuditSnapshot(result),
        metadata: {
          approve: dto.approve,
          rejectReason: dto.rejectReason ?? null,
          previousStatus: bill.status,
          nextStatus: result.status,
          reviewedAt: now.toISOString(),
        },
      },
    });

    await this.adminNotificationService?.notifyBillReviewed(result, {
      approve: dto.approve,
      reviewedById: adminId,
    });

    return result;
  }

  private async resolveBookingTarget(
    dto: CreateBookingDto,
  ): Promise<BookingTarget> {
    const castId = this.cleanText(dto.castId);
    const castSlug = this.cleanText(dto.castSlug);
    const storeId = this.cleanText(dto.storeId);
    const storeSlug = this.cleanText(dto.storeSlug);

    if (castId || castSlug) {
      const cast = await this.prisma.cast.findFirst({
        where: {
          ...(castId ? { id: castId } : { slug: castSlug }),
          deletedAt: null,
          status: 'ACTIVE',
          isPublic: true,
          store: {
            deletedAt: null,
            status: 'ACTIVE',
          },
        },
        select: {
          id: true,
          slug: true,
          stageName: true,
          publicAlias: true,
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      if (!cast) {
        throw new NotFoundException('Cast not found');
      }

      if (
        (storeId && cast.store.id !== storeId) ||
        (storeSlug && cast.store.slug !== storeSlug)
      ) {
        throw new BadRequestException('Cast does not belong to selected store');
      }

      return {
        store: cast.store,
        cast: {
          id: cast.id,
          slug: cast.slug,
          stageName: cast.stageName,
          publicAlias: cast.publicAlias,
        },
      };
    }

    if (!storeId && !storeSlug) {
      throw new BadRequestException('storeId or storeSlug is required');
    }

    const store = await this.prisma.store.findFirst({
      where: {
        ...(storeId ? { id: storeId } : { slug: storeSlug }),
        deletedAt: null,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return { store };
  }

  private sanitizeBookingContact(dto: CreateBookingDto) {
    const displayName = this.cleanText(dto.displayName);
    const phone = this.cleanText(dto.phone);

    if (!displayName || !phone) {
      throw new BadRequestException('displayName and phone are required');
    }

    return {
      displayName,
      phone,
      note: this.cleanText(dto.note),
    };
  }

  private async resolveBillStore(dto: CreateBillDto) {
    const storeId = this.cleanText(dto.storeId);
    const storeSlug = this.cleanText(dto.storeSlug);

    if (!storeId && !storeSlug) {
      throw new BadRequestException(
        'bookingId, storeId, or storeSlug is required',
      );
    }

    const store = await this.prisma.store.findFirst({
      where: {
        ...(storeId ? { id: storeId } : { slug: storeSlug }),
        deletedAt: null,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  private buildBillNumber(now: Date) {
    const dateToken = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomToken = randomUUID().slice(0, 8).toUpperCase();

    return `BILL-${dateToken}-${randomToken}`;
  }

  private createBookingRecord(input: {
    dto: CreateBookingDto;
    target: BookingTarget;
    userId?: string;
    guestId: string;
    note?: string;
  }) {
    const scheduledAt = new Date(input.dto.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) {
      throw new BadRequestException('scheduledAt must be a valid ISO date');
    }

    return this.prisma.booking.create({
      data: {
        userId: input.userId,
        guestId: input.guestId,
        storeId: input.target.store.id,
        castId: input.target.cast?.id,
        status: 'REQUESTED',
        scheduledAt,
        partySize: input.dto.partySize,
        note: input.note,
      },
      select: this.bookingNotificationSelect(),
    });
  }

  private bookingNotificationSelect() {
    return {
      id: true,
      storeId: true,
      castId: true,
      status: true,
      scheduledAt: true,
      partySize: true,
      subtotalVnd: true,
      discountVnd: true,
      totalVnd: true,
      note: true,
      cancelledAt: true,
      createdAt: true,
      store: { select: { id: true, name: true, slug: true } },
      cast: {
        select: {
          id: true,
          slug: true,
          stageName: true,
          publicAlias: true,
        },
      },
      user: { select: { id: true, displayName: true, tier: true } },
      guest: { select: { id: true, displayName: true, phone: true } },
    } satisfies Prisma.BookingSelect;
  }

  private billNotificationSelect() {
    return {
      id: true,
      billNumber: true,
      status: true,
      subtotalVnd: true,
      discountVnd: true,
      serviceChargeVnd: true,
      taxVnd: true,
      totalVnd: true,
      paidVnd: true,
      commissionAmountVnd: true,
      pointsEarned: true,
      submittedAt: true,
      reviewedAt: true,
      verifiedAt: true,
      rejectedAt: true,
      reviewedById: true,
      verifiedById: true,
      rejectedById: true,
      rejectReason: true,
      updatedAt: true,
      store: { select: { id: true, name: true, slug: true } },
      booking: { select: { id: true, status: true, scheduledAt: true } },
      coupon: { select: { id: true, code: true, name: true } },
      user: { select: { id: true, displayName: true, tier: true } },
      guest: { select: { id: true, displayName: true, phone: true } },
    } satisfies Prisma.BillSelect;
  }

  private buildBillReviewAuditSnapshot(bill: {
    id: string;
    status: string;
    reviewedAt?: Date | null;
    verifiedAt?: Date | null;
    rejectedAt?: Date | null;
    reviewedById?: string | null;
    verifiedById?: string | null;
    rejectedById?: string | null;
    rejectReason?: string | null;
    totalVnd?: number;
    commissionAmountVnd?: number;
    pointsEarned?: number;
  }) {
    return {
      id: bill.id,
      status: bill.status,
      reviewedAt: bill.reviewedAt?.toISOString() ?? null,
      verifiedAt: bill.verifiedAt?.toISOString() ?? null,
      rejectedAt: bill.rejectedAt?.toISOString() ?? null,
      reviewedById: bill.reviewedById ?? null,
      verifiedById: bill.verifiedById ?? null,
      rejectedById: bill.rejectedById ?? null,
      rejectReason: bill.rejectReason ?? null,
      totalVnd: bill.totalVnd ?? null,
      commissionAmountVnd: bill.commissionAmountVnd ?? null,
      pointsEarned: bill.pointsEarned ?? null,
    };
  }

  private mapPublicArea(
    area: {
      id: string;
      code: string;
      name: string;
      city: string;
      district?: string | null;
      ward?: string | null;
    } | null,
  ) {
    if (!area) {
      return null;
    }

    return {
      id: area.id,
      code: area.code,
      name: area.name,
      city: area.city,
      district: area.district ?? null,
      ward: area.ward ?? null,
      cityCode: this.cityCodeFromAreaCode(area.code),
    };
  }

  private buildStorePriceReference(
    casts: Array<{
      hourlyRateVnd: number | null;
    }>,
  ) {
    const rates = casts
      .map((cast) => cast.hourlyRateVnd)
      .filter((rate): rate is number => typeof rate === 'number' && rate > 0);
    const startingFromVnd = rates.length ? Math.min(...rates) : null;

    return {
      currency: 'VND',
      startingFromVnd,
      note: 'Reference price only; admin confirms final pricing by guest count, room type, and time slot.',
      items: [
        ...(startingFromVnd
          ? [
              {
                label: 'Cast hourly rate',
                amountVnd: startingFromVnd,
                unit: 'hour',
                note: 'Lowest active public cast rate for this store.',
              },
            ]
          : []),
        {
          label: 'Table or room package',
          amountVnd: null,
          unit: null,
          note: 'Confirmed by admin after the booking request.',
        },
      ],
    };
  }

  private buildCastSeoDescription(cast: {
    publicAlias: string | null;
    stageName: string;
    publicHeadline: string | null;
    publicBio: string | null;
    languages: string[];
    store: {
      name: string;
      city: string;
      district: string | null;
      area: { name: string } | null;
    };
  }) {
    const publicSummary = (cast.publicBio ?? cast.publicHeadline)
      ?.replace(/\s+/g, ' ')
      .trim();
    const name = cast.publicAlias ?? cast.stageName;
    const location = [
      cast.store.area?.name,
      cast.store.district,
      cast.store.city,
    ]
      .filter(Boolean)
      .join(', ');
    const languageText = cast.languages.length
      ? ` Languages: ${cast.languages.join(', ')}.`
      : '';

    if (publicSummary) {
      return `${publicSummary.slice(0, 130)}${location ? ` ${location}.` : ''}${languageText}`.slice(
        0,
        170,
      );
    }

    return `${name} tại ${cast.store.name}${location ? `, ${location}` : ''}. Xem bio, gallery public, ngôn ngữ hỗ trợ và đặt booking theo cast trên NightLife VN.`;
  }

  private async loadRelatedPublicCasts(cast: {
    id: string;
    storeId: string;
    tags: string[];
    store: {
      city: string;
      area: { id: string; code: string } | null;
    };
  }) {
    const relatedFilters = [
      { storeId: cast.storeId },
      ...(cast.store.area?.id
        ? [{ store: { areaId: cast.store.area.id } }]
        : []),
      ...(cast.tags.length ? [{ tags: { hasSome: cast.tags } }] : []),
      { store: { city: cast.store.city } },
    ];

    const related = await this.prisma.cast.findMany({
      where: {
        id: { not: cast.id },
        deletedAt: null,
        status: 'ACTIVE',
        isPublic: true,
        AND: [
          {
            store: {
              deletedAt: null,
              status: 'ACTIVE',
            },
          },
          {
            OR: relatedFilters,
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true,
        slug: true,
        storeId: true,
        stageName: true,
        publicAlias: true,
        publicHeadline: true,
        tags: true,
        languages: true,
        hourlyRateVnd: true,
        media: {
          where: {
            deletedAt: null,
            access: 'PUBLIC',
            status: 'READY',
            type: 'IMAGE',
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { url: true },
        },
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            description: true,
            address: true,
            city: true,
            district: true,
            latitude: true,
            longitude: true,
            area: {
              select: {
                id: true,
                code: true,
                name: true,
                city: true,
                district: true,
                ward: true,
              },
            },
          },
        },
      },
    });

    const unique = new Map<string, (typeof related)[number]>();
    related.forEach((item) => unique.set(item.id, item));

    return [...unique.values()].map((item) =>
      this.mapPublicRelatedCast(
        item,
        item.storeId === cast.storeId
          ? 'same-store'
          : item.store.area?.id && item.store.area.id === cast.store.area?.id
            ? 'same-area'
            : 'same-tag',
      ),
    );
  }

  private mapPublicRelatedCast(
    cast: {
      id: string;
      slug: string;
      stageName: string;
      publicAlias: string | null;
      publicHeadline: string | null;
      tags: string[];
      languages: string[];
      hourlyRateVnd: number | null;
      media: Array<{ url: string }>;
      store: {
        id: string;
        name: string;
        slug: string;
        category: StoreCategory;
        description: string | null;
        address: string | null;
        city: string;
        district: string | null;
        latitude: Prisma.Decimal | number | string | null;
        longitude: Prisma.Decimal | number | string | null;
        area: {
          id: string;
          code: string;
          name: string;
          city: string;
          district?: string | null;
          ward?: string | null;
        } | null;
      };
    },
    relatedReason: 'same-store' | 'same-area' | 'same-tag',
  ) {
    return {
      id: cast.id,
      slug: cast.slug,
      stageName: cast.stageName,
      name: cast.publicAlias ?? cast.stageName,
      publicAlias: cast.publicAlias,
      publicHeadline: cast.publicHeadline,
      tags: cast.tags,
      languages: cast.languages,
      hourlyRateVnd: cast.hourlyRateVnd,
      thumbnailUrl: cast.media[0]?.url ?? null,
      relatedReason,
      store: {
        id: cast.store.id,
        name: cast.store.name,
        slug: cast.store.slug,
        category: cast.store.category,
        description: cast.store.description,
        address: cast.store.address,
        city: cast.store.city,
        cityCode: cast.store.area?.code
          ? this.cityCodeFromAreaCode(cast.store.area.code)
          : this.normalizeCityCode(cast.store.city),
        district: cast.store.district,
        area: this.mapPublicArea(cast.store.area),
        latitude: this.toNumber(cast.store.latitude),
        longitude: this.toNumber(cast.store.longitude),
      },
    };
  }

  private async resolvePublicCastForMemberFavorite(slug: string) {
    const normalizedSlug = this.normalizeCastSlug(slug);
    if (!normalizedSlug) {
      throw new BadRequestException('slug is required');
    }

    const cast = await this.prisma.cast.findFirst({
      where: {
        slug: normalizedSlug,
        deletedAt: null,
        status: 'ACTIVE',
        isPublic: true,
        store: {
          deletedAt: null,
          status: 'ACTIVE',
        },
      },
      select: {
        id: true,
        slug: true,
      },
    });

    if (!cast) {
      throw new NotFoundException('Cast not found');
    }

    return cast;
  }

  private buildStoreSeoDescription(store: {
    name: string;
    description: string | null;
    city: string;
    district: string | null;
    area: { name: string } | null;
  }) {
    const rawDescription = store.description
      ?.replace(/\s+/g, ' ')
      .trim()
      .slice(0, 155);

    if (rawDescription) {
      return rawDescription;
    }

    const location = [store.area?.name, store.district, store.city]
      .filter(Boolean)
      .join(', ');

    return `${store.name}${location ? ` in ${location}` : ''}. View gallery, public casts, active coupons, map, and opening hours on NightLife VN.`;
  }

  private buildPublicStoreWhere(
    query: PublicDiscoveryQueryDto,
    options: { includeTextSearch?: boolean; includeCastName?: boolean } = {},
  ): Prisma.StoreWhereInput {
    const now = new Date();
    const searchTerm = this.cleanText(query.q);
    const cityCode = this.normalizeCityCode(query.city, { strict: true });
    const area = this.cleanText(query.area);
    const areaCode = this.normalizeToken(area);
    const category = this.normalizeCategory(query.category, { strict: true });
    const hasActiveCoupon = this.parseBooleanFlag(query.hasActiveCoupon);
    const and: Prisma.StoreWhereInput[] = [
      {
        area: {
          is: {
            deletedAt: null,
            status: 'ACTIVE',
            ...this.buildMvpAreaCodeWhere(cityCode),
          },
        },
      },
    ];

    if (options.includeTextSearch !== false && searchTerm) {
      const textFilters: Prisma.StoreWhereInput[] = [
        { name: this.containsInsensitive(searchTerm) },
        { description: this.containsInsensitive(searchTerm) },
        { address: this.containsInsensitive(searchTerm) },
      ];

      if (options.includeCastName) {
        textFilters.push({
          casts: {
            some: {
              deletedAt: null,
              isPublic: true,
              status: 'ACTIVE',
              OR: [
                { stageName: this.containsInsensitive(searchTerm) },
                { publicAlias: this.containsInsensitive(searchTerm) },
              ],
            },
          },
        });
      }

      and.push({ OR: textFilters });
    }

    if (area) {
      and.push({
        OR: [
          { district: this.containsInsensitive(area) },
          {
            area: {
              is: {
                code: this.equalsInsensitive(areaCode),
                deletedAt: null,
                status: 'ACTIVE',
              },
            },
          },
          {
            area: {
              is: {
                name: this.containsInsensitive(area),
                deletedAt: null,
                status: 'ACTIVE',
              },
            },
          },
          {
            area: {
              is: {
                district: this.containsInsensitive(area),
                deletedAt: null,
                status: 'ACTIVE',
              },
            },
          },
        ],
      });
    }

    if (hasActiveCoupon) {
      and.push({
        coupons: {
          some: this.buildActiveCouponWhere(now),
        },
      });
    }

    return {
      deletedAt: null,
      status: 'ACTIVE',
      ...(category ? { category } : {}),
      ...(and.length ? { AND: and } : {}),
    };
  }

  private buildMvpAreaCodeWhere(cityCode?: string): Prisma.AreaWhereInput {
    if (cityCode) {
      return { code: { startsWith: `${cityCode}-` } };
    }

    return {
      OR: MVP_CITY_CODES.map((code) => ({
        code: { startsWith: `${code}-` },
      })),
    };
  }

  private resolvePagination(query: PublicDiscoveryQueryDto): PublicPagination {
    const limit = this.resolveLimit(query.limit);
    const hasOffset =
      query.offset !== undefined &&
      query.offset !== null &&
      query.offset !== '';
    const page = hasOffset ? DEFAULT_PUBLIC_PAGE : this.resolvePage(query.page);
    const offset = hasOffset
      ? this.resolveOffset(query.offset)
      : (page - 1) * limit;

    if (offset > MAX_PUBLIC_OFFSET) {
      throw new BadRequestException(
        `offset must be less than or equal to ${MAX_PUBLIC_OFFSET}`,
      );
    }

    return { limit, offset, page };
  }

  private resolveLimit(limit?: string | number) {
    if (limit === undefined || limit === null || limit === '') {
      return DEFAULT_PUBLIC_LIMIT;
    }

    const parsed = Number(limit);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new BadRequestException('limit must be a positive number');
    }

    if (parsed > MAX_PUBLIC_LIMIT) {
      throw new BadRequestException(
        `limit must be less than or equal to ${MAX_PUBLIC_LIMIT}`,
      );
    }

    return Math.floor(parsed);
  }

  private resolvePage(page?: string | number) {
    if (page === undefined || page === null || page === '') {
      return DEFAULT_PUBLIC_PAGE;
    }

    const parsed = Number(page);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new BadRequestException('page must be a positive number');
    }

    return Math.floor(parsed);
  }

  private resolveOffset(offset?: string | number) {
    if (offset === undefined || offset === null || offset === '') {
      return 0;
    }

    const parsed = Number(offset);
    if (!Number.isFinite(parsed) || parsed < 0) {
      throw new BadRequestException('offset must be zero or a positive number');
    }

    return Math.floor(parsed);
  }

  private resolveSort(
    value: string | undefined,
    coordinates: Coordinates | null,
  ): PublicSort {
    const token = this.normalizeToken(value);

    if (!token) {
      return coordinates ? 'nearest' : 'newest';
    }

    const sort = token === 'ranking' ? 'priority' : token;
    if (!['newest', 'nearest', 'priority'].includes(sort)) {
      throw new BadRequestException(
        'sort must be one of newest, nearest, priority',
      );
    }

    if (sort === 'nearest' && !coordinates) {
      throw new BadRequestException('sort=nearest requires lat and lng');
    }

    return sort as PublicSort;
  }

  private resolvePublicReadArgs(
    sort: PublicSort,
    pagination: PublicPagination,
  ): { skip?: number; take: number } {
    if (sort === 'newest') {
      return { skip: pagination.offset, take: pagination.limit };
    }

    const readWindow = pagination.offset + pagination.limit;
    if (readWindow > MAX_PUBLIC_SORT_WINDOW) {
      throw new BadRequestException(
        `sort=${sort} supports offset + limit up to ${MAX_PUBLIC_SORT_WINDOW}`,
      );
    }

    return { take: readWindow };
  }

  private buildPublicListResponse<T>(
    data: T[],
    total: number,
    pagination: PublicPagination,
    sort: PublicSort,
  ) {
    return {
      data,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        offset: pagination.offset,
        hasMore: pagination.offset + data.length < total,
        sort,
      },
    };
  }

  private finalizePublicItems<T extends PublicSortableItem>(
    items: T[],
    sort: PublicSort,
    pagination: PublicPagination,
    rankings: Map<string, RankingScore>,
  ) {
    const sortedItems =
      sort === 'newest'
        ? items
        : this.sortPublicItems(items, sort, rankings).slice(
            pagination.offset,
            pagination.offset + pagination.limit,
          );

    return sortedItems.map(({ createdAt: _createdAt, ...item }) => {
      void _createdAt;
      return item;
    });
  }

  private sortPublicItems<T extends PublicSortableItem>(
    items: T[],
    sort: PublicSort,
    rankings: Map<string, RankingScore>,
  ) {
    if (sort === 'nearest') {
      return this.sortByDistance(items);
    }

    if (sort === 'priority') {
      return [...items].sort((first, second) => {
        const firstRank = rankings.get(first.id);
        const secondRank = rankings.get(second.id);
        const firstPin = firstRank?.pinRank ?? Number.POSITIVE_INFINITY;
        const secondPin = secondRank?.pinRank ?? Number.POSITIVE_INFINITY;

        if (firstPin !== secondPin) {
          return firstPin - secondPin;
        }

        const scoreDiff =
          (secondRank?.manualScore ?? 0) - (firstRank?.manualScore ?? 0);
        if (scoreDiff !== 0) {
          return scoreDiff;
        }

        return (
          this.createdAtMs(second.createdAt) - this.createdAtMs(first.createdAt)
        );
      });
    }

    return [...items].sort(
      (first, second) =>
        this.createdAtMs(second.createdAt) - this.createdAtMs(first.createdAt),
    );
  }

  private async loadRankingMap(
    targetType: 'STORE' | 'CAST',
    targetIds: string[],
  ) {
    if (!targetIds.length) {
      return new Map<string, RankingScore>();
    }

    const now = new Date();
    const configs = await this.prisma.rankingConfig.findMany({
      where: {
        targetType,
        targetId: { in: targetIds },
        status: 'ACTIVE',
        deletedAt: null,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
        ],
      },
      orderBy: [
        { pinRank: 'asc' },
        { manualScore: 'desc' },
        { updatedAt: 'desc' },
      ],
      select: {
        targetId: true,
        manualScore: true,
        pinRank: true,
      },
    });
    const rankingMap = new Map<string, RankingScore>();

    configs.forEach((config) => {
      if (!rankingMap.has(config.targetId)) {
        rankingMap.set(config.targetId, {
          pinRank: config.pinRank,
          manualScore: config.manualScore,
        });
      }
    });

    return rankingMap;
  }

  private adminRankingConfigSelect(): Prisma.RankingConfigSelect {
    return {
      id: true,
      targetType: true,
      targetId: true,
      areaId: true,
      cityCode: true,
      category: true,
      scope: true,
      manualScore: true,
      pinRank: true,
      sponsored: true,
      reason: true,
      status: true,
      startsAt: true,
      endsAt: true,
      createdAt: true,
      updatedAt: true,
      area: {
        select: {
          id: true,
          code: true,
          name: true,
          city: true,
          district: true,
        },
      },
    };
  }

  private async mapAdminRankingConfigs(configs: AdminRankingConfigRecord[]) {
    const targets = await this.loadAdminRankingTargets(configs);

    return configs.map((config) => {
      const target = targets.get(`${config.targetType}:${config.targetId}`);

      return {
        id: config.id,
        targetType: config.targetType,
        targetId: config.targetId,
        targetName: target?.name ?? 'Unknown target',
        targetSlug: target?.slug ?? null,
        targetImage: target?.image ?? null,
        targetStatus: target?.status ?? null,
        targetCategory: target?.category ?? config.category,
        targetCity: target?.city ?? null,
        targetArea: target?.area ?? config.area?.name ?? null,
        cityCode: config.cityCode,
        areaId: config.areaId,
        area: config.area,
        category: config.category,
        scope: config.scope,
        manualScore: config.manualScore,
        pinRank: config.pinRank,
        sponsored: config.sponsored,
        reason: config.reason,
        status: config.status,
        startsAt: config.startsAt,
        endsAt: config.endsAt,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      };
    });
  }

  private async loadAdminRankingTargets(configs: AdminRankingConfigRecord[]) {
    type StoreTargetRecord = {
      id: string;
      name: string;
      slug: string;
      category: StoreCategory;
      status: string;
      city: string;
      district: string | null;
      area: { name: string; city: string } | null;
      media: Array<{ url: string }>;
    };
    type CastTargetRecord = {
      id: string;
      slug: string;
      stageName: string;
      publicAlias: string | null;
      status: string;
      media: Array<{ url: string }>;
      store: {
        category: StoreCategory;
        city: string;
        district: string | null;
        area: { name: string; city: string } | null;
      };
    };
    const storeIds = configs
      .filter((config) => config.targetType === 'STORE')
      .map((config) => config.targetId);
    const castIds = configs
      .filter((config) => config.targetType === 'CAST')
      .map((config) => config.targetId);
    const targetMap = new Map<string, RankingTargetSummary>();
    const stores: StoreTargetRecord[] = storeIds.length
      ? await this.prisma.store.findMany({
            where: { id: { in: storeIds }, deletedAt: null },
            select: {
              id: true,
              name: true,
              slug: true,
              category: true,
              status: true,
              city: true,
              district: true,
              area: {
                select: {
                  name: true,
                  city: true,
                },
              },
              media: {
                where: {
                  deletedAt: null,
                  access: 'PUBLIC',
                  status: 'READY',
                  type: 'IMAGE',
                },
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: { url: true },
              },
            },
          })
      : [];
    const casts: CastTargetRecord[] = castIds.length
      ? await this.prisma.cast.findMany({
            where: { id: { in: castIds }, deletedAt: null },
            select: {
              id: true,
              slug: true,
              stageName: true,
              publicAlias: true,
              status: true,
              media: {
                where: {
                  deletedAt: null,
                  access: 'PUBLIC',
                  status: 'READY',
                  type: 'IMAGE',
                },
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: { url: true },
              },
              store: {
                select: {
                  category: true,
                  city: true,
                  district: true,
                  area: {
                    select: {
                      name: true,
                      city: true,
                    },
                  },
                },
              },
            },
          })
      : [];

    stores.forEach((store) => {
      targetMap.set(`STORE:${store.id}`, {
        id: store.id,
        name: store.name,
        slug: store.slug,
        image: store.media[0]?.url ?? null,
        city: store.area?.city ?? store.city,
        area: store.area?.name ?? store.district,
        category: store.category,
        status: store.status,
      });
    });
    casts.forEach((cast) => {
      targetMap.set(`CAST:${cast.id}`, {
        id: cast.id,
        name: cast.publicAlias ?? cast.stageName,
        slug: cast.slug,
        image: cast.media[0]?.url ?? null,
        city: cast.store.area?.city ?? cast.store.city,
        area: cast.store.area?.name ?? cast.store.district,
        category: cast.store.category,
        status: cast.status,
      });
    });

    return targetMap;
  }

  private resolveAdminRankingCityCode(value?: string | null) {
    return this.normalizeCityCode(value ?? 'all', { strict: true }) ?? 'all';
  }

  private resolveAdminRankingCategory(value?: string | null) {
    const token = this.normalizeToken(value);

    if (!token || token === 'all' || token === 'tong-hop') {
      return null;
    }

    return this.normalizeCategory(value, { strict: true }) ?? null;
  }

  private resolveAdminRankingScope(value?: string | null) {
    const scope = this.normalizeToken(value) || 'global';

    if (scope.length > 40) {
      throw new BadRequestException('scope must be at most 40 characters');
    }

    return scope;
  }

  private resolveRankingWindow(
    startsAt?: string | null,
    endsAt?: string | null,
  ) {
    const startDate = startsAt ? new Date(startsAt) : null;
    const endDate = endsAt ? new Date(endsAt) : null;

    if (startDate && Number.isNaN(startDate.getTime())) {
      throw new BadRequestException('startsAt must be a valid date');
    }

    if (endDate && Number.isNaN(endDate.getTime())) {
      throw new BadRequestException('endsAt must be a valid date');
    }

    if (startDate && endDate && startDate >= endDate) {
      throw new BadRequestException('startsAt must be before endsAt');
    }

    return { startsAt: startDate, endsAt: endDate };
  }

  private async assertAdminRankingTargetExists(
    targetType: RankingTargetType,
    targetId: string,
  ) {
    const target =
      targetType === 'STORE'
        ? await this.prisma.store.findFirst({
            where: { id: targetId, deletedAt: null },
            select: { id: true },
          })
        : await this.prisma.cast.findFirst({
            where: { id: targetId, deletedAt: null },
            select: { id: true },
          });

    if (!target) {
      throw new NotFoundException('Ranking target not found');
    }
  }

  private async assertNoPinnedRankingCollision(input: {
    targetType: RankingTargetType;
    cityCode: string;
    category: StoreCategory | null;
    scope: string;
    pinRank: number | null;
    excludeId?: string;
  }) {
    if (!input.pinRank) {
      return;
    }

    const duplicate = await this.prisma.rankingConfig.findFirst({
      where: {
        deletedAt: null,
        targetType: input.targetType,
        cityCode: input.cityCode,
        category: input.category,
        scope: input.scope,
        pinRank: input.pinRank,
        ...(input.excludeId ? { id: { not: input.excludeId } } : {}),
      },
      select: {
        id: true,
        targetId: true,
      },
    });

    if (duplicate) {
      throw new UnprocessableEntityException(
        `pinRank ${input.pinRank} already exists for ${input.targetType}/${input.cityCode}/${input.category ?? 'all'}/${input.scope}`,
      );
    }
  }

  private resolveRankingTargetType(value?: string | null): RankingTargetType {
    const token = value?.trim().toUpperCase() || 'CAST';

    if (token !== 'CAST' && token !== 'STORE') {
      throw new BadRequestException('targetType must be CAST or STORE');
    }

    return token as RankingTargetType;
  }

  private resolveRankingLimit(limit?: string | number) {
    if (limit === undefined || limit === null || limit === '') {
      return DEFAULT_RANKING_LIMIT;
    }

    const parsed = Number(limit);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new BadRequestException('limit must be a positive number');
    }

    if (parsed > MAX_RANKING_LIMIT) {
      throw new BadRequestException(
        `limit must be less than or equal to ${MAX_RANKING_LIMIT}`,
      );
    }

    return Math.floor(parsed);
  }

  private mapRankingConfigs(configs: PublicRankingConfig[]) {
    const configByTargetId = new Map<string, PublicRankingConfig>();

    configs.forEach((config) => {
      if (!configByTargetId.has(config.targetId)) {
        configByTargetId.set(config.targetId, config);
      }
    });

    return configByTargetId;
  }

  private sortMappedRankingItems(items: PublicRankingItemDraft[]) {
    return [...items].sort((first, second) => {
      const firstPin = first.pinRank ?? Number.POSITIVE_INFINITY;
      const secondPin = second.pinRank ?? Number.POSITIVE_INFINITY;

      if (firstPin !== secondPin) {
        return firstPin - secondPin;
      }

      const scoreDiff = second.manualScore - first.manualScore;
      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      return first.name.localeCompare(second.name);
    });
  }

  private async loadStoreRankingItems(
    configByTargetId: Map<string, PublicRankingConfig>,
    filters: { cityCode?: string; category?: StoreCategory },
  ) {
    const targetIds = [...configByTargetId.keys()];
    if (!targetIds.length) {
      return [];
    }

    const stores = await this.prisma.store.findMany({
      where: {
        ...this.buildPublicStoreWhere(
          {
            city: filters.cityCode,
            category: filters.category,
          },
          { includeTextSearch: false },
        ),
        id: { in: targetIds },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        city: true,
        district: true,
        phone: true,
        area: {
          select: {
            id: true,
            code: true,
            name: true,
            city: true,
            district: true,
          },
        },
        media: {
          where: {
            deletedAt: null,
            access: 'PUBLIC',
            status: 'READY',
            type: 'IMAGE',
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            url: true,
          },
        },
      },
    });

    return this.sortMappedRankingItems(
      stores.map((store) =>
        this.mapStoreRankingItem(store, configByTargetId.get(store.id)),
      ),
    );
  }

  private async loadCastRankingItems(
    configByTargetId: Map<string, PublicRankingConfig>,
    filters: { cityCode?: string; category?: StoreCategory },
  ) {
    const targetIds = [...configByTargetId.keys()];
    if (!targetIds.length) {
      return [];
    }

    const casts = await this.prisma.cast.findMany({
      where: {
        id: { in: targetIds },
        deletedAt: null,
        status: 'ACTIVE',
        isPublic: true,
        store: this.buildPublicStoreWhere(
          {
            city: filters.cityCode,
            category: filters.category,
          },
          { includeTextSearch: false },
        ),
      },
      select: {
        id: true,
        slug: true,
        stageName: true,
        publicAlias: true,
        media: {
          where: {
            deletedAt: null,
            access: 'PUBLIC',
            status: 'READY',
            type: 'IMAGE',
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            url: true,
          },
        },
        store: {
          select: {
            category: true,
            city: true,
            district: true,
            area: {
              select: {
                id: true,
                code: true,
                name: true,
                city: true,
                district: true,
              },
            },
          },
        },
      },
    });

    return this.sortMappedRankingItems(
      casts.map((cast) =>
        this.mapCastRankingItem(cast, configByTargetId.get(cast.id)),
      ),
    );
  }

  private async loadRankingFallbackItems(
    targetType: RankingTargetType,
    filters: {
      cityCode?: string;
      category?: StoreCategory;
      excludeIds: string[];
      take: number;
    },
  ) {
    if (filters.take <= 0) {
      return [];
    }

    if (targetType === 'STORE') {
      const stores = await this.prisma.store.findMany({
        where: {
          ...this.buildPublicStoreWhere(
            {
              city: filters.cityCode,
              category: filters.category,
            },
            { includeTextSearch: false },
          ),
          ...(filters.excludeIds.length
            ? { id: { notIn: filters.excludeIds } }
            : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: filters.take,
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          city: true,
          district: true,
          phone: true,
          area: {
            select: {
              id: true,
              code: true,
              name: true,
              city: true,
              district: true,
            },
          },
          media: {
            where: {
              deletedAt: null,
              access: 'PUBLIC',
              status: 'READY',
              type: 'IMAGE',
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              url: true,
            },
          },
        },
      });

      return stores.map((store) => this.mapStoreRankingItem(store));
    }

    const casts = await this.prisma.cast.findMany({
      where: {
        ...(filters.excludeIds.length
          ? { id: { notIn: filters.excludeIds } }
          : {}),
        deletedAt: null,
        status: 'ACTIVE',
        isPublic: true,
        store: this.buildPublicStoreWhere(
          {
            city: filters.cityCode,
            category: filters.category,
          },
          { includeTextSearch: false },
        ),
      },
      orderBy: { createdAt: 'desc' },
      take: filters.take,
      select: {
        id: true,
        slug: true,
        stageName: true,
        publicAlias: true,
        media: {
          where: {
            deletedAt: null,
            access: 'PUBLIC',
            status: 'READY',
            type: 'IMAGE',
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            url: true,
          },
        },
        store: {
          select: {
            category: true,
            city: true,
            district: true,
            area: {
              select: {
                id: true,
                code: true,
                name: true,
                city: true,
                district: true,
              },
            },
          },
        },
      },
    });

    return casts.map((cast) => this.mapCastRankingItem(cast));
  }

  private mapStoreRankingItem(
    store: {
      id: string;
      name: string;
      slug: string;
      category: StoreCategory;
      city: string;
      district: string | null;
      phone: string | null;
      area: {
        id: string;
        code: string;
        name: string;
        city: string;
        district?: string | null;
      } | null;
      media: Array<{ url: string }>;
    },
    config?: PublicRankingConfig,
  ): PublicRankingItemDraft {
    const cityCode = store.area?.code
      ? this.cityCodeFromAreaCode(store.area.code)
      : this.normalizeCityCode(store.city);

    return {
      targetType: 'STORE',
      targetId: store.id,
      name: store.name,
      slug: store.slug,
      image: store.media[0]?.url ?? null,
      area: store.area?.name ?? store.district,
      city: store.area?.city ?? store.city,
      cityCode,
      category: store.category,
      sponsored: config?.sponsored ?? false,
      pinRank: config?.pinRank ?? null,
      manualScore: config?.manualScore ?? 0,
      href: `/stores/${store.slug}`,
      phone: store.phone,
    };
  }

  private mapCastRankingItem(
    cast: {
      id: string;
      slug: string;
      stageName: string;
      publicAlias: string | null;
      media: Array<{ url: string }>;
      store: {
        category: StoreCategory;
        city: string;
        district: string | null;
        area: {
          id: string;
          code: string;
          name: string;
          city: string;
          district?: string | null;
        } | null;
      };
    },
    config?: PublicRankingConfig,
  ): PublicRankingItemDraft {
    const cityCode = cast.store.area?.code
      ? this.cityCodeFromAreaCode(cast.store.area.code)
      : this.normalizeCityCode(cast.store.city);

    return {
      targetType: 'CAST',
      targetId: cast.id,
      name: cast.publicAlias ?? cast.stageName,
      slug: cast.slug,
      image: cast.media[0]?.url ?? null,
      area: cast.store.area?.name ?? cast.store.district,
      city: cast.store.area?.city ?? cast.store.city,
      cityCode,
      category: cast.store.category,
      sponsored: config?.sponsored ?? false,
      pinRank: config?.pinRank ?? null,
      manualScore: config?.manualScore ?? 0,
      href: `/casts/${cast.slug}`,
    };
  }

  private buildActiveCouponWhere(now: Date): Prisma.CouponWhereInput {
    return {
      status: 'ACTIVE',
      deletedAt: null,
      startsAt: { lte: now },
      OR: [{ endsAt: null }, { endsAt: { gt: now } }],
    };
  }

  private parseBooleanFlag(value?: string | boolean | null) {
    if (value === undefined || value === null || value === '') {
      return false;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    const token = value.toLowerCase();
    if (token === 'true' || token === '1') {
      return true;
    }

    if (token === 'false' || token === '0') {
      return false;
    }

    throw new BadRequestException('hasActiveCoupon must be true or false');
  }

  private createdAtMs(value: Date | string) {
    const date = value instanceof Date ? value : new Date(value);

    return Number.isFinite(date.getTime()) ? date.getTime() : 0;
  }

  private parseCoordinates(query: PublicDiscoveryQueryDto): Coordinates | null {
    const hasLat =
      query.lat !== undefined && query.lat !== null && query.lat !== '';
    const hasLng =
      query.lng !== undefined && query.lng !== null && query.lng !== '';

    if (!hasLat && !hasLng) {
      return null;
    }

    if (!hasLat || !hasLng) {
      throw new BadRequestException('lat and lng must be provided together');
    }

    const lat = Number(query.lat);
    const lng = Number(query.lng);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      throw new BadRequestException('lat/lng must be valid coordinates');
    }

    return { lat, lng };
  }

  private calculateDistanceKm(
    coordinates: Coordinates | null,
    latitude: unknown,
    longitude: unknown,
  ) {
    const lat = this.toNumber(latitude);
    const lng = this.toNumber(longitude);

    if (!coordinates || lat === null || lng === null) {
      return null;
    }

    const toRadians = (value: number) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const deltaLat = toRadians(lat - coordinates.lat);
    const deltaLng = toRadians(lng - coordinates.lng);
    const a =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos(toRadians(coordinates.lat)) *
        Math.cos(toRadians(lat)) *
        Math.sin(deltaLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(earthRadiusKm * c * 10) / 10;
  }

  private sortByDistance<T extends { distanceKm: number | null }>(items: T[]) {
    if (!items.some((item) => item.distanceKm !== null)) {
      return items;
    }

    return [...items].sort((first, second) => {
      if (first.distanceKm === null && second.distanceKm === null) {
        return 0;
      }

      if (first.distanceKm === null) {
        return 1;
      }

      if (second.distanceKm === null) {
        return -1;
      }

      return first.distanceKm - second.distanceKm;
    });
  }

  private cleanText(value?: string) {
    return value?.trim() ?? '';
  }

  private normalizeCityCode(
    value?: string | null,
    options: { strict?: boolean } = {},
  ) {
    const token = this.normalizeToken(value);
    if (!token) {
      return undefined;
    }

    const cityCode =
      CITY_ALIASES[token] ?? CITY_ALIASES[token.replace(/-/g, ' ')];

    if (cityCode === 'all') {
      return undefined;
    }

    if (!cityCode && options.strict) {
      throw new BadRequestException('city must be hn, hcm, or all');
    }

    return cityCode;
  }

  private cityCodeFromAreaCode(code: string) {
    return code.split('-')[0] || undefined;
  }

  private normalizeCategory(
    value?: string | null,
    options: { strict?: boolean } = {},
  ): StoreCategory | undefined {
    const token = this.normalizeToken(value);
    const upperValue = value?.trim().toUpperCase();

    if (!token && !upperValue) {
      return undefined;
    }

    if (upperValue === 'SPA') {
      return 'MASSAGE_SPA';
    }

    if (upperValue && this.isStoreCategory(upperValue)) {
      return upperValue;
    }

    const category = CATEGORY_ALIASES[token];

    if (!category && options.strict) {
      throw new BadRequestException(
        'category must be one of BAR, CLUB, LOUNGE, GIRLS_BAR, KARAOKE, MASSAGE_SPA, RESTAURANT, CASINO',
      );
    }

    return category;
  }

  private isStoreCategory(value: string): value is StoreCategory {
    return [
      'BAR',
      'CLUB',
      'LOUNGE',
      'GIRLS_BAR',
      'KARAOKE',
      'MASSAGE_SPA',
      'RESTAURANT',
      'CASINO',
    ].includes(value);
  }

  private normalizeToken(value?: string | null) {
    return (
      value
        ?.trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/đ/g, 'd')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[_\s]+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/(^-|-$)/g, '') ?? ''
    );
  }

  private normalizeStoreSlug(value?: string | null) {
    const token = this.normalizeToken(value);
    return STORE_SLUG_ALIASES[token] ?? token;
  }

  private normalizeCastSlug(value?: string | null) {
    const token = this.normalizeToken(value);
    return CAST_SLUG_ALIASES[token] ?? token;
  }

  private resolvePublicStoreMediaUrl(
    url: string,
    type: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'OTHER',
    category: StoreCategory,
  ) {
    if (type !== 'VIDEO' || !LEGACY_DEMO_VIDEO_URLS.has(url)) {
      return url;
    }

    return STORE_CATEGORY_VIDEO_URLS[category] ?? STORE_VIDEO_URLS.nightlife;
  }

  private containsInsensitive(value: string): Prisma.StringFilter {
    return { contains: value, mode: 'insensitive' };
  }

  private equalsInsensitive(value: string): Prisma.StringFilter {
    return { equals: value, mode: 'insensitive' };
  }

  private toNumber(value: unknown) {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }

    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }

    if (
      typeof value === 'object' &&
      'toNumber' in value &&
      typeof value.toNumber === 'function'
    ) {
      const parsed = (value as { toNumber: () => unknown }).toNumber();
      return typeof parsed === 'number' && Number.isFinite(parsed)
        ? parsed
        : null;
    }

    return null;
  }

  private resolveCouponUserType(user: AuthenticatedUser): CouponUserType {
    return user.tier === 'VIP' ? 'VIP' : 'MEMBER';
  }

  private buildCouponDiscountRuleSnapshot(
    coupon: {
      discountType: string;
      discountValue: number;
      maxDiscountVnd: number | null;
      minSpendVnd: number | null;
    },
    userType: CouponUserType,
    tier?: string | null,
  ) {
    const discountPercent = COUPON_DISCOUNT_PERCENT_BY_USER_TYPE[userType];

    return {
      type: 'PERCENT',
      value: discountPercent,
      discountPercent,
      maxDiscountVnd: coupon.maxDiscountVnd,
      minSpendVnd: coupon.minSpendVnd,
      userType,
      tier: userType === 'GUEST' ? null : (tier ?? userType),
      sourceType: coupon.discountType,
      sourceValue: coupon.discountValue,
    };
  }

  private buildCouponCampaignSnapshot(coupon: {
    id: string;
    code: string;
    name: string;
    storeId?: string;
    discountType: string;
    discountValue: number;
    maxDiscountVnd: number | null;
    minSpendVnd: number | null;
    store?: { id: string; name: string; slug: string } | null;
  }) {
    return {
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      storeId: coupon.storeId ?? coupon.store?.id ?? null,
      store: coupon.store
        ? {
            id: coupon.store.id,
            name: coupon.store.name,
            slug: coupon.store.slug,
          }
        : null,
      sourceType: coupon.discountType,
      sourceValue: coupon.discountValue,
      maxDiscountVnd: coupon.maxDiscountVnd,
      minSpendVnd: coupon.minSpendVnd,
    };
  }

  private buildCouponQrPayload(code: string) {
    return code;
  }

  private buildCouponQrPayloadHash(payload: string) {
    return createHash('sha256').update(payload).digest('hex');
  }

  private couponIssueStatusLabel(status: string) {
    return COUPON_ISSUE_STATUS_LABELS[status] ?? status;
  }

  private decorateCouponIssue<
    T extends { code: string; status: string; metadata?: unknown },
  >(issue: T) {
    const metadata = this.asRecord(issue.metadata);
    const discountRuleSnapshot = this.asRecord(
      metadata?.discountRuleSnapshot,
    );
    const discountPercent = this.toNumber(metadata?.discountPercent);

    return {
      ...issue,
      qrPayload:
        typeof metadata?.qrPayload === 'string'
          ? metadata.qrPayload
          : this.buildCouponQrPayload(issue.code),
      statusLabel: this.couponIssueStatusLabel(issue.status),
      userType:
        typeof metadata?.userType === 'string'
          ? metadata.userType
          : metadata?.recipientType,
      discountPercent:
        discountPercent ??
        this.toNumber(discountRuleSnapshot?.discountPercent) ??
        this.toNumber(discountRuleSnapshot?.value),
      discountRuleSnapshot: discountRuleSnapshot ?? null,
    };
  }

  private asRecord(value: unknown) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return undefined;
    }

    return value as Record<string, unknown>;
  }

  private async expireIssuedCouponIssues(where: Prisma.CouponIssueWhereInput) {
    return this.prisma.couponIssue.updateMany({
      where: {
        ...where,
        status: 'ISSUED',
        expiresAt: { lte: new Date() },
      },
      data: { status: 'EXPIRED' },
    });
  }

  private maskSensitiveBillForRole<T extends { user: unknown; guest: unknown }>(
    bill: T,
    user: AuthenticatedUser,
  ) {
    if (user.role === 'ADMIN') {
      return bill;
    }

    return {
      ...bill,
      user: this.maskCustomerIdentity(bill.user),
      guest: this.maskCustomerIdentity(bill.guest),
    };
  }

  private maskCustomerIdentity(customer: unknown) {
    if (!customer || typeof customer !== 'object') {
      return customer;
    }

    const value = customer as {
      phone?: string | null;
      email?: string | null;
      [key: string]: unknown;
    };

    return {
      ...value,
      phone: value.phone ? this.maskPhone(value.phone) : value.phone,
      email: value.email ? this.maskEmail(value.email) : value.email,
    };
  }

  private maskPhone(phone: string) {
    if (phone.length <= 6) {
      return '***';
    }

    return `${phone.slice(0, 3)}****${phone.slice(-3)}`;
  }

  private maskEmail(email: string) {
    const [name, domain] = email.split('@');
    if (!domain) {
      return '***';
    }

    return `${name.slice(0, 2)}***@${domain}`;
  }

  private capExpiry(candidate: Date, couponEndsAt: Date | null) {
    if (couponEndsAt && couponEndsAt < candidate) {
      return couponEndsAt;
    }

    return candidate;
  }

  private async assertIssueCanBeConfirmed(issue: {
    id: string;
    status: string;
    expiresAt: Date | null;
  }) {
    if (issue.status === 'EXPIRED') {
      throw new UnprocessableEntityException('Coupon issue has expired');
    }

    if (issue.status === 'USED') {
      throw new UnprocessableEntityException(
        'Coupon issue has already been used',
      );
    }

    if (issue.status !== 'ISSUED') {
      throw new UnprocessableEntityException('Coupon issue is not usable');
    }

    if (issue.expiresAt && issue.expiresAt <= new Date()) {
      await this.expireIssuedCouponIssues({ id: issue.id });
      throw new UnprocessableEntityException('Coupon issue has expired');
    }
  }
}
