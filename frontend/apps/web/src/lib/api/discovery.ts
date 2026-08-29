import { apiClient, resolveClientUrl } from "./client";
import type { StoreActiveCoupon, StoreOpeningHour, StorePriceReference } from "./store-detail";
import { castImageForSlug, storeImageForSlug } from "../demo-media";

export type DiscoverySort = "newest" | "nearest" | "priority";

export type DiscoveryParams = {
  q?: string;
  city?: string;
  area?: string;
  category?: string;
  language?: string;
  tag?: string;
  storeSlug?: string;
  lat?: number;
  lng?: number;
  limit?: number;
  page?: number;
  offset?: number;
  sort?: DiscoverySort;
  hasActiveCoupon?: boolean;
};

export type PublicDiscoveryMeta = {
  total: number;
  page: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  sort: DiscoverySort;
};

export type PublicDiscoveryListResponse<T> = {
  data: T[];
  meta: PublicDiscoveryMeta;
};

export type PublicArea = {
  id: string;
  code: string;
  name: string;
  city: string;
  cityCode?: string;
  district?: string | null;
  ward?: string | null;
};

export type PublicStore = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description?: string | null;
  descriptionJa?: string | null;
  address?: string | null;
  streetName?: string | null;
  streetNameJa?: string | null;
  city: string;
  cityCode?: string;
  district?: string | null;
  ward?: string | null;
  tags?: string[];
  area?: PublicArea | null;
  latitude?: number | null;
  longitude?: number | null;
  thumbnailUrl?: string | null;
  openingHours?: Record<string, StoreOpeningHour> | null;
  priceReference?: StorePriceReference | null;
  activeCoupon?: StoreActiveCoupon | null;
  distanceKm?: number | null;
};

export type PublicCast = {
  id: string;
  slug: string;
  stageName: string;
  name: string;
  publicAlias?: string | null;
  isPublic?: boolean | null;
  status?: string | null;
  tags: string[];
  languages: string[];
  hourlyRateVnd?: number | null;
  thumbnailUrl?: string | null;
  distanceKm?: number | null;
  store: PublicStore;
};

const toParams = (params: DiscoveryParams = {}) => {
  const searchParams: Record<string, string> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams[key] = String(value);
  });

  return searchParams;
};

const demoAreas: PublicArea[] = [];

const areaByCode = new Map(demoAreas.map((area) => [area.code, area]));

const buildStore = (
  store: Omit<PublicStore, "area" | "distanceKm"> & { areaCode: string },
): PublicStore => {
  const { areaCode, ...storeFields } = store;

  return {
    ...storeFields,
    thumbnailUrl: storeImageForSlug(storeFields.slug),
    area: areaByCode.get(areaCode) ?? null,
    distanceKm: null,
  };
};

const demoStores: PublicStore[] = [];

const storeBySlug = new Map(demoStores.map((store) => [store.slug, store]));
const demoActiveCouponStoreSlugs = new Set<string>();
const demoPrioritySlugs = new Map<string, number>();

const demoCasts: PublicCast[] = [];

const demoCastSlugAliases: Record<string, string> = {
  "kotone-tokyo": "kotone-tokyo-kitchen",
  "sakura-moonlight": "sakura-moonlight-q1",
  "yuna-neon": "yuna-neon-district",
};

export const getFallbackCastBySlug = (slug: string) => {
  const normalizedSlug = normalize(slug);
  const aliasSlug = demoCastSlugAliases[normalizedSlug] ?? normalizedSlug;

  return demoCasts.find((cast) => normalize(cast.slug) === aliasSlug) ?? null;
};

const normalize = (value: string | number | null | undefined) =>
  String(value ?? "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

type DiscoveryParamsWithCoordinates = DiscoveryParams &
  Required<Pick<DiscoveryParams, "lat" | "lng">>;

const hasCoordinates = (params: DiscoveryParams): params is DiscoveryParamsWithCoordinates =>
  typeof params.lat === "number" &&
  typeof params.lng === "number" &&
  Number.isFinite(params.lat) &&
  Number.isFinite(params.lng);

const matchesQuery = (
  query: string | undefined,
  values: Array<string | number | null | undefined>,
) => {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return true;
  }

  return values.some((value) => normalize(value).includes(normalizedQuery));
};

const matchesCity = (
  city: string | undefined,
  item: Pick<PublicStore | PublicArea, "city" | "cityCode">,
) => {
  const normalizedCity = normalize(city);

  if (!normalizedCity || normalizedCity === "all") {
    return true;
  }

  return [item.cityCode, item.city].some((value) => normalize(value) === normalizedCity);
};

const matchesCategory = (category: string | undefined, store: PublicStore) => {
  const normalizedCategory = normalize(category);

  return !normalizedCategory || normalize(store.category) === normalizedCategory;
};

const matchesArea = (area: string | undefined, store: PublicStore) => {
  const normalizedArea = normalize(area);

  if (!normalizedArea) {
    return true;
  }

  return [store.area?.code, store.area?.name, store.district].some(
    (value) => normalize(value) === normalizedArea,
  );
};

const matchesLanguage = (language: string | undefined, cast: PublicCast) => {
  const normalizedLanguage = normalize(language);

  return (
    !normalizedLanguage || cast.languages.some((item) => normalize(item) === normalizedLanguage)
  );
};

const matchesTag = (tag: string | undefined, cast: PublicCast) => {
  const normalizedTag = normalize(tag);

  return !normalizedTag || cast.tags.some((item) => normalize(item) === normalizedTag);
};

const matchesStoreSlug = (storeSlug: string | undefined, store: PublicStore) => {
  const normalizedStoreSlug = normalize(storeSlug);

  return !normalizedStoreSlug || normalize(store.slug) === normalizedStoreSlug;
};

const distanceKm = (from: Required<Pick<DiscoveryParams, "lat" | "lng">>, store: PublicStore) => {
  if (typeof store.latitude !== "number" || typeof store.longitude !== "number") {
    return null;
  }

  const earthRadiusKm = 6371;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const dLat = toRadians(store.latitude - from.lat);
  const dLng = toRadians(store.longitude - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(store.latitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const withStoreDistance = (store: PublicStore, params: DiscoveryParams): PublicStore => {
  if (!hasCoordinates(params)) {
    return { ...store, distanceKm: null };
  }

  return {
    ...store,
    distanceKm: distanceKm({ lat: params.lat, lng: params.lng }, store),
  };
};

const sortStores = (stores: PublicStore[], params: DiscoveryParams) =>
  [...stores].sort((left, right) => {
    if (params.sort === "priority") {
      const leftPriority = demoPrioritySlugs.get(left.slug) ?? Number.POSITIVE_INFINITY;
      const rightPriority = demoPrioritySlugs.get(right.slug) ?? Number.POSITIVE_INFINITY;

      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }
    }

    if (params.sort === "nearest" || hasCoordinates(params)) {
      const leftDistance =
        typeof left.distanceKm === "number" ? left.distanceKm : Number.POSITIVE_INFINITY;
      const rightDistance =
        typeof right.distanceKm === "number" ? right.distanceKm : Number.POSITIVE_INFINITY;

      if (leftDistance !== rightDistance) {
        return leftDistance - rightDistance;
      }
    }

    return left.name.localeCompare(right.name);
  });

export type PublicDiscoveryStoreListResponse = {
  stores: PublicStore[];
  total: number;
  page: number;
  limit: number;
  meta: PublicDiscoveryMeta;
};

export type PublicDiscoveryCastListResponse = {
  casts: PublicCast[];
  total: number;
  page: number;
  limit: number;
  meta: PublicDiscoveryMeta;
};

const paginateItems = <T>(items: T[], params: DiscoveryParams = {}) => {
  const limit =
    typeof params.limit === "number" && Number.isFinite(params.limit) && params.limit > 0
      ? params.limit
      : items.length;
  const offset =
    typeof params.offset === "number" && Number.isFinite(params.offset) && params.offset >= 0
      ? params.offset
      : typeof params.page === "number" && Number.isFinite(params.page) && params.page > 1
        ? (params.page - 1) * limit
        : 0;

  return items.slice(offset, offset + limit);
};

const getFallbackAreas = (params: Pick<DiscoveryParams, "city"> = {}) =>
  demoAreas.filter((area) => matchesCity(params.city, area));

const getFallbackStores = (params: DiscoveryParams = {}): PublicDiscoveryStoreListResponse => {
  const stores = demoStores
    .filter((store) => matchesCity(params.city, store))
    .filter((store) => matchesCategory(params.category, store))
    .filter((store) => matchesArea(params.area, store))
    .filter((store) => !params.hasActiveCoupon || demoActiveCouponStoreSlugs.has(store.slug))
    .filter((store) =>
      matchesQuery(params.q, [
        store.name,
        store.slug,
        store.category,
        store.description,
        store.address,
        store.city,
        store.cityCode,
        store.district,
        store.area?.name,
        store.area?.code,
      ]),
    )
    .map((store) => withStoreDistance(store, params));

  const sorted = sortStores(stores, params);
  const total = sorted.length;
  const paged = paginateItems(sorted, params);
  const limit =
    typeof params.limit === "number" && Number.isFinite(params.limit) && params.limit > 0
      ? params.limit
      : total;
  const page =
    typeof params.page === "number" && Number.isFinite(params.page) && params.page > 0
      ? params.page
      : 1;
  const offset = (page - 1) * limit;

  return {
    stores: paged,
    total,
    page,
    limit,
    meta: {
      total,
      page,
      limit,
      offset,
      hasMore: offset + paged.length < total,
      sort: params.sort ?? "priority",
    },
  };
};

const getFallbackCasts = (params: DiscoveryParams = {}): PublicDiscoveryCastListResponse => {
  const allCasts = demoCasts
    .filter((cast) => matchesCity(params.city, cast.store))
    .filter((cast) => matchesCategory(params.category, cast.store))
    .filter((cast) => matchesArea(params.area, cast.store))
    .filter((cast) => matchesStoreSlug(params.storeSlug, cast.store))
    .filter((cast) => !params.hasActiveCoupon || demoActiveCouponStoreSlugs.has(cast.store.slug))
    .filter((cast) => matchesLanguage(params.language, cast))
    .filter((cast) => matchesTag(params.tag, cast))
    .filter((cast) =>
      matchesQuery(params.q, [
        cast.name,
        cast.stageName,
        cast.publicAlias,
        cast.tags.join(" "),
        cast.languages.join(" "),
        cast.store.name,
        cast.store.category,
        cast.store.description,
        cast.store.address,
        cast.store.city,
        cast.store.district,
        cast.store.area?.name,
        cast.store.area?.code,
      ]),
    )
    .map((cast) => {
      const store = withStoreDistance(cast.store, params);
      return { ...cast, distanceKm: store.distanceKm, store };
    });

  const sorted = [...allCasts].sort((left, right) => {
    if (params.sort === "priority") {
      const leftPriority = demoPrioritySlugs.get(left.store.slug) ?? Number.POSITIVE_INFINITY;
      const rightPriority = demoPrioritySlugs.get(right.store.slug) ?? Number.POSITIVE_INFINITY;
      if (leftPriority !== rightPriority) return leftPriority - rightPriority;
    }

    if (params.sort === "nearest" || hasCoordinates(params)) {
      const leftDistance =
        typeof left.distanceKm === "number" ? left.distanceKm : Number.POSITIVE_INFINITY;
      const rightDistance =
        typeof right.distanceKm === "number" ? right.distanceKm : Number.POSITIVE_INFINITY;
      if (leftDistance !== rightDistance) return leftDistance - rightDistance;
    }

    return left.name.localeCompare(right.name);
  });

  const total = sorted.length;
  const paged = paginateItems(sorted, params);
  const limit =
    typeof params.limit === "number" && Number.isFinite(params.limit) && params.limit > 0
      ? params.limit
      : total;
  const page =
    typeof params.page === "number" && Number.isFinite(params.page) && params.page > 0
      ? params.page
      : 1;
  const offset = (page - 1) * limit;

  return {
    casts: paged,
    total,
    page,
    limit,
    meta: {
      total,
      page,
      limit,
      offset,
      hasMore: offset + paged.length < total,
      sort: params.sort ?? "newest",
    },
  };
};

const unwrapListResponse = <T>(response: T[] | PublicDiscoveryListResponse<T>) =>
  Array.isArray(response) ? response : response.data;

const normalizePublicStore = (store: PublicStore): PublicStore => ({
  ...store,
  thumbnailUrl: resolveClientUrl(store.thumbnailUrl),
  priceReference: store.priceReference
    ? {
        ...store.priceReference,
        items: store.priceReference.items.map((item) => ({
          ...item,
          imageUrl: resolveClientUrl(item.imageUrl),
        })),
      }
    : store.priceReference,
});

const unwrapStoreListResponse = (
  response: PublicStore[] | PublicDiscoveryListResponse<PublicStore>,
  params: DiscoveryParams = {}
): PublicDiscoveryStoreListResponse => {
  if (Array.isArray(response)) {
    const stores = response.map(normalizePublicStore);
    const limit = params.limit ?? stores.length;
    const page = params.page ?? 1;
    const offset = params.offset ?? (page - 1) * limit;

    return {
      stores,
      total: stores.length,
      page,
      limit,
      meta: {
        total: stores.length,
        page,
        limit,
        offset,
        hasMore: offset + stores.length < stores.length,
        sort: params.sort ?? "priority",
      },
    };
  }

  const stores = (response.data ?? []).map(normalizePublicStore);
  const meta = response.meta ?? {
    total: stores.length,
    page: params.page ?? 1,
    limit: params.limit ?? stores.length,
    offset: params.offset ?? 0,
    hasMore: false,
    sort: params.sort ?? "priority",
  };

  return {
    stores,
    total: meta.total,
    page: meta.page,
    limit: meta.limit,
    meta,
  };
};

const normalizePublicCast = (cast: PublicCast): PublicCast => ({
  ...cast,
  thumbnailUrl: resolveClientUrl(cast.thumbnailUrl),
  store: normalizePublicStore(cast.store),
});

const withDemoFallback = async <T>(
  request: () => Promise<T>,
  fallback: () => T,
): Promise<T> => {
  try {
    return await request();
  } catch {
    return fallback();
  }
};

export const discoveryApi = {
  listAreas: (params?: Pick<DiscoveryParams, "city">) =>
    withDemoFallback(
      () => apiClient<PublicArea[]>("/areas", { params: toParams(params) }),
      () => getFallbackAreas(params),
    ),
  listStores: (params?: DiscoveryParams) =>
    withDemoFallback(
      () =>
        apiClient<PublicStore[] | PublicDiscoveryListResponse<PublicStore>>("/stores", {
          params: toParams(params),
        }).then((response) => unwrapStoreListResponse(response, params)),
      () => getFallbackStores(params),
    ),
  listStoresStrict: (params?: DiscoveryParams) =>
    apiClient<PublicStore[] | PublicDiscoveryListResponse<PublicStore>>("/stores", {
      params: toParams(params),
    }).then((response) => unwrapStoreListResponse(response, params)),
  listCasts: (params?: DiscoveryParams) =>
    withDemoFallback(
      () =>
        apiClient<PublicCast[] | PublicDiscoveryListResponse<PublicCast>>("/casts", {
          params: toParams(params),
          cache: "no-store",
        }).then((response): PublicDiscoveryCastListResponse => {
          if (Array.isArray(response)) {
            const casts = response.map(normalizePublicCast);
            const limit = params?.limit ?? casts.length;
            const page = params?.page ?? 1;
            const offset = params?.offset ?? (page - 1) * limit;
            return {
              casts,
              total: casts.length,
              page,
              limit,
              meta: {
                total: casts.length,
                page,
                limit,
                offset,
                hasMore: false,
                sort: params?.sort ?? "newest",
              },
            };
          }
          const casts = (response.data ?? []).map(normalizePublicCast);
          const meta = response.meta ?? {
            total: casts.length,
            page: params?.page ?? 1,
            limit: params?.limit ?? casts.length,
            offset: params?.offset ?? 0,
            hasMore: false,
            sort: params?.sort ?? "newest",
          };
          return { casts, total: meta.total, page: meta.page, limit: meta.limit, meta };
        }),
      () => getFallbackCasts(params),
    ),
  listCastsStrict: (params?: DiscoveryParams) =>
    apiClient<PublicCast[] | PublicDiscoveryListResponse<PublicCast>>("/casts", {
      params: toParams(params),
      cache: "no-store",
    }).then((response) => unwrapListResponse(response).map(normalizePublicCast)),
};

