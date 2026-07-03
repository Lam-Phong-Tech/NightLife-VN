"use client";

import { Download, Building2, CalendarCheck, ReceiptText, Handshake, UsersRound, MessageCircle, TicketPercent } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { apiClient } from '@/lib/api/client';
import { clearAuthSession } from '@/lib/auth/session';

const colors = {
  surface1: '#18181f',
  surface2: '#202028',
  borderSoft: 'rgba(255,255,255,.05)',
  borderGold12: 'rgba(212,178,106,.12)',
  borderGold22: 'rgba(104, 79, 25, 0.22)',
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

type AdminDashboardStats = {
  activeStores: number;
  activeStoresHn?: number;
  activeStoresHcm?: number;
  totalCasts: number;
  totalContents?: number;
  pendingCasts?: number;
  todaysBookings: number;
  todaysBookingsCompleted?: number;
  todaysBookingsNew?: number;
  pendingBills: number;
  pendingBillsAmount?: number;
  monthlyRevenue: number;
  commissionAmount?: number;
  pendingPartners: number;
  revenue7Days: { date: string; revenue: number }[];
  recentBookings: {
    id: string;
    scheduledAt: string;
    status: string;
    partySize: number;
    store: { id: string; name: string };
    cast: { id: string; stageName: string } | null;
    customerName: string;
    customerEmail: string;
  }[];
  telegramLogs: {
    id: string;
    templateKey: string | null;
    recipient: string;
    status: string;
    createdAt: string;
    payload: any;
  }[];
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(0);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const timeframeMap = ['today', 'week', 'month'];
      const tf = timeframeMap[activeFilter];
      const data = await apiClient<AdminDashboardStats>(`/admin/dashboard/stats?timeframe=${tf}`);
      setStats(data);
    } catch (error) {
      console.error(error);
      if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
        clearAuthSession();
        window.location.href = '/admin/dang-nhap';
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadStats();
  }, [activeFilter]);

  const formatVnd = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(0)}M₫`;
    return `${val.toLocaleString('vi-VN')}₫`;
  };

  const formatDateStr = () => {
    const d = new Date();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return `${days[d.getDay()]} - ${d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
  };

  const labelMap = ['hôm nay', 'tuần này', 'tháng này'];
  const lbl = labelMap[activeFilter];

  return (
    <div style={{ padding: '24px 26px 40px' }}>
      {/* HERO SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Chào buổi tối, Admin <span style={{ color: colors.gold }}>🌙</span>
          </h2>
          <p style={{ color: colors.muted, margin: 0, fontSize: '14px' }}>
            {formatDateStr()} - Có <strong style={{ color: colors.gold }}>{stats?.pendingBills ?? 5} hóa đơn</strong> và <strong style={{ color: colors.gold }}>{stats?.pendingPartners ?? 3} đối tác</strong> đang chờ bạn xử lý.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: colors.surface1, borderRadius: '8px', padding: '4px', border: `1px solid ${colors.borderSoft}` }}>
            {['Hôm nay', 'Tuần', 'Tháng'].map((t, i) => (
              <button 
                key={t} 
                onClick={() => setActiveFilter(i)}
                style={{
                  background: activeFilter === i ? colors.goldGrad : 'transparent',
                  color: activeFilter === i ? colors.onGold : colors.muted,
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: activeFilter === i ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: colors.goldGrad,
            color: colors.onGold,
            border: 'none',
            padding: '0 20px',
            height: '40px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer'
          }}>
            <Download size={16} />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* TOP CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {/* Card 1 */}
        <div style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '10px', background: colors.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} color={colors.muted} />
            </div>
            <span style={{ color: colors.green, fontSize: '13px', fontWeight: 600 }}>+2</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '4px' }}>{stats?.activeStores ?? 24}</div>
          <div style={{ fontSize: '13px', color: colors.muted, fontWeight: 500 }}>Quán hoạt động<br/>HN {stats?.activeStoresHn ?? 15} · HCM {stats?.activeStoresHcm ?? 9}</div>
        </div>
        
        {/* Card 2 */}
        <div style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '10px', background: colors.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UsersRound size={20} color={colors.muted} />
            </div>
            <span style={{ color: colors.gold, fontSize: '13px', fontWeight: 600 }}>{stats?.pendingCasts ?? 4} chờ</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '4px' }}>{stats?.totalCasts ?? 86}</div>
          <div style={{ fontSize: '13px', color: colors.muted, fontWeight: 500 }}>Cast<br/>{stats?.pendingCasts ?? 4} chờ kiểm duyệt</div>
        </div>

        {/* Card 3 */}
        <div style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '10px', background: colors.blueBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarCheck size={20} color={colors.blue} />
            </div>
            <span style={{ color: colors.green, fontSize: '13px', fontWeight: 600 }}></span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '4px' }}>{stats?.todaysBookings ?? 12}</div>
          <div style={{ fontSize: '13px', color: colors.muted, fontWeight: 500 }}>Booking {lbl}<br/>{stats?.todaysBookingsCompleted ?? 9} hoàn tất · {stats?.todaysBookingsNew ?? 3} mới</div>
        </div>

        {/* Card 4 - Highlight */}
        <div style={{ background: 'rgba(212,178,106,.05)', border: `1px solid ${colors.borderGold22}`, borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(212,178,106,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ReceiptText size={20} color={colors.gold} />
            </div>
            <span style={{ background: colors.gold, color: colors.onGold, fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', height: 'fit-content' }}>CHỜ</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '4px', color: colors.gold }}>{stats?.pendingBills ?? 5}</div>
          <div style={{ fontSize: '13px', color: colors.gold, fontWeight: 500 }}>Hóa đơn chờ duyệt<br/>≈ {stats ? formatVnd(stats.pendingBillsAmount || 0) : '48.200.000₫'}</div>
        </div>

        {/* Card 5 */}
        <div style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '10px', background: colors.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '20px', color: colors.muted }}>$</span>
            </div>
            <span style={{ color: colors.green, fontSize: '13px', fontWeight: 600 }}></span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '4px' }}>
            {stats ? formatVnd(stats.monthlyRevenue) : '312M₫'}
          </div>
          <div style={{ fontSize: '13px', color: colors.muted, fontWeight: 500 }}>Doanh thu {lbl}<br/>Hoa hồng {stats ? formatVnd(stats.commissionAmount || 0) : '41.8M₫'}</div>
        </div>

        {/* Card 6 */}
        <div style={{ background: 'rgba(224,114,158,.06)', border: `1px solid rgba(224,114,158,.24)`, borderRadius: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ width: 38, height: 38, borderRadius: '11px', background: 'rgba(224,114,158,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(224,114,158,.3)' }}>
              <Handshake size={19} color="#e79ab8" />
            </div>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: colors.neonPink, boxShadow: `0 0 7px ${colors.neonPink}` }}></div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, marginBottom: '4px', letterSpacing: '-0.5px' }}>{stats?.pendingPartners ?? 3}</div>
          <div style={{ fontSize: '11.5px', color: colors.muted, fontWeight: 500 }}>Đối tác Join Us</div>
          <div style={{ fontSize: '10.5px', color: '#57534b', marginTop: '6px' }}>Chờ duyệt hợp tác</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: '24px' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* ACTION REQUIRED SECTION */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: colors.text }}>Cần xử lý ngay</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              
              <div style={{ background: 'rgba(212,178,106,.05)', border: `1px solid ${colors.borderGold22}`, borderRadius: '12px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: colors.gold }}></div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: colors.gold, marginBottom: '8px' }}>{stats?.pendingBills ?? 5}</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: colors.text, marginBottom: '16px' }}>Hóa đơn chờ duyệt</div>
                <Link href="/admin/bills" style={{ textDecoration: 'none' }}>
                  <div style={{ fontSize: '13px', color: colors.muted, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    Duyệt ngay <span style={{ color: colors.gold }}>›</span>
                  </div>
                </Link>
              </div>

              <div style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '12px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: colors.text, marginBottom: '8px' }}>{stats?.pendingCasts ?? 4}</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: colors.text, marginBottom: '16px' }}>Cast chờ kiểm duyệt</div>
                <Link href="/admin/casts" style={{ textDecoration: 'none' }}>
                  <div style={{ fontSize: '13px', color: colors.muted, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    Kiểm duyệt <span style={{ color: colors.gold }}>›</span>
                  </div>
                </Link>
              </div>

              <div style={{ background: 'rgba(224,114,158,.05)', border: `1px solid rgba(224,114,158,.2)`, borderRadius: '12px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: colors.neonPink }}></div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: colors.text, marginBottom: '8px' }}>{stats?.pendingPartners ?? 3}</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: colors.text, marginBottom: '16px' }}>Đối tác Join Us</div>
                <Link href="/admin/partners" style={{ textDecoration: 'none' }}>
                  <div style={{ fontSize: '13px', color: colors.muted, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    Xem yêu cầu <span style={{ color: colors.gold }}>›</span>
                  </div>
                </Link>
              </div>

            </div>
          </div>

          {/* RECENT BOOKINGS */}
          <div style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.borderSoft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: colors.text }}>Booking gần đây</h3>
              <span style={{ fontSize: '13px', color: colors.muted, cursor: 'pointer' }}>Xem tất cả</span>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>KHÁCH</th>
                  <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>QUÁN · CAST</th>
                  <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>GIỜ</th>
                  <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px', textAlign: 'right' }}>TRẠNG THÁI</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recentBookings ?? [
                  { customerName: 'Tanaka Hiro', partySize: 4, store: { name: 'Club Lumiere' }, cast: { stageName: 'Yuki' }, scheduledAt: '2026-07-01T21:30:00', status: 'Mới' },
                  { customerName: 'Suzuki Ken', partySize: 2, store: { name: 'Sakura Lounge' }, cast: { stageName: 'Mai' }, scheduledAt: '2026-07-01T20:00:00', status: 'Hoàn tất' },
                  { customerName: 'Yamada Rei', partySize: 6, store: { name: 'KTV Hoàng Gia' }, cast: null, scheduledAt: '2026-07-01T22:15:00', status: 'Đã hủy' },
                  { customerName: 'Kobayashi Aya', partySize: 3, store: { name: 'Club Lumiere' }, cast: { stageName: 'Rin' }, scheduledAt: '2026-07-01T23:00:00', status: 'Mới' },
                ]).map((row, idx) => {
                  const statusColor = row.status === 'Mới' || row.status === 'REQUESTED' ? colors.blue : 
                                      row.status === 'Hoàn tất' || row.status === 'COMPLETED' ? colors.green : 
                                      colors.red;
                  const statusBg = row.status === 'Mới' || row.status === 'REQUESTED' ? colors.blueBg : 
                                   row.status === 'Hoàn tất' || row.status === 'COMPLETED' ? colors.greenBg : 
                                   colors.redBg;
                  const displayStatus = row.status === 'REQUESTED' ? 'Mới' :
                                        row.status === 'COMPLETED' ? 'Hoàn tất' :
                                        row.status === 'CANCELLED' ? 'Đã hủy' : row.status;

                  return (
                    <tr key={idx} style={{ borderTop: `1px solid ${colors.borderSoft}` }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: colors.text }}>{row.customerName}</div>
                        <div style={{ fontSize: '12px', color: colors.muted, marginTop: '2px' }}>{row.partySize} khách · Telegram</div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontSize: '14px', color: colors.text }}>{row.store.name}</div>
                        <div style={{ fontSize: '12px', color: colors.muted, marginTop: '2px' }}>Cast: {row.cast?.stageName || 'Không cast'}</div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: colors.text2 }}>
                        {new Date(row.scheduledAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <span style={{ 
                          background: statusBg, 
                          color: statusColor, 
                          border: `1px solid ${statusColor}40`,
                          padding: '4px 12px', 
                          borderRadius: '12px', 
                          fontSize: '12px', 
                          fontWeight: 600 
                        }}>
                          {displayStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* TELEGRAM ALERTS */}
          <div style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '16px', padding: '24px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: colors.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: colors.red, boxShadow: `0 0 8px ${colors.red}` }}></div>
                Cảnh báo & Telegram
              </h3>
              <span style={{ fontSize: '11px', color: colors.muted }}>Trực tiếp</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {stats?.telegramLogs?.length ? stats.telegramLogs.map(log => {
                let icon = <MessageCircle size={16} color={colors.blue} />;
                let bg = colors.blueBg;
                let title = 'Thông báo';
                let detail = '';
                
                if (log.templateKey === 'NEW_BOOKING') {
                  title = `Booking mới #${log.payload?.bookingCode || ''}`;
                  detail = `${log.payload?.storeName || ''} · ${log.payload?.partySize || 0} khách`;
                } else if (log.templateKey === 'NEW_BILL' || log.templateKey === 'BILL_PENDING') {
                  icon = <ReceiptText size={16} color={colors.gold} />;
                  bg = 'rgba(212,178,106,.1)';
                  title = `Hóa đơn mới #${log.payload?.billNumber || ''} chờ duyệt`;
                  detail = log.payload?.totalVnd ? `${log.payload.totalVnd.toLocaleString('vi-VN')}₫` : '';
                } else if (log.templateKey === 'NEW_PARTNER') {
                  icon = <Handshake size={16} color={colors.red} />;
                  bg = colors.redBg;
                  title = 'Yêu cầu hợp tác mới';
                  detail = log.payload?.storeName || '';
                }

                const timeString = new Date(log.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={log.id} style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '8px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', color: colors.text, lineHeight: '1.4' }}>
                        <strong style={{ fontWeight: 700 }}>{title}</strong> {detail ? `— ${detail}` : ''}
                      </div>
                      <div style={{ fontSize: '12px', color: colors.muted, marginTop: '4px' }}>{timeString} · Telegram</div>
                    </div>
                  </div>
                );
              }) : (
                <div style={{ fontSize: '13px', color: colors.muted, textAlign: 'center', padding: '20px 0' }}>Không có hoạt động mới</div>
              )}
            </div>
          </div>

          {/* 7 DAY REVENUE CHART (Placeholder) */}
          <div style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '16px', padding: '24px', height: '200px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: colors.text, marginBottom: '4px' }}>Doanh thu 7 ngày</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: colors.gold }}>
                  {stats?.revenue7Days ? formatVnd(stats.revenue7Days.reduce((acc, curr) => acc + curr.revenue, 0)) : '312M₫'}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: colors.muted }}>Quy : triệu đ</div>
            </div>
            
            {/* Chart Bars (Recharts) */}
            <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
              {(() => {
                const data = stats?.revenue7Days?.length === 7 ? stats.revenue7Days : [
                  { date: '2026-06-26', revenue: 12000000 },
                  { date: '2026-06-27', revenue: 18000000 },
                  { date: '2026-06-28', revenue: 14000000 },
                  { date: '2026-06-29', revenue: 15000000 },
                  { date: '2026-06-30', revenue: 16000000 },
                  { date: '2026-07-01', revenue: 28000000 },
                  { date: '2026-07-02', revenue: 20000000 },
                ];

                const chartData = data.map(d => {
                  const dateObj = new Date(d.date);
                  const isToday = new Date().toDateString() === dateObj.toDateString();
                  const label = dateObj.toLocaleDateString('vi-VN', { weekday: 'short' }).replace('Th ', 'T').replace('CN', 'CN');
                  return {
                    name: label,
                    revenue: d.revenue / 1000000,
                    isToday
                  };
                });

                return (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f4e3b4" />
                          <stop offset="55%" stopColor="#d4b26a" />
                          <stop offset="100%" stopColor="#b6924a" />
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: colors.muted, fontWeight: 500 }} 
                        dy={5} 
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                        contentStyle={{ background: colors.surface2, border: `1px solid ${colors.borderSoft}`, borderRadius: '8px', color: colors.text, fontSize: '12px' }}
                        itemStyle={{ color: colors.gold }}
                        formatter={(value) => [`${Number(value ?? 0)}M₫`, 'Doanh thu']}
                        labelStyle={{ color: colors.muted, marginBottom: '4px' }}
                      />
                      <Bar dataKey="revenue" radius={[6, 6, 6, 6]} barSize={12} minPointSize={12}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.isToday ? 'url(#goldGrad)' : colors.surface2} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
