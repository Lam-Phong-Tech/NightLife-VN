"use client";

import React, { type CSSProperties, useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Crown,
  Heart,
  MapPin,
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

const rankTabs = [
  { id: "quan", label: "Quán" },
  { id: "cast", label: "Cast" },
];

type RankedItem = {
  rank?: string;
  numColor?: string;
  crown?: string;
  img?: string;
  name?: string;
  area?: string;
  metric?: string;
};

const shellStyle: CSSProperties = {
  minHeight: "100vh",
  background: colors.shell,
  color: colors.text,
  fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
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
  const event = adBanners[0] ?? {
    img: "linear-gradient(135deg,#15151a,#2a2112)",
  };
  return (
    <Link
      href="/stores/club-lumiere"
      style={{
        minHeight: desktop ? "310px" : "172px",
        borderRadius: desktop ? "26px" : "18px",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: desktop ? "34px" : "18px",
        color: "#fff",
        boxShadow: "0 22px 42px rgba(0,0,0,.36)",
      }}
    >
      <PlaceholderMedia
        src={event.img}
        alt={"title" in event ? event.title : "Sự kiện"}
        label="Ảnh sự kiện"
        style={{ position: "absolute", inset: 0, borderRadius: "inherit" }}
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
          Đêm nhạc DJ SODA tại Club Lumière
        </h1>
        <div style={{ marginTop: desktop ? "22px" : "18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <span style={{ fontSize: desktop ? "15px" : "12px" }}>Đặt bàn VIP từ <b>2.500.000đ</b></span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "999px",
              background: `linear-gradient(135deg,${colors.goldSoft},${colors.gold})`,
              color: "#241a0a",
              padding: desktop ? "13px 22px" : "10px 16px",
              fontSize: "13px",
              fontWeight: 800,
            }}
          >
            Đặt ngay
          </span>
        </div>
      </div>
    </Link>
  );
}

function VipCard({ desktop = false }: { desktop?: boolean }) {
  return (
    <Link
      href="/dang-nhap"
      style={{
        display: "block",
        borderRadius: desktop ? "24px" : "18px",
        padding: desktop ? "28px" : "20px",
        color: "#241a0a",
        background:
          "radial-gradient(circle at 78% 28%, rgba(255,255,255,.72), transparent 22%), linear-gradient(135deg,#f2e0ad 0%,#d4b26a 48%,#9b7428 100%)",
        boxShadow: "0 18px 38px rgba(212,178,106,.2)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: desktop ? "25px" : "22px", fontWeight: 900 }}>
        <Crown size={desktop ? 25 : 21} fill="#241a0a" />
        Vietyoru VIP
      </div>
      <p style={{ maxWidth: "520px", marginTop: "10px", color: "rgba(36,26,10,.78)", fontSize: desktop ? "15px" : "13px", lineHeight: 1.55 }}>
        Mở khoá ưu đãi độc quyền, ưu tiên đặt bàn & thứ hạng riêng cho thành viên.
      </p>
      <div style={{ marginTop: "18px", display: "flex", alignItems: "center", gap: "14px" }}>
        <span style={{ borderRadius: "999px", background: colors.ink, color: colors.goldSoft, padding: "11px 18px", fontSize: "13px", fontWeight: 800 }}>
          Trở thành VIP
        </span>
        <span style={{ fontSize: "12px", color: "rgba(36,26,10,.7)" }}>từ 199.000đ / tháng</span>
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
      href="/stores/club-lumiere"
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
        <div style={{ marginTop: "8px", display: "flex", alignItems: "center", justifyContent: "space-between", color: colors.gold, fontSize: "12px", fontWeight: 800 }}>
          <span>★ {item.rating}</span>
          <span style={{ color: colors.text }}>{item.price}</span>
        </div>
      </div>
    </Link>
  );
}

function CouponCard({ item, compact = false }: { item: (typeof offers)[number]; compact?: boolean }) {
  return (
    <Link
      href="/stores/club-lumiere"
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
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "36px 48px 1fr auto",
        alignItems: "center",
        gap: "12px",
        padding: "11px",
        borderRadius: "16px",
        background: "rgba(255,255,255,.04)",
        border: "1px solid rgba(255,255,255,.08)",
      }}
    >
      <span style={{ width: 32, height: 32, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: item.crown ?? colors.gold, color: item.numColor ?? "#241a0a", fontWeight: 900 }}>
        {item.rank}
      </span>
      <PlaceholderMedia
        src={item.img}
        alt={item.name ?? "Xếp hạng"}
        label=""
        style={{ width: 46, height: 46, borderRadius: "50%", flex: "none" }}
      />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: "14px", fontWeight: 800 }}>{item.name}</div>
        <div style={{ marginTop: "3px", color: colors.muted, fontSize: "12px" }}>{item.area}</div>
      </div>
      <span style={{ color: colors.gold, fontSize: "12px", fontWeight: 800 }}>{item.metric}</span>
    </div>
  );
}

function ServiceCard({ item, compact = false }: { item: (typeof svcData)[number]; compact?: boolean }) {
  const slug = item.name
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "club-lumiere";

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
        <div style={{ marginTop: "9px", color: colors.goldSoft, fontSize: "13px", fontWeight: 800 }}>{item.price}</div>
      </div>
    </Link>
  );
}

function VideoCard({ item, compact = false }: { item: (typeof hotVideos)[number]; compact?: boolean }) {
  return (
    <Link href="/stores/club-lumiere" style={{ minWidth: compact ? "166px" : "0", color: colors.text }}>
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

function BottomNav() {
  return null;
}

export default function Page() {
  const [activeRankTab, setActiveRankTab] = useState("quan");
  const [activeSvcTab, setActiveSvcTab] = useState("nhahang");
  const rankList = (activeRankTab === "quan" ? rankListQuan : rankListCast) as RankedItem[];
  const svc = activeSvcTab === "nhahang" ? svcData : spaData;

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
          <main style={{ padding: "8px 18px 0" }}>
            <SearchPanel />
            <div style={{ marginTop: "22px" }}>
              <CategoryGrid />
            </div>
            <div style={{ marginTop: "22px" }}>
              <EventHero />
            </div>
            <div style={{ marginTop: "10px", display: "flex", justifyContent: "center", gap: "6px" }}>
              <span style={{ width: 22, height: 5, borderRadius: 99, background: colors.gold }} />
              <span style={{ width: 5, height: 5, borderRadius: 99, background: "rgba(255,255,255,.18)" }} />
              <span style={{ width: 5, height: 5, borderRadius: 99, background: "rgba(255,255,255,.18)" }} />
            </div>
            <div style={{ marginTop: "18px" }}>
              <VipCard />
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
              <div style={sectionTitleStyle}>
                <h2 style={{ fontSize: "24px", lineHeight: 1.1, fontWeight: 900 }}>Bảng xếp hạng</h2>
                <TabSwitch items={rankTabs} active={activeRankTab} onChange={setActiveRankTab} />
              </div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                <span style={{ ...pillStyle, background: colors.gold, color: "#241a0a" }}>Hà Nội</span>
                <span style={pillStyle}>TP.HCM</span>
              </div>
              <div style={{ display: "grid", gap: "10px" }}>
                {rankList.map((item) => <RankingRow key={`${activeRankTab}-${item.rank}`} item={item} />)}
              </div>
            </section>

            <section style={{ marginTop: "22px" }}>
              <div style={sectionTitleStyle}>
                <h2 style={{ fontSize: "24px", lineHeight: 1.1, fontWeight: 900 }}>Dịch vụ nổi bật</h2>
                <TabSwitch items={serviceTabs} active={activeSvcTab} onChange={setActiveSvcTab} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "11px" }}>
                {svc.slice(0, 2).map((item) => <ServiceCard key={item.name} item={item} compact />)}
              </div>
            </section>

            <section style={{ marginTop: "22px", paddingBottom: "22px" }}>
              <SectionHeading title="Video Hot" />
              <div className="hscroll" style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px" }}>
                {hotVideos.slice(0, 3).map((item) => <VideoCard key={item.name} item={item} compact />)}
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
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr .9fr", gap: "24px", alignItems: "stretch" }}>
              <EventHero desktop />
              <div style={{ display: "grid", gap: "18px" }}>
                <SearchPanel />
                <VipCard desktop />
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
                <div style={sectionTitleStyle}>
                  <h2 style={{ fontSize: "24px", lineHeight: 1.1, fontWeight: 900 }}>Bảng xếp hạng</h2>
                  <TabSwitch items={rankTabs} active={activeRankTab} onChange={setActiveRankTab} />
                </div>
                <div style={{ display: "grid", gap: "12px" }}>
                  {rankList.map((item) => <RankingRow key={`${activeRankTab}-${item.rank}`} item={item} />)}
                </div>
              </div>
            </section>

            <section style={{ marginTop: "34px" }}>
              <div style={sectionTitleStyle}>
                <h2 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", lineHeight: 1.1, fontWeight: 900 }}>
                  <Trophy size={24} color={colors.gold} />
                  Dịch vụ nổi bật
                </h2>
                <TabSwitch items={serviceTabs} active={activeSvcTab} onChange={setActiveSvcTab} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                {svc.map((item) => <ServiceCard key={item.name} item={item} />)}
              </div>
            </section>

            <section style={{ marginTop: "34px" }}>
              <SectionHeading title="Video Hot" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                {hotVideos.map((item) => <VideoCard key={item.name} item={item} />)}
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
