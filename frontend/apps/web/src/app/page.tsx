"use client";

import React, { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Crown,
  Heart,
  MapPin,
  Newspaper,
  Play,
  Search,
  SlidersHorizontal,
  Star,
  Ticket,
  Trophy,
  UserRound,
  Utensils,
  Waves,
} from "lucide-react";

import { PlaceholderMedia } from "@/components/ui/MediaPlaceholder";
import { discoveryApi, type PublicStore } from "@/lib/api/discovery";
import { contentApi, type CmsContentItem, type PublicHotVideo } from "@/lib/api/content";
import { couponApi, type PublicCoupon } from "@/lib/api/coupons";
import { rankingsApi, type PublicRankingItem } from "@/lib/api/rankings";
import { resolveClientUrl } from "@/lib/api/client";
import { formatPriceTier } from "@/lib/price-tier";

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
  { label: "Sự kiện", icon: CalendarDays, href: "/danh-sach-quan" },
  { label: "Ranking", icon: Crown, href: "/xep-hang" },
  { label: "Spa", icon: Waves, href: "/danh-sach-quan" },
  { label: "Nhà hàng", icon: Utensils, href: "/danh-sach-quan" },
  { label: "VIP", icon: Star, href: "/dang-nhap", featured: true },
];

const serviceTabs = [
  { id: "nhahang", label: "Nhà hàng" },
  { id: "spa", label: "Spa" },
];

const serviceRegionTabs = [
  { id: "hanoi", label: "Hà Nội" },
  { id: "hcm", label: "Hồ Chí Minh" },
  { id: "all", label: "Tổng hợp" },
] as const;

const rankTabs = [
  { id: "cast", label: "Cast" },
  { id: "quan", label: "Quán" },
];

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
};

function getHomeBannerMetadata(content: CmsContentItem): HomeBannerMetadata {
  return content.metadata ?? {};
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
  href: string;
};

type HomeContentItem = {
  id: string;
  title: string;
  desc: string;
  href: string;
  icon: typeof BookOpen;
};

type ServiceRegion = (typeof serviceRegionTabs)[number]["id"];

function normalizeArea(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getAreaRegion(areaValue = ""): Exclude<ServiceRegion, "all"> {
  const area = normalizeArea(areaValue);
  return area.includes("quan 1") || area.includes("hcm") || area.includes("ho chi minh")
    ? "hcm"
    : "hanoi";
}

function filterRankingsByRegion(items: RankedItem[], region: ServiceRegion) {
  const filteredItems = region === "all" ? items : items.filter((item) => getAreaRegion(item.area) === region);
  return filteredItems.slice(0, 5).map((item, index) => ({ ...item, rank: index + 1 }));
}

function regionToCityCode(region: ServiceRegion): "all" | "hn" | "hcm" {
  if (region === "hanoi") return "hn";
  if (region === "hcm") return "hcm";
  return "all";
}

function backgroundFromUrl(value?: string | null) {
  const url = resolveClientUrl(value);
  return url ? `url(${JSON.stringify(url)}) center/cover` : undefined;
}

function storeImage(store: PublicStore, index: number) {
  const backendImage = resolveClientUrl(store.thumbnailUrl);
  void index;
  return backendImage ? `url(${JSON.stringify(backendImage)}) center/cover` : undefined;
}

function storeAreaLabel(store: PublicStore) {
  const areaName = store.area?.name ?? store.district ?? "";
  const readableArea = areaLabels[areaName] ?? areaName;
  const readableCity = cityLabels[store.cityCode ?? ""] ?? store.city;

  return [readableArea, readableCity].filter(Boolean).join(" · ");
}

function mapStoreToHomeCard(store: PublicStore, index: number): HomeStoreCard {
  const categoryLabel = categoryLabels[store.category] ?? store.category;

  return {
    id: store.id,
    slug: store.slug,
    name: store.name,
    area: storeAreaLabel(store),
    catLabel: categoryLabel,
    category: store.category,
    cityCode: store.cityCode ?? "",
    img: storeImage(store, index),
    href: `/stores/${store.slug}`,
    badgeText: index < 2 ? "Đặt bàn nhanh" : categoryLabel,
    priceLabel: formatPriceTier(categoryPrices[store.category] ?? "từ 900.000đ"),
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

  return {
    id: item.targetId,
    slug: item.slug,
    name: item.name,
    area: storeAreaText(item.area, item.cityCode, item.city),
    catLabel: categoryLabel,
    category: item.category,
    cityCode: item.cityCode ?? "",
    img: backgroundFromUrl(item.image),
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

function formatCouponValue(coupon: PublicCoupon) {
  if (coupon.discountType === "PERCENT") return `-${coupon.discountValue}%`;
  if (coupon.discountValue >= 1000) return `-${Math.round(coupon.discountValue / 1000)}.000đ`;
  return `-${coupon.discountValue}đ`;
}

function mapCouponToHomeItem(coupon: PublicCoupon, index: number): HomeCouponItem {
  void index;
  const storeImageUrl = coupon.store.media?.[0]?.url;

  return {
    id: coupon.id,
    title: coupon.name,
    value: formatCouponValue(coupon),
    place: [coupon.store.name, storeAreaText(coupon.store.district, undefined, coupon.store.city)]
      .filter(Boolean)
      .join(" · "),
    img: backgroundFromUrl(storeImageUrl),
    href: `/stores/${coupon.store.slug}`,
  };
}

function mapHotVideoToHomeItem(video: PublicHotVideo, index: number): HomeVideoItem {
  void index;
  const name = [video.storeName, video.title].filter(Boolean).join(" · ");

  return {
    id: video.id,
    name: name || "Video Hot",
    img: backgroundFromUrl(video.url),
    href: video.href || (video.storeSlug ? `/stores/${video.storeSlug}` : "/danh-sach-quan"),
  };
}

function mapContentToHomeItem(content: CmsContentItem): HomeContentItem {
  return {
    id: content.id,
    title: content.title,
    desc: content.excerpt || "Khám phá nội dung mới từ Vietyoru.",
    href: content.type === "BLOG" ? `/blog/${content.slug}` : `/legal/${content.slug}`,
    icon: content.type === "BLOG" ? Newspaper : BookOpen,
  };
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
    }
  > = {
    1: {
      badgeBackground: "linear-gradient(140deg, #fef08a, #eab308)",
      badgeColor: "#713f12",
      rowBackground:
        "linear-gradient(135deg, rgba(254,240,138,.27), rgba(212,178,106,.15) 42%, rgba(255,255,255,.06))",
      rowBorder: "rgba(240,221,168,.58)",
      rowShadow: "0 0 0 1px rgba(254,240,138,.13) inset, 0 22px 48px rgba(234,179,8,.24), 0 16px 30px rgba(0,0,0,.24)",
      labelColor: "#fef3c7",
    },
    2: {
      badgeBackground: "linear-gradient(140deg, #f8fafc, #94a3b8)",
      badgeColor: "#1e293b",
      rowBackground:
        "linear-gradient(135deg, rgba(226,232,240,.25), rgba(148,163,184,.14) 42%, rgba(255,255,255,.06))",
      rowBorder: "rgba(226,232,240,.46)",
      rowShadow: "0 0 0 1px rgba(226,232,240,.10) inset, 0 22px 48px rgba(148,163,184,.22), 0 16px 30px rgba(0,0,0,.24)",
      labelColor: "#e2e8f0",
    },
    3: {
      badgeBackground: "linear-gradient(140deg, #fed7aa, #b45309)",
      badgeColor: "#451a03",
      rowBackground:
        "linear-gradient(135deg, rgba(251,146,60,.24), rgba(180,83,9,.14) 42%, rgba(255,255,255,.06))",
      rowBorder: "rgba(251,146,60,.46)",
      rowShadow: "0 0 0 1px rgba(251,146,60,.10) inset, 0 22px 48px rgba(180,83,9,.22), 0 16px 30px rgba(0,0,0,.24)",
      labelColor: "#fed7aa",
    },
    4: {
      badgeBackground: "linear-gradient(140deg, #a7f3d0, #22c55e)",
      badgeColor: "#064e3b",
      rowBackground: "rgba(255,255,255,.045)",
      rowBorder: "rgba(255,255,255,.12)",
      rowShadow: "0 16px 30px rgba(0,0,0,.14)",
      labelColor: colors.goldSoft,
    },
    5: {
      badgeBackground: "linear-gradient(140deg, #bfdbfe, #3b82f6)",
      badgeColor: "#1e3a8a",
      rowBackground: "rgba(255,255,255,.045)",
      rowBorder: "rgba(255,255,255,.12)",
      rowShadow: "0 16px 30px rgba(0,0,0,.14)",
      labelColor: colors.goldSoft,
    },
  };

  return rankVisuals[rankNumber] ?? {
    badgeBackground: item.crown ?? colors.gold,
    badgeColor: item.numColor ?? "#241a0a",
    rowBackground: "var(--vy-surface-2)",
    rowBorder: "var(--vy-border)",
    rowShadow: "var(--vy-shadow-card)",
    labelColor: colors.goldSoft,
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

const shellStyle: CSSProperties = {
  minHeight: "100vh",
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

function isHomeHotVideosEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_HOME_HOT_VIDEOS === "true";
}

function getBannerBackgroundImage(value?: string | null) {
  return value?.replace(/\s+center\/cover\s*$/i, "") || "var(--vy-hero-grad)";
}

function getBannerSlideTransform(index: number, activeIndex: number) {
  if (index === activeIndex) return "translate3d(0,0,0) scale(1.03)";
  return `translate3d(${index < activeIndex ? "-" : ""}34%,0,0) scale(1.05)`;
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

        return (
          <span
            key={`${banner.title}-${index}`}
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "inherit",
              backgroundColor: "var(--vy-surface)",
              backgroundImage: renderOnlyActiveBanner ? undefined : getBannerBackgroundImage(banner.img),
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

function CategoryGrid({ desktop = false }: { desktop?: boolean }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: desktop ? "repeat(8, minmax(0, 1fr))" : "repeat(4, 1fr)",
        gap: desktop ? "14px" : "15px 18px",
      }}
    >
      {categoryItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.label} href={item.href} style={{ color: colors.text, textAlign: "center" }}>
            <span
              style={{
                width: desktop ? "64px" : "54px",
                height: desktop ? "64px" : "54px",
                borderRadius: homeCardRadius,
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: item.featured ? colors.goldSoft : colors.gold,
                background: item.featured
                  ? "var(--vy-gold-soft-bg)"
                  : "var(--vy-surface-1)",
                border: `1px solid ${item.featured ? "var(--vy-border-gold-32)" : "var(--vy-border)"}`,
                boxShadow: item.featured ? "var(--vy-shadow)" : "none",
              }}
            >
              <Icon size={desktop ? 26 : 22} />
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

function EventHero({ desktop = false, apiBanners = [] }: { desktop?: boolean; apiBanners?: CmsContentItem[] }) {
  const [activeBanner, setActiveBanner] = useState(0);
  const fallbackBanner = useMemo<HomeBanner>(() => ({
    title: "Sự kiện đêm nay",
    desc: "Đặt bàn VIP từ 2.500.000đ",
    btnText: "Đặt ngay",
    img: "var(--vy-hero-grad)",
    statusLabel: "HOT",
    subtitle: "NightLife-VN",
    hasImage: false,
  }), []);
  
  const mappedBanners: HomeBanner[] = useMemo(() => {
    if (apiBanners.length === 0) return [fallbackBanner];
    return apiBanners.map(b => {
      const meta = getHomeBannerMetadata(b);
      const hasImage = !!meta.imageUrl;
      return {
        title: b.title,
        desc: meta.description || "",
        btnText: meta.tag || "Chi tiết",
        href: meta.link || "#",
        statusLabel: meta.statusLabel || "",
        subtitle: meta.subtitle || "",
        img: hasImage ? `linear-gradient(180deg,rgba(0,0,0,0.05) 0%,rgba(0,0,0,0.76) 100%), url('${meta.imageUrl}')` : "var(--vy-hero-grad)",
        hasImage,
      };
    });
  }, [apiBanners, fallbackBanner]);

  const banners: HomeBanner[] = mappedBanners;
  const event = banners[activeBanner] ?? banners[0] ?? fallbackBanner;
  const swipeHandlers = useBannerSwipe(banners.length, setActiveBanner);

  useEffect(() => {
    if (process.env.NODE_ENV === "test" || banners.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveBanner((current) => (current + 1) % banners.length);
    }, homeBannerAutoDelayMs);

    return () => window.clearInterval(timer);
  }, [banners.length]);

  return (
    <Link
      href={event.href || "/danh-sach-quan"}
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
      {event.hasImage && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.76))" }} />}
      <div key={event.title} style={{ position: "relative", zIndex: 1, animation: "nl-banner-copy-in 820ms cubic-bezier(.22,.78,.22,1)" }}>
        {event.statusLabel && (
          <span
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
            {event.statusLabel}
          </span>
        )}
        {event.subtitle && (
          <div style={{ marginTop: "20px", color: colors.goldSoft, fontSize: desktop ? "13px" : "11px", letterSpacing: ".24em" }}>
            {event.subtitle}
          </div>
        )}
        <h1 style={{ maxWidth: desktop ? "620px" : "260px", marginTop: (event.subtitle || event.statusLabel) ? "8px" : "20px", fontSize: desktop ? "48px" : "25px", lineHeight: 1.05, fontWeight: 900 }}>
          {event.title}
        </h1>
        <div style={{ marginTop: desktop ? "22px" : "16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <span style={{ maxWidth: desktop ? "none" : "168px", fontSize: desktop ? "15px" : "12px", lineHeight: 1.35 }}>{event.desc}</span>
          <span
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
            {event.btnText}
          </span>
        </div>
      </div>
      <div
        aria-label="Chọn banner"
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
            aria-label={`Banner ${index + 1}`}
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

function MidPageBanner({ desktop = false, apiBanners = [] }: { desktop?: boolean; apiBanners?: CmsContentItem[] }) {
  const [activeBanner, setActiveBanner] = useState(0);
  const fallbackBanner = useMemo<HomeBanner>(() => ({
    title: "Ưu đãi đêm nay",
    desc: "Lướt để xem thêm ưu đãi và sự kiện nổi bật.",
    btnText: "Xem ngay",
    img: "linear-gradient(135deg,#15151a,#2a2112)",
  }), []);
  const banners: HomeBanner[] = useMemo(() => {
    if (!apiBanners.length) return [fallbackBanner];
    return apiBanners.map((banner) => {
      const meta = getHomeBannerMetadata(banner);
      return {
        title: banner.title,
        desc: meta.description || banner.excerpt || "",
        btnText: meta.tag || "Xem ngay",
        href: meta.link || "/uu-dai",
        statusLabel: meta.statusLabel || "",
        subtitle: meta.subtitle || "",
        img: meta.imageUrl
          ? `linear-gradient(90deg,rgba(8,8,11,.88),rgba(8,8,11,.34)), url('${meta.imageUrl}') center/cover`
          : "linear-gradient(135deg,#15151a,#2a2112)",
      };
    });
  }, [apiBanners, fallbackBanner]);
  const event = banners[activeBanner] ?? banners[0] ?? fallbackBanner;
  const swipeHandlers = useBannerSwipe(banners.length, setActiveBanner);

  useEffect(() => {
    if (process.env.NODE_ENV === "test" || banners.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveBanner((current) => (current + 1) % banners.length);
    }, homeBannerAutoDelayMs);

    return () => window.clearInterval(timer);
  }, [banners.length]);

  return (
    <Link
      href={event.href || "/uu-dai"}
      data-testid="home-mid-banner"
      {...swipeHandlers}
      style={{
        minHeight: desktop ? "210px" : "132px",
        borderRadius: homeCardRadius,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: desktop ? "26px 28px 42px" : "14px 14px 32px",
        color: "#fff",
        border: `1px solid ${colors.line}`,
        boxShadow: "0 18px 36px rgba(0,0,0,.28)",
        touchAction: "pan-y",
      }}
    >
      <BannerMediaSlides activeBanner={activeBanner} banners={banners} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg,rgba(8,8,11,.88),rgba(8,8,11,.5) 54%,rgba(8,8,11,.18)), linear-gradient(180deg,rgba(0,0,0,.06),rgba(0,0,0,.7))",
        }}
      />
      <div key={event.title} style={{ position: "relative", zIndex: 1, maxWidth: desktop ? "520px" : "248px", animation: "nl-banner-copy-in 820ms cubic-bezier(.22,.78,.22,1)" }}>
        <div
          style={{
            color: colors.goldSoft,
            fontSize: desktop ? "11px" : "9px",
            fontWeight: 900,
            letterSpacing: ".18em",
            textTransform: "uppercase",
          }}
        >
          Banner nổi bật
        </div>
        <h3
          style={{
            marginTop: desktop ? "10px" : "6px",
            fontSize: desktop ? "30px" : "18px",
            lineHeight: 1.08,
            fontWeight: 900,
          }}
        >
          {event.title}
        </h3>
        <div
          style={{
            marginTop: desktop ? "12px" : "8px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: colors.text,
            fontSize: desktop ? "13px" : "11px",
            lineHeight: 1.35,
          }}
        >
          <span style={{ minWidth: 0 }}>{event.desc}</span>
          <span
            style={{
              flex: "none",
              borderRadius: "999px",
              background: `linear-gradient(135deg,${colors.goldSoft},${colors.gold})`,
              color: "#241a0a",
              padding: desktop ? "9px 15px" : "7px 11px",
              fontSize: desktop ? "12px" : "10px",
              fontWeight: 900,
              whiteSpace: "nowrap",
            }}
          >
            {event.btnText}
          </span>
        </div>
      </div>
      <div
        aria-label="Chọn banner nổi bật"
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
            aria-label={`Banner nổi bật ${index + 1}`}
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

function VenueMiniCard({ item, compact = false }: { item: HomeStoreCard; compact?: boolean }) {
  return (
    <Link
      href={item.href}
      style={{
        minWidth: compact ? "162px" : "0",
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
        <span style={{ position: "absolute", top: 10, right: 10, width: 30, height: 30, borderRadius: "50%", background: "rgba(12,12,15,.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Heart size={15} color="#fff" />
        </span>
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

function CouponCard({ item, compact = false }: { item: HomeCouponItem; compact?: boolean }) {
  return (
    <Link
      href={item.href}
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
        <div style={{ color: colors.goldSoft, fontSize: compact ? "18px" : "22px", fontWeight: 900 }}>{item.value}</div>
        <div style={{ marginTop: "2px", fontSize: "14px", fontWeight: 800 }}>{item.title}</div>
        <div style={{ marginTop: "4px", color: colors.muted, fontSize: "12px" }}>{item.place}</div>
      </div>
      <span style={{ color: colors.rose, fontSize: compact ? "11px" : "12px", fontWeight: 900, letterSpacing: ".03em" }}>Xem ưu đãi</span>
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
          <span style={{ color: rankingVisual.labelColor, fontSize: isPodium ? "12px" : "11px", fontWeight: 950, letterSpacing: ".08em", textTransform: "uppercase", textShadow: isPodium ? "0 6px 16px rgba(0,0,0,.36)" : "none" }}>
            Top {item.rank}
          </span>
        </div>
        <div style={{ fontSize: isPodium ? "18px" : "17px", fontWeight: 950, lineHeight: 1.16 }}>{item.name}</div>
        <div style={{ marginTop: "5px", color: colors.muted, fontSize: "13px", lineHeight: 1.25 }}>{item.area}</div>
      </div>
      <span
        aria-hidden="true"
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
        <span style={{ position: "absolute", top: 10, left: 10, ...pillStyle, background: "rgba(12,12,15,.66)", color: colors.goldSoft }}>
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

function VideoCard({ item, compact = false }: { item: HomeVideoItem; compact?: boolean }) {
  return (
    <Link href={item.href} style={{ minWidth: compact ? "166px" : "0", color: colors.text }}>
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

function ContentPlaceholderCard({
  item,
  compact = false,
}: {
  item: HomeContentItem;
  compact?: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      style={{
        minWidth: compact ? "172px" : "0",
        display: "block",
        borderRadius: homeCardRadius,
        border: `1px solid ${colors.line}`,
        background: "var(--vy-surface-2)",
        color: colors.text,
        padding: compact ? "14px" : "18px",
      }}
    >
      <span
        style={{
          width: compact ? 40 : 46,
          height: compact ? 40 : 46,
          borderRadius: homeMediaRadius,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: colors.goldSoft,
          background: "var(--vy-gold-soft-bg)",
          border: `1px solid ${colors.line}`,
        }}
      >
        <Icon size={compact ? 20 : 23} />
      </span>
      <div style={{ marginTop: "12px", fontSize: compact ? "14px" : "16px", fontWeight: 900 }}>
        {item.title}
      </div>
      <p style={{ marginTop: "6px", color: colors.muted, fontSize: "12px", lineHeight: 1.5 }}>
        {item.desc}
      </p>
      <div style={{ marginTop: "12px", color: colors.gold, fontSize: "12px", fontWeight: 900 }}>
        Xem chi tiết
      </div>
    </Link>
  );
}

function HomeDataMessage({ text, compact = false }: { text: string; compact?: boolean }) {
  return (
    <div
      style={{
        minHeight: compact ? 92 : 118,
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
      {text}
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
    <div style={{ display: "flex", gap: "6px", border: `1px solid ${colors.line}`, borderRadius: homeCardRadius, padding: "4px", background: "rgba(255,255,255,.035)" }}>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          style={{
            border: 0,
            borderRadius: homeMediaRadius,
            padding: "7px 14px",
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
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        style={{
          minHeight: 38,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "7px",
          border: `1px solid ${colors.line}`,
          borderRadius: homeCardRadius,
          background: "var(--vy-surface-1)",
          color: colors.goldSoft,
          padding: "0 13px 0 15px",
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
            background: "var(--vy-surface-1)",
            boxShadow: "var(--vy-shadow-card)",
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
}: {
  activeTab: string;
  onTabChange: (value: string) => void;
  activeRegion: ServiceRegion;
  onRegionChange: (value: ServiceRegion) => void;
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
      <TabSwitch items={serviceTabs} active={activeTab} onChange={onTabChange} />
      <RankingRegionDropdown active={activeRegion} onChange={onRegionChange} ariaLabel="Chọn khu vực dịch vụ" />
    </div>
  );
}

function RankingSectionHeader({
  activeTab,
  onTabChange,
  activeRegion,
  onRegionChange,
}: {
  activeTab: string;
  onTabChange: (value: string) => void;
  activeRegion: ServiceRegion;
  onRegionChange: (value: ServiceRegion) => void;
}) {
  return (
    <div style={{ display: "grid", gap: "12px", marginBottom: "13px" }}>
      <div style={{ display: "flex", alignItems: "end", gap: "13px" }}>
        <div style={{ minWidth: 0, flex: "none" }}>
          <h2 className="nl-home-section-title" style={{ ...homeSectionTitleTextStyle, lineHeight: 1.08, fontWeight: 950 }}>Bảng xếp hạng</h2>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <TabSwitch items={rankTabs} active={activeTab} onChange={onTabChange} />
        <RankingRegionDropdown active={activeRegion} onChange={onRegionChange} />
      </div>
    </div>
  );
}

function BottomNav() {
  return null;
}

export default function Page() {
  const [activeRankTab, setActiveRankTab] = useState("cast");
  const [activeRankRegion, setActiveRankRegion] = useState<ServiceRegion>("hanoi");
  const [activeSvcTab, setActiveSvcTab] = useState("nhahang");
  const [activeServiceRegion, setActiveServiceRegion] = useState<ServiceRegion>("hanoi");
  const [activeVideoRegion, setActiveVideoRegion] = useState<ServiceRegion>("hanoi");
  const [homeStores, setHomeStores] = useState<PublicStore[]>([]);
  const [isHomeStoresLoading, setHomeStoresLoading] = useState(true);
  const [homeStoresError, setHomeStoresError] = useState("");
  const [homeBanners, setHomeBanners] = useState<CmsContentItem[]>([]);
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
  const [homeContentItems, setHomeContentItems] = useState<HomeContentItem[]>([]);
  const [isHomeContentLoading, setHomeContentLoading] = useState(true);
  const [homeContentError, setHomeContentError] = useState("");
  const homeStoreCards = useMemo(
    () => homeStores.map(mapStoreToHomeCard),
    [homeStores],
  );
  const rankList = filterRankingsByRegion(
    activeRankTab === "quan" ? storeRankItems : castRankItems,
    activeRankRegion,
  );
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
    let cancelled = false;

    discoveryApi
      .listStoresStrict({ city: "all", limit: 24, sort: "priority" })
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
      .list({ type: "BANNER", limit: 3 })
      .then((res) => {
        if (!cancelled && res.data) setHomeBanners(res.data);
      })
      .catch((e) => console.error("Failed to load banners", e));

    couponApi
      .listPublicCoupons()
      .then((coupons) => {
        if (!cancelled) setHomeCoupons(coupons.slice(0, 6).map(mapCouponToHomeItem));
      })
      .catch(() => {
        if (!cancelled) {
          setHomeCoupons([]);
          setHomeCouponsError("Chưa tải được coupon từ API.");
        }
      })
      .finally(() => {
        if (!cancelled) setHomeCouponsLoading(false);
      });

    Promise.all([
      rankingsApi.list({ targetType: "CAST", city: "all", limit: 10 }),
      rankingsApi.list({ targetType: "STORE", city: "all", limit: 10 }),
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

    Promise.all([
      contentApi.list({ type: "BLOG", limit: 3 }),
      contentApi.list({ type: "POLICY", limit: 3 }),
    ])
      .then(([blogResponse, policyResponse]) => {
        if (cancelled) return;
        const items = [...(blogResponse.data ?? []), ...(policyResponse.data ?? [])]
          .slice(0, 3)
          .map(mapContentToHomeItem);
        setHomeContentItems(items);
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

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const category = activeSvcTab === "nhahang" ? "RESTAURANT" : "MASSAGE_SPA";

    queueMicrotask(() => {
      if (!cancelled) {
        setFeaturedServicesLoading(true);
        setFeaturedServicesError("");
      }
    });

    rankingsApi
      .list({
        targetType: "STORE",
        city: regionToCityCode(activeServiceRegion),
        category,
        scope: "featured_home",
        limit: 8,
      })
      .then((response) => {
        if (!cancelled) setFeaturedServices(response.data.map(mapRankingToHomeCard));
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
  }, [activeSvcTab, activeServiceRegion]);

  useEffect(() => {
    if (!homeHotVideosEnabled) return;

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
        if (!cancelled) setHomeVideos(videos.map(mapHotVideoToHomeItem));
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
  }, [activeVideoRegion, homeHotVideosEnabled]);

  return (
    <React.Fragment>
      <div className="block md:hidden" style={shellStyle}>
        <div data-testid="home-mobile-shell" style={{ maxWidth: "430px", minHeight: "100vh", margin: "0 auto", ...appStyle }}>
          <div data-testid="home-mobile-header">
            <HeaderBar />
          </div>
          <main style={{ padding: "0 18px 0" }}>
            <div data-testid="home-mobile-search" style={{ marginTop: "12px" }}>
              <SearchPanel />
            </div>
            <div data-testid="home-mobile-hero" style={{ marginTop: "16px" }}>
              <EventHero apiBanners={homeBanners} />
            </div>
            <div data-testid="home-mobile-categories" style={{ marginTop: "22px" }}>
              <CategoryGrid />
            </div>

            <section data-testid="home-mobile-recommendations" style={{ marginTop: "24px" }}>
              <SectionHeading title="Đề xuất tối nay" action="Xem tất cả" />
              <div className="hscroll" style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "6px" }}>
                {isHomeStoresLoading ? (
                  <HomeDataMessage text="Đang tải quán từ API..." compact />
                ) : homeStoreCards.length ? (
                  homeStoreCards.slice(0, 3).map((item) => <VenueMiniCard key={item.slug} item={item} compact />)
                ) : (
                  <HomeDataMessage text={homeStoresError || "Chưa có quán từ backend."} compact />
                )}
              </div>
            </section>

            <section data-testid="home-mobile-coupons" style={{ marginTop: "18px" }}>
              <SectionHeading title="Coupon Hot" />
              <div style={{ display: "grid", gap: "10px" }}>
                {isHomeCouponsLoading ? (
                  <HomeDataMessage text="Đang tải coupon từ API..." compact />
                ) : homeCoupons.length ? (
                  homeCoupons.slice(0, 2).map((item) => <CouponCard key={item.id} item={item} compact />)
                ) : (
                  <HomeDataMessage text={homeCouponsError || "Chưa có coupon đang hoạt động."} compact />
                )}
              </div>
            </section>

            <section data-testid="home-mobile-ranking" style={{ marginTop: "22px" }}>
              <RankingSectionHeader
                activeTab={activeRankTab}
                onTabChange={setActiveRankTab}
                activeRegion={activeRankRegion}
                onRegionChange={setActiveRankRegion}
              />
              <div style={{ display: "grid", gap: "10px" }}>
                {isRankingsLoading ? (
                  <HomeDataMessage text="Đang tải bảng xếp hạng từ API..." />
                ) : rankList.length ? (
                  rankList.map((item) => <RankingRow key={`${activeRankTab}-${item.rank}`} item={item} />)
                ) : (
                  <HomeDataMessage text={rankingsError || "Chưa có dữ liệu xếp hạng."} />
                )}
              </div>
            </section>

            <div style={{ marginTop: "20px" }}>
              <MidPageBanner apiBanners={homeBanners} />
            </div>

            <section data-testid="home-mobile-featured" style={{ marginTop: "22px" }}>
              <div style={{ ...sectionTitleStyle, marginBottom: 0 }}>
                <h2 className="nl-home-section-title" style={homeSectionTitleTextStyle}>Dịch vụ nổi bật</h2>
              </div>
              <ServiceFilterControls
                activeTab={activeSvcTab}
                onTabChange={setActiveSvcTab}
                activeRegion={activeServiceRegion}
                onRegionChange={setActiveServiceRegion}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "11px" }}>
                {isFeaturedServicesLoading ? (
                  <HomeDataMessage text="Đang tải dịch vụ nổi bật từ API..." compact />
                ) : svc.length ? (
                  svc.slice(0, 2).map((item) => <ServiceCard key={item.slug} item={item} compact />)
                ) : (
                  <HomeDataMessage text={featuredServicesError || "Chưa có dịch vụ nổi bật phù hợp."} compact />
                )}
              </div>
            </section>

            <section data-testid="home-mobile-guide" style={{ marginTop: "22px" }}>
              <SectionHeading title="Tour / Blog / Guide" />
              <div className="hscroll" style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px" }}>
                {isHomeContentLoading ? (
                  <HomeDataMessage text="Đang tải nội dung CMS..." compact />
                ) : homeContentItems.length ? (
                  homeContentItems.map((item) => <ContentPlaceholderCard key={item.id} item={item} compact />)
                ) : (
                  <HomeDataMessage text={homeContentError || "Chưa có bài viết/chính sách được xuất bản."} compact />
                )}
              </div>
            </section>

            <section data-testid="home-mobile-video" style={{ marginTop: "22px", paddingBottom: "22px" }}>
              <div style={{ ...sectionTitleStyle, marginBottom: "12px" }}>
                <h2 className="nl-home-section-title" style={homeSectionTitleTextStyle}>Video Hot</h2>
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
                  videoList.slice(0, 3).map((item) => <VideoCard key={item.id} item={item} compact />)
                ) : (
                  <HomeDataMessage text={homeVideosError || "Chưa có Video Hot cho khu vực này."} compact />
                )}
              </div>
            </section>
          </main>
          <BottomNav />
        </div>
      </div>

      <div className="hidden md:block" style={{ ...shellStyle, background: colors.ink }}>
        <div style={{ width: "100%", minHeight: "100vh", ...appStyle, border: 0, boxShadow: "none" }}>
          <HeaderBar desktop />
          <main style={{ padding: "10px 50px 44px" }}>
            <div>
              <div>
                <SearchPanel />
              </div>
              <div style={{ gridColumn: "span 12" }}>
                <EventHero desktop apiBanners={homeBanners} />
              </div>
            </div>

            <div style={{ marginTop: "28px" }}>
              <CategoryGrid desktop />
            </div>

            <section style={{ marginTop: "34px" }}>
              <SectionHeading title="Đề xuất tối nay" action="Xem tất cả" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                {isHomeStoresLoading ? (
                  <HomeDataMessage text="Đang tải quán từ API..." />
                ) : homeStoreCards.length ? (
                  homeStoreCards.slice(0, 4).map((item) => <VenueMiniCard key={item.slug} item={item} />)
                ) : (
                  <HomeDataMessage text={homeStoresError || "Chưa có quán từ backend."} />
                )}
              </div>
            </section>

            <section style={{ marginTop: "34px" }}>
              <div>
                <SectionHeading title="Coupon Hot" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "16px" }}>
                  {isHomeCouponsLoading ? (
                    <HomeDataMessage text="Đang tải coupon từ API..." />
                  ) : homeCoupons.length ? (
                    homeCoupons.map((item) => <CouponCard key={item.id} item={item} />)
                  ) : (
                    <HomeDataMessage text={homeCouponsError || "Chưa có coupon đang hoạt động."} />
                  )}
                </div>
              </div>
              <div style={{ marginTop: "34px" }}>
                <RankingSectionHeader
                  activeTab={activeRankTab}
                  onTabChange={setActiveRankTab}
                  activeRegion={activeRankRegion}
                  onRegionChange={setActiveRankRegion}
                />
                <div style={{ display: "grid", gap: "12px" }}>
                  {isRankingsLoading ? (
                    <HomeDataMessage text="Đang tải bảng xếp hạng từ API..." />
                  ) : rankList.length ? (
                    rankList.map((item) => <RankingRow key={`${activeRankTab}-${item.rank}`} item={item} />)
                  ) : (
                    <HomeDataMessage text={rankingsError || "Chưa có dữ liệu xếp hạng."} />
                  )}
                </div>
              </div>
            </section>

            <div style={{ marginTop: "34px" }}>
              <MidPageBanner desktop apiBanners={homeBanners} />
            </div>

            <section style={{ marginTop: "34px" }}>
              <div style={{ ...sectionTitleStyle, marginBottom: 0 }}>
                <h2 className="nl-home-section-title" style={homeSectionTitleTextStyle}>
                  <Trophy size={24} color={colors.gold} />
                  Dịch vụ nổi bật
                </h2>
              </div>
              <ServiceFilterControls
                activeTab={activeSvcTab}
                onTabChange={setActiveSvcTab}
                activeRegion={activeServiceRegion}
                onRegionChange={setActiveServiceRegion}
              />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                {isFeaturedServicesLoading ? (
                  <HomeDataMessage text="Đang tải dịch vụ nổi bật từ API..." />
                ) : svc.length ? (
                  svc.map((item) => <ServiceCard key={item.slug} item={item} />)
                ) : (
                  <HomeDataMessage text={featuredServicesError || "Chưa có dịch vụ nổi bật phù hợp."} />
                )}
              </div>
            </section>

            <section style={{ marginTop: "34px" }}>
              <SectionHeading title="Tour / Blog / Guide" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                {isHomeContentLoading ? (
                  <HomeDataMessage text="Đang tải nội dung CMS..." />
                ) : homeContentItems.length ? (
                  homeContentItems.map((item) => <ContentPlaceholderCard key={item.id} item={item} />)
                ) : (
                  <HomeDataMessage text={homeContentError || "Chưa có bài viết/chính sách được xuất bản."} />
                )}
              </div>
            </section>

            <section style={{ marginTop: "34px" }}>
              <div style={{ ...sectionTitleStyle, marginBottom: "14px" }}>
                <h2 className="nl-home-section-title" style={homeSectionTitleTextStyle}>Video Hot</h2>
                <RankingRegionDropdown
                  active={activeVideoRegion}
                  onChange={setActiveVideoRegion}
                  ariaLabel="Chọn khu vực video"
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                {!homeHotVideosEnabled ? (
                  <HomeDataMessage text={homeHotVideosPlaceholderText} />
                ) : isHomeVideosLoading ? (
                  <HomeDataMessage text="Đang tải Video Hot từ API..." />
                ) : videoList.length ? (
                  videoList.map((item) => <VideoCard key={item.id} item={item} />)
                ) : (
                  <HomeDataMessage text={homeVideosError || "Chưa có Video Hot cho khu vực này."} />
                )}
              </div>
            </section>

            <section
              style={{
                marginTop: "34px",
                borderRadius: homeCardRadius,
                border: `1px solid ${colors.line}`,
                background: "rgba(212,178,106,.08)",
                padding: "26px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "20px",
              }}
            >
              <div>
                <h2 style={{ fontSize: "24px", fontWeight: 900 }}>Concierge cho một đêm trọn vẹn</h2>
                <p style={{ marginTop: "8px", color: colors.muted, fontSize: "14px", lineHeight: 1.6 }}>
                  Gợi ý địa điểm, giữ bàn VIP, lưu coupon và theo dõi lịch đặt chỗ trong cùng một trải nghiệm.
                </p>
              </div>
              <Link href="/huong-dan" style={{ flex: "none", borderRadius: "999px", background: colors.gold, color: "#241a0a", padding: "13px 20px", fontWeight: 900 }}>
                Xem hướng dẫn
              </Link>
            </section>
          </main>
        </div>
      </div>
    </React.Fragment>
  );
}
