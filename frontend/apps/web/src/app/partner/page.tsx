'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  TrendingUp, FileText, CalendarDays, TicketCheck, Plus, QrCode, Settings, UsersRound, RefreshCcw, ChevronRight
} from 'lucide-react';
import { usePartnerStoreScope } from '@/app/partner/PartnerProviders';
import { fetchPartnerHome, PartnerHomeOverview, PartnerActivityItem } from '@/lib/api/partner-portal';
import { InlineLoading } from '@/components/ui/DataLoading';

export default function PartnerHomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedStoreId, activeStore, isStaffAccount } = usePartnerStoreScope();

  const [data, setData] = useState<PartnerHomeOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Legacy URL query parameter fallbacks
  useEffect(() => {
    const panel = searchParams?.get('panel');
    if (!panel) return;
    const panelMap: Record<string, string> = {
      scan: '/partner/scan',
      listing: '/partner/listing',
      settings: '/partner/settings',
      staff: '/partner/settings/staff',
      bill: '/partner/activity/new-bill',
      activity: '/partner/activity',
      settlement: '/partner/activity',
    };
    if (panelMap[panel]) router.replace(panelMap[panel]);
  }, [searchParams, router]);

  const loadHomeData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPartnerHome(selectedStoreId, signal);
      if (!signal?.aborted) {
        setData(res);
      }
    } catch (err: any) {
      if ((err instanceof Error && err.name === 'AbortError') || err?.name === 'AbortError' || signal?.aborted) {
        return;
      }
      setError(err?.message || 'Không thể tải dữ liệu tổng quan');
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [selectedStoreId]);

  useEffect(() => {
    const controller = new AbortController();
    loadHomeData(controller.signal);
    return () => controller.abort();
  }, [loadHomeData]);

  const formatVnd = (val?: number | null) => val === undefined || val === null ? null : `${Math.max(0, val).toLocaleString('vi-VN')} đ`;
  const formatDate = (iso?: string) => iso ? new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

  const getStatusBadge = (item: PartnerActivityItem) => {
    const tone = item.badgeTone || 'info';
    const defaultStyle = { bg: 'rgba(140,190,255,.15)', color: '#8cbeff', border: 'rgba(140,190,255,.3)' };
    const toneMap: Record<string, { bg: string; color: string; border: string }> = {
      success: { bg: 'rgba(141,230,176,.15)', color: 'var(--partner-success, #8de6b0)', border: 'rgba(141,230,176,.3)' },
      warning: { bg: 'rgba(212,178,106,.15)', color: 'var(--partner-gold, #d4b26a)', border: 'rgba(212,178,106,.3)' },
      danger: { bg: 'rgba(255,180,168,.15)', color: 'var(--partner-danger, #ffb4a8)', border: 'rgba(255,180,168,.3)' },
      info: defaultStyle,
    };
    const style = toneMap[tone] || defaultStyle;
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
        {item.statusLabel || item.status}
      </span>
    );
  };

  const metrics = data?.metrics;
  const recentActivities = data?.recentActivities || [];

  const tileStyle: React.CSSProperties = {
    background: 'var(--partner-surface-1)', border: '1px solid var(--partner-border-hair)', borderRadius: '14px', padding: '16px', textDecoration: 'none', color: 'var(--partner-text)', display: 'flex', flexDirection: 'column', gap: '8px'
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '1.2px', color: 'var(--partner-gold)', textTransform: 'uppercase' }}>PARTNER DASHBOARD OVERVIEW</div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, margin: '4px 0 0', color: 'var(--partner-text)' }}>Tổng quan kinh doanh</h1>
          <p style={{ fontSize: '13px', color: 'var(--partner-muted)', margin: '4px 0 0' }}>{activeStore ? `Đang xem: ${activeStore.name}` : 'Theo dõi chỉ số hiệu suất kinh doanh & hoạt động gần đây'}</p>
        </div>
        <button type="button" onClick={() => loadHomeData()} disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', border: '1px solid var(--partner-border-gold-32)', background: 'var(--partner-surface-2)', color: 'var(--partner-gold-bright)', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>
          <RefreshCcw size={15} className={loading ? 'animate-spin' : ''} /> Làm mới
        </button>
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(255,180,168,.1)', border: '1px solid var(--partner-danger)', borderRadius: '10px', color: 'var(--partner-danger)', marginBottom: '20px', fontSize: '13px' }}>{error}</div>}

      {/* Overview KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: 'var(--partner-surface-1)', border: '1px solid var(--partner-border-gold-22)', borderRadius: '14px', padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--partner-muted)' }}>Tổng doanh thu</span><TrendingUp size={20} color="var(--partner-gold)" /></div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--partner-gold-bright)', margin: '10px 0 2px' }}>{loading ? '...' : formatVnd(metrics?.totalRevenueVnd) || '0 đ'}</div>
          <div style={{ fontSize: '11px', color: 'var(--partner-muted)' }}>Tích lũy từ hóa đơn đã duyệt</div>
        </div>

        <div style={{ background: 'var(--partner-surface-1)', border: '1px solid var(--partner-border-hair)', borderRadius: '14px', padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--partner-muted)' }}>Số lượng hóa đơn</span><FileText size={20} color="#8cbeff" /></div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--partner-text)', margin: '10px 0 2px' }}>{loading ? '...' : metrics?.billCount ?? 0}</div>
          <div style={{ fontSize: '11px', color: 'var(--partner-muted)' }}>Hóa đơn nạp trên hệ thống</div>
        </div>

        <div style={{ background: 'var(--partner-surface-1)', border: '1px solid var(--partner-border-hair)', borderRadius: '14px', padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--partner-muted)' }}>Lượt đặt bàn</span><CalendarDays size={20} color="var(--partner-success, #8de6b0)" /></div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--partner-text)', margin: '10px 0 2px' }}>{loading ? '...' : metrics?.bookingCount ?? 0}</div>
          <div style={{ fontSize: '11px', color: 'var(--partner-muted)' }}>Lượt đặt chỗ thành công</div>
        </div>

        <div style={{ background: 'var(--partner-surface-1)', border: '1px solid var(--partner-border-hair)', borderRadius: '14px', padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--partner-muted)' }}>Ưu đãi đang chạy</span><TicketCheck size={20} color="var(--partner-neon-pink, #e0729e)" /></div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--partner-text)', margin: '10px 0 2px' }}>{loading ? '...' : metrics?.activeCouponsCount ?? 0}</div>
          <div style={{ fontSize: '11px', color: 'var(--partner-muted)' }}>Chương trình khuyến mãi active</div>
        </div>
      </div>

      {/* Quick Action Navigation Tiles */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 900, color: 'var(--partner-text)', marginBottom: '14px' }}>Thao tác nhanh</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px' }}>
          <Link href="/partner/activity/new-bill" style={{ ...tileStyle, border: '1px solid var(--partner-border-gold-32)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--partner-gold-grad)', color: 'var(--partner-on-gold)', display: 'grid', placeItems: 'center' }}><Plus size={18} /></div>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--partner-gold-bright)' }}>Nạp Hóa Đơn Mới</span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--partner-muted)' }}>Gửi thông tin hóa đơn tích điểm</span>
          </Link>

          <Link href="/partner/scan" style={tileStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(140,190,255,.15)', color: '#8cbeff', display: 'grid', placeItems: 'center' }}><QrCode size={18} /></div>
              <span style={{ fontSize: '14px', fontWeight: 800 }}>Quét Mã QR</span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--partner-muted)' }}>Quét mã đặt chỗ & coupon</span>
          </Link>

          {!isStaffAccount && (
            <>
              <Link href="/partner/listing" style={tileStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(141,230,176,.15)', color: 'var(--partner-success, #8de6b0)', display: 'grid', placeItems: 'center' }}><FileText size={18} /></div>
                  <span style={{ fontSize: '14px', fontWeight: 800 }}>Quản lý Danh mục</span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--partner-muted)' }}>Cấu hình thông tin quán & menu</span>
              </Link>

              <Link href="/partner/settings" style={tileStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(212,178,106,.15)', color: 'var(--partner-gold)', display: 'grid', placeItems: 'center' }}><Settings size={18} /></div>
                  <span style={{ fontSize: '14px', fontWeight: 800 }}>Cấu hình Cửa hàng</span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--partner-muted)' }}>Thiết lập thông tin & đổi mật khẩu</span>
              </Link>

              <Link href="/partner/settings/staff" style={tileStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(224,114,158,.15)', color: 'var(--partner-neon-pink, #e0729e)', display: 'grid', placeItems: 'center' }}><UsersRound size={18} /></div>
                  <span style={{ fontSize: '14px', fontWeight: 800 }}>Quản lý Nhân viên</span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--partner-muted)' }}>Tạo tài khoản & phân quyền nhân viên</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Recent Activities Feed Preview */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 900, color: 'var(--partner-text)', margin: 0 }}>Hoạt động gần đây</h2>
          <Link href="/partner/activity" style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--partner-gold)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            Xem tất cả hoạt động <ChevronRight size={15} />
          </Link>
        </div>

        {loading ? (
          <InlineLoading label="Đang tải hoạt động..." />
        ) : recentActivities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', background: 'var(--partner-surface-1)', border: '1px dashed var(--partner-border-gold-22)', borderRadius: '14px', color: 'var(--partner-muted)', fontSize: '13px' }}>
            Chưa có hoạt động gần đây nào.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentActivities.slice(0, 5).map((item) => {
              const displayTitle = item.title || item.summary || `Hoạt động #${item.rawId || item.id}`;
              const displayDate = formatDate(item.activityAt || item.createdAt);
              const totalText = formatVnd(item.totalVnd);
              const discountText = item.discountVnd === null
                ? 'Giảm giá: Chưa xác định'
                : typeof item.discountVnd === 'number' && item.discountVnd > 0
                ? `Giảm ${formatVnd(item.discountVnd)}`
                : null;

              return (
                <div
                  key={item.id}
                  onClick={() => router.push(`/partner/activity/${encodeURIComponent(item.id)}`)}
                  style={{ background: 'var(--partner-surface-1)', border: '1px solid var(--partner-border-hair)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', cursor: 'pointer' }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      {getStatusBadge(item)}
                      <span style={{ fontSize: '11px', color: 'var(--partner-muted)' }}>{displayDate}</span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--partner-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {displayTitle}
                    </div>
                    {item.customerName || item.customerPhone ? (
                      <div style={{ fontSize: '12px', color: 'var(--partner-text-2)', marginTop: '2px' }}>
                        Khách hàng: {item.customerName || 'N/A'} {item.customerPhone ? `(${item.customerPhone})` : ''}
                      </div>
                    ) : null}
                  </div>

                  <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
                    {totalText ? <div style={{ fontSize: '15px', fontWeight: 900, color: 'var(--partner-gold-bright)' }}>{totalText}</div> : null}
                    {discountText ? <div style={{ fontSize: '11px', color: 'var(--partner-muted)', marginTop: '2px' }}>{discountText}</div> : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
