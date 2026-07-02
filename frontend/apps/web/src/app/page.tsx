"use client";

import React, { type CSSProperties, useEffect, useRef, useState } from "react";
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
  Route,
  Search,
  SlidersHorizontal,
  Star,
  Ticket,
  Trophy,
  UserRound,
  Utensils,
  Waves,
} from "lucide-react";

import {
  adBanners,
  hotVideos,
  offers,
  rankListCast,
  rankListQuan,
  recs,
  spaData,
  svcData,
} from "@/lib/mock-data";
import { PlaceholderMedia } from "@/components/ui/MediaPlaceholder";

const colors = {
  shell: "#f0eee9",
  ink: "#0c0c0f",
  line: "rgba(212,178,106,.22)",
  gold: "#d4b26a",
  goldSoft: "#f0dda8",
  muted: "#b6b1a6",
  text: "#f3f0ea",
  dim: "#8c8679",
  rose: "#e0729e",
};

const categoryItems = [
  { label: "Tìm quán", icon: MapPin, href: "/danh-sach-quan" },
  { label: "Tìm Cast", icon: UserRound, href: "/danh-sach-cast" },
  { label: "Ưu đãi", icon: Ticket, href: "/uu-dai" },
  { label: "Sự kiện", icon: CalendarDays, href: "/danh-sach-quan" },
  { label: "Nhà hàng", icon: Utensils, href: "/danh-sach-quan" },
  { label: "Spa", icon: Waves, href: "/danh-sach-quan" },
  { label: "Ranking", icon: Crown, href: "/xep-hang" },
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
  { id: "quan", label: "Quán" },
  { id: "cast", label: "Cast" },
];

const contentPlaceholders = [
  {
    title: "Tour đêm",
    desc: "Gợi ý lịch trình bar, lounge và ăn khuya theo khu vực.",
    href: "/tour",
    icon: Route,
  },
  {
    title: "Blog",
    desc: "Bài viết kinh nghiệm chọn quán, ưu đãi và xu hướng nightlife.",
    href: "/blog",
    icon: Newspaper,
  },
  {
    title: "Guide",
    desc: "Hướng dẫn đặt chỗ, lấy mã coupon và gửi hóa đơn.",
    href: "/huong-dan",
    icon: BookOpen,
  },
];

type RankedItem = {
  rank?: string | number;
  numColor?: string;
  crown?: string;
  img?: string;
  name?: string;
  area?: string;
  href?: string;
};

type ServiceRegion = (typeof serviceRegionTabs)[number]["id"];
type ServiceItem = (typeof svcData)[number];
type VideoItem = (typeof hotVideos)[number];

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

function getServiceRegion(item: ServiceItem): Exclude<ServiceRegion, "all"> {
  return getAreaRegion(item.area);
}

function filterServicesByRegion(items: ServiceItem[], region: ServiceRegion) {
  if (region === "all") return items;
  return items.filter((item) => getServiceRegion(item) === region);
}

function filterRankingsByRegion(items: RankedItem[], region: ServiceRegion) {
  const filteredItems = region === "all" ? items : items.filter((item) => getAreaRegion(item.area) === region);
  return filteredItems.map((item, index) => ({ ...item, rank: index + 1 }));
}

function filterVideosByRegion(items: VideoItem[], region: ServiceRegion) {
  if (region === "all") return items;
  return items.filter((item) => getAreaRegion(item.name) === region);
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
  background:
    "radial-gradient(circle at 82% 10%, rgba(212,178,106,.15), transparent 30%), linear-gradient(180deg,#0b0b0e 0%,#111114 48%,#09090b 100%)",
  border: "1px solid rgba(255,255,255,.08)",
  boxShadow: "0 24px 70px rgba(0,0,0,.35)",
};

const sectionTitleStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "14px",
  marginBottom: "14px",
};

const pillStyle: CSSProperties = {
  border: `1px solid ${colors.line}`,
  background: "rgba(255,255,255,.04)",
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
        border: "1px solid rgba(255,255,255,.12)",
        background: "rgba(255,255,255,.04)",
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
                borderRadius: "16px",
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: item.featured ? colors.goldSoft : colors.gold,
                background: item.featured
                  ? "linear-gradient(135deg,rgba(212,178,106,.34),rgba(212,178,106,.12))"
                  : "rgba(255,255,255,.045)",
                border: `1px solid ${item.featured ? "rgba(212,178,106,.4)" : "rgba(255,255,255,.09)"}`,
                boxShadow: item.featured ? "0 14px 28px rgba(212,178,106,.12)" : "none",
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

function EventHero({ desktop = false }: { desktop?: boolean }) {
  const [activeBanner, setActiveBanner] = useState(0);
  const fallbackBanner = {
    title: "Sự kiện đêm nay",
    desc: "Đặt bàn VIP từ 2.500.000đ",
    btnText: "Đặt ngay",
    img: "linear-gradient(135deg,#15151a,#2a2112)",
  };
  const banners = adBanners.length > 0 ? adBanners : [fallbackBanner];
  const event = banners[activeBanner] ?? banners[0] ?? fallbackBanner;
  const swipeHandlers = useBannerSwipe(banners.length, setActiveBanner);

  useEffect(() => {
    if (banners.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveBanner((current) => (current + 1) % banners.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [banners.length]);

  return (
    <Link
      href="/stores/neon-club"
      data-testid="home-ad-banner"
      {...swipeHandlers}
      style={{
        minHeight: desktop ? "310px" : "208px",
        borderRadius: desktop ? "26px" : "18px",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: desktop ? "34px" : "18px 18px 42px",
        color: "#fff",
        boxShadow: "0 22px 42px rgba(0,0,0,.36)",
        touchAction: "pan-y",
      }}
    >
      <PlaceholderMedia
        src={event.img}
        alt={event.title}
        label="Ảnh sự kiện"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          transform: "scale(1.03)",
          transition: "opacity 420ms ease, transform 520ms ease",
        }}
      />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.76))" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            borderRadius: "999px",
            background: "rgba(12,12,15,.62)",
            color: colors.goldSoft,
            border: `1px solid ${colors.line}`,
            padding: "5px 11px",
            fontSize: desktop ? "12px" : "10px",
            fontWeight: 800,
            letterSpacing: ".16em",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: colors.rose }} />
          ĐANG DIỄN RA
        </span>
        <div style={{ marginTop: "20px", color: colors.goldSoft, fontSize: desktop ? "13px" : "11px", letterSpacing: ".24em" }}>
          SỰ KIỆN ĐÊM NAY · TÂY HỒ
        </div>
        <h1 style={{ maxWidth: desktop ? "620px" : "260px", marginTop: "8px", fontSize: desktop ? "48px" : "25px", lineHeight: 1.05, fontWeight: 900 }}>
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
              transition: "width 220ms ease, background 220ms ease",
            }}
          />
        ))}
      </div>
    </Link>
  );
}

function MidPageBanner({ desktop = false }: { desktop?: boolean }) {
  const [activeBanner, setActiveBanner] = useState(0);
  const fallbackBanner = {
    title: "Ưu đãi đêm nay",
    desc: "Lướt để xem thêm ưu đãi và sự kiện nổi bật.",
    btnText: "Xem ngay",
    img: "linear-gradient(135deg,#15151a,#2a2112)",
  };
  const banners = adBanners.length > 0 ? adBanners : [fallbackBanner];
  const event = banners[activeBanner] ?? banners[0] ?? fallbackBanner;
  const swipeHandlers = useBannerSwipe(banners.length, setActiveBanner);

  useEffect(() => {
    if (banners.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveBanner((current) => (current + 1) % banners.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [banners.length]);

  return (
    <Link
      href="/uu-dai"
      data-testid="home-mid-banner"
      {...swipeHandlers}
      style={{
        minHeight: desktop ? "210px" : "132px",
        borderRadius: desktop ? "22px" : "18px",
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
      <PlaceholderMedia
        src={event.img}
        alt={event.title}
        label="Ảnh ưu đãi"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          transform: "scale(1.03)",
          transition: "opacity 420ms ease, transform 520ms ease",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg,rgba(8,8,11,.88),rgba(8,8,11,.5) 54%,rgba(8,8,11,.18)), linear-gradient(180deg,rgba(0,0,0,.06),rgba(0,0,0,.7))",
        }}
      />
      <div style={{ position: "relative", zIndex: 1, maxWidth: desktop ? "520px" : "248px" }}>
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
              transition: "width 220ms ease, background 220ms ease",
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
      <h2 style={{ fontSize: "24px", lineHeight: 1.1, fontWeight: 900 }}>{title}</h2>
      {action ? <Link href="/danh-sach-quan" style={{ color: colors.muted, fontSize: "12px" }}>{action}</Link> : null}
    </div>
  );
}

function VenueMiniCard({ item, compact = false }: { item: (typeof recs)[number]; compact?: boolean }) {
  return (
    <Link
      href="/stores/neon-club"
      style={{
        minWidth: compact ? "162px" : "0",
        display: "block",
        overflow: "hidden",
        borderRadius: "18px",
        background: "rgba(255,255,255,.045)",
        border: "1px solid rgba(255,255,255,.08)",
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

function CouponCard({ item, compact = false }: { item: (typeof offers)[number]; compact?: boolean }) {
  return (
    <Link
      href="/stores/neon-club"
      style={{
        display: "grid",
        gridTemplateColumns: compact ? "82px 1fr auto" : "120px 1fr auto",
        alignItems: "center",
        gap: "14px",
        padding: compact ? "10px" : "12px",
        borderRadius: "16px",
        color: colors.text,
        border: `1px solid ${colors.line}`,
        background: "rgba(255,255,255,.045)",
      }}
    >
      <PlaceholderMedia
        src={item.img}
        alt={item.title ?? "Coupon"}
        label="Ảnh ưu đãi"
        style={{ height: compact ? "62px" : "82px", borderRadius: "13px" }}
      />
      <div style={{ minWidth: 0 }}>
        <div style={{ color: colors.goldSoft, fontSize: compact ? "18px" : "22px", fontWeight: 900 }}>{item.value}</div>
        <div style={{ marginTop: "2px", fontSize: "14px", fontWeight: 800 }}>{item.title}</div>
        <div style={{ marginTop: "4px", color: colors.muted, fontSize: "12px" }}>{item.place}</div>
      </div>
      <span style={{ color: colors.gold, fontSize: compact ? "11px" : "12px", fontWeight: 900, letterSpacing: ".08em" }}>LẤY MÃ</span>
    </Link>
  );
}

function RankingRow({ item }: { item: RankedItem }) {
  const rankNumber = Number.parseInt(String(item.rank ?? ""), 10);
  const hasCrown = rankNumber >= 1 && rankNumber <= 5;

  return (
    <Link
      href={item.href ?? "/xep-hang"}
      aria-label={`Xem chi tiết ${item.name ?? "mục xếp hạng"}`}
      style={{
        display: "grid",
        gridTemplateColumns: "64px minmax(0, 1fr) auto",
        alignItems: "center",
        gap: "16px",
        minHeight: "92px",
        padding: "16px",
        borderRadius: "16px",
        background: "rgba(255,255,255,.045)",
        border: "1px solid rgba(255,255,255,.12)",
        boxShadow: "0 16px 30px rgba(0,0,0,.14)",
        color: colors.text,
        textDecoration: "none",
      }}
    >
      <PlaceholderMedia
        src={item.img}
        alt={item.name ?? "Xếp hạng"}
        label=""
        style={{ width: 64, height: 64, borderRadius: "50%", flex: "none", border: `1px solid ${colors.line}`, boxShadow: "0 10px 20px rgba(0,0,0,.28)" }}
      />
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "7px" }}>
          <span
            style={{
              width: 38,
              height: 28,
              borderRadius: "10px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: item.crown ?? colors.gold,
              color: item.numColor ?? "#241a0a",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,.34), 0 8px 18px rgba(0,0,0,.22)",
            }}
          >
            {hasCrown ? <Crown size={18} fill="currentColor" strokeWidth={2.4} /> : <span style={{ fontSize: "13px", fontWeight: 950 }}>{item.rank}</span>}
          </span>
          <span style={{ color: colors.goldSoft, fontSize: "11px", fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" }}>
            Top {item.rank}
          </span>
        </div>
        <div style={{ fontSize: "17px", fontWeight: 950, lineHeight: 1.16 }}>{item.name}</div>
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
        }}
      >
        <ChevronRight size={24} strokeWidth={2.35} />
      </span>
    </Link>
  );
}

function ServiceCard({ item, compact = false }: { item: (typeof svcData)[number]; compact?: boolean }) {
  const slug = item.name
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "neon-club";

  return (
    <Link
      href={`/stores/${slug}`}
      style={{
        overflow: "hidden",
        borderRadius: "17px",
        background: "rgba(255,255,255,.045)",
        border: "1px solid rgba(255,255,255,.08)",
        color: colors.text,
      }}
    >
      <PlaceholderMedia
        src={item.grad}
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
      </div>
    </Link>
  );
}

function VideoCard({ item, compact = false }: { item: (typeof hotVideos)[number]; compact?: boolean }) {
  return (
    <Link href="/stores/neon-club" style={{ minWidth: compact ? "166px" : "0", color: colors.text }}>
      <PlaceholderMedia
        src={item.img}
        alt={item.name ?? "Video"}
        label="Ảnh video"
        style={{ height: compact ? "96px" : "138px", borderRadius: "16px", position: "relative" }}
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
  item: (typeof contentPlaceholders)[number];
  compact?: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      style={{
        minWidth: compact ? "172px" : "0",
        display: "block",
        borderRadius: "17px",
        border: `1px solid ${colors.line}`,
        background: "rgba(255,255,255,.045)",
        color: colors.text,
        padding: compact ? "14px" : "18px",
      }}
    >
      <span
        style={{
          width: compact ? 40 : 46,
          height: compact ? 40 : 46,
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: colors.goldSoft,
          background: "rgba(212,178,106,.12)",
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
        Xem placeholder
      </div>
    </Link>
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
    <div style={{ display: "flex", gap: "6px", border: `1px solid ${colors.line}`, borderRadius: "999px", padding: "4px", background: "rgba(255,255,255,.035)" }}>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          style={{
            border: 0,
            borderRadius: "999px",
            padding: "7px 14px",
            background: active === item.id ? colors.gold : "transparent",
            color: active === item.id ? "#241a0a" : colors.muted,
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

function ServiceRegionSwitch({
  active,
  onChange,
}: {
  active: ServiceRegion;
  onChange: (value: ServiceRegion) => void;
}) {
  return (
    <div
      className="hscroll"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "9px",
        overflowX: "auto",
        paddingBottom: "2px",
        margin: "10px 0 13px",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          flex: "none",
          width: 30,
          height: 30,
          borderRadius: "999px",
          display: "grid",
          placeItems: "center",
          color: colors.goldSoft,
        }}
      >
        <MapPin size={17} />
      </span>
      {serviceRegionTabs.map((item) => {
        const selected = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            style={{
              flex: "none",
              minHeight: 36,
              border: `1px solid ${selected ? "rgba(212,178,106,.5)" : colors.line}`,
              borderRadius: "999px",
              background: selected ? colors.gold : "rgba(255,255,255,.045)",
              color: selected ? "#241a0a" : colors.muted,
              padding: "0 17px",
              fontSize: "12px",
              fontWeight: 850,
              whiteSpace: "nowrap",
              cursor: "pointer",
              boxShadow: selected ? "0 8px 18px rgba(212,178,106,.16)" : "none",
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function RankingRegionDropdown({
  active,
  onChange,
}: {
  active: ServiceRegion;
  onChange: (value: ServiceRegion) => void;
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
          borderRadius: "999px",
          background: "rgba(255,255,255,.04)",
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
          aria-label="Chọn khu vực xếp hạng"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            zIndex: 30,
            minWidth: "152px",
            padding: "6px",
            borderRadius: "16px",
            border: `1px solid ${colors.line}`,
            background: "linear-gradient(180deg, rgba(28,28,32,.98), rgba(14,14,17,.98))",
            boxShadow: "0 20px 42px rgba(0,0,0,.45)",
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
                  background: selectedOption ? "rgba(212,178,106,.18)" : "transparent",
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
          <h2 style={{ fontSize: "24px", lineHeight: 1.08, fontWeight: 950 }}>Bảng xếp hạng</h2>
          <div style={{ marginTop: "5px", color: colors.goldSoft, fontSize: "11px", fontWeight: 900, letterSpacing: "2.2px" }}>
            RANKING
          </div>
        </div>
        <span
          aria-hidden="true"
          style={{
            flex: 1,
            height: 1,
            marginBottom: "22px",
            background: "linear-gradient(90deg, rgba(212,178,106,.62), rgba(212,178,106,0))",
          }}
        />
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
  const [activeRankTab, setActiveRankTab] = useState("quan");
  const [activeRankRegion, setActiveRankRegion] = useState<ServiceRegion>("hanoi");
  const [activeSvcTab, setActiveSvcTab] = useState("nhahang");
  const [activeServiceRegion, setActiveServiceRegion] = useState<ServiceRegion>("hanoi");
  const [activeVideoRegion, setActiveVideoRegion] = useState<ServiceRegion>("hanoi");
  const rankList = filterRankingsByRegion(
    (activeRankTab === "quan" ? rankListQuan : rankListCast) as RankedItem[],
    activeRankRegion,
  );
  const svc = filterServicesByRegion(activeSvcTab === "nhahang" ? svcData : spaData, activeServiceRegion);
  const videoList = filterVideosByRegion(hotVideos, activeVideoRegion);

  useEffect(() => {
    const style = document.createElement("style");
    style.dataset.homePremium = "true";
    style.textContent = "#nl-theme-btn{display:none!important}";
    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, []);

  return (
    <React.Fragment>
      <div className="block md:hidden" style={shellStyle}>
        <div style={{ maxWidth: "430px", minHeight: "100vh", margin: "0 auto", ...appStyle }}>
          <HeaderBar />
          <main style={{ padding: "0 18px 0" }}>
            <div style={{ marginTop: "12px" }}>
              <SearchPanel />
            </div>
            <div style={{ marginTop: "18px" }}>
              <EventHero />
            </div>
            <div style={{ marginTop: "22px" }}>
              <CategoryGrid />
            </div>

            <section style={{ marginTop: "24px" }}>
              <SectionHeading title="Đề xuất tối nay" action="Xem tất cả" />
              <div className="hscroll" style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "6px" }}>
                {recs.slice(0, 3).map((item) => <VenueMiniCard key={item.name} item={item} compact />)}
              </div>
            </section>

            <section style={{ marginTop: "18px" }}>
              <SectionHeading title="Coupon Hot" />
              <div style={{ display: "grid", gap: "10px" }}>
                {offers.slice(0, 2).map((item) => <CouponCard key={item.title} item={item} compact />)}
              </div>
            </section>

            <section style={{ marginTop: "22px" }}>
              <RankingSectionHeader
                activeTab={activeRankTab}
                onTabChange={setActiveRankTab}
                activeRegion={activeRankRegion}
                onRegionChange={setActiveRankRegion}
              />
              <div style={{ display: "grid", gap: "10px" }}>
                {rankList.map((item) => <RankingRow key={`${activeRankTab}-${item.rank}`} item={item} />)}
              </div>
            </section>

            <div style={{ marginTop: "20px" }}>
              <MidPageBanner />
            </div>

            <section style={{ marginTop: "22px" }}>
              <div style={sectionTitleStyle}>
                <h2 style={{ fontSize: "24px", lineHeight: 1.1, fontWeight: 900 }}>Dịch vụ nổi bật</h2>
                <TabSwitch items={serviceTabs} active={activeSvcTab} onChange={setActiveSvcTab} />
              </div>
              <ServiceRegionSwitch active={activeServiceRegion} onChange={setActiveServiceRegion} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "11px" }}>
                {svc.slice(0, 2).map((item) => <ServiceCard key={item.name} item={item} compact />)}
              </div>
            </section>

            <section style={{ marginTop: "22px" }}>
              <SectionHeading title="Tour / Blog / Guide" />
              <div className="hscroll" style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px" }}>
                {contentPlaceholders.map((item) => <ContentPlaceholderCard key={item.href} item={item} compact />)}
              </div>
            </section>

            <section style={{ marginTop: "22px", paddingBottom: "22px" }}>
              <SectionHeading title="Video Hot" />
              <ServiceRegionSwitch active={activeVideoRegion} onChange={setActiveVideoRegion} />
              <div className="hscroll" style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px" }}>
                {videoList.slice(0, 3).map((item) => <VideoCard key={item.name} item={item} compact />)}
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
              <div style={{ marginTop: "18px" }}>
                <EventHero desktop />
              </div>
            </div>

            <div style={{ marginTop: "28px" }}>
              <CategoryGrid desktop />
            </div>

            <section style={{ marginTop: "34px" }}>
              <SectionHeading title="Đề xuất tối nay" action="Xem tất cả" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                {recs.map((item) => <VenueMiniCard key={item.name} item={item} />)}
              </div>
            </section>

            <section style={{ marginTop: "34px" }}>
              <div>
                <SectionHeading title="Coupon Hot" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "16px" }}>
                  {offers.map((item) => <CouponCard key={item.title} item={item} />)}
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
                  {rankList.map((item) => <RankingRow key={`${activeRankTab}-${item.rank}`} item={item} />)}
                </div>
              </div>
            </section>

            <div style={{ marginTop: "34px" }}>
              <MidPageBanner desktop />
            </div>

            <section style={{ marginTop: "34px" }}>
              <div style={sectionTitleStyle}>
                <h2 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", lineHeight: 1.1, fontWeight: 900 }}>
                  <Trophy size={24} color={colors.gold} />
                  Dịch vụ nổi bật
                </h2>
                <TabSwitch items={serviceTabs} active={activeSvcTab} onChange={setActiveSvcTab} />
              </div>
              <ServiceRegionSwitch active={activeServiceRegion} onChange={setActiveServiceRegion} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                {svc.map((item) => <ServiceCard key={item.name} item={item} />)}
              </div>
            </section>

            <section style={{ marginTop: "34px" }}>
              <SectionHeading title="Tour / Blog / Guide" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                {contentPlaceholders.map((item) => <ContentPlaceholderCard key={item.href} item={item} />)}
              </div>
            </section>

            <section style={{ marginTop: "34px" }}>
              <SectionHeading title="Video Hot" />
              <ServiceRegionSwitch active={activeVideoRegion} onChange={setActiveVideoRegion} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                {videoList.map((item) => <VideoCard key={item.name} item={item} />)}
              </div>
            </section>

            <section
              style={{
                marginTop: "34px",
                borderRadius: "22px",
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
