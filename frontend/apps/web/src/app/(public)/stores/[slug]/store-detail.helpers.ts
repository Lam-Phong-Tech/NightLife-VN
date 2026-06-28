import type {
  PublicStoreDetail,
  StoreActiveCoupon,
  StoreGalleryItem,
  StoreOpeningHour,
} from "@/lib/api/store-detail";

export type StoreTab = "overview" | "pricing" | "casts" | "reviews" | "map";

export const storeDetailTabs: Array<{ id: StoreTab; label: string }> = [
  { id: "overview", label: "Giới thiệu" },
  { id: "pricing", label: "Bảng giá" },
  { id: "casts", label: "Cast" },
  { id: "reviews", label: "Đánh giá" },
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

export const mapEmbedUrl = (store: PublicStoreDetail) => {
  if (store.mapUrl) {
    return store.mapUrl.includes("output=embed")
      ? store.mapUrl
      : `${store.mapUrl}${store.mapUrl.includes("?") ? "&" : "?"}output=embed`;
  }

  if (typeof store.latitude === "number" && typeof store.longitude === "number") {
    return `https://www.google.com/maps?q=${store.latitude},${store.longitude}&output=embed`;
  }

  return "";
};

export const mediaBackground = (media?: StoreGalleryItem | null) =>
  media?.type === "IMAGE" && media.url
    ? `linear-gradient(180deg, rgba(10,10,12,.18), rgba(10,10,12,.66)), url("${media.url}")`
    : "linear-gradient(135deg, #18181c 0%, #2f2a22 48%, #111114 100%)";

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
