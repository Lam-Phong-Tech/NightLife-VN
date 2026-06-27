import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma, StoreCategory } from '@prisma/client';
import { createHash, randomUUID } from 'node:crypto';
import { AccessService, AuthenticatedUser } from '../access/access.service';
import { PrismaService } from '../prisma/prisma.service';
import { ClaimGuestCouponDto } from './dto/claim-guest-coupon.dto';
import { PublicDiscoveryQueryDto } from './dto/public-discovery-query.dto';
import { ReviewBillDto } from './dto/review-bill.dto';

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_PUBLIC_LIMIT = 24;
const MAX_PUBLIC_LIMIT = 100;
const MVP_CITY_CODES = ['hn', 'hcm'] as const;

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

type Coordinates = {
  lat: number;
  lng: number;
};

@Injectable()
export class NightlifeDataService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: AccessService,
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

  async listPublicStores(query: PublicDiscoveryQueryDto = {}) {
    const coordinates = this.parseCoordinates(query);
    const limit = this.resolveLimit(query.limit);
    const stores = await this.prisma.store.findMany({
      where: this.buildPublicStoreWhere(query, { includeCastName: true }),
      orderBy: { createdAt: 'desc' },
      take: coordinates ? MAX_PUBLIC_LIMIT : limit,
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

    return this.sortByDistance(
      stores.map((store) => ({
        id: store.id,
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
      })),
    ).slice(0, limit);
  }

  async listPublicCasts(query: PublicDiscoveryQueryDto = {}) {
    const coordinates = this.parseCoordinates(query);
    const limit = this.resolveLimit(query.limit);
    const searchTerm = this.cleanText(query.q);
    const searchToken = this.normalizeToken(searchTerm);
    const language = this.normalizeToken(query.language);
    const tag = this.normalizeToken(query.tag);
    const casts = await this.prisma.cast.findMany({
      where: {
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
      },
      orderBy: { createdAt: 'desc' },
      take: coordinates ? MAX_PUBLIC_LIMIT : limit,
      select: {
        id: true,
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
    });

    return this.sortByDistance(
      casts.map((cast) => ({
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
      })),
    ).slice(0, limit);
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
        endsAt: true,
        usageLimit: true,
        usedCount: true,
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

    const issue = await this.prisma.couponIssue.create({
      data: {
        couponId: coupon.id,
        guestId: guest.id,
        code: issueCode,
        qrPayloadHash: createHash('sha256').update(issueCode).digest('hex'),
        expiresAt: this.capExpiry(
          new Date(now.getTime() + DAY_MS),
          coupon.endsAt,
        ),
        metadata: {
          recipientType: 'GUEST',
          validityHours: 24,
        },
      },
      select: {
        id: true,
        code: true,
        status: true,
        expiresAt: true,
        createdAt: true,
        coupon: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return {
      issue,
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
        discountType: true,
        discountValue: true,
        maxDiscountVnd: true,
        minSpendVnd: true,
        endsAt: true,
        usageLimit: true,
        usedCount: true,
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
    const discountRuleSnapshot = this.buildMemberDiscountRuleSnapshot(
      coupon,
      user,
    );

    return this.prisma.couponIssue.create({
      data: {
        couponId: coupon.id,
        userId: user.id,
        code: issueCode,
        qrPayloadHash: createHash('sha256').update(issueCode).digest('hex'),
        expiresAt: this.capExpiry(
          new Date(now.getTime() + 7 * DAY_MS),
          coupon.endsAt,
        ),
        metadata: {
          recipientType: 'MEMBER',
          tier: user.tier ?? 'FREE',
          validityDays: 7,
          discountRuleSnapshot,
        },
      },
      select: {
        id: true,
        code: true,
        status: true,
        expiresAt: true,
        createdAt: true,
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
        coupon: { select: { id: true, code: true, name: true } },
        user: { select: { id: true, displayName: true, tier: true } },
        guest: { select: { id: true, displayName: true } },
      },
    });
  }

  async listOperatorBookings(user: AuthenticatedUser) {
    return this.listPartnerBookings(user);
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
    this.assertIssueCanBeConfirmed(issue);

    return this.prisma.couponIssue.update({
      where: { id: issue.id },
      data: { scannedById: user.id },
      select: {
        id: true,
        code: true,
        status: true,
        expiresAt: true,
        usedAt: true,
        user: { select: { id: true, displayName: true, tier: true } },
        guest: { select: { id: true, displayName: true } },
        booking: { select: { id: true, status: true, scheduledAt: true } },
        coupon: {
          select: {
            id: true,
            code: true,
            name: true,
            store: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
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
    this.assertIssueCanBeConfirmed(issue);

    const now = new Date();

    const updatedIssue = await this.prisma.couponIssue.update({
      where: { id: issue.id },
      data: {
        status: 'USED',
        usedAt: now,
        scannedById: user.id,
      },
      select: {
        id: true,
        code: true,
        status: true,
        expiresAt: true,
        usedAt: true,
        scannedById: true,
        coupon: {
          select: {
            id: true,
            code: true,
            name: true,
            store: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

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

    return updatedIssue;
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
        coupon: { select: { id: true, code: true, name: true } },
      },
    });
  }

  listMemberCouponIssues(userId: string) {
    return this.prisma.couponIssue.findMany({
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
        coupon: {
          select: {
            id: true,
            code: true,
            name: true,
            store: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
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
      select: {
        id: true,
        status: true,
        verifiedAt: true,
        rejectedAt: true,
        reviewedAt: true,
        reviewedById: true,
        verifiedById: true,
        rejectedById: true,
        rejectReason: true,
        totalVnd: true,
        commissionAmountVnd: true,
        pointsEarned: true,
        updatedAt: true,
      },
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

    return result;
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

  private buildPublicStoreWhere(
    query: PublicDiscoveryQueryDto,
    options: { includeTextSearch?: boolean; includeCastName?: boolean } = {},
  ): Prisma.StoreWhereInput {
    const searchTerm = this.cleanText(query.q);
    const cityCode = this.normalizeCityCode(query.city, { strict: true });
    const area = this.cleanText(query.area);
    const areaCode = this.normalizeToken(area);
    const category = this.normalizeCategory(query.category, { strict: true });
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

  private parseCoordinates(query: PublicDiscoveryQueryDto): Coordinates | null {
    const hasLat = query.lat !== undefined && query.lat !== null && query.lat !== '';
    const hasLng = query.lng !== undefined && query.lng !== null && query.lng !== '';

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

    const cityCode = CITY_ALIASES[token] ?? CITY_ALIASES[token.replace(/-/g, ' ')];

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
      const parsed = value.toNumber();
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  private buildMemberDiscountRuleSnapshot(
    coupon: {
      discountType: string;
      discountValue: number;
      maxDiscountVnd: number | null;
      minSpendVnd: number | null;
    },
    user: AuthenticatedUser,
  ) {
    const tier = user.tier ?? 'FREE';
    const minimumPercentByTier: Record<string, number> = {
      FREE: 8,
      PREMIUM: 8,
      VIP: 10,
    };

    return {
      type: coupon.discountType,
      value:
        coupon.discountType === 'PERCENT'
          ? Math.max(coupon.discountValue, minimumPercentByTier[tier] ?? 8)
          : coupon.discountValue,
      maxDiscountVnd: coupon.maxDiscountVnd,
      minSpendVnd: coupon.minSpendVnd,
      tier,
      sourceValue: coupon.discountValue,
    };
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

  private assertIssueCanBeConfirmed(issue: {
    status: string;
    expiresAt: Date | null;
  }) {
    if (issue.status !== 'ISSUED') {
      throw new UnprocessableEntityException('Coupon issue is not claimable');
    }

    if (issue.expiresAt && issue.expiresAt <= new Date()) {
      throw new UnprocessableEntityException('Coupon issue has expired');
    }
  }
}
