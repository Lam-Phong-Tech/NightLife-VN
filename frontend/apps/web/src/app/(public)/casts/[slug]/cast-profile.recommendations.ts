import type { RelatedCast } from "@/lib/api/cast-detail";
import type { CastProfile } from "./cast-profile.types";

type ViewerSignals = {
  language?: string;
  tier?: string;
  clickedTags: Set<string>;
  clickedStores: Set<string>;
};

const relatedReasonScore: Record<RelatedCast["relatedReason"], number> = {
  "same-store": 40,
  ranking: 30,
  "same-area": 24,
  "same-tag": 18,
};

function readViewerSignals(): ViewerSignals {
  const signals: ViewerSignals = {
    language: undefined,
    tier: undefined,
    clickedTags: new Set<string>(),
    clickedStores: new Set<string>(),
  };

  if (typeof window === "undefined") return signals;

  signals.language = navigator.language?.toLowerCase().startsWith("ja") ? "ja" : undefined;

  try {
    const context = JSON.parse(window.localStorage.getItem("nightlife_member_context") || "{}") as {
      language?: string;
      tier?: string;
    };
    signals.language = context.language?.toLowerCase() || signals.language;
    signals.tier = context.tier?.toUpperCase();
  } catch {
    window.localStorage.removeItem("nightlife_member_context");
  }

  try {
    const history = JSON.parse(window.localStorage.getItem("nightlife_cast_detail_events") || "[]") as Array<{
      tags?: string[];
      storeSlug?: string;
    }>;

    history.slice(0, 20).forEach((event) => {
      event.tags?.forEach((tag) => signals.clickedTags.add(tag));
      if (event.storeSlug) signals.clickedStores.add(event.storeSlug);
    });
  } catch {
    window.localStorage.removeItem("nightlife_cast_detail_events");
  }

  return signals;
}

function scoreRelatedCast(current: CastProfile, related: RelatedCast, signals: ViewerSignals) {
  let score = relatedReasonScore[related.relatedReason] ?? 0;

  if (related.store.slug === current.store.slug) score += 14;
  if (signals.language && related.languages.includes(signals.language)) score += 12;
  if (signals.tier === "VIP" && related.tags.some((tag) => tag.includes("vip"))) score += 10;
  if (signals.clickedStores.has(related.store.slug)) score += 8;
  score += related.tags.filter((tag) => current.tags.includes(tag) || signals.clickedTags.has(tag)).length * 6;

  return score;
}

export function personalizeRelatedCasts(current: CastProfile, relatedCasts: RelatedCast[]) {
  const signals = readViewerSignals();

  return [...relatedCasts]
    .map((related) => ({ related, score: scoreRelatedCast(current, related, signals) }))
    .sort((left, right) => right.score - left.score)
    .map(({ related }) => related)
    .slice(0, 6);
}

export function recommendationLabel(cast: RelatedCast) {
  if (cast.relatedReason === "ranking") return "Đang ranking";
  if (cast.relatedReason === "same-store") return "Cùng quán";
  if (cast.relatedReason === "same-area") return "Cùng khu vực";
  return "Hợp tag";
}

export function personalizationBadges(profile: CastProfile) {
  const badges: string[] = [];

  if (profile.languages.includes("ja")) badges.push("Hợp khách Nhật");
  if (profile.languages.length > 1) badges.push("Đa ngôn ngữ");
  if (profile.tags.some((tag) => tag.includes("vip"))) badges.push("VIP friendly");

  return badges.slice(0, 3);
}
