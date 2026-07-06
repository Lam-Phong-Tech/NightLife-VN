"use client";

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { AdminPagination, adminPageSize } from '../components/AdminPagination';

export default function AdminCouponsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCoupon, setSelectedCoupon] = useState<any | null>(null);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCoupons, setTotalCoupons] = useState(0);

  const [showCreate, setShowCreate] = useState(false);
  const [fName, setFName] = useState('');
  const [discountType, setDiscountType] = useState('pct');
  const [discountVal, setDiscountVal] = useState('10%');
  const [scope, setScope] = useState('all');
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [tier, setTier] = useState('Member');
  const [duration, setDuration] = useState('30 ngày');
  const [limit, setLimit] = useState('500 mã');
  const [limitCustom, setLimitCustom] = useState('');
  const [storesList, setStoresList] = useState<any[]>([]);

  useEffect(() => {
    if (showCreate && storesList.length === 0) {
      apiClient<any>('/admin/stores', { params: { limit: 1000 } }).then(res => {
        if (res?.data) setStoresList(res.data);
      });
    }
  }, [showCreate]);

  const fetchCoupons = async () => {
    try {
      const res = await apiClient<any>('/admin/coupons', {
        params: { status: activeTab === 'all' ? undefined : activeTab, page: currentPage, limit: adminPageSize }
      });
      setCoupons(res.data);
      setStats(res.stats);
      setTotalCoupons(res.total ?? res.data?.length ?? 0);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [activeTab, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
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
        <span onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 700, color: '#241a0a', background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', padding: '10px 17px', borderRadius: '10px', cursor: 'pointer' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Tạo coupon
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
        {coupons.length === 0 && (
          <div style={{ padding: '30px', textAlign: 'center', color: '#8c8679', fontSize: '13px' }}>Không có coupon nào.</div>
        )}
        {coupons.length > 0 && (
          <AdminPagination
            page={currentPage}
            totalItems={totalCoupons}
            onPageChange={setCurrentPage}
            itemLabel="coupon"
          />
        )}
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

      {/* Create Drawer */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 70 }}>
          <div onClick={() => setShowCreate(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(6,6,9,.6)', backdropFilter: 'blur(2px)' }}></div>
          <div className="scw" style={{ position: 'absolute', right: 0, top: 0, height: '100vh', width: '440px', maxWidth: '94vw', overflow: 'auto', background: '#131218', borderLeft: '1px solid rgba(212,178,106,.18)', boxShadow: '-30px 0 60px -30px rgba(0,0,0,.8)' }}>
            <div style={{ padding: '17px 24px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#131218', zIndex: 2 }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#f3f0ea' }}>Tạo coupon mới</div>
                <div style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '1.5px', color: '#8c8679', textTransform: 'uppercase', marginTop: '2px' }}>Sinh mã giảm giá + QR</div>
              </div>
              <span onClick={() => setShowCreate(false)} style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5c0b6', cursor: 'pointer' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </span>
            </div>
            
            <div style={{ padding: '20px 24px 28px', display: 'flex', flexDirection: 'column', gap: '19px' }}>
              
              <div style={{ display: 'flex', alignItems: 'stretch', background: 'rgba(255,255,255,.035)', border: '1px solid rgba(212,178,106,.22)', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ flex: 1, padding: '13px 15px', minWidth: 0 }}>
                  <div style={{ fontSize: '21px', fontWeight: 800, color: '#e3c27e' }}>{discountType === 'pct' ? '-' + discountVal : '-' + discountVal}</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#f3f0ea', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fName || 'Tên ưu đãi...'}</div>
                  <div style={{ fontSize: '11px', color: '#8c8679', marginTop: '2px' }}>{scope === 'all' ? 'Toàn hệ thống' : `${selectedStores.length} quán`} · HSD {duration}</div>
                </div>
                <div style={{ width: 62, flex: 'none', borderLeft: '1.5px dashed rgba(212,178,106,.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#d4b26a' }}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM18 18h3v3h-3z"/></svg>
                  <span style={{ fontSize: '8.5px', fontWeight: 700, letterSpacing: '1.2px' }}>QR</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.3px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>Tên ưu đãi</div>
                <input value={fName} onChange={e => setFName(e.target.value)} placeholder="VD: Happy Hour tháng 7" style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '12px 14px', color: '#f3f0ea', fontSize: '13.5px', fontFamily: "'Inter',sans-serif", outline: 'none' }} />
              </div>

              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.3px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>Mức giảm</div>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '11px', padding: '3px', gap: '2px', marginBottom: '10px' }}>
                  <span onClick={() => setDiscountType('pct')} style={{ flex: 1, textAlign: 'center', padding: '7px', fontSize: '12px', fontWeight: discountType === 'pct' ? 600 : 400, color: discountType === 'pct' ? '#241a0a' : '#c5c0b6', background: discountType === 'pct' ? 'linear-gradient(135deg,#f4e3b4,#d4b26a)' : 'transparent', borderRadius: '8px', cursor: 'pointer' }}>Giảm %</span>
                  <span onClick={() => setDiscountType('amt')} style={{ flex: 1, textAlign: 'center', padding: '7px', fontSize: '12px', fontWeight: discountType === 'amt' ? 600 : 400, color: discountType === 'amt' ? '#241a0a' : '#c5c0b6', background: discountType === 'amt' ? 'linear-gradient(135deg,#f4e3b4,#d4b26a)' : 'transparent', borderRadius: '8px', cursor: 'pointer' }}>Giảm tiền (₫)</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(discountType === 'pct' ? ['5%', '10%', '15%', '20%', '30%', '50%'] : ['50K', '100K', '200K', '500K']).map(v => (
                    <span key={v} onClick={() => setDiscountVal(v)} style={{ padding: '7px 14px', fontSize: '12.5px', borderRadius: '9px', cursor: 'pointer', border: discountVal === v ? '1px solid rgba(212,178,106,.5)' : '1px solid rgba(255,255,255,.1)', background: discountVal === v ? 'rgba(212,178,106,.15)' : 'rgba(255,255,255,.03)', color: discountVal === v ? '#f0dda8' : '#9b958a' }}>{v}</span>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.3px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>Phạm vi áp dụng</div>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '11px', padding: '3px', gap: '2px' }}>
                  <span onClick={() => setScope('all')} style={{ flex: 1, textAlign: 'center', padding: '7px', fontSize: '12px', fontWeight: scope === 'all' ? 600 : 400, color: scope === 'all' ? '#241a0a' : '#c5c0b6', background: scope === 'all' ? 'linear-gradient(135deg,#f4e3b4,#d4b26a)' : 'transparent', borderRadius: '8px', cursor: 'pointer' }}>Toàn hệ thống</span>
                  <span onClick={() => setScope('select')} style={{ flex: 1, textAlign: 'center', padding: '7px', fontSize: '12px', fontWeight: scope === 'select' ? 600 : 400, color: scope === 'select' ? '#241a0a' : '#c5c0b6', background: scope === 'select' ? 'linear-gradient(135deg,#f4e3b4,#d4b26a)' : 'transparent', borderRadius: '8px', cursor: 'pointer' }}>Chọn quán</span>
                </div>
                {scope === 'select' && (
                  <>
                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {storesList.slice(0, 5).map(v => {
                        const checked = selectedStores.includes(v.id);
                        return (
                          <div key={v.id} onClick={() => setSelectedStores(p => checked ? p.filter(id => id !== v.id) : [...p, v.id])} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 13px', background: checked ? 'rgba(212,178,106,.08)' : 'rgba(255,255,255,.02)', border: checked ? '1px solid rgba(212,178,106,.4)' : '1px solid rgba(255,255,255,.05)', borderRadius: '10px', cursor: 'pointer' }}>
                            <span style={{ width: 18, height: 18, borderRadius: 5, border: checked ? 'none' : '1.5px solid rgba(255,255,255,.15)', background: checked ? '#d4b26a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {checked && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#241a0a" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
                            </span>
                            <div style={{ flex: 1, minWidth: 0, fontSize: '13px', fontWeight: 600, color: '#f3f0ea', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.name}</div>
                            <span style={{ fontSize: '11px', color: '#8c8679' }}>{v.area}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#8c8679', marginTop: '8px' }}>Đã chọn {selectedStores.length} quán</div>
                  </>
                )}
              </div>

              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.3px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>Hạng khách áp dụng</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['Guest', 'Member', 'VIP'].map(t => (
                    <span key={t} onClick={() => setTier(t)} style={{ padding: '7px 14px', fontSize: '12.5px', borderRadius: '9px', cursor: 'pointer', border: tier === t ? '1px solid rgba(212,178,106,.5)' : '1px solid rgba(255,255,255,.1)', background: tier === t ? 'rgba(212,178,106,.15)' : 'rgba(255,255,255,.03)', color: tier === t ? '#f0dda8' : '#9b958a' }}>{t}</span>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.3px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>Thời hạn</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['7 ngày', '14 ngày', '30 ngày', '90 ngày'].map(d => (
                    <span key={d} onClick={() => setDuration(d)} style={{ padding: '7px 14px', fontSize: '12.5px', borderRadius: '9px', cursor: 'pointer', border: duration === d ? '1px solid rgba(212,178,106,.5)' : '1px solid rgba(255,255,255,.1)', background: duration === d ? 'rgba(212,178,106,.15)' : 'rgba(255,255,255,.03)', color: duration === d ? '#f0dda8' : '#9b958a' }}>{d}</span>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.3px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>Giới hạn số mã</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['100 mã', '500 mã', '1.000 mã', 'Không giới hạn', 'Tự nhập...'].map(l => (
                    <span key={l} onClick={() => setLimit(l)} style={{ padding: '7px 14px', fontSize: '12.5px', borderRadius: '9px', cursor: 'pointer', border: limit === l ? '1px solid rgba(212,178,106,.5)' : '1px solid rgba(255,255,255,.1)', background: limit === l ? 'rgba(212,178,106,.15)' : 'rgba(255,255,255,.03)', color: limit === l ? '#f0dda8' : '#9b958a' }}>{l}</span>
                  ))}
                </div>
                {limit === 'Tự nhập...' && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <input value={limitCustom} onChange={e => setLimitCustom(e.target.value)} placeholder="VD: 250" inputMode="numeric" style={{ width: '130px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(212,178,106,.4)', borderRadius: '11px', padding: '11px 14px', color: '#f3f0ea', fontSize: '13.5px', fontFamily: "'Inter',sans-serif", outline: 'none' }} />
                    <span style={{ fontSize: '12.5px', color: '#8c8679' }}>mã · nhập số lượng tuỳ ý</span>
                  </div>
                )}
              </div>

              <span onClick={async () => {
                try {
                  const parsedDiscount = parseInt(discountVal.replace(/[^0-9]/g, ''), 10);
                  const durationMap: Record<string, number> = { '7 ngày': 7, '14 ngày': 14, '30 ngày': 30, '90 ngày': 90 };
                  const limitMap: Record<string, number | undefined> = { '100 mã': 100, '500 mã': 500, '1.000 mã': 1000, 'Không giới hạn': undefined };
                  const usageLimit = limit === 'Tự nhập...' ? (limitCustom ? parseInt(limitCustom, 10) : undefined) : limitMap[limit];
                  const payload = {
                    name: fName,
                    discountType: discountType === 'pct' ? 'PERCENT' : 'FIXED_AMOUNT',
                    discountValue: discountType === 'amt' ? parsedDiscount * 1000 : parsedDiscount,
                    targetStores: scope === 'all' ? [] : selectedStores,
                    targetAudiences: [tier.toUpperCase()],
                    durationDays: durationMap[duration] ?? 30,
                    usageLimit,
                  };
                  await apiClient('/admin/global-coupons', { method: 'POST', data: payload });
                  setShowCreate(false);
                  setFName(''); setDiscountVal('10%'); setScope('all'); setSelectedStores([]); setTier('Member'); setDuration('30 ngày'); setLimit('500 mã'); setLimitCustom('');
                  fetchCoupons();
                  alert('Tạo coupon thành công!');
                } catch (err: any) {
                  alert(err?.message || 'Lỗi khi tạo coupon');
                }
              }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', color: '#241a0a', fontSize: '13px', fontWeight: 700, borderRadius: '11px', cursor: 'pointer', boxShadow: '0 12px 24px -12px rgba(168,124,60,.6)' }}>
                Tạo coupon &amp; sinh QR
              </span>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
