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

    if (policy === 'canReviewBill') {
      return this.accessService.canReviewBill(user, request.params?.billId);
    }

    if (policy === 'canScanCoupon') {
      return this.accessService.canScanCoupon(user, {
        code: request.params?.code,
        couponIssueId: request.params?.couponIssueId,
      });
    }

    if (policy === 'canViewPartnerBooking') {
      return this.accessService.canViewPartnerBooking(user);
    }

    return false;
  }
}
