import {
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

const CITY_ALIASES: Record<string, string> = {
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
  dn: 'dn',
  danang: 'dn',
  'da-nang': 'dn',
  'da nang': 'dn',
  hp: 'hp',
  haiphong: 'hp',
  'hai-phong': 'hp',
  'hai phong': 'hp',
};

const CATEGORY_ALIASES: Record<string, StoreCategory> = {
  bar: 'BAR',
  club: 'CLUB',
  lounge: 'LOUNGE',
  karaoke: 'KARAOKE',
  'karaoke-ktv': 'KARAOKE',
  ktv: 'KARAOKE',
  restaurant: 'RESTAURANT',
  nhahang: 'RESTAURANT',
  'nha-hang': 'RESTAURANT',
  spa: 'SPA',
  event: 'EVENT',
  other: 'OTHER',
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
    const cityCode = this.normalizeCityCode(query.city);
    const where: Prisma.AreaWhereInput = {
      deletedAt: null,
      status: 'ACTIVE',
      ...(cityCode ? { code: { startsWith: `${cityCode}-` } } : {}),
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
    const casts = await this.prisma.cast.findMany({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        isPublic: true,
        store: this.buildPublicStoreWhere(query, { includeTextSearch: false }),
        ...(searchTerm
          ? {
              OR: [
                { stageName: this.containsInsensitive(searchTerm) },
                { publicAlias: this.containsInsensitive(searchTerm) },
                { publicHeadline: this.containsInsensitive(searchTerm) },
                { bio: this.containsInsensitive(searchTerm) },
                { publicBio: this.containsInsensitive(searchTerm) },
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
    const storeIds = await this.accessService.getAccessibleStoreIds(user);

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
    const storeIds = await this.accessService.getAccessibleStoreIds(user);

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
    const storeIds = await this.accessService.getAccessibleStoreIds(user);

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

    await this.accessService.ensureStoreAccess(user, issue.coupon.storeId);
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

    await this.accessService.ensureStoreAccess(user, issue.coupon.storeId);
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
    const storeIds = await this.accessService.getAccessibleStoreIds(user);

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
      select: { id: true, status: true },
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
        updatedAt: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: dto.approve ? 'bill.review.approve' : 'bill.review.reject',
        targetType: 'Bill',
        targetId: billId,
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

  private buildPublicStoreWhere(
    query: PublicDiscoveryQueryDto,
    options: { includeTextSearch?: boolean; includeCastName?: boolean } = {},
  ): Prisma.StoreWhereInput {
    const searchTerm = this.cleanText(query.q);
    const cityCode = this.normalizeCityCode(query.city);
    const area = this.cleanText(query.area);
    const areaCode = this.normalizeToken(area);
    const category = this.normalizeCategory(query.category);
    const and: Prisma.StoreWhereInput[] = [];

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

    if (cityCode) {
      and.push({
        area: {
          is: {
            code: { startsWith: `${cityCode}-` },
            deletedAt: null,
            status: 'ACTIVE',
          },
        },
      });
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

  private resolveLimit(limit?: string) {
    const parsed = Number(limit);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return DEFAULT_PUBLIC_LIMIT;
    }

    return Math.min(Math.floor(parsed), MAX_PUBLIC_LIMIT);
  }

  private parseCoordinates(query: PublicDiscoveryQueryDto): Coordinates | null {
    if (!query.lat || !query.lng) {
      return null;
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
      return null;
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

  private normalizeCityCode(value?: string | null) {
    const token = this.normalizeToken(value);
    if (!token) {
      return undefined;
    }

    return CITY_ALIASES[token] ?? CITY_ALIASES[token.replace(/-/g, ' ')];
  }

  private cityCodeFromAreaCode(code: string) {
    return code.split('-')[0] || undefined;
  }

  private normalizeCategory(value?: string | null): StoreCategory | undefined {
    const token = this.normalizeToken(value);
    const upperValue = value?.trim().toUpperCase();

    if (!token && !upperValue) {
      return undefined;
    }

    if (upperValue && this.isStoreCategory(upperValue)) {
      return upperValue;
    }

    return CATEGORY_ALIASES[token];
  }

  private isStoreCategory(value: string): value is StoreCategory {
    return [
      'BAR',
      'CLUB',
      'LOUNGE',
      'KARAOKE',
      'RESTAURANT',
      'SPA',
      'EVENT',
      'OTHER',
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
