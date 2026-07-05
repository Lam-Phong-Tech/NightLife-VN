"use client";

import React, { useState, useEffect } from 'react';

const ICONS: Record<string, string> = {
  pin: '<path d="M12 21s-6.5-5.2-6.5-10A6.5 6.5 0 0 1 12 4.5 6.5 6.5 0 0 1 18.5 11c0 4.8-6.5 10-6.5 10z"/><circle cx="12" cy="11" r="2.4"/>',
  user: '<circle cx="12" cy="8" r="3.4"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/>',
  ticket: '<path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4z"/><path d="M14 7v10" stroke-dasharray="2 2.4"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M3.5 10h17M8 2.5v4M16 2.5v4"/>',
  crown: '<path d="M4 17L2.8 8l5.2 3.6L12 5l4 6.6L21.2 8 20 17z"/><path d="M6 20.5h12"/>',
  waves: '<path d="M4.5 8.5c2.5-2 5-2 7.5 0s5 2 7.5 0M4.5 13.5c2.5-2 5-2 7.5 0s5 2 7.5 0M4.5 18.5c2.5-2 5-2 7.5 0s5 2 7.5 0"/>',
  dining: '<path d="M8 2.5v19M5 2.5V8a3 3 0 0 0 6 0V2.5"/><path d="M16.5 21V2.5c2.2 1.6 3.2 4.5 3.2 7 0 2.1-1.4 3.6-3.2 3.6"/>',
  star: '<path d="M12 3.5l2.7 5.4 6 .9-4.35 4.2 1.05 5.9L12 17.1 6.6 19.9l1.05-5.9L3.3 9.8l6-.9z"/>',
  home: '<path d="M4 11l8-7.5L20 11"/><path d="M6 9.5V20.5h12V9.5"/><path d="M10 20.5V14h4v6.5"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20.5 20.5L15.8 15.8"/>',
  calcheck: '<rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M3.5 10h17M8 2.5v4M16 2.5v4"/><path d="M9 15.3l2 2 4-4"/>',
  account: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3.1"/><path d="M6.3 18.7a7 7 0 0 1 11.4 0"/>',
  martini: '<path d="M4 4.5h16L12 13z"/><path d="M12 13v7.5M8 20.5h8M8.5 8h7"/>',
  mic: '<rect x="9" y="3" width="6" height="11.5" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6"/>',
  music: '<path d="M9 18.5V6.5l11-2.5v12"/><circle cx="6.5" cy="18.5" r="2.6"/><circle cx="17.5" cy="16" r="2.6"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M18.5 15.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z"/>',
  gift: '<rect x="3.5" y="8" width="17" height="4.5"/><path d="M5 12.5V20.5h14v-8M12 8v12.5"/><path d="M12 8c-4.2 0-5.6-2.1-4.4-3.6C8.7 3 11 3.7 12 8zM12 8c4.2 0 5.6-2.1 4.4-3.6C15.3 3 13 3.7 12 8z"/>',
  map: '<path d="M9 4.5L3.5 6.5v13L9 17.5l6 2 5.5-2v-13L15 6.5z"/><path d="M9 4.5v13M15 6.5v13"/>',
  heart: '<path d="M12 20.5S3.5 15.2 3.5 9.6A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8.5 2.6c0 5.6-8.5 10.9-8.5 10.9z"/>',
  gem: '<path d="M7.5 4h9l4 5.5L12 20.5 3.5 9.5z"/><path d="M3.5 9.5h17M9.5 9.5l2.5 11 2.5-11M7.5 4l2 5.5L12 4l2.5 5.5 2-5.5"/>',
  moon: '<path d="M20 14.5A8.3 8.3 0 0 1 9.5 4 8.3 8.3 0 1 0 20 14.5z"/>',
  bell: '<path d="M6 9.7a6 6 0 0 1 12 0c0 4.8 1.8 5.8 1.8 5.8H4.2S6 14.5 6 9.7z"/><path d="M10 19.5a2.2 2.2 0 0 0 4 0"/>',
  camera: '<path d="M4 8h3l1.5-2.5h7L17 8h3a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 20 20H4a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 4 8z"/><circle cx="12" cy="13.5" r="3.4"/>',
  qr: '<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><path d="M13.5 13.5h3v3h-3zM17.5 17.5h3v3h-3z"/>'
};

const DEFAULT_STATE = {
  quick: [
    { id: 'q1', label: 'Tìm quán', icon: 'pin' },
    { id: 'q2', label: 'Tìm Cast', icon: 'user' },
    { id: 'q3', label: 'Ưu đãi', icon: 'ticket' },
    { id: 'q4', label: 'Sự kiện', icon: 'calendar' },
    { id: 'q5', label: 'Ranking', icon: 'crown' },
    { id: 'q6', label: 'Spa', icon: 'waves' },
    { id: 'q7', label: 'Nhà hàng', icon: 'dining' },
    { id: 'q8', label: 'VIP', icon: 'star' }
  ],
  nav: [
    { id: 'n1', label: 'Trang chủ', icon: 'home' },
    { id: 'n2', label: 'Tìm Cast', icon: 'search' },
    { id: 'n3', label: 'Ưu đãi', icon: 'ticket' },
    { id: 'n4', label: 'Lịch đặt', icon: 'calcheck' },
    { id: 'n5', label: 'Tài khoản', icon: 'account' }
  ],
  titles: [
    { id: 't1', key: 'Khối đề xuất', label: 'Đề xuất tối nay' },
    { id: 't2', key: 'Khối coupon', label: 'Coupon Hot' },
    { id: 't3', key: 'Khối xếp hạng', label: 'Bảng xếp hạng' },
    { id: 't4', key: 'Khối dịch vụ', label: 'Dịch vụ nổi bật' },
    { id: 't5', key: 'Khối video', label: 'Video Hot' },
    { id: 't6', key: 'Khối cẩm nang', label: 'Tour · Blog · Guide' }
  ],
  brand: { name: 'Vietyoru', tagline: 'VIETNAM NIGHTLIFE GUIDE' }
};

const getSvgUri = (k: string, color: string) => {
  const body = ICONS[k] || ICONS.star;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
};

export default function AppearancePage() {
  const [savedState, setSavedState] = useState(JSON.stringify(DEFAULT_STATE));
  
  const [quick, setQuick] = useState([...DEFAULT_STATE.quick]);
  const [nav, setNav] = useState([...DEFAULT_STATE.nav]);
  const [titles, setTitles] = useState([...DEFAULT_STATE.titles]);
  const [brand, setBrand] = useState({ ...DEFAULT_STATE.brand });
  
  const [drawer, setDrawer] = useState<{group: 'quick' | 'nav', id: string} | null>(null);
  const [logoOpen, setLogoOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2600);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const showToast = (m: string) => setToast(m);

  const saved = JSON.parse(savedState) as typeof DEFAULT_STATE;
  const brandChanged = JSON.stringify(brand) !== JSON.stringify(saved.brand);
  const brandInitial = (brand.name || 'V').trim().charAt(0).toUpperCase();

  const currentStateStr = JSON.stringify({ quick, nav, titles, brand });
  const dirty = currentStateStr !== savedState;

  let changedCount = 0;
  quick.forEach((it, i) => { const sv = saved.quick[i]; if (!sv || sv.icon !== it.icon || sv.label !== it.label) changedCount++; });
  nav.forEach((it, i) => { const sv = saved.nav[i]; if (!sv || sv.icon !== it.icon || sv.label !== it.label) changedCount++; });
  titles.forEach((t, i) => { const sv = saved.titles[i]; if (!sv || sv.label !== t.label) changedCount++; });
  if (brandChanged) changedCount++;

  const handleUndoAll = () => {
    setQuick([...saved.quick]);
    setNav([...saved.nav]);
    setTitles([...saved.titles]);
    setBrand({ ...saved.brand });
    showToast('Đã hoàn tác về bản đang chạy');
  };

  const handleSaveAll = () => {
    setSavedState(currentStateStr);
    showToast('Đã áp dụng lên giao diện người dùng · bản demo');
  };

  const renderIconDrawer = () => {
    if (!drawer) return null;
    const list = drawer.group === 'quick' ? quick : nav;
    const it = list.find(x => x.id === drawer.id) || list[0];
    if (!it) return null;
    const setLabel = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.slice(0, 16);
      if (drawer.group === 'quick') {
        setQuick(prev => prev.map(x => x.id === it.id ? { ...x, label: val } : x));
      } else {
        setNav(prev => prev.map(x => x.id === it.id ? { ...x, label: val } : x));
      }
    };
    const setIcon = (k: string) => {
      if (drawer.group === 'quick') {
        setQuick(prev => prev.map(x => x.id === it.id ? { ...x, icon: k } : x));
      } else {
        setNav(prev => prev.map(x => x.id === it.id ? { ...x, icon: k } : x));
      }
    };

    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 70 }}>
        <div onClick={() => setDrawer(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(6,6,9,.6)', backdropFilter: 'blur(2px)' }}></div>
        <div style={{ position: 'absolute', right: 0, top: 0, height: '100vh', width: '430px', maxWidth: '94vw', overflow: 'auto', background: '#131218', borderLeft: '1px solid rgba(212,178,106,.18)', boxShadow: '-30px 0 60px -30px rgba(0,0,0,.8)' }}>
          <div style={{ padding: '17px 24px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#131218', zIndex: 2 }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#f3f0ea' }}>
                {drawer.group === 'quick' ? 'Icon trang chủ · ' : 'Icon điều hướng · '}{it.label}
              </div>
              <div style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '1.5px', color: '#8c8679', textTransform: 'uppercase', marginTop: '2px' }}>Đổi icon & tên hiển thị</div>
            </div>
            <span onClick={() => setDrawer(null)} style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5c0b6', cursor: 'pointer' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </span>
          </div>
          <div style={{ padding: '20px 24px 28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(212,178,106,.22)', borderRadius: '14px', padding: '13px 15px' }}>
              <span style={{ width: '58px', height: '58px', flex: 'none', borderRadius: '16px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(212,178,106,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={getSvgUri(it.icon, '#e3c27e')} width={26} height={26} alt="" />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.3px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '6px' }}>Tên hiển thị</div>
                <input value={it.label} onChange={setLabel} maxLength={16} style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '10px', padding: '10px 12px', color: '#f3f0ea', fontSize: '13.5px', fontFamily: "'Inter', sans-serif", outline: 'none' }} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.3px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '9px' }}>Chọn từ thư viện icon</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {Object.keys(ICONS).map(k => {
                  const isSelected = k === it.icon;
                  return (
                    <span 
                      key={k} 
                      onClick={() => setIcon(k)} 
                      title={k}
                      style={{
                        width: '46px', height: '46px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        ...(isSelected ? { background: 'linear-gradient(135deg,#f0dda8,#d4b26a)', boxShadow: '0 8px 18px -8px rgba(168,124,60,.6)' } : { background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)' })
                      }}
                    >
                      <img src={getSvgUri(k, isSelected ? '#241a0a' : '#c5c0b6')} width={21} height={21} alt="" />
                    </span>
                  );
                })}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.3px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '9px' }}>Hoặc tải icon riêng</div>
              <div onClick={() => showToast('Bản demo — khi nối backend sẽ nhận file kéo thả tại đây')} style={{ border: '1.5px dashed rgba(212,178,106,.35)', borderRadius: '13px', padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4b26a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 20h16"/></svg>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#e3c27e', marginTop: '6px' }}>Kéo thả file .svg / .png vào đây</div>
                <div style={{ fontSize: '10.5px', color: '#8c8679', marginTop: '3px' }}>hoặc bấm để chọn từ máy</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '9px', padding: '12px 14px', background: 'rgba(212,178,106,.06)', border: '1px solid rgba(212,178,106,.2)', borderRadius: '11px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4b26a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: '1px' }}><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M12 11v5"/></svg>
              <span style={{ fontSize: '11.5px', color: '#cbb884', lineHeight: 1.55 }}><b style={{ color: '#f0dda8' }}>Chuẩn icon:</b> SVG viewBox 24×24, nét 1.5–2px (hệ thống dùng 1.7px), 1 màu — dùng <b style={{ color: '#f0dda8' }}>currentColor</b> để icon tự đổi màu theo trạng thái (vàng khi chọn). Nếu là PNG: 96×96px @2x, nền trong suốt. Dung lượng &lt; 30 KB. Icon hiển thị thật 20–24px, chừa lề an toàn 2px.</span>
            </div>

            <span onClick={() => setDrawer(null)} style={{ display: 'block', textAlign: 'center', fontSize: '14px', fontWeight: 700, padding: '13px', borderRadius: '12px', cursor: 'pointer', background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', color: '#241a0a', boxShadow: '0 14px 28px -12px rgba(168,124,60,.55)' }}>Xong</span>
          </div>
        </div>
      </div>
    );
  };

  const renderLogoDrawer = () => {
    if (!logoOpen) return null;
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 72 }}>
        <div onClick={() => setLogoOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(6,6,9,.6)', backdropFilter: 'blur(2px)' }}></div>
        <div style={{ position: 'absolute', right: 0, top: 0, height: '100vh', width: '430px', maxWidth: '94vw', overflow: 'auto', background: '#131218', borderLeft: '1px solid rgba(212,178,106,.18)', boxShadow: '-30px 0 60px -30px rgba(0,0,0,.8)' }}>
          <div style={{ padding: '17px 24px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#131218', zIndex: 2 }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#f3f0ea' }}>Thay logo</div>
              <div style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '1.5px', color: '#8c8679', textTransform: 'uppercase', marginTop: '2px' }}>Wordmark hoặc file tải lên</div>
            </div>
            <span onClick={() => setLogoOpen(false)} style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5c0b6', cursor: 'pointer' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </span>
          </div>
          <div style={{ padding: '20px 24px 28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ background: '#0e0d12', border: '1px solid rgba(255,255,255,.08)', borderRadius: '13px', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '22px', lineHeight: 1, background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-.4px' }}>{brand.name || 'Vietyoru'}</div>
                <div style={{ fontSize: '7px', letterSpacing: '2.8px', color: '#8c8679', marginTop: '4px', textTransform: 'uppercase' }}>{brand.tagline}</div>
              </div>
              <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '1px', color: '#57534b', textTransform: 'uppercase' }}>Xem trước</span>
            </div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.3px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>Tên thương hiệu</div>
              <input value={brand.name} onChange={e => setBrand(s => ({ ...s, name: e.target.value.slice(0, 20) }))} maxLength={20} style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '12px 14px', color: '#f3f0ea', fontSize: '13.5px', fontFamily: "'Inter', sans-serif", outline: 'none' }} />
            </div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.3px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>Tagline</div>
              <input value={brand.tagline} onChange={e => setBrand(s => ({ ...s, tagline: e.target.value.toUpperCase().slice(0, 32) }))} maxLength={32} style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '12px 14px', color: '#f3f0ea', fontSize: '13.5px', fontFamily: "'Inter', sans-serif", outline: 'none', letterSpacing: '1.5px' }} />
            </div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.3px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '9px' }}>Hoặc tải file logo</div>
              <div onClick={() => showToast('Bản demo — khi nối backend sẽ nhận file kéo thả tại đây')} style={{ border: '1.5px dashed rgba(212,178,106,.35)', borderRadius: '13px', padding: '22px', textAlign: 'center', cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4b26a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 20h16"/></svg>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#e3c27e', marginTop: '6px' }}>Kéo thả file .svg / .png vào đây</div>
                <div style={{ fontSize: '10.5px', color: '#8c8679', marginTop: '3px' }}>SVG ưu tiên · PNG nền trong suốt ≥ 480×120px · &lt; 200 KB</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '9px', padding: '12px 14px', background: 'rgba(212,178,106,.06)', border: '1px solid rgba(212,178,106,.2)', borderRadius: '11px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4b26a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: '1px' }}><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M12 11v5"/></svg>
              <span style={{ fontSize: '11.5px', color: '#cbb884', lineHeight: 1.55 }}>Hệ thống tự sinh các cỡ: topbar 28px, mobile 22px, favicon 32px, app icon 180px. Logo tải lên nên là bản sáng để nổi trên nền tối.</span>
            </div>
            <span onClick={() => setLogoOpen(false)} style={{ display: 'block', textAlign: 'center', fontSize: '14px', fontWeight: 700, padding: '13px', borderRadius: '12px', cursor: 'pointer', background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', color: '#241a0a', boxShadow: '0 14px 28px -12px rgba(168,124,60,.55)' }}>Xong</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: '#0c0c0f', color: '#f3f0ea', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 30, padding: '16px 26px', background: 'rgba(12,12,15,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#f3f0ea', letterSpacing: '-0.3px' }}>Giao diện & Logo</div>
          <div style={{ fontSize: '10px', color: '#8c8679', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '3px' }}>Cấu hình hiển thị</div>
        </div>
      </div>

      <div style={{ padding: '22px 26px 110px' }}>
        {/* LOGO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '0 0 12px' }}>
          <div>
            <div style={{ fontSize: '15.5px', fontWeight: 600, color: '#f3f0ea' }}>Logo & nhận diện</div>
            <div style={{ fontSize: '8.5px', fontWeight: 600, letterSpacing: '1.6px', color: '#8c8679', textTransform: 'uppercase', marginTop: '2px' }}>Hiển thị trên web · app · favicon</div>
          </div>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,rgba(212,178,106,.45),transparent)' }}></div>
        </div>

        <div style={{ display: 'flex', gap: '14px', alignItems: 'stretch', marginBottom: '28px' }}>
          <div style={{ flex: 1.4, minWidth: 0, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '16px', padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '13px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#c5c0b6' }}>Logo hiện tại</span>
              {brandChanged && <span style={{ fontSize: '9px', fontWeight: 700, color: '#e0a44e', border: '1px solid rgba(224,164,78,.4)', borderRadius: '6px', padding: '2px 7px' }}>CHƯA ÁP DỤNG</span>}
              <div style={{ flex: 1 }}></div>
              <span onClick={() => showToast('Đã tải Vietyoru-logo.svg')} style={{ fontSize: '11.5px', fontWeight: 600, color: '#c5c0b6', border: '1px solid rgba(255,255,255,.13)', borderRadius: '9px', padding: '7px 13px', cursor: 'pointer' }}>Tải .svg</span>
              <span onClick={() => setLogoOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '11.5px', fontWeight: 700, color: '#241a0a', background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', borderRadius: '9px', padding: '7px 14px', cursor: 'pointer', boxShadow: '0 10px 20px -10px rgba(168,124,60,.6)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4.5l5 5L8 21H3v-5z"/><path d="M12.5 6.5l5 5"/></svg>Thay logo
              </span>
            </div>

            <div style={{ border: '1px solid rgba(255,255,255,.07)', borderRadius: '13px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', background: '#0e0d12', padding: '13px 18px' }}>
                <div style={{ flex: 'none' }}>
                  <div style={{ fontWeight: 800, fontSize: '20px', lineHeight: 1, background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-.4px' }}>{brand.name || 'Vietyoru'}</div>
                  <div style={{ fontSize: '6.5px', letterSpacing: '2.6px', color: '#8c8679', marginTop: '3px', textTransform: 'uppercase' }}>{brand.tagline}</div>
                </div>
                <div style={{ display: 'flex', gap: '15px', fontSize: '11.5px', color: '#8c8679' }}>
                  <span>Trang chủ</span><span>Tìm quán</span><span>Cast</span><span>Ưu đãi</span>
                </div>
                <div style={{ flex: 1 }}></div>
                <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '1px', color: '#57534b', textTransform: 'uppercase' }}>Desktop · cao 28px</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0c0c0f', padding: '10px 15px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '15.5px', lineHeight: 1, background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{brand.name || 'Vietyoru'}</div>
                  <div style={{ fontSize: '5.5px', letterSpacing: '2.2px', color: '#8c8679', marginTop: '2px', textTransform: 'uppercase' }}>{brand.tagline}</div>
                </div>
                <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '1px', color: '#57534b', textTransform: 'uppercase' }}>Mobile · cao 22px</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '11px', background: '#17151c', border: '1px solid rgba(255,255,255,.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '20px' }}>
                  <span style={{ background: 'linear-gradient(135deg,#f4e3b4,#b6924a)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{brandInitial}</span>
                </div>
                <div style={{ fontSize: '9px', color: '#57534b', marginTop: '5px' }}>Favicon 32px</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '11px', background: '#f4f0e6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '20px', color: '#241a0a' }}>{brandInitial}</div>
                <div style={{ fontSize: '9px', color: '#57534b', marginTop: '5px' }}>Nền sáng</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '11px', background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '20px', color: '#241a0a' }}>{brandInitial}</div>
                <div style={{ fontSize: '9px', color: '#57534b', marginTop: '5px' }}>App icon 180px</div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0, background: 'rgba(212,178,106,.045)', border: '1px solid rgba(212,178,106,.2)', borderRadius: '16px', padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '11px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d4b26a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M12 11v5"/></svg>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#e3c27e' }}>Chuẩn kỹ thuật khi thay logo</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              <div style={{ display: 'flex', gap: '9px' }}><span style={{ flex: 'none', fontSize: '9px', fontWeight: 700, color: '#241a0a', background: '#d4b26a', borderRadius: '5px', padding: '2px 6px', height: 'fit-content', marginTop: '1px' }}>SVG</span><span style={{ fontSize: '11.5px', color: '#cbb884', lineHeight: 1.5 }}><b style={{ color: '#f0dda8' }}>Định dạng:</b> SVG (vector) ưu tiên — sắc nét mọi màn hình, nhẹ. Fallback PNG-24 nền trong suốt. Tránh JPG (dính nền trắng).</span></div>
              <div style={{ display: 'flex', gap: '9px' }}><span style={{ flex: 'none', fontSize: '9px', fontWeight: 700, color: '#241a0a', background: '#d4b26a', borderRadius: '5px', padding: '2px 6px', height: 'fit-content', marginTop: '1px' }}>PX</span><span style={{ fontSize: '11.5px', color: '#cbb884', lineHeight: 1.5 }}><b style={{ color: '#f0dda8' }}>Kích thước:</b> PNG xuất @2x ≥ 480×120px (logo ngang ~4:1). Hiển thị thật: cao 28px desktop · 22px mobile — tránh chi tiết quá nhỏ.</span></div>
              <div style={{ display: 'flex', gap: '9px' }}><span style={{ flex: 'none', fontSize: '9px', fontWeight: 700, color: '#241a0a', background: '#d4b26a', borderRadius: '5px', padding: '2px 6px', height: 'fit-content', marginTop: '1px' }}>ICO</span><span style={{ fontSize: '11.5px', color: '#cbb884', lineHeight: 1.5 }}><b style={{ color: '#f0dda8' }}>Favicon:</b> kèm bản vuông 32×32px (.png/.ico) + 180×180px cho iOS.</span></div>
              <div style={{ display: 'flex', gap: '9px' }}><span style={{ flex: 'none', fontSize: '9px', fontWeight: 700, color: '#241a0a', background: '#d4b26a', borderRadius: '5px', padding: '2px 6px', height: 'fit-content', marginTop: '1px' }}>KB</span><span style={{ fontSize: '11.5px', color: '#cbb884', lineHeight: 1.5 }}><b style={{ color: '#f0dda8' }}>Dung lượng:</b> &lt; 200 KB (SVG thường &lt; 20 KB).</span></div>
              <div style={{ display: 'flex', gap: '9px' }}><span style={{ flex: 'none', fontSize: '9px', fontWeight: 700, color: '#241a0a', background: '#d4b26a', borderRadius: '5px', padding: '2px 6px', height: 'fit-content', marginTop: '1px' }}>HEX</span><span style={{ fontSize: '11.5px', color: '#cbb884', lineHeight: 1.5 }}><b style={{ color: '#f0dda8' }}>Màu:</b> dùng bản sáng (trắng / vàng #D4B26A) vì nền hệ thống tối #0C0C0F.</span></div>
            </div>
          </div>
        </div>

        {/* ICON TRANG CHỦ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '0 0 12px' }}>
          <div>
            <div style={{ fontSize: '15.5px', fontWeight: 600, color: '#f3f0ea' }}>Bộ icon trang chủ</div>
            <div style={{ fontSize: '8.5px', fontWeight: 600, letterSpacing: '1.6px', color: '#8c8679', textTransform: 'uppercase', marginTop: '2px' }}>Hàng truy cập nhanh · 8 mục</div>
          </div>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,rgba(212,178,106,.45),transparent)' }}></div>
          <span style={{ fontSize: '11px', color: '#8c8679' }}>Bấm vào mục để đổi icon / tên</span>
        </div>

        <div style={{ background: '#0e0d12', border: '1px solid rgba(255,255,255,.07)', borderRadius: '16px', padding: '17px 16px 13px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {quick.map(t => (
              <div key={t.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '52px', height: '52px', borderRadius: '15px', background: 'rgba(255,255,255,.035)', border: '1px solid rgba(212,178,106,.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={getSvgUri(t.icon, '#d4b26a')} width={22} height={22} alt="" />
                </span>
                <span style={{ fontSize: '11px', color: '#c5c0b6', whiteSpace: 'nowrap' }}>{t.label}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '9.5px', color: '#57534b', textAlign: 'center', marginTop: '10px', letterSpacing: '.6px', textTransform: 'uppercase' }}>Xem trước trên trang chủ</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '10px', marginBottom: '28px' }}>
          {quick.map((r, i) => {
            const sv = saved.quick[i];
            const changed = !sv || sv.icon !== r.icon || sv.label !== r.label;
            return (
              <div key={r.id} onClick={() => setDrawer({ group: 'quick', id: r.id })} style={{ display: 'flex', alignItems: 'center', gap: '11px', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '13px', padding: '10px 12px', cursor: 'pointer' }}>
                <span style={{ width: '38px', height: '38px', flex: 'none', borderRadius: '11px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={getSvgUri(r.icon, '#e3c27e')} width={19} height={19} alt="" />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#f3f0ea', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</div>
                  {changed && <div style={{ fontSize: '9px', fontWeight: 700, color: '#e0a44e', marginTop: '2px' }}>● Chưa áp dụng</div>}
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#57534b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}><path d="M14.5 4.5l5 5L8 21H3v-5z"/></svg>
              </div>
            );
          })}
        </div>

        {/* ICON BOTTOM NAV */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '0 0 12px' }}>
          <div>
            <div style={{ fontSize: '15.5px', fontWeight: 600, color: '#f3f0ea' }}>Bộ icon điều hướng mobile</div>
            <div style={{ fontSize: '8.5px', fontWeight: 600, letterSpacing: '1.6px', color: '#8c8679', textTransform: 'uppercase', marginTop: '2px' }}>Bottom navigation · 5 mục</div>
          </div>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,rgba(212,178,106,.45),transparent)' }}></div>
        </div>

        <div style={{ background: '#0e0d12', border: '1px solid rgba(255,255,255,.07)', borderRadius: '16px', padding: '17px 16px 13px', marginBottom: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '376px', maxWidth: '100%', background: '#131218', border: '1px solid rgba(255,255,255,.09)', borderRadius: '15px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', padding: '9px 6px 8px', boxShadow: '0 14px 30px -16px rgba(0,0,0,.7)' }}>
            {nav.map((t, i) => {
              const lc = i === 0 ? '#e3c27e' : '#8c8679';
              const fw = i === 0 ? 700 : 500;
              return (
                <div key={t.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <img src={getSvgUri(t.icon, lc)} width={20} height={20} alt="" style={{ display: 'block' }} />
                  <span style={{ fontSize: '9.5px', fontWeight: fw, color: lc, whiteSpace: 'nowrap' }}>{t.label}</span>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: '9.5px', color: '#57534b', textAlign: 'center', marginTop: '10px', letterSpacing: '.6px', textTransform: 'uppercase' }}>Xem trước thanh điều hướng · tab đầu đang chọn</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '10px', marginBottom: '28px' }}>
          {nav.map((r, i) => {
            const sv = saved.nav[i];
            const changed = !sv || sv.icon !== r.icon || sv.label !== r.label;
            return (
              <div key={r.id} onClick={() => setDrawer({ group: 'nav', id: r.id })} style={{ display: 'flex', alignItems: 'center', gap: '11px', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '13px', padding: '10px 12px', cursor: 'pointer' }}>
                <span style={{ width: '38px', height: '38px', flex: 'none', borderRadius: '11px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={getSvgUri(r.icon, '#e3c27e')} width={19} height={19} alt="" />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#f3f0ea', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</div>
                  {changed && <div style={{ fontSize: '9px', fontWeight: 700, color: '#e0a44e', marginTop: '2px' }}>● Chưa áp dụng</div>}
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#57534b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}><path d="M14.5 4.5l5 5L8 21H3v-5z"/></svg>
              </div>
            );
          })}
        </div>

        {/* TIÊU ĐỀ MỤC */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '0 0 12px' }}>
          <div>
            <div style={{ fontSize: '15.5px', fontWeight: 600, color: '#f3f0ea' }}>Tiêu đề các mục trang chủ</div>
            <div style={{ fontSize: '8.5px', fontWeight: 600, letterSpacing: '1.6px', color: '#8c8679', textTransform: 'uppercase', marginTop: '2px' }}>Section titles · sửa trực tiếp</div>
          </div>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,rgba(212,178,106,.45),transparent)' }}></div>
        </div>

        <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 280px 78px', gap: '14px', padding: '12px 18px', fontSize: '10px', fontWeight: 700, letterSpacing: '.9px', color: '#57534b', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.015)' }}>
            <span>Khối</span><span>Hiển thị trên trang chủ</span><span>Sửa tiêu đề</span><span></span>
          </div>
          {titles.map((t, i) => {
            const sv = saved.titles[i];
            const changed = !sv || sv.label !== t.label;
            return (
              <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 280px 78px', gap: '14px', alignItems: 'center', padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                <span style={{ fontSize: '11px', color: '#8c8679' }}>{t.key}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <span style={{ width: '3.5px', height: '20px', borderRadius: '2px', background: 'linear-gradient(180deg,#f0dda8,#b6924a)', flex: 'none' }}></span>
                  <span style={{ fontSize: '16.5px', fontWeight: 800, color: '#f3f0ea', letterSpacing: '-.2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.label}</span>
                  {changed && <span style={{ flex: 'none', fontSize: '9px', fontWeight: 700, color: '#e0a44e', border: '1px solid rgba(224,164,78,.4)', borderRadius: '6px', padding: '2px 6px' }}>CHƯA ÁP DỤNG</span>}
                </div>
                <input 
                  value={t.label} 
                  onChange={e => setTitles(prev => prev.map(x => x.id === t.id ? { ...x, label: e.target.value.slice(0, 28) } : x))}
                  maxLength={28} 
                  style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '10px', padding: '9px 12px', color: '#f3f0ea', fontSize: '13px', fontFamily: "'Inter', sans-serif", outline: 'none' }} 
                />
                <span onClick={() => setTitles(prev => prev.map(x => x.id === t.id ? { ...x, label: sv?.label ?? t.label } : x))} style={{ fontSize: '11px', fontWeight: 600, color: '#8c8679', border: '1px solid rgba(255,255,255,.1)', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', textAlign: 'center' }}>Hoàn tác</span>
              </div>
            );
          })}
          <div style={{ padding: '10px 18px', fontSize: '10.5px', color: '#57534b' }}>Tiêu đề ngắn gọn ≤ 24 ký tự để hiển thị đẹp trên mobile · hỗ trợ tiếng Việt có dấu.</div>
        </div>

      </div>

      {dirty && (
        <div style={{ position: 'fixed', left: '274px', right: '24px', bottom: '16px', zIndex: 45, display: 'flex', alignItems: 'center', gap: '13px', background: 'rgba(19,18,24,.94)', border: '1px solid rgba(212,178,106,.32)', borderRadius: '15px', padding: '12px 16px', boxShadow: '0 20px 44px -18px rgba(0,0,0,.85)', backdropFilter: 'blur(10px)' }}>
          <span style={{ width: '9px', height: '9px', flex: 'none', borderRadius: '50%', background: '#e0a44e', boxShadow: '0 0 8px #e0a44e' }}></span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#f3f0ea' }}>{changedCount} thay đổi chưa áp dụng</span>
          <span style={{ fontSize: '11.5px', color: '#8c8679' }}>Người dùng vẫn thấy bản cũ cho tới khi áp dụng</span>
          <div style={{ flex: 1 }}></div>
          <span onClick={handleUndoAll} style={{ fontSize: '12.5px', fontWeight: 600, color: '#c5c0b6', border: '1px solid rgba(255,255,255,.14)', borderRadius: '10px', padding: '9px 16px', cursor: 'pointer' }}>Hoàn tác tất cả</span>
          <span onClick={handleSaveAll} style={{ fontSize: '12.5px', fontWeight: 700, color: '#241a0a', background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', borderRadius: '10px', padding: '9px 18px', cursor: 'pointer', boxShadow: '0 12px 24px -12px rgba(168,124,60,.6)' }}>Lưu & áp dụng</span>
        </div>
      )}

      {renderIconDrawer()}
      {renderLogoDrawer()}

      {toast && (
        <div style={{ position: 'fixed', bottom: '22px', left: '50%', transform: 'translateX(-50%)', zIndex: 95, background: '#1c1a22', border: '1px solid rgba(212,178,106,.4)', color: '#f0dda8', fontSize: '13px', fontWeight: 600, padding: '12px 20px', borderRadius: '12px', boxShadow: '0 16px 36px -12px rgba(0,0,0,.8)', whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
