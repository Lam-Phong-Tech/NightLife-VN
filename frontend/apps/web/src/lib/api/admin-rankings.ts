import { apiClient } from "./client";
import type { RankingCategory, RankingCity, RankingTargetType } from "./rankings";

export type AdminRankingConfig = {
  id: string;
  targetType: RankingTargetType;
  targetId: string;
  targetName: string;
  targetSlug?: string | null;
  targetImage?: string | null;
  targetStatus?: string | null;
  targetCategory?: string | null;
  targetCity?: string | null;
  targetArea?: string | null;
  cityCode: RankingCity;
  areaId?: string | null;
  category?: string | null;
  scope: string;
  manualScore: number;
  pinRank?: number | null;
  sponsored: boolean;
  status: "ACTIVE" | "PAUSED" | "EXPIRED" | "DELETED";
  startsAt?: string | null;
  endsAt?: string | null;
  updatedAt: string;
};

export type AdminRankingTargetOption = {
  id: string;
  targetType: RankingTargetType;
  name: string;
  slug: string;
  image?: string | null;
  area?: string | null;
  city?: string | null;
  cityCode?: string | null;
  category: string;
  status: string;
};

export type AdminRankingFormPayload = {
  targetType: RankingTargetType;
  targetId: string;
  cityCode: RankingCity;
  category?: RankingCategory | "all" | null;
  scope?: string;
  pinRank?: number | null;
  manualScore?: number;
  sponsored?: boolean;
  status?: "ACTIVE" | "PAUSED" | "EXPIRED";
  startsAt?: string | null;
  endsAt?: string | null;
};

export type AdminRankingQuery = {
  targetType?: RankingTargetType;
  city?: RankingCity;
  category?: RankingCategory | "all";
  scope?: string;
};

const toParams = (params: Record<string, unknown>) => {
  const searchParams: Record<string, string> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams[key] = String(value);
  });

  return searchParams;
};

export const adminRankingsApi = {
  list: (query: AdminRankingQuery = {}) =>
    apiClient<AdminRankingConfig[]>("/admin/rankings", {
      params: toParams(query),
    }),
  options: (query: AdminRankingQuery & { q?: string; limit?: number } = {}) =>
    apiClient<AdminRankingTargetOption[]>("/admin/rankings/options", {
      params: toParams(query),
    }),
  create: (payload: AdminRankingFormPayload) =>
    apiClient<AdminRankingConfig>("/admin/rankings", {
      method: "POST",
      data: normalizePayload(payload),
    }),
  update: (id: string, payload: AdminRankingFormPayload) =>
    apiClient<AdminRankingConfig>(`/admin/rankings/${id}`, {
      method: "PATCH",
      data: normalizePayload(payload),
    }),
  delete: (id: string) =>
    apiClient<{ id: string; deleted: boolean }>(`/admin/rankings/${id}`, {
      method: "DELETE",
    }),
};

function normalizePayload(payload: AdminRankingFormPayload) {
  const result: any = { ...payload };
  if (result.category === "all") delete result.category;
  if (result.pinRank === undefined || result.pinRank === 0) delete result.pinRank;
  if (!result.startsAt) delete result.startsAt;
  if (!result.endsAt) delete result.endsAt;
  return result;
}
