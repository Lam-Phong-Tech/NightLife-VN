"use client";

import Link from "next/link";
import {
  Bell,
  CalendarCheck,
  CalendarDays,
  CheckCheck,
  Home,
  LogIn,
  ReceiptText,
  Settings,
  Search,
  Ticket,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  authSessionChangeEvent,
  getAuthSessionExpiresAt,
  getAuthUser,
  type AuthUser,
} from "@/lib/auth/session";
import {
  DEFAULT_APPEARANCE_CONFIG,
  getAppearanceConfig,
  type AppearanceItem,
} from "@/lib/api/appearance";
import { resolveClientUrl } from "@/lib/api/client";
import {
  languageChangedEvent,
  readStoredLanguage,
  translateText,
  type LanguageCode,
} from "@/lib/i18n/client-translations";
import {
  memberNotificationCreatedEvent,
  memberNotificationsRefreshEvent,
  notificationApi,
  type MemberNotification,
  type MemberNotificationCategory,
  type MemberNotificationSocketPayload,
  type MemberNotificationTone,
} from "@/lib/api/notifications";
import { SystemFeedbackProvider } from "@/components/ui/SystemFeedback";
import { LanguagePicker } from "./LanguagePicker";
import { MobileSimulator } from "./MobileSimulator";
import { SupportChatWidget } from "./SupportChatWidget";
import { ThemeToggle } from "./ThemeToggle";

const colors = {
  bg: "var(--vy-bg)",
  navBg: "var(--vy-nav-bg)",
  surface: "var(--vy-surface)",
  surface2: "var(--vy-surface-2)",
  border: "var(--vy-border)",
  borderGold12: "var(--vy-border-gold-12)",
  borderGold22: "var(--vy-border-gold-22)",
  borderGold32: "var(--vy-border-gold-32)",
  text: "var(--vy-text)",
  text2: "var(--vy-text-2)",
  muted: "var(--vy-muted)",
  faint: "var(--vy-faint)",
  onGold: "#241a0a",
  gold: "var(--vy-gold)",
  goldPale: "var(--vy-gold-pale)",
  goldGrad: "linear-gradient(135deg,#fff7d7 0%,#f7d978 42%,#d5a23a 100%)",
};

const hiddenChromePaths = [
  "/dang-nhap",
  "/quen-mat-khau",
  "/dat-lai-mat-khau",
  "/dang-nhap-doi-tac",
  "/dang-ky-doi-tac",
  "/partner",
  "/admin",
  "/chon-giao-dien",
];

const navLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/danh-sach-quan", label: "Tìm quán" },
  { href: "/danh-sach-cast", label: "Cast" },
  { href: "/xep-hang", label: "Bảng xếp hạng" },
  { href: "/tour", label: "Tour", hideOnDesktop: true },
  { href: "/uu-dai", label: "Ưu đãi" },
  { href: "/blog", label: "Blog" },
];

const desktopNavLinks = navLinks.filter((link) => !link.hideOnDesktop);

const bottomNav = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/danh-sach-cast", label: "Tìm Cast", icon: Search },
  { href: "/uu-dai", label: "Ưu đãi", icon: Ticket },
  { href: "/lich-su-dat-cho", label: "Lịch đặt", icon: CalendarDays },
  { href: "/tai-khoan", label: "Tài khoản", icon: UserRound },
];

type BottomNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  iconUrl?: string;
  color?: string;
};

const bottomNavHrefById: Record<string, string> = {
  n1: "/",
  n2: "/danh-sach-cast",
  n3: "/uu-dai",
  n4: "/lich-su-dat-cho",
  n5: "/tai-khoan",
};

const bottomNavIconMap: Record<string, LucideIcon> = {
  account: UserRound,
  calendar: CalendarDays,
  calcheck: CalendarCheck,
  home: Home,
  search: Search,
  ticket: Ticket,
  user: UserRound,
};

function appearanceIconUrl(icon?: string) {
  if (!icon || (!/^(https?:|\/|data:image\/)/i.test(icon) && !icon.startsWith("storage/"))) return undefined;
  return resolveClientUrl(icon) || icon;
}

function mapAppearanceNavItem(item: AppearanceItem, index: number): BottomNavItem {
  const fallback = bottomNav[index] ?? bottomNav[0] ?? {
    href: "/",
    label: "Trang chủ",
    icon: Home,
  };
  const defaultConfig = DEFAULT_APPEARANCE_CONFIG.nav[index] ?? DEFAULT_APPEARANCE_CONFIG.nav[0];

  return {
    href: bottomNavHrefById[item.id] ?? (defaultConfig ? bottomNavHrefById[defaultConfig.id] : undefined) ?? fallback.href,
    label: item.label || fallback.label,
    icon: bottomNavIconMap[item.icon] ?? fallback.icon,
    iconUrl: appearanceIconUrl(item.icon),
    color: item.color,
  };
}

const footerGroups = [
  {
    title: "Khám phá",
    links: [
      { href: "/danh-sach-quan", label: "Tìm quán" },
      { href: "/danh-sach-cast", label: "Cast" },
      { href: "/xep-hang", label: "Bảng xếp hạng" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Dịch vụ",
    links: [
      { href: "/uu-dai", label: "Ưu đãi" },
      { href: "/tour", label: "Tour" },
      { href: "/dang-ky-doi-tac", label: "Đăng ký đối tác" },
    ],
  },
  {
    title: "Pháp lý",
    links: [
      { href: "/legal/chinh-sach-bao-mat", label: "Chính sách bảo mật" },
      { href: "/legal/dieu-khoan-su-dung", label: "Điều khoản sử dụng" },
      { href: "/legal/chinh-sach-hoat-dong", label: "Chính sách hoạt động" },
    ],
  },
];

const mobileFooterLinks = [
  { href: "/danh-sach-quan", label: "Tìm quán" },
  { href: "/uu-dai", label: "Ưu đãi" },
  { href: "/blog", label: "Blog" },
  { href: "/legal/chinh-sach-bao-mat", label: "Chính sách" },
];

type NoticeTone = MemberNotificationTone;

type Notice = {
  id: string;
  group: "today" | "yesterday";
  title: string;
  body: string;
  time: string;
  action?: string;
  unread?: boolean;
  icon: LucideIcon;
  tone: NoticeTone;
  href?: string;
  category: MemberNotificationCategory;
};

type NotificationFilter = "all" | MemberNotificationCategory;

const noticeToneStyle: Record<NoticeTone, { background: string; border: string; color: string }> = {
  gold: {
    background: "rgba(212,178,106,.12)",
    border: "rgba(212,178,106,.3)",
    color: "var(--vy-gold-hi)",
  },
  green: {
    background: "rgba(95,191,134,.12)",
    border: "rgba(95,191,134,.3)",
    color: "var(--vy-success)",
  },
  amber: {
    background: "rgba(224,164,78,.12)",
    border: "rgba(224,164,78,.3)",
    color: "var(--vy-warn)",
  },
  danger: {
    background: "rgba(255,107,139,.12)",
    border: "rgba(255,107,139,.32)",
    color: "var(--vy-error)",
  },
};

const revealTargetSelector = [
  ".nl-page-content > *",
  ".nl-page-content main > *",
  ".nl-page-content section",
  ".nl-page-content article",
  ".nl-page-content [data-scroll-reveal]",
].join(",");

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

function isRevealTarget(element: HTMLElement) {
  if (
    element.closest(
      ".nl-site-header, .nl-site-footer, .nl-mobile-bottom-nav, .nl-scroll-reveal-skip, [data-no-scroll-reveal]",
    )
  ) {
    return false;
  }

  if (element.classList.contains("md:block") || element.classList.contains("md:hidden")) {
    return false;
  }

  const rect = element.getBoundingClientRect();
  if (rect.width < 72 || rect.height < 28) return false;

  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") return false;
  if (style.position === "fixed" || style.position === "sticky") return false;

  return true;
}

function NotificationBellButton({
  isMobile,
  isOpen,
  unreadCount,
  onClick,
}: {
  isMobile: boolean;
  isOpen: boolean;
  unreadCount: number;
  onClick: () => void;
}) {
  const size = isMobile ? 36 : 40;

  return (
    <button
      type="button"
      data-notification-trigger="true"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-label="Mở thông báo"
      onClick={onClick}
      style={{
        minHeight: `${size}px`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        border: `1px solid ${isOpen ? "rgba(212,178,106,.6)" : colors.borderGold32}`,
        color: colors.goldPale,
        background: isMobile ? "transparent" : "rgba(255,255,255,.04)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: isOpen ? "0 0 0 3px rgba(212,178,106,.14)" : "none",
        cursor: "pointer",
        fontFamily: "var(--nl-font-sans)",
        padding: 0,
        position: "relative",
        flex: "none",
      }}
    >
      <Bell size={isMobile ? 16 : 18} strokeWidth={1.8} />
      {unreadCount > 0 ? (
        <i
          className="nl-notification-count"
          data-wide={unreadCount > 9 ? "true" : undefined}
          aria-hidden="true"
          style={{
            position: "absolute",
            top: isMobile ? "-2px" : "-1px",
            right: isMobile ? "-2px" : "-1px",
            width: unreadCount > 9 ? "22px" : "18px",
            minWidth: unreadCount > 9 ? "22px" : "18px",
            maxWidth: unreadCount > 9 ? "22px" : "18px",
            height: "18px",
            minHeight: "18px",
            maxHeight: "18px",
            borderRadius: "999px",
            background: "#e0729e",
            border: "2px solid var(--vy-nav-bg)",
            color: "#fff",
            fontSize: unreadCount > 9 ? "8px" : "10px",
            lineHeight: "1",
            fontWeight: 900,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            boxSizing: "border-box",
            fontStyle: "normal",
            overflow: "hidden",
            whiteSpace: "nowrap",
            aspectRatio: unreadCount > 9 ? undefined : "1 / 1",
          }}
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </i>
      ) : null}
    </button>
  );
}

function NotificationTabs({
  isMobile,
  unreadCount,
  activeFilter,
  onFilterChange,
}: {
  isMobile: boolean;
  unreadCount: number;
  activeFilter: NotificationFilter;
  onFilterChange: (filter: NotificationFilter) => void;
}) {
  const tabs: Array<{ key: NotificationFilter; label: string }> = isMobile
    ? [
        { key: "all", label: "Tất cả" },
        { key: "bill", label: "Hóa đơn" },
        { key: "booking", label: "Đặt chỗ" },
        { key: "system", label: "Hệ thống" },
      ]
    : [
        { key: "all", label: "Tất cả" },
        { key: "bill", label: "Hóa đơn" },
        { key: "booking", label: "Đặt chỗ" },
      ];

  return (
    <div
      style={{
        display: "flex",
        gap: "7px",
        padding: isMobile ? "0 16px 12px" : "0 16px 12px",
        overflowX: isMobile ? "auto" : "hidden",
        borderBottom: `1px solid ${colors.border}`,
        scrollbarWidth: "none",
      }}
    >
      {tabs.map((tab) => {
        const active = tab.key === activeFilter;
        return (
          <button
            key={tab.key}
            type="button"
            aria-pressed={active}
            onClick={() => onFilterChange(tab.key)}
            style={{
              flex: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "12px",
              fontWeight: active ? 700 : 600,
              color: active ? colors.onGold : colors.text2,
              background: active
                ? "linear-gradient(135deg,#f0dda8,#d4b26a)"
                : colors.surface2,
              border: active ? "0" : `1px solid ${colors.border}`,
              borderRadius: "15px",
              padding: isMobile ? "7px 13px" : "6px 12px",
              fontFamily: "var(--nl-font-sans)",
              cursor: "pointer",
            }}
          >
            {tab.label}
            {active && tab.key === "all" && unreadCount > 0 ? (
              <b
                style={{
                  minWidth: "18px",
                  height: "18px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255, 250, 241, 0.96)",
                  color: "#7b5415",
                  border: `1px solid ${colors.borderGold32}`,
                  borderRadius: "999px",
                  boxShadow: "0 5px 12px rgba(36, 26, 10, 0.16)",
                  fontSize: "10px",
                  fontWeight: 800,
                  lineHeight: 1,
                  padding: "0 5px",
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </b>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function NoticeRow({
  notice,
  isMobile,
  onSelect,
}: {
  notice: Notice;
  isMobile: boolean;
  onSelect: (notice: Notice) => void;
}) {
  const Icon = notice.icon;
  const tone = noticeToneStyle[notice.tone];
  const rowStyle: React.CSSProperties = {
    display: "flex",
    gap: "12px",
    padding: "11px 16px",
    alignItems: "flex-start",
    background: notice.unread ? "var(--vy-gold-soft-bg)" : "transparent",
    border: 0,
    borderBottom: `1px solid ${colors.border}`,
    position: "relative",
    width: "100%",
    textAlign: "left",
    textDecoration: "none",
    color: "inherit",
    fontFamily: "var(--nl-font-sans)",
    cursor: "pointer",
  };

  const content = (
    <>
      <span
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          flex: "none",
          background: tone.background,
          border: `1px solid ${tone.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: tone.color,
        }}
      >
        <Icon size={isMobile ? 18 : 19} strokeWidth={1.8} />
      </span>

      <div style={{ flex: 1, minWidth: 0, paddingRight: notice.unread ? "10px" : 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: isMobile ? "8px" : "10px",
          }}
        >
          <span
            style={{
              fontSize: isMobile ? "14px" : "13.5px",
              fontWeight: notice.unread ? 700 : 600,
              color: notice.unread ? colors.text : colors.text2,
              lineHeight: 1.35,
            }}
          >
            {notice.title}
          </span>
          <span style={{ fontSize: isMobile ? "10.5px" : "11px", color: colors.faint, flex: "none" }}>
            {notice.time}
          </span>
        </div>

        <div style={{ fontSize: "12px", color: colors.muted, marginTop: "3px", lineHeight: 1.45 }}>
          {notice.body}
        </div>

        {notice.action ? (
          <span
            style={{
              display: "inline-block",
              marginTop: "9px",
              fontSize: isMobile ? "11.5px" : "11px",
              fontWeight: 700,
              color: notice.id === "happy-hour" ? colors.onGold : colors.goldPale,
              background:
                notice.id === "happy-hour"
                  ? "linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)"
                  : "rgba(212,178,106,.1)",
              border: notice.id === "happy-hour" ? "0" : "1px solid rgba(212,178,106,.3)",
              borderRadius: isMobile ? "9px" : "8px",
              padding: isMobile ? "7px 14px" : "6px 13px",
              fontFamily: "var(--nl-font-sans)",
            }}
          >
            {notice.action}
          </span>
        ) : null}
      </div>

      {notice.unread ? (
        <i
          aria-hidden="true"
          style={{
            position: "absolute",
            top: isMobile ? "13px" : "14px",
            right: "14px",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: colors.gold,
          }}
        />
      ) : null}
    </>
  );

  if (notice.href) {
    return (
      <Link href={notice.href} onClick={() => onSelect(notice)} style={rowStyle}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => onSelect(notice)} style={rowStyle}>
      {content}
    </button>
  );
}

function NoticeGroup({
  label,
  notices,
  isMobile,
  onSelect,
}: {
  label: string;
  notices: Notice[];
  isMobile: boolean;
  onSelect: (notice: Notice) => void;
}) {
  if (!notices.length) return null;

  return (
    <>
      <div
        style={{
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "1.4px",
          color: colors.muted,
          textTransform: "uppercase",
          padding: isMobile ? "13px 16px 2px" : "13px 16px 4px",
        }}
      >
        {label}
      </div>
      {notices.map((notice) => (
        <NoticeRow key={notice.id} notice={notice} isMobile={isMobile} onSelect={onSelect} />
      ))}
    </>
  );
}

const notificationIconByCategory: Record<MemberNotificationCategory, LucideIcon> = {
  bill: ReceiptText,
  booking: CalendarDays,
  system: Bell,
};

const extractBookingPlaceFromBody = (body: string) => {
  const placeMatch = body.match(
    /(?:Lịch đặt tại|Yêu cầu đặt bàn tại)\s+(.+?)(?:\s+lúc|\s+từ|\s+sang|\s+đã được|\s+vừa có|\s+đã hủy|\.|$)/i,
  );
  if (placeMatch?.[1]) return placeMatch[1].trim();

  const castMatch = body.match(
    /Yêu cầu đặt\s+(.+?)(?:\s+lúc|\s+đã được ghi nhận|\.|$)/i,
  );
  return castMatch?.[1]?.trim() || "";
};

const bookingPlaceLabel = (notification: MemberNotification) => {
  const place = extractBookingPlaceFromBody(notification.body);
  return place ? `tại ${place}` : "của bạn";
};

const normalizeMemberNotification = (notification: MemberNotification): MemberNotification => {
  const key = notification.templateKey;
  const placeLabel = bookingPlaceLabel(notification);
  const isCastBooking =
    notification.title === "Đặt bàn theo cast thành công" ||
    /^Yêu cầu đặt\s+(?!bàn tại\b)/i.test(notification.body);

  if (key === "customer.bill.submitted.v1") {
    return {
      ...notification,
      title: "Đã gửi hóa đơn",
      actionLabel: "Xem hóa đơn",
      category: "bill",
      tone: notification.tone === "gold" ? "amber" : notification.tone,
    };
  }

  if (key === "customer.bill.verified.v1") {
    return {
      ...notification,
      title: "Hóa đơn đã được duyệt",
      actionLabel: "Xem kết quả",
      category: "bill",
      tone: "green",
    };
  }

  if (key === "customer.bill.rejected.v1") {
    return {
      ...notification,
      title: "Hóa đơn bị từ chối",
      actionLabel: "Xem lý do",
      category: "bill",
      tone: "danger",
    };
  }

  if (key === "customer.booking.created.v1") {
    return {
      ...notification,
      title: isCastBooking ? "Đặt bàn theo cast thành công" : "Đặt bàn thành công",
      body: isCastBooking
        ? notification.body
        : `Yêu cầu đặt bàn ${placeLabel} đã được ghi nhận. Admin sẽ xác nhận sớm.`,
      actionLabel: "Xem lịch đặt",
      category: "booking",
      tone: "amber",
    };
  }

  if (key === "customer.booking.cast_created.v1") {
    return {
      ...notification,
      title: "Đặt bàn theo cast thành công",
      actionLabel: "Xem lịch đặt",
      category: "booking",
      tone: "amber",
    };
  }

  if (key === "customer.booking.rescheduled.v1") {
    return {
      ...notification,
      title: "Lịch đặt đã được đổi",
      body: notification.title === "Cập nhật lịch đặt"
        ? `Lịch đặt ${placeLabel} đã được đổi lịch.`
        : notification.body,
      actionLabel: "Xem lịch mới",
      category: "booking",
      tone: "green",
    };
  }

  if (key === "customer.booking.reschedule_rejected.v1") {
    return {
      ...notification,
      title: "Yêu cầu đổi lịch chưa được duyệt",
      body: notification.title === "Cập nhật lịch đặt"
        ? `Yêu cầu đổi lịch ${placeLabel} chưa được Admin duyệt.`
        : notification.body,
      actionLabel: "Xem lịch đặt",
      category: "booking",
      tone: "danger",
    };
  }

  if (key === "customer.booking.cancelled.v1") {
    return {
      ...notification,
      title: "Lịch đặt đã hủy",
      body: notification.title === "Cập nhật lịch đặt"
        ? `Lịch đặt ${placeLabel} đã được hủy.`
        : notification.body,
      actionLabel: "Xem lịch đặt",
      category: "booking",
      tone: "danger",
    };
  }

  if (key === "customer.booking.checked_in.v1") {
    return {
      ...notification,
      title: "Đã check-in lịch đặt",
      body: notification.title === "Cập nhật lịch đặt"
        ? `Lịch đặt ${placeLabel} đã được check-in.`
        : notification.body,
      actionLabel: "Xem lịch đặt",
      category: "booking",
      tone: "green",
    };
  }

  if (key === "customer.booking.completed.v1") {
    return {
      ...notification,
      title: "Lịch đặt đã hoàn tất",
      body: notification.title === "Cập nhật lịch đặt"
        ? `Lịch đặt ${placeLabel} đã hoàn tất.`
        : notification.body,
      actionLabel: "Xem lịch đặt",
      category: "booking",
      tone: "green",
    };
  }

  return notification;
};

const toNotice = (notification: MemberNotification, language: LanguageCode): Notice => {
  const displayNotification = normalizeMemberNotification(notification);
  const createdAt = new Date(notification.createdAt);
  const isToday =
    !Number.isNaN(createdAt.getTime()) && createdAt.toDateString() === new Date().toDateString();

  return {
    id: displayNotification.id,
    group: isToday ? "today" : "yesterday",
    title: translateText(displayNotification.title, language),
    body: translateText(displayNotification.body, language),
    time: translateText(displayNotification.timeLabel, language),
    action: displayNotification.actionLabel
      ? translateText(displayNotification.actionLabel, language)
      : undefined,
    unread: displayNotification.unread,
    icon: notificationIconByCategory[displayNotification.category] ?? Bell,
    tone: displayNotification.tone,
    href: displayNotification.href,
    category: displayNotification.category,
  };
};

type NotificationPanelProps = {
  notices: Notice[];
  unreadCount: number;
  isLoading: boolean;
  error: string;
  activeFilter: NotificationFilter;
  onFilterChange: (filter: NotificationFilter) => void;
  onMarkAllRead: () => void;
  onNoticeSelect: (notice: Notice) => void;
};

function NotificationEmptyState({ isLoading, error }: { isLoading: boolean; error: string }) {
  return (
    <div
      style={{
        padding: "28px 18px",
        textAlign: "center",
        color: colors.muted,
        fontSize: "13px",
        lineHeight: 1.55,
      }}
    >
      {isLoading
        ? "Đang tải thông báo..."
        : error || "Chưa có thông báo mới. Khi Admin duyệt hóa đơn, kết quả sẽ hiện ở đây."}
    </div>
  );
}

function DesktopNotificationDropdown({
  notices,
  unreadCount,
  isLoading,
  error,
  activeFilter,
  onFilterChange,
  onMarkAllRead,
  onNoticeSelect,
}: NotificationPanelProps) {
  const visibleNotices =
    activeFilter === "all" ? notices : notices.filter((notice) => notice.category === activeFilter);
  const todayNotices = visibleNotices.filter((notice) => notice.group === "today");
  const previousNotices = visibleNotices.filter((notice) => notice.group === "yesterday");

  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "62px",
          right: "72px",
          width: "14px",
          height: "14px",
          background: colors.surface,
          borderLeft: `1px solid ${colors.border}`,
          borderTop: `1px solid ${colors.border}`,
          transform: "rotate(45deg)",
          zIndex: 101,
        }}
      />
      <section
        data-notification-popup="true"
        role="dialog"
        aria-labelledby="notification-panel-title"
        onMouseDown={(event) => event.stopPropagation()}
        style={{
          position: "fixed",
          top: "70px",
          right: "18px",
          zIndex: 101,
          width: "min(404px, calc(100vw - 36px))",
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: "16px",
          boxShadow: "var(--vy-shadow)",
          overflow: "hidden",
          color: colors.text,
          fontFamily: "var(--nl-font-sans)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 16px 12px",
          }}
        >
          <h2
            id="notification-panel-title"
            style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: colors.text }}
          >
            Thông báo
          </h2>
          <button
            type="button"
            onClick={onMarkAllRead}
            disabled={!unreadCount}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              border: 0,
              background: "transparent",
              color: colors.goldPale,
              fontSize: "11.5px",
              fontWeight: 700,
              fontFamily: "var(--nl-font-sans)",
              cursor: unreadCount ? "pointer" : "default",
              opacity: unreadCount ? 1 : 0.45,
              padding: 0,
            }}
          >
            <CheckCheck size={14} strokeWidth={2.2} />
            Đánh dấu tất cả đã đọc
          </button>
        </div>

        <NotificationTabs
          isMobile={false}
          unreadCount={unreadCount}
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
        />
        {visibleNotices.length ? (
          <>
            <NoticeGroup
              label="Hôm nay"
              notices={todayNotices}
              isMobile={false}
              onSelect={onNoticeSelect}
            />
            <NoticeGroup
              label="Trước đó"
              notices={previousNotices}
              isMobile={false}
              onSelect={onNoticeSelect}
            />
          </>
        ) : (
          <NotificationEmptyState isLoading={isLoading} error={error} />
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderTop: `1px solid ${colors.border}`,
          }}
        >
          <Link
            href="/gui-hoa-don"
            style={{
              border: 0,
              padding: 0,
              background: "transparent",
              color: colors.goldPale,
              fontSize: "12.5px",
              fontWeight: 700,
              fontFamily: "var(--nl-font-sans)",
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            Xem hóa đơn của tôi
          </Link>
          <button
            type="button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              border: 0,
              padding: 0,
              background: "transparent",
              color: colors.muted,
              fontSize: "12px",
              fontFamily: "var(--nl-font-sans)",
              cursor: "pointer",
            }}
          >
            <Settings size={15} strokeWidth={1.7} />
            Cài đặt
          </button>
        </div>
      </section>
    </>
  );
}

function MobileNotificationPanel({
  onClose,
  notices,
  unreadCount,
  isLoading,
  error,
  activeFilter,
  onFilterChange,
  onMarkAllRead,
  onNoticeSelect,
}: { onClose: () => void } & NotificationPanelProps) {
  const visibleNotices =
    activeFilter === "all" ? notices : notices.filter((notice) => notice.category === activeFilter);
  const todayNotices = visibleNotices.filter((notice) => notice.group === "today");
  const previousNotices = visibleNotices.filter((notice) => notice.group === "yesterday");

  return (
    <section
      data-notification-popup="true"
      role="dialog"
      aria-modal="false"
      aria-labelledby="mobile-notification-title"
      onMouseDown={(event) => event.stopPropagation()}
      style={{
        position: "fixed",
        top: "calc(62px + env(safe-area-inset-top))",
        right: "10px",
        left: "10px",
        zIndex: 101,
        maxHeight: "min(68vh, 560px)",
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: "18px",
        boxShadow: "var(--vy-shadow)",
        color: colors.text,
        fontFamily: "var(--nl-font-sans)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transformOrigin: "top right",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "14px 14px 8px",
        }}
      >
        <button
          type="button"
          aria-label="Đóng thông báo"
          onClick={onClose}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: `1px solid ${colors.border}`,
            background: colors.surface2,
            color: colors.text,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
            cursor: "pointer",
          }}
        >
          <X size={17} strokeWidth={2} />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            id="mobile-notification-title"
            style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: colors.text }}
          >
            Thông báo
          </h2>
          <div
            style={{
              fontSize: "8px",
              fontWeight: 700,
              letterSpacing: "1.8px",
              color: colors.muted,
              textTransform: "uppercase",
              marginTop: "2px",
            }}
          >
            Notifications
          </div>
        </div>

        <button
          type="button"
          aria-label="Cài đặt thông báo"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: `1px solid ${colors.border}`,
            background: colors.surface2,
            color: colors.muted,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
            cursor: "pointer",
          }}
        >
          <Settings size={17} strokeWidth={1.7} />
        </button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px 8px",
          gap: "12px",
        }}
      >
        <span style={{ fontSize: "11.5px", color: colors.muted }}>
          <b style={{ color: colors.goldPale }}>{unreadCount}</b> thông báo chưa đọc
        </span>
        <button
          type="button"
          onClick={onMarkAllRead}
          disabled={!unreadCount}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            border: 0,
            background: "transparent",
            color: colors.goldPale,
            fontSize: "11.5px",
            fontWeight: 700,
            fontFamily: "var(--nl-font-sans)",
            cursor: unreadCount ? "pointer" : "default",
            opacity: unreadCount ? 1 : 0.45,
            padding: 0,
            whiteSpace: "nowrap",
          }}
        >
          <CheckCheck size={13} strokeWidth={2.2} />
          Đánh dấu đã đọc
        </button>
      </div>

      <NotificationTabs
        isMobile
        unreadCount={unreadCount}
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
      />

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingBottom: "calc(24px + env(safe-area-inset-bottom))",
        }}
      >
        {visibleNotices.length ? (
          <>
            <NoticeGroup
              label="Hôm nay"
              notices={todayNotices}
              isMobile
              onSelect={onNoticeSelect}
            />
            <NoticeGroup
              label="Hôm qua"
              notices={previousNotices}
              isMobile
              onSelect={onNoticeSelect}
            />
          </>
        ) : (
          <NotificationEmptyState isLoading={isLoading} error={error} />
        )}
      </div>
    </section>
  );
}

function NotificationOverlay({
  isMobile,
  onClose,
  ...props
}: { isMobile: boolean; onClose: () => void } & NotificationPanelProps) {
  return isMobile ? (
    <MobileNotificationPanel onClose={onClose} {...props} />
  ) : (
    <DesktopNotificationDropdown {...props} />
  );
}

function SiteFooter({ isMobile }: { isMobile: boolean }) {
  if (isMobile) {
    return (
      <footer
        className="nl-site-footer"
        style={{
          borderTop: `1px solid ${colors.borderGold12}`,
          background: colors.bg,
          color: colors.muted,
          padding: "18px 20px calc(92px + env(safe-area-inset-bottom))",
          fontSize: "11.5px",
        }}
      >
        <div style={{ display: "grid", gap: "12px" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              flexDirection: "column",
              width: "fit-content",
              color: colors.goldPale,
              textDecoration: "none",
            }}
          >
            <span style={{ fontSize: "22px", fontWeight: 900, lineHeight: 1 }}>Vietyoru</span>
            <span
              style={{
                marginTop: "5px",
                color: colors.goldPale,
                opacity: 0.64,
                fontSize: "9px",
                letterSpacing: "1.2px",
              }}
            >
              VIETNAM NIGHTLIFE GUIDE
            </span>
          </Link>

          <p style={{ margin: 0, color: colors.text2, fontSize: "12px", lineHeight: 1.55 }}>
            Khám phá quán, cast, ưu đãi và cẩm nang nightlife tại Việt Nam.
          </p>

          <nav
            aria-label="Footer mobile"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px 14px",
            }}
          >
            {mobileFooterLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: colors.goldPale,
                  fontSize: "12px",
                  fontWeight: 800,
                  textDecoration: "none",
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div
            style={{
              borderTop: `1px solid ${colors.borderGold12}`,
              paddingTop: "10px",
              color: "#8c8679",
              fontSize: "10.5px",
              lineHeight: 1.55,
            }}
          >
            © 2026 Vietyoru. 18+ · Giá và tình trạng đặt chỗ được admin xác nhận.
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer
      className="nl-site-footer"
      style={{
        borderTop: `1px solid ${colors.borderGold12}`,
        background: colors.bg,
        color: colors.muted,
        padding: isMobile
          ? "28px 18px calc(116px + env(safe-area-inset-bottom))"
          : "42px 34px 34px",
        fontSize: "12px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr"
            : "minmax(220px, 1.1fr) repeat(3, minmax(140px, .7fr))",
          gap: isMobile ? "22px" : "28px",
          maxWidth: "1180px",
          margin: "0 auto",
        }}
      >
        <div>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              flexDirection: "column",
              color: colors.goldPale,
              textDecoration: "none",
            }}
          >
            <span style={{ fontSize: isMobile ? "24px" : "28px", fontWeight: 900, lineHeight: 1 }}>
              Vietyoru
            </span>
            <span
              style={{
                marginTop: "6px",
                color: colors.goldPale,
                opacity: 0.7,
                letterSpacing: "1.2px",
              }}
            >
              VIETNAM NIGHTLIFE GUIDE
            </span>
          </Link>
          <p
            style={{ maxWidth: "310px", margin: "14px 0 0", color: colors.text2, lineHeight: 1.65 }}
          >
            Khám phá quán, cast, ưu đãi và cẩm nang nightlife tại Việt Nam.
          </p>
          <p style={{ margin: "12px 0 0", color: "#9a9488", lineHeight: 1.6 }}>
            Nội dung pháp lý đang dùng placeholder cho đến khi khách hàng cung cấp bản chính thức.
          </p>
        </div>

        {footerGroups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2
              style={{
                margin: 0,
                color: colors.goldPale,
                fontSize: "12px",
                fontWeight: 900,
                letterSpacing: "1.3px",
                textTransform: "uppercase",
              }}
            >
              {group.title}
            </h2>
            <div style={{ display: "grid", gap: "10px", marginTop: "13px" }}>
              {group.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    color: colors.text2,
                    textDecoration: "none",
                    fontSize: "13px",
                    lineHeight: 1.4,
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        ))}
      </div>

      <div
        style={{
          maxWidth: "1180px",
          margin: "26px auto 0",
          borderTop: `1px solid ${colors.borderGold12}`,
          paddingTop: "18px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "10px",
          color: "#8c8679",
        }}
      >
        <span>© 2026 Vietyoru. Bảo lưu mọi quyền.</span>
        <span>18+ · Giá và tình trạng đặt chỗ được xác nhận lại bởi admin.</span>
      </div>
    </footer>
  );
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const [isMobile, setIsMobile] = useState(false);
  const [shouldSimulate, setShouldSimulate] = useState(false);
  const [appearanceBottomNav, setAppearanceBottomNav] = useState<BottomNavItem[]>(bottomNav);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<NotificationFilter>("all");
  const [memberNotifications, setMemberNotifications] = useState<MemberNotification[]>([]);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [isNotificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const [activeLanguage, setActiveLanguage] = useState<LanguageCode>("vi");
  const notificationIdsRef = useRef(new Set<string>());
  const optimisticNotificationIdsRef = useRef(new Set<string>());
  const hideChrome = hiddenChromePaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const customerRouteMotionEnabled =
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/partner") &&
    pathname !== "/chon-giao-dien";
  const enableScrollReveal = pathname === "/";
  const displayName = authUser?.displayName || authUser?.email?.split("@")[0] || "";
  const showSupportChat = true; // Always show for both User and Guest
  const showCustomerNotifications = authUser?.role?.toUpperCase() === "USER";
  const notificationNotices = memberNotifications.map((notification) =>
    toNotice(notification, activeLanguage),
  );

  useEffect(() => {
    const syncLanguage = (event?: Event) => {
      const nextLanguage = (event as CustomEvent<{ language?: LanguageCode }> | undefined)?.detail
        ?.language;
      setActiveLanguage(nextLanguage ?? readStoredLanguage());
    };

    syncLanguage();
    window.addEventListener(languageChangedEvent, syncLanguage);
    return () => window.removeEventListener(languageChangedEvent, syncLanguage);
  }, []);

  const refreshMemberNotifications = useCallback(async () => {
    if (!showCustomerNotifications) {
      notificationIdsRef.current = new Set();
      optimisticNotificationIdsRef.current.clear();
      setMemberNotifications([]);
      setNotificationUnreadCount(0);
      setNotificationsError("");
      return;
    }

    setNotificationsLoading(true);
    setNotificationsError("");
    try {
      const response = await notificationApi.listMemberNotifications(20);
      notificationIdsRef.current = new Set(response.data.map((item) => item.id));
      optimisticNotificationIdsRef.current.clear();
      setMemberNotifications(response.data);
      setNotificationUnreadCount(response.unreadCount);
    } catch {
      setNotificationsError("Chưa tải được thông báo. Vui lòng thử lại.");
    } finally {
      setNotificationsLoading(false);
    }
  }, [showCustomerNotifications]);

  const markAllNotificationsRead = useCallback(() => {
    if (!notificationUnreadCount) return;
    setMemberNotifications((items) => items.map((item) => ({ ...item, unread: false })));
    setNotificationUnreadCount(0);
    notificationApi.markAllMemberNotificationsRead().catch(() => {
      void refreshMemberNotifications();
    });
  }, [notificationUnreadCount, refreshMemberNotifications]);

  const handleNotificationSelect = useCallback(
    (notice: Notice) => {
      setIsNotificationOpen(false);
      if (!notice.unread) return;

      setMemberNotifications((items) =>
        items.map((item) => (item.id === notice.id ? { ...item, unread: false } : item)),
      );
      setNotificationUnreadCount((count) => Math.max(0, count - 1));
      notificationApi.markMemberNotificationRead(notice.id).catch(() => {
        void refreshMemberNotifications();
      });
    },
    [refreshMemberNotifications],
  );

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    getAppearanceConfig()
      .then((config) => {
        if (!cancelled) {
          setAppearanceBottomNav(config.nav.map(mapAppearanceNavItem));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAppearanceBottomNav(bottomNav);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const previousRootScrollBehavior = root.style.scrollBehavior;
    const previousBodyScrollBehavior = body.style.scrollBehavior;

    root.style.scrollBehavior = "auto";
    body.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    root.scrollTop = 0;
    body.scrollTop = 0;

    const restoreTimer = window.setTimeout(() => {
      root.style.scrollBehavior = previousRootScrollBehavior;
      body.style.scrollBehavior = previousBodyScrollBehavior;
    }, 120);

    return () => {
      window.clearTimeout(restoreTimer);
      root.style.scrollBehavior = previousRootScrollBehavior;
      body.style.scrollBehavior = previousBodyScrollBehavior;
    };
  }, [pathname]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => {
      const match = document.cookie.match(new RegExp("(^| )device_preference=([^;]+)"));
      const preference = match ? match[2] : null;
      const viewportIsMobile = media.matches;
      let isIframe = false;

      try {
        isIframe = window.top !== window.self;
      } catch {
        isIframe = true;
      }

      setIsMobile(preference === "mobile" || media.matches);
      setShouldSimulate(preference === "mobile" && !viewportIsMobile && !isIframe);
    };

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let expiryTimer: number | undefined;

    const scheduleExpiryCheck = () => {
      if (expiryTimer) {
        window.clearTimeout(expiryTimer);
        expiryTimer = undefined;
      }

      const expiresAt = getAuthSessionExpiresAt();
      if (!expiresAt) return;

      const delay = Math.max(0, Math.min(expiresAt - Date.now() + 250, 2_147_483_647));
      expiryTimer = window.setTimeout(updateAuthUser, delay);
    };

    const updateAuthUser = () => {
      const nextUser = getAuthUser();
      setAuthUser(nextUser);
      if (!nextUser) {
        setIsChatOpen(false);
        setIsNotificationOpen(false);
      }
      scheduleExpiryCheck();
    };

    updateAuthUser();
    window.addEventListener("focus", updateAuthUser);
    window.addEventListener("storage", updateAuthUser);
    window.addEventListener(authSessionChangeEvent, updateAuthUser);
    return () => {
      if (expiryTimer) {
        window.clearTimeout(expiryTimer);
      }
      window.removeEventListener("focus", updateAuthUser);
      window.removeEventListener("storage", updateAuthUser);
      window.removeEventListener(authSessionChangeEvent, updateAuthUser);
    };
  }, [pathname]);

  useEffect(() => {
    queueMicrotask(() => {
      void refreshMemberNotifications();
    });
    if (!showCustomerNotifications) return;

    const handleRefresh = () => {
      void refreshMemberNotifications();
    };
    const interval = window.setInterval(() => {
      void refreshMemberNotifications();
    }, 60_000);
    window.addEventListener(memberNotificationsRefreshEvent, handleRefresh);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener(memberNotificationsRefreshEvent, handleRefresh);
    };
  }, [refreshMemberNotifications, showCustomerNotifications]);

  useEffect(() => {
    if (!showCustomerNotifications) {
      optimisticNotificationIdsRef.current.clear();
      return;
    }

    const retryTimers = new Set<number>();
    const handleCreated = (event: Event) => {
      const detail = event instanceof CustomEvent
        ? (event.detail as MemberNotificationSocketPayload | undefined)
        : undefined;
      const notificationId =
        typeof detail?.id === "string" && detail.id.trim() ? detail.id.trim() : "";

      if (
        notificationId &&
        !notificationIdsRef.current.has(notificationId) &&
        !optimisticNotificationIdsRef.current.has(notificationId)
      ) {
        optimisticNotificationIdsRef.current.add(notificationId);
        setNotificationUnreadCount((count) => count + 1);
      }

      void refreshMemberNotifications();
      const retryTimer = window.setTimeout(() => {
        retryTimers.delete(retryTimer);
        void refreshMemberNotifications();
      }, 800);
      retryTimers.add(retryTimer);
    };

    window.addEventListener(memberNotificationCreatedEvent, handleCreated as EventListener);

    return () => {
      window.removeEventListener(memberNotificationCreatedEvent, handleCreated as EventListener);
      retryTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [refreshMemberNotifications, showCustomerNotifications]);

  useEffect(() => {
    if (isNotificationOpen) {
      queueMicrotask(() => {
        void refreshMemberNotifications();
      });
    }
  }, [isNotificationOpen, refreshMemberNotifications]);

  useEffect(() => {
    const checkedElements = new WeakMap<HTMLElement, string>();
    const imageStatus = new Map<string, boolean>();
    let scanTimer: number | undefined;

    const getUrl = (value: string) => {
      const match = value.match(/url\((['"]?)(.*?)\1\)/i);
      return match?.[2]?.trim() || "";
    };

    const applyStatus = (element: HTMLElement, ok: boolean) => {
      element.classList.toggle("nl-media-fallback", !ok);
    };

    const checkElement = (element: HTMLElement) => {
      const cssBackground = `${element.style.backgroundImage || ""},${element.style.background || ""}`;
      const url = getUrl(cssBackground);
      if (!url) return;

      if (checkedElements.get(element) === url) return;
      checkedElements.set(element, url);

      const cached = imageStatus.get(url);
      if (typeof cached === "boolean") {
        applyStatus(element, cached);
        return;
      }

      const probe = new window.Image();
      probe.onload = () => {
        imageStatus.set(url, true);
        applyStatus(element, true);
      };
      probe.onerror = () => {
        imageStatus.set(url, false);
        applyStatus(element, false);
      };
      probe.src = url;
    };

    const scan = () => {
      scanTimer = undefined;
      document.querySelectorAll<HTMLElement>("[style*='url(']").forEach(checkElement);
    };

    const scheduleScan = () => {
      if (scanTimer) window.clearTimeout(scanTimer);
      scanTimer = window.setTimeout(scan, 80);
    };

    scheduleScan();
    const observer = new MutationObserver(scheduleScan);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style"],
    });

    return () => {
      if (scanTimer) window.clearTimeout(scanTimer);
      observer.disconnect();
    };
  }, [pathname]);

  useEffect(() => {
    const closeTimer = window.setTimeout(() => setIsNotificationOpen(false), 0);
    return () => window.clearTimeout(closeTimer);
  }, [pathname]);

  useEffect(() => {
    if (!isNotificationOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-notification-popup='true'], [data-notification-trigger='true']")) {
        return;
      }
      setIsNotificationOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsNotificationOpen(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isNotificationOpen]);

  useEffect(() => {
    if (!enableScrollReveal) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || !("IntersectionObserver" in window)) return;

    const root = document.documentElement;
    const observed = new Set<HTMLElement>();
    let scanTimer: number | undefined;
    let lastScrollY = window.scrollY;
    let scrollDirection: "up" | "down" = "down";
    let observer: IntersectionObserver | null = null;

    const revealElement = (element: HTMLElement, instant = false) => {
      if (element.classList.contains("is-revealed")) return;

      if (instant) {
        element.dataset.revealInstant = "true";
      } else {
        delete element.dataset.revealInstant;
      }

      element.dataset.revealDir = "down";
      element.classList.add("is-revealed");
      observer?.unobserve(element);
    };

    const updateScrollDirection = () => {
      const nextY = window.scrollY;
      const delta = nextY - lastScrollY;
      if (Math.abs(delta) < 2) return;

      scrollDirection = delta < 0 ? "up" : "down";
      lastScrollY = nextY;
      root.dataset.scrollDirection = scrollDirection;

      observed.forEach((element) => {
        if (element.classList.contains("is-revealed")) return;

        if (scrollDirection === "up") {
          const rect = element.getBoundingClientRect();
          if (rect.top < window.innerHeight + 96) {
            revealElement(element, true);
          }
          return;
        }

        element.dataset.revealDir = "down";
      });
    };

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const element = entry.target as HTMLElement;
          revealElement(element, scrollDirection === "up");
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.08,
      },
    );

    const observeElement = (element: HTMLElement) => {
      if (observed.has(element) || !isRevealTarget(element)) return;

      element.classList.add("nl-scroll-reveal");
      element.dataset.revealDir = "down";
      element.style.setProperty("--nl-reveal-delay", `${Math.min(observed.size % 7, 6) * 38}ms`);
      observed.add(element);

      const rect = element.getBoundingClientRect();
      const shouldRevealImmediately =
        scrollDirection === "up" || rect.bottom <= 0 || rect.top < window.innerHeight * 0.86;

      if (shouldRevealImmediately) {
        revealElement(element, true);
        return;
      }

      observer?.observe(element);
    };

    const scan = () => {
      scanTimer = undefined;
      document.querySelectorAll<HTMLElement>(revealTargetSelector).forEach(observeElement);
    };

    const scheduleScan = () => {
      if (scanTimer) window.clearTimeout(scanTimer);
      scanTimer = window.setTimeout(scan, 90);
    };

    root.classList.add("nl-scroll-effects-ready");
    updateScrollDirection();
    scan();

    const mutationObserver = new MutationObserver(scheduleScan);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    window.addEventListener("scroll", updateScrollDirection, { passive: true });

    return () => {
      root.classList.remove("nl-scroll-effects-ready");
      delete root.dataset.scrollDirection;
      if (scanTimer) window.clearTimeout(scanTimer);
      mutationObserver.disconnect();
      observer?.disconnect();
      window.removeEventListener("scroll", updateScrollDirection);
      observed.forEach((element) => {
        element.classList.remove("nl-scroll-reveal", "is-revealed");
        element.style.removeProperty("--nl-reveal-delay");
        delete element.dataset.revealDir;
        delete element.dataset.revealInstant;
      });
    };
  }, [enableScrollReveal]);

  if (shouldSimulate) return <MobileSimulator />;

  const routePreloader = customerRouteMotionEnabled ? (
    <div
      key={`route-preloader-${pathname}`}
      aria-hidden="true"
      className="nl-route-preloader"
    />
  ) : null;

  if (hideChrome) {
    return (
      <SystemFeedbackProvider>
        {customerRouteMotionEnabled ? (
          <>
            {routePreloader}
            <div
              key={`route-content-${pathname}`}
              className="nl-customer-route-content"
            >
              {children}
            </div>
          </>
        ) : (
          children
        )}
      </SystemFeedbackProvider>
    );
  }

  return (
    <SystemFeedbackProvider>
      <div
        style={{
          minHeight: "100vh",
          background: colors.bg,
          color: colors.text,
          fontFamily: "var(--nl-font-sans)",
        }}
      >
        <header
          className="nl-site-header"
          style={{
            minHeight: isMobile ? "56px" : "82px",
            padding: isMobile ? "0 16px" : "18px 34px",
            borderBottom: `1px solid ${colors.borderGold12}`,
            background: colors.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: isMobile ? "12px" : "24px",
            flexWrap: "nowrap",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "34px",
              minWidth: 0,
              flex: isMobile ? "1 1 auto" : "none",
            }}
          >
            <Link
              href="/"
              style={{
                display: "inline-flex",
                flexDirection: "column",
                textDecoration: "none",
                flex: "none",
                minWidth: 0,
                maxWidth: "100%",
              }}
            >
              <span
                style={{
                  fontSize: isMobile ? "22px" : "26px",
                  fontWeight: 800,
                  lineHeight: 1,
                  background: colors.goldGrad,
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  textShadow: "0 0 22px rgba(247,217,120,.28)",
                  whiteSpace: "nowrap",
                }}
              >
                Vietyoru
              </span>
              <span
                style={{
                  marginTop: "3px",
                  fontSize: isMobile ? "7px" : "8.5px",
                  letterSpacing: isMobile ? "1.2px" : "1.6px",
                  color: colors.goldPale,
                  opacity: 0.72,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                VIETNAM NIGHTLIFE GUIDE
              </span>
            </Link>
            {!isMobile ? (
              <nav
                className="nl-site-nav-links"
                style={{
                  display: "flex",
                  gap: "22px",
                  fontSize: "13px",
                  color: colors.text2,
                  fontWeight: 500,
                }}
              >
                {desktopNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      color: isActive(pathname, link.href) ? colors.goldPale : colors.text2,
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            ) : null}
          </div>

          {isMobile ? (
            /* ── Mobile: 3 icon buttons ── */
            <div
              className="nl-site-actions"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flex: "none",
              }}
            >
              <LanguagePicker isMobile={isMobile} />
              <ThemeToggle isMobile={isMobile} />

              {showSupportChat ? (
                <SupportChatWidget
                  isMobile={isMobile}
                  isOpen={isChatOpen}
                  onOpen={() => setIsNotificationOpen(false)}
                  onOpenChange={setIsChatOpen}
                />
              ) : null}

              {showCustomerNotifications ? (
                <NotificationBellButton
                  isMobile={isMobile}
                  isOpen={isNotificationOpen}
                  unreadCount={notificationUnreadCount}
                  onClick={() => {
                    setIsChatOpen(false);
                    setIsNotificationOpen((open) => !open);
                  }}
                />
              ) : null}

              {!authUser ? (
                <Link
                  href="/dang-nhap"
                  aria-label="Đăng nhập"
                  style={{
                    minHeight: "36px",
                    padding: "0 12px",
                    borderRadius: "18px",
                    border: 0,
                    color: colors.onGold,
                    background: "linear-gradient(135deg,#f4e3b4,#d4b26a 58%,#b6924a)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11.5px",
                    fontWeight: 900,
                    fontFamily: "var(--nl-font-sans)",
                    lineHeight: 1,
                    letterSpacing: 0,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    boxShadow: "0 8px 20px rgba(212,178,106,.18)",
                  }}
                >
                  Đăng nhập
                </Link>
              ) : null}
            </div>
          ) : (
            /* ── Desktop: icon buttons (same as mobile, slightly larger) ── */
            <div
              className="nl-site-actions"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flex: "none",
              }}
            >
              <LanguagePicker isMobile={isMobile} />
              <ThemeToggle isMobile={isMobile} />

              {showSupportChat ? (
                <SupportChatWidget
                  isMobile={isMobile}
                  isOpen={isChatOpen}
                  onOpen={() => setIsNotificationOpen(false)}
                  onOpenChange={setIsChatOpen}
                />
              ) : null}

              {showCustomerNotifications ? (
                <NotificationBellButton
                  isMobile={isMobile}
                  isOpen={isNotificationOpen}
                  unreadCount={notificationUnreadCount}
                  onClick={() => {
                    setIsChatOpen(false);
                    setIsNotificationOpen((open) => !open);
                  }}
                />
              ) : null}

              {/* Login / User */}
              {!authUser ? (
                <Link
                  href="/dang-nhap"
                  style={{
                    minHeight: "40px",
                    padding: "0 18px",
                    borderRadius: "20px",
                    border: `1px solid ${colors.borderGold32}`,
                    color: colors.goldPale,
                    background: "var(--vy-surface-2)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    fontSize: "13px",
                    fontWeight: 700,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  <LogIn size={16} style={{ flex: "none" }} />
                  Đăng nhập
                </Link>
              ) : (
                <Link
                  href="/tai-khoan"
                  title="Xem thông tin tài khoản"
                  style={{
                    minHeight: "40px",
                    height: "40px",
                    maxWidth: "190px",
                    padding: "0 16px",
                    borderRadius: "20px",
                    border: `1px solid ${colors.borderGold32}`,
                    color: colors.goldPale,
                    background: "rgba(212,178,106,.1)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    fontSize: "13px",
                    fontWeight: 800,
                    textDecoration: "none",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    minWidth: 0,
                  }}
                >
                  <UserRound size={16} style={{ flex: "none" }} />
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {displayName}
                  </span>
                </Link>
              )}
            </div>
          )}
        </header>

        {routePreloader}

        <div key={`route-content-${pathname}`} className="nl-page-content">
          {children}
        </div>

        <SiteFooter isMobile={isMobile} />

        <nav
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 60,
            height: "calc(74px + env(safe-area-inset-bottom))",
            background: colors.navBg,
            borderTop: `1px solid ${colors.borderGold22}`,
            display: "grid",
            gridTemplateColumns: "repeat(5,1fr)",
            alignItems: "center",
            padding: "6px 8px calc(8px + env(safe-area-inset-bottom))",
            backdropFilter: "blur(16px)",
          }}
          className="nl-mobile-bottom-nav"
        >
          {appearanceBottomNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            const activeColor = item.color || colors.gold;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  color: active ? activeColor : "#6f6b62",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  minHeight: "54px",
                  borderRadius: "14px",
                  background: active
                    ? item.color
                      ? `color-mix(in srgb, ${item.color} 18%, transparent)`
                      : "rgba(212,178,106,.1)"
                    : "transparent",
                  textDecoration: "none",
                  fontSize: "9.5px",
                  fontWeight: active ? 700 : 500,
                  touchAction: "manipulation",
                }}
              >
                {item.iconUrl ? (
                  <img src={item.iconUrl} alt="" width={21} height={21} style={{ display: "block", objectFit: "contain" }} />
                ) : (
                  <Icon size={21} />
                )}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {isNotificationOpen && typeof document !== "undefined"
          ? createPortal(
              <NotificationOverlay
                isMobile={isMobile}
                notices={notificationNotices}
                unreadCount={notificationUnreadCount}
                isLoading={isNotificationsLoading}
                error={notificationsError}
                activeFilter={notificationFilter}
                onFilterChange={setNotificationFilter}
                onMarkAllRead={markAllNotificationsRead}
                onNoticeSelect={handleNotificationSelect}
                onClose={() => setIsNotificationOpen(false)}
              />,
              document.body,
            )
          : null}
      </div>
    </SystemFeedbackProvider>
  );
}
