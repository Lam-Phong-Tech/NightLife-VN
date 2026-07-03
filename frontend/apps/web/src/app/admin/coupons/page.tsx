"use client";

import React, { useState, useEffect } from 'react';
import { X, Search, Filter } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

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
  greenBg: 'rgba(74,222,128,0.1)',
  red: '#f87171',
  redBg: 'rgba(248,113,113,0.1)',
  blue: '#60a5fa',
  blueBg: 'rgba(96,165,250,0.1)',
  neonPink: '#e0729e',
};

const mockCoupons = [
  { id: 'LUM-3F9A2', discount: '-30%', title: 'Happy Hour', store: 'Club Lumière - Tây Hồ', tier: 'Member', expiry: 'HSD 07/07 · còn 6 ngày', status: 'Đang giữ chỗ' },
  { id: 'AKR-7B1C4', discount: '-10%', title: 'VIP độc quyền', store: 'Akari Lounge - Tây Hồ', tier: 'VIP', expiry: 'HSD 08/07 · còn 7 ngày', status: 'Đang giữ chỗ' },
  { id: 'SAK-1D8E5', discount: '-8%', title: 'Ưu đãi thành viên', store: 'Sakura Lounge - Hoàn Kiếm', tier: 'Member', expiry: 'HSD 04/07 · còn 3 ngày', status: 'Đang giữ chỗ' },
  { id: 'TN-9A4F7', discount: '-5%', title: 'Khách mới', store: 'Bar Tokyo Night - Ba Đình', tier: 'Guest', expiry: 'HSD 02/07 · còn 24 giờ', status: 'Đang giữ chỗ' },
  { id: 'KTV-2C8E1', discount: '2+1', title: 'Combo phòng VIP', store: 'KTV Hoàng Gia - Kim Mã', tier: 'VIP', expiry: 'Đã dùng 30/06/2026', status: 'Đã sử dụng' },
  { id: 'LUM-8H2K9', discount: '-30%', title: 'Happy Hour', store: 'Club Lumière - Tây Hồ', tier: 'Member', expiry: 'Đã dùng 29/06/2026', status: 'Đã sử dụng' },
  { id: 'SAK-4M1P3', discount: '-5%', title: 'Khách mới', store: 'Sakura Lounge - Hoàn Kiếm', tier: 'Guest', expiry: 'Hết hạn 28/06/2026', status: 'Hết hạn' },
  { id: 'TN-6Q9R2', discount: '-8%', title: 'Ưu đãi thành viên', store: 'Bar Tokyo Night - Ba Đình', tier: 'Member', expiry: 'Hết hạn 26/06/2026', status: 'Hết hạn' },
];

export default function AdminCouponsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCoupon, setSelectedCoupon] = useState<any | null>(null);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  const fetchCoupons = async () => {
    try {
      const res = await apiClient<any>('/admin/coupons', {
        params: { status: activeTab === 'all' ? undefined : activeTab }
      });
      setCoupons(res.data);
      setStats(res.stats);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [activeTab]);

  const getStatusStyle = (status: string) => {
    if (status === 'Đang giữ chỗ') return { color: colors.blue, bg: 'rgba(96,165,250,0.05)', border: `1px solid rgba(96,165,250,0.3)` };
    if (status === 'Đã sử dụng') return { color: colors.green, bg: 'rgba(74,222,128,0.05)', border: `1px solid rgba(74,222,128,0.3)` };
    if (status === 'Hết hạn') return { color: colors.neonPink, bg: 'rgba(224,114,158,0.05)', border: `1px solid rgba(224,114,158,0.3)` };
    return { color: colors.muted, bg: colors.surface2, border: `1px solid ${colors.borderSoft}` };
  };

  const getTierStyle = (tier: string) => {
    if (tier === 'VIP') return { color: colors.gold, border: `1px solid ${colors.borderGold22}` };
    if (tier === 'Member') return { color: colors.blue, border: `1px solid rgba(96,165,250,0.3)` };
    return { color: colors.muted, border: `1px solid ${colors.borderSoft}` };
  };



  return (
    <div style={{ padding: '32px 40px', position: 'relative', minHeight: '100%' }}>
      
      {/* TOP CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '12px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: colors.blue }}></div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: colors.blue, marginBottom: '8px' }}>{stats?.holdingCount ?? 4}</div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>Đang giữ chỗ</div>
        </div>
        
        <div style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '12px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: colors.green }}></div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: colors.green, marginBottom: '8px' }}>{stats?.usedCount ?? 2}</div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>Đã sử dụng</div>
        </div>

        <div style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '12px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: colors.neonPink }}></div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: colors.neonPink, marginBottom: '8px' }}>{stats?.usedCount ?? 2}</div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>Hết hạn</div>
        </div>

        <div style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: colors.gold, marginBottom: '8px' }}>{stats?.usageRate ?? 68}%</div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>Tỷ lệ sử dụng</div>
        </div>
      </div>

      {/* TOP FILTERS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', background: 'transparent', gap: '8px' }}>
          <button 
            onClick={() => setActiveTab('all')}
            style={{
              background: activeTab === 'all' ? colors.goldGrad : colors.surface1,
              color: activeTab === 'all' ? colors.onGold : colors.muted,
              border: `1px solid ${activeTab === 'all' ? 'transparent' : colors.borderSoft}`,
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: activeTab === 'all' ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            Tất cả
          </button>
          <button 
            onClick={() => setActiveTab('holding')}
            style={{
              background: activeTab === 'holding' ? colors.surface2 : 'transparent',
              color: activeTab === 'holding' ? colors.text : colors.muted,
              border: 'none',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: activeTab === 'holding' ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            Đang giữ chỗ
          </button>
          <button 
            onClick={() => setActiveTab('used')}
            style={{
              background: activeTab === 'used' ? colors.surface2 : 'transparent',
              color: activeTab === 'used' ? colors.text : colors.muted,
              border: 'none',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: activeTab === 'used' ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            Đã sử dụng
          </button>
          <button 
            onClick={() => setActiveTab('expired')}
            style={{
              background: activeTab === 'expired' ? colors.surface2 : 'transparent',
              color: activeTab === 'expired' ? colors.text : colors.muted,
              border: 'none',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: activeTab === 'expired' ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            Hết hạn
          </button>
        </div>

        <div style={{ 
          background: colors.greenBg, 
          border: `1px solid rgba(74,222,128,0.2)`, 
          borderRadius: '20px', 
          padding: '6px 16px',
          color: colors.muted,
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: colors.green, boxShadow: `0 0 6px ${colors.green}` }}></div>
          Cron tự hủy mã hết hạn · 5 phút/lần
        </div>
      </div>

      {/* TABLE */}
      <div style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.borderSoft}` }}>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>MÃ COUPON</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>ƯU ĐÃI</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>QUÁN ÁP DỤNG</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>HẠNG</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>HẠN DÙNG</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px', textAlign: 'right' }}>TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c: any, idx: number) => {
              const statusStyle = getStatusStyle(c.status);
              const tierStyle = getTierStyle(c.tier);
              return (
                <tr 
                  key={idx} 
                  onClick={() => setSelectedCoupon(c)}
                  style={{ 
                    borderBottom: `1px solid ${colors.borderSoft}`,
                    cursor: 'pointer',
                    background: selectedCoupon?.id === c.id ? colors.surface2 : 'transparent',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = colors.surface2}
                  onMouseLeave={(e) => e.currentTarget.style.background = selectedCoupon?.id === c.id ? colors.surface2 : 'transparent'}
                >
                  <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 700, color: colors.gold }}>{c.id}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: colors.text }}>
                    <strong style={{ color: colors.gold }}>{c.discount}</strong> {c.title}
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: colors.text2 }}>{c.store}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      border: tierStyle.border, 
                      color: tierStyle.color, 
                      padding: '4px 12px', 
                      borderRadius: '12px', 
                      fontSize: '11px', 
                      fontWeight: 600,
                      background: 'rgba(255,255,255,0.03)'
                    }}>
                      {c.tier}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: colors.text2 }}>{c.expiry}</td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <span style={{ 
                      background: statusStyle.bg, 
                      color: statusStyle.color, 
                      border: statusStyle.border,
                      padding: '6px 16px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: 600,
                    }}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* SIDE DRAWER (Modal) */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: selectedCoupon ? 0 : '-400px',
        bottom: 0,
        width: '400px',
        background: colors.bg,
        borderLeft: `1px solid ${colors.borderSoft}`,
        boxShadow: selectedCoupon ? '-10px 0 30px rgba(0,0,0,0.5)' : 'none',
        transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {selectedCoupon && (
          <>
            <div style={{ padding: '24px', borderBottom: `1px solid ${colors.borderSoft}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: colors.muted }}>
                  COUPON / QR
                </span>
                <button 
                  onClick={() => setSelectedCoupon(null)}
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

            <div style={{ padding: '32px 24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              
              <div style={{ fontSize: '48px', fontWeight: 800, color: colors.gold, marginBottom: '8px', lineHeight: 1 }}>
                {selectedCoupon.discount}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: colors.text, marginBottom: '4px' }}>
                {selectedCoupon.title}
              </div>
              <div style={{ fontSize: '14px', color: colors.muted, marginBottom: '16px' }}>
                {selectedCoupon.store}
              </div>

              <span style={{ 
                ...getStatusStyle(selectedCoupon.status),
                padding: '6px 20px', 
                borderRadius: '20px', 
                fontSize: '13px', 
                fontWeight: 600,
                marginBottom: '32px'
              }}>
                {selectedCoupon.status}
              </span>

              {/* QR Box */}
              <div style={{ 
                width: '200px', 
                height: '200px', 
                background: '#fff', 
                border: `6px solid ${colors.surface2}`,
                borderRadius: '20px', 
                padding: '8px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=168x168&data=${selectedCoupon.id}`} 
                  alt="QR Code" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px', overflow: 'hidden' }}
                />
              </div>

              {/* Coupon Code Dashed Box */}
              <div style={{ 
                width: '100%',
                border: `1px dashed ${colors.borderGold22}`, 
                background: 'rgba(212,178,106,.05)',
                borderRadius: '12px', 
                padding: '16px',
                textAlign: 'center',
                marginBottom: '32px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px', marginBottom: '8px' }}>MÃ COUPON</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: colors.gold, letterSpacing: '2px' }}>{selectedCoupon.id}</div>
              </div>

              {/* Details List */}
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: `1px solid ${colors.borderSoft}`, marginBottom: '16px' }}>
                <span style={{ color: colors.muted, fontSize: '14px' }}>Hạng khách</span>
                <span style={{ color: colors.text, fontSize: '14px', fontWeight: 700 }}>{selectedCoupon.tier} · giảm {selectedCoupon.discount.replace('-', '')}</span>
              </div>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: `1px solid ${colors.borderSoft}`, marginBottom: '16px' }}>
                <span style={{ color: colors.muted, fontSize: '14px' }}>Hạn dùng</span>
                <span style={{ color: colors.text, fontSize: '14px', fontWeight: 700 }}>{selectedCoupon.expiry}</span>
              </div>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', paddingBottom: '24px', marginBottom: '8px' }}>
                <span style={{ color: colors.muted, fontSize: '14px' }}>Số lần dùng</span>
                <span style={{ color: colors.text, fontSize: '14px', fontWeight: 700 }}>1 lần / coupon</span>
              </div>

              {/* Note Banner */}
              <div style={{ 
                width: '100%',
                border: `1px solid ${colors.borderGold22}`, 
                background: 'rgba(212,178,106,.05)',
                borderRadius: '8px', 
                padding: '16px',
                display: 'flex',
                gap: '12px',
                color: colors.gold,
                fontSize: '13px',
                lineHeight: '1.5'
              }}>
                <div style={{ flexShrink: 0, marginTop: '2px', border: `1px solid ${colors.gold}`, width: 24, height: 16, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '100%', height: 1, background: colors.gold }}></div>
                </div>
                <span>Nhân viên quán quét QR qua tài khoản đối tác để xác nhận. Sau khi quét → chuyển "Đã sử dụng".</span>
              </div>

            </div>
          </>
        )}
      </div>

    </div>
  );
}
