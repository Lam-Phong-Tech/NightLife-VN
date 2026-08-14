import "server-only";

import type { CmsContentItem } from "@/lib/api/content";

export async function fetchHomeBannersOnServer(): Promise<CmsContentItem[]> {
  try {
    const backendUrl =
      process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const base = backendUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
    const response = await fetch(`${base}/contents?type=BANNER&limit=10`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return [];
    const json = (await response.json()) as { data?: CmsContentItem[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}
