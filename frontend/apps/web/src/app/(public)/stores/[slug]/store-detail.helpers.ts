import type {
  PublicStoreDetail,
  StoreActiveCoupon,
  StoreGalleryItem,
  StoreOpeningHour,
} from "@/lib/api/store-detail";

export type StoreTab = "overview" | "pricing" | "casts" | "map";

export const storeDetailTabs: Array<{ id: StoreTab; label: string }> = [
  { id: "overview", label: "Giới thiệu" },
  { id: "pricing", label: "Bảng giá" },
  { id: "casts", label: "Cast" },
  { id: "map", label: "Bản đồ" },
];

export const categoryLabels: Record<string, string> = {
  BAR: "Bar",
  CLUB: "Club",
  LOUNGE: "Lounge",
  GIRLS_BAR: "Girls bar",
  KARAOKE: "Karaoke/KTV",
  MASSAGE_SPA: "Massage spa",
  RESTAURANT: "Nhà hàng",
  CASINO: "Casino lounge",
};

export const weekdayLabels: Array<[string, string]> = [
  ["monday", "Thứ 2"],
  ["tuesday", "Thứ 3"],
  ["wednesday", "Thứ 4"],
  ["thursday", "Thứ 5"],
  ["friday", "Thứ 6"],
  ["saturday", "Thứ 7"],
  ["sunday", "CN"],
];

export const formatVnd = (value?: number | null) => {
  if (!value) {
    return "Liên hệ";
  }

  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
};

export const readableName = (name: string) => {
  const parts = name.split(/—|-/);
  return parts[parts.length - 1]?.trim() || name;
};

export const getInitials = (name: string) =>
  readableName(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

export const formatDiscount = (coupon: StoreActiveCoupon) => {
  if (coupon.discountType === "PERCENT") {
    return `-${coupon.discountValue}%`;
  }

  return `-${formatVnd(coupon.discountValue)}`;
};

export const formatDateOption = (date: Date) =>
  new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(date);

export const openingText = (slot?: StoreOpeningHour | null) => {
  if (!slot) {
    return "Chưa cập nhật";
  }

  if (slot.closed) {
    return "Nghỉ";
  }

  if (slot.open && slot.close) {
    return `${slot.open} - ${slot.close}`;
  }

  return slot.note || "Chưa cập nhật";
};

const mapQueryEmbedUrl = (store: PublicStoreDetail) => {
  if (typeof store.latitude === "number" && typeof store.longitude === "number") {
    return `https://maps.google.com/maps?q=${store.latitude},${store.longitude}&z=15&output=embed`;
  }

  const address = [store.address, store.district, store.city].filter(Boolean).join(", ");
  return address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`
    : "";
};

const googleMapQueryEmbedUrl = (query: string) =>
  query.trim()
    ? `https://maps.google.com/maps?q=${encodeURIComponent(query.trim())}&z=15&output=embed`
    : "";

const mapResolverEmbedUrl = (mapUrl: string, fallbackEmbedUrl: string) => {
  const params = new URLSearchParams({ url: mapUrl });
  if (fallbackEmbedUrl) {
    params.set("fallback", fallbackEmbedUrl);
  }

  return `/api/maps/embed?${params.toString()}`;
};

const isShortGoogleMapUrl = (value: string) => {
  try {
    const host = new URL(value).hostname.replace(/^www\./, "");
    return host === "maps.app.goo.gl" || host === "goo.gl" || host === "g.co";
  } catch {
    return false;
  }
};

export const mapEmbedUrl = (store: PublicStoreDetail) => {
  const mapUrl = store.mapUrl?.trim();
  const fallbackEmbedUrl = mapQueryEmbedUrl(store);

  if (mapUrl) {
    if (mapUrl.includes("output=embed") || mapUrl.includes("/maps/embed")) {
      return mapUrl;
    }

    if (isShortGoogleMapUrl(mapUrl)) {
      return mapResolverEmbedUrl(mapUrl, fallbackEmbedUrl);
    }

    if (mapUrl.includes("/maps") || mapUrl.includes("maps.google.")) {
      try {
        const parsedMapUrl = new URL(mapUrl);
        const decodedHref = decodeURIComponent(parsedMapUrl.href);

        const pinMatch = decodedHref.match(/!3d(-?\d+(?:\.\d+)?)[^\d!]*!4d(-?\d+(?:\.\d+)?)/);
        if (pinMatch) {
          return googleMapQueryEmbedUrl(`${pinMatch[1]},${pinMatch[2]}`);
        }

        const queryParam =
          parsedMapUrl.searchParams.get("q") ||
          parsedMapUrl.searchParams.get("query") ||
          parsedMapUrl.searchParams.get("destination") ||
          parsedMapUrl.searchParams.get("daddr");
        if (queryParam && queryParam.trim() && !queryParam.startsWith("@")) {
          return googleMapQueryEmbedUrl(queryParam.trim());
        }

        const placeMatch = parsedMapUrl.pathname.match(/\/place\/([^\/]+)/);
        if (placeMatch && placeMatch[1]) {
          const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, " ")).trim();
          if (placeName && !placeName.startsWith("@")) {
            return googleMapQueryEmbedUrl(placeName);
          }
        }

        const coordinateMatch = decodedHref.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
        if (coordinateMatch) {
          return googleMapQueryEmbedUrl(`${coordinateMatch[1]},${coordinateMatch[2]}`);
        }

        const query =
          parsedMapUrl.pathname
            .split("/")
            .map((part) => decodeURIComponent(part.replace(/\+/g, " ")))
            .filter((part) => part && !["maps", "place", "search", "dir"].includes(part))
            .at(0) ||
          "";

        return googleMapQueryEmbedUrl(query) || mapResolverEmbedUrl(mapUrl, fallbackEmbedUrl);
      } catch {
        return mapResolverEmbedUrl(mapUrl, fallbackEmbedUrl);
      }
    }
  }

  return fallbackEmbedUrl;
};

export const youtubeThumbnailUrl = (url?: string | null) => {
  if (!url) {
    return "";
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    let videoId = "";

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname.startsWith("/embed/")) {
        videoId = parsed.pathname.split("/").filter(Boolean)[1] ?? "";
      } else if (parsed.pathname.startsWith("/shorts/")) {
        videoId = parsed.pathname.split("/").filter(Boolean)[1] ?? "";
      } else {
        videoId = parsed.searchParams.get("v") ?? parsed.pathname.split("/").filter(Boolean).at(-1) ?? "";
      }
    }

    if (host === "youtu.be") {
      videoId = parsed.pathname.split("/").filter(Boolean)[0] ?? "";
    }

    return videoId ? `https://img.youtube.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg` : "";
  } catch {
    return "";
  }
};

export const mediaVisualUrl = (media?: StoreGalleryItem | null) => {
  const thumbnailUrl = media?.thumbnailUrl?.trim();

  if (thumbnailUrl) {
    return thumbnailUrl;
  }

  if (media?.type === "IMAGE" && media.url) {
    return media.url;
  }

  if (media?.type === "VIDEO") {
    return youtubeThumbnailUrl(media.url);
  }

  return "";
};

export const mediaBackground = (media?: StoreGalleryItem | null) => {
  const visualUrl = mediaVisualUrl(media);

  return visualUrl
    ? `url("${visualUrl}")`
    : "linear-gradient(135deg, #18181c 0%, #2f2a22 48%, #111114 100%)";
};

export const videoEmbedUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname.startsWith("/embed/")) {
        return url;
      }

      const videoId = parsed.searchParams.get("v") || parsed.pathname.split("/").filter(Boolean).at(-1);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }

    if (host === "youtu.be") {
      const videoId = parsed.pathname.split("/").filter(Boolean)[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }

    if (host === "vimeo.com") {
      const videoId = parsed.pathname.split("/").filter(Boolean)[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }
  } catch {
    return url;
  }

  return url;
};
