"use client";

import Link from 'next/link';
import { CalendarDays, Home, Search, Ticket, UserRound } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const colors = {
  bg: '#0c0c0f',
  navBg: 'rgba(8,8,11,.95)',
  borderGold12: 'rgba(212,178,106,.18)',
  borderGold22: 'rgba(212,178,106,.22)',
  borderGold32: 'rgba(212,178,106,.32)',
  text: '#f3f0ea',
  text2: '#c5c0b6',
  muted: '#8c8679',
  onGold: '#241a0a',
  gold: '#d4b26a',
  goldPale: '#f0dda8',
  goldGrad: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)',
};

const hiddenChromePaths = [
  '/dang-nhap',
  '/dang-nhap-doi-tac',
  '/dang-ky-doi-tac',
  '/partner',
  '/admin',
];

const navLinks = [
  { href: '/', label: 'Trang chủ' },
  { href: '/danh-sach-quan', label: 'Tìm quán' },
  { href: '/danh-sach-cast', label: 'Cast' },
  { href: '/xep-hang', label: 'Bảng xếp hạng' },
  { href: '/blog', label: 'Blog' },
];

const bottomNav = [
  { href: '/', label: 'Trang chủ', icon: Home },
  { href: '/danh-sach-quan', label: 'Tìm quán', icon: Search },
  { href: '/uu-dai', label: 'Ưu đãi', icon: Ticket },
  { href: '/lich-su-dat-cho', label: 'Đặt chỗ', icon: CalendarDays },
  { href: '/tai-khoan', label: 'Tài khoản', icon: UserRound },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const [isMobile, setIsMobile] = useState(false);
  const hideChrome = hiddenChromePaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  if (hideChrome) return <>{children}</>;

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text, fontFamily: "'Inter', sans-serif" }}>
      <header
        className="nl-site-header"
        style={{
          minHeight: '82px',
          padding: isMobile ? '13px 18px 10px' : '18px 34px',
          borderBottom: `1px solid ${colors.borderGold12}`,
          background: colors.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: isMobile ? '10px' : '24px',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '34px', minWidth: 0 }}>
          <Link href="/" style={{ display: 'inline-flex', flexDirection: 'column', textDecoration: 'none', flex: 'none' }}>
            <span
              style={{
                fontSize: '26px',
                fontWeight: 800,
                lineHeight: 1,
                background: colors.goldGrad,
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Vietyoru
            </span>
            <span style={{ marginTop: '4px', fontSize: '8.5px', letterSpacing: '3.6px', color: colors.muted }}>
              VIETNAM NIGHTLIFE GUIDE
            </span>
          </Link>
          {!isMobile ? (
            <nav className="nl-site-nav-links" style={{ display: 'flex', gap: '22px', fontSize: '13px', color: colors.text2, fontWeight: 500 }}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{ color: isActive(pathname, link.href) ? colors.goldPale : colors.text2, textDecoration: 'none', whiteSpace: 'nowrap' }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>

        <div
          className="nl-site-actions"
          style={{
            width: isMobile ? '100%' : 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isMobile ? 'flex-end' : 'flex-start',
            gap: isMobile ? '8px' : '14px',
            flex: 'none',
          }}
        >
          <span
            style={{
              minHeight: isMobile ? '36px' : '38px',
              padding: isMobile ? '0 10px' : '0 11px',
              borderRadius: '19px',
              border: `1px solid ${colors.borderGold32}`,
              color: colors.gold,
              background: 'rgba(255,255,255,.04)',
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: isMobile ? '11.5px' : '12px',
              fontWeight: 700,
            }}
          >
            VI / JP
          </span>
          <Link href="/dang-nhap" style={{ color: colors.text2, fontSize: isMobile ? '12px' : '13px', fontWeight: 600, textDecoration: 'none' }}>
            Đăng nhập
          </Link>
          <Link
            href="/dang-ky-doi-tac"
            style={{
              minHeight: isMobile ? '36px' : '38px',
              borderRadius: '19px',
              padding: isMobile ? '0 12px' : '0 16px',
              background: colors.goldGrad,
              color: colors.onGold,
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: isMobile ? '12px' : '13px',
              fontWeight: 800,
              textDecoration: 'none',
            }}
          >
            Đăng ký đối tác
          </Link>
        </div>
      </header>

      <div className="nl-page-content">{children}</div>

      {!isMobile ? (
        <footer
          className="nl-site-footer"
          style={{
            borderTop: `1px solid ${colors.borderGold12}`,
            background: colors.bg,
            color: colors.muted,
            padding: '34px',
            fontSize: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
            <div>
              <div style={{ color: colors.goldPale, fontSize: '22px', fontWeight: 800 }}>Vietyoru</div>
              <div style={{ marginTop: '8px' }}>Vietnam Nightlife Guide · Dark Mode · Premium Gold</div>
            </div>
            <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Link href="/legal" style={{ color: colors.muted, textDecoration: 'none' }}>Chính sách</Link>
              <Link href="/legal" style={{ color: colors.muted, textDecoration: 'none' }}>Điều khoản</Link>
              <Link href="/dang-ky-doi-tac" style={{ color: colors.gold, textDecoration: 'none' }}>Đăng ký đối tác</Link>
            </div>
          </div>
          <div style={{ marginTop: '22px', borderTop: `1px solid ${colors.borderGold12}`, paddingTop: '18px' }}>
            © 2026 Vietyoru. Bảo lưu mọi quyền.
          </div>
        </footer>
      ) : null}

      {isMobile ? (
        <nav
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 60,
            height: '66px',
            background: colors.navBg,
            borderTop: `1px solid ${colors.borderGold22}`,
            display: 'grid',
            gridTemplateColumns: 'repeat(5,1fr)',
            alignItems: 'center',
            paddingBottom: '6px',
            backdropFilter: 'blur(16px)',
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
                  color: active ? colors.gold : '#6f6b62',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none',
                  fontSize: '9.5px',
                  fontWeight: active ? 700 : 500,
                }}
              >
                <Icon size={21} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
