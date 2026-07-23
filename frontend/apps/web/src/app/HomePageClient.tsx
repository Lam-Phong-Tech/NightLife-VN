"use client";

import React, { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  Camera,
  ChevronDown,
  ChevronRight,
  Crown,
  Gem,
  Gift,
  Heart,
  Home,
  Map,
  MapPin,
  Martini,
  Mic,
  Music,
  Newspaper,
  Play,
  QrCode,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Ticket,
  UserRound,
  Utensils,
  Waves,
  type LucideIcon,
} from "lucide-react";

import { PlaceholderMedia } from "@/components/ui/MediaPlaceholder";
import { DataSkeleton } from "@/components/ui/DataLoading";
import { useSystemFeedback } from "@/components/ui/SystemFeedback";
import { discoveryApi, type PublicStore } from "@/lib/api/discovery";
import {
  contentApi,
  getCmsContentImageUrl,
  type CmsContentItem,
  type PublicHomeRecommendation,
  type PublicHotVideo,
} from "@/lib/api/content";
import { tourApi, type PublicTour } from "@/lib/api/tours";
import { couponApi, type PublicCoupon } from "@/lib/api/coupons";
import { campaignsApi, type CampaignItem } from "@/lib/api/campaigns";
import { rankingsApi, type PublicRankingItem } from "@/lib/api/rankings";
import { ApiError, resolveClientUrl } from "@/lib/api/client";
import { storeFavoriteApi } from "@/lib/api/store-favorite";
import {
  DEFAULT_APPEARANCE_CONFIG,
  findAppearanceTitle,
  getAppearanceConfig,
  getCachedAppearanceConfig,
  type AppearanceConfig,
  type AppearanceItem,
} from "@/lib/api/appearance";
import { formatPriceTier } from "@/lib/price-tier";
import { useMoneyFormatter } from "@/components/providers/CurrencyProvider";
import {
  getHomeAnonymousId,
  getHomeBehaviorSignals,
  hasLikedHotVideo,
  shouldTrackHotVideoView,
  trackHomeVenueSignal,
} from "@/lib/analytics/home";
import { storeImageForSlug } from "@/lib/demo-media";
import { translateText } from "@/lib/i18n/client-translations";
import { formatVndByLanguage, type CurrencyRateMap } from "@/lib/i18n/currency-format";
import { useActiveLanguage, type LanguageCode } from "@/lib/i18n/use-active-language";
import { hasMemberFavoriteAccess, redirectToLoginForFavorite, requireMemberFavoriteAccess } from "@/lib/member-favorite-auth";
import { readFavoriteStoreSlugs, replaceFavoriteStores, writeFavoriteStore, type SavedFavoriteStore } from "@/lib/member-favorites";
import {
  buildBookingConfirmationFlashToast,
  readBookingConfirmationFlashToast,
} from "@/lib/booking-confirmation-flash";
import { useUserActionFeedback, userActionErrorMessage } from "@/lib/user-action-feedback";

const colors = {
  shell: "var(--vy-bg)",
  ink: "var(--vy-bg)",
  line: "var(--vy-border-gold-22)",
  gold: "var(--vy-gold)",
  goldSoft: "var(--vy-gold-pale)",
  muted: "var(--vy-muted)",
  text: "var(--vy-text)",
  dim: "var(--vy-faint)",
  rose: "var(--vy-pink)",
};

const categoryItems = [
  { label: "Tìm quán", icon: MapPin, href: "/danh-sach-quan" },
  { label: "Tìm Cast", icon: UserRound, href: "/danh-sach-cast" },
  { label: "Ưu đãi", icon: Ticket, href: "/uu-dai" },
  { label: "Tour", icon: Map, href: "/tour" },
  { label: "Ranking", icon: Crown, href: "/xep-hang" },
  { label: "Spa", icon: Waves, href: "/spa" },
  { label: "Nhà hàng", icon: Utensils, href: "/nha-hang" },
  { label: "VIP", icon: Star, href: "/dang-nhap", featured: true },
];

type HomeCategoryItem = {
  label: string;
  icon: LucideIcon;
  iconUrl?: string;
  color?: string;
  href: string;
  featured?: boolean;
};

type HomeFavoriteFeedbackKey =
  | "addedTitle"
  | "removedTitle"
  | "updateErrorTitle"
  | "updateErrorFallback"
  | "saveConfirmTitle"
  | "removeConfirmTitle"
  | "saveConfirmLabel"
  | "removeConfirmLabel";

type HomeFavoriteFeedbackCopy = Record<HomeFavoriteFeedbackKey, string> & {
  addedDescription: (storeName: string) => string;
  removedDescription: (storeName: string) => string;
  saveConfirmDescription: (storeName: string) => string;
  removeConfirmDescription: (storeName: string) => string;
};

const homeFavoriteFeedbackCopy: Record<LanguageCode, HomeFavoriteFeedbackCopy> = {
  vi: {
    addedTitle: "Đã thêm quán yêu thích",
    removedTitle: "Đã bỏ lưu quán",
    updateErrorTitle: "Không cập nhật được yêu thích",
    updateErrorFallback: "Vui lòng thử lại sau.",
    saveConfirmTitle: "Lưu quán yêu thích?",
    removeConfirmTitle: "Bỏ lưu quán?",
    saveConfirmLabel: "Lưu quán",
    removeConfirmLabel: "Bỏ lưu",
    addedDescription: (storeName) => `${storeName} đã được lưu vào danh sách yêu thích.`,
    removedDescription: (storeName) => `${storeName} đã được gỡ khỏi danh sách yêu thích.`,
    saveConfirmDescription: (storeName) => `Thêm ${storeName} vào danh sách yêu thích của bạn.`,
    removeConfirmDescription: (storeName) => `Gỡ ${storeName} khỏi danh sách yêu thích của bạn.`,
  },
  en: {
    addedTitle: "Venue saved",
    removedTitle: "Venue removed",
    updateErrorTitle: "Could not update favorites",
    updateErrorFallback: "Please try again later.",
    saveConfirmTitle: "Save this venue?",
    removeConfirmTitle: "Remove saved venue?",
    saveConfirmLabel: "Save venue",
    removeConfirmLabel: "Remove",
    addedDescription: (storeName) => `${storeName} has been added to your favorites.`,
    removedDescription: (storeName) => `${storeName} has been removed from your favorites.`,
    saveConfirmDescription: (storeName) => `Add ${storeName} to your favorites.`,
    removeConfirmDescription: (storeName) => `Remove ${storeName} from your favorites.`,
  },
  ja: {
    addedTitle: "お気に入りに追加しました",
    removedTitle: "保存を解除しました",
    updateErrorTitle: "お気に入りを更新できません",
    updateErrorFallback: "しばらくしてからもう一度お試しください。",
    saveConfirmTitle: "この店舗を保存しますか？",
    removeConfirmTitle: "保存した店舗を解除しますか？",
    saveConfirmLabel: "保存する",
    removeConfirmLabel: "解除する",
    addedDescription: (storeName) => `「${storeName}」をお気に入りに追加しました。`,
    removedDescription: (storeName) => `「${storeName}」をお気に入りから削除しました。`,
    saveConfirmDescription: (storeName) => `「${storeName}」をお気に入りに追加します。`,
    removeConfirmDescription: (storeName) => `「${storeName}」をお気に入りから削除します。`,
  },
  ko: {
    addedTitle: "즐겨찾기에 추가했습니다",
    removedTitle: "저장을 해제했습니다",
    updateErrorTitle: "즐겨찾기를 업데이트할 수 없습니다",
    updateErrorFallback: "잠시 후 다시 시도해 주세요.",
    saveConfirmTitle: "이 매장을 저장할까요?",
    removeConfirmTitle: "저장한 매장을 해제할까요?",
    saveConfirmLabel: "매장 저장",
    removeConfirmLabel: "해제",
    addedDescription: (storeName) => `${storeName}이(가) 즐겨찾기에 추가되었습니다.`,
    removedDescription: (storeName) => `${storeName}이(가) 즐겨찾기에서 제거되었습니다.`,
    saveConfirmDescription: (storeName) => `${storeName}을(를) 즐겨찾기에 추가합니다.`,
    removeConfirmDescription: (storeName) => `${storeName}을(를) 즐겨찾기에서 제거합니다.`,
  },
  zh: {
    addedTitle: "已加入收藏",
    removedTitle: "已取消收藏",
    updateErrorTitle: "无法更新收藏",
    updateErrorFallback: "请稍后再试。",
    saveConfirmTitle: "收藏这家店？",
    removeConfirmTitle: "取消收藏这家店？",
    saveConfirmLabel: "收藏店铺",
    removeConfirmLabel: "取消收藏",
    addedDescription: (storeName) => `${storeName} 已加入你的收藏。`,
    removedDescription: (storeName) => `${storeName} 已从你的收藏中移除。`,
    saveConfirmDescription: (storeName) => `将 ${storeName} 加入你的收藏。`,
    removeConfirmDescription: (storeName) => `将 ${storeName} 从你的收藏中移除。`,
  },
};

const homeFavoriteFeedbackText = (language: LanguageCode) =>
  homeFavoriteFeedbackCopy[language] ?? homeFavoriteFeedbackCopy.vi;

const appearanceIconMap: Record<string, LucideIcon> = {
  account: UserRound,
  bell: Bell,
  calendar: CalendarDays,
  calcheck: CalendarCheck,
  camera: Camera,
  crown: Crown,
  dining: Utensils,
  gem: Gem,
  gift: Gift,
  heart: Heart,
  home: Home,
  map: Map,
  martini: Martini,
  mic: Mic,
  music: Music,
  pin: MapPin,
  qr: QrCode,
  search: Search,
  sparkle: Sparkles,
  star: Star,
  ticket: Ticket,
  user: UserRound,
  waves: Waves,
};

const categoryHrefById: Record<string, string> = {
  q1: "/danh-sach-quan",
  q2: "/danh-sach-cast",
  q3: "/uu-dai",
  q4: "/tour",
  q5: "/xep-hang",
  q6: "/spa",
  q7: "/nha-hang",
  q8: "/dang-nhap",
};

function appearanceIconUrl(icon?: string) {
  if (!icon || (!/^(https?:|\/|data:image\/)/i.test(icon) && !icon.startsWith("storage/"))) return undefined;
  return resolveClientUrl(icon) || icon;
}

function mapAppearanceQuickItem(item: AppearanceItem, index: number): HomeCategoryItem {
  const fallback = categoryItems[index] ?? categoryItems[0] ?? {
    label: "Tìm quán",
    icon: MapPin,
    href: "/danh-sach-quan",
  };
  const isTourSlot = item.id === "q4";

  return {
    label: isTourSlot ? "Tour" : item.label || fallback.label,
    icon: isTourSlot ? Map : appearanceIconMap[item.icon] ?? fallback.icon,
    iconUrl: isTourSlot ? undefined : appearanceIconUrl(item.icon),
    color: item.color,
    href: categoryHrefById[item.id] ?? fallback.href,
    featured: typeof item.featured === "boolean" ? item.featured : (item.id === "q8" || item.icon === "star" || ("featured" in fallback && Boolean(fallback.featured))),
  };
}

const serviceTabs = [
  { id: "nhahang", label: "Nhà hàng" },
  { id: "spa", label: "Spa" },
];

const serviceRegionTabs = [
  { id: "hanoi", label: "Hà Nội" },
  { id: "hcm", label: "Hồ Chí Minh" },
  { id: "all", label: "Tất cả" },
] as const;

const vietnamServiceCityCodes = [
  "caobang",
  "dienbien",
  "hatinh",
  "laichau",
  "langson",
  "nghean",
  "quangninh",
  "sonla",
  "thanhhoa",
  "hn",
  "hue",
  "laocai",
  "thainguyen",
  "phutho",
  "bacninh",
  "hungyen",
  "hp",
  "ninhbinh",
  "quangtri",
  "dn",
  "quangngai",
  "gialai",
  "khanhhoa",
  "lamdong",
  "daklak",
  "hcm",
  "dongnai",
  "tayninh",
  "cantho",
  "vinhlong",
  "dongthap",
  "camau",
  "angiang",
  "tuyenquang",
] as const;

const categoryLabels: Record<string, string> = {
  BAR: "Bar",
  CLUB: "Club",
  LOUNGE: "Lounge",
  GIRLS_BAR: "Girls bar",
  KARAOKE: "Karaoke",
  MASSAGE_SPA: "Spa",
  RESTAURANT: "Nhà hàng",
  CASINO: "Casino",
};

const cityLabels: Record<string, string> = {
  hn: "Hà Nội",
  hcm: "TP.HCM",
};

const areaLabels: Record<string, string> = {
  "Hoan Kiem": "Hoàn Kiếm",
  "Tay Ho": "Tây Hồ",
  "Quan 1": "Quận 1",
  "Quan 3": "Quận 3",
  "Quan 7": "Quận 7",
};

const categoryPrices: Record<string, string> = {
  BAR: "từ 650.000đ",
  CLUB: "từ 2.500.000đ",
  LOUNGE: "từ 900.000đ",
  GIRLS_BAR: "từ 1.200.000đ",
  KARAOKE: "từ 1.500.000đ",
  MASSAGE_SPA: "từ 500.000đ",
  RESTAURANT: "từ 800.000đ",
  CASINO: "từ 3.000.000đ",
};

type RankedItem = {
  rank?: string | number;
  numColor?: string;
  crown?: string;
  img?: string;
  name?: string;
  area?: string;
  href?: string;
};

type HomeBanner = {
  title: string;
  desc: string;
  btnText: string;
  img?: string | null;
  href?: string | null;
  statusLabel?: string | null;
  subtitle?: string | null;
  hasImage?: boolean;
};

type HomeBannerMetadata = {
  description?: string;
  tag?: string;
  link?: string;
  statusLabel?: string;
  subtitle?: string;
  imageUrl?: string;
  position?: string;
  order?: number;
};

function getHomeBannerMetadata(content: CmsContentItem): HomeBannerMetadata {
  const metadata = (content.metadata ?? {}) as HomeBannerMetadata;
  if (metadata.link && metadata.link.startsWith("/quan/")) {
    return {
      ...metadata,
      link: metadata.link.replace(/^\/quan\//, "/stores/"),
    };
  }
  return metadata;
}

function getHomeBannerImageUrl(content: CmsContentItem) {
  const imageUrl = getHomeBannerMetadata(content).imageUrl;

  return typeof imageUrl === "string" && imageUrl.trim() ? imageUrl.trim() : null;
}

function hasHomeBannerImage(content: CmsContentItem) {
  return Boolean(getHomeBannerImageUrl(content));
}

type HomeStoreCard = {
  id: string;
  slug: string;
  name: string;
  area: string;
  catLabel: string;
  category: string;
  cityCode: string;
  img?: string;
  image?: string;
  href: string;
  badgeText: string;
  priceLabel: string;
};

type HomeCouponItem = {
  id: string;
  title: string;
  value: string;
  place: string;
  img?: string;
  href: string;
};

type HomeVideoItem = {
  id: string;
  name: string;
  img?: string;
  videoUrl?: string | null;
  href: string;
  storeSlug?: string | null;
  viewCount?: number;
  likeCount?: number;
  liked?: boolean;
};

type HomeContentItem = {
  id: string;
  title: string;
  desc: string;
  href: string;
  icon: typeof BookOpen;
  kicker: string;
  meta?: string;
  img?: string;
  rank?: number;
  createdAt?: string;
};

type ServiceRegion = (typeof serviceRegionTabs)[number]["id"];

function regionToCityCode(region: ServiceRegion): "all" | "hn" | "hcm" {
  if (region === "hanoi") return "hn";
  if (region === "hcm") return "hcm";
  return "all";
}

function mergeFeaturedRankingItems(items: PublicRankingItem[], limit: number) {
  const itemByTargetId = new globalThis.Map<string, PublicRankingItem>();

  items.forEach((item) => {
    if (!itemByTargetId.has(item.targetId)) {
      itemByTargetId.set(item.targetId, item);
    }
  });

  return [...itemByTargetId.values()]
    .sort((first, second) => {
      const firstPin = first.pinRank ?? Number.POSITIVE_INFINITY;
      const secondPin = second.pinRank ?? Number.POSITIVE_INFINITY;
      if (firstPin !== secondPin) return firstPin - secondPin;

      const scoreDiff = (second.manualScore ?? 0) - (first.manualScore ?? 0);
      if (scoreDiff !== 0) return scoreDiff;

      return first.name.localeCompare(second.name);
    })
    .slice(0, limit);
}

function backgroundFromUrl(value?: string | null) {
  const url = resolveClientUrl(value);
  return url ? `url(${JSON.stringify(url)}) center/cover` : undefined;
}

function isUsableContentImage(value?: string | null) {
  const url = resolveClientUrl(value);
  return Boolean(url && !/placehold\.co|placeholder/i.test(url));
}

function firstContentImage(...values: Array<string | null | undefined>) {
  return values.find((value) => isUsableContentImage(value));
}

function storeCardImage(store: Pick<PublicStore, "slug" | "thumbnailUrl">, index: number) {
  return resolveClientUrl(store.thumbnailUrl) || storeImageForSlug(store.slug, index);
}

function storeImage(store: PublicStore, index: number) {
  const backendImage = storeCardImage(store, index);
  return backendImage ? `url(${JSON.stringify(backendImage)}) center/cover` : undefined;
}

function getYoutubeVideoId(value?: string | null) {
  if (!value) return "";

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] ?? "";

    if (host.includes("youtube.com")) {
      const watchId = url.searchParams.get("v");
      if (watchId) return watchId;

      const parts = url.pathname.split("/").filter(Boolean);
      const idIndex = parts.findIndex((part) => ["embed", "shorts", "live"].includes(part));
      if (idIndex >= 0) return parts[idIndex + 1] ?? "";
    }
  } catch {
    const match = value.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{6,})/);
    return match?.[1] ?? "";
  }

  return "";
}

function getYoutubeThumbnail(value?: string | null) {
  const id = getYoutubeVideoId(value);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
}

function isPlayableVideoFile(value?: string | null) {
  if (!value) return false;
  return /\.(mp4|webm|ogg)(?:$|[?#])/i.test(value);
}

function hotVideoThumbnail(video: PublicHotVideo, index: number) {
  return (
    resolveClientUrl(video.thumbnailUrl) ||
    getYoutubeThumbnail(video.url) ||
    resolveClientUrl(video.storeThumbnailUrl) ||
    storeImageForSlug(video.storeSlug, index)
  );
}

function storeAreaLabel(store: PublicStore) {
  const areaName = store.area?.name ?? store.district ?? "";
  const readableArea = areaLabels[areaName] ?? areaName;
  const readableCity = cityLabels[store.cityCode ?? ""] ?? store.city;

  return [readableArea, readableCity].filter(Boolean).join(" · ");
}

function mapStoreToHomeCard(store: PublicStore, index: number): HomeStoreCard {
  const categoryLabel = categoryLabels[store.category] ?? store.category;
  const image = storeCardImage(store, index);

  return {
    id: store.id,
    slug: store.slug,
    name: store.name,
    area: storeAreaLabel(store),
    catLabel: categoryLabel,
    category: store.category,
    cityCode: store.cityCode ?? "",
    img: image ? `url(${JSON.stringify(image)}) center/cover` : undefined,
    image: image ?? undefined,
    href: `/stores/${store.slug}`,
    badgeText: index < 2 ? "Đặt bàn nhanh" : categoryLabel,
    priceLabel: formatPriceTier(categoryPrices[store.category] ?? "từ 900.000đ"),
  };
}

function mapRecommendationToHomeCard(item: PublicHomeRecommendation, index: number): HomeStoreCard {
  const categoryLabel = categoryLabels[item.category] ?? item.category;
  const areaName = item.area?.name ?? item.district ?? "";
  const readableArea = areaLabels[areaName] ?? areaName;
  const readableCity = cityLabels[item.cityCode ?? ""] ?? item.city;
  const activeCouponName = item.activeCoupon?.name;
  const image = resolveClientUrl(item.thumbnailUrl);

  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    area: [readableArea, readableCity].filter(Boolean).join(" · "),
    catLabel: categoryLabel,
    category: item.category,
    cityCode: item.cityCode ?? "",
    img: backgroundFromUrl(item.thumbnailUrl),
    image: image ?? undefined,
    href: item.href || `/stores/${item.slug}`,
    badgeText: activeCouponName || item.reason || (index < 2 ? "Gợi ý hợp gu" : categoryLabel),
    priceLabel: formatPriceTier(categoryPrices[item.category] ?? "từ 900.000đ"),
  };
}

function mapRankingToRankedItem(item: PublicRankingItem): RankedItem {
  return {
    rank: item.rank,
    img: backgroundFromUrl(item.image),
    name: item.name,
    area: storeAreaText(item.area, item.cityCode, item.city),
    href: item.href,
  };
}

function mapRankingToHomeCard(item: PublicRankingItem, index: number): HomeStoreCard {
  void index;
  const categoryLabel = categoryLabels[item.category] ?? item.category;
  const image = resolveClientUrl(item.image);

  return {
    id: item.targetId,
    slug: item.slug,
    name: item.name,
    area: storeAreaText(item.area, item.cityCode, item.city),
    catLabel: categoryLabel,
    category: item.category,
    cityCode: item.cityCode ?? "",
    img: backgroundFromUrl(item.image),
    image: image ?? undefined,
    href: item.href || `/stores/${item.slug}`,
    badgeText: item.sponsored ? "Nổi bật" : categoryLabel,
    priceLabel: formatPriceTier(categoryPrices[item.category] ?? "từ 900.000đ"),
  };
}

function storeAreaText(area?: string | null, cityCode?: string | null, city?: string | null) {
  const readableArea = area ? areaLabels[area] ?? area : "";
  const readableCity = cityLabels[cityCode ?? ""] ?? city ?? "";

  return [readableArea, readableCity].filter(Boolean).join(" · ");
}

function formatCouponValue(coupon: PublicCoupon, language: LanguageCode, rates: CurrencyRateMap) {
  if (coupon.discountType === "PERCENT") return `-${coupon.discountValue}%`;
  return `-${formatVndByLanguage(coupon.discountValue, language, rates)}`;
}

function mapCouponToHomeItem(
  coupon: PublicCoupon,
  index: number,
  language: LanguageCode,
  rates: CurrencyRateMap,
): HomeCouponItem {
  void index;
  const storeImageUrl = coupon.store.media?.[0]?.url;

  return {
    id: coupon.id,
    title: coupon.name,
    value: formatCouponValue(coupon, language, rates),
    place: [coupon.store.name, storeAreaText(coupon.store.district, undefined, coupon.store.city)]
      .filter(Boolean)
      .join(" · "),
    img: backgroundFromUrl(storeImageUrl),
    href: `/stores/${coupon.store.slug}`,
  };
}

function mapCampaignToHomeItem(
  campaign: CampaignItem,
  index: number,
  language: LanguageCode,
  rates: CurrencyRateMap,
): HomeCouponItem {
  void index;
  const storeImageUrl = campaign.targetStore?.media?.[0]?.url;
  const value =
    campaign.discountType === "PERCENT"
      ? `-${campaign.discountValue}%`
      : `-${formatVndByLanguage(campaign.discountValue, language, rates)}`;

  return {
    id: campaign.id,
    title: campaign.name,
    value,
    place: [
      campaign.targetStore?.name,
      storeAreaText(campaign.targetStore?.district, undefined, campaign.targetStore?.city),
    ]
      .filter(Boolean)
      .join(" · "),
    img: backgroundFromUrl(storeImageUrl),
    href: `/stores/${campaign.targetStore?.slug ?? ""}?couponId=${campaign.id}`,
  };
}

function mapHotVideoToHomeItem(video: PublicHotVideo, index: number): HomeVideoItem {
  const name = [video.storeName, video.title].filter(Boolean).join(" · ");
  const thumbnail = hotVideoThumbnail(video, index);

  return {
    id: video.id,
    name: name || "Video Hot",
    img: backgroundFromUrl(thumbnail),
    href: video.href || (video.storeSlug ? `/stores/${video.storeSlug}` : "/danh-sach-quan"),
  };
}

function mapTrackedHotVideoToHomeItem(video: PublicHotVideo, index: number): HomeVideoItem {
  const videoUrl = resolveClientUrl(video.url);
  const name = [video.storeName, video.title].filter(Boolean).join(" · ");
  const thumbnail = hotVideoThumbnail(video, index);

  return {
    id: video.id,
    name: name || "Video Hot",
    img: backgroundFromUrl(thumbnail),
    videoUrl: isPlayableVideoFile(videoUrl) ? videoUrl : null,
    href: video.href || (video.storeSlug ? `/stores/${video.storeSlug}` : "/danh-sach-quan"),
    storeSlug: video.storeSlug,
    viewCount: video.viewCount ?? 0,
    likeCount: video.likeCount ?? 0,
    liked: hasLikedHotVideo(video.id),
  };
}

function mapTourToHomeItem(
  tour: PublicTour,
  language: LanguageCode,
): HomeContentItem {
  const stopText = tour.stops
    .slice(0, 2)
    .map((stop) => stop.store.name)
    .join(" · ");

  const stopImage = tour.stops
    .flatMap((stop) => stop.store.media)
    .find((media) => isUsableContentImage(media.url))?.url;
  const cityLabel =
    cityLabels[tour.city] ??
    tour.stops[0]?.store.area?.city ??
    tour.stops[0]?.store.city ??
    tour.city;
  const meta = [
    cityLabel,
    tour.durationHours ? `${tour.durationHours} giờ` : "",
    tour.stops.length ? `${tour.stops.length} điểm` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    id: tour.id,
    title: tour.title,
    desc: tour.subtitle || stopText,
    href: `/tour/${tour.id}`,
    icon: MapPin,
    kicker: "Tour",
    meta: translateText(meta, language),
    img: backgroundFromUrl(firstContentImage(tour.coverUrl, stopImage)),
    rank: typeof tour.homeRank === "number" ? tour.homeRank : Number.MAX_SAFE_INTEGER,
    createdAt: tour.createdAt,
  };
}

function mapContentToHomeItem(content: CmsContentItem): HomeContentItem {
  const metadata = content.metadata ?? {};
  const image = firstContentImage(getCmsContentImageUrl(content));
  const category = typeof metadata.category === "string" && metadata.category.trim()
    ? metadata.category.trim()
    : content.type === "BLOG"
      ? "Blog"
      : "Guide";
  const publishedDate = content.publishedAt?.slice(0, 10) || content.updatedAt?.slice(0, 10);

  return {
    id: content.id,
    title: content.title,
    desc: content.excerpt || "Khám phá nội dung mới từ Vietyoru.",
    href: content.type === "BLOG" ? `/blog/${content.slug}` : `/legal/${content.slug}`,
    icon: content.type === "BLOG" ? Newspaper : BookOpen,
    kicker: category,
    meta: publishedDate,
    img: backgroundFromUrl(image),
    rank: getHomeGuideRank(content),
    createdAt: content.createdAt,
  };
}

function getHomeGuideMetadata(content: CmsContentItem) {
  return content.metadata && typeof content.metadata === "object" && !Array.isArray(content.metadata)
    ? (content.metadata as Record<string, unknown>)
    : {};
}

function isHomeGuideBlog(content: CmsContentItem) {
  return content.type === "BLOG" && getHomeGuideMetadata(content).showOnHome === true;
}

function getHomeGuideRank(content: CmsContentItem) {
  const rank = getHomeGuideMetadata(content).homeRank;
  return typeof rank === "number" && Number.isFinite(rank) ? rank : Number.MAX_SAFE_INTEGER;
}

function withApiImageFallbacks(items: HomeContentItem[], fallbackImages: Array<string | null | undefined>) {
  const usableFallbacks = fallbackImages.filter(isUsableContentImage);
  if (!usableFallbacks.length) return items;

  return items.map((item, index) =>
    item.img
      ? item
      : {
          ...item,
          img: backgroundFromUrl(usableFallbacks[index % usableFallbacks.length]),
        },
  );
}

function getRankingVisual(rankNumber: number, item: RankedItem) {
  const rankVisuals: Record<
    number,
    {
      badgeBackground: string;
      badgeColor: string;
      rowBackground: string;
      rowBorder: string;
      rowShadow: string;
      labelColor: string;
      metaColor: string;
    }
  > = {
    1: {
      badgeBackground: "linear-gradient(140deg, #fff4a8 0%, #f2c94c 58%, #c88614 100%)",
      badgeColor: "#3d2503",
      rowBackground:
        "linear-gradient(100deg, rgba(244,196,76,.58) 0%, rgba(174,123,26,.40) 27%, rgba(42,33,18,.94) 58%, rgba(20,20,24,.98) 100%), linear-gradient(135deg, rgba(255,232,150,.30), rgba(24,24,28,.96))",
      rowBorder: "rgba(255,220,112,.72)",
      rowShadow: "0 0 0 1px rgba(255,220,112,.22) inset, 0 24px 58px rgba(224,158,22,.32), 0 18px 38px rgba(0,0,0,.34)",
      labelColor: "#ffd76a",
      metaColor: "#fff4c7",
    },
    2: {
      badgeBackground: "linear-gradient(140deg, #f8fafc 0%, #cbd5e1 56%, #64748b 100%)",
      badgeColor: "#111827",
      rowBackground:
        "linear-gradient(100deg, rgba(203,213,225,.50) 0%, rgba(100,116,139,.34) 28%, rgba(35,39,47,.94) 58%, rgba(20,20,24,.98) 100%), linear-gradient(135deg, rgba(241,245,249,.22), rgba(24,24,28,.96))",
      rowBorder: "rgba(226,232,240,.66)",
      rowShadow: "0 0 0 1px rgba(226,232,240,.18) inset, 0 24px 58px rgba(148,163,184,.26), 0 18px 38px rgba(0,0,0,.34)",
      labelColor: "#dbe7f5",
      metaColor: "#f4f8ff",
    },
    3: {
      badgeBackground: "linear-gradient(140deg, #ffd7a8 0%, #f59e45 56%, #a84c12 100%)",
      badgeColor: "#321303",
      rowBackground:
        "linear-gradient(100deg, rgba(245,142,60,.50) 0%, rgba(151,70,21,.36) 28%, rgba(45,29,21,.94) 58%, rgba(20,20,24,.98) 100%), linear-gradient(135deg, rgba(255,183,111,.24), rgba(24,24,28,.96))",
      rowBorder: "rgba(251,146,60,.62)",
      rowShadow: "0 0 0 1px rgba(251,146,60,.18) inset, 0 24px 58px rgba(180,83,9,.26), 0 18px 38px rgba(0,0,0,.34)",
      labelColor: "#ffb06b",
      metaColor: "#ffe4c7",
    },
    4: {
      badgeBackground: "linear-gradient(140deg, #a7f3d0, #22c55e)",
      badgeColor: "#064e3b",
      rowBackground: "rgba(255,255,255,.045)",
      rowBorder: "rgba(255,255,255,.12)",
      rowShadow: "0 16px 30px rgba(0,0,0,.14)",
      labelColor: "#047857",
      metaColor: colors.muted,
    },
    5: {
      badgeBackground: "linear-gradient(140deg, #bfdbfe, #3b82f6)",
      badgeColor: "#1e3a8a",
      rowBackground: "rgba(255,255,255,.045)",
      rowBorder: "rgba(255,255,255,.12)",
      rowShadow: "0 16px 30px rgba(0,0,0,.14)",
      labelColor: "#1d4ed8",
      metaColor: colors.muted,
    },
  };

  return rankVisuals[rankNumber] ?? {
    badgeBackground: item.crown ?? colors.gold,
    badgeColor: item.numColor ?? "#241a0a",
    rowBackground: "var(--vy-surface-2)",
    rowBorder: "var(--vy-border)",
    rowShadow: "var(--vy-shadow-card)",
    labelColor: "#8a5a00",
    metaColor: colors.muted,
  };
}

function useBannerSwipe(
  bannerCount: number,
  setActiveBanner: React.Dispatch<React.SetStateAction<number>>,
) {
  const touchStartXRef = useRef<number | null>(null);
  const touchDeltaXRef = useRef(0);
  const suppressClickRef = useRef(false);

  const moveBanner = (direction: 1 | -1) => {
    if (bannerCount < 2) return;
    setActiveBanner((current) => (current + direction + bannerCount) % bannerCount);
  };

  const beginSwipe = (clientX: number) => {
    touchStartXRef.current = clientX;
    touchDeltaXRef.current = 0;
    suppressClickRef.current = false;
  };

  const updateSwipe = (clientX: number) => {
    if (touchStartXRef.current === null) return;
    touchDeltaXRef.current = clientX - touchStartXRef.current;
    if (Math.abs(touchDeltaXRef.current) > 8) {
      suppressClickRef.current = true;
    }
  };

  const endSwipe = () => {
    const deltaX = touchDeltaXRef.current;
    const shouldSuppressClick = Math.abs(deltaX) > 8;
    touchStartXRef.current = null;
    touchDeltaXRef.current = 0;

    if (Math.abs(deltaX) >= 46) {
      moveBanner(deltaX < 0 ? 1 : -1);
    }

    if (shouldSuppressClick) {
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 220);
    } else {
      suppressClickRef.current = false;
    }
  };

  return {
    onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (suppressClickRef.current) {
        event.preventDefault();
        suppressClickRef.current = false;
      }
    },
    onTouchCancel: () => {
      touchStartXRef.current = null;
      touchDeltaXRef.current = 0;
      suppressClickRef.current = false;
    },
    onTouchEnd: (event: React.TouchEvent<HTMLAnchorElement>) => {
      const touch = event.changedTouches[0];
      if (touch) updateSwipe(touch.clientX);
      endSwipe();
    },
    onTouchMove: (event: React.TouchEvent<HTMLAnchorElement>) => {
      const touch = event.touches[0];
      if (touch) updateSwipe(touch.clientX);
    },
    onTouchStart: (event: React.TouchEvent<HTMLAnchorElement>) => {
      const touch = event.touches[0];
      if (touch) beginSwipe(touch.clientX);
    },
  };
}

function useCarouselSwipe(
  slideCount: number,
  setActiveSlide: React.Dispatch<React.SetStateAction<number>>,
) {
  const touchStartXRef = useRef<number | null>(null);
  const touchDeltaXRef = useRef(0);
  const suppressClickRef = useRef(false);

  const moveSlide = (direction: 1 | -1) => {
    if (slideCount < 2) return;
    setActiveSlide((current) => (current + direction + slideCount) % slideCount);
  };

  const beginSwipe = (clientX: number) => {
    touchStartXRef.current = clientX;
    touchDeltaXRef.current = 0;
    suppressClickRef.current = false;
  };

  const updateSwipe = (clientX: number) => {
    if (touchStartXRef.current === null) return;
    touchDeltaXRef.current = clientX - touchStartXRef.current;
    if (Math.abs(touchDeltaXRef.current) > 8) {
      suppressClickRef.current = true;
    }
  };

  const endSwipe = () => {
    const deltaX = touchDeltaXRef.current;
    const shouldSuppressClick = Math.abs(deltaX) > 8;
    touchStartXRef.current = null;
    touchDeltaXRef.current = 0;

    if (Math.abs(deltaX) >= 46) {
      moveSlide(deltaX < 0 ? 1 : -1);
    }

    if (shouldSuppressClick) {
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 220);
    } else {
      suppressClickRef.current = false;
    }
  };

  return {
    onClickCapture: (event: React.MouseEvent<HTMLElement>) => {
      if (suppressClickRef.current) {
        event.preventDefault();
        event.stopPropagation();
        suppressClickRef.current = false;
      }
    },
    onTouchCancel: () => {
      touchStartXRef.current = null;
      touchDeltaXRef.current = 0;
      suppressClickRef.current = false;
    },
    onTouchEnd: (event: React.TouchEvent<HTMLElement>) => {
      const touch = event.changedTouches[0];
      if (touch) updateSwipe(touch.clientX);
      endSwipe();
    },
    onTouchMove: (event: React.TouchEvent<HTMLElement>) => {
      const touch = event.touches[0];
      if (touch) updateSwipe(touch.clientX);
    },
    onTouchStart: (event: React.TouchEvent<HTMLElement>) => {
      const touch = event.touches[0];
      if (touch) beginSwipe(touch.clientX);
    },
  };
}

const shellStyle: CSSProperties = {
  minHeight: "auto",
  background: colors.shell,
  color: colors.text,
  fontFamily: "var(--nl-font-sans)",
};

const appStyle: CSSProperties = {
  background: "var(--vy-bg)",
  border: "1px solid var(--vy-border)",
  boxShadow: "var(--vy-shadow)",
};

const sectionTitleStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "14px",
  marginBottom: "14px",
};

const homeCardRadius = "16px";

const homeMediaRadius = "13px";

const homeBannerAutoDelayMs = 7200;

const homeBannerSlideTransition = "transform 960ms cubic-bezier(.22,.78,.22,1), opacity 960ms ease";

const homeHotVideosPlaceholderText = "Video Hot đang được chuẩn bị.";

const homeSectionTitleFallbacks = {
  recommend: findAppearanceTitle(DEFAULT_APPEARANCE_CONFIG.titles, "t1", "Đề xuất tối nay"),
  coupon: findAppearanceTitle(DEFAULT_APPEARANCE_CONFIG.titles, "t2", "Coupon Hot"),
  ranking: findAppearanceTitle(DEFAULT_APPEARANCE_CONFIG.titles, "t3", "Bảng xếp hạng"),
  featured: findAppearanceTitle(DEFAULT_APPEARANCE_CONFIG.titles, "t4", "Dịch vụ nổi bật"),
  featured_restaurant: findAppearanceTitle(DEFAULT_APPEARANCE_CONFIG.titles, "t4_restaurant", "Nhà hàng"),
  featured_spa: findAppearanceTitle(DEFAULT_APPEARANCE_CONFIG.titles, "t4_spa", "Spa"),
  video: findAppearanceTitle(DEFAULT_APPEARANCE_CONFIG.titles, "t5", "Video Hot"),
  guide: findAppearanceTitle(DEFAULT_APPEARANCE_CONFIG.titles, "t6", "Tour · Blog · Guide"),
};

function getHomeSectionTitles(config: AppearanceConfig) {
  return {
    recommend: findAppearanceTitle(config.titles, "t1", homeSectionTitleFallbacks.recommend),
    coupon: findAppearanceTitle(config.titles, "t2", homeSectionTitleFallbacks.coupon),
    ranking: findAppearanceTitle(config.titles, "t3", homeSectionTitleFallbacks.ranking),
    featured: findAppearanceTitle(config.titles, "t4", homeSectionTitleFallbacks.featured),
    featured_restaurant: findAppearanceTitle(config.titles, "t4_restaurant", homeSectionTitleFallbacks.featured_restaurant),
    featured_spa: findAppearanceTitle(config.titles, "t4_spa", homeSectionTitleFallbacks.featured_spa),
    video: findAppearanceTitle(config.titles, "t5", homeSectionTitleFallbacks.video),
    guide: findAppearanceTitle(config.titles, "t6", homeSectionTitleFallbacks.guide),
  };
}

function isHomeHotVideosEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_HOME_HOT_VIDEOS !== "false";
}

const homeSecondaryLoadDelayMs = process.env.NODE_ENV === "test" ? 0 : 800;

function useHomeSecondaryLoadReady() {
  const [ready, setReady] = useState(() => process.env.NODE_ENV === "test");

  useEffect(() => {
    if (ready) return;

    const win = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (typeof win.requestIdleCallback === "function") {
      const idleHandle = win.requestIdleCallback(() => setReady(true), {
        timeout: homeSecondaryLoadDelayMs,
      });

      return () => {
        win.cancelIdleCallback?.(idleHandle);
      };
    }

    const timer = window.setTimeout(() => setReady(true), homeSecondaryLoadDelayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [ready]);

  return ready;
}

function getBannerBackgroundImage(value?: string | null) {
  return value?.replace(/\s+center\/cover\s*$/i, "") || "var(--vy-hero-grad)";
}

function getBannerSlideTransform(index: number, activeIndex: number) {
  if (index === activeIndex) return "translate3d(0,0,0) scale(1.03)";
  return `translate3d(${index < activeIndex ? "-" : ""}34%,0,0) scale(1.05)`;
}

function shouldLoadBannerSlideImage(index: number, activeIndex: number, bannerCount: number) {
  if (bannerCount <= 3) return true;
  const previousIndex = (activeIndex - 1 + bannerCount) % bannerCount;
  const nextIndex = (activeIndex + 1) % bannerCount;

  return index === activeIndex || index === previousIndex || index === nextIndex;
}

const bannerPresetDelimiters = [" · ", " Â· ", " — ", " â€” ", " - "];

function normalizeBannerPresetCase(value: string) {
  const lower = value.toLocaleLowerCase("vi-VN");
  return lower.replace(/(^|[\s·Â—â€“-])(\p{L})/gu, (_match, prefix: string, letter: string) =>
    `${prefix}${letter.toLocaleUpperCase("vi-VN")}`,
  );
}

function sentenceCaseBannerPreset(value: string) {
  const lower = value.toLocaleLowerCase("vi-VN");
  return lower.replace(/(^|[\s·Â—â€“-])(\p{L})/u, (_match, prefix: string, letter: string) =>
    `${prefix}${letter.toLocaleUpperCase("vi-VN")}`,
  );
}

function translateBannerPresetText(value: string | null | undefined, language: LanguageCode): string {
  const source = value?.trim();
  if (!source) return "";

  for (const delimiter of bannerPresetDelimiters) {
    if (!source.includes(delimiter)) continue;

    const translatedParts: string[] = source.split(delimiter).map((part) => translateBannerPresetText(part, language));
    return translatedParts.join(delimiter);
  }

  const candidates = [
    source,
    sentenceCaseBannerPreset(source),
    normalizeBannerPresetCase(source),
  ];

  for (const candidate of candidates) {
    const translated = translateText(candidate, language);
    if (translated !== candidate) return translated;
  }

  return source;
}

function BannerMediaSlides({
  activeBanner,
  banners,
}: {
  activeBanner: number;
  banners: HomeBanner[];
}) {
  const renderOnlyActiveBanner = process.env.NODE_ENV === "test";

  return (
    <React.Fragment>
      {banners.map((banner, index) => {
        if (renderOnlyActiveBanner && index !== activeBanner) return null;
        const shouldLoadImage = shouldLoadBannerSlideImage(index, activeBanner, banners.length);

        return (
          <span
            key={`${banner.title}-${index}`}
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "inherit",
              backgroundColor: "var(--vy-surface)",
              backgroundImage: renderOnlyActiveBanner || !shouldLoadImage ? undefined : getBannerBackgroundImage(banner.img),
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              opacity: activeBanner === index ? 1 : 0,
              transform: getBannerSlideTransform(index, activeBanner),
              transition: homeBannerSlideTransition,
              willChange: "transform, opacity",
            }}
          />
        );
      })}
    </React.Fragment>
  );
}

const homeSectionTitleTextStyle: CSSProperties = {
  margin: 0,
  fontSize: "24px",
  lineHeight: 1.1,
  fontWeight: 900,
};

const homeControlFrameStyle: CSSProperties = {
  minHeight: 40,
  display: "inline-flex",
  alignItems: "center",
  border: `1px solid ${colors.line}`,
  borderRadius: "14px",
  background: "var(--vy-surface-1)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,.05)",
};

const pillStyle: CSSProperties = {
  border: `1px solid ${colors.line}`,
  background: "var(--vy-surface-1)",
  color: colors.muted,
  borderRadius: "999px",
  padding: "7px 12px",
  fontSize: "12px",
  fontWeight: 700,
};

function HeaderBar({ desktop = false }: { desktop?: boolean }) {
  void desktop;
  return null;
}

function SearchPanel() {
  return (
    <Link
      href="/danh-sach-quan"
      className="nl-home-search-panel"
      data-testid="home-search-panel"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        height: "48px",
        borderRadius: "14px",
        border: "1px solid var(--vy-border)",
        background: "var(--vy-surface-1)",
        color: colors.muted,
        padding: "0 16px",
      }}
    >
      <Search size={18} color={colors.gold} />
      <span style={{ flex: 1, fontSize: "14px" }}>Tìm quán hoặc cast gần bạn...</span>
      <SlidersHorizontal size={17} color={colors.dim} />
    </Link>
  );
}

function CategoryGrid({
  desktop = false,
  items = categoryItems,
}: {
  desktop?: boolean;
  items?: HomeCategoryItem[];
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: desktop ? "repeat(8, minmax(0, 1fr))" : "repeat(4, 1fr)",
        gap: desktop ? "14px" : "15px 18px",
      }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const accentColor = item.color || (item.featured ? colors.goldSoft : colors.gold);
        const customColorSurface = item.color ? `color-mix(in srgb, ${item.color} 14%, var(--vy-surface-1))` : undefined;
        const customColorBorder = item.color ? `color-mix(in srgb, ${item.color} 44%, var(--vy-border))` : undefined;
        return (
          <Link key={item.label} href={item.href} className="nl-home-category-link" style={{ color: colors.text, textAlign: "center" }}>
            <span
              className="nl-home-category-icon"
              style={{
                width: desktop ? "64px" : "54px",
                height: desktop ? "64px" : "54px",
                borderRadius: homeCardRadius,
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: accentColor,
                background: item.featured
                  ? "var(--vy-gold-soft-bg)"
                  : customColorSurface || "var(--vy-surface-1)",
                border: `1px solid ${item.featured ? "var(--vy-border-gold-32)" : customColorBorder || "var(--vy-border)"}`,
                boxShadow: item.featured
                  ? "var(--vy-shadow)"
                  : item.color
                    ? `0 12px 28px -22px ${item.color}`
                    : "none",
              }}
            >
              {item.iconUrl ? (
                <span
                  style={{
                    width: desktop ? "26px" : "22px",
                    height: desktop ? "26px" : "22px",
                    backgroundColor: accentColor,
                    WebkitMask: `url(${item.iconUrl}) no-repeat center / contain`,
                    mask: `url(${item.iconUrl}) no-repeat center / contain`,
                    display: "block",
                  }}
                />
              ) : (
                <Icon size={desktop ? 26 : 22} />
              )}
            </span>
            <div style={{ marginTop: "8px", color: colors.text, fontSize: desktop ? "13px" : "12px" }}>
              {item.label}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function EventHero({ desktop = false, apiBanners = [], isLoading = false }: { desktop?: boolean; apiBanners?: CmsContentItem[]; isLoading?: boolean }) {
  const activeLanguage = useActiveLanguage();
  const [activeBanner, setActiveBanner] = useState(0);
  const banners: HomeBanner[] = useMemo(() => {
    return apiBanners.flatMap(b => {
      const meta = getHomeBannerMetadata(b);
      const imageUrl = getHomeBannerImageUrl(b);

      if (!imageUrl) return [];

      return [{
        title: b.title,
        desc: meta.description || "",
        btnText: meta.tag || "Chi tiết",
        href: meta.link || "#",
        statusLabel: meta.statusLabel || "",
        subtitle: meta.subtitle || "",
        img: `url('${imageUrl}')`,
        hasImage: true,
      }];
    });
  }, [apiBanners]);

  const event = banners[activeBanner] ?? banners[0] ?? null;
  const swipeHandlers = useBannerSwipe(banners.length, setActiveBanner);

  useEffect(() => {
    if (process.env.NODE_ENV === "test" || banners.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveBanner((current) => (current + 1) % banners.length);
    }, homeBannerAutoDelayMs);

    return () => window.clearInterval(timer);
  }, [banners.length]);

  if (isLoading) {
    return (
      <div
        className="nl-home-hero is-loading"
        style={{
          minHeight: desktop ? "310px" : "208px",
          borderRadius: homeCardRadius,
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: desktop ? "34px" : "18px 18px 42px",
          background: "var(--vy-surface-2)",
          border: `1px solid ${colors.line}`,
          boxShadow: "var(--vy-shadow-card)",
        }}
      >
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
          <span
            className="nl-data-skeleton-block"
            style={{
              width: "120px",
              height: "20px",
              borderRadius: "4px",
            }}
          />
          <span
            className="nl-data-skeleton-block"
            style={{
              width: desktop ? "480px" : "220px",
              height: desktop ? "42px" : "28px",
              borderRadius: "6px",
              marginTop: "8px",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              marginTop: "12px",
            }}
          >
            <span
              className="nl-data-skeleton-block"
              style={{
                width: desktop ? "320px" : "140px",
                height: "16px",
                borderRadius: "4px",
              }}
            />
            <span
              className="nl-data-skeleton-block"
              style={{
                width: "90px",
                height: "36px",
                borderRadius: "999px",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <HomeDataMessage
        text="Chưa có banner trang chủ."
        minHeight={desktop ? 310 : 208}
      />
    );
  }

  const eventTitle = event.title;
  const eventDesc = event.desc;
  const eventButtonText = translateBannerPresetText(event.btnText, activeLanguage);
  const eventStatusLabel = translateBannerPresetText(event.statusLabel, activeLanguage);
  const eventSubtitle = translateBannerPresetText(event.subtitle, activeLanguage);

  return (
    <Link
      href={event.href || "/danh-sach-quan"}
      className="nl-home-hero"
      data-testid="home-ad-banner"
      {...swipeHandlers}
      style={{
        minHeight: desktop ? "310px" : "208px",
        borderRadius: homeCardRadius,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: desktop ? "34px" : "18px 18px 42px",
        color: event.hasImage ? "#fff" : "var(--vy-text)",
        boxShadow: event.hasImage ? "0 22px 42px rgba(0,0,0,.36)" : "var(--vy-shadow-card)",
        touchAction: "pan-y",
      }}
    >
      <BannerMediaSlides activeBanner={activeBanner} banners={banners} />
      <div key={event.title} style={{ position: "relative", zIndex: 1, animation: "nl-banner-copy-in 820ms cubic-bezier(.22,.78,.22,1)" }}>
        {event.statusLabel && (
          <span
            className="nl-home-hero-status"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              borderRadius: "999px",
              background: event.hasImage ? "rgba(12,12,15,.62)" : "var(--vy-surface-2)",
              color: colors.goldSoft,
              border: `1px solid ${colors.line}`,
              padding: "5px 11px",
              fontSize: desktop ? "12px" : "10px",
              fontWeight: 800,
              letterSpacing: ".16em",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: colors.rose }} />
            {eventStatusLabel}
          </span>
        )}
        {event.subtitle && (
          <div className="nl-home-hero-subtitle" style={{ marginTop: "20px", color: colors.goldSoft, fontSize: desktop ? "13px" : "11px", letterSpacing: ".24em" }}>
            {eventSubtitle}
          </div>
        )}
        <h1 style={{ maxWidth: desktop ? "620px" : "260px", marginTop: (event.subtitle || event.statusLabel) ? "8px" : "20px", fontSize: desktop ? "48px" : "25px", lineHeight: 1.05, fontWeight: 900 }}>
          {eventTitle}
        </h1>
        <div style={{ marginTop: desktop ? "22px" : "16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <span style={{ maxWidth: desktop ? "none" : "168px", fontSize: desktop ? "15px" : "12px", lineHeight: 1.35 }}>{eventDesc}</span>
          <span
            className="nl-home-hero-cta"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              flex: "none",
              borderRadius: "999px",
              background: `linear-gradient(135deg,${colors.goldSoft},${colors.gold})`,
              color: "#241a0a",
              padding: desktop ? "13px 22px" : "10px 16px",
              fontSize: "13px",
              fontWeight: 800,
              whiteSpace: "nowrap",
            }}
          >
            {eventButtonText}
          </span>
        </div>
      </div>
      <div
        aria-label={translateText("Chọn banner", activeLanguage)}
        style={{
          position: "absolute",
          left: "50%",
          bottom: desktop ? "18px" : "16px",
          zIndex: 2,
          display: "flex",
          gap: "6px",
          transform: "translateX(-50%)",
        }}
      >
        {banners.map((banner, index) => (
          <span
            key={banner.title}
            role="button"
            tabIndex={0}
            aria-label={translateText(`Banner ${index + 1}`, activeLanguage)}
            onClick={(event) => {
              event.preventDefault();
              setActiveBanner(index);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setActiveBanner(index);
              }
            }}
            style={{
              display: "block",
              flex: "0 0 auto",
              width: activeBanner === index ? 22 : 5,
              height: 5,
              border: 0,
              borderRadius: 99,
              padding: 0,
              background: activeBanner === index ? colors.gold : "rgba(255,255,255,.26)",
              cursor: "pointer",
              transition: "width 420ms cubic-bezier(.22,.78,.22,1), background 420ms ease",
            }}
          />
        ))}
      </div>
    </Link>
  );
}

function MidPageBanner({ desktop = false, apiBanners = [], isLoading = false }: { desktop?: boolean; apiBanners?: CmsContentItem[]; isLoading?: boolean }) {
  const activeLanguage = useActiveLanguage();
  const [activeBanner, setActiveBanner] = useState(0);
  const banners: HomeBanner[] = useMemo(() => {
    return apiBanners.flatMap((banner) => {
      const meta = getHomeBannerMetadata(banner);
      const imageUrl = getHomeBannerImageUrl(banner);

      if (!imageUrl) return [];

      return [{
        title: banner.title,
        desc: meta.description || banner.excerpt || "",
        btnText: meta.tag || "Xem ngay",
        href: meta.link || "/uu-dai",
        statusLabel: meta.statusLabel || "",
        subtitle: meta.subtitle || "",
        img: `url('${imageUrl}') center/cover`,
        hasImage: true,
      }];
    });
  }, [apiBanners]);
  const event = banners[activeBanner] ?? banners[0] ?? null;
  const swipeHandlers = useBannerSwipe(banners.length, setActiveBanner);

  useEffect(() => {
    if (process.env.NODE_ENV === "test" || banners.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveBanner((current) => (current + 1) % banners.length);
    }, homeBannerAutoDelayMs);

    return () => window.clearInterval(timer);
  }, [banners.length]);

  if (isLoading) {
    return (
      <div
        className="nl-home-mid-banner is-loading"
        style={{
          minHeight: desktop ? "310px" : "208px",
          borderRadius: homeCardRadius,
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: desktop ? "34px" : "18px 18px 42px",
          background: "var(--vy-surface-2)",
          border: `1px solid ${colors.line}`,
          boxShadow: "var(--vy-shadow-card)",
        }}
      >
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
          <span
            className="nl-data-skeleton-block"
            style={{
              width: "100px",
              height: "16px",
              borderRadius: "4px",
            }}
          />
          <span
            className="nl-data-skeleton-block"
            style={{
              width: desktop ? "380px" : "180px",
              height: desktop ? "32px" : "22px",
              borderRadius: "6px",
              marginTop: "8px",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              marginTop: "12px",
            }}
          >
            <span
              className="nl-data-skeleton-block"
              style={{
                width: desktop ? "280px" : "120px",
                height: "16px",
                borderRadius: "4px",
              }}
            />
            <span
              className="nl-data-skeleton-block"
              style={{
                width: "80px",
                height: "32px",
                borderRadius: "999px",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <HomeDataMessage
        text={translateText("Chưa có banner nổi bật.", activeLanguage)}
        minHeight={desktop ? 310 : 208}
      />
    );
  }

  const eventTitle = event.title;
  const eventDesc = event.desc;
  const eventButtonText = translateBannerPresetText(event.btnText, activeLanguage);

  return (
    <Link
      href={event.href || "/uu-dai"}
      data-testid="home-mid-banner"
      {...swipeHandlers}
      style={{
        minHeight: desktop ? "310px" : "208px",
        borderRadius: homeCardRadius,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: desktop ? "34px" : "18px 18px 42px",
        color: "#fff",
        border: `1px solid ${colors.line}`,
        boxShadow: "0 18px 36px rgba(0,0,0,.28)",
        touchAction: "pan-y",
      }}
    >
      <BannerMediaSlides activeBanner={activeBanner} banners={banners} />
      <div key={event.title} style={{ position: "relative", zIndex: 1, maxWidth: desktop ? "520px" : "248px", animation: "nl-banner-copy-in 820ms cubic-bezier(.22,.78,.22,1)" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            minHeight: desktop ? 26 : 22,
            borderRadius: 999,
            padding: desktop ? "0 12px" : "0 9px",
            color: "#3b2604",
            background: "rgba(255, 241, 186, 0.94)",
            border: "1px solid rgba(255, 255, 255, 0.52)",
            boxShadow: "0 10px 24px rgba(0,0,0,.20)",
            fontSize: desktop ? "11px" : "9px",
            fontWeight: 900,
            letterSpacing: ".18em",
            textTransform: "uppercase",
          }}
        >
          {translateText("Banner nổi bật", activeLanguage)}
        </div>
        <h3
          style={{
            marginTop: desktop ? "10px" : "6px",
            color: "#fff",
            fontSize: desktop ? "30px" : "18px",
            lineHeight: 1.08,
            fontWeight: 900,
            textShadow: "0 3px 18px rgba(0,0,0,.74), 0 1px 2px rgba(0,0,0,.65)",
          }}
        >
          {eventTitle}
        </h3>
        <div
          style={{
            marginTop: desktop ? "12px" : "8px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#fff",
            fontSize: desktop ? "13px" : "11px",
            lineHeight: 1.35,
            textShadow: "0 2px 12px rgba(0,0,0,.78), 0 1px 2px rgba(0,0,0,.68)",
          }}
        >
          <span style={{ minWidth: 0 }}>{eventDesc}</span>
          <span
            className="nl-home-mid-banner-action"
            style={{
              flex: "none",
              borderRadius: "999px",
              background: `linear-gradient(135deg,${colors.goldSoft},${colors.gold})`,
              color: "#241a0a",
              padding: desktop ? "9px 15px" : "7px 11px",
              fontSize: desktop ? "12px" : "10px",
              fontWeight: 900,
              whiteSpace: "nowrap",
              boxShadow: "0 10px 24px rgba(0,0,0,.20), inset 0 1px 0 rgba(255,255,255,.44)",
              textShadow: "none",
            }}
          >
            {eventButtonText}
          </span>
        </div>
      </div>
      <div
        aria-label={translateText("Chọn banner nổi bật", activeLanguage)}
        style={{
          position: "absolute",
          left: "50%",
          bottom: desktop ? "17px" : "14px",
          zIndex: 2,
          display: "flex",
          gap: "6px",
          transform: "translateX(-50%)",
        }}
      >
        {banners.map((banner, index) => (
          <span
            key={banner.title}
            role="button"
            tabIndex={0}
            aria-label={translateText(`Banner nổi bật ${index + 1}`, activeLanguage)}
            onClick={(event) => {
              event.preventDefault();
              setActiveBanner(index);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setActiveBanner(index);
              }
            }}
            style={{
              display: "block",
              flex: "0 0 auto",
              width: activeBanner === index ? 22 : 5,
              height: 5,
              border: 0,
              borderRadius: 99,
              padding: 0,
              background: activeBanner === index ? colors.gold : "rgba(255,255,255,.3)",
              cursor: "pointer",
              transition: "width 420ms cubic-bezier(.22,.78,.22,1), background 420ms ease",
            }}
          />
        ))}
      </div>
    </Link>
  );
}

function SectionHeading({ title, action }: { title: string; action?: string }) {
  return (
    <div style={sectionTitleStyle}>
      <h2 className="nl-home-section-title" style={homeSectionTitleTextStyle}>{title}</h2>
      {action ? <Link href="/danh-sach-quan" style={{ color: colors.muted, fontSize: "12px" }}>{action}</Link> : null}
    </div>
  );
}

function chunkHomeCarouselItems<T>(items: T[], itemsPerSlide: number) {
  const safeItemsPerSlide = Math.max(1, itemsPerSlide);
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += safeItemsPerSlide) {
    chunks.push(items.slice(index, index + safeItemsPerSlide));
  }

  return chunks;
}

function HomeCarouselDots({
  activeSlide,
  setActiveSlide,
  slideCount,
}: {
  activeSlide: number;
  setActiveSlide: React.Dispatch<React.SetStateAction<number>>;
  slideCount: number;
}) {
  if (slideCount < 2) return null;

  return (
    <div
      aria-label="Choose slide"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        minHeight: "5px",
        marginTop: "12px",
      }}
    >
      {Array.from({ length: slideCount }).map((_, index) => (
        <button
          key={index}
          type="button"
          className="nl-home-carousel-dot"
          aria-label={`Slide ${index + 1}`}
          aria-pressed={activeSlide === index}
          onClick={() => setActiveSlide(index)}
          style={{
            appearance: "none",
            display: "block",
            flex: "0 0 auto",
            width: activeSlide === index ? 22 : 5,
            minWidth: activeSlide === index ? 22 : 5,
            maxWidth: activeSlide === index ? 22 : 5,
            height: 5,
            minHeight: 5,
            maxHeight: 5,
            border: 0,
            borderRadius: 99,
            padding: 0,
            background: activeSlide === index ? colors.gold : "rgba(255,255,255,.26)",
            cursor: "pointer",
            fontSize: 0,
            lineHeight: 0,
            transition: "width 420ms cubic-bezier(.22,.78,.22,1), background 420ms ease",
          }}
        />
      ))}
    </div>
  );
}

function HomeCardCarousel<T>({
  ariaLabel,
  gap = 12,
  getKey,
  items,
  itemsPerSlide,
  renderItem,
}: {
  ariaLabel: string;
  gap?: number;
  getKey: (item: T) => string;
  items: T[];
  itemsPerSlide: number;
  renderItem: (item: T) => React.ReactNode;
}) {
  const slides = useMemo(
    () => chunkHomeCarouselItems(items, itemsPerSlide),
    [items, itemsPerSlide],
  );
  const slideKey = useMemo(() => items.map(getKey).join("|"), [getKey, items]);
  const [activeSlide, setActiveSlide] = useState(0);
  const swipeHandlers = useCarouselSwipe(slides.length, setActiveSlide);

  useEffect(() => {
    const timer = window.setTimeout(() => setActiveSlide(0), 0);
    return () => window.clearTimeout(timer);
  }, [itemsPerSlide, slideKey, slides.length]);

  useEffect(() => {
    if (process.env.NODE_ENV === "test" || slides.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, homeBannerAutoDelayMs);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <div
      className="nl-home-auto-carousel"
      aria-label={ariaLabel}
      {...swipeHandlers}
      style={{
        gridColumn: "1 / -1",
        overflow: "hidden",
        touchAction: "pan-y",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          transform: `translate3d(-${activeSlide * 100}%,0,0)`,
          transition: homeBannerSlideTransition,
          willChange: "transform, opacity",
        }}
      >
        {slides.map((slide, slideIndex) => (
          <div
            key={`${slideIndex}-${slide.map(getKey).join("-")}`}
            aria-hidden={activeSlide !== slideIndex}
            style={{
              flex: "0 0 100%",
              display: "grid",
              gridTemplateColumns: `repeat(${Math.max(1, itemsPerSlide)}, minmax(0, 1fr))`,
              gap,
              minWidth: 0,
              paddingRight: slideIndex < slides.length - 1 ? gap : 0,
              opacity: activeSlide === slideIndex ? 1 : 0.54,
              transition: "opacity 960ms ease",
            }}
          >
            {slide.map((item) => (
              <React.Fragment key={getKey(item)}>{renderItem(item)}</React.Fragment>
            ))}
          </div>
        ))}
      </div>
      <HomeCarouselDots activeSlide={activeSlide} setActiveSlide={setActiveSlide} slideCount={slides.length} />
    </div>
  );
}

function favoriteSnapshotFromHomeCard(item: HomeStoreCard): SavedFavoriteStore {
  return {
    slug: item.slug,
    name: item.name,
    categoryLabel: item.catLabel,
    areaLabel: item.area,
    cityLabel: item.cityCode,
    image: item.image,
  };
}

function VenueMiniCard({
  item,
  compact = false,
  isFavorite = false,
  onToggleFavorite,
}: {
  item: HomeStoreCard;
  compact?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (item: HomeStoreCard) => void;
}) {
  return (
    <Link
      href={item.href}
      className="nl-home-card nl-home-venue-card"
      onClick={() =>
        trackHomeVenueSignal({
          storeId: item.id,
          storeSlug: item.slug,
          category: item.category,
          source: "home_recommendation",
        })
      }
      style={{
        minWidth: compact ? "min(162px, 100%)" : "0",
        display: "block",
        overflow: "hidden",
        borderRadius: homeCardRadius,
        background: "var(--vy-surface-2)",
        border: "1px solid var(--vy-border)",
        color: colors.text,
      }}
    >
      <PlaceholderMedia
        src={item.img}
        alt={item.name ?? "Địa điểm"}
        label="Ảnh quán"
        style={{ height: compact ? "112px" : "156px", position: "relative" }}
      >
        <button
          type="button"
          aria-label={isFavorite ? "Bỏ lưu quán" : "Lưu quán"}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggleFavorite?.(item);
          }}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 30,
            minWidth: 30,
            maxWidth: 30,
            height: 30,
            minHeight: 30,
            maxHeight: 30,
            aspectRatio: "1 / 1",
            border: 0,
            borderRadius: "50%",
            background: "rgba(12,12,15,.7)",
            color: isFavorite ? colors.rose : "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "border-box",
            padding: 0,
            cursor: "pointer",
          }}
        >
          <Heart size={15} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </PlaceholderMedia>
      <div style={{ padding: "12px" }}>
        <div style={{ fontSize: "14px", fontWeight: 800 }}>{item.name}</div>
        <div style={{ marginTop: "4px", color: colors.muted, fontSize: "12px" }}>
          {item.area} · {item.catLabel}
        </div>
      </div>
    </Link>
  );
}

function LegacyCouponCard({ item, compact = false }: { item: HomeCouponItem; compact?: boolean }) {
  return (
    <Link
      href={item.href}
      className="nl-home-card nl-home-legacy-coupon-card"
      data-testid="home-coupon-cta"
      aria-label={`Xem ưu đãi ${item.title} tại ${item.place}`}
      style={{
        display: "grid",
        gridTemplateColumns: compact ? "82px 1fr auto" : "120px 1fr auto",
        alignItems: "center",
        gap: "14px",
        padding: compact ? "10px" : "12px",
        borderRadius: homeCardRadius,
        color: colors.text,
        border: `1px solid ${colors.line}`,
        background: "var(--vy-surface-2)",
      }}
    >
      <PlaceholderMedia
        src={item.img}
        alt={item.title ?? "Coupon"}
        label="Ảnh ưu đãi"
        style={{ height: compact ? "62px" : "82px", borderRadius: homeMediaRadius }}
      />
      <div style={{ minWidth: 0 }}>
        <div
          className="nl-home-coupon-value"
          style={{ color: colors.goldSoft, fontSize: compact ? "18px" : "22px", fontWeight: 900 }}
        >
          {item.value}
        </div>
        <div style={{ marginTop: "2px", fontSize: "14px", fontWeight: 800 }}>{item.title}</div>
        <div style={{ marginTop: "4px", color: colors.muted, fontSize: "12px" }}>{item.place}</div>
      </div>
      <span
        className="nl-home-coupon-action"
        style={{ color: colors.rose, fontSize: compact ? "11px" : "12px", fontWeight: 900, letterSpacing: ".03em" }}
      >
        Xem ưu đãi
      </span>
    </Link>
  );
}

function CouponCard({ item, compact = false }: { item: HomeCouponItem; compact?: boolean }) {
  const imageSize = compact ? 78 : 92;

  return (
    <Link
      href={item.href}
      className="nl-home-card nl-home-coupon-card"
      data-testid="home-coupon-cta"
      aria-label={`Xem ưu đãi ${item.title} tại ${item.place}`}
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: `${imageSize}px minmax(0, 1fr)`,
        alignItems: "center",
        gap: compact ? "11px" : "14px",
        minHeight: compact ? 104 : 124,
        padding: compact ? "11px" : "14px",
        borderRadius: homeCardRadius,
        color: colors.text,
        border: "1px solid rgba(240,221,168,.18)",
        background:
          "linear-gradient(135deg, rgba(255,255,255,.055), rgba(255,255,255,.025) 44%, rgba(212,178,106,.075))",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.05), 0 14px 28px rgba(0,0,0,.22)",
        overflow: "hidden",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 18,
          bottom: 18,
          width: 3,
          borderRadius: "0 999px 999px 0",
          background: `linear-gradient(180deg, ${colors.goldSoft}, ${colors.gold})`,
        }}
      />
      <PlaceholderMedia
        src={item.img}
        alt={item.title ?? "Coupon"}
        label="Ảnh ưu đãi"
        style={{
          width: imageSize,
          height: imageSize,
          borderRadius: compact ? 14 : 16,
          border: "1px solid rgba(240,221,168,.20)",
          boxShadow: "0 10px 20px rgba(0,0,0,.25)",
          overflow: "hidden",
        }}
      />
      <div style={{ minWidth: 0, display: "grid", gap: compact ? 5 : 7 }}>
        <span
          className="nl-home-coupon-value"
          style={{
            justifySelf: "start",
            maxWidth: "100%",
            borderRadius: 999,
            padding: compact ? "4px 9px" : "5px 11px",
            color: "#241a0a",
            background: `linear-gradient(135deg, ${colors.goldSoft}, ${colors.gold})`,
            fontSize: compact ? "13px" : "15px",
            lineHeight: 1,
            fontWeight: 950,
            boxShadow: "0 8px 18px rgba(212,178,106,.20)",
          }}
        >
          {item.value}
        </span>
        <div
          style={{
            minWidth: 0,
            fontSize: compact ? "13px" : "15px",
            lineHeight: 1.22,
            fontWeight: 900,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.title}
        </div>
        <div
          style={{
            color: colors.muted,
            fontSize: compact ? "11px" : "12px",
            lineHeight: 1.36,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.place}
        </div>
        <span
          className="nl-home-coupon-action"
          style={{
            justifySelf: "start",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            minHeight: compact ? 26 : 30,
            borderRadius: 999,
            padding: compact ? "0 10px" : "0 12px",
            color: colors.goldSoft,
            background: "rgba(212,178,106,.12)",
            border: "1px solid rgba(212,178,106,.22)",
            fontSize: compact ? "11px" : "12px",
            fontWeight: 900,
            letterSpacing: ".01em",
          }}
        >
          Xem ưu đãi
          <ChevronRight size={compact ? 13 : 14} strokeWidth={2.6} />
        </span>
      </div>
    </Link>
  );
}

function RankingRow({ item }: { item: RankedItem }) {
  const rankNumber = Number.parseInt(String(item.rank ?? ""), 10);
  const hasCrown = rankNumber >= 1 && rankNumber <= 5;
  const isPodium = rankNumber >= 1 && rankNumber <= 3;
  const rankingVisual = getRankingVisual(rankNumber, item);
  const podiumGlow =
    rankNumber === 1
      ? "radial-gradient(circle at 12% 0%, rgba(254,240,138,.28), transparent 34%)"
      : rankNumber === 2
        ? "radial-gradient(circle at 12% 0%, rgba(226,232,240,.22), transparent 34%)"
        : "radial-gradient(circle at 12% 0%, rgba(251,146,60,.22), transparent 34%)";

  return (
    <Link
      href={item.href ?? "/xep-hang"}
      className="nl-home-ranking-row"
      data-rank-tier={isPodium ? rankNumber : undefined}
      aria-label={`Xem chi tiết ${item.name ?? "mục xếp hạng"}`}
      style={{
        display: "grid",
        gridTemplateColumns: isPodium ? "68px minmax(0, 1fr) auto" : "64px minmax(0, 1fr) auto",
        alignItems: "center",
        gap: "16px",
        minHeight: isPodium ? "102px" : "92px",
        padding: isPodium ? "17px 16px" : "16px",
        borderRadius: homeCardRadius,
        background: rankingVisual.rowBackground,
        border: `1px solid ${rankingVisual.rowBorder}`,
        boxShadow: rankingVisual.rowShadow,
        color: colors.text,
        textDecoration: "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {isPodium ? (
        <span
          aria-hidden="true"
          className="nl-home-ranking-glow"
          style={{
            position: "absolute",
            inset: 0,
            background: `${podiumGlow}, linear-gradient(120deg, rgba(255,255,255,.16), transparent 28%, transparent 70%, rgba(255,255,255,.08))`,
            pointerEvents: "none",
          }}
        />
      ) : null}
      <PlaceholderMedia
        src={item.img}
        alt={item.name ?? "Xếp hạng"}
        label=""
        style={{
          width: isPodium ? 68 : 64,
          height: isPodium ? 68 : 64,
          borderRadius: "50%",
          flex: "none",
          border: `1px solid ${isPodium ? rankingVisual.rowBorder : colors.line}`,
          boxShadow: isPodium ? `0 0 0 4px rgba(255,255,255,.05), ${rankingVisual.rowShadow}` : "0 10px 20px rgba(0,0,0,.28)",
          position: "relative",
          zIndex: 1,
        }}
      />
      <div style={{ minWidth: 0, position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "7px" }}>
          <span
            style={{
              width: isPodium ? 43 : 38,
              height: isPodium ? 31 : 28,
              borderRadius: "10px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: rankingVisual.badgeBackground,
              color: rankingVisual.badgeColor,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,.34), 0 8px 18px rgba(0,0,0,.22)",
            }}
          >
            {hasCrown ? <Crown size={18} fill="currentColor" strokeWidth={2.4} /> : <span style={{ fontSize: "13px", fontWeight: 950 }}>{item.rank}</span>}
          </span>
          <span className="nl-home-ranking-label" style={{ color: rankingVisual.labelColor, fontSize: isPodium ? "12px" : "11px", fontWeight: 950, letterSpacing: ".08em", textTransform: "uppercase", textShadow: "none" }}>
            Top {item.rank}
          </span>
        </div>
        <div style={{ fontSize: isPodium ? "18px" : "17px", fontWeight: 950, lineHeight: 1.16 }}>{item.name}</div>
        <div
          style={{
            marginTop: "5px",
            color: rankingVisual.metaColor,
            fontSize: "13px",
            fontWeight: isPodium ? 760 : 650,
            lineHeight: 1.25,
            textShadow: isPodium ? "0 1px 8px rgba(0,0,0,.42)" : "none",
          }}
        >
          {item.area}
        </div>
      </div>
      <span
        aria-hidden="true"
        className="nl-home-ranking-arrow"
        style={{
          width: 30,
          height: 30,
          display: "grid",
          placeItems: "center",
          color: "rgba(240,221,168,.58)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <ChevronRight size={24} strokeWidth={2.35} />
      </span>
    </Link>
  );
}

function ServiceCard({ item, compact = false }: { item: HomeStoreCard; compact?: boolean }) {
  return (
    <Link
      href={item.href}
      className="nl-home-card nl-home-service-card"
      style={{
        overflow: "hidden",
        borderRadius: homeCardRadius,
        background: "var(--vy-surface-2)",
        border: "1px solid var(--vy-border)",
        color: colors.text,
      }}
    >
      <PlaceholderMedia
        src={item.img}
        alt={item.name ?? "Dịch vụ"}
        label="Ảnh dịch vụ"
        style={{ height: compact ? "92px" : "132px", position: "relative" }}
      >
        <span className="nl-home-media-pill" style={{ position: "absolute", top: 10, left: 10, ...pillStyle, background: "rgba(12,12,15,.66)", color: colors.goldSoft }}>
          {item.badgeText}
        </span>
      </PlaceholderMedia>
      <div style={{ padding: "12px" }}>
        <div style={{ fontSize: "14px", fontWeight: 800 }}>{item.name}</div>
        <div style={{ marginTop: "4px", color: colors.muted, fontSize: "12px" }}>{item.area}</div>
        <div style={{ marginTop: "6px", color: colors.goldSoft, fontSize: "12px", fontWeight: 800 }}>{item.priceLabel}</div>
      </div>
    </Link>
  );
}

function LegacyVideoCard({ item, compact = false }: { item: HomeVideoItem; compact?: boolean }) {
  return (
    <Link href={item.href} className="nl-home-video-card" style={{ minWidth: compact ? "166px" : "0", color: colors.text }}>
      <PlaceholderMedia
        src={item.img}
        alt={item.name ?? "Video"}
        label="Ảnh video"
        style={{ height: compact ? "96px" : "138px", borderRadius: homeCardRadius, position: "relative" }}
      >
        <span style={{ position: "absolute", inset: 0, background: "rgba(12,12,15,.22)" }} />
        <span style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(243,240,234,.92)", color: colors.ink }}>
          <Play size={17} fill={colors.ink} />
        </span>
      </PlaceholderMedia>
      <div style={{ marginTop: "9px", fontSize: "13px", fontWeight: 800 }}>{item.name.split("·")[0]}</div>
    </Link>
  );
}

function VideoCard({
  item,
  compact = false,
}: {
  item: HomeVideoItem;
  compact?: boolean;
}) {
  const title = item.name.split(" · ")[0] || item.name;
  const cardHeight = compact ? 218 : 244;

  return (
    <Link
      href={item.href}
      className="nl-home-card nl-home-video-card"
      aria-label={item.name}
      style={{
        minWidth: compact ? "min(224px, 100%)" : "0",
        minHeight: cardHeight,
        display: "block",
        borderRadius: homeCardRadius,
        border: "1px solid rgba(240,221,168,.28)",
        color: "#fff",
        textDecoration: "none",
        overflow: "hidden",
        boxShadow: "0 20px 44px rgba(0,0,0,.24)",
      }}
    >
      <PlaceholderMedia
        src={item.img}
        alt={item.name ?? "Video"}
        label="Video"
        style={{ minHeight: cardHeight, height: "100%", borderRadius: homeCardRadius, position: "relative", overflow: "hidden" }}
      >
        {item.videoUrl ? (
          <video
            src={item.videoUrl}
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : null}
        <span style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(12,12,15,.08) 0%,rgba(12,12,15,.28) 44%,rgba(12,12,15,.82) 100%)" }} />
        <span style={{ position: "absolute", left: "50%", top: "46%", transform: "translate(-50%,-50%)", width: compact ? 48 : 54, height: compact ? 48 : 54, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(243,240,234,.94)", color: colors.ink, boxShadow: "0 16px 34px rgba(0,0,0,.28)" }}>
          <Play size={compact ? 18 : 21} fill={colors.ink} />
        </span>
        <div
          style={{
            position: "absolute",
            left: compact ? 14 : 18,
            right: compact ? 14 : 18,
            bottom: compact ? 14 : 18,
            color: "#fff",
          }}
        >
          <div style={{ fontSize: compact ? "16px" : "18px", fontWeight: 950, lineHeight: 1.18 }}>{title}</div>
        </div>
      </PlaceholderMedia>
    </Link>
  );
}

function ContentPlaceholderCard({
  item,
  compact = false,
}: {
  item: HomeContentItem;
  compact?: boolean;
}) {
  const Icon = item.icon;
  const hasImage = Boolean(item.img);
  const cardBackground = hasImage
    ? `linear-gradient(180deg, rgba(12,12,15,.08) 0%, rgba(12,12,15,.82) 100%), ${item.img}`
    : "var(--vy-surface-2)";
  const cardStyle = {
    "--nl-home-content-card-bg": cardBackground,
    minWidth: compact ? "min(224px, 100%)" : "0",
    minHeight: compact ? 218 : 244,
    display: "flex",
    flexDirection: "column",
    justifyContent: hasImage ? "flex-end" : "flex-start",
    borderRadius: homeCardRadius,
    border: `1px solid ${hasImage ? "rgba(240,221,168,.28)" : colors.line}`,
    background: "var(--nl-home-content-card-bg)",
    color: hasImage ? "#fff" : colors.text,
    padding: compact ? "14px" : "18px",
    position: "relative",
    overflow: "hidden",
    boxShadow: hasImage ? "0 20px 44px rgba(0,0,0,.24)" : undefined,
  } as CSSProperties;

  return (
    <Link
      href={item.href}
      className={`nl-home-card nl-home-content-card${hasImage ? " nl-home-content-card--media" : ""}`}
      style={cardStyle}
    >
      <span
        style={{
          width: hasImage ? "fit-content" : compact ? 40 : 46,
          height: hasImage ? 31 : compact ? 40 : 46,
          borderRadius: hasImage ? "999px" : homeMediaRadius,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          color: hasImage ? "#f7e6b4" : colors.goldSoft,
          background: hasImage ? "rgba(12,12,15,.58)" : "var(--vy-gold-soft-bg)",
          border: `1px solid ${hasImage ? "rgba(240,221,168,.32)" : colors.line}`,
          padding: hasImage ? "0 10px" : 0,
          backdropFilter: hasImage ? "blur(10px)" : undefined,
          fontSize: compact ? 11 : 12,
          fontWeight: 900,
        }}
      >
        <Icon size={compact ? 20 : 23} />
        {hasImage ? item.kicker : null}
      </span>
      {!hasImage ? (
        <div style={{ marginTop: "12px", color: colors.gold, fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".08em" }}>
          {item.kicker}
        </div>
      ) : null}
      <div style={{ marginTop: hasImage ? "12px" : "8px", fontSize: compact ? "16px" : "18px", fontWeight: 950, lineHeight: 1.18 }}>
        {item.title}
      </div>
      <p style={{ marginTop: "7px", color: hasImage ? "rgba(255,255,255,.82)" : colors.muted, fontSize: "12px", lineHeight: 1.5 }}>
        {item.desc}
      </p>
      <div style={{ marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span style={{ color: hasImage ? "rgba(255,255,255,.7)" : colors.muted, fontSize: "11px", fontWeight: 800 }}>
          {item.meta}
        </span>
        <span className="nl-home-content-card-link" style={{ color: hasImage ? "#f7e6b4" : colors.gold, fontSize: "12px", fontWeight: 900, whiteSpace: "nowrap" }}>
          Xem chi tiết
        </span>
      </div>
    </Link>
  );
}

function HomeDataMessage({
  text,
  compact = false,
  minHeight,
}: {
  text: string;
  compact?: boolean;
  minHeight?: number | string;
}) {
  const activeLanguage = useActiveLanguage();

  if (text.trim().toLocaleLowerCase("vi").startsWith("đang tải")) {
    return (
      <DataSkeleton
        variant="cards"
        count={compact ? 2 : 3}
        columns={compact ? 2 : 3}
        compact={compact}
        ariaLabel={translateText("Đang tải nội dung", activeLanguage)}
        className="nl-home-data-skeleton"
        style={{
          minHeight: minHeight ?? (compact ? 92 : 118),
          minWidth: compact ? 180 : 0,
          gridColumn: "1 / -1",
        }}
      />
    );
  }

  return (
    <div
      className="nl-home-data-message"
      style={{
        minHeight: minHeight ?? (compact ? 92 : 118),
        width: "100%",
        minWidth: compact ? 180 : 0,
        gridColumn: "1 / -1",
        display: "grid",
        placeItems: "center",
        borderRadius: homeCardRadius,
        border: `1px dashed ${colors.line}`,
        background: "var(--vy-surface-1)",
        color: colors.muted,
        fontSize: compact ? 12 : 13,
        fontWeight: 800,
        textAlign: "center",
        padding: "14px",
      }}
    >
      {translateText(text, activeLanguage)}
    </div>
  );
}

function TabSwitch({
  items,
  active,
  onChange,
}: {
  items: { id: string; label: string }[];
  active: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      className="nl-home-tab-switch"
      style={{
        ...homeControlFrameStyle,
        display: "grid",
        gridTemplateColumns: `repeat(${items.length}, minmax(58px, 1fr))`,
        gap: "4px",
        padding: "4px",
        flex: "0 0 auto",
      }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={active === item.id ? "nl-home-tab-button is-active" : "nl-home-tab-button"}
          onClick={() => onChange(item.id)}
          style={{
            minHeight: 32,
            border: 0,
            borderRadius: "10px",
            padding: "0 13px",
            background: active === item.id ? colors.gold : "transparent",
            color: active === item.id ? "var(--vy-on-gold)" : colors.muted,
            fontWeight: 800,
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function RankingRegionDropdown({
  active,
  onChange,
  ariaLabel = "Chọn khu vực xếp hạng",
}: {
  active: ServiceRegion;
  onChange: (value: ServiceRegion) => void;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = serviceRegionTabs.find((item) => item.id === active) ?? serviceRegionTabs[0];

  return (
    <div
      style={{ position: "relative", flex: "none" }}
      onBlur={(event) => {
        const nextTarget = event.relatedTarget as Node | null;
        if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        className="nl-home-region-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        style={{
          ...homeControlFrameStyle,
          minWidth: 96,
          justifyContent: "center",
          gap: "7px",
          color: colors.goldSoft,
          padding: "0 13px",
          fontSize: "12px",
          fontWeight: 850,
          whiteSpace: "nowrap",
          cursor: "pointer",
          boxShadow: open ? "0 12px 28px rgba(0,0,0,.28)" : "none",
        }}
      >
        {selected.label}
        <ChevronDown
          size={14}
          style={{
            flex: "none",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 160ms ease",
          }}
        />
      </button>

      {open ? (
        <div
          role="listbox"
          className="nl-home-region-menu"
          aria-label={ariaLabel}
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            zIndex: 30,
            minWidth: "152px",
            padding: "6px",
            borderRadius: "16px",
            border: `1px solid ${colors.line}`,
            background: "rgba(16, 14, 20, .98)",
            boxShadow: "0 18px 44px rgba(0, 0, 0, .46)",
            backdropFilter: "blur(16px)",
          }}
        >
          {serviceRegionTabs.map((item) => {
            const selectedOption = active === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={selectedOption}
                onClick={() => {
                  onChange(item.id);
                  setOpen(false);
                }}
                style={{
                  width: "100%",
                  minHeight: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                  border: 0,
                  borderRadius: "12px",
                  background: selectedOption ? "var(--vy-gold-soft-bg)" : "transparent",
                  color: selectedOption ? colors.goldSoft : colors.muted,
                  padding: "0 10px",
                  fontSize: "12px",
                  fontWeight: 820,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span>{item.label}</span>
                {selectedOption ? (
                  <span
                    aria-hidden="true"
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "999px",
                      background: colors.gold,
                      boxShadow: "0 0 0 4px rgba(212,178,106,.12)",
                    }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function ServiceFilterControls({
  activeTab,
  onTabChange,
  activeRegion,
  onRegionChange,
  items,
}: {
  activeTab: string;
  onTabChange: (value: string) => void;
  activeRegion: ServiceRegion;
  onRegionChange: (value: ServiceRegion) => void;
  items: Array<{ id: string; label: string }>;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        margin: "10px 0 13px",
      }}
    >
      <TabSwitch items={items} active={activeTab} onChange={onTabChange} />
      <RankingRegionDropdown active={activeRegion} onChange={onRegionChange} ariaLabel="Chọn khu vực dịch vụ" />
    </div>
  );
}

function RankingSectionHeader({
  title = homeSectionTitleFallbacks.ranking,
  activeRegion,
  onRegionChange,
}: {
  title?: string;
  activeRegion: ServiceRegion;
  onRegionChange: (value: ServiceRegion) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "end",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
        marginBottom: "13px",
      }}
    >
      <div style={{ minWidth: 0, flex: "none" }}>
        <h2 className="nl-home-section-title" style={{ ...homeSectionTitleTextStyle, lineHeight: 1.08, fontWeight: 950 }}>{title}</h2>
      </div>

      <RankingRegionDropdown active={activeRegion} onChange={onRegionChange} />
    </div>
  );
}

function RankingListColumn({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: RankedItem[];
  emptyText: string;
}) {
  const list = items.slice(0, 5);

  return (
    <div
      className="nl-home-ranking-column"
      style={{
        minWidth: 0,
        display: "grid",
        alignContent: "start",
        gap: "10px",
        padding: "12px",
        borderRadius: homeCardRadius,
        border: `1px solid ${colors.line}`,
        background: "linear-gradient(180deg, rgba(255,255,255,.035), rgba(255,255,255,.015))",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          minHeight: 32,
        }}
      >
        <span style={{ color: colors.text, fontSize: 16, fontWeight: 950, lineHeight: 1.15 }}>{title}</span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            minHeight: 24,
            borderRadius: 999,
            padding: "0 10px",
            color: colors.goldSoft,
            background: "rgba(212,178,106,.12)",
            border: "1px solid rgba(212,178,106,.22)",
            fontSize: 11,
            fontWeight: 900,
            whiteSpace: "nowrap",
          }}
        >
          Top 5
        </span>
      </div>

      {list.length ? (
        <div style={{ display: "grid", gap: "10px", minWidth: 0 }}>
          {list.map((item) => (
            <RankingRow key={`${title}-${item.rank}-${item.href ?? item.name}`} item={item} />
          ))}
        </div>
      ) : (
        <HomeDataMessage text={emptyText} compact minHeight={118} />
      )}
    </div>
  );
}

function RankingSplitPanel({
  castItems,
  storeItems,
  error,
  stacked = false,
}: {
  castItems: RankedItem[];
  storeItems: RankedItem[];
  error?: string;
  stacked?: boolean;
}) {
  const emptyText = error || "Chưa có dữ liệu xếp hạng.";

  return (
    <div
      className="nl-home-ranking-split"
      style={{
        display: "grid",
        gridTemplateColumns: stacked ? "1fr" : "repeat(2, minmax(0, 1fr))",
        gap: stacked ? "12px" : "14px",
        alignItems: "start",
      }}
    >
      <RankingListColumn title="Cast" items={castItems} emptyText={emptyText} />
      <RankingListColumn title="Quán" items={storeItems} emptyText={emptyText} />
    </div>
  );
}

function BottomNav() {
  return null;
}

export default function HomePageClient() {
  const activeLanguage = useActiveLanguage();
  const feedback = useSystemFeedback();
  const userFeedback = useUserActionFeedback();
  const { rates } = useMoneyFormatter(activeLanguage);
  const [activeRankRegion, setActiveRankRegion] = useState<ServiceRegion>("hanoi");
  const [activeSvcTab, setActiveSvcTab] = useState("nhahang");
  const [activeServiceRegion, setActiveServiceRegion] = useState<ServiceRegion>("hanoi");
  const [activeVideoRegion, setActiveVideoRegion] = useState<ServiceRegion>("all");
  const [homeStores, setHomeStores] = useState<PublicStore[]>([]);
  const [isHomeStoresLoading, setHomeStoresLoading] = useState(true);
  const [homeStoresError, setHomeStoresError] = useState("");
  const [homeRecommendations, setHomeRecommendations] = useState<HomeStoreCard[]>([]);
  const [isHomeRecommendationsLoading, setHomeRecommendationsLoading] = useState(true);
  const [homeRecommendationsError, setHomeRecommendationsError] = useState("");
  const [homeBanners, setHomeBanners] = useState<CmsContentItem[]>([]);
  const [isHomeBannersLoading, setHomeBannersLoading] = useState(true);
  const [homeCoupons, setHomeCoupons] = useState<HomeCouponItem[]>([]);
  const [isHomeCouponsLoading, setHomeCouponsLoading] = useState(true);
  const [homeCouponsError, setHomeCouponsError] = useState("");
  const [castRankItems, setCastRankItems] = useState<RankedItem[]>([]);
  const [storeRankItems, setStoreRankItems] = useState<RankedItem[]>([]);
  const [isRankingsLoading, setRankingsLoading] = useState(true);
  const [rankingsError, setRankingsError] = useState("");
  const [featuredServices, setFeaturedServices] = useState<HomeStoreCard[]>([]);
  const [isFeaturedServicesLoading, setFeaturedServicesLoading] = useState(true);
  const [featuredServicesError, setFeaturedServicesError] = useState("");
  const homeHotVideosEnabled = isHomeHotVideosEnabled();
  const [homeVideos, setHomeVideos] = useState<HomeVideoItem[]>([]);
  const [isHomeVideosLoading, setHomeVideosLoading] = useState(homeHotVideosEnabled);
  const [homeVideosError, setHomeVideosError] = useState("");
  const [homeAppearance, setHomeAppearance] = useState<AppearanceConfig>(DEFAULT_APPEARANCE_CONFIG);
  const [homeContentItems, setHomeContentItems] = useState<HomeContentItem[]>([]);
  const [homeTours, setHomeTours] = useState<HomeContentItem[]>([]);
  const [isHomeContentLoading, setHomeContentLoading] = useState(true);
  const [homeContentError, setHomeContentError] = useState("");
  const canLoadSecondaryHomeData = useHomeSecondaryLoadReady();
  const [favoriteStoreSlugs, setFavoriteStoreSlugs] = useState<string[]>(
    () => (hasMemberFavoriteAccess() ? readFavoriteStoreSlugs() : []),
  );
  const homeCategoryItems = useMemo(
    () => homeAppearance.quick.map(mapAppearanceQuickItem),
    [homeAppearance.quick],
  );
  const homeSectionTitles = useMemo(
    () => getHomeSectionTitles(homeAppearance),
    [homeAppearance],
  );
  const dynamicServiceTabs = useMemo(
    () => [
      { id: "nhahang", label: homeSectionTitles.featured_restaurant },
      { id: "spa", label: homeSectionTitles.featured_spa },
    ],
    [homeSectionTitles],
  );
  const homeStoreCards = useMemo(
    () => homeStores.map(mapStoreToHomeCard),
    [homeStores],
  );
  const recommendedCards = homeRecommendations.length ? homeRecommendations : homeStoreCards;
  const guideItems = useMemo(
    () =>
      [...homeTours, ...homeContentItems]
        .sort(
          (a, b) =>
            (a.rank ?? Number.MAX_SAFE_INTEGER) - (b.rank ?? Number.MAX_SAFE_INTEGER) ||
            (a.createdAt ?? "").localeCompare(b.createdAt ?? ""),
        )
        .slice(0, 8),
    [homeTours, homeContentItems],
  );
  const heroBanners = useMemo(() => [...homeBanners]
    .filter(hasHomeBannerImage)
    .filter(b => getHomeBannerMetadata(b).position === "Trang chủ #1" || !getHomeBannerMetadata(b).position)
    .sort((a, b) => {
      const orderA = getHomeBannerMetadata(a).order;
      const orderB = getHomeBannerMetadata(b).order;
      return (typeof orderA === 'number' ? orderA : 999) - (typeof orderB === 'number' ? orderB : 999);
    }), [homeBanners]);
  const midBanners = useMemo(() => [...homeBanners]
    .filter(hasHomeBannerImage)
    .filter(b => getHomeBannerMetadata(b).position === "Trang chủ #2")
    .sort((a, b) => {
      const orderA = getHomeBannerMetadata(a).order;
      const orderB = getHomeBannerMetadata(b).order;
      return (typeof orderA === 'number' ? orderA : 999) - (typeof orderB === 'number' ? orderB : 999);
    }), [homeBanners]);
  const svc = featuredServices;
  const videoList = homeVideos;

  useEffect(() => {
    const style = document.createElement("style");
    style.dataset.homePremium = "true";
    style.textContent = "#nl-theme-btn{display:none!important}";
    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, []);

  useEffect(() => {
    const flashToast = readBookingConfirmationFlashToast();
    if (!flashToast) return;

    const localizedToast = buildBookingConfirmationFlashToast(flashToast, activeLanguage);
    if (!localizedToast) return;

    const toastTimer = window.setTimeout(() => {
      feedback.showToast({
        ...localizedToast,
        placement: "top-right",
      });
    }, 180);

    return () => {
      window.clearTimeout(toastTimer);
    };
  }, [activeLanguage, feedback]);

  useEffect(() => {
    let cancelled = false;

    if (!hasMemberFavoriteAccess()) {
      queueMicrotask(() => {
        if (!cancelled) setFavoriteStoreSlugs([]);
      });
      return () => {
        cancelled = true;
      };
    }

    storeFavoriteApi
      .list()
      .then((items) => {
        if (cancelled) return;

        const favoriteSnapshots = items.map((item) => ({
          slug: item.store.slug,
          name: item.store.name,
          categoryLabel: translateText(categoryLabels[item.store.category] ?? item.store.category, activeLanguage),
          areaLabel: [
            item.store.area?.name ?? item.store.district,
            cityLabels[item.store.cityCode ?? ""] ?? item.store.city,
          ]
            .filter(Boolean)
            .join(" · "),
          cityLabel: item.store.city,
          image: resolveClientUrl(item.store.thumbnailUrl) ?? storeImageForSlug(item.store.slug),
          favoritedAt: item.favoritedAt,
        }));

        replaceFavoriteStores(favoriteSnapshots);
        setFavoriteStoreSlugs(favoriteSnapshots.map((item) => item.slug));
      })
      .catch(() => {
        if (!cancelled) setFavoriteStoreSlugs(readFavoriteStoreSlugs());
      });

    return () => {
      cancelled = true;
    };
  }, [activeLanguage]);

  useEffect(() => {
    let cancelled = false;

    // Load cached config immediately on mount to prevent layout shift and delay
    const cached = getCachedAppearanceConfig();
    if (cached) {
      setHomeAppearance(cached);
    }

    getAppearanceConfig()
      .then((config) => {
        if (!cancelled) setHomeAppearance(config);
      })
      .catch(() => {
        if (!cancelled && !cached) setHomeAppearance(DEFAULT_APPEARANCE_CONFIG);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const behaviorSignals = getHomeBehaviorSignals();

    discoveryApi
      .listStoresStrict({ city: "all", limit: 8, sort: "priority" })
      .then((stores) => {
        if (!cancelled) setHomeStores(stores);
      })
      .catch(() => {
        if (!cancelled) {
          setHomeStores([]);
          setHomeStoresError("Chưa kết nối được API quán.");
        }
      })
      .finally(() => {
        if (!cancelled) setHomeStoresLoading(false);
      });

    contentApi
      .recommendations({
        cityCode: "all",
        limit: 8,
        categories: behaviorSignals.categories.join(","),
        storeSlugs: behaviorSignals.storeSlugs.join(","),
      })
      .then((items) => {
        if (!cancelled) setHomeRecommendations(items.map(mapRecommendationToHomeCard));
      })
      .catch(() => {
        if (!cancelled) {
          setHomeRecommendations([]);
          setHomeRecommendationsError("Chưa tải được gợi ý cá nhân hóa.");
        }
      })
      .finally(() => {
        if (!cancelled) setHomeRecommendationsLoading(false);
      });

    contentApi
      .list({ type: "BANNER", limit: 50 })
      .then((res) => {
        if (!cancelled && res.data) setHomeBanners(res.data);
      })
      .catch((e) => console.error("Failed to load banners", e))
      .finally(() => {
        if (!cancelled) setHomeBannersLoading(false);
      });

    const secondaryLoadTimer = window.setTimeout(() => {
      if (cancelled) return;

      campaignsApi
        .listPublicCampaigns({ limit: 6 })
        .then((campaigns) => {
          if (!cancelled) {
            setHomeCoupons(
              campaigns
                .slice(0, 6)
                .map((campaign, index) => mapCampaignToHomeItem(campaign, index, activeLanguage, rates)),
            );
          }
        })
        .catch(() => {
          if (!cancelled) {
            setHomeCoupons([]);
            setHomeCouponsError("Chưa tải được ưu đãi từ API.");
          }
        })
        .finally(() => {
          if (!cancelled) setHomeCouponsLoading(false);
        });

      Promise.all([
        tourApi.list({
          limit: 8,
        }),
        contentApi.list({ type: "BLOG", limit: 50 }),
      ])
        .then(([tourResponse, blogResponse]) => {
          if (cancelled) return;
          const tourItems = tourResponse.data.map((tour) => mapTourToHomeItem(tour, activeLanguage));
          const tourImages = tourResponse.data.flatMap((tour) => [
            tour.coverUrl,
            ...tour.stops.flatMap((stop) => stop.store.media.map((media) => media.url)),
          ]);
          setHomeTours(tourItems);
          const items = [...(blogResponse.data ?? [])]
            .filter(isHomeGuideBlog)
            .sort((a, b) => getHomeGuideRank(a) - getHomeGuideRank(b))
            .slice(0, 8)
            .map(mapContentToHomeItem);
          setHomeContentItems(withApiImageFallbacks(items, tourImages));
        })
        .catch(() => {
          if (!cancelled) {
            setHomeContentItems([]);
            setHomeContentError("Chưa tải được nội dung CMS.");
          }
        })
        .finally(() => {
          if (!cancelled) setHomeContentLoading(false);
        });
    }, homeSecondaryLoadDelayMs);

    return () => {
      cancelled = true;
      window.clearTimeout(secondaryLoadTimer);
    };
  }, [activeLanguage, rates]);

  useEffect(() => {
    if (!canLoadSecondaryHomeData) return;

    let cancelled = false;
    const city = regionToCityCode(activeRankRegion);

    queueMicrotask(() => {
      if (!cancelled) {
        setRankingsLoading(true);
        setRankingsError("");
      }
    });

    Promise.all([
      rankingsApi.list({ targetType: "CAST", city, limit: 10 }),
      rankingsApi.list({ targetType: "STORE", city, limit: 10 }),
    ])
      .then(([castResponse, storeResponse]) => {
        if (cancelled) return;
        setCastRankItems(castResponse.data.map(mapRankingToRankedItem));
        setStoreRankItems(storeResponse.data.map(mapRankingToRankedItem));
      })
      .catch(() => {
        if (!cancelled) {
          setCastRankItems([]);
          setStoreRankItems([]);
          setRankingsError("Chưa tải được bảng xếp hạng từ API.");
        }
      })
      .finally(() => {
        if (!cancelled) setRankingsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeRankRegion, canLoadSecondaryHomeData]);

  useEffect(() => {
    if (!canLoadSecondaryHomeData) return;

    let cancelled = false;
    const category = activeSvcTab === "nhahang" ? "RESTAURANT" : "MASSAGE_SPA";

    queueMicrotask(() => {
      if (!cancelled) {
        setFeaturedServicesLoading(true);
        setFeaturedServicesError("");
      }
    });

    const loadFeaturedServices = async () => {
      const limit = 8;
      const baseParams = {
        targetType: "STORE" as const,
        category,
        scope: "featured_home",
        limit,
      };
      const city = regionToCityCode(activeServiceRegion);

      if (city !== "all") {
        const response = await rankingsApi.list({ ...baseParams, city });
        return response.data;
      }

      try {
        const allResponse = await rankingsApi.list({ ...baseParams, city: "all" });
        if (allResponse.data.length > 0) {
          return allResponse.data.slice(0, limit);
        }
      } catch {
        // Fall back to the admin-style all-city merge below.
      }

      const cityResponses = await Promise.allSettled(
        vietnamServiceCityCodes.map((cityCode) =>
          rankingsApi.list({ ...baseParams, city: cityCode }),
        ),
      );
      const items = cityResponses.flatMap((result) =>
        result.status === "fulfilled" ? result.value.data : [],
      );

      return mergeFeaturedRankingItems(items, limit);
    };

    loadFeaturedServices()
      .then((items) => {
        if (!cancelled) setFeaturedServices(items.map(mapRankingToHomeCard));
      })
      .catch(() => {
        if (!cancelled) {
          setFeaturedServices([]);
          setFeaturedServicesError("Chưa tải được dịch vụ nổi bật từ API.");
        }
      })
      .finally(() => {
        if (!cancelled) setFeaturedServicesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeSvcTab, activeServiceRegion, canLoadSecondaryHomeData]);

  useEffect(() => {
    if (!homeHotVideosEnabled || !canLoadSecondaryHomeData) return;

    let cancelled = false;
    const cityCode = regionToCityCode(activeVideoRegion);

    queueMicrotask(() => {
      if (!cancelled) {
        setHomeVideosLoading(true);
        setHomeVideosError("");
      }
    });

    contentApi
      .hotVideos(cityCode)
      .then((videos) => {
        if (!cancelled) setHomeVideos(videos.map(mapTrackedHotVideoToHomeItem));
      })
      .catch(() => {
        if (!cancelled) {
          setHomeVideos([]);
          setHomeVideosError("Chưa tải được Video Hot từ API.");
        }
      })
      .finally(() => {
        if (!cancelled) setHomeVideosLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeVideoRegion, homeHotVideosEnabled, canLoadSecondaryHomeData]);

  useEffect(() => {
    if (!homeHotVideosEnabled || !homeVideos.length) return;

    const anonymousId = getHomeAnonymousId();

    homeVideos.slice(0, 4).forEach((item) => {
      if (!shouldTrackHotVideoView(item.id)) return;

      contentApi
        .trackHotVideoView(item.id, {
          source: "home_video",
          surface: "homepage",
          anonymousId,
          storeSlug: item.storeSlug,
        })
        .then((metric) => {
          setHomeVideos((current) =>
            current.map((video) =>
              video.id === item.id
                ? { ...video, viewCount: metric.viewCount, likeCount: metric.likeCount }
                : video,
            ),
          );
        })
        .catch(() => undefined);
    });
  }, [homeHotVideosEnabled, homeVideos]);

  const applyHomeStoreFavorite = async (item: HomeStoreCard, nextValue: boolean) => {
    const snapshot = favoriteSnapshotFromHomeCard(item);
    const applyFavorite = (favorited: boolean) => {
      writeFavoriteStore(snapshot, favorited);
      setFavoriteStoreSlugs((current) =>
        favorited
          ? [item.slug, ...current.filter((slug) => slug !== item.slug)]
          : current.filter((slug) => slug !== item.slug),
      );
    };

    applyFavorite(nextValue);
    trackHomeVenueSignal({
      storeId: item.id,
      storeSlug: item.slug,
      category: item.category,
      source: "home_favorite",
    });

    try {
      const state = nextValue
        ? await storeFavoriteApi.favorite(item.slug)
        : await storeFavoriteApi.unfavorite(item.slug);
      applyFavorite(state.favorited);
      const favoriteCopy = homeFavoriteFeedbackText(activeLanguage);
      userFeedback.success({
        title: state.favorited ? favoriteCopy.addedTitle : favoriteCopy.removedTitle,
        description: state.favorited
          ? favoriteCopy.addedDescription(item.name)
          : favoriteCopy.removedDescription(item.name),
      });
    } catch (error) {
      if (error instanceof ApiError && [401, 403].includes(error.status)) {
        applyFavorite(false);
        redirectToLoginForFavorite();
        return;
      }

      applyFavorite(!nextValue);
      const favoriteCopy = homeFavoriteFeedbackText(activeLanguage);
      userFeedback.error({
        title: favoriteCopy.updateErrorTitle,
        description: userActionErrorMessage(error, favoriteCopy.updateErrorFallback),
      });
    }
  };

  const toggleHomeStoreFavorite = (item: HomeStoreCard) => {
    if (!requireMemberFavoriteAccess()) {
      return;
    }

    const nextValue = !favoriteStoreSlugs.includes(item.slug);
    const favoriteCopy = homeFavoriteFeedbackText(activeLanguage);
    userFeedback.confirmAction({
      title: nextValue ? favoriteCopy.saveConfirmTitle : favoriteCopy.removeConfirmTitle,
      description: nextValue
        ? favoriteCopy.saveConfirmDescription(item.name)
        : favoriteCopy.removeConfirmDescription(item.name),
      confirmLabel: nextValue ? favoriteCopy.saveConfirmLabel : favoriteCopy.removeConfirmLabel,
      tone: nextValue ? "gold" : "warning",
      destructive: !nextValue,
      onConfirm: () => applyHomeStoreFavorite(item, nextValue),
    });
  };

  return (
    <React.Fragment>
      <div className="block md:hidden nl-home-page nl-home-page-mobile" style={shellStyle}>
        <div data-testid="home-mobile-shell" style={{ maxWidth: "430px", minHeight: "auto", margin: "0 auto", ...appStyle }}>
          <div data-testid="home-mobile-header">
            <HeaderBar />
          </div>
          <main style={{ padding: "0 18px 0" }}>
            <div data-testid="home-mobile-search" style={{ marginTop: "12px" }}>
              <SearchPanel />
            </div>
            <div data-testid="home-mobile-hero" style={{ marginTop: "16px" }}>
              <EventHero apiBanners={heroBanners} isLoading={isHomeBannersLoading} />
            </div>
            <div data-testid="home-mobile-categories" style={{ marginTop: "22px" }}>
              <CategoryGrid items={homeCategoryItems} />
            </div>

            <section data-testid="home-mobile-recommendations" style={{ marginTop: "24px" }}>
              <SectionHeading title={homeSectionTitles.recommend} action="Xem tất cả" />
              <div className="hscroll" style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "6px" }}>
                {isHomeRecommendationsLoading && isHomeStoresLoading ? (
                  <HomeDataMessage text="Đang tải quán từ API..." compact />
                ) : recommendedCards.length ? (
                  <HomeCardCarousel
                    ariaLabel="Home recommendations"
                    gap={12}
                    getKey={(item) => item.slug}
                    items={recommendedCards.slice(0, 8)}
                    itemsPerSlide={2}
                    renderItem={(item) => (
                      <VenueMiniCard
                        item={item}
                        compact
                        isFavorite={favoriteStoreSlugs.includes(item.slug)}
                        onToggleFavorite={toggleHomeStoreFavorite}
                      />
                    )}
                  />
                ) : (
                  <HomeDataMessage text={homeRecommendationsError || homeStoresError || "Chưa có quán từ backend."} compact />
                )}
              </div>
            </section>

            <section data-testid="home-mobile-coupons" style={{ marginTop: "18px" }}>
              <SectionHeading title={homeSectionTitles.coupon} />
              <div style={{ display: "grid", gap: "10px" }}>
                {isHomeCouponsLoading ? (
                  <HomeDataMessage text="Đang tải ưu đãi từ API..." compact />
                ) : homeCoupons.length ? (
                  homeCoupons.slice(0, 2).map((item) => <CouponCard key={item.id} item={item} compact />)
                ) : (
                  <HomeDataMessage text={homeCouponsError || "Chưa có ưu đãi đang hoạt động."} compact />
                )}
              </div>
            </section>

            <section data-testid="home-mobile-ranking" style={{ marginTop: "22px" }}>
              <RankingSectionHeader
                title={homeSectionTitles.ranking}
                activeRegion={activeRankRegion}
                onRegionChange={setActiveRankRegion}
              />
              {isRankingsLoading ? (
                <HomeDataMessage text="Đang tải bảng xếp hạng từ API..." />
              ) : castRankItems.length || storeRankItems.length ? (
                <RankingSplitPanel castItems={castRankItems} storeItems={storeRankItems} error={rankingsError} stacked />
              ) : (
                <HomeDataMessage text={rankingsError || "Chưa có dữ liệu xếp hạng."} />
              )}
            </section>

            <div style={{ marginTop: "20px" }}>
              <MidPageBanner apiBanners={midBanners} isLoading={isHomeBannersLoading} />
            </div>

            <section data-testid="home-mobile-featured" style={{ marginTop: "22px" }}>
              <div style={{ ...sectionTitleStyle, marginBottom: 0 }}>
                <h2 className="nl-home-section-title" style={homeSectionTitleTextStyle}>{homeSectionTitles.featured}</h2>
              </div>
              <ServiceFilterControls
                activeTab={activeSvcTab}
                onTabChange={setActiveSvcTab}
                activeRegion={activeServiceRegion}
                onRegionChange={setActiveServiceRegion}
                items={dynamicServiceTabs}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "11px" }}>
                {isFeaturedServicesLoading ? (
                  <HomeDataMessage text="Đang tải dịch vụ nổi bật từ API..." compact />
                ) : svc.length ? (
                  <HomeCardCarousel
                    ariaLabel="Featured services"
                    gap={11}
                    getKey={(item) => item.slug}
                    items={svc}
                    itemsPerSlide={2}
                    renderItem={(item) => <ServiceCard item={item} compact />}
                  />
                ) : (
                  <HomeDataMessage text={featuredServicesError || "Chưa có dịch vụ nổi bật phù hợp."} compact />
                )}
              </div>
            </section>

            <section data-testid="home-mobile-guide" style={{ marginTop: "22px" }}>
              <SectionHeading title={homeSectionTitles.guide} />
              <div className="hscroll" style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px" }}>
                {isHomeContentLoading ? (
                  <HomeDataMessage text="Đang tải nội dung CMS..." compact />
                ) : guideItems.length ? (
                  <HomeCardCarousel
                    ariaLabel="Tour blog guide"
                    gap={12}
                    getKey={(item) => item.id}
                    items={guideItems}
                    itemsPerSlide={1}
                    renderItem={(item) => <ContentPlaceholderCard item={item} compact />}
                  />
                ) : (
                  <HomeDataMessage text={homeContentError || "Chưa có bài viết/chính sách được xuất bản."} compact />
                )}
              </div>
            </section>

            <section data-testid="home-mobile-video" style={{ marginTop: "22px" }}>
              <div style={{ ...sectionTitleStyle, marginBottom: "12px" }}>
                <h2 className="nl-home-section-title" style={homeSectionTitleTextStyle}>{homeSectionTitles.video}</h2>
                <RankingRegionDropdown
                  active={activeVideoRegion}
                  onChange={setActiveVideoRegion}
                  ariaLabel="Chọn khu vực video"
                />
              </div>
              <div className="hscroll" style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px" }}>
                {!homeHotVideosEnabled ? (
                  <HomeDataMessage text={homeHotVideosPlaceholderText} compact />
                ) : isHomeVideosLoading ? (
                  <HomeDataMessage text="Đang tải Video Hot từ API..." compact />
                ) : videoList.length ? (
                  <HomeCardCarousel
                    ariaLabel="Video Hot"
                    gap={12}
                    getKey={(item) => item.id}
                    items={videoList}
                    itemsPerSlide={1}
                    renderItem={(item) => <VideoCard item={item} compact />}
                  />
                ) : (
                  <HomeDataMessage text={homeVideosError || "Chưa có Video Hot cho khu vực này."} compact />
                )}
              </div>
            </section>
          </main>
          <BottomNav />
        </div>
      </div>

      <div className="hidden md:block nl-home-page nl-home-page-desktop" style={{ ...shellStyle, background: colors.ink }}>
        <div style={{ width: "100%", minHeight: "auto", ...appStyle, border: 0, boxShadow: "none" }}>
          <HeaderBar desktop />
          <main style={{ padding: "10px 50px 0" }}>
            <div>
              <div>
                <SearchPanel />
              </div>
              <div style={{ gridColumn: "span 12", marginTop: "16px" }}>
                <EventHero desktop apiBanners={heroBanners} isLoading={isHomeBannersLoading} />
              </div>
            </div>

            <div style={{ marginTop: "28px" }}>
              <CategoryGrid desktop items={homeCategoryItems} />
            </div>

            <section style={{ marginTop: "34px" }}>
              <SectionHeading title={homeSectionTitles.recommend} action="Xem tất cả" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                {isHomeRecommendationsLoading && isHomeStoresLoading ? (
                  <HomeDataMessage text="Đang tải quán từ API..." />
                ) : recommendedCards.length ? (
                  <HomeCardCarousel
                    ariaLabel="Home recommendations"
                    gap={16}
                    getKey={(item) => item.slug}
                    items={recommendedCards.slice(0, 8)}
                    itemsPerSlide={4}
                    renderItem={(item) => (
                      <VenueMiniCard
                        item={item}
                        isFavorite={favoriteStoreSlugs.includes(item.slug)}
                        onToggleFavorite={toggleHomeStoreFavorite}
                      />
                    )}
                  />
                ) : (
                  <HomeDataMessage text={homeRecommendationsError || homeStoresError || "Chưa có quán từ backend."} />
                )}
              </div>
            </section>

            <section style={{ marginTop: "34px" }}>
              <div>
                <SectionHeading title={homeSectionTitles.coupon} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "16px" }}>
                  {isHomeCouponsLoading ? (
                    <HomeDataMessage text="Đang tải ưu đãi từ API..." />
                  ) : homeCoupons.length ? (
                    homeCoupons.map((item) => <CouponCard key={item.id} item={item} />)
                  ) : (
                    <HomeDataMessage text={homeCouponsError || "Chưa có ưu đãi đang hoạt động."} />
                  )}
                </div>
              </div>
              <div style={{ marginTop: "34px" }}>
                <RankingSectionHeader
                  title={homeSectionTitles.ranking}
                  activeRegion={activeRankRegion}
                  onRegionChange={setActiveRankRegion}
                />
                {isRankingsLoading ? (
                  <HomeDataMessage text="Đang tải bảng xếp hạng từ API..." />
                ) : castRankItems.length || storeRankItems.length ? (
                  <RankingSplitPanel castItems={castRankItems} storeItems={storeRankItems} error={rankingsError} />
                ) : (
                  <HomeDataMessage text={rankingsError || "Chưa có dữ liệu xếp hạng."} />
                )}
              </div>
            </section>

            <div style={{ marginTop: "34px" }}>
              <MidPageBanner desktop apiBanners={midBanners} isLoading={isHomeBannersLoading} />
            </div>

            <section style={{ marginTop: "34px" }}>
              <div style={{ ...sectionTitleStyle, marginBottom: 0 }}>
                <h2 className="nl-home-section-title" style={homeSectionTitleTextStyle}>
                  {homeSectionTitles.featured}
                </h2>
              </div>
              <ServiceFilterControls
                activeTab={activeSvcTab}
                onTabChange={setActiveSvcTab}
                activeRegion={activeServiceRegion}
                onRegionChange={setActiveServiceRegion}
                items={dynamicServiceTabs}
              />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                {isFeaturedServicesLoading ? (
                  <HomeDataMessage text="Đang tải dịch vụ nổi bật từ API..." />
                ) : svc.length ? (
                  <HomeCardCarousel
                    ariaLabel="Featured services"
                    gap={16}
                    getKey={(item) => item.slug}
                    items={svc}
                    itemsPerSlide={4}
                    renderItem={(item) => <ServiceCard item={item} />}
                  />
                ) : (
                  <HomeDataMessage text={featuredServicesError || "Chưa có dịch vụ nổi bật phù hợp."} />
                )}
              </div>
            </section>

            <section style={{ marginTop: "34px" }}>
              <SectionHeading title={homeSectionTitles.guide} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                {isHomeContentLoading ? (
                  <HomeDataMessage text="Đang tải nội dung CMS..." />
                ) : guideItems.length ? (
                  <HomeCardCarousel
                    ariaLabel="Tour blog guide"
                    gap={16}
                    getKey={(item) => item.id}
                    items={guideItems}
                    itemsPerSlide={3}
                    renderItem={(item) => <ContentPlaceholderCard item={item} />}
                  />
                ) : (
                  <HomeDataMessage text={homeContentError || "Chưa có bài viết/chính sách được xuất bản."} />
                )}
              </div>
            </section>

            <section style={{ marginTop: "34px" }}>
              <div style={{ ...sectionTitleStyle, marginBottom: "14px" }}>
                <h2 className="nl-home-section-title" style={homeSectionTitleTextStyle}>{homeSectionTitles.video}</h2>
                <RankingRegionDropdown
                  active={activeVideoRegion}
                  onChange={setActiveVideoRegion}
                  ariaLabel="Chọn khu vực video"
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                {!homeHotVideosEnabled ? (
                  <HomeDataMessage text={homeHotVideosPlaceholderText} />
                ) : isHomeVideosLoading ? (
                  <HomeDataMessage text="Đang tải Video Hot từ API..." />
                ) : videoList.length ? (
                  <HomeCardCarousel
                    ariaLabel="Video Hot"
                    gap={16}
                    getKey={(item) => item.id}
                    items={videoList}
                    itemsPerSlide={3}
                    renderItem={(item) => <VideoCard item={item} />}
                  />
                ) : (
                  <HomeDataMessage text={homeVideosError || "Chưa có Video Hot cho khu vực này."} />
                )}
              </div>
            </section>

          </main>
        </div>
      </div>
    </React.Fragment>
  );
}
