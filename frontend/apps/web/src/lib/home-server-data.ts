import "server-only";

import {
  normalizeAppearanceConfig,
  type AppearanceConfig,
} from "@/lib/api/appearance";
import type { CmsContentItem } from "@/lib/api/content";

function getBackendBaseUrl() {
  const backendUrl =
    process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  return backendUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
}

export async function fetchHomeBannersOnServer(): Promise<CmsContentItem[]> {
  try {
    const response = await fetch(`${getBackendBaseUrl()}/contents?type=BANNER&limit=10`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return [];
    const json = (await response.json()) as { data?: CmsContentItem[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchHomeAppearanceOnServer(): Promise<AppearanceConfig | null> {
  try {
    const response = await fetch(`${getBackendBaseUrl()}/system-config/appearance`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;
    const json = (await response.json()) as {
      data?: Partial<AppearanceConfig> | null;
    };
    return normalizeAppearanceConfig(json.data);
  } catch {
    return null;
  }
}

export async function fetchHomePageInitialData() {
  const [banners, appearance] = await Promise.all([
    fetchHomeBannersOnServer(),
    fetchHomeAppearanceOnServer(),
  ]);
  return { banners, appearance };
}
