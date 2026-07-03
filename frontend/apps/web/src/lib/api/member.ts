import { apiClient } from "./client";

export type MemberPointLedgerType = "EARN" | "REDEEM" | "ADJUST" | "REVERSE" | "EXPIRE";

export type MemberPointLedgerEntry = {
  id: string;
  type: MemberPointLedgerType | string;
  billId?: string | null;
  bookingId?: string | null;
  amountVnd: number;
  points: number;
  description?: string | null;
  expiresAt?: string | null;
  postedAt?: string | null;
  createdAt: string;
};

export type MemberPointSummary = {
  availablePoints: number;
  earnedPoints: number;
  spentPoints: number;
  expiredPoints: number;
  expiringSoonPoints: number;
  nextTierName: string;
  nextTierThreshold: number;
  pointsToNextTier: number;
  progressPercent: number;
  asOf: string;
  recentLedgers: MemberPointLedgerEntry[];
};

export const memberApi = {
  getPointSummary: () => apiClient<MemberPointSummary>("/member/points/summary"),
};
