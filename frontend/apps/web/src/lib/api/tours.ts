import { apiClient, resolveClientUrl } from "./client";
import type { TourDepartureSchedule } from "@/lib/tour-departure-schedule";

export type TourArea = {
  id: string;
  code: string;
  name: string;
  city: string;
  district?: string | null;
  ward?: string | null;
};

export type TourStoreMedia = {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  purpose?: string | null;
  alt?: string | null;
};

export type TourStoreCoupon = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  discountType: "PERCENT" | "FIXED_AMOUNT";
  discountValue: number;
  maxDiscountVnd?: number | null;
  minSpendVnd?: number | null;
};

export type TourStoreCast = {
  id: string;
  stageName: string;
  slug: string;
  publicAlias?: string | null;
  thumbnailUrl?: string | null;
  media?: TourStoreMedia[];
  zodiacSign?: string | null;
  heightCm?: number | null;
  languages: string[];
  tags: string[];
};

export type TourStopStore = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description?: string | null;
  address?: string | null;
  city: string;
  district?: string | null;
  openingHours?: Record<string, unknown> | null;
  pricingInfo?: Record<string, unknown> | null;
  area?: TourArea | null;
  media: TourStoreMedia[];
  coupons: TourStoreCoupon[];
  casts: TourStoreCast[];
};

export type PublicTourStop = {
  id: string;
  tourId: string;
  storeId: string;
  order: number;
  createdAt?: string;
  store: TourStopStore;
};

export type PublicTour = {
  id: string;
  title: string;
  subtitle?: string | null;
  city: string;
  durationHours: number;
  priceTier: number;
  coverUrl?: string | null;
  status: "ACTIVE" | "HIDDEN" | "DELETED";
  homeRank?: number | null;
  departureTimes: string[];
  departureSchedule?: TourDepartureSchedule | null;
  stops: PublicTourStop[];
  createdAt?: string;
  updatedAt?: string;
};

export type PublicTourListResponse = {
  data: PublicTour[];
  total: number;
  page: number;
  limit: number;
};

export type PublicTourListParams = {
  city?: string;
  page?: number;
  limit?: number;
};

const normalizeMedia = (media: TourStoreMedia): TourStoreMedia => ({
  ...media,
  url: resolveClientUrl(media.url) ?? media.url,
  thumbnailUrl: resolveClientUrl(media.thumbnailUrl),
});

const normalizeCast = (cast: TourStoreCast): TourStoreCast => ({
  ...cast,
  thumbnailUrl: resolveClientUrl(cast.thumbnailUrl) ?? resolveClientUrl(cast.media?.[0]?.url),
  media: cast.media?.map(normalizeMedia),
});

export const normalizeTour = (tour: PublicTour): PublicTour => ({
  ...tour,
  coverUrl: resolveClientUrl(tour.coverUrl),
  stops: tour.stops.map((stop) => ({
    ...stop,
    store: {
      ...stop.store,
      media: stop.store.media.map(normalizeMedia),
      casts: stop.store.casts.map(normalizeCast),
    },
  })),
});

const cleanParams = (params: PublicTourListParams = {}) =>
  Object.fromEntries(
    Object.entries(params).filter((entry): entry is [string, string | number] =>
      entry[1] !== undefined && entry[1] !== null && entry[1] !== "",
    ),
  );

export const tourApi = {
  list: async (params?: PublicTourListParams) => {
    const response = await apiClient<PublicTourListResponse>("/tours", {
      params: cleanParams(params),
    });

    return {
      ...response,
      data: response.data.map(normalizeTour),
    };
  },
  get: async (id: string) => normalizeTour(await apiClient<PublicTour>(`/tours/${encodeURIComponent(id)}`)),
};
