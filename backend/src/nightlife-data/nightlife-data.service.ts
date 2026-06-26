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

    if (!coupon || (coupon.endsAt && coupon.endsAt <= new Date())) {
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
        expiresAt: coupon.endsAt,
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
        guest: { select: { id: true, displayName: true, phone: true } },
      },
    });
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
        verifiedAt: true,
        rejectedAt: true,
        rejectReason: true,
        store: { select: { id: true, name: true, slug: true } },
        booking: { select: { id: true, status: true, scheduledAt: true } },
        coupon: { select: { id: true, code: true, name: true } },
      },
    });
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

  listSensitiveBillsForAdmin() {
    return this.prisma.bill.findMany({
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
        verifiedAt: true,
        rejectedAt: true,
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

    return this.prisma.bill.update({
      where: { id: billId },
      data: dto.approve
        ? {
            status: 'VERIFIED',
            verifiedAt: now,
            rejectedAt: null,
            rejectReason: null,
          }
        : {
            status: 'REJECTED',
            rejectedAt: now,
            rejectReason: dto.rejectReason ?? 'Rejected by admin review',
          },
      select: {
        id: true,
        status: true,
        verifiedAt: true,
        rejectedAt: true,
        rejectReason: true,
        updatedAt: true,
      },
    });
  }
}
