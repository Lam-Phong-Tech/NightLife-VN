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

export const discoveryApi = {
  listAreas: (params?: Pick<DiscoveryParams, 'city'>) =>
    apiClient<PublicArea[]>('/areas', { params: toParams(params) }),
  listStores: (params?: DiscoveryParams) =>
    apiClient<PublicStore[]>('/stores', { params: toParams(params) }),
  listCasts: (params?: DiscoveryParams) =>
    apiClient<PublicCast[]>('/casts', { params: toParams(params) }),
};
