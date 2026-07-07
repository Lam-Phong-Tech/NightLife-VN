import { SetMetadata } from '@nestjs/common';

export const ACTION_POLICY_KEY = 'actionPolicy';

export type ActionPolicy =
  | 'canViewPartnerStore'
  | 'canViewPartnerCoupon'
  | 'canReviewBill'
  | 'canPreviewBillApproval'
  | 'canApproveBill'
  | 'canConfirmBillPmBa'
  | 'canVoidBill'
  | 'canReverseBill'
  | 'canScanCoupon'
  | 'canConfirmCheckIn'
  | 'canViewPartnerBooking'
  | 'canViewPartnerBill'
  | 'canViewSensitiveBill'
  | 'canViewRevenueReport'
  | 'canViewMemberBooking'
  | 'canViewMemberCoupon'
  | 'canClaimMemberCoupon';

export const ActionPolicy = (policy: ActionPolicy) =>
  SetMetadata(ACTION_POLICY_KEY, policy);
