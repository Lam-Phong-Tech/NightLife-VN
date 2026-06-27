import { SetMetadata } from '@nestjs/common';

export const ACTION_POLICY_KEY = 'actionPolicy';

export type ActionPolicy =
  | 'canReviewBill'
  | 'canScanCoupon'
  | 'canViewPartnerBooking';

export const ActionPolicy = (policy: ActionPolicy) =>
  SetMetadata(ACTION_POLICY_KEY, policy);
