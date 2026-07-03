"use client";

import React from 'react';
import { Plus, Check, Info } from 'lucide-react';

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
  goldGrad: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)',
  green: '#4ade80',
  blue: '#60a5fa',
  pink: '#f472b6',
};

const accounts = [
  { id: 1, avatar: 'A', name: 'Nguyễn Admin', email: 'admin@vietyoru.vn', role: 'Super Admin', status: 'Đang online', isOnline: true, color: colors.goldGrad },
  { id: 2, avatar: 'O', name: 'Trần Vận Hành', email: 'operator@vietyoru.vn', role: 'Operator', status: '2 giờ trước', isOnline: false, color: '#1e3a8a' },
  { id: 3, avatar: 'CL', name: 'Club Lumière', email: 'partner.lumiere@vietyoru.vn', role: 'Đối tác', status: '15 phút trước', isOnline: false, color: '#a16207' },
  { id: 4, avatar: 'SL', name: 'Sakura Lounge', email: 'partner.sakura@vietyoru.vn', role: 'Đối tác', status: '1 ngày trước', isOnline: false, color: '#9d174d' },
  { id: 5, avatar: 'KH', name: 'KTV Hoàng Gia', email: 'partner.hoanggia@vietyoru.vn', role: 'Chờ kích hoạt', status: 'Chưa kích hoạt', isOnline: false, color: '#3f3f46' },
];

const matrix = [
  { func: 'Đăng nhập hệ thống', admin: true, operator: true, partner: true },
  { func: 'CRUD quán & cast', admin: true, operator: true, partner: false },
  { func: 'Duyệt / quản lý booking', admin: true, operator: true, partner: false },
  { func: 'Duyệt hóa đơn & đối soát', admin: true, operator: false, partner: false },
  { func: 'Điều khiển ranking', admin: true, operator: true, partner: false },
  { func: 'Campaign / banner / blog', admin: true, operator: true, partner: false },
  { func: 'Báo cáo doanh thu', admin: true, operator: false, partner: false },
  { func: 'Quét mã QR của khách', admin: true, operator: false, partner: true },
  { func: 'Xác nhận khách check-in', admin: true, operator: false, partner: true },
  { func: 'Phân quyền tài khoản', admin: true, operator: false, partner: false },
];

export default function AdminRolesPage() {
  const getRoleBadgeStyle = (role: string) => {
    if (role === 'Super Admin') return { color: colors.gold, border: `1px solid ${colors.borderGold22}`, bg: 'rgba(212,178,106,.1)' };
    if (role === 'Operator') return { color: colors.blue, border: `1px solid rgba(96,165,250,.3)`, bg: 'transparent' };
    if (role === 'Chờ kích hoạt') return { color: colors.muted, border: `1px solid ${colors.borderSoft}`, bg: 'transparent' };
    return { color: colors.text2, border: `1px solid ${colors.borderSoft}`, bg: 'transparent' };
  };

  return (
    <div style={{ padding: '32px 40px', minHeight: '100%', overflowY: 'auto' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px' }}>
        
        {/* LEFT COLUMN: ACCOUNTS */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: `1px solid ${colors.borderSoft}`, paddingBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: colors.text, margin: 0 }}>Tài khoản</h2>
            <button style={{
              background: colors.goldGrad, color: colors.onGold, border: 'none', 
              padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, 
              display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
            }}>
              <Plus size={14} strokeWidth={3} /> Thêm
            </button>
          </div>

          <div style={{ background: colors.surface1, borderRadius: '16px', border: `1px solid ${colors.borderSoft}`, overflow: 'hidden' }}>
            {accounts.map((acc, idx) => (
              <div key={acc.id} style={{ 
                padding: '16px 20px', 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: idx === accounts.length - 1 ? 'none' : `1px solid ${colors.borderSoft}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '12px', 
                    background: acc.color, color: acc.role === 'Super Admin' ? colors.onGold : colors.text, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontSize: '16px', fontWeight: 700 
                  }}>
                    {acc.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: colors.text, marginBottom: '2px' }}>{acc.name}</div>
                    <div style={{ fontSize: '12px', color: colors.muted }}>{acc.email}</div>
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ marginBottom: '6px' }}>
                    <span style={{ 
                      padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                      color: getRoleBadgeStyle(acc.role).color,
                      border: getRoleBadgeStyle(acc.role).border,
                      background: getRoleBadgeStyle(acc.role).bg
                    }}>
                      {acc.role}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: acc.isOnline ? colors.green : colors.muted, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                    {acc.isOnline && <div style={{ width: 6, height: 6, borderRadius: '50%', background: colors.green }} />}
                    {acc.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: PERMISSION MATRIX */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', borderBottom: `1px solid ${colors.borderSoft}`, paddingBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: colors.text, margin: 0, whiteSpace: 'nowrap' }}>Ma trận phân quyền</h2>
          </div>

          <div style={{ background: colors.surface1, borderRadius: '16px', border: `1px solid ${colors.borderSoft}`, marginBottom: '24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.borderSoft}` }}>
                  <th style={{ padding: '20px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px', textAlign: 'left', width: '40%' }}>CHỨC NĂNG</th>
                  <th style={{ padding: '20px', fontSize: '12px', fontWeight: 700, color: colors.gold }}>Admin</th>
                  <th style={{ padding: '20px', fontSize: '12px', fontWeight: 700, color: colors.text }}>
                    Operator
                    <div style={{ fontSize: '9px', color: colors.muted, marginTop: '4px', fontWeight: 500 }}>P1</div>
                  </th>
                  <th style={{ padding: '20px', fontSize: '12px', fontWeight: 700, color: colors.text }}>Partner</th>
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: idx === matrix.length - 1 ? 'none' : `1px solid ${colors.borderSoft}` }}>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: colors.text2, textAlign: 'left' }}>{row.func}</td>
                    <td style={{ padding: '16px 20px', color: row.admin ? colors.gold : colors.muted }}>
                      {row.admin ? <Check size={16} style={{ margin: '0 auto' }} /> : '—'}
                    </td>
                    <td style={{ padding: '16px 20px', color: row.operator ? colors.gold : colors.muted }}>
                      {row.operator ? <Check size={16} style={{ margin: '0 auto' }} /> : '—'}
                    </td>
                    <td style={{ padding: '16px 20px', color: row.partner ? colors.gold : colors.muted }}>
                      {row.partner ? <Check size={16} style={{ margin: '0 auto' }} /> : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* INFO BOX */}
          <div style={{ 
            padding: '16px', borderRadius: '12px', border: `1px solid ${colors.borderGold22}`, 
            background: 'rgba(212,178,106,.05)', display: 'flex', gap: '12px', alignItems: 'flex-start'
          }}>
            <Info size={16} color={colors.gold} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '13px', color: colors.text2, lineHeight: 1.5 }}>
              MVP (P0): <span style={{ color: colors.gold, fontWeight: 700 }}>Admin</span> toàn quyền · <span style={{ color: colors.text, fontWeight: 700 }}>Partner</span> chỉ đăng nhập + quét QR + xác nhận check-in. Vai trò <span style={{ color: colors.text, fontWeight: 700 }}>Operator</span> mở rộng ở P1.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
