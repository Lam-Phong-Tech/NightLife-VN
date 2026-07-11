import { apiClient } from './client';

export type AdminUser = {
  id: string;
  email: string;
  displayName: string | null;
  phone: string | null;
  role: string;
  tier: string;
  status: string;
  createdAt: string;
};

export type AdminUserListResponse = {
  items: AdminUser[];
  total: number;
};

export const getAdminUsers = async (params: {
  skip?: number;
  take?: number;
  search?: string;
  role?: string;
  status?: string;
}) => {
  const query = new URLSearchParams();
  if (params.skip !== undefined) query.set('skip', params.skip.toString());
  if (params.take !== undefined) query.set('take', params.take.toString());
  if (params.search) query.set('search', params.search);
  if (params.role) query.set('role', params.role);
  if (params.status) query.set('status', params.status);

  return apiClient<AdminUserListResponse>(`/api/backend/admin/users?${query.toString()}`);
};

export const createAdminUser = async (data: any) => {
  return apiClient<AdminUser>('/api/backend/admin/users', { method: 'POST', data });
};

export const updateAdminUser = async (id: string, data: { displayName: string; email: string }) => {
  return apiClient<AdminUser>(`/api/backend/admin/users/${id}`, { method: 'PATCH', data });
};

export const changeAdminUserPassword = async (id: string, data: { password: string }) => {
  return apiClient(`/api/backend/admin/users/${id}/password`, { method: 'PATCH', data });
};

export const disableAdminUser = async (id: string) => {
  return apiClient(`/api/backend/admin/users/${id}`, { method: 'DELETE' });
};

export const restoreAdminUser = async (id: string) => {
  return apiClient(`/api/backend/admin/users/${id}/restore`, { method: 'POST', data: {} });
};

export const hardDeleteAdminUser = async (id: string) => {
  return apiClient(`/api/backend/admin/users/${id}/hard`, { method: 'DELETE' });
};

export const searchStoresForAdmin = async (q?: string, forRole?: string) => {
  const query = new URLSearchParams();
  if (q) query.set('q', q);
  if (forRole) query.set('forRole', forRole);
  return apiClient<any[]>(`/api/backend/admin/users/stores/search?${query.toString()}`);
};
