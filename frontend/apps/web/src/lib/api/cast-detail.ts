import { apiClient, resolveClientUrl } from "./client";
import { getFallbackCastBySlug, type PublicArea, type PublicStore } from "./discovery";
import type { StoreSeoMetadata } from "./store-detail";
import { castGalleryForSlug, castImageForSlug, storeImageForSlug } from "../demo-media";

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
  styleTags?: string[];
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

const fallbackCastDetail = (slug: string): PublicCastDetail | null => {
  const cast = getFallbackCastBySlug(slug);

  if (!cast) return null;

  const displayName = cast.publicAlias ?? cast.name ?? cast.stageName;
  const thumbnailUrl = castImageForSlug(cast.slug);
  const storeThumbnailUrl = storeImageForSlug(cast.store.slug);

  return {
    id: cast.id,
    slug: cast.slug,
    stageName: cast.stageName,
    name: cast.name,
    publicAlias: cast.publicAlias,
    publicHeadline: cast.publicHeadline,
    publicBio:
      cast.publicHeadline ??
      `${displayName} dang hoat dong tai ${cast.store.name}, phu hop dat lich theo cast tren NightLife VN.`,
    monthOfBirth: null,
    zodiacSign: null,
    heightCm: null,
    measurements: null,
    interests: cast.tags,
    styleTags: cast.tags,
    tags: cast.tags,
    languages: cast.languages,
    hourlyRateVnd: cast.hourlyRateVnd,
    thumbnailUrl,
    gallery: castGalleryForSlug(cast.slug, displayName),
    relatedCasts: [],
    store: {
      ...cast.store,
      thumbnailUrl: storeThumbnailUrl,
      phone: null,
      mapUrl:
        typeof cast.store.latitude === "number" && typeof cast.store.longitude === "number"
          ? `https://maps.google.com/?q=${cast.store.latitude},${cast.store.longitude}`
          : null,
      googlePlaceId: null,
    },
    seo: {
      title: `${displayName} | NightLife VN`,
      description:
        cast.publicHeadline ?? `Xem profile, ngon ngu va gia tham khao cua ${displayName}.`,
      canonicalPath: `/casts/${cast.slug}`,
      ogImage: thumbnailUrl,
    },
  };
};

const normalizeCastGalleryItem = (item: CastGalleryItem): CastGalleryItem => ({
  ...item,
  url: resolveClientUrl(item.url) ?? item.url,
});

const normalizeRelatedCast = (cast: RelatedCast): RelatedCast => ({
  ...cast,
  thumbnailUrl: resolveClientUrl(cast.thumbnailUrl),
  store: {
    ...cast.store,
    thumbnailUrl: resolveClientUrl(cast.store.thumbnailUrl),
  },
});

const normalizeCastDetail = (cast: PublicCastDetail): PublicCastDetail => ({
  ...cast,
  thumbnailUrl: resolveClientUrl(cast.thumbnailUrl),
  gallery: cast.gallery.map(normalizeCastGalleryItem),
  relatedCasts: cast.relatedCasts.map(normalizeRelatedCast),
  store: {
    ...cast.store,
    thumbnailUrl: resolveClientUrl(cast.store.thumbnailUrl),
  },
  seo: {
    ...cast.seo,
    ogImage: resolveClientUrl(cast.seo.ogImage),
  },
});

export const getCastDetail = async (slug: string, options: RequestInit = {}) => {
  try {
    const cast = await apiClient<PublicCastDetail>(`/casts/${encodeURIComponent(slug)}`, {
      cache: "no-store",
      ...options,
    });

    return normalizeCastDetail(cast);
  } catch (error) {
    const fallback = fallbackCastDetail(slug);

    if (fallback) return normalizeCastDetail(fallback);

    throw error;
  }
};

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
