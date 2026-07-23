"use client";

import React, { useState, useEffect, useRef } from 'react';
import { apiClient, apiFormDataClient, resolveClientUrl } from '@/lib/api/client';
import { normalizeSearchText } from '@/lib/search-relevance';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { AdminPagination, paginateAdminItems, adminPageSize } from '../components/AdminPagination';
import { useSystemFeedback } from '@/components/ui/SystemFeedback';
import { DataSkeleton } from '@/components/ui/DataLoading';
import {
  getTourCoverImageValidationError,
  TOUR_COVER_IMAGE_ACCEPT,
} from '@/lib/media/image-upload-validation';
import {
  collectTourDepartureTimes,
  createDefaultTourDepartureSchedule,
  defaultTourDepartureSlot,
  getTourDepartureScheduleErrors,
  normalizeTourDepartureSchedule,
  splitTourDepartureSlot,
  tourWeekdayKeys,
  tourWeekdayLabels,
  validateTourDepartureSchedule,
  type TourDepartureSchedule,
  type TourWeekdayKey,
} from '@/lib/tour-departure-schedule';

const getStatusMeta = (status: string) => {
  if (status === 'ACTIVE' || status === 'active') return { label: 'Hoạt động', style: 'success' };
  if (status === 'HIDDEN' || status === 'hidden') return { label: 'Đang ẩn', style: 'muted' };
  if (status === 'DELETED') return { label: 'Đã xóa', style: 'error' };
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

const ALL_TIME_SLOTS = Array.from(
  { length: 24 },
  (_, hour) => `${String(hour).padStart(2, '0')}:00`,
);
const TOUR_TIME_OPTIONS = [...ALL_TIME_SLOTS, '24:00'];

function TourTimeSelect({
  value,
  onChange,
  placeholder,
  hasError,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  hasError?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const color = hasError ? '#e88b99' : '#f0dda8';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => setIsOpen((current) => !current)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: value ? color : '#8c8679', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', minWidth: '82px', padding: '4px 6px' }}
      >
        <span>{value || placeholder}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '6px', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>
      {isOpen && (
        <div className="nl-custom-scrollbar" style={{ position: 'absolute', top: '100%', left: 0, marginTop: '6px', width: '90px', maxHeight: '190px', overflowY: 'auto', background: '#1c1c24', border: '1px solid rgba(255,255,255,.08)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,.5)', zIndex: 110, display: 'flex', flexDirection: 'column', padding: '4px' }}>
          {TOUR_TIME_OPTIONS.map((time) => (
            <div
              key={time}
              onClick={() => {
                onChange(time);
                setIsOpen(false);
              }}
              style={{ padding: '7px 10px', fontSize: '12px', color: value === time ? '#f0dda8' : '#f3f0ea', background: value === time ? 'rgba(212,178,106,.15)' : 'transparent', borderRadius: '5px', cursor: 'pointer' }}
              onMouseEnter={(event) => event.currentTarget.style.background = value === time ? 'rgba(212,178,106,.2)' : 'rgba(255,255,255,.05)'}
              onMouseLeave={(event) => event.currentTarget.style.background = value === time ? 'rgba(212,178,106,.15)' : 'transparent'}
            >
              {time}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type AdminTourForm = {
  title: string;
  subtitle: string;
  city: string;
  durationHours: number;
  priceTier: number;
  coverUrl: string;
  status: string;
  departureSchedule: TourDepartureSchedule;
  stops: {
    storeId: string;
    order: number;
    store?: { name: string; category: string; district: string };
  }[];
};

const tourTableColumns = '52px minmax(0, 2.2fr) minmax(82px, 1fr) minmax(88px, 1fr) minmax(72px, 1fr) 120px 40px';

const isSameCity = (c1: string, c2: string) => {
  const norm = (c: string) => {
    if (!c) return '';
    const clean = c.toLowerCase().trim();
    if (clean === 'hanoi' || clean === 'hn' || clean === 'hà nội') return 'hn';
    if (clean === 'ho chi minh city' || clean === 'hcm' || clean === 'hồ chí minh' || clean === 'tp.hcm' || clean === 'tp. hồ chí minh') return 'hcm';
    return clean;
  };
  return norm(c1) === norm(c2);
};

const isValidImageUrl = (url: string): boolean => {
  if (!url) return true;
  const trimmed = url.trim();
  if (/^data:/i.test(trimmed)) {
    return /^data:image\/(?:jpeg|png|webp|gif);base64,/i.test(trimmed);
  }

  try {
    const isRelativeUrl = trimmed.startsWith('/');
    const parsed = new URL(trimmed, 'https://nightlife.local');
    if (!isRelativeUrl && !['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'youtu.be' ||
      hostname === 'youtube.com' ||
      hostname.endsWith('.youtube.com') ||
      hostname === 'vimeo.com' ||
      hostname.endsWith('.vimeo.com')
    ) {
      return false;
    }

    return !/\.(?:mp4|webm|mov|avi|mkv|m4v|ogv)$/i.test(parsed.pathname);
  } catch {
    return false;
  }
};

export default function AdminToursPage() {
  return (
    <React.Suspense fallback={<DataSkeleton variant="list" count={6} style={{ padding: '20px' }} />}>
      <AdminToursContent />
    </React.Suspense>
  );
}

function AdminToursContent() {
  const feedback = useSystemFeedback();
  const [tours, setTours] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [tourSel, setTourSel] = useState<string | null>(null); // 'new' or Tour UUID
  const [toast, setToast] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filterCity = searchParams.get('city') || 'all';
  const [currentPage, setCurrentPage] = useState(1);

  // Form State
  const [formData, setFormData] = useState<AdminTourForm>({
    title: '',
    subtitle: '',
    city: 'Hanoi', // 'Hanoi' or 'Ho Chi Minh City'
    durationHours: 4,
    priceTier: 3,
    coverUrl: '',
    status: 'ACTIVE', // 'ACTIVE' or 'HIDDEN'
    departureSchedule: createDefaultTourDepartureSchedule(),
    stops: [] as { storeId: string; order: number; store?: { name: string; category: string; district: string } }[]
  });

  const [venueSearch, setVenueSearch] = useState('');
  const [venueSearchResults, setVenueSearchResults] = useState<any[]>([]);
  const [isSearchingVenues, setIsSearchingVenues] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2600);
  };

  const fetchTours = async () => {
    try {
      const res = await apiClient<any>('/admin/tours', { params: { limit: 1000 } });
      if (res && res.data) {
        setTours(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await apiClient<any>('/admin/stores', { params: { limit: 1000 } });
      if (res && res.data) {
        // Lọc bỏ Spa/Massage theo yêu cầu
        const filtered = res.data.filter((s: any) => s.category !== 'MASSAGE_SPA' && s.status === 'ACTIVE');
        setStores(filtered);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTours();
    fetchStores();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterCity]);

  useEffect(() => {
    const query = venueSearch.trim();
    if (!query) {
      setVenueSearchResults([]);
      setIsSearchingVenues(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        setIsSearchingVenues(true);
        const res = await apiClient<any>('/admin/stores', {
          params: { search: query, searchField: 'name', limit: 20 },
        });
        if (cancelled) return;
        const data = Array.isArray(res?.data) ? res.data : [];
        setVenueSearchResults(
          data.filter((s: any) => s.category !== 'MASSAGE_SPA' && s.status === 'ACTIVE'),
        );
      } catch (e) {
        if (!cancelled) setVenueSearchResults([]);
      } finally {
        if (!cancelled) setIsSearchingVenues(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [venueSearch]);

  const closeDrawer = () => {
    setTourSel(null);
    setVenueSearch('');
  };

  const openNewDrawer = () => {
    setFormData({
      title: '',
      subtitle: '',
      city: filterCity === 'Ho Chi Minh City' ? 'Ho Chi Minh City' : 'Hanoi',
      durationHours: 4,
      priceTier: 3,
      coverUrl: '',
      status: 'ACTIVE',
      departureSchedule: createDefaultTourDepartureSchedule(),
      stops: []
    });
    setTourSel('new');
  };

  const openEditDrawer = async (tourId: string) => {
    try {
      const tour = await apiClient<any>(`/admin/tours/${tourId}`);
      if (tour) {
        setFormData({
          title: tour.title || '',
          subtitle: tour.subtitle || '',
          city: tour.city || 'Hanoi',
          durationHours: tour.durationHours || 4,
          priceTier: tour.priceTier || 3,
          coverUrl: tour.coverUrl || '',
          status: tour.status || 'ACTIVE',
          departureSchedule: normalizeTourDepartureSchedule(
            tour.departureSchedule,
            tour.departureTimes,
          ),
          stops: (tour.stops || []).map((stop: any) => ({
            storeId: stop.storeId,
            order: stop.order,
            store: stop.store ? {
              name: stop.store.name,
              category: stop.store.category,
              district: stop.store.district
            } : undefined
          }))
        });
        setTourSel(tourId);
      }
    } catch (e: any) {
      showToast('Không tải được thông tin Tour: ' + e.message);
    }
  };

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = getTourCoverImageValidationError(file);
    if (validationError) {
      showToast(validationError);
      e.target.value = '';
      return;
    }

    try {
      setUploadingCover(true);
      const form = new FormData();
      form.append('file', file);
      form.append('purpose', 'TOUR_COVER');
      form.append('access', 'PUBLIC');
      const res = await apiFormDataClient<{ url: string }>('/storage/upload', form);
      if (res && res.url) {
        setFormData(prev => ({ ...prev, coverUrl: res.url }));
        showToast('Tải ảnh bìa thành công');
      }
    } catch (err: unknown) {
      showToast(
        err instanceof Error
          ? err.message
          : 'Không thể tải ảnh bìa. Vui lòng thử lại.',
      );
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  };

  const updateDepartureDay = (
    day: TourWeekdayKey,
    updater: (current: TourDepartureSchedule[TourWeekdayKey]) => TourDepartureSchedule[TourWeekdayKey],
  ) => {
    setFormData((current) => ({
      ...current,
      departureSchedule: {
        ...current.departureSchedule,
        [day]: updater(current.departureSchedule[day]),
      },
    }));
  };

  const toggleDepartureDay = (day: TourWeekdayKey) => {
    updateDepartureDay(day, (current) => ({
      isOff: !current.isOff,
      hours: current.isOff && !current.hours ? defaultTourDepartureSlot : current.hours,
    }));
  };

  const addStop = (store: any) => {
    const nextStops = [...formData.stops];
    const order = nextStops.length + 1;
    nextStops.push({
      storeId: store.id,
      order,
      store: {
        name: store.name,
        category: store.category,
        district: store.district
      }
    });
    setFormData(prev => ({ ...prev, stops: nextStops }));
    setVenueSearch('');
  };

  const removeStop = (storeId: string) => {
    const filtered = formData.stops.filter(s => s.storeId !== storeId);
    const reordered = filtered.map((s, idx) => ({ ...s, order: idx + 1 }));
    setFormData(prev => ({ ...prev, stops: reordered }));
  };

  const moveStop = (idx: number, dir: 'up' | 'down') => {
    const list = [...formData.stops];
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[idx]!;
    list[idx] = list[targetIdx]!;
    list[targetIdx] = temp;

    const reordered = list.map((s, i) => ({ ...s, order: i + 1 }));
    setFormData(prev => ({ ...prev, stops: reordered }));
  };

  const saveTour = async () => {
    try {
      if (!formData.title.trim()) {
        showToast('Vui lòng nhập tên Tour!');
        return;
      }
      if (formData.coverUrl && !isValidImageUrl(formData.coverUrl)) {
        showToast('Liên kết ảnh bìa không hợp lệ hoặc đang trỏ tới video.');
        return;
      }
      if (formData.stops.length === 0) {
        showToast('Tour phải có ít nhất 1 điểm dừng chân!');
        return;
      }
      const departureScheduleError = validateTourDepartureSchedule(formData.departureSchedule);
      if (departureScheduleError) {
        showToast(departureScheduleError);
        return;
      }

      const departureSchedule = normalizeTourDepartureSchedule(formData.departureSchedule);

      const payload = {
        title: formData.title,
        subtitle: formData.subtitle,
        city: formData.city,
        durationHours: Number(formData.durationHours),
        priceTier: Number(formData.priceTier),
        coverUrl: formData.coverUrl,
        status: formData.status,
        departureTimes: collectTourDepartureTimes(departureSchedule),
        departureSchedule,
        stops: formData.stops.map(s => ({ storeId: s.storeId, order: s.order }))
      };

      if (tourSel === 'new') {
        await apiClient('/admin/tours', {
          method: 'POST',
          data: payload
        });
        showToast('Đã thêm mới Tour thành công!');
      } else {
        await apiClient(`/admin/tours/${tourSel}`, {
          method: 'PUT',
          data: payload
        });
        showToast('Đã lưu thông tin Tour thành công!');
      }

      closeDrawer();
      fetchTours();
    } catch (e: any) {
      showToast(e.message || 'Lỗi khi lưu Tour');
    }
  };

  const deleteTour = async () => {
    if (!tourSel || tourSel === 'new') return;
    if (!window.confirm('Bạn có chắc chắn muốn xoá Tour này không?')) return;
    try {
      await apiClient(`/admin/tours/${tourSel}`, { method: 'DELETE' });
      showToast('Đã xoá Tour thành công!');
      closeDrawer();
      fetchTours();
    } catch (e: any) {
      showToast('Lỗi khi xoá: ' + e.message);
    }
  };

  // Filter tours list
  const filteredList = tours.filter(t => {
    const matchCity = filterCity === 'all' || t.city === filterCity;
    const query = search.toLowerCase().trim();
    const matchSearch = !query || t.title.toLowerCase().includes(query) || (t.subtitle && t.subtitle.toLowerCase().includes(query));
    return matchCity && matchSearch;
  });

  const paginated = paginateAdminItems(filteredList, currentPage);

  // Filter candidates list
  const selectedStoreIds = formData.stops.map(s => s.storeId);
  const normalizedVenueQuery = normalizeSearchText(venueSearch);
  const candidatePool = normalizedVenueQuery ? [...venueSearchResults, ...stores] : stores;
  const seenStoreIds = new Set<string>();
  const candidates = candidatePool.filter(s => {
    if (!s?.id || seenStoreIds.has(s.id)) return false;
    seenStoreIds.add(s.id);
    const matchCity = isSameCity(s.city, formData.city);
    const notSelected = !selectedStoreIds.includes(s.id);
    const isActiveVenue = s.category !== 'MASSAGE_SPA' && s.status === 'ACTIVE';
    const normalizedName = normalizeSearchText(s.name);
    const matchQuery = !normalizedVenueQuery || normalizedName.includes(normalizedVenueQuery);
    return matchCity && notSelected && isActiveVenue && matchQuery;
  }).sort((a, b) => {
    if (!normalizedVenueQuery) return String(a.name || '').localeCompare(String(b.name || ''), 'vi');
    const aName = normalizeSearchText(a.name);
    const bName = normalizeSearchText(b.name);
    const aStarts = aName.startsWith(normalizedVenueQuery) ? 0 : 1;
    const bStarts = bName.startsWith(normalizedVenueQuery) ? 0 : 1;
    return aStarts - bStarts || aName.localeCompare(bName, 'vi');
  }).slice(0, 5);

  const priceLabel = (tier: number) => {
    if (tier === 2) return '$$';
    if (tier === 3) return '$$$';
    return '$$$$';
  };

  const getCityLabel = (code: string) => {
    if (code === 'Hanoi' || code === 'HN') return 'Hà Nội';
    if (code === 'Ho Chi Minh City' || code === 'HCM') return 'TP.HCM';
    return code;
  };
  const departureScheduleErrors = getTourDepartureScheduleErrors(formData.departureSchedule);

  const boxS = { background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)', borderRadius: '10px', padding: '12px 13px', fontSize: '13px', color: '#f3f0ea' };
  const inputS = { ...boxS, width: '100%', outline: 'none' };
  const seg = (a: boolean) => ({ fontSize: '12px', padding: '9px 15px', borderRadius: '9px', cursor: 'pointer', fontWeight: 600, color: a ? '#241a0a' : '#9b958a', background: a ? 'linear-gradient(135deg,#f0dda8,#d4b26a)' : 'rgba(255,255,255,.04)', border: a ? 'none' : '1px solid rgba(255,255,255,.08)' });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' }}>
      
      {/* Top filter and actions header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '310px' }}>
          <svg style={{ position: 'absolute', left: '14px', top: '13px', color: '#57534b' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm Tour..."
            style={{ width: '100%', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.09)', borderRadius: '11px', padding: '10px 15px 10px 38px', color: '#f3f0ea', fontSize: '13px', outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '11px', padding: '3px', gap: '2px' }}>
          <span 
            onClick={() => router.push(pathname + '?city=all')}
            style={seg(filterCity === 'all')}
          >
            Tất cả
          </span>
          <span 
            onClick={() => router.push(pathname + '?city=Hanoi')}
            style={seg(filterCity === 'Hanoi')}
          >
            Hà Nội
          </span>
          <span 
            onClick={() => router.push(pathname + '?city=Ho Chi Minh City')}
            style={seg(filterCity === 'Ho Chi Minh City')}
          >
            TP.HCM
          </span>
        </div>
        <div style={{ flex: 1 }}></div>
        <span 
          onClick={openNewDrawer}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 700, color: '#241a0a', background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', padding: '10px 17px', borderRadius: '10px', cursor: 'pointer' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Thêm Tour mới
        </span>
      </div>

      {/* Main Tour list table */}
      <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '16px', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'grid', gridTemplateColumns: tourTableColumns, gap: '12px', padding: '13px 18px', fontSize: '10px', fontWeight: 700, letterSpacing: '.9px', color: '#57534b', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.015)' }}>
          <span style={{ textAlign: 'center' }}>STT</span><span>Tour &amp; Hành trình</span><span>Khu vực</span><span>Điểm dừng</span><span>Chi phí</span><span>Trạng thái</span><span></span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {paginated.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: '#8c8679', fontSize: '13.5px' }}>
              Không tìm thấy Tour nào phù hợp.
            </div>
          ) : (
            paginated.map((t, idx) => {
              const meta = getStatusMeta(t.status);
              const initial = t.title.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div 
                  key={t.id}
                  onClick={() => openEditDrawer(t.id)}
                  style={{ display: 'grid', gridTemplateColumns: tourTableColumns, gap: '12px', alignItems: 'center', padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,.04)', cursor: 'pointer', fontSize: '13px', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,178,106,.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ color: '#8c8679', fontWeight: 700, textAlign: 'center' }}>
                    {(currentPage - 1) * adminPageSize + idx + 1}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    {t.coverUrl ? (
                      <span style={{ width: '38px', height: '38px', borderRadius: '10px', background: `url(${resolveClientUrl(t.coverUrl)}) center/cover no-repeat`, flex: 'none' }} />
                    ) : (
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: t.city === 'Hanoi' ? 'linear-gradient(135deg,#f4e3b4,#d4b26a)' : 'linear-gradient(135deg,#e79ab8,#b0607f)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#241a0a', fontWeight: 800, fontSize: '12.5px', flex: 'none' }}>
                        {initial}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                      <div style={{ fontWeight: 700, color: '#f3f0ea', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{t.title}</div>
                      <div style={{ fontSize: '11px', color: '#8c8679', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: '2.5px' }}>{t.subtitle || 'Chưa cấu hình mô tả ngắn'}</div>
                    </div>
                  </div>
                  <div style={{ color: '#caa765', fontWeight: 500 }}>{getCityLabel(t.city)}</div>
                  <div style={{ color: '#caa765', fontWeight: 500 }}>{t.stops?.length || 0} điểm dừng</div>
                  <div style={{ color: '#caa765', fontWeight: 500 }}>{priceLabel(t.priceTier)}</div>
                  <div>
                    <span style={getPillStyle(meta.style)}>{meta.label}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', color: '#57534b' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <AdminPagination 
          totalItems={filteredList.length}
          page={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Slide-over Drawer Form */}
      {tourSel !== null && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'flex', justifyContent: 'flex-end', background: 'rgba(6,6,9,.65)', backdropFilter: 'blur(4px)' }}>
          <div onClick={closeDrawer} style={{ position: 'absolute', inset: 0 }} />
          
          <div style={{ width: '560px', height: '100%', background: '#100f14', borderLeft: '1px solid rgba(255,255,255,.09)', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 82, boxShadow: '-20px 0 60px rgba(0,0,0,.85)' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 26px', borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.005)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '9px', fontWeight: 700, color: '#8c8679', textTransform: 'uppercase', letterSpacing: '1.2px' }}>QUẢN LÝ TOUR NIGHTLIFE</div>
                <div style={{ fontSize: '16.5px', fontWeight: 700, color: '#f3f0ea', marginTop: '3.5px' }}>{tourSel === 'new' ? 'Thêm hành trình mới' : 'Chỉnh sửa hành trình'}</div>
              </div>
              <span onClick={closeDrawer} style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9b958a', cursor: 'pointer' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </span>
            </div>

            {/* Scrollable form body */}
            <div className="scw" style={{ flex: 1, overflowY: 'auto', padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Title */}
              <div>
                <div style={{ fontSize: '11.5px', color: '#8c8679', marginBottom: '6px' }}>Tên hành trình / Tiêu đề Tour</div>
                <input 
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="VD: Nightlife Bar Crawl Hoan Kiem"
                  style={inputS}
                />
              </div>

              {/* Subtitle */}
              <div>
                <div style={{ fontSize: '11.5px', color: '#8c8679', marginBottom: '6px' }}>Mô tả hành trình / Subtitle</div>
                <textarea 
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Mô tả trải nghiệm thú vị của tour..."
                  style={{ ...boxS, width: '100%', height: '68px', outline: 'none', resize: 'none' }}
                />
              </div>

              {/* Cover Image Section */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', color: '#caa765', textTransform: 'uppercase', marginBottom: '12px', borderLeft: '3px solid #d4b26a', paddingLeft: '8px' }}>Ảnh bìa Tour</div>
                <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '12px', padding: '14px', display: 'flex', gap: '14px' }}>
                  <div style={{ 
                    width: '110px', 
                    height: '74px', 
                    borderRadius: '10px', 
                    background: formData.coverUrl 
                      ? (formData.coverUrl.startsWith('url(') 
                          ? formData.coverUrl 
                          : (formData.coverUrl.startsWith('data:') 
                              ? `url('${formData.coverUrl}') center/cover no-repeat`
                              : `url('${resolveClientUrl(formData.coverUrl)}') center/cover no-repeat`
                            )
                        )
                      : 'rgba(255,255,255,.02)', 
                    border: '1px solid rgba(255,255,255,.08)', 
                    flex: 'none', 
                    position: 'relative', 
                    overflow: 'hidden', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    {!formData.coverUrl && (
                      <span style={{ fontSize: '10px', color: '#8c8679', textAlign: 'center', padding: '5px' }}>Chưa có ảnh</span>
                    )}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
                    <div>
                      <div style={{ fontSize: '10.5px', color: '#8c8679', marginBottom: '4px' }}>Gán liên kết hình ảnh (URL)</div>
                      <input 
                        value={formData.coverUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, coverUrl: e.target.value }))}
                        placeholder="https://images.unsplash.com/..."
                        style={{ 
                          ...boxS, 
                          width: '100%', 
                          padding: '8px 10px', 
                          fontSize: '12px',
                          border: formData.coverUrl && !isValidImageUrl(formData.coverUrl) 
                            ? '1px solid #e88b99' 
                            : '1px solid rgba(255,255,255,.09)'
                        }}
                      />
                      {formData.coverUrl && !isValidImageUrl(formData.coverUrl) && (
                        <div style={{ fontSize: '10.5px', color: '#e88b99', marginTop: '4px', fontWeight: 500 }}>
                          * Đường dẫn phải là ảnh hợp lệ; không chấp nhận URL video, YouTube hoặc Vimeo
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#241a0a', background: 'linear-gradient(135deg,#f4e3b4,#d4b26a)', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                          Tải ảnh từ máy
                        </span>
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          accept={TOUR_COVER_IMAGE_ACCEPT}
                          onChange={handleUploadCover}
                          disabled={uploadingCover}
                          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%' }} 
                        />
                      </div>
                      {formData.coverUrl && (
                        <span onClick={() => setFormData(prev => ({ ...prev, coverUrl: '' }))} style={{ fontSize: '11.5px', color: '#e88b99', cursor: 'pointer', fontWeight: 600 }}>Xoá ảnh bìa</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* City and price row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11.5px', color: '#8c8679', marginBottom: '6px' }}>Thành phố</div>
                  <div style={{ display: 'flex', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '11px', padding: '3px', gap: '2px' }}>
                    <span 
                      onClick={() => setFormData(prev => ({ ...prev, city: 'Hanoi' }))}
                      style={{ ...seg(formData.city === 'Hanoi'), flex: 1, textAlign: 'center' }}
                    >
                      Hà Nội
                    </span>
                    <span 
                      onClick={() => setFormData(prev => ({ ...prev, city: 'Ho Chi Minh City' }))}
                      style={{ ...seg(formData.city === 'Ho Chi Minh City'), flex: 1, textAlign: 'center' }}
                    >
                      TP.HCM
                    </span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11.5px', color: '#8c8679', marginBottom: '6px' }}>Mức chi phí</div>
                  <div style={{ display: 'flex', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '11px', padding: '3px', gap: '2px' }}>
                    <span 
                      onClick={() => setFormData(prev => ({ ...prev, priceTier: 2 }))}
                      style={{ ...seg(formData.priceTier === 2), flex: 1, textAlign: 'center' }}
                    >
                      $$
                    </span>
                    <span 
                      onClick={() => setFormData(prev => ({ ...prev, priceTier: 3 }))}
                      style={{ ...seg(formData.priceTier === 3), flex: 1, textAlign: 'center' }}
                    >
                      $$$
                    </span>
                    <span 
                      onClick={() => setFormData(prev => ({ ...prev, priceTier: 4 }))}
                      style={{ ...seg(formData.priceTier === 4), flex: 1, textAlign: 'center' }}
                    >
                      $$$$
                    </span>
                  </div>
                </div>
              </div>

              {/* Duration and Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11.5px', color: '#8c8679', marginBottom: '6px' }}>Thời lượng (Giờ)</div>
                  <input 
                    type="number"
                    value={formData.durationHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, durationHours: Number(e.target.value) }))}
                    style={inputS}
                  />
                </div>

                <div>
                  <div style={{ fontSize: '11.5px', color: '#8c8679', marginBottom: '6px' }}>Trạng thái</div>
                  <div style={{ display: 'flex', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '11px', padding: '3px', gap: '2px' }}>
                    <span 
                      onClick={() => setFormData(prev => ({ ...prev, status: 'ACTIVE' }))}
                      style={{ ...seg(formData.status === 'ACTIVE'), flex: 1, textAlign: 'center' }}
                    >
                      Mở
                    </span>
                    <span 
                      onClick={() => setFormData(prev => ({ ...prev, status: 'HIDDEN' }))}
                      style={{ ...seg(formData.status === 'HIDDEN'), flex: 1, textAlign: 'center' }}
                    >
                      Tạm ẩn
                    </span>
                  </div>
                </div>
              </div>

              {/* Departure schedule */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', color: '#caa765', textTransform: 'uppercase', marginBottom: '12px', borderLeft: '3px solid #d4b26a', paddingLeft: '8px' }}>Giờ khởi hành theo ngày</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {tourWeekdayKeys.map((day) => {
                    const dayState = formData.departureSchedule[day];
                    const isOff = dayState.isOff;
                    const slots = dayState.hours
                      ? dayState.hours.split(',').map((slot) => slot.trim())
                      : [''];
                    const toggleStyle = isOff
                      ? {
                          color: '#e08a7e',
                          background: 'rgba(224,138,126,.1)',
                          border: '1px solid rgba(224,138,126,.25)',
                        }
                      : {
                          color: '#7fd3a2',
                          background: 'rgba(127,211,162,.1)',
                          border: '1px solid rgba(127,211,162,.25)',
                        };

                    return (
                      <div
                        key={day}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          background: isOff ? 'rgba(255,255,255,.015)' : 'rgba(255,255,255,.03)',
                          border: '1px solid rgba(255,255,255,.07)',
                          borderRadius: '11px',
                          padding: '8px 13px',
                        }}
                      >
                        <span style={{ width: '50px', flex: 'none', fontSize: '12px', fontWeight: 600, color: isOff ? '#8c8679' : '#f3f0ea', lineHeight: '30px' }}>
                          {tourWeekdayLabels[day]}
                        </span>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                          {!isOff && slots.map((slot, index) => {
                            const parts = splitTourDepartureSlot(slot);
                            const slotError = departureScheduleErrors[day]?.[index];
                            const setSlotValue = (value: string) => {
                              const nextSlots = [...slots];
                              nextSlots[index] = value;
                              updateDepartureDay(day, (current) => ({
                                ...current,
                                hours: nextSlots.join(', '),
                              }));
                            };
                            const setSlotTime = (key: 'start' | 'end', value: string) => {
                              const start = key === 'start' ? value : (parts.start || '19:00');
                              const end = key === 'end' ? value : (parts.end || '24:00');
                              setSlotValue(start && end ? `${start} - ${end}` : '');
                            };

                            return (
                              <span key={`${day}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(12,12,15,.45)', border: slotError ? '1px solid rgba(232,139,153,.55)' : '1px solid rgba(212,178,106,.2)', borderRadius: '8px', padding: '3px 4px 3px 8px' }}>
                                <TourTimeSelect
                                  value={parts.start}
                                  onChange={(value) => setSlotTime('start', value)}
                                  placeholder="Bắt đầu"
                                  hasError={Boolean(slotError)}
                                />
                                <span style={{ color: '#6e6a60', fontSize: '12px', fontWeight: 700 }}>–</span>
                                <TourTimeSelect
                                  value={parts.end}
                                  onChange={(value) => setSlotTime('end', value)}
                                  placeholder="Kết thúc"
                                  hasError={Boolean(slotError)}
                                />
                                <span
                                  onClick={() => {
                                    const nextSlots = slots.filter((_, slotIndex) => slotIndex !== index);
                                    updateDepartureDay(day, (current) => ({
                                      ...current,
                                      hours: nextSlots.join(', '),
                                    }));
                                  }}
                                  title="Xóa khung giờ"
                                  style={{ width: '19px', height: '19px', flex: 'none', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6e6a60', cursor: 'pointer' }}
                                  onMouseEnter={(event) => {
                                    event.currentTarget.style.color = '#e08a7e';
                                    event.currentTarget.style.background = 'rgba(224,122,110,.13)';
                                  }}
                                  onMouseLeave={(event) => {
                                    event.currentTarget.style.color = '#6e6a60';
                                    event.currentTarget.style.background = 'transparent';
                                  }}
                                >
                                  ✕
                                </span>
                              </span>
                            );
                          })}
                          {!isOff && departureScheduleErrors[day] && (
                            <span style={{ width: '100%', color: '#e88b99', fontSize: '10.5px', lineHeight: 1.35 }}>
                              {Object.values(departureScheduleErrors[day]!)[0]}
                            </span>
                          )}
                          {!isOff && (
                            <span
                              onClick={() => updateDepartureDay(day, (current) => ({
                                ...current,
                                hours: [...slots.filter(Boolean), defaultTourDepartureSlot].join(', '),
                              }))}
                              title="Thêm khung giờ trong ngày"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', border: '1.5px dashed rgba(212,178,106,.32)', borderRadius: '8px', padding: '6px 10px', fontSize: '10.5px', fontWeight: 700, color: '#8c8679', cursor: 'pointer', whiteSpace: 'nowrap' }}
                              onMouseEnter={(event) => {
                                event.currentTarget.style.color = '#caa765';
                                event.currentTarget.style.borderColor = 'rgba(212,178,106,.55)';
                              }}
                              onMouseLeave={(event) => {
                                event.currentTarget.style.color = '#8c8679';
                                event.currentTarget.style.borderColor = 'rgba(212,178,106,.32)';
                              }}
                            >
                              + Khung giờ
                            </span>
                          )}
                          {isOff && (
                            <span style={{ fontSize: '12px', fontStyle: 'italic', color: '#57534b', lineHeight: '30px' }}>Không có lịch khởi hành</span>
                          )}
                        </div>
                        <span
                          onClick={() => toggleDepartureDay(day)}
                          style={{ ...toggleStyle, flex: 'none', fontSize: '10.5px', fontWeight: 700, borderRadius: '6px', padding: '3px 9px', cursor: 'pointer' }}
                        >
                          {isOff ? 'Nghỉ' : 'Chạy'}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '10px', fontSize: '10.5px', color: '#8c8679', lineHeight: 1.5 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ flex: 'none', marginTop: '1px' }}><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M12 11v5"/></svg>
                  <span>Một ngày có thể có nhiều khung giờ bắt đầu – kết thúc và không được trùng lặp. Bấm <b style={{ color: '#caa765' }}>+ Khung giờ</b> để thêm, ✕ để xóa; nút bên phải chuyển <b style={{ color: '#7fd3a2' }}>Chạy</b> / <b style={{ color: '#e08a7e' }}>Nghỉ</b>. Có thể chọn 00:00 – 00:00 để chạy cả ngày (24h).</span>
                </div>
              </div>

              {/* Stops management */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', color: '#caa765', textTransform: 'uppercase', marginBottom: '12px', borderLeft: '3px solid #d4b26a', paddingLeft: '8px' }}>Hành trình dừng chân ({formData.stops?.length || 0})</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  {formData.stops?.map((stop, idx) => (
                    <div key={stop.storeId} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', padding: '10px 14px', borderRadius: '12px' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#d4b26a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#241a0a', fontSize: '11.5px', fontWeight: 800 }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ color: '#f3f0ea', fontWeight: 700, fontSize: '12.5px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{stop.store?.name}</div>
                        <div style={{ color: '#8c8679', fontSize: '10.5px', marginTop: '2px' }}>{stop.store?.category} · {stop.store?.district}</div>
                      </div>
                      
                      {/* Move & Action triggers */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span onClick={() => moveStop(idx, 'up')} style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: idx === 0 ? '#57534b' : '#9b958a', cursor: idx === 0 ? 'default' : 'pointer' }}>▲</span>
                        <span onClick={() => moveStop(idx, 'down')} style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: idx === formData.stops.length - 1 ? '#57534b' : '#9b958a', cursor: idx === formData.stops.length - 1 ? 'default' : 'pointer' }}>▼</span>
                        <span onClick={() => removeStop(stop.storeId)} style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'rgba(224,105,122,.08)', border: '1px solid rgba(224,105,122,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e88b99', cursor: 'pointer' }}>✕</span>
                      </div>
                    </div>
                  ))}
                  
                  {formData.stops?.length === 0 && (
                    <div style={{ padding: '16px', background: 'rgba(255,255,255,.01)', border: '1px dashed rgba(255,255,255,.08)', borderRadius: '12px', textAlign: 'center', color: '#57534b', fontSize: '12px' }}>
                      Chưa có địa điểm dừng chân nào được thêm vào Tour.
                    </div>
                  )}
                </div>

                {/* Add new stops lookup */}
                <div>
                  <div style={{ fontSize: '11px', color: '#8c8679', marginBottom: '6px' }}>Gán thêm điểm dừng từ hệ thống</div>
                  <div style={{ position: 'relative' }}>
                    <input 
                      value={venueSearch}
                      onChange={(e) => setVenueSearch(e.target.value)}
                      placeholder="Tìm quán theo tên..."
                      style={{ ...inputS, paddingRight: '32px' }}
                    />
                    {venueSearch.trim() && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#131217', border: '1px solid rgba(255,255,255,.08)', borderRadius: '11px', marginTop: '6px', boxShadow: '0 12px 32px rgba(0,0,0,.6)', zIndex: 10, overflow: 'hidden', padding: '4px' }}>
                        {candidates.map(store => (
                          <div 
                            key={store.id}
                            onClick={() => addStop(store)}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,178,106,.08)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <div>
                              <div style={{ color: '#f3f0ea', fontSize: '12.5px', fontWeight: 700 }}>{store.name}</div>
                              <div style={{ color: '#8c8679', fontSize: '10.5px', marginTop: '2px' }}>{store.category} · {store.district}</div>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#caa765' }}>Chọn</span>
                          </div>
                        ))}
                        {isSearchingVenues && candidates.length === 0 && (
                          <div style={{ padding: '12px', color: '#8c8679', fontSize: '11px', textAlign: 'center' }}>Äang tÃ¬m quÃ¡n...</div>
                        )}
                        {!isSearchingVenues && candidates.length === 0 && (
                          <div style={{ padding: '12px', color: '#57534b', fontSize: '11px', textAlign: 'center' }}>Không tìm thấy quán phù hợp</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* Actions footer */}
            <div style={{ padding: '15px 26px', background: '#131218', borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', gap: '10px', flex: 'none' }}>
              {tourSel !== 'new' && (
                <span onClick={deleteTour} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12.5px', fontWeight: 600, color: '#e88b99', background: 'rgba(224,105,122,.08)', border: '1px solid rgba(224,105,122,.32)', padding: '13px 16px', borderRadius: '11px', cursor: 'pointer' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/></svg>
                  Xoá Tour
                </span>
              )}
              <span onClick={closeDrawer} style={{ fontSize: '13px', fontWeight: 600, color: '#c5c0b6', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', padding: '13px 22px', borderRadius: '11px', cursor: 'pointer' }}>
                Hủy
              </span>
              <span onClick={saveTour} style={{ flex: 1, textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#241a0a', background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', padding: '13px', borderRadius: '11px', cursor: 'pointer' }}>
                Lưu hành trình
              </span>
            </div>

          </div>
        </div>
      )}

      {/* Custom toast notification */}
      {toast && (
        <div style={{ position: 'fixed', left: '50%', bottom: '28px', transform: 'translateX(-50%)', zIndex: 90, display: 'flex', alignItems: 'center', gap: '10px', background: '#17161c', border: '1px solid rgba(212,178,106,.3)', color: '#f3f0ea', fontSize: '13.5px', fontWeight: 500, padding: '13px 22px', borderRadius: '12px', boxShadow: '0 20px 44px -18px rgba(0,0,0,.85)' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7fd3a2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          {toast}
        </div>
      )}

    </div>
  );
}
