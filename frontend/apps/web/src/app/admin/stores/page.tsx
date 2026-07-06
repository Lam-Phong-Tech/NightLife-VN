"use client";

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { apiClient, apiFormDataClient, resolveClientUrl } from '@/lib/api/client';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { AdminPagination, paginateAdminItems } from '../components/AdminPagination';

const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false, 
  loading: () => <div style={{ height: 190, background: 'rgba(12,12,15,.55)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c8679', fontSize: 13, border: '1px solid rgba(255,255,255,.1)' }}>Đang tải Editor...</div>
});

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
  const c = m[kind] ?? m.muted ?? ['rgba(255,255,255,.05)', 'rgba(255,255,255,.12)', '#9b958a'];
  return { background: c[0], border: `1px solid ${c[1]}`, color: c[2] };
};

const getPillStyle = (kind: string) => {
  const chip = getChipStyle(kind);
  return { ...chip, fontSize: '11px', fontWeight: 600, padding: '4px 11px', borderRadius: '20px', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '5px' };
};

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
const defaultHours = DAYS.reduce((acc, d) => ({ ...acc, [d]: { isOff: false, hours: '19:00 - 02:00' } }), {});

export default function AdminStoresPage() {
  return (
    <React.Suspense fallback={<div style={{ padding: '20px', color: '#8c8679', fontSize: '13px' }}>Đang tải...</div>}>
      <AdminStoresContent />
    </React.Suspense>
  );
}

function AdminStoresContent() {
  const [stores, setStores] = useState<any[]>([]);
  const [venueSel, setVenueSel] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filterCity = searchParams.get('city') || '';
  const filterCategory = searchParams.get('category') || '';
  
  // Form State
  const [formData, setFormData] = useState({ name: '', category: 'CLUB', city: 'Ho Chi Minh City', address: '', mapUrl: '', status: 'ACTIVE', phone: '', description: '' });
  const [hoursForm, setHoursForm] = useState<any>(defaultHours);
  const [slugStatus, setSlugStatus] = useState<string>(''); // '', 'checking', 'ok', 'error'

  // Address API States
  const [provinces, setProvinces] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selProvince, setSelProvince] = useState('');
  const [selWard, setSelWard] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [pendingAddress, setPendingAddress] = useState('');
  
  const [albums, setAlbums] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [menuGroups, setMenuGroups] = useState<any[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const imageUploadRef = useRef<HTMLInputElement>(null);
  const coverImageUploadRef = useRef<HTMLInputElement>(null);
  const videoUploadRef = useRef<HTMLInputElement>(null);
  const menuImageUploadRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverImage, setCoverImage] = useState<any>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingMenuImageId, setUploadingMenuImageId] = useState<string | null>(null);

  // UI states
  const [menuManage, setMenuManage] = useState(false);
  const [activeMenuGroupId, setActiveMenuGroupId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchStores = async () => {
    try {
      const res = await apiClient<any>('/admin/stores', { params: { limit: 1000 } });
      if (res && res.data) {
        setStores(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStores();
    fetch('https://provinces.open-api.vn/api/v2/p/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProvinces(data);
      })
      .catch(e => console.error(e));
  }, []);

  useEffect(() => {
    if (!selProvince) {
      setWards([]);
      setSelWard('');
      return;
    }
    fetch(`https://provinces.open-api.vn/api/v2/p/${selProvince}?depth=2`)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.wards)) setWards(data.wards);
        else setWards([]);
      })
      .catch(e => console.error(e));
  }, [selProvince]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterCity, filterCategory]);

  useEffect(() => {
    if (pendingAddress && wards.length > 0 && selProvince) {
      const p = provinces.find(x => x.code.toString() === selProvince);
      const w = wards.find(x => pendingAddress.includes(x.name));
      
      let street = pendingAddress;
      if (p) {
        street = street.replace(new RegExp(`,?\\s*${p.name}$`), '').trim();
      }
      
      if (w) {
        setSelWard(w.code.toString());
        street = street.replace(new RegExp(`,?\\s*${w.name}$`), '').trim();
      } else {
        setSelWard('');
      }
      
      setStreetAddress(street);
      setPendingAddress('');
    }
  }, [wards, pendingAddress, selProvince, provinces]);

  // Clear slug status when typing
  useEffect(() => {
    setSlugStatus('');
  }, [formData.name, venueSel]);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2600);
  };

  const closeDrawer = () => {
    setVenueSel(null);
  };

  const openNewDrawer = () => {
    setFormData({ name: '', category: 'CLUB', city: 'Ho Chi Minh City', address: '', mapUrl: '', status: 'ACTIVE', phone: '', description: '' });
    setHoursForm(defaultHours);
    setCoverImage(null);
    setAlbums([]);
    setVideos([]);
    const initialGroups = [
      { id: 'g1', name: 'Set menu', items: [] },
      { id: 'g2', name: 'Cocktail', items: [] }
    ];
    setMenuGroups(initialGroups);
    setMenuGroups(initialGroups);
    setActiveMenuGroupId('g1');
    setTags([]);
    setTagInput('');
    setSelProvince('');
    setSelWard('');
    setStreetAddress('');
    setPendingAddress('');
    setVenueSel('new');
  };

  const openEditDrawer = (st: any) => {
    const mapStatusToEnum = (s: string) => {
      if (s === 'Đang hoạt động' || s === 'active' || s === 'ACTIVE') return 'ACTIVE';
      if (s === 'Đang ẩn' || s === 'hidden' || s === 'SUSPENDED') return 'SUSPENDED';
      if (s === 'Nháp' || s === 'draft' || s === 'DRAFT') return 'DRAFT';
      return 'ACTIVE';
    };

    setFormData({ 
      name: st.name || '', 
      category: st.category || 'CLUB', 
      city: st.city || 'Ho Chi Minh City', 
      address: st.address || '', 
      mapUrl: st.mapUrl || '', 
      phone: st.phone || '',
      description: st.description || '',
      status: mapStatusToEnum(st.status || 'ACTIVE')
    });
    setHoursForm(st.openingHours || defaultHours);
    const cover = st.media?.find((m: any) => m.type === 'IMAGE' && m.purpose === 'store-hero');
    setCoverImage(cover || null);
    setAlbums(st.media?.filter((m: any) => m.type === 'IMAGE' && m.purpose !== 'store-hero') || []);
    setVideos(st.media?.filter((m: any) => m.type === 'VIDEO') || []);
    setTags(st.tags || []);
    
    const fullAddress = st.address || '';
    const matchedProv = provinces.find(p => fullAddress.includes(p.name));
    if (matchedProv) {
      setSelProvince(matchedProv.code.toString());
      setPendingAddress(fullAddress);
    } else {
      setSelProvince('');
      setSelWard('');
      setStreetAddress(fullAddress);
      setPendingAddress('');
    }
    
    let groups = st.pricingInfo?.groups;
    if (!groups || groups.length === 0) {
      groups = [
        { id: 'g1', name: 'Set menu', items: st.pricingInfo?.items || [] },
        { id: 'g2', name: 'Cocktail', items: [] }
      ];
    }
    setMenuGroups(groups);
    setActiveMenuGroupId(groups[0]?.id || '');
    setVenueSel(st.id);
  };

  const saveStore = async () => {
    try {
      if (!formData.name || formData.name.trim() === '') {
        showToast('Vui lòng nhập tên quán!');
        return;
      }

      const pName = provinces.find(x => x.code.toString() === selProvince)?.name || '';
      const wName = wards.find(x => x.code.toString() === selWard)?.name || '';
      const finalParts = [streetAddress, wName, pName].filter(Boolean);
      const finalAddress = finalParts.length > 0 ? finalParts.join(', ') : formData.address;

      if (!finalAddress || finalAddress.trim() === '') {
        showToast('Vui lòng nhập địa chỉ quán!');
        return;
      }

      let finalCity = formData.city;
      if (pName) {
         if (pName.includes('Hồ Chí Minh')) finalCity = 'Ho Chi Minh City';
         else if (pName.includes('Hà Nội')) finalCity = 'Hanoi';
      }

      const payload = {
        ...formData,
        address: finalAddress,
        city: finalCity,
        tags,
        openingHours: hoursForm,
        pricingInfo: { groups: menuGroups },
        mediaIds: [coverImage?.id, ...albums.map(a => a.id), ...videos.map(v => v.id)].filter(Boolean)
      };
      
      if (venueSel === 'new') {
        const generatedSlug = formData.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        setSlugStatus('checking');
        const checkRes = await apiClient<any>(`/admin/stores/check-slug?slug=${generatedSlug}`);
        console.log('CHECK RES:', checkRes);
        if (!checkRes.available) {
          setSlugStatus('error');
          showToast('Tên quán bị trùng lặp, vui lòng chọn tên khác!');
          return;
        }
        setSlugStatus('ok');

        await apiClient('/admin/stores', { method: 'POST', data: payload });
        showToast('Đã tạo quán mới!');
      } else {
        await apiClient(`/admin/stores/${venueSel}`, { method: 'PATCH', data: payload });
        showToast('Đã lưu thay đổi!');
      }
      closeDrawer();
      fetchStores();
    } catch (e: any) {
      showToast(e.message || 'Có lỗi xảy ra khi lưu');
      setSlugStatus('error_catch_' + (e.status || 'unknown'));
    }
  };

  const boxS = { background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)', borderRadius: '10px', padding: '12px 13px', fontSize: '13px', color: '#f3f0ea' };
  const inputS = { ...boxS, width: '100%', outline: 'none' };
  const optS = { background: '#1a191f', color: '#f3f0ea' };
  const seg = (a: boolean) => ({ fontSize: '12px', padding: '9px 15px', borderRadius: '9px', cursor: 'pointer', fontWeight: 600, color: a ? '#241a0a' : '#9b958a', background: a ? 'linear-gradient(135deg,#f0dda8,#d4b26a)' : 'rgba(255,255,255,.04)', border: a ? 'none' : '1px solid rgba(255,255,255,.08)' });
  const g1 = 'linear-gradient(135deg,#2a2620,#1a1814)';
  const g2 = 'linear-gradient(135deg,#241f2a,#181420)';
  const g3 = 'linear-gradient(135deg,#20262a,#141a1e)';

  const handleUploadVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingVideo(true);
      const form = new FormData();
      form.append('file', file);
      form.append('purpose', 'STORE_VIDEO');
      form.append('access', 'PUBLIC');
      if (venueSel && venueSel !== 'new') {
        form.append('storeId', venueSel);
      }
      
      const res = await apiFormDataClient<any>('/storage/upload', form);
      if (res && res.id) {
        setVideos(prev => [...prev, { id: res.id, title: file.name, meta: 'Mới tải lên', thumb: res.url }]);
        showToast('Tải video lên thành công');
      }
    } catch (err: any) {
      showToast('Lỗi tải video: ' + err.message);
    } finally {
      setUploadingVideo(false);
    } 
  };

  const handleAddYoutubeVideo = async (url: string) => {
    if (!url) return;

    // Validate trùng lặp (trích xuất Video ID để so sánh cho chính xác)
    const extractYoutubeId = (u: string) => {
      const match = u.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
      return match ? match[1] : u; // Nếu không lấy được ID, dùng nguyên url để so sánh fallback
    };
    
    const newVideoId = extractYoutubeId(url);
    const isDuplicate = videos.some(v => {
      const existingTitle = v.title || '';
      return existingTitle === url || extractYoutubeId(existingTitle) === newVideoId;
    });

    if (isDuplicate) {
      showToast('Video này đã tồn tại trong danh sách!');
      return;
    }
    try {
      setUploadingVideo(true);
      const res = await apiClient<any>('/storage/external', {
        data: {
          url,
          purpose: 'STORE_VIDEO',
          access: 'PUBLIC',
          storeId: venueSel && venueSel !== 'new' ? venueSel : undefined
        }
      });
      if (res && res.id) {
        setVideos(prev => [...prev, { id: res.id, title: url, meta: 'YouTube', thumb: url }]);
        showToast('Thêm video YouTube thành công');
      }
    } catch (err: any) {
      showToast('Lỗi thêm video: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleUploadMenuImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingMenuImageId) return;
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('purpose', 'STORE_MENU_ITEM');
      form.append('access', 'PUBLIC');
      
      const res = await apiFormDataClient<any>('/storage/upload', form);
      if (res && res.url) {
        updateMenuItem(uploadingMenuImageId, 'thumb', res.url);
        showToast('Tải ảnh món ăn thành công');
      }
    } catch (err: any) {
      showToast('Lỗi tải ảnh: ' + err.message);
    } finally {
      setUploadingMenuImageId(null);
      if (menuImageUploadRef.current) {
        menuImageUploadRef.current.value = '';
      }
    }
  };

  const handleUploadCoverImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file) return;
    
    if (file.size > 15 * 1024 * 1024) {
      showToast(`Ảnh "${file.name}" vượt quá dung lượng 15MB`);
      if (coverImageUploadRef.current) coverImageUploadRef.current.value = '';
      return;
    }

    try {
      setUploadingCover(true);
      const form = new FormData();
      form.append('file', file);
      form.append('purpose', 'store-hero');
      form.append('access', 'PUBLIC');
      if (venueSel && venueSel !== 'new') {
        form.append('storeId', venueSel);
      }
      
      const res = await apiFormDataClient<any>('/storage/upload', form);
      if (res && res.id) {
        setCoverImage(res);
      } else {
        showToast('Lỗi tải lên ảnh bìa');
      }
    } catch (err) {
      showToast('Có lỗi khi tải lên');
    } finally {
      setUploadingCover(false);
      if (coverImageUploadRef.current) coverImageUploadRef.current.value = '';
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 10) {
      showToast('Bạn chỉ được tải lên tối đa 10 ảnh cùng lúc');
      if (imageUploadRef.current) imageUploadRef.current.value = '';
      return;
    }

    try {
      setUploadingImage(true);
      const uploaded: any[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;

        if (file.size > 15 * 1024 * 1024) {
          showToast(`Ảnh "${file.name}" vượt quá dung lượng 15MB`);
          continue;
        }

        const form = new FormData();
        form.append('file', file);
        form.append('purpose', 'STORE_GALLERY');
        form.append('access', 'PUBLIC');
        if (venueSel && venueSel !== 'new') {
          form.append('storeId', venueSel);
        }
        
        const res = await apiFormDataClient<any>('/storage/upload', form);
        if (res && res.id) {
          uploaded.push({ id: res.id, url: res.url });
        }
      }
      if (uploaded.length > 0) {
        setAlbums(prev => [...prev, ...uploaded]);
        showToast(`Đã tải lên ${uploaded.length} ảnh thành công`);
      }
    } catch (err: any) {
      showToast('Lỗi tải ảnh: ' + err.message);
    } finally {
      setUploadingImage(false);
      if (imageUploadRef.current) {
        imageUploadRef.current.value = ''; // reset input so same files can be uploaded again if needed
      }
    }
  };

  const updateMenuItem = (itemId: string, field: string, value: any) => {
    setMenuGroups(prev => prev.map(g => {
      if (g.id === activeMenuGroupId) {
        return {
          ...g,
          items: g.items.map((mi: any) => mi.id === itemId ? { ...mi, [field]: value } : mi)
        };
      }
      return g;
    }));
  };

  const addMockMenu = () => {
    setMenuGroups(prev => prev.map(g => {
      if (g.id === activeMenuGroupId) {
        return {
          ...g,
          items: [...g.items, { id: 'm' + Date.now(), name: '', desc: '', tier: 3, hot: false, thumb: g1 }]
        };
      }
      return g;
    }));
  };

  const removeVideo = (id: string) => setVideos(prev => prev.filter(v => v.id !== id));
  const removeMenu = (id: string) => {
    setMenuGroups(prev => prev.map(g => {
      if (g.id === activeMenuGroupId) {
        return { ...g, items: g.items.filter((mi: any) => mi.id !== id) };
      }
      return g;
    }));
  };
  const removeAlbum = (id: string) => setAlbums(prev => prev.filter(a => a.id !== id));

  const updateForm = (key: string, val: string) => setFormData(p => ({ ...p, [key]: val }));
  const updateHour = (day: string, key: string, val: any) => setHoursForm((p: any) => ({ ...p, [day]: { ...p[day], [key]: val } }));

  const getYoutubeThumb = (url: string) => {
    if (!url) return '';
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : url;
  };

  const filteredStores = stores.filter((v: any) => {
    if (filterCity === 'Hanoi' && v.area !== 'HN') return false;
    if (filterCity === 'Ho Chi Minh City' && v.area !== 'HCM') return false;
    if (!filterCity && (v.area === 'HN' || v.area === 'HCM')) return false;
    
    if (filterCategory && v.category !== filterCategory) return false;
    if (search && !v.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const paginatedStores = paginateAdminItems(filteredStores, currentPage);

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
        <select
          value={filterCategory}
          onChange={(e) => {
            const params = new URLSearchParams(searchParams.toString());
            if (e.target.value) params.set('category', e.target.value);
            else params.delete('category');
            router.push(`${pathname}?${params.toString()}`);
          }}
          style={{ appearance: 'none', display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: '#c5c0b6', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '10px', padding: '9px 13px', cursor: 'pointer', outline: 'none' }}
        >
          <option value="" style={{ background: '#1a191f' }}>Tất cả loại hình</option>
          <option value="CLUB" style={{ background: '#1a191f' }}>Club</option>
          <option value="LOUNGE" style={{ background: '#1a191f' }}>Lounge</option>
          <option value="BAR" style={{ background: '#1a191f' }}>Bar</option>
          <option value="GIRLS_BAR" style={{ background: '#1a191f' }}>Girls Bar</option>
          <option value="KARAOKE" style={{ background: '#1a191f' }}>Karaoke</option>
          <option value="MASSAGE_SPA" style={{ background: '#1a191f' }}>Massage & Spa</option>
        </select>

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
        
        {paginatedStores.map((v: any) => {
          const stMeta = getStatusMeta(v.status);
          const stStyle = getPillStyle(stMeta.style);
          const cityStyle = getChipStyle(v.area === 'HN' ? 'info' : (v.area === 'HCM' ? 'pink' : 'gold'));
          
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
        {filteredStores.length === 0 && (
          <div style={{ padding: '30px', textAlign: 'center', color: '#8c8679', fontSize: '13px' }}>Không tìm thấy quán nào.</div>
        )}
        {filteredStores.length > 0 && (
          <AdminPagination
            page={currentPage}
            totalItems={filteredStores.length}
            onPageChange={setCurrentPage}
            itemLabel="quán"
          />
        )}
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
                    {slugStatus === 'error_api' && <div style={{ fontSize: '10.5px', color: '#e88b99' }}>Lỗi API trả về false</div>}
                    {slugStatus.startsWith('error_catch') && <div style={{ fontSize: '10.5px', color: '#e88b99' }}>Lỗi Catch: {slugStatus.replace('error_catch_', '')}</div>}
                    {slugStatus === 'error' && <div style={{ fontSize: '10.5px', color: '#e88b99' }}>Tên trùng lặp</div>}
                  </div>
                  <input style={{ ...inputS, borderColor: slugStatus.startsWith('error') ? 'rgba(232,139,153,.4)' : inputS.border }} placeholder="Nhập tên quán…" value={formData.name} onChange={e => updateForm('name', e.target.value)} />
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
                    <div style={{ fontSize: '11.5px', color: '#8c8679', marginBottom: '6px' }}>Tỉnh/Thành phố</div>
                    <select style={{ ...inputS, appearance: 'none', cursor: 'pointer' }} value={selProvince} onChange={e => { setSelProvince(e.target.value); updateForm('city', e.target.value === '79' ? 'Ho Chi Minh City' : e.target.value === '1' ? 'Hanoi' : formData.city); }}>
                      <option value="" style={optS}>-- Chọn Tỉnh/Thành --</option>
                      {provinces.map(p => <option key={p.code} value={p.code.toString()} style={optS}>{p.name}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                  <div>
                    <div style={{ fontSize: '11.5px', color: '#8c8679', marginBottom: '6px' }}>Phường/Xã</div>
                    <select style={{ ...inputS, appearance: 'none', cursor: 'pointer' }} value={selWard} onChange={e => setSelWard(e.target.value)} disabled={!selProvince}>
                      <option value="" style={optS}>-- Chọn Phường/Xã --</option>
                      {wards.map(w => <option key={w.code} value={w.code.toString()} style={optS}>{w.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: '11.5px', color: '#8c8679', marginBottom: '6px' }}>Số nhà, Tên đường</div>
                    <input style={inputS} placeholder="Ví dụ: 123 Lê Lợi..." value={streetAddress} onChange={e => setStreetAddress(e.target.value)} />
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '11.5px', color: '#8c8679', marginBottom: '6px' }}>Số điện thoại (Tuỳ chọn)</div>
                  <input style={inputS} placeholder="Nhập số điện thoại…" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} />
                </div>
                
                <div>
                  <div style={{ fontSize: '11.5px', color: '#8c8679', marginBottom: '6px' }}>Mô tả quán</div>
                  <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,.09)' }}>
                    <ReactQuill 
                      theme="snow" 
                      value={formData.description} 
                      onChange={(val: any) => updateForm('description', val)}
                      style={{ background: 'rgba(255,255,255,.02)', color: '#f3f0ea' }}
                    />
                  </div>
                  <style dangerouslySetInnerHTML={{__html: `
                    .ql-toolbar { background: rgba(255,255,255,.03); border: none !important; border-bottom: 1px solid rgba(255,255,255,.08) !important; }
                    .ql-container { border: none !important; font-size: 13.5px; font-family: inherit; }
                    .ql-editor { min-height: 120px; }
                    .ql-stroke { stroke: #c5c0b6 !important; }
                    .ql-fill { fill: #c5c0b6 !important; }
                  `}} />
                </div>

                <div>
                  <div style={{ fontSize: '11.5px', color: '#8c8679', marginBottom: '6px' }}>Tags / Thẻ nổi bật</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    {['Club', 'Phòng VIP', 'Hỗ trợ tiếng Nhật', 'DJ hàng đầu', 'Nhạc hay', 'Không gian đẹp', 'Cocktail', 'Rooftop', 'Sang trọng', 'Sôi động'].map(t => (
                      <span 
                        key={t}
                        onClick={() => {
                          if (!tags.includes(t)) setTags([...tags, t]);
                        }}
                        style={{ fontSize: '10.5px', padding: '4px 10px', borderRadius: '14px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#c5c0b6', cursor: 'pointer', transition: '0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.05)'}
                      >
                        + {t}
                      </span>
                    ))}
                  </div>
                  <div style={{ ...boxS, display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px' }}>
                    {tags.map(t => (
                      <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(212,178,106,.15)', border: '1px solid rgba(212,178,106,.3)', color: '#f4e3b4', padding: '4px 8px', borderRadius: '6px', fontSize: '11.5px' }}>
                        {t}
                        <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => setTags(tags.filter(tg => tg !== t))}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </span>
                      </div>
                    ))}
                    <input 
                      style={{ background: 'none', border: 'none', outline: 'none', color: '#f3f0ea', fontSize: '12px', minWidth: '120px', flex: 1 }} 
                      placeholder="Gõ tag và nhấn Enter..." 
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && tagInput.trim()) {
                          if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
                          setTagInput('');
                        }
                      }}
                    />
                  </div>
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
                  
                  const offBtn = isOff ? { fontSize: '10.5px', fontWeight: 700, color: '#e08a7e', background: 'rgba(224,138,126,.1)', border: '1px solid rgba(224,138,126,.25)', borderRadius: '6px', padding: '3px 9px', cursor: 'pointer' } : { fontSize: '10.5px', fontWeight: 700, color: '#7fd3a2', background: 'rgba(127,211,162,.1)', border: '1px solid rgba(127,211,162,.25)', borderRadius: '6px', padding: '3px 9px', cursor: 'pointer' };
                  
                  const slots = state.hours ? state.hours.split(',').map((s: string) => s.trim()) : [];
                  if (slots.length === 0) slots.push(''); // Always at least one slot input if open

                  const setSlotVal = (idx: number, val: string) => {
                    const newSlots = [...slots];
                    newSlots[idx] = val;
                    updateHour(day, 'hours', newSlots.join(', '));
                  };
                  const addSlot = () => {
                    updateHour(day, 'hours', [...slots, ''].join(', '));
                  };
                  const removeSlot = (idx: number) => {
                    const newSlots = slots.filter((_: any, i: number) => i !== idx);
                    updateHour(day, 'hours', newSlots.join(', '));
                  };

                  return (
                    <div key={day} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: bg, border: '1px solid rgba(255,255,255,.07)', borderRadius: '11px', padding: '8px 13px' }}>
                      <span style={{ width: '50px', flex: 'none', fontSize: '12px', fontWeight: 600, color: dayColor, lineHeight: '28px' }}>{day}</span>
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                        {!isOff && slots.map((sl: string, idx: number) => {
                          const match = sl.match(/^(\d{1,2})(?::(\d{2}))?\s*[^0-9:]+\s*(\d{1,2})(?::(\d{2}))?/);
                          let overnight = false;
                          if (match) {
                            const open = Number(match[1]) * 60 + Number(match[2] || 0);
                            const close = Number(match[3]) * 60 + Number(match[4] || 0);
                            if (close <= open) overnight = true;
                          }
                          return (
                            <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(12,12,15,.45)', border: '1px solid rgba(212,178,106,.2)', borderRadius: '8px', padding: '3px 4px 3px 10px' }}>
                              <input value={sl} onChange={e => setSlotVal(idx, e.target.value)} placeholder="08:00 – 12:00" style={{ width: '96px', background: 'none', border: 'none', outline: 'none', color: '#f0dda8', fontSize: '12.5px', fontWeight: 600, fontFamily: 'inherit', letterSpacing: '.3px' }} />
                              {overnight && <span title="Khung qua đêm — kết thúc vào sáng hôm sau" style={{ flex: 'none', fontSize: '8.5px', fontWeight: 800, letterSpacing: '.5px', color: '#8fb6e4', background: 'rgba(143,182,228,.12)', border: '1px solid rgba(143,182,228,.3)', borderRadius: '5px', padding: '2.5px 5px', lineHeight: 1, cursor: 'help', marginRight: '2px' }}>+1</span>}
                              <span onClick={() => removeSlot(idx)} title="Xóa khung giờ" style={{ width: '19px', height: '19px', flex: 'none', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6e6a60', cursor: 'pointer' }} onMouseEnter={e => { e.currentTarget.style.color = '#e08a7e'; e.currentTarget.style.background = 'rgba(224,122,110,.13)'; }} onMouseLeave={e => { e.currentTarget.style.color = '#6e6a60'; e.currentTarget.style.background = 'transparent'; }}><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></span>
                            </span>
                          );
                        })}
                        {!isOff && (
                          <span onClick={addSlot} title="Thêm khung giờ trong ngày" style={{ display: 'flex', alignItems: 'center', gap: '5px', border: '1.5px dashed rgba(212,178,106,.32)', borderRadius: '8px', padding: '5px 10px', fontSize: '10.5px', fontWeight: 700, color: '#8c8679', cursor: 'pointer', whiteSpace: 'nowrap' }} onMouseEnter={e => { e.currentTarget.style.color = '#caa765'; e.currentTarget.style.borderColor = 'rgba(212,178,106,.55)'; }} onMouseLeave={e => { e.currentTarget.style.color = '#8c8679'; e.currentTarget.style.borderColor = 'rgba(212,178,106,.32)'; }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>Khung giờ</span>
                        )}
                        {isOff && (
                          <span style={{ fontSize: '12px', fontStyle: 'italic', color: '#57534b', lineHeight: '28px' }}>Nghỉ cả ngày</span>
                        )}
                      </div>
                      <span onClick={() => updateHour(day, 'isOff', !isOff)} style={offBtn as any}>{isOff ? 'Nghỉ' : 'Mở'}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '10px', fontSize: '10.5px', color: '#8c8679', lineHeight: 1.5 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ flex: 'none', marginTop: '1px' }}><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M12 11v5"/></svg>
                <span>Một ngày có thể có nhiều khung giờ. Khung có giờ kết thúc nhỏ hơn giờ bắt đầu (VD 20:00 – 02:00) tự nhận là qua đêm, gắn nhãn <b style={{ color: '#8fb6e4' }}>+1</b> — kết thúc vào sáng hôm sau. Bấm <b style={{ color: '#caa765' }}>+ Khung giờ</b> để thêm ca, ✕ để xóa, nút bên phải chuyển <b style={{ color: '#7fd3a2' }}>Mở</b> / <b style={{ color: '#e08a7e' }}>Nghỉ</b>.</span>
              </div>

              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', color: '#caa765', textTransform: 'uppercase', margin: '24px 0 12px' }}>Ảnh bìa (Tối đa 15MB)</div>
              <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '11px', background: coverImage?.url ? (coverImage.url.startsWith('linear-gradient') ? coverImage.url : `url(${resolveClientUrl(coverImage.url)}) center/cover no-repeat`) : 'rgba(255,255,255,.03)', border: '1.5px dashed rgba(212,178,106,.35)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px', color: '#8c8679', cursor: 'pointer', opacity: uploadingCover ? 0.5 : 1, overflow: 'hidden' }} onClick={() => coverImageUploadRef.current?.click()}>
                {!coverImage?.url && (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                    <span style={{ fontSize: '11px' }}>{uploadingCover ? 'Đang tải...' : 'Tải lên ảnh bìa'}</span>
                  </>
                )}
                {coverImage?.url && (
                  <span onClick={(e) => { e.stopPropagation(); setCoverImage(null); }} style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 6, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', zIndex: 10 }} title="Xóa ảnh bìa">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </span>
                )}
                <input type="file" accept="image/*" hidden ref={coverImageUploadRef} onChange={handleUploadCoverImage} />
              </div>

              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', color: '#caa765', textTransform: 'uppercase', margin: '24px 0 12px' }}>Album ảnh</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
                {albums.map((al: any) => (
                  <div key={al.id} style={{ position: 'relative', aspectRatio: 1, borderRadius: '11px', background: al.url ? (al.url.startsWith('linear-gradient') ? al.url : `url(${resolveClientUrl(al.url)}) center/cover no-repeat`) : g1 }}>
                    <span onClick={() => removeAlbum(al.id)} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 6, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }} title="Xóa ảnh">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </span>
                  </div>
                ))}
                <div onClick={() => imageUploadRef.current?.click()} style={{ aspectRatio: 1, borderRadius: '11px', border: '1.5px dashed rgba(212,178,106,.35)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px', color: '#8c8679', cursor: 'pointer', opacity: uploadingImage ? 0.5 : 1 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                  <span style={{ fontSize: '9.5px' }}>{uploadingImage ? 'Đang tải...' : 'Tải lên'}</span>
                  <input type="file" accept="image/*" multiple hidden ref={imageUploadRef} onChange={handleUploadImage} />
                </div>
              </div>

              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', color: '#caa765', textTransform: 'uppercase', margin: '24px 0 12px' }}>Video quán</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {videos.map((vd: any) => {
                  const videoUrl = vd.thumb || vd.url;
                  const isYoutube = videoUrl?.includes('youtube.com') || videoUrl?.includes('youtu.be');
                  const metaText = vd.meta || (isYoutube ? 'YouTube' : 'Tải lên');
                  return (
                  <div key={vd.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '12px', padding: '9px 12px 9px 9px' }}>
                    <div style={{ width: 74, height: 44, flex: 'none', borderRadius: 8, background: videoUrl ? (videoUrl.startsWith('linear-gradient') ? videoUrl : `url(${resolveClientUrl(getYoutubeThumb(videoUrl))}) center/cover no-repeat`) : g2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="#f3f0ea"><path d="M8 5v14l11-7z"/></svg>
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#e8e4db', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{vd.title || vd.url}</div>
                      <div style={{ fontSize: '10.5px', color: '#8c8679', marginTop: '2px' }}>{metaText}</div>
                    </div>
                    <span onClick={() => removeVideo(vd.id)} style={{ width: 30, height: 30, flex: 'none', borderRadius: 9, background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9b958a', cursor: 'pointer' }} title="Xóa video">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                    </span>
                  </div>
                  );
                })}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', border: '1.5px dashed rgba(212,178,106,.35)', borderRadius: '12px', padding: '0 12px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e06c75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#e06c75"/></svg>
                    <input 
                      placeholder={uploadingVideo ? "Đang xử lý..." : "Dán link YouTube vào đây và nhấn Enter..."} 
                      disabled={uploadingVideo}
                      style={{ background: 'transparent', border: 'none', color: '#f3f0ea', fontSize: '11.5px', outline: 'none', width: '100%', padding: '12px 0' }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = e.currentTarget.value.trim();
                          if (val) {
                             handleAddYoutubeVideo(val);
                             e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                  </div>
                  <div onClick={() => videoUploadRef.current?.click()} style={{ width: '44px', flex: 'none', border: '1.5px dashed rgba(212,178,106,.35)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c8679', cursor: 'pointer', opacity: uploadingVideo ? 0.5 : 1 }} title="Tải video từ máy">
                     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                     <input type="file" accept="video/*" hidden ref={videoUploadRef} onChange={handleUploadVideo} />
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', color: '#caa765', textTransform: 'uppercase', margin: '24px 0 12px' }}>Thực đơn & mức giá</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '11px' }}>
                {menuGroups.map(g => (
                  <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {menuManage ? (
                      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,.05)', borderRadius: '9px', padding: '2px 2px 2px 8px' }}>
                        <input 
                          value={g.name} 
                          onChange={(e) => {
                            setMenuGroups(prev => prev.map(pg => pg.id === g.id ? { ...pg, name: e.target.value } : pg));
                          }}
                          style={{ background: 'transparent', border: 'none', color: '#f3f0ea', fontSize: '12px', outline: 'none', width: '80px' }}
                        />
                        <span onClick={() => {
                          const newGroups = menuGroups.filter(pg => pg.id !== g.id);
                          setMenuGroups(newGroups);
                          if (activeMenuGroupId === g.id && newGroups.length > 0) setActiveMenuGroupId(newGroups[0].id);
                        }} style={{ width: 24, height: 24, borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#e88b99', background: 'rgba(232,139,153,.15)', marginLeft: '4px' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </span>
                      </div>
                    ) : (
                      <span onClick={() => setActiveMenuGroupId(g.id)} style={{ padding: '6px 12px', borderRadius: '9px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', color: activeMenuGroupId === g.id ? '#241a0a' : '#c5c0b6', background: activeMenuGroupId === g.id ? 'linear-gradient(135deg,#f0dda8,#d4b26a)' : 'rgba(255,255,255,.05)' }}>
                        {g.name}
                      </span>
                    )}
                  </div>
                ))}
                
                <span onClick={() => {
                  const newId = 'g' + Date.now();
                  setMenuGroups(prev => [...prev, { id: newId, name: 'Nhóm mới', items: [] }]);
                  setActiveMenuGroupId(newId);
                  setMenuManage(true);
                }} style={{ fontSize: '11.5px', fontWeight: 600, color: '#8c8679', border: '1.5px dashed rgba(212,178,106,.35)', padding: '6px 12px', borderRadius: '9px', cursor: 'pointer' }}>+ Nhóm</span>
                
                <span style={{ flex: 1 }}></span>
                <span onClick={() => setMenuManage(!menuManage)} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 600, color: menuManage ? '#d4b26a' : '#8c8679', cursor: 'pointer' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>{menuManage ? 'Hoàn tất' : 'Sửa nhóm'}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {menuGroups.find(g => g.id === activeMenuGroupId)?.items.map((mi: any) => (
                  <div key={mi.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '12px', padding: '9px 12px 9px 9px' }}>
                    <div onClick={() => { setUploadingMenuImageId(mi.id); menuImageUploadRef.current?.click(); }} style={{ width: 46, height: 46, flex: 'none', borderRadius: 9, background: mi.thumb ? (mi.thumb.startsWith('linear-gradient') ? mi.thumb : `url(${resolveClientUrl(mi.thumb)}) center/cover no-repeat`) : g1, cursor: 'pointer', position: 'relative', overflow: 'hidden' }} title="Đổi ảnh món ăn">
                      {uploadingMenuImageId === mi.id && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg></div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <input value={mi.name} onChange={e => updateMenuItem(mi.id, 'name', e.target.value)} style={{ background: 'transparent', border: 'none', color: '#e8e4db', fontSize: '12.5px', fontWeight: 600, outline: 'none', width: '100%' }} placeholder="Tên món" />
                        <span onClick={() => updateMenuItem(mi.id, 'hot', !mi.hot)} style={{ flex: 'none', fontSize: '8.5px', fontWeight: 800, letterSpacing: '.8px', color: mi.hot ? '#241a0a' : '#8c8679', background: mi.hot ? 'linear-gradient(135deg,#f0dda8,#d4b26a)' : 'rgba(255,255,255,.1)', padding: '2.5px 7px', borderRadius: '5px', cursor: 'pointer' }}>HOT</span>
                      </div>
                      <input value={mi.desc} onChange={e => updateMenuItem(mi.id, 'desc', e.target.value)} style={{ background: 'transparent', border: 'none', color: '#8c8679', fontSize: '10.5px', marginTop: '2px', outline: 'none', width: '100%' }} placeholder="Mô tả" />
                    </div>
                    <div style={{ display: 'flex', flex: 'none', gap: '3px', background: 'rgba(12,12,15,.4)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '9px', padding: '3px' }}>
                      <span onClick={() => updateMenuItem(mi.id, 'tier', 2)} style={{ padding: '4px 7px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 700, cursor: 'pointer', color: mi.tier === 2 ? '#d4b26a' : '#57534b', background: mi.tier === 2 ? 'rgba(212,178,106,.15)' : 'transparent' }}>$$</span>
                      <span onClick={() => updateMenuItem(mi.id, 'tier', 3)} style={{ padding: '4px 7px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 700, cursor: 'pointer', color: mi.tier === 3 ? '#d4b26a' : '#57534b', background: mi.tier === 3 ? 'rgba(212,178,106,.15)' : 'transparent' }}>$$$</span>
                      <span onClick={() => updateMenuItem(mi.id, 'tier', 4)} style={{ padding: '4px 7px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 700, cursor: 'pointer', color: mi.tier === 4 ? '#d4b26a' : '#57534b', background: mi.tier === 4 ? 'rgba(212,178,106,.15)' : 'transparent' }}>$$$$</span>
                    </div>
                    <span onClick={() => removeMenu(mi.id)} style={{ width: 30, height: 30, flex: 'none', borderRadius: 9, background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9b958a', cursor: 'pointer' }} title="Xóa món">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                    </span>
                  </div>
                ))}
                {menuGroups.length > 0 && (
                  <div onClick={addMockMenu} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', border: '1.5px dashed rgba(212,178,106,.35)', borderRadius: '12px', padding: '12px', color: '#8c8679', cursor: 'pointer', fontSize: '11.5px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>Thêm món vào nhóm này
                  </div>
                )}
                <input type="file" accept="image/*" hidden ref={menuImageUploadRef} onChange={handleUploadMenuImage} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '10px', fontSize: '10.5px', color: '#8c8679', lineHeight: 1.5 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ flex: 'none', marginTop: '1px' }}><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M12 11v5"/></svg>
                <span>Không hiển thị giá tiền trực tiếp — chỉ hiển thị mức chi phí: <b style={{ color: '#caa765' }}>$$</b> rẻ · <b style={{ color: '#caa765' }}>$$$</b> vừa · <b style={{ color: '#caa765' }}>$$$$</b> cao.</span>
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
