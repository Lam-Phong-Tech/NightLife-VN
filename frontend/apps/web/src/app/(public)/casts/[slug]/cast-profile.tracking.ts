import type { CastProfile } from "./cast-profile.types";

export type CastDetailClickAction = "booking" | "gallery" | "store" | "favorite" | "related";

type TrackingWindow = Window & {
  dataLayer?: Array<Record<string, unknown>>;
};

export function trackCastDetailClick(
  cast: CastProfile,
  action: CastDetailClickAction,
  metadata: Record<string, unknown> = {},
) {
  if (typeof window === "undefined") return;

  const payload = {
    event: "cast_detail_click",
    action,
    castId: cast.id,
    castSlug: cast.slug,
    castName: cast.name,
    storeId: cast.store.id,
    storeSlug: cast.store.slug,
    storeName: cast.store.name,
    languages: cast.languages,
    tags: cast.tags,
    ...metadata,
  };
  const trackingWindow = window as TrackingWindow;

  trackingWindow.dataLayer = trackingWindow.dataLayer ?? [];
  trackingWindow.dataLayer.push(payload);
  window.dispatchEvent(new CustomEvent("nightlife:cast-detail-click", { detail: payload }));

  try {
    const history = JSON.parse(window.localStorage.getItem("nightlife_cast_detail_events") || "[]") as Array<Record<string, unknown>>;
    window.localStorage.setItem(
      "nightlife_cast_detail_events",
      JSON.stringify([{ ...payload, at: new Date().toISOString() }, ...history].slice(0, 50)),
    );
  } catch {
    window.localStorage.removeItem("nightlife_cast_detail_events");
  }
}
