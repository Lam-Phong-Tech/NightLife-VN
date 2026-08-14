import { apiClient, resolveClientUrl } from "./client";
import type { PublicResponsiveImage } from "./content";

export type RankingTargetType = "CAST" | "STORE";
export type RankingCity = string;
export type RankingCategory =
  | "bar"
  | "club"
  | "lounge"
  | "girls_bar"
  | "karaoke"
  | "massage_spa"
  | "restaurant"
  | "casino";

export type PublicRankingItem = {
  rank: number;
  targetType: RankingTargetType;
  targetId: string;
  name: string;
  slug: string;
  image?: string | null;
  responsiveImage?: PublicResponsiveImage | null;
  area?: string | null;
  city: string;
  cityCode?: string;
  category: string;
  sponsored: boolean;
  pinRank?: number | null;
  manualScore: number;
  href: string;
  phone?: string | null;
};

export type PublicRankingResponse = {
  data: PublicRankingItem[];
  meta: {
    targetType: RankingTargetType;
    city: RankingCity;
    category?: string | null;
    scope?: string;
    limit: number;
    total: number;
  };
};

export type RankingParams = {
  targetType?: RankingTargetType;
  city?: RankingCity;
  category?: RankingCategory | string;
  scope?: string;
  limit?: number;
};

const toParams = (params: RankingParams) => {
  const searchParams: Record<string, string> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    searchParams[key] = String(value);
  });

  return searchParams;
};

const normalizeRankingItem = (item: PublicRankingItem): PublicRankingItem => ({
  ...item,
  image: resolveClientUrl(item.image),
  responsiveImage: item.responsiveImage
    ? {
        ...item.responsiveImage,
        src: resolveClientUrl(item.responsiveImage.src) ?? item.responsiveImage.src,
        variants: item.responsiveImage.variants.map((variant) => ({
          ...variant,
          webpUrl: resolveClientUrl(variant.webpUrl) ?? variant.webpUrl,
          avifUrl: variant.avifUrl
            ? (resolveClientUrl(variant.avifUrl) ?? variant.avifUrl)
            : undefined,
        })),
      }
    : item.responsiveImage,
});

export const rankingsApi = {
  list: async (params: RankingParams = {}, options: RequestInit = {}) => {
    const response = await apiClient<PublicRankingResponse>("/rankings", {
      ...options,
      params: toParams(params),
    });

    return {
      ...response,
      data: response.data.map(normalizeRankingItem),
    };
  },
};
