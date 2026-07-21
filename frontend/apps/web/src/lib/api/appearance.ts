import { apiClient } from "./client";

export type AppearanceItem = {
  id: string;
  label: string;
  icon: string;
  color?: string;
  featured?: boolean;
};

export type AppearanceTitle = {
  id: string;
  key?: string;
  label: string;
};

export type AppearanceBrand = {
  name: string;
  tagline: string;
  logoUrl?: string;
};

export type AppearanceConfig = {
  quick: AppearanceItem[];
  nav: AppearanceItem[];
  titles: AppearanceTitle[];
  brand: AppearanceBrand;
};

type AppearanceConfigResponse = {
  data?: Partial<AppearanceConfig> | null;
};

const normalizeAppearanceColor = (value?: string) =>
  typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value.trim())
    ? value.trim().toUpperCase()
    : undefined;

export const DEFAULT_APPEARANCE_CONFIG: AppearanceConfig = {
  quick: [
    { id: "q1", label: "Tìm quán", icon: "pin" },
    { id: "q2", label: "Tìm Cast", icon: "user" },
    { id: "q3", label: "Ưu đãi", icon: "ticket" },
    { id: "q4", label: "Tour", icon: "map" },
    { id: "q5", label: "Ranking", icon: "crown" },
    { id: "q6", label: "Spa", icon: "waves" },
    { id: "q7", label: "Nhà hàng", icon: "dining" },
    { id: "q8", label: "VIP", icon: "star" },
  ],
  nav: [
    { id: "n1", label: "Trang chủ", icon: "home" },
    { id: "n2", label: "Tìm Cast", icon: "search" },
    { id: "n3", label: "Ưu đãi", icon: "ticket" },
    { id: "n4", label: "Lịch đặt", icon: "calcheck" },
    { id: "n5", label: "Tài khoản", icon: "account" },
  ],
  titles: [
    { id: "t1", key: "Khối đề xuất", label: "Đề xuất tối nay" },
    { id: "t2", key: "Khối coupon", label: "Coupon Hot" },
    { id: "t3", key: "Khối xếp hạng", label: "Bảng xếp hạng" },
    { id: "t4", key: "Khối dịch vụ", label: "Dịch vụ nổi bật" },
    { id: "t4_restaurant", key: "Tab Nhà Hàng (Khối dịch vụ)", label: "Nhà hàng" },
    { id: "t4_spa", key: "Tab Spa (Khối dịch vụ)", label: "Spa" },
    { id: "t5", key: "Khối video", label: "Video Hot" },
    { id: "t6", key: "Khối cẩm nang", label: "Tour · Blog · Guide" },
  ],
  brand: { name: "Vietyoru", tagline: "VIETNAM NIGHTLIFE GUIDE", logoUrl: "" },
};

const mergeAppearanceItems = (
  value: AppearanceItem[] | undefined,
  fallback: AppearanceItem[],
) =>
  fallback.map((fallbackItem, index) => {
    const item = Array.isArray(value)
      ? value.find((candidate) => candidate.id === fallbackItem.id)
      : undefined;

    return {
      id: fallbackItem.id,
      label: item?.label?.trim() || fallbackItem.label,
      icon: item?.icon?.trim() || fallbackItem.icon,
      color: normalizeAppearanceColor(item?.color) || normalizeAppearanceColor(fallbackItem.color),
      featured: typeof item?.featured === "boolean" ? item.featured : (fallbackItem.featured || fallbackItem.id === "q8" || fallbackItem.icon === "star"),
    };
  });

const mergeAppearanceTitles = (
  value: AppearanceTitle[] | undefined,
  fallback: AppearanceTitle[],
) =>
  fallback.map((fallbackItem, index) => {
    const item = Array.isArray(value)
      ? value.find((candidate) => candidate.id === fallbackItem.id)
      : undefined;

    return {
      id: fallbackItem.id,
      key: fallbackItem.key,
      label: item?.label?.trim() || fallbackItem.label,
    };
  });

export function normalizeAppearanceConfig(value?: Partial<AppearanceConfig> | null): AppearanceConfig {
  if (!value) return DEFAULT_APPEARANCE_CONFIG;

  return {
    quick: mergeAppearanceItems(value.quick, DEFAULT_APPEARANCE_CONFIG.quick),
    nav: mergeAppearanceItems(value.nav, DEFAULT_APPEARANCE_CONFIG.nav),
    titles: mergeAppearanceTitles(value.titles, DEFAULT_APPEARANCE_CONFIG.titles),
    brand: {
      name: value.brand?.name?.trim() || DEFAULT_APPEARANCE_CONFIG.brand.name,
      tagline: value.brand?.tagline?.trim() || DEFAULT_APPEARANCE_CONFIG.brand.tagline,
      logoUrl: value.brand?.logoUrl?.trim() || "",
    },
  };
}

const CACHE_KEY = "nightlife_appearance_config";

export function getCachedAppearanceConfig(): AppearanceConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached) as AppearanceConfig;
    }
  } catch (e) {
    // Ignore error
  }
  return null;
}

export function cacheAppearanceConfig(config: AppearanceConfig) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(config));
  } catch (e) {
    // Ignore error
  }
}

export async function getAppearanceConfig() {
  const response = await apiClient<AppearanceConfigResponse>("/system-config/appearance");
  const config = normalizeAppearanceConfig(response.data);
  cacheAppearanceConfig(config);
  return config;
}

export function findAppearanceTitle(
  titles: AppearanceTitle[],
  id: string,
  fallback: string,
) {
  return titles.find((item) => item.id === id)?.label?.trim() || fallback;
}
