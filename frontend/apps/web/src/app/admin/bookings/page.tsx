"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

export default function AdminBookingsPage() {
  return (
    <React.Suspense fallback={<div style={{ padding: '22px 26px', color: '#8c8679' }}>Đang tải...</div>}>
      <AdminBookingsContent />
    </React.Suspense>
  );
}

function AdminBookingsContent() {
  const searchParams = useSearchParams();
  const city = searchParams.get('city') || '';
  const category = searchParams.get('category') || '';
  const [activeTab, setActiveTab] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ all: 0, new: 0, completed: 0, cancelled: 0 });
  const [search, setSearch] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      setIsActionLoading(true);
      await apiClient(`/admin/bookings/${bookingId}/status`, { method: 'PATCH', data: { status } });
      await fetchBookings();
      setSelectedBooking((prev: any) => prev && prev.id === bookingId ? { ...prev, status } : prev);
    } catch (error) {
      console.error(error);
      alert('Lỗi khi cập nhật trạng thái');
    } finally {
      setIsActionLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      let statusParam = activeTab === 'all' ? undefined : activeTab;
      const res = await apiClient<any>('/admin/bookings', { 
        params: { status: statusParam, search: search || undefined, city: city || undefined, category: category || undefined } 
      });
      setBookings(res.data);
      setMeta(res.meta);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeTab, search, city, category]);

  const getDisplayStatus = (status: string) => {
    if (status === 'REQUESTED') return 'Mới';
    if (status === 'CONFIRMED') return 'Đã xác nhận';
    if (status === 'CHECKED_IN') return 'Đã check-in';
    if (status === 'NO_SHOW') return 'Không đến';
    if (status === 'COMPLETED') return 'Hoàn tất';
    if (status === 'CANCELLED') return 'Đã hủy';
    return status;
  }

  const getStatusStyle = (status: string) => {
    const s = getDisplayStatus(status);
    if (s === 'Mới') return { color: '#8fb6e4', background: 'rgba(111,159,216,.12)', border: '1px solid rgba(111,159,216,.28)' };
    if (s === 'Hoàn tất') return { color: '#7fd3a2', background: 'rgba(95,191,134,.1)', border: '1px solid rgba(95,191,134,.28)' };
    if (s === 'Đã hủy') return { color: '#e88b99', background: 'rgba(224,105,122,.1)', border: '1px solid rgba(224,105,122,.28)' };
    return { color: '#c5c0b6', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)' };
  };

  const formatEmail = (email?: string) => {
    return email || 'Chưa cung cấp email';
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    const D = d.getDate().toString().padStart(2, '0');
    const M = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${h}:${m} - ${D}/${M}`;
  };

  const formatBookingId = (id: string) => {
    const numericMatch = id.match(/\d+/g);
    if (numericMatch && numericMatch.length > 0) {
      return `BK-${numericMatch.join('').slice(-4)}`;
    }
    return `BK-${id.slice(0, 4).toUpperCase()}`;
  };

  return (
    <div data-screen-label="Admin · Booking" style={{ padding: '22px 26px 44px' }}>
      
      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '11px', padding: '3px', gap: '2px' }}>
          {[
            { id: 'all', label: 'Tất cả', count: meta.all },
            { id: 'new', label: 'Mới', count: meta.new },
            { id: 'completed', label: 'Hoàn tất', count: meta.completed },
            { id: 'cancelled', label: 'Đã hủy', count: meta.cancelled }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <span 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  fontSize: '12px',
                  color: isActive ? '#241a0a' : '#c5c0b6',
                  background: isActive ? 'linear-gradient(135deg,#f0dda8,#d4b26a)' : 'transparent',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {tab.label} <b style={{ fontWeight: isActive ? 800 : 600 }}>{tab.count}</b>
              </span>
            );
          })}
        </div>
        <div style={{ flex: 1 }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '10px', padding: '8px 13px', width: '220px' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8c8679" strokeWidth="1.9" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
          <input 
            type="text" 
            placeholder="Tìm khách / mã booking…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', color: '#f3f0ea', fontSize: '12.5px', outline: 'none' }}
          />
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: '#c5c0b6', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '10px', padding: '9px 13px', cursor: 'pointer' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a86a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>Bộ lọc
        </span>
      </div>

      {/* Table */}
      <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '96px 1.5fr 1.6fr 78px 118px 92px 108px', gap: '12px', padding: '13px 18px', fontSize: '10px', fontWeight: 700, letterSpacing: '.9px', color: '#57534b', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.015)' }}>
          <span>Mã</span><span>Khách</span><span>Quán - Cast</span><span>Số người</span><span>Khung giờ</span><span>Nguồn</span><span style={{ textAlign: 'right' }}>Trạng thái</span>
        </div>
        {bookings.map(b => {
          const stStyle = getStatusStyle(b.status);
          const stLabel = getDisplayStatus(b.status);
          return (
            <div 
              key={b.id} 
              onClick={() => setSelectedBooking(b)} 
              style={{ display: 'grid', gridTemplateColumns: '96px 1.5fr 1.6fr 78px 118px 92px 108px', gap: '12px', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,.04)', cursor: 'pointer', fontSize: '13px', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,178,106,.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontFamily: "'Inter'", fontSize: '12px', fontWeight: 600, color: '#d4b26a' }}>{formatBookingId(b.id)}</span>
              <div style={{ minWidth: 0 }}><div style={{ color: '#f3f0ea', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.customerName}</div><div style={{ fontSize: '11px', color: '#57534b', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formatEmail(b.customerEmail)}</div></div>
              <div style={{ minWidth: 0 }}><div style={{ color: '#c5c0b6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.store?.name || b.store}</div><div style={{ fontSize: '11px', color: '#8c8679', marginTop: '2px' }}>{typeof b.cast === 'object' ? (b.cast ? `Cast: ${b.cast.stageName}` : 'Không có') : (b.cast === 'Không cast' ? 'Không có' : b.cast)}</div></div>
              <span style={{ color: '#c5c0b6' }}>{b.partySize} người</span>
              <span style={{ color: '#8c8679', fontSize: '12px' }}>{formatTime(b.scheduledAt)}</span>
              <span style={{ fontSize: '11.5px', color: '#9b958a' }}>{b.source || 'Form web'}</span>
              <span style={{ textAlign: 'right' }}><span style={{ ...stStyle, fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px' }}>{stLabel}</span></span>
            </div>
          );
        })}
        {bookings.length === 0 && (
          <div style={{ padding: '30px', textAlign: 'center', color: '#8c8679', fontSize: '13px' }}>Chưa có booking nào.</div>
        )}
      </div>

      {/* Drawer */}
      {selectedBooking && (() => {
        const bk = selectedBooking;
        const stStyle = getStatusStyle(bk.status);
        const stLabel = getDisplayStatus(bk.status);
        
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
            <div onClick={() => setSelectedBooking(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(6,6,9,.6)', backdropFilter: 'blur(2px)' }}></div>
            <div className="scw" style={{ position: 'absolute', right: 0, top: 0, height: '100vh', width: '428px', maxWidth: '92vw', overflow: 'auto', background: '#131218', borderLeft: '1px solid rgba(212,178,106,.18)', boxShadow: '-30px 0 60px -30px rgba(0,0,0,.8)' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1.4px', color: '#8c8679', textTransform: 'uppercase' }}>Booking · BK-{bk.id.slice(0,4).toUpperCase()}</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#f3f0ea', marginTop: '5px' }}>{bk.customerName}</div>
                  <span style={{ ...stStyle, fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', display: 'inline-block', marginTop: '9px' }}>{stLabel}</span>
                </div>
                <span onClick={() => setSelectedBooking(null)} style={{ width: '34px', height: '34px', flex: 'none', borderRadius: '10px', background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5c0b6', cursor: 'pointer' }}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></span>
              </div>
              <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}><span style={{ fontSize: '12.5px', color: '#8c8679' }}>Email</span><span style={{ fontSize: '13px', color: '#e3c27e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>{formatEmail(bk.customerEmail)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}><span style={{ fontSize: '12.5px', color: '#8c8679' }}>Quán</span><span style={{ fontSize: '13px', color: '#f3f0ea', fontWeight: 500 }}>{bk.store?.name || bk.store}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}><span style={{ fontSize: '12.5px', color: '#8c8679' }}>Cast chỉ định</span><span style={{ fontSize: '13px', color: '#f3f0ea', fontWeight: 500 }}>{typeof bk.cast === 'object' ? (bk.cast ? bk.cast.stageName : 'Không có') : (bk.cast === 'Không cast' ? 'Không có' : bk.cast.replace('Cast: ', ''))}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}><span style={{ fontSize: '12.5px', color: '#8c8679' }}>Số người</span><span style={{ fontSize: '13px', color: '#f3f0ea', fontWeight: 500 }}>{bk.partySize} khách</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}><span style={{ fontSize: '12.5px', color: '#8c8679' }}>Khung giờ</span><span style={{ fontSize: '13px', color: '#f3f0ea', fontWeight: 500 }}>{formatTime(bk.scheduledAt)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}><span style={{ fontSize: '12.5px', color: '#8c8679' }}>Nguồn gửi</span><span style={{ fontSize: '13px', color: '#f3f0ea', fontWeight: 500 }}>{bk.source || 'Form web'}</span></div>
                <div style={{ padding: '14px 0 4px' }}>
                  <div style={{ fontSize: '12.5px', color: '#8c8679', marginBottom: '7px' }}>Ghi chú</div>
                  <div style={{ fontSize: '12.5px', color: '#c5c0b6', lineHeight: 1.6, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '11px', padding: '12px 14px', minHeight: '44px' }}>{bk.customerNote || 'Không có ghi chú.'}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', padding: '12px 14px', background: 'rgba(111,159,216,.06)', border: '1px solid rgba(111,159,216,.2)', borderRadius: '11px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8fb6e4" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: '1px' }}><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.6v.01"/></svg>
                  <span style={{ fontSize: '11.5px', color: '#a9c4e6', lineHeight: 1.55 }}>Khách đổi giờ/số người → hủy &amp; đặt lại. Chỉ được hủy trước giờ hẹn tối thiểu 1 giờ (BOO-08).</span>
                </div>
              </div>
              <div style={{ padding: '16px 24px 26px', borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {bk.status === 'REQUESTED' && (
                  <>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <span onClick={() => !isActionLoading && handleUpdateStatus(bk.id, 'COMPLETED')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#241a0a', background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', padding: '13px', borderRadius: '11px', cursor: isActionLoading ? 'not-allowed' : 'pointer', opacity: isActionLoading ? 0.6 : 1 }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>Đánh dấu hoàn tất</span>
                      <span onClick={() => !isActionLoading && handleUpdateStatus(bk.id, 'CANCELLED')} style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', fontSize: '13px', fontWeight: 600, color: '#e88b99', background: 'rgba(224,105,122,.08)', border: '1px solid rgba(224,105,122,.32)', padding: '13px 18px', borderRadius: '11px', cursor: isActionLoading ? 'not-allowed' : 'pointer', opacity: isActionLoading ? 0.6 : 1 }}>Hủy</span>
                    </div>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 600, color: '#c5c0b6', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)', padding: '12px', borderRadius: '11px', cursor: 'pointer' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8fb6e4" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>Gửi Telegram báo quán</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
