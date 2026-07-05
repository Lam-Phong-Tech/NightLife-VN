import React, { type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Heart, Search, Ticket, type LucideIcon } from "lucide-react";

type EmptyVariant = "bookings" | "saved" | "search" | "coupons";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: string;
  variant?: EmptyVariant;
  ctaLabel?: string;
  ctaHref?: string;
  compact?: boolean;
}

const colors = {
  panel: "var(--vy-surface-1)",
  border: "var(--vy-border-gold-22)",
  text: "var(--vy-text)",
  muted: "var(--vy-muted)",
  gold: "var(--vy-gold)",
  goldPale: "var(--vy-gold-pale)",
  onGold: "#241a0a",
  goldGrad: "linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)",
};

const emptyConfig: Record<
  EmptyVariant,
  {
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
    icon: LucideIcon;
  }
> = {
  bookings: {
    title: "Chưa có đặt chỗ nào",
    description: "Khi bạn đặt bàn hoặc đặt cast, lịch sử sẽ hiển thị tại đây.",
    ctaLabel: "Khám phá quán",
    ctaHref: "/danh-sach-quan",
    icon: CalendarDays,
  },
  saved: {
    title: "Bạn chưa lưu mục nào",
    description: "Nhấn biểu tượng trái tim trên quán hay cast để lưu vào yêu thích.",
    ctaLabel: "Tìm quán",
    ctaHref: "/danh-sach-quan",
    icon: Heart,
  },
  search: {
    title: "Không tìm thấy kết quả",
    description: "Thử đổi từ khóa hoặc bỏ bớt bộ lọc để xem nhiều quán hơn.",
    ctaLabel: "Xóa bộ lọc",
    ctaHref: "/danh-sach-quan",
    icon: Search,
  },
  coupons: {
    title: "Chưa có mã ưu đãi",
    description: "Bạn chưa lấy mã nào. Khám phá Coupon Hot để nhận ưu đãi ngay.",
    ctaLabel: "Xem ưu đãi",
    ctaHref: "/uu-dai",
    icon: Ticket,
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  variant = "search",
  ctaLabel,
  ctaHref,
  compact = false,
}) => {
  const config = emptyConfig[variant];
  const Icon = config.icon;

  return (
    <div
      style={{
        ...shellStyle,
        minHeight: compact ? "220px" : "280px",
        padding: compact ? "28px 18px" : "38px 22px",
      }}
    >
      <div style={iconTileStyle}>
        {icon ? (
          <Image src={icon} alt="" width={28} height={28} style={{ opacity: 0.82 }} />
        ) : (
          <Icon size={28} strokeWidth={1.8} />
        )}
      </div>
      <h3 style={titleStyle}>{title ?? config.title}</h3>
      <p style={descriptionStyle}>{description ?? config.description}</p>
      {(ctaLabel ?? config.ctaLabel) && (ctaHref ?? config.ctaHref) ? (
        <Link href={ctaHref ?? config.ctaHref} style={ctaStyle}>
          {ctaLabel ?? config.ctaLabel}
        </Link>
      ) : null}
    </div>
  );
};

const shellStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  border: `1px solid ${colors.border}`,
  borderRadius: "18px",
  background: colors.panel,
  color: colors.text,
  textAlign: "center",
  fontFamily: "var(--nl-font-sans)",
};

const iconTileStyle: CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: 18,
  background: "linear-gradient(135deg,rgba(244,227,180,.18),rgba(168,124,60,.08))",
  border: `1px solid var(--vy-border-gold-32)`,
  color: colors.goldPale,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "var(--vy-shadow)",
};

const titleStyle: CSSProperties = {
  margin: "16px 0 0",
  color: colors.text,
  fontSize: "16.5px",
  fontWeight: 800,
  lineHeight: 1.25,
};

const descriptionStyle: CSSProperties = {
  margin: "8px 0 0",
  maxWidth: 320,
  color: colors.muted,
  fontSize: "12.5px",
  lineHeight: 1.6,
};

const ctaStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 42,
  marginTop: 18,
  borderRadius: 11,
  background: colors.goldGrad,
  color: colors.onGold,
  padding: "0 22px",
  fontSize: "13.5px",
  fontWeight: 900,
  textDecoration: "none",
};
