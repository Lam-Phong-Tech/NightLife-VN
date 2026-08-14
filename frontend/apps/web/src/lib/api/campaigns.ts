import { apiClient } from './client';
import type { PublicResponsiveImage } from './content';

export interface CampaignItem {
  id: string;
  name: string;
  discountType: 'PERCENT' | 'FIXED_AMOUNT';
  discountValue: number;
  targetStoreId?: string | null;
  targetStore?: {
    id: string;
    name: string;
    category: string;
    status?: string;
    area?:
      | string
      | {
          id: string;
          name: string;
          city: string;
          district?: string | null;
          ward?: string | null;
        }
      | null;
    slug: string;
    city: string;
    district?: string | null;
    ward?: string | null;
    media?: Array<{ url: string }>;
    thumbnailUrl?: string | null;
    responsiveImage?: PublicResponsiveImage | null;
  } | null;
  startsAt?: string | null;
  endsAt?: string | null;
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT' | 'EXPIRED' | 'DELETED';
  homePosition?: number | null;
  createdAt: string;
  updatedAt: string;
}

const isGeneralArea = (val?: string | null) => {
  if (!val) return true;
  const normalized = val.trim().toLowerCase();
  return normalized === 'tổng hợp' || normalized === 'tong hop' || normalized === 'tong_hop' || normalized === 'all';
};

export const campaignStoreDistrict = (
  store: CampaignItem['targetStore'],
): string => {
  const directWard = store?.ward?.trim();
  if (directWard && !isGeneralArea(directWard)) return directWard;

  const areaWard =
    store?.area && typeof store.area === 'object'
      ? store.area.ward?.trim()
      : undefined;
  if (areaWard && !isGeneralArea(areaWard)) return areaWard;

  const directDistrict = store?.district?.trim();
  if (directDistrict && !isGeneralArea(directDistrict)) return directDistrict;

  const areaDistrict =
    store?.area && typeof store.area === 'object'
      ? store.area.district?.trim()
      : undefined;
  if (areaDistrict && !isGeneralArea(areaDistrict)) return areaDistrict;

  return '';
};

export const campaignsApi = {
  listPublicCampaigns: async (params?: { page?: number; limit?: number; home?: boolean }): Promise<CampaignItem[]> => {
    try {
      const res = await apiClient<any>('/public/campaigns', { params });
      return res.data?.data || res.data || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  adminList: async (params?: { page?: number; limit?: number; status?: string }): Promise<CampaignItem[]> => {
    try {
      const res = await apiClient<any>('/admin/campaigns', { params });
      return res.data?.data || res.data || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  adminCreate: async (data: Partial<CampaignItem>): Promise<CampaignItem> => {
    const res = await apiClient<any>('/admin/campaigns', {
      method: 'POST',
      data,
    });
    return res.data?.data || res.data;
  },

  adminUpdate: async (id: string, data: Partial<CampaignItem>): Promise<CampaignItem> => {
    const res = await apiClient<any>(`/admin/campaigns/${id}`, {
      method: 'PATCH',
      data,
    });
    return res.data?.data || res.data;
  },

  adminDelete: async (id: string): Promise<void> => {
    await apiClient(`/admin/campaigns/${id}`, {
      method: 'DELETE',
    });
  },
};
