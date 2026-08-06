"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Eye, User, ChevronDown, CheckCircle2, XCircle } from 'lucide-react';
import { getAuditLogs, AuditLogRec } from '@/lib/api/audit-logs';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { TableLoadingRows } from '@/components/ui/DataLoading';
import { FriendlyAuditChanges, getFriendlyAuditDetail } from './AuditLogFriendlyDetail';

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

const actionNames: Record<string, string> = {
  'ranking.config.create': 'Thêm vào bảng xếp hạng',
  'ranking.config.update': 'Cập nhật xếp hạng',
  'ranking.config.delete': 'Gỡ khỏi bảng xếp hạng',
  'store.create': 'Thêm quán',
  'store.update': 'Cập nhật thông tin quán',
  'store.partner.link': 'Liên kết tài khoản đối tác',
  'store.partner.unlink': 'Gỡ tài khoản đối tác',
  'store.soft_delete': 'Xóa quán',
  'store.hard_delete': 'Xóa vĩnh viễn quán',
  'store.restore': 'Khôi phục quán',
  'cast.create': 'Thêm nhân viên',
  'cast.update': 'Cập nhật nhân viên',
  'cast.soft_delete': 'Xóa nhân viên',
  'cast.hard_delete': 'Xóa vĩnh viễn nhân viên',
  'coupon.create': 'Tạo mã ưu đãi',
  'coupon.update': 'Cập nhật mã ưu đãi',
  'coupon.delete': 'Xóa mã ưu đãi',
  'content.create': 'Tạo nội dung',
  'content.update': 'Cập nhật nội dung',
  'content.delete': 'Xóa nội dung',
  'appearance.update': 'Cập nhật giao diện',
  'system_config.update': 'Cập nhật cấu hình hệ thống',
  'user.create': 'Tạo tài khoản',
  'user.update': 'Cập nhật tài khoản',
  'user.password.update': 'Đổi mật khẩu tài khoản',
  'user.soft_delete': 'Vô hiệu hóa tài khoản',
  'user.restore': 'Khôi phục tài khoản',
  'user.hard_delete': 'Xóa vĩnh viễn tài khoản',
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
  'campaign.create': 'Tạo campaign ưu đãi',
  'campaign.update': 'Cập nhật campaign ưu đãi',
  'campaign.delete': 'Xóa campaign ưu đãi',
  'category.create': 'Tạo danh mục',
  'category.update': 'Cập nhật danh mục',
  'category.delete': 'Xóa danh mục',
  'tour.create': 'Tạo tour',
  'tour.update': 'Cập nhật tour',
  'tour.delete': 'Xóa tour',
};

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
  const [fetchError, setFetchError] = useState<string | null>(null);
  const selectedDetail = selectedLog ? getFriendlyAuditDetail(selectedLog) : null;

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
    } catch (e: any) {
      console.error('Failed to fetch audit logs', e);
      const status = e?.status ?? e?.statusCode;
      if (status === 403 || /quyền|forbidden/i.test(e?.message ?? '')) {
        setFetchError('Bạn không có quyền xem trang này. Vui lòng liên hệ Admin để được cấp quyền.');
      }
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
    { id: 'User', label: 'Người dùng/Admin' },
    { id: 'Coupon', label: 'Mã ưu đãi' },
    { id: 'Content', label: 'Nội dung' },
    { id: 'Appearance', label: 'Giao diện' },
    { id: 'SystemConfig', label: 'Cấu hình hệ thống' },
    { id: 'Campaign', label: 'Campaign (Ưu đãi)' },
    { id: 'Category', label: 'Danh mục' },
    { id: 'Tour', label: 'Tour' }
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
      {fetchError && (
        <div style={{ marginBottom: '16px', background: 'rgba(232,80,80,.1)', border: '1px solid rgba(232,80,80,.3)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e85050" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span style={{ fontSize: '13.5px', color: '#f87171', fontWeight: 500 }}>{fetchError}</span>
        </div>
      )}
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
                      {getFriendlyAuditDetail(log).summary}
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
                    <span onClick={() => setSelectedLog(log)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: colors.muted, cursor: 'pointer' }} title="Xem chi tiết">
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
                <div style={{ fontSize: '17px', fontWeight: 700, color: colors.text, marginTop: '4px' }}>{selectedDetail?.title}</div>
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
                  {selectedDetail?.summary}
                  <div style={{ marginTop: '6px', fontSize: '11.5px', color: colors.muted }}>
                    Đối tượng: <b style={{ color: colors.text2 }}>{selectedDetail?.targetDescription}</b>
                  </div>
                </div>
              </div>

              <FriendlyAuditChanges key={selectedLog.id} log={selectedLog} />
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
