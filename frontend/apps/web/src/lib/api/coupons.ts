import { apiClient } from "./client";

export type PublicCoupon = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  discountType: "PERCENT" | "FIXED_AMOUNT";
  discountValue: number;
  maxDiscountVnd?: number | null;
  minSpendVnd?: number | null;
  startsAt: string;
  endsAt?: string | null;
  store: {
    id: string;
    name: string;
    slug: string;
    category: string;
    city: string;
    district?: string | null;
  };
};

export type CouponIssue = {
  id: string;
  code: string;
  status: "ISSUED" | "USED" | "EXPIRED" | "REVOKED" | string;
  statusLabel?: string;
  qrPayload?: string;
  qrImageDataUrl?: string | null;
  userType?: "GUEST" | "MEMBER" | "VIP" | string;
  discountPercent?: number | null;
  discountRuleSnapshot?: {
    type?: "PERCENT" | "FIXED_AMOUNT" | string;
    value?: number;
    discountPercent?: number;
    maxDiscountVnd?: number | null;
    minSpendVnd?: number | null;
    userType?: string;
    tier?: string | null;
    sourceType?: string;
    sourceValue?: number;
  } | null;
  expiresAt?: string | null;
  usedAt?: string | null;
  createdAt?: string;
  coupon: {
    id: string;
    code: string;
    name: string;
    discountType?: "PERCENT" | "FIXED_AMOUNT";
    discountValue?: number;
    maxDiscountVnd?: number | null;
    minSpendVnd?: number | null;
    store?: {
      id: string;
      name: string;
      slug: string;
    };
  };
};

export type GuestCouponClaimPayload = {
  displayName?: string;
  phone: string;
  email?: string;
};

export type GuestCouponClaimResponse = {
  issue: CouponIssue;
  guest: { id: string };
};

export const couponApi = {
  listPublicCoupons: () => apiClient<PublicCoupon[]>("/coupons"),
  claimGuestCoupon: (couponId: string, payload: GuestCouponClaimPayload) =>
    apiClient<GuestCouponClaimResponse>(`/coupons/${encodeURIComponent(couponId)}/guest-claims`, {
      data: payload,
    }),
  claimMemberCoupon: (couponId: string) =>
    apiClient<CouponIssue>(`/coupons/${encodeURIComponent(couponId)}/member-claims`, {
      data: {},
    }),
  listMemberCouponIssues: () => apiClient<CouponIssue[]>("/member/coupon-issues"),
};
