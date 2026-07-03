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

const USER_ROLE_TO_ROLE_KEY: Record<string, string> = {
  ADMIN: 'admin',
  PARTNER: 'partner',
  OPERATOR: 'operator',
  STAFF: 'staff',
  USER: 'member',
};

@Injectable()
export class AccessService {
  constructor(private readonly prisma: PrismaService) {}

  isAdmin(user: AuthenticatedUser) {
    return user.role === 'ADMIN';
  }

  isOperator(user: AuthenticatedUser) {
    return user.role === 'OPERATOR';
  }

  isStaff(user: AuthenticatedUser) {
    return user.role === 'STAFF';
  }

  hasPlatformStoreAccess(user: AuthenticatedUser) {
    return this.isAdmin(user) || this.isOperator(user);
  }

  canViewPartnerStore(user: AuthenticatedUser) {
    return this.hasRolePermission(user, 'store.partner.view');
  }

  canViewPartnerCoupon(user: AuthenticatedUser) {
    return this.hasRolePermission(user, 'coupon.partner.view');
  }

  canViewPartnerBooking(user: AuthenticatedUser) {
    return this.hasRolePermission(user, 'booking.partner.view');
  }

  canViewPartnerBill(user: AuthenticatedUser) {
    return this.hasRolePermission(user, 'bill.partner.view');
  }

  canViewSensitiveBill(user: AuthenticatedUser) {
    return this.hasRolePermission(user, 'bill.sensitive.view');
  }

  canViewRevenueReport(user: AuthenticatedUser) {
    return this.hasRolePermission(user, 'report.revenue.view');
  }

  canViewMemberBooking(user: AuthenticatedUser) {
    return this.hasRolePermission(user, 'booking.member.view');
  }

  canViewMemberCoupon(user: AuthenticatedUser) {
    return this.hasRolePermission(user, 'coupon.member.view');
  }

  canClaimMemberCoupon(user: AuthenticatedUser) {
    return this.hasRolePermission(user, 'coupon.member.claim');
  }

  async canReviewBill(user: AuthenticatedUser, billId?: string) {
    if (!(await this.hasRolePermission(user, 'bill.review'))) {
      return false;
    }

    if (!billId || this.hasPlatformStoreAccess(user)) {
      return true;
    }

    const bill = await this.prisma.bill.findFirst({
      where: { id: billId, deletedAt: null },
      select: { storeId: true },
    });

    return bill
      ? this.hasStoreAccess(user, bill.storeId, 'bill.review')
      : false;
  }

  async canScanCoupon(
    user: AuthenticatedUser,
    target: { code?: string; couponIssueId?: string },
  ) {
    if (!(await this.hasRolePermission(user, 'coupon.scan'))) {
      return false;
    }

    if (!target.code && !target.couponIssueId) {
      return false;
    }

    if (this.hasPlatformStoreAccess(user)) {
      return true;
    }

    const issue = await this.prisma.couponIssue.findFirst({
      where: {
        ...(target.code ? { code: target.code } : {}),
        ...(target.couponIssueId ? { id: target.couponIssueId } : {}),
      },
      select: { coupon: { select: { storeId: true } } },
    });

    return issue
      ? this.hasStoreAccess(user, issue.coupon.storeId, 'coupon.scan')
      : false;
  }

  async canConfirmCheckIn(
    user: AuthenticatedUser,
    target: { couponIssueId?: string },
  ) {
    if (!(await this.hasRolePermission(user, 'checkin.confirm'))) {
      return false;
    }

    if (!target.couponIssueId) {
      return false;
    }

    if (this.hasPlatformStoreAccess(user)) {
      return true;
    }

    const issue = await this.prisma.couponIssue.findFirst({
      where: { id: target.couponIssueId },
      select: { coupon: { select: { storeId: true } } },
    });

    return issue
      ? this.hasStoreAccess(user, issue.coupon.storeId, 'checkin.confirm')
      : false;
  }

  async hasRolePermission(user: AuthenticatedUser, permissionKey: string) {
    const roleKey = this.roleKeyFor(user);
    if (!roleKey) {
      return false;
    }

    const permission = await this.prisma.rolePermission.findFirst({
      where: {
        role: {
          key: roleKey,
          status: 'ACTIVE',
          deletedAt: null,
        },
        permission: {
          key: permissionKey,
        },
      },
      select: { id: true },
    });

    return Boolean(permission);
  }

  async getPartnerStoreIds(userId: string, permissionKey?: string) {
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

    const delegatedStores = await this.prisma.storePermission.findMany({
      where: {
        userId,
        deletedAt: null,
        status: 'ACTIVE',
        ...(permissionKey ? { permissions: { has: permissionKey } } : {}),
      },
      select: { storeId: true },
    });

    return Array.from(
      new Set([
        ...stores.map((store) => store.id),
        ...delegatedStores.map((permission) => permission.storeId),
      ]),
    );
  }

  async getDelegatedStoreIds(userId: string, permissionKey?: string) {
    const delegatedStores = await this.prisma.storePermission.findMany({
      where: {
        userId,
        deletedAt: null,
        status: 'ACTIVE',
        ...(permissionKey ? { permissions: { has: permissionKey } } : {}),
      },
      select: { storeId: true },
    });

    return delegatedStores.map((permission) => permission.storeId);
  }

  async getAccessibleStoreIds(user: AuthenticatedUser, permissionKey?: string) {
    if (this.hasPlatformStoreAccess(user)) {
      return undefined;
    }

    if (user.role === 'PARTNER') {
      return this.getPartnerStoreIds(user.id, permissionKey);
    }

    if (user.role === 'STAFF') {
      return this.getDelegatedStoreIds(user.id, permissionKey);
    }

    return [];
  }

  async ensureStoreAccess(
    user: AuthenticatedUser,
    storeId: string,
    permissionKey?: string,
  ) {
    if (await this.hasStoreAccess(user, storeId, permissionKey)) {
      return;
    }

    throw new ForbiddenException('You cannot access data for this store');
  }

  private async hasStoreAccess(
    user: AuthenticatedUser,
    storeId: string,
    permissionKey?: string,
  ) {
    const storeIds = await this.getAccessibleStoreIds(user, permissionKey);

    return storeIds === undefined || storeIds.includes(storeId);
  }

  private roleKeyFor(user: AuthenticatedUser) {
    if (!user.role) {
      return null;
    }

    return USER_ROLE_TO_ROLE_KEY[user.role] ?? user.role.toLowerCase();
  }
}
