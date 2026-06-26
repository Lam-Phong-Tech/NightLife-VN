"use client";

import Link from 'next/link';
import {
  BarChart3,
  Bell,
  Building2,
  CalendarCheck,
  Camera,
  Handshake,
  Home,
  LogOut,
  Newspaper,
  ReceiptText,
  Search,
  ShieldCheck,
  Star,
  TicketPercent,
  Trophy,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { ApiError, apiClient } from '@/lib/api/client';
import { clearAuthSession } from '@/lib/auth/session';

const colors = {
  bg: '#0c0c0f',
  navBg: 'rgba(8,8,11,.92)',
  surface1: 'rgba(255,255,255,.035)',
  surface2: 'rgba(255,255,255,.04)',
  borderSoft: 'rgba(255,255,255,.06)',
  borderGold12: 'rgba(212,178,106,.18)',
  borderGold22: 'rgba(212,178,106,.22)',
  borderGold32: 'rgba(212,178,106,.32)',
  text: '#f3f0ea',
  text2: '#c5c0b6',
  muted: '#8c8679',
  onGold: '#241a0a',
  gold: '#d4b26a',
  goldBright: '#e3c27e',
  goldGrad: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)',
  neonPink: '#e0729e',
};

type AdminStore = {
  id: string;
  name: string;
  status: string;
};

type AdminBooking = {
  id: string;
  status: string;
  scheduledAt: string;
  partySize: number;
  store: { name: string };
  user?: { displayName: string | null } | null;
  guest?: { displayName: string | null; phone: string | null } | null;
};

type SensitiveBill = {
  id: string;
  billNumber: string | null;
  status: string;
  totalVnd: number | null;
  paidVnd: number | null;
  commissionAmountVnd: number | null;
  pointsEarned: number | null;
  submittedAt: string | null;
  store: { name: string };
  user?: { email: string; displayName: string | null; phone: string | null } | null;
  guest?: { email: string | null; displayName: string | null; phone: string | null } | null;
};

type AdminNavItem = {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  count?: string;
};

const navGroups: Array<{ title: string; items: AdminNavItem[] }> = [
  {
    title: 'Vận hành',
    items: [
      { icon: Home, label: 'Tổng quan', active: true },
      { icon: CalendarCheck, label: 'Đặt chỗ', count: '18' },
      { icon: ReceiptText, label: 'Duyệt hóa đơn', count: '7' },
      { icon: Handshake, label: 'Duyệt đối tác', count: '3' },
    ],
  },
  {
    title: 'Nội dung',
    items: [
      { icon: Building2, label: 'Quán / Địa điểm' },
      { icon: UsersRound, label: 'Cast' },
      { icon: Camera, label: 'Thư viện media' },
      { icon: TicketPercent, label: 'Campaign / Ưu đãi' },
      { icon: Newspaper, label: 'Blog / Nội dung' },
      { icon: Trophy, label: 'Xếp hạng thủ công' },
    ],
  },
  {
    title: 'Phân tích',
    items: [
      { icon: BarChart3, label: 'Báo cáo doanh thu' },
      { icon: Star, label: 'Membership & điểm' },
    ],
  },
];


const recentBookings = [
  ['Minh H.', 'Club Lumiere', '4', '21:30', 'Mới'],
  ['Yuki T.', 'KTV Hoàng Gia · Michi', '2', '20:00', 'Hoàn tất'],
  ['Tuấn A.', 'Sakura Lounge', '6', '22:00', 'Mới'],
  ['Kenji M.', 'Roppongi Night', '3', '23:00', 'Đã hủy'],
];

export default function AdminDashboardPage() {
  const [stores, setStores] = useState<AdminStore[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [sensitiveBills, setSensitiveBills] = useState<SensitiveBill[]>([]);
  const [statusMessage, setStatusMessage] = useState('Dang tai du lieu admin...');
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const loadAdminData = async () => {
    try {
      const [storeData, bookingData, billData] = await Promise.all([
        apiClient<AdminStore[]>('/partner/stores'),
        apiClient<AdminBooking[]>('/partner/bookings'),
        apiClient<SensitiveBill[]>('/admin/sensitive-bills'),
      ]);

      setStores(storeData);
      setBookings(bookingData);
      setSensitiveBills(billData);
      setStatusMessage('Admin dang xem va duyet du lieu nhay cam bang token ADMIN.');
    } catch (error) {
      if (error instanceof ApiError && [401, 403].includes(error.status)) {
        clearAuthSession();
        window.location.href = '/admin/dang-nhap?redirect=/admin';
        return;
      }

      setStatusMessage('Chua ket noi duoc backend. Kiem tra backend/NEXT_PUBLIC_API_URL.');
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadAdminData);
  }, []);

  const stats = useMemo(
    () => [
      { icon: Building2, label: 'Quan', value: String(stores.length), note: 'lay tu store scope admin' },
      { icon: UsersRound, label: 'Khach/booking', value: String(bookings.length), note: 'admin xem toan he thong' },
      { icon: CalendarCheck, label: 'Booking moi', value: String(bookings.filter((item) => item.status !== 'CANCELLED').length), note: 'can dieu phoi', hot: true },
      { icon: ReceiptText, label: 'Bill cho duyet', value: String(sensitiveBills.length), note: 'du lieu nhay cam', hot: true },
      {
        icon: BarChart3,
        label: 'Tong gia tri bill',
        value: `${Math.round(sensitiveBills.reduce((sum, item) => sum + (item.totalVnd ?? 0), 0) / 1000000)}tr`,
        note: 'tu sensitive-bills',
      },
    ],
    [bookings, sensitiveBills, stores.length],
  );

  const adminBookingRows = bookings.length
    ? bookings.slice(0, 5).map((booking) => [
        booking.user?.displayName ?? booking.guest?.displayName ?? booking.guest?.phone ?? 'Guest',
        booking.store.name,
        String(booking.partySize),
        new Date(booking.scheduledAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        booking.status,
      ])
    : recentBookings;

  const reviewBill = async (billId: string, approve: boolean) => {
    setReviewingId(billId);

    try {
      await apiClient(`/admin/sensitive-bills/${billId}/review`, {
        method: 'PATCH',
        data: approve ? { approve: true } : { approve: false, rejectReason: 'Rejected from admin dashboard' },
      });

      await loadAdminData();
    } finally {
      setReviewingId(null);
    }
  };

  const logout = () => {
    clearAuthSession();
    window.location.href = '/admin/dang-nhap';
  };

  return (
    <main style={{ minHeight: '100vh', background: colors.bg, color: colors.text, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'grid', gridTemplateColumns: '264px minmax(0,1fr)', minHeight: '100vh' }}>
        <aside
          style={{
            borderRight: `1px solid ${colors.borderGold12}`,
            background: colors.navBg,
            padding: '22px 16px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Link href="/" style={{ display: 'inline-flex', flexDirection: 'column', textDecoration: 'none', margin: '0 6px 24px' }}>
            <span style={{ fontSize: '25px', fontWeight: 800, background: colors.goldGrad, WebkitBackgroundClip: 'text', color: 'transparent' }}>
              Vietyoru
            </span>
            <span style={{ marginTop: '4px', fontSize: '8.5px', letterSpacing: '3.2px', color: colors.muted }}>ADMIN CMS</span>
          </Link>

          <div style={{ overflow: 'auto', paddingRight: '2px' }}>
            {navGroups.map((group) => (
              <div key={group.title} style={{ marginBottom: '12px' }}>
                <div style={{ padding: '8px 12px 6px', color: colors.muted, fontSize: '10px', fontWeight: 800, letterSpacing: '1.6px', textTransform: 'uppercase' }}>
                  {group.title}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      style={{
                        minHeight: '42px',
                        borderRadius: '12px',
                        padding: '0 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '11px',
                        color: item.active ? colors.onGold : colors.text2,
                        background: item.active ? colors.goldGrad : 'transparent',
                        fontSize: '13px',
                        fontWeight: item.active ? 800 : 600,
                        marginBottom: '4px',
                      }}
                    >
                      <Icon size={18} />
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {item.count ? (
                        <span
                          style={{
                            minWidth: '22px',
                            height: '20px',
                            borderRadius: '10px',
                            background: item.active ? colors.onGold : colors.neonPink,
                            color: item.active ? colors.goldBright : '#fff',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 800,
                          }}
                        >
                          {item.count}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', borderTop: `1px solid ${colors.borderGold12}`, paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: colors.goldGrad,
                color: colors.onGold,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
              }}
            >
              A
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: '13px', fontWeight: 700 }}>Admin Test</span>
              <span style={{ display: 'block', marginTop: '2px', fontSize: '11px', color: colors.muted }}>Quản trị viên</span>
            </span>
            <button type="button" onClick={logout} title="Đăng xuất" style={{ color: colors.gold, background: 'transparent', border: 0, cursor: 'pointer' }}>
              <LogOut size={18} />
            </button>
          </div>
        </aside>

        <section style={{ minWidth: 0 }}>
          <header
            style={{
              minHeight: '78px',
              borderBottom: `1px solid ${colors.borderGold12}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 30px',
            }}
          >
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.7px', color: colors.gold }}>ADMIN OVERVIEW</div>
              <h1 style={{ margin: '5px 0 0', fontSize: '24px', fontWeight: 700 }}>Tổng quan vận hành</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  height: '38px',
                  width: '310px',
                  borderRadius: '19px',
                  border: `1px solid ${colors.borderGold22}`,
                  background: colors.surface2,
                  color: colors.muted,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '9px',
                  padding: '0 13px',
                  fontSize: '12px',
                }}
              >
                <Search size={15} color={colors.gold} />
                Tìm quán, cast, booking...
              </span>
              <span style={{ position: 'relative', width: 38, height: 38, borderRadius: '50%', border: `1px solid ${colors.borderGold32}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: colors.gold, background: colors.surface2 }}>
                <Bell size={17} />
                <span style={{ position: 'absolute', top: 5, right: 5, width: 6, height: 6, borderRadius: '50%', background: colors.neonPink }} />
              </span>
            </div>
          </header>

          <div style={{ padding: '26px 30px 34px' }}>
            <div
              style={{
                border: `1px solid ${colors.borderGold22}`,
                borderRadius: '14px',
                background: 'rgba(212,178,106,.08)',
                color: colors.text2,
                padding: '13px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '14px',
                fontSize: '12.5px',
              }}
            >
              <ShieldCheck size={18} color={colors.gold} />
              Admin scope: <b style={{ color: colors.goldBright }}>{sensitiveBills.length} bill nhay cam</b>, <b style={{ color: colors.goldBright }}>{stores.length} quan</b>, <b style={{ color: colors.goldBright }}>{bookings.length} booking</b>. {statusMessage}
              <span style={{ marginLeft: 'auto', color: colors.gold, fontWeight: 800 }}>Xử lý ngay</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '14px' }}>
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <article key={stat.label} style={{ border: `1px solid ${colors.borderGold22}`, borderRadius: '16px', background: colors.surface1, padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.muted, fontSize: '12px' }}>
                      <Icon size={18} color={colors.gold} />
                      {stat.label}
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '30px', fontWeight: 800 }}>{stat.value}</div>
                    <div style={{ marginTop: '4px', color: stat.hot ? colors.neonPink : colors.goldBright, fontSize: '11.5px' }}>{stat.note}</div>
                  </article>
                );
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.45fr) minmax(340px,.55fr)', gap: '14px', marginTop: '14px' }}>
              <article style={{ border: `1px solid ${colors.borderGold22}`, borderRadius: '16px', background: colors.surface1, padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                  <div>
                    <h2 style={{ margin: 0, color: colors.text, fontSize: '21px', fontWeight: 600 }}>Doanh thu & hoa hồng 7 ngày</h2>
                    <div style={{ marginTop: '4px', fontSize: '9px', fontWeight: 600, letterSpacing: '1.6px', color: colors.muted }}>REVENUE & COMMISSION</div>
                  </div>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(212,178,106,.45), transparent)' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px', height: '220px' }}>
                  {[46, 62, 40, 74, 96, 88, 54].map((height, index) => (
                    <div key={index} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      <div style={{ width: '62%', height: `${Math.max(18, height * 0.38)}%`, background: 'rgba(212,178,106,.22)', borderRadius: '7px 7px 0 0' }} />
                      <div style={{ width: '100%', height: `${height}%`, background: index === 4 ? colors.goldGrad : 'rgba(212,178,106,.34)', borderRadius: '8px 8px 0 0' }} />
                      <span style={{ color: colors.muted, fontSize: '11px' }}>{['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][index]}</span>
                    </div>
                  ))}
                </div>
              </article>

              <article style={{ border: `1px solid ${colors.borderGold22}`, borderRadius: '16px', background: colors.surface1, padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ margin: 0, color: colors.text, fontSize: '21px', fontWeight: 600 }}>Top quán</h2>
                    <div style={{ marginTop: '4px', fontSize: '9px', fontWeight: 600, letterSpacing: '1.6px', color: colors.muted }}>BY BOOKINGS</div>
                  </div>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(212,178,106,.45), transparent)' }} />
                </div>
                {['Club Lumiere', 'KTV Hoàng Gia', 'Spa Hồng Ngọc', 'Sakura Lounge', 'Casino Diamond'].map((name, index) => (
                  <div key={name} style={{ display: 'grid', gridTemplateColumns: '32px 1fr auto', gap: '10px', alignItems: 'center', padding: '10px 0', borderBottom: index < 4 ? `1px solid ${colors.borderSoft}` : 0 }}>
                    <span style={{ width: 30, height: 30, borderRadius: 10, background: index === 0 ? colors.goldGrad : 'rgba(212,178,106,.12)', color: index === 0 ? colors.onGold : colors.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{index + 1}</span>
                    <span>
                      <span style={{ display: 'block', fontSize: '13px', fontWeight: 700 }}>{name}</span>
                      <span style={{ display: 'block', marginTop: 3, color: colors.muted, fontSize: '11px' }}>Hà Nội</span>
                    </span>
                    <span style={{ color: colors.goldBright, fontSize: '12px', fontWeight: 800 }}>{[312, 208, 210, 156, 89][index]}</span>
                  </div>
                ))}
              </article>
            </div>

            <article style={{ border: `1px solid ${colors.borderGold22}`, borderRadius: '16px', background: colors.surface1, overflow: 'hidden', marginTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px', borderBottom: `1px solid ${colors.borderSoft}` }}>
                <div>
                  <h2 style={{ margin: 0, color: colors.text, fontSize: '21px', fontWeight: 600 }}>Bill nhay cam cho duyet</h2>
                  <div style={{ marginTop: '4px', fontSize: '9px', fontWeight: 600, letterSpacing: '1.6px', color: colors.muted }}>ADMIN SENSITIVE REVIEW</div>
                </div>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(212,178,106,.45), transparent)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr .8fr .8fr 190px', padding: '12px 20px', color: colors.muted, fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', borderBottom: `1px solid ${colors.borderSoft}` }}>
                <span>Bill</span><span>Quan</span><span>Khach</span><span>Tong tien</span><span>Duyet</span>
              </div>
              {(sensitiveBills.length ? sensitiveBills : []).map((bill) => (
                <div key={bill.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr .8fr .8fr 190px', padding: '13px 20px', alignItems: 'center', borderBottom: `1px solid ${colors.borderSoft}`, fontSize: '13px', gap: '10px' }}>
                  <span style={{ fontWeight: 800, color: colors.gold }}>{bill.billNumber ?? bill.id.slice(0, 8)}</span>
                  <span>{bill.store.name}</span>
                  <span>{bill.user?.displayName ?? bill.guest?.displayName ?? bill.user?.email ?? bill.guest?.phone ?? 'Guest'}</span>
                  <span>{(bill.totalVnd ?? 0).toLocaleString('vi-VN')}đ</span>
                  <span style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" disabled={reviewingId === bill.id} onClick={() => reviewBill(bill.id, true)} style={{ border: 0, borderRadius: '9px', padding: '8px 10px', background: colors.goldGrad, color: colors.onGold, fontWeight: 800, cursor: 'pointer' }}>
                      Duyet
                    </button>
                    <button type="button" disabled={reviewingId === bill.id} onClick={() => reviewBill(bill.id, false)} style={{ border: `1px solid ${colors.borderGold22}`, borderRadius: '9px', padding: '8px 10px', background: colors.surface2, color: colors.neonPink, fontWeight: 800, cursor: 'pointer' }}>
                      Tu choi
                    </button>
                  </span>
                </div>
              ))}
              {!sensitiveBills.length ? (
                <div style={{ padding: '16px 20px', color: colors.muted, fontSize: '13px' }}>Khong co bill nhay cam dang cho duyet, hoac backend chua co du lieu seed.</div>
              ) : null}
            </article>

            <article style={{ border: `1px solid ${colors.borderGold22}`, borderRadius: '16px', background: colors.surface1, overflow: 'hidden', marginTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px', borderBottom: `1px solid ${colors.borderSoft}` }}>
                <div>
                  <h2 style={{ margin: 0, color: colors.text, fontSize: '21px', fontWeight: 600 }}>Yêu cầu đặt chỗ gần đây</h2>
                  <div style={{ marginTop: '4px', fontSize: '9px', fontWeight: 600, letterSpacing: '1.6px', color: colors.muted }}>RECENT BOOKINGS</div>
                </div>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(212,178,106,.45), transparent)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr .7fr .8fr .9fr', padding: '12px 20px', color: colors.muted, fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', borderBottom: `1px solid ${colors.borderSoft}` }}>
                <span>Khách</span><span>Quán / Cast</span><span>Số người</span><span>Khung giờ</span><span>Trạng thái</span>
              </div>
              {adminBookingRows.map(([guest, place, people, time, status]) => (
                <div key={`${guest}-${time}`} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr .7fr .8fr .9fr', padding: '13px 20px', alignItems: 'center', borderBottom: `1px solid ${colors.borderSoft}`, fontSize: '13px' }}>
                  <span style={{ fontWeight: 700 }}>{guest}</span>
                  <span>{place}</span>
                  <span>{people}</span>
                  <span>{time}</span>
                  <span>
                    <span style={{ borderRadius: '999px', padding: '4px 10px', color: status === 'Hoàn tất' ? colors.goldBright : status === 'Đã hủy' ? colors.neonPink : colors.onGold, background: status === 'Mới' ? colors.goldGrad : 'rgba(255,255,255,.05)', fontSize: '11px', fontWeight: 800 }}>
                      {status}
                    </span>
                  </span>
                </div>
              ))}
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
