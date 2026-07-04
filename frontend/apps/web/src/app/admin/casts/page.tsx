"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Search, ChevronRight, Plus, Check, Play, Bell, Upload, Video } from 'lucide-react';
import { apiClient, apiFormDataClient } from '@/lib/api/client';

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

const COMMON_LANGS = ['VN', 'EN', 'JP', 'KR', 'CN'];

export default function AdminCastsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [casts, setCasts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  
  // Drawer state
  const [selectedCast, setSelectedCast] = useState<any>(null);
  const [isAddingCast, setIsAddingCast] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<any>({
    stageName: '', storeId: '', publicHeadline: '', birthMonth: '', zodiacSign: '',
    heightCm: '', measurements: '', languages: [], hobbies: [], tags: [], isPublic: true, status: 'ACTIVE',
    youtubeLinks: []
  });
  
  const [albums, setAlbums] = useState<any[]>([]);
  
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [youtubeInput, setYoutubeInput] = useState('');
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);

  const fetchCasts = async () => {
    try {
      const res = await apiClient<any>('/admin/casts', { params: { search: search || undefined, limit: 100 } });
      if (res && res.data) {
        setCasts(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStores = async () => {
    try {
      // Dùng chung endpoint và cách lấy data y hệt như trang stores/page.tsx
      const res = await apiClient<any>('/admin/stores');
      let arr = [];
      if (Array.isArray(res)) arr = res;
      else if (res && Array.isArray(res.data)) arr = res.data;
      else if (res && res.data && Array.isArray(res.data.data)) arr = res.data.data;
      
      if (arr.length === 0) {
        setStores([{ id: 'no-data', name: 'Lỗi: API trả về mảng rỗng (0 quán)' }]);
      } else {
        setStores(arr);
      }
    } catch (e) {
      console.error(e);
      setStores([{ id: 'error', name: 'Lỗi: Không thể fetch API quán' }]);
    }
  };

  useEffect(() => {
    fetchCasts();
  }, [search]);

  useEffect(() => {
    fetchStores();
  }, []);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 3000);
  };

  const getStatusLabel = (status: string, isPublic: boolean) => {
    if (status === 'DRAFT') return 'Chờ duyệt';
    if (status === 'ACTIVE' && isPublic) return 'Đang hiển thị';
    return 'Ẩn';
  };

  const filteredCasts = casts.filter(cast => {
    const st = getStatusLabel(cast.status, cast.isPublic);
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return st === 'Chờ duyệt';
    if (activeTab === 'visible') return st === 'Đang hiển thị';
    if (activeTab === 'hidden') return st === 'Ẩn';
    return true;
  });

  const getStatusStyle = (label: string) => {
    if (label === 'Đang hiển thị') return { color: colors.green, border: `1px solid rgba(74,222,128,0.3)` };
    if (label === 'Chờ duyệt') return { color: colors.gold, border: `1px solid ${colors.borderGold22}` };
    return { color: colors.muted, border: `1px solid ${colors.borderSoft}` };
  };

  const getAvatarStyle = (name: string) => {
    const hue = ((name || 'A').length * 55) % 360;
    return {
      background: `hsl(${hue}, 40%, 80%)`,
      color: `hsl(${hue}, 60%, 20%)`
    };
  };

  const closeDrawer = () => {
    setSelectedCast(null);
    setIsAddingCast(false);
  };

  const openNewDrawer = () => {
    setFormData({
      stageName: '', storeId: '', publicHeadline: '', birthMonth: '', zodiacSign: '',
      heightCm: '', measurements: '', languages: [], hobbies: [], tags: [], isPublic: true, status: 'ACTIVE',
      youtubeLinks: []
    });
    setAlbums([]);
    setIsAddingCast(true);
    setSelectedCast(null);
  };

  const openEditDrawer = (c: any) => {
    setFormData({
      stageName: c.stageName || '',
      storeId: c.storeId || '',
      publicHeadline: c.publicHeadline || '',
      birthMonth: c.birthMonth || '',
      zodiacSign: c.zodiacSign || '',
      heightCm: c.heightCm || '',
      measurements: c.measurements || '',
      languages: c.languages || [],
      hobbies: c.hobbies || [],
      tags: c.tags || [],
      youtubeLinks: c.youtubeLinks || [],
      isPublic: c.isPublic ?? true,
      status: c.status || 'ACTIVE'
    });
    setAlbums(c.media || []);
    setSelectedCast(c);
    setIsAddingCast(false);
  };

  const saveCast = async () => {
    try {
      if (!formData.stageName || formData.stageName.trim() === '') {
        showToast('Vui lòng nhập tên Cast!');
        return;
      }
      if (!formData.storeId) {
        showToast('Vui lòng chọn quán trực thuộc!');
        return;
      }

      const payload = {
        ...formData,
        birthMonth: formData.birthMonth ? parseInt(formData.birthMonth, 10) : undefined,
        heightCm: formData.heightCm ? parseInt(formData.heightCm, 10) : undefined,
        mediaIds: albums.map(a => a.id)
      };

      if (isAddingCast) {
        await apiClient('/admin/casts', { method: 'POST', data: payload });
        showToast('Đã tạo Cast mới!');
      } else if (selectedCast) {
        await apiClient(`/admin/casts/${selectedCast.id}`, { method: 'PATCH', data: payload });
        showToast('Đã cập nhật Cast!');
      }
      closeDrawer();
      fetchCasts();
    } catch (e: any) {
      showToast(e.message || 'Lỗi khi lưu Cast');
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const form = new FormData();
      form.append('file', file);
      form.append('purpose', 'CAST_PHOTO');
      form.append('access', 'PUBLIC');
      
      const res = await apiFormDataClient<any>('/storage/upload', form);
      if (res && res.id) {
        setAlbums(prev => [...prev, { id: res.id, url: res.url }]);
        showToast('Tải ảnh lên thành công');
      }
    } catch (err: any) {
      showToast('Lỗi tải ảnh: ' + err.message);
    } finally {
      setUploadingImage(false);
    } 
  };

  const handleAddYoutube = () => {
    setShowYoutubeInput(true);
  };

  const toggleLanguage = (lang: string) => {
    setFormData((prev: any) => {
      const cur = prev.languages || [];
      if (cur.includes(lang)) return { ...prev, languages: cur.filter((l: string) => l !== lang) };
      return { ...prev, languages: [...cur, lang] };
    });
  };

  const updateArrField = (field: string, val: string) => {
    const arr = val.split(',').map(s => s.trim()).filter(Boolean);
    setFormData((prev: any) => ({ ...prev, [field]: arr }));
  };

  const isEditing = isAddingCast || selectedCast !== null;
  const currentLabel = isAddingCast ? 'Tạo mới' : (selectedCast ? getStatusLabel(selectedCast.status, selectedCast.isPublic) : '');

  // Stats
  const statPending = casts.filter(c => getStatusLabel(c.status, c.isPublic) === 'Chờ duyệt').length;
  const statVisible = casts.filter(c => getStatusLabel(c.status, c.isPublic) === 'Đang hiển thị').length;
  const statHidden = casts.filter(c => getStatusLabel(c.status, c.isPublic) === 'Ẩn').length;

  return (
    <div style={{ padding: '32px 40px', position: 'relative', minHeight: '100%' }}>
      {toast && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: colors.surface1, border: `1px solid ${colors.gold}`, color: colors.gold, padding: '12px 24px', borderRadius: '8px', zIndex: 9999, fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
          {toast}
        </div>
      )}
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* TABS */}
          <div style={{ display: 'flex', background: colors.surface1, borderRadius: '8px', padding: '4px' }}>
            <button onClick={() => setActiveTab('all')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: activeTab === 'all' ? colors.goldGrad : 'transparent', color: activeTab === 'all' ? colors.onGold : colors.muted, fontWeight: activeTab === 'all' ? 700 : 500, fontSize: '13px', cursor: 'pointer' }}>
              Tất cả {casts.length}
            </button>
            <button onClick={() => setActiveTab('pending')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: activeTab === 'pending' ? colors.goldGrad : 'transparent', color: activeTab === 'pending' ? colors.onGold : colors.gold, fontWeight: activeTab === 'pending' ? 700 : 500, fontSize: '13px', cursor: 'pointer' }}>
              Chờ duyệt {statPending}
            </button>
            <button onClick={() => setActiveTab('visible')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: activeTab === 'visible' ? colors.goldGrad : 'transparent', color: activeTab === 'visible' ? colors.onGold : colors.muted, fontWeight: activeTab === 'visible' ? 700 : 500, fontSize: '13px', cursor: 'pointer' }}>
              Hiển thị {statVisible}
            </button>
            <button onClick={() => setActiveTab('hidden')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: activeTab === 'hidden' ? colors.goldGrad : 'transparent', color: activeTab === 'hidden' ? colors.onGold : colors.muted, fontWeight: activeTab === 'hidden' ? 700 : 500, fontSize: '13px', cursor: 'pointer' }}>
              Ẩn {statHidden}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color={colors.muted} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Tìm tên cast..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                height: '40px', width: '280px', borderRadius: '8px', border: `1px solid ${colors.borderSoft}`,
                background: colors.surface1, color: colors.text, padding: '0 16px 0 42px', fontSize: '13px', outline: 'none',
              }}
            />
          </div>
          <button onClick={openNewDrawer} style={{
            height: '40px', display: 'flex', alignItems: 'center', gap: '8px',
            background: colors.goldGrad, color: colors.onGold, border: 'none', padding: '0 20px',
            borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer'
          }}>
            <Plus size={18} strokeWidth={3} />
            Thêm cast
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.borderSoft}` }}>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>CAST</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>QUÁN TRỰC THUỘC</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>NGÔN NGỮ</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>TAGS</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>TRẠNG THÁI</th>
              <th style={{ padding: '16px 24px', width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredCasts.map((cast, idx) => {
              const statusLabel = getStatusLabel(cast.status, cast.isPublic);
              const statusStyle = getStatusStyle(statusLabel);
              const avatarStyle = getAvatarStyle(cast.stageName);
              const storeName = cast.store?.name || 'Không rõ';
              
              return (
                <tr 
                  key={cast.id} 
                  onClick={() => openEditDrawer(cast)}
                  style={{ 
                    borderBottom: `1px solid ${colors.borderSoft}`, cursor: 'pointer',
                    background: selectedCast?.id === cast.id ? colors.surface2 : 'transparent',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = colors.surface2}
                  onMouseLeave={(e) => e.currentTarget.style.background = selectedCast?.id === cast.id ? colors.surface2 : 'transparent'}
                >
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ 
                        width: 40, height: 40, borderRadius: '50%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: 800,
                        ...avatarStyle
                      }}>
                        {(cast.stageName || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: colors.text }}>{cast.stageName}</div>
                        <div style={{ fontSize: '12px', color: colors.muted, marginTop: '2px' }}>{cast.zodiacSign || '---'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: colors.text2 }}>{storeName}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: colors.text2 }}>{(cast.languages || []).join(' · ') || '---'}</td>
                  <td style={{ padding: '16px 24px', fontSize: '13px', color: colors.text2 }}>
                    {(cast.tags || []).join(', ') || '---'}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      border: statusStyle.border, color: statusStyle.color, 
                      padding: '4px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, display: 'inline-block'
                    }}>
                      {statusLabel}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', color: colors.muted }}>
                    <ChevronRight size={16} />
                  </td>
                </tr>
              );
            })}
            {filteredCasts.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: colors.muted }}>Không tìm thấy Cast nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DRAWER */}
      <div style={{
        position: 'fixed', top: 0, right: (isEditing) ? 0 : '-520px', bottom: 0, width: '520px',
        background: colors.bg, borderLeft: `1px solid ${colors.borderSoft}`,
        boxShadow: (isEditing) ? '-10px 0 30px rgba(0,0,0,0.5)' : 'none',
        transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 100,
        display: 'flex', flexDirection: 'column'
      }}>
        {isEditing && (
          <>
            <div style={{ padding: '24px', borderBottom: `1px solid ${colors.borderSoft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: colors.gold, letterSpacing: '1px', textTransform: 'uppercase' }}>
                {isAddingCast ? 'THÊM CAST MỚI' : 'CHỈNH SỬA CAST'}
              </h3>
              <button onClick={closeDrawer} style={{ background: 'transparent', border: 'none', color: colors.muted, cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
              {currentLabel === 'Chờ duyệt' && (
                <div style={{ 
                  padding: '16px', border: `1px solid ${colors.borderGold22}`, borderRadius: '12px', 
                  display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '24px',
                  background: 'rgba(212,178,106,.05)'
                }}>
                  <div style={{ color: colors.gold, marginTop: '2px' }}>⚠️</div>
                  <div style={{ fontSize: '13px', color: colors.text2, lineHeight: 1.5 }}>
                    Nội dung chờ <span style={{ color: colors.gold, fontWeight: 700 }}>kiểm duyệt</span> trước khi public. 
                  </div>
                </div>
              )}

              {/* CAST HEADER INFO */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                <div style={{ 
                  width: 80, height: 80, borderRadius: '16px', 
                  background: isAddingCast ? colors.surface1 : getAvatarStyle(formData.stageName).background,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', fontWeight: 800, color: isAddingCast ? colors.muted : getAvatarStyle(formData.stageName).color,
                  border: isAddingCast ? `1px dashed ${colors.borderSoft}` : 'none'
                }}>
                  {isAddingCast ? <Plus size={24} /> : (formData.stageName ? formData.stageName.charAt(0).toUpperCase() : 'A')}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <input type="text" placeholder="Tên Cast (Stage Name)" value={formData.stageName} onChange={e => setFormData({...formData, stageName: e.target.value})} style={{ background: 'transparent', border: 'none', color: colors.text, fontSize: '24px', fontWeight: 700, outline: 'none', marginBottom: '8px', width: '100%' }} />
                  <select value={formData.storeId} onChange={e => setFormData({...formData, storeId: e.target.value})} style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, color: colors.text2, fontSize: '13px', padding: '6px 12px', borderRadius: '6px', outline: 'none', width: '220px' }}>
                    <option value="" disabled hidden>Chọn quán trực thuộc</option>
                    {stores.map(st => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* GRID INFO */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '16px', background: 'transparent', border: `1px solid ${colors.borderSoft}`, borderRadius: '12px' }}>
                  <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '8px' }}>Tháng sinh</div>
                  <input type="number" placeholder="Ví dụ: 1" value={formData.birthMonth} onChange={e => setFormData({...formData, birthMonth: e.target.value})} style={{ width: '100%', background: 'transparent', border: 'none', color: colors.text, fontSize: '15px', fontWeight: 700, outline: 'none' }} />
                </div>
                <div style={{ padding: '16px', background: 'transparent', border: `1px solid ${colors.borderSoft}`, borderRadius: '12px' }}>
                  <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '8px' }}>Cung Hoàng Đạo</div>
                  <input type="text" placeholder="Ma Kết" value={formData.zodiacSign} onChange={e => setFormData({...formData, zodiacSign: e.target.value})} style={{ width: '100%', background: 'transparent', border: 'none', color: colors.text, fontSize: '15px', fontWeight: 700, outline: 'none' }} />
                </div>
                <div style={{ padding: '16px', background: 'transparent', border: `1px solid ${colors.borderSoft}`, borderRadius: '12px' }}>
                  <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '8px' }}>Chiều cao (cm)</div>
                  <input type="number" placeholder="166" value={formData.heightCm} onChange={e => setFormData({...formData, heightCm: e.target.value})} style={{ width: '100%', background: 'transparent', border: 'none', color: colors.text, fontSize: '15px', fontWeight: 700, outline: 'none' }} />
                </div>
                <div style={{ padding: '16px', background: 'transparent', border: `1px solid ${colors.borderSoft}`, borderRadius: '12px' }}>
                  <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '8px' }}>Số đo (V1-V2-V3)</div>
                  <input type="text" placeholder="87 - 61 - 89" value={formData.measurements} onChange={e => setFormData({...formData, measurements: e.target.value})} style={{ width: '100%', background: 'transparent', border: 'none', color: colors.text, fontSize: '15px', fontWeight: 700, outline: 'none' }} />
                </div>
              </div>

              {/* Ngôn ngữ */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '8px' }}>Ngôn ngữ</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {COMMON_LANGS.map(lang => {
                    const isActive = formData.languages?.includes(lang);
                    return (
                      <div 
                        key={lang}
                        onClick={() => toggleLanguage(lang)}
                        style={{ 
                          padding: '6px 14px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', fontWeight: 600,
                          background: isActive ? colors.goldGrad : 'transparent',
                          color: isActive ? colors.onGold : colors.muted,
                          border: isActive ? 'none' : `1px solid ${colors.borderSoft}`
                        }}
                      >
                        {lang}
                      </div>
                    );
                  })}
                  <input 
                    type="text" 
                    placeholder="Khác (ngăn cách phẩy)..." 
                    value={formData.languages?.filter((l: string) => !COMMON_LANGS.includes(l)).join(', ') || ''}
                    onChange={(e) => {
                      const others = e.target.value.split(',').map(s=>s.trim()).filter(Boolean);
                      const currentCommon = formData.languages.filter((l: string) => COMMON_LANGS.includes(l));
                      setFormData({...formData, languages: [...currentCommon, ...others]});
                    }}
                    style={{ background: 'transparent', border: 'none', outline: 'none', color: colors.text, fontSize: '13px', marginLeft: '8px', flex: 1, minWidth: '100px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '8px' }}>Sở thích (ngăn cách dấu phẩy)</div>
                <input type="text" placeholder="Hát, piano, thời trang..." value={(formData.hobbies || []).join(', ')} onChange={e => updateArrField('hobbies', e.target.value)} style={{ width: '100%', background: 'transparent', border: `1px solid ${colors.borderSoft}`, color: colors.text, fontSize: '14px', padding: '12px 16px', borderRadius: '12px', outline: 'none' }} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '8px' }}>Tags / từ khóa (ngăn cách dấu phẩy)</div>
                <input type="text" placeholder="Sang chảnh, vui vẻ..." value={(formData.tags || []).join(', ')} onChange={e => updateArrField('tags', e.target.value)} style={{ width: '100%', background: 'transparent', border: `1px solid ${colors.borderSoft}`, color: colors.text, fontSize: '14px', padding: '12px 16px', borderRadius: '12px', outline: 'none' }} />
              </div>

              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '8px' }}>Lời chào (greeting)</div>
                <textarea 
                  placeholder="Nhập lời chào..." 
                  value={formData.publicHeadline}
                  onChange={e => setFormData({...formData, publicHeadline: e.target.value})}
                  style={{ width: '100%', height: '80px', background: 'transparent', border: `1px solid ${colors.borderSoft}`, borderRadius: '12px', color: colors.text, fontSize: '14px', padding: '16px', outline: 'none', resize: 'none' }} 
                />
              </div>

              <div style={{ marginBottom: '32px', display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: colors.text }}>
                  <input type="checkbox" checked={formData.isPublic} onChange={e => setFormData({...formData, isPublic: e.target.checked})} style={{ width: 16, height: 16, accentColor: colors.gold }} />
                  Cho phép hiển thị trên Web (Public)
                </label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, color: colors.text2, fontSize: '13px', padding: '6px 12px', borderRadius: '6px', outline: 'none' }}>
                  <option value="ACTIVE">Trạng thái: Hoạt động</option>
                  <option value="DRAFT">Trạng thái: Bản nháp / Chờ duyệt</option>
                </select>
              </div>

              {/* ẢNH ĐẠI DIỆN */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ảnh đại diện (1 ảnh)</span>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {albums.length === 0 && (
                      <button onClick={() => imageUploadRef.current?.click()} style={{ background: 'transparent', border: 'none', color: colors.gold, fontSize: '12px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Upload size={14} /> Thêm ảnh
                      </button>
                    )}
                  </div>
                  <input type="file" ref={imageUploadRef} style={{ display: 'none' }} accept="image/*" onChange={handleUploadImage} />
                </div>
                
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {albums.map((m, i) => (
                    <div key={i} style={{ position: 'relative', width: 120, height: 160, borderRadius: '12px', flexShrink: 0, backgroundImage: `url(${m.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                      <button onClick={() => setAlbums(albums.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {uploadingImage && (
                    <div style={{ width: 120, height: 160, borderRadius: '12px', background: colors.surface2, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.muted, fontSize: '12px' }}>Đang tải...</div>
                  )}
                  {albums.length === 0 && !uploadingImage && (
                    <div style={{ width: 120, height: 160, borderRadius: '12px', background: 'transparent', border: `1px dashed ${colors.borderSoft}`, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: colors.muted, fontSize: '12px', textAlign: 'center', padding: '16px' }}>
                      Chưa có ảnh
                    </div>
                  )}
                </div>
              </div>

              {/* VIDEO YOUTUBE */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Video YouTube</span>
                  {!showYoutubeInput ? (
                    <button onClick={handleAddYoutube} style={{ background: 'transparent', border: 'none', color: colors.red, fontSize: '12px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Video size={14} /> Thêm link YouTube
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        placeholder="Dán link YouTube..." 
                        value={youtubeInput}
                        onChange={(e) => setYoutubeInput(e.target.value)}
                        style={{ background: 'transparent', border: `1px solid ${colors.borderSoft}`, color: colors.text, fontSize: '12px', padding: '6px 12px', borderRadius: '6px', outline: 'none', width: '200px' }}
                      />
                      <button onClick={() => {
                        if (youtubeInput && youtubeInput.includes('youtu')) {
                          setFormData((prev: any) => ({ ...prev, youtubeLinks: [...(prev.youtubeLinks || []), youtubeInput] }));
                          setYoutubeInput('');
                          setShowYoutubeInput(false);
                        } else if (youtubeInput) {
                          showToast('Link YouTube không hợp lệ');
                        } else {
                          setShowYoutubeInput(false);
                        }
                      }} style={{ background: colors.red, color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>Lưu</button>
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {formData.youtubeLinks?.map((url: string, i: number) => {
                    const videoId = url.includes('v=') ? url.split('v=')[1]?.split('&')[0] : url.split('/').pop()?.split('?')[0];
                    const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : '';
                    return (
                      <div key={`yt-${i}`} style={{ position: 'relative', width: 120, height: 160, borderRadius: '12px', flexShrink: 0, backgroundImage: `url(${thumbUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                          <Play size={16} fill="currentColor" />
                        </div>
                        <button onClick={() => setFormData((prev: any) => ({...prev, youtubeLinks: prev.youtubeLinks.filter((_: any, idx: number) => idx !== i)}))} style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                  {(!formData.youtubeLinks || formData.youtubeLinks.length === 0) && (
                    <div style={{ width: 120, height: 160, borderRadius: '12px', background: 'transparent', border: `1px dashed ${colors.borderSoft}`, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: colors.muted, fontSize: '12px', textAlign: 'center', padding: '16px' }}>
                      Chưa có video
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Actions Footer */}
            <div style={{ padding: '24px', borderTop: `1px solid ${colors.borderSoft}`, display: 'flex', gap: '16px' }}>
              <button onClick={saveCast} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: colors.goldGrad, color: colors.onGold, border: 'none', height: '48px', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer'
              }}>
                {isAddingCast ? 'Thêm mới Cast' : 'Lưu hồ sơ'}
              </button>
              <button onClick={closeDrawer} style={{
                width: '80px', background: 'transparent', color: colors.text, border: `1px solid ${colors.borderSoft}`,
                height: '48px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
              }}>
                Hủy
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
