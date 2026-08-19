import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Tour } from '@prisma/client';
import { AuthenticatedUser } from '../access/access.service';
import { adminAuditActorFields } from '../audit-logs/admin-audit';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import {
  collectTourDepartureTimes,
  normalizeTourDepartureSchedule,
  tourDepartureScheduleError,
  type TourDepartureSchedule,
} from './tour-departure-schedule';
import {
  getTourCoverStorageKey,
  getTourCoverUrlValidationError,
  isSupportedStoredTourCover,
} from './tour-cover-url-validation';

type TourCouponAudience = 'GUEST' | 'MEMBER' | 'VIP';

type PublicTourStoreCoupon = {
  id: string;
  code: string;
  name: string;
  discountType: string;
  discountValue: number;
  maxDiscountVnd?: number | null;
  minSpendVnd?: number | null;
};

const TOUR_TIER_COUPON_RULES: Record<
  TourCouponAudience,
  { code: string; label: string; discountValue: number }
> = {
  GUEST: { code: 'GUEST5', label: 'Guest Discount 5%', discountValue: 5 },
  MEMBER: { code: 'MEMBER8', label: 'Member Discount 8%', discountValue: 8 },
  VIP: { code: 'VIP10', label: 'VIP Discount 10%', discountValue: 10 },
};

const PARTNER_LISTING_CAST_EDIT_DRAFT_PREFIX = 'partner-cast-edit-';
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class TourService {
  private readonly publicStoreCoverPurposes = new Set([
    'store-hero',
    'hero',
    'cover',
    'store-cover',
    'STORE_COVER',
    'PARTNER_STORE_COVER',
    'PARTNER_LISTING_STORE',
  ]);

  constructor(private prisma: PrismaService) {}

  private tourAuditSnapshot(
    tour: Tour & { stops?: { storeId: string; order: number }[] },
  ) {
    return {
      title: tour.title,
      subtitle: tour.subtitle,
      city: tour.city,
      durationHours: tour.durationHours,
      priceTier: tour.priceTier,
      coverUrl: tour.coverUrl,
      status: tour.status,
      homeRank: tour.homeRank,
      departureTimes: tour.departureTimes,
      departureSchedule: tour.departureSchedule,
      ...(tour.stops
        ? {
            stops: tour.stops.map((stop) => ({
              storeId: stop.storeId,
              order: stop.order,
            })),
          }
        : {}),
    } as Prisma.InputJsonValue;
  }

  private tourChangedFields(dto: UpdateTourDto) {
    return Object.entries(dto)
      .filter(([, value]) => value !== undefined)
      .map(([key]) => key);
  }

  private extractWardFromStoreAddress(address?: string | null) {
    const parts =
      address
        ?.split(',')
        .map((part) => part.trim())
        .filter(Boolean) ?? [];

    return (
      parts.find((part) => /^(phường|xã|thị trấn)\b/i.test(part)) ?? null
    );
  }

  private async validateTourCoverUrl(coverUrl: string | undefined) {
    const validationError = getTourCoverUrlValidationError(coverUrl);
    if (validationError) {
      throw new BadRequestException(validationError);
    }

    if (!coverUrl) {
      return;
    }

    const storageKey = getTourCoverStorageKey(coverUrl);
    if (!storageKey) {
      return;
    }

    const media = await this.prisma.media.findUnique({
      where: { storageKey },
      select: {
        type: true,
        mimeType: true,
      },
    });
    if (!isSupportedStoredTourCover(media)) {
      throw new BadRequestException(
        'File lưu trữ được chọn không phải ảnh bìa JPG, PNG, WebP hoặc GIF hợp lệ.',
      );
    }
  }

  private publicTourStoreSelect(
    now: Date,
    audience: TourCouponAudience,
    pendingCastEditSourceIds: string[],
  ) {
    const tierCouponCode = TOUR_TIER_COUPON_RULES[audience].code;

    return {
      id: true,
      name: true,
      slug: true,
      category: true,
      description: true,
      address: true,
      city: true,
      district: true,
      openingHours: true,
      pricingInfo: true,
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
        // Keep enough public images to find an older, explicitly selected
        // cover even when newer gallery images were uploaded afterwards.
        take: 20,
        select: {
          id: true,
          url: true,
          purpose: true,
        },
      },
      coupons: {
        where: {
          status: 'ACTIVE',
          deletedAt: null,
          startsAt: { lte: now },
          OR: [{ endsAt: null }, { endsAt: { gte: now } }],
          code: { contains: tierCouponCode, mode: 'insensitive' },
        },
        orderBy: { startsAt: 'desc' },
        take: 1,
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          discountType: true,
          discountValue: true,
          maxDiscountVnd: true,
          minSpendVnd: true,
        },
      },
      casts: {
        where: {
          deletedAt: null,
          status: 'ACTIVE',
          isPublic: true,
          ...(pendingCastEditSourceIds.length
            ? { id: { notIn: pendingCastEditSourceIds } }
            : {}),
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          stageName: true,
          slug: true,
          publicAlias: true,
          zodiacSign: true,
          heightCm: true,
          languages: true,
          tags: true,
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
              id: true,
              url: true,
              purpose: true,
            },
          },
        },
      },
    } satisfies Prisma.StoreSelect;
  }

  private publicTourInclude(
    now: Date,
    audience: TourCouponAudience,
    pendingCastEditSourceIds: string[],
  ) {
    return {
      stops: {
        where: {
          store: {
            status: 'ACTIVE',
            deletedAt: null,
          },
        },
        orderBy: { order: 'asc' },
        include: {
          store: {
            select: this.publicTourStoreSelect(
              now,
              audience,
              pendingCastEditSourceIds,
            ),
          },
        },
      },
    } satisfies Prisma.TourInclude;
  }

  private resolveTourCouponAudience(
    user?: AuthenticatedUser,
  ): TourCouponAudience {
    const tier = user?.tier?.toUpperCase();

    if (tier === 'VIP' || tier === 'PREMIUM') {
      return 'VIP';
    }

    if (tier === 'MEMBER' || tier === 'FREE' || tier === 'REGULAR') {
      return 'MEMBER';
    }

    return 'GUEST';
  }

  private async pendingPartnerListingCastEditSourceIds() {
    const drafts = await this.prisma.cast.findMany({
      where: {
        deletedAt: null,
        isPublic: false,
        status: { in: ['DRAFT', 'PENDING_REVIEW'] },
        slug: { startsWith: PARTNER_LISTING_CAST_EDIT_DRAFT_PREFIX },
      },
      select: { slug: true },
    });

    return [
      ...new Set(
        drafts
          .map((draft) =>
            draft.slug.slice(PARTNER_LISTING_CAST_EDIT_DRAFT_PREFIX.length),
          )
          .filter((id) => uuidPattern.test(id)),
      ),
    ];
  }

  private isTierCouponCode(code: string, audience: TourCouponAudience) {
    const normalizedCode = code.toUpperCase();
    return normalizedCode.includes(TOUR_TIER_COUPON_RULES[audience].code);
  }

  private resolveApplicableTourCoupon<T extends PublicTourStoreCoupon>(
    coupons: T[],
    audience: TourCouponAudience,
  ) {
    const coupon = coupons.find((item) =>
      this.isTierCouponCode(item.code, audience),
    );
    if (!coupon) return null;

    const rule = TOUR_TIER_COUPON_RULES[audience];
    return {
      ...coupon,
      name: rule.label,
      audience,
      discountType: 'PERCENT',
      discountValue: rule.discountValue,
    };
  }

  private decoratePublicTour<
    T extends {
      stops: Array<{
        store: {
          coupons: PublicTourStoreCoupon[];
          media?: Array<{ url: string; purpose?: string | null }>;
        };
      }>;
    },
  >(tour: T, user?: AuthenticatedUser) {
    const audience = this.resolveTourCouponAudience(user);
    const stops = tour.stops.map((stop) => {
      const applicableCoupon = this.resolveApplicableTourCoupon(
        stop.store.coupons,
        audience,
      );
      const media = [...(stop.store.media ?? [])].sort((left, right) => {
        const leftIsCover = this.publicStoreCoverPurposes.has(
          String(left.purpose ?? '').trim(),
        );
        const rightIsCover = this.publicStoreCoverPurposes.has(
          String(right.purpose ?? '').trim(),
        );
        return Number(rightIsCover) - Number(leftIsCover);
      });
      return {
        ...stop,
        store: {
          ...stop.store,
          media,
          applicableCoupon,
        },
      };
    });

    return {
      ...tour,
      stops,
      applicableCoupon:
        stops.find((stop) => stop.store.applicableCoupon)?.store
          .applicableCoupon ?? null,
      couponAudience: audience,
    };
  }

  async findPublicAll(params: {
    skip?: number;
    take?: number;
    city?: string;
    q?: string;
    user?: AuthenticatedUser;
  }) {
    const { skip = 0, take = 20, city, q, user } = params;
    const now = new Date();
    const audience = this.resolveTourCouponAudience(user);
    const pendingCastEditSourceIds =
      await this.pendingPartnerListingCastEditSourceIds();
    const search = q?.trim();
    const visibleStopWhere: Prisma.TourStopWhereInput = {
      store: {
        status: 'ACTIVE',
        deletedAt: null,
      },
    };
    const where: Prisma.TourWhereInput = {
      status: 'ACTIVE',
      deletedAt: null,
      ...(city ? { city } : {}),
      stops: { some: visibleStopWhere },
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { subtitle: { contains: search, mode: 'insensitive' } },
              { city: { contains: search, mode: 'insensitive' } },
              {
                stops: {
                  some: {
                    ...visibleStopWhere,
                    store: {
                      status: 'ACTIVE',
                      deletedAt: null,
                      OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { city: { contains: search, mode: 'insensitive' } },
                        { district: { contains: search, mode: 'insensitive' } },
                        {
                          area: {
                            is: {
                              OR: [
                                { name: { contains: search, mode: 'insensitive' } },
                                { city: { contains: search, mode: 'insensitive' } },
                                { district: { contains: search, mode: 'insensitive' } },
                                { ward: { contains: search, mode: 'insensitive' } },
                              ],
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.tour.findMany({
        skip,
        take,
        where,
        orderBy: [
          { homeRank: { sort: 'asc', nulls: 'last' } },
          { createdAt: 'desc' },
        ],
        include: this.publicTourInclude(
          now,
          audience,
          pendingCastEditSourceIds,
        ),
      }),
      this.prisma.tour.count({ where }),
    ]);

    return {
      data: data
        .filter((tour) => tour.stops.length > 0)
        .map((tour) => this.decoratePublicTour(tour, user)),
      total,
      page: Math.floor(skip / take) + 1,
      limit: take,
    };
  }

  async findPublicOne(id: string, user?: AuthenticatedUser) {
    const now = new Date();
    const audience = this.resolveTourCouponAudience(user);
    const pendingCastEditSourceIds =
      await this.pendingPartnerListingCastEditSourceIds();
    const tour = await this.prisma.tour.findFirst({
      where: {
        id,
        status: 'ACTIVE',
        deletedAt: null,
      },
      include: this.publicTourInclude(now, audience, pendingCastEditSourceIds),
    });

    if (!tour || tour.stops.length === 0) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }

    return this.decoratePublicTour(tour, user);
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.TourWhereInput;
    orderBy?:
      | Prisma.TourOrderByWithRelationInput
      | Prisma.TourOrderByWithRelationInput[];
  }) {
    const { skip = 0, take = 50, where, orderBy } = params;

    const [data, total] = await Promise.all([
      this.prisma.tour.findMany({
        skip,
        take,
        where: {
          ...where,
          status: where?.status || { not: 'DELETED' },
        },
        orderBy: orderBy || [
          { homeRank: { sort: 'asc', nulls: 'last' } },
          { createdAt: 'desc' },
        ],
        include: {
          stops: {
            orderBy: { order: 'asc' },
            include: {
              store: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                  city: true,
                  district: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.tour.count({
        where: {
          ...where,
          status: where?.status || { not: 'DELETED' },
        },
      }),
    ]);

    return {
      data,
      total,
      page: Math.floor(skip / take) + 1,
      limit: take,
    };
  }

  async findOne(id: string) {
    const tour = await this.prisma.tour.findFirst({
      where: {
        id,
        status: { not: 'DELETED' },
      },
      include: {
        stops: {
          orderBy: { order: 'asc' },
          include: {
            store: {
              include: {
                area: true,
                casts: {
                  where: { status: 'ACTIVE' },
                  select: {
                    id: true,
                    stageName: true,
                    slug: true,
                    zodiacSign: true,
                    heightCm: true,
                    languages: true,
                    tags: true,
                  },
                },
                coupons: {
                  where: { status: 'ACTIVE' },
                  select: {
                    id: true,
                    name: true,
                    discountType: true,
                    discountValue: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!tour) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }

    return {
      ...tour,
      stops: tour.stops.map((stop) => ({
        ...stop,
        store: {
          ...stop.store,
          ward:
            stop.store.area?.ward ??
            this.extractWardFromStoreAddress(stop.store.address),
        },
      })),
    };
  }

  private async assertTourStopsAreActive(
    stops?: Array<{ storeId: string }>,
  ) {
    const storeIds = Array.from(
      new Set((stops ?? []).map((stop) => stop.storeId)),
    );
    if (!storeIds.length) {
      return;
    }

    const activeStores = await this.prisma.store.findMany({
      where: {
        id: { in: storeIds },
        deletedAt: null,
        status: 'ACTIVE',
      },
      select: { id: true },
    });

    if (activeStores.length !== storeIds.length) {
      throw new BadRequestException(
        'Điểm dừng tour chỉ có thể là quán đã được duyệt và đang hoạt động.',
      );
    }
  }

  async create(dto: CreateTourDto, actor: AuthenticatedUser) {
    const { stops, ...tourData } = dto;
    await this.validateTourCoverUrl(tourData.coverUrl);
    await this.assertTourStopsAreActive(stops);

    const departureSchedule = normalizeTourDepartureSchedule(
      tourData.departureSchedule,
      tourData.departureTimes,
    );
    const departureScheduleError =
      tourDepartureScheduleError(departureSchedule);
    if (departureScheduleError) {
      throw new BadRequestException(departureScheduleError);
    }

    return this.prisma.$transaction(async (tx) => {
      const tour = await tx.tour.create({
        data: {
          title: tourData.title,
          subtitle: tourData.subtitle,
          city: tourData.city,
          durationHours: tourData.durationHours,
          priceTier: tourData.priceTier,
          coverUrl: tourData.coverUrl,
          status: tourData.status || 'ACTIVE',
          homeRank: tourData.homeRank,
          departureTimes: collectTourDepartureTimes(departureSchedule),
          departureSchedule,
        },
      });

      if (stops && stops.length > 0) {
        await tx.tourStop.createMany({
          data: stops.map((stop) => ({
            tourId: tour.id,
            storeId: stop.storeId,
            order: stop.order,
          })),
        });
      }

      const created = await tx.tour.findUnique({
        where: { id: tour.id },
        include: {
          stops: {
            orderBy: { order: 'asc' },
            include: { store: true },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          ...adminAuditActorFields(actor),
          module: 'Tour',
          action: 'tour.create',
          targetType: 'Tour',
          targetId: tour.id,
          entityDisplayCode: `TOUR-${tour.id.substring(0, 8)}`,
          beforeJson: Prisma.JsonNull,
          afterJson: this.tourAuditSnapshot(created ?? tour),
          changeSummary: `Created tour "${tour.title}"`,
          result: 'SUCCESS',
        },
      });

      return created;
    });
  }

  async update(id: string, dto: UpdateTourDto, actor: AuthenticatedUser) {
    const { stops, ...tourData } = dto;
    await this.validateTourCoverUrl(tourData.coverUrl);
    if (stops !== undefined) {
      await this.assertTourStopsAreActive(stops);
    }

    let departureSchedule: TourDepartureSchedule | undefined;
    if (tourData.departureSchedule !== undefined) {
      departureSchedule = normalizeTourDepartureSchedule(
        tourData.departureSchedule,
        tourData.departureTimes,
      );
    } else if (tourData.departureTimes !== undefined) {
      departureSchedule = normalizeTourDepartureSchedule(
        undefined,
        tourData.departureTimes,
      );
    }
    if (departureSchedule) {
      const departureScheduleError =
        tourDepartureScheduleError(departureSchedule);
      if (departureScheduleError) {
        throw new BadRequestException(departureScheduleError);
      }
    }

    const existing = await this.prisma.tour.findFirst({
      where: { id, status: { not: 'DELETED' } },
      include: {
        stops: {
          orderBy: { order: 'asc' },
          select: { storeId: true, order: true },
        },
      },
    });
    if (!existing) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.tour.update({
        where: { id },
        data: {
          title: tourData.title,
          subtitle: tourData.subtitle,
          city: tourData.city,
          durationHours: tourData.durationHours,
          priceTier: tourData.priceTier,
          coverUrl: tourData.coverUrl,
          status: tourData.status,
          homeRank: tourData.homeRank,
          ...(departureSchedule
            ? {
                departureTimes: collectTourDepartureTimes(departureSchedule),
                departureSchedule,
              }
            : {}),
        },
      });

      if (stops) {
        await tx.tourStop.deleteMany({
          where: { tourId: id },
        });

        if (stops.length > 0) {
          await tx.tourStop.createMany({
            data: stops.map((stop) => ({
              tourId: id,
              storeId: stop.storeId,
              order: stop.order,
            })),
          });
        }
      }

      const updated = await tx.tour.findUnique({
        where: { id },
        include: {
          stops: {
            orderBy: { order: 'asc' },
            include: { store: true },
          },
        },
      });

      const changedFields = this.tourChangedFields(dto);
      if (departureSchedule) {
        // Both columns are rewritten whenever either input is provided.
        for (const field of ['departureTimes', 'departureSchedule']) {
          if (!changedFields.includes(field)) {
            changedFields.push(field);
          }
        }
      }

      await tx.auditLog.create({
        data: {
          ...adminAuditActorFields(actor),
          module: 'Tour',
          action: 'tour.update',
          targetType: 'Tour',
          targetId: id,
          entityDisplayCode: `TOUR-${id.substring(0, 8)}`,
          beforeJson: this.tourAuditSnapshot(existing),
          afterJson: this.tourAuditSnapshot(updated ?? existing),
          changedFields,
          changeSummary: `Updated tour "${(updated ?? existing).title}"`,
          result: 'SUCCESS',
        },
      });

      return updated;
    });
  }

  async remove(id: string, actor: AuthenticatedUser) {
    const tour = await this.prisma.tour.findFirst({
      where: { id, status: { not: 'DELETED' } },
      include: {
        stops: {
          orderBy: { order: 'asc' },
          select: { storeId: true, order: true },
        },
      },
    });
    if (!tour) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      const deleted = await tx.tour.update({
        where: { id },
        data: {
          status: 'DELETED',
          deletedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          ...adminAuditActorFields(actor),
          module: 'Tour',
          action: 'tour.delete',
          targetType: 'Tour',
          targetId: id,
          entityDisplayCode: `TOUR-${id.substring(0, 8)}`,
          beforeJson: this.tourAuditSnapshot(tour),
          afterJson: this.tourAuditSnapshot({ ...deleted, stops: tour.stops }),
          changeSummary: `Deleted tour "${tour.title}" (soft delete)`,
          result: 'SUCCESS',
        },
      });

      return deleted;
    });
  }
}
