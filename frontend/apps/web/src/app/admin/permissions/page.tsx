"use client";

import React, { useState, useEffect } from 'react';
import { getAuthUser } from '@/lib/auth/session';

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
  goldGrad: 'linear-gradient(135deg,#f0dda8,#d4b26a)'
};

export type CapRow = [string, string, number, number, number, number, number];

// Matrix Data for 6 Groups
const INIT_SYSTEM: CapRow[] = [
  ['Quản lý tài khoản CMS (Tạo/Sửa/Xóa/Đổi Pass)', 'Manage Accounts', 1, 0, 0, 0, 0],
  ['Sửa/Xem cấu hình hệ thống', 'System Configs', 1, 0, 0, 0, 0],
  ['Duyệt đối tác (Partner)', 'Approve Partners', 1, 0, 0, 0, 0],
  ['Quản lý nội dung trang chủ (Content)', 'Manage Content', 1, 0, 0, 0, 0],
];

const INIT_BOOKING: CapRow[] = [
  ['Xem danh sách đặt bàn', 'canViewPartnerBooking', 1, 1, 1, 1, 0],
  ['Huỷ đặt bàn của khách (vượt quá Cut-off)', 'canCancelBooking', 1, 1, 0, 0, 0],
  ['Duyệt/Từ chối yêu cầu đổi giờ (Reschedule)', 'canReviewBookingReschedule', 1, 1, 0, 0, 0],
  ['Xem và Quản lý Chat hỗ trợ đặt bàn', 'canManageBookingChat', 1, 1, 0, 0, 0],
  ['Xem báo cáo tỷ lệ huỷ (Cancel Analytics)', 'canViewCancelAnalytics', 1, 1, 0, 0, 0],
];

const INIT_STORE: CapRow[] = [
  ['Xem thông tin quán', 'canViewPartnerStore', 1, 1, 1, 1, 0],
  ['Cấu hình luật huỷ bàn (Cut-off Time)', 'canUpdateStorePolicy', 1, 1, 0, 0, 0],
  ['Quản lý Ranking thủ công (Pin/Score)', 'canManageRanking', 1, 0, 0, 0, 0],
];

const INIT_VOUCHER: CapRow[] = [
  ['Xem mã giảm giá của quán', 'canViewPartnerCoupon', 1, 1, 1, 1, 0],
  ['Quét mã QR giảm giá', 'canScanCoupon', 1, 0, 1, 1, 0],
  ['Xác nhận khách check-in (Sử dụng Issue)', 'canConfirmCheckIn', 1, 0, 1, 1, 0],
  ['Quản lý lượt phát mã (Thu hồi/Xoay vòng QR)', 'canManageCouponIssue', 1, 0, 0, 0, 0],
];

const INIT_CAST: CapRow[] = [
  ['Quản lý hồ sơ Cast', 'canManageCast', 1, 1, 1, 1, 0],
  ['Xoá mềm Cast (Soft Delete)', 'canSoftDeleteCast', 1, 0, 0, 0, 0],
  ['Xoá cứng Cast (Hard Delete)', 'canHardDeleteCast', 0, 0, 0, 0, 0], // Only Super Admin
];

const INIT_BILL: CapRow[] = [
  ['Xem & tạo hoá đơn cho quán', 'canReviewBill', 1, 0, 1, 1, 0],
  ['Xem danh sách hoá đơn (Chưa thanh toán)', 'canViewPartnerBill', 1, 1, 1, 0, 0],
  ['Xem hoá đơn nhạy cảm (Đang chờ duyệt)', 'canViewSensitiveBill', 1, 0, 0, 0, 0],
  ['Duyệt hoá đơn (Approve/Reject)', 'canApproveBill', 1, 0, 0, 0, 0],
  ['Xác nhận hoá đơn hoa hồng âm (PM/BA)', 'canConfirmBillPmBa', 1, 0, 0, 0, 0],
  ['Huỷ/Hoàn tiền hoá đơn đã duyệt (Void)', 'canVoidBill', 1, 0, 0, 0, 0],
  ['Đảo ngược hoá đơn (Reverse/Auto-Reverse)', 'canReverseBill', 1, 0, 0, 0, 0],
  ['Xem báo cáo doanh thu', 'canViewRevenueReport', 1, 0, 0, 0, 0],
];

const INIT_USER: CapRow[] = [
  ['Xem lịch sử đặt bàn bản thân', 'canViewMemberBooking', 1, 0, 0, 0, 1],
  ['Xem voucher / coupon bản thân', 'canViewMemberCoupon', 1, 0, 0, 0, 1],
  ['Lấy (claim) mã ưu đãi mới', 'canClaimMemberCoupon', 0, 0, 0, 0, 1],
];

const Toggle = ({ on, onClick }: { on: boolean, onClick: () => void }) => (
  <div onClick={onClick} style={{ width: 28, height: 16, borderRadius: 8, background: on ? 'rgba(212,178,106,.8)' : 'rgba(255,255,255,.1)', position: 'relative', cursor: 'pointer', margin: '0 auto', transition: 'all 0.2s' }}>
    <div style={{ width: 12, height: 12, borderRadius: '50%', background: on ? '#241a0a' : '#8c8679', position: 'absolute', top: 2, left: on ? 14 : 2, transition: 'all 0.2s' }} />
  </div>
);

export default function AdminPermissionsPage() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(() => {
    if (typeof window !== 'undefined') {
      const user = getAuthUser();
      return user?.role === 'SUPER_ADMIN';
    }
    return false;
  });
  
  useEffect(() => {
    const user = getAuthUser();
    if (user?.role === 'SUPER_ADMIN') {
      setIsSuperAdmin(true);
    }
  }, []);

  const [capsSystem, setCapsSystem] = useState<CapRow[]>(INIT_SYSTEM);
  const [capsBooking, setCapsBooking] = useState<CapRow[]>(INIT_BOOKING);
  const [capsStore, setCapsStore] = useState<CapRow[]>(INIT_STORE);
  const [capsVoucher, setCapsVoucher] = useState<CapRow[]>(INIT_VOUCHER);
  const [capsCast, setCapsCast] = useState<CapRow[]>(INIT_CAST);
  const [capsBill, setCapsBill] = useState<CapRow[]>(INIT_BILL);
  const [capsUser, setCapsUser] = useState<CapRow[]>(INIT_USER);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const handleToggleCap = (section: string, rowIdx: number, colIdx: number) => {
    const updater = (prev: CapRow[]) => {
      const next = [...prev];
      const row = next[rowIdx];
      if (!row) return next;
      const newRow = [...row] as CapRow;
      newRow[colIdx] = newRow[colIdx] === 1 ? 0 : 1;
      next[rowIdx] = newRow;
      return next;
    };
    if (section === 'system') setCapsSystem(updater);
    else if (section === 'booking') setCapsBooking(updater);
    else if (section === 'store') setCapsStore(updater);
    else if (section === 'voucher') setCapsVoucher(updater);
    else if (section === 'cast') setCapsCast(updater);
    else if (section === 'bill') setCapsBill(updater);
    else if (section === 'user') setCapsUser(updater);
    showToast('Đã cập nhật cấu hình quyền');
  };

  const matrixGridCols = isSuperAdmin ? '1fr repeat(5, 100px)' : '1fr repeat(4, 100px)';

  const renderCapRow = (c: CapRow, idx: number, section: string) => {
    return (
      <div key={idx} style={{ display: 'grid', gridTemplateColumns: matrixGridCols, gap: '10px', padding: '12px 20px', borderBottom: `1px solid ${colors.borderSoft2}`, alignItems: 'center' }}>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: '13px', color: '#f3f0ea' }}>{c[0]}</span>
        </span>
        {isSuperAdmin && <Toggle on={c[2]===1} onClick={() => handleToggleCap(section, idx, 2)} />}
        <Toggle on={c[3]===1} onClick={() => handleToggleCap(section, idx, 3)} />
        <Toggle on={c[4]===1} onClick={() => handleToggleCap(section, idx, 4)} />
        <Toggle on={c[5]===1} onClick={() => handleToggleCap(section, idx, 5)} />
        <Toggle on={c[6]===1} onClick={() => handleToggleCap(section, idx, 6)} />
      </div>
    );
  };

  return (
    <div style={{ padding: '22px 26px 44px', minHeight: '100%', overflowY: 'auto', maxWidth: '1000px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <span style={{ fontSize: '18px', fontWeight: 600, color: '#f3f0ea' }}>Bảng phân quyền chi tiết (Matrix)</span>
        <span style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(212,178,106,.4), transparent)' }}></span>
      </div>
      
      <div style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '16px', overflow: 'hidden', marginBottom: '30px' }}>
        
        {/* Header Row */}
        <div style={{ display: 'grid', gridTemplateColumns: matrixGridCols, gap: '10px', padding: '16px 20px', borderBottom: `1px solid ${colors.borderSoft}`, background: 'rgba(255,255,255,.02)', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '.8px', color: '#8c8679', textTransform: 'uppercase' }}>Chức năng</span>
          {isSuperAdmin && <span style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#e3c27e' }}>Quản trị viên</span>}
          <span style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#c5c0b6' }}>Nhân viên vận hành</span>
          <span style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#c5c0b6' }}>Đối tác</span>
          <span style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#c5c0b6' }}>Nhân viên quán</span>
          <span style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#c5c0b6' }}>Người dùng</span>
        </div>
        
        {/* 1. Hệ thống & Admin */}
        <div style={{ padding: '12px 20px 10px', background: 'rgba(212,178,106,.04)', fontSize: '11px', fontWeight: 700, letterSpacing: '1.1px', color: '#caa765', textTransform: 'uppercase' }}>1. Hệ thống &amp; Quản trị</div>
        {capsSystem.map((c, i) => renderCapRow(c, i, 'system'))}

        {/* 2. Đặt bàn & Chat */}
        <div style={{ padding: '12px 20px 10px', background: 'rgba(212,178,106,.04)', fontSize: '11px', fontWeight: 700, letterSpacing: '1.1px', color: '#caa765', textTransform: 'uppercase', marginTop: '1px' }}>2. Booking &amp; Hỗ trợ (Chat)</div>
        {capsBooking.map((c, i) => renderCapRow(c, i, 'booking'))}

        {/* 3. Store & Ranking */}
        <div style={{ padding: '12px 20px 10px', background: 'rgba(212,178,106,.04)', fontSize: '11px', fontWeight: 700, letterSpacing: '1.1px', color: '#caa765', textTransform: 'uppercase', marginTop: '1px' }}>3. Quán &amp; Xếp hạng</div>
        {capsStore.map((c, i) => renderCapRow(c, i, 'store'))}

        {/* 4. Voucher & QR */}
        <div style={{ padding: '12px 20px 10px', background: 'rgba(212,178,106,.04)', fontSize: '11px', fontWeight: 700, letterSpacing: '1.1px', color: '#caa765', textTransform: 'uppercase', marginTop: '1px' }}>4. Ưu đãi, QR &amp; Đối tác</div>
        {capsVoucher.map((c, i) => renderCapRow(c, i, 'voucher'))}

        {/* 5. Cast */}
        <div style={{ padding: '12px 20px 10px', background: 'rgba(212,178,106,.04)', fontSize: '11px', fontWeight: 700, letterSpacing: '1.1px', color: '#caa765', textTransform: 'uppercase', marginTop: '1px' }}>5. Quản lý Cast</div>
        {capsCast.map((c, i) => renderCapRow(c, i, 'cast'))}

        {/* 6. Hoá đơn & Doanh thu */}
        <div style={{ padding: '12px 20px 10px', background: 'rgba(212,178,106,.04)', fontSize: '11px', fontWeight: 700, letterSpacing: '1.1px', color: '#caa765', textTransform: 'uppercase', marginTop: '1px' }}>6. Hoá đơn &amp; Báo cáo doanh thu</div>
        {capsBill.map((c, i) => renderCapRow(c, i, 'bill'))}

        {/* 7. User */}
        <div style={{ padding: '12px 20px 10px', background: 'rgba(212,178,106,.04)', fontSize: '11px', fontWeight: 700, letterSpacing: '1.1px', color: '#caa765', textTransform: 'uppercase', marginTop: '1px' }}>7. Quyền khách hàng (User/Member)</div>
        {capsUser.map((c, i) => renderCapRow(c, i, 'user'))}

      </div>

      {toast && (
        <div style={{ position: 'fixed', left: '50%', bottom: '28px', transform: 'translateX(-50%)', zIndex: 90, display: 'flex', alignItems: 'center', gap: '10px', background: '#17161c', border: '1px solid rgba(212,178,106,.3)', color: '#f3f0ea', fontSize: '13.5px', fontWeight: 500, padding: '13px 22px', borderRadius: '12px', boxShadow: '0 20px 44px -18px rgba(0,0,0,.85)' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7fd3a2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          {toast}
        </div>
      )}
    </div>
  );
}
