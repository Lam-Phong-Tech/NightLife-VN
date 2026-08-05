'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Share2, AlertCircle, RefreshCcw } from 'lucide-react';
import { fetchPartnerActivityDetail, PartnerActivityItem } from '@/lib/api/partner-portal';
import { usePartnerStoreScope } from '@/app/partner/PartnerProviders';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useSystemFeedback } from '@/components/ui/SystemFeedback';

export default function PartnerActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const feedback = useSystemFeedback();
  const { selectedStoreId } = usePartnerStoreScope();

  const activityId = (params?.activityId as string) || '';

  const [item, setItem] = useState<PartnerActivityItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activityId) return;
    let mounted = true;
    const controller = new AbortController();

    async function loadDetail() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPartnerActivityDetail(activityId, selectedStoreId, controller.signal);
        if (mounted) {
          setItem(data);
        }
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'name' in err && err.name === 'AbortError') return;
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Không thể tải chi tiết hoạt động.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDetail();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [activityId, selectedStoreId]);

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

  const copyShareLink = () => {
    if (typeof window !== 'undefined' && window.navigator?.clipboard) {
      window.navigator.clipboard.writeText(window.location.href);
      feedback.showToast({
        tone: 'success',
        title: 'Đã sao chép liên kết',
        description: 'Đã lưu đường dẫn chi tiết hoạt động vào bộ nhớ tạm.',
      });
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 16px' }}>
        <LoadingSkeleton rows={2} />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 16px', textAlign: 'center' }}>
        <div style={{ color: 'var(--partner-danger)', fontSize: '15px', fontWeight: 800, marginBottom: '16px' }}>
          {error || 'Không tìm thấy chi tiết hoạt động.'}
        </div>
        <Link
          href="/partner/activity"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--partner-gold-bright)',
            fontWeight: 800,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} /> Quay lại danh sách hoạt động
        </Link>
      </div>
    );
  }

  const grossText = formatVnd(item.totalVnd);
  const discountText = item.discountVnd !== undefined && item.discountVnd !== null
    ? formatVnd(item.discountVnd)
    : item.discountVnd === null
    ? 'Chưa xác định'
    : null;

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Link
          href="/partner/activity"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--partner-gold-bright)',
            fontSize: '13px',
            fontWeight: 800,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} /> Quay lại danh sách
        </Link>

        <button
          type="button"
          onClick={copyShareLink}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '8px',
            border: '1px solid var(--partner-border-gold-22)',
            background: 'var(--partner-surface-2)',
            color: 'var(--partner-text-2)',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          <Share2 size={14} /> Chia sẻ
        </button>
      </div>

      {/* Main Card */}
      <div
        style={{
          background: 'var(--partner-surface-1)',
          border: '1px solid var(--partner-border-hair)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Title & Status */}
        <div style={{ borderBottom: '1px solid var(--partner-border-hair)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 900,
                color: 'var(--partner-gold)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              {item.sourceType} • {item.activityType}
            </span>
            <span
              style={{
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 800,
                background: 'rgba(212,178,106,.15)',
                color: 'var(--partner-gold-bright)',
                border: '1px solid rgba(212,178,106,.3)',
              }}
            >
              {item.statusLabel || item.status}
            </span>
          </div>

          <h1 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--partner-text)', margin: '0 0 4px 0' }}>
            {item.summary || item.title || `Hoạt động #${item.rawId || item.id}`}
          </h1>
          <div style={{ fontSize: '12px', color: 'var(--partner-muted)' }}>
            Thời gian: {formatDate(item.activityAt || item.createdAt)}
          </div>
        </div>

        {/* Rejection Alert if rejected */}
        {item.status === 'REJECTED' ? (
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'rgba(255,180,168,.12)',
              border: '1px solid rgba(255,180,168,.3)',
              color: 'var(--partner-danger)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '14px' }}>
              <AlertCircle size={18} /> Hóa đơn bị từ chối
            </div>
            {item.rejectReason ? (
              <p style={{ fontSize: '13px', margin: '6px 0 12px 0' }}>Lý do: {item.rejectReason}</p>
            ) : null}
            <Link
              href="/partner/activity/new-bill"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'var(--partner-danger)',
                color: '#241a0a',
                fontSize: '12px',
                fontWeight: 900,
                textDecoration: 'none',
              }}
            >
              <RefreshCcw size={14} /> Gửi lại hóa đơn
            </Link>
          </div>
        ) : null}

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {/* Customer & Store Info */}
          <div
            style={{
              background: 'var(--partner-surface-2)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid var(--partner-border-soft)',
            }}
          >
            <h3 style={{ fontSize: '13px', fontWeight: 900, color: 'var(--partner-gold)', margin: '0 0 12px 0' }}>
              THÔNG TIN QUÁN & KHÁCH HÀNG
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--partner-muted)' }}>Cơ sở: </span>
                <strong style={{ color: 'var(--partner-text)' }}>{item.storeName}</strong>
              </div>
              {item.customerName ? (
                <div>
                  <span style={{ color: 'var(--partner-muted)' }}>Khách hàng: </span>
                  <strong style={{ color: 'var(--partner-text)' }}>{item.customerName}</strong>
                </div>
              ) : null}
              {item.customerPhone ? (
                <div>
                  <span style={{ color: 'var(--partner-muted)' }}>SĐT: </span>
                  <span style={{ color: 'var(--partner-text)' }}>{item.customerPhone}</span>
                </div>
              ) : null}
              {item.customerTier ? (
                <div>
                  <span style={{ color: 'var(--partner-muted)' }}>Hạng thành viên: </span>
                  <span style={{ color: 'var(--partner-gold-bright)', fontWeight: 800 }}>{item.customerTier}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div
            style={{
              background: 'var(--partner-surface-2)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid var(--partner-border-soft)',
            }}
          >
            <h3 style={{ fontSize: '13px', fontWeight: 900, color: 'var(--partner-gold)', margin: '0 0 12px 0' }}>
              CHI TIẾT TÀI CHÍNH
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              {grossText ? (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--partner-muted)' }}>Tổng tiền gốc:</span>
                  <strong style={{ color: 'var(--partner-text)' }}>{grossText}</strong>
                </div>
              ) : null}
              {discountText ? (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--partner-muted)' }}>Giảm giá:</span>
                  <span style={{ color: 'var(--partner-gold-bright)', fontWeight: 800 }}>{discountText}</span>
                </div>
              ) : null}
              {item.couponCode ? (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--partner-muted)' }}>Mã ưu đãi:</span>
                  <span style={{ color: 'var(--partner-text)', fontWeight: 800 }}>{item.couponCode}</span>
                </div>
              ) : null}
              {item.billNumber ? (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--partner-muted)' }}>Số hóa đơn:</span>
                  <span style={{ color: 'var(--partner-text)' }}>{item.billNumber}</span>
                </div>
              ) : null}
              {item.bookingCode ? (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--partner-muted)' }}>Mã booking:</span>
                  <span style={{ color: 'var(--partner-text)' }}>{item.bookingCode}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
