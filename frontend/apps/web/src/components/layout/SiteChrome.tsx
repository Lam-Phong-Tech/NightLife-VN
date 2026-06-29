"use client";

import Link from "next/link";
import { CalendarDays, Home, Search, Ticket, UserRound, MessageCircle, LogIn } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getAuthUser, type AuthUser } from "@/lib/auth/session";
import { LanguagePicker } from "./LanguagePicker";
import { MobileSimulator } from "./MobileSimulator";

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
  "/danh-sach-quan",
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

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const [isMobile, setIsMobile] = useState(false);
  const [shouldSimulate, setShouldSimulate] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const hideChrome = hiddenChromePaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const displayName = authUser?.displayName || authUser?.email?.split("@")[0] || "";

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

  if (hideChrome) return <>{children}</>;

  return (
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
            flex: "none",
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              flexDirection: "column",
              textDecoration: "none",
              flex: "none",
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
            <Link
              href="#"
              style={{
                minHeight: "36px",
                width: "36px",
                borderRadius: "18px",
                border: `1px solid ${colors.borderGold32}`,
                color: colors.gold,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                textDecoration: "none",
              }}
            >
              <MessageCircle size={16} />
            </Link>

            {/* Login / User */}
            <Link
              href={authUser ? "/tai-khoan" : "/dang-nhap"}
              style={{
                minHeight: "36px",
                width: "36px",
                borderRadius: "18px",
                border: `1px solid ${colors.borderGold32}`,
                color: colors.gold,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                textDecoration: "none",
              }}
            >
              {authUser ? <UserRound size={16} /> : <LogIn size={16} />}
            </Link>
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
            <Link
              href="#"
              style={{
                minHeight: "40px",
                width: "40px",
                borderRadius: "20px",
                border: `1px solid ${colors.borderGold32}`,
                color: colors.gold,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,.04)",
                textDecoration: "none",
              }}
            >
              <MessageCircle size={18} />
            </Link>

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
    </div>
  );
}
