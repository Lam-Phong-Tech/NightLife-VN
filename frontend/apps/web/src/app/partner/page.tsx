'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  CalendarDays,
  Camera,
  ChevronRight,
  CheckCircle2,
  ChevronDown,
  Eye,
  FileClock,
  FileText,
  Home,
  ImagePlus,
  LogOut,
  Moon,
  Play,
  Plus,
  QrCode,
  ReceiptText,
  RefreshCcw,
  Save,
  Send,
  ShieldCheck,
  Sun,
  TicketCheck,
  TrendingUp,
  Upload,
  UsersRound,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import jsQR from 'jsqr';
import { useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError, apiClient, apiFormDataClient, resolveClientUrl } from '@/lib/api/client';
import { billApi } from '@/lib/api/bills';
import { clearAuthSession } from '@/lib/auth/session';

const colors = {
  bg: 'var(--partner-bg, #0c0c0f)',
  surface1: 'var(--partner-surface-1, rgba(255,255,255,.035))',
  surface2: 'var(--partner-surface-2, rgba(255,255,255,.04))',
  surface3: 'var(--partner-surface-3, rgba(255,255,255,.05))',
  navBg: 'var(--partner-nav-bg, rgba(8,8,11,.9))',
  headerBg: 'var(--partner-header-bg, rgba(12,12,15,.72))',
  popoverBg: 'var(--partner-popover-bg, linear-gradient(180deg,rgba(28,27,31,.98),rgba(12,12,15,.98)))',
  activeControlBg: 'var(--partner-active-control-bg, rgba(212,178,106,.16))',
  borderSoft: 'var(--partner-border-soft, rgba(255,255,255,.06))',
  borderHair: 'var(--partner-border-hair, rgba(255,255,255,.08))',
  borderGold12: 'var(--partner-border-gold-12, rgba(212,178,106,.18))',
  borderGold22: 'var(--partner-border-gold-22, rgba(212,178,106,.22))',
  borderGold32: 'var(--partner-border-gold-32, rgba(212,178,106,.32))',
  borderGold40: 'var(--partner-border-gold-40, rgba(212,178,106,.4))',
  text: 'var(--partner-text, #f3f0ea)',
  text2: 'var(--partner-text-2, #c5c0b6)',
  muted: 'var(--partner-muted, #8c8679)',
  onGold: 'var(--partner-on-gold, #241a0a)',
  gold: 'var(--partner-gold, #d4b26a)',
  goldBright: 'var(--partner-gold-bright, #e3c27e)',
  goldPale: 'var(--partner-gold-pale, #f0dda8)',
  goldGrad: 'var(--partner-gold-grad, linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a))',
  danger: 'var(--partner-danger, #ffb4a8)',
  success: 'var(--partner-success, #8de6b0)',
  neonPink: 'var(--partner-neon-pink, #e0729e)',
};

type PartnerTheme = 'dark' | 'light';
type PartnerThemeVariables = React.CSSProperties & Record<`--partner-${string}`, string>;

const partnerThemeStorageKey = 'vy-user-theme';

const partnerDarkThemeVariables: PartnerThemeVariables = {
  '--partner-bg': '#0c0c0f',
  '--partner-surface-1': 'rgba(255,255,255,.035)',
  '--partner-surface-2': 'rgba(255,255,255,.04)',
  '--partner-surface-3': 'rgba(255,255,255,.05)',
  '--partner-nav-bg': 'rgba(8,8,11,.9)',
  '--partner-header-bg': 'rgba(12,12,15,.72)',
  '--partner-popover-bg': 'linear-gradient(180deg,rgba(28,27,31,.98),rgba(12,12,15,.98))',
  '--partner-active-control-bg': 'rgba(212,178,106,.16)',
  '--partner-border-soft': 'rgba(255,255,255,.06)',
  '--partner-border-hair': 'rgba(255,255,255,.08)',
  '--partner-border-gold-12': 'rgba(212,178,106,.18)',
  '--partner-border-gold-22': 'rgba(212,178,106,.22)',
  '--partner-border-gold-32': 'rgba(212,178,106,.32)',
  '--partner-border-gold-40': 'rgba(212,178,106,.4)',
  '--partner-text': '#f3f0ea',
  '--partner-text-2': '#c5c0b6',
  '--partner-muted': '#8c8679',
  '--partner-on-gold': '#241a0a',
  '--partner-gold': '#d4b26a',
  '--partner-gold-bright': '#e3c27e',
  '--partner-gold-pale': '#f0dda8',
  '--partner-gold-grad': 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)',
  '--partner-danger': '#ffb4a8',
  '--partner-success': '#8de6b0',
  '--partner-neon-pink': '#e0729e',
};

const partnerLightThemeVariables: PartnerThemeVariables = {
  '--partner-bg': '#f4eddf',
  '--partner-surface-1': 'rgba(255,255,255,.86)',
  '--partner-surface-2': 'rgba(255,255,255,.78)',
  '--partner-surface-3': 'rgba(255,255,255,.92)',
  '--partner-nav-bg': 'rgba(255,250,241,.96)',
  '--partner-header-bg': 'rgba(255,250,241,.88)',
  '--partner-popover-bg': 'linear-gradient(180deg,rgba(255,252,247,.98),rgba(245,237,224,.98))',
  '--partner-active-control-bg': 'rgba(180,132,48,.16)',
  '--partner-border-soft': 'rgba(112,82,34,.12)',
  '--partner-border-hair': 'rgba(112,82,34,.14)',
  '--partner-border-gold-12': 'rgba(166,119,38,.18)',
  '--partner-border-gold-22': 'rgba(166,119,38,.26)',
  '--partner-border-gold-32': 'rgba(166,119,38,.34)',
  '--partner-border-gold-40': 'rgba(166,119,38,.42)',
  '--partner-text': '#241d14',
  '--partner-text-2': '#5f5547',
  '--partner-muted': '#8b7d6a',
  '--partner-on-gold': '#23180a',
  '--partner-gold': '#a67425',
  '--partner-gold-bright': '#b98735',
  '--partner-gold-pale': '#75511b',
  '--partner-gold-grad': 'linear-gradient(135deg,#f8e8b2,#d7ab50 55%,#b98931)',
  '--partner-danger': '#ad3e35',
  '--partner-success': '#14834f',
  '--partner-neon-pink': '#d9548b',
};

const readStoredPartnerTheme = (): PartnerTheme => {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const storedTheme = window.localStorage.getItem(partnerThemeStorageKey);
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return document.documentElement.classList.contains('vy-light') ? 'light' : 'dark';
};

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: '158px',
        borderRadius: '12px',
        border: `1px solid ${colors.borderHair}`,
        background: colors.surface2,
        color: colors.muted,
        display: 'grid',
        placeItems: 'center',
        fontSize: '13px',
        fontWeight: 700,
      }}
    >
      Đang tải Editor...
    </div>
  ),
});

type PartnerStore = {
  id: string;
  name: string;
  slug: string;
  status: string;
  category?: string;
  city?: string;
  district?: string | null;
  ward?: string | null;
};

type PartnerListingPricing = {
  label: string;
  value: string;
  note?: string | null;
};

type PartnerListingOpeningHour = {
  day: string;
  isOff?: boolean;
  hours?: string;
};

type PartnerListingMenuItem = {
  name: string;
  description?: string;
  priceTier?: string;
  isHot?: boolean;
  imageUrl?: string;
};

type PartnerListingMenuGroup = {
  name: string;
  items: PartnerListingMenuItem[];
};

type PartnerListingCast = {
  stageName: string;
  storeName?: string | null;
  publicHeadline?: string | null;
  bio?: string | null;
  tags?: string[];
  languages?: string[];
  birthMonth?: number;
  zodiacSign?: string | null;
  heightCm?: number;
  measurements?: string | null;
  hobbies?: string[];
  youtubeLinks?: string[];
  hourlyRateVnd?: number;
  mediaUrls?: string[];
};

type PartnerListingDraft = {
  storeName: string;
  businessType: string;
  storeCategory: string;
  area: string;
  storeCity: string;
  storeDistrict: string;
  ward: string;
  wardName: string;
  streetAddress: string;
  storeAddress: string;
  phone: string;
  openingHours: string;
  openingHourItems: PartnerListingOpeningHour[];
  priceRange: string;
  description: string;
  note: string;
  menuSummary: string;
  menuGroups: PartnerListingMenuGroup[];
  mapUrl: string;
  tags: string[];
  coverImageUrl: string;
  galleryUrls: string[];
  videoUrls: string[];
  pricingItems: PartnerListingPricing[];
  castProfiles: PartnerListingCast[];
  mediaUrls: string[];
};

type PartnerListingReview = {
  id: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string | null;
  reviewReason?: string | null;
  publicState?: string | null;
} | null;

type PartnerListingDraftResponse = {
  message: string;
  store: Pick<PartnerStore, 'id' | 'name' | 'slug' | 'status'>;
  contentId: string | null;
  contentStatus: string;
  savedAt: string | null;
  publishedAt: string | null;
  review: PartnerListingReview;
  draft: PartnerListingDraft;
};

type StorageUploadResponse = {
  url?: string | null;
  originalName?: string | null;
  mimeType?: string | null;
};

type ListingValidationMode = 'draft' | 'submit';
type ListingValidationErrors = Record<string, string>;
type ListingValidationResult = {
  errors: ListingValidationErrors;
  firstTab: ListingTabKey | null;
};

type PartnerCoupon = {
  id: string;
  code: string;
  name: string;
  status: string;
  usedCount: number;
  usageLimit: number | null;
};

type PartnerBooking = {
  id: string;
  status: string;
  scheduledAt: string;
  partySize: number;
  totalVnd: number | null;
  store: { id?: string; name: string };
};

type PartnerBill = {
  id: string;
  storeId?: string | null;
  billNumber: string | null;
  status: string;
  totalVnd: number | null;
  discountVnd: number | null;
  submittedAt: string | null;
  usedAt?: string | null;
  submitterType?: string | null;
  store?: { id?: string | null; name: string; slug?: string | null } | null;
  booking?: { id: string; status: string; scheduledAt?: string | null } | null;
  coupon?: { code: string; name: string } | null;
  couponIssue?: { id: string; code: string; status: string } | null;
  media?: { id: string; originalName?: string | null; url?: string | null; mimeType?: string | null }[];
};

type PartnerLiteDashboard = {
  period: 'today' | 'seven' | 'thirty';
  from: string;
  to: string;
  bookingCount: number;
  profileViewCount: number;
  customerArrivalCount: number;
  customerArrivalSource: 'QR_USED' | 'BILL_APPROVED';
  qrUsedCount: number;
  billApprovedCount: number;
  storeCount: number;
  stores: {
    id: string;
    name: string;
    slug: string;
    bookingCount: number;
    profileViewCount: number;
    customerArrivalCount: number;
  }[];
  weeklyBookings: { label: string; date: string; count: number }[];
  privacy: { customerDetailVisible: boolean; note: string };
};

type PartnerScanIssue = {
  scanType?: 'COUPON_ISSUE' | 'BOOKING_QR';
  id: string;
  code: string;
  status: string;
  statusLabel?: string;
  expiresAt?: string | null;
  usedAt?: string | null;
  scannedById?: string | null;
  userType?: string | null;
  customer?: { type: string; label: string } | null;
  booking?: { status: string; scheduledAt?: string | null } | null;
  coupon?: {
    id: string;
    code: string;
    name: string;
    discountType?: string | null;
    discountValue?: number | null;
    maxDiscountVnd?: number | null;
    minSpendVnd?: number | null;
    store?: { id: string; name: string; slug: string } | null;
  } | null;
  couponIssue?: { id: string; code: string; status: string } | null;
  discountPercent?: number | null;
  discountRuleSnapshot?: any;
};

type BarcodeDetectorResult = { rawValue?: string };
type BarcodeDetectorInstance = {
  detect(source: HTMLVideoElement): Promise<BarcodeDetectorResult[]>;
};
type BarcodeDetectorConstructor = new (options: { formats: string[] }) => BarcodeDetectorInstance;
type BarcodeDetectorWindow = Window & { BarcodeDetector?: BarcodeDetectorConstructor };
type VietnamProvince = { code: number; name: string };
type VietnamWard = { code: number; name: string };
const panelKeys = ['overview', 'scan', 'settlement', 'listing', 'bill'] as const;
type PanelKey = (typeof panelKeys)[number];
type PartnerNotificationTone = 'gold' | 'success' | 'warning' | 'danger' | 'info';
type PartnerNotification = {
  id: string;
  category: string;
  title: string;
  message: string;
  meta: string;
  actionLabel: string;
  panel: PanelKey;
  listingTab?: ListingTabKey;
  tone: PartnerNotificationTone;
  icon: LucideIcon;
  unread: boolean;
};
type ListingTabKey = 'store' | 'cast';
type PeriodKey = 'today' | 'seven' | 'thirty';
type OfflineScanQueueItem = {
  payload: string;
  queuedAt: string;
  attempts: number;
  lastError?: string | null;
};

type NormalizedScanPayload = {
  kind: 'booking' | 'signed' | 'coupon';
  payload: string;
  raw: string;
  label: string;
};

const offlineScanQueueKey = 'nightlife:offline-coupon-scans';
const partnerNotificationReadKey = 'nightlife:partner-notification-read-ids';
const offlineScanQueueTtlMs = 24 * 60 * 60 * 1000;
const offlineScanQueueMaxAttempts = 3;
const offlineScanQueueMaxItems = 25;
const billSubmitDeadlineMs = 10 * 24 * 60 * 60 * 1000;
const signedQrTokenPattern = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const bookingCodePattern = /^#?BK-[A-Z0-9-]{6,}$/i;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const listingOpeningDays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
const defaultListingOpeningSlot = '19:00 - 24:00';
const listingTimeOptions = Array.from({ length: 24 }, (_, index) => `${String(index).padStart(2, '0')}:00`).concat(['24:00']);
const listingBirthMonthOptions = Array.from({ length: 12 }, (_, index) => ({
  value: String(index + 1),
  label: `Tháng ${index + 1}`,
}));
const listingZodiacOptions = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
].map((zodiac) => ({ value: zodiac, label: zodiac }));
const suggestedListingTags = [
  'Club',
  'Phòng VIP',
  'Hỗ trợ tiếng Nhật',
  'DJ hàng đầu',
  'Nhạc hay',
  'Không gian đẹp',
  'Cocktail',
  'Rooftop',
  'Sang trọng',
  'Sôi động',
];

const defaultListingOpeningHours = (): PartnerListingOpeningHour[] =>
  listingOpeningDays.map((day) => ({ day, isOff: false, hours: defaultListingOpeningSlot }));

const isSignedQrPayload = (value: string) => {
  if (signedQrTokenPattern.test(value)) {
    return true;
  }

  try {
    const url = new URL(value, 'https://nightlife.local');
    return Boolean(url.searchParams.get('scanToken') ?? url.searchParams.get('token'));
  } catch {
    return false;
  }
};

const isBookingQrPayload = (value: string) =>
  value.trim().toUpperCase().startsWith('NLBOOKING|');

const bookingPayloadFromId = (bookingId: string, bookingCode?: string | null) => {
  const code = bookingCode?.trim() || (uuidPattern.test(bookingId) ? `BK-${bookingId.slice(0, 8).toUpperCase()}` : bookingId.trim());
  return `NLBOOKING|${bookingId.trim()}|${code}||`;
};

const normalizePartnerScanPayload = (
  value: string,
  depth = 0,
): NormalizedScanPayload | null => {
  const raw = value.trim();
  if (!raw) {
    return null;
  }

  if (depth > 3) {
    return { kind: 'coupon', payload: raw, raw, label: 'mã coupon' };
  }

  if (isBookingQrPayload(raw)) {
    return { kind: 'booking', payload: raw, raw, label: 'QR đặt chỗ' };
  }

  if (bookingCodePattern.test(raw)) {
    const code = raw.replace(/^#/, '').toUpperCase();
    return { kind: 'booking', payload: `NLBOOKING||${code}||`, raw, label: 'mã đặt chỗ' };
  }

  if (isSignedQrPayload(raw)) {
    return { kind: 'signed', payload: raw, raw, label: 'QR coupon' };
  }

  try {
    const url = new URL(raw, 'https://nightlife.local');
    const wrappedPayload =
      url.searchParams.get('data') ??
      url.searchParams.get('payload') ??
      url.searchParams.get('qrPayload');
    if (wrappedPayload && wrappedPayload.trim() !== raw) {
      const normalizedWrapped = normalizePartnerScanPayload(wrappedPayload, depth + 1);
      if (normalizedWrapped) {
        return { ...normalizedWrapped, raw };
      }
    }

    const bookingId =
      url.searchParams.get('bookingId') ??
      url.searchParams.get('booking') ??
      url.searchParams.get('booking_id');
    if (bookingId) {
      return {
        kind: 'booking',
        payload: bookingPayloadFromId(bookingId, url.searchParams.get('code')),
        raw,
        label: 'link đặt chỗ',
      };
    }

    const token = url.searchParams.get('scanToken') ?? url.searchParams.get('token');
    if (token) {
      return { kind: 'signed', payload: raw, raw, label: 'link QR coupon' };
    }
  } catch {
    // Keep falling through to manual coupon code mode.
  }

  // SHA-256 hash from admin panel QR (legacy) – route through POST body endpoint
  if (/^[0-9a-f]{64}$/i.test(raw)) {
    return { kind: 'signed', payload: raw, raw, label: 'QR coupon (hash)' };
  }

  return { kind: 'coupon', payload: raw, raw, label: 'mã coupon' };
};

const readQrFromVideoFrame = async (
  video: HTMLVideoElement,
  detector: BarcodeDetectorInstance | null,
  canvas: HTMLCanvasElement,
) => {
  if (detector) {
    try {
      const codes = await detector.detect(video);
      const nativeValue = codes.find((code) => code.rawValue)?.rawValue?.trim();
      if (nativeValue) {
        return nativeValue;
      }
    } catch {
      // Fall back to jsQR below for browsers with partial BarcodeDetector support.
    }
  }

  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) {
    return null;
  }

  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    return null;
  }

  context.drawImage(video, 0, 0, width, height);
  const imageData = context.getImageData(0, 0, width, height);
  return (
    jsQR(imageData.data, width, height, { inversionAttempts: 'attemptBoth' })?.data.trim() ?? null
  );
};

const pruneOfflineScanQueue = (items: OfflineScanQueueItem[], now = Date.now()) => {
  const seen = new Set<string>();
  const pruned: OfflineScanQueueItem[] = [];

  for (const item of items) {
    const payload = item.payload.trim();
    if (!payload || seen.has(payload)) {
      continue;
    }

    const queuedAtMs = Date.parse(item.queuedAt);
    const safeQueuedAtMs = Number.isFinite(queuedAtMs) ? queuedAtMs : now;
    const attempts = Number.isFinite(item.attempts) ? Math.max(0, Math.trunc(item.attempts)) : 0;
    if (now - safeQueuedAtMs > offlineScanQueueTtlMs || attempts >= offlineScanQueueMaxAttempts) {
      continue;
    }

    seen.add(payload);
    pruned.push({
      payload,
      queuedAt: new Date(safeQueuedAtMs).toISOString(),
      attempts,
      lastError: item.lastError ?? null,
    });
  }

  return pruned.slice(-offlineScanQueueMaxItems);
};

const normalizeOfflineScanQueue = (value: unknown, now = Date.now()) => {
  const rawItems = Array.isArray(value) ? value : [];
  const items = rawItems.flatMap((item): OfflineScanQueueItem[] => {
    if (typeof item === 'string') {
      return [
        { payload: item, queuedAt: new Date(now).toISOString(), attempts: 0, lastError: null },
      ];
    }

    if (!item || typeof item !== 'object') {
      return [];
    }

    const raw = item as Partial<OfflineScanQueueItem>;
    if (typeof raw.payload !== 'string') {
      return [];
    }

    return [
      {
        payload: raw.payload,
        queuedAt: typeof raw.queuedAt === 'string' ? raw.queuedAt : new Date(now).toISOString(),
        attempts: typeof raw.attempts === 'number' ? raw.attempts : 0,
        lastError: typeof raw.lastError === 'string' ? raw.lastError : null,
      },
    ];
  });

  return pruneOfflineScanQueue(items, now);
};

const readOfflineScanQueue = (): OfflineScanQueueItem[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(offlineScanQueueKey);
    const parsed = rawValue ? JSON.parse(rawValue) : [];
    const queue = normalizeOfflineScanQueue(parsed);
    if (rawValue !== JSON.stringify(queue)) {
      window.localStorage.setItem(offlineScanQueueKey, JSON.stringify(queue));
    }
    return queue;
  } catch {
    return [];
  }
};

const readPartnerNotificationIds = (): string[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(partnerNotificationReadKey);
    const parsed = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string').slice(-80)
      : [];
  } catch {
    return [];
  }
};

const writeOfflineScanQueue = (items: OfflineScanQueueItem[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(offlineScanQueueKey, JSON.stringify(pruneOfflineScanQueue(items)));
};

const isPanelKey = (value: string | null): value is PanelKey =>
  Boolean(value && (panelKeys as readonly string[]).includes(value));

const moneyVnd = (value: number) => `${Math.abs(value).toLocaleString('vi-VN')}đ`;

const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return 'Chưa cập nhật';
  }

  return new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const toDateTimeLocalValue = (value: Date | string | null | undefined) => {
  const date = value instanceof Date ? value : value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
};

const translateBillStatus = (status?: string | null) => {
  if (!status) return '';
  switch (status.toUpperCase()) {
    case 'DRAFT':
      return 'Nháp';
    case 'SUBMITTED':
      return 'Chờ duyệt';
    case 'PENDING_PM_BA':
      return 'Chờ PM/BA';
    case 'VERIFIED':
      return 'Đã duyệt';
    case 'REJECTED':
      return 'Từ chối';
    case 'PAID':
      return 'Đã thanh toán';
    case 'VOIDED':
      return 'Đã hủy';
    default:
      return status;
  }
};

const translateBookingStatus = (status?: string | null) => {
  if (!status) return 'Không rõ';
  switch (status.toUpperCase()) {
    case 'REQUESTED':
    case 'PENDING':
    case 'NEW':
      return 'Chờ xác nhận';
    case 'CONFIRMED':
      return 'Đã xác nhận';
    case 'CHECKED_IN':
      return 'Đã đến';
    case 'COMPLETED':
      return 'Hoàn tất';
    case 'CANCELLED':
      return 'Đã hủy';
    case 'NO_SHOW':
      return 'Không đến';
    default:
      return status;
  }
};

const parseMoneyInput = (value: string) => Number(value.replace(/[^\d]/g, ''));

const isBlank = (value?: string | null) => !value?.trim();
const hasText = (value?: string | null) => Boolean(value?.trim());
const splitInlineList = (value?: string | null) =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const safeListingText = (value: unknown) => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  return String(value);
};

const normalizeListingTextList = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => safeListingText(item).trim())
      .filter(Boolean);
  }

  return splitInlineList(safeListingText(value));
};

const normalizeListingUrlList = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (item && typeof item === 'object') {
          const record = item as { url?: unknown; thumbnailUrl?: unknown; imageUrl?: unknown };
          return safeListingText(record.url ?? record.thumbnailUrl ?? record.imageUrl).trim();
        }
        return safeListingText(item).trim();
      })
      .filter(Boolean);
  }

  return splitInlineList(safeListingText(value));
};

const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

const buildListingMenuSummary = (
  menuGroups: PartnerListingMenuGroup[],
  pricingItems: PartnerListingPricing[],
) => {
  const groupLines = menuGroups.flatMap((group) => {
    const groupName = group.name.trim();
    const itemLines = group.items
      .filter((item) => hasText(item.name) || hasText(item.description) || hasText(item.imageUrl))
      .map((item) => {
        const details = [
          item.description?.trim(),
          item.priceTier ? `Cost tier: ${item.priceTier}` : null,
          item.isHot ? 'HOT' : null,
          item.imageUrl?.trim() && isValidUrl(item.imageUrl.trim())
            ? `Image: ${item.imageUrl.trim()}`
            : null,
        ].filter(Boolean);

        return `- ${item.name.trim() || 'Menu item'}${details.length ? ` - ${details.join(' | ')}` : ''}`;
      });

    return groupName || itemLines.length
      ? [`[${groupName || 'Menu'}]`, ...itemLines]
      : [];
  });
  const pricingLines = pricingItems
    .filter((item) => hasText(item.label) || hasText(item.value) || hasText(item.note))
    .map((item) => {
      const details = [item.value?.trim(), item.note?.trim()].filter(Boolean);
      return `- ${item.label.trim() || 'Price item'}${details.length ? ` - ${details.join(' | ')}` : ''}`;
    });

  return [...groupLines, ...pricingLines].join('\n');
};

const openingHourPattern = /^([01]\d|2[0-4]):[0-5]\d\s*[-–]\s*([01]\d|2[0-4]):[0-5]\d$/;
const phonePattern = /^\+?[0-9\s().-]{8,18}$/;
const splitOpeningHourSlots = (value?: string | null) =>
  (value ?? '')
    .split(',')
    .map((slot) => slot.trim())
    .filter(Boolean);

const splitOpeningHourSlot = (slot?: string | null) => {
  const [open = '', close = ''] = (slot ?? '').split(/\s*[-–]\s*/);
  return { open: open.trim(), close: close.trim() };
};

const formatOpeningHourSlot = (open: string, close: string) =>
  open || close ? `${open || '19:00'} - ${close || '24:00'}` : '';

const hasValidOpeningHourSlots = (value?: string | null) => {
  const slots = splitOpeningHourSlots(value);
  if (slots.length === 0) return false;
  return slots.every((slot) => {
    if (!openingHourPattern.test(slot)) return false;
    const { open, close } = splitOpeningHourSlot(slot);
    const [openH = Number.NaN, openM = Number.NaN] = open.split(':').map(Number);
    const [closeH = Number.NaN, closeM = Number.NaN] = close.split(':').map(Number);
    if (openH > 23 || openM > 59) return false;
    if (closeH > 24 || (closeH === 24 && closeM > 0) || closeM > 59) return false;
    const openTotal = (openH || 0) * 60 + (openM || 0);
    const closeTotal = (closeH || 0) * 60 + (closeM || 0);
    if (closeTotal <= openTotal && !(openTotal === 0 && closeTotal === 0)) return false;
    return true;
  });
};

const tabFromListingErrorPath = (path: string): ListingTabKey => {
  if (path.startsWith('castProfiles.')) return 'cast';
  return 'store';
};

const validateListingDraft = (
  draft: PartnerListingDraft,
  mode: ListingValidationMode,
): ListingValidationResult => {
  const errors: ListingValidationErrors = {};
  const requireOnSubmit = (path: string, value: string | null | undefined, message: string) => {
    if (mode === 'submit' && isBlank(value)) {
      errors[path] = message;
    }
  };
  const addFormatError = (path: string, value: string | null | undefined, message: string) => {
    if (hasText(value) && !isValidUrl(value!.trim())) {
      errors[path] = message;
    }
  };

  if (isBlank(draft.storeName)) {
    errors.storeName = 'Nhập tên quán.';
  } else if (draft.storeName.trim().length < 2) {
    errors.storeName = 'Tên quán cần ít nhất 2 ký tự.';
  }

  const category = draft.storeCategory || draft.businessType;
  requireOnSubmit('storeCategory', category, 'Chọn loại hình quán.');
  requireOnSubmit('area', draft.area, 'Nhập khu vực hiển thị.');
  requireOnSubmit('storeCity', draft.storeCity, 'Nhập tỉnh/thành phố.');
  requireOnSubmit('streetAddress', draft.streetAddress, 'Nhập số nhà, tên đường.');
  requireOnSubmit('description', draft.description, 'Nhập mô tả quán.');

  if (hasText(draft.phone) && !phonePattern.test(draft.phone.trim())) {
    errors.phone = 'Số điện thoại chỉ gồm số, dấu +, khoảng trắng hoặc dấu chấm/gạch.';
  }
  addFormatError('mapUrl', draft.mapUrl, 'Link Google Maps phải bắt đầu bằng http hoặc https.');

  const openingItems = draft.openingHourItems.length ? draft.openingHourItems : defaultListingOpeningHours();
  const openDays = openingItems.filter((item) => !item.isOff);
  if (mode === 'submit' && !openDays.length) {
    errors['openingHourItems.0.hours'] = 'Cần có ít nhất một ngày mở cửa.';
  }
  openingItems.forEach((item, index) => {
    const path = `openingHourItems.${index}.hours`;
    if (item.isOff) return;
    if (mode === 'submit' && isBlank(item.hours)) {
      errors[path] = `Nhập giờ mở cửa cho ${item.day}.`;
      return;
    }
    if (hasText(item.hours) && !hasValidOpeningHourSlots(item.hours)) {
      errors[path] = 'Định dạng giờ phải là HH:mm - HH:mm, có thể thêm nhiều khung bằng dấu phẩy.';
    }
  });
  draft.castProfiles.forEach((cast, index) => {
    const rowHasData = Boolean(
      cast.stageName.trim() ||
        cast.publicHeadline?.trim() ||
        cast.bio?.trim() ||
        cast.zodiacSign?.trim() ||
        cast.measurements?.trim() ||
        cast.birthMonth ||
        cast.heightCm ||
        cast.tags?.length ||
        cast.languages?.length ||
        cast.hobbies?.length ||
        cast.youtubeLinks?.length ||
        cast.mediaUrls?.length,
    );
    if (!rowHasData) return;

    if (isBlank(cast.stageName)) {
      errors[`castProfiles.${index}.stageName`] = 'Nhập tên cast.';
    }
    if (cast.birthMonth !== undefined && (cast.birthMonth < 1 || cast.birthMonth > 12)) {
      errors[`castProfiles.${index}.birthMonth`] = 'Tháng sinh phải từ 1 đến 12.';
    }
    if (cast.heightCm !== undefined && (cast.heightCm < 120 || cast.heightCm > 220)) {
      errors[`castProfiles.${index}.heightCm`] = 'Chiều cao hợp lệ trong khoảng 120 - 220 cm.';
    }
    splitInlineList(cast.youtubeLinks?.join(',')).forEach((url, urlIndex) => {
      if (!isValidUrl(url)) {
        errors[`castProfiles.${index}.youtubeLinks`] = `YouTube URL thứ ${urlIndex + 1} không hợp lệ.`;
      }
    });
    splitInlineList(cast.mediaUrls?.join(',')).forEach((url, urlIndex) => {
      if (!isValidUrl(url)) {
        errors[`castProfiles.${index}.mediaUrls`] = `Ảnh cast URL thứ ${urlIndex + 1} không hợp lệ.`;
      }
    });
  });

  draft.menuGroups.forEach((group, groupIndex) => {
    const groupHasData =
      hasText(group.name) ||
      group.items.some((item) =>
        Boolean(hasText(item.name) || hasText(item.description) || hasText(item.imageUrl)),
      );
    if (!groupHasData) return;
    if (isBlank(group.name)) {
      errors[`menuGroups.${groupIndex}.name`] = 'Nhập tên nhóm menu.';
    }
    group.items.forEach((item, itemIndex) => {
      const itemHasData = Boolean(hasText(item.name) || hasText(item.description) || hasText(item.imageUrl));
      if (!itemHasData) return;
      if (isBlank(item.name)) {
        errors[`menuGroups.${groupIndex}.items.${itemIndex}.name`] = 'Nhập tên món/dịch vụ.';
      }
      addFormatError(
        `menuGroups.${groupIndex}.items.${itemIndex}.imageUrl`,
        item.imageUrl,
        'Ảnh món chưa hợp lệ. Vui lòng tải lại ảnh từ máy.',
      );
    });
  });

  requireOnSubmit('coverImageUrl', draft.coverImageUrl, 'Nhập ảnh bìa của quán.');
  addFormatError('coverImageUrl', draft.coverImageUrl, 'Cover image URL phải bắt đầu bằng http hoặc https.');
  draft.galleryUrls.forEach((url, index) => {
    if (isBlank(url)) {
      errors[`galleryUrls.${index}`] = 'Nhập URL ảnh hoặc xóa dòng này.';
    } else if (!isValidUrl(url.trim())) {
      errors[`galleryUrls.${index}`] = 'URL ảnh phải bắt đầu bằng http hoặc https.';
    }
  });
  draft.videoUrls.forEach((url, index) => {
    if (isBlank(url)) {
      errors[`videoUrls.${index}`] = 'Nhập URL video hoặc xóa dòng này.';
    } else if (!isValidUrl(url.trim())) {
      errors[`videoUrls.${index}`] = 'URL video phải bắt đầu bằng http hoặc https.';
    }
  });

  const firstErrorPath = Object.keys(errors)[0];
  return {
    errors,
    firstTab: firstErrorPath ? tabFromListingErrorPath(firstErrorPath) : null,
  };
};

const emptyListingDraft: PartnerListingDraft = {
  storeName: '',
  businessType: '',
  storeCategory: '',
  area: '',
  storeCity: '',
  storeDistrict: '',
  ward: '',
  wardName: '',
  streetAddress: '',
  storeAddress: '',
  phone: '',
  openingHours: '',
  openingHourItems: defaultListingOpeningHours(),
  priceRange: '',
  description: '',
  note: '',
  menuSummary: '',
  menuGroups: [],
  mapUrl: '',
  tags: [],
  coverImageUrl: '',
  galleryUrls: [],
  videoUrls: [],
  pricingItems: [],
  castProfiles: [],
  mediaUrls: [],
};

function cleanListingText(value?: string | null) {
  if (!value) return '';

  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const contentTabs: { key: ListingTabKey; label: string }[] = [
  { key: 'store', label: 'Thông tin quán' },
  { key: 'cast', label: 'Cast' },
];

const listingUploadLimits = {
  image: 15 * 1024 * 1024,
  video: 25 * 1024 * 1024,
};

const listingImageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp', 'image/gif']);
const listingVideoMimeTypes = new Set(['video/mp4', 'video/webm']);
const listingImageExtensions = ['.jpg', '.jpeg', '.png', '.svg', '.webp', '.gif'];
const listingVideoExtensions = ['.mp4', '.webm'];

const isAllowedListingFile = (file: File, kind: 'image' | 'video') => {
  const name = file.name.toLowerCase();
  if (kind === 'image') {
    return listingImageMimeTypes.has(file.type) || listingImageExtensions.some((ext) => name.endsWith(ext));
  }

  return listingVideoMimeTypes.has(file.type) || listingVideoExtensions.some((ext) => name.endsWith(ext));
};

const navItems: { key: PanelKey; label: string; icon: LucideIcon }[] = [
  { key: 'scan', label: 'Quét mã QR', icon: QrCode },
  { key: 'overview', label: 'Tổng quan', icon: Home },
  { key: 'settlement', label: 'Đối soát', icon: FileClock },
  { key: 'listing', label: 'Đăng thông tin', icon: Camera },
  { key: 'bill', label: 'Gửi hóa đơn', icon: ReceiptText },
];

const periodItems: { key: PeriodKey; label: string }[] = [
  { key: 'today', label: 'Hôm nay' },
  { key: 'seven', label: '7 ngày' },
  { key: 'thirty', label: '30 ngày' },
];

const panelTitles: Record<PanelKey, { eyebrow: string; title: string }> = {
  overview: { eyebrow: 'PARTNER DASHBOARD', title: 'Tổng quan đối tác' },
  scan: { eyebrow: 'SCAN/CHECK-IN', title: 'Quét mã giảm giá' },
  settlement: { eyebrow: 'COUPON USAGE LOG', title: 'Đối soát coupon' },
  listing: { eyebrow: 'STORE CONTENT', title: 'Đăng thông tin quán' },
  bill: { eyebrow: 'PARTNER BILL', title: 'Gửi hóa đơn cho chủ quán' },
};

const cardStyle: React.CSSProperties = {
  border: `1px solid ${colors.borderGold22}`,
  borderRadius: '16px',
  background: colors.surface1,
  boxShadow: '0 18px 38px -28px rgba(0,0,0,.75)',
};

const softCardStyle: React.CSSProperties = {
  border: `1px solid ${colors.borderSoft}`,
  borderRadius: '14px',
  background: colors.surface2,
};

const inputStyle: React.CSSProperties = {
  minHeight: '44px',
  width: '100%',
  minWidth: 0,
  borderRadius: '11px',
  border: `1px solid ${colors.borderGold22}`,
  background: colors.surface2,
  color: colors.text,
  padding: '0 12px',
  outline: 'none',
  font: 'inherit',
  lineHeight: 1.35,
  boxSizing: 'border-box',
};

function SectionHeading({
  eyebrow,
  title,
  action,
  hideLine,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
  hideLine?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
      <div>
        <h2 style={{ margin: 0, color: colors.text, fontSize: '21px', fontWeight: 600 }}>
          {title}
        </h2>
        {eyebrow && (
          <div
            style={{
              marginTop: '4px',
              fontSize: '9px',
              fontWeight: 600,
              letterSpacing: '1.6px',
              color: colors.muted,
            }}
          >
            {eyebrow}
          </div>
        )}
      </div>
      {!hideLine && (
        <div
          style={{
            flex: 1,
            height: '1px',
            background: 'linear-gradient(90deg, rgba(212,178,106,.45), transparent)',
          }}
        />
      )}
      {action}
    </div>
  );
}

function PanelCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return <article style={{ ...cardStyle, padding: '20px', ...style }}>{children}</article>;
}

function StatusPill({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'gold' | 'success' | 'danger';
}) {
  const toneColor =
    tone === 'success'
      ? colors.success
      : tone === 'danger'
        ? colors.danger
        : tone === 'gold'
          ? colors.goldBright
          : colors.text2;

  return (
    <span
      style={{
        minHeight: '26px',
        borderRadius: '999px',
        border: `1px solid ${tone === 'neutral' ? colors.borderSoft : colors.borderGold22}`,
        background: tone === 'gold' ? 'rgba(212,178,106,.14)' : colors.surface3,
        color: toneColor,
        padding: '0 10px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '11px',
        fontWeight: 800,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

function PrimaryButton({
  children,
  disabled,
  onClick,
  type = 'button',
  style,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  style?: React.CSSProperties;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      type={type}
      style={{
        minHeight: '42px',
        border: 0,
        borderRadius: '11px',
        background: disabled ? colors.surface3 : colors.goldGrad,
        color: disabled ? colors.muted : colors.onGold,
        padding: '0 16px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontWeight: 800,
        cursor: disabled ? 'not-allowed' : 'pointer',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function GhostButton({
  children,
  disabled,
  onClick,
  type = 'button',
  style,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  style?: React.CSSProperties;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      type={type}
      style={{
        minHeight: '42px',
        borderRadius: '11px',
        border: `1px solid ${colors.borderGold22}`,
        background: colors.surface2,
        color: disabled ? colors.muted : colors.gold,
        padding: '0 14px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontWeight: 800,
        cursor: disabled ? 'not-allowed' : 'pointer',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function FormField({
  label,
  children,
  className,
  style,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <label
      className={className}
      style={{
        display: 'grid',
        gap: '7px',
        color: colors.text2,
        fontSize: '12px',
        fontWeight: 700,
        minWidth: 0,
        alignContent: 'start',
        ...style,
      }}
    >
      {label}
      {children}
    </label>
  );
}

function ThemedListingSelect({
  value,
  onChange,
  placeholder,
  options,
  hasError,
  disabled,
  ariaLabel,
  compact,
  style,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  hasError?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  compact?: boolean;
  style?: React.CSSProperties;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  return (
    <div
      onBlur={(event) => {
        const nextFocus = event.relatedTarget;
        if (!nextFocus || !event.currentTarget.contains(nextFocus as Node)) {
          setIsOpen(false);
        }
      }}
      style={{
        position: 'relative',
        minWidth: compact ? '96px' : undefined,
        ...style,
      }}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((current) => (disabled ? false : !current))}
        aria-label={ariaLabel ?? placeholder}
        aria-expanded={isOpen}
        style={{
          width: '100%',
          minHeight: compact ? '34px' : '44px',
          border: `1px solid ${hasError ? colors.danger : colors.borderGold22}`,
          borderRadius: compact ? '9px' : '12px',
          background: colors.surface2,
          color: selectedOption ? colors.text : colors.muted,
          font: 'inherit',
          fontSize: compact ? '12px' : '13px',
          fontWeight: 900,
          padding: compact ? '0 8px' : '0 12px',
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          opacity: disabled ? 0.65 : 1,
          textAlign: 'left',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          size={compact ? 14 : 16}
          style={{ flex: '0 0 auto', color: colors.goldBright }}
        />
      </button>
      {isOpen && !disabled ? (
        <div
          className="partner-themed-select-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 180,
            maxHeight: compact ? '220px' : '280px',
            overflowY: 'auto',
            border: `1px solid ${colors.borderGold32}`,
            borderRadius: '12px',
            background: colors.popoverBg,
            boxShadow: '0 24px 50px -26px rgba(0,0,0,.86)',
            padding: '6px',
          }}
        >
          {options.length ? (
            options.map((option) => {
              const selected = option.value === value;
              return (
                <button
                  key={`${option.value}-${option.label}`}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  style={{
                    width: '100%',
                    minHeight: compact ? '32px' : '36px',
                    border: 0,
                    borderRadius: '9px',
                    background: selected ? colors.goldGrad : 'transparent',
                    color: selected ? colors.onGold : colors.text,
                    font: 'inherit',
                    fontSize: compact ? '12px' : '12.5px',
                    fontWeight: selected ? 900 : 800,
                    textAlign: 'left',
                    padding: '0 10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {option.label}
                  </span>
                </button>
              );
            })
          ) : (
            <div style={{ padding: '10px', color: colors.muted, fontSize: '12px', fontWeight: 800 }}>
              Chưa có dữ liệu
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function ListingTimeSelect({
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
  return (
    <ThemedListingSelect
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      options={listingTimeOptions.map((time) => ({ value: time, label: time }))}
      hasError={hasError}
      compact
    />
  );
}

export default function PartnerPage() {
  const searchParams = useSearchParams();
  const requestedPanel = searchParams.get('panel');
  const [partnerTheme, setPartnerTheme] = useState<PartnerTheme>(() => readStoredPartnerTheme());
  const [stores, setStores] = useState<PartnerStore[]>([]);
  const [coupons, setCoupons] = useState<PartnerCoupon[]>([]);
  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [bills, setBills] = useState<PartnerBill[]>([]);
  const [dashboard, setDashboard] = useState<PartnerLiteDashboard | null>(null);
  const [activePanel, setActivePanel] = useState<PanelKey>(() =>
    isPanelKey(requestedPanel) ? requestedPanel : 'scan',
  );
  const [listingTab, setListingTab] = useState<ListingTabKey>('store');
  const [listingStoreId, setListingStoreId] = useState('');
  const [listingDraft, setListingDraft] = useState<PartnerListingDraft>(emptyListingDraft);
  const [listingReview, setListingReview] = useState<PartnerListingReview>(null);
  const [listingContentId, setListingContentId] = useState<string | null>(null);
  const [, setListingNotice] = useState('');
  const [listingErrors, setListingErrors] = useState<ListingValidationErrors>({});
  const [listingTagInput, setListingTagInput] = useState('');
  const [listingUploadKey, setListingUploadKey] = useState<string | null>(null);
  const [activeCastProfileIndex, setActiveCastProfileIndex] = useState<number | null>(null);
  const [isAddingCastProfile, setIsAddingCastProfile] = useState(false);
  const [provinces, setProvinces] = useState<VietnamProvince[]>([]);
  const [wards, setWards] = useState<VietnamWard[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedWardCode, setSelectedWardCode] = useState('');
  const [isListingLoading, setIsListingLoading] = useState(false);
  const [isSavingListing, setIsSavingListing] = useState(false);
  const [isSubmittingListing, setIsSubmittingListing] = useState(false);
  const [period, setPeriod] = useState<PeriodKey>('seven');
  const [settlementFilters, setSettlementFilters] = useState({
    code: '',
    service: '',
    fromDate: '',
    toDate: '',
    status: 'ALL',
  });
  const [billStoreId, setBillStoreId] = useState('');
  const [billAmountInput, setBillAmountInput] = useState('');
  const [billUsedAt, setBillUsedAt] = useState(() => toDateTimeLocalValue(new Date()));
  const [billBookingId, setBillBookingId] = useState('');
  const [billEvidenceFile, setBillEvidenceFile] = useState<File | null>(null);
  const [billNotice, setBillNotice] = useState<{
    tone: 'success' | 'danger' | 'gold' | 'neutral';
    message: string;
  } | null>(null);
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [billNowMs, setBillNowMs] = useState(0);
  const [billSubView, setBillSubView] = useState<'list' | 'form'>('list');
  const [billStatusFilter, setBillStatusFilter] = useState<string>('ALL');
  const [isSubmittingBill, setIsSubmittingBill] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Đang tải dữ liệu phân quyền theo store...');
  const [scanPayload, setScanPayload] = useState('');
  const [scanIssue, setScanIssue] = useState<PartnerScanIssue | null>(null);
  const [scannedTime, setScannedTime] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState('Sẵn sàng quét QR, dán link hoặc nhập mã coupon.');
  const [isScanning, setIsScanning] = useState(false);
  const [isConfirmingScan, setIsConfirmingScan] = useState(false);
  const [offlineScanQueue, setOfflineScanQueue] = useState<OfflineScanQueueItem[]>(() =>
    readOfflineScanQueue(),
  );
  const [cameraStatus, setCameraStatus] = useState<
    'idle' | 'starting' | 'active' | 'unsupported' | 'error'
  >('idle');
  const [cameraMessage, setCameraMessage] = useState('');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() =>
    readPartnerNotificationIds(),
  );
  const partnerThemeVariables = partnerTheme === 'light'
    ? partnerLightThemeVariables
    : partnerDarkThemeVariables;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const cameraLoopRef = useRef<number | null>(null);
  const lastCameraPayloadRef = useRef('');

  useEffect(() => {
    document.documentElement.classList.toggle('vy-light', partnerTheme === 'light');
    window.localStorage.setItem(partnerThemeStorageKey, partnerTheme);
  }, [partnerTheme]);

  const togglePartnerTheme = useCallback(() => {
    setPartnerTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetch('https://provinces.open-api.vn/api/v2/p/', { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : []))
      .then((data: VietnamProvince[]) => {
        if (Array.isArray(data)) {
          setProvinces(data);
        }
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedProvinceCode) {
      return;
    }

    const controller = new AbortController();
    fetch(`https://provinces.open-api.vn/api/v2/p/${selectedProvinceCode}?depth=2`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { wards?: VietnamWard[] } | null) => {
        setWards(Array.isArray(data?.wards) ? data.wards : []);
      })
      .catch(() => setWards([]));

    return () => controller.abort();
  }, [selectedProvinceCode]);

  useEffect(() => {
    if (!provinces.length || selectedProvinceCode || !listingDraft.storeCity) {
      return;
    }

    const city = listingDraft.storeCity.toLowerCase();
    const matchedProvince = provinces.find((province) => {
      const name = province.name.toLowerCase();
      return (
        name.includes(city) ||
        city.includes(name) ||
        (city.includes('hanoi') && name.includes('hà nội')) ||
        (city.includes('ha noi') && name.includes('hà nội')) ||
        (city.includes('ho chi minh') && name.includes('hồ chí minh'))
      );
    });

    if (!matchedProvince) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSelectedProvinceCode(String(matchedProvince.code));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [listingDraft.storeCity, provinces, selectedProvinceCode]);

  useEffect(() => {
    if (!wards.length || selectedWardCode || !listingDraft.ward) {
      return;
    }

    const ward = listingDraft.ward.toLowerCase();
    const matchedWard = wards.find((item) => {
      const name = item.name.toLowerCase();
      return name.includes(ward) || ward.includes(name);
    });

    if (!matchedWard) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSelectedWardCode(String(matchedWard.code));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [listingDraft.ward, selectedWardCode, wards]);

  const stopCameraScan = useCallback(() => {
    if (cameraLoopRef.current) {
      window.clearTimeout(cameraLoopRef.current);
      cameraLoopRef.current = null;
    }

    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    lastCameraPayloadRef.current = '';
    setCameraStatus('idle');
    setCameraMessage('');
  }, []);

  const queueOfflineScan = useCallback((payload: string) => {
    setOfflineScanQueue((current) => {
      const queuedAt = new Date().toISOString();
      const next = current.some((item) => item.payload === payload)
        ? current.map((item) => (item.payload === payload ? { ...item, lastError: null } : item))
        : [...current, { payload, queuedAt, attempts: 0, lastError: null }];
      writeOfflineScanQueue(next);
      return pruneOfflineScanQueue(next);
    });
    setScanMessage('Đang offline, đã lưu mã vào hàng đợi để gửi lại.');
  }, []);

  const scanCouponPayload = useCallback(
    async (payload: string, options: { fromQueue?: boolean; fromCamera?: boolean } = {}) => {
      const trimmedPayload = payload.trim();
      const normalizedPayload = normalizePartnerScanPayload(trimmedPayload);
      if (!normalizedPayload) {
        setScanMessage('Cần QR đặt chỗ, scanToken, link QR hoặc mã coupon để kiểm tra.');
        return false;
      }

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        if (options.fromQueue) {
          setScanMessage('Vẫn offline, giữ mã trong hàng đợi để thử lại.');
        } else {
          queueOfflineScan(normalizedPayload.payload);
        }
        return false;
      }

      setIsScanning(true);
      setScanMessage(
        options.fromQueue ? 'Đang gửi lại mã offline...' : 'Đang xác thực mã tại quán...',
      );

      try {
        const issue = normalizedPayload.kind === 'booking'
          ? await apiClient<PartnerScanIssue>('/partner/booking-qrs/scan', {
              data: {
                payload: normalizedPayload.payload,
                offline: Boolean(options.fromQueue),
              },
            })
          : normalizedPayload.kind === 'signed'
            ? await apiClient<PartnerScanIssue>('/partner/coupon-issues/scan', {
                data: {
                  payload: normalizedPayload.payload,
                  offline: Boolean(options.fromQueue),
                },
              })
            : await apiClient<PartnerScanIssue>(
                `/partner/coupon-issues/${encodeURIComponent(normalizedPayload.payload)}/scan`,
                { data: {} },
              );

        setScanIssue(issue);
        setScannedTime(new Date().toLocaleString('vi-VN'));
        setScanMessage(
          `${issue.statusLabel ?? issue.status} - đã đọc ${normalizedPayload.label} ${issue.code} tại ${
            issue.coupon?.store?.name ?? 'quán được phân quyền'
          }. ${
            options.fromCamera
              ? 'Camera đã tắt, kiểm tra thông tin bên phải rồi xác nhận.'
              : 'Kiểm tra thông tin bên phải rồi xác nhận.'
          }`,
        );
        return true;
      } catch (error) {
        if (!(error instanceof ApiError) && typeof navigator !== 'undefined' && !navigator.onLine) {
          if (options.fromQueue) {
            setScanMessage('Vẫn offline, giữ mã trong hàng đợi để thử lại.');
          } else {
            queueOfflineScan(normalizedPayload.payload);
          }
          return false;
        }

        setScanMessage(
          error instanceof ApiError
            ? `${error.message}. Kiểm tra QR có đúng quán, còn hạn và chưa check-in/USED.`
            : 'Không kiểm tra được mã. Thử lại hoặc dán link QR/mã đặt chỗ thủ công.',
        );
        return false;
      } finally {
        setIsScanning(false);
      }
    },
    [queueOfflineScan],
  );

  const startCameraScan = useCallback(async () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('unsupported');
      setCameraMessage(
        'Trình duyệt hiện tại chưa cho phép mở camera. Vẫn có thể dán link hoặc nhập mã.',
      );
      return;
    }

    setCameraStatus('starting');
    setCameraMessage('Đang mở camera...');

    try {
      const Detector = (window as BarcodeDetectorWindow).BarcodeDetector;
      let detector: BarcodeDetectorInstance | null = null;
      try {
        detector = Detector ? new Detector({ formats: ['qr_code'] }) : null;
      } catch {
        detector = null;
      }
      const scanCanvas = document.createElement('canvas');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      cameraStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraStatus('active');
      setCameraMessage(
        detector
          ? 'Đưa QR vào khung để tự nhận mã.'
          : 'Camera đã mở bằng bộ đọc QR dự phòng. Đưa QR vào khung để tự nhận mã.',
      );

      const scanFrame = async () => {
        if (!videoRef.current || !cameraStreamRef.current) {
          return;
        }

        try {
          const rawValue = await readQrFromVideoFrame(videoRef.current, detector, scanCanvas);
          if (rawValue && rawValue !== lastCameraPayloadRef.current) {
            lastCameraPayloadRef.current = rawValue;
            setScanPayload(rawValue);
            setCameraMessage('Đã đọc QR, đang kiểm tra mã...');
            void scanCouponPayload(rawValue, { fromCamera: true }).then((ok) => {
              if (ok) {
                stopCameraScan();
              }
            });
          }
        } catch {
          setCameraStatus('error');
          setCameraMessage('Không đọc được QR từ camera. Có thể dán link hoặc nhập mã bên dưới.');
          return;
        }

        cameraLoopRef.current = window.setTimeout(scanFrame, 450);
      };

      cameraLoopRef.current = window.setTimeout(scanFrame, 500);
    } catch {
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setCameraStatus('error');
      setCameraMessage(
        'Không mở được camera. Kiểm tra quyền camera rồi thử lại, hoặc nhập mã thủ công.',
      );
    }
  }, [scanCouponPayload, stopCameraScan]);

  const replayOfflineScans = useCallback(async () => {
    const queuedItems = readOfflineScanQueue();
    if (!queuedItems.length) {
      setOfflineScanQueue([]);
      setScanMessage('Không có mã offline nào đang chờ.');
      return;
    }

    const remaining: OfflineScanQueueItem[] = [];
    for (const item of queuedItems) {
      const sent = await scanCouponPayload(item.payload, { fromQueue: true });
      if (!sent) {
        remaining.push({
          ...item,
          attempts: item.attempts + 1,
          lastError: new Date().toISOString(),
        });
      }
    }

    const nextQueue = pruneOfflineScanQueue(remaining);
    writeOfflineScanQueue(nextQueue);
    setOfflineScanQueue(nextQueue);
    if (!nextQueue.length) {
      setScanMessage('Đã gửi hết mã offline đang chờ.');
    }
  }, [scanCouponPayload]);

  const confirmScannedIssue = async () => {
    if (!scanIssue) {
      return;
    }

    setIsConfirmingScan(true);
    setScanMessage(
      scanIssue.scanType === 'BOOKING_QR'
        ? 'Đang xác nhận khách đã đến...'
        : 'Đang xác nhận sử dụng coupon...',
    );
    try {
      const confirmEndpoint =
        scanIssue.scanType === 'BOOKING_QR'
          ? `/partner/booking-qrs/${encodeURIComponent(scanIssue.id)}/confirm-check-in`
          : `/partner/coupon-issues/${encodeURIComponent(scanIssue.id)}/confirm-check-in`;
      const nextIssue = await apiClient<PartnerScanIssue>(
        confirmEndpoint,
        { data: {} },
      );
      setScanIssue(nextIssue);
      setScannedTime(new Date().toLocaleString('vi-VN'));
      if (
        scanIssue.scanType !== 'BOOKING_QR' &&
        scanIssue.status !== 'USED' &&
        nextIssue.status === 'USED' &&
        nextIssue.coupon?.id
      ) {
        setCoupons((current) =>
          current.map((coupon) =>
            coupon.id === nextIssue.coupon?.id
              ? { ...coupon, usedCount: coupon.usedCount + 1 }
              : coupon,
          ),
        );
        setDashboard((current) => {
          if (!current || current.customerArrivalSource !== 'QR_USED') {
            return current;
          }

          const storeId = nextIssue.coupon?.store?.id;

          return {
            ...current,
            customerArrivalCount: current.customerArrivalCount + 1,
            qrUsedCount: current.qrUsedCount + 1,
            stores: current.stores.map((store) =>
              store.id === storeId
                ? {
                    ...store,
                    customerArrivalCount: store.customerArrivalCount + 1,
                  }
                : store,
            ),
          };
        });
      }
      setScanMessage(`${nextIssue.statusLabel ?? nextIssue.status} - mã này không thể dùng lại.`);
    } catch (error) {
      setScanMessage(error instanceof ApiError ? error.message : 'Không xác nhận được mã.');
    } finally {
      setIsConfirmingScan(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadPartnerData = async () => {
      try {
        const storeData = await apiClient<PartnerStore[]>('/partner/stores');

        if (!isMounted) return;

        setStores(storeData);
        setListingStoreId((current) => current || storeData[0]?.id || '');
        setBillStoreId((current) => current || storeData[0]?.id || '');
        setStatusMessage(
          storeData.length
            ? 'Dữ liệu đang hiển thị theo phạm vi quán của tài khoản Partner.'
            : 'Tài khoản Partner chưa được gán quán. Admin cần cấp quyền quán trước khi đăng thông tin.',
        );

        const [couponResult, bookingResult, billResult, dashboardResult] = await Promise.allSettled([
          apiClient<PartnerCoupon[]>('/partner/coupons'),
          apiClient<PartnerBooking[]>('/partner/bookings'),
          apiClient<PartnerBill[]>('/partner/bills'),
          apiClient<PartnerLiteDashboard>(
            `/partner/dashboard-lite?period=${encodeURIComponent(period)}`,
          ),
        ]);

        if (!isMounted) return;

        const couponData = couponResult.status === 'fulfilled' ? couponResult.value : [];
        const bookingData = bookingResult.status === 'fulfilled' ? bookingResult.value : [];
        const billData = billResult.status === 'fulfilled' ? billResult.value : [];
        const dashboardData = dashboardResult.status === 'fulfilled' ? dashboardResult.value : null;

        setCoupons(couponData);
        setBookings(bookingData);
        setBills(billData);
        setDashboard(dashboardData);
        if ([couponResult, bookingResult, billResult, dashboardResult].some((result) => result.status === 'rejected')) {
          setStatusMessage('Đã tải quán partner. Một số dữ liệu phụ đang lỗi tạm thời, vui lòng tải lại sau.');
        }
      } catch (error) {
        if (!isMounted) return;

        if (error instanceof ApiError && [401, 403].includes(error.status)) {
          clearAuthSession();
          window.location.href = '/dang-nhap-doi-tac?redirect=/partner';
          return;
        }

        setStatusMessage('Chưa kết nối được backend. Kiểm tra backend hoặc cấu hình API URL.');
      }
    };

    loadPartnerData();

    return () => {
      isMounted = false;
    };
  }, [period]);

  useEffect(() => {
    return () => {
      if (cameraLoopRef.current) {
        window.clearTimeout(cameraLoopRef.current);
      }
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!isPanelKey(requestedPanel)) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActivePanel(requestedPanel);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [requestedPanel]);

  useEffect(() => {
    const refreshBillClock = () => setBillNowMs(Date.now());

    refreshBillClock();
    const interval = window.setInterval(refreshBillClock, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const scanToken = searchParams.get('scanToken') ?? searchParams.get('token');
    const bookingId = searchParams.get('bookingId');
    const token =
      scanToken ??
      bookingId;
    if (!token) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActivePanel('scan');
      const scanValue = bookingId && !scanToken
        ? bookingPayloadFromId(bookingId, searchParams.get('code'))
        : token;
      setScanPayload(scanValue);
      void scanCouponPayload(scanValue);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [scanCouponPayload, searchParams]);

  const activePartnerStore = stores.find((store) => store.id === listingStoreId) ?? stores[0] ?? null;
  const storeName = activePartnerStore?.name ?? bookings[0]?.store.name ?? bills[0]?.store?.name ?? 'Chưa gán quán';
  const activeStoreStatus = activePartnerStore?.status ?? (stores.length ? 'ACTIVE' : 'Chưa gán quán');
  const usedCouponCount = coupons.reduce((sum, item) => sum + item.usedCount, 0);
  const activeCoupons = coupons.filter((coupon) => coupon.status === 'ACTIVE').length;
  const totalDiscount = bills.reduce((sum, bill) => sum + (bill.discountVnd ?? 0), 0);
  const bookingMetricCount = dashboard?.bookingCount ?? bookings.length;
  const profileViewMetricCount = dashboard?.profileViewCount ?? 0;
  const customerArrivalMetricCount = dashboard?.customerArrivalCount ?? usedCouponCount;
  const customerArrivalSourceLabel =
    dashboard?.customerArrivalSource === 'BILL_APPROVED' ? 'Bill approved' : 'QR used';
  const scopedStoreCount = dashboard?.storeCount ?? stores.length;
  const completedBookings = dashboard ? bookingMetricCount : bookings.length;
  const scannedCustomerLabel = scanIssue?.customer?.label ?? 'Khách đã ẩn';
  const scannedExpiryLabel = scanIssue?.expiresAt
    ? new Date(scanIssue.expiresAt).toLocaleString('vi-VN')
    : 'Không giới hạn';
  const scannedBookingLabel = scanIssue?.booking?.scheduledAt
    ? `Booking ${scanIssue.booking.status} · ${new Date(scanIssue.booking.scheduledAt).toLocaleString('vi-VN')}`
    : scanIssue?.booking?.status
      ? `Booking ${scanIssue.booking.status}`
      : 'Không kèm dữ liệu booking chi tiết';
  const scannedDiscountLabel = useMemo(() => {
    if (!scanIssue) return null;

    const coupon = scanIssue.coupon;
    const snapshot = scanIssue.discountRuleSnapshot;

    const discountType = snapshot?.type ?? snapshot?.discountType ?? coupon?.discountType;
    const discountValue =
      snapshot?.value ??
      snapshot?.sourceValue ??
      snapshot?.discountPercent ??
      scanIssue.discountPercent ??
      coupon?.discountValue ??
      null;

    const maxDiscountVnd = snapshot?.maxDiscountVnd ?? coupon?.maxDiscountVnd ?? null;
    const minSpendVnd = snapshot?.minSpendVnd ?? coupon?.minSpendVnd ?? null;

    if (!discountType && !discountValue) return null;

    const mainLabel =
      discountType === 'FIXED_AMOUNT'
        ? `-${moneyVnd(Number(discountValue ?? 0))}`
        : `-${Number(discountValue ?? 0)}%`;

    const detailParts = [
      typeof maxDiscountVnd === 'number' && maxDiscountVnd > 0
        ? `tối đa ${moneyVnd(maxDiscountVnd)}`
        : '',
      typeof minSpendVnd === 'number' && minSpendVnd > 0
        ? `từ ${moneyVnd(minSpendVnd)}`
        : '',
    ].filter(Boolean);

    return detailParts.length ? `${mainLabel} (${detailParts.join(', ')})` : mainLabel;
  }, [scanIssue]);
  const scannedUsedAtLabel = useMemo(() => {
    if (scannedTime) return scannedTime;
    if (!scanIssue?.usedAt) return null;
    return new Date(scanIssue.usedAt).toLocaleString('vi-VN');
  }, [scanIssue, scannedTime]);
  const canConfirmScan = scanIssue?.status === 'ISSUED';
  const cameraActive = cameraStatus === 'active' || cameraStatus === 'starting';
  const listingErrorCount = Object.keys(listingErrors).length;

  const persistReadNotifications = useCallback(
    (ids: string[]) => {
      const nextIds = Array.from(new Set(ids)).slice(-80);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(partnerNotificationReadKey, JSON.stringify(nextIds));
      }
      return nextIds;
    },
    [],
  );

  const markNotificationsRead = useCallback(
    (ids: string[]) => {
      if (!ids.length) {
        return;
      }
      setReadNotificationIds((current) => persistReadNotifications([...current, ...ids]));
    },
    [persistReadNotifications],
  );

  const partnerNotifications = useMemo<PartnerNotification[]>(() => {
    const readIds = new Set(readNotificationIds);
    const notifications: Omit<PartnerNotification, 'unread'>[] = [];
    const nowMs = billNowMs;
    const pendingBookingStatuses = new Set(['PENDING', 'NEW', 'REQUESTED', 'WAITING', 'AWAITING_CONFIRMATION']);
    const upcomingBookingStatuses = new Set(['CONFIRMED', 'APPROVED', 'BOOKED']);
    const pendingBookings = bookings.filter((booking) =>
      pendingBookingStatuses.has(booking.status.toUpperCase()),
    );
    const upcomingBookings = bookings.filter((booking) => {
      const scheduledAtMs = Date.parse(booking.scheduledAt);
      return (
        upcomingBookingStatuses.has(booking.status.toUpperCase()) &&
        Number.isFinite(scheduledAtMs) &&
        (!nowMs || scheduledAtMs >= nowMs)
      );
    });
    const rejectedBills = bills.filter((bill) =>
      ['REJECTED', 'DECLINED', 'CANCELLED'].includes(bill.status.toUpperCase()),
    );
    const pendingBills = bills.filter((bill) =>
      ['SUBMITTED', 'PENDING', 'PENDING_REVIEW', 'REVIEWING'].includes(bill.status.toUpperCase()),
    );
    const approvedBills = bills.filter((bill) =>
      ['VERIFIED', 'APPROVED', 'COMPLETED'].includes(bill.status.toUpperCase()),
    );
    const limitedCoupons = coupons.filter((coupon) => {
      if (coupon.status !== 'ACTIVE' || coupon.usageLimit === null) {
        return false;
      }
      return Math.max(0, coupon.usageLimit - coupon.usedCount) <= 3;
    });

    if (pendingBookings.length) {
      const firstBooking = pendingBookings[0]!;
      notifications.push({
        id: `booking-pending:${pendingBookings.map((booking) => `${booking.id}:${booking.status}`).join('|')}`,
        category: 'Đặt chỗ',
        title: `${pendingBookings.length} booking mới cần xử lý`,
        message: `${firstBooking.store.name} có yêu cầu ${firstBooking.partySize} khách lúc ${formatDateTime(firstBooking.scheduledAt)}. Kiểm tra để xác nhận hoặc điều phối kịp thời.`,
        meta: `${storeName} - chờ xác nhận`,
        actionLabel: 'Mở quét QR',
        panel: 'scan',
        tone: 'gold',
        icon: CalendarDays,
      });
    } else if (upcomingBookings.length) {
      const nextBooking = upcomingBookings
        .slice()
        .sort((first, second) => Date.parse(first.scheduledAt) - Date.parse(second.scheduledAt))[0]!;
      notifications.push({
        id: `booking-upcoming:${nextBooking.id}:${nextBooking.scheduledAt}`,
        category: 'Khách sắp đến',
        title: 'Có booking sắp tới tại quán',
        message: `${nextBooking.partySize} khách đã được xác nhận cho ${formatDateTime(nextBooking.scheduledAt)}. Chuẩn bị check-in bằng QR khi khách tới nơi.`,
        meta: nextBooking.store.name,
        actionLabel: 'Chuẩn bị quét',
        panel: 'scan',
        tone: 'info',
        icon: TicketCheck,
      });
    }

    if (scanIssue) {
      notifications.push({
        id: `scan-result:${scanIssue.scanType ?? 'COUPON'}:${scanIssue.id}:${scanIssue.status}`,
        category: scanIssue.scanType === 'BOOKING_QR' ? 'QR đặt chỗ' : 'QR coupon',
        title:
          scanIssue.status === 'ISSUED'
            ? 'QR hợp lệ, cần xác nhận check-in'
            : `QR đã ở trạng thái ${scanIssue.statusLabel ?? scanIssue.status}`,
        message: `${scanIssue.code} áp dụng tại ${scanIssue.coupon?.store?.name ?? storeName}. Kiểm tra trạng thái trước khi bấm xác nhận cho khách.`,
        meta: scanIssue.expiresAt ? `Hạn: ${formatDateTime(scanIssue.expiresAt)}` : 'Đang hiển thị kết quả quét',
        actionLabel: 'Xem kết quả QR',
        panel: 'scan',
        tone: scanIssue.status === 'ISSUED' ? 'success' : 'warning',
        icon: QrCode,
      });
    }

    if (offlineScanQueue.length) {
      const retryCount = offlineScanQueue.reduce((sum, item) => sum + item.attempts, 0);
      notifications.push({
        id: `offline-queue:${offlineScanQueue.map((item) => `${item.payload}:${item.attempts}`).join('|')}`,
        category: 'QR offline',
        title: `${offlineScanQueue.length} mã QR đang chờ gửi lại`,
        message: `Có mã được lưu khi mất mạng${retryCount ? `, đã thử gửi lại ${retryCount} lần` : ''}. Mở màn quét để gửi offline queue lên hệ thống.`,
        meta: 'Tự xóa sau 24h hoặc 3 lần lỗi',
        actionLabel: 'Gửi offline queue',
        panel: 'scan',
        tone: 'warning',
        icon: RefreshCcw,
      });
    }

    if (rejectedBills.length) {
      const firstBill = rejectedBills[0]!;
      notifications.push({
        id: `bill-rejected:${rejectedBills.map((bill) => `${bill.id}:${bill.status}`).join('|')}`,
        category: 'Hóa đơn',
        title: `${rejectedBills.length} bill bị từ chối`,
        message: `${firstBill.billNumber ?? firstBill.id.slice(0, 8)} cần kiểm tra lại số tiền hoặc chứng từ trước khi gửi lại cho Admin.`,
        meta: firstBill.store?.name ?? storeName,
        actionLabel: 'Sửa bill',
        panel: 'bill',
        tone: 'danger',
        icon: AlertTriangle,
      });
    } else if (pendingBills.length) {
      notifications.push({
        id: `bill-pending:${pendingBills.map((bill) => `${bill.id}:${bill.status}:${bill.submittedAt}`).join('|')}`,
        category: 'Hóa đơn',
        title: `${pendingBills.length} bill đang chờ đối soát`,
        message: `Admin đang kiểm tra hóa đơn trong phạm vi ${storeName}. Theo dõi trạng thái để biết bill nào cần bổ sung.`,
        meta: totalDiscount ? `Tổng giảm giá ${moneyVnd(totalDiscount)}` : 'Chờ duyệt',
        actionLabel: 'Xem bill',
        panel: 'bill',
        tone: 'gold',
        icon: ReceiptText,
      });
    } else if (approvedBills.length) {
      const latestBill = approvedBills[0]!;
      notifications.push({
        id: `bill-approved:${latestBill.id}:${latestBill.status}`,
        category: 'Đối soát',
        title: 'Có bill đã được xác thực',
        message: `${latestBill.billNumber ?? latestBill.id.slice(0, 8)} đã được ghi nhận vào usage log của quán.`,
        meta: latestBill.discountVnd ? `Giảm giá ${moneyVnd(latestBill.discountVnd)}` : 'Đã xác thực',
        actionLabel: 'Xem usage log',
        panel: 'settlement',
        tone: 'success',
        icon: CheckCircle2,
      });
    }

    if (limitedCoupons.length) {
      const firstCoupon = limitedCoupons[0]!;
      const remaining = firstCoupon.usageLimit === null ? 0 : Math.max(0, firstCoupon.usageLimit - firstCoupon.usedCount);
      notifications.push({
        id: `coupon-low:${limitedCoupons.map((coupon) => `${coupon.id}:${coupon.usedCount}/${coupon.usageLimit}`).join('|')}`,
        category: 'Coupon',
        title: `${limitedCoupons.length} coupon gần hết lượt`,
        message: `${firstCoupon.name} chỉ còn ${remaining} lượt trong giới hạn hiện tại. Theo dõi usage log để chủ động đối soát.`,
        meta: firstCoupon.code,
        actionLabel: 'Xem đối soát',
        panel: 'settlement',
        tone: 'warning',
        icon: TicketCheck,
      });
    } else if (usedCouponCount) {
      notifications.push({
        id: `coupon-used:${usedCouponCount}:${totalDiscount}`,
        category: 'Coupon',
        title: `${usedCouponCount} lượt coupon đã sử dụng`,
        message: `Các lượt coupon đã chuyển USED sẽ xuất hiện trong bảng đối soát để partner kiểm tra theo mã giao dịch.`,
        meta: `${activeCoupons} coupon đang hoạt động`,
        actionLabel: 'Xem usage log',
        panel: 'settlement',
        tone: 'success',
        icon: TicketCheck,
      });
    }

    if (listingReview?.status === 'REJECTED') {
      notifications.push({
        id: `listing-rejected:${listingReview.id}:${listingReview.reviewedAt ?? listingReview.submittedAt}`,
        category: 'Đăng tin',
        title: 'Nội dung quán bị từ chối',
        message: listingReview.reviewReason || 'Admin cần partner chỉnh lại thông tin quán, cast, bảng giá hoặc ảnh/video trước khi duyệt.',
        meta: storeName,
        actionLabel: 'Sửa đăng tin',
        panel: 'listing',
        listingTab: 'store',
        tone: 'danger',
        icon: FileText,
      });
    } else if (listingReview?.status === 'PENDING_REVIEW') {
      notifications.push({
        id: `listing-pending:${listingReview.id}:${listingReview.submittedAt}`,
        category: 'Đăng tin',
        title: 'Bản đăng tin đang chờ Admin duyệt',
        message: 'Thông tin quán đã gửi duyệt. Khi Admin xử lý, trạng thái trong màn Đăng thông tin sẽ cập nhật theo từng quán.',
        meta: `Gửi lúc ${formatDateTime(listingReview.submittedAt)}`,
        actionLabel: 'Xem bản nháp',
        panel: 'listing',
        tone: 'gold',
        icon: FileText,
      });
    } else if (listingReview?.status === 'APPROVED') {
      notifications.push({
        id: `listing-approved:${listingReview.id}:${listingReview.reviewedAt ?? listingReview.submittedAt}`,
        category: 'Đăng tin',
        title: 'Thông tin quán đã được duyệt',
        message: 'Nội dung public của quán đã đồng bộ theo bản Admin duyệt. Có thể tiếp tục cập nhật bản nháp mới khi cần.',
        meta: storeName,
        actionLabel: 'Xem thông tin',
        panel: 'listing',
        tone: 'success',
        icon: CheckCircle2,
      });
    } else if (listingContentId) {
      notifications.push({
        id: `listing-draft:${listingContentId}:${listingErrorCount}`,
        category: 'Đăng tin',
        title: listingErrorCount ? `Bản nháp còn ${listingErrorCount} lỗi cần sửa` : 'Bản nháp đăng tin đã được lưu',
        message: listingErrorCount
          ? 'Kiểm tra các tab Thông tin quán, Cast, Bảng giá và Ảnh/Video để gửi duyệt.'
          : 'Bản nháp đã lưu, có thể gửi Admin duyệt khi dữ liệu đã đủ.',
        meta: storeName,
        actionLabel: listingErrorCount ? 'Sửa lỗi' : 'Gửi duyệt',
        panel: 'listing',
        tone: listingErrorCount ? 'warning' : 'info',
        icon: FileText,
      });
    }

    if (!stores.length) {
      notifications.push({
        id: 'store-access:empty',
        category: 'Phân quyền',
        title: 'Tài khoản chưa được gán quán',
        message: 'Partner cần được Admin cấp quyền một quán trước khi quét QR, gửi bill hoặc đăng thông tin.',
        meta: 'Liên hệ Admin',
        actionLabel: 'Xem tổng quan',
        panel: 'overview',
        tone: 'danger',
        icon: ShieldCheck,
      });
    } else if (scopedStoreCount > 1) {
      notifications.push({
        id: `store-access:multiple:${scopedStoreCount}`,
        category: 'Phân quyền',
        title: 'Tài khoản đang có nhiều hơn 1 quán',
        message: 'Mỗi tài khoản partner chỉ nên quản lý một quán. Kiểm tra phạm vi để Admin thu gọn quyền nếu cần.',
        meta: `${scopedStoreCount} quán trong scope`,
        actionLabel: 'Xem tổng quan',
        panel: 'overview',
        tone: 'warning',
        icon: ShieldCheck,
      });
    }

    return notifications
      .map((notification) => ({
        ...notification,
        unread: !readIds.has(notification.id),
      }))
      .slice(0, 8);
  }, [
    activeCoupons,
    bills,
    billNowMs,
    bookings,
    coupons,
    listingContentId,
    listingErrorCount,
    listingReview,
    offlineScanQueue,
    readNotificationIds,
    scopedStoreCount,
    scanIssue,
    storeName,
    stores.length,
    totalDiscount,
    usedCouponCount,
  ]);
  const unreadNotificationCount = partnerNotifications.filter((notification) => notification.unread).length;

  const openPartnerNotification = (notification: PartnerNotification) => {
    markNotificationsRead([notification.id]);
    setActivePanel(notification.panel);
    if (notification.listingTab) {
      setListingTab(notification.listingTab === 'cast' ? 'cast' : 'store');
    }
    setIsNotificationOpen(false);
  };

  const markAllNotificationsRead = () => {
    markNotificationsRead(partnerNotifications.map((notification) => notification.id));
  };

  const settlementRows = bills.map((bill) => {
    const submittedAtMs = bill.submittedAt ? Date.parse(bill.submittedAt) : null;

    return {
      code: bill.billNumber ?? bill.id.slice(0, 8),
      service: `${bill.coupon?.name ?? 'Hóa đơn'} · ${bill.store?.name ?? 'Quán'}`,
      time: formatDateTime(bill.submittedAt),
      amount: bill.discountVnd ?? bill.totalVnd ?? 0,
      status: bill.status,
      submittedAtMs:
        submittedAtMs !== null && Number.isFinite(submittedAtMs) ? submittedAtMs : null,
    };
  });
  const settlementStatusOptions = Array.from(new Set(settlementRows.map((row) => row.status)));
  const settlementFromMs = settlementFilters.fromDate
    ? new Date(`${settlementFilters.fromDate}T00:00:00`).getTime()
    : null;
  const settlementToMs = settlementFilters.toDate
    ? new Date(`${settlementFilters.toDate}T23:59:59.999`).getTime()
    : null;
  const settlementCodeQuery = settlementFilters.code.trim().toLowerCase();
  const settlementServiceQuery = settlementFilters.service.trim().toLowerCase();
  const filteredSettlementRows = settlementRows.filter((row) => {
    const matchesCode = !settlementCodeQuery || row.code.toLowerCase().includes(settlementCodeQuery);
    const matchesService =
      !settlementServiceQuery || row.service.toLowerCase().includes(settlementServiceQuery);
    const matchesStatus = settlementFilters.status === 'ALL' || row.status === settlementFilters.status;
    const matchesFrom =
      settlementFromMs === null || (row.submittedAtMs !== null && row.submittedAtMs >= settlementFromMs);
    const matchesTo =
      settlementToMs === null || (row.submittedAtMs !== null && row.submittedAtMs <= settlementToMs);

    return matchesCode && matchesService && matchesStatus && matchesFrom && matchesTo;
  });
  const hasSettlementFilters = Boolean(
    settlementFilters.code.trim() ||
      settlementFilters.service.trim() ||
      settlementFilters.fromDate ||
      settlementFilters.toDate ||
      settlementFilters.status !== 'ALL',
  );
  const updateSettlementFilter = (field: keyof typeof settlementFilters, value: string) => {
    setSettlementFilters((current) => ({ ...current, [field]: value }));
  };
  const clearSettlementFilters = () => {
    setSettlementFilters({
      code: '',
      service: '',
      fromDate: '',
      toDate: '',
      status: 'ALL',
    });
  };
  const selectedBillStore =
    stores.find((store) => store.id === billStoreId) ?? stores[0] ?? null;
  const billAmount = useMemo(() => parseMoneyInput(billAmountInput), [billAmountInput]);
  const billUsedAtDate = useMemo(() => new Date(billUsedAt), [billUsedAt]);
  const isBillUsedAtInvalid = Number.isNaN(billUsedAtDate.getTime());
  const isBillFutureUsage =
    Boolean(billNowMs) && !isBillUsedAtInvalid && billUsedAtDate.getTime() > billNowMs;
  const isBillPastDeadline =
    Boolean(billNowMs) &&
    !isBillUsedAtInvalid &&
    billNowMs - billUsedAtDate.getTime() > billSubmitDeadlineMs;
  const billBookingOptions = useMemo(
    () =>
      bookings.filter((booking) => {
        if (!selectedBillStore) {
          return true;
        }

        return (
          booking.store.id === selectedBillStore.id ||
          booking.store.name === selectedBillStore.name ||
          !booking.store.id
        );
      }),
    [bookings, selectedBillStore],
  );
  const scopedBillRows = useMemo(
    () =>
      bills
        .filter((bill) => {
          if (!selectedBillStore) {
            return true;
          }

          const storeMatch = (
            bill.storeId === selectedBillStore.id ||
            bill.store?.id === selectedBillStore.id ||
            bill.store?.name === selectedBillStore.name
          );
          if (!storeMatch) return false;

          if (billStatusFilter !== 'ALL') {
            return bill.status.toUpperCase() === billStatusFilter.toUpperCase();
          }
          return true;
        })
        .slice()
        .sort((first, second) => {
          const firstDate = Date.parse(first.usedAt ?? first.submittedAt ?? '');
          const secondDate = Date.parse(second.usedAt ?? second.submittedAt ?? '');
          return (Number.isFinite(secondDate) ? secondDate : 0) - (Number.isFinite(firstDate) ? firstDate : 0);
        }),
    [bills, selectedBillStore, billStatusFilter],
  );
  const canSubmitPartnerBill =
    !isSubmittingBill &&
    Boolean(billNowMs) &&
    Boolean(selectedBillStore) &&
    billAmount > 0 &&
    Boolean(billUsedAt) &&
    !isBillUsedAtInvalid &&
    !isBillFutureUsage &&
    !isBillPastDeadline;

  const handleBillAmountChange = (value: string) => {
    const parsed = parseMoneyInput(value);
    setBillAmountInput(parsed ? parsed.toLocaleString('vi-VN') : '');
  };

  const handleBillFileChange = (input: HTMLInputElement) => {
    setBillEvidenceFile(input.files?.[0] ?? null);
  };

  const refreshPartnerBills = async (fallbackBill: PartnerBill) => {
    try {
      const nextBills = await billApi.listPartnerBills();
      setBills(nextBills as PartnerBill[]);
    } catch {
      setBills((current) => [fallbackBill, ...current].slice(0, 40));
    }
  };

  const fillBillFormFromRow = (bill: PartnerBill) => {
    const nextStoreId = bill.storeId ?? bill.store?.id ?? selectedBillStore?.id ?? '';
    if (nextStoreId) {
      setBillStoreId(nextStoreId);
    }
    setSelectedBillId(bill.id);
    setBillAmountInput(bill.totalVnd ? bill.totalVnd.toLocaleString('vi-VN') : '');
    setBillUsedAt(toDateTimeLocalValue(bill.usedAt ?? bill.submittedAt ?? new Date()));
    setBillBookingId(bill.booking?.id ?? '');
    setBillSubView('form');
  };

  const submitPartnerBill = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBillNotice(null);

    if (!canSubmitPartnerBill || !selectedBillStore) {
      setBillNotice({
        tone: 'danger',
        message: 'Kiểm tra lại quán, tổng tiền bill gốc và thời gian sử dụng trước khi gửi.',
      });
      return;
    }

    setIsSubmittingBill(true);
    try {
      const bill = (await billApi.submitPartnerBill({
        storeId: selectedBillStore.id,
        bookingId: billBookingId || undefined,
        totalVnd: billAmount,
        usedAt: billUsedAtDate.toISOString(),
      })) as PartnerBill;

      let uploadWarning = '';
      if (billEvidenceFile) {
        try {
          await billApi.uploadEvidence(bill.id, billEvidenceFile);
        } catch {
          uploadWarning = ' Bill đã gửi, nhưng ảnh/chứng từ chưa upload được.';
        }
      }

      const normalizedBill: PartnerBill = {
        ...bill,
        storeId: bill.storeId ?? selectedBillStore.id,
        store: bill.store ?? selectedBillStore,
      };

      await refreshPartnerBills(normalizedBill);
      setSelectedBillId(normalizedBill.id);
      setBillEvidenceFile(null);
      setBillNotice({
        tone: uploadWarning ? 'gold' : 'success',
        message: `Đã gửi bill ${normalizedBill.billNumber ?? normalizedBill.id.slice(0, 8)} để Admin duyệt.${uploadWarning}`,
      });
    } catch (error) {
      setBillNotice({
        tone: 'danger',
        message: error instanceof ApiError ? error.message : 'Chưa gửi được bill. Vui lòng thử lại.',
      });
    } finally {
      setIsSubmittingBill(false);
    }
  };

  const bookingTrendBars = useMemo(() => {
    const rows = dashboard?.weeklyBookings ?? [];
    if (!rows.length) {
      return [];
    }

    const maxCount = Math.max(1, ...rows.map((row) => row.count));

    return rows.map((row) => ({
      label: row.label,
      count: row.count,
      height: Math.max(6, Math.round((row.count / maxCount) * 100)),
    }));
  }, [dashboard?.weeklyBookings]);

  const metrics = useMemo(
    () => [
      {
        label: 'Đặt chỗ tại quán',
        value: bookingMetricCount.toLocaleString('vi-VN'),
        sub: `${completedBookings} lượt đã xác nhận`,
        trend: '+12% tuần này',
        icon: TicketCheck,
      },
      {
        label: 'Lượt xem trang',
        value: profileViewMetricCount.toLocaleString('vi-VN'),
        sub: 'Ước tính từ hoạt động partner',
        trend: stores.length ? '+8% so với kỳ trước' : 'Chờ dữ liệu',
        icon: Eye,
      },
      {
        label: 'Số khách đến',
        value: customerArrivalMetricCount.toLocaleString('vi-VN'),
        sub: `${activeCoupons} coupon đang hoạt động`,
        trend: `${coupons.length} coupon trong scope`,
        icon: UsersRound,
      },
      {
        label: 'Đối soát chờ',
        value: String(bills.length),
        sub: totalDiscount ? `Giảm giá ${moneyVnd(totalDiscount)}` : 'Chưa có bill mới',
        trend: 'Có usage log',
        icon: FileClock,
      },
    ],
    [
      activeCoupons,
      bills.length,
      bookingMetricCount,
      completedBookings,
      customerArrivalMetricCount,
      profileViewMetricCount,
      coupons.length,
      stores.length,
      totalDiscount,
    ],
  );

  const rejectScanResult = () => {
    setScanIssue(null);
    setScannedTime(null);
    setScanPayload('');
    setScanMessage('Đã hủy kết quả quét. Partner có thể kiểm tra mã khác.');
  };

  const applyListingDraftResponse = useCallback((response: PartnerListingDraftResponse) => {
    const draft = response.draft;
    setListingContentId(response.contentId);
    setListingReview(response.review);
    setListingErrors({});
    setListingDraft({
      ...emptyListingDraft,
      ...draft,
      storeName: safeListingText(draft.storeName),
      businessType: safeListingText(draft.businessType),
      storeCategory: safeListingText(draft.storeCategory),
      area: safeListingText(draft.area),
      storeCity: safeListingText(draft.storeCity),
      storeDistrict: safeListingText(draft.storeDistrict),
      ward: safeListingText(draft.ward || draft.wardName),
      wardName: safeListingText(draft.wardName),
      streetAddress: safeListingText(draft.streetAddress),
      phone: safeListingText(draft.phone),
      mapUrl: safeListingText(draft.mapUrl),
      openingHours: safeListingText(draft.openingHours),
      priceRange: safeListingText(draft.priceRange),
      menuSummary: safeListingText(draft.menuSummary),
      coverImageUrl: safeListingText(draft.coverImageUrl),
      description: cleanListingText(draft.description),
      note: safeListingText(draft.note),
      openingHourItems: draft.openingHourItems?.length
        ? draft.openingHourItems
        : defaultListingOpeningHours(),
      tags: normalizeListingTextList(draft.tags),
      menuGroups: draft.menuGroups ?? [],
      galleryUrls: normalizeListingUrlList(draft.galleryUrls),
      videoUrls: normalizeListingUrlList(draft.videoUrls),
      pricingItems: draft.pricingItems ?? [],
      castProfiles: (draft.castProfiles ?? []).map((cast) => ({
        ...cast,
        stageName: safeListingText(cast.stageName),
        storeName: safeListingText(cast.storeName),
        publicHeadline: safeListingText(cast.publicHeadline),
        bio: safeListingText(cast.bio),
        zodiacSign: safeListingText(cast.zodiacSign),
        measurements: safeListingText(cast.measurements),
        tags: normalizeListingTextList(cast.tags),
        languages: normalizeListingTextList(cast.languages),
        hobbies: normalizeListingTextList(cast.hobbies),
        mediaUrls: normalizeListingUrlList(cast.mediaUrls),
        youtubeLinks: normalizeListingUrlList(cast.youtubeLinks),
      })),
      mediaUrls: normalizeListingUrlList(draft.mediaUrls),
    });
    setListingNotice(response.message);
  }, []);

  useEffect(() => {
    if (!listingStoreId) {
      return;
    }

    let isMounted = true;
    const loadingTimer = window.setTimeout(() => {
      if (!isMounted) return;
      setIsListingLoading(true);
      setListingNotice('Đang tải bản nháp đăng thông tin...');
    }, 0);

    apiClient<PartnerListingDraftResponse>(
      `/partner/listing-draft/${encodeURIComponent(listingStoreId)}`,
    )
      .then((response) => {
        if (!isMounted) return;
        applyListingDraftResponse(response);
      })
      .catch((error) => {
        if (!isMounted) return;
        setListingNotice(
          error instanceof ApiError
            ? error.message
            : 'Không tải được bản nháp đăng thông tin.',
        );
      })
      .finally(() => {
        window.clearTimeout(loadingTimer);
        if (isMounted) setIsListingLoading(false);
      });

    return () => {
      isMounted = false;
      window.clearTimeout(loadingTimer);
    };
  }, [applyListingDraftResponse, listingStoreId]);

  const clearListingErrorsFor = (path: string) => {
    setListingErrors((current) => {
      const next = Object.fromEntries(
        Object.entries(current).filter(([key]) => key !== path && !key.startsWith(`${path}.`)),
      );
      return Object.keys(next).length === Object.keys(current).length ? current : next;
    });
  };

  const updateListingField = (key: keyof PartnerListingDraft, value: string) => {
    clearListingErrorsFor(String(key));
    setListingDraft((current) => ({ ...current, [key]: value }));
  };

  const updateListingTags = (value: string) => {
    clearListingErrorsFor('tags');
    setListingDraft((current) => ({
      ...current,
      tags: value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 16),
    }));
  };

  const addListingTag = (tag: string) => {
    const nextTag = tag.trim();
    if (!nextTag) return;

    clearListingErrorsFor('tags');
    setListingDraft((current) => {
      const existing = new Set(current.tags.map((item) => item.toLowerCase()));
      if (existing.has(nextTag.toLowerCase())) {
        return current;
      }

      return {
        ...current,
        tags: [...current.tags, nextTag].slice(0, 16),
      };
    });
  };

  const removeListingTag = (tag: string) => {
    clearListingErrorsFor('tags');
    setListingDraft((current) => ({
      ...current,
      tags: current.tags.filter((item) => item !== tag),
    }));
  };

  const submitListingTagInput = () => {
    const nextTag = listingTagInput.trim();
    if (!nextTag) return;
    addListingTag(nextTag);
    setListingTagInput('');
  };

  const updateOpeningHourItem = (
    index: number,
    key: keyof PartnerListingOpeningHour,
    value: string | boolean,
  ) => {
    clearListingErrorsFor(`openingHourItems.${index}.${String(key)}`);
    if (key === 'isOff') {
      clearListingErrorsFor(`openingHourItems.${index}.hours`);
    }
    setListingDraft((current) => ({
      ...current,
      openingHourItems: (current.openingHourItems.length
        ? current.openingHourItems
        : defaultListingOpeningHours()
      ).map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const updateOpeningHourSlot = (
    rowIndex: number,
    slotIndex: number,
    key: 'open' | 'close',
    value: string,
  ) => {
    clearListingErrorsFor(`openingHourItems.${rowIndex}.hours`);
    setListingDraft((current) => {
      const rows = current.openingHourItems.length
        ? current.openingHourItems
        : defaultListingOpeningHours();
      const target = rows[rowIndex] ?? defaultListingOpeningHours()[rowIndex] ?? {
        day: listingOpeningDays[rowIndex] ?? 'Ngày',
        isOff: false,
        hours: defaultListingOpeningSlot,
      };
      const slots = splitOpeningHourSlots(target.hours);
      while (slots.length <= slotIndex) {
        slots.push(defaultListingOpeningSlot);
      }

      const currentSlot = splitOpeningHourSlot(slots[slotIndex] || defaultListingOpeningSlot);
      slots[slotIndex] = formatOpeningHourSlot(
        key === 'open' ? value : currentSlot.open,
        key === 'close' ? value : currentSlot.close,
      );

      return {
        ...current,
        openingHourItems: rows.map((item, index) =>
          index === rowIndex ? { ...item, hours: slots.join(', ') } : item,
        ),
      };
    });
  };

  const addOpeningHourSlot = (rowIndex: number) => {
    clearListingErrorsFor(`openingHourItems.${rowIndex}.hours`);
    setListingDraft((current) => {
      const rows = current.openingHourItems.length
        ? current.openingHourItems
        : defaultListingOpeningHours();
      const target = rows[rowIndex] ?? defaultListingOpeningHours()[rowIndex] ?? {
        day: listingOpeningDays[rowIndex] ?? 'Ngày',
        isOff: false,
        hours: defaultListingOpeningSlot,
      };
      const slots = splitOpeningHourSlots(target.hours);

      return {
        ...current,
        openingHourItems: rows.map((item, index) =>
          index === rowIndex
            ? { ...item, hours: [...slots, defaultListingOpeningSlot].join(', ') }
            : item,
        ),
      };
    });
  };

  const removeOpeningHourSlot = (rowIndex: number, slotIndex: number) => {
    clearListingErrorsFor(`openingHourItems.${rowIndex}.hours`);
    setListingDraft((current) => {
      const rows = current.openingHourItems.length
        ? current.openingHourItems
        : defaultListingOpeningHours();
      const target = rows[rowIndex] ?? defaultListingOpeningHours()[rowIndex] ?? {
        day: listingOpeningDays[rowIndex] ?? 'Ngày',
        isOff: false,
        hours: defaultListingOpeningSlot,
      };
      const slots = splitOpeningHourSlots(target.hours).filter((_, index) => index !== slotIndex);

      return {
        ...current,
        openingHourItems: rows.map((item, index) =>
          index === rowIndex ? { ...item, hours: slots.join(', ') } : item,
        ),
      };
    });
  };

  const updateGalleryUrl = (index: number, value: string) => {
    clearListingErrorsFor(`galleryUrls.${index}`);
    setListingDraft((current) => ({
      ...current,
      galleryUrls: current.galleryUrls.map((item, itemIndex) =>
        itemIndex === index ? value : item,
      ),
    }));
  };

  const addGalleryUrl = () => {
    clearListingErrorsFor('galleryUrls');
    setListingDraft((current) => ({
      ...current,
      galleryUrls: [...current.galleryUrls, ''],
    }));
  };

  const removeGalleryUrl = (index: number) => {
    clearListingErrorsFor('galleryUrls');
    setListingDraft((current) => ({
      ...current,
      galleryUrls: current.galleryUrls.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const updateVideoUrl = (index: number, value: string) => {
    clearListingErrorsFor(`videoUrls.${index}`);
    setListingDraft((current) => ({
      ...current,
      videoUrls: current.videoUrls.map((item, itemIndex) =>
        itemIndex === index ? value : item,
      ),
    }));
  };

  const addVideoUrl = () => {
    clearListingErrorsFor('videoUrls');
    setListingDraft((current) => ({
      ...current,
      videoUrls: [...current.videoUrls, ''],
    }));
  };

  const removeVideoUrl = (index: number) => {
    clearListingErrorsFor('videoUrls');
    setListingDraft((current) => ({
      ...current,
      videoUrls: current.videoUrls.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const updateMenuGroupName = (index: number, value: string) => {
    clearListingErrorsFor(`menuGroups.${index}.name`);
    setListingDraft((current) => ({
      ...current,
      menuGroups: current.menuGroups.map((group, groupIndex) =>
        groupIndex === index ? { ...group, name: value } : group,
      ),
    }));
  };

  const addMenuGroup = () => {
    clearListingErrorsFor('menuGroups');
    setListingDraft((current) => ({
      ...current,
      menuGroups: [...current.menuGroups, { name: '', items: [] }],
    }));
  };

  const removeMenuGroup = (index: number) => {
    clearListingErrorsFor('menuGroups');
    setListingDraft((current) => ({
      ...current,
      menuGroups: current.menuGroups.filter((_, groupIndex) => groupIndex !== index),
    }));
  };

  const updateMenuItem = (
    groupIndex: number,
    itemIndex: number,
    key: keyof PartnerListingMenuItem,
    value: string | boolean,
  ) => {
    clearListingErrorsFor(`menuGroups.${groupIndex}.items.${itemIndex}.${String(key)}`);
    setListingDraft((current) => ({
      ...current,
      menuGroups: current.menuGroups.map((group, currentGroupIndex) =>
        currentGroupIndex === groupIndex
          ? {
              ...group,
              items: group.items.map((item, currentItemIndex) =>
                currentItemIndex === itemIndex ? { ...item, [key]: value } : item,
              ),
            }
          : group,
      ),
    }));
  };

  const addMenuItem = (groupIndex: number) => {
    clearListingErrorsFor(`menuGroups.${groupIndex}.items`);
    setListingDraft((current) => ({
      ...current,
      menuGroups: current.menuGroups.map((group, currentGroupIndex) =>
        currentGroupIndex === groupIndex
          ? {
              ...group,
              items: [
                ...group.items,
                { name: '', description: '', priceTier: '$$', isHot: false, imageUrl: '' },
              ],
            }
          : group,
      ),
    }));
  };

  const removeMenuItem = (groupIndex: number, itemIndex: number) => {
    clearListingErrorsFor(`menuGroups.${groupIndex}.items`);
    setListingDraft((current) => ({
      ...current,
      menuGroups: current.menuGroups.map((group, currentGroupIndex) =>
        currentGroupIndex === groupIndex
          ? {
              ...group,
              items: group.items.filter((_, currentItemIndex) => currentItemIndex !== itemIndex),
            }
          : group,
      ),
    }));
  };

  const updateCastProfile = (
    index: number,
    key: keyof PartnerListingCast,
    value: string | string[] | number | undefined,
  ) => {
    clearListingErrorsFor(`castProfiles.${index}.${String(key)}`);
    setListingDraft((current) => ({
      ...current,
      castProfiles: current.castProfiles.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const isEmptyCastProfile = (cast: PartnerListingCast) =>
    !hasText(cast.stageName) &&
    !hasText(cast.publicHeadline) &&
    !hasText(cast.bio) &&
    !hasText(cast.zodiacSign) &&
    !hasText(cast.measurements) &&
    !cast.birthMonth &&
    !cast.heightCm &&
    !(cast.tags?.length) &&
    !(cast.languages?.length) &&
    !(cast.hobbies?.length) &&
    !(cast.youtubeLinks?.length) &&
    !(cast.mediaUrls?.length);

  const addCastProfile = () => {
    clearListingErrorsFor('castProfiles');
    setListingDraft((current) => ({
      ...current,
      castProfiles: [
        {
          stageName: '',
          publicHeadline: '',
          bio: '',
          tags: [],
          languages: [],
          hobbies: [],
          youtubeLinks: [],
          mediaUrls: [],
        },
        ...current.castProfiles,
      ],
    }));
    setActiveCastProfileIndex(0);
    setIsAddingCastProfile(true);
  };

  const removeCastProfile = (index: number) => {
    clearListingErrorsFor('castProfiles');
    setListingDraft((current) => ({
      ...current,
      castProfiles: current.castProfiles.filter((_, itemIndex) => itemIndex !== index),
    }));
    setActiveCastProfileIndex((current) => {
      if (current === null) return null;
      if (current === index) return null;
      return current > index ? current - 1 : current;
    });
    setIsAddingCastProfile(false);
  };

  const openCastProfileForm = (index: number) => {
    setActiveCastProfileIndex(index);
    setIsAddingCastProfile(false);
  };

  const closeCastProfileForm = () => {
    const activeCast = activeCastProfileIndex === null
      ? null
      : listingDraft.castProfiles[activeCastProfileIndex];

    if (isAddingCastProfile && activeCast && isEmptyCastProfile(activeCast)) {
      removeCastProfile(activeCastProfileIndex ?? 0);
    }

    setActiveCastProfileIndex(null);
    setIsAddingCastProfile(false);
  };

  const saveCastProfileForm = () => {
    setActiveCastProfileIndex(null);
    setIsAddingCastProfile(false);
  };

  const listingPayload = () => {
    const galleryUrls = listingDraft.galleryUrls.filter((url) => url.trim());
    const videoUrls = listingDraft.videoUrls.filter((url) => url.trim());
    const mediaUrls = [
      listingDraft.coverImageUrl.trim(),
      ...galleryUrls,
      ...videoUrls,
    ]
      .filter(Boolean)
      .filter((url, index, list) => list.indexOf(url) === index);
    const menuGroups = listingDraft.menuGroups
      .filter((group) => group.name.trim())
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.name.trim()),
      }));
    const pricingItems: PartnerListingPricing[] = [];
    const menuSummary = buildListingMenuSummary(menuGroups, pricingItems);

    return {
      ...listingDraft,
      priceRange: '',
      menuSummary,
      tags: listingDraft.tags.filter(Boolean),
      openingHourItems: (listingDraft.openingHourItems.length
        ? listingDraft.openingHourItems
        : defaultListingOpeningHours()
      ).filter((item) => item.day.trim() && (item.isOff || item.hours?.trim())),
      pricingItems,
      menuGroups,
      castProfiles: listingDraft.castProfiles
        .filter((item) => item.stageName.trim())
        .map((item) => ({
          ...item,
          tags: item.tags?.filter(Boolean) ?? [],
          languages: item.languages?.filter(Boolean) ?? [],
          hobbies: item.hobbies?.filter(Boolean) ?? [],
          youtubeLinks: item.youtubeLinks?.filter(Boolean) ?? [],
          mediaUrls: item.mediaUrls?.filter(Boolean) ?? [],
        })),
      galleryUrls,
      videoUrls,
      mediaUrls,
    };
  };

  const listingErrorCounts = useMemo(
    () =>
      Object.keys(listingErrors).reduce<Record<ListingTabKey, number>>(
        (counts, path) => ({
          ...counts,
          [tabFromListingErrorPath(path)]: counts[tabFromListingErrorPath(path)] + 1,
        }),
        { store: 0, cast: 0 },
      ),
    [listingErrors],
  );

  const listingInputStyle = (path: string, extra?: React.CSSProperties): React.CSSProperties => ({
    ...inputStyle,
    ...(listingErrors[path]
      ? {
          borderColor: 'rgba(255,180,168,.76)',
          background: 'rgba(255,180,168,.055)',
          boxShadow: '0 0 0 1px rgba(255,180,168,.14)',
        }
      : null),
    ...extra,
  });

  const listingErrorText = (path: string) =>
    listingErrors[path] ? (
      <span
        style={{
          color: colors.danger,
          fontSize: '11.5px',
          fontWeight: 800,
          lineHeight: 1.45,
        }}
      >
        {listingErrors[path]}
      </span>
    ) : null;

  const uploadListingFiles = async (
    files: File[],
    options: {
      key: string;
      kind: 'image' | 'video';
      purpose: string;
      successLabel: string;
      onUploaded: (urls: string[]) => void;
    },
  ) => {
    if (!files.length) return;

    const storeId = listingStoreId || activePartnerStore?.id;
    if (!storeId) {
      setListingNotice('Cần chọn quán trước khi tải file lên.');
      return;
    }

    const invalidFile = files.find((file) => !isAllowedListingFile(file, options.kind));
    if (invalidFile) {
      setListingNotice(
        options.kind === 'image'
          ? `File ${invalidFile.name} không đúng định dạng. Chỉ nhận JPG, PNG, WebP, GIF hoặc SVG.`
          : `File ${invalidFile.name} không đúng định dạng. Chỉ nhận MP4 hoặc WebM.`,
      );
      return;
    }

    const limit = listingUploadLimits[options.kind];
    const oversizedFile = files.find((file) => file.size > limit);
    if (oversizedFile) {
      setListingNotice(
        `${oversizedFile.name} vượt quá dung lượng ${options.kind === 'image' ? '15MB' : '25MB'}.`,
      );
      return;
    }

    setListingUploadKey(options.key);
    setListingNotice(`Đang tải ${files.length} file lên...`);

    try {
      const urls: string[] = [];
      for (const file of files) {
        const form = new FormData();
        form.append('file', file);
        form.append('purpose', options.purpose);
        form.append('access', 'PUBLIC');
        form.append('storeId', storeId);

        const response = await apiFormDataClient<StorageUploadResponse>('/storage/upload', form);
        const uploadedUrl = response.url?.trim();
        if (!uploadedUrl) {
          throw new Error('Không lấy được URL sau khi tải file lên.');
        }
        urls.push(uploadedUrl);
      }

      options.onUploaded(urls);
      setListingNotice(`Đã tải ${options.successLabel}. Bấm Lưu nháp hoặc Gửi duyệt để lưu vào bản đăng tin.`);
    } catch (error) {
      setListingNotice(error instanceof Error ? error.message : 'Không tải file lên được.');
    } finally {
      setListingUploadKey(null);
    }
  };

  const renderListingUploadButton = (options: {
    key: string;
    label: string;
    loadingLabel: string;
    kind: 'image' | 'video';
    multiple?: boolean;
    purpose: string;
    successLabel: string;
    onUploaded: (urls: string[]) => void;
  }) => {
    const isBusy = listingUploadKey === options.key;
    const isDisabled = Boolean(listingUploadKey);

    return (
      <label
        style={{
          minHeight: '38px',
          borderRadius: '11px',
          border: `1px solid ${colors.borderGold22}`,
          background: colors.surface2,
          color: colors.gold,
          padding: '0 12px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontWeight: 900,
          fontSize: '12.5px',
          cursor: isDisabled ? 'wait' : 'pointer',
          opacity: isDisabled && !isBusy ? 0.56 : 1,
          whiteSpace: 'nowrap',
        }}
      >
        {options.kind === 'image' ? <ImagePlus size={15} /> : <Upload size={15} />}
        {isBusy ? options.loadingLabel : options.label}
        <input
          type="file"
          accept={
            options.kind === 'image'
              ? 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml'
              : 'video/mp4,video/webm'
          }
          multiple={options.multiple}
          disabled={isDisabled}
          onChange={(event) => {
            const files = Array.from(event.currentTarget.files ?? []);
            event.currentTarget.value = '';
            void uploadListingFiles(files, options);
          }}
          style={{ display: 'none' }}
        />
      </label>
    );
  };

  const listingMediaUrl = (url: unknown) => {
    const trimmed = safeListingText(url).trim();
    return resolveClientUrl(trimmed) || trimmed;
  };

  const getListingYoutubeId = (url: unknown) => {
    const trimmed = safeListingText(url).trim();
    const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i);
    return match?.[1] ?? null;
  };

  const getListingYoutubeThumb = (url: unknown) => {
    const videoId = getListingYoutubeId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  };

  const renderListingUploadTile = (options: {
    key: string;
    label: string;
    loadingLabel: string;
    kind: 'image' | 'video';
    multiple?: boolean;
    purpose: string;
    successLabel: string;
    onUploaded: (urls: string[]) => void;
    minHeight?: number | string;
    aspectRatio?: string;
  }) => {
    const isBusy = listingUploadKey === options.key;
    const isDisabled = Boolean(listingUploadKey);

    return (
      <label
        style={{
          minHeight: options.minHeight ?? 120,
          aspectRatio: options.aspectRatio,
          borderRadius: '14px',
          border: `1.5px dashed ${colors.borderGold32}`,
          background: colors.surface2,
          color: colors.gold,
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontWeight: 900,
          fontSize: '12px',
          cursor: isDisabled ? 'wait' : 'pointer',
          opacity: isDisabled && !isBusy ? 0.56 : 1,
          textAlign: 'center',
        }}
      >
        {options.kind === 'image' ? <ImagePlus size={20} /> : <Upload size={20} />}
        <span>{isBusy ? options.loadingLabel : options.label}</span>
        <input
          type="file"
          accept={
            options.kind === 'image'
              ? 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml'
              : 'video/mp4,video/webm'
          }
          multiple={options.multiple}
          disabled={isDisabled}
          onChange={(event) => {
            const files = Array.from(event.currentTarget.files ?? []);
            event.currentTarget.value = '';
            void uploadListingFiles(files, options);
          }}
          style={{ display: 'none' }}
        />
      </label>
    );
  };

  const renderListingMediaRemove = (label: string, onClick: () => void) => (
    <button
      type="button"
      aria-label={label}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        width: '26px',
        height: '26px',
        borderRadius: '50%',
        border: '1px solid rgba(255,255,255,.18)',
        background: 'rgba(0,0,0,.62)',
        color: '#fff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 3,
      }}
    >
      <XCircle size={15} />
    </button>
  );

  const renderListingImagePreview = (url: string, options: {
    label: string;
    onRemove: () => void;
    minHeight?: number | string;
    aspectRatio?: string;
  }) => (
    <div
      style={{
        position: 'relative',
        minHeight: options.minHeight ?? 128,
        aspectRatio: options.aspectRatio,
        borderRadius: '14px',
        overflow: 'hidden',
        border: `1px solid ${colors.borderGold22}`,
        background: colors.surface2,
      }}
    >
      <span
        role="img"
        aria-label={options.label}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          background: `url("${listingMediaUrl(url)}") center/cover no-repeat`,
        }}
      />
      {renderListingMediaRemove(options.label, options.onRemove)}
    </div>
  );

  const renderMenuItemImageControl = (
    item: PartnerListingMenuItem,
    groupIndex: number,
    itemIndex: number,
  ) => {
    const uploadKey = `menu-item-image-${groupIndex}-${itemIndex}`;
    const imageUrl = safeListingText(item.imageUrl).trim();
    const isBusy = listingUploadKey === uploadKey;
    const isDisabled = Boolean(listingUploadKey);
    const uploadClassName = [
      'partner-menu-image-upload',
      imageUrl ? 'is-replace' : '',
      isDisabled ? 'is-disabled' : '',
    ].filter(Boolean).join(' ');

    const handleFiles = (files: File[]) => {
      void uploadListingFiles(files, {
        key: uploadKey,
        kind: 'image',
        purpose: 'PARTNER_MENU_ITEM',
        successLabel: 'ảnh món',
        onUploaded: ([url]) => {
          if (!url) return;
          updateMenuItem(groupIndex, itemIndex, 'imageUrl', url);
        },
      });
    };

    return (
      <div className="partner-menu-image-field">
        <span>Ảnh món</span>
        <div className={imageUrl ? 'partner-menu-image-control has-image' : 'partner-menu-image-control'}>
          {imageUrl ? (
            <span
              className="partner-menu-image-thumb"
              role="img"
              aria-label={`Ảnh món ${itemIndex + 1}`}
              style={{ background: `url("${listingMediaUrl(imageUrl)}") center/cover no-repeat` }}
            />
          ) : null}
          <label className={uploadClassName} aria-disabled={isDisabled}>
            <ImagePlus size={15} />
            <span>{isBusy ? 'Đang tải...' : imageUrl ? 'Đổi ảnh' : 'Tải ảnh món từ máy'}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              disabled={isDisabled}
              onChange={(event) => {
                const files = Array.from(event.currentTarget.files ?? []);
                event.currentTarget.value = '';
                handleFiles(files);
              }}
            />
          </label>
          {imageUrl ? (
            <button
              type="button"
              className="partner-menu-image-remove"
              aria-label={`Xóa ảnh món ${itemIndex + 1}`}
              onClick={() => updateMenuItem(groupIndex, itemIndex, 'imageUrl', '')}
            >
              <XCircle size={15} />
            </button>
          ) : null}
        </div>
        {listingErrorText(`menuGroups.${groupIndex}.items.${itemIndex}.imageUrl`)}
      </div>
    );
  };

  const renderListingVideoPreview = (url: string, index: number, onRemove: () => void) => {
    const youtubeThumb = getListingYoutubeThumb(url);
    const source = listingMediaUrl(url);

    return (
      <div
        key={`${url}-${index}`}
        style={{
          display: 'grid',
          gridTemplateColumns: '132px minmax(0, 1fr) auto',
          alignItems: 'center',
          gap: '12px',
          padding: '10px',
          borderRadius: '14px',
          border: `1px solid ${colors.borderGold22}`,
          background: colors.surface2,
        }}
      >
        <div
          style={{
            position: 'relative',
            height: '78px',
            borderRadius: '11px',
            overflow: 'hidden',
            background: colors.surface3,
          }}
        >
          {youtubeThumb ? (
            <span
              role="img"
              aria-label={`Video ${index + 1}`}
              style={{
                display: 'block',
                width: '100%',
                height: '100%',
                background: `url("${youtubeThumb}") center/cover no-repeat`,
              }}
            />
          ) : (
            <video
              src={source}
              muted
              playsInline
              preload="metadata"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          )}
          <span
            style={{
              position: 'absolute',
              inset: 0,
              margin: 'auto',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'rgba(12,12,15,.62)',
              border: '1px solid rgba(255,255,255,.25)',
              color: colors.goldPale,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Play size={15} fill="currentColor" />
          </span>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: colors.text, fontSize: '12.5px', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {youtubeThumb ? 'Video YouTube' : 'Video tải lên'}
          </div>
          <div title={url} style={{ marginTop: '4px', color: colors.muted, fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {url}
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Xóa video ${index + 1}`}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            border: `1px solid ${colors.borderSoft}`,
            background: colors.surface3,
            color: colors.text2,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <XCircle size={16} />
        </button>
      </div>
    );
  };

  const renderStoreMediaSections = () => (
    <>
      <section className="partner-listing-section">
        <div className="partner-listing-section-title">Ảnh bìa (Tối đa 15MB)</div>
        {safeListingText(listingDraft.coverImageUrl).trim()
          ? renderListingImagePreview(listingDraft.coverImageUrl, {
              label: 'Xóa ảnh bìa',
              minHeight: 168,
              onRemove: () => updateListingField('coverImageUrl', ''),
            })
          : renderListingUploadTile({
              key: 'store-cover-image',
              label: 'Tải ảnh bìa',
              loadingLabel: 'Đang tải ảnh bìa...',
              kind: 'image',
              purpose: 'PARTNER_STORE_COVER',
              successLabel: 'ảnh bìa',
              minHeight: 168,
              onUploaded: ([url]) => {
                if (!url) return;
                updateListingField('coverImageUrl', url);
              },
            })}
        <FormField label="Cover image URL" style={{ marginTop: '10px' }}>
          <input
            value={listingDraft.coverImageUrl}
            onChange={(event) => updateListingField('coverImageUrl', event.target.value)}
            placeholder="https://.../cover.jpg"
            style={listingInputStyle('coverImageUrl')}
          />
          {listingErrorText('coverImageUrl')}
        </FormField>
      </section>

      <section className="partner-listing-section">
        <div className="partner-listing-section-title">Album ảnh</div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(126px, 1fr))',
            gap: '12px',
          }}
        >
          {listingDraft.galleryUrls.map((url, index) => (
            safeListingText(url).trim() ? (
              <div key={`${url}-${index}`}>
                {renderListingImagePreview(url, {
                  label: `Xóa ảnh album ${index + 1}`,
                  aspectRatio: '1 / 1',
                  onRemove: () => removeGalleryUrl(index),
                })}
                {listingErrorText(`galleryUrls.${index}`)}
              </div>
            ) : (
              <div key={`empty-gallery-${index}`} style={{ ...softCardStyle, padding: '12px', display: 'grid', gap: '8px' }}>
                <FormField label={`Ảnh album ${index + 1}`}>
                  <input
                    value={url}
                    onChange={(event) => updateGalleryUrl(index, event.target.value)}
                    placeholder="https://..."
                    style={listingInputStyle(`galleryUrls.${index}`)}
                  />
                  {listingErrorText(`galleryUrls.${index}`)}
                </FormField>
                <GhostButton onClick={() => removeGalleryUrl(index)}>
                  <XCircle size={16} />
                  Xóa
                </GhostButton>
              </div>
            )
          ))}
          {renderListingUploadTile({
            key: 'store-gallery-images',
            label: 'Tải lên',
            loadingLabel: 'Đang tải...',
            kind: 'image',
            multiple: true,
            purpose: 'PARTNER_STORE_GALLERY',
            successLabel: 'ảnh album',
            aspectRatio: '1 / 1',
            onUploaded: (urls) => {
              clearListingErrorsFor('galleryUrls');
              setListingDraft((current) => ({
                ...current,
                galleryUrls: [...current.galleryUrls.filter(Boolean), ...urls],
              }));
            },
          })}
        </div>
        {!listingDraft.galleryUrls.length ? (
          <div style={{ color: colors.muted, fontSize: '12px', marginTop: '8px' }}>
            Chưa có ảnh album. Tải ảnh từ máy hoặc thêm URL ảnh thật của quán.
          </div>
        ) : null}
        <div style={{ marginTop: '10px' }}>
          <GhostButton onClick={addGalleryUrl}>
            <ImagePlus size={16} />
            Thêm URL ảnh
          </GhostButton>
        </div>
      </section>

      <section className="partner-listing-section">
        <div className="partner-listing-section-title">Video quán</div>
        <div style={{ display: 'grid', gap: '10px' }}>
          {listingDraft.videoUrls.map((url, index) => (
            safeListingText(url).trim() ? (
              <div key={`${url}-${index}`}>
                {renderListingVideoPreview(url, index, () => removeVideoUrl(index))}
                {listingErrorText(`videoUrls.${index}`)}
              </div>
            ) : (
              <div key={`empty-video-${index}`} className="partner-listing-grid" style={{ ...softCardStyle, padding: '12px' }}>
                <FormField label={`Video ${index + 1}`}>
                  <input
                    value={url}
                    onChange={(event) => updateVideoUrl(index, event.target.value)}
                    placeholder="https://youtube.com/..."
                    style={listingInputStyle(`videoUrls.${index}`)}
                  />
                  {listingErrorText(`videoUrls.${index}`)}
                </FormField>
                <div style={{ display: 'flex', alignItems: 'end' }}>
                  <GhostButton onClick={() => removeVideoUrl(index)}>
                    <XCircle size={16} />
                    Xóa
                  </GhostButton>
                </div>
              </div>
            )
          ))}
          {!listingDraft.videoUrls.length ? (
            <div style={{ ...softCardStyle, padding: '14px', color: colors.text2, fontSize: '12.5px', lineHeight: 1.6 }}>
              Chưa có video. Có thể tải video từ máy, dán YouTube hoặc URL video đã tải lên.
            </div>
          ) : null}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
          {renderListingUploadButton({
            key: 'store-videos',
            label: 'Tải video từ máy',
            loadingLabel: 'Đang tải video...',
            kind: 'video',
            multiple: true,
            purpose: 'PARTNER_STORE_VIDEO',
            successLabel: 'video quán',
            onUploaded: (urls) => {
              clearListingErrorsFor('videoUrls');
              setListingDraft((current) => ({
                ...current,
                videoUrls: [...current.videoUrls.filter(Boolean), ...urls],
              }));
            },
          })}
          <GhostButton onClick={addVideoUrl}>
            <ImagePlus size={16} />
            Thêm URL video
          </GhostButton>
        </div>
      </section>

    </>
  );

  const validateListingBeforeAction = (mode: ListingValidationMode) => {
    if (!listingStoreId) {
      setListingNotice('Cần chọn quán trước khi lưu hoặc gửi duyệt.');
      setListingErrors({});
      return false;
    }

    const validation = validateListingDraft(listingDraft, mode);
    setListingErrors(validation.errors);

    const count = Object.keys(validation.errors).length;
    if (count) {
      if (validation.firstTab) {
        setListingTab(validation.firstTab);
      }
      setListingNotice(
        mode === 'submit'
          ? `Còn ${count} lỗi cần sửa trước khi gửi Admin duyệt.`
          : `Còn ${count} lỗi cần sửa trước khi lưu bản nháp.`,
      );
      return false;
    }

    return true;
  };

  const saveListingDraft = async () => {
    if (!validateListingBeforeAction('draft')) {
      return;
    }

    setIsSavingListing(true);
    setListingNotice('Đang lưu bản nháp...');
    try {
      const response = await apiClient<PartnerListingDraftResponse>(
        `/partner/listing-draft/${encodeURIComponent(listingStoreId)}`,
        {
          method: 'PUT',
          data: listingPayload(),
        },
      );
      applyListingDraftResponse(response);
      setListingNotice('Đã lưu bản nháp đăng thông tin.');
    } catch (error) {
      setListingNotice(
        error instanceof ApiError ? error.message : 'Không lưu được bản nháp.',
      );
    } finally {
      setIsSavingListing(false);
    }
  };

  const submitListingDraft = async () => {
    if (!validateListingBeforeAction('submit')) {
      return;
    }

    setIsSubmittingListing(true);
    setListingNotice('Đang gửi bản nháp cho Admin duyệt...');
    try {
      const response = await apiClient<{
        id: string;
        status: string;
        submittedAt: string;
        message: string;
      }>(`/partner/listing-draft/${encodeURIComponent(listingStoreId)}/submit`, {
        data: listingPayload(),
      });
      setListingReview({
        id: response.id,
        status: response.status,
        submittedAt: response.submittedAt,
        publicState: 'HIDDEN',
      });
      setListingNotice('Đã gửi Admin duyệt. Nội dung sẽ public sau khi được duyệt.');
    } catch (error) {
      setListingNotice(
        error instanceof ApiError ? error.message : 'Không gửi duyệt được bản nháp.',
      );
    } finally {
      setIsSubmittingListing(false);
    }
  };

  const logout = () => {
    clearAuthSession();
    window.location.href = '/dang-nhap-doi-tac';
  };

  const renderOverviewPanel = () => (
    <>
      <div className="partner-metric-grid">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <PanelCard key={metric.label} style={{ padding: '18px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <span
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '15px',
                    border: `1px solid ${colors.borderGold12}`,
                    background: colors.surface2,
                    color: colors.gold,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={20} strokeWidth={1.7} />
                </span>
                <StatusPill tone="gold">{metric.trend}</StatusPill>
              </div>
              <div
                style={{
                  marginTop: '16px',
                  color: colors.muted,
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                {metric.label}
              </div>
              <div
                style={{
                  marginTop: '8px',
                  color: colors.text,
                  fontSize: '32px',
                  fontWeight: 800,
                  lineHeight: 1,
                }}
              >
                {metric.value}
              </div>
              <div style={{ marginTop: '8px', color: colors.goldBright, fontSize: '12px' }}>
                {metric.sub}
              </div>
            </PanelCard>
          );
        })}
      </div>

      <div className="partner-overview-grid">
        <PanelCard>
          <SectionHeading
            eyebrow="WEEKLY BOOKINGS"
            title="Lượt đặt chỗ 7 ngày"
            action={
              <StatusPill tone="gold">
                <TrendingUp size={13} />
                Live scope
              </StatusPill>
            }
          />
          {bookingTrendBars.length ? (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px', height: '235px' }}>
              {bookingTrendBars.map((bar, index) => (
                <div
                  key={bar.label}
                  style={{
                    flex: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: `${bar.height}%`,
                      borderRadius: '8px 8px 0 0',
                      background: index === 4 ? colors.goldGrad : 'rgba(212,178,106,.22)',
                      boxShadow: index === 4 ? '0 14px 26px -18px rgba(212,178,106,.85)' : 'none',
                    }}
                  />
                  <span style={{ color: colors.goldBright, fontSize: '11px', fontWeight: 800 }}>
                    {bar.count}
                  </span>
                  <span style={{ color: colors.muted, fontSize: '11px' }}>{bar.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ ...softCardStyle, minHeight: '235px', display: 'grid', placeItems: 'center', color: colors.text2, fontSize: '13px', lineHeight: 1.6, padding: '18px', textAlign: 'center' }}>
              Chưa có dữ liệu đặt chỗ trong kỳ đã chọn.
            </div>
          )}
        </PanelCard>

        <PanelCard>
          <SectionHeading eyebrow="RECENT REDEMPTIONS" title="Đối soát gần đây" />
          <div style={{ display: 'grid', gap: '10px' }}>
            {settlementRows.length ? (
              settlementRows.slice(0, 4).map((row) => (
                <div key={row.code} style={{ ...softCardStyle, padding: '12px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '10px',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ color: colors.gold, fontSize: '12px', fontWeight: 800 }}>
                      {row.code}
                    </span>
                    <span style={{ color: colors.goldBright, fontSize: '12px', fontWeight: 800 }}>
                      -{moneyVnd(row.amount)}
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: '6px',
                      color: colors.text,
                      fontSize: '12.5px',
                      lineHeight: 1.45,
                    }}
                  >
                    {row.service}
                  </div>
                  <div
                    style={{
                      marginTop: '5px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '8px',
                      color: colors.muted,
                      fontSize: '11px',
                    }}
                  >
                    <span>{row.time}</span>
                    <span>Khách đã ẩn</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ ...softCardStyle, padding: '16px', color: colors.text2, fontSize: '13px', lineHeight: 1.6 }}>
                Chưa có bill hoặc coupon usage log trong phạm vi quán của partner.
              </div>
            )}
          </div>
        </PanelCard>
      </div>

    </>
  );

  const renderScanPanel = () => (
    <div className="partner-scan-grid">
      <PanelCard>
        <SectionHeading
          title="Quét / nhập mã QR"
          hideLine
          action={
            offlineScanQueue.length > 0 ? (
              <StatusPill tone="gold">
                {offlineScanQueue.length} offline
              </StatusPill>
            ) : null
          }
        />

        <div
          style={{
            minHeight: '320px',
            borderRadius: '16px',
            border: `1px solid ${cameraStatus === 'active' ? colors.borderGold40 : colors.borderGold22}`,
            background: cameraActive
              ? 'rgba(0,0,0,.35)'
              : 'linear-gradient(135deg,rgba(212,178,106,.12),rgba(255,255,255,.025)), rgba(0,0,0,.24)',
            overflow: 'hidden',
            position: 'relative',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <video
            ref={videoRef}
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: cameraActive ? 'block' : 'none',
            }}
          />
          {!cameraActive ? (
            <div style={{ textAlign: 'center', color: colors.text2 }}>
              <span
                style={{
                  width: '88px',
                  height: '88px',
                  margin: '0 auto 16px',
                  borderRadius: '22px',
                  border: `1px solid ${colors.borderGold32}`,
                  display: 'grid',
                  placeItems: 'center',
                  color: colors.gold,
                  background: colors.surface2,
                }}
              >
                <QrCode size={44} strokeWidth={1.6} />
              </span>
              <div style={{ color: colors.text, fontSize: '15px', fontWeight: 800 }}>
                Đưa QR vào khung xác thực tại quán
              </div>
              <div style={{ marginTop: '8px', color: colors.muted, fontSize: '12px' }}>
                Có thể dán link hoặc nhập mã thủ công ở bên dưới.
              </div>
            </div>
          ) : (
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                width: '54%',
                aspectRatio: '1',
                border: `2px solid ${colors.gold}`,
                borderRadius: '16px',
                boxShadow: '0 0 0 999px rgba(0,0,0,.18)',
              }}
            />
          )}
        </div>

        <div style={{ marginTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <PrimaryButton
            disabled={cameraStatus === 'starting'}
            onClick={cameraActive ? stopCameraScan : () => void startCameraScan()}
          >
            <Camera size={16} />
            {cameraStatus === 'active'
              ? 'Tắt camera'
              : cameraStatus === 'starting'
                ? 'Đang mở'
                : 'Mở camera'}
          </PrimaryButton>
          <GhostButton
            disabled={isScanning || !offlineScanQueue.length}
            onClick={() => void replayOfflineScans()}
          >
            <Upload size={16} />
            Gửi offline
          </GhostButton>
        </div>

        <div style={{ marginTop: '8px', color: colors.muted, fontSize: '11px', lineHeight: 1.5 }}>
          Luồng quét gồm scan, kiểm tra đúng quán/còn hạn/chưa USED, rồi xác nhận check-in.
          Hàng đợi offline tự xoá sau 24h hoặc sau 3 lần gửi lỗi.
        </div>

        {cameraMessage ? (
          <div
            style={{
              marginTop: '12px',
              color:
                cameraStatus === 'error' || cameraStatus === 'unsupported'
                  ? colors.danger
                  : colors.goldBright,
              fontSize: '12px',
              lineHeight: 1.55,
            }}
          >
            {cameraMessage}
          </div>
        ) : null}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void scanCouponPayload(scanPayload);
          }}
          style={{
            marginTop: '16px',
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) auto',
            gap: '10px',
          }}
        >
          <input
            value={scanPayload}
            onChange={(event) => setScanPayload(event.target.value)}
            placeholder="Dán QR đặt chỗ, scanToken, link QR hoặc mã coupon"
            style={inputStyle}
          />
          <PrimaryButton disabled={isScanning} type="submit">
            <QrCode size={16} />
            {isScanning ? 'Đang kiểm tra' : 'Kiểm tra mã'}
          </PrimaryButton>
        </form>

        <div style={{ marginTop: '12px', color: colors.text2, fontSize: '12px', lineHeight: 1.6 }}>
          {scanMessage}
        </div>
      </PanelCard>

      <PanelCard>
        <SectionHeading title="Kết quả xác thực" hideLine />
        {scanIssue ? (
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ ...softCardStyle, padding: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <div style={{ color: colors.gold, fontSize: '18px', fontWeight: 900 }}>
                    {scanIssue.code}
                  </div>
                  <div
                    style={{
                      marginTop: '6px',
                      color: colors.text,
                      fontSize: '14px',
                      fontWeight: 800,
                    }}
                  >
                    {scanIssue.scanType === 'BOOKING_QR'
                      ? 'Đơn đặt chỗ'
                      : scanIssue.coupon?.name ?? 'Coupon'}{' '}
                    ·{' '}
                    {scanIssue.coupon?.store?.name ?? storeName}
                  </div>
                </div>
                <StatusPill tone={scanIssue.status === 'ISSUED' ? 'success' : 'neutral'}>
                  {scanIssue.statusLabel ?? scanIssue.status}
                </StatusPill>
              </div>
            </div>

            {[
              ['Loại mã', scanIssue.scanType === 'BOOKING_QR' ? 'QR đặt chỗ' : 'Coupon'],
              ['Quán áp dụng', scanIssue.coupon?.store?.name ?? storeName],
              ...(scannedDiscountLabel ? [['Mức giảm', scannedDiscountLabel]] : []),
              ['Trạng thái', scanIssue.statusLabel ?? scanIssue.status],
              ...(scannedUsedAtLabel ? [['Ngày giờ quét', scannedUsedAtLabel]] : []),
              ['Hạn sử dụng', scannedExpiryLabel],
              ['Khách hàng', scannedCustomerLabel],
              ['Booking', scannedBookingLabel],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  minHeight: '44px',
                  borderBottom: `1px solid ${colors.borderHair}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  fontSize: '12.5px',
                }}
              >
                <span style={{ color: colors.muted }}>{label}</span>
                <span style={{ color: colors.text, textAlign: 'right', fontWeight: 700 }}>
                  {value}
                </span>
              </div>
            ))}

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
              <PrimaryButton
                disabled={!canConfirmScan || isConfirmingScan}
                onClick={confirmScannedIssue}
              >
                <CheckCircle2 size={16} />
                {scanIssue.status === 'USED'
                  ? scanIssue.scanType === 'BOOKING_QR'
                    ? 'Đã check-in'
                    : 'Đã sử dụng'
                  : isConfirmingScan
                    ? 'Đang xác nhận'
                    : scanIssue.scanType === 'BOOKING_QR'
                      ? 'Xác nhận check-in'
                      : 'Xác nhận'}
              </PrimaryButton>
              <GhostButton onClick={rejectScanResult}>
                <XCircle size={16} />
                Từ chối
              </GhostButton>
            </div>
          </div>
        ) : (
          <div
            style={{
              ...softCardStyle,
              padding: '18px',
              color: colors.text2,
              fontSize: '13px',
              lineHeight: 1.7,
            }}
          >
            Chưa có mã nào được kiểm tra trong phiên này. Khi partner quét QR, màn này chỉ hiển thị
            dữ liệu cần để xác nhận: mã, quán áp dụng, hạn dùng, trạng thái và nhãn khách đã ẩn.
          </div>
        )}
      </PanelCard>
    </div>
  );

  const renderSettlementPanel = () => (
    <>
      <PanelCard style={{ marginBottom: '14px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            flexWrap: 'wrap',
          }}
        >
          <SectionHeading eyebrow="PERIOD FILTER" title="Kỳ đối soát" />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {periodItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setPeriod(item.key)}
                aria-pressed={period === item.key}
                style={{
                  minHeight: '38px',
                  borderRadius: '18px',
                  border: `1px solid ${period === item.key ? colors.borderGold40 : colors.borderSoft}`,
                  background: period === item.key ? colors.goldGrad : colors.surface3,
                  color: period === item.key ? colors.onGold : colors.text2,
                  padding: '0 13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="partner-settlement-summary">
          {[
            ['Coupon đã dùng', String(usedCouponCount), 'Tự tăng sau khi confirm USED'],
            [
              'Tổng giảm giá',
              moneyVnd(totalDiscount),
              'Theo bill trong scope',
            ],
            ['Bill chờ soát', String(bills.length), 'Không lộ dữ liệu khách chi tiết'],
          ].map(([label, value, sub]) => (
            <div key={label} style={{ ...softCardStyle, padding: '15px' }}>
              <div style={{ color: colors.muted, fontSize: '12px', fontWeight: 700 }}>{label}</div>
              <div
                style={{
                  marginTop: '8px',
                  color: colors.goldBright,
                  fontSize: '24px',
                  fontWeight: 900,
                }}
              >
                {value}
              </div>
              <div style={{ marginTop: '5px', color: colors.text2, fontSize: '11.5px' }}>{sub}</div>
            </div>
          ))}
        </div>
      </PanelCard>

      <PanelCard>
        <SectionHeading
          eyebrow="SETTLEMENT TABLE"
          title="Bảng usage log"
          action={
            <StatusPill tone="gold">
              <CalendarDays size={13} />
              {periodItems.find((item) => item.key === period)?.label}
            </StatusPill>
          }
        />

        <div
          className="partner-settlement-filter-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 1.4fr .85fr .85fr .9fr auto',
            gap: '10px',
            alignItems: 'end',
            marginBottom: '16px',
          }}
        >
          <FormField label="Mã giao dịch">
            <input
              value={settlementFilters.code}
              onChange={(event) => updateSettlementFilter('code', event.target.value)}
              placeholder="VD: BILL-2026..."
              style={inputStyle}
            />
          </FormField>
          <FormField label="Dịch vụ / Coupon">
            <input
              value={settlementFilters.service}
              onChange={(event) => updateSettlementFilter('service', event.target.value)}
              placeholder="Tên dịch vụ, coupon hoặc quán"
              style={inputStyle}
            />
          </FormField>
          <FormField label="Từ ngày">
            <input
              value={settlementFilters.fromDate}
              onChange={(event) => updateSettlementFilter('fromDate', event.target.value)}
              type="date"
              style={inputStyle}
            />
          </FormField>
          <FormField label="Đến ngày">
            <input
              value={settlementFilters.toDate}
              onChange={(event) => updateSettlementFilter('toDate', event.target.value)}
              type="date"
              style={inputStyle}
            />
          </FormField>
          <FormField label="Trạng thái">
            <ThemedListingSelect
              value={settlementFilters.status}
              onChange={(value) => updateSettlementFilter('status', value)}
              placeholder="Tất cả"
              options={[
                { value: 'ALL', label: 'Tất cả' },
                ...settlementStatusOptions.map((status) => ({ value: status, label: status })),
              ]}
            />
          </FormField>
          <GhostButton disabled={!hasSettlementFilters} onClick={clearSettlementFilters}>
            Xóa lọc
          </GhostButton>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '920px' }}>
            <thead>
              <tr>
                {[
                  'STT',
                  'Mã giao dịch',
                  'Dịch vụ / Coupon',
                  'Thời gian',
                  'Khách',
                  'Giảm giá',
                  'Trạng thái',
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      padding: '0 12px 12px',
                      textAlign: 'left',
                      color: colors.muted,
                      fontSize: '11px',
                      fontWeight: 800,
                      borderBottom: `1px solid ${colors.borderHair}`,
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSettlementRows.length ? (
                filteredSettlementRows.map((row, index) => (
                  <tr key={`${row.code}-${index}`}>
                    <td
                      style={{
                        padding: '14px 12px',
                        color: colors.text2,
                        fontSize: '12px',
                        fontWeight: 800,
                        borderBottom: `1px solid ${colors.borderHair}`,
                      }}
                    >
                      {index + 1}
                    </td>
                    <td
                      style={{
                        padding: '14px 12px',
                        color: colors.gold,
                        fontSize: '12px',
                        fontWeight: 900,
                        borderBottom: `1px solid ${colors.borderHair}`,
                      }}
                    >
                      {row.code}
                    </td>
                    <td
                      style={{
                        padding: '14px 12px',
                        color: colors.text,
                        fontSize: '12.5px',
                        borderBottom: `1px solid ${colors.borderHair}`,
                      }}
                    >
                      {row.service}
                    </td>
                    <td
                      style={{
                        padding: '14px 12px',
                        color: colors.text2,
                        fontSize: '12px',
                        borderBottom: `1px solid ${colors.borderHair}`,
                      }}
                    >
                      {row.time}
                    </td>
                    <td
                      style={{
                        padding: '14px 12px',
                        color: colors.muted,
                        fontSize: '12px',
                        borderBottom: `1px solid ${colors.borderHair}`,
                      }}
                    >
                      Đã ẩn
                    </td>
                    <td
                      style={{
                        padding: '14px 12px',
                        color: colors.goldBright,
                        fontSize: '12px',
                        fontWeight: 900,
                        borderBottom: `1px solid ${colors.borderHair}`,
                      }}
                    >
                      -{moneyVnd(row.amount)}
                    </td>
                    <td
                      style={{ padding: '14px 12px', borderBottom: `1px solid ${colors.borderHair}` }}
                    >
                      <StatusPill tone="gold">{row.status}</StatusPill>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: '18px 12px',
                      color: colors.text2,
                      fontSize: '13px',
                      textAlign: 'center',
                    }}
                  >
                    {settlementRows.length
                      ? 'Không có usage log phù hợp với bộ lọc đang chọn.'
                      : 'Chưa có usage log trong phạm vi quán của partner.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </>
  );

  const renderCastProfileForm = (cast: PartnerListingCast, index: number) => (
    <div style={{ display: 'grid', gap: '14px' }}>
      <div className="partner-cast-form-header">
        <button
          type="button"
          onClick={closeCastProfileForm}
          aria-label="Quay lại bảng cast"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            border: `1px solid ${colors.borderGold22}`,
            background: colors.surface2,
            color: colors.gold,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flex: '0 0 auto',
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: colors.gold, fontSize: '10px', fontWeight: 900, letterSpacing: '1.7px' }}>
            {isAddingCastProfile ? 'THÊM CAST' : 'CHỈNH SỬA CAST'}
          </div>
          <h3 style={{ margin: '4px 0 0', color: colors.text, fontSize: '20px', fontWeight: 900 }}>
            {cast.stageName.trim() || 'Thông tin cast mới'}
          </h3>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {!isAddingCastProfile ? (
            <GhostButton onClick={() => removeCastProfile(index)}>
              <XCircle size={16} />
              Xóa cast
            </GhostButton>
          ) : null}
          <PrimaryButton onClick={saveCastProfileForm}>
            <Save size={16} />
            Lưu cast
          </PrimaryButton>
        </div>
      </div>

      <section className="partner-listing-section">
        <div className="partner-listing-section-title">Thông tin cơ bản</div>
        <div className="partner-listing-grid">
          <FormField label="Tên cast">
            <input
              value={cast.stageName}
              onChange={(event) => updateCastProfile(index, 'stageName', event.target.value)}
              placeholder="VD: Yuki"
              style={listingInputStyle(`castProfiles.${index}.stageName`)}
            />
            {listingErrorText(`castProfiles.${index}.stageName`)}
          </FormField>
          <FormField label="Quán trực thuộc">
            <input
              value={listingDraft.storeName || activePartnerStore?.name || 'Quán đang quản lý'}
              readOnly
              style={{ ...listingInputStyle(`castProfiles.${index}.storeName`), color: colors.goldPale }}
            />
          </FormField>
          <FormField label="Lời chào (greeting)">
            <input
              value={cast.publicHeadline ?? ''}
              onChange={(event) => updateCastProfile(index, 'publicHeadline', event.target.value)}
              placeholder="VD: Hỗ trợ khách thích không gian yên tĩnh"
              style={listingInputStyle(`castProfiles.${index}.publicHeadline`)}
            />
            {listingErrorText(`castProfiles.${index}.publicHeadline`)}
          </FormField>
          <FormField label="Ngôn ngữ">
            <input
              value={cast.languages?.join(', ') ?? ''}
              onChange={(event) => updateCastProfile(index, 'languages', splitInlineList(event.target.value))}
              placeholder="vi, en, ja"
              style={listingInputStyle(`castProfiles.${index}.languages`)}
            />
            {listingErrorText(`castProfiles.${index}.languages`)}
          </FormField>
          <FormField label="Tags / từ khóa">
            <input
              value={cast.tags?.join(', ') ?? ''}
              onChange={(event) => updateCastProfile(index, 'tags', splitInlineList(event.target.value))}
              placeholder="spa, gentle, quiet, 20s"
              style={listingInputStyle(`castProfiles.${index}.tags`)}
            />
            {listingErrorText(`castProfiles.${index}.tags`)}
          </FormField>
          <FormField label="Sở thích">
            <input
              value={cast.hobbies?.join(', ') ?? ''}
              onChange={(event) => updateCastProfile(index, 'hobbies', splitInlineList(event.target.value))}
              placeholder="reading, tea, nature"
              style={listingInputStyle(`castProfiles.${index}.hobbies`)}
            />
            {listingErrorText(`castProfiles.${index}.hobbies`)}
          </FormField>
        </div>
      </section>

      <section className="partner-listing-section">
        <div className="partner-listing-section-title">Hồ sơ cast</div>
        <div className="partner-listing-grid partner-cast-profile-grid">
          <FormField label="Tháng sinh">
            <ThemedListingSelect
              value={cast.birthMonth ? String(cast.birthMonth) : ''}
              onChange={(value) => updateCastProfile(index, 'birthMonth', value ? Number(value) : undefined)}
              placeholder="-- Chọn tháng --"
              options={listingBirthMonthOptions}
              hasError={Boolean(listingErrors[`castProfiles.${index}.birthMonth`])}
            />
            {listingErrorText(`castProfiles.${index}.birthMonth`)}
          </FormField>
          <FormField label="Cung Hoàng Đạo">
            <ThemedListingSelect
              value={cast.zodiacSign ?? ''}
              onChange={(value) => updateCastProfile(index, 'zodiacSign', value)}
              placeholder="-- Chọn cung --"
              options={listingZodiacOptions}
              hasError={Boolean(listingErrors[`castProfiles.${index}.zodiacSign`])}
            />
            {listingErrorText(`castProfiles.${index}.zodiacSign`)}
          </FormField>
          <FormField label="Số đo (V1 - V2 - V3)">
            <input
              value={cast.measurements ?? ''}
              onChange={(event) => updateCastProfile(index, 'measurements', event.target.value)}
              placeholder="VD: 82-58-84"
              style={listingInputStyle(`castProfiles.${index}.measurements`)}
            />
            {listingErrorText(`castProfiles.${index}.measurements`)}
          </FormField>
          <FormField label="Chiều cao">
            <input
              inputMode="numeric"
              value={cast.heightCm ? String(cast.heightCm) : ''}
              onChange={(event) => updateCastProfile(index, 'heightCm', event.target.value ? Number(event.target.value.replace(/\D/g, '')) : undefined)}
              placeholder="VD: 165"
              style={listingInputStyle(`castProfiles.${index}.heightCm`)}
            />
            {listingErrorText(`castProfiles.${index}.heightCm`)}
          </FormField>
          <FormField label="Mô tả cast" className="partner-field-wide">
            <textarea
              value={cast.bio ?? ''}
              onChange={(event) => updateCastProfile(index, 'bio', event.target.value)}
              placeholder="Thông tin nổi bật của cast"
              style={listingInputStyle(`castProfiles.${index}.bio`, { minHeight: '104px', resize: 'vertical', padding: '12px', lineHeight: 1.5 })}
            />
            {listingErrorText(`castProfiles.${index}.bio`)}
          </FormField>
        </div>
      </section>

      <section className="partner-listing-section">
        <div className="partner-listing-section-title">Ảnh đại diện, album và video</div>
        <div className="partner-listing-grid">
          <FormField label="Ảnh đại diện / album ảnh" className="partner-field-wide">
            <input
              value={cast.mediaUrls?.join(', ') ?? ''}
              onChange={(event) => updateCastProfile(index, 'mediaUrls', splitInlineList(event.target.value))}
              placeholder="https://.../cast.jpg, https://.../album.jpg"
              style={listingInputStyle(`castProfiles.${index}.mediaUrls`)}
            />
            {listingErrorText(`castProfiles.${index}.mediaUrls`)}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {renderListingUploadButton({
                key: `cast-media-image-${index}`,
                label: 'Tải ảnh cast từ máy',
                loadingLabel: 'Đang tải ảnh...',
                kind: 'image',
                multiple: true,
                purpose: 'PARTNER_CAST_IMAGE',
                successLabel: 'ảnh cast',
                onUploaded: (urls) => {
                  clearListingErrorsFor(`castProfiles.${index}.mediaUrls`);
                  setListingDraft((current) => ({
                    ...current,
                    castProfiles: current.castProfiles.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, mediaUrls: [...(item.mediaUrls ?? []).filter(Boolean), ...urls] }
                        : item,
                    ),
                  }));
                },
              })}
              {renderListingUploadButton({
                key: `cast-media-video-${index}`,
                label: 'Tải video cast từ máy',
                loadingLabel: 'Đang tải video...',
                kind: 'video',
                multiple: true,
                purpose: 'PARTNER_CAST_VIDEO',
                successLabel: 'video cast',
                onUploaded: (urls) => {
                  clearListingErrorsFor(`castProfiles.${index}.mediaUrls`);
                  setListingDraft((current) => ({
                    ...current,
                    castProfiles: current.castProfiles.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, mediaUrls: [...(item.mediaUrls ?? []).filter(Boolean), ...urls] }
                        : item,
                    ),
                  }));
                },
              })}
            </div>
            <span style={{ color: colors.muted, fontSize: '11px', lineHeight: 1.5 }}>
              Nhập URL bằng dấu phẩy hoặc tải file từ máy. Media đầu tiên sẽ dùng làm ảnh đại diện.
            </span>
          </FormField>
          <FormField label="Video YouTube" className="partner-field-wide">
            <input
              value={cast.youtubeLinks?.join(', ') ?? ''}
              onChange={(event) => updateCastProfile(index, 'youtubeLinks', splitInlineList(event.target.value))}
              placeholder="https://youtube.com/..."
              style={listingInputStyle(`castProfiles.${index}.youtubeLinks`)}
            />
            {listingErrorText(`castProfiles.${index}.youtubeLinks`)}
          </FormField>
        </div>
      </section>
    </div>
  );

  const renderCastTable = () => (
    <div style={{ display: 'grid', gap: '14px' }}>
      <div className="partner-cast-toolbar">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <StatusPill tone="gold">Tất cả {listingDraft.castProfiles.length}</StatusPill>
          <StatusPill tone="success">Đã nhập {listingDraft.castProfiles.filter((cast) => cast.stageName.trim()).length}</StatusPill>
          <StatusPill>Thiếu tên {listingDraft.castProfiles.filter((cast) => !cast.stageName.trim()).length}</StatusPill>
        </div>
        <PrimaryButton onClick={addCastProfile}>
          <Plus size={16} />
          Thêm cast
        </PrimaryButton>
      </div>

      {!listingDraft.castProfiles.length ? (
        <div style={{ ...softCardStyle, padding: '14px', color: colors.text2, fontSize: '12.5px', lineHeight: 1.6 }}>
          Chưa có cast trong bản nháp. Bấm Thêm cast để nhập dữ liệu thật của quán.
        </div>
      ) : (
        <div className="partner-cast-table-wrap">
          <table className="partner-cast-table">
            <thead>
              <tr>
                {['STT', 'Cast', 'Quán trực thuộc', 'Ngôn ngữ', 'Tags', 'Trạng thái', ''].map((heading) => (
                  <th key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {listingDraft.castProfiles.map((cast, index) => {
                const avatarUrl = cast.mediaUrls?.[0];
                const hasRequiredName = cast.stageName.trim();
                return (
                  <tr key={`${cast.stageName || 'draft-cast'}-${index}`}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="partner-cast-cell">
                        <span
                          className="partner-cast-avatar"
                          style={{
                            background: avatarUrl
                              ? `linear-gradient(180deg,rgba(12,12,15,.08),rgba(12,12,15,.58)), url('${avatarUrl}') center/cover`
                              : colors.surface3,
                          }}
                        >
                          {!avatarUrl ? <UsersRound size={18} /> : null}
                        </span>
                        <span style={{ minWidth: 0 }}>
                          <span className="partner-cast-name">{hasRequiredName || 'Draft cast'}</span>
                          <span className="partner-cast-sub">{cast.zodiacSign || cast.publicHeadline || '---'}</span>
                        </span>
                      </div>
                    </td>
                    <td>{listingDraft.storeName || activePartnerStore?.name || 'Quán đang quản lý'}</td>
                    <td>{cast.languages?.length ? cast.languages.join(' · ') : '---'}</td>
                    <td>{cast.tags?.length ? cast.tags.join(', ') : '---'}</td>
                    <td>
                      <StatusPill tone={hasRequiredName ? 'success' : 'gold'}>
                        {hasRequiredName ? 'Đã nhập' : 'Bản nháp'}
                      </StatusPill>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => openCastProfileForm(index)}
                        aria-label={`Sửa cast ${cast.stageName || index + 1}`}
                        className="partner-cast-edit"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderMenuGroupsSection = () => (
    <section className="partner-listing-section">
      <div className="partner-listing-section-title">Nhóm menu</div>
      <div className="partner-menu-editor">
        {!listingDraft.menuGroups.length ? (
          <div style={{ ...softCardStyle, padding: '14px', color: colors.text2, fontSize: '12.5px', lineHeight: 1.6 }}>
            Chưa có nhóm menu. Bấm Thêm nhóm menu để nhập món, mô tả và mức chi phí.
          </div>
        ) : null}
        {listingDraft.menuGroups.map((group, groupIndex) => (
          <div key={`menu-group-${groupIndex}`} className="partner-menu-group-card">
            <div className="partner-menu-group-head">
              <FormField label="Tên nhóm">
                <input
                  value={group.name}
                  onChange={(event) => updateMenuGroupName(groupIndex, event.target.value)}
                  placeholder="VD: VIP packages"
                  style={listingInputStyle(`menuGroups.${groupIndex}.name`)}
                />
                {listingErrorText(`menuGroups.${groupIndex}.name`)}
              </FormField>
              <div className="partner-menu-actions">
                <GhostButton onClick={() => addMenuItem(groupIndex)}>
                  <ReceiptText size={16} />
                  Thêm món
                </GhostButton>
                <GhostButton onClick={() => removeMenuGroup(groupIndex)}>
                  <XCircle size={16} />
                  Xóa nhóm
                </GhostButton>
              </div>
            </div>
            {group.items.map((item, itemIndex) => (
              <div key={`menu-item-${groupIndex}-${itemIndex}`} className="partner-menu-item-card">
                <FormField label="Tên món / dịch vụ">
                  <input
                    value={item.name}
                    onChange={(event) => updateMenuItem(groupIndex, itemIndex, 'name', event.target.value)}
                    placeholder="VD: VIP table"
                    style={listingInputStyle(`menuGroups.${groupIndex}.items.${itemIndex}.name`)}
                  />
                  {listingErrorText(`menuGroups.${groupIndex}.items.${itemIndex}.name`)}
                </FormField>
                <FormField label="Mô tả">
                  <input
                    value={item.description ?? ''}
                    onChange={(event) => updateMenuItem(groupIndex, itemIndex, 'description', event.target.value)}
                    placeholder="Mô tả ngắn"
                    style={listingInputStyle(`menuGroups.${groupIndex}.items.${itemIndex}.description`)}
                  />
                  {listingErrorText(`menuGroups.${groupIndex}.items.${itemIndex}.description`)}
                </FormField>
                <FormField label="Mức chi phí">
                  <ThemedListingSelect
                    value={item.priceTier ?? '$$'}
                    onChange={(value) => updateMenuItem(groupIndex, itemIndex, 'priceTier', value)}
                    placeholder="-- Chọn mức --"
                    hasError={Boolean(listingErrors[`menuGroups.${groupIndex}.items.${itemIndex}.priceTier`])}
                    options={[
                      { value: '$$', label: '$$' },
                      { value: '$$$', label: '$$$' },
                      { value: '$$$$', label: '$$$$' },
                    ]}
                  />
                  {listingErrorText(`menuGroups.${groupIndex}.items.${itemIndex}.priceTier`)}
                </FormField>
                {renderMenuItemImageControl(item, groupIndex, itemIndex)}
                <div className="partner-menu-actions partner-menu-item-actions">
                  <button
                    type="button"
                    onClick={() => updateMenuItem(groupIndex, itemIndex, 'isHot', !item.isHot)}
                    className={item.isHot ? 'partner-menu-hot is-active' : 'partner-menu-hot'}
                    aria-pressed={Boolean(item.isHot)}
                  >
                    {item.isHot ? 'HOT' : 'Không HOT'}
                  </button>
                  <GhostButton onClick={() => removeMenuItem(groupIndex, itemIndex)}>
                    <XCircle size={16} />
                    Xóa món
                  </GhostButton>
                </div>
              </div>
            ))}
          </div>
        ))}
        <GhostButton onClick={addMenuGroup}>
          <ReceiptText size={16} />
          Thêm nhóm menu
        </GhostButton>
      </div>
    </section>
  );

  const renderListingTab = () => {
    if (listingTab === 'cast') {
      const activeCast = activeCastProfileIndex === null
        ? null
        : listingDraft.castProfiles[activeCastProfileIndex];

      return activeCast && activeCastProfileIndex !== null
        ? renderCastProfileForm(activeCast, activeCastProfileIndex)
        : renderCastTable();
    }

    const openingRows = listingDraft.openingHourItems.length
      ? listingDraft.openingHourItems
      : defaultListingOpeningHours();

    return (
      <div className="partner-listing-form">
        <section className="partner-listing-section">
          <div className="partner-listing-section-title">Thông tin cơ bản</div>
          <div className="partner-listing-grid">
            <FormField label="Tên quán">
              <input
                value={listingDraft.storeName}
                onChange={(event) => updateListingField('storeName', event.target.value)}
                placeholder="VD: Vietyoru Lounge"
                style={listingInputStyle('storeName')}
              />
              {listingErrorText('storeName')}
            </FormField>
            <FormField label="Loại hình">
              <ThemedListingSelect
                value={listingDraft.storeCategory || listingDraft.businessType || 'CLUB'}
                onChange={(value) => {
                  clearListingErrorsFor('storeCategory');
                  setListingDraft((current) => ({
                    ...current,
                    storeCategory: value,
                    businessType: value,
                  }));
                }}
                placeholder="-- Chọn loại hình --"
                hasError={Boolean(listingErrors.storeCategory)}
                options={[
                  { value: 'CLUB', label: 'Club' },
                  { value: 'LOUNGE', label: 'Lounge' },
                  { value: 'BAR', label: 'Bar' },
                  { value: 'GIRLS_BAR', label: 'Girls Bar' },
                  { value: 'KARAOKE', label: 'Karaoke' },
                  { value: 'MASSAGE_SPA', label: 'Massage & Spa' },
                  { value: 'RESTAURANT', label: 'Nhà hàng' },
                ]}
              />
              {listingErrorText('storeCategory')}
            </FormField>
            <FormField label="Khu vực hiển thị">
              <input
                value={listingDraft.area}
                onChange={(event) => updateListingField('area', event.target.value)}
                placeholder="VD: Quận 1, TP.HCM"
                style={listingInputStyle('area')}
              />
              {listingErrorText('area')}
            </FormField>
          </div>
        </section>

        <section className="partner-listing-section">
          <div className="partner-listing-section-title">Vị trí & liên hệ</div>
          <div className="partner-listing-grid">
            <FormField label="Tỉnh/Thành phố">
              <ThemedListingSelect
                value={selectedProvinceCode || (listingDraft.storeCity ? '__current' : '')}
                onChange={(code) => {
                  if (code === '__current') return;
                  const province = provinces.find((item) => String(item.code) === code);
                  const city =
                    code === '79'
                      ? 'Ho Chi Minh City'
                      : code === '1'
                        ? 'Hanoi'
                        : province?.name ?? '';
                  setSelectedProvinceCode(code);
                  setSelectedWardCode('');
                  setWards([]);
                  setListingDraft((current) => ({
                    ...current,
                    storeCity: city,
                    ward: '',
                  }));
                  clearListingErrorsFor('storeCity');
                  clearListingErrorsFor('ward');
                }}
                placeholder="-- Chọn Tỉnh/Thành --"
                hasError={Boolean(listingErrors.storeCity)}
                options={[
                  ...(!selectedProvinceCode && listingDraft.storeCity
                    ? [{ value: '__current', label: listingDraft.storeCity }]
                    : []),
                  ...provinces.map((province) => ({
                    value: String(province.code),
                    label: province.name,
                  })),
                ]}
              />
              {listingErrorText('storeCity')}
            </FormField>
            <FormField label="Phường/Xã">
              <ThemedListingSelect
                value={selectedWardCode || (listingDraft.ward ? '__current' : '')}
                onChange={(code) => {
                  if (code === '__current') return;
                  const ward = wards.find((item) => String(item.code) === code);
                  setSelectedWardCode(code);
                  updateListingField('ward', ward?.name ?? '');
                }}
                disabled={!selectedProvinceCode && !listingDraft.ward}
                placeholder="-- Chọn Phường/Xã --"
                hasError={Boolean(listingErrors.ward)}
                options={[
                  ...(!selectedWardCode && listingDraft.ward
                    ? [{ value: '__current', label: listingDraft.ward }]
                    : []),
                  ...wards.map((ward) => ({
                    value: String(ward.code),
                    label: ward.name,
                  })),
                ]}
              />
              {listingErrorText('ward')}
            </FormField>
            <FormField label="Số điện thoại">
              <input
                value={listingDraft.phone}
                onChange={(event) => updateListingField('phone', event.target.value)}
                placeholder="VD: 0901234567"
                style={listingInputStyle('phone')}
              />
              {listingErrorText('phone')}
            </FormField>
            <FormField label="Số nhà, tên đường" className="partner-field-span-2">
              <input
                value={listingDraft.streetAddress}
                onChange={(event) => updateListingField('streetAddress', event.target.value)}
                placeholder="VD: 12 Nguyễn Huệ"
                style={listingInputStyle('streetAddress')}
              />
              {listingErrorText('streetAddress')}
            </FormField>
            <FormField label="Link Google Maps">
              <input
                value={listingDraft.mapUrl}
                onChange={(event) => updateListingField('mapUrl', event.target.value)}
                placeholder="Dán link Google Maps"
                style={listingInputStyle('mapUrl')}
              />
              {listingErrorText('mapUrl')}
            </FormField>
          </div>
        </section>

        <section className="partner-listing-section">
          <div className="partner-listing-section-title">Giờ mở cửa theo ngày</div>
          <div className="partner-hour-list">
            {openingRows.map((item, index) => {
              const slots = splitOpeningHourSlots(item.hours);
              const visibleSlots = slots.length ? slots : [defaultListingOpeningSlot];
              const hasHourError = Boolean(listingErrors[`openingHourItems.${index}.hours`]);

              return (
                <div key={`${item.day}-${index}`} className="partner-hour-row">
                  <strong>{item.day}</strong>
                  <div className="partner-hour-slots">
                    {!item.isOff ? (
                      visibleSlots.map((slot, slotIndex) => {
                        const slotParts = splitOpeningHourSlot(slot);

                        return (
                          <div key={`${slot}-${slotIndex}`} className="partner-hour-slot">
                            <ListingTimeSelect
                              value={slotParts.open}
                              onChange={(value) => updateOpeningHourSlot(index, slotIndex, 'open', value)}
                              placeholder="Mở lúc"
                              hasError={hasHourError}
                            />
                            <span>–</span>
                            <ListingTimeSelect
                              value={slotParts.close}
                              onChange={(value) => updateOpeningHourSlot(index, slotIndex, 'close', value)}
                              placeholder="Đóng lúc"
                              hasError={hasHourError}
                            />
                            <button
                              type="button"
                              onClick={() => removeOpeningHourSlot(index, slotIndex)}
                              className="partner-hour-remove"
                              aria-label={`Xóa khung giờ ${item.day}`}
                            >
                              <XCircle size={13} />
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <span className="partner-hour-off">Nghỉ cả ngày</span>
                    )}
                    {!item.isOff ? (
                      <button
                        type="button"
                        onClick={() => addOpeningHourSlot(index)}
                        className="partner-hour-add"
                      >
                        + Khung giờ
                      </button>
                    ) : null}
                    {listingErrorText(`openingHourItems.${index}.hours`)}
                  </div>
                  <button
                    type="button"
                    onClick={() => updateOpeningHourItem(index, 'isOff', !item.isOff)}
                    aria-pressed={!item.isOff}
                    className="partner-toggle-button"
                  >
                    {item.isOff ? 'Nghỉ' : 'Mở'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="partner-listing-section">
          <div className="partner-listing-section-title">Nội dung hiển thị</div>
          <div className="partner-listing-grid">
            <FormField label="Tags / thẻ nổi bật" className="partner-field-wide">
              <div className="partner-admin-tag-suggestions">
                {suggestedListingTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addListingTag(tag)}
                    className="partner-admin-tag-suggestion"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
              <div className="partner-admin-tag-box">
                {listingDraft.tags.map((tag) => (
                  <span key={tag} className="partner-admin-tag-chip">
                    {tag}
                    <button type="button" onClick={() => removeListingTag(tag)} aria-label={`Xóa ${tag}`}>
                      <XCircle size={12} />
                    </button>
                  </span>
                ))}
                <input
                  value={listingTagInput}
                  onChange={(event) => setListingTagInput(event.target.value)}
                  onBlur={submitListingTagInput}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      submitListingTagInput();
                    }
                  }}
                  placeholder="Gõ tag và nhấn Enter..."
                />
              </div>
              <input
                value={listingDraft.tags.join(', ')}
                onChange={(event) => updateListingTags(event.target.value)}
                aria-label="Tags dạng text"
                className="partner-admin-tag-fallback"
              />
              {listingErrorText('tags')}
            </FormField>
            <FormField label="Mô tả quán" className="partner-field-wide">
              <div className="partner-quill-shell">
                <ReactQuill
                  theme="snow"
                  value={listingDraft.description}
                  onChange={(value) => updateListingField('description', value)}
                />
              </div>
              <textarea
                value={listingDraft.description}
                onChange={(event) => updateListingField('description', event.target.value)}
                placeholder="Không gian, dịch vụ nổi bật, lưu ý khi đặt bàn..."
                aria-label="Mô tả quán dạng text"
                className="partner-quill-fallback"
                style={listingInputStyle('description', { minHeight: '132px', resize: 'vertical', padding: '12px', lineHeight: 1.5 })}
              />
              {listingErrorText('description')}
            </FormField>
            <FormField label="Ghi chú gửi Admin" className="partner-field-wide">
              <textarea
                value={listingDraft.note}
                onChange={(event) => updateListingField('note', event.target.value)}
                placeholder="Ghi chú nội bộ cho Admin khi duyệt nội dung"
                style={listingInputStyle('note', { minHeight: '86px', resize: 'vertical', padding: '12px', lineHeight: 1.5 })}
              />
              {listingErrorText('note')}
            </FormField>
          </div>
        </section>

        {renderStoreMediaSections()}
        {renderMenuGroupsSection()}
      </div>
    );
  };

  const listingReviewTone =
    listingReview?.status === 'APPROVED'
      ? 'success'
      : listingReview?.status === 'REJECTED'
        ? 'danger'
        : listingReview?.status === 'PENDING_REVIEW'
          ? 'gold'
          : 'neutral';
  const listingReviewLabel =
    listingReview?.status === 'APPROVED'
      ? 'Đã duyệt'
      : listingReview?.status === 'REJECTED'
        ? 'Bị từ chối'
        : listingReview?.status === 'PENDING_REVIEW'
          ? 'Đang chờ duyệt'
          : listingContentId
            ? 'Bản nháp đã lưu'
            : 'Chưa có bản nháp';
  const isListingBusy = isListingLoading || isSavingListing || isSubmittingListing;
  const canWriteListing = Boolean(listingStoreId) && !isListingBusy;

  const renderListingPanel = () => (
    <PanelCard>
      <SectionHeading
        eyebrow="DRAFT & APPROVAL"
        title="Thông tin hiển thị trên trang quán"
        action={<StatusPill tone={listingReviewTone}>{listingReviewLabel}</StatusPill>}
      />

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {contentTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setListingTab(tab.key)}
            aria-pressed={listingTab === tab.key}
            style={{
              minHeight: '38px',
              borderRadius: '18px',
              border: `1px solid ${listingTab === tab.key ? colors.borderGold40 : colors.borderSoft}`,
              background: listingTab === tab.key ? colors.goldGrad : colors.surface3,
              color: listingTab === tab.key ? colors.onGold : colors.text2,
              padding: '0 13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {tab.label}
            {listingErrorCounts[tab.key] ? (
              <span
                style={{
                  minWidth: '20px',
                  height: '20px',
                  borderRadius: '999px',
                  background: listingTab === tab.key ? 'rgba(36,26,10,.18)' : 'rgba(255,180,168,.14)',
                  color: listingTab === tab.key ? colors.onGold : colors.danger,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 950,
                }}
              >
                {listingErrorCounts[tab.key]}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {renderListingTab()}

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          flexWrap: 'wrap',
          marginTop: '18px',
        }}
      >
        <GhostButton disabled={!canWriteListing} onClick={saveListingDraft}>
          <Save size={16} />
          {isSavingListing ? 'Đang lưu...' : 'Lưu nháp'}
        </GhostButton>
        <PrimaryButton disabled={!canWriteListing} onClick={submitListingDraft}>
          <Send size={16} />
          {isSubmittingListing ? 'Đang gửi...' : 'Gửi duyệt'}
        </PrimaryButton>
      </div>
    </PanelCard>
  );

  const renderBillPanel = () => {
    const selectedBill = bills.find((b) => b.id === selectedBillId);
    if (billSubView === 'list') {
      return (
        <div style={{ marginTop: '14px' }}>
          <PanelCard>
            <SectionHeading
              eyebrow="STORE BILLS"
              title="Hóa đơn của quán"
              action={
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <StatusPill tone="gold">{scopedBillRows.length} hóa đơn</StatusPill>
                  <PrimaryButton
                    onClick={() => {
                      setBillAmountInput('');
                      setBillUsedAt(toDateTimeLocalValue(new Date()));
                      setBillBookingId('');
                      setBillEvidenceFile(null);
                      setBillNotice(null);
                      setSelectedBillId(null);
                      setBillSubView('form');
                    }}
                    style={{ minHeight: '32px', height: '32px', padding: '0 12px', fontSize: '12px' }}
                  >
                    <Plus size={14} /> Gửi hóa đơn mới
                  </PrimaryButton>
                </div>
              }
            />
            <p style={{ margin: '10px 0 14px', color: colors.text2, fontSize: '12.5px', lineHeight: 1.6 }}>
              Bấm vào một dòng hóa đơn để tự điền tổng tiền, thời gian sử dụng, booking và quán lên form gửi hóa đơn.
            </p>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {[
                { key: 'ALL', label: 'Tất cả' },
                { key: 'SUBMITTED', label: 'Chờ duyệt' },
                { key: 'VERIFIED', label: 'Đã duyệt' },
                { key: 'REJECTED', label: 'Từ chối' },
                { key: 'PAID', label: 'Đã thanh toán' },
                { key: 'VOIDED', label: 'Đã hủy' },
              ].map((filter) => {
                const active = billStatusFilter === filter.key;
                return (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setBillStatusFilter(filter.key)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      border: `1px solid ${active ? colors.borderGold22 : colors.borderSoft}`,
                      background: active ? 'rgba(212,178,106,.15)' : colors.surface2,
                      color: active ? colors.goldBright : colors.text2,
                      transition: 'all 0.15s ease-in-out',
                    }}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            <div
              className="partner-bill-table-scroll"
              style={{ overflowX: 'auto', borderRadius: '14px', border: `1px solid ${colors.borderHair}` }}
            >
              <table style={{ width: '100%', minWidth: '760px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ color: colors.muted, fontSize: '11px', textAlign: 'left' }}>
                    {['STT', 'Mã hóa đơn', 'Quán', 'Tổng tiền', 'Thời gian', 'Booking', 'Trạng thái'].map((header) => (
                      <th
                        key={header}
                        style={{
                          padding: '12px',
                          borderBottom: `1px solid ${colors.borderHair}`,
                          fontWeight: 900,
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scopedBillRows.length ? (
                    scopedBillRows.map((bill, index) => {
                      const active = selectedBillId === bill.id;
                      const billCode = bill.billNumber ?? bill.id.slice(0, 8);

                      return (
                        <tr
                          key={bill.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => fillBillFormFromRow(bill)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              fillBillFormFromRow(bill);
                            }
                          }}
                          style={{
                            cursor: 'pointer',
                            background: active ? 'rgba(212,178,106,.12)' : 'transparent',
                          }}
                        >
                          <td style={{ padding: '13px 12px', borderBottom: `1px solid ${colors.borderHair}`, color: colors.text2, fontWeight: 800 }}>
                            {index + 1}
                          </td>
                          <td style={{ padding: '13px 12px', borderBottom: `1px solid ${colors.borderHair}`, color: colors.goldBright, fontSize: '12px', fontWeight: 900 }}>
                            {billCode}
                          </td>
                          <td style={{ padding: '13px 12px', borderBottom: `1px solid ${colors.borderHair}`, color: colors.text, fontSize: '12.5px', fontWeight: 800 }}>
                            {bill.store?.name ?? selectedBillStore?.name ?? 'Quán'}
                          </td>
                          <td style={{ padding: '13px 12px', borderBottom: `1px solid ${colors.borderHair}`, color: colors.goldPale, fontSize: '12.5px', fontWeight: 900 }}>
                            {moneyVnd(bill.totalVnd ?? 0)}
                          </td>
                          <td style={{ padding: '13px 12px', borderBottom: `1px solid ${colors.borderHair}`, color: colors.text2, fontSize: '12px' }}>
                            {formatDateTime(bill.usedAt ?? bill.submittedAt)}
                          </td>
                          <td style={{ padding: '13px 12px', borderBottom: `1px solid ${colors.borderHair}`, color: colors.text2, fontSize: '12px' }}>
                            {bill.booking ? `${translateBookingStatus(bill.booking.status)} · ${formatDateTime(bill.booking.scheduledAt)}` : 'Không liên kết'}
                          </td>
                          <td style={{ padding: '13px 12px', borderBottom: `1px solid ${colors.borderHair}` }}>
                            <StatusPill tone={bill.status === 'VERIFIED' || bill.status === 'PAID' ? 'success' : bill.status === 'REJECTED' ? 'danger' : 'gold'}>
                              {translateBillStatus(bill.status)}
                            </StatusPill>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          padding: '18px 12px',
                          color: colors.text2,
                          fontSize: '13px',
                          textAlign: 'center',
                        }}
                      >
                        Chưa có hóa đơn trong quán đang chọn.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </PanelCard>
        </div>
      );
    }

    return (
      <div style={{ marginTop: '14px', maxWidth: '800px', marginInline: 'auto' }}>
        <PanelCard>
          <SectionHeading
            title="Form gửi hóa đơn"
            action={
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {selectedBill && (
                  <StatusPill tone={selectedBill.status === 'VERIFIED' || selectedBill.status === 'PAID' ? 'success' : selectedBill.status === 'REJECTED' ? 'danger' : 'gold'}>
                    {translateBillStatus(selectedBill.status)}
                  </StatusPill>
                )}
                <GhostButton
                  onClick={() => setBillSubView('list')}
                  style={{ minHeight: '32px', height: '32px', padding: '0 12px', fontSize: '12px' }}
                >
                  <ArrowLeft size={14} /> Quay lại
                </GhostButton>
              </div>
            }
          />
          <form
            onSubmit={submitPartnerBill}
            style={{ display: 'grid', gap: '14px', marginTop: '16px' }}
          >
            {selectedBill && (
              <FormField label="Trạng thái hóa đơn">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <StatusPill tone={selectedBill.status === 'VERIFIED' || selectedBill.status === 'PAID' ? 'success' : selectedBill.status === 'REJECTED' ? 'danger' : 'gold'}>
                    {translateBillStatus(selectedBill.status)}
                  </StatusPill>
                  {selectedBill.rejectReason && (
                    <span style={{ color: colors.danger, fontSize: '12.5px', fontWeight: 800 }}>
                      Lý do từ chối: {selectedBill.rejectReason}
                    </span>
                  )}
                </div>
              </FormField>
            )}

            <FormField label="Quán thuộc partner *">
              <ThemedListingSelect
                value={billStoreId}
                disabled={!stores.length}
                onChange={(value) => {
                  setBillStoreId(value);
                  setSelectedBillId(null);
                  setBillNotice(null);
                }}
                placeholder={stores.length ? '-- Chọn quán --' : 'Đang tải quán được cấp quyền...'}
                options={stores.map((store) => ({
                  value: store.id,
                  label: `${store.name}${store.district ? ` - ${store.district}` : ''}`,
                }))}
              />
            </FormField>

            <div className="partner-bill-form-grid">
              <FormField label="Tổng tiền bill gốc *">
                <input
                  inputMode="numeric"
                  placeholder="VD: 1.800.000"
                  value={billAmountInput}
                  onChange={(event) => handleBillAmountChange(event.target.value)}
                  style={inputStyle}
                />
              </FormField>
              <FormField label="Thời gian sử dụng *">
                <input
                  type="datetime-local"
                  value={billUsedAt}
                  onInput={(event) => setBillUsedAt(event.currentTarget.value)}
                  onChange={(event) => setBillUsedAt(event.target.value)}
                  style={inputStyle}
                />
              </FormField>
            </div>

            <FormField label="Liên kết booking">
              <ThemedListingSelect
                value={billBookingId}
                onChange={setBillBookingId}
                placeholder="Không liên kết booking"
                options={[
                  { value: '', label: 'Không liên kết booking' },
                  ...billBookingOptions.map((booking) => ({
                    value: booking.id,
                    label: `${formatDateTime(booking.scheduledAt)} - ${booking.partySize} khách - ${booking.store.name}`,
                  })),
                ]}
              />
            </FormField>

            <FormField label="Ảnh / chứng từ">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <label
                    style={{
                      minHeight: '42px',
                      borderRadius: '11px',
                      border: `1px solid ${colors.borderGold22}`,
                      background: colors.surface2,
                      color: colors.gold,
                      padding: '0 14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <ImagePlus size={16} />
                    {billEvidenceFile || selectedBill?.media?.length ? 'Đổi file' : 'Chọn file'}
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onInput={(event) => handleBillFileChange(event.currentTarget)}
                      onChange={(event) => handleBillFileChange(event.currentTarget)}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {billEvidenceFile && (
                    <GhostButton
                      onClick={() => setBillEvidenceFile(null)}
                      style={{ minHeight: '42px', height: '42px', padding: '0 14px', color: colors.danger }}
                    >
                      Xóa file chọn
                    </GhostButton>
                  )}
                </div>

                {billEvidenceFile ? (
                  <div style={{ marginTop: '4px' }}>
                    {billEvidenceFile.type.startsWith('image/') ? (
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img
                          src={URL.createObjectURL(billEvidenceFile)}
                          alt="Local Preview"
                          style={{
                            maxHeight: '240px',
                            maxWidth: '100%',
                            borderRadius: '8px',
                            border: `1px solid ${colors.borderGold22}`,
                            objectFit: 'contain',
                            display: 'block',
                          }}
                        />
                      </div>
                    ) : (
                      <span
                        style={{
                          ...softCardStyle,
                          minHeight: '38px',
                          padding: '0 11px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: colors.text2,
                          fontSize: '12px',
                          minWidth: 0,
                          maxWidth: '100%',
                        }}
                      >
                        <FileText size={14} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {billEvidenceFile.name} (Chưa hỗ trợ preview định dạng này)
                        </span>
                      </span>
                    )}
                  </div>
                ) : selectedBill?.media?.length ? (
                  <div style={{ marginTop: '4px' }}>
                    {selectedBill.media.map((med) => {
                      const isImg =
                        med.mimeType?.startsWith('image/') ||
                        med.url?.split('?')[0].match(/\.(jpeg|jpg|gif|png|webp)$/i);
                      return (
                        <div key={med.id} style={{ display: 'inline-block' }}>
                          {isImg ? (
                            <img
                              src={med.url || ''}
                              alt={med.originalName || 'Evidence'}
                              style={{
                                maxHeight: '240px',
                                maxWidth: '100%',
                                borderRadius: '8px',
                                border: `1px solid ${colors.borderGold22}`,
                                objectFit: 'contain',
                                display: 'block',
                              }}
                            />
                          ) : (
                            <a
                              href={med.url || ''}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                ...softCardStyle,
                                minHeight: '38px',
                                padding: '0 11px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: colors.goldBright,
                                fontSize: '12px',
                                textDecoration: 'none',
                              }}
                            >
                              <FileText size={14} />
                              <span>{med.originalName || 'Tải file chứng từ'}</span>
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span style={{ color: colors.muted, fontSize: '12px', lineHeight: 1.5 }}>
                    Upload chứng từ sau khi bill tạo sẽ gắn media PROTECTED.
                  </span>
                )}
              </div>
            </FormField>

            <div
              style={{
                ...softCardStyle,
                padding: '12px',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                color: isBillFutureUsage || isBillPastDeadline ? colors.danger : colors.goldPale,
                fontSize: '12px',
                fontWeight: 800,
                lineHeight: 1.55,
              }}
            >
              <AlertTriangle size={16} style={{ marginTop: '2px', flex: '0 0 auto' }} />
              <span>
                Chỉ nhập tổng tiền bill gốc. Bill quá 10 ngày hoặc thời gian tương lai sẽ không được nhận.
              </span>
            </div>

            {billNotice ? (
              <div
                style={{
                  ...softCardStyle,
                  padding: '12px',
                  color:
                    billNotice.tone === 'success'
                      ? colors.success
                      : billNotice.tone === 'danger'
                        ? colors.danger
                        : colors.goldPale,
                  fontSize: '12.5px',
                  fontWeight: 800,
                  lineHeight: 1.55,
                }}
              >
                {billNotice.message}
              </div>
            ) : null}

            <PrimaryButton disabled={!canSubmitPartnerBill} type="submit">
              {isSubmittingBill ? <RefreshCcw size={16} /> : <Send size={16} />}
              {isSubmittingBill ? 'Đang gửi bill' : 'Gửi bill Partner'}
            </PrimaryButton>
          </form>
        </PanelCard>
      </div>
    );
  };

  const renderActivePanel = () => {
    if (activePanel === 'scan') {
      return renderScanPanel();
    }
    if (activePanel === 'settlement') {
      return renderSettlementPanel();
    }
    if (activePanel === 'listing') {
      return renderListingPanel();
    }
    if (activePanel === 'bill') {
      return renderBillPanel();
    }
    return renderOverviewPanel();
  };

  return (
    <main
      style={{
        ...partnerThemeVariables,
        minHeight: '100vh',
        background: colors.bg,
        color: colors.text,
        fontFamily: 'var(--nl-font-sans)',
      } as React.CSSProperties}
    >
      <style>{`
        .partner-shell {
          display: block;
          padding-left: 252px;
          min-height: 100vh;
        }
        .partner-content {
          padding: 26px 30px 34px;
        }
        .partner-metric-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }
        .partner-overview-grid,
        .partner-scan-grid,
        .partner-bill-panel-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.28fr) minmax(340px, .72fr);
          gap: 14px;
          margin-top: 14px;
        }
        .partner-bill-panel-grid {
          grid-template-columns: minmax(340px, .85fr) minmax(0, 1.15fr);
        }
        .partner-bill-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .partner-settlement-summary,
        .partner-listing-grid,
        .partner-media-grid,
        .partner-store-scope-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        .partner-listing-grid {
          gap: 16px 14px;
          align-items: start;
        }
        .partner-cast-profile-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        .partner-listing-form {
          display: grid;
          gap: 16px;
        }
        .partner-listing-section {
          border: 1px solid ${colors.borderSoft};
          border-radius: 14px;
          background: ${colors.surface1};
          padding: 14px;
          display: grid;
          gap: 12px;
        }
        .partner-listing-section-title {
          color: ${colors.goldBright};
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.2px;
          text-transform: uppercase;
        }
        .partner-menu-editor,
        .partner-menu-group-card {
          display: grid;
          gap: 12px;
        }
        .partner-menu-group-card {
          border: 1px solid ${colors.borderSoft};
          border-radius: 14px;
          background: ${colors.surface2};
          padding: 14px;
        }
        .partner-menu-group-head,
        .partner-menu-actions {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          flex-wrap: wrap;
          min-width: 0;
        }
        .partner-menu-group-head {
          justify-content: space-between;
        }
        .partner-menu-group-head > label {
          flex: 1 1 260px;
        }
        .partner-menu-actions {
          justify-content: flex-end;
        }
        .partner-menu-item-card {
          border-top: 1px solid ${colors.borderHair};
          padding-top: 12px;
          display: grid;
          grid-template-columns:
            minmax(154px, .9fr)
            minmax(184px, 1fr)
            minmax(122px, .45fr)
            minmax(188px, .76fr)
            minmax(204px, .7fr);
          gap: 12px;
          align-items: start;
        }
        .partner-menu-item-card > * {
          min-width: 0;
        }
        .partner-menu-item-card > .partner-menu-actions {
          align-self: end;
        }
        .partner-menu-image-field {
          display: grid;
          gap: 7px;
          color: ${colors.text2};
          font-size: 12px;
          font-weight: 700;
          min-width: 0;
          align-content: start;
        }
        .partner-menu-image-control {
          min-height: 42px;
          border-radius: 11px;
          border: 1px dashed ${colors.borderGold32};
          background: ${colors.surface2};
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 10px;
          min-width: 0;
        }
        .partner-menu-image-control.has-image {
          border-style: solid;
          padding: 5px 6px;
        }
        .partner-menu-image-thumb {
          width: 46px;
          height: 34px;
          border-radius: 8px;
          border: 1px solid ${colors.borderGold22};
          background-color: ${colors.surface3};
          flex: 0 0 auto;
        }
        .partner-menu-image-upload {
          min-height: 40px;
          border-radius: 9px;
          color: ${colors.gold};
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          flex: 1 1 auto;
          min-width: 0;
          cursor: pointer;
          font-weight: 900;
          text-align: center;
        }
        .partner-menu-image-upload.is-replace {
          min-height: 34px;
          justify-content: flex-start;
          padding: 0 8px;
          background: ${colors.surface3};
        }
        .partner-menu-image-upload.is-disabled {
          cursor: wait;
          opacity: .56;
        }
        .partner-menu-image-upload span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .partner-menu-image-upload input {
          display: none;
        }
        .partner-menu-image-remove {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          border: 1px solid ${colors.borderGold22};
          background: ${colors.surface3};
          color: ${colors.gold};
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex: 0 0 auto;
        }
        .partner-menu-item-actions {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          align-items: stretch;
        }
        .partner-menu-item-actions > * {
          width: 100%;
        }
        .partner-menu-hot {
          min-height: 42px;
          border-radius: 11px;
          border: 1px solid ${colors.borderGold22};
          background: ${colors.surface2};
          color: ${colors.gold};
          padding: 0 14px;
          font: inherit;
          font-weight: 900;
          cursor: pointer;
          white-space: nowrap;
        }
        .partner-menu-hot.is-active {
          border-color: ${colors.borderGold40};
          background: ${colors.goldGrad};
          color: ${colors.onGold};
        }
        .partner-hour-list {
          display: grid;
          gap: 8px;
        }
        .partner-hour-row {
          display: grid;
          grid-template-columns: 72px minmax(0, 1fr) 64px;
          gap: 10px;
          align-items: start;
          border: 1px solid ${colors.borderHair};
          border-radius: 12px;
          background: ${colors.surface2};
          padding: 9px 10px;
        }
        .partner-hour-row strong {
          color: ${colors.text};
          font-size: 12px;
          line-height: 34px;
        }
        .partner-hour-slots {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 7px;
          min-width: 0;
        }
        .partner-hour-slot {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          min-height: 38px;
          border: 1px solid ${colors.borderGold22};
          border-radius: 10px;
          background: ${colors.surface1};
          padding: 3px 5px 3px 8px;
        }
        .partner-hour-slot > span {
          color: ${colors.muted};
          font-weight: 900;
        }
        .partner-hour-remove {
          width: 24px;
          height: 24px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: ${colors.muted};
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .partner-hour-remove:hover {
          background: rgba(255,180,168,.14);
          color: ${colors.danger};
        }
        .partner-hour-add {
          min-height: 38px;
          border-radius: 10px;
          border: 1.5px dashed ${colors.borderGold32};
          background: transparent;
          color: ${colors.muted};
          font: inherit;
          font-size: 11px;
          font-weight: 900;
          cursor: pointer;
          padding: 0 11px;
          white-space: nowrap;
        }
        .partner-hour-add:hover {
          color: ${colors.goldBright};
          border-color: ${colors.borderGold40};
        }
        .partner-hour-off {
          color: ${colors.muted};
          font-size: 12px;
          font-style: italic;
          line-height: 34px;
        }
        .partner-toggle-button {
          min-height: 38px;
          border-radius: 10px;
          border: 1px solid ${colors.borderGold22};
          background: ${colors.surface3};
          color: ${colors.goldBright};
          font: inherit;
          font-weight: 900;
          cursor: pointer;
          padding: 0 10px;
          white-space: nowrap;
        }
        .partner-listing-grid > * {
          min-width: 0;
        }
        .partner-field-wide {
          grid-column: 1 / -1;
        }
        .partner-field-span-2 {
          grid-column: span 2;
        }
        .partner-admin-tag-suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-bottom: 10px;
        }
        .partner-admin-tag-suggestion {
          border: 1px solid ${colors.borderHair};
          border-radius: 999px;
          background: ${colors.surface3};
          color: ${colors.text2};
          font: inherit;
          font-size: 11px;
          font-weight: 800;
          padding: 6px 10px;
          cursor: pointer;
        }
        .partner-admin-tag-suggestion:hover {
          border-color: ${colors.borderGold32};
          color: ${colors.goldBright};
        }
        .partner-admin-tag-box {
          min-height: 46px;
          border: 1px solid ${colors.borderHair};
          border-radius: 12px;
          background: ${colors.surface2};
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          padding: 8px;
        }
        .partner-admin-tag-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border-radius: 8px;
          border: 1px solid ${colors.borderGold32};
          background: ${colors.activeControlBg};
          color: ${colors.goldPale};
          padding: 5px 8px;
          font-size: 11px;
          font-weight: 900;
        }
        .partner-admin-tag-chip button {
          border: 0;
          background: transparent;
          color: inherit;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
        }
        .partner-admin-tag-box input {
          flex: 1 1 160px;
          min-width: 120px;
          border: 0;
          outline: 0;
          background: transparent;
          color: ${colors.text};
          font: inherit;
          font-size: 12px;
          font-weight: 700;
          padding: 6px 4px;
        }
        .partner-admin-tag-fallback,
        .partner-quill-fallback {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
          white-space: nowrap;
        }
        .partner-quill-shell {
          overflow: hidden;
          border-radius: 12px;
          border: 1px solid ${colors.borderHair};
          background: ${colors.surface2};
        }
        .partner-quill-shell .ql-toolbar {
          border: 0 !important;
          border-bottom: 1px solid ${colors.borderHair} !important;
          background: ${colors.surface3};
        }
        .partner-quill-shell .ql-container {
          border: 0 !important;
          color: ${colors.text};
          font-family: inherit;
          font-size: 13px;
        }
        .partner-quill-shell .ql-editor {
          min-height: 136px;
          color: ${colors.text};
          line-height: 1.55;
        }
        .partner-quill-shell .ql-editor.ql-blank::before {
          color: ${colors.muted};
          font-style: normal;
        }
        .partner-quill-shell .ql-stroke {
          stroke: ${colors.text2} !important;
        }
        .partner-quill-shell .ql-fill {
          fill: ${colors.text2} !important;
        }
        .partner-listing-toolbar {
          display: grid;
          grid-template-columns: minmax(280px, 380px) minmax(320px, 1fr);
          gap: 12px;
          align-items: stretch;
          margin-bottom: 16px;
          max-width: 780px;
        }
        .partner-cast-toolbar,
        .partner-cast-form-header {
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: space-between;
        }
        .partner-cast-table-wrap {
          overflow-x: auto;
          border: 1px solid ${colors.borderSoft};
          border-radius: 16px;
          background: ${colors.surface1};
        }
        .partner-cast-table {
          width: 100%;
          min-width: 920px;
          border-collapse: collapse;
        }
        .partner-cast-table th,
        .partner-cast-table td {
          padding: 14px;
          text-align: left;
          border-bottom: 1px solid ${colors.borderHair};
          color: ${colors.text2};
          font-size: 12px;
          vertical-align: middle;
        }
        .partner-cast-table th {
          color: ${colors.muted};
          font-size: 10.5px;
          font-weight: 900;
          letter-spacing: .9px;
          text-transform: uppercase;
        }
        .partner-cast-table tbody tr:last-child td {
          border-bottom: 0;
        }
        .partner-cast-cell {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
        }
        .partner-cast-avatar {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          border: 1px solid ${colors.borderGold22};
          color: ${colors.gold};
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
        }
        .partner-cast-name,
        .partner-cast-sub {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .partner-cast-name {
          color: ${colors.text};
          font-size: 13.5px;
          font-weight: 900;
        }
        .partner-cast-sub {
          margin-top: 3px;
          color: ${colors.muted};
          font-size: 11px;
        }
        .partner-cast-edit {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid ${colors.borderSoft};
          background: ${colors.surface2};
          color: ${colors.gold};
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .partner-media-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        .partner-settlement-filter-grid > * {
          min-width: 0;
        }
        .partner-notification-popover button {
          font-family: inherit;
        }
        @media (max-width: 1180px) {
          .partner-metric-grid,
          .partner-settlement-summary,
          .partner-listing-grid,
          .partner-cast-profile-grid,
          .partner-store-scope-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .partner-menu-item-card {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .partner-menu-item-card > .partner-menu-actions {
            grid-column: 1 / -1;
          }
          .partner-listing-toolbar {
            grid-template-columns: 1fr;
            max-width: none;
          }
          .partner-overview-grid,
          .partner-scan-grid,
          .partner-bill-panel-grid {
            grid-template-columns: 1fr;
          }
          .partner-settlement-filter-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 860px) {
          .partner-shell {
            padding-left: 0;
            padding-bottom: 80px !important;
          }
          .partner-sidebar {
            display: none !important;
          }
          .partner-content {
            padding: 20px 18px 28px;
          }
          .partner-mobile-page-title {
            display: block !important;
          }
          .partner-header {
            padding: 0 16px !important;
            height: 60px !important;
            min-height: 60px !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
          }
          .partner-header-status-pill {
            display: none !important;
          }
          .partner-logout-btn {
            width: 38px !important;
            padding: 0 !important;
            justify-content: center !important;
            border-radius: 50% !important;
          }
          .partner-logout-btn .logout-text {
            display: none !important;
          }
          .partner-desktop-header-title {
            display: none !important;
          }
          .partner-mobile-header-store {
            display: flex !important;
          }
          .partner-notification-popover {
            top: 70px !important;
            left: 18px !important;
            right: 18px !important;
            width: auto !important;
            max-height: calc(100vh - 116px) !important;
          }
          .partner-mobile-bottom-nav {
            display: flex !important;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 64px;
            background: ${colors.navBg};
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-top: 1px solid ${colors.borderGold12};
            z-index: 100;
            justify-content: space-around;
            align-items: center;
            padding: 0 8px;
            box-shadow: 0 -8px 24px rgba(0,0,0,0.3);
          }
          .partner-mobile-nav-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
            height: 100%;
            background: transparent;
            border: 0;
            color: ${colors.text2};
            cursor: pointer;
            gap: 4px;
            transition: all 0.2s ease;
            position: relative;
          }
          .partner-mobile-nav-btn.active {
            color: ${colors.goldBright};
          }
          .partner-mobile-nav-label {
            font-size: 10px;
            font-weight: 700;
            white-space: nowrap;
          }
          .partner-metric-grid,
          .partner-settlement-summary,
          .partner-listing-grid,
          .partner-cast-profile-grid,
          .partner-hour-row,
          .partner-listing-toolbar,
          .partner-media-grid,
          .partner-store-scope-grid,
          .partner-settlement-filter-grid,
          .partner-bill-form-grid {
            grid-template-columns: 1fr !important;
          }
          .partner-menu-group-head,
          .partner-menu-actions {
            align-items: stretch;
            flex-direction: column;
          }
          .partner-menu-group-head > label,
          .partner-menu-actions > * {
            width: 100%;
          }
          .partner-menu-group-head > label {
            flex: 0 1 auto;
          }
          .partner-menu-item-card {
            grid-template-columns: 1fr;
          }
          .partner-menu-item-actions {
            grid-template-columns: 1fr;
          }
          .partner-menu-item-card > .partner-menu-actions {
            grid-column: auto;
          }
          .partner-field-span-2 {
            grid-column: 1 / -1;
          }
          .partner-cast-toolbar,
          .partner-cast-form-header {
            align-items: stretch;
            flex-direction: column;
          }
        }
      `}</style>

      <div className="partner-shell">
        <aside
          className="partner-sidebar"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            width: '252px',
            height: '100vh',
            minHeight: '100vh',
            overflowY: 'auto',
            zIndex: 10,
            borderRight: `1px solid ${colors.borderGold12}`,
            background: colors.navBg,
            padding: '22px 16px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              textDecoration: 'none',
              margin: '0 6px 26px',
            }}
          >
            <span
              style={{
                fontSize: '25px',
                fontWeight: 800,
                lineHeight: 1,
                background: colors.goldGrad,
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Vietyoru
            </span>
            <span
              style={{
                marginTop: '4px',
                fontSize: '8.5px',
                letterSpacing: '3.2px',
                color: colors.muted,
              }}
            >
              PARTNER PORTAL
            </span>
          </Link>

          <nav className="partner-nav" style={{ display: 'grid', gap: '4px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activePanel === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActivePanel(item.key)}
                  aria-pressed={active}
                  style={{
                    minHeight: '52px',
                    width: '100%',
                    border: 0,
                    borderRadius: '12px',
                    padding: '0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '11px',
                    color: active ? colors.onGold : colors.text2,
                    background: active ? colors.goldGrad : 'transparent',
                    fontSize: '13px',
                    fontWeight: active ? 800 : 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={18} strokeWidth={1.7} />
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block' }}>{item.label}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          <div
            style={{
              marginTop: 'auto',
              borderTop: `1px solid ${colors.borderGold12}`,
              paddingTop: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                border: `1px solid ${colors.borderGold32}`,
                background:
                  "linear-gradient(180deg,rgba(12,12,15,.1),rgba(12,12,15,.55)), url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=300&q=70') center/cover",
                flex: '0 0 auto',
              }}
            />
            <span style={{ minWidth: 0 }}>
              <span
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {storeName}
              </span>
              <span
                style={{
                  display: 'block',
                  marginTop: '2px',
                  fontSize: '11px',
                  color: colors.muted,
                }}
              >
                Đối tác đang hoạt động
              </span>
            </span>
          </div>
        </aside>

        <section style={{ minWidth: 0 }}>
          <header
            className="partner-header"
            style={{
              minHeight: '78px',
              borderBottom: `1px solid ${colors.borderGold12}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              padding: '0 30px',
              background: colors.headerBg,
              backdropFilter: 'blur(14px)',
            }}
          >
            <div className="partner-header-left">
              {/* Desktop-only Page Title */}
              <div className="partner-desktop-header-title">
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '1.7px',
                    color: colors.gold,
                  }}
                >
                  {panelTitles[activePanel].eyebrow}
                </div>
                <h1 style={{ margin: '5px 0 0', fontSize: '24px', fontWeight: 700 }}>
                  {panelTitles[activePanel].title}
                </h1>
              </div>

              {/* Mobile-only Store Name & Status Dot */}
              <div
                className="partner-mobile-header-store"
                style={{
                  display: 'none',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: activeStoreStatus.toUpperCase() === 'ACTIVE' ? colors.success : colors.gold,
                    boxShadow: `0 0 8px ${activeStoreStatus.toUpperCase() === 'ACTIVE' ? colors.success : colors.gold}`,
                    flex: '0 0 auto',
                  }}
                />
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    color: colors.text,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '180px',
                  }}
                >
                  {storeName}
                </span>
              </div>
            </div>
            <div className="partner-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span
                className="partner-header-status-pill"
                style={{
                  height: '38px',
                  borderRadius: '19px',
                  border: `1px solid ${colors.borderGold32}`,
                  padding: '0 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: colors.text2,
                  fontSize: '12px',
                }}
              >
                <CheckCircle2 size={15} color={colors.gold} />
                {activeStoreStatus}
              </span>
              <button
                type="button"
                onClick={togglePartnerTheme}
                title="Chuyển giao diện sáng/tối"
                aria-label="Chuyển giao diện sáng/tối"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: `1px solid ${colors.borderGold32}`,
                  color: colors.gold,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: colors.surface2,
                  cursor: 'pointer',
                  flex: '0 0 auto',
                }}
              >
                {partnerTheme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
              </button>
              <button
                type="button"
                onClick={() => setIsNotificationOpen((current) => !current)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: `1px solid ${colors.borderGold32}`,
                  color: colors.gold,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isNotificationOpen ? colors.activeControlBg : colors.surface2,
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: unreadNotificationCount ? '0 0 0 3px rgba(224,114,158,.08)' : undefined,
                }}
                aria-label={`Thông báo đối tác${unreadNotificationCount ? `, ${unreadNotificationCount} chưa đọc` : ''}`}
                aria-expanded={isNotificationOpen}
              >
                <Bell size={17} />
                {unreadNotificationCount ? (
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      right: '-3px',
                      top: '-4px',
                      minWidth: '17px',
                      height: '17px',
                      borderRadius: '999px',
                      padding: '0 5px',
                      background: colors.neonPink,
                      color: '#fff',
                      border: `2px solid ${colors.bg}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '9px',
                      fontWeight: 900,
                      lineHeight: 1,
                    }}
                  >
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                ) : null}
              </button>
              {isNotificationOpen ? (
                <div
                  className="partner-notification-popover"
                  style={{
                    position: 'fixed',
                    top: '84px',
                    right: '30px',
                    width: '390px',
                    maxWidth: 'calc(100vw - 36px)',
                    zIndex: 80,
                    border: `1px solid ${colors.borderGold32}`,
                    borderRadius: '18px',
                    background: colors.popoverBg,
                    boxShadow: '0 26px 70px -28px rgba(0,0,0,.9)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '14px 14px 12px',
                      borderBottom: `1px solid ${colors.borderHair}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <div style={{ color: colors.text, fontSize: '15px', fontWeight: 900 }}>
                        Thông báo đối tác
                      </div>
                      <div style={{ marginTop: '3px', color: colors.muted, fontSize: '11px' }}>
                        Tách theo booking, QR, bill, coupon và đăng tin
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      disabled={!unreadNotificationCount}
                      style={{
                        minHeight: '30px',
                        border: `1px solid ${colors.borderGold22}`,
                        borderRadius: '999px',
                        background: unreadNotificationCount ? 'rgba(212,178,106,.12)' : colors.surface2,
                        color: unreadNotificationCount ? colors.goldBright : colors.muted,
                        padding: '0 10px',
                        fontSize: '10.5px',
                        fontWeight: 900,
                        cursor: unreadNotificationCount ? 'pointer' : 'not-allowed',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Đã đọc
                    </button>
                  </div>
                  <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '8px' }}>
                    {partnerNotifications.length ? (
                      partnerNotifications.map((notification) => {
                        const Icon = notification.icon;
                        const accent =
                          notification.tone === 'danger'
                            ? colors.danger
                            : notification.tone === 'success'
                              ? colors.success
                              : notification.tone === 'warning'
                                ? colors.goldPale
                                : notification.tone === 'info'
                                  ? '#9bc7ff'
                                  : colors.goldBright;

                        return (
                          <button
                            key={notification.id}
                            type="button"
                            onClick={() => openPartnerNotification(notification)}
                            style={{
                              width: '100%',
                              border: `1px solid ${notification.unread ? colors.borderGold32 : colors.borderHair}`,
                              borderRadius: '14px',
                              background: notification.unread
                                ? 'linear-gradient(90deg,rgba(212,178,106,.15),rgba(255,255,255,.035))'
                                : colors.surface2,
                              color: colors.text,
                              padding: '12px',
                              display: 'grid',
                              gridTemplateColumns: '34px minmax(0,1fr)',
                              gap: '10px',
                              textAlign: 'left',
                              cursor: 'pointer',
                              marginBottom: '8px',
                            }}
                          >
                            <span
                              style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '11px',
                                border: `1px solid ${colors.borderGold22}`,
                                background: 'rgba(212,178,106,.11)',
                                color: accent,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Icon size={17} />
                            </span>
                            <span style={{ minWidth: 0 }}>
                              <span
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '8px',
                                }}
                              >
                                <span
                                  style={{
                                    color: accent,
                                    fontSize: '10px',
                                    fontWeight: 900,
                                    letterSpacing: '.8px',
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  {notification.category}
                                </span>
                                {notification.unread ? (
                                  <span
                                    style={{
                                      width: '7px',
                                      height: '7px',
                                      borderRadius: '50%',
                                      background: colors.neonPink,
                                      flex: '0 0 auto',
                                    }}
                                  />
                                ) : null}
                              </span>
                              <span
                                style={{
                                  display: 'block',
                                  marginTop: '4px',
                                  fontSize: '13px',
                                  fontWeight: 900,
                                  lineHeight: 1.35,
                                }}
                              >
                                {notification.title}
                              </span>
                              <span
                                style={{
                                  display: 'block',
                                  marginTop: '5px',
                                  color: colors.text2,
                                  fontSize: '11.5px',
                                  lineHeight: 1.5,
                                }}
                              >
                                {notification.message}
                              </span>
                              <span
                                style={{
                                  marginTop: '8px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '10px',
                                  color: colors.muted,
                                  fontSize: '10.5px',
                                  fontWeight: 800,
                                }}
                              >
                                <span
                                  style={{
                                    minWidth: 0,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {notification.meta}
                                </span>
                                <span style={{ color: colors.goldBright, flex: '0 0 auto' }}>
                                  {notification.actionLabel}
                                </span>
                              </span>
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <div
                        style={{
                          border: `1px dashed ${colors.borderGold22}`,
                          borderRadius: '14px',
                          padding: '16px',
                          color: colors.text2,
                          fontSize: '12.5px',
                          lineHeight: 1.6,
                        }}
                      >
                        Chưa có thông báo cần xử lý. Khi có booking, QR offline, bill, coupon hoặc trạng thái đăng tin mới,
                        hệ thống sẽ tách thành từng thông báo riêng.
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
              <button
                type="button"
                onClick={logout}
                className="partner-logout-btn"
                style={{
                  height: '38px',
                  borderRadius: '11px',
                  border: `1px solid ${colors.borderGold22}`,
                  padding: '0 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: colors.gold,
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <LogOut size={15} />
                <span className="logout-text">Đăng xuất</span>
              </button>
            </div>
          </header>

          <div className="partner-content">
            {/* Mobile-only page title */}
            <h1
              className="partner-mobile-page-title"
              style={{
                display: 'none',
                margin: '0 0 16px',
                fontSize: '20px',
                fontWeight: 800,
                color: colors.text,
              }}
            >
              {panelTitles[activePanel].title}
            </h1>

            <PanelCard
              style={{
                marginBottom: '14px',
                padding: '16px 18px',
                background:
                  "linear-gradient(90deg,rgba(212,178,106,.13),rgba(255,255,255,.025)), linear-gradient(180deg,rgba(12,12,15,.18),rgba(12,12,15,.72)), url('https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1400&q=72') center/cover",
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div
                    style={{
                      color: colors.gold,
                      fontSize: '10px',
                      fontWeight: 800,
                      letterSpacing: '1.6px',
                    }}
                  >
                    LIVE STORE SCOPE
                  </div>
                  <div
                    style={{
                      marginTop: '6px',
                      color: colors.text,
                      fontSize: '18px',
                      fontWeight: 800,
                    }}
                  >
                    {storeName}
                  </div>
                  <div style={{ marginTop: '5px', color: colors.text2, fontSize: '12px' }}>
                    Mở nhanh tab quét QR, theo dõi tổng quan, đối soát và đăng tin trong portal đối tác.
                  </div>
                </div>
                <GhostButton onClick={() => setActivePanel('scan')}>
                  <QrCode size={16} />
                  Mở quét QR
                </GhostButton>
              </div>
            </PanelCard>

            {renderActivePanel()}
          </div>
        </section>

        {/* Bottom Navigation for Mobile */}
        <nav
          className="partner-mobile-bottom-nav"
          style={{
            display: 'none',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activePanel === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActivePanel(item.key)}
                className={`partner-mobile-nav-btn ${active ? 'active' : ''}`}
                aria-pressed={active}
              >
                <Icon size={20} strokeWidth={active ? 2.2 : 1.7} />
                <span className="partner-mobile-nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </main>
  );
}
