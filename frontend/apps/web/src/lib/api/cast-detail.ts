import { ApiError, apiClient } from "./client";
import { discoveryApi, type PublicArea, type PublicCast, type PublicStore } from "./discovery";
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

const fallbackGallery = [
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
];

const legacyFallbackSlugAliases: Record<string, string[]> = {
  "aya-velvet": ["aiko"],
  "hana-sakura-lounge": ["hana"],
  "miyuki-moonlight": ["michi"],
  "rina-velvet": ["rina"],
  "yuki-sakura-lounge": ["yuki"],
  "kotone-tokyo": ["kotone-tokyo-kitchen"],
  "sakura-moonlight": ["sakura-moonlight-q1"],
  "yuna-neon": ["yuna-neon-district"],
  "mai-golden": ["mika-golden-ktv"],
  "misaki-crimson": ["linh-crimson-bar"],
  "sumi-opera-spa": ["sumi-lotus-massage-spa"],
};

const normalizeSlug = (value: string) => value.trim().toLowerCase();

const slugMatches = (candidateSlug: string, requestedSlug: string) => {
  const candidate = normalizeSlug(candidateSlug);
  const requested = normalizeSlug(requestedSlug);

  if (candidate === requested) {
    return true;
  }

  return Object.entries(legacyFallbackSlugAliases).some(
    ([canonical, aliases]) =>
      (canonical === candidate && aliases.includes(requested)) ||
      (canonical === requested && aliases.includes(candidate)),
  );
};

const buildFallbackBio = (cast: PublicCast) => {
  const name = cast.publicAlias ?? cast.name ?? cast.stageName;
  const languages = cast.languages.length
    ? cast.languages.map((item) => item.toUpperCase()).join(", ")
    : "VI";
  const tags = cast.tags.slice(0, 3).join(", ");

  return [
    cast.publicHeadline,
    `${name} đang hoạt động tại ${cast.store.name}.`,
    tags ? `Phong cách phù hợp: ${tags}.` : null,
    `Ngôn ngữ hỗ trợ: ${languages}.`,
  ]
    .filter(Boolean)
    .join(" ");
};

const mapFallbackDetail = (
  cast: PublicCast,
  requestedSlug: string,
  relatedCasts: PublicCast[],
): PublicCastDetail => {
  const name = cast.publicAlias ?? cast.name ?? cast.stageName;
  const imageSeed = Math.abs(
    [...cast.slug].reduce((total, char) => total + char.charCodeAt(0), 0),
  );
  const galleryUrls = [
    cast.thumbnailUrl,
    ...fallbackGallery.slice(imageSeed % fallbackGallery.length),
    ...fallbackGallery.slice(0, imageSeed % fallbackGallery.length),
  ].filter(Boolean) as string[];
  const gallery = galleryUrls.slice(0, 6).map((url, index) => ({
    id: `${cast.id}-fallback-${index}`,
    type: "IMAGE" as const,
    url,
    purpose: index === 0 ? "profile" : "gallery",
    mimeType: "image/jpeg",
    alt: `${name} gallery ${index + 1}`,
  }));
  const area = cast.store.area ?? null;
  const cityCode = cast.store.cityCode ?? area?.cityCode ?? "";

  return {
    id: cast.id,
    slug: requestedSlug,
    stageName: cast.stageName,
    name,
    publicAlias: cast.publicAlias,
    publicHeadline: cast.publicHeadline,
    publicBio: buildFallbackBio(cast),
    monthOfBirth: null,
    zodiacSign: null,
    heightCm: null,
    measurements: null,
    interests: cast.tags,
    tags: cast.tags,
    languages: cast.languages,
    hourlyRateVnd: cast.hourlyRateVnd ?? null,
    thumbnailUrl: gallery[0]?.url ?? null,
    gallery,
    relatedCasts: relatedCasts
      .filter((item) => item.id !== cast.id)
      .slice(0, 8)
      .map((item) => ({
        ...item,
        relatedReason:
          item.store.id === cast.store.id
            ? "same-store"
            : item.store.area?.id && item.store.area.id === cast.store.area?.id
              ? "same-area"
              : "same-tag",
      })),
    store: {
      ...cast.store,
      cityCode,
      area,
      phone: null,
      mapUrl: null,
      googlePlaceId: null,
    },
    seo: {
      title: `${name} tại ${cast.store.name} | NightLife VN`,
      description: buildFallbackBio(cast).slice(0, 170),
      canonicalPath: `/casts/${requestedSlug}`,
      ogImage: gallery[0]?.url ?? null,
    },
  };
};

const getFallbackCastDetail = async (slug: string) => {
  const casts = await discoveryApi.listCasts({ limit: 100 });
  const cast = casts.find((item) => slugMatches(item.slug, slug));

  return cast ? mapFallbackDetail(cast, normalizeSlug(slug), casts) : null;
};

export const getCastDetail = async (slug: string, options: RequestInit = {}) => {
  try {
    return await apiClient<PublicCastDetail>(`/casts/${encodeURIComponent(slug)}`, {
      cache: "no-store",
      ...options,
    });
  } catch (error) {
    const fallback = await getFallbackCastDetail(slug).catch(() => null);

    if (fallback) {
      return fallback;
    }

    if (error instanceof ApiError) {
      throw error;
    }

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
