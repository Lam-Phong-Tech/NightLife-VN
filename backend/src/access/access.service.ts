import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

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
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  PARTNER: 'partner',
  OPERATOR: 'operator',
  STAFF: 'staff',
  USER: 'member',
};

@Injectable()
export class AccessService {
  constructor(private readonly prisma: PrismaService) {}

  isSuperAdmin(user: AuthenticatedUser) {
    return user.role === 'SUPER_ADMIN';
  }

  isAdmin(user: AuthenticatedUser) {
    return user.role === 'ADMIN' || this.isSuperAdmin(user);
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

  canManageRanking(user: AuthenticatedUser) {
    return this.hasRolePermission(user, 'ranking.manage');
  }

  canManageCouponIssue(user: AuthenticatedUser) {
    return this.hasRolePermission(user, 'coupon.issue.manage');
  }

  canReviewBookingReschedule(user: AuthenticatedUser) {
    return this.hasRolePermission(user, 'booking.reschedule.review');
  }

  canManageBookingChat(user: AuthenticatedUser) {
    return this.hasRolePermission(user, 'booking.chat.manage');
  }

  canCancelBooking(user: AuthenticatedUser) {
    return this.hasRolePermission(user, 'booking.cancel');
  }

  canViewCancelAnalytics(user: AuthenticatedUser) {
    return this.hasRolePermission(user, 'report.cancel_analytics.view');
  }

  canUpdateStorePolicy(user: AuthenticatedUser) {
    return this.hasRolePermission(user, 'store.policy.update');
  }

  async canReviewBill(user: AuthenticatedUser, billId?: string) {
    return this.canAccessBillAction(user, billId, 'bill.review');
  }

  async canPreviewBillApproval(user: AuthenticatedUser, billId?: string) {
    return this.canAccessBillAction(user, billId, 'bill.approval.preview');
  }

  async canApproveBill(user: AuthenticatedUser, billId?: string) {
    return this.canAccessBillAction(user, billId, 'bill.approve');
  }

  async canConfirmBillPmBa(user: AuthenticatedUser, billId?: string) {
    return this.canAccessBillAction(user, billId, 'bill.pm_ba.confirm');
  }

  async canVoidBill(user: AuthenticatedUser, billId?: string) {
    return this.canAccessBillAction(user, billId, 'bill.void');
  }

  async canReverseBill(user: AuthenticatedUser, billId?: string) {
    return this.canAccessBillAction(user, billId, 'bill.reverse');
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

    let queryId = target.couponIssueId;
    let queryHash: string | undefined;
    if (target.code) {
      const clean = target.code.trim();
      if (
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          clean,
        )
      ) {
        queryId = clean;
      } else if (/^[0-9a-f]{32}$/i.test(clean)) {
        queryId = `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
      } else if (/^[0-9a-f]{64}$/i.test(clean)) {
        queryHash = clean;
      }
    }

    const issue = await this.prisma.couponIssue.findFirst({
      where: {
        OR: [
          target.code ? { code: target.code } : null,
          queryId ? { id: queryId } : null,
          queryHash ? { qrPayloadHash: queryHash } : null,
        ].filter(Boolean) as Prisma.CouponIssueWhereInput[],
      },
      select: { coupon: { select: { storeId: true } } },
    });

    if (issue) {
      return this.hasStoreAccess(user, issue.coupon.storeId, 'coupon.scan');
    }

    const adminIssue = await this.prisma.adminCouponIssue.findFirst({
      where: {
        OR: [
          target.code ? { code: target.code } : null,
          queryId ? { id: queryId } : null,
          queryHash ? { qrPayloadHash: queryHash } : null,
        ].filter(Boolean) as Prisma.AdminCouponIssueWhereInput[],
      },
      include: { adminCoupon: true },
    });

    if (adminIssue) {
      if (adminIssue.storeId) {
        return this.hasStoreAccess(user, adminIssue.storeId, 'coupon.scan');
      }
      const targetStores = adminIssue.adminCoupon.targetStores || [];
      const accessibleStoreIds = await this.getAccessibleStoreIds(
        user,
        'coupon.scan',
      );
      if (!accessibleStoreIds) {
        return true;
      }
      if (accessibleStoreIds.length === 0) {
        return false;
      }
      if (targetStores.length > 0) {
        return accessibleStoreIds.some((id) => targetStores.includes(id));
      }
      return true;
    }

    return false;
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

    if (issue) {
      return this.hasStoreAccess(user, issue.coupon.storeId, 'checkin.confirm');
    }

    const adminIssue = await this.prisma.adminCouponIssue.findFirst({
      where: { id: target.couponIssueId },
      include: { adminCoupon: true },
    });

    if (adminIssue) {
      if (adminIssue.storeId) {
        return this.hasStoreAccess(user, adminIssue.storeId, 'checkin.confirm');
      }
      const targetStores = adminIssue.adminCoupon.targetStores || [];
      const accessibleStoreIds = await this.getAccessibleStoreIds(
        user,
        'checkin.confirm',
      );
      if (!accessibleStoreIds) {
        return true;
      }
      if (accessibleStoreIds.length === 0) {
        return false;
      }
      if (targetStores.length > 0) {
        return accessibleStoreIds.some((id) => targetStores.includes(id));
      }
      return true;
    }

    return false;
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
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });

    const delegatedStores = await this.prisma.storePermission.findMany({
      where: {
        userId,
        deletedAt: null,
        status: 'ACTIVE',
        ...(permissionKey ? { permissions: { has: permissionKey } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: { storeId: true },
    });

    const primaryStoreId = delegatedStores[0]?.storeId ?? stores[0]?.id;

    return primaryStoreId ? [primaryStoreId] : [];
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

  private async canAccessBillAction(
    user: AuthenticatedUser,
    billId: string | undefined,
    permissionKey: string,
  ) {
    if (!(await this.hasRolePermission(user, permissionKey))) {
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
      ? this.hasStoreAccess(user, bill.storeId, permissionKey)
      : false;
  }

  private roleKeyFor(user: AuthenticatedUser) {
    if (!user.role) {
      return null;
    }

    return USER_ROLE_TO_ROLE_KEY[user.role] ?? user.role.toLowerCase();
  }
}
