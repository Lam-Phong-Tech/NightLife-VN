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
};

export type CmsContentListResponse = {
  data: CmsContentItem[];
};

export type CmsContentListParams = {
  type?: CmsContentType;
  status?: CmsContentStatus;
  q?: string;
  limit?: number;
};

export type PublicHotVideo = {
  id: string;
  url: string;
  title?: string | null;
  storeName?: string | null;
  storeSlug?: string | null;
  href?: string | null;
  createdAt?: string;
};

const toParams = (params: CmsContentListParams = {}) => {
  const searchParams: Record<string, string> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams[key] = String(value);
  });

  return searchParams;
};

export const contentApi = {
  list: (params?: CmsContentListParams) =>
    apiClient<CmsContentListResponse>("/contents", { params: toParams(params) }),
  get: (slug: string, params?: Record<string, string>) => {
    const searchParams = new URLSearchParams(params || {});
    const queryString = searchParams.toString();
    return apiClient<CmsContentItem>(`/contents/${encodeURIComponent(slug)}${queryString ? `?${queryString}` : ''}`);
  },
  hotVideos: (cityCode: "all" | "hn" | "hcm") =>
    apiClient<PublicHotVideo[]>(`/content/hot-videos/${encodeURIComponent(cityCode)}`),
  adminList: (params?: CmsContentListParams) =>
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
