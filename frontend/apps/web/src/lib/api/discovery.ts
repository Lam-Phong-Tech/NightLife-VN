import { apiClient } from './client';

export type DiscoveryParams = {
  q?: string;
  city?: string;
  area?: string;
  category?: string;
  lat?: number;
  lng?: number;
  limit?: number;
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
  area?: PublicArea | null;
  latitude?: number | null;
  longitude?: number | null;
  thumbnailUrl?: string | null;
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
    if (value === undefined || value === null || value === '') {
      return;
    }

    searchParams[key] = String(value);
  });

  return searchParams;
};

const demoAreas: PublicArea[] = [
  {
    id: 'area-hn-hoan-kiem',
    code: 'hn-hoan-kiem',
    name: 'Hoan Kiem',
    city: 'Ha Noi',
    cityCode: 'hn',
    district: 'Hoan Kiem',
  },
  {
    id: 'area-hn-tay-ho',
    code: 'hn-tay-ho',
    name: 'Tay Ho',
    city: 'Ha Noi',
    cityCode: 'hn',
    district: 'Tay Ho',
  },
  {
    id: 'area-hcm-q1',
    code: 'hcm-q1',
    name: 'Quan 1',
    city: 'TP.HCM',
    cityCode: 'hcm',
    district: 'Quan 1',
  },
  {
    id: 'area-hcm-q3',
    code: 'hcm-q3',
    name: 'Quan 3',
    city: 'TP.HCM',
    cityCode: 'hcm',
    district: 'Quan 3',
  },
  {
    id: 'area-dn-hai-chau',
    code: 'dn-hai-chau',
    name: 'Hai Chau',
    city: 'Da Nang',
    cityCode: 'dn',
    district: 'Hai Chau',
  },
  {
    id: 'area-dn-son-tra',
    code: 'dn-son-tra',
    name: 'Son Tra',
    city: 'Da Nang',
    cityCode: 'dn',
    district: 'Son Tra',
  },
  {
    id: 'area-hp-hong-bang',
    code: 'hp-hong-bang',
    name: 'Hong Bang',
    city: 'Hai Phong',
    cityCode: 'hp',
    district: 'Hong Bang',
  },
  {
    id: 'area-hp-ngo-quyen',
    code: 'hp-ngo-quyen',
    name: 'Ngo Quyen',
    city: 'Hai Phong',
    cityCode: 'hp',
    district: 'Ngo Quyen',
  },
];

const areaByCode = new Map(demoAreas.map((area) => [area.code, area]));

const buildStore = (
  store: Omit<PublicStore, 'area' | 'distanceKm'> & { areaCode: string },
): PublicStore => {
  const { areaCode, ...storeFields } = store;

  return {
    ...storeFields,
    area: areaByCode.get(areaCode) ?? null,
    distanceKm: null,
  };
};

const demoStores: PublicStore[] = [
  buildStore({
    id: 'store-crimson-hoan-kiem',
    name: 'Crimson Bar Hoan Kiem',
    slug: 'crimson-bar-hoan-kiem',
    category: 'BAR',
    description: 'Cocktail bar gan ho Hoan Kiem, phu hop hen nhe va meetup nho.',
    address: '12 Ly Thai To, Hoan Kiem',
    city: 'Ha Noi',
    cityCode: 'hn',
    district: 'Hoan Kiem',
    areaCode: 'hn-hoan-kiem',
    latitude: 21.0279,
    longitude: 105.8522,
    thumbnailUrl: null,
  }),
  buildStore({
    id: 'store-neon-tay-ho',
    name: 'Neon District Club',
    slug: 'neon-district-club',
    category: 'CLUB',
    description: 'Club nhac dien tu tai Tay Ho, co khu VIP va ban lon.',
    address: '28 To Ngoc Van, Tay Ho',
    city: 'Ha Noi',
    cityCode: 'hn',
    district: 'Tay Ho',
    areaCode: 'hn-tay-ho',
    latitude: 21.0603,
    longitude: 105.8237,
    thumbnailUrl: null,
  }),
  buildStore({
    id: 'store-tokyo-kitchen-hoan-kiem',
    name: 'Tokyo Kitchen Old Quarter',
    slug: 'tokyo-kitchen-old-quarter',
    category: 'RESTAURANT',
    description: 'Nha hang phong cach izakaya, co phong rieng cho nhom nho.',
    address: '7 Hang Bac, Hoan Kiem',
    city: 'Ha Noi',
    cityCode: 'hn',
    district: 'Hoan Kiem',
    areaCode: 'hn-hoan-kiem',
    latitude: 21.0341,
    longitude: 105.8525,
    thumbnailUrl: null,
  }),
  buildStore({
    id: 'store-moonlight-q1',
    name: 'Moonlight Q1 Bar',
    slug: 'moonlight-q1-bar',
    category: 'BAR',
    description: 'Rooftop bar trung tam Quan 1, view thanh pho va cocktail signature.',
    address: '45 Nguyen Hue, Quan 1',
    city: 'TP.HCM',
    cityCode: 'hcm',
    district: 'Quan 1',
    areaCode: 'hcm-q1',
    latitude: 10.7731,
    longitude: 106.7042,
    thumbnailUrl: null,
  }),
  buildStore({
    id: 'store-sakura-lounge-q3',
    name: 'Sakura Lounge Quan 3',
    slug: 'sakura-lounge-quan-3',
    category: 'LOUNGE',
    description: 'Lounge yen tinh, phu hop tiep khach va booking cast.',
    address: '18 Vo Van Tan, Quan 3',
    city: 'TP.HCM',
    cityCode: 'hcm',
    district: 'Quan 3',
    areaCode: 'hcm-q3',
    latitude: 10.7826,
    longitude: 106.6921,
    thumbnailUrl: null,
  }),
  buildStore({
    id: 'store-dragon-rooftop-dn',
    name: 'Dragon Rooftop Da Nang',
    slug: 'dragon-rooftop-da-nang',
    category: 'CLUB',
    description: 'Club rooftop gan song Han, nhac soi dong cuoi tuan.',
    address: '30 Bach Dang, Hai Chau',
    city: 'Da Nang',
    cityCode: 'dn',
    district: 'Hai Chau',
    areaCode: 'dn-hai-chau',
    latitude: 16.068,
    longitude: 108.2247,
    thumbnailUrl: null,
  }),
  buildStore({
    id: 'store-son-tra-lounge',
    name: 'Son Tra Sea Lounge',
    slug: 'son-tra-sea-lounge',
    category: 'LOUNGE',
    description: 'Lounge gan bien My Khe, khong gian mo va am nhac nhe.',
    address: '11 Vo Nguyen Giap, Son Tra',
    city: 'Da Nang',
    cityCode: 'dn',
    district: 'Son Tra',
    areaCode: 'dn-son-tra',
    latitude: 16.0789,
    longitude: 108.2475,
    thumbnailUrl: null,
  }),
  buildStore({
    id: 'store-harbor-ktv-hp',
    name: 'Harbor KTV Hai Phong',
    slug: 'harbor-ktv-hai-phong',
    category: 'KARAOKE',
    description: 'Karaoke/KTV phong VIP tai Hong Bang, phu hop tiec nhom.',
    address: '9 Tran Phu, Hong Bang',
    city: 'Hai Phong',
    cityCode: 'hp',
    district: 'Hong Bang',
    areaCode: 'hp-hong-bang',
    latitude: 20.8561,
    longitude: 106.6822,
    thumbnailUrl: null,
  }),
  buildStore({
    id: 'store-opera-spa-hp',
    name: 'Opera Spa Ngo Quyen',
    slug: 'opera-spa-ngo-quyen',
    category: 'SPA',
    description: 'Spa thu gian tai Ngo Quyen, co goi cham soc sau tiec.',
    address: '22 Lach Tray, Ngo Quyen',
    city: 'Hai Phong',
    cityCode: 'hp',
    district: 'Ngo Quyen',
    areaCode: 'hp-ngo-quyen',
    latitude: 20.8448,
    longitude: 106.6945,
    thumbnailUrl: null,
  }),
];

const storeBySlug = new Map(demoStores.map((store) => [store.slug, store]));

const buildCast = (
  cast: Omit<PublicCast, 'store' | 'distanceKm'> & { storeSlug: string },
): PublicCast => {
  const { storeSlug, ...castFields } = cast;
  const store = storeBySlug.get(storeSlug);

  if (!store) {
    throw new Error(`Missing demo store: ${storeSlug}`);
  }

  return {
    ...castFields,
    store,
    distanceKm: null,
  };
};

const demoCasts: PublicCast[] = [
  buildCast({
    id: 'cast-yuna-neon',
    slug: 'yuna-neon-district',
    stageName: 'Yuna',
    name: 'Yuna',
    publicAlias: 'Yuna Neon',
    publicHeadline: 'Club host nang dong tai Tay Ho',
    tags: ['club', 'vip', 'dance'],
    languages: ['vi', 'en'],
    hourlyRateVnd: 950000,
    thumbnailUrl: null,
    storeSlug: 'neon-district-club',
  }),
  buildCast({
    id: 'cast-linh-crimson',
    slug: 'linh-crimson-bar',
    stageName: 'Linh',
    name: 'Linh',
    publicAlias: 'Linh Crimson',
    publicHeadline: 'Cocktail companion khu Hoan Kiem',
    tags: ['bar', 'cocktail', 'chill'],
    languages: ['vi', 'en'],
    hourlyRateVnd: 780000,
    thumbnailUrl: null,
    storeSlug: 'crimson-bar-hoan-kiem',
  }),
  buildCast({
    id: 'cast-kotone-tokyo',
    slug: 'kotone-tokyo-kitchen',
    stageName: 'Kotone',
    name: 'Kotone',
    publicAlias: 'Kotone',
    publicHeadline: 'Izakaya guide cho nhom nho pho co',
    tags: ['restaurant', 'japanese', 'dinner'],
    languages: ['ja', 'en'],
    hourlyRateVnd: 880000,
    thumbnailUrl: null,
    storeSlug: 'tokyo-kitchen-old-quarter',
  }),
  buildCast({
    id: 'cast-sakura-moonlight',
    slug: 'sakura-moonlight-q1',
    stageName: 'Sakura',
    name: 'Sakura',
    publicAlias: 'Sakura Moonlight',
    publicHeadline: 'Rooftop host Quan 1, hop khach business',
    tags: ['bar', 'rooftop', 'business'],
    languages: ['vi', 'ja', 'en'],
    hourlyRateVnd: 1100000,
    thumbnailUrl: null,
    storeSlug: 'moonlight-q1-bar',
  }),
  buildCast({
    id: 'cast-hana-sakura-lounge',
    slug: 'hana-sakura-lounge',
    stageName: 'Hana',
    name: 'Hana',
    publicAlias: 'Hana Lounge',
    publicHeadline: 'Lounge host nhe nhang tai Quan 3',
    tags: ['lounge', 'talk', 'vip'],
    languages: ['vi', 'en'],
    hourlyRateVnd: 920000,
    thumbnailUrl: null,
    storeSlug: 'sakura-lounge-quan-3',
  }),
  buildCast({
    id: 'cast-lina-dragon',
    slug: 'lina-dragon-rooftop',
    stageName: 'Lina',
    name: 'Lina',
    publicAlias: 'Lina Dragon',
    publicHeadline: 'Club host gan song Han',
    tags: ['club', 'danang', 'party'],
    languages: ['vi', 'en'],
    hourlyRateVnd: 860000,
    thumbnailUrl: null,
    storeSlug: 'dragon-rooftop-da-nang',
  }),
  buildCast({
    id: 'cast-nami-son-tra',
    slug: 'nami-son-tra-sea-lounge',
    stageName: 'Nami',
    name: 'Nami',
    publicAlias: 'Nami Sea',
    publicHeadline: 'Sea lounge host gan My Khe',
    tags: ['lounge', 'beach', 'chill'],
    languages: ['vi', 'en'],
    hourlyRateVnd: 760000,
    thumbnailUrl: null,
    storeSlug: 'son-tra-sea-lounge',
  }),
  buildCast({
    id: 'cast-mika-harbor-ktv',
    slug: 'mika-harbor-ktv',
    stageName: 'Mika',
    name: 'Mika',
    publicAlias: 'Mika Harbor',
    publicHeadline: 'KTV host cho tiec nhom Hai Phong',
    tags: ['ktv', 'karaoke', 'group'],
    languages: ['vi', 'ja'],
    hourlyRateVnd: 820000,
    thumbnailUrl: null,
    storeSlug: 'harbor-ktv-hai-phong',
  }),
  buildCast({
    id: 'cast-sumi-opera-spa',
    slug: 'sumi-opera-spa',
    stageName: 'Sumi',
    name: 'Sumi',
    publicAlias: 'Sumi Spa',
    publicHeadline: 'Spa coordinator khu Ngo Quyen',
    tags: ['spa', 'relax', 'wellness'],
    languages: ['vi'],
    hourlyRateVnd: 680000,
    thumbnailUrl: null,
    storeSlug: 'opera-spa-ngo-quyen',
  }),
];

const normalize = (value: string | number | null | undefined) =>
  String(value ?? '')
    .replace(/\u0111/g, 'd')
    .replace(/\u0110/g, 'D')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

type DiscoveryParamsWithCoordinates = DiscoveryParams &
  Required<Pick<DiscoveryParams, 'lat' | 'lng'>>;

const hasCoordinates = (params: DiscoveryParams): params is DiscoveryParamsWithCoordinates =>
  typeof params.lat === 'number' &&
  typeof params.lng === 'number' &&
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
  item: Pick<PublicStore | PublicArea, 'city' | 'cityCode'>,
) => {
  const normalizedCity = normalize(city);

  if (!normalizedCity) {
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

const distanceKm = (from: Required<Pick<DiscoveryParams, 'lat' | 'lng'>>, store: PublicStore) => {
  if (typeof store.latitude !== 'number' || typeof store.longitude !== 'number') {
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
    if (hasCoordinates(params)) {
      const leftDistance =
        typeof left.distanceKm === 'number' ? left.distanceKm : Number.POSITIVE_INFINITY;
      const rightDistance =
        typeof right.distanceKm === 'number' ? right.distanceKm : Number.POSITIVE_INFINITY;

      if (leftDistance !== rightDistance) {
        return leftDistance - rightDistance;
      }
    }

    return left.name.localeCompare(right.name);
  });

const limitItems = <T>(items: T[], limit: number | undefined) =>
  typeof limit === 'number' && Number.isFinite(limit) && limit > 0
    ? items.slice(0, limit)
    : items;

const getFallbackAreas = (params: Pick<DiscoveryParams, 'city'> = {}) =>
  demoAreas.filter((area) => matchesCity(params.city, area));

const getFallbackStores = (params: DiscoveryParams = {}) => {
  const stores = demoStores
    .filter((store) => matchesCity(params.city, store))
    .filter((store) => matchesCategory(params.category, store))
    .filter((store) => matchesArea(params.area, store))
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

  return limitItems(sortStores(stores, params), params.limit);
};

const getFallbackCasts = (params: DiscoveryParams = {}) => {
  const casts = demoCasts
    .filter((cast) => matchesCity(params.city, cast.store))
    .filter((cast) => matchesCategory(params.category, cast.store))
    .filter((cast) => matchesArea(params.area, cast.store))
    .filter((cast) =>
      matchesQuery(params.q, [
        cast.name,
        cast.stageName,
        cast.publicAlias,
        cast.publicHeadline,
        cast.tags.join(' '),
        cast.languages.join(' '),
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
    if (hasCoordinates(params)) {
      const leftDistance =
        typeof left.distanceKm === 'number' ? left.distanceKm : Number.POSITIVE_INFINITY;
      const rightDistance =
        typeof right.distanceKm === 'number' ? right.distanceKm : Number.POSITIVE_INFINITY;

      if (leftDistance !== rightDistance) {
        return leftDistance - rightDistance;
      }
    }

    return left.name.localeCompare(right.name);
  });

  return limitItems(sorted, params.limit);
};

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
  listAreas: (params?: Pick<DiscoveryParams, 'city'>) =>
    withDemoFallback(
      () => apiClient<PublicArea[]>('/areas', { params: toParams(params) }),
      () => getFallbackAreas(params),
    ),
  listStores: (params?: DiscoveryParams) =>
    withDemoFallback(
      () => apiClient<PublicStore[]>('/stores', { params: toParams(params) }),
      () => getFallbackStores(params),
    ),
  listCasts: (params?: DiscoveryParams) =>
    withDemoFallback(
      () => apiClient<PublicCast[]>('/casts', { params: toParams(params) }),
      () => getFallbackCasts(params),
    ),
};
