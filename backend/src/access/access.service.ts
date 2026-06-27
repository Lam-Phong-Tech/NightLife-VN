import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type AuthenticatedUser = {
  id: string;
  email?: string;
  role?: string;
  tier?: string;
  status?: string;
  jti?: string;
  exp?: number;
};

@Injectable()
export class AccessService {
  constructor(private readonly prisma: PrismaService) {}

  isAdmin(user: AuthenticatedUser) {
    return user.role === 'ADMIN';
  }

  isStaff(user: AuthenticatedUser) {
    return user.role === 'STAFF';
  }

  canViewPartnerBooking(user: AuthenticatedUser) {
    return ['ADMIN', 'STAFF', 'PARTNER'].includes(user.role ?? '');
  }

  async canReviewBill(user: AuthenticatedUser, billId?: string) {
    if (!['ADMIN', 'STAFF'].includes(user.role ?? '')) {
      return false;
    }

    if (!billId || this.isAdmin(user) || this.isStaff(user)) {
      return true;
    }

    const bill = await this.prisma.bill.findFirst({
      where: { id: billId, deletedAt: null },
      select: { storeId: true },
    });

    return bill ? this.hasStoreAccess(user, bill.storeId) : false;
  }

  async canScanCoupon(
    user: AuthenticatedUser,
    target: { code?: string; couponIssueId?: string },
  ) {
    if (!['ADMIN', 'STAFF', 'PARTNER'].includes(user.role ?? '')) {
      return false;
    }

    if (!target.code && !target.couponIssueId) {
      return false;
    }

    if (this.isAdmin(user) || this.isStaff(user)) {
      return true;
    }

    const issue = await this.prisma.couponIssue.findFirst({
      where: {
        ...(target.code ? { code: target.code } : {}),
        ...(target.couponIssueId ? { id: target.couponIssueId } : {}),
      },
      select: { coupon: { select: { storeId: true } } },
    });

    return issue ? this.hasStoreAccess(user, issue.coupon.storeId) : false;
  }

  async getPartnerStoreIds(userId: string) {
    const stores = await this.prisma.store.findMany({
      where: {
        deletedAt: null,
        OR: [
          { ownerId: userId },
          {
            partnerAccount: {
              userId,
              deletedAt: null,
              status: { in: ['ACTIVE', 'PENDING_REVIEW'] },
            },
          },
        ],
      },
      select: { id: true },
    });

    return stores.map((store) => store.id);
  }

  async getAccessibleStoreIds(user: AuthenticatedUser) {
    if (this.isAdmin(user) || this.isStaff(user)) {
      return undefined;
    }

    if (user.role === 'PARTNER') {
      return this.getPartnerStoreIds(user.id);
    }

    return [];
  }

  async ensureStoreAccess(user: AuthenticatedUser, storeId: string) {
    if (await this.hasStoreAccess(user, storeId)) {
      return;
    }

    throw new ForbiddenException('You cannot access data for this store');
  }

  private async hasStoreAccess(user: AuthenticatedUser, storeId: string) {
    const storeIds = await this.getAccessibleStoreIds(user);

    return storeIds === undefined || storeIds.includes(storeId);
  }
}
