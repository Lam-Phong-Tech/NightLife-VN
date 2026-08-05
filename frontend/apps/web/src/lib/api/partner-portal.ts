import { apiClient } from "./client";

export type PartnerActivityType =
  | "ALL"
  | "COUPON_USAGE"
  | "BILL_PAYMENT"
  | "BOOKING_CHECKIN";

export interface PartnerActivityQueryParams {
  limit?: number;
  cursor?: string;
  type?: PartnerActivityType;
  startDate?: string;
  endDate?: string;
  search?: string;
  storeId?: string;
}

export interface PartnerActivityLinkedEntities {
  bookingId?: string | null;
  couponIssueId?: string | null;
  billId?: string | null;
}

export interface PartnerActivityItem {
  id: string;
  rawId: string;
  sourceType: "BILL" | "COUPON_ISSUE" | "BOOKING";
  activityType: "COUPON_USAGE" | "BILL_PAYMENT" | "BOOKING_CHECKIN";
  activityAt: string;
  storeId: string;
  storeName: string;
  storeAddress?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customerTier?: string | null;
  summary: string;
  totalVnd?: number | null;
  discountVnd?: number | null;
  couponCode?: string | null;
  billNumber?: string | null;
  bookingCode?: string | null;
  status: string;
  statusLabel?: string;
  badgeTone?: "success" | "warning" | "danger" | "info";
  linkedEntities?: PartnerActivityLinkedEntities;

  // Detailed properties
  subtotalVnd?: number | null;
  serviceChargeVnd?: number | null;
  taxVnd?: number | null;
  paidVnd?: number | null;
  partySize?: number | null;
  rejectReason?: string | null;
  discountRuleSnapshot?: Record<string, unknown> | null;
  booking?: {
    id: string;
    bookingCode: string;
    scheduledAt: string;
    partySize?: number | null;
  } | null;
  bill?: {
    id: string;
    billNumber?: string | null;
    totalVnd?: number | null;
  } | null;
  reviewedBy?: { id: string; name: string } | null;
  scannedBy?: { id: string; name: string } | null;
  title?: string;
  createdAt?: string;
}

export interface PartnerActivityResponse {
  data: PartnerActivityItem[];
  items?: PartnerActivityItem[];
  nextCursor: string | null;
  hasMore: boolean;
  meta?: {
    nextCursor: string | null;
    total?: number;
  };
}

export interface PartnerHomeMetrics {
  totalRevenueVnd: number;
  billCount: number;
  bookingCount: number;
  activeCouponsCount: number;
}

export interface PartnerHomeOverview {
  metrics: PartnerHomeMetrics;
  recentActivities: PartnerActivityItem[];
}

export async function fetchPartnerHome(
  storeId?: string,
  signal?: AbortSignal,
): Promise<PartnerHomeOverview> {
  return apiClient<PartnerHomeOverview>("/partner/home", {
    params: { storeId: storeId || undefined },
    signal,
  });
}

export async function fetchPartnerActivities(
  params: PartnerActivityQueryParams = {},
  signal?: AbortSignal,
): Promise<PartnerActivityResponse> {
  const res = await apiClient<PartnerActivityResponse>("/partner/activity", {
    params: {
      limit: params.limit,
      cursor: params.cursor,
      type: params.type && params.type !== "ALL" ? params.type : undefined,
      startDate: params.startDate,
      endDate: params.endDate,
      search: params.search?.trim() || undefined,
      storeId: params.storeId || undefined,
    },
    signal,
  });

  const dataItems = res.data || res.items || [];
  const nextCursor = res.nextCursor ?? res.meta?.nextCursor ?? null;
  const hasMore = typeof res.hasMore === "boolean" ? res.hasMore : Boolean(nextCursor);

  return {
    data: dataItems,
    items: dataItems,
    nextCursor,
    hasMore,
    meta: {
      nextCursor,
      total: dataItems.length,
    },
  };
}

export async function fetchPartnerActivityDetail(
  activityId: string,
  storeId?: string,
  signal?: AbortSignal,
): Promise<PartnerActivityItem> {
  return apiClient<PartnerActivityItem>(
    `/partner/activity/${encodeURIComponent(activityId)}`,
    {
      params: { storeId: storeId || undefined },
      signal,
    },
  );
}

export const partnerPortalApi = {
  fetchPartnerHome,
  fetchPartnerActivities,
  fetchPartnerActivityDetail,
  getActivityFeed: fetchPartnerActivities,
};
