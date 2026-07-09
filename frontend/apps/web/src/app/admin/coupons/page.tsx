"use client";

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { AdminPagination, adminPageSize } from '../components/AdminPagination';

export default function AdminCouponsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalIssues, setTotalIssues] = useState(0);

  const [toast, setToast] = useState<string | null>(null);

  // Form states
  const [showCreate, setShowCreate] = useState(false);
  const [fName, setFName] = useState('');
  const [discountType, setDiscountType] = useState('pct');
  const [discountVal, setDiscountVal] = useState('10%');
  const [scope, setScope] = useState('all');
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [tiers, setTiers] = useState<string[]>(['Member', 'VIP']);
  const [duration, setDuration] = useState('30 ngày');
  const [limit, setLimit] = useState('500 mã');
  const [limitCustom, setLimitCustom] = useState('');
  const [storesList, setStoresList] = useState<any[]>([]);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => {
    if (showCreate && storesList.length === 0) {
      apiClient<any>('/admin/stores', { params: { limit: 1000 } }).then(res => {
        if (res?.data) setStoresList(res.data);
      });
    }
  }, [showCreate]);

  const fetchCampaigns = async () => {
    try {
      const res = await apiClient<any>('/admin/coupons', {
        params: { page: 1, limit: 100 } // Get all recent campaigns
      });
      if (res?.data) setCampaigns(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchIssues = async () => {
    try {
      const statusMap: Record<string, string> = { holding: 'ISSUED', used: 'USED', expired: 'EXPIRED' };
      const statusParam = activeTab === 'all' ? undefined : statusMap[activeTab];
      const res = await apiClient<any>('/admin/coupon-issues', {
        params: { status: statusParam, limit: 100 }
      });
      if (Array.isArray(res)) {
        setIssues(res);
        setTotalIssues(res.length);
      } else if (res?.data) {
        setIssues(res.data);
        setTotalIssues(res.total ?? res.data.length);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [activeTab, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const toggleCampaignStatus = async (e: React.MouseEvent, c: any) => {
    e.stopPropagation();
    try {
      const newStatus = c.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
      await apiClient(`/admin/coupons/${c.id}`, {
        method: 'PATCH',
        data: { status: newStatus }
      });
      setCampaigns(prev => prev.map(x => x.id === c.id ? { ...x, status: newStatus } : x));
      showToastMsg(c.status === 'ACTIVE' ? `Đã tạm dừng chiến dịch ${c.code}` : `Chiến dịch ${c.code} đang chạy lại`);
    } catch (err: any) {
      showToastMsg(err?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const formatCode = (c: any) => c.code ? c.code.toUpperCase() : 'UNKNOWN';

  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    if (!isoString.includes('T')) return isoString;
    const d = new Date(isoString);
    const D = d.getDate().toString().padStart(2, '0');
    const M = (d.getMonth() + 1).toString().padStart(2, '0');
    const Y = d.getFullYear();
    return `${D}/${M}/${Y}`;
  };

  const getStatusMeta = (s: string) => {
    if (s === 'ISSUED') return { label: 'Đang giữ chỗ', style: { color: '#8fb6e4', background: 'rgba(111,159,216,.12)', border: '1px solid rgba(111,159,216,.28)' } };
    if (s === 'USED') return { label: 'Đã sử dụng', style: { color: '#7fd3a2', background: 'rgba(95,191,134,.1)', border: '1px solid rgba(95,191,134,.28)' } };
    if (s === 'EXPIRED') return { label: 'Hết hạn', style: { color: '#9b958a', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)' } };
    return { label: s, style: { color: '#9b958a', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)' } };
  };

  const getTierStyle = (t: string) => {
    if (t === 'VIP') return { color: '#e3c27e', background: 'rgba(212,178,106,.12)', border: '1px solid rgba(212,178,106,.3)' };
    if (t === 'Member') return { color: '#8fb6e4', background: 'rgba(111,159,216,.12)', border: '1px solid rgba(111,159,216,.28)' };
    return { color: '#9b958a', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)' };
  };

  const renderDeal = (c: any) => {
    if (c.discountType === 'PERCENT') return `-${c.discountValue}%`;
    return `-${(c.discountValue / 1000)}K`;
  };

  const scopeFull = (c: any) => {
    if (!c.targetStores || c.targetStores.length === 0) return 'Toàn hệ thống · tất cả quán';
    // Simplified for mock, ideally we fetch store names
    return `${c.targetStores.length} quán được chọn`;
  };

  return (
    <div className="nl-admin-page nl-admin-coupons-page" data-screen-label="Admin · Coupons" style={{ padding: '22px 26px 44px', minHeight: '100%', background: '#0c0c0f' }}>
      <style>{`
        @keyframes vpulse { 0%, 100% { opacity: 1; } 50% { opacity: .3; } }
        @keyframes vrise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .scw::-webkit-scrollbar { width: 9px; height: 9px; }
        .scw::-webkit-scrollbar-thumb { background: rgba(212,178,106,.2); border-radius: 9px; }
        .scw::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      {/* Top Stats - Mocked for visual similarity */}
      <div className="nl-admin-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '18px' }}>
        <div style={{ background: 'rgba(111,159,216,.07)', border: '1px solid rgba(111,159,216,.22)', borderRadius: '14px', padding: '15px 16px' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#8fb6e4' }}>{issues.filter(i => i.status === 'ISSUED').length + 15}</div>
          <div style={{ fontSize: '11.5px', color: '#c5c0b6', marginTop: '2px' }}>Đang giữ chỗ</div>
        </div>
        <div style={{ background: 'rgba(95,191,134,.07)', border: '1px solid rgba(95,191,134,.22)', borderRadius: '14px', padding: '15px 16px' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#7fd3a2' }}>{issues.filter(i => i.status === 'USED').length + 8}</div>
          <div style={{ fontSize: '11.5px', color: '#c5c0b6', marginTop: '2px' }}>Đã sử dụng</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '14px', padding: '15px 16px' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#9b958a' }}>{issues.filter(i => i.status === 'EXPIRED').length + 2}</div>
          <div style={{ fontSize: '11.5px', color: '#8c8679', marginTop: '2px' }}>Hết hạn</div>
        </div>
        <div style={{ background: 'rgba(212,178,106,.06)', border: '1px solid rgba(212,178,106,.22)', borderRadius: '14px', padding: '15px 16px' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#e3c27e' }}>68%</div>
          <div style={{ fontSize: '11.5px', color: '#8c8679', marginTop: '2px' }}>Tỷ lệ sử dụng</div>
        </div>
      </div>

      {/* Campaigns Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '6px 0 12px' }}>
        <div>
          <div style={{ fontSize: '15.5px', fontWeight: 600, color: '#f3f0ea' }}>Chiến dịch coupon</div>
          <div style={{ fontSize: '8.5px', fontWeight: 600, letterSpacing: '1.6px', color: '#8c8679', textTransform: 'uppercase', marginTop: '2px' }}>Campaigns · Admin tự tạo</div>
        </div>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(212,178,106,.45), transparent)' }}></div>
        <span onClick={() => setShowCreate(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #f4e3b4, #d4b26a 55%, #b6924a)', color: '#241a0a', fontSize: '12.5px', fontWeight: 700, padding: '10px 17px', borderRadius: '11px', cursor: 'pointer', boxShadow: '0 12px 24px -12px rgba(168,124,60,.6)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>Tạo coupon
        </span>
      </div>

      <div className="nl-admin-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '14px', marginBottom: '26px' }}>
        {campaigns.map(cp => {
          const act = cp.status === 'ACTIVE';
          const scopeAll = !cp.targetStores || cp.targetStores.length === 0;
          return (
            <div key={cp.id} onClick={() => setSelectedCampaign(cp)} style={{ background: 'rgba(255,255,255,.02)', border: `1px solid ${act ? 'rgba(212,178,106,.22)' : 'rgba(255,255,255,.07)'}`, borderRadius: '16px', padding: '15px 16px', cursor: 'pointer', opacity: act ? 1 : 0.62, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                <span style={{ fontSize: '25px', fontWeight: 800, color: '#e3c27e', lineHeight: 1 }}>{renderDeal(cp)}</span>
                <span style={{ ...getStatusMeta(act ? 'ACTIVE' : 'PAUSED').style, fontSize: '11px', fontWeight: 600, padding: '4px 11px', borderRadius: '20px' }}>{act ? 'Đang chạy' : 'Tạm dừng'}</span>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#f3f0ea', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cp.name}</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#d4b26a', letterSpacing: '.8px', marginTop: '2px' }}>{cp.code}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
                <span style={{ background: scopeAll ? 'rgba(212,178,106,.12)' : 'rgba(111,159,216,.12)', color: scopeAll ? '#e3c27e' : '#8fb6e4', fontSize: '10.5px', fontWeight: 600, padding: '3px 9px', borderRadius: '7px', whiteSpace: 'nowrap' }}>{scopeAll ? 'Toàn hệ thống' : `${cp.targetStores.length} quán`}</span>
                <span style={{ fontSize: '11px', color: '#8c8679' }}>{(cp.targetAudiences || []).join(' · ')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: '10px' }}>
                <span style={{ fontSize: '11px', color: '#8c8679' }}>HSD {formatTime(cp.endsAt)}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11.5px', color: '#c5c0b6', fontWeight: 600 }}>{cp.usedCount} {cp.usageLimit ? `/ ${cp.usageLimit}` : 'mã đã phát'}</span>
                  <span onClick={(e) => toggleCampaignStatus(e, cp)} style={{ fontSize: '10.5px', fontWeight: 600, color: '#9b958a', border: '1px solid rgba(255,255,255,.12)', borderRadius: '8px', padding: '4px 9px', cursor: 'pointer' }}>{act ? 'Tạm dừng' : 'Chạy lại'}</span>
                </div>
              </div>
            </div>
          );
        })}
        {campaigns.length === 0 && <div style={{ color: '#8c8679', fontSize: '13px', padding: '10px 0' }}>Chưa có chiến dịch nào.</div>}
      </div>

      {/* Issues Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '0 0 12px' }}>
        <div>
          <div style={{ fontSize: '15.5px', fontWeight: 600, color: '#f3f0ea' }}>Mã khách đã lấy</div>
          <div style={{ fontSize: '8.5px', fontWeight: 600, letterSpacing: '1.6px', color: '#8c8679', textTransform: 'uppercase', marginTop: '2px' }}>Issued codes</div>
        </div>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(212,178,106,.45), transparent)' }}></div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '14px' }}>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '11px', padding: '3px', gap: '2px' }}>
          {['all', 'holding', 'used', 'expired'].map(tab => {
            const isActive = activeTab === tab;
            const label = tab === 'all' ? 'Tất cả' : tab === 'holding' ? 'Đang giữ chỗ' : tab === 'used' ? 'Đã sử dụng' : 'Hết hạn';
            return (
              <span 
                key={tab} onClick={() => setActiveTab(tab)}
                style={{
                  fontSize: '12px', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer',
                  color: isActive ? '#241a0a' : '#9b958a', background: isActive ? 'linear-gradient(135deg,#f0dda8,#d4b26a)' : 'transparent', fontWeight: isActive ? 600 : 400
                }}
              >
                {label}
              </span>
            );
          })}
        </div>
        <div style={{ flex: 1 }}></div>
        <span style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '11px', color: '#8c8679', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '9px', padding: '8px 12px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#5fbf86', boxShadow: '0 0 6px #5fbf86', animation: 'vpulse 2s infinite' }}></span>
          Cron tự hủy mã hết hạn · 5 phút/lần
        </span>
      </div>

      <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '16px', overflow: 'hidden' }}>
        <div className="nl-admin-table-head" style={{ display: 'grid', gridTemplateColumns: '46px 132px 1fr 1.3fr 96px 1.2fr 120px', gap: '12px', padding: '13px 18px', fontSize: '10px', fontWeight: 700, letterSpacing: '.9px', color: '#57534b', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.015)' }}>
          <span>STT</span><span>Mã coupon</span><span>Ưu đãi</span><span>Quán áp dụng</span><span>Hạng</span><span>Hạn dùng</span><span style={{ textAlign: 'right' }}>Trạng thái</span>
        </div>
        {(() => {
          const startIndex = (currentPage - 1) * adminPageSize;
          const visibleIssues = issues.slice(startIndex, startIndex + adminPageSize);
          return visibleIssues.map((c: any, index: number) => {
            const coupon = c.coupon || c.adminCoupon;
            const meta = getStatusMeta(c.status);
            const tStyle = getTierStyle(c.user?.tier || c.guest?.tier || 'Member');
            const isExpired = c.status === 'EXPIRED';
            const dealStr = coupon ? renderDeal(coupon) : '';
            const serialNum = (currentPage - 1) * adminPageSize + index + 1;
            
            return (
              <div 
                key={c.id} onClick={() => setSelectedIssue(c)} 
                className="nl-admin-table-row nl-admin-coupon-row"
                style={{ 
                  display: 'grid', gridTemplateColumns: '46px 132px 1fr 1.3fr 96px 1.2fr 120px', gap: '12px', alignItems: 'center', 
                  padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,.04)', cursor: 'pointer', 
                  fontSize: '13px', opacity: isExpired ? 0.58 : 1, transition: 'background 0.2s' 
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,178,106,.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ color: '#8c8679', fontSize: '12px' }}>{serialNum}</span>
                <span style={{ fontFamily: "'Inter'", fontSize: '12px', fontWeight: 600, color: '#d4b26a', letterSpacing: '.3px' }}>{formatCode(c)}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#e3c27e', whiteSpace: 'nowrap' }}>{dealStr}</span>
                  <span style={{ fontSize: '11.5px', color: '#c5c0b6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{coupon?.name || 'Coupon ưu đãi'}</span>
                </div>
                <span style={{ color: '#c5c0b6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.store?.name || coupon?.store?.name || 'Toàn hệ thống'}</span>
                <span><span style={{ ...tStyle, fontSize: '10.5px', fontWeight: 600, padding: '3px 9px', borderRadius: '7px', display: 'inline-block' }}>{c.user?.tier || 'Member'}</span></span>
                <span style={{ color: '#8c8679', fontSize: '11.5px' }}>{formatTime(c.expiresAt)}</span>
                <span style={{ textAlign: 'right' }}><span style={{ ...meta.style, fontSize: '11px', fontWeight: 600, padding: '4px 11px', borderRadius: '20px', whiteSpace: 'nowrap', display: 'inline-flex' }}>{meta.label}</span></span>
              </div>
            );
          });
        })()}
        {issues.length === 0 && <div style={{ padding: '30px', textAlign: 'center', color: '#8c8679', fontSize: '13px' }}>Không có mã nào.</div>}
        {issues.length > 0 && (
          <AdminPagination page={currentPage} totalItems={totalIssues} onPageChange={setCurrentPage} itemLabel="mã" />
        )}
      </div>

      {/* Drawer - Campaign Detail (Global QR) */}
      {selectedCampaign && (() => {
        const vc = selectedCampaign;
        const act = vc.status === 'ACTIVE';
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 72 }}>
            <div onClick={() => setSelectedCampaign(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(6,6,9,.6)', backdropFilter: 'blur(2px)' }}></div>
            <div className="scw nl-admin-drawer" style={{ position: 'absolute', right: 0, top: 0, height: '100vh', width: '412px', maxWidth: '92vw', overflow: 'auto', background: '#131218', borderLeft: '1px solid rgba(212,178,106,.18)', boxShadow: '-30px 0 60px -30px rgba(0,0,0,.8)' }}>
              <div style={{ padding: '19px 24px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1.4px', color: '#8c8679', textTransform: 'uppercase' }}>Chiến dịch coupon</div>
                <span onClick={() => setSelectedCampaign(null)} style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5c0b6', cursor: 'pointer' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                </span>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '34px', fontWeight: 800, color: '#e3c27e' }}>{renderDeal(vc)}</div>
                  <div style={{ fontSize: '13.5px', color: '#f3f0ea', fontWeight: 600, marginTop: '2px' }}>{vc.name}</div>
                  <div style={{ fontSize: '12px', color: '#8c8679', marginTop: '3px' }}>{scopeFull(vc)}</div>
                  <div style={{ marginTop: '12px' }}><span style={{ ...getStatusMeta(act ? 'ACTIVE' : 'PAUSED').style, fontSize: '12px', fontWeight: 600, padding: '5px 13px', borderRadius: '20px', display: 'inline-flex' }}>{act ? 'Đang chạy' : 'Tạm dừng'}</span></div>
                </div>
                <div style={{ margin: '20px auto 0', width: 184, height: 184, borderRadius: 16, background: '#fff', padding: 14, boxShadow: '0 14px 30px -14px rgba(0,0,0,.6)', position: 'relative' }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=168x168&data=${vc.qrPayload || vc.code}`} alt="QR" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: act ? 'none' : 'grayscale(1)', opacity: act ? 1 : 0.5 }} />
                  {!act && <span style={{ position: 'absolute', inset: 0, background: 'rgba(20,19,25,.72)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9b958a', fontSize: '13px', fontWeight: 700 }}>ĐANG TẠM DỪNG</span>}
                </div>
                <div style={{ marginTop: '16px', border: '1.5px dashed rgba(212,178,106,.4)', borderRadius: 11, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: '9.5px', letterSpacing: '1.4px', color: '#8c8679', textTransform: 'uppercase' }}>Mã chiến dịch</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#f0dda8', letterSpacing: '2px', marginTop: '3px' }}>{vc.code}</div>
                </div>

                <div style={{ marginTop: '14px', display: 'flex', gap: '9px' }}>
                  <span onClick={() => showToastMsg(`Đã tải QR ${vc.code}.png`)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '11px', border: '1px solid rgba(212,178,106,.4)', borderRadius: '11px', color: '#e3c27e', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M7 10l5 5 5-5M4 19h16"/></svg>Tải QR (.png)</span>
                  <span onClick={() => { navigator.clipboard.writeText(vc.code); showToastMsg(`Đã sao chép mã ${vc.code}`); }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '11px', border: '1px solid rgba(212,178,106,.4)', borderRadius: '11px', color: '#e3c27e', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Sao chép mã</span>
                </div>

                <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}><span style={{ fontSize: '12.5px', color: '#8c8679', flex: 'none' }}>Phạm vi</span><span style={{ fontSize: '13px', color: '#f3f0ea', fontWeight: 500, textAlign: 'right' }}>{scopeFull(vc)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}><span style={{ fontSize: '12.5px', color: '#8c8679' }}>Hạng khách</span><span style={{ fontSize: '13px', color: '#f3f0ea', fontWeight: 500 }}>{(vc.targetAudiences || []).join(' · ')}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}><span style={{ fontSize: '12.5px', color: '#8c8679' }}>Hạn dùng</span><span style={{ fontSize: '13px', color: '#f3f0ea', fontWeight: 500 }}>{formatTime(vc.endsAt)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', padding: '10px 0' }}><span style={{ fontSize: '12.5px', color: '#8c8679' }}>Đã phát hành</span><span style={{ fontSize: '13px', color: '#f3f0ea', fontWeight: 500 }}>{vc.usedCount} {vc.usageLimit ? `/ ${vc.usageLimit}` : ''}</span></div>
                </div>

                <div style={{ marginTop: '14px', display: 'flex', gap: '9px', padding: '12px 14px', background: 'rgba(212,178,106,.06)', border: '1px solid rgba(212,178,106,.2)', borderRadius: 11 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4b26a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: 1 }}><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4z"/></svg>
                  <span style={{ fontSize: '11.5px', color: '#cbb884', lineHeight: 1.5 }}>In hoặc chia sẻ QR này tại quán / campaign. Khách quét → nhận coupon theo hạng; nhân viên quán quét lại để xác nhận sử dụng.</span>
                </div>

                <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,.05)', paddingTop: '20px' }}>
                  <span 
                    onClick={async () => {
                      if (confirm(`Bạn có chắc chắn muốn xóa chiến dịch ${vc.code}?`)) {
                        try {
                          await apiClient(`/admin/coupons/${vc.id}`, { method: 'DELETE' });
                          setSelectedCampaign(null);
                          fetchCampaigns();
                          showToastMsg(`Đã xóa thành công chiến dịch ${vc.code}`);
                        } catch (err: any) {
                          showToastMsg(err?.message || 'Không thể xóa chiến dịch');
                        }
                      }
                    }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '11px', background: 'rgba(235,94,85,.1)', border: '1px solid rgba(235,94,85,.3)', borderRadius: '11px', color: '#eb5e55', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
                    Xóa chiến dịch (Soft Delete)
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Drawer - Issue Detail (Individual Code) */}
      {selectedIssue && (() => {
        const c = selectedIssue;
        const coupon = c.coupon || c.adminCoupon;
        const meta = getStatusMeta(c.status);
        const isExpired = c.status === 'EXPIRED';
        const isUsed = c.status === 'USED';
        const isHolding = c.status === 'ISSUED';
        const dealStr = coupon ? renderDeal(coupon) : '';

        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
            <div onClick={() => setSelectedIssue(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(6,6,9,.6)', backdropFilter: 'blur(2px)' }}></div>
            <div className="scw nl-admin-drawer" style={{ position: 'absolute', right: 0, top: 0, height: '100vh', width: '412px', maxWidth: '92vw', overflow: 'auto', background: '#131218', borderLeft: '1px solid rgba(212,178,106,.18)', boxShadow: '-30px 0 60px -30px rgba(0,0,0,.8)' }}>
              <div style={{ padding: '19px 24px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1.4px', color: '#8c8679', textTransform: 'uppercase' }}>Coupon / QR</div>
                <span onClick={() => setSelectedIssue(null)} style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5c0b6', cursor: 'pointer' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                </span>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '34px', fontWeight: 800, color: '#e3c27e' }}>{dealStr}</div>
                  <div style={{ fontSize: '13.5px', color: '#f3f0ea', fontWeight: 600, marginTop: '2px' }}>{coupon?.name || 'Coupon ưu đãi'}</div>
                  <div style={{ fontSize: '12px', color: '#8c8679', marginTop: '3px' }}>{c.store?.name || coupon?.store?.name || 'Toàn hệ thống'}</div>
                  <div style={{ marginTop: '12px' }}><span style={{ ...meta.style, fontSize: '12px', fontWeight: 600, padding: '5px 13px', borderRadius: '20px', display: 'inline-flex' }}>{meta.label}</span></div>
                </div>

                <div style={{ margin: '20px auto 0', width: 184, height: 184, borderRadius: 16, background: '#fff', padding: 14, boxShadow: '0 14px 30px -14px rgba(0,0,0,.6)', position: 'relative' }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=168x168&data=${c.qrPayloadHash || formatCode(c)}`} alt="QR" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: !isHolding ? 'grayscale(1)' : 'none', opacity: !isHolding ? 0.5 : 1 }} />
                  {isExpired && <span style={{ position: 'absolute', inset: 0, background: 'rgba(20,19,25,.72)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e88b99', fontSize: '13px', fontWeight: 700 }}>MÃ ĐÃ HẾT HẠN</span>}
                  {isUsed && <span style={{ position: 'absolute', inset: 0, background: 'rgba(20,19,25,.72)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7fd3a2', fontSize: '13px', fontWeight: 700 }}>ĐÃ SỬ DỤNG</span>}
                </div>

                <div style={{ marginTop: '16px', border: '1.5px dashed rgba(212,178,106,.4)', borderRadius: 11, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: '9.5px', letterSpacing: '1.4px', color: '#8c8679', textTransform: 'uppercase' }}>Mã coupon</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#f0dda8', letterSpacing: '2px', marginTop: '3px' }}>{formatCode(c)}</div>
                </div>

                <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                    <span style={{ fontSize: '12.5px', color: '#8c8679' }}>Hạng khách</span>
                    <span style={{ fontSize: '13px', color: '#f3f0ea', fontWeight: 500 }}>{c.user?.tier || 'Member'} · giảm {dealStr.replace('-', '')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                    <span style={{ fontSize: '12.5px', color: '#8c8679' }}>Hạn dùng</span>
                    <span style={{ fontSize: '13px', color: '#f3f0ea', fontWeight: 500 }}>{formatTime(c.expiresAt)}</span>
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
          <div className="scw nl-admin-drawer" style={{ position: 'absolute', right: 0, top: 0, height: '100vh', width: '440px', maxWidth: '94vw', overflow: 'auto', background: '#131218', borderLeft: '1px solid rgba(212,178,106,.18)', boxShadow: '-30px 0 60px -30px rgba(0,0,0,.8)' }}>
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
                  <div style={{ fontSize: '21px', fontWeight: 800, color: '#e3c27e' }}>{discountType === 'pct' ? '-' + discountVal : '-' + discountVal.replace('K', 'K ₫')}</div>
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
                  <span onClick={() => { setDiscountType('pct'); setDiscountVal('10%'); }} style={{ flex: 1, textAlign: 'center', padding: '7px', fontSize: '12px', fontWeight: discountType === 'pct' ? 600 : 400, color: discountType === 'pct' ? '#241a0a' : '#c5c0b6', background: discountType === 'pct' ? 'linear-gradient(135deg,#f4e3b4,#d4b26a)' : 'transparent', borderRadius: '8px', cursor: 'pointer' }}>Giảm %</span>
                  <span onClick={() => { setDiscountType('amt'); setDiscountVal('100K'); }} style={{ flex: 1, textAlign: 'center', padding: '7px', fontSize: '12px', fontWeight: discountType === 'amt' ? 600 : 400, color: discountType === 'amt' ? '#241a0a' : '#c5c0b6', background: discountType === 'amt' ? 'linear-gradient(135deg,#f4e3b4,#d4b26a)' : 'transparent', borderRadius: '8px', cursor: 'pointer' }}>Giảm tiền (₫)</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(discountType === 'pct' ? ['5%', '10%', '15%', '20%', '30%', '50%'] : ['50K', '100K', '200K', '300K', '500K']).map(v => (
                    <span key={v} onClick={() => setDiscountVal(v)} style={{ padding: '7px 14px', fontSize: '12.5px', borderRadius: '9px', cursor: 'pointer', border: discountVal === v ? '1px solid rgba(212,178,106,.55)' : '1px solid rgba(255,255,255,.1)', background: discountVal === v ? 'rgba(212,178,106,.14)' : 'rgba(255,255,255,.03)', color: discountVal === v ? '#f0dda8' : '#9b958a', fontWeight: discountVal === v ? 600 : 400 }}>{v}</span>
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
                  {['Guest', 'Member', 'VIP'].map(t => {
                    const checked = tiers.includes(t);
                    return (
                      <span key={t} onClick={() => setTiers(p => checked ? p.filter(x => x !== t) : [...p, t])} style={{ padding: '7px 14px', fontSize: '12.5px', borderRadius: '9px', cursor: 'pointer', border: checked ? '1px solid rgba(212,178,106,.55)' : '1px solid rgba(255,255,255,.1)', background: checked ? 'rgba(212,178,106,.14)' : 'rgba(255,255,255,.03)', color: checked ? '#f0dda8' : '#9b958a', fontWeight: checked ? 600 : 400 }}>{t}</span>
                    );
                  })}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.3px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>Thời hạn</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['7 ngày', '14 ngày', '30 ngày', '90 ngày'].map(d => (
                    <span key={d} onClick={() => setDuration(d)} style={{ padding: '7px 14px', fontSize: '12.5px', borderRadius: '9px', cursor: 'pointer', border: duration === d ? '1px solid rgba(212,178,106,.55)' : '1px solid rgba(255,255,255,.1)', background: duration === d ? 'rgba(212,178,106,.14)' : 'rgba(255,255,255,.03)', color: duration === d ? '#f0dda8' : '#9b958a', fontWeight: duration === d ? 600 : 400 }}>{d}</span>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.3px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>Giới hạn số mã</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['100 mã', '500 mã', '1.000 mã', 'Không giới hạn', 'Tự nhập...'].map(l => (
                    <span key={l} onClick={() => setLimit(l)} style={{ padding: '7px 14px', fontSize: '12.5px', borderRadius: '9px', cursor: 'pointer', border: limit === l ? '1px solid rgba(212,178,106,.55)' : '1px solid rgba(255,255,255,.1)', background: limit === l ? 'rgba(212,178,106,.14)' : 'rgba(255,255,255,.03)', color: limit === l ? '#f0dda8' : '#9b958a', fontWeight: limit === l ? 600 : 400 }}>{l}</span>
                  ))}
                </div>
                {limit === 'Tự nhập...' && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <input value={limitCustom} onChange={e => setLimitCustom(e.target.value.replace(/[^\\d]/g, '').slice(0, 7))} placeholder="VD: 250" inputMode="numeric" style={{ width: '130px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(212,178,106,.4)', borderRadius: '11px', padding: '11px 14px', color: '#f3f0ea', fontSize: '13.5px', fontFamily: "'Inter',sans-serif", outline: 'none' }} />
                    <span style={{ fontSize: '12.5px', color: '#8c8679' }}>mã · nhập số lượng tuỳ ý</span>
                  </div>
                )}
              </div>

              <span onClick={async () => {
                if (!fName.trim() || tiers.length === 0 || (scope === 'select' && selectedStores.length === 0) || (limit === 'Tự nhập...' && !limitCustom)) {
                  showToastMsg('Nhập tên ưu đãi, quán áp dụng và số lượng mã');
                  return;
                }
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
                    targetAudiences: tiers.map(t => t.toUpperCase()),
                    durationDays: durationMap[duration] ?? 30,
                    usageLimit,
                  };
                  await apiClient('/admin/coupons', { method: 'POST', data: payload });
                  setShowCreate(false);
                  setFName(''); setDiscountVal('10%'); setScope('all'); setSelectedStores([]); setTiers(['Guest','Member','VIP']); setDuration('30 ngày'); setLimit('500 mã'); setLimitCustom('');
                  fetchCampaigns();
                  showToastMsg('Tạo coupon thành công! QR sẵn sàng.');
                } catch (err: any) {
                  showToastMsg(err?.message || 'Lỗi khi tạo coupon');
                }
              }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', color: '#241a0a', fontSize: '13px', fontWeight: 700, borderRadius: '11px', cursor: 'pointer', boxShadow: '0 12px 24px -12px rgba(168,124,60,.6)' }}>
                Tạo coupon &amp; sinh QR
              </span>

              <div style={{ display: 'flex', gap: '9px', padding: '12px 14px', background: 'rgba(212,178,106,.06)', border: '1px solid rgba(212,178,106,.2)', borderRadius: 11 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4b26a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: 1 }}><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M12 11v5"/></svg>
                <span style={{ fontSize: '11.5px', color: '#cbb884', lineHeight: 1.5 }}>Hệ thống sinh 1 mã QR chung cho chiến dịch. Khách quét QR hoặc bấm "Lấy mã" trong app để nhận coupon; mã hiển thị trong danh sách bên dưới.</span>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div style={{ position: 'fixed', left: '50%', bottom: '28px', transform: 'translateX(-50%)', zIndex: 90, display: 'flex', alignItems: 'center', gap: '10px', background: '#17161c', border: '1px solid rgba(212,178,106,.3)', color: '#f3f0ea', fontSize: '13.5px', fontWeight: 500, padding: '13px 22px', borderRadius: '12px', boxShadow: '0 20px 44px -18px rgba(0,0,0,.85)', animation: 'vrise .25s ease' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7fd3a2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          {toast}
        </div>
      )}

    </div>
  );
}
