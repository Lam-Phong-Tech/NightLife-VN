import type { RelatedStore } from "@/lib/api/store-detail";

type StoredUser = {
  tier?: string | null;
};

type StoredEvent = {
  category?: string;
  action?: string;
};

const premiumCategories = new Set(["LOUNGE", "GIRLS_BAR", "KARAOKE", "CASINO"]);
const japaneseGuestCategories = new Set(["GIRLS_BAR", "KARAOKE", "LOUNGE", "RESTAURANT"]);

const relatedReasonScore: Record<string, number> = {
  "same-area": 12,
  "same-category": 9,
  "same-city": 5,
};

const readJson = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
};

const isJapaneseGuest = () => {
  if (typeof navigator === "undefined") {
    return false;
  }

  return navigator.languages?.some((language) => language.toLowerCase().startsWith("ja")) ||
    navigator.language?.toLowerCase().startsWith("ja");
};

const memberTier = () => readJson<StoredUser | null>("nightlife_user", null)?.tier?.toUpperCase() ?? "";

const behaviorCategories = () =>
  readJson<StoredEvent[]>("nightlife_store_detail_events", [])
    .map((event) => event.category)
    .filter(Boolean);

export const personalizeRelatedStores = (stores: RelatedStore[]) => {
  const japaneseGuest = isJapaneseGuest();
  const tier = memberTier();
  const visitedCategories = new Set(behaviorCategories());

  return [...stores].sort((a, b) => scoreRelatedStore(b, japaneseGuest, tier, visitedCategories) -
    scoreRelatedStore(a, japaneseGuest, tier, visitedCategories));
};

export const recommendationLabel = (store: RelatedStore) => {
  if (store.relatedReason === "same-area") {
    return "Gợi ý cùng khu vực";
  }

  if (store.relatedReason === "same-category") {
    return "Gợi ý cùng loại hình";
  }

  return "Gợi ý tương tự";
};

function scoreRelatedStore(
  store: RelatedStore,
  japaneseGuest: boolean,
  tier: string,
  visitedCategories: Set<string | undefined>,
) {
  let score = relatedReasonScore[store.relatedReason ?? "same-city"] ?? 0;

  if (japaneseGuest && japaneseGuestCategories.has(store.category)) {
    score += 5;
  }

  if ((tier === "VIP" || tier === "PREMIUM") && premiumCategories.has(store.category)) {
    score += 4;
  }

  if (visitedCategories.has(store.category)) {
    score += 3;
  }

  return score;
}
