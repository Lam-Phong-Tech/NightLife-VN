import { apiClient, resolveClientUrl } from "./client";

export type StoreDetailMediaType = "IMAGE" | "VIDEO" | "DOCUMENT" | "OTHER";

export type StoreDetailArea = {
  id: string;
  code: string;
  name: string;
  city: string;
  cityCode?: string;
  district?: string | null;
  ward?: string | null;
};

export type StoreOpeningHour = {
  open?: string;
  close?: string;
  closed?: boolean;
  note?: string;
};

export type StoreHolidaySchedule = {
  note?: string;
  specialClosures?: Array<{
    date?: string;
    reason?: string;
    open?: string;
    close?: string;
  }>;
  [key: string]: unknown;
};

export type StoreGalleryItem = {
  id: string;
  type: StoreDetailMediaType;
  url: string;
  thumbnailUrl?: string | null;
  purpose?: string | null;
  mimeType?: string | null;
  alt?: string | null;
};

export type StoreDetailCast = {
  id: string;
  slug: string;
  stageName: string;
  publicAlias?: string | null;
  thumbnailUrl?: string | null;
  tags: string[];
  languages: string[];
  hourlyRateVnd?: number | null;
};

export type StorePriceItem = {
  label: string;
  amountVnd?: number | null;
  unit?: string | null;
  note?: string | null;
  group?: string | null;
  imageUrl?: string | null;
  tier?: number | null;
  hot?: boolean;
  displayPrice?: string | null;
};

export type StorePriceReference = {
  currency: string;
  startingFromVnd?: number | null;
  note?: string | null;
  items: StorePriceItem[];
};

export type StoreActiveCoupon = {
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
  usageLimit?: number | null;
  usedCount?: number | null;
};

export type StoreCampaign = {
  id: string;
  title: string;
  description?: string | null;
  source: "coupon";
  couponId: string;
};

export type RelatedStore = {
  id: string;
  slug: string;
  name: string;
  category: string;
  city: string;
  district?: string | null;
  area?: StoreDetailArea | null;
  thumbnailUrl?: string | null;
  relatedReason?: "same-area" | "same-category" | "same-city";
};

export type StoreSeoMetadata = {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string | null;
};

export type PublicStoreDetail = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description?: string | null;
  area?: StoreDetailArea | null;
  address?: string | null;
  city: string;
  cityCode?: string;
  district?: string | null;
  phone?: string | null;
  tags?: string[];
  latitude?: number | null;
  longitude?: number | null;
  mapUrl?: string | null;
  googlePlaceId?: string | null;
  openingHours?: Record<string, StoreOpeningHour> | null;
  holidaySchedule?: StoreHolidaySchedule | null;
  gallery: StoreGalleryItem[];
  casts: StoreDetailCast[];
  priceReference: StorePriceReference;
  activeCoupons: StoreActiveCoupon[];
  campaigns: StoreCampaign[];
  relatedStores: RelatedStore[];
  seo: StoreSeoMetadata;
  createdAt?: string;
  updatedAt?: string;
};

const normalizeStoreGalleryItem = (item: StoreGalleryItem): StoreGalleryItem => ({
  ...item,
  url: resolveClientUrl(item.url) ?? item.url,
  thumbnailUrl: resolveClientUrl(item.thumbnailUrl),
});

const normalizeStoreCast = (cast: StoreDetailCast): StoreDetailCast => ({
  ...cast,
  thumbnailUrl: resolveClientUrl(cast.thumbnailUrl),
});

const normalizeStorePriceReference = (priceReference: StorePriceReference): StorePriceReference => ({
  ...priceReference,
  items: priceReference.items.map((item) => ({
    ...item,
    imageUrl: resolveClientUrl(item.imageUrl),
  })),
});

const normalizeRelatedStore = (store: RelatedStore): RelatedStore => ({
  ...store,
  thumbnailUrl: resolveClientUrl(store.thumbnailUrl),
});

export const normalizeStoreDetail = (store: PublicStoreDetail): PublicStoreDetail => ({
  ...store,
  gallery: store.gallery.map(normalizeStoreGalleryItem),
  casts: store.casts.map(normalizeStoreCast),
  priceReference: normalizeStorePriceReference(store.priceReference),
  relatedStores: store.relatedStores.map(normalizeRelatedStore),
  seo: {
    ...store.seo,
    ogImage: resolveClientUrl(store.seo.ogImage),
  },
});

export const getStoreDetail = async (slug: string, options: RequestInit = {}) =>
  normalizeStoreDetail(await apiClient<PublicStoreDetail>(`/stores/${encodeURIComponent(slug)}`, {
    cache: "no-store",
    ...options,
  }));
