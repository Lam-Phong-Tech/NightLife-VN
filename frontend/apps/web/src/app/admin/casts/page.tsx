"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Search, ChevronRight, Plus, Check, Play, Bell, Upload, Video } from 'lucide-react';
import { apiClient, apiFormDataClient } from '@/lib/api/client';
import { useSearchParams } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/session';
import { AdminPagination, paginateAdminItems, adminPageSize } from '../components/AdminPagination';

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

const normalizeListResponse = (value: any): any[] => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  if (Array.isArray(value.data)) return value.data;
  if (Array.isArray(value.items)) return value.items;
  if (value.data && typeof value.data === 'object') {
    if (Array.isArray(value.data.data)) return value.data.data;
    if (Array.isArray(value.data.items)) return value.data.items;
  }
  return [];
};

export default function AdminCastsPage() {
  return (
    <React.Suspense fallback={<div style={{ padding: '20px', color: '#8c8679', fontSize: '13px' }}>Đang tải...</div>}>
      <AdminCastsContent />
    </React.Suspense>
  );
}

function AdminCastsContent() {
  const [activeTab, setActiveTab] = useState('all');
  const [casts, setCasts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = getAuthUser();
      setUserRole(u?.role || null);
    }
  }, []);
  
  // Drawer state
  const [selectedCast, setSelectedCast] = useState<any>(null);
  const [isAddingCast, setIsAddingCast] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<any>({
    stageName: '', storeId: '', publicHeadline: '', bio: '', birthMonth: '', zodiacSign: '',
    heightCm: '', measurements: '', languages: [], hobbies: [], tags: [], isPublic: true, status: 'ACTIVE',
    youtubeLinks: []
  });
  
  const [albums, setAlbums] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [avatarImage, setAvatarImage] = useState<any>(null);
  
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const albumUploadRef = useRef<HTMLInputElement>(null);
  const videoUploadRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAlbum, setUploadingAlbum] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  
  const [youtubeInput, setYoutubeInput] = useState('');
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [storePickerOpen, setStorePickerOpen] = useState(false);
  const [storePickerSearch, setStorePickerSearch] = useState('');
  const [statusPickerOpen, setStatusPickerOpen] = useState(false);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);

  const fetchCasts = async () => {
    try {
      const res = await apiClient<any>('/admin/casts', { params: { search: search || undefined, limit: 1000 } });
      setCasts(normalizeListResponse(res));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStores = async () => {
    try {
      // Dùng chung endpoint và cách lấy data y hệt như trang stores/page.tsx
      const res = await apiClient<any>('/admin/stores');
      const arr = normalizeListResponse(res);
      
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

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTab]);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 3000);
  };

  const getStatusLabel = (status: string, isPublic: boolean) => {
    if (status === 'DRAFT') return 'Chờ duyệt';
    if (status === 'ACTIVE' && isPublic) return 'Đang hiển thị';
    return 'Ẩn';
  };

  const searchParams = useSearchParams();
  const rawCity = searchParams.get('city') || '';
  const filterCity = rawCity === 'Hanoi' || rawCity === 'Ho Chi Minh City' || rawCity === 'all' ? rawCity : 'all';
  const filterCategory = searchParams.get('category') || '';

  const filteredCasts = casts.filter(cast => {
    const st = getStatusLabel(cast.status, cast.isPublic);
    if (activeTab === 'all') {
      // do nothing
    } else if (activeTab === 'pending') {
      if (st !== 'Chờ duyệt') return false;
    } else if (activeTab === 'visible') {
      if (st !== 'Đang hiển thị') return false;
    } else if (activeTab === 'hidden') {
      if (st !== 'Ẩn') return false;
    }

    // Lọc theo City của Quán trực thuộc
    const storeCity = cast.store?.city || '';
    const storeArea =
      storeCity === 'Ho Chi Minh City' || storeCity === 'Hồ Chí Minh' || storeCity === 'Há»“ ChÃ­ Minh'
        ? 'HCM'
        : storeCity === 'Hanoi' || storeCity === 'Hà Nội' || storeCity === 'Ha Noi'
        ? 'HN'
        : 'Tổng hợp';

    if (storeArea !== 'HN' && storeArea !== 'HCM') return false;
    if (filterCity === 'Hanoi' && storeArea !== 'HN') return false;
    if (filterCity === 'Ho Chi Minh City' && storeArea !== 'HCM') return false;

    // Lọc theo Category của Quán trực thuộc
    if (filterCategory && cast.store?.category !== filterCategory) return false;

    return true;
  });

  const paginatedCasts = paginateAdminItems(filteredCasts, currentPage);

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
    setStorePickerOpen(false);
    setStorePickerSearch('');
    setStatusPickerOpen(false);
    setMonthPickerOpen(false);
  };

  const openNewDrawer = () => {
    setFormData({
      stageName: '', storeId: '', publicHeadline: '', bio: '', birthMonth: '', zodiacSign: '',
      heightCm: '', measurements: '', languages: [], hobbies: [], tags: [], isPublic: true, status: 'ACTIVE',
      youtubeLinks: []
    });
    setAvatarImage(null);
    setAlbums([]);
    setVideos([]);
    setIsAddingCast(true);
    setSelectedCast(null);
    setStorePickerOpen(false);
    setStorePickerSearch('');
    setStatusPickerOpen(false);
    setMonthPickerOpen(false);
  };

  const openEditDrawer = (c: any) => {
    setFormData({
      stageName: c.stageName || '',
      storeId: c.storeId || '',
      publicHeadline: c.publicHeadline || '',
      bio: c.bio || c.publicBio || '',
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
    
    const mediaList = c.media || [];
    const imageList = mediaList.filter((m: any) => m.type === 'IMAGE' || (!m.type && m.url && m.url.split('?')[0].match(/\.(jpeg|jpg|gif|png|webp)$/i)));
    const videoList = mediaList.filter((m: any) => m.type === 'VIDEO' || (!m.type && m.url && m.url.split('?')[0].match(/\.(mp4|webm|ogg|mov)$/i)));
    
    setAvatarImage(imageList[0] || null);
    setAlbums(imageList.slice(1) || []);
    setVideos(videoList || []);
    setSelectedCast(c);
    setIsAddingCast(false);
    setStorePickerOpen(false);
    setStorePickerSearch('');
    setStatusPickerOpen(false);
    setMonthPickerOpen(false);
  };

  const createCastDraft = async () => {
    if (!formData.storeId) {
      showToast('Vui lòng chọn quán trực thuộc trước khi tải media');
      return null;
    }

    const targetStore = stores.find(s => s.id === formData.storeId);
    if (targetStore && (targetStore.category === 'MASSAGE_SPA' || targetStore.category === 'RESTAURANT')) {
      showToast('Không thể thêm Cast vào Massage & Spa hoặc Nhà hàng!');
      return null;
    }

    const draft = await apiClient<any>('/admin/casts', {
      method: 'POST',
      data: {
        stageName: formData.stageName?.trim() || `Draft cast ${Date.now()}`,
        storeId: formData.storeId,
        isPublic: false,
        status: 'DRAFT',
      },
    });
    setSelectedCast(draft);
    return draft.id;
  };

  const ensureCastUploadScope = async () => {
    if (selectedCast?.id) return selectedCast.id;
    return createCastDraft();
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

      const targetStore = stores.find(s => s.id === formData.storeId);
      if (targetStore && (targetStore.category === 'MASSAGE_SPA' || targetStore.category === 'RESTAURANT')) {
        showToast('Không thể thêm Cast vào Massage & Spa hoặc Nhà hàng!');
        return;
      }

      const payload = {
        ...formData,
        birthMonth: formData.birthMonth ? parseInt(formData.birthMonth, 10) : undefined,
        heightCm: formData.heightCm ? parseInt(formData.heightCm, 10) : undefined,
        mediaIds: [avatarImage?.id, ...albums.map(a => a.id), ...videos.map(v => v.id)].filter(Boolean)
      };

      if (isAddingCast && selectedCast) {
        await apiClient(`/admin/casts/${selectedCast.id}`, { method: 'PATCH', data: payload });
        showToast('Đã tạo Cast mới!');
      } else if (isAddingCast) {
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

  const handleDeleteCast = async (hard: boolean) => {
    if (!selectedCast) return;
    if (!window.confirm(hard ? 'Bạn có chắc chắn muốn xóa vĩnh viễn cast này?' : 'Bạn có chắc chắn muốn xóa (mềm) cast này?')) return;
    try {
      await apiClient(`/admin/casts/${selectedCast.id}${hard ? '?hard=true' : ''}`, { method: 'DELETE' });
      showToast(hard ? 'Đã xóa vĩnh viễn cast' : 'Đã xóa mềm cast');
      closeDrawer();
      fetchCasts();
    } catch (e: any) {
      showToast(e.message || 'Lỗi khi xóa Cast');
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
      const castId = await ensureCastUploadScope();
      if (!castId) return;
      form.append('castId', castId);
      
      const res = await apiFormDataClient<any>('/storage/upload', form);
      if (res && res.id) {
        setAvatarImage({ id: res.id, url: res.url });
        showToast('Tải ảnh đại diện thành công');
      }
    } catch (err: any) {
      showToast('Lỗi tải ảnh: ' + err.message);
    } finally {
      setUploadingImage(false);
    } 
  };

  const handleUploadAlbum = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (albums.length + files.length > 10) {
      showToast('Chỉ được tải lên tối đa 10 ảnh trong album!');
      if (albumUploadRef.current) albumUploadRef.current.value = '';
      return;
    }

    const validFiles = Array.from(files).filter(f => f.size <= 15 * 1024 * 1024);
    if (validFiles.length < files.length) {
      showToast('Một số ảnh vượt quá 15MB đã bị loại bỏ!');
    }
    if (validFiles.length === 0) {
      if (albumUploadRef.current) albumUploadRef.current.value = '';
      return;
    }

    try {
      setUploadingAlbum(true);
      
      const uploadPromises = validFiles.map(async (file) => {
        const form = new FormData();
        form.append('file', file);
        form.append('purpose', 'CAST_PHOTO');
        form.append('access', 'PUBLIC');
        const castId = await ensureCastUploadScope();
        if (!castId) return null;
        form.append('castId', castId);
        return apiFormDataClient<any>('/storage/upload', form);
      });

      const results = await Promise.all(uploadPromises);
      const newAlbums = results.filter(Boolean).filter(res => res && res.id).map(res => ({ id: res.id, url: res.url, type: 'IMAGE' }));
      
      if (newAlbums.length > 0) {
        setAlbums(prev => [...prev, ...newAlbums]);
        showToast(`Tải lên ${newAlbums.length} ảnh thành công`);
      }
    } catch (err: any) {
      showToast('Lỗi tải ảnh: ' + err.message);
    } finally {
      setUploadingAlbum(false);
      if (albumUploadRef.current) albumUploadRef.current.value = '';
    } 
  };

  const handleUploadVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setUploadingVideo(true);
      
      const uploadPromises = Array.from(files).map(async (file) => {
        const form = new FormData();
        form.append('file', file);
        form.append('purpose', 'CAST_VIDEO');
        form.append('access', 'PUBLIC');
        const castId = await ensureCastUploadScope();
        if (!castId) return null;
        form.append('castId', castId);
        return apiFormDataClient<any>('/storage/upload', form);
      });

      const results = await Promise.all(uploadPromises);
      const newVideos = results.filter(Boolean).filter(res => res && res.id).map(res => ({ id: res.id, url: res.url, type: 'VIDEO' }));
      
      if (newVideos.length > 0) {
        setVideos(prev => [...prev, ...newVideos]);
        showToast(`Tải lên ${newVideos.length} video thành công`);
      }
    } catch (err: any) {
      showToast('Lỗi tải video: ' + err.message);
    } finally {
      setUploadingVideo(false);
      if (videoUploadRef.current) videoUploadRef.current.value = '';
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
    const arr = val.split(',').map((s: string) => s.trim()).filter(Boolean);
    setFormData((prev: any) => ({ ...prev, [field]: arr }));
  };

  const handleMeasurementChange = (index: number, val: string) => {
    const parts = (formData.measurements || '').split('-').map((s: string) => s.trim());
    while (parts.length < 3) {
      parts.push('');
    }
    parts[index] = val.trim();
    if (parts.every((p: string) => !p)) {
      setFormData((prev: any) => ({ ...prev, measurements: '' }));
    } else {
      setFormData((prev: any) => ({ ...prev, measurements: parts.join(' - ') }));
    }
  };

  const isEditing = isAddingCast || selectedCast !== null;
  const currentLabel = isAddingCast ? 'Tạo mới' : (selectedCast ? getStatusLabel(selectedCast.status, selectedCast.isPublic) : '');

  const selectedStore = stores.find((store) => store.id === formData.storeId);
  const filteredStores = stores.filter((store) => {
    const isExcluded = store.category === 'MASSAGE_SPA' || store.category === 'RESTAURANT';
    const matchesSearch = !storePickerSearch || (store.name || '').toLowerCase().includes(storePickerSearch.toLowerCase());
    return matchesSearch && !isExcluded;
  });
  const statusOptions = [
    { value: 'ACTIVE', label: 'Hoạt động', description: 'Cast có thể hiển thị khi bật public', tone: colors.green },
    { value: 'DRAFT', label: 'Bản nháp / Chờ duyệt', description: 'Giữ lại để hoàn thiện hoặc kiểm duyệt', tone: colors.gold },
  ];
  const selectedStatus = statusOptions.find((option) => option.value === formData.status) || statusOptions[0];

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
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px', width: '60px' }}>STT</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>CAST</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>QUÁN TRỰC THUỘC</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>NGÔN NGỮ</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>TAGS</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>TRẠNG THÁI</th>
              <th style={{ padding: '16px 24px', width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {paginatedCasts.map((cast, idx) => {
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
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: colors.text2, fontWeight: 700 }}>
                    {(currentPage - 1) * adminPageSize + idx + 1}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ 
                        width: 40, height: 40, borderRadius: '50%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: 800,
                        overflow: 'hidden',
                        ...(!cast.media?.[0]?.url ? avatarStyle : { background: colors.surface2 })
                      }}>
                        {cast.media && cast.media[0]?.url ? (
                          <img src={cast.media[0].url} alt={cast.stageName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          (cast.stageName || 'A').charAt(0).toUpperCase()
                        )}
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
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: colors.muted }}>Không tìm thấy Cast nào.</td>
              </tr>
            )}
          </tbody>
        </table>
        {filteredCasts.length > 0 && (
          <AdminPagination
            page={currentPage}
            totalItems={filteredCasts.length}
            onPageChange={setCurrentPage}
            itemLabel="cast"
          />
        )}
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
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <input type="text" placeholder="Tên Cast (Stage Name)" value={formData.stageName} onChange={e => setFormData({...formData, stageName: e.target.value})} style={{ background: 'transparent', border: 'none', color: colors.text, fontSize: '24px', fontWeight: 700, outline: 'none', marginBottom: '8px', width: '100%' }} />
                  <div style={{ position: 'relative', width: '100%', maxWidth: '330px', marginTop: '2px' }}>
                    <button
                      type="button"
                      onClick={() => setStorePickerOpen((open) => !open)}
                      style={{
                        width: '100%',
                        minHeight: '46px',
                        borderRadius: '13px',
                        border: `1px solid ${storePickerOpen ? colors.gold : colors.borderGold22}`,
                        background: storePickerOpen ? 'rgba(212,178,106,.08)' : colors.surface1,
                        color: selectedStore ? colors.text : colors.muted,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '11px',
                        padding: '0 13px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        boxShadow: storePickerOpen ? '0 16px 34px -26px rgba(212,178,106,.8)' : 'none',
                      }}
                    >

                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: '10px', color: colors.muted, fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase', marginBottom: '2px' }}>
                          Quán trực thuộc
                        </span>
                        <span style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {selectedStore?.name || 'Chọn quán trực thuộc'}
                        </span>
                      </span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: storePickerOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>

                    {storePickerOpen ? (
                      <div style={{ position: 'absolute', zIndex: 20, top: 'calc(100% + 8px)', left: 0, right: 0, borderRadius: '14px', border: `1px solid ${colors.borderGold22}`, background: '#15151b', boxShadow: '0 26px 70px -28px rgba(0,0,0,.95)', overflow: 'hidden' }}>
                        <div style={{ padding: '10px', borderBottom: `1px solid ${colors.borderSoft}` }}>
                          <div style={{ position: 'relative' }}>
                            <Search size={15} color={colors.muted} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                              value={storePickerSearch}
                              onChange={(event) => setStorePickerSearch(event.target.value)}
                              placeholder="Tìm quán..."
                              style={{ width: '100%', height: '38px', border: `1px solid ${colors.borderSoft}`, borderRadius: '10px', background: 'rgba(255,255,255,.035)', color: colors.text, outline: 'none', padding: '0 12px 0 36px', fontSize: '13px' }}
                            />
                          </div>
                        </div>
                        <div style={{ maxHeight: '260px', overflowY: 'auto', padding: '6px' }}>
                          {filteredStores.map((store) => {
                            const isSelected = store.id === formData.storeId;
                            return (
                              <button
                                key={store.id}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, storeId: store.id });
                                  setStorePickerOpen(false);
                                  setStorePickerSearch('');
                                }}
                                style={{
                                  width: '100%',
                                  border: 0,
                                  borderRadius: '11px',
                                  background: isSelected ? 'rgba(212,178,106,.14)' : 'transparent',
                                  color: isSelected ? colors.gold : colors.text2,
                                  minHeight: '44px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  padding: '8px 10px',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                }}
                              >

                                <span style={{ flex: 1, minWidth: 0 }}>
                                  <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{store.name}</span>
                                  <span style={{ display: 'block', fontSize: '10.5px', color: colors.muted, marginTop: '1px' }}>{store.category || store.area || 'Quán trong hệ thống'}</span>
                                </span>
                                {isSelected ? <Check size={16} color={colors.gold} /> : null}
                              </button>
                            );
                          })}
                          {filteredStores.length === 0 ? (
                            <div style={{ padding: '18px 12px', color: colors.muted, textAlign: 'center', fontSize: '12.5px' }}>
                              Không tìm thấy quán phù hợp.
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* GRID INFO */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div 
                  onClick={() => {
                    setMonthPickerOpen(!monthPickerOpen);
                    setStorePickerOpen(false);
                    setStatusPickerOpen(false);
                  }}
                  style={{ 
                    padding: '16px', background: 'transparent', border: `1px solid ${colors.borderSoft}`, borderRadius: '12px', position: 'relative',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '75px'
                  }}
                >
                  <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '8px' }}>Tháng sinh</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: formData.birthMonth ? colors.text : colors.muted }}>
                    {formData.birthMonth ? `Tháng ${formData.birthMonth}` : 'Chọn tháng...'}
                  </div>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: '16px', bottom: '20px', transform: monthPickerOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>

                  {monthPickerOpen && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      style={{ 
                        position: 'absolute', zIndex: 100, top: 'calc(100% + 8px)', left: 0, right: 0, 
                        borderRadius: '12px', border: `1px solid ${colors.borderGold22}`, background: '#15151b', 
                        boxShadow: '0 10px 30px rgba(0,0,0,0.6)', overflow: 'hidden', maxHeight: '200px', overflowY: 'auto',
                        padding: '6px'
                      }}
                    >
                      {[...Array(12)].map((_, i) => {
                        const mVal = i + 1;
                        const isSelected = String(formData.birthMonth) === String(mVal);
                        return (
                          <button
                            key={mVal}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, birthMonth: mVal });
                              setMonthPickerOpen(false);
                            }}
                            style={{
                              width: '100%',
                              border: 0,
                              borderRadius: '8px',
                              background: isSelected ? 'rgba(212,178,106,.14)' : 'transparent',
                              color: isSelected ? colors.gold : colors.text2,
                              minHeight: '38px',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '8px 12px',
                              cursor: 'pointer',
                              textAlign: 'left',
                              fontSize: '13px',
                              fontWeight: isSelected ? 700 : 500,
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.color = colors.text;
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = colors.text2;
                              }
                            }}
                          >
                            Tháng {mVal}
                          </button>
                        );
                      })}
                    </div>
                  )}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {(() => {
                      const parts = (formData.measurements || '').split('-').map((s: string) => s.trim());
                      const v1 = parts[0] || '';
                      const v2 = parts[1] || '';
                      const v3 = parts[2] || '';
                      return (
                        <>
                          <input 
                            type="number" 
                            placeholder="V1" 
                            value={v1} 
                            onChange={e => handleMeasurementChange(0, e.target.value)} 
                            style={{ width: '100%', background: 'transparent', border: 'none', color: colors.text, fontSize: '15px', fontWeight: 700, outline: 'none', textAlign: 'center' }} 
                          />
                          <span style={{ color: colors.muted }}>-</span>
                          <input 
                            type="number" 
                            placeholder="V2" 
                            value={v2} 
                            onChange={e => handleMeasurementChange(1, e.target.value)} 
                            style={{ width: '100%', background: 'transparent', border: 'none', color: colors.text, fontSize: '15px', fontWeight: 700, outline: 'none', textAlign: 'center' }} 
                          />
                          <span style={{ color: colors.muted }}>-</span>
                          <input 
                            type="number" 
                            placeholder="V3" 
                            value={v3} 
                            onChange={e => handleMeasurementChange(2, e.target.value)} 
                            style={{ width: '100%', background: 'transparent', border: 'none', color: colors.text, fontSize: '15px', fontWeight: 700, outline: 'none', textAlign: 'center' }} 
                          />
                        </>
                      );
                    })()}
                  </div>
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

              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '8px' }}>Mô tả public / Introduction</div>
                <textarea
                  placeholder="Nhập mô tả hiển thị ở phần Introduction trên trang cast..."
                  value={formData.bio || ''}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  style={{ width: '100%', minHeight: '118px', background: 'transparent', border: `1px solid ${colors.borderSoft}`, borderRadius: '12px', color: colors.text, fontSize: '14px', padding: '16px', outline: 'none', resize: 'vertical', lineHeight: 1.55 }}
                />
              </div>

              <div style={{ marginBottom: '32px', display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: colors.text }}>
                  <input type="checkbox" checked={formData.isPublic} onChange={e => setFormData({...formData, isPublic: e.target.checked})} style={{ width: 16, height: 16, accentColor: colors.gold }} />
                  Cho phép hiển thị trên Web (Public)
                </label>
                <div style={{ position: 'relative', flex: 1, minWidth: '230px' }}>
                  <button
                    type="button"
                    onClick={() => setStatusPickerOpen((open) => !open)}
                    style={{
                      width: '100%',
                      minHeight: '46px',
                      borderRadius: '13px',
                      border: `1px solid ${statusPickerOpen ? colors.gold : colors.borderGold22}`,
                      background: statusPickerOpen ? 'rgba(212,178,106,.08)' : colors.surface1,
                      color: colors.text,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '11px',
                      padding: '0 13px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      boxShadow: statusPickerOpen ? '0 16px 34px -26px rgba(212,178,106,.8)' : 'none',
                    }}
                  >
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: selectedStatus?.tone || colors.gold, boxShadow: `0 0 0 4px ${(selectedStatus?.tone || colors.gold)}22`, flex: 'none' }} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: '10px', color: colors.muted, fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase', marginBottom: '2px' }}>
                        Trạng thái
                      </span>
                      <span style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {selectedStatus?.label}
                      </span>
                    </span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: statusPickerOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  {statusPickerOpen ? (
                    <div style={{ position: 'absolute', zIndex: 18, top: 'calc(100% + 8px)', left: 0, right: 0, borderRadius: '14px', border: `1px solid ${colors.borderGold22}`, background: '#15151b', boxShadow: '0 26px 70px -28px rgba(0,0,0,.95)', padding: '6px' }}>
                      {statusOptions.map((option) => {
                        const isSelected = option.value === formData.status;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, status: option.value });
                              setStatusPickerOpen(false);
                            }}
                            style={{
                              width: '100%',
                              border: 0,
                              borderRadius: '11px',
                              background: isSelected ? 'rgba(212,178,106,.14)' : 'transparent',
                              color: isSelected ? colors.gold : colors.text2,
                              minHeight: '54px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '11px',
                              padding: '9px 10px',
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                          >
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: option.tone, boxShadow: `0 0 0 4px ${option.tone}22`, flex: 'none' }} />
                            <span style={{ flex: 1, minWidth: 0 }}>
                              <span style={{ display: 'block', fontSize: '13px', fontWeight: 800 }}>{option.label}</span>
                              <span style={{ display: 'block', fontSize: '10.5px', color: colors.muted, marginTop: '2px' }}>{option.description}</span>
                            </span>
                            {isSelected ? <Check size={16} color={colors.gold} /> : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* ẢNH ĐẠI DIỆN */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ảnh đại diện (1 ảnh)</span>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {!avatarImage && (
                      <button onClick={() => imageUploadRef.current?.click()} style={{ background: 'transparent', border: 'none', color: colors.gold, fontSize: '12px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Upload size={14} /> Thêm ảnh
                      </button>
                    )}
                  </div>
                  <input type="file" ref={imageUploadRef} style={{ display: 'none' }} accept="image/*" onChange={handleUploadImage} />
                </div>
                
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {avatarImage && (
                    <div style={{ position: 'relative', width: 120, height: 160, borderRadius: '12px', flexShrink: 0, backgroundImage: `url(${avatarImage.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                      <button onClick={() => setAvatarImage(null)} style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  {uploadingImage && (
                    <div style={{ width: 120, height: 160, borderRadius: '12px', background: colors.surface2, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.muted, fontSize: '12px' }}>Đang tải...</div>
                  )}
                  {!avatarImage && !uploadingImage && (
                    <div style={{ width: 120, height: 160, borderRadius: '12px', background: 'transparent', border: `1px dashed ${colors.borderSoft}`, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: colors.muted, fontSize: '12px', textAlign: 'center', padding: '16px' }}>
                      Chưa có ảnh
                    </div>
                  )}
                </div>
              </div>

              {/* ALBUM ẢNH */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Album ảnh (Tối đa 10 ảnh, &lt; 15MB/ảnh)</span>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => albumUploadRef.current?.click()} style={{ background: 'transparent', border: 'none', color: colors.gold, fontSize: '12px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Upload size={14} /> Thêm ảnh
                    </button>
                  </div>
                  <input type="file" ref={albumUploadRef} style={{ display: 'none' }} accept="image/*" multiple onChange={handleUploadAlbum} />
                </div>
                
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {albums.map((m, i) => (
                    <div key={i} style={{ position: 'relative', width: 120, height: 160, borderRadius: '12px', flexShrink: 0, backgroundImage: `url(${m.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                      <button onClick={() => setAlbums(albums.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {uploadingAlbum && (
                    <div style={{ width: 120, height: 160, borderRadius: '12px', background: colors.surface2, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.muted, fontSize: '12px' }}>Đang tải...</div>
                  )}
                  {albums.length === 0 && !uploadingAlbum && (
                    <div style={{ width: 120, height: 160, borderRadius: '12px', background: 'transparent', border: `1px dashed ${colors.borderSoft}`, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: colors.muted, fontSize: '12px', textAlign: 'center', padding: '16px' }}>
                      Chưa có ảnh
                    </div>
                  )}
                </div>
              </div>

              {/* VIDEO TỪ MÁY */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Video từ máy (Nhiều video)</span>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => videoUploadRef.current?.click()} style={{ background: 'transparent', border: 'none', color: colors.gold, fontSize: '12px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Upload size={14} /> Thêm video
                    </button>
                  </div>
                  <input type="file" ref={videoUploadRef} style={{ display: 'none' }} accept="video/*" multiple onChange={handleUploadVideo} />
                </div>
                
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {videos.map((v, i) => (
                    <div key={i} style={{ position: 'relative', width: 120, height: 160, borderRadius: '12px', flexShrink: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <video src={v.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Play size={24} fill="rgba(255,255,255,0.7)" color="rgba(255,255,255,0.7)" />
                      </div>
                      <button onClick={() => setVideos(videos.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {uploadingVideo && (
                    <div style={{ width: 120, height: 160, borderRadius: '12px', background: colors.surface2, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.muted, fontSize: '12px' }}>Đang tải...</div>
                  )}
                  {videos.length === 0 && !uploadingVideo && (
                    <div style={{ width: 120, height: 160, borderRadius: '12px', background: 'transparent', border: `1px dashed ${colors.borderSoft}`, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: colors.muted, fontSize: '12px', textAlign: 'center', padding: '16px' }}>
                      Chưa có video
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
              
              {!isAddingCast && (
                <>
                  {['ADMIN', 'SUPER_ADMIN'].includes(userRole || '') && (
                    <button onClick={() => handleDeleteCast(false)} style={{
                      width: '100px', background: 'transparent', color: colors.gold, border: `1px solid ${colors.gold}`,
                      height: '48px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                    }}>
                      Xóa mềm
                    </button>
                  )}
                  {userRole === 'SUPER_ADMIN' && (
                    <button onClick={() => handleDeleteCast(true)} style={{
                      width: '130px', background: 'transparent', color: colors.red, border: `1px solid ${colors.red}`,
                      height: '48px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                    }}>
                      Xóa vĩnh viễn
                    </button>
                  )}
                </>
              )}

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
