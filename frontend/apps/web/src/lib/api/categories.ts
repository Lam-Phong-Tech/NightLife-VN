import { apiClient } from "./client";

export type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  type: string;
  createdAt: string;
  updatedAt: string;
};

export const categoriesApi = {
  list: (type?: string) =>
    apiClient<CategoryItem[]>("/categories", { params: { type } }),
  adminList: (type?: string) =>
    apiClient<CategoryItem[]>("/admin/categories", { params: { type } }),
  adminCreate: (payload: { name: string; slug: string; type?: string; description?: string }) =>
    apiClient<CategoryItem>("/admin/categories", { method: "POST", data: payload }),
  adminUpdate: (id: string, payload: Partial<CategoryItem>) =>
    apiClient<CategoryItem>(`/admin/categories/${encodeURIComponent(id)}`, {
      method: "PATCH",
      data: payload,
    }),
  adminDelete: (id: string) =>
    apiClient<CategoryItem>(`/admin/categories/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
};
