"use client";

import React, { useState, useEffect, useRef } from 'react';
import { apiClient, apiFormDataClient, resolveClientUrl } from '@/lib/api/client';
import { normalizeAppearanceConfig } from '@/lib/api/appearance';
import {
  APPEARANCE_IMAGE_ACCEPT,
  getAppearanceImageValidationError,
} from '@/lib/media/image-upload-validation';
import {
  deleteUploadedMediaBatch,
  type UploadedMedia,
} from '@/lib/api/media';

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

type AppearanceIconItem = {
  id: string;
  label: string;
  icon: string;
  color?: string;
  featured?: boolean;
};

type AppearanceState = {
  quick: AppearanceIconItem[];
  nav: AppearanceIconItem[];
  titles: { id: string; key: string; label: string }[];
  brand: { name: string; tagline: string; logoUrl?: string };
};

const DEFAULT_ICON_COLOR = '#d4b26a';

const DEFAULT_STATE: AppearanceState = {
  quick: [
    { id: 'q1', label: 'Tìm quán', icon: 'pin' },
    { id: 'q2', label: 'Tìm Cast', icon: 'user' },
    { id: 'q3', label: 'Ưu đãi', icon: 'ticket' },
    { id: 'q4', label: 'Tour', icon: 'map' },
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
    { id: 't4_restaurant', key: 'Tab Nhà Hàng (Khối dịch vụ)', label: 'Nhà hàng' },
    { id: 't4_spa', key: 'Tab Spa (Khối dịch vụ)', label: 'Spa' },
    { id: 't5', key: 'Khối video', label: 'Video Hot' },
    { id: 't6', key: 'Khối cẩm nang', label: 'Tour · Blog · Guide' }
  ],
  brand: { name: 'Vietyoru', tagline: 'VIETNAM NIGHTLIFE GUIDE', logoUrl: '' }
};
type AppearanceConfigResponse = {
  data?: Partial<AppearanceState> | null;
};

const getSvgUri = (k: string, color: string) => {
  const body = ICONS[k] || ICONS.star;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
};

const isCustomIcon = (icon?: string) =>
  Boolean(icon && (/^(https?:|\/|data:image\/)/i.test(icon) || icon.startsWith('storage/')));

const getIconSrc = (icon: string, color: string) =>
  isCustomIcon(icon) ? (resolveClientUrl(icon) || icon) : getSvgUri(icon, color);

const normalizeIconColor = (value?: string) =>
  typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value.trim())
    ? value.trim().toUpperCase()
    : undefined;

const expandHexColor = (value: string) => {
  const hex = value.trim().replace('#', '');
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    return `#${hex.split('').map((char) => `${char}${char}`).join('')}`.toUpperCase();
  }
  if (/^[0-9a-f]{6}$/i.test(hex)) return `#${hex}`.toUpperCase();
  if (/^[0-9a-f]{8}$/i.test(hex)) return `#${hex.slice(0, 6)}`.toUpperCase();
  return undefined;
};

const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')).join('')}`.toUpperCase();

const hexToRgb = (hex: string) => {
  const normalized = expandHexColor(hex);
  if (!normalized) return null;
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  };
};

const hexToRgba = (hex: string, alpha: number) => {
  const rgb = hexToRgb(hex);
  return rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})` : `rgba(212, 178, 106, ${alpha})`;
};

const cssColorNames: Record<string, string> = {
  black: '#000000',
  white: '#FFFFFF',
  red: '#FF0000',
  green: '#008000',
  blue: '#0000FF',
  yellow: '#FFFF00',
  orange: '#FFA500',
  purple: '#800080',
  pink: '#FFC0CB',
  cyan: '#00FFFF',
  magenta: '#FF00FF',
  gold: '#D4AF37',
  gray: '#808080',
  grey: '#808080',
};

const parseCssColor = (value?: string) => {
  if (!value) return undefined;
  const raw = value.trim().toLowerCase();
  if (!raw || raw === 'none' || raw === 'transparent' || raw === 'currentcolor' || raw === 'inherit' || raw.startsWith('url(')) {
    return undefined;
  }
  if (raw.startsWith('#')) return expandHexColor(raw);
  const rgbMatch = raw.match(/rgba?\(([^)]+)\)/);
  if (rgbMatch) {
    const rgbBody = rgbMatch[1];
    if (!rgbBody) return undefined;
    const parts = rgbBody.split(',').map((part) => part.trim());
    if (parts.length >= 3) {
      const alpha: number = parts[3] === undefined ? 1 : Number(parts[3]);
      if (Number.isFinite(alpha) && alpha <= 0.05) return undefined;
      const r = Number(parts[0]?.replace('%', ''));
      const g = Number(parts[1]?.replace('%', ''));
      const b = Number(parts[2]?.replace('%', ''));
      if ([r, g, b].every(Number.isFinite)) return rgbToHex(r, g, b);
    }
  }
  return cssColorNames[raw];
};

const scoreIconColor = (hex: string) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  const lightness = (max + min) / 510;
  const contrastPenalty = lightness < 0.06 || lightness > 0.94 ? 0.45 : 1;
  return (0.35 + saturation * 1.9) * contrastPenalty;
};

const chooseDominantColor = (colors: string[]) => {
  const counts = new Map<string, number>();
  colors.forEach((color) => {
    const normalized = expandHexColor(color);
    if (!normalized) return;
    counts.set(normalized, (counts.get(normalized) || 0) + 1);
  });
  let best = DEFAULT_ICON_COLOR;
  let bestScore = 0;
  counts.forEach((count, color) => {
    const score = count * scoreIconColor(color);
    if (score > bestScore) {
      best = color;
      bestScore = score;
    }
  });
  return best;
};

const extractSvgDominantColor = async (file: File) => {
  const text = await file.text();
  const colors: string[] = [];
  const attributePattern = /\b(?:fill|stroke|stop-color|color)\s*=\s*["']([^"']+)["']/gi;
  const stylePattern = /\b(?:fill|stroke|stop-color|color)\s*:\s*([^;"'}]+)/gi;
  const colorPattern = /#[0-9a-f]{3,8}\b|rgba?\([^)]+\)/gi;

  const collect = (value?: string) => {
    const parsed = parseCssColor(value);
    if (parsed) colors.push(parsed);
  };

  for (const match of text.matchAll(attributePattern)) collect(match[1]);
  for (const match of text.matchAll(stylePattern)) collect(match[1]);
  for (const match of text.matchAll(colorPattern)) collect(match[0]);

  return chooseDominantColor(colors);
};

const extractPngDominantColor = (file: File) =>
  new Promise<string>((resolve) => {
    if (typeof document === 'undefined') {
      resolve(DEFAULT_ICON_COLOR);
      return;
    }

    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      try {
        const size = 72;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(DEFAULT_ICON_COLOR);
          return;
        }
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(image, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        const samples: string[] = [];
        for (let i = 0; i < data.length; i += 16) {
          const alpha = data[i + 3] ?? 0;
          if (alpha < 80) continue;
          const r = data[i] ?? 0;
          const g = data[i + 1] ?? 0;
          const b = data[i + 2] ?? 0;
          const quantizedR = Math.round(r / 24) * 24;
          const quantizedG = Math.round(g / 24) * 24;
          const quantizedB = Math.round(b / 24) * 24;
          samples.push(rgbToHex(quantizedR, quantizedG, quantizedB));
        }
        resolve(chooseDominantColor(samples));
      } catch (err) {
        console.error('Failed to read icon color', err);
        resolve(DEFAULT_ICON_COLOR);
      } finally {
        URL.revokeObjectURL(url);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(DEFAULT_ICON_COLOR);
    };

    image.src = url;
  });

const detectIconDominantColor = (file: File) => {
  const fileName = file.name.toLowerCase();
  if (file.type === 'image/svg+xml' || fileName.endsWith('.svg')) return extractSvgDominantColor(file);
  if (file.type === 'image/png' || fileName.endsWith('.png')) return extractPngDominantColor(file);
  return Promise.resolve(DEFAULT_ICON_COLOR);
};

const getItemIconColor = (item: AppearanceIconItem, fallback = DEFAULT_ICON_COLOR) =>
  normalizeIconColor(item.color) || fallback;

export default function AppearancePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedState, setSavedState] = useState(JSON.stringify(DEFAULT_STATE));
  
  const [quick, setQuick] = useState([...DEFAULT_STATE.quick]);
  const [nav, setNav] = useState([...DEFAULT_STATE.nav]);
  const [titles, setTitles] = useState([...DEFAULT_STATE.titles]);
  const [brand, setBrand] = useState({ ...DEFAULT_STATE.brand });
  
  const [drawer, setDrawer] = useState<{group: 'quick' | 'nav', id: string} | null>(null);
  const [logoOpen, setLogoOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const iconUploadInputRef = useRef<HTMLInputElement>(null);
  const logoUploadInputRef = useRef<HTMLInputElement>(null);
  const pendingAppearanceMediaRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await apiClient<AppearanceConfigResponse>('/system-config/appearance');
        if (res) {
          const normalized = normalizeAppearanceConfig(res.data);
          const fetchedTitles = normalized.titles.map((t) => ({
            id: t.id,
            key: t.key || "",
            label: t.label,
          }));
          const fetchedState = {
            quick: normalized.quick,
            nav: normalized.nav,
            titles: fetchedTitles,
            brand: normalized.brand,
          };
          setSavedState(JSON.stringify(fetchedState));
          setQuick(fetchedState.quick);
          setNav(fetchedState.nav);
          setTitles(fetchedTitles);
          setBrand(fetchedState.brand);
        }
      } catch (err) {
        console.error('Failed to load appearance config', err);
        setToast('Lỗi tải cấu hình: Đang dùng dữ liệu mặc định');
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2600);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const showToast = (m: string) => setToast(m);

  const saved = JSON.parse(savedState) as AppearanceState;
  const brandChanged = JSON.stringify(brand) !== JSON.stringify(saved.brand);
  const brandInitial = (brand.name || 'V').trim().charAt(0).toUpperCase();

  const currentStateStr = JSON.stringify({ quick, nav, titles, brand });
  const dirty = currentStateStr !== savedState;

  let changedCount = 0;
  quick.forEach((it, i) => { const sv = saved.quick[i]; if (!sv || sv.icon !== it.icon || sv.label !== it.label || normalizeIconColor(sv.color) !== normalizeIconColor(it.color) || sv.featured !== it.featured) changedCount++; });
  nav.forEach((it, i) => { const sv = saved.nav[i]; if (!sv || sv.icon !== it.icon || sv.label !== it.label || normalizeIconColor(sv.color) !== normalizeIconColor(it.color)) changedCount++; });
  titles.forEach((t, i) => { const sv = saved.titles[i]; if (!sv || sv.label !== t.label) changedCount++; });
  if (brandChanged) changedCount++;

  const handleUndoAll = async () => {
    await deleteUploadedMediaBatch(pendingAppearanceMediaRef.current.keys());
    pendingAppearanceMediaRef.current.clear();
    setQuick([...saved.quick]);
    setNav([...saved.nav]);
    setTitles([...saved.titles]);
    setBrand({ ...saved.brand });
    showToast('Đã hoàn tác về bản đang chạy');
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      const dataToSave = { quick, nav, titles, brand };
      await apiClient('/admin/system-config/appearance', {
        method: 'PUT',
        data: { value: dataToSave }
      });
      const usedMediaUrls = new Set([
        dataToSave.brand.logoUrl,
        ...dataToSave.quick.map((item) => item.icon),
        ...dataToSave.nav.map((item) => item.icon),
      ]);
      const unusedMediaIds = Array.from(
        pendingAppearanceMediaRef.current.entries(),
      )
        .filter(([, url]) => !usedMediaUrls.has(url))
        .map(([mediaId]) => mediaId);
      await deleteUploadedMediaBatch(unusedMediaIds);
      pendingAppearanceMediaRef.current.clear();
      setSavedState(currentStateStr);
      showToast('Đã lưu thành công và áp dụng giao diện');
    } catch (err) {
      console.error(err);
      showToast(err instanceof Error ? err.message : 'Lưu cấu hình thất bại!');
    } finally {
      setSaving(false);
    }
  };

  const uploadLogoFile = async (file?: File) => {
    if (!file) return;

    const validationError = getAppearanceImageValidationError(file, 'logo');
    if (validationError) {
      showToast(validationError);
      return;
    }

    try {
      setUploadingLogo(true);
      const form = new FormData();
      form.append('file', file);
      form.append('purpose', 'APPEARANCE_LOGO');
      form.append('access', 'PUBLIC');
      const res = await apiFormDataClient<UploadedMedia>('/storage/upload', form);
      if (!res?.url || !res.id) {
        showToast('Không lấy được URL logo sau khi tải lên.');
        return;
      }
      const uploadedUrl = res.url;
      pendingAppearanceMediaRef.current.set(res.id, uploadedUrl);
      setBrand(s => ({ ...s, logoUrl: uploadedUrl }));
      showToast('Tải logo thành công. Bấm Lưu thay đổi để áp dụng.');
    } catch (err) {
      console.error(err);
      showToast(err instanceof Error ? err.message : 'Tải logo thất bại.');
    } finally {
      setUploadingLogo(false);
      if (logoUploadInputRef.current) logoUploadInputRef.current.value = '';
    }
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
    const setIcon = (k: string, color?: string) => {
      const nextColor = normalizeIconColor(color);
      const nextValue = nextColor ? { icon: k, color: nextColor } : { icon: k, color: undefined };
      if (drawer.group === 'quick') {
        setQuick(prev => prev.map(x => x.id === it.id ? { ...x, ...nextValue } : x));
      } else {
        setNav(prev => prev.map(x => x.id === it.id ? { ...x, ...nextValue } : x));
      }
    };

    const uploadIconFile = async (file?: File) => {
      if (!file) return;

      const validationError = getAppearanceImageValidationError(file, 'icon');
      if (validationError) {
        showToast(validationError);
        return;
      }

      try {
        setUploadingIcon(true);
        const form = new FormData();
        form.append('file', file);
        form.append('purpose', 'APPEARANCE_ICON');
        form.append('access', 'PUBLIC');
        const res = await apiFormDataClient<UploadedMedia>('/storage/upload', form);
        if (!res?.url || !res.id) {
          showToast('Không lấy được URL icon sau khi tải lên.');
          return;
        }
        const uploadedUrl = res.url;
        pendingAppearanceMediaRef.current.set(res.id, uploadedUrl);
        setIcon(uploadedUrl);
        showToast('Đã tải icon lên thành công (hiển thị với màu mặc định #e3c27e). Bấm Lưu thay đổi để áp dụng.');
      } catch (err) {
        console.error(err);
        showToast(err instanceof Error ? err.message : 'Tải icon thất bại.');
      } finally {
        setUploadingIcon(false);
        if (iconUploadInputRef.current) iconUploadInputRef.current.value = '';
      }
    };

    const previewColor = getItemIconColor(it, '#e3c27e');
    const hasCustomColor = Boolean(it.color);
    const boxBg = (drawer.group === 'quick' && it.featured)
      ? 'rgba(212, 178, 106, 0.05)'
      : hasCustomColor 
        ? hexToRgba(it.color!, .12)
        : 'rgba(255, 255, 255, 0.035)';

    const boxBorder = (drawer.group === 'quick' && it.featured)
      ? '1px solid rgba(212, 178, 106, 0.32)'
      : hasCustomColor
        ? `1px solid ${hexToRgba(it.color!, .46)}`
        : '1px solid rgba(255, 255, 255, 0.07)';

    const boxShadow = (drawer.group === 'quick' && it.featured)
      ? '0 10px 20px -10px rgba(212, 178, 106, 0.15)'
      : hasCustomColor
        ? `0 14px 26px -22px ${it.color}`
        : 'none';

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '14px', padding: '13px 15px' }}>
              <span 
                style={{ 
                  width: '58px', 
                  height: '58px', 
                  flex: 'none', 
                  borderRadius: '16px', 
                  background: boxBg, 
                  border: boxBorder, 
                  boxShadow: boxShadow,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <span
                  style={{
                    width: '26px',
                    height: '26px',
                    backgroundColor: previewColor,
                    WebkitMask: `url(${getIconSrc(it.icon, previewColor)}) no-repeat center / contain`,
                    mask: `url(${getIconSrc(it.icon, previewColor)}) no-repeat center / contain`,
                    display: 'block'
                  }}
                />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.3px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '6px' }}>Tên hiển thị</div>
                <input value={it.label} onChange={setLabel} maxLength={16} style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '10px', padding: '10px 12px', color: '#f3f0ea', fontSize: '13.5px', fontFamily: "'Inter', sans-serif", outline: 'none' }} />
                {drawer.group === 'quick' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                    <input 
                      type="checkbox" 
                      id="icon-featured-toggle"
                      checked={Boolean(it.featured)} 
                      onChange={e => {
                        const val = e.target.checked;
                        setQuick(prev => prev.map(x => x.id === it.id ? { ...x, featured: val } : x));
                      }} 
                      style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                    />
                    <label htmlFor="icon-featured-toggle" style={{ fontSize: '12px', color: '#c5c0b6', cursor: 'pointer', fontWeight: 600, userSelect: 'none' }}>
                      Nổi bật (có viền vàng bao quanh)
                    </label>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '8px', color: '#8c8679', fontSize: '10.5px', fontWeight: 600 }}>
                  <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: previewColor, boxShadow: `0 0 0 3px ${hexToRgba(previewColor, .14)}` }}></span>
                  Màu icon: <b style={{ color: '#f0dda8' }}>{previewColor}</b>
                </div>
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
              <input
                ref={iconUploadInputRef}
                type="file"
                accept={APPEARANCE_IMAGE_ACCEPT}
                style={{ display: 'none' }}
                onChange={(event) => uploadIconFile(event.target.files?.[0])}
              />
              <div
                onClick={() => !uploadingIcon && iconUploadInputRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'copy';
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (!uploadingIcon) uploadIconFile(event.dataTransfer.files?.[0]);
                }}
                style={{ border: '1.5px dashed rgba(212,178,106,.35)', borderRadius: '13px', padding: '20px', textAlign: 'center', cursor: uploadingIcon ? 'wait' : 'pointer', opacity: uploadingIcon ? .65 : 1 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4b26a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 20h16"/></svg>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#e3c27e', marginTop: '6px' }}>{uploadingIcon ? 'Đang tải icon...' : 'Kéo thả file .svg / .png vào đây'}</div>
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
            <div style={{ background: '#0e0d12', border: '1px solid rgba(255,255,255,.08)', borderRadius: '13px', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '62px' }}>
              {brand.logoUrl ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={resolveClientUrl(brand.logoUrl) || brand.logoUrl} alt="" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
                  <span onClick={() => setBrand(s => ({ ...s, logoUrl: '' }))} style={{ fontSize: '10px', color: '#ef4444', cursor: 'pointer', border: '1px solid rgba(239,68,68,.3)', borderRadius: '6px', padding: '2px 6px', marginLeft: '6px' }}>Xóa logo</span>
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight: 800, fontSize: '22px', lineHeight: 1, background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-.4px' }}>{brand.name || 'Vietyoru'}</div>
                  <div style={{ fontSize: '7px', letterSpacing: '2.8px', color: '#8c8679', marginTop: '4px', textTransform: 'uppercase' }}>{brand.tagline}</div>
                </div>
              )}
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
              <input
                ref={logoUploadInputRef}
                type="file"
                accept={APPEARANCE_IMAGE_ACCEPT}
                style={{ display: 'none' }}
                onChange={(event) => uploadLogoFile(event.target.files?.[0])}
              />
              <div 
                onClick={() => !uploadingLogo && logoUploadInputRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'copy';
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (!uploadingLogo) uploadLogoFile(event.dataTransfer.files?.[0]);
                }}
                style={{ border: '1.5px dashed rgba(212,178,106,.35)', borderRadius: '13px', padding: '22px', textAlign: 'center', cursor: uploadingLogo ? 'wait' : 'pointer', opacity: uploadingLogo ? .65 : 1 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4b26a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 20h16"/></svg>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#e3c27e', marginTop: '6px' }}>{uploadingLogo ? 'Đang tải logo...' : 'Kéo thả file .svg / .png vào đây'}</div>
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

      <div style={{ padding: '22px 26px 110px', opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
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
              <span onClick={() => {
                if (brand.logoUrl) {
                  window.open(resolveClientUrl(brand.logoUrl) || brand.logoUrl, '_blank');
                } else {
                  showToast('Chưa có file logo được tải lên');
                }
              }} style={{ fontSize: '11.5px', fontWeight: 600, color: '#c5c0b6', border: '1px solid rgba(255,255,255,.13)', borderRadius: '9px', padding: '7px 13px', cursor: 'pointer' }}>
                {brand.logoUrl ? 'Tải logo' : 'Tải .svg'}
              </span>
              <span onClick={() => setLogoOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '11.5px', fontWeight: 700, color: '#241a0a', background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', borderRadius: '9px', padding: '7px 14px', cursor: 'pointer', boxShadow: '0 10px 20px -10px rgba(168,124,60,.6)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4.5l5 5L8 21H3v-5z"/><path d="M12.5 6.5l5 5"/></svg>Thay logo
              </span>
            </div>

            <div style={{ border: '1px solid rgba(255,255,255,.07)', borderRadius: '13px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', background: '#0e0d12', padding: '13px 18px' }}>
                <div style={{ flex: 'none' }}>
                  {brand.logoUrl ? (
                    <img src={resolveClientUrl(brand.logoUrl) || brand.logoUrl} alt="" style={{ height: '28px', width: 'auto', objectFit: 'contain', display: 'block' }} />
                  ) : (
                    <>
                      <div style={{ fontWeight: 800, fontSize: '20px', lineHeight: 1, background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-.4px' }}>{brand.name || 'Vietyoru'}</div>
                      <div style={{ fontSize: '6.5px', letterSpacing: '2.6px', color: '#8c8679', marginTop: '3px', textTransform: 'uppercase' }}>{brand.tagline}</div>
                    </>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '15px', fontSize: '11.5px', color: '#8c8679' }}>
                  <span>Trang chủ</span><span>Tìm quán</span><span>Cast</span><span>Ưu đãi</span>
                </div>
                <div style={{ flex: 1 }}></div>
                <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '1px', color: '#57534b', textTransform: 'uppercase' }}>Desktop · cao 28px</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0c0c0f', padding: '10px 15px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
                <div>
                  {brand.logoUrl ? (
                    <img src={resolveClientUrl(brand.logoUrl) || brand.logoUrl} alt="" style={{ height: '22px', width: 'auto', objectFit: 'contain', display: 'block' }} />
                  ) : (
                    <>
                      <div style={{ fontWeight: 800, fontSize: '15.5px', lineHeight: 1, background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{brand.name || 'Vietyoru'}</div>
                      <div style={{ fontSize: '5.5px', letterSpacing: '2.2px', color: '#8c8679', marginTop: '2px', textTransform: 'uppercase' }}>{brand.tagline}</div>
                    </>
                  )}
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
            {quick.map(t => {
              const color = getItemIconColor(t);
              const hasColor = Boolean(t.color);
              const gridBg = t.featured
                ? 'rgba(212, 178, 106, 0.05)'
                : hasColor
                  ? hexToRgba(t.color!, .12)
                  : 'rgba(255, 255, 255, 0.035)';
              const gridBorder = t.featured
                ? '1px solid rgba(212, 178, 106, 0.32)'
                : hasColor
                  ? `1px solid ${hexToRgba(t.color!, .46)}`
                  : '1px solid rgba(255, 255, 255, 0.07)';
              const gridShadow = t.featured
                ? '0 10px 20px -10px rgba(212, 178, 106, 0.15)'
                : hasColor
                  ? `0 10px 20px -10px ${hexToRgba(t.color!, .3)}`
                  : 'none';

              return (
                <div key={t.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <span 
                    style={{ 
                      width: '52px', 
                      height: '52px', 
                      borderRadius: '15px', 
                      background: gridBg, 
                      border: gridBorder, 
                      boxShadow: gridShadow,
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                  >
                    <span
                      style={{
                        width: '22px',
                        height: '22px',
                        backgroundColor: color,
                        WebkitMask: `url(${getIconSrc(t.icon, color)}) no-repeat center / contain`,
                        mask: `url(${getIconSrc(t.icon, color)}) no-repeat center / contain`,
                        display: 'block'
                      }}
                    />
                  </span>
                  <span style={{ fontSize: '11px', color: '#c5c0b6', whiteSpace: 'nowrap' }}>{t.label}</span>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: '9.5px', color: '#57534b', textAlign: 'center', marginTop: '10px', letterSpacing: '.6px', textTransform: 'uppercase' }}>Xem trước trên trang chủ</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '10px', marginBottom: '28px' }}>
          {quick.map((r, i) => {
            const sv = saved.quick[i];
            const changed = !sv || sv.icon !== r.icon || sv.label !== r.label || normalizeIconColor(sv.color) !== normalizeIconColor(r.color) || sv.featured !== r.featured;
            const hasColor = Boolean(r.color);
            const cardIconBg = r.featured
              ? 'rgba(212, 178, 106, 0.05)'
              : hasColor
                ? hexToRgba(r.color!, .12)
                : 'rgba(255, 255, 255, 0.04)';
            const cardIconBorder = r.featured
              ? '1px solid rgba(212, 178, 106, 0.32)'
              : hasColor
                ? `1px solid ${hexToRgba(r.color!, .46)}`
                : '1px solid rgba(255, 255, 255, 0.08)';
            const cardIconShadow = r.featured
              ? '0 6px 12px -6px rgba(212, 178, 106, 0.15)'
              : 'none';

            return (
              <div key={r.id} onClick={() => setDrawer({ group: 'quick', id: r.id })} style={{ display: 'flex', alignItems: 'center', gap: '11px', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '13px', padding: '10px 12px', cursor: 'pointer' }}>
                <span style={{ width: '38px', height: '38px', flex: 'none', borderRadius: '11px', background: cardIconBg, border: cardIconBorder, boxShadow: cardIconShadow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span
                    style={{
                      width: '19px',
                      height: '19px',
                      backgroundColor: getItemIconColor(r, '#e3c27e'),
                      WebkitMask: `url(${getIconSrc(r.icon, getItemIconColor(r, '#e3c27e'))}) no-repeat center / contain`,
                      mask: `url(${getIconSrc(r.icon, getItemIconColor(r, '#e3c27e'))}) no-repeat center / contain`,
                      display: 'block'
                    }}
                  />
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
              const color = getItemIconColor(t, lc);
              return (
                <div key={t.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: color,
                      WebkitMask: `url(${getIconSrc(t.icon, color)}) no-repeat center / contain`,
                      mask: `url(${getIconSrc(t.icon, color)}) no-repeat center / contain`,
                      display: 'block'
                    }}
                  />
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
            const changed = !sv || sv.icon !== r.icon || sv.label !== r.label || normalizeIconColor(sv.color) !== normalizeIconColor(r.color);
            return (
              <div key={r.id} onClick={() => setDrawer({ group: 'nav', id: r.id })} style={{ display: 'flex', alignItems: 'center', gap: '11px', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '13px', padding: '10px 12px', cursor: 'pointer' }}>
                <span style={{ width: '38px', height: '38px', flex: 'none', borderRadius: '11px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span
                    style={{
                      width: '19px',
                      height: '19px',
                      backgroundColor: getItemIconColor(r, '#e3c27e'),
                      WebkitMask: `url(${getIconSrc(r.icon, getItemIconColor(r, '#e3c27e'))}) no-repeat center / contain`,
                      mask: `url(${getIconSrc(r.icon, getItemIconColor(r, '#e3c27e'))}) no-repeat center / contain`,
                      display: 'block'
                    }}
                  />
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
          {titles.filter(t => t.id !== 't4_restaurant' && t.id !== 't4_spa').map((t) => {
            const sv = saved.titles.find(x => x.id === t.id);
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
          <span onClick={saving ? undefined : handleSaveAll} style={{ fontSize: '12.5px', fontWeight: 700, color: '#241a0a', background: saving ? '#c5c0b6' : 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', borderRadius: '10px', padding: '9px 18px', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 12px 24px -12px rgba(168,124,60,.6)' }}>
            {saving ? 'Đang lưu...' : 'Lưu & áp dụng'}
          </span>
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
