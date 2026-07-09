"use client";

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { clearAuthSession } from '@/lib/auth/session';

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
    booking?: { id: string; partySize: number; store?: { name: string } } | null;
    bill?: { id: string; totalVnd: number; store?: { name: string } } | null;
    partnerRequest?: { businessName: string; storeCity: string } | null;
  }[];
};

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div style={{ padding: '24px 26px 40px', color: '#8c8679' }}>Đang tải...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const city = searchParams.get('city') || 'other';
  const category = searchParams.get('category') || '';
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [storageUsage, setStorageUsage] = useState<{ limit: number, used: number, percentage: number, isExceeded: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState(0); // 0 = Hôm nay, 1 = Tuần, 2 = Tháng

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const timeframeMap = ['today', 'week', 'month'];
      const tf = timeframeMap[activeFilter] ?? 'today';
      const params = new URLSearchParams({ timeframe: tf, city });
      if (category) params.set('category', category);
      const data = await apiClient<AdminDashboardStats>(`/admin/dashboard/stats?${params.toString()}`);
      setStats(data);
      
      try {
        const usageData = await apiClient<{ data: any }>('/admin/system-config/storage/usage');
        if (usageData && usageData.data) {
          setStorageUsage(usageData.data);
        }
      } catch (e) {
        // Ignore if user is not SUPER_ADMIN
      }
    } catch (err: any) {
      console.error(err);
      setError('Lỗi khi tải dữ liệu thống kê. Vui lòng thử lại sau.');
      if (err && typeof err === 'object' && 'status' in err && err.status === 401) {
        clearAuthSession();
        window.location.href = '/admin/dang-nhap';
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadStats();
  }, [activeFilter, city, category]);

  const formatVnd = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M₫`.replace('.0', '');
    return `${val.toLocaleString('vi-VN')}₫`;
  };

  const formatDateStr = () => {
    const d = new Date();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return `${days[d.getDay()]} · ${d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
  };

  // Convert stats to fallbacks
  const pendingBills = stats?.pendingBills ?? 0;
  const pendingPartners = stats?.pendingPartners ?? 0;
  const activeStores = stats?.activeStores ?? 0;
  const totalCasts = stats?.totalCasts ?? 0;
  const pendingCasts = stats?.pendingCasts ?? 0;
  const totalContents = stats?.totalContents ?? 0;
  const todaysBookings = stats?.todaysBookings ?? 0;
  const todaysBookingsCompleted = stats?.todaysBookingsCompleted ?? 0;
  const todaysBookingsNew = stats?.todaysBookingsNew ?? 0;
  const pendingBillsAmount = stats?.pendingBillsAmount ?? 0;
  const monthlyRevenue = stats?.monthlyRevenue ?? 0;
  const commissionAmount = stats?.commissionAmount ?? 0;

  // Chart
  const chartData = stats?.revenue7Days || [];
  const maxRev = chartData.length > 0 ? Math.max(...chartData.map(d => d.revenue), 1) : 1;

  const handleExport = async () => {
    try {
      const { getAuthToken, buildApiUrl } = await import('@/lib/api/client');
      const tf = ['today', 'week', 'month'][activeFilter] ?? 'today';
      const token = getAuthToken();
      const params = new URLSearchParams({ timeframe: tf, city });
      if (category) params.set('category', category);
      const url = buildApiUrl(`/admin/dashboard/export?${params.toString()}`);
      
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `bao_cao_${tf}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Export error:', err);
      alert('Không thể tải báo cáo. Vui lòng thử lại.');
    }
  };

  return (
    <div className="nl-admin-page nl-admin-dashboard" data-screen-label="Admin · Dashboard" style={{ padding: '24px 26px 40px' }}>
      {storageUsage && storageUsage.percentage >= 90 && (
        <div style={{
          background: storageUsage.isExceeded ? 'rgba(244, 67, 54, 0.1)' : 'rgba(255, 152, 0, 0.1)',
          border: `1px solid ${storageUsage.isExceeded ? 'rgba(244, 67, 54, 0.5)' : 'rgba(255, 152, 0, 0.5)'}`,
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={storageUsage.isExceeded ? '#f44336' : '#ff9800'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <div>
            <div style={{ color: storageUsage.isExceeded ? '#f44336' : '#ff9800', fontWeight: 600, fontSize: '15px' }}>
              {storageUsage.isExceeded ? 'Cảnh báo: Dung lượng VPS đã đầy!' : 'Cảnh báo: Dung lượng VPS sắp đầy!'}
            </div>
            <div style={{ color: '#c5c0b6', fontSize: '13px', marginTop: '2px' }}>
              Hệ thống đang sử dụng <b>{storageUsage.used}GB / {storageUsage.limit}GB</b> ({storageUsage.percentage}%). 
              {storageUsage.isExceeded ? ' Chức năng upload đã bị khóa tạm thời. Vui lòng dọn dẹp dữ liệu hoặc nâng cấp VPS.' : ' Hãy kiểm tra và lên kế hoạch nâng cấp dung lượng VPS.'}
            </div>
          </div>
        </div>
      )}

      {/* welcome + range */}
      <div className="nl-admin-dashboard-head" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#f3f0ea' }}>Chào buổi tối, Admin 🌙</div>
          <div style={{ fontSize: '13px', color: '#8c8679', marginTop: '4px' }}>
            {formatDateStr()} · Có <b style={{ color: '#e3c27e' }}>{pendingBills} hóa đơn</b> và <b style={{ color: '#e3c27e' }}>{pendingPartners} đối tác</b> đang chờ bạn xử lý.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ display: 'flex', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '10px', padding: '3px', gap: '2px' }}>
            {['Hôm nay', 'Tuần', 'Tháng'].map((t, i) => {
              const isActive = activeFilter === i;
              return (
                <span 
                  key={t}
                  onClick={() => setActiveFilter(i)}
                  style={{
                    fontSize: '12px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#241a0a' : '#9b958a',
                    background: isActive ? 'linear-gradient(135deg,#f0dda8,#d4b26a)' : 'transparent',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  {t}
                </span>
              );
            })}
          </span>
          <span 
            onClick={handleExport}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 600, color: '#241a0a', background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', padding: '9px 16px', borderRadius: '10px', cursor: 'pointer' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></svg>Xuất báo cáo
          </span>
        </div>
      </div>

      {isLoading && !stats && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#8c8679', fontSize: '14px' }}>
          Đang tải dữ liệu...
        </div>
      )}

      {error && (
        <div style={{ padding: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#ef4444', marginBottom: '20px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {stats && (
        <>
          {/* stats grids */}
          <div className="nl-admin-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div style={{ background: 'rgba(255,255,255,.035)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'rgba(212,178,106,.12)', border: '1px solid rgba(212,178,106,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d9bd84' }}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1.5-5h15L21 9M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M3 9h18"/></svg></span></div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#f3f0ea', marginTop: '12px', letterSpacing: '-.5px' }}>{activeStores}</div>
          <div style={{ fontSize: '11.5px', color: '#8c8679', marginTop: '1px' }}>Quán hoạt động</div>
          <div style={{ fontSize: '10.5px', color: '#57534b', marginTop: '6px' }}>HN {stats?.activeStoresHn ?? 0} · HCM {stats?.activeStoresHcm ?? 0}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,.035)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'rgba(212,178,106,.12)', border: '1px solid rgba(212,178,106,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d9bd84' }}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 6a3 3 0 0 1 0 6"/></svg></span><span style={{ fontSize: '11px', color: '#e7b869', fontWeight: 600 }}>{pendingCasts} chờ</span></div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#f3f0ea', marginTop: '12px', letterSpacing: '-.5px' }}>{totalCasts}</div>
          <div style={{ fontSize: '11.5px', color: '#8c8679', marginTop: '1px' }}>Cast</div>
          <div style={{ fontSize: '10.5px', color: '#57534b', marginTop: '6px' }}>{pendingCasts} chờ kiểm duyệt</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,.035)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'rgba(212,178,106,.12)', border: '1px solid rgba(212,178,106,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d9bd84' }}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></span></div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#f3f0ea', marginTop: '12px', letterSpacing: '-.5px' }}>{totalContents}</div>
          <div style={{ fontSize: '11.5px', color: '#8c8679', marginTop: '1px' }}>Bài viết & Campaign</div>
          <div style={{ fontSize: '10.5px', color: '#57534b', marginTop: '6px' }}>Nội dung đang hiển thị</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,.035)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'rgba(111,159,216,.12)', border: '1px solid rgba(111,159,216,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8fb6e4' }}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/></svg></span><span style={{ fontSize: '11px', color: '#7fd3a2', fontWeight: 600 }}>+{todaysBookingsNew} mới</span></div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#f3f0ea', marginTop: '12px', letterSpacing: '-.5px' }}>{todaysBookings}</div>
          <div style={{ fontSize: '11.5px', color: '#8c8679', marginTop: '1px' }}>Booking {['hôm nay', 'tuần này', 'tháng này'][activeFilter]}</div>
          <div style={{ fontSize: '10.5px', color: '#57534b', marginTop: '6px' }}>{todaysBookingsCompleted} hoàn tất · {todaysBookingsNew} mới</div>
        </div>
        <div style={{ background: 'rgba(224,164,78,.07)', border: '1px solid rgba(224,164,78,.28)', borderRadius: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'rgba(224,164,78,.14)', border: '1px solid rgba(224,164,78,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e7b869' }}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h12v20l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h4"/></svg></span><span style={{ fontSize: '10px', fontWeight: 700, color: '#241a0a', background: '#e0a44e', borderRadius: '8px', padding: '3px 7px' }}>CHỜ</span></div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#e7b869', marginTop: '12px', letterSpacing: '-.5px' }}>{pendingBills}</div>
          <div style={{ fontSize: '11.5px', color: '#c5c0b6', marginTop: '1px' }}>Hóa đơn chờ duyệt</div>
          <div style={{ fontSize: '10.5px', color: '#8c8679', marginTop: '6px' }}>≈ {formatVnd(pendingBillsAmount)}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,.035)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'rgba(212,178,106,.12)', border: '1px solid rgba(212,178,106,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d9bd84' }}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></span></div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#e3c27e', marginTop: '12px', letterSpacing: '-.5px' }}>
            {formatVnd(monthlyRevenue).replace('M₫', '')}
            <span style={{ fontSize: '15px', fontWeight: 700 }}>M₫</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#8c8679', marginTop: '1px' }}>Tổng doanh thu</div>
          <div style={{ fontSize: '10.5px', color: '#57534b', marginTop: '6px' }}>Hoa hồng {formatVnd(commissionAmount)}</div>
        </div>
        <div style={{ background: 'rgba(224,114,158,.06)', border: '1px solid rgba(224,114,158,.24)', borderRadius: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'rgba(224,114,158,.12)', border: '1px solid rgba(224,114,158,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e79ab8' }}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 10.5-2.3M17 8v6M20 11h-6"/></svg></span><span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#e0729e', boxShadow: '0 0 7px #e0729e' }}></span></div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#f3f0ea', marginTop: '12px', letterSpacing: '-.5px' }}>{pendingPartners}</div>
          <div style={{ fontSize: '11.5px', color: '#8c8679', marginTop: '1px' }}>Đối tác Join Us</div>
          <div style={{ fontSize: '10.5px', color: '#57534b', marginTop: '6px' }}>Chờ duyệt hợp tác</div>
        </div>
      </div>

      {/* two columns */}
      <div className="nl-admin-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: '18px', marginTop: '20px', alignItems: 'start' }}>

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* cần xử lý */}
          <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '18px', padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '16px', fontWeight: 600, color: '#f3f0ea' }}>Cần xử lý ngay</span>
              <span style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,rgba(212,178,106,.4),transparent)' }}></span>
            </div>
            <div className="nl-admin-action-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <Link href="/admin/bills" style={{ textDecoration: 'none', background: 'rgba(224,164,78,.07)', border: '1px solid rgba(224,164,78,.24)', borderRadius: '14px', padding: '14px', cursor: 'pointer', display: 'block' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#e7b869' }}>{pendingBills}</div>
                <div style={{ fontSize: '12px', color: '#c5c0b6', fontWeight: 500, marginTop: '2px' }}>Hóa đơn chờ duyệt</div>
                <div style={{ fontSize: '10.5px', color: '#8c8679', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>Duyệt ngay <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg></div>
              </Link>
              <Link href="/admin/casts" style={{ textDecoration: 'none', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '14px', padding: '14px', cursor: 'pointer', display: 'block' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#f3f0ea' }}>{pendingCasts}</div>
                <div style={{ fontSize: '12px', color: '#c5c0b6', fontWeight: 500, marginTop: '2px' }}>Cast chờ kiểm duyệt</div>
                <div style={{ fontSize: '10.5px', color: '#8c8679', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>Kiểm duyệt <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg></div>
              </Link>
              <Link href="/admin/partners" style={{ textDecoration: 'none', background: 'rgba(224,114,158,.06)', border: '1px solid rgba(224,114,158,.22)', borderRadius: '14px', padding: '14px', cursor: 'pointer', display: 'block' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#f3f0ea' }}>{pendingPartners}</div>
                <div style={{ fontSize: '12px', color: '#c5c0b6', fontWeight: 500, marginTop: '2px' }}>Đối tác Join Us</div>
                <div style={{ fontSize: '10.5px', color: '#8c8679', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>Xem yêu cầu <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg></div>
              </Link>
            </div>
          </div>

          {/* recent bookings */}
          <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '18px', padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <span style={{ fontSize: '16px', fontWeight: 600, color: '#f3f0ea' }}>Booking gần đây</span>
              <span style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,rgba(212,178,106,.4),transparent)' }}></span>
              <Link href="/admin/bookings" style={{ fontSize: '11.5px', color: '#9b958a', cursor: 'pointer', textDecoration: 'none' }}>Xem tất cả</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="nl-admin-recent-head" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.4fr .7fr 1fr', gap: '10px', fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: '#57534b', textTransform: 'uppercase', padding: '0 4px 10px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                <span>Khách</span><span>Quán · Cast</span><span>Giờ</span><span style={{ textAlign: 'right' }}>Trạng thái</span>
              </div>
              {stats?.recentBookings?.map((b, idx, arr) => {
                const isLast = idx === arr.length - 1;
                let statusColor = '#8fb6e4';
                let statusBg = 'rgba(111,159,216,.12)';
                let statusBorder = 'rgba(111,159,216,.28)';
                let statusText = 'Mới';

                if (b.status === 'COMPLETED') {
                  statusColor = '#7fd3a2'; statusBg = 'rgba(95,191,134,.1)'; statusBorder = 'rgba(95,191,134,.28)'; statusText = 'Hoàn tất';
                } else if (b.status === 'CANCELLED') {
                  statusColor = '#e88b99'; statusBg = 'rgba(224,105,122,.1)'; statusBorder = 'rgba(224,105,122,.28)'; statusText = 'Đã hủy';
                }

                return (
                  <div className="nl-admin-recent-row" key={b.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.4fr .7fr 1fr', gap: '10px', alignItems: 'center', padding: '12px 4px', borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,.04)', fontSize: '13px' }}>
                    <div><div style={{ color: '#f3f0ea', fontWeight: 500 }}>{b.customerName}</div><div style={{ fontSize: '10.5px', color: '#57534b' }}>{b.partySize} khách · Telegram</div></div>
                    <div style={{ color: '#c5c0b6' }}>{b.store.name}<div style={{ fontSize: '10.5px', color: '#8c8679' }}>{b.cast ? `Cast: ${b.cast.stageName}` : 'Không cast'}</div></div>
                    <div style={{ color: '#8c8679', fontSize: '12px' }}>{new Date(b.scheduledAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                    <div style={{ textAlign: 'right' }}><span style={{ fontSize: '11px', fontWeight: 600, color: statusColor, background: statusBg, border: `1px solid ${statusBorder}`, padding: '4px 10px', borderRadius: '20px' }}>{statusText}</span></div>
                  </div>
                );
              })}
              {(!stats?.recentBookings || stats.recentBookings.length === 0) && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#8c8679', fontSize: '13px' }}>Chưa có booking nào.</div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* telegram feed */}
          <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '18px', padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#e0729e', boxShadow: '0 0 8px #e0729e', animation: 'vpulse 1.8s infinite' }}></span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#f3f0ea' }}>Cảnh báo &amp; Telegram</span>
              <span style={{ flex: 1 }}></span>
              <span style={{ fontSize: '10px', color: '#57534b' }}>Trực tiếp</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {stats?.telegramLogs?.slice(0, 4).map((log, idx, arr) => {
                const isLast = idx === arr.length - 1;
                // mock styling based on templateKey
                let icon = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9h18"/></svg>;
                let iconColor = '#8fb6e4';
                let iconBg = 'rgba(111,159,216,.12)';
                
                if (log.templateKey === 'telegram.admin.bill.submitted.v1') {
                  icon = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h12v20l-3-2-3 2-3-2-3 2z"/></svg>;
                  iconColor = '#e7b869'; iconBg = 'rgba(224,164,78,.12)';
                } else if (log.templateKey === 'telegram.admin.partner.requested.v1') {
                  icon = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 10.5-2.3M17 8v6M20 11h-6"/></svg>;
                  iconColor = '#e79ab8'; iconBg = 'rgba(224,114,158,.12)';
                }

                const diffMs = Date.now() - new Date(log.createdAt).getTime();
                const diffMins = Math.floor(diffMs / 60000);
                const timeAgo = diffMins < 1 ? 'vừa xong' : diffMins < 60 ? `${diffMins} phút trước` : diffMins < 1440 ? `${Math.floor(diffMins / 60)} giờ trước` : `${Math.floor(diffMins / 1440)} ngày trước`;

                return (
                  <div key={log.id} style={{ display: 'flex', gap: '11px', padding: '10px 0', borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,.04)' }}>
                    <span style={{ width: '30px', height: '30px', flex: 'none', borderRadius: '9px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor }}>{icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12.5px', color: '#e6e2da', lineHeight: 1.4 }}>
                        {log.templateKey === 'telegram.admin.booking.created.v1' ? <>Booking mới <b style={{ color: '#fff' }}>#BK-{(log.booking?.id || log.id).slice(0,4).toUpperCase()}</b> — {log.booking?.store?.name || 'Hệ thống'} · {log.booking?.partySize || 1} khách</> :
                         log.templateKey === 'telegram.admin.bill.submitted.v1' ? <>Hóa đơn mới <b style={{ color: '#fff' }}>#BILL-{(log.bill?.id || log.id).slice(0,4).toUpperCase()}</b> chờ duyệt — {(log.bill?.totalVnd || 0).toLocaleString('vi-VN')}₫</> :
                         log.templateKey === 'telegram.admin.partner.requested.v1' ? <>Yêu cầu hợp tác mới — <b style={{ color: '#fff' }}>{log.partnerRequest?.businessName || 'Đối tác'}</b> {log.partnerRequest?.storeCity ? `(${log.partnerRequest.storeCity})` : ''}</> :
                         <>{log.payload?.title || 'Cảnh báo hệ thống'}</>}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#57534b', marginTop: '3px' }}>{timeAgo} · {log.recipient === 'TELEGRAM_ADMIN_CHAT_ID' ? 'nhóm Admin' : 'hệ thống Telegram'}</div>
                    </div>
                  </div>
                );
              })}
              {(!stats?.telegramLogs || stats.telegramLogs.length === 0) && (
                <div style={{ padding: '20px 0', textAlign: 'center', color: '#8c8679', fontSize: '13px' }}>
                  Chưa có sự kiện nào.
                </div>
              )}
            </div>
          </div>

          {/* revenue chart */}
          <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '18px', padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#f3f0ea' }}>Doanh thu 7 ngày</span>
              <span style={{ fontSize: '11px', color: '#8c8679' }}>Gộp · triệu ₫</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#e3c27e', margin: '6px 0 16px' }}>{formatVnd(monthlyRevenue).replace('M₫', '')}<span style={{ fontSize: '13px', fontWeight: 600, color: '#8c8679' }}> M₫ · tháng 6</span></div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '120px' }}>
              {chartData.map((d, i) => {
                const isLast = i === chartData.length - 1 || i === chartData.length - 2; // style difference for weekend
                const h = Math.max(10, (d.revenue / maxRev) * 100);
                const bg = isLast ? 'linear-gradient(180deg,#f4e3b4,#d4b26a)' : 'linear-gradient(180deg,rgba(212,178,106,.55),rgba(212,178,106,.12))';
                const labelColor = isLast ? '#e3c27e' : '#57534b';
                const fw = isLast ? 600 : 400;
                
                return (
                  <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px' }}>
                    <span style={{ width: '100%', height: `${h}%`, background: bg, borderRadius: '6px 6px 0 0', transition: 'height 0.3s ease' }}></span>
                    <span style={{ fontSize: '9.5px', color: labelColor, fontWeight: fw }}>{d.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}

