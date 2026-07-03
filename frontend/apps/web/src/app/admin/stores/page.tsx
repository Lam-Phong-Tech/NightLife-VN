"use client";

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

const getStatusMeta = (status: string) => {
  if (status === 'ACTIVE' || status === 'active' || status === 'Đang hoạt động') return { label: 'Đang hoạt động', style: 'success' };
  if (status === 'DRAFT' || status === 'draft' || status === 'Nháp') return { label: 'Nháp', style: 'warn' };
  if (status === 'SUSPENDED' || status === 'hidden' || status === 'Đang ẩn') return { label: 'Đang ẩn', style: 'muted' };
  if (status === 'PENDING_REVIEW') return { label: 'Chờ duyệt', style: 'info' };
  return { label: status, style: 'muted' };
};

const getChipStyle = (kind: string) => {
  const m: Record<string, string[]> = {
    success: ['rgba(95,191,134,.1)', 'rgba(95,191,134,.28)', '#7fd3a2'],
    info: ['rgba(111,159,216,.12)', 'rgba(111,159,216,.28)', '#8fb6e4'],
    warn: ['rgba(224,164,78,.12)', 'rgba(224,164,78,.3)', '#e7b869'],
    error: ['rgba(224,105,122,.1)', 'rgba(224,105,122,.28)', '#e88b99'],
    gold: ['rgba(212,178,106,.12)', 'rgba(212,178,106,.3)', '#e3c27e'],
    pink: ['rgba(224,114,158,.1)', 'rgba(224,114,158,.28)', '#e79ab8'],
    muted: ['rgba(255,255,255,.05)', 'rgba(255,255,255,.12)', '#9b958a']
  };
  const c = m[kind] || m.muted;
  return { background: c[0], border: `1px solid ${c[1]}`, color: c[2] };
};

const getPillStyle = (kind: string) => {
  const chip = getChipStyle(kind);
  return { ...chip, fontSize: '11px', fontWeight: 600, padding: '4px 11px', borderRadius: '20px', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '5px' };
};

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
const defaultHours = DAYS.reduce((acc, d) => ({ ...acc, [d]: { isOff: false, hours: '19:00 - 02:00' } }), {});

export default function AdminStoresPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [venueSel, setVenueSel] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({ name: '', category: 'CLUB', city: 'Ho Chi Minh City', address: '', mapUrl: '', status: 'ACTIVE' });
  const [hoursForm, setHoursForm] = useState<any>(defaultHours);
  const [slugStatus, setSlugStatus] = useState<string>(''); // '', 'checking', 'ok', 'error'
  
  // Unchanged for now, mock UI states
  const [menuManage, setMenuManage] = useState(false);
  const [activeMenuTab, setActiveMenuTab] = useState('set');

  const fetchStores = async () => {
    try {
      const res = await apiClient<any>('/admin/stores', { params: { search: search || undefined } });
      if (res.data && res.data.data) {
        setStores(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [search]);

  // Debounce Name check for slug uniqueness
  useEffect(() => {
    if (venueSel === 'new' && formData.name) {
      setSlugStatus('checking');
      const handler = setTimeout(async () => {
        try {
          const generatedSlug = formData.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          if (!generatedSlug) { setSlugStatus(''); return; }
          const res = await apiClient<any>(`/admin/stores/check-slug?slug=${generatedSlug}`);
          setSlugStatus(res.data?.available ? 'ok' : 'error');
        } catch(e) {
          setSlugStatus('error');
        }
      }, 500);
      return () => clearTimeout(handler);
    } else {
      setSlugStatus('');
    }
  }, [formData.name, venueSel]);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2600);
  };

  const closeDrawer = () => {
    setVenueSel(null);
  };

  const openNewDrawer = () => {
    setFormData({ name: '', category: 'CLUB', city: 'Ho Chi Minh City', address: '', mapUrl: '', status: 'ACTIVE' });
    setHoursForm(defaultHours);
    setVenueSel('new');
  };

  const openEditDrawer = (st: any) => {
    setFormData({ 
      name: st.name || '', 
      category: st.category || 'CLUB', 
      city: st.city || 'Ho Chi Minh City', 
      address: st.address || '', 
      mapUrl: st.mapUrl || '', 
      status: st.status || 'ACTIVE' 
    });
    setHoursForm(st.openingHours || defaultHours);
    setVenueSel(st.id);
  };

  const saveStore = async () => {
    try {
      const payload = {
        ...formData,
        openingHours: hoursForm,
      };
      
      if (venueSel === 'new') {
        if (slugStatus === 'error') {
          showToast('Tên quán bị trùng lặp, vui lòng chọn tên khác!');
          return;
        }
        await apiClient.post('/admin/stores', payload);
        showToast('Đã tạo quán mới!');
      } else {
        await apiClient.patch(`/admin/stores/${venueSel}`, payload);
        showToast('Đã lưu thay đổi!');
      }
      closeDrawer();
      fetchStores();
    } catch (e: any) {
      showToast(e.message || 'Có lỗi xảy ra khi lưu');
    }
  };

  const boxS = { background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)', borderRadius: '10px', padding: '12px 13px', fontSize: '13px', color: '#f3f0ea' };
  const inputS = { ...boxS, width: '100%', outline: 'none' };
  const optS = { background: '#1a191f', color: '#f3f0ea' };
  const seg = (a: boolean) => ({ fontSize: '12px', padding: '9px 15px', borderRadius: '9px', cursor: 'pointer', fontWeight: 600, color: a ? '#241a0a' : '#9b958a', background: a ? 'linear-gradient(135deg,#f0dda8,#d4b26a)' : 'rgba(255,255,255,.04)', border: a ? 'none' : '1px solid rgba(255,255,255,.08)' });
  const g1 = 'linear-gradient(135deg,#2a2620,#1a1814)';

  const updateForm = (key: string, val: string) => setFormData(p => ({ ...p, [key]: val }));
  const updateHour = (day: string, key: string, val: any) => setHoursForm((p: any) => ({ ...p, [day]: { ...p[day], [key]: val } }));

  return (
    <div data-screen-label="Admin · Venues" style={{ padding: '22px 26px 44px', minHeight: '100vh', background: '#0c0c0f' }}>
      
      {/* Top filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '10px', padding: '8px 13px', width: '250px' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8c8679" strokeWidth="1.9" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
          <input 
            type="text" 
            placeholder="Tìm theo tên quán…" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#f3f0ea', fontSize: '12.5px', outline: 'none', width: '100%' }}
          />
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: '#c5c0b6', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '10px', padding: '9px 13px', cursor: 'pointer' }}>
          Tất cả loại hình
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
        </span>
        <div style={{ flex: 1 }}></div>
        <span onClick={openNewDrawer} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 700, color: '#241a0a', background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', padding: '10px 17px', borderRadius: '10px', cursor: 'pointer' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Thêm quán
        </span>
      </div>

      {/* Table */}
      <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 88px 130px 40px', gap: '12px', padding: '13px 18px', fontSize: '10px', fontWeight: 700, letterSpacing: '.9px', color: '#57534b', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.015)' }}>
          <span>Quán</span><span>Loại hình</span><span>Khu vực</span><span>Cast</span><span>Trạng thái</span><span></span>
        </div>
        
        {stores.map((v: any) => {
          const stMeta = getStatusMeta(v.status);
          const stStyle = getPillStyle(stMeta.style);
          const cityStyle = getChipStyle(v.area === 'HN' ? 'info' : 'pink');
          
          return (
            <div 
              key={v.id} 
              onClick={() => openEditDrawer(v)} 
              style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 88px 130px 40px', gap: '12px', alignItems: 'center', padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,.04)', cursor: 'pointer', fontSize: '13px', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,178,106,.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0 }}>
                <span style={{ width: 38, height: 38, flex: 'none', borderRadius: 10, background: 'linear-gradient(135deg,#f4e3b4,#d4b26a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '15px', color: '#241a0a' }}>{v.initials || v.name?.substring(0,2)?.toUpperCase()}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: '#f3f0ea', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.name}</div>
                  <div style={{ fontSize: '11px', color: '#57534b', marginTop: '1px' }}>{v.address}</div>
                </div>
              </div>
              <span style={{ color: '#c5c0b6' }}>{v.type}</span>
              <span><span style={{ ...cityStyle, fontSize: '10.5px', fontWeight: 600, padding: '3px 9px', borderRadius: '7px' }}>{v.area}</span></span>
              <span style={{ color: '#c5c0b6' }}>{v.casts}</span>
              <span><span style={stStyle as any}>{stMeta.label}</span></span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#57534b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
            </div>
          );
        })}
      </div>

      {/* Drawer */}
      {venueSel && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
          <div onClick={closeDrawer} style={{ position: 'absolute', inset: 0, background: 'rgba(6,6,9,.6)', backdropFilter: 'blur(2px)' }}></div>
          <div className="scw" style={{ position: 'absolute', right: 0, top: 0, height: '100vh', width: '576px', maxWidth: '96vw', overflow: 'auto', background: '#131218', borderLeft: '1px solid rgba(212,178,106,.18)', boxShadow: '-30px 0 60px -30px rgba(0,0,0,.8)', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ position: 'sticky', top: 0, zIndex: 2, padding: '19px 26px', background: '#131218', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1.4px', color: '#8c8679', textTransform: 'uppercase' }}>{venueSel === 'new' ? 'Thêm quán mới' : 'Chỉnh sửa quán'}</div>
                <div style={{ fontSize: '19px', fontWeight: 700, color: '#f3f0ea', marginTop: '3px' }}>{venueSel === 'new' ? 'Quán mới' : formData.name}</div>
              </div>
              <span onClick={closeDrawer} style={{ width: 34, height: 34, flex: 'none', borderRadius: 10, background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5c0b6', cursor: 'pointer' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </span>
            </div>
            
            <div style={{ padding: '22px 26px 30px', flex: 1 }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', color: '#caa765', textTransform: 'uppercase', marginBottom: '12px' }}>Thông tin cơ bản</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ fontSize: '11.5px', color: '#8c8679' }}>Tên quán</div>
                    {slugStatus === 'checking' && <div style={{ fontSize: '10.5px', color: '#8fb6e4' }}>Đang kiểm tra...</div>}
                    {slugStatus === 'ok' && <div style={{ fontSize: '10.5px', color: '#7fd3a2' }}>Tên hợp lệ</div>}
                    {slugStatus === 'error' && <div style={{ fontSize: '10.5px', color: '#e88b99' }}>Tên trùng lặp</div>}
                  </div>
                  <input style={{ ...inputS, borderColor: slugStatus === 'error' ? 'rgba(232,139,153,.4)' : inputS.border }} placeholder="Nhập tên quán…" value={formData.name} onChange={e => updateForm('name', e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11.5px', color: '#8c8679', marginBottom: '6px' }}>Loại hình</div>
                    <select style={{ ...inputS, appearance: 'none', cursor: 'pointer' }} value={formData.category} onChange={e => updateForm('category', e.target.value)}>
                      <option value="CLUB" style={optS}>Club</option>
                      <option value="LOUNGE" style={optS}>Lounge</option>
                      <option value="BAR" style={optS}>Bar</option>
                      <option value="GIRLS_BAR" style={optS}>Girls Bar</option>
                      <option value="KARAOKE" style={optS}>Karaoke</option>
                      <option value="MASSAGE_SPA" style={optS}>Massage & Spa</option>
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: '11.5px', color: '#8c8679', marginBottom: '6px' }}>Khu vực</div>
                    <select style={{ ...inputS, appearance: 'none', cursor: 'pointer' }} value={formData.city} onChange={e => updateForm('city', e.target.value)}>
                      <option value="Ho Chi Minh City" style={optS}>Hồ Chí Minh</option>
                      <option value="Hanoi" style={optS}>Hà Nội</option>
                    </select>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11.5px', color: '#8c8679', marginBottom: '6px' }}>Địa chỉ</div>
                  <input style={inputS} placeholder="Số nhà, đường, quận…" value={formData.address} onChange={e => updateForm('address', e.target.value)} />
                </div>
                <div>
                  <div style={{ fontSize: '11.5px', color: '#8c8679', marginBottom: '6px' }}>Link Google Maps chỉ đường</div>
                  <div style={{ ...boxS, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.2"/></svg>
                    <input style={{ background: 'none', border: 'none', outline: 'none', color: 'inherit', width: '100%' }} placeholder="Dán link Google Maps…" value={formData.mapUrl} onChange={e => updateForm('mapUrl', e.target.value)} />
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', color: '#caa765', textTransform: 'uppercase', margin: '24px 0 12px' }}>Giờ mở cửa theo ngày</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {DAYS.map((day) => {
                  const state = hoursForm[day] || { isOff: false, hours: '' };
                  const isOff = state.isOff;
                  const bg = isOff ? 'rgba(255,255,255,.015)' : 'rgba(255,255,255,.03)';
                  const dayColor = isOff ? '#8c8679' : '#f3f0ea';
                  const inputStyle = isOff ? { background: 'none', border: 'none', flex: 1, color: '#57534b', fontSize: '13px', outline: 'none' } : { background: 'none', border: 'none', flex: 1, color: '#e8e4db', fontSize: '13px', outline: 'none' };
                  const offBtn = isOff ? { fontSize: '10.5px', fontWeight: 700, color: '#e08a7e', background: 'rgba(224,138,126,.1)', border: '1px solid rgba(224,138,126,.25)', borderRadius: '6px', padding: '3px 9px', cursor: 'pointer' } : { fontSize: '10.5px', fontWeight: 700, color: '#7fd3a2', background: 'rgba(127,211,162,.1)', border: '1px solid rgba(127,211,162,.25)', borderRadius: '6px', padding: '3px 9px', cursor: 'pointer' };
                  return (
                    <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: bg, border: '1px solid rgba(255,255,255,.07)', borderRadius: '11px', padding: '8px 13px' }}>
                      <span style={{ width: '64px', flex: 'none', fontSize: '12px', fontWeight: 600, color: dayColor }}>{day}</span>
                      <input value={isOff ? 'Nghỉ' : state.hours} onChange={e => updateHour(day, 'hours', e.target.value)} placeholder="VD: 19:00 – 02:00" style={inputStyle} readOnly={isOff} />
                      <span onClick={() => updateHour(day, 'isOff', !isOff)} style={offBtn as any}>{isOff ? 'Nghỉ' : 'Mở'}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', color: '#caa765', textTransform: 'uppercase', margin: '24px 0 12px' }}>Trạng thái hiển thị</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span onClick={() => updateForm('status', 'ACTIVE')} style={seg(formData.status === 'ACTIVE')}>Đang hoạt động</span>
                <span onClick={() => updateForm('status', 'SUSPENDED')} style={seg(formData.status === 'SUSPENDED')}>Đang ẩn</span>
                <span onClick={() => updateForm('status', 'DRAFT')} style={seg(formData.status === 'DRAFT')}>Nháp</span>
              </div>
            </div>

            <div style={{ position: 'sticky', bottom: 0, padding: '15px 26px', background: '#131218', borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', gap: '10px' }}>
              <span onClick={closeDrawer} style={{ flex: 'none', fontSize: '13px', fontWeight: 600, color: '#c5c0b6', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', padding: '13px 22px', borderRadius: '11px', cursor: 'pointer' }}>Hủy</span>
              <span onClick={saveStore} style={{ flex: 1, textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#241a0a', background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', padding: '13px', borderRadius: '11px', cursor: 'pointer' }}>Lưu quán</span>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', left: '50%', bottom: '28px', transform: 'translateX(-50%)', zIndex: 90, display: 'flex', alignItems: 'center', gap: '10px', background: '#17161c', border: '1px solid rgba(212,178,106,.3)', color: '#f3f0ea', fontSize: '13.5px', fontWeight: 500, padding: '13px 22px', borderRadius: '12px', boxShadow: '0 20px 44px -18px rgba(0,0,0,.85)', animation: 'vrise .25s ease' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7fd3a2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>{toast}
        </div>
      )}
    </div>
  );
}
