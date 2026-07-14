import { apiClient } from './client';

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
    area: string;
    slug: string;
  } | null;
  startsAt?: string | null;
  endsAt?: string | null;
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT' | 'EXPIRED' | 'DELETED';
  createdAt: string;
  updatedAt: string;
}

export const campaignsApi = {
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
    const res = await apiClient<CampaignItem>('/admin/campaigns', {
      method: 'POST',
      data,
    });
    return res.data;
  },

  adminUpdate: async (id: string, data: Partial<CampaignItem>): Promise<CampaignItem> => {
    const res = await apiClient<CampaignItem>(`/admin/campaigns/${id}`, {
      method: 'PATCH',
      data,
    });
    return res.data;
  },

  adminDelete: async (id: string): Promise<void> => {
    await apiClient(`/admin/campaigns/${id}`, {
      method: 'DELETE',
    });
  },
};
