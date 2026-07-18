"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, X, Eye, Shield, Activity, User, Monitor, ChevronDown, CheckCircle2, XCircle } from 'lucide-react';
import { getAuditLogs, AuditLogRec } from '@/lib/api/audit-logs';
import { getAuthUser } from '@/lib/auth/session';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { TableLoadingRows } from '@/components/ui/DataLoading';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const colors = {
  bg: '#0c0c0f',
  surface1: 'rgba(255,255,255,.02)',
  borderSoft: 'rgba(255,255,255,.06)',
  borderSoft2: 'rgba(255,255,255,.04)',
  text: '#f3f0ea',
  text2: '#c5c0b6',
  muted: '#8c8679',
  onGold: '#241a0a',
  gold: '#d4b26a',
  goldGrad: 'linear-gradient(135deg,#f0dda8,#d4b26a)',
  blue: '#60a5fa',
  pink: '#f472b6',
  green: '#4ade80',
  red: '#f87171'
};

// Custom Dropdown Component
function CustomDropdown({ value, options, onChange, placeholder = 'Chọn...' }: { value: string, options: {id: string, label: string}[], onChange: (v: string) => void, placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find(o => o.id === value);

  return (
    <div ref={ref} style={{ position: 'relative', width: 160 }}>
      <div 
        onClick={() => setOpen(!open)}
        style={{ background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '9px 14px', color: selected ? colors.text : colors.muted, fontSize: '12.5px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <ChevronDown size={14} style={{ color: colors.muted }} />
      </div>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: '#1a1921', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', zIndex: 10, boxShadow: '0 10px 40px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
          {options.map(opt => (
            <div 
              key={opt.id} 
              onClick={() => { onChange(opt.id); setOpen(false); }}
              style={{ padding: '10px 14px', fontSize: '12.5px', color: opt.id === value ? colors.gold : colors.text, background: opt.id === value ? 'rgba(212,178,106,.1)' : 'transparent', cursor: 'pointer' }}
              onMouseEnter={(e) => { if (opt.id !== value) e.currentTarget.style.background = 'rgba(255,255,255,.05)'; }}
              onMouseLeave={(e) => { if (opt.id !== value) e.currentTarget.style.background = 'transparent'; }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface DiffItem {
  field: string;
  label: string;
  before: string;
  after: string;
}

const actionNames: Record<string, string> = {
  'ranking.config.create': 'Tạo thiết lập xếp hạng',
  'ranking.config.update': 'Cập nhật thiết lập xếp hạng',
  'ranking.config.delete': 'Xóa thiết lập xếp hạng',
  'PROFILE_VIEW_RECORDED': 'Ghi nhận lượt xem hồ sơ',
  'BOOKING_RESCHEDULE_REJECTED': 'Từ chối đổi lịch hẹn',
  'BOOKING_RESCHEDULE_APPROVED': 'Duyệt đổi lịch hẹn',
  'BOOKING_POLICY_UPDATED': 'Cập nhật chính sách đặt phòng',
  'BOOKING_CANCELLED': 'Hủy lịch đặt phòng/bàn',
  'BOOKING_QR_SCANNED': 'Quét QR lịch hẹn',
  'BOOKING_STATUS_CHANGED': 'Đổi trạng thái lịch hẹn',
  'COUPON_ISSUE_SCANNED': 'Quét mã QR ưu đãi',
  'COUPON_ISSUE_USED': 'Sử dụng mã ưu đãi',
  'COUPON_QR_TOKEN_REVOKED': 'Thu hồi mã QR ưu đãi',
  'COUPON_QR_TOKEN_ROTATED': 'Xoay vòng mã QR ưu đãi',
  'bill.review.pending_pm_ba': 'Chờ duyệt chiết khấu đặc biệt (PM/BA)',
  'bill.review.approve': 'Duyệt hóa đơn',
  'bill.review.reject': 'Từ chối duyệt hóa đơn',
  'bill.review.void': 'Hủy/vô hiệu hóa hóa đơn',
  'bill.reversal': 'Yêu cầu hoàn trả hóa đơn',
  'bill.fraud.auto_reversal': 'Hệ thống tự động hoàn trả (nghi vấn gian lận)',
  'bill.submit': 'Gửi yêu cầu thanh toán',
  'bill.coupon.link': 'Áp dụng mã giảm giá',
  'COUPON_ISSUE_BOOKING_QR_ISSUED': 'Phát hành ưu đãi qua đặt lịch',
  'BOOKING_RESCHEDULE_REQUESTED': 'Yêu cầu đổi lịch hẹn',
  'BOOKING_RESCHEDULED_SELF_SERVICE': 'Khách tự đổi lịch hẹn',
};

function getJsonDiff(before: any, after: any): DiffItem[] {
  if (!before && !after) return [];
  const b = before || {};
  const a = after || {};
  const allKeys = Array.from(new Set([...Object.keys(b), ...Object.keys(a)]));
  const diffs: DiffItem[] = [];

  const fieldLabels: Record<string, string> = {
    status: 'Trạng thái',
    totalVnd: 'Tổng tiền',
    subtotalVnd: 'Tạm tính',
    paidVnd: 'Thực trả',
    discountVnd: 'Giảm giá',
    taxVnd: 'Thuế VAT',
    serviceChargeVnd: 'Phí dịch vụ',
    commissionAmountVnd: 'Tiền hoa hồng',
    pointsEarned: 'Điểm tích lũy',
    rejectReason: 'Lý do từ chối',
    rejectedById: 'Người từ chối (ID)',
    reviewedById: 'Người duyệt (ID)',
    verifiedById: 'Người xác thực (ID)',
    reviewedAt: 'Thời gian duyệt',
    verifiedAt: 'Thời gian xác thực',
    rejectedAt: 'Thời gian từ chối',
    startsAt: 'Thời gian bắt đầu',
    endsAt: 'Thời gian kết thúc',
    name: 'Tên',
    displayName: 'Tên hiển thị',
    email: 'Email',
    phone: 'Số điện thoại',
    role: 'Vai trò',
    tier: 'Hạng thành viên',
    bookingDate: 'Ngày đặt lịch',
    bookingTime: 'Giờ đặt lịch',
    customerName: 'Tên khách hàng',
    customerPhone: 'SĐT khách hàng',
    adultsCount: 'Số khách',
    notes: 'Ghi chú',
    rating: 'Đánh giá',
    comment: 'Bình luận',
    address: 'Địa chỉ',
    description: 'Mô tả',
    isActive: 'Trạng thái hoạt động',
  };

  const statusTranslations: Record<string, string> = {
    SUBMITTED: 'Chờ duyệt',
    VERIFIED: 'Đã xác thực',
    REJECTED: 'Đã từ chối',
    PENDING_PM_BA: 'Chờ PM/BA duyệt',
    ACTIVE: 'Hoạt động',
    INACTIVE: 'Ngừng hoạt động',
    USED: 'Đã sử dụng',
    UNUSED: 'Chưa sử dụng',
    EXPIRED: 'Đã hết hạn',
    CANCELLED: 'Đã hủy',
    PENDING: 'Chờ xử lý',
  };

  const formatValue = (key: string, val: any) => {
    if (val === null || val === undefined) return 'Trống';
    if (typeof val === 'boolean') return val ? 'Bật' : 'Tắt';
    if (key.endsWith('Vnd') && typeof val === 'number') {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    }
    if (key === 'status' && typeof val === 'string' && statusTranslations[val]) {
      return statusTranslations[val];
    }
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
      return dayjs(val).format('DD/MM/YYYY HH:mm:ss');
    }
    if (typeof val === 'object') {
      return JSON.stringify(val);
    }
    return String(val);
  };

  for (const key of allKeys) {
    if (['id', 'createdAt', 'updatedAt'].includes(key)) continue;

    const valB = b[key];
    const valA = a[key];

    if (JSON.stringify(valB) !== JSON.stringify(valA)) {
      diffs.push({
        field: key,
        label: fieldLabels[key] || key,
        before: formatValue(key, valB),
        after: formatValue(key, valA),
      });
    }
  }

  return diffs;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogRec[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [module, setModule] = useState('all');
  const [result, setResult] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState<AuditLogRec | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getAuditLogs({
        page,
        limit: 20,
        module: module === 'all' ? undefined : module,
        result: result === 'all' ? undefined : result
      });
      setLogs(res.items || []);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalItems(res.meta?.total || 0);
    } catch (e) {
      console.error('Failed to fetch audit logs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, module, result]);

  const moduleOptions = [
    { id: 'all', label: 'Tất cả module' },
    { id: 'Ranking', label: 'Ranking' },
    { id: 'Store', label: 'Store (Quán)' },
    { id: 'Cast', label: 'Cast (Nhân viên)' },
    { id: 'Booking', label: 'Booking' },
    { id: 'Bill', label: 'Bill (Hóa đơn)' },
    { id: 'QR', label: 'QR Ưu đãi' },
    { id: 'User', label: 'Người dùng/Admin' }
  ];

  const resultOptions = [
    { id: 'all', label: 'Tất cả kết quả' },
    { id: 'SUCCESS', label: 'Thành công' },
    { id: 'FAILED', label: 'Thất bại' }
  ];

  const renderBadge = (role?: string) => {
    if (!role) return <span style={{ color: colors.muted, fontSize: '11px' }}>Hệ thống</span>;
    const r = role.toUpperCase();
    if (r === 'SUPER_ADMIN') return <span style={{ background: 'rgba(232,80,80,.1)', border: '1px solid rgba(232,80,80,.3)', color: '#e85050', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600 }}>Super Admin</span>;
    if (r === 'ADMIN') return <span style={{ background: 'rgba(212,178,106,.12)', border: '1px solid rgba(212,178,106,.3)', color: '#e3c27e', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600 }}>Admin</span>;
    if (r === 'OPERATOR') return <span style={{ background: 'rgba(111,159,216,.12)', border: '1px solid rgba(111,159,216,.28)', color: '#8fb6e4', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600 }}>Vận hành</span>;
    return <span style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', color: '#9b958a', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600 }}>{role}</span>;
  };

  return (
    <div style={{ padding: '22px 26px 44px', minHeight: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <span style={{ fontSize: '17px', fontWeight: 700, color: '#f3f0ea' }}>Audit Log</span>
        <span style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(212,178,106,.4), transparent)' }}></span>
      </div>
      
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <CustomDropdown value={module} options={moduleOptions} onChange={(v) => { setModule(v); setPage(1); }} />
        <CustomDropdown value={result} options={resultOptions} onChange={(v) => { setResult(v); setPage(1); }} />
      </div>

      <div style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,.03)', borderBottom: `1px solid ${colors.borderSoft}` }}>
              <th style={{ padding: '12px 16px', fontSize: '11.5px', color: colors.muted, fontWeight: 600, width: '150px' }}>Thời gian</th>
              <th style={{ padding: '12px 16px', fontSize: '11.5px', color: colors.muted, fontWeight: 600 }}>Người thao tác</th>
              <th style={{ padding: '12px 16px', fontSize: '11.5px', color: colors.muted, fontWeight: 600 }}>Module</th>
              <th style={{ padding: '12px 16px', fontSize: '11.5px', color: colors.muted, fontWeight: 600 }}>Hành động / Tóm tắt</th>
              <th style={{ padding: '12px 16px', fontSize: '11.5px', color: colors.muted, fontWeight: 600, width: '100px' }}>Kết quả</th>
              <th style={{ padding: '12px 16px', fontSize: '11.5px', color: colors.muted, fontWeight: 600, width: '70px', textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableLoadingRows columns={6} rows={6} ariaLabel="Đang tải lịch sử thao tác" />
            ) : logs.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: colors.muted, fontSize: '13px' }}>Không có lịch sử thao tác nào.</td></tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} style={{ borderBottom: `1px solid ${colors.borderSoft2}` }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '12.5px', color: colors.text, fontWeight: 500 }}>{dayjs(log.createdAt).format('DD/MM/YYYY HH:mm')}</div>
                    <div style={{ fontSize: '11px', color: colors.muted, marginTop: '2px' }}>{dayjs(log.createdAt).fromNow()}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontSize: '13px', color: colors.text, fontWeight: 600 }}>{log.actorName || log.actorId || 'Hệ thống'}</div>
                      {renderBadge(log.actorRole)}
                    </div>
                    {log.ipAddress && <div style={{ fontSize: '10.5px', color: colors.muted, marginTop: '3px' }}>IP: {log.ipAddress}</div>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#e3c27e', background: 'rgba(212,178,106,.1)', padding: '3px 8px', borderRadius: '6px' }}>
                      {log.module || log.targetType}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '13px', color: colors.text, fontWeight: 500 }}>{actionNames[log.action] || log.action}</div>
                    <div style={{ fontSize: '11.5px', color: colors.text2, marginTop: '2px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.changeSummary || `Mã đối tượng: ${log.entityDisplayCode || log.targetId}`}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {log.result === 'SUCCESS' ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.green, fontSize: '12px', fontWeight: 600 }}>
                        <CheckCircle2 size={14} /> Thành công
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.red, fontSize: '12px', fontWeight: 600 }}>
                        <XCircle size={14} /> Thất bại
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span onClick={() => { setSelectedLog(log); setShowRawJson(false); }} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: colors.muted, cursor: 'pointer' }} title="Xem chi tiết">
                      <Eye size={14} />
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: `1px solid ${colors.borderSoft}` }}>
            <span style={{ fontSize: '12px', color: colors.muted }}>Hiển thị trang {page} / {totalPages} (Tổng: {totalItems})</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span onClick={() => setPage(p => Math.max(1, p - 1))} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: page > 1 ? colors.text : colors.muted, cursor: page > 1 ? 'pointer' : 'default', opacity: page > 1 ? 1 : 0.5 }}>
                <ChevronLeft size={16} />
              </span>
              <span onClick={() => setPage(p => Math.min(totalPages, p + 1))} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: page < totalPages ? colors.text : colors.muted, cursor: page < totalPages ? 'pointer' : 'default', opacity: page < totalPages ? 1 : 0.5 }}>
                <ChevronRight size={16} />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Slide-out Panel / Modal cho Chi Tiết Log */}
      {selectedLog && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '600px', maxWidth: '100vw', background: '#121115', borderLeft: '1px solid rgba(255,255,255,.1)', boxShadow: '-10px 0 30px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,.07)', flex: 'none' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: colors.gold, textTransform: 'uppercase', letterSpacing: '1px' }}>Chi tiết Audit Log</div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: colors.text, marginTop: '4px' }}>{actionNames[selectedLog.action] || selectedLog.action}</div>
              </div>
              <span onClick={() => setSelectedLog(null)} style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.muted, cursor: 'pointer' }}>
                <X size={18} />
              </span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', color: colors.muted, marginBottom: '6px' }}>Thời gian</div>
                  <div style={{ fontSize: '14px', color: colors.text, fontWeight: 500 }}>{dayjs(selectedLog.createdAt).format('DD/MM/YYYY HH:mm:ss')}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', color: colors.muted, marginBottom: '6px' }}>Kết quả</div>
                  {selectedLog.result === 'SUCCESS' ? (
                    <div style={{ fontSize: '14px', color: colors.green, fontWeight: 600 }}>Thành công</div>
                  ) : (
                    <div style={{ fontSize: '14px', color: colors.red, fontWeight: 600 }}>Thất bại</div>
                  )}
                </div>
                <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', borderRadius: '12px', padding: '14px', gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '11px', color: colors.muted, marginBottom: '6px' }}>Người thao tác</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <User size={16} color={colors.gold} />
                    <span style={{ fontSize: '14px', color: colors.text, fontWeight: 500 }}>{selectedLog.actorName || selectedLog.actorId || 'Hệ thống'}</span>
                    {renderBadge(selectedLog.actorRole)}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: colors.text, marginBottom: '8px' }}>Tóm tắt thao tác</div>
                <div style={{ background: 'rgba(212,178,106,.05)', border: '1px solid rgba(212,178,106,.2)', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', color: '#e3c27e', lineHeight: 1.5 }}>
                  {selectedLog.changeSummary || 'Không có mô tả chi tiết'}
                  <div style={{ marginTop: '6px', fontSize: '11.5px', color: colors.muted }}>
                    Đối tượng: <b style={{ color: colors.text2 }}>{selectedLog.targetType}</b> {selectedLog.entityDisplayCode ? `(${selectedLog.entityDisplayCode})` : `(${selectedLog.targetId})`}
                  </div>
                </div>
              </div>

              {(selectedLog.beforeJson || selectedLog.afterJson) && (() => {
                const diffs = getJsonDiff(selectedLog.beforeJson, selectedLog.afterJson);
                return (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>Dữ liệu thay đổi</div>
                      <button 
                        onClick={() => setShowRawJson(!showRawJson)} 
                        style={{ background: 'rgba(212,178,106,.1)', border: '1px solid rgba(212,178,106,.2)', color: colors.gold, fontSize: '11.5px', cursor: 'pointer', padding: '5px 10px', borderRadius: '6px', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212,178,106,.18)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(212,178,106,.1)'}
                      >
                        {showRawJson ? 'Hiển thị so sánh thân thiện' : 'Xem JSON gốc'}
                      </button>
                    </div>

                    {showRawJson ? (
                      <div>
                        {selectedLog.beforeJson && (
                          <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '11px', color: colors.red, fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase' }}>Trước khi đổi (Before)</div>
                            <pre style={{ background: '#1e1d24', padding: '14px', borderRadius: '10px', fontSize: '12px', color: '#d4d4d4', overflowX: 'auto', border: '1px solid rgba(255,255,255,.05)' }}>
                              {JSON.stringify(selectedLog.beforeJson, null, 2)}
                            </pre>
                          </div>
                        )}
                        {selectedLog.afterJson && (
                          <div>
                            <div style={{ fontSize: '11px', color: colors.green, fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase' }}>Sau khi đổi (After)</div>
                            <pre style={{ background: '#1e1d24', padding: '14px', borderRadius: '10px', fontSize: '12px', color: '#d4d4d4', overflowX: 'auto', border: '1px solid rgba(255,255,255,.05)' }}>
                              {JSON.stringify(selectedLog.afterJson, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ background: 'rgba(255,255,255,.01)', border: '1px solid rgba(255,255,255,.04)', borderRadius: '12px', overflow: 'hidden' }}>
                        {diffs.length === 0 ? (
                          <div style={{ padding: '16px', textAlign: 'center', color: colors.muted, fontSize: '12.5px' }}>Không phát hiện thay đổi cụ thể ở các trường dữ liệu.</div>
                        ) : (
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                            <thead>
                              <tr style={{ background: 'rgba(255,255,255,.02)', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                                <th style={{ padding: '10px 12px', fontWeight: 600, color: colors.muted, width: '35%' }}>Trường thông tin</th>
                                <th style={{ padding: '10px 12px', fontWeight: 600, color: colors.red }}>Trước khi đổi</th>
                                <th style={{ padding: '10px 12px', fontWeight: 600, color: colors.green }}>Sau khi đổi</th>
                              </tr>
                            </thead>
                            <tbody>
                              {diffs.map((d, index) => (
                                <tr key={index} style={{ borderBottom: index < diffs.length - 1 ? '1px solid rgba(255,255,255,.03)' : 'none' }}>
                                  <td style={{ padding: '10px 12px', color: colors.text, fontWeight: 500 }}>
                                    <div style={{ fontWeight: 600 }}>{d.label}</div>
                                    <div style={{ fontSize: '10.5px', color: colors.muted, marginTop: '2px' }}>{d.field}</div>
                                  </td>
                                  <td style={{ padding: '10px 12px', color: colors.text2, wordBreak: 'break-all' }}>{d.before}</td>
                                  <td style={{ padding: '10px 12px', color: colors.text, fontWeight: 500, wordBreak: 'break-all' }}>{d.after}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.01)' }}>
              <button onClick={() => setSelectedLog(null)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,.08)', color: colors.text, border: 'none', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
