import type { PublicRankingItem, RankingCategory, RankingCity } from "@/lib/api/rankings";

export type RankingClickAction = "profile" | "store" | "call" | "booking";

export type RankingClickContext = {
  city: RankingCity;
  category: "all" | RankingCategory;
  targetType: "CAST" | "STORE";
  surface: "desktop" | "mobile" | "ranking-card";
};

type TrackingWindow = Window & {
  dataLayer?: Array<Record<string, unknown>>;
};

export function trackRankingClick(
  item: PublicRankingItem,
  action: RankingClickAction,
  context: RankingClickContext,
) {
  if (typeof window === "undefined") return;

  const payload = {
    event: "ranking_click",
    action,
    rankingSlot: item.rank,
    targetType: item.targetType,
    targetId: item.targetId,
    targetSlug: item.slug,
    targetName: item.name,
    category: item.category,
    city: context.city,
    selectedCategory: context.category,
    selectedTargetType: context.targetType,
    sponsored: item.sponsored,
    pinRank: item.pinRank ?? null,
    manualScore: item.manualScore,
    href: item.href,
    surface: context.surface,
    experimentKey: "ranking_sponsored_v1",
    experimentVariant: "control",
  };
  const trackingWindow = window as TrackingWindow;

  trackingWindow.dataLayer = trackingWindow.dataLayer ?? [];
  trackingWindow.dataLayer.push(payload);
  window.dispatchEvent(new CustomEvent("nightlife:ranking-click", { detail: payload }));

  try {
    const history = JSON.parse(window.localStorage.getItem("nightlife_ranking_events") || "[]") as Array<Record<string, unknown>>;
    window.localStorage.setItem(
      "nightlife_ranking_events",
      JSON.stringify([{ ...payload, at: new Date().toISOString() }, ...history].slice(0, 100)),
    );
  } catch {
    window.localStorage.removeItem("nightlife_ranking_events");
  }
}
