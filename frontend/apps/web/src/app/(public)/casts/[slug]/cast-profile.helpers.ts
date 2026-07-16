import type { PublicCastDetail } from "@/lib/api/cast-detail";
import { isServiceOnlyBookingCategory } from "@/lib/store-categories";
import type { CastMedia, CastProfile } from "./cast-profile.types";

export const cityLabels: Record<string, string> = {
  hn: "Hà Nội",
  hcm: "TP.HCM",
};

export const languageLabels: Record<string, string> = {
  vi: "Tiếng Việt",
  ja: "Tiếng Nhật",
  en: "Tiếng Anh",
  ko: "Tiếng Hàn",
};

export const tagLabels: Record<string, string> = {
  "20s": "Độ tuổi 20",
  "30s": "Độ tuổi 30",
  bilingual: "Song ngữ",
  calm: "Điềm tĩnh",
  caring: "Caring",
  cocktail: "Cocktail",
  "cocktail-expert": "Cocktail",
  dancer: "Dance",
  elegant: "Thanh lịch",
  energetic: "Năng động",
  friendly: "Thân thiện",
  gentle: "Gentle",
  japanese: "Japanese style",
  ktv: "KTV",
  lounge: "Lounge",
  party: "Party",
  refined: "Tinh tế",
  "sake-expert": "Sake",
  "tea-lover": "Tea Lover",
  vip: "VIP",
  "vip-specialist": "VIP",
};

const emptyCastImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='1200' viewBox='0 0 900 1200'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop stop-color='%2319191d'/%3E%3Cstop offset='1' stop-color='%2331281b'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='900' height='1200' fill='url(%23g)'/%3E%3Ccircle cx='450' cy='420' r='118' fill='%23d6b15f' opacity='.26'/%3E%3Crect x='250' y='600' width='400' height='54' rx='27' fill='%23f0dda8' opacity='.2'/%3E%3Crect x='300' y='680' width='300' height='34' rx='17' fill='%23f0dda8' opacity='.13'/%3E%3C/svg%3E";

export const placeholderGallery: CastMedia[] = [
  {
    id: "placeholder-cast-media",
    type: "IMAGE",
    url: emptyCastImage,
    alt: "Ảnh profile cast",
    isPlaceholder: true,
  },
];

export function labelTag(tag: string) {
  return (
    tagLabels[tag] ?? tag.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}

export function labelLanguage(language: string) {
  return languageLabels[language.toLowerCase()] ?? language.toUpperCase();
}

export function formatVnd(value: number | null) {
  if (!value) return "Liên hệ";
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

export function formatShortVnd(value: number | null) {
  if (!value) return "Liên hệ";
  if (value >= 1_000_000) {
    return `${Number(value / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}tr`;
  }
  return `${Math.round(value / 1000)}K`;
}

export function formatMonth(value?: number | null) {
  if (!value || value < 1 || value > 12) return "Chưa cập nhật";
  return String(value).padStart(2, "0");
}

export function formatOptional(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "Chưa cập nhật";
  return String(value);
}

export function isPlaceholderCastMedia(media?: Pick<CastMedia, "id" | "isPlaceholder"> | null) {
  return Boolean(media?.isPlaceholder || media?.id === "placeholder-cast-media");
}

export function mediaBg(url?: string | null) {
  return url ? `url("${url}") center/cover` : "linear-gradient(135deg,#19191d,#2a2418)";
}

export function buildCastBio(cast: PublicCastDetail) {
  const name = cast.publicAlias ?? cast.name ?? cast.stageName;
  const adminBio = cast.publicBio?.trim() || cast.publicHeadline?.trim();

  return adminBio || `${name} đang hoạt động tại ${cast.store.name}.`;
}

export function galleryFromCast(cast: PublicCastDetail): CastMedia[] {
  const items = cast.gallery.flatMap((media) => {
    if (media.type !== "IMAGE" && media.type !== "VIDEO") return [];

    return [
      {
        id: media.id,
        type: media.type,
        url: media.url,
        alt: media.alt ?? cast.publicAlias ?? cast.stageName,
        purpose: media.purpose,
        mimeType: media.mimeType,
      },
    ];
  });

  if (cast.thumbnailUrl && !items.some((item) => item.url === cast.thumbnailUrl)) {
    items.unshift({
      id: `${cast.id}-thumbnail`,
      type: "IMAGE",
      url: cast.thumbnailUrl,
      alt: cast.publicAlias ?? cast.stageName,
      purpose: "thumbnail",
      mimeType: null,
    });
  }

  const seen = new Set<string>();

  const gallery = items.filter((item) => {
    if (!item.url || seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });

  return gallery.length ? gallery : placeholderGallery;
}

export function profileFromCastDetail(cast: PublicCastDetail): CastProfile {
  const name = cast.publicAlias ?? cast.name ?? cast.stageName;

  return {
    id: cast.id,
    slug: cast.slug,
    stageName: cast.stageName,
    name,
    publicHeadline: cast.publicHeadline ?? "Cast đã được duyệt public",
    bio: buildCastBio(cast),
    tags: cast.tags,
    languages: cast.languages.length ? cast.languages : ["vi"],
    hourlyRateVnd: cast.hourlyRateVnd ?? null,
    thumbnailUrl:
      cast.thumbnailUrl ?? cast.gallery.find((item) => item.type === "IMAGE")?.url ?? null,
    gallery: galleryFromCast(cast),
    monthOfBirth: cast.monthOfBirth ?? null,
    zodiacSign: cast.zodiacSign ?? null,
    heightCm: cast.heightCm ?? null,
    measurements: cast.measurements ?? null,
    interests: cast.interests,
    styleTags: cast.styleTags ?? [],
    rating: 4.8,
    store: cast.store,
    relatedCasts: cast.relatedCasts ?? [],
  };
}

export function buildCastArea(profile: CastProfile) {
  return [
    profile.store.area?.name ?? profile.store.district,
    cityLabels[profile.store.cityCode ?? ""] ?? profile.store.city,
  ]
    .filter(Boolean)
    .join(", ");
}

export function buildBookingHref(profile: CastProfile, area: string) {
  const params = new URLSearchParams({
    storeSlug: profile.store.slug,
    storeName: profile.store.name,
    category: profile.store.category,
    area,
  });

  if (!isServiceOnlyBookingCategory(profile.store.category)) {
    params.set("castSlug", profile.slug);
    params.set("castName", profile.name);
  }

  return `/dat-cho?${params.toString()}`;
}

export function videoEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v") || parsed.pathname.split("/").filter(Boolean).at(-1);
      return id
        ? { kind: "iframe" as const, url: `https://www.youtube.com/embed/${id}` }
        : { kind: "video" as const, url };
    }
    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id
        ? { kind: "iframe" as const, url: `https://www.youtube.com/embed/${id}` }
        : { kind: "video" as const, url };
    }
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).at(-1);
      return id
        ? { kind: "iframe" as const, url: `https://player.vimeo.com/video/${id}` }
        : { kind: "video" as const, url };
    }
    if (parsed.hostname.includes("tiktok.com")) {
      const id = parsed.pathname.match(/video\/(\d+)/)?.[1];
      return id
        ? { kind: "iframe" as const, url: `https://www.tiktok.com/embed/v2/${id}` }
        : { kind: "link" as const, url };
    }
    if (parsed.hostname.includes("instagram.com")) {
      const embedPath = parsed.pathname.endsWith("/")
        ? `${parsed.pathname}embed`
        : `${parsed.pathname}/embed`;
      return { kind: "iframe" as const, url: `${parsed.origin}${embedPath}` };
    }
  } catch {
    return { kind: "video" as const, url };
  }

  return { kind: "video" as const, url };
}
