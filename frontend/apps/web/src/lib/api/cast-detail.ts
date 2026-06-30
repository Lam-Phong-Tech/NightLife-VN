import { apiClient } from "./client";
import type { PublicArea, PublicStore } from "./discovery";
import type { StoreSeoMetadata } from "./store-detail";

export type CastDetailMediaType = "IMAGE" | "VIDEO" | "DOCUMENT" | "OTHER";

export type CastGalleryItem = {
  id: string;
  type: CastDetailMediaType;
  url: string;
  purpose?: string | null;
  mimeType?: string | null;
  alt?: string | null;
};

export type CastDetailStore = PublicStore & {
  phone?: string | null;
  mapUrl?: string | null;
  googlePlaceId?: string | null;
};

export type RelatedCastReason = "same-store" | "same-area" | "same-tag";

export type RelatedCast = {
  id: string;
  slug: string;
  stageName: string;
  name: string;
  publicAlias?: string | null;
  publicHeadline?: string | null;
  tags: string[];
  languages: string[];
  hourlyRateVnd?: number | null;
  thumbnailUrl?: string | null;
  relatedReason: RelatedCastReason;
  store: PublicStore;
};

export type CastFavoriteState = {
  castId: string;
  castSlug: string;
  favorited: boolean;
};

export type MemberFavoriteCast = {
  favoriteId: string;
  favoritedAt: string;
  cast: RelatedCast;
};

export type PublicCastDetail = {
  id: string;
  slug: string;
  stageName: string;
  name: string;
  publicAlias?: string | null;
  publicHeadline?: string | null;
  publicBio?: string | null;
  monthOfBirth?: number | null;
  zodiacSign?: string | null;
  heightCm?: number | null;
  measurements?: string | null;
  interests: string[];
  tags: string[];
  languages: string[];
  hourlyRateVnd?: number | null;
  thumbnailUrl?: string | null;
  gallery: CastGalleryItem[];
  relatedCasts: RelatedCast[];
  store: CastDetailStore & {
    area?: PublicArea | null;
  };
  seo: StoreSeoMetadata;
};

export type PublicCastDetailResponse = PublicCastDetail;

export const getCastDetail = (slug: string, options: RequestInit = {}) =>
  apiClient<PublicCastDetail>(`/casts/${encodeURIComponent(slug)}`, {
    cache: "no-store",
    ...options,
  });

export const castFavoriteApi = {
  getState: (slug: string) =>
    apiClient<CastFavoriteState>(`/member/favorite-casts/${encodeURIComponent(slug)}`),
  favorite: (slug: string) =>
    apiClient<CastFavoriteState>(`/member/favorite-casts/${encodeURIComponent(slug)}`, {
      method: "POST",
    }),
  unfavorite: (slug: string) =>
    apiClient<CastFavoriteState>(`/member/favorite-casts/${encodeURIComponent(slug)}`, {
      method: "DELETE",
    }),
  list: () => apiClient<MemberFavoriteCast[]>("/member/favorite-casts"),
};
