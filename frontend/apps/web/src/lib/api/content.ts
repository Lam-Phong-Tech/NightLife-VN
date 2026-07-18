import { apiClient } from "./client";

export type CmsContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "DELETED";
export type CmsContentType = "BLOG" | "POLICY" | "BANNER";

export type CmsContentItem = {
  id: string;
  title: string;
  slug: string;
  type: CmsContentType;
  status: CmsContentStatus;
  excerpt?: string | null;
  body?: string | null;
  metadata?: Record<string, unknown> | null;
  imageUrl?: string | null;
  noindex?: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    displayName?: string | null;
    email: string;
  } | null;
  store?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  media?: Array<{
    id: string;
    url: string;
    purpose?: string | null;
    type?: string | null;
    access?: string | null;
    status?: string | null;
  }>;
};

export type CmsContentListResponse = {
  data: CmsContentItem[];
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const cleanString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

export const getCmsContentImageUrl = (content: CmsContentItem) => {
  const metadata = asRecord(content.metadata) ?? {};
  const seo = asRecord(metadata.seo) ?? {};
  const mediaCover =
    content.media?.find((item) => item.purpose?.trim().toUpperCase() === "BLOG_COVER" && cleanString(item.url))
      ?.url ??
    content.media?.find((item) => cleanString(item.url))?.url ??
    null;

  return (
    cleanString(content.imageUrl) ??
    cleanString(metadata.image) ??
    cleanString(metadata.imageUrl) ??
    cleanString(metadata.thumbnailUrl) ??
    cleanString(metadata.coverImage) ??
    cleanString(metadata.coverUrl) ??
    cleanString(metadata.posterUrl) ??
    cleanString(seo.ogImage) ??
    cleanString(mediaCover)
  );
};

export type PublicCmsContentListParams = {
  type?: CmsContentType;
  q?: string;
  limit?: number;
};

export type AdminCmsContentListParams = PublicCmsContentListParams & {
  status?: CmsContentStatus;
};

export type PublicHotVideo = {
  id: string;
  url: string;
  title?: string | null;
  thumbnailUrl?: string | null;
  storeName?: string | null;
  storeSlug?: string | null;
  storeThumbnailUrl?: string | null;
  href?: string | null;
  createdAt?: string;
  viewCount?: number;
  likeCount?: number;
};

export type PublicHomeRecommendation = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description?: string | null;
  city: string;
  cityCode?: string;
  district?: string | null;
  area?: {
    id: string;
    code: string;
    name: string;
    city: string;
    district?: string | null;
    cityCode?: string;
  } | null;
  thumbnailUrl?: string | null;
  href: string;
  score: number;
  reason: string;
  signals?: {
    viewCount?: number;
    bookingCount?: number;
    hasActiveCoupon?: boolean;
  };
  activeCoupon?: {
    id: string;
    name: string;
    discountType: string;
    discountValue: number;
  } | null;
};

export type PublicTourItem = {
  id: string;
  title: string;
  subtitle: string;
  cityCode: "all" | "hn" | "hcm" | string;
  area: string;
  durationHours: number;
  priceFromVnd: number;
  href: string;
  thumbnailUrl?: string | null;
  stops: Array<{
    order: number;
    id: string;
    name: string;
    slug: string;
    category: string;
    description?: string | null;
    city: string;
    district?: string | null;
    area?: {
      id: string;
      code: string;
      name: string;
      city: string;
      district?: string | null;
      cityCode?: string;
    } | null;
    thumbnailUrl?: string | null;
    href: string;
    activeCouponName?: string | null;
  }>;
};

export type PublicHomeContentParams = {
  cityCode?: "all" | "hn" | "hcm" | string;
  categories?: string;
  storeSlugs?: string;
  limit?: number;
};

export type PublicHotVideoMetric = {
  recorded: boolean;
  mediaId: string;
  viewCount: number;
  likeCount: number;
};

const toParams = (params: PublicCmsContentListParams | AdminCmsContentListParams = {}) => {
  const searchParams: Record<string, string> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams[key] = String(value);
  });

  return searchParams;
};

const toHomeContentParams = (params: PublicHomeContentParams = {}) => {
  const searchParams: Record<string, string> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams[key] = String(value);
  });

  return searchParams;
};

export const contentApi = {
  list: (params?: PublicCmsContentListParams) =>
    apiClient<CmsContentListResponse>("/contents", { params: toParams(params) }),
  get: (slug: string, params?: Record<string, string>) => {
    const searchParams = new URLSearchParams(params || {});
    const queryString = searchParams.toString();
    return apiClient<CmsContentItem>(`/contents/${encodeURIComponent(slug)}${queryString ? `?${queryString}` : ''}`);
  },
  hotVideos: (cityCode: "all" | "hn" | "hcm") =>
    apiClient<PublicHotVideo[]>(`/content/hot-videos/${encodeURIComponent(cityCode)}`),
  recommendations: (params?: PublicHomeContentParams) =>
    apiClient<PublicHomeRecommendation[]>("/content/recommendations", {
      params: toHomeContentParams(params),
    }),
  tours: (params?: PublicHomeContentParams) =>
    apiClient<PublicTourItem[]>("/content/tours", {
      params: toHomeContentParams(params),
    }),
  trackHotVideoView: (
    mediaId: string,
    payload?: { source?: string; surface?: string; anonymousId?: string; storeSlug?: string | null },
  ) =>
    apiClient<PublicHotVideoMetric>(`/content/hot-videos/${encodeURIComponent(mediaId)}/view`, {
      method: "POST",
      data: payload ?? {},
    }),
  trackHotVideoLike: (
    mediaId: string,
    payload?: { source?: string; surface?: string; anonymousId?: string; storeSlug?: string | null },
  ) =>
    apiClient<PublicHotVideoMetric>(`/content/hot-videos/${encodeURIComponent(mediaId)}/like`, {
      method: "POST",
      data: payload ?? {},
    }),
  adminList: (params?: AdminCmsContentListParams) =>
    apiClient<CmsContentItem[]>("/admin/contents", { params: toParams(params) }),
  adminCreate: (payload: Partial<CmsContentItem>) =>
    apiClient<CmsContentItem>("/admin/contents", { method: "POST", data: payload }),
  adminUpdate: (id: string, payload: Partial<CmsContentItem>) =>
    apiClient<CmsContentItem>(`/admin/contents/${encodeURIComponent(id)}`, {
      method: "PATCH",
      data: payload,
    }),
  adminDelete: (id: string) =>
    apiClient<CmsContentItem>(`/admin/contents/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
};
