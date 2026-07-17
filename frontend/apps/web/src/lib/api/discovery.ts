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
  address?: string | null;
  city: string;
  cityCode?: string;
  district?: string | null;
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
  publicHeadline?: string | null;
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

const demoAreas: PublicArea[] = [
  {
    id: "area-hn-hoan-kiem",
    code: "hn-hoan-kiem",
    name: "Hoan Kiem",
    city: "Ha Noi",
    cityCode: "hn",
    district: "Hoan Kiem",
  },
  {
    id: "area-hn-tay-ho",
    code: "hn-tay-ho",
    name: "Tay Ho",
    city: "Ha Noi",
    cityCode: "hn",
    district: "Tay Ho",
  },
  {
    id: "area-hcm-q1",
    code: "hcm-q1",
    name: "Quan 1",
    city: "TP.HCM",
    cityCode: "hcm",
    district: "Quan 1",
  },
  {
    id: "area-hcm-q3",
    code: "hcm-q3",
    name: "Quan 3",
    city: "TP.HCM",
    cityCode: "hcm",
    district: "Quan 3",
  },
  {
    id: "area-hcm-q7",
    code: "hcm-q7",
    name: "Quan 7",
    city: "TP.HCM",
    cityCode: "hcm",
    district: "Quan 7",
  },
];

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

const demoStores: PublicStore[] = [
  buildStore({
    id: "store-crimson-hoan-kiem",
    name: "Crimson Bar Hoan Kiem",
    slug: "crimson-bar-hoan-kiem",
    category: "BAR",
    description: "Cocktail bar gan ho Hoan Kiem, phu hop hen nhe va meetup nho.",
    address: "12 Ly Thai To, Hoan Kiem",
    city: "Ha Noi",
    cityCode: "hn",
    district: "Hoan Kiem",
    areaCode: "hn-hoan-kiem",
    latitude: 21.0279,
    longitude: 105.8522,
  }),
  buildStore({
    id: "store-jade-casino-hoan-kiem",
    name: "Jade Casino Hoan Kiem",
    slug: "jade-casino-hoan-kiem",
    category: "CASINO",
    description: "Casino lounge tai Hoan Kiem, co ban VIP va do uong dem.",
    address: "88 Ly Thuong Kiet, Hoan Kiem",
    city: "Ha Noi",
    cityCode: "hn",
    district: "Hoan Kiem",
    areaCode: "hn-hoan-kiem",
    latitude: 21.0245,
    longitude: 105.8485,
  }),
  buildStore({
    id: "store-neon-tay-ho",
    name: "Neon District Club",
    slug: "neon-district-club",
    category: "CLUB",
    description: "Club nhac dien tu tai Tay Ho, co khu VIP va ban lon.",
    address: "28 To Ngoc Van, Tay Ho",
    city: "Ha Noi",
    cityCode: "hn",
    district: "Tay Ho",
    areaCode: "hn-tay-ho",
    latitude: 21.0603,
    longitude: 105.8237,
  }),
  buildStore({
    id: "store-tokyo-kitchen-hoan-kiem",
    name: "Tokyo Kitchen Old Quarter",
    slug: "tokyo-kitchen-old-quarter",
    category: "RESTAURANT",
    description: "Nha hang phong cach izakaya, co phong rieng cho nhom nho.",
    address: "7 Hang Bac, Hoan Kiem",
    city: "Ha Noi",
    cityCode: "hn",
    district: "Hoan Kiem",
    areaCode: "hn-hoan-kiem",
    latitude: 21.0341,
    longitude: 105.8525,
  }),
  buildStore({
    id: "store-moonlight-q1",
    name: "Moonlight Q1 Bar",
    slug: "moonlight-q1-bar",
    category: "BAR",
    description: "Rooftop bar trung tam Quan 1, view thanh pho va cocktail signature.",
    address: "45 Nguyen Hue, Quan 1",
    city: "TP.HCM",
    cityCode: "hcm",
    district: "Quan 1",
    areaCode: "hcm-q1",
    latitude: 10.7731,
    longitude: 106.7042,
  }),
  buildStore({
    id: "store-sakura-lounge-q3",
    name: "Sakura Lounge Quan 3",
    slug: "sakura-lounge-quan-3",
    category: "GIRLS_BAR",
    description: "Girls bar phong cach nhat tai Quan 3, phu hop booking cast.",
    address: "18 Vo Van Tan, Quan 3",
    city: "TP.HCM",
    cityCode: "hcm",
    district: "Quan 3",
    areaCode: "hcm-q3",
    latitude: 10.7826,
    longitude: 106.6921,
  }),
  buildStore({
    id: "store-golden-ktv-q7",
    name: "Golden Voice KTV Quan 7",
    slug: "golden-voice-ktv-quan-7",
    category: "KARAOKE",
    description: "Karaoke/KTV phong VIP tai Quan 7, phu hop tiec nhom.",
    address: "67 Nguyen Thi Thap, Quan 7",
    city: "TP.HCM",
    cityCode: "hcm",
    district: "Quan 7",
    areaCode: "hcm-q7",
    latitude: 10.7385,
    longitude: 106.7219,
  }),
  buildStore({
    id: "store-lotus-massage-q3",
    name: "Lotus Massage Spa Quan 3",
    slug: "lotus-massage-spa-quan-3",
    category: "MASSAGE_SPA",
    description: "Massage spa mo muon tai Quan 3, co goi thu gian sau tiec.",
    address: "12 Nguyen Dinh Chieu, Quan 3",
    city: "TP.HCM",
    cityCode: "hcm",
    district: "Quan 3",
    areaCode: "hcm-q3",
    latitude: 10.7829,
    longitude: 106.691,
  }),
];

const storeBySlug = new Map(demoStores.map((store) => [store.slug, store]));
const demoActiveCouponStoreSlugs = new Set([
  "crimson-bar-hoan-kiem",
  "neon-district-club",
  "moonlight-q1-bar",
  "golden-voice-ktv-quan-7",
]);
const demoPrioritySlugs = new Map(
  ["neon-district-club", "moonlight-q1-bar", "crimson-bar-hoan-kiem", "sakura-lounge-quan-3"].map(
    (slug, index) => [slug, index],
  ),
);

const buildCast = (
  cast: Omit<PublicCast, "store" | "distanceKm"> & { storeSlug: string },
): PublicCast => {
  const { storeSlug, ...castFields } = cast;
  const store = storeBySlug.get(storeSlug);

  if (!store) {
    throw new Error(`Missing demo store: ${storeSlug}`);
  }

  return {
    ...castFields,
    thumbnailUrl: castImageForSlug(castFields.slug),
    store,
    distanceKm: null,
  };
};

const demoCasts: PublicCast[] = [
  buildCast({
    id: "cast-yuna-neon",
    slug: "yuna-neon-district",
    stageName: "Yuna",
    name: "Yuna",
    publicAlias: "Yuna Neon",
    publicHeadline: "Club host nang dong tai Tay Ho",
    tags: ["club", "vip", "dance"],
    languages: ["vi", "en"],
    hourlyRateVnd: 950000,
    storeSlug: "neon-district-club",
  }),
  buildCast({
    id: "cast-linh-crimson",
    slug: "linh-crimson-bar",
    stageName: "Linh",
    name: "Linh",
    publicAlias: "Linh Crimson",
    publicHeadline: "Cocktail companion khu Hoan Kiem",
    tags: ["bar", "cocktail", "chill"],
    languages: ["vi", "en"],
    hourlyRateVnd: 780000,
    storeSlug: "crimson-bar-hoan-kiem",
  }),
  buildCast({
    id: "cast-kotone-tokyo",
    slug: "kotone-tokyo-kitchen",
    stageName: "Kotone",
    name: "Kotone",
    publicAlias: "Kotone",
    publicHeadline: "Izakaya guide cho nhom nho pho co",
    tags: ["restaurant", "japanese", "dinner"],
    languages: ["ja", "en"],
    hourlyRateVnd: 880000,
    storeSlug: "tokyo-kitchen-old-quarter",
  }),
  buildCast({
    id: "cast-sakura-moonlight",
    slug: "sakura-moonlight-q1",
    stageName: "Sakura",
    name: "Sakura",
    publicAlias: "Sakura Moonlight",
    publicHeadline: "Rooftop host Quan 1, hop khach business",
    tags: ["bar", "rooftop", "business"],
    languages: ["vi", "ja", "en"],
    hourlyRateVnd: 1100000,
    storeSlug: "moonlight-q1-bar",
  }),
  buildCast({
    id: "cast-hana-sakura-lounge",
    slug: "hana-sakura-lounge",
    stageName: "Hana",
    name: "Hana",
    publicAlias: "Hana Lounge",
    publicHeadline: "Lounge host nhe nhang tai Quan 3",
    tags: ["lounge", "talk", "vip"],
    languages: ["vi", "en"],
    hourlyRateVnd: 920000,
    storeSlug: "sakura-lounge-quan-3",
  }),
  buildCast({
    id: "cast-mika-golden-ktv",
    slug: "mika-golden-ktv",
    stageName: "Mika",
    name: "Mika",
    publicAlias: "Mika KTV",
    publicHeadline: "KTV host cho tiec nhom Quan 7",
    tags: ["ktv", "karaoke", "group"],
    languages: ["vi", "ja"],
    hourlyRateVnd: 820000,
    storeSlug: "golden-voice-ktv-quan-7",
  }),
  buildCast({
    id: "cast-sumi-lotus-massage",
    slug: "sumi-lotus-massage-spa",
    stageName: "Sumi",
    name: "Sumi",
    publicAlias: "Sumi Spa",
    publicHeadline: "Massage spa coordinator Quan 3",
    tags: ["massage-spa", "relax", "wellness"],
    languages: ["vi"],
    hourlyRateVnd: 680000,
    storeSlug: "lotus-massage-spa-quan-3",
  }),
];

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

const getFallbackStores = (params: DiscoveryParams = {}) => {
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

  return paginateItems(sortStores(stores, params), params);
};

const getFallbackCasts = (params: DiscoveryParams = {}) => {
  const casts = demoCasts
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
        cast.publicHeadline,
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

      return {
        ...cast,
        distanceKm: store.distanceKm,
        store,
      };
    });

  const sorted = [...casts].sort((left, right) => {
    if (params.sort === "priority") {
      const leftPriority = demoPrioritySlugs.get(left.store.slug) ?? Number.POSITIVE_INFINITY;
      const rightPriority = demoPrioritySlugs.get(right.store.slug) ?? Number.POSITIVE_INFINITY;

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

  return paginateItems(sorted, params);
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

const normalizePublicCast = (cast: PublicCast): PublicCast => ({
  ...cast,
  thumbnailUrl: resolveClientUrl(cast.thumbnailUrl),
  store: normalizePublicStore(cast.store),
});

const withDemoFallback = async <T extends unknown[]>(
  request: () => Promise<T>,
  fallback: () => T,
) => {
  const fallbackItems = fallback();

  try {
    const items = await request();

    return items.length > 0 || fallbackItems.length === 0 ? items : fallbackItems;
  } catch {
    return fallbackItems;
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
        }).then((response) => unwrapListResponse(response).map(normalizePublicStore)),
      () => getFallbackStores(params),
    ),
  listStoresStrict: (params?: DiscoveryParams) =>
    apiClient<PublicStore[] | PublicDiscoveryListResponse<PublicStore>>("/stores", {
      params: toParams(params),
    }).then((response) => unwrapListResponse(response).map(normalizePublicStore)),
  listCasts: (params?: DiscoveryParams) =>
    withDemoFallback(
      () =>
        apiClient<PublicCast[] | PublicDiscoveryListResponse<PublicCast>>("/casts", {
          params: toParams(params),
        }).then((response) => unwrapListResponse(response).map(normalizePublicCast)),
      () => getFallbackCasts(params),
    ),
  listCastsStrict: (params?: DiscoveryParams) =>
    apiClient<PublicCast[] | PublicDiscoveryListResponse<PublicCast>>("/casts", {
      params: toParams(params),
    }).then((response) => unwrapListResponse(response).map(normalizePublicCast)),
};
