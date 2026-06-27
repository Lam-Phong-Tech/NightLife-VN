import { SetMetadata } from '@nestjs/common';

export const ACTION_POLICY_KEY = 'actionPolicy';

export type ActionPolicy =
  | 'canViewPartnerStore'
  | 'canViewPartnerCoupon'
  | 'canReviewBill'
  | 'canScanCoupon'
  | 'canConfirmCheckIn'
  | 'canViewPartnerBooking'
  | 'canViewPartnerBill'
  | 'canViewSensitiveBill'
  | 'canViewMemberBooking'
  | 'canViewMemberCoupon'
  | 'canClaimMemberCoupon';

export const ActionPolicy = (policy: ActionPolicy) =>
  SetMetadata(ACTION_POLICY_KEY, policy);
