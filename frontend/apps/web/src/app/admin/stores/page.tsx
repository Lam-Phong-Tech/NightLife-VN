"use client";

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

const mockStores = [
  {id:'v1',name:'Club Lumière',logo:'CL',logoBg:'linear-gradient(135deg,#f4e3b4,#d4b26a)',type:'Club',city:'HN',area:'Tây Hồ, Hà Nội',casts:12,status:'active',addr:'52 Tô Ngọc Vân, Tây Hồ',maps:'maps.app.goo.gl/lumiere',hours:'20:00 – 03:00'},
  {id:'v2',name:'Sakura Lounge',logo:'SL',logoBg:'linear-gradient(135deg,#e79ab8,#b0607f)',type:'Lounge',city:'HN',area:'Hoàn Kiếm, Hà Nội',casts:9,status:'active',addr:'18 Lý Thường Kiệt, Hoàn Kiếm',maps:'maps.app.goo.gl/sakura',hours:'18:00 – 02:00'},
  {id:'v3',name:'KTV Hoàng Gia',logo:'KH',logoBg:'linear-gradient(135deg,#c9a86a,#8f6b32)',type:'Karaoke',city:'HN',area:'Kim Mã, Ba Đình',casts:16,status:'active',addr:'88 Kim Mã, Ba Đình',maps:'maps.app.goo.gl/hoanggia',hours:'12:00 – 01:00'},
  {id:'v4',name:'Bar Tokyo Night',logo:'TN',logoBg:'linear-gradient(135deg,#8fb6e4,#4f6f9c)',type:'Bar',city:'HN',area:'Ba Đình, Hà Nội',casts:6,status:'active',addr:'12 Đào Tấn, Ba Đình',maps:'maps.app.goo.gl/tokyonight',hours:'19:00 – 02:00'},
  {id:'v5',name:'Akari Lounge',logo:'AK',logoBg:'linear-gradient(135deg,#f4e3b4,#d4b26a)',type:'Girls bar',city:'HN',area:'Tây Hồ, Hà Nội',casts:14,status:'active',addr:'25 Quảng An, Tây Hồ',maps:'maps.app.goo.gl/akari',hours:'20:00 – 03:00'},
  {id:'v6',name:'Lotus Club Saigon',logo:'LC',logoBg:'linear-gradient(135deg,#e79ab8,#b0607f)',type:'Club',city:'HCM',area:'Quận 1, TP.HCM',casts:11,status:'draft',addr:'6 Lê Lợi, Quận 1',maps:'maps.app.goo.gl/lotus',hours:'21:00 – 04:00'},
  {id:'v7',name:'Zen Spa & Onsen',logo:'ZS',logoBg:'linear-gradient(135deg,#8fd4b4,#4f9c78)',type:'Massage',city:'HN',area:'Tây Hồ, Hà Nội',casts:0,status:'hidden',addr:'40 Từ Hoa, Tây Hồ',maps:'maps.app.goo.gl/zenspa',hours:'10:00 – 23:00'},
];

const getStatusMeta = (status: string) => {
  if (status === 'active') return { label: 'Đang hoạt động', style: 'success' };
  if (status === 'draft') return { label: 'Nháp', style: 'warn' };
  if (status === 'hidden') return { label: 'Đang ẩn', style: 'muted' };
  // Default to active for any API returned statuses that don't match exactly
  if (status === 'Đang hoạt động') return { label: 'Đang hoạt động', style: 'success' };
  if (status === 'Nháp') return { label: 'Nháp', style: 'warn' };
  if (status === 'Đang ẩn') return { label: 'Đang ẩn', style: 'muted' };
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

export default function AdminStoresPage() {
  const [stores, setStores] = useState<any[]>(mockStores);
  const [venueSel, setVenueSel] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [menuManage, setMenuManage] = useState(false);
  const [activeMenuTab, setActiveMenuTab] = useState('set');
  const [search, setSearch] = useState('');

  const fetchStores = async () => {
    try {
      const res = await apiClient<any>('/admin/stores', { params: { search: search || undefined } });
      if (res.data && res.data.length > 0) {
        // Map API data to UI structure if needed, or just use mock for now if data is empty
        // We'll keep using mockStores as fallback if API doesn't match the new UI format perfectly yet
        setStores(res.data.map((s: any) => ({
          ...s,
          logoBg: s.logoBg || 'linear-gradient(135deg,#f4e3b4,#d4b26a)',
          city: s.region === 'Hà Nội' ? 'HN' : (s.region === 'TP.HCM' ? 'HCM' : s.region || 'HN'),
          casts: s.cast || 0,
        })));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // Uncomment to fetch from API
    // fetchStores();
  }, [search]);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2600);
  };

  const closeDrawer = () => {
    setVenueSel(null);
  };

  const saveStore = () => {
    setVenueSel(null);
    showToast(venueSel === 'new' ? 'Đã tạo quán mới (chờ hiển thị)' : 'Đã lưu thay đổi quán');
  };

  const displayedStores = stores;

  let vf: any = {};
  const boxS = { background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)', borderRadius: '10px', padding: '12px 13px', fontSize: '13px', color: '#f3f0ea' };
  const vph = { background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '10px', padding: '12px 13px', fontSize: '13px', color: '#57534b' };
  const seg = (a: boolean) => ({ fontSize: '12px', padding: '9px 15px', borderRadius: '9px', cursor: 'pointer', fontWeight: 600, color: a ? '#241a0a' : '#9b958a', background: a ? 'linear-gradient(135deg,#f0dda8,#d4b26a)' : 'rgba(255,255,255,.04)', border: a ? 'none' : '1px solid rgba(255,255,255,.08)' });
  const g1 = 'linear-gradient(135deg,#2a2620,#1a1814)';
  const g2 = 'linear-gradient(135deg,#241f2a,#181420)';
  const g3 = 'linear-gradient(135deg,#20262a,#141a1e)';

  if (venueSel === 'new') {
    vf = { mode: 'Thêm quán mới', title: 'Quán mới', box: vph, name: 'Nhập tên quán…', type: 'Chọn loại hình', city: 'Chọn khu vực', addr: 'Số nhà, đường, quận…', maps: 'Dán link Google Maps…', img1: g1, img2: g1, img3: g1, videos: [], segActive: seg(true), segHidden: seg(false), segDraft: seg(false) };
  } else if (venueSel) {
    const v = stores.find(x => x.id === venueSel) || stores[0];
    vf = { 
      mode: 'Chỉnh sửa quán', title: v.name, box: boxS, name: v.name, type: v.type, city: v.city === 'HN' ? 'Hà Nội' : 'TP. Hồ Chí Minh', addr: v.addr || v.address, maps: v.maps || 'maps.app.goo.gl/...', img1: g1, img2: g2, img3: g3, 
      videos: [{id:'vd1',title:'Tour không gian quán',meta:'01:24 · YouTube',thumb:g2},{id:'vd2',title:'Video sự kiện cuối tuần',meta:'00:48 · Tải lên',thumb:g3}], 
      segActive: seg(v.status === 'active' || v.status === 'Đang hoạt động'), segHidden: seg(v.status === 'hidden' || v.status === 'Đang ẩn'), segDraft: seg(v.status === 'draft' || v.status === 'Nháp') 
    };
  } else {
    vf = { box: boxS };
  }

  const menuItemsMock = [
    {id:'m1',name:'Cast hourly rate',desc:'Giá cast theo giờ thấp nhất đang áp dụng tại quán',tier:2,hot:false,thumb:g2},
    {id:'m2',name:'Table or room package',desc:'Admin xác nhận sau khi có yêu cầu booking',tier:4,hot:true,thumb:g3},
    {id:'m3',name:'Signature cocktail',desc:'Pha chế riêng theo phong cách quán',tier:2,hot:true,thumb:g1}
  ];

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
        <span onClick={() => setVenueSel('new')} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 700, color: '#241a0a', background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', padding: '10px 17px', borderRadius: '10px', cursor: 'pointer' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Thêm quán
        </span>
      </div>

      {/* Table */}
      <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 88px 130px 40px', gap: '12px', padding: '13px 18px', fontSize: '10px', fontWeight: 700, letterSpacing: '.9px', color: '#57534b', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.015)' }}>
          <span>Quán</span><span>Loại hình</span><span>Khu vực</span><span>Cast</span><span>Trạng thái</span><span></span>
        </div>
        
        {displayedStores.map((v, idx) => {
          const stMeta = getStatusMeta(v.status);
          const stStyle = getPillStyle(stMeta.style);
          const cityStyle = getChipStyle(v.city === 'HN' ? 'info' : 'pink');
          
          return (
            <div 
              key={idx} 
              onClick={() => setVenueSel(v.id)} 
              style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 88px 130px 40px', gap: '12px', alignItems: 'center', padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,.04)', cursor: 'pointer', fontSize: '13px', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,178,106,.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0 }}>
                <span style={{ width: 38, height: 38, flex: 'none', borderRadius: 10, background: v.logoBg || 'linear-gradient(135deg,#f4e3b4,#d4b26a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '15px', color: '#241a0a' }}>{v.logo || v.name.substring(0, 2).toUpperCase()}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: '#f3f0ea', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.name}</div>
                  <div style={{ fontSize: '11px', color: '#57534b', marginTop: '1px' }}>{v.area || v.address}</div>
                </div>
              </div>
              <span style={{ color: '#c5c0b6' }}>{v.type}</span>
              <span><span style={{ ...cityStyle, fontSize: '10.5px', fontWeight: 600, padding: '3px 9px', borderRadius: '7px' }}>{v.city || v.region}</span></span>
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
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1.4px', color: '#8c8679', textTransform: 'uppercase' }}>{vf.mode}</div>
                <div style={{ fontSize: '19px', fontWeight: 700, color: '#f3f0ea', marginTop: '3px' }}>{vf.title}</div>
              </div>
              <span onClick={closeDrawer} style={{ width: 34, height: 34, flex: 'none', borderRadius: 10, background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5c0b6', cursor: 'pointer' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </span>
            </div>
            
            <div style={{ padding: '22px 26px 30px', flex: 1 }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', color: '#caa765', textTransform: 'uppercase', marginBottom: '12px' }}>Thông tin cơ bản</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div><div style={{ fontSize: '11.5px', color: '#8c8679', marginBottom: '6px' }}>Tên quán</div>
                  {venueSel === 'new' ? 
                    <input style={{ ...vf.box, width: '100%', outline: 'none' }} placeholder={vf.name} /> : 
                    <div style={vf.box}>{vf.name}</div>
                  }
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11.5px', color: '#8c8679', marginBottom: '6px' }}>Loại hình</div>
                    <div style={{ ...vf.box, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>{vf.type}<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8c8679" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg></div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11.5px', color: '#8c8679', marginBottom: '6px' }}>Khu vực</div>
                    <div style={{ ...vf.box, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>{vf.city}<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8c8679" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg></div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11.5px', color: '#8c8679', marginBottom: '6px' }}>Địa chỉ</div>
                  {venueSel === 'new' ? 
                    <input style={{ ...vf.box, width: '100%', outline: 'none' }} placeholder={vf.addr} /> : 
                    <div style={vf.box}>{vf.addr}</div>
                  }
                </div>
                <div>
                  <div style={{ fontSize: '11.5px', color: '#8c8679', marginBottom: '6px' }}>Link Google Maps chỉ đường</div>
                  <div style={{ ...vf.box, color: venueSel === 'new' ? '#57534b' : '#8fb6e4', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.2"/></svg>
                    {venueSel === 'new' ? <input style={{ background: 'none', border: 'none', outline: 'none', color: 'inherit', width: '100%' }} placeholder={vf.maps} /> : vf.maps}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', color: '#caa765', textTransform: 'uppercase', margin: '24px 0 12px' }}>Giờ mở cửa theo ngày</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {DAYS.map((day, i) => {
                  const isOff = i === 6; // Just mock Sunday as off for example, or let's say all open
                  const val = isOff ? 'Nghỉ' : '20:00 – 03:00';
                  const bg = isOff ? 'rgba(255,255,255,.015)' : 'rgba(255,255,255,.03)';
                  const dayColor = isOff ? '#8c8679' : '#f3f0ea';
                  const inputStyle = isOff ? { background: 'none', border: 'none', flex: 1, color: '#57534b', fontSize: '13px', outline: 'none' } : { background: 'none', border: 'none', flex: 1, color: '#e8e4db', fontSize: '13px', outline: 'none' };
                  const offBtn = isOff ? { fontSize: '10.5px', fontWeight: 700, color: '#e08a7e', background: 'rgba(224,138,126,.1)', border: '1px solid rgba(224,138,126,.25)', borderRadius: '6px', padding: '3px 9px', cursor: 'pointer' } : { fontSize: '10.5px', fontWeight: 700, color: '#7fd3a2', background: 'rgba(127,211,162,.1)', border: '1px solid rgba(127,211,162,.25)', borderRadius: '6px', padding: '3px 9px', cursor: 'pointer' };
                  return (
                    <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: bg, border: '1px solid rgba(255,255,255,.07)', borderRadius: '11px', padding: '8px 13px' }}>
                      <span style={{ width: '64px', flex: 'none', fontSize: '12px', fontWeight: 600, color: dayColor }}>{day}</span>
                      <input defaultValue={val} placeholder="VD: 19:00 – 02:00" style={inputStyle} readOnly={isOff} />
                      <span style={offBtn as any}>{isOff ? 'Nghỉ' : 'Mở'}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '10px', fontSize: '10.5px', color: '#8c8679', lineHeight: 1.5 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ flex: 'none', marginTop: '1px' }}><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M12 11v5"/></svg>
                <span>Giờ hiển thị theo từng ngày trên trang người dùng — sửa trực tiếp từng dòng, bấm nút để chuyển <b style={{ color: '#7fd3a2' }}>Mở</b> / <b style={{ color: '#e08a7e' }}>Nghỉ</b>.</span>
              </div>

              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', color: '#caa765', textTransform: 'uppercase', margin: '24px 0 12px' }}>Album ảnh</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
                <div style={{ aspectRatio: 1, borderRadius: '11px', background: vf.img1 }}></div>
                <div style={{ aspectRatio: 1, borderRadius: '11px', background: vf.img2 }}></div>
                <div style={{ aspectRatio: 1, borderRadius: '11px', background: vf.img3 }}></div>
                <div style={{ aspectRatio: 1, borderRadius: '11px', border: '1.5px dashed rgba(212,178,106,.35)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px', color: '#8c8679', cursor: 'pointer' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                  <span style={{ fontSize: '9.5px' }}>Tải lên</span>
                </div>
              </div>

              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', color: '#caa765', textTransform: 'uppercase', margin: '24px 0 12px' }}>Video quán</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {vf.videos.map((vd: any) => (
                  <div key={vd.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '12px', padding: '9px 12px 9px 9px' }}>
                    <div style={{ width: 74, height: 44, flex: 'none', borderRadius: 8, background: vd.thumb, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="#f3f0ea"><path d="M8 5v14l11-7z"/></svg>
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#e8e4db', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{vd.title}</div>
                      <div style={{ fontSize: '10.5px', color: '#8c8679', marginTop: '2px' }}>{vd.meta}</div>
                    </div>
                    <span style={{ width: 30, height: 30, flex: 'none', borderRadius: 9, background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9b958a', cursor: 'pointer' }} title="Xóa video">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                    </span>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', border: '1.5px dashed rgba(212,178,106,.35)', borderRadius: '12px', padding: '12px', color: '#8c8679', cursor: 'pointer', fontSize: '11.5px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>Thêm video · link YouTube hoặc tải lên
                </div>
              </div>

              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', color: '#caa765', textTransform: 'uppercase', margin: '24px 0 12px' }}>Thực đơn & mức giá</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '11px' }}>
                <span onClick={() => setActiveMenuTab('set')} style={{ padding: '6px 12px', borderRadius: '9px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', color: activeMenuTab === 'set' ? '#241a0a' : '#c5c0b6', background: activeMenuTab === 'set' ? 'linear-gradient(135deg,#f0dda8,#d4b26a)' : 'rgba(255,255,255,.05)' }}>Set menu</span>
                <span onClick={() => setActiveMenuTab('cocktail')} style={{ padding: '6px 12px', borderRadius: '9px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', color: activeMenuTab === 'cocktail' ? '#241a0a' : '#c5c0b6', background: activeMenuTab === 'cocktail' ? 'linear-gradient(135deg,#f0dda8,#d4b26a)' : 'rgba(255,255,255,.05)' }}>Cocktail</span>
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#8c8679', border: '1.5px dashed rgba(212,178,106,.35)', padding: '6px 12px', borderRadius: '9px', cursor: 'pointer' }}>+ Nhóm</span>
                <span style={{ flex: 1 }}></span>
                <span onClick={() => setMenuManage(!menuManage)} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 600, color: menuManage ? '#d4b26a' : '#8c8679', cursor: 'pointer' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>{menuManage ? 'Hoàn tất' : 'Sửa nhóm'}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {menuItemsMock.map(mi => (
                  <div key={mi.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '12px', padding: '9px 12px 9px 9px' }}>
                    <div style={{ width: 46, height: 46, flex: 'none', borderRadius: 9, background: mi.thumb }}></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#e8e4db', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mi.name}</span>
                        {mi.hot && <span style={{ flex: 'none', fontSize: '8.5px', fontWeight: 800, letterSpacing: '.8px', color: '#241a0a', background: 'linear-gradient(135deg,#f0dda8,#d4b26a)', padding: '2.5px 7px', borderRadius: '5px' }}>BÁN CHẠY</span>}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#8c8679', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mi.desc}</div>
                    </div>
                    <div style={{ display: 'flex', flex: 'none', gap: '3px', background: 'rgba(12,12,15,.4)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '9px', padding: '3px' }}>
                      <span style={{ padding: '4px 7px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 700, cursor: 'pointer', color: mi.tier === 2 ? '#d4b26a' : '#57534b', background: mi.tier === 2 ? 'rgba(212,178,106,.15)' : 'transparent' }}>$$</span>
                      <span style={{ padding: '4px 7px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 700, cursor: 'pointer', color: mi.tier === 3 ? '#d4b26a' : '#57534b', background: mi.tier === 3 ? 'rgba(212,178,106,.15)' : 'transparent' }}>$$$</span>
                      <span style={{ padding: '4px 7px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 700, cursor: 'pointer', color: mi.tier === 4 ? '#d4b26a' : '#57534b', background: mi.tier === 4 ? 'rgba(212,178,106,.15)' : 'transparent' }}>$$$$</span>
                    </div>
                    <span style={{ width: 30, height: 30, flex: 'none', borderRadius: 9, background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9b958a', cursor: 'pointer' }} title="Xóa món">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                    </span>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', border: '1.5px dashed rgba(212,178,106,.35)', borderRadius: '12px', padding: '12px', color: '#8c8679', cursor: 'pointer', fontSize: '11.5px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>Thêm món vào nhóm này
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '10px', fontSize: '10.5px', color: '#8c8679', lineHeight: 1.5 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ flex: 'none', marginTop: '1px' }}><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M12 11v5"/></svg>
                <span>Không hiển thị giá tiền trực tiếp — chỉ hiển thị mức chi phí: <b style={{ color: '#caa765' }}>$$</b> rẻ · <b style={{ color: '#caa765' }}>$$$</b> vừa · <b style={{ color: '#caa765' }}>$$$$</b> cao.</span>
              </div>

              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', color: '#caa765', textTransform: 'uppercase', margin: '24px 0 12px' }}>Trạng thái hiển thị</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={vf.segActive}>Đang hoạt động</span>
                <span style={vf.segHidden}>Đang ẩn</span>
                <span style={vf.segDraft}>Nháp</span>
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
