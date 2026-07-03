"use client";

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

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
    if (status === 'Đang giữ chỗ' || status === 'holding') return { color: '#8fb6e4', background: 'rgba(111,159,216,.12)', border: '1px solid rgba(111,159,216,.28)' };
    if (status === 'Đã sử dụng' || status === 'used') return { color: '#7fd3a2', background: 'rgba(95,191,134,.1)', border: '1px solid rgba(95,191,134,.28)' };
    if (status === 'Hết hạn' || status === 'expired') return { color: '#9b958a', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)' };
    return { color: '#9b958a', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)' };
  };

  const getTierStyle = (tier: string) => {
    if (tier === 'VIP') return { color: '#e3c27e', background: 'rgba(212,178,106,.12)', border: '1px solid rgba(212,178,106,.3)' };
    if (tier === 'Member') return { color: '#8fb6e4', background: 'rgba(111,159,216,.12)', border: '1px solid rgba(111,159,216,.28)' };
    if (tier === 'Guest') return { color: '#9b958a', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)' };
    return { color: '#9b958a', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)' };
  };

  const displayStatus = (s: string) => {
    if (s === 'holding') return 'Đang giữ chỗ';
    if (s === 'used') return 'Đã sử dụng';
    if (s === 'expired') return 'Hết hạn';
    return s;
  };

  const formatCode = (c: any) => {
    if (c.code) return c.code.toUpperCase();
    if (c.id) {
      const parts = c.id.split('-');
      if (parts.length > 1) return (parts[0].slice(0, 4) + '-' + parts[1]).toUpperCase();
      return c.id.slice(0, 8).toUpperCase();
    }
    return 'UNKNOWN';
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    if (!isoString.includes('T')) return isoString; // fallback if it's already formatted
    const d = new Date(isoString);
    const D = d.getDate().toString().padStart(2, '0');
    const M = (d.getMonth() + 1).toString().padStart(2, '0');
    const Y = d.getFullYear();
    return `${D}/${M}/${Y}`;
  };

  return (
    <div data-screen-label="Admin · Coupons" style={{ padding: '22px 26px 44px', minHeight: '100%', background: '#0c0c0f' }}>
      
      {/* Top Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '18px' }}>
        <div style={{ background: 'rgba(111,159,216,.07)', border: '1px solid rgba(111,159,216,.22)', borderRadius: '14px', padding: '15px 16px' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#8fb6e4' }}>{stats?.holdingCount ?? 4}</div>
          <div style={{ fontSize: '11.5px', color: '#c5c0b6', marginTop: '2px' }}>Đang giữ chỗ</div>
        </div>
        <div style={{ background: 'rgba(95,191,134,.07)', border: '1px solid rgba(95,191,134,.22)', borderRadius: '14px', padding: '15px 16px' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#7fd3a2' }}>{stats?.usedCount ?? 2}</div>
          <div style={{ fontSize: '11.5px', color: '#c5c0b6', marginTop: '2px' }}>Đã sử dụng</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '14px', padding: '15px 16px' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#9b958a' }}>{stats?.expiredCount ?? 2}</div>
          <div style={{ fontSize: '11.5px', color: '#8c8679', marginTop: '2px' }}>Hết hạn</div>
        </div>
        <div style={{ background: 'rgba(212,178,106,.06)', border: '1px solid rgba(212,178,106,.22)', borderRadius: '14px', padding: '15px 16px' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#e3c27e' }}>{stats?.usageRate ?? 68}%</div>
          <div style={{ fontSize: '11.5px', color: '#8c8679', marginTop: '2px' }}>Tỷ lệ sử dụng</div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '14px' }}>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '11px', padding: '3px', gap: '2px' }}>
          {['all', 'holding', 'used', 'expired'].map(tab => {
            const isActive = activeTab === tab;
            const label = tab === 'all' ? 'Tất cả' : tab === 'holding' ? 'Đang giữ chỗ' : tab === 'used' ? 'Đã sử dụng' : 'Hết hạn';
            return (
              <span 
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  fontSize: '12px',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: isActive ? '#241a0a' : '#9b958a',
                  background: isActive ? 'linear-gradient(135deg,#f0dda8,#d4b26a)' : 'transparent',
                  fontWeight: isActive ? 600 : 400
                }}
              >
                {label}
              </span>
            );
          })}
        </div>
        <div style={{ flex: 1 }}></div>
        <span style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '11px', color: '#8c8679', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '9px', padding: '8px 12px' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#5fbf86', boxShadow: '0 0 6px #5fbf86', animation: 'vpulse 2s infinite' }}></span>
          Cron tự hủy mã hết hạn · 5 phút/lần
        </span>
      </div>

      {/* Table */}
      <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '132px 1fr 1.3fr 96px 1.2fr 120px', gap: '12px', padding: '13px 18px', fontSize: '10px', fontWeight: 700, letterSpacing: '.9px', color: '#57534b', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.015)' }}>
          <span>Mã coupon</span><span>Ưu đãi</span><span>Quán áp dụng</span><span>Hạng</span><span>Hạn dùng</span><span style={{ textAlign: 'right' }}>Trạng thái</span>
        </div>
        
        {coupons.map((c: any, idx: number) => {
          const stStyle = getStatusStyle(c.status);
          const tStyle = getTierStyle(c.tier);
          const stLabel = displayStatus(c.status);
          const code = formatCode(c);
          
          let discountStr = c.discount || '';
          let dealTypeStr = c.title || '';
          if (!discountStr && c.title) {
             const match = c.title.match(/(-?\\d+%?|\\d+\\+\\d+)/);
             if (match) {
               discountStr = match[0];
               dealTypeStr = c.title.replace(match[0], '').trim();
               if (dealTypeStr.startsWith('—') || dealTypeStr.startsWith('-')) dealTypeStr = dealTypeStr.substring(1).trim();
             }
          }

          const isExpired = c.status === 'expired' || c.status === 'Hết hạn';

          return (
            <div 
              key={idx} 
              onClick={() => setSelectedCoupon(c)} 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '132px 1fr 1.3fr 96px 1.2fr 120px', 
                gap: '12px', 
                alignItems: 'center', 
                padding: '13px 18px', 
                borderBottom: '1px solid rgba(255,255,255,.04)', 
                cursor: 'pointer', 
                fontSize: '13px', 
                opacity: isExpired ? 0.58 : 1,
                transition: 'background 0.2s' 
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,178,106,.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontFamily: "'Inter'", fontSize: '12px', fontWeight: 600, color: '#d4b26a', letterSpacing: '.3px' }}>{code}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#e3c27e', whiteSpace: 'nowrap' }}>{discountStr}</span>
                <span style={{ fontSize: '11.5px', color: '#c5c0b6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dealTypeStr}</span>
              </div>
              <span style={{ color: '#c5c0b6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.store || 'Tất cả hệ thống'}</span>
              <span><span style={{ ...tStyle, fontSize: '10.5px', fontWeight: 600, padding: '3px 9px', borderRadius: '7px', display: 'inline-block' }}>{c.tier || 'Member'}</span></span>
              <span style={{ color: '#8c8679', fontSize: '11.5px' }}>{formatTime(c.expiry)}</span>
              <span style={{ textAlign: 'right' }}><span style={{ ...stStyle, fontSize: '11px', fontWeight: 600, padding: '4px 11px', borderRadius: '20px', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>{stLabel}</span></span>
            </div>
          );
        })}
      </div>

      {/* Drawer */}
      {selectedCoupon && (() => {
        const c = selectedCoupon;
        const stStyle = getStatusStyle(c.status);
        const stLabel = displayStatus(c.status);
        const code = formatCode(c);
        const isExpired = c.status === 'expired' || c.status === 'Hết hạn';
        const isUsed = c.status === 'used' || c.status === 'Đã sử dụng';
        const isHolding = c.status === 'holding' || c.status === 'Đang giữ chỗ';

        let discountStr = c.discount || '';
        let dealTypeStr = c.title || '';
        if (!discountStr && c.title) {
           const match = c.title.match(/(-?\\d+%?|\\d+\\+\\d+)/);
           if (match) {
             discountStr = match[0];
             dealTypeStr = c.title.replace(match[0], '').trim();
             if (dealTypeStr.startsWith('—') || dealTypeStr.startsWith('-')) dealTypeStr = dealTypeStr.substring(1).trim();
           }
        }

        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
            <div onClick={() => setSelectedCoupon(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(6,6,9,.6)', backdropFilter: 'blur(2px)' }}></div>
            <div className="scw" style={{ position: 'absolute', right: 0, top: 0, height: '100vh', width: '412px', maxWidth: '92vw', overflow: 'auto', background: '#131218', borderLeft: '1px solid rgba(212,178,106,.18)', boxShadow: '-30px 0 60px -30px rgba(0,0,0,.8)' }}>
              
              <div style={{ padding: '19px 24px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1.4px', color: '#8c8679', textTransform: 'uppercase' }}>Coupon / QR</div>
                <span onClick={() => setSelectedCoupon(null)} style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5c0b6', cursor: 'pointer' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                </span>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '34px', fontWeight: 800, color: '#e3c27e' }}>{discountStr}</div>
                  <div style={{ fontSize: '13.5px', color: '#f3f0ea', fontWeight: 600, marginTop: '2px' }}>{dealTypeStr}</div>
                  <div style={{ fontSize: '12px', color: '#8c8679', marginTop: '3px' }}>{c.store || 'Tất cả hệ thống'}</div>
                  <div style={{ marginTop: '12px' }}>
                    <span style={{ ...stStyle, fontSize: '12px', fontWeight: 600, padding: '5px 13px', borderRadius: '20px', display: 'inline-flex' }}>{stLabel}</span>
                  </div>
                </div>

                <div style={{ margin: '20px auto 0', width: 184, height: 184, borderRadius: 16, background: '#fff', padding: 14, boxShadow: '0 14px 30px -14px rgba(0,0,0,.6)', position: 'relative' }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=168x168&data=${c.id || code}`} alt="QR" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: !isHolding ? 'grayscale(1)' : 'none', opacity: !isHolding ? 0.5 : 1 }} />
                  {isExpired && <span style={{ position: 'absolute', inset: 0, background: 'rgba(20,19,25,.72)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e88b99', fontSize: '13px', fontWeight: 700 }}>MÃ ĐÃ HẾT HẠN</span>}
                  {isUsed && <span style={{ position: 'absolute', inset: 0, background: 'rgba(20,19,25,.72)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7fd3a2', fontSize: '13px', fontWeight: 700 }}>ĐÃ SỬ DỤNG</span>}
                </div>

                <div style={{ marginTop: '16px', border: '1.5px dashed rgba(212,178,106,.4)', borderRadius: 11, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: '9.5px', letterSpacing: '1.4px', color: '#8c8679', textTransform: 'uppercase' }}>Mã coupon</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#f0dda8', letterSpacing: '2px', marginTop: '3px' }}>{code}</div>
                </div>

                <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                    <span style={{ fontSize: '12.5px', color: '#8c8679' }}>Hạng khách</span>
                    <span style={{ fontSize: '13px', color: '#f3f0ea', fontWeight: 500 }}>{c.tier || 'Member'} · giảm {discountStr.replace('-', '')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                    <span style={{ fontSize: '12.5px', color: '#8c8679' }}>Hạn dùng</span>
                    <span style={{ fontSize: '13px', color: '#f3f0ea', fontWeight: 500 }}>{formatTime(c.expiry)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                    <span style={{ fontSize: '12.5px', color: '#8c8679' }}>Số lần dùng</span>
                    <span style={{ fontSize: '13px', color: '#f3f0ea', fontWeight: 500 }}>1 lần / coupon</span>
                  </div>
                </div>

                <div style={{ marginTop: '14px', display: 'flex', gap: '9px', padding: '12px 14px', background: 'rgba(212,178,106,.06)', border: '1px solid rgba(212,178,106,.2)', borderRadius: 11 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4b26a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: 1 }}>
                    <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4z"/>
                  </svg>
                  <span style={{ fontSize: '11.5px', color: '#cbb884', lineHeight: 1.5 }}>Nhân viên quán quét QR qua tài khoản đối tác để xác nhận. Sau khi quét → chuyển "Đã sử dụng".</span>
                </div>

              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
