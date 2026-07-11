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

  const res = await apiClient.get<AdminUserListResponse>(`/api/backend/admin/users?${query.toString()}`);
  return res.data;
};

export const createAdminUser = async (data: any) => {
  const res = await apiClient.post<AdminUser>('/api/backend/admin/users', data);
  return res.data;
};

export const updateAdminUser = async (id: string, data: { displayName: string; email: string }) => {
  const res = await apiClient.patch<AdminUser>(`/api/backend/admin/users/${id}`, data);
  return res.data;
};

export const changeAdminUserPassword = async (id: string, data: { password: string }) => {
  const res = await apiClient.patch(`/api/backend/admin/users/${id}/password`, data);
  return res.data;
};

export const disableAdminUser = async (id: string) => {
  const res = await apiClient.delete(`/api/backend/admin/users/${id}`);
  return res.data;
};

export const restoreAdminUser = async (id: string) => {
  const res = await apiClient.post(`/api/backend/admin/users/${id}/restore`, {});
  return res.data;
};

export const hardDeleteAdminUser = async (id: string) => {
  const res = await apiClient.delete(`/api/backend/admin/users/${id}/hard`);
  return res.data;
};

export const searchStoresForAdmin = async (q?: string, forRole?: string) => {
  const query = new URLSearchParams();
  if (q) query.set('q', q);
  if (forRole) query.set('forRole', forRole);
  const res = await apiClient.get<any[]>(`/api/backend/admin/users/stores/search?${query.toString()}`);
  return res.data;
};
