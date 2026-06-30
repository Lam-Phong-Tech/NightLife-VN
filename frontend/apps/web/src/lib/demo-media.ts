const storeImageSlugs = [
  "moonlight-bar",
  "moonlight-q1-bar",
  "velvet-club",
  "sakura-lounge",
  "sakura-lounge-quan-3",
  "golden-voice-ktv",
  "golden-voice-ktv-quan-7",
  "hanami-dining",
  "lotus-massage-spa",
  "lotus-massage-spa-quan-3",
  "crimson-bar",
  "crimson-bar-hoan-kiem",
  "neon-club",
  "neon-district-club",
  "jade-lounge",
  "jade-casino-hoan-kiem",
  "star-ktv",
  "tokyo-kitchen",
  "tokyo-kitchen-old-quarter",
  "dragon-rooftop-da-nang",
  "son-tra-lounge",
  "harbor-ktv-hai-phong",
  "opera-spa-hai-phong",
] as const;

const castImageSlugs = [
  "sakura-moonlight",
  "miyuki-moonlight",
  "rina-velvet",
  "aya-velvet",
  "yuki-sakura-lounge",
  "hana-sakura-lounge",
  "mai-golden",
  "nana-golden",
  "mika-golden-ktv",
  "rumi-hanami",
  "kaori-hanami",
  "misaki-crimson",
  "rei-crimson",
  "linh-crimson-bar",
  "yuna-neon",
  "yuna-neon-district",
  "sora-neon",
  "akari-jade",
  "hikaru-jade",
  "erika-star",
  "tsubasa-star",
  "kotone-tokyo",
  "kotone-tokyo-kitchen",
  "aoi-tokyo",
  "sakura-moonlight-q1",
  "lina-dragon-rooftop",
  "mai-dragon-rooftop",
  "nami-son-tra",
  "eri-son-tra",
  "mika-harbor-ktv",
  "hana-harbor-ktv",
  "sumi-opera-spa",
  "yuri-opera-spa",
  "sumi-lotus-massage-spa",
] as const;

const normalizeSlug = (slug?: string | null) => slug?.trim().toLowerCase() ?? "";
const storeAsset = (slug: string) => `/media/demo/stores/${slug}.jpg`;
const castAsset = (slug: string) => `/media/demo/casts/${slug}.jpg`;

const storeFallbackImages = [
  "neon-club",
  "crimson-bar",
  "jade-lounge",
  "tokyo-kitchen",
  "star-ktv",
  "lotus-massage-spa",
].map(storeAsset);

const castFallbackImages = [
  "yuna-neon",
  "akari-jade",
  "aoi-tokyo",
  "kotone-tokyo",
  "tsubasa-star",
  "erika-star",
  "hikaru-jade",
  "sora-neon",
].map(castAsset);

export const storeImageBySlug = Object.fromEntries(
  storeImageSlugs.map((slug) => [slug, storeAsset(slug)]),
) as Record<string, string>;

export const castImageBySlug = Object.fromEntries(
  castImageSlugs.map((slug) => [slug, castAsset(slug)]),
) as Record<string, string>;

const pickByIndex = (items: readonly string[], index: number) =>
  items[Math.abs(index) % items.length] ?? items[0]!;

const isImageUrl = (value?: string): value is string => Boolean(value);
const uniqueImageUrls = (items: Array<string | undefined>) => [
  ...new Set(items.filter(isImageUrl)),
];

export function storeImageForSlug(slug?: string | null, index = 0) {
  return storeImageBySlug[normalizeSlug(slug)] ?? pickByIndex(storeFallbackImages, index);
}

export function castImageForSlug(slug?: string | null, index = 0) {
  return castImageBySlug[normalizeSlug(slug)] ?? pickByIndex(castFallbackImages, index);
}

export function storeGalleryForSlug(slug?: string | null, alt = "NightLife venue") {
  const base = storeImageForSlug(slug);
  const normalized = normalizeSlug(slug);
  const isRestaurant = normalized.includes("kitchen") || normalized.includes("dining");
  const isKtv = normalized.includes("ktv") || normalized.includes("karaoke");
  const isSpa = normalized.includes("spa") || normalized.includes("massage");
  const isRooftop = normalized.includes("rooftop") || normalized.includes("harbor");
  const alternates = isSpa
    ? ["lotus-massage-spa", "opera-spa-hai-phong", "lotus-massage-spa-quan-3"]
    : isRestaurant
      ? ["tokyo-kitchen", "hanami-dining", "tokyo-kitchen-old-quarter"]
      : isKtv
        ? ["star-ktv", "golden-voice-ktv", "harbor-ktv-hai-phong"]
        : isRooftop
          ? ["dragon-rooftop-da-nang", "son-tra-lounge", "harbor-ktv-hai-phong"]
          : ["crimson-bar", "neon-club", "jade-lounge", "velvet-club"];
  const gallery = uniqueImageUrls([base, ...alternates.map((item) => storeImageBySlug[item])]);

  return gallery.slice(0, 4).map((url, index) => ({
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
  const gallery = uniqueImageUrls([
    base,
    castImageForSlug(`${normalized}-gallery`, normalized.length + 1),
    castImageForSlug(`${normalized}-portrait`, normalized.length + 5),
  ]);

  return gallery.slice(0, 3).map((url, index) => ({
    id: `fallback-${normalized || "cast"}-${index + 1}`,
    type: "IMAGE" as const,
    url,
    purpose: index === 0 ? "avatar" : "gallery",
    mimeType: "image/jpeg",
    alt,
  }));
}
