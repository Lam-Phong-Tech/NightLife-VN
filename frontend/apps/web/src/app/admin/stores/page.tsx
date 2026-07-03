"use client";

import React, { useState, useEffect } from 'react';
import { X, Search, ChevronRight, Plus, MapPin, Image as ImageIcon } from 'lucide-react';
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
  red: '#f87171',
  blue: '#60a5fa',
  neonPink: '#e0729e',
};

const mockStores = [
  { id: '1', logo: 'CL', name: 'Club Lumière', address: 'Tây Hồ, Hà Nội', type: 'Club', region: 'HN', commission: '18%', cast: 12, status: 'Đang hoạt động',
    details: {
      mapLink: 'maps.app.goo.gl/lumiere',
      hours: '20:00 – 03:00',
      closedDays: 'Không',
      systemFee: '200.000đ',
      tableFee: '2.500.000đ',
      minDrink: '1.500.000đ',
      surcharge: '5% + VAT'
    }
  },
  { id: '2', logo: 'SL', name: 'Sakura Lounge', address: 'Hoàn Kiếm, Hà Nội', type: 'Lounge', region: 'HN', commission: '15%', cast: 9, status: 'Đang hoạt động' },
  { id: '3', logo: 'KH', name: 'KTV Hoàng Gia', address: 'Kim Mã, Ba Đình', type: 'Karaoke', region: 'HN', commission: '12%', cast: 16, status: 'Đang hoạt động' },
  { id: '4', logo: 'TN', name: 'Bar Tokyo Night', address: 'Ba Đình, Hà Nội', type: 'Bar', region: 'HN', commission: '15%', cast: 6, status: 'Đang hoạt động' },
  { id: '5', logo: 'AK', name: 'Akari Lounge', address: 'Tây Hồ, Hà Nội', type: 'Girls bar', region: 'HN', commission: '20%', cast: 14, status: 'Đang hoạt động' },
  { id: '6', logo: 'LC', name: 'Lotus Club Saigon', address: 'Quận 1, TP.HCM', type: 'Club', region: 'HCM', commission: '18%', cast: 11, status: 'Nháp' },
  { id: '7', logo: 'ZS', name: 'Zen Spa & Onsen', address: 'Tây Hồ, Hà Nội', type: 'Massage', region: 'HN', commission: '10%', cast: 0, status: 'Đang ẩn' },
];

export default function AdminStoresPage() {
  const [selectedStore, setSelectedStore] = useState<any | null>(null);
  const [isAddingStore, setIsAddingStore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [stores, setStores] = useState<any[]>([]);

  const fetchStores = async () => {
    try {
      const res = await apiClient<any>('/admin/stores', {
        params: { 
          type: selectedType === 'all' ? undefined : selectedType,
          search: searchQuery || undefined
        }
      });
      setStores(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [selectedType]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStores();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const getStatusStyle = (status: string) => {
    if (status === 'Đang hoạt động') return { color: colors.green, border: `1px solid rgba(74,222,128,0.3)`, bg: 'transparent' };
    if (status === 'Nháp') return { color: colors.gold, border: `1px solid ${colors.borderGold22}`, bg: 'transparent' };
    if (status === 'Đang ẩn') return { color: colors.muted, border: `1px solid ${colors.borderSoft}`, bg: 'transparent' };
    return { color: colors.muted, border: `1px solid ${colors.borderSoft}`, bg: 'transparent' };
  };

  const getRegionStyle = (region: string) => {
    if (region === 'HN') return { color: colors.blue, bg: 'rgba(96,165,250,0.1)' };
    if (region === 'HCM') return { color: colors.neonPink, bg: 'rgba(224,114,158,0.1)' };
    return { color: colors.muted, bg: colors.surface2 };
  };

  const getLogoStyle = (name: string) => {
    const hue = (name.length * 45) % 360;
    return {
      background: `hsl(${hue}, 40%, 80%)`,
      color: `hsl(${hue}, 60%, 20%)`
    };
  };

  const closeDrawer = () => {
    setSelectedStore(null);
    setIsAddingStore(false);
  };

  return (
    <div style={{ padding: '32px 40px', position: 'relative', minHeight: '100%' }}>
      
      {/* TOP FILTERS & ACTIONS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color={colors.muted} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text" 
              placeholder="Tìm theo tên quán..." 
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
          
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} style={{
            height: '40px',
            borderRadius: '8px',
            border: `1px solid ${colors.borderSoft}`,
            background: colors.surface1,
            color: colors.text,
            padding: '0 16px',
            fontSize: '13px',
            outline: 'none',
            cursor: 'pointer'
          }}>
            <option>Tất cả loại hình</option>
            <option>Club</option>
            <option>Lounge</option>
            <option>Karaoke</option>
          </select>
        </div>

        <button 
          onClick={() => { setSelectedStore(null); setIsAddingStore(true); }}
          style={{
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: colors.goldGrad,
            color: colors.onGold,
            border: 'none',
            padding: '0 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <Plus size={18} strokeWidth={3} />
          Thêm quán
        </button>
      </div>

      {/* TABLE */}
      <div style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.borderSoft}` }}>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>QUÁN</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>LOẠI HÌNH</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>KHU VỰC</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>% HH</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>CAST</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>TRẠNG THÁI</th>
              <th style={{ padding: '16px 24px', width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {mockStores.map((store, idx) => {
              const statusStyle = getStatusStyle(store.status);
              const regionStyle = getRegionStyle(store.region);
              const logoStyle = getLogoStyle(store.name);
              
              return (
                <tr 
                  key={idx} 
                  onClick={() => { setIsAddingStore(false); setSelectedStore(store); }}
                  style={{ 
                    borderBottom: `1px solid ${colors.borderSoft}`,
                    cursor: 'pointer',
                    background: selectedStore?.id === store.id ? colors.surface2 : 'transparent',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = colors.surface2}
                  onMouseLeave={(e) => e.currentTarget.style.background = selectedStore?.id === store.id ? colors.surface2 : 'transparent'}
                >
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: 40, height: 40, borderRadius: '10px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: 800,
                        ...logoStyle
                      }}>
                        {store.logo}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: colors.text }}>{store.name}</div>
                        <div style={{ fontSize: '12px', color: colors.muted, marginTop: '2px' }}>{store.address}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: colors.text2 }}>{store.type}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      background: regionStyle.bg, 
                      color: regionStyle.color, 
                      padding: '4px 12px', 
                      borderRadius: '12px', 
                      fontSize: '11px', 
                      fontWeight: 700,
                    }}>
                      {store.region}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 700, color: colors.gold }}>{store.commission}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: colors.text2 }}>{store.cast}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      border: statusStyle.border, 
                      color: statusStyle.color, 
                      padding: '4px 16px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: 600,
                      display: 'inline-block'
                    }}>
                      {store.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', color: colors.muted }}>
                    <ChevronRight size={16} />
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
        right: (selectedStore || isAddingStore) ? 0 : '-480px',
        bottom: 0,
        width: '480px',
        background: colors.bg,
        borderLeft: `1px solid ${colors.borderSoft}`,
        boxShadow: (selectedStore || isAddingStore) ? '-10px 0 30px rgba(0,0,0,0.5)' : 'none',
        transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {(selectedStore || isAddingStore) && (
          <>
            <div style={{ padding: '24px', borderBottom: `1px solid ${colors.borderSoft}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: colors.muted, marginBottom: '8px' }}>
                    {isAddingStore ? 'THÊM QUÁN MỚI' : 'CHỈNH SỬA QUÁN'}
                  </div>
                  <h2 style={{ fontSize: '24px', fontWeight: 700, color: colors.text, margin: 0 }}>
                    {isAddingStore ? 'Quán mới' : selectedStore?.name}
                  </h2>
                </div>
                <button 
                  onClick={closeDrawer}
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
              
              {/* THÔNG TIN CƠ BẢN */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: colors.gold, letterSpacing: '1px', marginBottom: '16px' }}>THÔNG TIN CƠ BẢN</div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: colors.muted, marginBottom: '8px' }}>Tên quán</label>
                  <input type="text" placeholder="Nhập tên quán..." defaultValue={!isAddingStore ? selectedStore?.name : ''} style={{ width: '100%', height: '44px', background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '8px', color: colors.text, padding: '0 16px', fontSize: '14px', outline: 'none' }} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: colors.muted, marginBottom: '8px' }}>Loại hình</label>
                    <select defaultValue={!isAddingStore ? selectedStore?.type : ''} style={{ width: '100%', height: '44px', background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '8px', color: colors.text, padding: '0 16px', fontSize: '14px', outline: 'none', cursor: 'pointer' }}>
                      {isAddingStore && <option value="" disabled hidden>Chọn loại hình</option>}
                      <option value="Club">Club</option>
                      <option value="Lounge">Lounge</option>
                      <option value="Karaoke">Karaoke</option>
                      <option value="Bar">Bar</option>
                      <option value="Girls bar">Girls bar</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: colors.muted, marginBottom: '8px' }}>Khu vực</label>
                    <select defaultValue={!isAddingStore ? (selectedStore?.region === 'HN' ? 'Hà Nội' : 'TP.HCM') : ''} style={{ width: '100%', height: '44px', background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '8px', color: colors.text, padding: '0 16px', fontSize: '14px', outline: 'none', cursor: 'pointer' }}>
                      {isAddingStore && <option value="" disabled hidden>Chọn khu vực</option>}
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="TP.HCM">TP.HCM</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: colors.muted, marginBottom: '8px' }}>Địa chỉ</label>
                  <input type="text" placeholder="Số nhà, đường, quận..." defaultValue={!isAddingStore ? "52 Tô Ngọc Vân, Tây Hồ" : ''} style={{ width: '100%', height: '44px', background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '8px', color: colors.text, padding: '0 16px', fontSize: '14px', outline: 'none' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: colors.muted, marginBottom: '8px' }}>Link Google Maps chỉ đường</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={16} color={colors.blue} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" placeholder="Dán link Google Maps..." defaultValue={!isAddingStore ? "maps.app.goo.gl/lumiere" : ''} style={{ width: '100%', height: '44px', background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '8px', color: colors.blue, padding: '0 16px 0 42px', fontSize: '14px', outline: 'none' }} />
                  </div>
                </div>
              </div>

              {/* GIỜ HOẠT ĐỘNG */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: colors.gold, letterSpacing: '1px', marginBottom: '16px' }}>GIỜ HOẠT ĐỘNG</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: colors.muted, marginBottom: '8px' }}>Giờ mở – đóng cửa</label>
                    <input type="text" placeholder="VD: 20:00 – 03:00" defaultValue={!isAddingStore ? "20:00 – 03:00" : ''} style={{ width: '100%', height: '44px', background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '8px', color: colors.text, padding: '0 16px', fontSize: '14px', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: colors.muted, marginBottom: '8px' }}>Ngày nghỉ</label>
                    <input type="text" placeholder="Không" defaultValue={!isAddingStore ? "Không" : ''} style={{ width: '100%', height: '44px', background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '8px', color: colors.text, padding: '0 16px', fontSize: '14px', outline: 'none' }} />
                  </div>
                </div>
              </div>

              {/* BẢNG GIÁ THAM KHẢO */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: colors.gold, letterSpacing: '1px', marginBottom: '16px' }}>BẢNG GIÁ THAM KHẢO</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: colors.muted, marginBottom: '8px' }}>Phí hệ thống</label>
                    <input type="text" placeholder="0đ" defaultValue={!isAddingStore ? "200.000đ" : ''} style={{ width: '100%', height: '44px', background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '8px', color: colors.text, padding: '0 16px', fontSize: '14px', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: colors.muted, marginBottom: '8px' }}>Phòng / bàn</label>
                    <input type="text" placeholder="0đ" defaultValue={!isAddingStore ? "2.500.000đ" : ''} style={{ width: '100%', height: '44px', background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '8px', color: colors.text, padding: '0 16px', fontSize: '14px', outline: 'none' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: colors.muted, marginBottom: '8px' }}>Đồ uống tối thiểu</label>
                    <input type="text" placeholder="0đ" defaultValue={!isAddingStore ? "1.500.000đ" : ''} style={{ width: '100%', height: '44px', background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '8px', color: colors.text, padding: '0 16px', fontSize: '14px', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: colors.muted, marginBottom: '8px' }}>Phụ thu · thuế</label>
                    <input type="text" placeholder="0%" defaultValue={!isAddingStore ? "5% + VAT" : ''} style={{ width: '100%', height: '44px', background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '8px', color: colors.text, padding: '0 16px', fontSize: '14px', outline: 'none' }} />
                  </div>
                </div>
              </div>

              {/* ALBUM ẢNH */}
              <div style={{ marginBottom: isAddingStore ? '0' : '32px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: colors.gold, letterSpacing: '1px', marginBottom: '16px' }}>ALBUM ẢNH</div>
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                  <div style={{ width: 100, height: 100, borderRadius: '12px', background: colors.surface1, flexShrink: 0 }}></div>
                  <div style={{ width: 100, height: 100, borderRadius: '12px', background: 'rgba(212,178,106,.05)', flexShrink: 0 }}></div>
                  <div style={{ width: 100, height: 100, borderRadius: '12px', background: colors.surface2, flexShrink: 0 }}></div>
                  <div style={{ 
                    width: 100, height: 100, borderRadius: '12px', 
                    background: 'transparent', border: `1px dashed ${colors.borderSoft}`, 
                    flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    color: colors.muted, cursor: 'pointer'
                  }}>
                    <Plus size={20} style={{ marginBottom: '4px' }} />
                    <span style={{ fontSize: '12px' }}>Tải lên</span>
                  </div>
                </div>
              </div>

              {/* HOA HỒNG */}
              <div style={{ 
                border: `1px solid ${colors.borderSoft}`, 
                borderRadius: '12px', 
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px'
              }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: colors.gold, marginBottom: '4px' }}>% Hoa hồng thỏa thuận</div>
                  <div style={{ fontSize: '13px', color: colors.muted }}>Cấu hình riêng theo từng quán khi onboard</div>
                </div>
                <input 
                  type="text"
                  defaultValue={!isAddingStore ? selectedStore?.commission : '15%'}
                  style={{ 
                    background: 'transparent', 
                    border: `1px solid ${colors.borderSoft}`, 
                    borderRadius: '8px', 
                    width: '80px',
                    height: '44px',
                    textAlign: 'center',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: colors.gold,
                    outline: 'none'
                  }}
                />
              </div>

              {/* TRẠNG THÁI HIỂN THỊ */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: colors.gold, letterSpacing: '1px', marginBottom: '16px' }}>TRẠNG THÁI HIỂN THỊ</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button style={{ 
                    padding: '10px 20px', 
                    borderRadius: '8px', 
                    background: (!isAddingStore ? selectedStore?.status : 'Đang hoạt động') === 'Đang hoạt động' ? colors.goldGrad : 'transparent',
                    color: (!isAddingStore ? selectedStore?.status : 'Đang hoạt động') === 'Đang hoạt động' ? colors.onGold : colors.muted,
                    border: (!isAddingStore ? selectedStore?.status : 'Đang hoạt động') === 'Đang hoạt động' ? 'none' : `1px solid ${colors.borderSoft}`,
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}>Đang hoạt động</button>
                  <button style={{ 
                    padding: '10px 20px', 
                    borderRadius: '8px', 
                    background: (!isAddingStore ? selectedStore?.status : '') === 'Đang ẩn' ? colors.goldGrad : 'transparent',
                    color: (!isAddingStore ? selectedStore?.status : '') === 'Đang ẩn' ? colors.onGold : colors.muted,
                    border: (!isAddingStore ? selectedStore?.status : '') === 'Đang ẩn' ? 'none' : `1px solid ${colors.borderSoft}`,
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}>Đang ẩn</button>
                  <button style={{ 
                    padding: '10px 20px', 
                    borderRadius: '8px', 
                    background: (!isAddingStore ? selectedStore?.status : '') === 'Nháp' ? colors.goldGrad : 'transparent',
                    color: (!isAddingStore ? selectedStore?.status : '') === 'Nháp' ? colors.onGold : colors.muted,
                    border: (!isAddingStore ? selectedStore?.status : '') === 'Nháp' ? 'none' : `1px solid ${colors.borderSoft}`,
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}>Nháp</button>
                </div>
              </div>

            </div>

            {/* Actions Footer */}
            <div style={{ padding: '24px', borderTop: `1px solid ${colors.borderSoft}`, display: 'flex', gap: '16px' }}>
              <button 
                onClick={closeDrawer}
                style={{
                  width: '120px',
                  background: 'transparent',
                  color: colors.muted,
                  border: `1px solid ${colors.borderSoft}`,
                  height: '48px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: colors.goldGrad,
                color: colors.onGold,
                border: 'none',
                height: '48px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer'
              }}>
                Lưu quán
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
