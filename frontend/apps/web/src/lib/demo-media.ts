const storeFallbackImages = [
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1100&q=80",
  "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1100&q=80",
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1100&q=80",
  "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=1100&q=80",
  "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=1100&q=80",
  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1100&q=80",
];

const castFallbackImages = [
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=800&q=80",
];

export const storeImageBySlug: Record<string, string> = {
  "moonlight-bar":
    "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1100&q=80",
  "moonlight-q1-bar":
    "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1100&q=80",
  "velvet-club":
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1100&q=80",
  "sakura-lounge":
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1100&q=80",
  "sakura-lounge-quan-3":
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1100&q=80",
  "golden-voice-ktv":
    "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=1100&q=80",
  "golden-voice-ktv-quan-7":
    "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=1100&q=80",
  "hanami-dining":
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1100&q=80",
  "lotus-massage-spa":
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1100&q=80",
  "lotus-massage-spa-quan-3":
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1100&q=80",
  "crimson-bar":
    "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1100&q=80",
  "crimson-bar-hoan-kiem":
    "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1100&q=80",
  "neon-club":
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1100&q=80",
  "neon-district-club":
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1100&q=80",
  "jade-lounge":
    "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=1100&q=80",
  "jade-casino-hoan-kiem":
    "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=1100&q=80",
  "star-ktv":
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1100&q=80",
  "tokyo-kitchen":
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1100&q=80",
  "tokyo-kitchen-old-quarter":
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1100&q=80",
  "dragon-rooftop-da-nang":
    "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=1100&q=80",
  "son-tra-lounge":
    "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1100&q=80",
  "harbor-ktv-hai-phong":
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1100&q=80",
  "opera-spa-hai-phong":
    "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=1100&q=80",
};

export const castImageBySlug: Record<string, string> = {
  "sakura-moonlight":
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=800&q=80",
  "miyuki-moonlight":
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
  "rina-velvet":
    "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=800&q=80",
  "aya-velvet":
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
  "yuki-sakura-lounge":
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
  "hana-sakura-lounge":
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
  "mai-golden":
    "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80",
  "nana-golden":
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80",
  "mika-golden-ktv":
    "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=800&q=80",
  "rumi-hanami":
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
  "kaori-hanami":
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  "misaki-crimson":
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
  "rei-crimson":
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
  "linh-crimson-bar":
    "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=800&q=80",
  "yuna-neon":
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
  "yuna-neon-district":
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
  "sora-neon":
    "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80",
  "akari-jade":
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  "hikaru-jade":
    "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=800&q=80",
  "erika-star":
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
  "tsubasa-star":
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=800&q=80",
  "kotone-tokyo":
    "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=800&q=80",
  "kotone-tokyo-kitchen":
    "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=800&q=80",
  "aoi-tokyo":
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80",
  "sakura-moonlight-q1":
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=800&q=80",
  "lina-dragon-rooftop":
    "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80",
  "mai-dragon-rooftop":
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
  "nami-son-tra":
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
  "eri-son-tra":
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
  "mika-harbor-ktv":
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80",
  "hana-harbor-ktv":
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  "sumi-opera-spa":
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
  "yuri-opera-spa":
    "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=800&q=80",
  "sumi-lotus-massage-spa":
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
};

const normalizeSlug = (slug?: string | null) => slug?.trim().toLowerCase() ?? "";

const pickByIndex = (items: readonly string[], index: number) =>
  items[Math.abs(index) % items.length] ?? items[0]!;

const isImageUrl = (value?: string): value is string => Boolean(value);

export function storeImageForSlug(slug?: string | null, index = 0) {
  return storeImageBySlug[normalizeSlug(slug)] ?? pickByIndex(storeFallbackImages, index);
}

export function castImageForSlug(slug?: string | null, index = 0) {
  return castImageBySlug[normalizeSlug(slug)] ?? pickByIndex(castFallbackImages, index);
}

export function storeGalleryForSlug(slug?: string | null, alt = "NightLife venue") {
  const base = storeImageForSlug(slug);
  const normalized = normalizeSlug(slug);
  const second = normalized.includes("spa")
    ? storeImageBySlug["opera-spa-hai-phong"]
    : normalized.includes("kitchen") || normalized.includes("dining")
      ? storeImageBySlug["hanami-dining"]
      : storeImageBySlug["crimson-bar"];
  const third = normalized.includes("ktv")
    ? storeImageBySlug["harbor-ktv-hai-phong"]
    : storeImageBySlug["neon-club"];

  return [base, second, third].filter(isImageUrl).map((url, index) => ({
    id: `fallback-${normalized || "store"}-${index + 1}`,
    type: "IMAGE" as const,
    url,
    purpose: index === 0 ? "hero" : "gallery",
    mimeType: "image/jpeg",
    alt,
  }));
}

export function castGalleryForSlug(slug?: string | null, alt = "Cast profile") {
  const base = castImageForSlug(slug);
  const normalized = normalizeSlug(slug);

  return [base, castImageForSlug(`${normalized}-gallery`, normalized.length + 1)]
    .filter(isImageUrl)
    .map((url, index) => ({
      id: `fallback-${normalized || "cast"}-${index + 1}`,
      type: "IMAGE" as const,
      url,
      purpose: index === 0 ? "avatar" : "gallery",
      mimeType: "image/jpeg",
      alt,
    }));
}
