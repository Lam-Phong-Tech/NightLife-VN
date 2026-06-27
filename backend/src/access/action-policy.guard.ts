import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ACTION_POLICY_KEY, ActionPolicy } from './action-policy.decorator';
import { AccessService, AuthenticatedUser } from './access.service';

@Injectable()
export class ActionPolicyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly accessService: AccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policy = this.reflector.getAllAndOverride<ActionPolicy>(
      ACTION_POLICY_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!policy) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: AuthenticatedUser;
      params?: Record<string, string>;
    }>();

    const user = request.user;
    if (!user) {
      return false;
    }

    if (policy === 'canViewPartnerStore') {
      return this.accessService.canViewPartnerStore(user);
    }

    if (policy === 'canViewPartnerCoupon') {
      return this.accessService.canViewPartnerCoupon(user);
    }

    if (policy === 'canReviewBill') {
      return this.accessService.canReviewBill(user, request.params?.billId);
    }

    if (policy === 'canScanCoupon') {
      return this.accessService.canScanCoupon(user, {
        code: request.params?.code,
        couponIssueId: request.params?.couponIssueId ?? request.params?.id,
      });
    }

    if (policy === 'canConfirmCheckIn') {
      return this.accessService.canConfirmCheckIn(user, {
        couponIssueId: request.params?.couponIssueId ?? request.params?.id,
      });
    }

    if (policy === 'canViewPartnerBooking') {
      return this.accessService.canViewPartnerBooking(user);
    }

    if (policy === 'canViewPartnerBill') {
      return this.accessService.canViewPartnerBill(user);
    }

    if (policy === 'canViewSensitiveBill') {
      return this.accessService.canViewSensitiveBill(user);
    }

    if (policy === 'canViewMemberBooking') {
      return this.accessService.canViewMemberBooking(user);
    }

    if (policy === 'canViewMemberCoupon') {
      return this.accessService.canViewMemberCoupon(user);
    }

    if (policy === 'canClaimMemberCoupon') {
      return this.accessService.canClaimMemberCoupon(user);
    }

    return false;
  }
}
