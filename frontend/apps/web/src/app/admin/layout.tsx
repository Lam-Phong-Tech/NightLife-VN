"use client";

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { logoutBrowserProfile } from '@/lib/api/auth';
import { getAuthUser } from '@/lib/auth/session';
import { apiClient } from '@/lib/api/client';
import { Calendar, Receipt, AlertTriangle, Users, UserCheck, Bell, Settings, CheckCheck, LucideIcon } from 'lucide-react';
import {
  adminTopbarFiltersVisibilityEvent,
  type AdminTopbarFiltersVisibilityDetail,
} from '@/lib/admin/topbar-filters';

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
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, 
        label: 'Chat hỗ trợ', 
        href: '/admin/support-chat',
        countBg: '#e0a44e',
        countColor: '#241a0a'
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
      { 
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="19" r="3"/><circle cx="18" cy="5" r="3"/><path d="M9 19h4.5a3.5 3.5 0 0 0 0-7h-3a3.5 3.5 0 0 1 0-7H15"/></svg>, 
        label: 'Tour', 
        href: '/admin/tours' 
      },
    ],
  },
  {
    title: 'Nội dung',
    items: [
      { 
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l15-6v14l-15-6z"/><path d="M3 11v4a2 2 0 0 0 2 2h1M8 17v3"/></svg>, 
        label: 'Nội dung trang chủ', 
        href: '/admin/content' 
      },
      {
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M3 9h18M9 21V9"/></svg>,
        label: 'Giao diện',
        href: '/admin/appearance'
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
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, 
        label: 'Tài khoản', 
        href: '/admin/roles' 
      },
      { 
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z"/><path d="M9.5 12l1.8 1.8L15 10"/></svg>, 
        label: 'Ma trận quyền', 
        href: '/admin/permissions' 
      },
      { 
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>, 
        label: 'Lịch sử thao tác (Audit Log)', 
        href: '/admin/audit-logs' 
      },
    ],
  },
];

function TopRegionFilter() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const city = searchParams.get('city') || '';
  const activeCity = city === 'Hanoi' || city === 'Ho Chi Minh City' || city === 'all' ? city : 'all';
  const [open, setOpen] = useState(false);

  const opts = [
    { v: 'all', label: 'Tất cả', short: 'Tất cả', sub: 'Tất cả tỉnh/thành phố Việt Nam' },
    { v: 'Hanoi', label: 'Hà Nội', short: 'HN', sub: 'Các quán tại Hà Nội' },
    { v: 'Ho Chi Minh City', label: 'TP. Hồ Chí Minh', short: 'HCM', sub: 'Các quán tại TP. HCM' }
  ];

  const curr = opts.find(o => o.v === activeCity) || opts[0]!;

  return (
    <div style={{ position: 'relative' }}>
      <div 
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12.5px', borderRadius: '11px', padding: '8px 13px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
          color: open ? '#f0dda8' : '#c5c0b6',
          border: open ? '1px solid rgba(212,178,106,.6)' : '1px solid rgba(212,178,106,.28)',
          background: open ? 'rgba(212,178,106,.1)' : 'rgba(255,255,255,.02)'
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a86a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.2"/></svg>
        {curr.short}
        <svg style={{ marginLeft: '4px', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </div>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: '#15141a', border: '1px solid rgba(212,178,106,.24)', borderRadius: '15px', zIndex: 100, width: '248px', boxShadow: '0 34px 70px -24px rgba(0,0,0,.9)', overflow: 'hidden' }}>
            <div style={{ padding: '12px 15px 9px', fontSize: '9.5px', fontWeight: 700, letterSpacing: '1.4px', color: '#8c8679', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
              Khu vực dữ liệu
            </div>
            {opts.map(o => {
              const isActive = activeCity === o.v;
              return (
                <div 
                  key={o.v}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('city', o.v);
                    router.push(pathname + '?' + params.toString());
                    setOpen(false);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '11px 15px', cursor: 'pointer', color: isActive ? '#f0dda8' : '#c5c0b6', background: isActive ? 'rgba(212,178,106,.08)' : 'transparent' }}
                  onMouseEnter={(e) => { if(!isActive) e.currentTarget.style.background = 'rgba(212,178,106,.07)'; }}
                  onMouseLeave={(e) => { if(!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}><path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.2"/></svg>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{o.label}</div>
                    <div style={{ fontSize: '10.5px', color: '#8c8679', marginTop: '1px' }}>{o.sub}</div>
                  </div>
                  {isActive && (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e3c27e" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  )}
                </div>
              );
            })}
            <div style={{ padding: '10px 15px', background: 'rgba(255,255,255,.02)', borderTop: '1px solid rgba(255,255,255,.05)', fontSize: '10px', color: '#8c8679', lineHeight: 1.5 }}>
              Số liệu &amp; danh sách trên trang admin lọc theo khu vực này.
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TopCategoryFilter() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || '';
  const [open, setOpen] = useState(false);

  const opts = [
    { v: '', l: 'Tất cả loại hình' },
    { v: 'BAR', l: 'Bar' },
    { v: 'CLUB', l: 'Club' },
    { v: 'LOUNGE', l: 'Lounge' },
    { v: 'GIRLS_BAR', l: 'Girls Bar' },
    { v: 'KARAOKE', l: 'Karaoke' },
    { v: 'MASSAGE_SPA', l: 'Massage/Spa' },
    { v: 'RESTAURANT', l: 'Restaurant' },
    { v: 'CASINO', l: 'Casino' }
  ];

  const curr = opts.find(o => o.v === category) || { v: '', l: 'Tất cả loại hình' };

  return (
    <div style={{ position: 'relative' }}>
      <div 
        onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(212,178,106,.28)', color: '#f3f0ea', fontSize: '12.5px', borderRadius: '11px', padding: '8px 12px 8px 10px', fontWeight: 600, cursor: 'pointer', background: 'rgba(255,255,255,.02)' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d4b26a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        <span>{curr.l}</span>
        <svg style={{ marginLeft: '4px', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8c8679" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </div>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: '#17161c', border: '1px solid rgba(255,255,255,.08)', borderRadius: '12px', padding: '6px', zIndex: 100, minWidth: '160px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.8)' }}>
            {opts.map(o => (
              <div 
                key={o.v}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  if (o.v) params.set('category', o.v);
                  else params.delete('category');
                  router.push(pathname + '?' + params.toString());
                  setOpen(false);
                }}
                style={{ padding: '9px 12px', fontSize: '13px', fontWeight: 500, color: category === o.v ? '#241a0a' : '#c5c0b6', background: category === o.v ? 'linear-gradient(135deg,#f0dda8,#d4b26a)' : 'transparent', borderRadius: '8px', cursor: 'pointer', marginBottom: '2px' }}
              >
                {o.l}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [badges, setBadges] = useState({ 
    pendingBills: 0, 
    pendingCasts: 0, 
    pendingPartners: 0,
    pendingChats: 0,
    notifications: [] as any[]
  });
  const [isMounted, setIsMounted] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [readAllTimestamp, setReadAllTimestamp] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<'all' | 'booking' | 'bill' | 'system'>('all');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isMobileSidebar, setIsMobileSidebar] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false,
  );
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [storageUsage, setStorageUsage] = useState<{ limit: number, used: number, percentage: number, isExceeded: boolean } | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hideTopbarFilters, setHideTopbarFilters] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? !window.matchMedia('(max-width: 767px)').matches : true,
  );

  useEffect(() => {
    const handleVisibilityChange = (event: Event) => {
      const detail = (event as CustomEvent<AdminTopbarFiltersVisibilityDetail>).detail;
      setHideTopbarFilters(Boolean(detail?.hidden));
    };

    window.addEventListener(adminTopbarFiltersVisibilityEvent, handleVisibilityChange);
    return () => window.removeEventListener(adminTopbarFiltersVisibilityEvent, handleVisibilityChange);
  }, []);

  const getNotificationItems = () => {
    const list: any[] = [];

    // System: VPS warnings
    if (storageUsage?.isExceeded) {
      list.push({
        id: 'sys-storage-exceeded',
        tag: 'SYS',
        kind: 'error',
        title: 'Dung lượng VPS đã đầy!',
        body: 'Hệ thống đang bị ngưng upload. Nhấp để xem chi tiết.',
        time: 'Hệ thống',
        category: 'system',
        action: 'Xem dung lượng',
        href: '/admin/system/storage',
        icon: AlertTriangle
      });
    } else if (storageUsage && storageUsage.percentage >= 90) {
      list.push({
        id: 'sys-storage-warning',
        tag: 'SYS',
        kind: 'warn',
        title: 'Dung lượng VPS sắp đầy!',
        body: `Đã sử dụng ${storageUsage.percentage}% dung lượng ổ đĩa.`,
        time: 'Hệ thống',
        category: 'system',
        action: 'Xem dung lượng',
        href: '/admin/system/storage',
        icon: AlertTriangle
      });
    }

    // Dynamic backend notifications (telegramLogs mapping)
    const logs = badges.notifications || [];
    logs.forEach((log) => {
      const key = log.templateKey;
      const createdAt = new Date(log.createdAt);
      const isToday = !Number.isNaN(createdAt.getTime()) && createdAt.toDateString() === new Date().toDateString();
      const timeStr = !Number.isNaN(createdAt.getTime()) 
        ? createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Vừa xong';

      let item: any = null;

      if (key === 'telegram.admin.booking.created.v1') {
        item = {
          id: log.id,
          tag: 'BK',
          kind: 'warn',
          title: 'Yêu cầu đặt bàn mới',
          body: `Khách đặt bàn tại ${log.booking?.store?.name || 'quán'} · ${log.booking?.partySize || 0} khách.`,
          time: timeStr,
          group: isToday ? 'today' : 'yesterday',
          category: 'booking',
          action: 'Xem lịch đặt',
          href: '/admin/bookings',
          icon: Calendar
        };
      } else if (key === 'telegram.admin.booking.cancelled.v1') {
        item = {
          id: log.id,
          tag: 'BK',
          kind: 'error',
          title: 'Lịch đặt đã hủy',
          body: `Lịch đặt #${log.booking?.id || ''} tại ${log.booking?.store?.name || 'quán'} đã hủy.`,
          time: timeStr,
          group: isToday ? 'today' : 'yesterday',
          category: 'booking',
          action: 'Xem lịch đặt',
          href: '/admin/bookings',
          icon: Calendar
        };
      } else if (key === 'telegram.admin.bill.submitted.v1') {
        item = {
          id: log.id,
          tag: 'BILL',
          kind: 'warn',
          title: 'Hóa đơn mới chờ duyệt',
          body: `Có hóa đơn mới tại ${log.bill?.store?.name || 'quán'} cần kiểm duyệt thanh toán.`,
          time: timeStr,
          group: isToday ? 'today' : 'yesterday',
          category: 'bill',
          action: 'Duyệt hóa đơn',
          href: '/admin/bills',
          icon: Receipt
        };
      } else if (key === 'telegram.admin.bill.verified.v1') {
        item = {
          id: log.id,
          tag: 'BILL',
          kind: 'success',
          title: 'Hóa đơn đã duyệt',
          body: `Hóa đơn #${log.bill?.id || ''} trị giá ${(log.bill?.totalVnd || 0).toLocaleString('vi-VN')}₫ đã được duyệt.`,
          time: timeStr,
          group: isToday ? 'today' : 'yesterday',
          category: 'bill',
          action: 'Xem hóa đơn',
          href: '/admin/bills',
          icon: Receipt
        };
      } else if (key === 'telegram.admin.bill.rejected.v1') {
        item = {
          id: log.id,
          tag: 'BILL',
          kind: 'error',
          title: 'Hóa đơn bị từ chối',
          body: `Hóa đơn #${log.bill?.id || ''} tại ${log.bill?.store?.name || 'quán'} bị từ chối.`,
          time: timeStr,
          group: isToday ? 'today' : 'yesterday',
          category: 'bill',
          action: 'Xem hóa đơn',
          href: '/admin/bills',
          icon: Receipt
        };
      } else if (key === 'telegram.admin.partner.requested.v1') {
        item = {
          id: log.id,
          tag: 'ĐT',
          kind: 'pink',
          title: 'Yêu cầu hợp tác mới',
          body: `Đối tác ${log.partnerRequest?.businessName || ''} (${log.partnerRequest?.storeCity === 'Hanoi' ? 'Hà Nội' : 'TP. HCM'}) đăng ký Join Us.`,
          time: timeStr,
          group: isToday ? 'today' : 'yesterday',
          category: 'system',
          action: 'Xem đối tác',
          href: '/admin/partners',
          icon: Users
        };
      }

      if (item) {
        item.createdAtStr = log.createdAt;
        list.push(item);
      }
    });

    if (list.length === 0) {
      if (badges.pendingBills > 0) {
        list.push({
          id: 'fallback-bill',
          tag: 'BILL',
          kind: 'warn',
          title: 'Hóa đơn chờ duyệt',
          body: `Bạn có ${badges.pendingBills} hóa đơn đang chờ kiểm duyệt.`,
          time: 'Mới nhận',
          group: 'today',
          category: 'bill',
          action: 'Duyệt hóa đơn',
          href: '/admin/bills',
          icon: Receipt,
          createdAtStr: null
        });
      }
      if (badges.pendingCasts > 0) {
        list.push({
          id: 'fallback-cast',
          tag: 'CAST',
          kind: 'gold',
          title: 'Cast chờ duyệt',
          body: `Có ${badges.pendingCasts} hồ sơ cast mới cần duyệt lý lịch.`,
          time: 'Mới nhận',
          group: 'today',
          category: 'system',
          action: 'Kiểm duyệt cast',
          href: '/admin/casts',
          icon: UserCheck,
          createdAtStr: null
        });
      }
      if (badges.pendingPartners > 0) {
        list.push({
          id: 'fallback-partner',
          tag: 'ĐT',
          kind: 'pink',
          title: 'Đối tác chờ duyệt',
          body: `Có ${badges.pendingPartners} đối tác đang chờ duyệt hợp tác.`,
          time: 'Mới nhận',
          group: 'today',
          category: 'system',
          action: 'Duyệt đối tác',
          href: '/admin/partners',
          icon: Users,
          createdAtStr: null
        });
      }
    }

    return list.map(item => {
      let isUnread = true;
      if (readNotificationIds.includes(item.id)) {
        isUnread = false;
      } else if (item.createdAtStr) {
        const itemTime = new Date(item.createdAtStr).getTime();
        if (!Number.isNaN(itemTime) && itemTime <= readAllTimestamp) {
          isUnread = false;
        }
      } else {
        if (readAllTimestamp > 0) {
          isUnread = false;
        }
      }
      return { ...item, isUnread };
    });
  };

  const markAsRead = (id: string) => {
    try {
      const email = currentUser?.email;
      
      if (email) {
        const key = `vy-read-notifications-${email}`;
        const readIds = localStorage.getItem(key);
        let next: string[] = [];
        if (readIds) {
          next = JSON.parse(readIds);
        }
        if (!next.includes(id)) {
          next.push(id);
          localStorage.setItem(key, JSON.stringify(next));
        }
      }
      
      const legacyKey = 'vy-read-notifications';
      const legacyReadIds = localStorage.getItem(legacyKey);
      let legacyNext: string[] = [];
      if (legacyReadIds) {
        legacyNext = JSON.parse(legacyReadIds);
      }
      if (!legacyNext.includes(id)) {
        legacyNext.push(id);
        localStorage.setItem(legacyKey, JSON.stringify(legacyNext));
      }

      setReadNotificationIds(prev => prev.includes(id) ? prev : [...prev, id]);
    } catch (e) {}
  };

  const markAllAsRead = () => {
    const now = Date.now();
    setReadAllTimestamp(now);
    try {
      const email = currentUser?.email;
      const currentIds = getNotificationItems().map(item => item.id);
      
      if (email) {
        localStorage.setItem(`vy-notifications-read-all-time-${email}`, String(now));
        const key = `vy-read-notifications-${email}`;
        const readIds = localStorage.getItem(key);
        let next: string[] = [];
        if (readIds) {
          next = JSON.parse(readIds);
        }
        const combined = Array.from(new Set([...next, ...currentIds]));
        localStorage.setItem(key, JSON.stringify(combined));
      }
      
      localStorage.setItem('vy-notifications-read-all-time', String(now));
      const legacyKey = 'vy-read-notifications';
      const legacyReadIds = localStorage.getItem(legacyKey);
      let legacyNext: string[] = [];
      if (legacyReadIds) {
        legacyNext = JSON.parse(legacyReadIds);
      }
      const combinedLegacy = Array.from(new Set([...legacyNext, ...currentIds]));
      localStorage.setItem(legacyKey, JSON.stringify(combinedLegacy));

      setReadNotificationIds(prev => Array.from(new Set([...prev, ...currentIds])));
    } catch (e) {}
  };

  const notificationItems = getNotificationItems();
  const unreadCount = notificationItems.filter(item => item.isUnread).length;
  const filters = [
    { key: 'all', label: 'Tất cả' },
    { key: 'booking', label: 'Đặt chỗ' },
    { key: 'bill', label: 'Hóa đơn' },
    { key: 'system', label: 'Hệ thống' }
  ];


  useEffect(() => {
    setIsMounted(true);
    try {
      const storedTheme = localStorage.getItem('vy-admin-theme') as 'light' | 'dark' | null;
      if (storedTheme) {
        setTheme(storedTheme);
        document.documentElement.classList.toggle('vy-admin-light', storedTheme === 'light');
      }
    } catch (e) {}
    const user = getAuthUser();
    if (user) setCurrentUser(user);
    if (user?.role === 'SUPER_ADMIN') {
      setIsSuperAdmin(true);
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    try {
      const email = currentUser?.email;
      const readIdsKey = email ? `vy-read-notifications-${email}` : 'vy-read-notifications';
      const readTimeKey = email ? `vy-notifications-read-all-time-${email}` : 'vy-notifications-read-all-time';

      const readIds = localStorage.getItem(readIdsKey);
      if (readIds) {
        setReadNotificationIds(JSON.parse(readIds));
      } else {
        const legacyReadIds = localStorage.getItem('vy-read-notifications');
        if (legacyReadIds) {
          setReadNotificationIds(JSON.parse(legacyReadIds));
        } else {
          setReadNotificationIds([]);
        }
      }

      const readTime = localStorage.getItem(readTimeKey);
      if (readTime) {
        setReadAllTimestamp(Number(readTime));
      } else {
        const legacyReadTime = localStorage.getItem('vy-notifications-read-all-time');
        if (legacyReadTime) {
          setReadAllTimestamp(Number(legacyReadTime));
        } else {
          setReadAllTimestamp(0);
        }
      }
    } catch (e) {}
  }, [isMounted, currentUser]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleSidebarModeChange = (event: MediaQueryListEvent) => {
      setIsMobileSidebar(event.matches);
      if (event.matches) setSidebarOpen(false);
    };

    mediaQuery.addEventListener('change', handleSidebarModeChange);
    return () => mediaQuery.removeEventListener('change', handleSidebarModeChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      localStorage.setItem('vy-admin-theme', nextTheme);
    } catch (e) {}
    document.documentElement.classList.toggle('vy-admin-light', nextTheme === 'light');
  };

  useEffect(() => {
    if (pathname === '/admin/dang-nhap') return;
    const fetchBadges = async () => {
      try {
        const data = await apiClient<any>('/admin/layout/badges');
        if (data) setBadges(data);
        
        try {
          const usage = await apiClient<{ data: any }>('/admin/system-config/storage/usage');
          if (usage && usage.data) {
            setStorageUsage(usage.data);
          }
        } catch (e) {
          // Ignore
        }
      } catch (err) {
        console.error(err);
      }
    };
    void fetchBadges();
  }, [pathname]);

  if (pathname === '/admin/dang-nhap') {
    return <>{children}</>;
  }

  const getPageInfo = () => {
    if (pathname === '/admin') return { title: 'Bảng điều khiển', subtitle: '' };
    if (pathname === '/admin/bookings') return { title: 'Booking', subtitle: '' };
    if (pathname === '/admin/support-chat') return { title: 'Chat hỗ trợ khách', subtitle: '' };
    if (pathname === '/admin/bills') return { title: 'Duyệt hóa đơn', subtitle: '' };
    if (pathname === '/admin/coupons') return { title: 'Coupon & QR', subtitle: '' };
    if (pathname === '/admin/stores') return { title: 'Quán', subtitle: '' };
    if (pathname === '/admin/casts') return { title: 'Cast', subtitle: '' };
    if (pathname === '/admin/ranking') return { title: 'Ranking', subtitle: '' };
    if (pathname === '/admin/content') return { title: 'Nội dung trang chủ', subtitle: 'CONTENT' };
    if (pathname === '/admin/partners') return { title: 'Duyệt đối tác', subtitle: 'PARTNERS' };

    if (pathname === '/admin/tours') return { title: 'Tour', subtitle: '' };
    if (pathname === '/admin/roles') return { title: 'Tài khoản', subtitle: 'ACCOUNTS' };
    if (pathname === '/admin/permissions') return { title: 'Ma trận quyền', subtitle: '' };
    return { title: 'Admin', subtitle: '' };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="nl-admin-shell" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0c0c0f', color: '#f3f0ea', fontFamily: "'Inter', sans-serif", WebkitFontSmoothing: 'antialiased' }}>
      
      {/* ============ SIDEBAR ============ */}
      {isMobileSidebar && sidebarOpen && (
        <button
          aria-label="Đóng menu admin"
          className="nl-admin-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          type="button"
        />
      )}
      <aside className={`scw nl-admin-sidebar ${sidebarOpen ? 'is-open' : 'is-closed'}`} style={{ width: sidebarOpen ? '250px' : '0px', flex: 'none', position: 'sticky', top: 0, height: '100vh', overflowX: 'hidden', overflowY: sidebarOpen ? 'auto' : 'hidden', background: '#100f14', borderRight: sidebarOpen ? '1px solid rgba(255,255,255,.06)' : 'none', transition: 'width 0.3s ease', display: 'flex', flexDirection: 'column' }}>
        <div className="nl-admin-sidebar-inner" style={{ width: '250px', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
          {/* brand */}
          <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div data-noinvert style={{ fontWeight: 800, fontSize: '22px', lineHeight: 1, background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-.4px' }}>Vietyoru</div>
              <div style={{ fontSize: '7.5px', letterSpacing: '3px', color: '#8c8679', marginTop: '3px', textTransform: 'uppercase' }}>Admin Console · CMS</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span data-noinvert style={{ fontSize: '8.5px', fontWeight: 700, letterSpacing: '1.5px', color: '#241a0a', background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', padding: '4px 8px', borderRadius: '6px' }}>ADMIN</span>
              <button
                aria-label="Đóng menu admin"
                className="nl-admin-sidebar-close"
                onClick={() => setSidebarOpen(false)}
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </div>

          <nav style={{ flex: 1, padding: '6px 12px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {([...navGroups, ...(isSuperAdmin ? [{
              title: 'Hệ thống (Super)',
              items: [
                {
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>,
                  label: 'Giới hạn VPS',
                  href: '/admin/system/storage'
                }
              ]
            }] : [])] as { title: string; items: AdminNavItem[] }[]).map(group => (
              <React.Fragment key={group.title}>
                <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '1.8px', color: '#57534b', textTransform: 'uppercase', padding: '12px 12px 6px' }}>
                  {group.title}
                </div>
                {group.items.map(item => {
                  const isActive = pathname === item.href;
                  const isHovered = hoveredLink === item.href;
                  let overrideCount = item.count;
                  if (item.href === '/admin/bills') overrideCount = badges.pendingBills || undefined;
                  if (item.href === '/admin/casts') overrideCount = badges.pendingCasts || undefined;
                  if (item.href === '/admin/partners') overrideCount = badges.pendingPartners || undefined;
                  if (item.href === '/admin/support-chat') overrideCount = badges.pendingChats || undefined;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => { if (isMobileSidebar) setSidebarOpen(false); }}
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
                      {overrideCount ? (
                        <span style={{ fontSize: '10px', fontWeight: 700, color: item.countColor, background: item.countBg, borderRadius: '9px', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                          {overrideCount}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </React.Fragment>
            ))}
          </nav>

          {/* storage usage */}
          {['SUPER_ADMIN', 'ADMIN', 'STAFF'].includes(currentUser?.role) && storageUsage && (
            <div style={{ margin: '0 12px 14px', padding: '14px 12px', borderRadius: '13px', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)' }}>
              <div style={{ fontSize: '12px', color: '#8c8679', marginBottom: '8px', lineHeight: 1.4 }}>
                Đã sử dụng <span style={{ color: '#f3f0ea', fontWeight: 600 }}>{storageUsage.used} GB</span> trong tổng số <span style={{ color: '#f3f0ea', fontWeight: 600 }}>{storageUsage.limit} GB</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: '12px' }}>
                <div style={{ height: '100%', width: `${Math.min(storageUsage.percentage, 100)}%`, background: storageUsage.isExceeded ? '#f44336' : (storageUsage.percentage >= 90 ? '#ff9800' : '#d4b26a'), borderRadius: '2px' }} />
              </div>
              <Link
                href="/admin/system/storage"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid rgba(212,178,106,0.3)',
                  color: '#d4b26a',
                  fontSize: '12px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  background: 'rgba(212,178,106,0.05)',
                  cursor: 'pointer'
                }}
              >
                Mua thêm bộ nhớ
              </Link>
            </div>
          )}

          {/* account */}
          <div style={{ margin: '8px 12px 14px', padding: '11px 12px', borderRadius: '13px', background: 'rgba(255,255,255,.035)', border: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span data-noinvert style={{ width: '34px', height: '34px', flex: 'none', borderRadius: '10px', background: 'linear-gradient(135deg,#f4e3b4,#b6924a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#241a0a', fontWeight: 800, fontSize: '14px' }}>
              {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'A'}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#f3f0ea', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser?.displayName || 'Admin'}
              </div>
              <div style={{ fontSize: '10px', color: '#8c8679' }}>
                {currentUser?.role === 'SUPER_ADMIN' ? 'Super Admin' : (currentUser?.role === 'ADMIN' ? 'Admin' : (currentUser?.role || 'Staff'))}
              </div>
            </div>
            <button onClick={async () => { await logoutBrowserProfile(); window.location.href = '/admin/dang-nhap'; }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8c8679" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3"/></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ============ MAIN ============ */}
      <div className="nl-admin-main" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {/* topbar */}
        <header className="nl-admin-topbar" style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', gap: '18px', padding: '14px 26px', background: 'rgba(12,12,15,.86)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <span className="nl-admin-menu-button" onClick={() => setSidebarOpen(!sidebarOpen)} title={sidebarOpen ? 'Ẩn menu' : 'Hiện menu'} style={{ width: '39px', height: '39px', flex: 'none', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#d4b26a', border: '1px solid rgba(212,178,106,.28)', transition: 'background 0.2s', background: 'rgba(255,255,255,.02)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </span>
          <div className="nl-admin-title" style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            {subtitle && <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '2px' }}>{subtitle}</div>}
            <div style={{ fontSize: '19px', fontWeight: 700, color: '#f3f0ea', letterSpacing: '.1px' }}>{title}</div>
          </div>
          
          <div className="nl-admin-topbar-spacer" style={{ flex: 1 }}></div>

          {!hideTopbarFilters && <div className="nl-admin-topbar-controls">
            {pathname !== '/admin/permissions' && pathname !== '/admin/ranking' && pathname !== '/admin/support-chat' && pathname !== '/admin/coupons' && pathname !== '/admin/bills' && (
              <React.Suspense fallback={<div />}>
                <TopCategoryFilter />
              </React.Suspense>
            )}

            {pathname !== '/admin/permissions' && pathname !== '/admin/support-chat' && pathname !== '/admin/coupons' && pathname !== '/admin/bills' && (
              <React.Suspense fallback={<div />}>
                <TopRegionFilter />
              </React.Suspense>
            )}
          </div>}
          
          <span onClick={toggleTheme} title={theme === 'light' ? 'Chuyển giao diện tối' : 'Chuyển giao diện sáng'} style={{ width: '39px', height: '39px', flex: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#d4b26a', border: '1px solid rgba(212,178,106,.28)', transition: 'background 0.2s' }}>
            {theme === 'dark' ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/></svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.5A8.3 8.3 0 0 1 9.5 4 8.3 8.3 0 1 0 20 14.5z"/></svg>
            )}
          </span>

          <div style={{ position: 'relative' }}>
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes vrise {
                from { opacity: 0; transform: translateY(8px); }
                to { opacity: 1; transform: translateY(0); }
              }
              @keyframes vpulse {
                0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(224, 114, 158, 0.7); }
                70% { transform: scale(1.08); box-shadow: 0 0 0 6px rgba(224, 114, 158, 0); }
                100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(224, 114, 158, 0); }
              }
              .nl-notice-list-scroll::-webkit-scrollbar {
                width: 6px;
              }
              .nl-notice-list-scroll::-webkit-scrollbar-track {
                background: transparent;
              }
              .nl-notice-list-scroll::-webkit-scrollbar-thumb {
                background: rgba(140, 134, 121, 0.35);
                border-radius: 4px;
              }
              .nl-notice-list-scroll::-webkit-scrollbar-thumb:hover {
                background: rgba(140, 134, 121, 0.55);
              }
              .nl-notice-list-scroll {
                scrollbar-width: thin;
                scrollbar-color: rgba(140, 134, 121, 0.35) transparent;
              }
            `}} />
            
            <span onClick={() => setShowNotifications(!showNotifications)} style={{ width: '39px', height: '39px', borderRadius: '50%', border: '1px solid rgba(212,178,106,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4b26a', cursor: 'pointer', background: 'rgba(255,255,255,.02)', position: 'relative' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
              {isMounted && unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '2px', right: '-2px', minWidth: '16px', height: '16px', borderRadius: '8px', background: '#e0729e', color: '#fff', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', border: '2px solid #0c0c0f', animation: 'vpulse 2.2s infinite' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </span>

            {showNotifications && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowNotifications(false)} />
                <div style={{
                  position: 'absolute',
                  top: '52px',
                  right: 0,
                  width: 'min(410px, calc(100vw - 32px))',
                  background: '#16141b',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  boxShadow: '0 20px 48px -10px rgba(0,0,0,0.85)',
                  zIndex: 100,
                  overflow: 'hidden',
                  fontFamily: 'inherit',
                  animation: 'vrise 0.2s ease-out'
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 16px 11px' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#f3f0ea' }}>Thông báo</h3>
                    <button
                      type="button"
                      onClick={() => markAllAsRead()}
                      disabled={unreadCount === 0}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        border: 0,
                        background: 'transparent',
                        color: '#d4b26a',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: unreadCount > 0 ? 'pointer' : 'default',
                        opacity: unreadCount > 0 ? 1 : 0.4,
                        padding: 0
                      }}
                    >
                      <CheckCheck size={13} strokeWidth={2.4} />
                      Đọc tất cả
                    </button>
                  </div>

                  {/* Filter chips */}
                  <div style={{ display: 'flex', gap: '8px', padding: '0 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto' }}>
                    {filters.map((f) => {
                      const count = f.key === 'all' 
                        ? notificationItems.filter(item => item.isUnread).length 
                        : notificationItems.filter(item => item.category === f.key && item.isUnread).length;
                      const isActive = activeFilter === f.key;
                      return (
                        <button
                          key={f.key}
                          type="button"
                          onClick={() => setActiveFilter(f.key as any)}
                          style={{
                            border: 0,
                            borderRadius: '8px',
                            padding: '6px 11px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s',
                            background: isActive ? 'rgba(212,178,106,.15)' : 'rgba(255,255,255,0.02)',
                            color: isActive ? '#f0dda8' : '#8c8679'
                          }}
                        >
                          {f.label}
                          {isMounted && count > 0 && (
                            <span style={{
                              background: isActive ? '#d4b26a' : 'rgba(255,255,255,0.08)',
                              color: isActive ? '#16141b' : '#8c8679',
                              borderRadius: '6px',
                              fontSize: '9px',
                              fontWeight: 800,
                              padding: '1px 5px',
                              lineHeight: 1.2
                            }}>
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Content List */}
                  <div className="nl-notice-list-scroll" style={{ maxHeight: '360px', overflowY: 'auto' }}>
                    {(() => {
                      const filtered = activeFilter === 'all' 
                        ? notificationItems 
                        : notificationItems.filter(item => item.category === activeFilter);

                      if (filtered.length === 0) {
                        return (
                          <div style={{ padding: '34px 20px', textAlign: 'center', color: '#8c8679' }}>
                            <Bell size={28} strokeWidth={1.5} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.5, color: '#d4b26a' }} />
                            <div style={{ fontSize: '13px', fontWeight: 600 }}>Không có thông báo mới</div>
                            <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>Hệ thống đang hoạt động ổn định.</div>
                          </div>
                        );
                      }

                      // Group notifications: Today vs Earlier
                      const today = filtered.filter(item => item.group === 'today' || !item.group);
                      const earlier = filtered.filter(item => item.group === 'yesterday');

                      const renderGroup = (label: string, items: any[]) => {
                        if (items.length === 0) return null;
                        return (
                          <>
                            <div style={{ fontSize: '9.5px', fontWeight: 800, letterSpacing: '1.2px', color: '#57534b', textTransform: 'uppercase', padding: '12px 16px 4px' }}>
                              {label}
                            </div>
                            {items.map((item) => {
                              const IconComponent = item.icon || Bell;
                              
                              let iconBg = 'rgba(212,178,106,.12)';
                              let iconBorder = 'rgba(212,178,106,.22)';
                              let iconColor = '#d9bd84';
                              if (item.kind === 'error') {
                                iconBg = 'rgba(244, 67, 54, 0.12)';
                                iconBorder = 'rgba(244, 67, 54, 0.24)';
                                iconColor = '#f44336';
                              } else if (item.kind === 'success') {
                                iconBg = 'rgba(76, 175, 80, 0.12)';
                                iconBorder = 'rgba(76, 175, 80, 0.24)';
                                iconColor = '#4caf50';
                              } else if (item.kind === 'pink') {
                                iconBg = 'rgba(224,114,158,.12)';
                                iconBorder = 'rgba(224,114,158,.24)';
                                iconColor = '#e79ab8';
                              } else if (item.kind === 'gold') {
                                iconBg = 'rgba(212,178,106,.15)';
                                iconBorder = 'rgba(212,178,106,.3)';
                                iconColor = '#e3c27e';
                              }

                              const isUnread = item.isUnread;

                              return (
                                <div
                                  key={item.id}
                                  onClick={() => {
                                    setShowNotifications(false);
                                    markAsRead(item.id);
                                    if (item.href) router.push(item.href);
                                  }}
                                  style={{
                                    display: 'flex',
                                    gap: '12px',
                                    padding: '11px 16px',
                                    alignItems: 'flex-start',
                                    background: isMounted && isUnread ? 'rgba(212,178,106,.05)' : 'transparent',
                                    borderBottom: '1px solid rgba(255,255,255,.05)',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'background 0.2s'
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.03)'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = isMounted && isUnread ? 'rgba(212,178,106,.05)' : 'transparent'; }}
                                >
                                  {/* Icon container */}
                                  <span style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '11px',
                                    flex: 'none',
                                    background: iconBg,
                                    border: `1px solid ${iconBorder}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: iconColor
                                  }}>
                                    <IconComponent size={17} strokeWidth={1.8} />
                                  </span>

                                  {/* Content info */}
                                  <div style={{ flex: 1, minWidth: 0, paddingRight: isUnread ? '10px' : 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'baseline' }}>
                                      <span style={{ fontSize: '13px', fontWeight: isUnread ? 700 : 600, color: isUnread ? '#f3f0ea' : '#c5c0b6', lineHeight: 1.35 }}>
                                        {item.title}
                                      </span>
                                      <span style={{ fontSize: '10.5px', color: '#6f6b62', flex: 'none' }}>
                                        {item.time}
                                      </span>
                                    </div>
                                    
                                    <div style={{ fontSize: '11.5px', color: '#8c8679', marginTop: '2.5px', lineHeight: 1.4 }}>
                                      {item.body}
                                    </div>

                                    {item.action && (
                                      <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        marginTop: '8px',
                                        fontSize: '10px',
                                        fontWeight: 800,
                                        color: '#d4b26a',
                                        background: 'rgba(212,178,106,.09)',
                                        border: '1px solid rgba(212,178,106,.22)',
                                        borderRadius: '7px',
                                        padding: '4px 9px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.4px'
                                      }}>
                                        {item.action}
                                      </span>
                                    )}
                                  </div>

                                  {/* Status indicator dot */}
                                  {isUnread && (
                                    <i style={{
                                      position: 'absolute',
                                      top: '14px',
                                      right: '14px',
                                      width: '7px',
                                      height: '7px',
                                      borderRadius: '50%',
                                      background: '#d4b26a',
                                      boxShadow: '0 0 5px #d4b26a'
                                    }} />
                                  )}
                                </div>
                              );
                            })}
                          </>
                        );
                      };

                      return (
                        <>
                          {renderGroup('Hôm nay', today)}
                          {renderGroup('Trước đó', earlier)}
                        </>
                      );
                    })()}
                  </div>

                  {/* Settings footer link */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderTop: '1px solid rgba(255,255,255,.055)', background: 'rgba(255,255,255,.01)' }}>
                    <span style={{ fontSize: '11.5px', color: '#6f6b62', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Settings size={12} />
                      Vận hành
                    </span>
                    <Link
                      href="/admin"
                      onClick={() => setShowNotifications(false)}
                      style={{ fontSize: '11.5px', fontWeight: 700, color: '#d4b26a', textDecoration: 'none' }}
                    >
                      Bảng điều khiển
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* content */}
        <div className="scw nl-admin-content-scroll" style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
