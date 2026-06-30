import type { PublicCastDetail } from "@/lib/api/cast-detail";
import { castGalleryForSlug, castImageForSlug } from "@/lib/demo-media";
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

export const placeholderGallery: CastMedia[] = [
  {
    id: "placeholder-portrait-1",
    type: "IMAGE",
    url: castImageForSlug("yuna-neon"),
    alt: "Ảnh profile cast",
  },
  {
    id: "placeholder-portrait-2",
    type: "IMAGE",
    url: castImageForSlug("akari-jade"),
    alt: "Ảnh gallery cast",
  },
  {
    id: "placeholder-video",
    type: "VIDEO",
    url: "https://videos.pexels.com/video-files/7271837/7271837-uhd_3840_2160_25fps.mp4",
    alt: "Video giới thiệu cast",
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

export function mediaBg(url: string) {
  return `url("${url}") center/cover`;
}

export function buildCastBio(cast: PublicCastDetail) {
  const name = cast.publicAlias ?? cast.name ?? cast.stageName;
  const tags = cast.tags.slice(0, 3).map(labelTag).join(", ").toLowerCase();
  const languages = cast.languages.map(labelLanguage).join(", ");

  return (
    cast.publicBio ??
    cast.publicHeadline ??
    `${name} đang hoạt động tại ${cast.store.name}. Phù hợp booking theo cast${
      tags ? ` với phong cách ${tags}` : ""
    }. Ngôn ngữ hỗ trợ: ${languages || "Tiếng Việt"}.`
  );
}

export function galleryFromCast(cast: PublicCastDetail): CastMedia[] {
  const localGallery = castGalleryForSlug(cast.slug, cast.publicAlias ?? cast.stageName);
  const videoItems = cast.gallery.flatMap((media) => {
    if (media.type !== "VIDEO") return [];

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
  const items = [...localGallery, ...videoItems];
  const seen = new Set<string>();

  const gallery = items.filter((item) => {
    if (!item.url || seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });

  return gallery.length ? gallery : localGallery;
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
    thumbnailUrl: castImageForSlug(cast.slug),
    gallery: galleryFromCast(cast),
    monthOfBirth: cast.monthOfBirth ?? null,
    zodiacSign: cast.zodiacSign ?? null,
    heightCm: cast.heightCm ?? null,
    measurements: cast.measurements ?? null,
    interests: cast.interests,
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
  return `/dat-cho?${new URLSearchParams({
    castSlug: profile.slug,
    castName: profile.name,
    storeSlug: profile.store.slug,
    storeName: profile.store.name,
    area,
  }).toString()}`;
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
