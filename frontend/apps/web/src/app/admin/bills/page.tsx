"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Info, X, Check, Image as ImageIcon } from 'lucide-react';
import { ApiError, apiClient, translateApiMessage, resolveClientUrl, getAuthToken } from '@/lib/api/client';
import { adminPageSize } from '../components/AdminPagination';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useSystemFeedback } from '@/components/ui/SystemFeedback';

const colors = {
  bg: '#0f0f13',
  surface1: '#18181f',
  surface2: '#202028',
  borderSoft: 'rgba(255,255,255,.05)',
  borderGold22: 'rgba(212,178,106,.22)',
  text: '#f3f0ea',
  text2: '#c5c0b6',
  muted: '#8c8679',
  onGold: '#241a0a',
  gold: '#d4b26a',
  goldBright: '#e3c27e',
  goldGrad: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)',
  green: '#4ade80',
  greenBg: 'rgba(74,222,128,0.1)',
  red: '#f87171',
  blue: '#60a5fa',
  blueBg: 'rgba(96,165,250,0.1)',
};

const getStatusLabel = (status: string) => {
  if (status === 'SUBMITTED') return 'Chờ duyệt';
  if (status === 'VERIFIED') return 'Đã duyệt';
  if (status === 'REJECTED') return 'Từ chối';
  return status;
};

type AdminBill = {
  id: string;
  billNumber?: string | null;
  store?: string | null;
  location?: string | null;
  amount?: number | null;
  date?: string | null;
  sender?: string | null;
  hasImage?: boolean;
  images?: string[];
  status: string;
  guestType?: string | null;
  discount?: number | null;
  discountPercent?: number | null;
  commissionPercent?: number | null;
  adminCommission?: number | null;
  points?: string | null;
  rejectReason?: string | null;
  booking?: any | null;
  coupon?: any | null;
  couponIssue?: any | null;
};

type AdminBillsMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type AdminBillsStats = {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalAmountPending: number;
};

type AdminBillsResponse = {
  data?: AdminBill[];
  meta?: AdminBillsMeta;
  stats?: AdminBillsStats;
};

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "Chưa có";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có";

  const tzString = date.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" });
  const tzDate = new Date(tzString);
  const pad = (n: number) => String(n).padStart(2, "0");
  
  const day = pad(tzDate.getDate());
  const month = pad(tzDate.getMonth() + 1);
  const year = tzDate.getFullYear();
  const hours = pad(tzDate.getHours());
  const minutes = pad(tzDate.getMinutes());

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const couponDiscountLabel = (
  coupon: any,
  issue: any,
) => {
  const snapshot = issue?.discountRuleSnapshot || issue?.metadata?.discountRuleSnapshot;
  const discountType = snapshot?.type ?? coupon?.discountType;
  const discountValue =
    snapshot?.value ??
    snapshot?.sourceValue ??
    coupon?.discountValue ??
    snapshot?.discountPercent ??
    issue?.discountPercent ??
    null;
  const maxDiscountVnd = snapshot?.maxDiscountVnd ?? coupon?.maxDiscountVnd ?? null;
  const minSpendVnd = snapshot?.minSpendVnd ?? coupon?.minSpendVnd ?? null;

  if (!discountType && !discountValue) return "";

  const mainLabel =
    discountType === "FIXED_AMOUNT"
      ? `-${Number(discountValue ?? 0).toLocaleString("vi-VN")}đ`
      : `-${Number(discountValue ?? 0)}%`;
  const detailParts = [];
  if (typeof maxDiscountVnd === "number" && maxDiscountVnd > 0) {
    detailParts.push(`tối đa ${maxDiscountVnd.toLocaleString("vi-VN")}đ`);
  }
  if (typeof minSpendVnd === "number" && minSpendVnd > 0) {
    detailParts.push(`đơn tối thiểu ${minSpendVnd.toLocaleString("vi-VN")}đ`);
  }

  return detailParts.length > 0 ? `${mainLabel} (${detailParts.join(", ")})` : mainLabel;
};

const isBookingAdminConfirmedForBill = (booking: any) =>
  ["CONFIRMED", "CHECKED_IN", "COMPLETED"].includes(
    String(booking?.status ?? "").toUpperCase(),
  );

const bookingConfirmedUsageAt = (booking: any) =>
  booking?.qr?.usedAt ??
  booking?.couponIssue?.usedAt ??
  (isBookingAdminConfirmedForBill(booking)
    ? booking?.confirmedAt ?? booking?.updatedAt ?? null
    : null);

const confirmedUsageSourceLabel = (
  booking: any,
  couponIssue: any,
) => {
  if (booking?.qr?.usedAt) return "QR booking đã được partner xác nhận";
  if (booking?.couponIssue?.usedAt) return "Coupon gắn booking đã được partner xác nhận";
  if (isBookingAdminConfirmedForBill(booking)) {
    return "Booking đã được Admin xác nhận";
  }
  if (couponIssue?.usedAt) return "Coupon đã được partner xác nhận";
  if (booking || couponIssue) return "Chưa có xác nhận sử dụng";
  return "Không có thông tin xác nhận";
};

export default function AdminBillsPage() {
  const feedback = useSystemFeedback();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';
  const city = searchParams.get('city') || '';
  const pageParam = parseInt(searchParams.get('page') || '1');

  const [activeTab, setActiveTab] = useState('pending');
  const [selectedBill, setSelectedBill] = useState<AdminBill | null>(null);
  const [billsList, setBillsList] = useState<AdminBill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [meta, setMeta] = useState<AdminBillsMeta | null>(null);
  const [stats, setStats] = useState<AdminBillsStats>({
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    totalAmountPending: 0
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectCustomReason, setRejectCustomReason] = useState('');
  const [rejectBillId, setRejectBillId] = useState('');

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveBillId, setApproveBillId] = useState('');

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(pathname + '?' + params.toString());
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    goToPage(1);
  };

  const fetchBills = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const res = await apiClient<AdminBillsResponse>('/admin/bills', {
        params: { status: activeTab, search, city, page: pageParam, limit: adminPageSize }
      });
      if (res && res.data) {
        setBillsList(res.data);
        if (res.stats) setStats(res.stats);
        if (res.meta) setMeta(res.meta);
      }
    } catch (e) {
      console.error(e);
      setBillsList([]);
      setMeta(null);
      setLoadError(
        e instanceof ApiError
          ? translateApiMessage(e.message, e.status)
          : 'Không tải được danh sách hóa đơn. Vui lòng thử lại.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, city, pageParam, search]);

  const handleApproveClick = (billId: string) => {
    setApproveBillId(billId);
    setShowApproveModal(true);
  };

  const handleApproveSubmit = async () => {
    setIsProcessing(true);
    try {
      await apiClient(`/admin/bills/${approveBillId}/status`, { method: 'PUT', data: { status: 'VERIFIED' } });
      fetchBills();
      setShowApproveModal(false);
      setSelectedBill(null);
    } catch (e) {
      console.error(e);
      feedback.showToast({ title: 'Có lỗi xảy ra khi duyệt bill', tone: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectClick = (billId: string) => {
    setRejectBillId(billId);
    setRejectReason('Ảnh mờ/không rõ');
    setRejectCustomReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    const finalReason = rejectReason === 'Khác' ? rejectCustomReason : rejectReason;
    if (!finalReason.trim()) {
      feedback.showToast({ title: 'Vui lòng nhập lý do từ chối!', tone: 'warning' });
      return;
    }
    
    setIsProcessing(true);
    try {
      await apiClient(`/admin/bills/${rejectBillId}/status`, { method: 'PUT', data: { status: 'REJECTED', reason: finalReason } });
      setShowRejectModal(false);
      fetchBills();
      setSelectedBill(null);
    } catch (e) {
      console.error(e);
      feedback.showToast({ title: 'Có lỗi xảy ra khi từ chối bill', tone: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };


  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void fetchBills();
    });
    return () => {
      cancelled = true;
    };
  }, [fetchBills]);

  const rowStartNumber = ((meta?.page ?? pageParam) - 1) * (meta?.limit ?? adminPageSize);

  return (
    <div className="nl-admin-page nl-admin-bills-page" style={{ padding: '32px 40px', position: 'relative', minHeight: '100%' }}>
      
      {/* TOP FILTERS */}
      <div className="nl-admin-list-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div className="nl-admin-tabs" style={{ display: 'flex', background: colors.surface1, borderRadius: '8px', padding: '4px', border: `1px solid ${colors.borderSoft}` }}>
          <button 
            onClick={() => handleTabChange('pending')}
            style={{
              background: activeTab === 'pending' ? colors.goldGrad : 'transparent',
              color: activeTab === 'pending' ? colors.onGold : colors.muted,
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Chờ duyệt</span>
            <span style={{ fontWeight: 700 }}>{stats?.pendingCount ?? 0}</span>
          </button>
          <button 
            onClick={() => handleTabChange('approved')}
            style={{
              background: activeTab === 'approved' ? colors.goldGrad : 'transparent',
              color: activeTab === 'approved' ? colors.onGold : colors.muted,
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Đã duyệt</span>
            <span style={{ fontWeight: 700 }}>{stats?.approvedCount ?? 0}</span>
          </button>
          <button 
            onClick={() => handleTabChange('rejected')}
            style={{
              background: activeTab === 'rejected' ? colors.goldGrad : 'transparent',
              color: activeTab === 'rejected' ? colors.onGold : colors.muted,
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Từ chối</span>
            <span style={{ fontWeight: 700 }}>{stats?.rejectedCount ?? 0}</span>
          </button>
        </div>

        <div style={{ 
          background: 'rgba(212,178,106,.05)', 
          border: `1px solid ${colors.borderGold22}`, 
          borderRadius: '8px', 
          padding: '8px 16px',
          color: colors.gold,
          fontSize: '13px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>$</span> Chờ duyệt: ≈ {(stats?.totalAmountPending ?? 0).toLocaleString('vi-VN')}đ
        </div>
      </div>


      {/* TABLE */}
      <div className="nl-admin-data-list nl-admin-bill-table-wrap" style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '16px', overflow: 'hidden' }}>
        <table className="nl-admin-bill-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <colgroup>
            <col style={{ width: '72px' }} />
            <col />
            <col />
            <col />
            <col />
            <col />
            <col />
            <col style={{ width: '132px' }} />
          </colgroup>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.borderSoft}` }}>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px', textAlign: 'center' }}>STT</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>MÃ BILL</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>QUÁN</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>SỐ TIỀN (GỘP)</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>NGÀY DV</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>NGƯỜI GỬI</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px', textAlign: 'center' }}>ẢNH</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px', textAlign: 'right' }}>TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: colors.muted }}>Đang tải dữ liệu...</td>
              </tr>
            ) : loadError ? (
              <tr>
                <td colSpan={8} style={{ padding: '28px 32px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: colors.red, background: 'rgba(248,113,113,.08)', border: '1px solid rgba(248,113,113,.24)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', fontWeight: 700 }}>
                    <Info size={16} />
                    {loadError}
                  </div>
                </td>
              </tr>
            ) : billsList.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: colors.muted }}>Không có hóa đơn nào</td>
              </tr>
            ) : billsList.map((bill, idx) => (
              <tr 
                key={idx} 
                onClick={() => setSelectedBill(bill)}
                style={{ 
                  borderBottom: `1px solid ${colors.borderSoft}`,
                  cursor: 'pointer',
                  background: selectedBill?.id === bill.id ? colors.surface2 : 'transparent',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = colors.surface2}
                onMouseLeave={(e) => e.currentTarget.style.background = selectedBill?.id === bill.id ? colors.surface2 : 'transparent'}
              >
                <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: colors.muted, textAlign: 'center' }}>{rowStartNumber + idx + 1}</td>
                <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 700, color: colors.gold }}>{bill.billNumber || bill.id}</td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: colors.text }}>{bill.store || 'N/A'}</div>
                  <div style={{ fontSize: '12px', color: colors.muted, marginTop: '2px' }}>{bill.location || 'N/A'}</div>
                </td>
                <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 700, color: colors.text }}>{(bill.amount || 0).toLocaleString('vi-VN')}đ</td>
                <td style={{ padding: '16px 24px', fontSize: '14px', color: colors.text2 }}>{bill.date ? new Date(bill.date).toLocaleDateString('vi-VN') : 'N/A'}</td>
                <td style={{ padding: '16px 24px', fontSize: '14px', color: colors.text2 }}>{bill.sender || 'N/A'}</td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  {bill.hasImage ? (
                    <span style={{ 
                      background: colors.greenBg, 
                      color: colors.green, 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '11px', 
                      fontWeight: 600,
                      border: `1px solid ${colors.green}40`
                    }}>Có</span>
                  ) : (
                    <span style={{ color: colors.muted, fontSize: '14px', fontWeight: 600 }}>—</span>
                  )}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <span style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '76px',
                    border: `1px solid ${colors.borderGold22}`, 
                    color: colors.gold, 
                    padding: '6px 16px', 
                    borderRadius: '20px', 
                    fontSize: '12px', 
                    lineHeight: 1,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    background: 'rgba(212,178,106,.05)'
                  }}>
                    {getStatusLabel(bill.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {meta && meta.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '16px', borderTop: `1px solid ${colors.borderSoft}` }}>
            <button 
              disabled={pageParam <= 1}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('page', (pageParam - 1).toString());
                router.push(pathname + '?' + params.toString());
              }}
              style={{ background: colors.surface2, color: colors.text, border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: pageParam <= 1 ? 'not-allowed' : 'pointer', opacity: pageParam <= 1 ? 0.5 : 1 }}
            >
              Trước
            </button>
            <span style={{ color: colors.muted, display: 'flex', alignItems: 'center', fontSize: '13px' }}>
              Trang {pageParam} / {meta.totalPages}
            </span>
            <button 
              disabled={pageParam >= meta.totalPages}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('page', (pageParam + 1).toString());
                router.push(pathname + '?' + params.toString());
              }}
              style={{ background: colors.surface2, color: colors.text, border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: pageParam >= meta.totalPages ? 'not-allowed' : 'pointer', opacity: pageParam >= meta.totalPages ? 0.5 : 1 }}
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {/* SIDE DRAWER (Modal) */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: selectedBill ? 0 : '-400px',
        bottom: 0,
        width: '400px',
        background: colors.bg,
        borderLeft: `1px solid ${colors.borderSoft}`,
        boxShadow: selectedBill ? '-10px 0 30px rgba(0,0,0,0.5)' : 'none',
        transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {selectedBill && (
          <>
            <div style={{ padding: '24px', borderBottom: `1px solid ${colors.borderSoft}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: colors.muted, marginBottom: '8px' }}>
                    HÓA ĐƠN · {selectedBill.id}
                  </div>
                  <h2 style={{ fontSize: '24px', fontWeight: 700, color: colors.text, margin: '0 0 16px 0' }}>{selectedBill.store}</h2>
                  <span style={{ 
                    border: `1px solid ${colors.borderGold22}`, 
                    color: colors.gold, 
                    padding: '4px 12px', 
                    borderRadius: '12px', 
                    fontSize: '12px', 
                    fontWeight: 600,
                    background: 'rgba(212,178,106,.05)'
                  }}>
                    {getStatusLabel(selectedBill.status)}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedBill(null)}
                  style={{
                    width: 32, height: 32, borderRadius: '8px', 
                    background: colors.surface2, color: colors.muted, 
                    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
              {/* Rejection Reason Banner */}
              {selectedBill.status === 'REJECTED' && selectedBill.rejectReason && (
                <div style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: `1px solid rgba(239,68,68,0.2)`,
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '24px',
                  color: colors.red,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <div style={{ marginTop: '2px' }}><Info size={16} /></div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Lý do từ chối</div>
                    <div style={{ fontSize: '13px' }}>{selectedBill.rejectReason}</div>
                  </div>
                </div>
              )}
              {/* Image Preview */}
              {selectedBill.hasImage && selectedBill.images && selectedBill.images.length > 0 ? (
                <div style={{ marginBottom: '32px', borderRadius: '12px', overflow: 'hidden', border: `1px solid ${colors.borderSoft}` }}>
                  <img src={`${resolveClientUrl(selectedBill.images[0])}?token=${getAuthToken()}`} alt="Bill preview" style={{ width: '100%', display: 'block' }} />
                </div>
              ) : (
                <div style={{ 
                  height: 200, 
                  borderRadius: '12px', 
                  border: `1px dashed ${colors.borderSoft}`, 
                  background: colors.surface1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.muted,
                  marginBottom: '32px'
                }}>
                  <ImageIcon size={24} style={{ marginBottom: '8px' }} />
                  <span style={{ fontSize: '13px' }}>Ảnh hóa đơn đính kèm</span>
                </div>
              )}

              {/* Basic Info */}

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: `1px solid ${colors.borderSoft}`, marginBottom: '16px' }}>
                <span style={{ color: colors.muted, fontSize: '14px' }}>Người gửi</span>
                <span style={{ color: colors.text, fontSize: '14px', fontWeight: 600 }}>{selectedBill.sender}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '24px', marginBottom: '8px' }}>
                <span style={{ color: colors.muted, fontSize: '14px' }}>Hạng khách</span>
                <span style={{ 
                  background: colors.surface2, 
                  color: colors.blue, 
                  padding: '4px 12px', 
                  borderRadius: '6px', 
                  fontSize: '12px', 
                  fontWeight: 600,
                  border: `1px solid ${colors.borderSoft}`
                }}>{selectedBill.guestType}</span>
              </div>

              {/* Linked Booking Box */}
              {selectedBill.booking && (
                <div style={{
                  background: colors.surface1,
                  border: `1px solid ${colors.borderGold22}`,
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${colors.borderSoft}`, paddingBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: colors.gold }}>ĐƠN HÀNG ĐANG LIÊN KẾT</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: colors.muted }}>Mã booking</span>
                    <span style={{ color: colors.goldBright, fontWeight: 700 }}>#{selectedBill.booking.bookingCode || selectedBill.booking.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: colors.muted }}>Giờ hẹn</span>
                    <span style={{ color: colors.text }}>{formatDateTime(selectedBill.booking.scheduledAt)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: colors.muted }}>Xác nhận sử dụng</span>
                    <span style={{ color: colors.text, textAlign: 'right' }}>
                      {bookingConfirmedUsageAt(selectedBill.booking)
                        ? formatDateTime(bookingConfirmedUsageAt(selectedBill.booking))
                        : "Chưa có xác nhận"}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: colors.muted }}>Chi tiết xác nhận</span>
                    <span style={{ fontSize: '12px', color: colors.blue }}>
                      {confirmedUsageSourceLabel(selectedBill.booking, selectedBill.booking.couponIssue)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: colors.muted }}>Số người</span>
                    <span style={{ color: colors.text }}>{selectedBill.booking.partySize} người</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: colors.muted }}>Coupon/QR</span>
                    <span style={{ color: colors.text }}>
                      {selectedBill.booking.coupon?.name ??
                        selectedBill.booking.couponIssue?.code ??
                        "QR đặt chỗ"}
                    </span>
                  </div>
                  {couponDiscountLabel(selectedBill.booking.coupon, selectedBill.booking.couponIssue) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: colors.muted }}>Mức giảm</span>
                      <span style={{ color: colors.red, fontWeight: 600 }}>
                        {couponDiscountLabel(selectedBill.booking.coupon, selectedBill.booking.couponIssue)}
                      </span>
                    </div>
                  )}
                  {selectedBill.booking.note && (
                    <div style={{ borderTop: `1px solid ${colors.borderSoft}`, paddingTop: '8px', fontSize: '12px', color: colors.muted }}>
                      <strong style={{ display: 'block', marginBottom: '2px', color: colors.text }}>Ghi chú:</strong>
                      {selectedBill.booking.note}
                    </div>
                  )}
                </div>
              )}

              {/* Linked Coupon Box (if no booking but direct coupon) */}
              {!selectedBill.booking && (selectedBill.coupon || selectedBill.couponIssue) && (
                <div style={{
                  background: colors.surface1,
                  border: `1px solid ${colors.borderGold22}`,
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${colors.borderSoft}`, paddingBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: colors.gold }}>COUPON ĐANG LIÊN KẾT</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: colors.muted }}>Mã coupon</span>
                    <span style={{ color: colors.goldBright, fontWeight: 700 }}>#{selectedBill.couponIssue?.code || selectedBill.coupon?.code || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: colors.muted }}>Tên coupon</span>
                    <span style={{ color: colors.text }}>{selectedBill.coupon?.name || 'Mã giảm giá'}</span>
                  </div>
                  {couponDiscountLabel(selectedBill.coupon, selectedBill.couponIssue) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: colors.muted }}>Mức giảm</span>
                      <span style={{ color: colors.red, fontWeight: 600 }}>
                        {couponDiscountLabel(selectedBill.coupon, selectedBill.couponIssue)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Calculation Box */}
              <div style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '12px', padding: '24px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: colors.gold, marginBottom: '20px' }}>ĐỐI SOÁT & GHI NHẬN</div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ color: colors.text2, fontSize: '14px' }}>Bill gốc</span>
                  <span style={{ color: colors.text, fontSize: '14px', fontWeight: 700 }}>{(selectedBill.amount || 0).toLocaleString('vi-VN')}đ</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: `1px solid ${colors.borderSoft}`, marginBottom: '16px' }}>
                  <span style={{ color: colors.text2, fontSize: '14px' }}>Giảm giá ({selectedBill.discountPercent}%)</span>
                  <span style={{ color: colors.red, fontSize: '14px', fontWeight: 700 }}>– {(selectedBill.discount || 0).toLocaleString('vi-VN')}đ</span>
                </div>

                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: colors.text2, fontSize: '14px' }}>Điểm tích lũy</span>
                  <span style={{ color: colors.text, fontSize: '14px', fontWeight: 700 }}>{selectedBill.points}</span>
                </div>
              </div>
            </div>

            {/* Actions Footer - Only show if pending */}
            {(selectedBill.status === 'SUBMITTED' || selectedBill.status === 'Chờ duyệt') && (
              <div style={{ padding: '24px', borderTop: `1px solid ${colors.borderSoft}`, display: 'flex', gap: '16px' }}>
                <button 
                  onClick={() => handleApproveClick(selectedBill.id)}
                  disabled={isProcessing}
                  style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: colors.goldGrad,
                  color: colors.onGold,
                  border: 'none',
                  height: '48px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  opacity: isProcessing ? 0.7 : 1
                }}>
                  <Check size={18} strokeWidth={3} />
                  Duyệt & ghi nhận
                </button>
                <button 
                  onClick={() => handleRejectClick(selectedBill.id)}
                  disabled={isProcessing}
                  style={{
                    width: '120px',
                    background: 'transparent',
                    color: '#e0729e',
                    border: `1px solid rgba(224,114,158,.3)`,
                    height: '48px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    opacity: isProcessing ? 0.7 : 1
                }}>
                  Từ chối
                </button>
              </div>
            )}
          </>
        )}
      </div>


      {/* REJECT MODAL */}
      {showRejectModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', zIndex: 1100,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: colors.surface1, width: '400px', borderRadius: '16px',
            border: `1px solid ${colors.borderSoft}`, padding: '24px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: colors.text, fontSize: '18px' }}>Từ chối Bill</h3>
            <p style={{ color: colors.text2, fontSize: '14px', marginBottom: '16px' }}>Vui lòng chọn lý do từ chối để thông báo cho người dùng.</p>
            
            <select 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{
                width: '100%', height: '40px', background: colors.surface2, border: `1px solid ${colors.borderSoft}`,
                borderRadius: '8px', color: colors.text, padding: '0 12px', fontSize: '14px', outline: 'none', marginBottom: '16px'
              }}
            >
              <option value="Ảnh mờ/không rõ">Ảnh mờ/không rõ</option>
              <option value="Gửi nhầm quán">Gửi nhầm quán</option>
              <option value="Sai thông tin quán">Sai thông tin quán</option>
              <option value="Hóa đơn quá hạn">Hóa đơn quá hạn</option>
              <option value="Khác">Khác...</option>
            </select>

            {rejectReason === 'Khác' && (
              <input 
                type="text" 
                placeholder="Nhập lý do khác..." 
                value={rejectCustomReason}
                onChange={(e) => setRejectCustomReason(e.target.value)}
                style={{
                  width: '100%', height: '40px', background: colors.surface2, border: `1px solid ${colors.borderSoft}`,
                  borderRadius: '8px', color: colors.text, padding: '0 12px', fontSize: '14px', outline: 'none', marginBottom: '16px'
                }}
              />
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowRejectModal(false)}
                style={{
                  padding: '8px 16px', background: 'transparent', color: colors.text2,
                  border: `1px solid ${colors.borderSoft}`, borderRadius: '6px', fontSize: '14px', cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button 
                onClick={handleRejectSubmit}
                disabled={isProcessing}
                style={{
                  padding: '8px 16px', background: colors.red, color: '#fff',
                  border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: isProcessing ? 'not-allowed' : 'pointer'
                }}
              >
                {isProcessing ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}

        {/* APPROVE MODAL */}
        {showApproveModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 1100,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              background: colors.surface1, width: '400px', borderRadius: '16px',
              border: `1px solid ${colors.borderGold22}`, padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(212,178,106,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={20} color={colors.gold} />
                </div>
                <h3 style={{ margin: 0, color: colors.text, fontSize: '18px' }}>Duyệt hóa đơn</h3>
              </div>
              <p style={{ color: colors.text2, fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
                Bạn có chắc chắn muốn duyệt hóa đơn này không? Dữ liệu doanh thu và điểm tích lũy sẽ được cập nhật ngay lập tức.
              </p>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setShowApproveModal(false)}
                  style={{
                    padding: '8px 16px', background: 'transparent', color: colors.text2,
                    border: `1px solid ${colors.borderSoft}`, borderRadius: '6px', fontSize: '14px', cursor: 'pointer'
                  }}
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={handleApproveSubmit}
                  disabled={isProcessing}
                  style={{
                    padding: '8px 16px', background: colors.goldGrad, color: colors.onGold,
                    border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: isProcessing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isProcessing ? 'Đang xử lý...' : 'Xác nhận duyệt'}
                </button>
              </div>
            </div>
          </div>
        )}

    </div>
  );
}
