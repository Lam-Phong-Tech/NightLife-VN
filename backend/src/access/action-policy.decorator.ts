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
  | 'canClaimMemberCoupon'
  | 'canManageRanking'
  | 'canManageCouponIssue'
  | 'canReviewBookingReschedule'
  | 'canManageBookingChat'
  | 'canCancelBooking'
  | 'canViewCancelAnalytics'
  | 'canUpdateStorePolicy'
  | 'canViewAdminStore'
  | 'canViewAdminCast'
  | 'canViewPartnerRequest'
  | 'canViewAdminContent'
  | 'canViewAdminLegalPages'
  | 'canUpdateAdminLegalPages'
  | 'canViewCouponIssue'
  | 'canViewAdminDashboard'
  | 'canUpdateBookingStatus';

export const ActionPolicy = (policy: ActionPolicy) =>
  SetMetadata(ACTION_POLICY_KEY, policy);
