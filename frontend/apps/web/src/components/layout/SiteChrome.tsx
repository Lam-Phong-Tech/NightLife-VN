"use client";

import Link from "next/link";
import {
  Bell,
  CalendarDays,
  CheckCheck,
  ChevronLeft,
  Clock3,
  Crown,
  Home,
  LogIn,
  Send,
  Settings,
  Search,
  Ticket,
  Trophy,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getAuthUser, type AuthUser } from "@/lib/auth/session";
import { SystemFeedbackProvider } from "@/components/ui/SystemFeedback";
import { LanguagePicker } from "./LanguagePicker";
import { MobileSimulator } from "./MobileSimulator";
import { SupportChatWidget } from "./SupportChatWidget";

const colors = {
  bg: "#0c0c0f",
  navBg: "rgba(8,8,11,.95)",
  borderGold12: "rgba(212,178,106,.18)",
  borderGold22: "rgba(212,178,106,.22)",
  borderGold32: "rgba(212,178,106,.32)",
  text: "#f3f0ea",
  text2: "#c5c0b6",
  muted: "#8c8679",
  onGold: "#241a0a",
  gold: "#d4b26a",
  goldPale: "#f0dda8",
  goldGrad: "linear-gradient(135deg,#fff7d7 0%,#f7d978 42%,#d5a23a 100%)",
};

const hiddenChromePaths = [
  "/dang-nhap",
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
  { href: "/tour", label: "Tour" },
  { href: "/uu-dai", label: "Ưu đãi" },
  { href: "/blog", label: "Blog" },
];

const bottomNav = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/danh-sach-quan", label: "Tìm quán", icon: Search },
  { href: "/uu-dai", label: "Ưu đãi", icon: Ticket },
  { href: "/lich-su-dat-cho", label: "Đơn đặt", icon: CalendarDays },
  { href: "/tai-khoan", label: "Tài khoản", icon: UserRound },
];

type NoticeTone = "gold" | "green" | "amber" | "vip";

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
};

const notices: Notice[] = [
  {
    id: "happy-hour",
    group: "today",
    title: "Ưu đãi mới −30% Happy Hour",
    body: "Club Lumière vừa tung mã giảm cho khung giờ vàng tối nay.",
    time: "5 phút",
    action: "Lấy mã",
    unread: true,
    icon: Ticket,
    tone: "gold",
  },
  {
    id: "booking-confirmed",
    group: "today",
    title: "Đặt bàn VIP đã được xác nhận",
    body: "Bàn tại Sakura Lounge · 22:30 tối nay đã sẵn sàng.",
    time: "22 phút",
    action: "Xem chi tiết",
    unread: true,
    icon: CalendarDays,
    tone: "green",
  },
  {
    id: "admin-routing",
    group: "today",
    title: "Admin đang điều phối đặt chỗ",
    body: "Đã gửi yêu cầu tới quán qua Telegram, sẽ liên hệ bạn trong ít phút.",
    time: "40 phút",
    unread: true,
    icon: Send,
    tone: "gold",
  },
  {
    id: "ranking",
    group: "yesterday",
    title: "Club Lumière đã lên #1 BXH tuần",
    body: "Quán bạn yêu thích đang dẫn đầu bảng xếp hạng Hà Nội.",
    time: "Hôm qua",
    icon: Trophy,
    tone: "gold",
  },
  {
    id: "vip-points",
    group: "yesterday",
    title: "Bạn nhận 200 điểm thưởng VIP",
    body: "Tích luỹ đủ 1.000 điểm để lên hạng Gold.",
    time: "Hôm qua",
    action: "Xem quyền lợi",
    icon: Crown,
    tone: "vip",
  },
  {
    id: "coupon-expiring",
    group: "yesterday",
    title: "Mã “2+1 Combo phòng” sắp hết hạn",
    body: "Còn hiệu lực trong 2 giờ — dùng kẻo lỡ.",
    time: "Hôm qua",
    icon: Clock3,
    tone: "amber",
  },
];

const noticeToneStyle: Record<NoticeTone, { background: string; border: string; color: string }> = {
  gold: {
    background: "rgba(212,178,106,.12)",
    border: "rgba(212,178,106,.3)",
    color: "#e3c27e",
  },
  green: {
    background: "rgba(95,191,134,.12)",
    border: "rgba(95,191,134,.3)",
    color: "#7fd3a0",
  },
  amber: {
    background: "rgba(224,164,78,.12)",
    border: "rgba(224,164,78,.3)",
    color: "#e6b873",
  },
  vip: {
    background: "linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)",
    border: "rgba(212,178,106,.4)",
    color: "#241a0a",
  },
};

const revealTargetSelector = [
  ".nl-page-content > *",
  ".nl-page-content main > *",
  ".nl-page-content section",
  ".nl-page-content article",
  ".nl-page-content [data-scroll-reveal]",
  ".nl-page-content [class*='card']",
  ".nl-page-content [class*='panel']",
  ".nl-page-content [class*='grid'] > *",
  ".nl-page-content [class*='list'] > *",
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
  onClick,
}: {
  isMobile: boolean;
  isOpen: boolean;
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
      <i
        aria-hidden="true"
        style={{
          position: "absolute",
          top: isMobile ? "6px" : "7px",
          right: isMobile ? "8px" : "9px",
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "#e0729e",
          border: "2px solid #15131a",
          boxSizing: "content-box",
        }}
      />
    </button>
  );
}

function NotificationTabs({ isMobile }: { isMobile: boolean }) {
  const tabs = isMobile ? ["Tất cả", "Đặt chỗ", "Ưu đãi", "Sự kiện", "Hệ thống"] : ["Tất cả", "Đặt chỗ", "Ưu đãi", "Hệ thống"];

  return (
    <div
      style={{
        display: "flex",
        gap: "7px",
        padding: isMobile ? "0 16px 12px" : "0 16px 12px",
        overflowX: isMobile ? "auto" : "hidden",
        borderBottom: `1px solid rgba(255,255,255,.06)`,
        scrollbarWidth: "none",
      }}
    >
      {tabs.map((tab, index) => {
        const active = index === 0;
        return (
          <button
            key={tab}
            type="button"
            style={{
              flex: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "12px",
              fontWeight: active ? 700 : 600,
              color: active ? colors.onGold : colors.text2,
              background: active ? "linear-gradient(135deg,#f0dda8,#d4b26a)" : "rgba(255,255,255,.05)",
              border: active ? "0" : "1px solid rgba(255,255,255,.1)",
              borderRadius: "15px",
              padding: isMobile ? "7px 13px" : "6px 12px",
              fontFamily: "var(--nl-font-sans)",
              cursor: "pointer",
            }}
          >
            {tab}
            {active ? (
              <b
                style={{
                  background: colors.onGold,
                  color: colors.goldPale,
                  borderRadius: "7px",
                  fontSize: "9.5px",
                  fontWeight: 800,
                  lineHeight: 1.5,
                  padding: "0 5px",
                }}
              >
                3
              </b>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function NoticeRow({ notice, isMobile }: { notice: Notice; isMobile: boolean }) {
  const Icon = notice.icon;
  const tone = noticeToneStyle[notice.tone];

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        padding: "11px 16px",
        alignItems: "flex-start",
        background: notice.unread ? "rgba(212,178,106,.06)" : "transparent",
        borderBottom: "1px solid rgba(255,255,255,.05)",
        position: "relative",
      }}
    >
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
        <Icon size={isMobile ? 18 : 19} strokeWidth={notice.tone === "vip" ? 2 : 1.7} />
      </span>

      <div style={{ flex: 1, minWidth: 0, paddingRight: notice.unread ? "10px" : 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: isMobile ? "8px" : "10px" }}>
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
          <span style={{ fontSize: isMobile ? "10.5px" : "11px", color: "#6f6b62", flex: "none" }}>
            {notice.time}
          </span>
        </div>

        <div style={{ fontSize: "12px", color: colors.muted, marginTop: "3px", lineHeight: 1.45 }}>
          {notice.body}
        </div>

        {notice.action ? (
          <button
            type="button"
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
              cursor: "pointer",
            }}
          >
            {notice.action}
          </button>
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
    </div>
  );
}

function NoticeGroup({ label, group, isMobile }: { label: string; group: Notice["group"]; isMobile: boolean }) {
  const groupNotices = notices.filter((notice) => notice.group === group);
  const visibleNotices =
    group === "yesterday"
      ? groupNotices.filter((notice) =>
          isMobile ? notice.id !== "coupon-expiring" : notice.id === "coupon-expiring",
        )
      : groupNotices;

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
      {visibleNotices.map((notice) => (
        <NoticeRow key={notice.id} notice={notice} isMobile={isMobile} />
      ))}
    </>
  );
}

function DesktopNotificationDropdown() {
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
          background: "#16141b",
          borderLeft: "1px solid rgba(255,255,255,.08)",
          borderTop: "1px solid rgba(255,255,255,.08)",
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
          background: "#16141b",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: "16px",
          boxShadow: "0 30px 70px -24px rgba(0,0,0,.85)",
          overflow: "hidden",
          color: colors.text,
          fontFamily: "var(--nl-font-sans)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 12px" }}>
          <h2 id="notification-panel-title" style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: colors.text }}>
            Thông báo
          </h2>
          <button
            type="button"
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
              cursor: "pointer",
              padding: 0,
            }}
          >
            <CheckCheck size={14} strokeWidth={2.2} />
            Đánh dấu tất cả đã đọc
          </button>
        </div>

        <NotificationTabs isMobile={false} />
        <NoticeGroup label="Hôm nay" group="today" isMobile={false} />
        <NoticeGroup label="Trước đó" group="yesterday" isMobile={false} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
          <button
            type="button"
            style={{
              border: 0,
              padding: 0,
              background: "transparent",
              color: colors.goldPale,
              fontSize: "12.5px",
              fontWeight: 700,
              fontFamily: "var(--nl-font-sans)",
              cursor: "pointer",
            }}
          >
            Xem tất cả thông báo
          </button>
          <button
            type="button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              border: 0,
              padding: 0,
              background: "transparent",
              color: "#9b958a",
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

function MobileNotificationPanel({ onClose }: { onClose: () => void }) {
  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-notification-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        background: colors.bg,
        color: colors.text,
        fontFamily: "var(--nl-font-sans)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "calc(10px + env(safe-area-inset-top)) 14px 8px" }}>
        <button
          type="button"
          aria-label="Đóng thông báo"
          onClick={onClose}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,.12)",
            background: "transparent",
            color: colors.text,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
            cursor: "pointer",
          }}
        >
          <ChevronLeft size={17} strokeWidth={2} />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 id="mobile-notification-title" style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: colors.text }}>
            Thông báo
          </h2>
          <div style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "1.8px", color: colors.muted, textTransform: "uppercase", marginTop: "2px" }}>
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
            border: "1px solid rgba(255,255,255,.12)",
            background: "transparent",
            color: "#9b958a",
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

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px 8px", gap: "12px" }}>
        <span style={{ fontSize: "11.5px", color: "#9b958a" }}>
          <b style={{ color: colors.goldPale }}>3</b> thông báo chưa đọc
        </span>
        <button
          type="button"
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
            cursor: "pointer",
            padding: 0,
            whiteSpace: "nowrap",
          }}
        >
          <CheckCheck size={13} strokeWidth={2.2} />
          Đánh dấu đã đọc
        </button>
      </div>

      <NotificationTabs isMobile />

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: "calc(24px + env(safe-area-inset-bottom))" }}>
        <NoticeGroup label="Hôm nay" group="today" isMobile />
        <NoticeGroup label="Hôm qua" group="yesterday" isMobile />
      </div>
    </section>
  );
}

function NotificationOverlay({ isMobile, onClose }: { isMobile: boolean; onClose: () => void }) {
  return isMobile ? <MobileNotificationPanel onClose={onClose} /> : <DesktopNotificationDropdown />;
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const [isMobile, setIsMobile] = useState(false);
  const [shouldSimulate, setShouldSimulate] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const hideChrome = hiddenChromePaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const displayName = authUser?.displayName || authUser?.email?.split("@")[0] || "";
  const showCustomerNotifications = authUser?.role?.toUpperCase() === "USER";

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
    const updateAuthUser = () => setAuthUser(getAuthUser());
    updateAuthUser();
    window.addEventListener("focus", updateAuthUser);
    window.addEventListener("storage", updateAuthUser);
    return () => {
      window.removeEventListener("focus", updateAuthUser);
      window.removeEventListener("storage", updateAuthUser);
    };
  }, [pathname]);

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
      document
        .querySelectorAll<HTMLElement>("[style*='url(']")
        .forEach(checkElement);
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

    const previousOverflow = document.body.style.overflow;
    const onPointerDown = (event: PointerEvent) => {
      if (isMobile) return;
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

    if (isMobile) {
      document.body.style.overflow = "hidden";
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isMobile, isNotificationOpen]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || !("IntersectionObserver" in window)) return;

    const root = document.documentElement;
    const observed = new Set<HTMLElement>();
    let scanTimer: number | undefined;
    let lastScrollY = window.scrollY;
    let scrollDirection: "up" | "down" = "down";

    const updateScrollDirection = () => {
      const nextY = window.scrollY;
      scrollDirection = nextY < lastScrollY ? "up" : "down";
      lastScrollY = nextY;
      root.dataset.scrollDirection = scrollDirection;

      observed.forEach((element) => {
        if (!element.classList.contains("is-revealed")) {
          element.dataset.revealDir = scrollDirection;
        }
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          element.dataset.revealDir = scrollDirection;
          element.classList.toggle("is-revealed", entry.isIntersecting);
        });
      },
      {
        rootMargin: "-6% 0px -8% 0px",
        threshold: 0.12,
      },
    );

    const observeElement = (element: HTMLElement) => {
      if (observed.has(element) || !isRevealTarget(element)) return;

      element.classList.add("nl-scroll-reveal");
      element.dataset.revealDir = scrollDirection;
      element.style.setProperty("--nl-reveal-delay", `${Math.min(observed.size % 7, 6) * 38}ms`);
      observer.observe(element);
      observed.add(element);
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
      observer.disconnect();
      window.removeEventListener("scroll", updateScrollDirection);
      observed.forEach((element) => {
        element.classList.remove("nl-scroll-reveal", "is-revealed");
        element.style.removeProperty("--nl-reveal-delay");
        delete element.dataset.revealDir;
      });
    };
  }, [pathname]);

  if (shouldSimulate) return <MobileSimulator />;

  if (hideChrome) return <SystemFeedbackProvider>{children}</SystemFeedbackProvider>;

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
                letterSpacing: "3.6px",
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
              {navLinks.map((link) => (
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

            {/* Chat */}
            <SupportChatWidget
              isMobile={isMobile}
              isOpen={isChatOpen}
              onOpen={() => setIsNotificationOpen(false)}
              onOpenChange={setIsChatOpen}
            />

            {showCustomerNotifications ? (
              <NotificationBellButton
                isMobile={isMobile}
                isOpen={isNotificationOpen}
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

            {/* Chat */}
            <SupportChatWidget
              isMobile={isMobile}
              isOpen={isChatOpen}
              onOpen={() => setIsNotificationOpen(false)}
              onOpenChange={setIsChatOpen}
            />

            {showCustomerNotifications ? (
              <NotificationBellButton
                isMobile={isMobile}
                isOpen={isNotificationOpen}
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
                  background: "rgba(255,255,255,.04)",
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

      <div className="nl-page-content">{children}</div>

      {!isMobile ? (
        <footer
          className="nl-site-footer"
          style={{
            borderTop: `1px solid ${colors.borderGold12}`,
            background: colors.bg,
            color: colors.muted,
            padding: "34px",
            fontSize: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "24px",
            }}
          >
            <div>
              <div style={{ color: colors.goldPale, fontSize: "22px", fontWeight: 800 }}>
                Vietyoru
              </div>
              <div style={{ marginTop: "8px" }}>
                Vietnam Nightlife Guide · Dark Mode · Premium Gold
              </div>
            </div>
            <div
              style={{ display: "flex", gap: "18px", flexWrap: "wrap", justifyContent: "flex-end" }}
            >
              <Link href="/legal" style={{ color: colors.muted, textDecoration: "none" }}>
                Chính sách
              </Link>
              <Link href="/legal" style={{ color: colors.muted, textDecoration: "none" }}>
                Điều khoản
              </Link>
              <Link href="/dang-ky-doi-tac" style={{ color: colors.gold, textDecoration: "none" }}>
                Đăng ký đối tác
              </Link>
            </div>
          </div>
          <div
            style={{
              marginTop: "22px",
              borderTop: `1px solid ${colors.borderGold12}`,
              paddingTop: "18px",
            }}
          >
            © 2026 Vietyoru. Bảo lưu mọi quyền.
          </div>
        </footer>
      ) : null}

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
        {bottomNav.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                color: active ? colors.gold : "#6f6b62",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                minHeight: "54px",
                borderRadius: "14px",
                background: active ? "rgba(212,178,106,.1)" : "transparent",
                textDecoration: "none",
                fontSize: "9.5px",
                fontWeight: active ? 700 : 500,
                touchAction: "manipulation",
              }}
            >
              <Icon size={21} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {isNotificationOpen && typeof document !== "undefined"
        ? createPortal(
            <NotificationOverlay
              isMobile={isMobile}
              onClose={() => setIsNotificationOpen(false)}
            />,
            document.body,
          )
        : null}
      </div>
    </SystemFeedbackProvider>
  );
}
