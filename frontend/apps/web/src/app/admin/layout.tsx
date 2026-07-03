"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Bell,
  Building2,
  CalendarCheck,
  Camera,
  ChevronDown,
  Handshake,
  Home,
  LogOut,
  MapPin,
  Newspaper,
  Plus,
  RefreshCcw,
  ReceiptText,
  ShieldCheck,
  Star,
  TicketPercent,
  Trophy,
  UsersRound,
} from 'lucide-react';
import React from 'react';
import { clearAuthSession } from '@/lib/auth/session';

const colors = {
  bg: '#0f0f13',
  navBg: '#131318',
  surface1: '#18181f',
  surface2: '#202028',
  borderSoft: 'rgba(255,255,255,.05)',
  borderGold12: 'rgba(212,178,106,.12)',
  borderGold22: 'rgba(212,178,106,.22)',
  text: '#f3f0ea',
  text2: '#c5c0b6',
  muted: '#8c8679',
  onGold: '#241a0a',
  gold: '#d4b26a',
  goldBright: '#e3c27e',
  goldGrad: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)',
  neonPink: '#e0729e',
  green: '#4ade80',
  greenBg: 'rgba(74,222,128,0.1)',
  red: '#f87171',
  redBg: 'rgba(248,113,113,0.1)',
  blue: '#60a5fa',
  blueBg: 'rgba(96,165,250,0.1)',
};

type AdminNavItem = {
  icon: any;
  label: string;
  href: string;
  count?: number;
  alert?: boolean;
};

const navGroups: { title: string; items: AdminNavItem[] }[] = [
  {
    title: 'TỔNG QUAN',
    items: [
      { icon: Home, label: 'Bảng điều khiển', href: '/admin' },
    ],
  },
  {
    title: 'VẬN HÀNH',
    items: [
      { icon: CalendarCheck, label: 'Booking', href: '/admin/bookings' },
      { icon: ReceiptText, label: 'Duyệt hóa đơn', href: '/admin/bills' },
      { icon: TicketPercent, label: 'Coupon & QR', href: '/admin/coupons' },
    ],
  },
  {
    title: 'DANH MỤC',
    items: [
      { icon: Building2, label: 'Quán', href: '/admin/stores' },
      { icon: UsersRound, label: 'Cast', href: '/admin/casts' },
      { icon: Trophy, label: 'Ranking', href: '/admin/ranking' },
    ],
  },
  {
    title: 'NỘI DUNG',
    items: [
      { icon: TicketPercent, label: 'Campaign & Blog', href: '/admin/content' },
      { icon: Camera, label: 'Thư viện media', href: '/admin/media' },
    ],
  },
  {
    title: 'ĐỐI TÁC & HỆ THỐNG',
    items: [
      { icon: Handshake, label: 'Duyệt đối tác', href: '/admin/partners' },
      { icon: BarChart3, label: 'Báo cáo doanh thu', href: '/admin/reports', count: 0 },
      { icon: ShieldCheck, label: 'Phân quyền', href: '/admin/roles', count: 0 },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const logout = () => {
    clearAuthSession();
    window.location.href = '/admin/dang-nhap';
  };

  const getPageInfo = () => {
    if (pathname === '/admin') return { title: 'Bảng điều khiển', subtitle: 'OVERVIEW' };
    if (pathname === '/admin/bookings') return { title: 'Quản lý Booking', subtitle: 'BOOKING MANAGEMENT' };
    if (pathname === '/admin/bills') return { title: 'Duyệt hóa đơn', subtitle: 'BILL APPROVAL' };
    if (pathname === '/admin/coupons') return { title: 'Coupon & QR', subtitle: 'PROMOTIONS' };
    if (pathname === '/admin/stores') return { title: 'Quản lý Quán', subtitle: 'VENUES' };
    if (pathname === '/admin/casts') return { title: 'Quản lý Cast', subtitle: 'CAST PROFILES' };
    if (pathname === '/admin/ranking') return { title: 'Điều khiển Ranking', subtitle: 'RANKING' };
    if (pathname === '/admin/content') return { title: 'Campaign & Blog', subtitle: 'CONTENT' };
    if (pathname === '/admin/media') return { title: 'Thư viện media', subtitle: 'MEDIA' };
    if (pathname === '/admin/partners') return { title: 'Duyệt đối tác', subtitle: 'PARTNERS' };
    if (pathname === '/admin/reports') return { title: 'Báo cáo doanh thu', subtitle: 'REVENUE' };
    if (pathname === '/admin/roles') return { title: 'Phân quyền', subtitle: 'ROLES & PERMISSIONS' };
    return { title: 'Admin', subtitle: 'CMS' };
  };

  const { title, subtitle } = getPageInfo();

  if (pathname === '/admin/dang-nhap') {
    return <>{children}</>;
  }

  return (
    <main style={{ height: '100vh', background: colors.bg, color: colors.text, fontFamily: "var(--nl-font-sans)" }}>
      <div style={{ display: 'grid', gridTemplateColumns: '264px minmax(0,1fr)', height: '100vh' }}>
        {/* SIDEBAR */}
        <aside
          style={{
            borderRight: `1px solid ${colors.borderSoft}`,
            background: colors.navBg,
            padding: '22px 16px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Link href="/admin" style={{ display: 'inline-flex', flexDirection: 'column', textDecoration: 'none', margin: '0 6px 32px' }}>
            <span style={{ fontSize: '26px', fontWeight: 800, background: colors.goldGrad, WebkitBackgroundClip: 'text', color: 'transparent' }}>
              Vietyoru
            </span>
            <span style={{ marginTop: '2px', fontSize: '9px', letterSpacing: '4px', color: colors.muted }}>ADMIN CONSOLE · CMS</span>
          </Link>

          <div style={{ overflow: 'auto', paddingRight: '2px', flex: 1 }}>
            {navGroups.map((group) => (
              <div key={group.title} style={{ marginBottom: '24px' }}>
                <div style={{ padding: '0 12px 10px', color: colors.muted, fontSize: '11px', fontWeight: 700, letterSpacing: '1px' }}>
                  {group.title}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      style={{
                        minHeight: '44px',
                        borderRadius: '12px',
                        padding: '0 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        color: isActive ? colors.onGold : colors.text2,
                        background: isActive ? colors.goldGrad : 'transparent',
                        fontSize: '14px',
                        fontWeight: isActive ? 700 : 500,
                        marginBottom: '4px',
                        cursor: 'pointer',
                        border: isActive ? 'none' : `1px solid transparent`,
                        transition: 'background 0.2s',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = colors.surface1;
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {(item.count ?? 0) > 0 ? (
                        <span
                          style={{
                            minWidth: '24px',
                            height: '24px',
                            borderRadius: '12px',
                            background: isActive ? colors.onGold : (item.alert ? colors.gold : colors.surface2),
                            color: isActive ? colors.goldBright : (item.alert ? colors.onGold : colors.muted),
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 800,
                          }}
                        >
                          {item.count}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: colors.goldGrad,
                color: colors.onGold,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '18px'
              }}
            >
              A
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: colors.text }}>Nguyễn Admin</span>
              <span style={{ display: 'block', marginTop: '2px', fontSize: '12px', color: colors.muted }}>Super Admin</span>
            </span>
            <button type="button" onClick={logout} title="Đăng xuất" style={{ color: colors.muted, background: 'transparent', border: 0, cursor: 'pointer' }}>
              <LogOut size={20} />
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <section style={{ minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* HEADER */}
          <header
            style={{
              flexShrink: 0,
              height: '80px',
              borderBottom: `1px solid ${colors.borderSoft}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 40px',
              background: colors.bg,
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', color: colors.muted }}>{subtitle}</div>
              <h1 style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: 700, color: colors.text }}>{title}</h1>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Location */}
              <div style={{ 
                height: '40px', 
                borderRadius: '20px', 
                border: `1px solid ${colors.borderSoft}`, 
                background: colors.surface1, 
                display: 'flex', 
                alignItems: 'center', 
                padding: '0 16px', 
                gap: '8px',
                cursor: 'pointer'
              }}>
                <MapPin size={16} color={colors.muted} />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>HN</span>
                <ChevronDown size={14} color={colors.muted} />
              </div>

              {/* Telegram Status */}
              <div style={{ 
                height: '40px', 
                borderRadius: '20px', 
                border: `1px solid ${colors.borderSoft}`, 
                background: colors.surface1, 
                display: 'flex', 
                alignItems: 'center', 
                padding: '0 16px', 
                gap: '8px',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.green, boxShadow: `0 0 10px ${colors.green}` }}></div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: colors.green }}>Telegram Online</span>
              </div>

              {/* Notification */}
              <div style={{ position: 'relative', width: 40, height: 40, borderRadius: '50%', border: `1px solid ${colors.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.muted, background: colors.surface1, cursor: 'pointer' }}>
                <Bell size={18} />
                <span style={{ position: 'absolute', top: 10, right: 10, width: 6, height: 6, borderRadius: '50%', background: colors.red }} />
              </div>
            </div>
          </header>

          <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
