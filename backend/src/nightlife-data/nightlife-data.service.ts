import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { AccessService, AuthenticatedUser } from '../access/access.service';
import { PrismaService } from '../prisma/prisma.service';
import { ClaimGuestCouponDto } from './dto/claim-guest-coupon.dto';
import { ReviewBillDto } from './dto/review-bill.dto';

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class NightlifeDataService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: AccessService,
  ) {}

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
