import type { PublicStoreDetail } from "@/lib/api/store-detail";

export type StoreDetailClickAction = "booking" | "coupon" | "call" | "map" | "favorite";

type TrackingWindow = Window & {
  dataLayer?: Array<Record<string, unknown>>;
};

export function trackStoreDetailClick(
  store: PublicStoreDetail,
  action: StoreDetailClickAction,
  metadata: Record<string, unknown> = {},
) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = {
    event: "store_detail_click",
    action,
    storeId: store.id,
    storeSlug: store.slug,
    storeName: store.name,
    category: store.category,
    area: store.area?.code ?? store.area?.name ?? null,
    ...metadata,
  };
  const trackingWindow = window as TrackingWindow;

  trackingWindow.dataLayer = trackingWindow.dataLayer ?? [];
  trackingWindow.dataLayer.push(payload);
  window.dispatchEvent(new CustomEvent("nightlife:store-detail-click", { detail: payload }));

  try {
    const history = JSON.parse(
      window.localStorage.getItem("nightlife_store_detail_events") || "[]",
    ) as Array<Record<string, unknown>>;
    window.localStorage.setItem(
      "nightlife_store_detail_events",
      JSON.stringify([{ ...payload, at: new Date().toISOString() }, ...history].slice(0, 25)),
    );
  } catch {
    window.localStorage.removeItem("nightlife_store_detail_events");
  }
}
