'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ConfigProvider, DatePicker } from 'antd';
import viVN from 'antd/locale/vi_VN';
import dayjs from 'dayjs';
import { Plus, Search, Calendar, RefreshCw, FileText, Ticket, UserCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { usePartnerActivity } from '@/hooks/usePartnerActivity';
import { usePartnerStoreScope } from '@/app/partner/PartnerProviders';
import { PartnerActivityItem, PartnerActivityType } from '@/lib/api/partner-portal';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

const { RangePicker } = DatePicker;

const partnerPickerTheme = {
  token: {
    colorPrimary: '#d4b26a',
    colorBgContainer: 'rgba(255,255,255,.04)',
    colorBgElevated: '#1a191f',
    colorBorder: 'rgba(212,178,106,.22)',
    colorText: '#f3f0ea',
    colorTextPlaceholder: '#8c8679',
    borderRadius: 10,
    controlHeight: 40,
  },
};

const filterTabs: { key: PartnerActivityType; label: string; icon: any }[] = [
  { key: 'ALL', label: 'Tất cả', icon: RefreshCw },
  { key: 'BILL_PAYMENT', label: 'Thanh toán hóa đơn', icon: FileText },
  { key: 'COUPON_USAGE', label: 'Mã giảm giá', icon: Ticket },
  { key: 'BOOKING_CHECKIN', label: 'Check-in đặt bàn', icon: UserCheck },
];

export default function PartnerActivityFeedPage() {
  const router = useRouter();
  const { activeStore } = usePartnerStoreScope();
  const {
    items,
    data,
    loading,
    isLoading,
    loadingMore,
    isFetchingNextPage,
    hasMore,
    type,
    search,
    setType,
    setSearch,
    setStartDate,
    setEndDate,
    fetchNextPage,
    refresh,
    error,
  } = usePartnerActivity();

  const activityList = data || items || [];
  const loadingState = isLoading || loading;
  const loadingMoreState = isFetchingNextPage || loadingMore;

  const handleDateRangeChange = (dates: unknown, dateStrings: [string, string]) => {
    if (dates && dateStrings) {
      setStartDate(dateStrings[0] || '');
      setEndDate(dateStrings[1] || '');
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  const formatVnd = (amount?: number | null) => {
    if (amount === undefined || amount === null) return null;
    return `${amount.toLocaleString('vi-VN')} đ`;
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (item: PartnerActivityItem) => {
    const tone = item.badgeTone || 'info';
    const statusText = item.statusLabel || item.status;
    const toneStyles: Record<string, { bg: string; color: string; border: string }> = {
      success: { bg: 'rgba(141,230,176,.15)', color: '#8de6b0', border: 'rgba(141,230,176,.3)' },
      warning: { bg: 'rgba(212,178,106,.15)', color: '#d4b26a', border: 'rgba(212,178,106,.3)' },
      danger: { bg: 'rgba(255,180,168,.15)', color: '#ffb4a8', border: 'rgba(255,180,168,.3)' },
      info: { bg: 'rgba(140,190,255,.15)', color: '#8cbeff', border: 'rgba(140,190,255,.3)' },
    };
    const currentStyle = toneStyles[tone] || toneStyles.info || { bg: '', color: '', border: '' };

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '2px 8px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 800,
          background: currentStyle.bg,
          color: currentStyle.color,
          border: `1px solid ${currentStyle.border}`,
        }}
      >
        {statusText}
      </span>
    );
  };

  return (
    <ConfigProvider locale={viVN} theme={partnerPickerTheme}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 900,
                letterSpacing: '1px',
                color: 'var(--partner-gold)',
                marginBottom: '4px',
                textTransform: 'uppercase',
              }}
            >
              TRANSACTION & ACTIVITY FEED
            </div>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 900,
                color: 'var(--partner-text)',
                margin: 0,
              }}
            >
              Lịch sử hoạt động
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--partner-muted)', margin: '4px 0 0 0' }}>
              {activeStore ? `Đang xem: ${activeStore.name}` : 'Theo dõi hóa đơn, check-in và ưu đãi toàn cơ sở'}
            </p>
          </div>

          <Link
            href="/partner/activity/new-bill"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'var(--partner-gold-grad)',
              color: 'var(--partner-on-gold)',
              fontWeight: 900,
              fontSize: '13px',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(212,178,106,.25)',
            }}
          >
            <Plus size={16} /> Gửi hóa đơn mới
          </Link>
        </div>

        {/* Filter Controls Bar */}
        <div
          style={{
            background: 'var(--partner-surface-1)',
            border: '1px solid var(--partner-border-hair)',
            borderRadius: '14px',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {/* Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {filterTabs.map((tab) => {
              const IconComp = tab.icon;
              const isActive = type === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setType(tab.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: `1px solid ${isActive ? 'var(--partner-border-gold-40)' : 'var(--partner-border-soft)'}`,
                    background: isActive ? 'var(--partner-active-control-bg)' : 'transparent',
                    color: isActive ? 'var(--partner-gold-bright)' : 'var(--partner-text-2)',
                    fontSize: '12.5px',
                    fontWeight: isActive ? 900 : 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <IconComp size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search & Date Filter */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div style={{ flex: '1 1 260px', position: 'relative' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--partner-muted)',
                }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm hoạt động (mã bill, booking, sđt...)..."
                style={{
                  width: '100%',
                  height: '40px',
                  paddingLeft: '36px',
                  paddingRight: '12px',
                  borderRadius: '10px',
                  border: '1px solid var(--partner-border-gold-22)',
                  background: 'var(--partner-surface-2)',
                  color: 'var(--partner-text)',
                  fontSize: '13px',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ flex: '0 0 auto' }}>
              <RangePicker
                placeholder={['Từ ngày', 'Đến ngày']}
                onChange={handleDateRangeChange}
                style={{ width: '240px' }}
              />
            </div>
          </div>
        </div>

        {/* Error message */}
        {error ? (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'rgba(255,180,168,.12)',
              border: '1px solid rgba(255,180,168,.3)',
              color: 'var(--partner-danger)',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            {error.message || 'Không thể tải danh sách hoạt động.'}
          </div>
        ) : null}

        {/* Activity Feed List */}
        {loadingState ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <LoadingSkeleton rows={4} />
          </div>
        ) : activityList.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 20px',
              background: 'var(--partner-surface-1)',
              border: '1px dashed var(--partner-border-gold-22)',
              borderRadius: '14px',
              color: 'var(--partner-muted)',
            }}
          >
            <FileText size={40} style={{ color: 'var(--partner-gold)', opacity: 0.5, marginBottom: '12px' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--partner-text)', margin: '0 0 4px 0' }}>
              Chưa có hoạt động nào
            </h3>
            <p style={{ fontSize: '13px', margin: 0 }}>
              Không tìm thấy thông tin hoạt động phù hợp với bộ lọc đã chọn.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activityList.map((item) => {
              const displayTitle = item.title || item.summary || `Hoạt động #${item.rawId || item.id}`;
              const displayDate = formatDate(item.activityAt || item.createdAt);
              const totalText = formatVnd(item.totalVnd);
              const discountText = item.discountVnd !== undefined && item.discountVnd !== null
                ? `Giảm ${formatVnd(item.discountVnd)}`
                : item.discountVnd === null
                ? 'Giảm giá: Chưa xác định'
                : null;

              return (
                <div
                  key={item.id}
                  onClick={() => router.push(`/partner/activity/${encodeURIComponent(item.id)}`)}
                  style={{
                    background: 'var(--partner-surface-1)',
                    border: '1px solid var(--partner-border-hair)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--partner-border-gold-32)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--partner-border-hair)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      {getStatusBadge(item)}
                      <span style={{ fontSize: '11px', color: 'var(--partner-muted)' }}>{displayDate}</span>
                    </div>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 800,
                        color: 'var(--partner-text)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {displayTitle}
                    </div>
                    {item.customerName || item.customerPhone ? (
                      <div style={{ fontSize: '12px', color: 'var(--partner-text-2)', marginTop: '2px' }}>
                        Khách hàng: {item.customerName || 'N/A'}{' '}
                        {item.customerPhone ? `(${item.customerPhone})` : ''}{' '}
                        {item.customerTier ? `• ${item.customerTier}` : ''}
                      </div>
                    ) : null}
                  </div>

                  <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
                    {totalText ? (
                      <div style={{ fontSize: '15px', fontWeight: 900, color: 'var(--partner-gold-bright)' }}>
                        {totalText}
                      </div>
                    ) : null}
                    {discountText ? (
                      <div style={{ fontSize: '11px', color: 'var(--partner-muted)', marginTop: '2px' }}>
                        {discountText}
                      </div>
                    ) : null}
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: 'var(--partner-gold)',
                        marginTop: '4px',
                      }}
                    >
                      Chi tiết <ExternalLink size={12} />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Load More Button */}
            {hasMore ? (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  disabled={loadingMoreState}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    border: '1px solid var(--partner-border-gold-32)',
                    background: 'var(--partner-surface-2)',
                    color: 'var(--partner-gold-bright)',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: loadingMoreState ? 'not-allowed' : 'pointer',
                    opacity: loadingMoreState ? 0.7 : 1,
                  }}
                >
                  {loadingMoreState ? 'Đang tải thêm...' : 'Tải thêm'}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </ConfigProvider>
  );
}
