import { apiClient } from "./client";
import type { PublicStore } from "./discovery";

export type StoreFavoriteState = {
  storeId: string;
  storeSlug: string;
  favorited: boolean;
};

export type MemberFavoriteStore = {
  favoriteId: string;
  favoritedAt: string;
  store: PublicStore;
};

export const storeFavoriteApi = {
  getState: (slug: string) =>
    apiClient<StoreFavoriteState>(`/member/favorite-stores/${encodeURIComponent(slug)}`),
  favorite: (slug: string) =>
    apiClient<StoreFavoriteState>(`/member/favorite-stores/${encodeURIComponent(slug)}`, {
      method: "POST",
    }),
  unfavorite: (slug: string) =>
    apiClient<StoreFavoriteState>(`/member/favorite-stores/${encodeURIComponent(slug)}`, {
      method: "DELETE",
    }),
  list: () => apiClient<MemberFavoriteStore[]>("/member/favorite-stores"),
};
