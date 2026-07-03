"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { clearAuthSession } from '@/lib/auth/session';

type AdminNavItem = {
  icon: React.ReactNode;
  label: string;
  href: string;
  count?: number;
  countBg?: string;
  countColor?: string;
};

const navGroups: { title: string; items: AdminNavItem[] }[] = [
  {
    title: 'Tổng quan',
    items: [
      { 
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>, 
        label: 'Bảng điều khiển', 
        href: '/admin' 
      },
    ],
  },
  {
    title: 'Vận hành',
    items: [
      { 
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9h18M8 2.5v4M16 2.5v4M9 14l2 2 4-4"/></svg>, 
        label: 'Booking', 
        href: '/admin/bookings' 
      },
      { 
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h12v20l-3-2-3 2-3-2-3 2z"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>, 
        label: 'Duyệt hóa đơn', 
        href: '/admin/bills',
        count: 5,
        countBg: '#e0a44e',
        countColor: '#241a0a'
      },
      { 
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4z"/><path d="M15 6v12" strokeDasharray="2 2"/></svg>, 
        label: 'Coupon & QR', 
        href: '/admin/coupons' 
      },
    ],
  },
  {
    title: 'Danh mục',
    items: [
      { 
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1.5-5h15L21 9M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M3 9h18"/><path d="M9 20v-6h6v6"/></svg>, 
        label: 'Quán', 
        href: '/admin/stores' 
      },
      { 
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 6a3 3 0 0 1 0 6M18 20a5 5 0 0 0-3-4.6"/></svg>, 
        label: 'Cast', 
        href: '/admin/casts',
        count: 4,
        countBg: '#e0a44e',
        countColor: '#241a0a'
      },
      { 
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4a2 2 0 0 1 0-4h2M18 9h2a2 2 0 0 0 0-4h-2M6 4h12v5a6 6 0 0 1-12 0z"/><path d="M12 15v3M8.5 21h7M9.5 18h5"/></svg>, 
        label: 'Ranking', 
        href: '/admin/ranking' 
      },
    ],
  },
  {
    title: 'Nội dung',
    items: [
      { 
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l15-6v14l-15-6z"/><path d="M3 11v4a2 2 0 0 0 2 2h1M8 17v3"/></svg>, 
        label: 'Campaign & Blog', 
        href: '/admin/content' 
      },
      { 
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.8"/><path d="M4 17l4.5-4.5 3 3L16 10l4 5"/></svg>, 
        label: 'Thư viện media', 
        href: '/admin/media' 
      },
    ],
  },
  {
    title: 'Đối tác & hệ thống',
    items: [
      { 
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 10.5-2.3M17 8v6M20 11h-6"/></svg>, 
        label: 'Duyệt đối tác', 
        href: '/admin/partners',
        count: 3,
        countBg: '#e0729e',
        countColor: '#f3f0ea'
      },
      { 
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V4M20 20H4"/><path d="M8 16v-4M12 16V8M16 16v-6"/></svg>, 
        label: 'Báo cáo doanh thu', 
        href: '/admin/reports' 
      },
      { 
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z"/><path d="M9.5 12l1.8 1.8L15 10"/></svg>, 
        label: 'Phân quyền', 
        href: '/admin/roles' 
      },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  if (pathname === '/admin/dang-nhap') {
    return <>{children}</>;
  }

  const getPageInfo = () => {
    if (pathname === '/admin') return { title: 'Bảng điều khiển', subtitle: 'OVERVIEW' };
    if (pathname === '/admin/bookings') return { title: 'Booking', subtitle: 'BOOKING MANAGEMENT' };
    if (pathname === '/admin/bills') return { title: 'Duyệt hóa đơn', subtitle: 'BILL APPROVAL' };
    if (pathname === '/admin/coupons') return { title: 'Coupon & QR', subtitle: 'PROMOTIONS' };
    if (pathname === '/admin/stores') return { title: 'Quán', subtitle: 'VENUES' };
    if (pathname === '/admin/casts') return { title: 'Cast', subtitle: 'CAST PROFILES' };
    if (pathname === '/admin/ranking') return { title: 'Ranking', subtitle: 'RANKING' };
    if (pathname === '/admin/content') return { title: 'Campaign & Blog', subtitle: 'CONTENT' };
    if (pathname === '/admin/media') return { title: 'Thư viện media', subtitle: 'MEDIA' };
    if (pathname === '/admin/partners') return { title: 'Duyệt đối tác', subtitle: 'PARTNERS' };
    if (pathname === '/admin/reports') return { title: 'Báo cáo doanh thu', subtitle: 'REVENUE' };
    if (pathname === '/admin/roles') return { title: 'Phân quyền', subtitle: 'ROLES & PERMISSIONS' };
    return { title: 'Admin', subtitle: 'CMS' };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0c0c0f', color: '#f3f0ea', fontFamily: "'Inter', sans-serif", WebkitFontSmoothing: 'antialiased' }}>
      
      {/* ============ SIDEBAR ============ */}
      <aside className="scw" style={{ width: '250px', flex: 'none', position: 'sticky', top: 0, height: '100vh', overflow: 'auto', background: '#100f14', borderRight: '1px solid rgba(255,255,255,.06)', display: 'flex', flexDirection: 'column' }}>
        {/* brand */}
        <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '22px', lineHeight: 1, background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-.4px' }}>Vietyoru</div>
            <div style={{ fontSize: '7.5px', letterSpacing: '3px', color: '#8c8679', marginTop: '3px', textTransform: 'uppercase' }}>Admin Console · CMS</div>
          </div>
          <span style={{ fontSize: '8.5px', fontWeight: 700, letterSpacing: '1.5px', color: '#241a0a', background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', padding: '4px 8px', borderRadius: '6px' }}>ADMIN</span>
        </div>

        <nav style={{ flex: 1, padding: '6px 12px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navGroups.map(group => (
            <React.Fragment key={group.title}>
              <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '1.8px', color: '#57534b', textTransform: 'uppercase', padding: '12px 12px 6px' }}>
                {group.title}
              </div>
              {group.items.map(item => {
                const isActive = pathname === item.href;
                const isHovered = hoveredLink === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onMouseEnter={() => setHoveredLink(item.href)}
                    onMouseLeave={() => setHoveredLink(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '11px',
                      padding: '10px 12px',
                      borderRadius: '11px',
                      cursor: 'pointer',
                      color: isActive ? '#f3f0ea' : '#8c8679',
                      fontSize: '13.5px',
                      fontWeight: isActive ? 600 : 500,
                      background: isActive ? 'rgba(255,255,255,.08)' : (isHovered ? 'rgba(255,255,255,.04)' : 'transparent'),
                      textDecoration: 'none'
                    }}
                  >
                    {React.cloneElement(item.icon as React.ReactElement<{ color?: string }>, {
                      color: isActive ? '#d4b26a' : 'currentColor',
                    })}
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.count ? (
                      <span style={{ fontSize: '10px', fontWeight: 700, color: item.countColor, background: item.countBg, borderRadius: '9px', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                        {item.count}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </React.Fragment>
          ))}
        </nav>

        {/* account */}
        <div style={{ margin: '8px 12px 14px', padding: '11px 12px', borderRadius: '13px', background: 'rgba(255,255,255,.035)', border: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '34px', height: '34px', flex: 'none', borderRadius: '10px', background: 'linear-gradient(135deg,#f4e3b4,#b6924a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#241a0a', fontWeight: 800, fontSize: '14px' }}>A</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#f3f0ea', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Nguyễn Admin</div>
            <div style={{ fontSize: '10px', color: '#8c8679' }}>Super Admin</div>
          </div>
          <button onClick={() => { clearAuthSession(); window.location.href = '/admin/dang-nhap'; }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8c8679" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3"/></svg>
          </button>
        </div>
      </aside>

      {/* ============ MAIN ============ */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {/* topbar */}
        <header style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', gap: '18px', padding: '14px 26px', background: 'rgba(12,12,15,.86)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '1.8px', color: '#8c8679', textTransform: 'uppercase' }}>{subtitle}</div>
            <div style={{ fontSize: '19px', fontWeight: 700, color: '#f3f0ea', letterSpacing: '.1px', marginTop: '2px' }}>{title}</div>
          </div>
          <div style={{ flex: 1 }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '11px', padding: '9px 14px', width: '280px', maxWidth: '26vw' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8c8679" strokeWidth="1.9" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
            <input 
              type="text"
              placeholder="Tìm quán, cast, booking, bill…" 
              style={{ flex: 1, background: 'transparent', border: 'none', color: '#f3f0ea', fontSize: '13px', outline: 'none' }}
            />
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12.5px', color: '#c5c0b6', border: '1px solid rgba(212,178,106,.28)', borderRadius: '11px', padding: '8px 13px', fontWeight: 500, cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a86a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.2"/></svg>
            HN
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </span>
          <span style={{ position: 'relative', width: '39px', height: '39px', borderRadius: '50%', border: '1px solid rgba(212,178,106,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4b26a', cursor: 'pointer' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
            <span style={{ position: 'absolute', top: '8px', right: '9px', width: '7px', height: '7px', borderRadius: '50%', background: '#e0729e', border: '1.5px solid #0c0c0f' }}></span>
          </span>
        </header>

        {/* content */}
        <div className="scw" style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
