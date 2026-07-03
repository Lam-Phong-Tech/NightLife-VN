"use client";

import React, { useState, useEffect } from 'react';
import { Info, X, Check, Search, Filter, Phone, Send } from 'lucide-react';
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
  goldBright: '#e3c27e',
  goldGrad: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)',
  green: '#4ade80',
  greenBg: 'rgba(74,222,128,0.1)',
  red: '#f87171',
  redBg: 'rgba(248,113,113,0.1)',
  blue: '#60a5fa',
  blueBg: 'rgba(96,165,250,0.1)',
  neonPink: '#e0729e',
};


function CustomSelect({ label, value, onChange, options }: { label: string, value: string, onChange: (v: string) => void, options: {label: string, value: string}[] }) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find(o => o.value === value)?.label || options[0]?.label;
  
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '8px' }}>{label}</div>
      <div 
        onClick={() => setOpen(!open)}
        style={{ width: '100%', height: '36px', background: colors.surface2, border: `1px solid ${colors.borderSoft}`, borderRadius: '6px', color: colors.text, padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '13px' }}
      >
        {selectedLabel}
        <span style={{ fontSize: '10px', color: colors.muted, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
      </div>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '6px', marginTop: '4px', zIndex: 20, padding: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
          {options.map(opt => (
            <div 
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{ padding: '8px 12px', fontSize: '13px', color: opt.value === value ? colors.gold : colors.text, background: opt.value === value ? colors.surface2 : 'transparent', borderRadius: '4px', cursor: 'pointer' }}
              onMouseEnter={(e) => { if (opt.value !== value) e.currentTarget.style.background = colors.surface2; }}
              onMouseLeave={(e) => { if (opt.value !== value) e.currentTarget.style.background = 'transparent'; }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminBookingsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ all: 0, new: 0, completed: 0, cancelled: 0 });
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [timeframe, setTimeframe] = useState('');
  const [storeId, setStoreId] = useState('');
  const [source, setSource] = useState('');
  const [sortBy, setSortBy] = useState('newest');

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
        params: { status: statusParam, search: search || undefined, timeframe: timeframe || undefined, storeId: storeId || undefined, source: source || undefined, sortBy } 
      });
      setBookings(res.data);
      setMeta(res.meta);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeTab, search, timeframe, storeId, source, sortBy]);

  const getDisplayStatus = (status: string) => {
    if (status === 'REQUESTED') return 'Mới';
    if (status === 'COMPLETED') return 'Hoàn tất';
    if (status === 'CANCELLED') return 'Đã hủy';
    return status;
  }

  const getStatusStyle = (status: string) => {
    const s = getDisplayStatus(status);
    if (s === 'Mới') return { color: colors.blue, bg: colors.blueBg, border: `1px solid ${colors.blue}40` };
    if (s === 'Hoàn tất') return { color: colors.green, bg: colors.greenBg, border: `1px solid ${colors.green}40` };
    if (s === 'Đã hủy') return { color: colors.neonPink, bg: 'rgba(224,114,158,.1)', border: `1px solid rgba(224,114,158,.3)` };
    return { color: colors.muted, bg: colors.surface2, border: `1px solid ${colors.borderSoft}` };
  };

  return (
    <div style={{ padding: '32px 40px', position: 'relative', minHeight: '100%' }}>
      
      {/* TOP FILTERS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', background: colors.surface1, borderRadius: '8px', padding: '4px', border: `1px solid ${colors.borderSoft}` }}>
          <button 
            onClick={() => setActiveTab('all')}
            style={{
              background: activeTab === 'all' ? colors.goldGrad : 'transparent',
              color: activeTab === 'all' ? colors.onGold : colors.muted,
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: activeTab === 'all' ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            Tất cả {meta.all}
          </button>
          <button 
            onClick={() => setActiveTab('new')}
            style={{
              background: activeTab === 'new' ? colors.surface2 : 'transparent',
              color: activeTab === 'new' ? colors.text : colors.muted,
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: activeTab === 'new' ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            Mới {meta.new}
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            style={{
              background: activeTab === 'completed' ? colors.surface2 : 'transparent',
              color: activeTab === 'completed' ? colors.text : colors.muted,
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: activeTab === 'completed' ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            Hoàn tất {meta.completed}
          </button>
          <button 
            onClick={() => setActiveTab('cancelled')}
            style={{
              background: activeTab === 'cancelled' ? colors.surface2 : 'transparent',
              color: activeTab === 'cancelled' ? colors.text : colors.muted,
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: activeTab === 'cancelled' ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            Đã hủy {meta.cancelled}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color={colors.muted} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Tìm khách / mã booking..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                height: '40px',
                width: '260px',
                borderRadius: '8px',
                border: `1px solid ${colors.borderSoft}`,
                background: colors.surface1,
                color: colors.text,
                padding: '0 16px 0 42px',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              style={{
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: showFilters ? colors.surface2 : colors.surface1,
                color: colors.text,
                border: `1px solid ${colors.borderSoft}`,
                padding: '0 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Filter size={16} />
              Bộ lọc
            </button>

            {showFilters && (
              <div style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                width: '280px',
                background: colors.surface1,
                border: `1px solid ${colors.borderSoft}`,
                borderRadius: '12px',
                padding: '16px',
                zIndex: 10,
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <CustomSelect 
                  label="Thời gian" 
                  value={timeframe} 
                  onChange={setTimeframe} 
                  options={[
                    { label: 'Tất cả thời gian', value: '' },
                    { label: 'Hôm nay', value: 'today' },
                    { label: '7 ngày qua', value: 'week' },
                    { label: '30 ngày qua', value: 'month' }
                  ]}
                />
                
                <CustomSelect 
                  label="Sắp xếp" 
                  value={sortBy} 
                  onChange={setSortBy} 
                  options={[
                    { label: 'Mới nhất', value: 'newest' },
                    { label: 'Cũ nhất', value: 'oldest' }
                  ]}
                />

                <CustomSelect 
                  label="Nguồn" 
                  value={source} 
                  onChange={setSource} 
                  options={[
                    { label: 'Tất cả nguồn', value: '' },
                    { label: 'Telegram', value: 'Telegram' },
                    { label: 'LINE', value: 'LINE' },
                    { label: 'Web', value: 'Web' }
                  ]}
                />
                
                <button 
                  onClick={() => { setTimeframe(''); setStoreId(''); setSource(''); setSortBy('newest'); setShowFilters(false); }}
                  style={{ width: '100%', height: '36px', background: 'transparent', border: `1px solid ${colors.borderSoft}`, borderRadius: '6px', color: colors.muted, fontSize: '13px', cursor: 'pointer', marginTop: '4px' }}
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.borderSoft}` }}>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>MÃ</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>KHÁCH</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>QUÁN · CAST</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>SỐ NGƯỜI</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>KHUNG GIỜ</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>NGUỒN</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px', textAlign: 'right' }}>TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((bk, idx) => {
              const statusStyle = getStatusStyle(bk.status);
              return (
                <tr 
                  key={idx} 
                  onClick={() => setSelectedBooking(bk)}
                  style={{ 
                    borderBottom: `1px solid ${colors.borderSoft}`,
                    cursor: 'pointer',
                    background: selectedBooking?.id === bk.id ? colors.surface2 : 'transparent',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = colors.surface2}
                  onMouseLeave={(e) => e.currentTarget.style.background = selectedBooking?.id === bk.id ? colors.surface2 : 'transparent'}
                >
                  <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 700, color: colors.gold }}>{bk.id.substring(0,8)}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: colors.text }}>{bk.customerName}</div>
                    <div style={{ fontSize: '12px', color: colors.muted, marginTop: '2px' }}>{bk.phone}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: colors.text }}>{bk.store}</div>
                    <div style={{ fontSize: '12px', color: colors.muted, marginTop: '2px' }}>{bk.cast}</div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: colors.text2 }}>{bk.partySize}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: colors.text2 }}>{new Date(bk.scheduledAt).toLocaleString('vi-VN')}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: colors.text2 }}>{bk.source}</td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <span style={{ 
                      background: statusStyle.bg, 
                      color: statusStyle.color, 
                      border: statusStyle.border,
                      padding: '4px 16px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: 600,
                    }}>
                      {getDisplayStatus(bk.status)}
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
        right: selectedBooking ? 0 : '-400px',
        bottom: 0,
        width: '400px',
        background: colors.bg,
        borderLeft: `1px solid ${colors.borderSoft}`,
        boxShadow: selectedBooking ? '-10px 0 30px rgba(0,0,0,0.5)' : 'none',
        transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {selectedBooking && (
          <>
            <div style={{ padding: '24px', borderBottom: `1px solid ${colors.borderSoft}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: colors.muted, marginBottom: '8px' }}>
                    BOOKING · {selectedBooking.id.substring(0,8)}
                  </div>
                  <h2 style={{ fontSize: '24px', fontWeight: 700, color: colors.text, margin: '0 0 16px 0' }}>{selectedBooking.customerName}</h2>
                  <span style={{ 
                    ...getStatusStyle(selectedBooking.status),
                    padding: '4px 12px', 
                    borderRadius: '12px', 
                    fontSize: '12px', 
                    fontWeight: 600,
                  }}>
                    {getDisplayStatus(selectedBooking.status)}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedBooking(null)}
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
              
              {/* Basic Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: `1px solid ${colors.borderSoft}`, marginBottom: '16px' }}>
                <span style={{ color: colors.muted, fontSize: '14px' }}>Số điện thoại</span>
                <span style={{ color: colors.gold, fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} />
                  {selectedBooking.phone}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: `1px solid ${colors.borderSoft}`, marginBottom: '16px' }}>
                <span style={{ color: colors.muted, fontSize: '14px' }}>Quán</span>
                <span style={{ color: colors.text, fontSize: '14px', fontWeight: 700 }}>{selectedBooking.store}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: `1px solid ${colors.borderSoft}`, marginBottom: '16px' }}>
                <span style={{ color: colors.muted, fontSize: '14px' }}>Cast chỉ định</span>
                <span style={{ color: colors.text, fontSize: '14px', fontWeight: 700 }}>{selectedBooking.cast}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: `1px solid ${colors.borderSoft}`, marginBottom: '16px' }}>
                <span style={{ color: colors.muted, fontSize: '14px' }}>Số người</span>
                <span style={{ color: colors.text, fontSize: '14px', fontWeight: 700 }}>{selectedBooking.partySize} khách</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: `1px solid ${colors.borderSoft}`, marginBottom: '16px' }}>
                <span style={{ color: colors.muted, fontSize: '14px' }}>Khung giờ</span>
                <span style={{ color: colors.text, fontSize: '14px', fontWeight: 700 }}>{new Date(selectedBooking.scheduledAt).toLocaleString('vi-VN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', marginBottom: '8px' }}>
                <span style={{ color: colors.muted, fontSize: '14px' }}>Nguồn gửi</span>
                <span style={{ color: colors.text, fontSize: '14px', fontWeight: 700 }}>{selectedBooking.source}</span>
              </div>

              {/* Note */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ color: colors.muted, fontSize: '14px', marginBottom: '8px' }}>Ghi chú</div>
                <div style={{ 
                  background: colors.surface1, 
                  border: `1px solid ${colors.borderSoft}`, 
                  borderRadius: '8px', 
                  padding: '16px',
                  color: colors.text2,
                  fontSize: '14px',
                  lineHeight: '1.5',
                  minHeight: '60px'
                }}>
                  {selectedBooking.note || 'Không có ghi chú.'}
                </div>
              </div>

              {/* Info Banner */}
              <div style={{ 
                background: colors.blueBg, 
                border: `1px solid rgba(96,165,250,0.2)`, 
                borderRadius: '8px', 
                padding: '16px',
                display: 'flex',
                gap: '12px',
                color: colors.blue,
                fontSize: '13px',
                lineHeight: '1.5'
              }}>
                <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Khách đổi giờ/số người → hủy & đặt lại. Chỉ được hủy trước giờ hẹn tối thiểu 1 giờ (BOO-08).</span>
              </div>

            </div>

            {/* Actions Footer */}
            {selectedBooking.status !== 'COMPLETED' && selectedBooking.status !== 'CANCELLED' && (
              <div style={{ padding: '24px', borderTop: `1px solid ${colors.borderSoft}` }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <button onClick={() => handleUpdateStatus(selectedBooking.id, 'COMPLETED')} disabled={isActionLoading} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: colors.goldGrad, color: colors.onGold, border: 'none', height: '48px', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: isActionLoading ? 'not-allowed' : 'pointer', opacity: isActionLoading ? 0.5 : 1 }}>
                    <Check size={18} strokeWidth={3} />
                    Đánh dấu hoàn tất
                  </button>
                  <button onClick={() => handleUpdateStatus(selectedBooking.id, 'CANCELLED')} disabled={isActionLoading} style={{ width: '100px', background: 'transparent', color: colors.neonPink, border: `1px solid rgba(224,114,158,.3)`, height: '48px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: isActionLoading ? 'not-allowed' : 'pointer', opacity: isActionLoading ? 0.5 : 1 }}>
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}

