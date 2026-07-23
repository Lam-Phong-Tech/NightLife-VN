"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Search, ChevronRight, Plus, Check, Play, Bell, Upload, Video, SlidersHorizontal, ChevronDown, RotateCcw } from 'lucide-react';
import { apiClient, apiFormDataClient } from '@/lib/api/client';
import {
  ADMIN_VIDEO_ACCEPT,
  getAdminVideoValidationError,
  getStoreImageValidationError,
  STORE_IMAGE_ACCEPT,
} from '@/lib/media/image-upload-validation';
import {
  deleteUploadedMedia,
  deleteUploadedMediaBatch,
} from '@/lib/api/media';
import { useSearchParams } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/session';
import { AdminPagination, paginateAdminItems, adminPageSize } from '../components/AdminPagination';
import { DataSkeleton } from '@/components/ui/DataLoading';

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
const ZODIAC_SIGNS = [
  { value: 'Aries', label: 'Bạch Dương' },
  { value: 'Taurus', label: 'Kim Ngưu' },
  { value: 'Gemini', label: 'Song Tử' },
  { value: 'Cancer', label: 'Cự Giải' },
  { value: 'Leo', label: 'Sư Tử' },
  { value: 'Virgo', label: 'Xử Nữ' },
  { value: 'Libra', label: 'Thiên Bình' },
  { value: 'Scorpio', label: 'Bọ Cạp' },
  { value: 'Sagittarius', label: 'Nhân Mã' },
  { value: 'Capricorn', label: 'Ma Kết' },
  { value: 'Aquarius', label: 'Bảo Bình' },
  { value: 'Pisces', label: 'Song Ngư' },
];

const LANGUAGE_LABELS: Record<string, string> = {
  VN: 'Tiếng Việt',
  VI: 'Tiếng Việt',
  EN: 'Tiếng Anh',
  JP: 'Tiếng Nhật',
  JA: 'Tiếng Nhật',
  KR: 'Tiếng Hàn',
  KO: 'Tiếng Hàn',
  CN: 'Tiếng Trung',
  ZH: 'Tiếng Trung',
};

type FilterOption = {
  value: string;
  label: string;
};

type CastFilterStore = {
  area?: string | { id?: string; name?: string } | null;
  district?: string | null;
  city?: string | null;
};

type AdvancedFilterDropdownProps = {
  label: string;
  value: string;
  placeholder: string;
  options: FilterOption[];
  onChange: (value: string) => void;
};

function AdvancedFilterDropdown({
  label,
  value,
  placeholder,
  options,
  onChange,
}: AdvancedFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  return (
    <div ref={pickerRef} style={{ position: 'relative', minWidth: 0 }}>
      <div style={{ color: colors.muted, fontSize: '11px', fontWeight: 700, letterSpacing: '.7px', marginBottom: '8px', textTransform: 'uppercase' }}>
        {label}
      </div>
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        style={{
          width: '100%',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          padding: '0 13px',
          borderRadius: '10px',
          border: `1px solid ${isOpen ? colors.gold : colors.borderSoft}`,
          background: isOpen ? 'rgba(212,178,106,.08)' : colors.bg,
          color: selectedOption ? colors.text : colors.muted,
          cursor: 'pointer',
          fontSize: '13px',
          textAlign: 'left',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          size={15}
          color={isOpen ? colors.gold : colors.muted}
          style={{ flex: 'none', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}
        />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          zIndex: 50,
          top: 'calc(100% + 7px)',
          left: 0,
          right: 0,
          maxHeight: '250px',
          overflowY: 'auto',
          padding: '5px',
          borderRadius: '11px',
          border: `1px solid ${colors.borderGold22}`,
          background: '#15151b',
          boxShadow: '0 22px 55px rgba(0,0,0,.55)',
        }}>
          <button
            type="button"
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            style={{
              width: '100%',
              minHeight: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 10px',
              border: 0,
              borderRadius: '7px',
              background: !value ? 'rgba(212,178,106,.12)' : 'transparent',
              color: !value ? colors.gold : colors.text2,
              cursor: 'pointer',
              fontSize: '13px',
              textAlign: 'left',
            }}
          >
            <span>{placeholder}</span>
            {!value && <Check size={14} />}
          </button>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  minHeight: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  padding: '7px 10px',
                  border: 0,
                  borderRadius: '7px',
                  background: isSelected ? 'rgba(212,178,106,.12)' : 'transparent',
                  color: isSelected ? colors.gold : colors.text,
                  cursor: 'pointer',
                  fontSize: '13px',
                  textAlign: 'left',
                }}
              >
                <span>{option.label}</span>
                {isSelected && <Check size={14} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const normalizeFilterValue = (value: unknown) =>
  String(value || '').trim().toLocaleLowerCase('vi');

const getCastArea = (cast: { store?: CastFilterStore | null }): FilterOption => {
  const store = cast?.store || {};
  const area = store.area;
  const areaName = typeof area === 'string' ? area : area?.name;
  const areaId = typeof area === 'object' ? area?.id : '';
  const locationName = areaName || store.district || store.city || 'Chưa xác định';
  const cityName =
    store.city === 'Ho Chi Minh City' || store.city === 'Hồ Chí Minh'
      ? 'TP.HCM'
      : store.city === 'Hanoi' || store.city === 'Hà Nội' || store.city === 'Ha Noi'
        ? 'Hà Nội'
        : store.city;

  return {
    value: areaId || `${store.city || 'other'}::${locationName}`,
    label: cityName && cityName !== locationName ? `${locationName} · ${cityName}` : locationName,
  };
};

type AdminCastMediaItem = {
  id?: string;
  url?: string;
  type?: string | null;
  purpose?: string | null;
};

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

type CastChipInputProps = {
  label: string;
  values: string[];
  inputValue: string;
  placeholder: string;
  onInputChange: (value: string) => void;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
};

type CastListFormState = {
  hobbies?: string[];
  tags?: string[];
  [key: string]: unknown;
};

function CastChipInput({
  label,
  values,
  inputValue,
  placeholder,
  onInputChange,
  onAdd,
  onRemove,
}: CastChipInputProps) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '8px' }}>
        {label} (nhập nội dung rồi nhấn Enter)
      </div>
      <div
        style={{
          width: '100%',
          minHeight: '48px',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          background: 'transparent',
          border: `1px solid ${colors.borderSoft}`,
          borderRadius: '12px',
          padding: '8px 12px',
        }}
      >
        {values.map((value, index) => (
          <span
            key={`${value}-${index}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              maxWidth: '100%',
              padding: '5px 8px 5px 10px',
              borderRadius: '16px',
              border: `1px solid ${colors.borderGold22}`,
              background: 'rgba(212,178,106,.12)',
              color: colors.text,
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</span>
            <button
              type="button"
              onClick={() => onRemove(value)}
              aria-label={`Xóa ${value}`}
              style={{
                width: '18px',
                height: '18px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 'none',
                border: 0,
                borderRadius: '50%',
                background: 'transparent',
                color: colors.muted,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
            event.preventDefault();
            onAdd(inputValue);
          }}
          placeholder={placeholder}
          aria-label={label}
          style={{
            minWidth: '180px',
            minHeight: '30px',
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: colors.text,
            fontSize: '14px',
            outline: 'none',
            padding: '2px 4px',
          }}
        />
      </div>
    </div>
  );
}

export default function AdminCastsPage() {
  return (
    <React.Suspense fallback={<DataSkeleton variant="list" count={6} style={{ padding: '20px' }} />}>
      <AdminCastsContent />
    </React.Suspense>
  );
}

function AdminCastsContent() {
  const [activeTab, setActiveTab] = useState('all');
  const [casts, setCasts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [languageFilter, setLanguageFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [minHeightFilter, setMinHeightFilter] = useState('');
  const [maxHeightFilter, setMaxHeightFilter] = useState('');
  const [zodiacFilter, setZodiacFilter] = useState('');
  
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
    stageName: '', storeId: '', bio: '', birthMonth: '', zodiacSign: '',
    heightCm: '', measurements: '', languages: [], hobbies: [], tags: [], isPublic: true, status: 'ACTIVE',
    youtubeLinks: []
  });
  
  const [albums, setAlbums] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [avatarImage, setAvatarImage] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; label: string } | null>(null);
  
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const albumUploadRef = useRef<HTMLInputElement>(null);
  const videoUploadRef = useRef<HTMLInputElement>(null);
  const castUploadScopePromiseRef = useRef<Promise<string | null> | null>(null);
  const createdDraftCastIdRef = useRef<string | null>(null);
  const newMediaIdsRef = useRef<Set<string>>(new Set());
  const removedMediaIdsRef = useRef<Set<string>>(new Set());
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
  const [zodiacPickerOpen, setZodiacPickerOpen] = useState(false);
  const [hobbyInput, setHobbyInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (!previewImage) return;

    const previousOverflow = document.body.style.overflow;
    const closePreview = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPreviewImage(null);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closePreview);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closePreview);
    };
  }, [previewImage]);

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
      const res = await apiClient<any>('/admin/stores', { params: { limit: 1000 } });
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
  }, [search, activeTab, languageFilter, areaFilter, minHeightFilter, maxHeightFilter, zodiacFilter]);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 3000);
  };

  const getStatusLabel = (status: string, isPublic: boolean) => {
    if (status === 'DRAFT' || status === 'PENDING_REVIEW') return 'Chờ duyệt';
    if (status === 'ACTIVE' && isPublic) return 'Đang hiển thị';
    return 'Ẩn';
  };

  const searchParams = useSearchParams();
  const rawCity = searchParams.get('city') || '';
  const filterCity = rawCity === 'Hanoi' || rawCity === 'Ho Chi Minh City' || rawCity === 'all' ? rawCity : 'all';
  const filterCategory = searchParams.get('category') || '';

  const languageOptions = useMemo(() => {
    const languages = new Map<string, FilterOption>();
    casts.forEach((cast) => {
      (cast.languages || []).forEach((language: string) => {
        const normalized = String(language || '').trim().toUpperCase();
        if (!normalized) return;
        languages.set(normalized, {
          value: normalized,
          label: LANGUAGE_LABELS[normalized] ? `${LANGUAGE_LABELS[normalized]} (${normalized})` : normalized,
        });
      });
    });
    return Array.from(languages.values()).sort((a, b) => a.label.localeCompare(b.label, 'vi'));
  }, [casts]);

  const areaOptions = useMemo(() => {
    const areas = new Map<string, FilterOption>();
    casts.forEach((cast) => {
      const area = getCastArea(cast);
      if (area.label !== 'Chưa xác định') areas.set(area.value, area);
    });
    return Array.from(areas.values()).sort((a, b) => a.label.localeCompare(b.label, 'vi'));
  }, [casts]);

  const zodiacOptions = ZODIAC_SIGNS.map((zodiac) => ({
    value: zodiac.value,
    label: `${zodiac.label} · ${zodiac.value}`,
  }));

  const activeAdvancedFilterCount = [
    languageFilter,
    areaFilter,
    minHeightFilter || maxHeightFilter,
    zodiacFilter,
  ].filter(Boolean).length;

  const resetAdvancedFilters = () => {
    setLanguageFilter('');
    setAreaFilter('');
    setMinHeightFilter('');
    setMaxHeightFilter('');
    setZodiacFilter('');
  };

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
        : 'OTHER';

    if (filterCity === 'Hanoi' && storeArea !== 'HN') return false;
    if (filterCity === 'Ho Chi Minh City' && storeArea !== 'HCM') return false;

    // Lọc theo Category của Quán trực thuộc
    if (filterCategory && cast.store?.category !== filterCategory) return false;

    if (
      languageFilter &&
      !(cast.languages || []).some(
        (language: string) => String(language || '').trim().toUpperCase() === languageFilter,
      )
    ) {
      return false;
    }

    if (areaFilter && getCastArea(cast).value !== areaFilter) return false;

    const heightCm = Number(cast.heightCm);
    const minHeight = Number(minHeightFilter);
    const maxHeight = Number(maxHeightFilter);
    if (minHeightFilter && (!Number.isFinite(heightCm) || heightCm < minHeight)) return false;
    if (maxHeightFilter && (!Number.isFinite(heightCm) || heightCm > maxHeight)) return false;

    if (zodiacFilter) {
      const selectedZodiac = ZODIAC_SIGNS.find((zodiac) => zodiac.value === zodiacFilter);
      const castZodiac = normalizeFilterValue(cast.zodiacSign);
      if (
        castZodiac !== normalizeFilterValue(zodiacFilter) &&
        castZodiac !== normalizeFilterValue(selectedZodiac?.label)
      ) {
        return false;
      }
    }

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

  const normalizeMediaPurpose = (purpose?: string | null) =>
    String(purpose || '').trim().toLowerCase().replace(/[_\s]+/g, '-');

  const isCastAvatarMedia = (media: AdminCastMediaItem) =>
    ['cast-avatar', 'avatar', 'profile', 'profile-photo', 'cast-profile', 'thumbnail'].includes(
      normalizeMediaPurpose(media?.purpose),
    );

  const isCastImageMedia = (media: AdminCastMediaItem) => {
    const purpose = normalizeMediaPurpose(media?.purpose);
    const url = String(media?.url || '').split('?')[0] || '';

    return (
      media?.type === 'IMAGE' ||
      [
        'cast-avatar',
        'cast-photo',
        'cast-gallery',
        'partner-cast-image',
        'partner-listing-cast',
        'avatar',
        'profile',
        'profile-photo',
        'cast-profile',
        'thumbnail',
        'gallery',
      ].includes(purpose) ||
      /\.(jpeg|jpg|gif|png|webp|svg|avif)$/i.test(url)
    );
  };

  const isCastVideoMedia = (media: AdminCastMediaItem) => {
    const purpose = normalizeMediaPurpose(media?.purpose);
    const url = String(media?.url || '').split('?')[0] || '';

    return (
      media?.type === 'VIDEO' ||
      ['cast-video', 'partner-cast-video', 'video'].includes(purpose) ||
      /\.(mp4|webm|ogg|mov|m4v)$/i.test(url)
    );
  };

  const getCastAvatarMedia = (mediaList?: AdminCastMediaItem[] | null) => {
    const imageList = (mediaList || []).filter(isCastImageMedia);
    return imageList.find(isCastAvatarMedia) || imageList[0] || null;
  };

  const resetDrawerState = () => {
    setPreviewImage(null);
    setSelectedCast(null);
    setIsAddingCast(false);
    setStorePickerOpen(false);
    setStorePickerSearch('');
    setStatusPickerOpen(false);
    setMonthPickerOpen(false);
    setZodiacPickerOpen(false);
    setHobbyInput('');
    setTagInput('');
  };

  const closeDrawer = async () => {
    const failedDeletes = await deleteUploadedMediaBatch(
      newMediaIdsRef.current,
    );
    if (failedDeletes.length) {
      showToast('Không thể dọn hết media vừa tải lên. Vui lòng thử lại.');
    }
    newMediaIdsRef.current.clear();
    removedMediaIdsRef.current.clear();

    const draftId = createdDraftCastIdRef.current;
    createdDraftCastIdRef.current = null;
    castUploadScopePromiseRef.current = null;
    if (draftId) {
      await apiClient(`/admin/casts/${draftId}`, { method: 'DELETE' }).catch(
        () => undefined,
      );
    }
    resetDrawerState();
  };

  const finishDrawerAfterSave = () => {
    newMediaIdsRef.current.clear();
    removedMediaIdsRef.current.clear();
    createdDraftCastIdRef.current = null;
    castUploadScopePromiseRef.current = null;
    resetDrawerState();
  };

  const openNewDrawer = () => {
    setFormData({
      stageName: '', storeId: '', bio: '', birthMonth: '', zodiacSign: '',
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
    setZodiacPickerOpen(false);
    setHobbyInput('');
    setTagInput('');
    newMediaIdsRef.current.clear();
    removedMediaIdsRef.current.clear();
    createdDraftCastIdRef.current = null;
    castUploadScopePromiseRef.current = null;
  };

  const openEditDrawer = (c: any) => {
    newMediaIdsRef.current.clear();
    removedMediaIdsRef.current.clear();
    createdDraftCastIdRef.current = null;
    castUploadScopePromiseRef.current = null;
    setFormData({
      stageName: c.stageName || '',
      storeId: c.storeId || '',
      bio: c.bio || c.publicBio || '',
      birthMonth: c.birthMonth || '',
      zodiacSign: c.zodiacSign || '',
      heightCm: c.heightCm || '',
      measurements: c.measurements || '',
      languages: (c.languages || []).filter((language: string) => COMMON_LANGS.includes(language)),
      hobbies: c.hobbies || [],
      tags: c.tags || [],
      youtubeLinks: c.youtubeLinks || [],
      isPublic: c.isPublic ?? true,
      status: c.status || 'ACTIVE'
    });
    
    const mediaList = c.media || [];
    const imageList = mediaList.filter(isCastImageMedia);
    const videoList = mediaList.filter(isCastVideoMedia);
    
    const selectedAvatar = getCastAvatarMedia(mediaList);
    setAvatarImage(selectedAvatar);
    setAlbums(
      imageList.filter((media: AdminCastMediaItem) =>
        selectedAvatar?.id ? media.id !== selectedAvatar.id : media.url !== selectedAvatar?.url,
      ) || [],
    );
    setVideos(videoList || []);
    setSelectedCast(c);
    setIsAddingCast(false);
    setStorePickerOpen(false);
    setStorePickerSearch('');
    setStatusPickerOpen(false);
    setMonthPickerOpen(false);
    setZodiacPickerOpen(false);
    setHobbyInput('');
    setTagInput('');
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
    createdDraftCastIdRef.current = draft.id;
    return draft.id;
  };

  const ensureCastUploadScope = async () => {
    if (selectedCast?.id) return selectedCast.id;
    if (createdDraftCastIdRef.current) return createdDraftCastIdRef.current;
    if (!castUploadScopePromiseRef.current) {
      castUploadScopePromiseRef.current = createCastDraft().finally(() => {
        castUploadScopePromiseRef.current = null;
      });
    }
    return castUploadScopePromiseRef.current;
  };

  const registerUploadedMedia = (mediaId?: string | null) => {
    if (mediaId) newMediaIdsRef.current.add(mediaId);
  };

  const removeCastMedia = (media?: { id?: string | null } | null) => {
    const mediaId = media?.id;
    if (!mediaId) return;
    if (newMediaIdsRef.current.delete(mediaId)) {
      void deleteUploadedMedia(mediaId).catch(() => {
        newMediaIdsRef.current.add(mediaId);
        showToast('Không thể xóa media vừa tải lên.');
      });
      return;
    }
    removedMediaIdsRef.current.add(mediaId);
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

      if (formData.heightCm !== '' && formData.heightCm !== null && formData.heightCm !== undefined) {
        const parsedHeight = parseInt(formData.heightCm, 10);
        if (isNaN(parsedHeight) || parsedHeight <= 0) {
          showToast('Chiều cao phải là số dương lớn hơn 0!');
          return;
        }
        if (parsedHeight < 50 || parsedHeight > 250) {
          showToast('Chiều cao không hợp lệ (phải trong khoảng 50 - 250 cm)!');
          return;
        }
      }

      const payload = {
        ...formData,
        languages: (formData.languages || []).filter((language: string) => COMMON_LANGS.includes(language)),
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
      const failedDeletes = await deleteUploadedMediaBatch(
        removedMediaIdsRef.current,
      );
      if (failedDeletes.length) {
        showToast('Đã lưu Cast nhưng chưa dọn được một số media đã gỡ.');
      }
      finishDrawerAfterSave();
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
      finishDrawerAfterSave();
      fetchCasts();
    } catch (e: any) {
      showToast(e.message || 'Lỗi khi xóa Cast');
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validationError = getStoreImageValidationError(file);
    if (validationError) {
      showToast(validationError);
      e.target.value = '';
      return;
    }
    try {
      setUploadingImage(true);
      const form = new FormData();
      form.append('file', file);
      form.append('purpose', 'CAST_AVATAR');
      form.append('access', 'PUBLIC');
      const castId = await ensureCastUploadScope();
      if (!castId) return;
      form.append('castId', castId);
      
      const res = await apiFormDataClient<any>('/storage/upload', form);
      if (res && res.id) {
        removeCastMedia(avatarImage);
        registerUploadedMedia(res.id);
        setAvatarImage({ id: res.id, url: res.url, type: 'IMAGE', purpose: 'CAST_AVATAR' });
        showToast('Tải ảnh đại diện thành công');
      }
    } catch (err: any) {
      showToast('Lỗi tải ảnh: ' + err.message);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
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

    const selectedFiles = Array.from(files);
    const validationError = selectedFiles
      .map(getStoreImageValidationError)
      .find((message): message is string => Boolean(message));
    if (validationError) {
      showToast(validationError);
      if (albumUploadRef.current) albumUploadRef.current.value = '';
      return;
    }

    try {
      setUploadingAlbum(true);
      
      const castId = await ensureCastUploadScope();
      if (!castId) return;
      const uploadPromises = selectedFiles.map(async (file) => {
        const form = new FormData();
        form.append('file', file);
        form.append('purpose', 'CAST_PHOTO');
        form.append('access', 'PUBLIC');
        form.append('castId', castId);
        return apiFormDataClient<any>('/storage/upload', form);
      });

      const results = await Promise.allSettled(uploadPromises);
      const uploadedResults = results.flatMap((result) =>
        result.status === 'fulfilled' && result.value ? [result.value] : [],
      );
      uploadedResults.forEach((result) => registerUploadedMedia(result.id));
      const newAlbums = uploadedResults
        .filter((res) => res.id)
        .map((res) => ({ id: res.id, url: res.url, type: 'IMAGE' }));
      
      if (newAlbums.length > 0) {
        setAlbums(prev => [...prev, ...newAlbums]);
        showToast(`Tải lên ${newAlbums.length} ảnh thành công`);
      }
      if (results.some((result) => result.status === 'rejected')) {
        showToast('Một số ảnh không tải lên được. Các ảnh thành công vẫn được giữ.');
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
    const selectedFiles = Array.from(files);
    const validationError = selectedFiles
      .map(getAdminVideoValidationError)
      .find((message): message is string => Boolean(message));
    if (validationError) {
      showToast(validationError);
      e.target.value = '';
      return;
    }
    try {
      setUploadingVideo(true);

      const castId = await ensureCastUploadScope();
      if (!castId) return;
      const uploadPromises = selectedFiles.map(async (file) => {
        const form = new FormData();
        form.append('file', file);
        form.append('purpose', 'CAST_VIDEO');
        form.append('access', 'PUBLIC');
        form.append('castId', castId);
        return apiFormDataClient<any>('/storage/upload', form);
      });

      const results = await Promise.allSettled(uploadPromises);
      const uploadedResults = results.flatMap((result) =>
        result.status === 'fulfilled' && result.value ? [result.value] : [],
      );
      uploadedResults.forEach((result) => registerUploadedMedia(result.id));
      const newVideos = uploadedResults
        .filter((res) => res.id)
        .map((res) => ({ id: res.id, url: res.url, type: 'VIDEO' }));
      
      if (newVideos.length > 0) {
        setVideos(prev => [...prev, ...newVideos]);
        showToast(`Tải lên ${newVideos.length} video thành công`);
      }
      if (results.some((result) => result.status === 'rejected')) {
        showToast('Một số video không tải lên được. Các video thành công vẫn được giữ.');
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

  const addListItem = (field: 'hobbies' | 'tags', value: string) => {
    const nextValue = value.trim();
    if (!nextValue) return;

    setFormData((prev: CastListFormState) => {
      const currentValues: string[] = prev[field] || [];
      const alreadyExists = currentValues.some(
        (currentValue) => currentValue.toLocaleLowerCase('vi') === nextValue.toLocaleLowerCase('vi'),
      );
      return alreadyExists ? prev : { ...prev, [field]: [...currentValues, nextValue] };
    });
  };

  const removeListItem = (field: 'hobbies' | 'tags', value: string) => {
    setFormData((prev: CastListFormState) => ({
      ...prev,
      [field]: (prev[field] || []).filter((currentValue: string) => currentValue !== value),
    }));
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
  const selectedZodiac = ZODIAC_SIGNS.find(
    (zodiac) => zodiac.value === formData.zodiacSign || zodiac.label === formData.zodiacSign,
  );
  const filteredStores = stores.filter((store) => {
    const isExcluded = store.category === 'MASSAGE_SPA' || store.category === 'RESTAURANT';
    const matchesSearch = !storePickerSearch || (store.name || '').toLowerCase().includes(storePickerSearch.toLowerCase());
    return matchesSearch && !isExcluded;
  });
  const statusOptions = [
    { value: 'ACTIVE', label: 'Hoạt động', description: 'Cast có thể hiển thị khi bật public', tone: colors.green },
    { value: 'PENDING_REVIEW', label: 'Chờ duyệt', description: 'Cast đang chờ Admin kiểm duyệt', tone: colors.gold },
    { value: 'DRAFT', label: 'Bản nháp', description: 'Giữ lại để hoàn thiện', tone: colors.gold },
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: showAdvancedFilters ? '14px' : '24px' }}>
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

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
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
          <button
            type="button"
            aria-expanded={showAdvancedFilters}
            onClick={() => setShowAdvancedFilters((visible) => !visible)}
            style={{
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0 14px',
              borderRadius: '8px',
              border: `1px solid ${showAdvancedFilters || activeAdvancedFilterCount ? colors.borderGold22 : colors.borderSoft}`,
              background: showAdvancedFilters || activeAdvancedFilterCount ? 'rgba(212,178,106,.09)' : colors.surface1,
              color: showAdvancedFilters || activeAdvancedFilterCount ? colors.gold : colors.text2,
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            <SlidersHorizontal size={16} />
            Bộ lọc nâng cao
            {activeAdvancedFilterCount > 0 && (
              <span style={{
                minWidth: '20px',
                height: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 5px',
                borderRadius: '10px',
                background: colors.gold,
                color: colors.onGold,
                fontSize: '11px',
                fontWeight: 800,
              }}>
                {activeAdvancedFilterCount}
              </span>
            )}
          </button>
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

      {showAdvancedFilters && (
        <div style={{
          marginBottom: '20px',
          padding: '18px',
          borderRadius: '14px',
          border: `1px solid ${colors.borderGold22}`,
          background: 'linear-gradient(145deg, rgba(212,178,106,.065), rgba(24,24,31,.96) 42%)',
          boxShadow: '0 18px 45px -35px rgba(212,178,106,.7)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
            <div>
              <div style={{ color: colors.text, fontSize: '14px', fontWeight: 800 }}>Lọc hồ sơ Cast</div>
              <div style={{ color: colors.muted, fontSize: '12px', marginTop: '3px' }}>
                Kết hợp nhiều tiêu chí để thu hẹp danh sách
              </div>
            </div>
            <button
              type="button"
              disabled={!activeAdvancedFilterCount}
              onClick={resetAdvancedFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 10px',
                borderRadius: '8px',
                border: `1px solid ${colors.borderSoft}`,
                background: 'transparent',
                color: activeAdvancedFilterCount ? colors.text2 : '#5f5b54',
                cursor: activeAdvancedFilterCount ? 'pointer' : 'not-allowed',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              <RotateCcw size={13} />
              Đặt lại
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px' }}>
            <AdvancedFilterDropdown
              label="Ngôn ngữ"
              value={languageFilter}
              placeholder="Tất cả ngôn ngữ"
              options={languageOptions}
              onChange={setLanguageFilter}
            />
            <AdvancedFilterDropdown
              label="Địa điểm / Khu vực"
              value={areaFilter}
              placeholder="Tất cả khu vực"
              options={areaOptions}
              onChange={setAreaFilter}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ color: colors.muted, fontSize: '11px', fontWeight: 700, letterSpacing: '.7px', marginBottom: '8px', textTransform: 'uppercase' }}>
                Chiều cao (cm)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  min="100"
                  max="250"
                  inputMode="numeric"
                  value={minHeightFilter}
                  onChange={(event) => setMinHeightFilter(event.target.value)}
                  placeholder="Từ"
                  aria-label="Chiều cao tối thiểu"
                  style={{
                    width: '100%',
                    height: '42px',
                    minWidth: 0,
                    padding: '0 11px',
                    borderRadius: '10px',
                    border: `1px solid ${minHeightFilter ? colors.borderGold22 : colors.borderSoft}`,
                    background: colors.bg,
                    color: colors.text,
                    outline: 'none',
                    fontSize: '13px',
                  }}
                />
                <span style={{ color: colors.muted, fontSize: '12px' }}>–</span>
                <input
                  type="number"
                  min="100"
                  max="250"
                  inputMode="numeric"
                  value={maxHeightFilter}
                  onChange={(event) => setMaxHeightFilter(event.target.value)}
                  placeholder="Đến"
                  aria-label="Chiều cao tối đa"
                  style={{
                    width: '100%',
                    height: '42px',
                    minWidth: 0,
                    padding: '0 11px',
                    borderRadius: '10px',
                    border: `1px solid ${maxHeightFilter ? colors.borderGold22 : colors.borderSoft}`,
                    background: colors.bg,
                    color: colors.text,
                    outline: 'none',
                    fontSize: '13px',
                  }}
                />
              </div>
            </div>
            <AdvancedFilterDropdown
              label="Cung hoàng đạo"
              value={zodiacFilter}
              placeholder="Tất cả cung"
              options={zodiacOptions}
              onChange={setZodiacFilter}
            />
          </div>

          <div style={{ marginTop: '14px', color: colors.muted, fontSize: '12px' }}>
            Tìm thấy <span style={{ color: colors.gold, fontWeight: 800 }}>{filteredCasts.length}</span> hồ sơ phù hợp
          </div>
        </div>
      )}

      {/* TABLE */}
      <div style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.borderSoft}` }}>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px', width: '60px' }}>STT</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>CAST</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>QUÁN TRỰC THUỘC</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>NGÔN NGỮ</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>TRẠNG THÁI</th>
              <th style={{ padding: '16px 24px', width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {paginatedCasts.map((cast, idx) => {
              const statusLabel = getStatusLabel(cast.status, cast.isPublic);
              const statusStyle = getStatusStyle(statusLabel);
              const avatarStyle = getAvatarStyle(cast.stageName);
              const avatarMedia = getCastAvatarMedia(cast.media);
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
                        ...(!avatarMedia?.url ? avatarStyle : { background: colors.surface2 })
                      }}>
                        {avatarMedia?.url ? (
                          <img src={avatarMedia.url} alt={cast.stageName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                    Muốn nhân viên hiển thị trên trang chủ, hãy kiểm duyệt hồ sơ và chuyển trường <span style={{ color: colors.gold, fontWeight: 700 }}>Trạng thái</span> bên dưới sang <span style={{ color: colors.gold, fontWeight: 700 }}>Hoạt động</span>.
                  </div>
                </div>
              )}

              {/* CAST HEADER INFO */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ position: 'relative', width: '100%', maxWidth: '330px', marginTop: '2px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setStorePickerOpen((open) => !open);
                        setMonthPickerOpen(false);
                        setZodiacPickerOpen(false);
                        setStatusPickerOpen(false);
                      }}
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
                  <input
                    type="text"
                    placeholder="Nhập nghệ danh của Cast"
                    value={formData.stageName}
                    onChange={e => setFormData({...formData, stageName: e.target.value})}
                    style={{ background: 'transparent', border: 'none', color: colors.text, fontSize: '24px', fontWeight: 700, outline: 'none', marginTop: '18px', width: '100%' }}
                  />
                </div>
              </div>

              {/* GRID INFO */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div 
                  onClick={() => {
                    setMonthPickerOpen(!monthPickerOpen);
                    setStorePickerOpen(false);
                    setStatusPickerOpen(false);
                    setZodiacPickerOpen(false);
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
                <div
                  onClick={() => {
                    setZodiacPickerOpen(!zodiacPickerOpen);
                    setMonthPickerOpen(false);
                    setStorePickerOpen(false);
                    setStatusPickerOpen(false);
                  }}
                  style={{
                    padding: '16px', background: 'transparent', border: `1px solid ${zodiacPickerOpen ? colors.gold : colors.borderSoft}`, borderRadius: '12px', position: 'relative',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '75px'
                  }}
                >
                  <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '8px' }}>Cung Hoàng Đạo</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: formData.zodiacSign ? colors.text : colors.muted }}>
                    {selectedZodiac?.label || formData.zodiacSign || 'Chọn cung...'}
                  </div>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: '16px', bottom: '20px', transform: zodiacPickerOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>

                  {zodiacPickerOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute', zIndex: 100, top: 'calc(100% + 8px)', left: 0, right: 0,
                        borderRadius: '12px', border: `1px solid ${colors.borderGold22}`, background: '#15151b',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.6)', overflow: 'hidden', maxHeight: '240px', overflowY: 'auto',
                        padding: '6px'
                      }}
                    >
                      {ZODIAC_SIGNS.map((zodiac) => {
                        const isSelected = formData.zodiacSign === zodiac.value || formData.zodiacSign === zodiac.label;
                        return (
                          <button
                            key={zodiac.value}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, zodiacSign: zodiac.value });
                              setZodiacPickerOpen(false);
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
                              justifyContent: 'space-between',
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
                            {zodiac.label}
                            {isSelected ? <Check size={15} color={colors.gold} /> : null}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div style={{ padding: '16px', background: 'transparent', border: `1px solid ${colors.borderSoft}`, borderRadius: '12px' }}>
                  <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '8px' }}>Chiều cao (cm)</div>
                  <input 
                    type="number" 
                    min="50" 
                    max="250" 
                    inputMode="numeric" 
                    placeholder="166" 
                    value={formData.heightCm} 
                    onChange={e => setFormData({ ...formData, heightCm: e.target.value.replace(/\D/g, '') })} 
                    style={{ width: '100%', background: 'transparent', border: 'none', color: colors.text, fontSize: '15px', fontWeight: 700, outline: 'none' }} 
                  />
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
                            min="0"
                            inputMode="numeric"
                            placeholder="V1" 
                            value={v1} 
                            onChange={e => handleMeasurementChange(0, e.target.value.replace(/\D/g, ''))} 
                            style={{ width: '100%', background: 'transparent', border: 'none', color: colors.text, fontSize: '15px', fontWeight: 700, outline: 'none', textAlign: 'center' }} 
                          />
                          <span style={{ color: colors.muted }}>-</span>
                          <input 
                            type="number" 
                            min="0"
                            inputMode="numeric"
                            placeholder="V2" 
                            value={v2} 
                            onChange={e => handleMeasurementChange(1, e.target.value.replace(/\D/g, ''))} 
                            style={{ width: '100%', background: 'transparent', border: 'none', color: colors.text, fontSize: '15px', fontWeight: 700, outline: 'none', textAlign: 'center' }} 
                          />
                          <span style={{ color: colors.muted }}>-</span>
                          <input 
                            type="number" 
                            min="0"
                            inputMode="numeric"
                            placeholder="V3" 
                            value={v3} 
                            onChange={e => handleMeasurementChange(2, e.target.value.replace(/\D/g, ''))} 
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
                </div>
              </div>

              <CastChipInput
                label="Sở thích"
                values={formData.hobbies || []}
                inputValue={hobbyInput}
                placeholder="Ví dụ: Hát"
                onInputChange={setHobbyInput}
                onAdd={(value) => {
                  addListItem('hobbies', value);
                  if (value.trim()) setHobbyInput('');
                }}
                onRemove={(value) => removeListItem('hobbies', value)}
              />

              <CastChipInput
                label="Tags / từ khóa"
                values={formData.tags || []}
                inputValue={tagInput}
                placeholder="Ví dụ: Sang chảnh"
                onInputChange={setTagInput}
                onAdd={(value) => {
                  addListItem('tags', value);
                  if (value.trim()) setTagInput('');
                }}
                onRemove={(value) => removeListItem('tags', value)}
              />

              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '8px' }}>Mô tả</div>
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
                    onClick={() => {
                      setStatusPickerOpen((open) => !open);
                      setStorePickerOpen(false);
                      setMonthPickerOpen(false);
                      setZodiacPickerOpen(false);
                    }}
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
                  <input type="file" ref={imageUploadRef} style={{ display: 'none' }} accept={STORE_IMAGE_ACCEPT} onChange={handleUploadImage} />
                </div>
                
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {avatarImage && (
                    <div style={{ position: 'relative', width: 120, height: 160, borderRadius: '12px', flexShrink: 0 }}>
                      <button
                        type="button"
                        aria-label="Xem ảnh đại diện kích thước lớn"
                        onClick={() => setPreviewImage({ url: avatarImage.url, label: 'Ảnh đại diện' })}
                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: '12px', backgroundImage: `url(${avatarImage.url})`, backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'zoom-in' }}
                      />
                      <button type="button" aria-label="Xóa ảnh đại diện" onClick={() => { removeCastMedia(avatarImage); setAvatarImage(null); }} style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  {uploadingImage && (
                    <DataSkeleton variant="media" count={1} compact ariaLabel="Đang tải ảnh đại diện" style={{ width: 120, height: 160, flexShrink: 0 }} />
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
                  <input type="file" ref={albumUploadRef} style={{ display: 'none' }} accept={STORE_IMAGE_ACCEPT} multiple onChange={handleUploadAlbum} />
                </div>
                
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {albums.map((m, i) => (
                    <div
                      key={m.id || m.url || i}
                      style={{ position: 'relative', width: 120, height: 160, borderRadius: '12px', flexShrink: 0 }}
                    >
                      <button
                        type="button"
                        aria-label={`Xem ảnh album ${i + 1} kích thước lớn`}
                        onClick={() => setPreviewImage({ url: m.url, label: `Ảnh album ${i + 1}` })}
                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: '12px', backgroundImage: `url(${m.url})`, backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'zoom-in' }}
                      />
                      <button type="button" aria-label={`Xóa ảnh album ${i + 1}`} onClick={() => { removeCastMedia(m); setAlbums(albums.filter((_, idx) => idx !== i)); }} style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {uploadingAlbum && (
                    <DataSkeleton variant="media" count={1} compact ariaLabel="Đang tải ảnh album" style={{ width: 120, height: 160, flexShrink: 0 }} />
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
                  <input type="file" ref={videoUploadRef} style={{ display: 'none' }} accept={ADMIN_VIDEO_ACCEPT} multiple onChange={handleUploadVideo} />
                </div>
                
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {videos.map((v, i) => (
                    <div key={i} style={{ position: 'relative', width: 120, height: 160, borderRadius: '12px', flexShrink: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <video src={v.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Play size={24} fill="rgba(255,255,255,0.7)" color="rgba(255,255,255,0.7)" />
                      </div>
                      <button onClick={() => { removeCastMedia(v); setVideos(videos.filter((_, idx) => idx !== i)); }} style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {uploadingVideo && (
                    <DataSkeleton variant="media" count={1} compact ariaLabel="Đang tải video" style={{ width: 120, height: 160, flexShrink: 0 }} />
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

      {previewImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={previewImage.label}
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            background: 'rgba(0,0,0,.88)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div onClick={(event) => event.stopPropagation()} style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              aria-label="Đóng ảnh phóng to"
              onClick={() => setPreviewImage(null)}
              style={{ position: 'absolute', top: '-18px', right: '-18px', zIndex: 1, width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,.2)', background: 'rgba(15,15,19,.9)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,.4)' }}
            >
              <X size={20} />
            </button>
            <img
              src={previewImage.url}
              alt={previewImage.label}
              style={{ display: 'block', maxWidth: 'calc(100vw - 64px)', maxHeight: 'calc(100vh - 96px)', objectFit: 'contain', borderRadius: '14px', boxShadow: '0 24px 80px rgba(0,0,0,.65)' }}
            />
            <div style={{ color: '#f3f0ea', fontSize: '13px', fontWeight: 600 }}>{previewImage.label}</div>
          </div>
        </div>
      )}

    </div>
  );
}
