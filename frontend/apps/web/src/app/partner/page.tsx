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
  EyeOff,
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
  Settings,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import jsQR from 'jsqr';
import { useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState, useContext } from 'react';
import { ApiError, apiClient, apiFormDataClient, resolveClientUrl } from '@/lib/api/client';
import { logoutBrowserProfile } from '@/lib/api/auth';
import { billApi } from '@/lib/api/bills';
import {
  memberNotificationCreatedEvent,
  memberNotificationsRefreshEvent,
  type MemberNotificationSocketPayload,
} from '@/lib/api/notifications';
import * as authSession from '@/lib/auth/session';
import { ThemedListingSelect } from '@/components/ui/ThemedListingSelect';
import { useSystemFeedback, SystemFeedbackContext } from '@/components/ui/SystemFeedback';
import { InlineLoading, TableLoadingRows } from '@/components/ui/DataLoading';

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

  try {
    const storedTheme =
      typeof window.localStorage !== 'undefined'
        ? window.localStorage.getItem(partnerThemeStorageKey)
        : null;
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
  } catch {
    // Ignore error in non-browser envs
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

const PARTNER_CAST_PAGE_SIZE = 10;

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
  id?: string;
  stageName: string;
  storeName?: string | null;
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
  isPublic?: boolean;
  status?: string;
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
  live?: PartnerListingDraft | null;
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
  confirmedAt?: string | null;
  updatedAt?: string | null;
  qr?: { usedAt?: string | null } | null;
  couponIssue?: { usedAt?: string | null } | null;
  coupon?: {
    id: string;
    code: string;
    name: string;
    discountType: string;
    discountValue: number;
  } | null;
};

type PartnerBill = {
  id: string;
  storeId?: string | null;
  billNumber: string | null;
  status: string;
  totalVnd: number | null;
  discountVnd: number | null;
  submittedAt: string | null;
  rejectReason?: string | null;
  usedAt?: string | null;
  submitterType?: string | null;
  store?: { id?: string | null; name: string; slug?: string | null } | null;
  booking?: { id: string; status: string; scheduledAt?: string | null } | null;
  coupon?: { code: string; name: string } | null;
  couponIssue?: { id: string; code: string; status: string } | null;
  media?: { id: string; originalName?: string | null; url?: string | null; mimeType?: string | null }[];
  discountRuleSnapshot?: DiscountRuleSnapshot | null;
};

type DiscountRuleSnapshot = {
  type?: string | null;
  discountType?: string | null;
  value?: number | null;
  sourceValue?: number | null;
  discountPercent?: number | null;
  maxDiscountVnd?: number | null;
  minSpendVnd?: number | null;
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
  scanType?: 'COUPON_ISSUE' | 'BOOKING_QR' | 'TOUR_BOOKING_QR';
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
  discountRuleSnapshot?: DiscountRuleSnapshot | null;
  scanSessionToken?: string | null;
  tour?: {
    id: string;
    bookingId: string;
    title: string;
    status: string;
    stopOrder?: number | null;
    progress: {
      checkedIn: number;
      total: number;
    };
  } | null;
};

type BarcodeDetectorResult = { rawValue?: string };
type BarcodeDetectorInstance = {
  detect(source: HTMLVideoElement): Promise<BarcodeDetectorResult[]>;
};
type BarcodeDetectorConstructor = new (options: { formats: string[] }) => BarcodeDetectorInstance;
type BarcodeDetectorWindow = Window & { BarcodeDetector?: BarcodeDetectorConstructor };
type VietnamProvince = { code: number; name: string };
type VietnamWard = { code: number; name: string };
const panelKeys = ['overview', 'scan', 'settlement', 'listing', 'bill', 'settings'] as const;
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
type PartnerNotificationEvent = Omit<PartnerNotification, 'unread'>;
type ListingTabKey = 'store' | 'cast';
type PeriodKey = 'today' | 'seven' | 'thirty';
type OfflineScanQueueItem = {
  payload: string;
  queuedAt: string;
  attempts: number;
  lastError?: string | null;
};

type NormalizedScanPayload = {
  kind: 'booking' | 'tour' | 'signed' | 'coupon';
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
const listingCastLanguageOptions = ['VN', 'EN', 'JP', 'KR', 'CN'];
type CastListField = 'tags' | 'hobbies' | 'languages' | 'youtubeLinks';
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

    const tourToken = url.searchParams.get('tourScanToken');
    if (tourToken) {
      return { kind: 'tour', payload: raw, raw, label: 'QR tour' };
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

const readQrFromImageFile = (file: File) =>
  new Promise<string | null>((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    const cleanup = () => URL.revokeObjectURL(objectUrl);

    image.onload = () => {
      try {
        const width = image.naturalWidth || image.width;
        const height = image.naturalHeight || image.height;
        if (!width || !height) {
          resolve(null);
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) {
          resolve(null);
          return;
        }

        context.drawImage(image, 0, 0, width, height);
        const imageData = context.getImageData(0, 0, width, height);
        resolve(
          jsQR(imageData.data, width, height, { inversionAttempts: 'attemptBoth' })?.data.trim() ??
            null,
        );
      } catch (error) {
        reject(error);
      } finally {
        cleanup();
      }
    };

    image.onerror = () => {
      cleanup();
      reject(new Error('Cannot read QR image'));
    };

    image.src = objectUrl;
  });

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
const moneyVndCode = (value: number) => `${Math.abs(value).toLocaleString('vi-VN')} VND`;

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
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
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

const sanitizeMoneyInput = (value: string) => value.replace(/[^\d]/g, '');
const parseMoneyInput = (value: string) => Number(sanitizeMoneyInput(value));
const formatMoneyInput = (value: string) => {
  const digits = sanitizeMoneyInput(value);
  return digits ? Number(digits).toLocaleString('vi-VN') : '';
};

const isPartnerBookingConfirmedForBill = (booking: PartnerBooking | null | undefined) =>
  ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'].includes(String(booking?.status ?? '').toUpperCase());

const partnerBookingConfirmedUsageAt = (booking: PartnerBooking | null | undefined) =>
  booking?.qr?.usedAt ??
  booking?.couponIssue?.usedAt ??
  (isPartnerBookingConfirmedForBill(booking) ? booking?.confirmedAt ?? booking?.updatedAt ?? null : null);

const partnerBookingUsageSourceLabel = (booking: PartnerBooking | null | undefined) => {
  if (booking?.qr?.usedAt) return 'QR booking đã được partner xác nhận';
  if (booking?.couponIssue?.usedAt) return 'Coupon gắn booking đã được partner xác nhận';
  if (isPartnerBookingConfirmedForBill(booking) && (booking?.confirmedAt || booking?.updatedAt)) {
    return 'Booking đã được Admin xác nhận';
  }
  if (booking) return 'Booking này chưa có mốc Admin/partner xác nhận';
  return 'Chọn booking đã được Admin/partner xác nhận';
};

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

const isListingVideoUrl = (value: string) => {
  const token = value.toLowerCase();
  return (
    /\.(mp4|webm|mov|m4v)(?:[?#].*)?$/.test(token) ||
    token.includes('youtube.com') ||
    token.includes('youtu.be') ||
    token.includes('vimeo.com')
  );
};

const castAvatarUrl = (cast: PartnerListingCast) => {
  const urls = cast.mediaUrls ?? [];
  return (
    urls.find((url) => isValidUrl(url) && !isListingVideoUrl(url)) ??
    urls.find((url) => isValidUrl(url)) ??
    ''
  );
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
  { key: 'settings', label: 'Cài đặt tài khoản', icon: Settings },
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
  settings: { eyebrow: 'PARTNER SETTINGS', title: 'Cài đặt tài khoản' },
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
  className,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
  hideLine?: boolean;
  className?: string;
}) {
  return (
    <div className={className ? `partner-section-heading ${className}` : 'partner-section-heading'} style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
      <div className="partner-section-heading-copy">
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
          className="partner-section-heading-line"
          style={{
            flex: 1,
            height: '1px',
            background: 'linear-gradient(90deg, rgba(212,178,106,.45), transparent)',
          }}
        />
      )}
      {action ? <div className="partner-section-heading-action">{action}</div> : null}
    </div>
  );
}

function PanelCard({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return <article className={className ? `partner-panel-card ${className}` : 'partner-panel-card'} style={{ ...cardStyle, padding: '20px', ...style }}>{children}</article>;
}

function StatusPill({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'gold' | 'success' | 'danger';
  className?: string;
}) {
  const toneStyle = {
    neutral: {
      border: colors.borderSoft,
      background: 'rgba(255, 255, 255, .08)',
      color: colors.text2,
    },
    gold: {
      border: 'rgba(244, 210, 137, .46)',
      background: 'rgba(212, 178, 106, .22)',
      color: colors.goldBright,
    },
    success: {
      border: 'rgba(129, 216, 157, .48)',
      background: 'rgba(129, 216, 157, .18)',
      color: '#a7f3c0',
    },
    danger: {
      border: 'rgba(255, 120, 143, .52)',
      background: 'rgba(255, 120, 143, .16)',
      color: '#ffb8c6',
    },
  }[tone];

  return (
    <span
      className={className ? `partner-status-pill partner-status-pill-${tone} ${className}` : `partner-status-pill partner-status-pill-${tone}`}
      style={{
        minHeight: '26px',
        borderRadius: '999px',
        border: `1px solid ${toneStyle.border}`,
        background: toneStyle.background,
        color: toneStyle.color,
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
  className,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <button
      className={className ? `partner-button partner-button-primary ${className}` : 'partner-button partner-button-primary'}
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
  className,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <button
      className={className ? `partner-button partner-button-ghost ${className}` : 'partner-button partner-button-ghost'}
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
  htmlFor,
  children,
  className,
  style,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const fieldClassName = className ? `partner-form-field ${className}` : 'partner-form-field';

  if (htmlFor) {
    return (
      <div
        className={fieldClassName}
        style={{
          display: 'grid',
          gap: '7px',
          minWidth: 0,
          alignContent: 'start',
          ...style,
        }}
      >
        <label
          htmlFor={htmlFor}
          style={{
            color: colors.text2,
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          {label}
        </label>
        {children}
      </div>
    );
  }

  return (
    <label
      className={fieldClassName}
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

// ThemedListingSelect has been extracted to '@/components/ui/ThemedListingSelect'

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
  const [isViewingLive, setIsViewingLive] = useState<boolean>(false);
  const [liveData, setLiveData] = useState<PartnerListingDraft | null>(null);
  const [draftState, setListingDraft] = useState<PartnerListingDraft>(emptyListingDraft);
  const listingDraft = isViewingLive && liveData ? liveData : draftState;
  const [listingReview, setListingReview] = useState<PartnerListingReview>(null);
  const [listingContentId, setListingContentId] = useState<string | null>(null);
  const [, setListingNotice] = useState('');
  const [listingErrors, setListingErrors] = useState<ListingValidationErrors>({});
  const [listingTagInput, setListingTagInput] = useState('');
  const [castChipInputs, setCastChipInputs] = useState<Record<string, string>>({});
  const [activeCastLanguageInputIndex, setActiveCastLanguageInputIndex] = useState<number | null>(null);
  const [listingUploadKey, setListingUploadKey] = useState<string | null>(null);
  const [activeCastProfileIndex, setActiveCastProfileIndex] = useState<number | null>(null);
  const [castListPage, setCastListPage] = useState(1);
  const [isAddingCastProfile, setIsAddingCastProfile] = useState(false);
  const [activeMenuGroupIndex, setActiveMenuGroupIndex] = useState<number>(0);
  const [menuManage, setMenuManage] = useState<boolean>(false);
  const [provinces, setProvinces] = useState<VietnamProvince[]>([]);
  const [wards, setWards] = useState<VietnamWard[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedWardCode, setSelectedWardCode] = useState('');
  const [isListingLoading, setIsListingLoading] = useState(false);
  const [isSavingListing, setIsSavingListing] = useState(false);
  const [isSubmittingListing, setIsSubmittingListing] = useState(false);
  const [isDeletingCastProfile, setIsDeletingCastProfile] = useState(false);
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
  const [billUsedAt, setBillUsedAt] = useState('');
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
  const [scanStoreId, setScanStoreId] = useState('');
  const [scanIssue, setScanIssue] = useState<PartnerScanIssue | null>(null);
  const [scannedTime, setScannedTime] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState('Sẵn sàng quét QR, dán link hoặc nhập mã coupon.');
  const [isScanning, setIsScanning] = useState(false);
  const [isConfirmingScan, setIsConfirmingScan] = useState(false);
  const [isReadingQrImage, setIsReadingQrImage] = useState(false);
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
  const [partnerNotificationEvents, setPartnerNotificationEvents] = useState<PartnerNotificationEvent[]>([]);

  const rawFeedback = useContext(SystemFeedbackContext);
  const feedback = rawFeedback || {
    showToast: () => {},
    showModal: () => {},
    closeModal: () => {},
  };

  useEffect(() => {
    const pageCount = Math.max(1, Math.ceil(listingDraft.castProfiles.length / PARTNER_CAST_PAGE_SIZE));
    setCastListPage((current) => Math.min(Math.max(current, 1), pageCount));
  }, [listingDraft.castProfiles.length]);

  let currentUser: any = null;
  try {
    const getAuthUserFn = authSession.getAuthUser;
    if (typeof getAuthUserFn === 'function') {
      currentUser = getAuthUserFn();
    }
  } catch {}

  // Change Password States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showStaffPassword, setShowStaffPassword] = useState(false);

  // Staff Management States
  const [staffList, setStaffList] = useState<any[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [staffDisplayName, setStaffDisplayName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [staffPermissions, setStaffPermissions] = useState<string[]>(['coupon.scan', 'checkin.confirm']);
  const [settingsStoreId, setSettingsStoreId] = useState('');

  const fetchStaffList = useCallback(async (storeId: string) => {
    if (!storeId) return;
    setIsLoadingStaff(true);
    try {
      const data = await apiClient<any[]>(`/partner/staff?storeId=${storeId}`);
      setStaffList(data);
    } catch (err: any) {
      feedback.showToast({
        tone: 'error',
        title: 'Lỗi tải danh sách nhân viên',
        description: err.message || 'Không thể lấy dữ liệu nhân viên.',
      });
    } finally {
      setIsLoadingStaff(false);
    }
  }, [feedback]);

  useEffect(() => {
    if (activePanel === 'settings' && settingsStoreId) {
      fetchStaffList(settingsStoreId);
    }
  }, [activePanel, settingsStoreId, fetchStaffList]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      feedback.showToast({
        tone: 'error',
        title: 'Lỗi nhập liệu',
        description: 'Vui lòng điền đầy đủ thông tin.',
      });
      return;
    }
    if (newPassword.length < 8) {
      feedback.showToast({
        tone: 'error',
        title: 'Mật khẩu yếu',
        description: 'Mật khẩu mới phải có ít nhất 8 ký tự.',
      });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      feedback.showToast({
        tone: 'error',
        title: 'Lỗi xác nhận',
        description: 'Mật khẩu mới và xác nhận mật khẩu không khớp.',
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await apiClient('/users/change-password', {
        method: 'POST',
        data: { oldPassword, newPassword },
      });
      feedback.showToast({
        tone: 'success',
        title: 'Thành công',
        description: 'Đổi mật khẩu thành công.',
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      feedback.showToast({
        tone: 'error',
        title: 'Đổi mật khẩu thất bại',
        description: err.message || 'Mật khẩu cũ không chính xác.',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffDisplayName || !staffEmail || !staffPassword || !settingsStoreId) {
      feedback.showToast({
        tone: 'error',
        title: 'Lỗi nhập liệu',
        description: 'Vui lòng điền đầy đủ các thông tin của nhân viên.',
      });
      return;
    }
    if (staffPassword.length < 8) {
      feedback.showToast({
        tone: 'error',
        title: 'Mật khẩu yếu',
        description: 'Mật khẩu nhân viên phải có ít nhất 8 ký tự.',
      });
      return;
    }

    setIsAddingStaff(true);
    try {
      await apiClient('/partner/staff', {
        method: 'POST',
        data: {
          storeId: settingsStoreId,
          email: staffEmail,
          password: staffPassword,
          displayName: staffDisplayName,
          permissions: staffPermissions,
        },
      });
      feedback.showToast({
        tone: 'success',
        title: 'Thành công',
        description: 'Đã thêm/liên kết nhân viên thành công.',
      });
      setStaffDisplayName('');
      setStaffEmail('');
      setStaffPassword('');
      setStaffPermissions(['coupon.scan', 'checkin.confirm']);
      fetchStaffList(settingsStoreId);
    } catch (err: any) {
      feedback.showToast({
        tone: 'error',
        title: 'Lỗi thêm nhân viên',
        description: err.message || 'Không thể tạo tài khoản nhân viên.',
      });
    } finally {
      setIsAddingStaff(false);
    }
  };

  const handleDeleteStaff = (staffId: string, staffName: string) => {
    feedback.showModal({
      tone: 'warning',
      title: 'Xác nhận xóa nhân viên',
      description: `Bạn có chắc chắn muốn xóa nhân viên "${staffName}" khỏi quán này? Quyền truy cập của nhân viên sẽ bị gỡ và tài khoản sẽ ngưng hoạt động.`,
      primaryLabel: 'Xóa',
      secondaryLabel: 'Hủy',
      destructive: true,
      onPrimary: async () => {
        try {
          await apiClient(`/partner/staff/${staffId}?storeId=${settingsStoreId}`, {
            method: 'DELETE',
          });
          feedback.showToast({
            tone: 'success',
            title: 'Thành công',
            description: 'Đã xóa nhân viên thành công.',
          });
          fetchStaffList(settingsStoreId);
          feedback.closeModal();
        } catch (err: any) {
          feedback.showToast({
            tone: 'error',
            title: 'Lỗi xóa nhân viên',
            description: err.message || 'Không thể xóa nhân viên.',
          });
        }
      },
      onSecondary: () => {
        feedback.closeModal();
      },
    });
  };

  const staffPermissionLabel = (permission: string) => {
    if (permission === 'coupon.scan') return 'Quét coupon';
    if (permission === 'checkin.confirm') return 'Xác nhận check-in';
    return permission;
  };

  const staffPermissionsForDisplay = (staff: any): string[] => {
    const permissions = Array.isArray(staff?.permissions) ? staff.permissions : [];
    return permissions.length ? permissions : ['coupon.scan', 'checkin.confirm'];
  };

  const partnerThemeVariables = partnerTheme === 'light'
    ? partnerLightThemeVariables
    : partnerDarkThemeVariables;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const qrImageInputRef = useRef<HTMLInputElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const cameraLoopRef = useRef<number | null>(null);
  const lastCameraPayloadRef = useRef('');

  useEffect(() => {
    document.documentElement.classList.toggle('vy-light', partnerTheme === 'light');
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(partnerThemeStorageKey, partnerTheme);
      }
    } catch {}
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
          const filtered = data.filter(p => String(p.code) === '1' || String(p.code) === '79');
          setProvinces(filtered);
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
    async (
      payload: string,
      options: { fromQueue?: boolean; fromCamera?: boolean; fromImage?: boolean } = {},
    ) => {
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
      if (normalizedPayload.kind === 'tour' && !scanStoreId) {
        setScanMessage('Cần chọn quán đang thực hiện quét QR tour.');
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
          : normalizedPayload.kind === 'tour'
            ? await apiClient<PartnerScanIssue>('/partner/tour-booking-qrs/scan', {
                data: {
                  payload: normalizedPayload.payload,
                  activeStoreId: scanStoreId,
                  offline: Boolean(options.fromQueue),
                  clientScannedAt: new Date().toISOString(),
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
              ? 'Camera đã tắt, kiểm tra thông tin đơn vừa quét rồi xác nhận.'
              : options.fromImage
                ? 'Ảnh QR đã được đọc, kiểm tra thông tin đơn vừa quét rồi xác nhận.'
              : 'Kiểm tra thông tin đơn vừa quét rồi xác nhận.'
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
    [queueOfflineScan, scanStoreId],
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

  const handleQrImageFileChange = useCallback(
    async (input: HTMLInputElement) => {
      const file = input.files?.[0] ?? null;
      input.value = '';
      if (!file) {
        return;
      }

      if (!file.type.startsWith('image/')) {
        setScanMessage('Vui lòng chọn file ảnh QR định dạng JPG, PNG hoặc WebP.');
        return;
      }

      stopCameraScan();
      setIsReadingQrImage(true);
      setScanMessage(`Đang đọc QR từ ảnh ${file.name}...`);

      try {
        const rawValue = await readQrFromImageFile(file);
        if (!rawValue) {
          setScanMessage('Không đọc được QR trong ảnh. Vui lòng chọn ảnh rõ hơn hoặc nhập mã thủ công.');
          return;
        }

        setScanPayload(rawValue);
        setScanMessage('Đã đọc QR từ ảnh, đang xác thực mã...');
        await scanCouponPayload(rawValue, { fromImage: true });
      } catch {
        setScanMessage('Không đọc được ảnh QR. Vui lòng thử ảnh khác hoặc nhập mã thủ công.');
      } finally {
        setIsReadingQrImage(false);
      }
    },
    [scanCouponPayload, stopCameraScan],
  );

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
      scanIssue.scanType === 'BOOKING_QR' || scanIssue.scanType === 'TOUR_BOOKING_QR'
        ? 'Đang xác nhận khách đã đến...'
        : 'Đang xác nhận sử dụng coupon...',
    );
    try {
      if (scanIssue.scanType === 'TOUR_BOOKING_QR') {
        if (!scanIssue.scanSessionToken) {
          setScanMessage('Phiên quét QR tour đã hết hạn. Vui lòng quét lại mã trước khi xác nhận.');
          return;
        }
        const nextIssue = await apiClient<PartnerScanIssue>(
          '/partner/tour-booking-qrs/confirm-check-in',
          {
            data: {
              scanSessionToken: scanIssue.scanSessionToken,
              idempotencyKey: crypto.randomUUID(),
              clientScannedAt: new Date().toISOString(),
              offline: false,
            },
          },
        );
        setScanIssue(nextIssue);
        setScannedTime(new Date().toLocaleString('vi-VN'));
        setScanMessage(
          `${nextIssue.statusLabel ?? nextIssue.status} - điểm dừng này không thể check-in lại.`,
        );
        return;
      }
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
        setScanStoreId((current) => current || storeData[0]?.id || '');
        setListingStoreId((current) => current || storeData[0]?.id || '');
        setBillStoreId((current) => current || storeData[0]?.id || '');
        setSettingsStoreId((current) => current || storeData[0]?.id || '');
        setStatusMessage(
          storeData.length
            ? 'Dữ liệu đang hiển thị theo phạm vi quán của tài khoản Partner.'
            : 'Tài khoản Partner chưa được gán quán. Admin cần cấp quyền quán trước khi đăng thông tin.',
        );

        const dashboardData = await apiClient<PartnerLiteDashboard>(
          `/partner/dashboard-lite?period=${encodeURIComponent(period)}`
        ).catch(() => null);

        if (!isMounted) return;
        setDashboard(dashboardData);

        const isLite = dashboardData?.privacy?.customerDetailVisible === false;

        const promises = [
          apiClient<PartnerCoupon[]>('/partner/coupons').then((res) => { if (isMounted) setCoupons(res); }),
          apiClient<PartnerBill[]>('/partner/bills').then((res) => { if (isMounted) setBills(res); }),
        ];

        if (!isLite) {
          promises.push(
            apiClient<PartnerBooking[]>('/partner/bookings').then((res) => { if (isMounted) setBookings(res); })
          );
        } else {
          setBookings([]);
        }

        const results = await Promise.allSettled(promises);
        if (results.some((result) => result.status === 'rejected')) {
          setStatusMessage('Đã tải quán partner. Một số dữ liệu phụ đang lỗi tạm thời, vui lòng tải lại sau.');
        }
      } catch (error) {
        if (!isMounted) return;

        if (error instanceof ApiError && [401, 403].includes(error.status)) {
          try {
            const clearFn = authSession.clearAuthSession;
            if (typeof clearFn === 'function') {
              clearFn();
            }
          } catch {}
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
    const tourScanToken = searchParams.get('tourScanToken');
    const scanToken = searchParams.get('scanToken') ?? searchParams.get('token');
    const bookingId = searchParams.get('bookingId');
    const token =
      tourScanToken ??
      scanToken ??
      bookingId;
    if (!token) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActivePanel('scan');
      const scanValue = bookingId && !scanToken && !tourScanToken
        ? bookingPayloadFromId(bookingId, searchParams.get('code'))
        : tourScanToken
          ? window.location.href
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

  const pushPartnerNotificationEvent = useCallback((notification: PartnerNotificationEvent) => {
    setPartnerNotificationEvents((current) => [
      notification,
      ...current.filter((item) => item.id !== notification.id),
    ].slice(0, 4));
  }, []);



  const partnerNotifications = useMemo<PartnerNotification[]>(() => {
    const readIds = new Set(readNotificationIds);
    const notifications: PartnerNotificationEvent[] = [...partnerNotificationEvents];
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
        category:
          scanIssue.scanType === 'TOUR_BOOKING_QR'
            ? 'QR tour'
            : scanIssue.scanType === 'BOOKING_QR'
              ? 'QR đặt chỗ'
              : 'QR coupon',
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
    partnerNotificationEvents,
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
  const selectedBillBooking = useMemo(
    () => bookings.find((booking) => booking.id === billBookingId) ?? null,
    [billBookingId, bookings],
  );
  const billConfirmedUsageAt = useMemo(
    () => partnerBookingConfirmedUsageAt(selectedBillBooking),
    [selectedBillBooking],
  );
  const billUsageSourceLabel = useMemo(
    () =>
      selectedBillId
        ? 'Thời gian đã lưu từ hóa đơn'
        : partnerBookingUsageSourceLabel(selectedBillBooking),
    [selectedBillBooking, selectedBillId],
  );
  const selectedBill = useMemo(
    () => bills.find((b) => b.id === selectedBillId) ?? null,
    [bills, selectedBillId],
  );
  const billDiscountLabel = useMemo(() => {
    if (selectedBill) {
      const snapshot = selectedBill.discountRuleSnapshot;
      if (snapshot) {
        const type = snapshot.type ?? snapshot.discountType;
        const val = snapshot.value ?? snapshot.sourceValue ?? snapshot.discountPercent;
        if (type && val) {
          const main = type === 'FIXED_AMOUNT' ? `-${moneyVndCode(Number(val))}` : `-${val}%`;
          const max = snapshot.maxDiscountVnd;
          const min = snapshot.minSpendVnd;
          const details = [
            max && max > 0 ? `tối đa ${moneyVndCode(max)}` : '',
            min && min > 0 ? `từ ${moneyVndCode(min)}` : '',
          ].filter(Boolean);
          const ruleLabel = details.length ? `${main} (${details.join(', ')})` : main;
          return selectedBill.discountVnd
            ? `${ruleLabel} (Đã giảm thực tế: -${moneyVndCode(selectedBill.discountVnd)})`
            : ruleLabel;
        }
      }
      if (selectedBill.discountVnd) {
        return `-${moneyVndCode(selectedBill.discountVnd)}`;
      }
      return null;
    }
    if (selectedBillBooking && selectedBillBooking.coupon) {
      const { discountType, discountValue } = selectedBillBooking.coupon;
      if (discountType && discountValue) {
        if (discountType === 'FIXED_AMOUNT') {
          return `-${moneyVndCode(discountValue)}`;
        }
        return `-${discountValue}%`;
      }
    }
    return null;
  }, [selectedBill, selectedBillBooking]);
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

  const handleBillBookingChange = (value: string) => {
    const booking = bookings.find((item) => item.id === value) ?? null;
    const confirmedUsageAt = partnerBookingConfirmedUsageAt(booking);

    setBillBookingId(value);
    setBillUsedAt(confirmedUsageAt ? toDateTimeLocalValue(confirmedUsageAt) : '');
    setSelectedBillId(null);
    setBillNotice(null);
  };

  const handleBillAmountChange = (value: string) => {
    const clean = value.replace(/\D/g, '');
    if (!clean) {
      setBillAmountInput('');
      return;
    }
    const num = parseInt(clean, 10);
    setBillAmountInput(num.toLocaleString('vi-VN'));
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
      pushPartnerNotificationEvent({
        id: `bill-submitted:${normalizedBill.id}:${normalizedBill.submittedAt ?? Date.now()}`,
        category: 'Hóa đơn',
        title: 'Đã gửi bill về Admin đối soát',
        message: `${normalizedBill.billNumber ?? normalizedBill.id.slice(0, 8)} của ${selectedBillStore.name} đang chờ Admin kiểm tra.${uploadWarning}`,
        meta: `${moneyVnd(billAmount)} · ${formatDateTime(normalizedBill.usedAt ?? normalizedBill.submittedAt ?? new Date().toISOString())}`,
        actionLabel: 'Xem bill',
        panel: 'bill',
        tone: uploadWarning ? 'warning' : 'gold',
        icon: ReceiptText,
      });
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
    setScanMessage('Sẵn sàng quét QR, dán link hoặc nhập mã coupon.');
  };

  const applyListingDraftResponse = useCallback((response: PartnerListingDraftResponse) => {
    const parseDraft = (d: any): PartnerListingDraft => {
      if (!d) return emptyListingDraft;
      return {
        ...emptyListingDraft,
        ...d,
        storeName: safeListingText(d.storeName),
        businessType: safeListingText(d.businessType),
        storeCategory: safeListingText(d.storeCategory),
        area: safeListingText(d.area),
        storeCity: safeListingText(d.storeCity),
        storeDistrict: safeListingText(d.storeDistrict),
        ward: safeListingText(d.ward || d.wardName),
        wardName: safeListingText(d.wardName),
        streetAddress: safeListingText(d.streetAddress),
        phone: safeListingText(d.phone),
        mapUrl: safeListingText(d.mapUrl),
        openingHours: safeListingText(d.openingHours),
        priceRange: safeListingText(d.priceRange),
        menuSummary: safeListingText(d.menuSummary),
        coverImageUrl: safeListingText(d.coverImageUrl),
        description: cleanListingText(d.description),
        note: safeListingText(d.note),
        openingHourItems: d.openingHourItems?.length
          ? d.openingHourItems
          : defaultListingOpeningHours(),
        tags: normalizeListingTextList(d.tags),
        menuGroups: d.menuGroups ?? [],
        galleryUrls: normalizeListingUrlList(d.galleryUrls),
        videoUrls: normalizeListingUrlList(d.videoUrls),
        pricingItems: d.pricingItems ?? [],
        castProfiles: (d.castProfiles ?? []).map((cast: any) => ({
          ...cast,
          id: safeListingText(cast.id),
          stageName: safeListingText(cast.stageName),
          storeName: safeListingText(cast.storeName),
          bio: safeListingText(cast.bio),
          zodiacSign: safeListingText(cast.zodiacSign),
          measurements: safeListingText(cast.measurements),
          tags: normalizeListingTextList(cast.tags),
          languages: normalizeListingTextList(cast.languages),
          hobbies: normalizeListingTextList(cast.hobbies),
          mediaUrls: normalizeListingUrlList(cast.mediaUrls),
          youtubeLinks: normalizeListingUrlList(cast.youtubeLinks),
          isPublic: typeof cast.isPublic === 'boolean' ? cast.isPublic : true,
          status: safeListingText(cast.status) || 'ACTIVE',
        })),
        mediaUrls: normalizeListingUrlList(d.mediaUrls),
      };
    };

    setListingContentId(response.contentId);
    setListingReview(response.review);
    setListingErrors({});
    setListingDraft(parseDraft(response.draft));
    setLiveData(response.live ? parseDraft(response.live) : null);
    setListingNotice(response.message);
    setSelectedProvinceCode('');
    setSelectedWardCode('');
  }, [setSelectedProvinceCode, setSelectedWardCode]);

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

  const refreshPartnerNotificationData = useCallback(() => {
    const promises: Promise<any>[] = [
      apiClient<PartnerCoupon[]>('/partner/coupons').then(setCoupons),
      apiClient<PartnerBill[]>('/partner/bills').then(setBills),
      apiClient<PartnerBooking[]>('/partner/bookings').then(setBookings),
    ];
    if (listingStoreId) {
      promises.push(
        apiClient<PartnerListingDraftResponse>(
          `/partner/listing-draft/${encodeURIComponent(listingStoreId)}`,
        )
          .then((response) => {
            applyListingDraftResponse(response);
          })
          .catch(() => null),
      );
    }
    void Promise.allSettled(promises);
  }, [listingStoreId, applyListingDraftResponse]);

  useEffect(() => {
    const handleMemberNotificationCreated = (event: Event) => {
      const detail = (event as CustomEvent<MemberNotificationSocketPayload>).detail ?? {};
      const createdAt = detail.createdAt ?? new Date().toISOString();
      const category = detail.category ?? 'system';
      const isBill = category === 'bill' || Boolean(detail.billId);
      const isBooking = category === 'booking' || Boolean(detail.bookingId);
      const isListingReview = detail.templateKey === 'partner.listing.reviewed.v1';

      pushPartnerNotificationEvent({
        id: `realtime:${detail.id ?? detail.billId ?? detail.bookingId ?? createdAt}`,
        category: isListingReview ? 'Đăng tin' : isBill ? 'Hóa đơn' : isBooking ? 'Đặt chỗ' : 'Hệ thống',
        title: isListingReview
          ? 'Yêu cầu đăng tin đã được xử lý'
          : isBill
            ? 'Có cập nhật bill mới'
            : isBooking
              ? 'Có cập nhật booking mới'
              : 'Có thông báo mới từ hệ thống',
        message: isListingReview
          ? 'Admin vừa phê duyệt hoặc từ chối thông tin đăng của quán. Vui lòng kiểm tra lại.'
          : isBill
            ? 'Bill vừa có cập nhật mới. Mở màn gửi hóa đơn để kiểm tra trạng thái mới nhất.'
            : isBooking
              ? 'Booking vừa có cập nhật mới. Mở màn quét QR để kiểm tra và xử lý kịp thời.'
              : 'Hệ thống vừa gửi một cập nhật mới cho tài khoản partner.',
        meta: `Realtime · ${formatDateTime(createdAt)}`,
        actionLabel: isListingReview ? 'Xem đăng tin' : isBill ? 'Xem bill' : isBooking ? 'Xem booking' : 'Xem tổng quan',
        panel: isListingReview ? 'listing' : isBill ? 'bill' : isBooking ? 'scan' : 'overview',
        tone: isListingReview ? 'warning' : isBill ? 'gold' : isBooking ? 'info' : 'warning',
        icon: isListingReview ? FileText : isBill ? ReceiptText : isBooking ? CalendarDays : ShieldCheck,
      });
      refreshPartnerNotificationData();
    };

    const handleRefresh = () => {
      refreshPartnerNotificationData();
    };

    const handleBookingStatusUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ id?: string; scheduledAt?: string; store?: { name?: string } }>).detail ?? {};
      const createdAt = new Date().toISOString();

      pushPartnerNotificationEvent({
        id: `realtime:booking:${detail.id ?? createdAt}`,
        category: 'Đặt chỗ',
        title: 'Có cập nhật booking mới',
        message: `${detail.store?.name ?? storeName} vừa có cập nhật booking. Mở màn quét QR để kiểm tra và xử lý kịp thời.`,
        meta: detail.scheduledAt ? `Lịch: ${formatDateTime(detail.scheduledAt)}` : `Realtime · ${formatDateTime(createdAt)}`,
        actionLabel: 'Xem booking',
        panel: 'scan',
        tone: 'info',
        icon: CalendarDays,
      });
      refreshPartnerNotificationData();
    };

    window.addEventListener(memberNotificationCreatedEvent, handleMemberNotificationCreated);
    window.addEventListener('nightlife:booking-status-updated', handleBookingStatusUpdated);
    window.addEventListener(memberNotificationsRefreshEvent, handleRefresh);

    return () => {
      window.removeEventListener(memberNotificationCreatedEvent, handleMemberNotificationCreated);
      window.removeEventListener('nightlife:booking-status-updated', handleBookingStatusUpdated);
      window.removeEventListener(memberNotificationsRefreshEvent, handleRefresh);
    };
  }, [pushPartnerNotificationEvent, refreshPartnerNotificationData, storeName]);

  const clearListingErrorsFor = (path: string) => {
    setListingErrors((current) => {
      const next = Object.fromEntries(
        Object.entries(current).filter(([key]) => key !== path && !key.startsWith(`${path}.`)),
      );
      return Object.keys(next).length === Object.keys(current).length ? current : next;
    });
  };

  const updateListingField = (key: keyof PartnerListingDraft, value: string) => {
    if (isViewingLive) {
      return;
    }

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
    const newIndex = listingDraft.menuGroups.length;
    setListingDraft((current) => ({
      ...current,
      menuGroups: [...current.menuGroups, { name: 'Nhóm mới', items: [] }],
    }));
    setActiveMenuGroupIndex(newIndex);
    setMenuManage(true);
  };

  const removeMenuGroup = (index: number) => {
    clearListingErrorsFor('menuGroups');
    setListingDraft((current) => {
      const nextGroups = current.menuGroups.filter((_, groupIndex) => groupIndex !== index);
      return {
        ...current,
        menuGroups: nextGroups,
      };
    });
    setActiveMenuGroupIndex((current) => {
      if (current >= listingDraft.menuGroups.length - 1) {
        return Math.max(0, listingDraft.menuGroups.length - 2);
      }
      return current;
    });
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
    value: string | string[] | number | boolean | undefined,
  ) => {
    clearListingErrorsFor(`castProfiles.${index}.${String(key)}`);
    setListingDraft((current) => ({
      ...current,
      castProfiles: current.castProfiles.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const toggleCastProfileLanguage = (index: number, language: string) => {
    clearListingErrorsFor(`castProfiles.${index}.languages`);
    setListingDraft((current) => ({
      ...current,
      castProfiles: current.castProfiles.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        const languages = new Set(item.languages ?? []);
        if (languages.has(language)) {
          languages.delete(language);
        } else {
          languages.add(language);
        }
        return { ...item, languages: Array.from(languages) };
      }),
    }));
  };

  const castMeasurementParts = (value?: string | null) => {
    const parts = safeListingText(value)
      .split(/[^\d]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 3);

    return [parts[0] ?? '', parts[1] ?? '', parts[2] ?? ''];
  };

  const updateCastMeasurementPart = (index: number, partIndex: number, value: string) => {
    const currentCast = listingDraft.castProfiles[index];
    if (!currentCast) return;
    const parts = castMeasurementParts(currentCast.measurements);
    parts[partIndex] = value.replace(/\D/g, '').slice(0, 3);
    const nextValue = parts.some(Boolean) ? parts.join('-') : '';
    updateCastProfile(index, 'measurements', nextValue);
  };

  const castChipInputKey = (index: number, field: CastListField) => `${index}:${field}`;

  const castChipInputValue = (index: number, field: CastListField) => castChipInputs[castChipInputKey(index, field)] ?? '';

  const setCastChipInputValue = (
    index: number,
    field: CastListField,
    value: string,
  ) => {
    const key = castChipInputKey(index, field);
    setCastChipInputs((current) => ({ ...current, [key]: value }));
  };

  const clearCastChipInputValue = (index: number, field: CastListField) => {
    const key = castChipInputKey(index, field);
    setCastChipInputs((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const addCastListValues = (
    index: number,
    field: CastListField,
    rawValue: string,
  ) => {
    const values = splitInlineList(rawValue);
    if (!values.length) return;

    clearListingErrorsFor(`castProfiles.${index}.${field}`);
    setListingDraft((current) => ({
      ...current,
      castProfiles: current.castProfiles.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        const existing = item[field] ?? [];
        const nextValues = values.filter(
          (value) => !existing.some((currentValue) => currentValue.toLowerCase() === value.toLowerCase()),
        );
        return { ...item, [field]: [...existing, ...nextValues] };
      }),
    }));
    clearCastChipInputValue(index, field);
  };

  const removeCastListValue = (
    index: number,
    field: CastListField,
    value: string,
  ) => {
    clearListingErrorsFor(`castProfiles.${index}.${field}`);
    setListingDraft((current) => ({
      ...current,
      castProfiles: current.castProfiles.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: (item[field] ?? []).filter((currentValue) => currentValue !== value) }
          : item,
      ),
    }));
  };

  const handleCastChipKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    field: CastListField,
  ) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    addCastListValues(index, field, event.currentTarget.value);
  };

  const closeCastLanguageInput = (index: number) => {
    clearCastChipInputValue(index, 'languages');
    setActiveCastLanguageInputIndex((current) => (current === index ? null : current));
  };

  const commitCastLanguageInput = (index: number, rawValue: string) => {
    addCastListValues(index, 'languages', rawValue);
    clearCastChipInputValue(index, 'languages');
    setActiveCastLanguageInputIndex((current) => (current === index ? null : current));
  };

  const handleCastLanguageKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeCastLanguageInput(index);
      return;
    }
    if (event.key !== 'Enter') return;
    event.preventDefault();
    commitCastLanguageInput(index, event.currentTarget.value);
  };

  const castMediaEntries = (cast: PartnerListingCast, kind: 'image' | 'video') =>
    (cast.mediaUrls ?? [])
      .map((url, mediaIndex) => ({ url, mediaIndex }))
      .filter(({ url }) => {
        const isVideo = isListingVideoUrl(url);
        return kind === 'video' ? isVideo : !isVideo;
      });

  const removeCastMediaUrl = (index: number, mediaIndex: number) => {
    clearListingErrorsFor(`castProfiles.${index}.mediaUrls`);
    setListingDraft((current) => ({
      ...current,
      castProfiles: current.castProfiles.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, mediaUrls: (item.mediaUrls ?? []).filter((_, currentIndex) => currentIndex !== mediaIndex) }
          : item,
      ),
    }));
  };

  const appendCastMediaUrls = (index: number, urls: string[]) => {
    clearListingErrorsFor(`castProfiles.${index}.mediaUrls`);
    setListingDraft((current) => ({
      ...current,
      castProfiles: current.castProfiles.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, mediaUrls: [...(item.mediaUrls ?? []).filter(Boolean), ...urls] }
          : item,
      ),
    }));
  };

  const replaceCastAvatarUrl = (index: number, mediaIndex: number | null, url: string) => {
    clearListingErrorsFor(`castProfiles.${index}.mediaUrls`);
    setListingDraft((current) => ({
      ...current,
      castProfiles: current.castProfiles.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        const currentUrls = item.mediaUrls ?? [];
        const nextUrls = mediaIndex === null
          ? currentUrls
          : currentUrls.filter((_, currentIndex) => currentIndex !== mediaIndex);
        return { ...item, mediaUrls: [url, ...nextUrls.filter(Boolean)] };
      }),
    }));
  };

  const isEmptyCastProfile = (cast: PartnerListingCast) =>
    !hasText(cast.stageName) &&
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
    setCastListPage(1);
    setListingDraft((current) => ({
      ...current,
      castProfiles: [
        {
          stageName: '',
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

  const deleteCastProfile = (index: number) => {
    if (isViewingLive || index < 0) {
      return;
    }

    const cast = draftState.castProfiles[index];
    if (!cast) {
      return;
    }

    const castName = cast.stageName.trim() || `cast #${index + 1}`;
    const isSavedCast = Boolean(cast.id);

    feedback.showModal({
      tone: 'warning',
      title: isSavedCast ? 'Xác nhận xóa mềm cast' : 'Xác nhận xóa cast',
      description: isSavedCast
        ? `Cast "${castName}" sẽ được xóa mềm như bên admin và không hiển thị trong danh sách hoạt động.`
        : `Cast "${castName}" chưa lưu vào hệ thống, thao tác này sẽ gỡ khỏi bản nháp hiện tại.`,
      primaryLabel: isSavedCast ? 'Xóa mềm' : 'Xóa cast',
      secondaryLabel: 'Hủy',
      destructive: true,
      onPrimary: async () => {
        setIsDeletingCastProfile(true);
        try {
          if (isSavedCast && cast.id) {
            await apiClient(
              `/partner/listing-draft/${encodeURIComponent(listingStoreId)}/casts/${encodeURIComponent(cast.id)}`,
              { method: 'DELETE' },
            );
          }
          removeCastProfile(index);
          setListingNotice(isSavedCast ? 'Đã xóa mềm cast.' : 'Đã xóa cast khỏi bản nháp.');
          feedback.showToast({
            tone: 'success',
            title: isSavedCast ? 'Đã xóa mềm cast' : 'Đã xóa cast',
            description: isSavedCast
              ? 'Cast đã được chuyển sang trạng thái xóa mềm.'
              : 'Cast đã được gỡ khỏi bản nháp hiện tại.',
          });
          feedback.closeModal();
        } catch (error) {
          feedback.showToast({
            tone: 'error',
            title: 'Không xóa được cast',
            description: error instanceof ApiError ? error.message : 'Vui lòng thử lại sau.',
          });
        } finally {
          setIsDeletingCastProfile(false);
        }
      },
      onSecondary: () => {
        feedback.closeModal();
      },
    });
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

  const listingPayload = () => {
    const draftPayload = { ...listingDraft };
    delete (draftPayload as Partial<PartnerListingDraft>).wardName;
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
      ...draftPayload,
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
        .map((item) => {
          const castPayload = { ...item };
          delete castPayload.storeName;
          delete castPayload.isPublic;
          delete castPayload.status;
          return {
            ...castPayload,
            tags: item.tags?.filter(Boolean) ?? [],
            languages: item.languages?.filter(Boolean) ?? [],
            hobbies: item.hobbies?.filter(Boolean) ?? [],
            youtubeLinks: item.youtubeLinks?.filter(Boolean) ?? [],
            mediaUrls: item.mediaUrls?.filter(Boolean) ?? [],
          };
        }),
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

  const renderCastChipField = (
    cast: PartnerListingCast,
    index: number,
    field: 'tags' | 'hobbies',
    label: string,
    placeholder: string,
  ) => {
    const values = cast[field] ?? [];
    const inputValue = castChipInputValue(index, field);

    return (
      <FormField label={label}>
        <div className="partner-cast-chip-field">
          {values.map((value) => (
            <span className="partner-cast-chip" key={`${field}-${value}`}>
              <span>{value}</span>
              <button
                type="button"
                aria-label={`Xóa ${value}`}
                onClick={() => removeCastListValue(index, field, value)}
              >
                <XCircle size={13} />
              </button>
            </span>
          ))}
          <input
            value={inputValue}
            onChange={(event) => setCastChipInputValue(index, field, event.target.value)}
            onKeyDown={(event) => handleCastChipKeyDown(event, index, field)}
            placeholder={placeholder}
          />
        </div>
        {listingErrorText(`castProfiles.${index}.${field}`)}
      </FormField>
    );
  };

  const renderCastLanguageField = (cast: PartnerListingCast, index: number) => {
    const customLanguages = (cast.languages ?? []).filter(
      (language) => !listingCastLanguageOptions.includes(language),
    );
    const isAddingCustomLanguage = activeCastLanguageInputIndex === index;
    const inputValue = castChipInputValue(index, 'languages');

    return (
      <FormField label="Ngôn ngữ">
        <div className="partner-cast-token-row">
          {listingCastLanguageOptions.map((language) => {
            const isActive = Boolean(cast.languages?.includes(language));
            return (
              <button
                key={language}
                type="button"
                className={isActive ? 'partner-cast-token is-active' : 'partner-cast-token'}
                onClick={() => toggleCastProfileLanguage(index, language)}
              >
                {language}
              </button>
            );
          })}
          <button
            type="button"
            className="partner-cast-token partner-cast-add-language"
            aria-label="Thêm ngôn ngữ"
            onClick={() => {
              setActiveCastLanguageInputIndex(index);
              setCastChipInputValue(index, 'languages', '');
            }}
          >
            <Plus size={15} />
          </button>
          {isAddingCustomLanguage ? (
            <input
              autoFocus
              className="partner-cast-language-input"
              value={inputValue}
              onBlur={(event) => commitCastLanguageInput(index, event.currentTarget.value)}
              onChange={(event) => setCastChipInputValue(index, 'languages', event.target.value)}
              onKeyDown={(event) => handleCastLanguageKeyDown(event, index)}
              placeholder="Nhập ngôn ngữ..."
            />
          ) : null}
          {customLanguages.map((language) => (
            <span className="partner-cast-language-chip" key={`custom-language-${language}`}>
              <span>{language}</span>
              <button
                type="button"
                aria-label={`Xóa ${language}`}
                onClick={() => removeCastListValue(index, 'languages', language)}
              >
                <XCircle size={13} />
              </button>
            </span>
          ))}
        </div>
        {listingErrorText(`castProfiles.${index}.languages`)}
      </FormField>
    );
  };

  const renderCastVideoCard = (url: string, label: string, onRemove: () => void) => {
    const youtubeThumb = getListingYoutubeThumb(url);

    return (
      <div className="partner-cast-media-card">
        {youtubeThumb ? (
          <span
            role="img"
            aria-label={label}
            className="partner-cast-media-thumb"
            style={{ background: `url("${youtubeThumb}") center/cover no-repeat` }}
          />
        ) : (
          <video
            src={listingMediaUrl(url)}
            muted
            playsInline
            preload="metadata"
            className="partner-cast-media-thumb"
          />
        )}
        <span className="partner-cast-media-play">
          <Play size={17} fill="currentColor" />
        </span>
        {renderListingMediaRemove(label, onRemove)}
      </div>
    );
  };

  const renderCastMediaSections = (cast: PartnerListingCast, index: number) => {
    const imageEntries = castMediaEntries(cast, 'image');
    const avatarEntry = imageEntries[0] ?? null;
    const albumEntries = imageEntries.slice(1);
    const videoEntries = castMediaEntries(cast, 'video');
    const youtubeInput = castChipInputValue(index, 'youtubeLinks');

    return (
      <section className="partner-listing-section">
        <div className="partner-listing-section-title">Ảnh đại diện, album và video</div>
        <div className="partner-cast-media-layout">
          <div className="partner-cast-media-panel partner-cast-avatar-panel">
            <div className="partner-cast-media-panel-head">
              <strong>Ảnh đại diện</strong>
              {avatarEntry ? (
                renderListingUploadButton({
                  key: `cast-avatar-replace-${index}`,
                  label: 'Đổi ảnh',
                  loadingLabel: 'Đang tải...',
                  kind: 'image',
                  purpose: 'PARTNER_CAST_IMAGE',
                  successLabel: 'ảnh đại diện',
                  onUploaded: ([url]) => {
                    if (!url) return;
                    replaceCastAvatarUrl(index, avatarEntry.mediaIndex, url);
                  },
                })
              ) : null}
            </div>
            <div className="partner-cast-media-grid partner-cast-avatar-grid">
              {avatarEntry ? (
                renderListingImagePreview(avatarEntry.url, {
                  label: 'Xóa ảnh đại diện cast',
                  aspectRatio: '3 / 4',
                  onRemove: () => removeCastMediaUrl(index, avatarEntry.mediaIndex),
                })
              ) : (
                renderListingUploadTile({
                  key: `cast-avatar-${index}`,
                  label: 'Tải ảnh đại diện',
                  loadingLabel: 'Đang tải ảnh...',
                  kind: 'image',
                  purpose: 'PARTNER_CAST_IMAGE',
                  successLabel: 'ảnh đại diện',
                  aspectRatio: '3 / 4',
                  onUploaded: ([url]) => {
                    if (!url) return;
                    replaceCastAvatarUrl(index, null, url);
                  },
                })
              )}
            </div>
          </div>

          <div className="partner-cast-media-panel partner-cast-album-panel">
            <div className="partner-cast-media-panel-head">
              <strong>Album ảnh</strong>
            </div>
            <div className="partner-cast-media-grid">
              {albumEntries.map((entry) => (
                <div key={`cast-album-${entry.mediaIndex}`}>
                  {renderListingImagePreview(entry.url, {
                    label: `Xóa ảnh album cast ${entry.mediaIndex + 1}`,
                    aspectRatio: '3 / 4',
                    onRemove: () => removeCastMediaUrl(index, entry.mediaIndex),
                  })}
                </div>
              ))}
              {renderListingUploadTile({
                key: `cast-album-${index}`,
                label: 'Thêm ảnh',
                loadingLabel: 'Đang tải...',
                kind: 'image',
                multiple: true,
                purpose: 'PARTNER_CAST_IMAGE',
                successLabel: 'ảnh cast',
                aspectRatio: '3 / 4',
                onUploaded: (urls) => appendCastMediaUrls(index, urls),
              })}
            </div>
          </div>

          <div className="partner-cast-media-panel partner-cast-media-panel-wide">
            <div className="partner-cast-media-panel-head">
              <strong>Video từ máy</strong>
              {renderListingUploadButton({
                key: `cast-video-${index}`,
                label: 'Thêm video',
                loadingLabel: 'Đang tải...',
                kind: 'video',
                multiple: true,
                purpose: 'PARTNER_CAST_VIDEO',
                successLabel: 'video cast',
                onUploaded: (urls) => appendCastMediaUrls(index, urls),
              })}
            </div>
            <div className="partner-cast-video-grid">
              {videoEntries.length ? (
                videoEntries.map((entry) => (
                  <div key={`cast-video-${entry.mediaIndex}`}>
                    {renderCastVideoCard(
                      entry.url,
                      `Xóa video cast ${entry.mediaIndex + 1}`,
                      () => removeCastMediaUrl(index, entry.mediaIndex),
                    )}
                  </div>
                ))
              ) : (
                <div className="partner-cast-media-empty">Chưa có video tải lên</div>
              )}
            </div>
          </div>

          <div className="partner-cast-media-panel partner-cast-media-panel-wide">
            <div className="partner-cast-media-panel-head">
              <strong>Video YouTube</strong>
            </div>
            <div className="partner-cast-youtube-add">
              <input
                value={youtubeInput}
                onChange={(event) => setCastChipInputValue(index, 'youtubeLinks', event.target.value)}
                onKeyDown={(event) => handleCastChipKeyDown(event, index, 'youtubeLinks')}
                placeholder="Dán link YouTube..."
                style={listingInputStyle(`castProfiles.${index}.youtubeLinks`)}
              />
              <button
                type="button"
                onClick={() => addCastListValues(index, 'youtubeLinks', youtubeInput)}
              >
                Thêm
              </button>
            </div>
            {listingErrorText(`castProfiles.${index}.youtubeLinks`)}
            <div className="partner-cast-video-grid">
              {cast.youtubeLinks?.length ? (
                cast.youtubeLinks.map((url) => (
                  <div key={`cast-youtube-${url}`}>
                    {renderCastVideoCard(url, `Xóa video YouTube ${url}`, () =>
                      removeCastListValue(index, 'youtubeLinks', url),
                    )}
                  </div>
                ))
              ) : (
                <div className="partner-cast-media-empty">Chưa có video YouTube</div>
              )}
            </div>
          </div>
        </div>
        {listingErrorText(`castProfiles.${index}.mediaUrls`)}
      </section>
    );
  };

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

  const validateStoreListingBeforeSubmit = () => {
    if (!listingStoreId) {
      setListingNotice('Cần chọn quán trước khi gửi duyệt thông tin quán.');
      setListingErrors({});
      return false;
    }

    const validation = validateListingDraft(listingDraft, 'submit');
    const storeErrors = Object.fromEntries(
      Object.entries(validation.errors).filter(([path]) => !path.startsWith('castProfiles.')),
    );
    setListingErrors(storeErrors);

    const count = Object.keys(storeErrors).length;
    if (count) {
      setListingTab('store');
      setListingNotice(`Còn ${count} lỗi cần sửa trước khi gửi Admin duyệt thông tin quán.`);
      return false;
    }

    return true;
  };

  const validateCastListingBeforeSubmit = () => {
    if (!listingStoreId) {
      setListingNotice('Cần chọn quán trước khi gửi duyệt cast.');
      setListingErrors({});
      return false;
    }

    const validation = validateListingDraft(listingDraft, 'draft');
    const castErrors = Object.fromEntries(
      Object.entries(validation.errors).filter(([path]) => path.startsWith('castProfiles.')),
    );
    setListingErrors(castErrors);

    const count = Object.keys(castErrors).length;
    if (count) {
      setListingTab('cast');
      setListingNotice(`Còn ${count} lỗi cần sửa trước khi gửi Admin duyệt cast.`);
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
    if (!validateStoreListingBeforeSubmit()) {
      return;
    }

    setIsSubmittingListing(true);
    setListingNotice('Đang gửi bản nháp cho Admin duyệt...');
    try {
      const submitPayload: Partial<PartnerListingDraft> = { ...listingPayload() };
      delete submitPayload.castProfiles;
      const response = await apiClient<{
        id: string;
        status: string;
        submittedAt: string;
        message: string;
        draft?: {
          castCount?: number;
          mediaCount?: number;
          contentCount?: number;
        };
      }>(`/partner/listing-draft/${encodeURIComponent(listingStoreId)}/submit`, {
        data: submitPayload,
      });
      setListingReview({
        id: response.id,
        status: response.status,
        submittedAt: response.submittedAt,
        publicState: 'HIDDEN',
      });
      const submittedStoreCount = response.draft?.contentCount ?? 0;
      const submittedCastCount = response.draft?.castCount ?? 0;
      const submittedMediaCount = response.draft?.mediaCount ?? 0;
      const submittedParts = [
        submittedStoreCount ? 'Thông tin quán' : '',
        submittedCastCount ? `${submittedCastCount} cast` : '',
        submittedMediaCount ? `${submittedMediaCount} media` : '',
      ].filter(Boolean);
      pushPartnerNotificationEvent({
        id: `listing-submitted:${response.id}:${response.submittedAt}`,
        category: 'Đăng tin',
        title: 'Đã gửi bản chỉnh sửa chờ Admin duyệt',
        message: `${submittedParts.length ? submittedParts.join(', ') : 'Thay đổi'} đã gửi vào hàng chờ duyệt.`,
        meta: `Gửi lúc ${formatDateTime(response.submittedAt)}`,
        actionLabel: 'Xem đăng tin',
        panel: 'listing',
        listingTab: submittedCastCount && !submittedStoreCount ? 'cast' : 'store',
        tone: 'gold',
        icon: FileText,
      });
      setListingNotice(
        submittedCastCount && !submittedStoreCount
          ? 'Đã gửi cast cho Admin duyệt. Cast sẽ hiển thị sau khi được duyệt.'
          : 'Đã gửi Admin duyệt. Nội dung sẽ public sau khi được duyệt.',
      );
      feedback.showModal({
        tone: 'success',
        title: 'Gửi duyệt thành công',
        description: submittedCastCount && !submittedStoreCount
          ? 'Yêu cầu thay đổi cast đã được gửi thành công và đang chờ Admin phê duyệt.'
          : 'Yêu cầu thay đổi thông tin đã được gửi thành công và đang chờ Admin phê duyệt.',
        primaryLabel: 'Đóng',
        onPrimary: () => {
          feedback.closeModal();
        },
      });
    } catch (error) {
      setListingNotice(
        error instanceof ApiError ? error.message : 'Không gửi duyệt được bản nháp.',
      );
    } finally {
      setIsSubmittingListing(false);
    }
  };

  const submitCastListingDraft = async () => {
    if (!validateCastListingBeforeSubmit()) {
      return;
    }

    setIsSubmittingListing(true);
    setListingNotice('Đang gửi cast cho Admin duyệt...');
    try {
      const payload = listingPayload();
      const response = await apiClient<{
        id: string;
        status: string;
        submittedAt: string;
        message: string;
        draft?: {
          castCount?: number;
          mediaCount?: number;
          contentCount?: number;
        };
      }>(`/partner/listing-draft/${encodeURIComponent(listingStoreId)}/casts/submit`, {
        data: { castProfiles: payload.castProfiles },
      });
      setListingReview({
        id: response.id,
        status: response.status,
        submittedAt: response.submittedAt,
        publicState: 'HIDDEN',
      });
      const submittedCastCount = response.draft?.castCount ?? 0;
      const submittedMediaCount = response.draft?.mediaCount ?? 0;
      const submittedParts = [
        submittedCastCount ? `${submittedCastCount} cast` : '',
        submittedMediaCount ? `${submittedMediaCount} media` : '',
      ].filter(Boolean);
      pushPartnerNotificationEvent({
        id: `listing-cast-submitted:${response.id}:${response.submittedAt}`,
        category: 'Đăng tin',
        title: 'Đã gửi cast chờ Admin duyệt',
        message: `${submittedParts.length ? submittedParts.join(', ') : 'Cast'} đã gửi vào hàng chờ duyệt.`,
        meta: `Gửi lúc ${formatDateTime(response.submittedAt)}`,
        actionLabel: 'Xem cast',
        panel: 'listing',
        listingTab: 'cast',
        tone: 'gold',
        icon: FileText,
      });
      setListingNotice('Đã gửi cast cho Admin duyệt. Cast sẽ hiển thị sau khi được duyệt.');
      feedback.showModal({
        tone: 'success',
        title: 'Gửi duyệt cast thành công',
        description: 'Yêu cầu thay đổi cast đã được gửi thành công và đang chờ Admin phê duyệt.',
        primaryLabel: 'Đóng',
        onPrimary: () => {
          feedback.closeModal();
        },
      });
    } catch (error) {
      setListingNotice(
        error instanceof ApiError ? error.message : 'Không gửi duyệt được cast.',
      );
    } finally {
      setIsSubmittingListing(false);
    }
  };

  const logout = async () => {
    await logoutBrowserProfile();
    window.location.href = '/dang-nhap-doi-tac';
  };

  const renderOverviewPanel = () => (
    <>
      <div className="partner-metric-grid">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <PanelCard key={metric.label} className="partner-metric-card" style={{ padding: '18px' }}>
              <div
                className="partner-metric-card-head"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <span
                  className="partner-metric-icon"
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
                className="partner-metric-label"
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
                className="partner-metric-value"
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
              <div className="partner-metric-sub" style={{ marginTop: '8px', color: colors.goldBright, fontSize: '12px' }}>
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
            <div className="partner-bar-chart" style={{ display: 'flex', alignItems: 'flex-end', gap: '14px', height: '235px' }}>
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

      <div
        style={{
          marginTop: '18px',
          border: `1px solid ${colors.borderGold22}`,
          borderRadius: '14px',
          background: 'rgba(212,178,106,.08)',
          color: colors.text2,
          padding: '13px 16px',
          fontSize: '12px',
          lineHeight: 1.6,
        }}
      >
        Đối tác chỉ xem dữ liệu tổng hợp của riêng quán. Bảng đối soát không hiển thị hồ sơ khách chi tiết, chỉ giữ mã giao dịch và usage log phục vụ xác nhận coupon.
        <br />
        {dashboard?.privacy?.note ?? statusMessage} Source: {dashboard?.customerArrivalSource === 'BILL_APPROVED' ? 'Bill approved' : 'QR used'}. Stores: {stores.length}.
      </div>
    </>
  );

  const renderScanPanel = () => (
    <div className={scanIssue ? 'partner-scan-result-view' : 'partner-scan-grid'}>
      {!scanIssue ? (
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
          className="partner-camera-frame"
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

        <div className="partner-action-row partner-camera-actions" style={{ marginTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <PrimaryButton
            disabled={cameraStatus === 'starting' || isReadingQrImage}
            onClick={cameraActive ? stopCameraScan : () => void startCameraScan()}
          >
            <Camera size={16} />
            {cameraStatus === 'active'
              ? 'Tắt camera'
              : cameraStatus === 'starting'
                ? 'Đang mở'
                : 'Mở camera'}
          </PrimaryButton>
          <input
            ref={qrImageInputRef}
            accept="image/*"
            type="file"
            hidden
            onChange={(event) => void handleQrImageFileChange(event.currentTarget)}
          />
          <GhostButton
            disabled={isScanning || isReadingQrImage}
            onClick={() => qrImageInputRef.current?.click()}
          >
            <Upload size={16} />
            {isReadingQrImage ? 'Đang đọc ảnh' : 'Tải ảnh QR'}
          </GhostButton>
          {offlineScanQueue.length > 0 ? (
            <GhostButton disabled={isScanning || isReadingQrImage} onClick={() => void replayOfflineScans()}>
              <RefreshCcw size={16} />
              Gửi hàng đợi
            </GhostButton>
          ) : null}
        </div>

        <div style={{ marginTop: '8px', color: colors.muted, fontSize: '11px', lineHeight: 1.5 }}>
          Luồng quét gồm scan, kiểm tra đúng quán/còn hạn/chưa USED, rồi xác nhận check-in.
          Nếu camera không đọc được mã, có thể tải ảnh QR khách gửi để quét xác nhận. Hàng đợi offline tự xoá sau 24h hoặc sau 3 lần gửi lỗi.
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
          className="partner-scan-form"
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
      ) : null}

      {scanIssue ? (
      <PanelCard>
        <SectionHeading
          title="Thông tin đơn vừa quét"
          hideLine
        />
          <div style={{ display: 'grid', gap: '12px' }}>
            <div
              className="partner-scan-result-summary"
              style={{
                ...softCardStyle,
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) auto',
                gap: '10px 12px',
                alignItems: 'start',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <div className="partner-scan-result-code" style={{ minWidth: 0 }}>
                <div
                  style={{
                    color: colors.gold,
                    fontSize: '18px',
                    fontWeight: 900,
                    lineHeight: 1.28,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {scanIssue.code}
                </div>
              </div>
              <div
                className="partner-scan-result-title"
                style={{
                  gridColumn: '1 / -1',
                  color: colors.text,
                  fontSize: '14px',
                  fontWeight: 800,
                  lineHeight: 1.45,
                  minWidth: 0,
                  overflowWrap: 'anywhere',
                }}
              >
                {scanIssue.scanType === 'TOUR_BOOKING_QR'
                  ? `Tour · điểm ${scanIssue.tour?.stopOrder ?? '-'}`
                  : scanIssue.scanType === 'BOOKING_QR'
                    ? 'Đơn đặt chỗ'
                    : scanIssue.coupon?.name ?? 'Coupon'}{' '}
                ·{' '}
                {scanIssue.coupon?.store?.name ?? storeName}
              </div>
            </div>

            {[
              [
                'Loại mã',
                scanIssue.scanType === 'TOUR_BOOKING_QR'
                  ? 'QR tour'
                  : scanIssue.scanType === 'BOOKING_QR'
                    ? 'QR đặt chỗ'
                    : 'Coupon',
              ],
              ...(scanIssue.tour
                ? [
                    ['Tour', scanIssue.tour.title],
                    [
                      'Tiến độ',
                      `${scanIssue.tour.progress.checkedIn}/${scanIssue.tour.progress.total} điểm đã check-in`,
                    ],
                  ]
                : []),
              ['Quán áp dụng', scanIssue.coupon?.store?.name ?? storeName],
              ...(scannedDiscountLabel ? [['Mức giảm', scannedDiscountLabel]] : []),
              ['Trạng thái', scanIssue.statusLabel ?? scanIssue.status],
              ...(scannedUsedAtLabel ? [['Ngày giờ quét', scannedUsedAtLabel]] : []),
              ['Hạn sử dụng', scannedExpiryLabel],
              ['Khách hàng', scannedCustomerLabel],
              ['Booking', scannedBookingLabel],
            ].map(([label, value]) => (
              <div
                className="partner-scan-info-row"
                key={label}
                style={{
                  minHeight: '44px',
                  borderBottom: `1px solid ${colors.borderHair}`,
                  display: 'grid',
                  gridTemplateColumns: 'minmax(88px, .72fr) minmax(0, 1.42fr)',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '12.5px',
                }}
              >
                <span style={{ color: colors.muted, minWidth: 0 }}>{label}</span>
                {label === 'Mức giảm' || label === 'Trạng thái' ? (
                  <StatusPill
                    className="partner-scan-info-badge"
                    tone={
                      label === 'Trạng thái'
                        ? scanIssue.status === 'ISSUED'
                          ? 'success'
                          : 'neutral'
                        : 'gold'
                    }
                  >
                    {value}
                  </StatusPill>
                ) : (
                  <span
                    className="partner-scan-info-value"
                    style={{
                      color: colors.text,
                      textAlign: 'right',
                      fontWeight: 700,
                      justifySelf: 'end',
                      minWidth: 0,
                      maxWidth: '100%',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {value}
                  </span>
                )}
              </div>
            ))}

            <div
              style={{
                ...softCardStyle,
                padding: '13px 14px',
                color: canConfirmScan ? colors.text2 : colors.success,
                fontSize: '12px',
                lineHeight: 1.6,
              }}
            >
              {canConfirmScan
                ? scanMessage
                : 'Đã xác nhận xong. Bấm quay lại để quét mã QR tiếp theo.'}
            </div>

            <div className="partner-action-row partner-scan-result-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
              {canConfirmScan ? (
                <>
                  <PrimaryButton
                    disabled={isConfirmingScan}
                    onClick={confirmScannedIssue}
                  >
                    <CheckCircle2 size={16} />
                    {isConfirmingScan
                      ? 'Đang xác nhận'
                      : scanIssue.scanType === 'BOOKING_QR' || scanIssue.scanType === 'TOUR_BOOKING_QR'
                        ? 'Xác nhận check-in'
                        : 'Xác nhận'}
                  </PrimaryButton>
                  <GhostButton onClick={rejectScanResult}>
                    <XCircle size={16} />
                    Từ chối
                  </GhostButton>
                </>
              ) : (
                <PrimaryButton onClick={rejectScanResult} style={{ width: '100%' }}>
                  <ArrowLeft size={16} />
                  Quay lại quét QR
                </PrimaryButton>
              )}
            </div>
          </div>
      </PanelCard>
      ) : null}
    </div>
  );

  const renderSettlementPanel = () => (
    <>
      <PanelCard style={{ marginBottom: '14px' }}>
        <div
          className="partner-filter-head"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            flexWrap: 'wrap',
          }}
        >
          <SectionHeading eyebrow="PERIOD FILTER" title="Kỳ đối soát" />
          <div className="partner-period-tabs" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
          <FormField label="Từ ngày" className="partner-date-field">
            <input
              value={settlementFilters.fromDate}
              onChange={(event) => updateSettlementFilter('fromDate', event.target.value)}
              type="date"
              style={inputStyle}
            />
          </FormField>
          <FormField label="Đến ngày" className="partner-date-field">
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

        <div className="partner-table-scroll partner-settlement-table-scroll" style={{ overflowX: 'auto' }}>
          <table className="partner-settlement-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '920px' }}>
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
        <div className="partner-settlement-mobile-list">
          {filteredSettlementRows.length ? (
            filteredSettlementRows.map((row, index) => (
              <article key={`${row.code}-${index}`} className="partner-settlement-mobile-card">
                <div className="partner-settlement-mobile-head">
                  <span className="partner-settlement-mobile-index">#{index + 1}</span>
                  <StatusPill tone="gold">{row.status}</StatusPill>
                </div>
                <strong className="partner-settlement-mobile-code">{row.code}</strong>
                <div className="partner-settlement-mobile-service">{row.service}</div>
                <div className="partner-settlement-mobile-grid">
                  <span>
                    <small>Thời gian</small>
                    <b>{row.time}</b>
                  </span>
                  <span>
                    <small>Khách</small>
                    <b>Đã ẩn</b>
                  </span>
                  <span>
                    <small>Giảm giá</small>
                    <b>-{moneyVndCode(row.amount)}</b>
                  </span>
                </div>
              </article>
            ))
          ) : (
            <div className="partner-settlement-mobile-empty">
              {settlementRows.length
                ? 'Không có usage log phù hợp với bộ lọc đang chọn.'
                : 'Chưa có usage log trong phạm vi quán của partner.'}
            </div>
          )}
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
      </div>

      <div style={isViewingLive ? { pointerEvents: 'none', opacity: 0.8 } : undefined}>
        <section className="partner-listing-section">
          <div className="partner-listing-section-title">Thông tin cơ bản</div>
          <div className="partner-listing-grid partner-cast-basic-grid">
            <FormField label="Tên cast">
              <input
                value={cast.stageName}
                onChange={(event) => updateCastProfile(index, 'stageName', event.target.value)}
                placeholder="VD: Yuki"
                style={listingInputStyle(`castProfiles.${index}.stageName`)}
              />
              {listingErrorText(`castProfiles.${index}.stageName`)}
            </FormField>
            {renderCastLanguageField(cast, index)}
            {renderCastChipField(cast, index, 'tags', 'Tags / từ khóa', 'VD: Sang chảnh')}
            {renderCastChipField(cast, index, 'hobbies', 'Sở thích', 'VD: Hát')}
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
            <div className="partner-cast-measurements">
              {castMeasurementParts(cast.measurements).map((part, partIndex) => (
                <input
                  key={`measurement-${partIndex}`}
                  inputMode="numeric"
                  value={part}
                  onChange={(event) => updateCastMeasurementPart(index, partIndex, event.target.value)}
                  placeholder={`V${partIndex + 1}`}
                  style={listingInputStyle(`castProfiles.${index}.measurements`)}
                />
              ))}
            </div>
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

      {renderCastMediaSections(cast, index)}
      </div>
    </div>
  );

  const renderCastTable = () => {
    const castRows = listingDraft.castProfiles.map((cast, index) => ({ cast, index }));
    const totalPages = Math.max(1, Math.ceil(castRows.length / PARTNER_CAST_PAGE_SIZE));
    const safePage = Math.min(Math.max(castListPage, 1), totalPages);
    const pageStart = (safePage - 1) * PARTNER_CAST_PAGE_SIZE;
    const pageRows = castRows.slice(pageStart, pageStart + PARTNER_CAST_PAGE_SIZE);
    const pageEnd = Math.min(pageStart + pageRows.length, castRows.length);
    const renderPagination = () =>
      castRows.length > PARTNER_CAST_PAGE_SIZE ? (
        <div className="partner-cast-pagination">
          <span>
            Hiển thị {pageStart + 1}-{pageEnd} / {castRows.length} cast
          </span>
          <div>
            <button
              type="button"
              disabled={safePage === 1}
              onClick={() => setCastListPage((current) => Math.max(1, current - 1))}
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, pageIndex) => {
              const page = pageIndex + 1;
              return (
                <button
                  type="button"
                  key={`cast-page-${page}`}
                  aria-current={page === safePage ? 'page' : undefined}
                  onClick={() => setCastListPage(page)}
                >
                  {page}
                </button>
              );
            })}
            <button
              type="button"
              disabled={safePage === totalPages}
              onClick={() => setCastListPage((current) => Math.min(totalPages, current + 1))}
            >
              Sau
            </button>
          </div>
        </div>
      ) : null;

    return (
    <div style={{ display: 'grid', gap: '14px' }}>
      <div className="partner-cast-toolbar">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <StatusPill tone="gold">Tất cả {listingDraft.castProfiles.length}</StatusPill>
          <StatusPill tone="success">Đã nhập {listingDraft.castProfiles.filter((cast) => cast.stageName.trim()).length}</StatusPill>
          <StatusPill>Thiếu tên {listingDraft.castProfiles.filter((cast) => !cast.stageName.trim()).length}</StatusPill>
        </div>
        {!isViewingLive && (
          <PrimaryButton onClick={addCastProfile}>
            <Plus size={16} />
            Thêm cast
          </PrimaryButton>
        )}
      </div>

      {!listingDraft.castProfiles.length ? (
        <div style={{ ...softCardStyle, padding: '14px', color: colors.text2, fontSize: '12.5px', lineHeight: 1.6 }}>
          Chưa có cast trong bản nháp. Bấm Thêm cast để nhập dữ liệu thật của quán.
        </div>
      ) : (
        <>
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
                {pageRows.map(({ cast, index }) => {
                  const avatarUrl = castAvatarUrl(cast);
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
                            <span className="partner-cast-sub">{cast.zodiacSign || '---'}</span>
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
          <div className="partner-cast-mobile-list">
            {pageRows.map(({ cast, index }) => {
              const avatarUrl = castAvatarUrl(cast);
              const hasRequiredName = cast.stageName.trim();
              const storeName = listingDraft.storeName || activePartnerStore?.name || 'Quán đang quản lý';
              const languages = cast.languages?.length ? cast.languages.join(' · ') : '---';
              const tags = cast.tags?.length ? cast.tags.join(', ') : '---';

              return (
                <button
                  type="button"
                  key={`mobile-${cast.stageName || 'draft-cast'}-${index}`}
                  onClick={() => openCastProfileForm(index)}
                  aria-label={`Xem chi tiết cast ${cast.stageName || index + 1}`}
                  className="partner-cast-mobile-card"
                >
                  <span className="partner-cast-mobile-head">
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
                    <span className="partner-cast-mobile-title">
                      <span className="partner-cast-mobile-index">#{index + 1}</span>
                      <strong>{hasRequiredName || 'Draft cast'}</strong>
                      <small>{cast.zodiacSign || '---'}</small>
                    </span>
                    <StatusPill tone={hasRequiredName ? 'success' : 'gold'}>
                      {hasRequiredName ? 'Đã nhập' : 'Bản nháp'}
                    </StatusPill>
                    <ChevronRight size={18} className="partner-cast-mobile-arrow" />
                  </span>
                  <span className="partner-cast-mobile-details">
                    <span>
                      <small>Quán trực thuộc</small>
                      <b>{storeName}</b>
                    </span>
                    <span>
                      <small>Ngôn ngữ</small>
                      <b>{languages}</b>
                    </span>
                    <span>
                      <small>Tags</small>
                      <b>{tags}</b>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          {renderPagination()}
        </>
      )}
    </div>
    );
  };

  const renderMenuGroupsSection = () => {
    const activeIndex = Math.max(0, Math.min(activeMenuGroupIndex, listingDraft.menuGroups.length - 1));
    const activeGroup = listingDraft.menuGroups[activeIndex];

    return (
      <section className="partner-listing-section">
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', color: '#caa765', textTransform: 'uppercase', margin: '24px 0 12px' }}>Thực đơn & mức giá</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '11px' }}>
          {listingDraft.menuGroups.map((group, groupIndex) => (
            <div key={`group-tab-${groupIndex}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {menuManage ? (
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,.05)', borderRadius: '9px', padding: '2px 2px 2px 8px' }}>
                  <input 
                    value={group.name} 
                    onChange={(e) => updateMenuGroupName(groupIndex, e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: '#f3f0ea', fontSize: '12px', outline: 'none', width: '80px' }}
                  />
                  <span 
                    onClick={() => removeMenuGroup(groupIndex)} 
                    style={{ width: 24, height: 24, borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#e88b99', background: 'rgba(232,139,153,.15)', marginLeft: '4px' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </span>
                </div>
              ) : (
                <span 
                  onClick={() => setActiveMenuGroupIndex(groupIndex)} 
                  style={{ 
                    padding: '6px 12px', 
                    borderRadius: '9px', 
                    fontSize: '12px', 
                    fontWeight: 600, 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '7px', 
                    color: activeIndex === groupIndex ? '#241a0a' : '#c5c0b6', 
                    background: activeIndex === groupIndex ? 'linear-gradient(135deg,#f0dda8,#d4b26a)' : 'rgba(255,255,255,.05)' 
                  }}
                >
                  {group.name || 'Nhóm chưa đặt tên'}
                </span>
              )}
            </div>
          ))}
          
          <span 
            onClick={addMenuGroup} 
            style={{ fontSize: '11.5px', fontWeight: 600, color: '#8c8679', border: '1.5px dashed rgba(212,178,106,.35)', padding: '6px 12px', borderRadius: '9px', cursor: 'pointer' }}
          >
            + Nhóm
          </span>
          
          <span style={{ flex: 1 }}></span>
          <span 
            onClick={() => setMenuManage(!menuManage)} 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 600, color: menuManage ? '#d4b26a' : '#8c8679', cursor: 'pointer' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
            {menuManage ? 'Hoàn tất' : 'Sửa nhóm'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
          {activeGroup?.items.map((item, itemIndex) => {
            const imageUrl = safeListingText(item.imageUrl).trim();
            const uploadKey = `menu-item-image-${activeIndex}-${itemIndex}`;
            const isBusy = listingUploadKey === uploadKey;
            const isDisabled = Boolean(listingUploadKey);
            
            return (
              <div 
                key={`item-row-${itemIndex}`} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  background: 'rgba(255,255,255,.03)', 
                  border: '1px solid rgba(255,255,255,.07)', 
                  borderRadius: '12px', 
                  padding: '9px 12px 9px 9px' 
                }}
              >
                <div 
                  onClick={() => {
                    if (!isDisabled) {
                      const inputEl = document.getElementById(uploadKey) as HTMLInputElement;
                      inputEl?.click();
                    }
                  }} 
                  style={{ 
                    width: 46, 
                    height: 46, 
                    flex: 'none', 
                    borderRadius: 9, 
                    background: imageUrl ? `url("${listingMediaUrl(imageUrl)}") center/cover no-repeat` : 'rgba(255,255,255,.05)', 
                    cursor: 'pointer', 
                    position: 'relative', 
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,.07)'
                  }} 
                  title="Đổi ảnh món ăn"
                >
                  {!imageUrl && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c8679' }}>
                      <ImagePlus size={16} />
                    </div>
                  )}
                  {isBusy && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                        <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
                      </svg>
                    </div>
                  )}
                  <input 
                    id={uploadKey}
                    type="file" 
                    accept="image/*" 
                    disabled={isDisabled} 
                    style={{ display: 'none' }}
                    onChange={(event) => {
                      const files = Array.from(event.currentTarget.files ?? []);
                      event.currentTarget.value = '';
                      void uploadListingFiles(files, {
                        key: uploadKey,
                        kind: 'image',
                        purpose: 'PARTNER_MENU_ITEM',
                        successLabel: 'ảnh món',
                        onUploaded: ([url]) => {
                          if (!url) return;
                          updateMenuItem(activeIndex, itemIndex, 'imageUrl', url);
                        },
                      });
                    }} 
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <input 
                      value={item.name} 
                      onChange={e => updateMenuItem(activeIndex, itemIndex, 'name', e.target.value)} 
                      style={{ background: 'transparent', border: 'none', color: '#e8e4db', fontSize: '12.5px', fontWeight: 600, outline: 'none', width: '100%' }} 
                      placeholder="Tên món" 
                    />
                    <span 
                      onClick={() => updateMenuItem(activeIndex, itemIndex, 'isHot', !item.isHot)} 
                      style={{ 
                        flex: 'none', 
                        fontSize: '8.5px', 
                        fontWeight: 800, 
                        letterSpacing: '.8px', 
                        color: item.isHot ? '#241a0a' : '#8c8679', 
                        background: item.isHot ? 'linear-gradient(135deg,#f0dda8,#d4b26a)' : 'rgba(255,255,255,.1)', 
                        padding: '2.5px 7px', 
                        borderRadius: '5px', 
                        cursor: 'pointer' 
                      }}
                    >
                      HOT
                    </span>
                  </div>
                  <input 
                    value={item.description ?? ''} 
                    onChange={e => updateMenuItem(activeIndex, itemIndex, 'description', e.target.value)} 
                    style={{ background: 'transparent', border: 'none', color: '#8c8679', fontSize: '10.5px', marginTop: '2px', outline: 'none', width: '100%' }} 
                    placeholder="Mô tả" 
                  />
                </div>

                <div style={{ display: 'flex', flex: 'none', gap: '3px', background: 'rgba(12,12,15,.4)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '9px', padding: '3px' }}>
                  <span onClick={() => updateMenuItem(activeIndex, itemIndex, 'priceTier', '$$')} style={{ padding: '4px 7px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 700, cursor: 'pointer', color: item.priceTier === '$$' ? '#d4b26a' : '#57534b', background: item.priceTier === '$$' ? 'rgba(212,178,106,.15)' : 'transparent' }}>$$</span>
                  <span onClick={() => updateMenuItem(activeIndex, itemIndex, 'priceTier', '$$$')} style={{ padding: '4px 7px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 700, cursor: 'pointer', color: item.priceTier === '$$$' ? '#d4b26a' : '#57534b', background: item.priceTier === '$$$' ? 'rgba(212,178,106,.15)' : 'transparent' }}>$$$</span>
                  <span onClick={() => updateMenuItem(activeIndex, itemIndex, 'priceTier', '$$$$')} style={{ padding: '4px 7px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 700, cursor: 'pointer', color: item.priceTier === '$$$$' ? '#d4b26a' : '#57534b', background: item.priceTier === '$$$$' ? 'rgba(212,178,106,.15)' : 'transparent' }}>$$$$</span>
                </div>

                <span 
                  onClick={() => removeMenuItem(activeIndex, itemIndex)} 
                  style={{ width: 30, height: 30, flex: 'none', borderRadius: 9, background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9b958a', cursor: 'pointer' }} 
                  title="Xóa món"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                </span>
              </div>
            );
          })}

          {listingDraft.menuGroups.length > 0 && (
            <div 
              onClick={() => addMenuItem(activeIndex)} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '7px', 
                border: '1.5px dashed rgba(212,178,106,.35)', 
                borderRadius: '12px', 
                padding: '12px', 
                color: '#8c8679', 
                cursor: 'pointer', 
                fontSize: '11.5px' 
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>Thêm món vào nhóm này
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '10px', fontSize: '10.5px', color: '#8c8679', lineHeight: 1.5 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ flex: 'none', marginTop: '1px' }}><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M12 11v5"/></svg>
          <span>Không hiển thị giá tiền trực tiếp — chỉ hiển thị mức chi phí: <b style={{ color: '#caa765' }}>$$</b> rẻ · <b style={{ color: '#caa765' }}>$$$</b> vừa · <b style={{ color: '#caa765' }}>$$$$</b> cao.</span>
        </div>
      </section>
    );
  };

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
      <div className="partner-listing-form" style={isViewingLive ? { pointerEvents: 'none', opacity: 0.8 } : undefined}>
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
                {isViewingLive ? (
                  <div
                    data-testid="partner-live-description"
                    role="textbox"
                    aria-label="Mô tả quán đang Go Live"
                    aria-readonly="true"
                    style={{
                      minHeight: '158px',
                      padding: '14px 16px',
                      color: colors.text,
                      background: colors.surface2,
                      lineHeight: 1.65,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {listingDraft.description || 'Chưa có mô tả được đăng.'}
                  </div>
                ) : (
                  <ReactQuill
                    theme="snow"
                    value={listingDraft.description}
                    onChange={(value) => updateListingField('description', value)}
                  />
                )}
              </div>
              <textarea
                value={listingDraft.description}
                readOnly={isViewingLive}
                onChange={(event) => updateListingField('description', event.target.value)}
                placeholder="Không gian, dịch vụ nổi bật, lưu ý khi đặt bàn..."
                aria-label="Mô tả quán dạng text"
                className="partner-quill-fallback"
                style={listingInputStyle('description', { minHeight: '132px', resize: 'vertical', padding: '12px', lineHeight: 1.5 })}
              />
              {listingErrorText('description')}
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
  const activeEditableCastIndex =
    !isViewingLive && listingTab === 'cast' ? activeCastProfileIndex : null;
  const activeEditableCast =
    activeEditableCastIndex === null ? null : draftState.castProfiles[activeEditableCastIndex];

  const renderListingPanel = () => (
    <PanelCard className="partner-listing-panel">
      <SectionHeading
        className="partner-listing-heading"
        eyebrow="DRAFT & APPROVAL"
        title="Thông tin hiển thị trên trang quán"
        action={
          <div className="partner-listing-review-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {liveData && (
              <div className="partner-listing-version-switcher" style={{ display: 'flex', gap: '8px', borderRight: `1px solid ${colors.borderSoft}`, paddingRight: '12px' }}>
                <button
                  className="partner-listing-version-button"
                  type="button"
                  onClick={() => {
                    setIsViewingLive(true);
                    setSelectedProvinceCode('');
                    setSelectedWardCode('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px 8px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: isViewingLive ? colors.goldBright : colors.text2,
                    fontWeight: isViewingLive ? 'bold' : 'bold',
                  }}
                >
                  [Xem bản đang Go Live]
                </button>
                <button
                  className="partner-listing-version-button"
                  type="button"
                  onClick={() => {
                    setIsViewingLive(false);
                    setSelectedProvinceCode('');
                    setSelectedWardCode('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px 8px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: !isViewingLive ? colors.goldBright : colors.text2,
                    fontWeight: !isViewingLive ? 'bold' : 'bold',
                  }}
                >
                  [Xem bản chỉnh sửa]
                </button>
              </div>
            )}
            <StatusPill tone={listingReviewTone} className="partner-listing-status-pill">{listingReviewLabel}</StatusPill>
          </div>
        }
      />

      <div className="partner-listing-tabs" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
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

      {!isViewingLive && (
        <div
          className="partner-action-row partner-listing-actions"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            flexWrap: 'wrap',
            marginTop: '18px',
          }}
        >
          {activeEditableCastIndex !== null ? (
            <GhostButton
              disabled={!canWriteListing || isDeletingCastProfile}
              onClick={() => deleteCastProfile(activeEditableCastIndex)}
            >
              <XCircle size={16} />
              {isDeletingCastProfile
                ? 'Đang xóa...'
                : activeEditableCast?.id
                  ? 'Xóa mềm'
                  : 'Xóa cast'}
            </GhostButton>
          ) : null}
          <GhostButton disabled={!canWriteListing} onClick={saveListingDraft}>
            <Save size={16} />
            {isSavingListing ? 'Đang lưu...' : 'Lưu nháp'}
          </GhostButton>
          <PrimaryButton
            disabled={!canWriteListing}
            onClick={listingTab === 'cast' ? submitCastListingDraft : submitListingDraft}
          >
            <Send size={16} />
            {isSubmittingListing
              ? 'Đang gửi...'
              : listingTab === 'cast'
                ? 'Gửi duyệt cast'
                : 'Gửi duyệt thông tin quán'}
          </PrimaryButton>
        </div>
      )}
    </PanelCard>
  );

  const renderBillPanel = () => {
    return (
      <div style={{ marginTop: '14px' }}>
        <div style={{ display: billSubView === 'list' ? 'block' : 'none' }}>
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
                      setBillUsedAt('');
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
            <div className="partner-bill-mobile-list">
              {scopedBillRows.length ? (
                scopedBillRows.map((bill, index) => {
                  const active = selectedBillId === bill.id;
                  const billCode = bill.billNumber ?? bill.id.slice(0, 8);
                  const storeName = bill.store?.name ?? selectedBillStore?.name ?? 'Quán';
                  const bookingText = bill.booking
                    ? `${translateBookingStatus(bill.booking.status)} · ${formatDateTime(bill.booking.scheduledAt)}`
                    : 'Không liên kết booking';
                  const statusTone = bill.status === 'VERIFIED' || bill.status === 'PAID' ? 'success' : bill.status === 'REJECTED' ? 'danger' : 'gold';

                  return (
                    <button
                      key={bill.id}
                      type="button"
                      className={active ? 'partner-bill-mobile-card active' : 'partner-bill-mobile-card'}
                      onClick={() => fillBillFormFromRow(bill)}
                    >
                      <div className="partner-bill-mobile-head">
                        <span className="partner-bill-mobile-index">#{index + 1}</span>
                        <span className="partner-bill-mobile-code">{billCode}</span>
                        <StatusPill tone={statusTone}>{translateBillStatus(bill.status)}</StatusPill>
                      </div>
                      <div className="partner-bill-mobile-store">{storeName}</div>
                      <div className="partner-bill-mobile-grid">
                        <span>
                          <small>Tổng tiền</small>
                          <b>{moneyVnd(bill.totalVnd ?? 0)}</b>
                        </span>
                        <span>
                          <small>Thời gian</small>
                          <b>{formatDateTime(bill.usedAt ?? bill.submittedAt)}</b>
                        </span>
                      </div>
                      <div className="partner-bill-mobile-booking">{bookingText}</div>
                    </button>
                  );
                })
              ) : (
                <div className="partner-bill-mobile-empty">Chưa có hóa đơn trong quán đang chọn.</div>
              )}
            </div>
          </PanelCard>
        </div>

        <div style={{ display: billSubView === 'form' ? 'block' : 'none', maxWidth: '800px', marginInline: 'auto' }}>
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

            <FormField label="Quán thuộc partner *" htmlFor="bill-store-select-hidden">
              <div
                aria-readonly="true"
                style={{
                  ...inputStyle,
                  minHeight: '44px',
                  display: 'grid',
                  alignContent: 'center',
                  color: selectedBillStore ? colors.text : colors.muted,
                  fontWeight: 900,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={selectedBillStore?.name ?? undefined}
              >
                {selectedBillStore
                  ? `${selectedBillStore.name}${selectedBillStore.district ? ` - ${selectedBillStore.district}` : ''}`
                  : <InlineLoading label="Đang tải quán được cấp quyền" />}
              </div>
              <select
                id="bill-store-select-hidden"
                value={billStoreId || (stores[0]?.id ?? '')}
                onChange={(e) => setBillStoreId(e.target.value)}
                style={{ opacity: 0, position: 'absolute', zIndex: -1 }}
                aria-label="Quán thuộc partner *"
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="partner-bill-form-grid">
              <FormField label="Tổng tiền bill gốc *" htmlFor="bill-amount-input">
                <div style={{ position: 'relative' }}>
                  <input
                    id="bill-amount-input"
                    inputMode="numeric"
                    placeholder="VD: 1.800.000"
                    value={billAmountInput}
                    onChange={(event) => handleBillAmountChange(event.target.value)}
                    style={{ ...inputStyle, paddingRight: '48px' }}
                  />
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      right: '13px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: colors.goldBright,
                      fontSize: '12px',
                      fontWeight: 900,
                      letterSpacing: '.03em',
                      pointerEvents: 'none',
                    }}
                  >
                    VND
                  </span>
                </div>
              </FormField>
              <FormField label="Thời gian sử dụng *" htmlFor="bill-used-at-hidden">
                <div
                  aria-readonly="true"
                  style={{
                    ...inputStyle,
                    minHeight: '44px',
                    display: 'grid',
                    alignContent: 'center',
                    gap: '3px',
                    color: billUsedAt ? colors.goldPale : colors.muted,
                    borderColor: billUsedAt ? 'rgba(129,216,157,.34)' : colors.borderGold22,
                    background: billUsedAt ? 'rgba(129,216,157,.08)' : colors.surface2,
                  }}
                >
                  <strong style={{ fontSize: '13px', lineHeight: 1.2 }}>
                    {billUsedAt ? formatDateTime(billConfirmedUsageAt ?? billUsedAt) : 'Chưa có thời gian xác nhận'}
                  </strong>
                  <span style={{ color: colors.muted, fontSize: '11px', fontWeight: 800, lineHeight: 1.25 }}>
                    {billUsageSourceLabel}
                  </span>
                </div>
                <input
                  id="bill-used-at-hidden"
                  type="datetime-local"
                  value={billUsedAt}
                  onChange={(e) => setBillUsedAt(e.target.value)}
                  style={{ opacity: 0, position: 'absolute', zIndex: -1 }}
                />
              </FormField>
            </div>

            <FormField label="Liên kết booking">
              {selectedBill ? (
                <div
                  aria-readonly="true"
                  style={{
                    ...inputStyle,
                    minHeight: '44px',
                    display: 'grid',
                    alignContent: 'center',
                    color: selectedBillBooking ? colors.text : colors.muted,
                    background: colors.surface2,
                    borderColor: colors.borderSoft,
                    fontWeight: 800,
                    fontSize: '13px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {selectedBillBooking
                    ? `${formatDateTime(selectedBillBooking.scheduledAt)} - ${selectedBillBooking.partySize} khách - ${selectedBillBooking.store.name}`
                    : selectedBill.booking
                      ? `${formatDateTime(selectedBill.booking.scheduledAt)} - ${translateBookingStatus(selectedBill.booking.status)}`
                      : 'Không liên kết booking'}
                </div>
              ) : (
                <ThemedListingSelect
                  value={billBookingId}
                  onChange={handleBillBookingChange}
                  placeholder="Không liên kết booking"
                  options={[
                    { value: '', label: 'Không liên kết booking' },
                    ...billBookingOptions.map((booking) => ({
                      value: booking.id,
                      label: `${formatDateTime(booking.scheduledAt)} - ${booking.partySize} khách - ${booking.store.name}`,
                    })),
                  ]}
                />
              )}
            </FormField>

            {billDiscountLabel && (
              <FormField label="Mức giảm giá áp dụng từ coupon">
                <div
                  aria-readonly="true"
                  style={{
                    ...inputStyle,
                    minHeight: '44px',
                    display: 'grid',
                    alignContent: 'center',
                    color: colors.goldPale,
                    borderColor: 'rgba(212,178,106,.45)',
                    background: 'rgba(212,178,106,.05)',
                    fontWeight: 900,
                    fontSize: '13px',
                    padding: '0 12px',
                  }}
                >
                  {billDiscountLabel}
                </div>
              </FormField>
            )}

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
                      const evidenceUrl = med.url ?? '';
                      const isImg =
                        med.mimeType?.startsWith('image/') ||
                        /\.(jpeg|jpg|gif|png|webp)$/i.test(evidenceUrl.split('?')[0] ?? '');
                      return (
                        <div key={med.id} style={{ display: 'inline-block' }}>
                          {isImg ? (
                            <img
                              src={evidenceUrl}
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
                ) : null}
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
      </div>
    );
  };

  const renderSettingsPanel = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '14px' }}>
        <PanelCard>
          <SectionHeading eyebrow="PARTNER SETTINGS" title="Đổi mật khẩu" />
          <form onSubmit={handleChangePassword} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
            <FormField label="Mật khẩu cũ">
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '40px' }}
                  placeholder="Nhập mật khẩu hiện tại"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: colors.muted,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                  }}
                  aria-label={showOldPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </FormField>
            <FormField label="Mật khẩu mới">
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '40px' }}
                  placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: colors.muted,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                  }}
                  aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </FormField>
            <FormField label="Xác nhận mật khẩu mới">
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '40px' }}
                  placeholder="Xác nhận mật khẩu mới"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: colors.muted,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                  }}
                  aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </FormField>
            <PrimaryButton type="submit" disabled={isChangingPassword} style={{ marginTop: '8px', alignSelf: 'start' }}>
              {isChangingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </PrimaryButton>
          </form>
        </PanelCard>

        {currentUser?.role === 'PARTNER' && (
          <PanelCard>
            <SectionHeading eyebrow="STAFF MANAGEMENT" title="Quản lý nhân viên" />
            
            {/* Form thêm nhân viên */}
            <div style={{ marginTop: '20px', padding: '16px', border: `1px solid ${colors.borderSoft}`, borderRadius: '12px', background: colors.surface2 }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: colors.goldBright, marginBottom: '14px' }}>Thêm nhân viên mới</h3>
              <form onSubmit={handleAddStaff} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'end' }}>
                <FormField label="Họ tên nhân viên">
                  <input
                    type="text"
                    value={staffDisplayName}
                    onChange={(e) => setStaffDisplayName(e.target.value)}
                    style={inputStyle}
                    placeholder="Nguyễn Văn A"
                  />
                </FormField>
                <FormField label="Email đăng nhập">
                  <input
                    type="email"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    style={inputStyle}
                    placeholder="staff@example.com"
                    autoComplete="new-password"
                  />
                </FormField>
                <FormField label="Mật khẩu (tối thiểu 8 ký tự)">
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      type={showStaffPassword ? 'text' : 'password'}
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      style={{ ...inputStyle, paddingRight: '40px' }}
                      placeholder="Nhập mật khẩu"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStaffPassword(!showStaffPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: colors.muted,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px',
                      }}
                      aria-label={showStaffPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showStaffPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </FormField>
                <FormField label="Quyền hạn">
                  <div style={{ display: 'flex', gap: '16px', minHeight: '44px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={staffPermissions.includes('coupon.scan')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setStaffPermissions(prev => [...prev, 'coupon.scan']);
                          } else {
                            setStaffPermissions(prev => prev.filter(p => p !== 'coupon.scan'));
                          }
                        }}
                        style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: colors.gold }}
                      />
                      Quét coupon
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={staffPermissions.includes('checkin.confirm')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setStaffPermissions(prev => [...prev, 'checkin.confirm']);
                          } else {
                            setStaffPermissions(prev => prev.filter(p => p !== 'checkin.confirm'));
                          }
                        }}
                        style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: colors.gold }}
                      />
                      Xác nhận check-in
                    </label>
                  </div>
                </FormField>
                <PrimaryButton type="submit" disabled={isAddingStaff} style={{ minHeight: '44px' }}>
                  {isAddingStaff ? 'Đang thêm...' : 'Thêm nhân viên'}
                </PrimaryButton>
              </form>
            </div>

            {/* Danh sách nhân viên */}
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: colors.text }}>Danh sách nhân viên</h3>
              </div>

              {/* Bảng danh sách nhân viên */}
              <div className="partner-staff-table-wrap" style={{ overflowX: 'auto', border: `1px solid ${colors.borderSoft}`, borderRadius: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: colors.surface3, borderBottom: `1px solid ${colors.borderSoft}`, color: colors.text2, fontWeight: 700 }}>
                      <th style={{ padding: '12px 16px' }}>Họ tên</th>
                      <th style={{ padding: '12px 16px' }}>Email</th>
                      <th style={{ padding: '12px 16px' }}>Quán quản lý</th>
                      <th style={{ padding: '12px 16px' }}>Trạng thái</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingStaff ? (
                      <TableLoadingRows columns={5} rows={5} ariaLabel="Đang tải danh sách nhân viên" />
                    ) : staffList.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: colors.muted }}>
                          Chưa có nhân viên nào tại quán này.
                        </td>
                      </tr>
                    ) : (
                      staffList.map((staff) => {
                        const currentStore = stores.find((s) => s.id === settingsStoreId);
                        return (
                          <tr key={staff.id} style={{ borderBottom: `1px solid ${colors.borderSoft}`, color: colors.text }}>
                            <td style={{ padding: '12px 16px', fontWeight: 600 }}>{staff.displayName}</td>
                            <td style={{ padding: '12px 16px' }}>{staff.email}</td>
                            <td style={{ padding: '12px 16px' }}>{currentStore?.name || 'N/A'}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                background: staff.status === 'ACTIVE' ? 'rgba(141,230,176,.12)' : 'rgba(255,180,168,.12)',
                                color: staff.status === 'ACTIVE' ? colors.success : colors.danger,
                              }}>
                                {staff.status === 'ACTIVE' ? 'Hoạt động' : 'Ngưng hoạt động'}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              <button
                                type="button"
                                onClick={() => handleDeleteStaff(staff.id, staff.displayName)}
                                style={{
                                  background: 'transparent',
                                  border: 0,
                                  color: colors.danger,
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  outline: 'none',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,180,168,.08)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                              >
                                Xóa
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="partner-staff-mobile-list">
                {isLoadingStaff ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <article className="partner-staff-mobile-card" key={`staff-loading-${index}`}>
                      <div className="partner-staff-mobile-skeleton" />
                      <div className="partner-staff-mobile-skeleton short" />
                      <div className="partner-staff-mobile-skeleton" />
                    </article>
                  ))
                ) : staffList.length === 0 ? (
                  <div className="partner-staff-mobile-empty">Chưa có nhân viên nào tại quán này.</div>
                ) : (
                  staffList.map((staff) => {
                    const currentStore = stores.find((s) => s.id === settingsStoreId);
                    const permissions = staffPermissionsForDisplay(staff);
                    const active = staff.status === 'ACTIVE';
                    return (
                      <article className="partner-staff-mobile-card" key={staff.id}>
                        <div className="partner-staff-mobile-head">
                          <div>
                            <strong>{staff.displayName}</strong>
                            <span>{staff.email}</span>
                          </div>
                          <span className={active ? 'partner-staff-mobile-status active' : 'partner-staff-mobile-status'}>
                            {active ? 'Hoạt động' : 'Ngưng hoạt động'}
                          </span>
                        </div>
                        <dl className="partner-staff-mobile-details">
                          <div>
                            <dt>Quán</dt>
                            <dd>{currentStore?.name || 'N/A'}</dd>
                          </div>
                          <div>
                            <dt>Quyền</dt>
                            <dd className="partner-staff-mobile-permissions">
                              {permissions.map((permission) => (
                                <span key={permission}>{staffPermissionLabel(permission)}</span>
                              ))}
                            </dd>
                          </div>
                        </dl>
                        <button
                          type="button"
                          className="partner-staff-mobile-delete"
                          onClick={() => handleDeleteStaff(staff.id, staff.displayName)}
                        >
                          <XCircle size={16} />
                          Xóa nhân viên
                        </button>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          </PanelCard>
        )}
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
    if (activePanel === 'settings') {
      return renderSettingsPanel();
    }
    return renderOverviewPanel();
  };

  return (
    <main
      style={{
        ...partnerThemeVariables,
        minHeight: '100dvh',
        background: colors.bg,
        color: colors.text,
        fontFamily: 'var(--nl-font-sans)',
      } as React.CSSProperties}
    >
      <style>{`
        .partner-shell {
          display: block;
          padding-left: 252px;
          min-height: 100dvh;
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
        .partner-scan-result-view {
          display: grid;
          gap: 14px;
          max-width: 760px;
          margin: 14px auto 0;
          width: 100%;
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
        .partner-cast-basic-grid {
          grid-template-columns: minmax(260px, 1fr) minmax(280px, 1fr);
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
        .partner-cast-token-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 7px;
        }
        .partner-cast-token {
          min-height: 34px;
          min-width: 46px;
          border: 1px solid ${colors.borderSoft};
          border-radius: 999px;
          background: ${colors.surface2};
          color: ${colors.text2};
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 900;
          padding: 0 12px;
        }
        .partner-cast-token.is-active {
          border-color: ${colors.borderGold40};
          background: ${colors.goldGrad};
          color: ${colors.onGold};
        }
        .partner-cast-add-language {
          min-width: 34px;
          width: 34px;
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .partner-cast-language-input {
          min-height: 34px;
          width: min(220px, 100%);
          border: 1px solid ${colors.borderGold22};
          border-radius: 999px;
          background: ${colors.surface2};
          color: ${colors.text};
          font: inherit;
          font-size: 12px;
          font-weight: 900;
          outline: 0;
          padding: 0 12px;
        }
        .partner-cast-language-chip {
          max-width: 100%;
          min-height: 34px;
          border: 1px solid ${colors.borderGold22};
          border-radius: 999px;
          background: rgba(212,178,106,.13);
          color: ${colors.text};
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 900;
          padding: 0 6px 0 12px;
        }
        .partner-cast-language-chip span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .partner-cast-language-chip button {
          width: 20px;
          height: 20px;
          border: 0;
          border-radius: 50%;
          background: transparent;
          color: ${colors.muted};
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .partner-cast-chip-field {
          min-height: 44px;
          border-radius: 11px;
          border: 1px solid ${colors.borderGold22};
          background: ${colors.surface2};
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 7px;
          padding: 7px 9px;
        }
        .partner-cast-chip {
          max-width: 100%;
          min-height: 28px;
          border: 1px solid ${colors.borderGold22};
          border-radius: 999px;
          background: rgba(212,178,106,.13);
          color: ${colors.text};
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 900;
          padding: 0 5px 0 10px;
        }
        .partner-cast-chip span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .partner-cast-chip button {
          width: 20px;
          height: 20px;
          border: 0;
          border-radius: 50%;
          background: transparent;
          color: ${colors.muted};
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .partner-cast-chip-field input {
          min-width: 120px;
          flex: 1 1 150px;
          border: 0;
          outline: 0;
          background: transparent;
          color: ${colors.text};
          font: inherit;
          font-size: 13px;
          font-weight: 800;
        }
        .partner-cast-measurements {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }
        .partner-cast-measurements input {
          text-align: center;
          padding-left: 8px !important;
          padding-right: 8px !important;
        }
        .partner-cast-media-layout {
          display: grid;
          grid-template-columns: minmax(180px, .7fr) minmax(280px, 1.3fr);
          gap: 14px;
          align-items: start;
        }
        .partner-cast-media-panel {
          border: 1px solid ${colors.borderHair};
          border-radius: 14px;
          background: ${colors.surface2};
          display: grid;
          gap: 11px;
          min-width: 0;
          padding: 12px;
        }
        .partner-cast-avatar-panel,
        .partner-cast-album-panel {
          align-self: start;
        }
        .partner-cast-album-panel .partner-cast-media-grid {
          max-height: 176px;
          overflow-y: auto;
          padding-right: 4px;
          scrollbar-width: thin;
        }
        .partner-cast-album-panel .partner-cast-media-grid::-webkit-scrollbar {
          width: 6px;
        }
        .partner-cast-album-panel .partner-cast-media-grid::-webkit-scrollbar-thumb {
          background: ${colors.gold};
          border-radius: 999px;
        }
        .partner-cast-media-panel-wide {
          grid-column: span 2;
        }
        .partner-cast-media-panel-head {
          min-height: 38px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .partner-cast-media-panel-head strong {
          color: ${colors.text2};
          font-size: 12px;
          font-weight: 900;
        }
        .partner-cast-media-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
          gap: 10px;
        }
        .partner-cast-avatar-grid {
          grid-template-columns: minmax(118px, 132px);
          justify-content: start;
        }
        .partner-cast-video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(154px, 1fr));
          gap: 10px;
        }
        .partner-cast-media-card {
          position: relative;
          aspect-ratio: 16 / 10;
          border: 1px solid ${colors.borderGold22};
          border-radius: 14px;
          background: ${colors.surface3};
          overflow: hidden;
        }
        .partner-cast-media-thumb {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .partner-cast-media-play {
          position: absolute;
          inset: 0;
          margin: auto;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(12,12,15,.62);
          border: 1px solid rgba(255,255,255,.26);
          color: ${colors.goldPale};
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .partner-cast-media-empty {
          min-height: 82px;
          border: 1px dashed ${colors.borderGold22};
          border-radius: 14px;
          color: ${colors.muted};
          display: grid;
          place-items: center;
          font-size: 12px;
          font-weight: 800;
          padding: 12px;
          text-align: center;
        }
        .partner-cast-youtube-add {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 78px;
          gap: 8px;
        }
        .partner-cast-youtube-add button {
          min-height: 44px;
          border: 0;
          border-radius: 11px;
          background: ${colors.goldGrad};
          color: ${colors.onGold};
          cursor: pointer;
          font: inherit;
          font-size: 13px;
          font-weight: 900;
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
          width: 1px !important;
          min-width: 0 !important;
          max-width: 1px !important;
          height: 1px !important;
          min-height: 0 !important;
          max-height: 1px !important;
          left: 0 !important;
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
        .partner-cast-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          color: ${colors.text2};
          font-size: 12px;
          font-weight: 800;
        }
        .partner-cast-pagination > div {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .partner-cast-pagination button {
          min-width: 34px;
          height: 34px;
          border-radius: 10px;
          border: 1px solid ${colors.borderSoft};
          background: ${colors.surface2};
          color: ${colors.text2};
          font: inherit;
          font-weight: 900;
          cursor: pointer;
          padding: 0 10px;
        }
        .partner-cast-pagination button[aria-current='page'] {
          border-color: ${colors.borderGold40};
          background: ${colors.goldGrad};
          color: ${colors.onGold};
        }
        .partner-cast-pagination button:disabled {
          opacity: .45;
          cursor: not-allowed;
        }
        .partner-media-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        .partner-settlement-filter-grid > * {
          min-width: 0;
        }
        .partner-date-field,
        .partner-date-field input[type="date"],
        .partner-listing-review-actions,
        .partner-listing-version-switcher {
          min-width: 0;
        }
        .partner-date-field input[type="date"] {
          display: block;
          inline-size: 100%;
          max-inline-size: 100%;
          min-inline-size: 0;
          -webkit-appearance: none;
          appearance: none;
        }
        .partner-date-field input[type="date"]::-webkit-date-and-time-value {
          min-width: 0;
          text-align: left;
        }
        .partner-notification-popover button {
          font-family: inherit;
        }
        .partner-notification-popover {
          z-index: 420 !important;
          isolation: isolate;
        }
        .partner-panel-card,
        .partner-section-heading-copy,
        .partner-form-field {
          min-width: 0;
        }
        .partner-panel-card {
          overflow: hidden;
        }
        .partner-scan-result-summary,
        .partner-scan-result-code,
        .partner-scan-result-title,
        .partner-scan-info-row,
        .partner-scan-info-value {
          min-width: 0;
        }
        .partner-scan-result-status {
          justify-self: end;
        }
        .partner-scan-info-badge {
          justify-self: end;
          max-width: 100%;
          min-height: 28px !important;
          padding: 0 12px !important;
          white-space: normal !important;
          text-align: right;
          line-height: 1.2;
        }
        .partner-button {
          min-width: 0;
          line-height: 1;
        }
        .partner-section-heading-action {
          flex: 0 0 auto;
        }
        .partner-table-scroll,
        .partner-cast-table-wrap {
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
        }
        .partner-table-scroll table,
        .partner-cast-table {
          white-space: nowrap;
        }
        .partner-bill-mobile-list {
          display: none;
        }
        .partner-cast-mobile-list {
          display: none;
        }
        .partner-settlement-mobile-list {
          display: none;
        }
        .partner-staff-mobile-list {
          display: none;
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
            padding-bottom: 0 !important;
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
            position: relative;
            z-index: 360;
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
            z-index: 430 !important;
            background: ${partnerTheme === 'light' ? 'rgb(255,252,247)' : 'rgb(18,18,22)'} !important;
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            box-shadow: 0 28px 80px -24px rgba(0,0,0,.92) !important;
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
          .partner-cast-media-layout,
          .partner-cast-youtube-add {
            grid-template-columns: 1fr;
          }
          .partner-cast-album-panel .partner-cast-media-grid {
            max-height: none;
            overflow-y: visible;
            padding-right: 0;
          }
          .partner-cast-media-panel-wide {
            grid-column: auto;
          }
          .partner-content {
            padding: 14px 14px calc(72px + env(safe-area-inset-bottom)) !important;
          }
          .partner-panel-card {
            border-radius: 14px !important;
            padding: 16px !important;
          }
          .partner-mobile-page-title {
            margin-bottom: 14px !important;
            font-size: 22px !important;
            line-height: 1.18 !important;
          }
          .partner-metric-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }
          .partner-metric-card {
            min-height: 143px;
            padding: 13px !important;
          }
          .partner-metric-card-head {
            gap: 6px !important;
          }
          .partner-metric-icon {
            width: 30px !important;
            height: 30px !important;
            border-radius: 13px !important;
          }
          .partner-metric-card .partner-status-pill {
            max-width: 116px;
            overflow: hidden;
            padding: 0 8px !important;
            text-overflow: ellipsis;
            font-size: 10px !important;
          }
          .partner-metric-label {
            font-size: 11px !important;
            line-height: 1.35 !important;
            margin-top: 12px !important;
            min-height: 30px;
          }
          .partner-metric-value {
            font-size: 25px !important;
          }
          .partner-metric-sub {
            font-size: 11px !important;
            line-height: 1.35;
          }
          .partner-overview-grid,
          .partner-scan-grid,
          .partner-scan-result-view,
          .partner-bill-panel-grid {
            gap: 12px;
            margin-top: 12px;
          }
          .partner-section-heading {
            align-items: flex-start !important;
            flex-wrap: wrap;
            gap: 10px !important;
            margin-bottom: 14px !important;
          }
          .partner-section-heading h2 {
            font-size: 18px !important;
            line-height: 1.25;
          }
          .partner-section-heading-line {
            flex-basis: 100% !important;
            order: 3;
          }
          .partner-section-heading-action {
            margin-left: auto;
          }
          .partner-listing-heading .partner-section-heading-action {
            margin-left: 0;
            width: 100%;
          }
          .partner-listing-review-actions {
            align-items: stretch !important;
            flex-direction: column;
            gap: 8px !important;
            width: 100%;
          }
          .partner-listing-version-switcher {
            border-right: 0 !important;
            display: grid !important;
            gap: 8px !important;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            padding-right: 0 !important;
            width: 100%;
          }
          .partner-listing-version-button {
            background: ${colors.surface2} !important;
            border: 1px solid ${colors.borderGold22} !important;
            border-radius: 12px;
            line-height: 1.25;
            min-height: 36px;
            padding: 0 8px !important;
            text-align: center;
            white-space: normal;
          }
          .partner-listing-status-pill {
            align-self: flex-start;
            line-height: 1.25;
            max-width: 100%;
            white-space: normal;
          }
          .partner-bar-chart {
            gap: 8px !important;
            height: 178px !important;
          }
          .partner-camera-frame {
            min-height: 254px !important;
            border-radius: 15px !important;
          }
          .partner-action-row,
          .partner-scan-form {
            gap: 9px !important;
          }
          .partner-scan-form {
            grid-template-columns: 1fr !important;
          }
          .partner-action-row .partner-button,
          .partner-scan-form .partner-button,
          .partner-listing-actions .partner-button {
            width: 100%;
          }
          .partner-scan-result-summary {
            padding: 14px !important;
            gap: 9px 10px !important;
          }
          .partner-scan-result-code > div {
            font-size: 16px !important;
          }
          .partner-scan-result-title {
            font-size: 13px !important;
          }
          .partner-scan-info-row {
            grid-template-columns: minmax(76px, .66fr) minmax(0, 1.55fr) !important;
            gap: 10px !important;
            min-height: 42px !important;
          }
          .partner-scan-info-badge {
            min-height: 26px !important;
            padding: 0 10px !important;
          }
          .partner-filter-head {
            align-items: stretch !important;
            flex-direction: column;
          }
          .partner-filter-head .partner-section-heading {
            margin-bottom: 0 !important;
          }
          .partner-period-tabs,
          .partner-listing-tabs {
            flex-wrap: nowrap !important;
            overflow-x: auto;
            scrollbar-width: none;
            padding-bottom: 4px;
          }
          .partner-period-tabs::-webkit-scrollbar,
          .partner-listing-tabs::-webkit-scrollbar {
            display: none;
          }
          .partner-period-tabs button,
          .partner-listing-tabs button {
            flex: 0 0 auto;
          }
          .partner-settlement-summary,
          .partner-listing-grid,
          .partner-cast-profile-grid,
          .partner-hour-row,
          .partner-listing-toolbar,
          .partner-media-grid,
          .partner-store-scope-grid,
          .partner-settlement-filter-grid,
          .partner-bill-form-grid {
            gap: 10px !important;
          }
          .partner-settlement-filter-grid .partner-date-field {
            max-width: 100%;
            overflow: hidden;
            width: 100%;
          }
          .partner-date-field input[type="date"] {
            font-size: 14px !important;
            inline-size: 100% !important;
            max-inline-size: 100% !important;
            min-inline-size: 0 !important;
            overflow: hidden;
            padding-left: 10px !important;
            padding-right: 8px !important;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .partner-date-field input[type="date"]::-webkit-date-and-time-value {
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .partner-table-scroll {
            margin: 0 -16px -4px;
            padding: 0 16px 4px;
          }
          .partner-settlement-table-scroll {
            display: none !important;
          }
          .partner-settlement-mobile-list {
            display: grid;
            gap: 12px;
          }
          .partner-settlement-mobile-card {
            border: 1px solid ${colors.borderHair};
            border-radius: 16px;
            background: ${colors.surface2};
            box-shadow: 0 18px 42px -34px rgba(0,0,0,.78);
            color: ${colors.text};
            display: grid;
            gap: 10px;
            min-width: 0;
            padding: 13px;
          }
          .partner-settlement-mobile-head {
            align-items: center;
            display: flex;
            gap: 8px;
            justify-content: space-between;
            min-width: 0;
          }
          .partner-settlement-mobile-index {
            align-items: center;
            background: rgba(212,178,106,.16);
            border: 1px solid ${colors.borderGold22};
            border-radius: 999px;
            color: ${colors.goldBright};
            display: inline-flex;
            font-size: 11px;
            font-weight: 900;
            height: 26px;
            justify-content: center;
            min-width: 38px;
            padding: 0 9px;
          }
          .partner-settlement-mobile-code {
            color: ${colors.goldBright};
            font-size: 13px;
            font-weight: 900;
            line-height: 1.35;
            overflow-wrap: anywhere;
          }
          .partner-settlement-mobile-service {
            color: ${colors.text};
            font-size: 12.5px;
            font-weight: 800;
            line-height: 1.45;
            overflow-wrap: anywhere;
          }
          .partner-settlement-mobile-grid {
            display: grid;
            gap: 8px;
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .partner-settlement-mobile-grid span {
            background: rgba(255,255,255,.035);
            border: 1px solid ${colors.borderSoft};
            border-radius: 12px;
            display: grid;
            gap: 4px;
            min-width: 0;
            padding: 9px 10px;
          }
          .partner-settlement-mobile-grid small {
            color: ${colors.muted};
            font-size: 10px;
            font-weight: 800;
            line-height: 1.2;
          }
          .partner-settlement-mobile-grid b {
            color: ${colors.goldPale};
            font-size: 11.5px;
            font-weight: 900;
            line-height: 1.3;
            min-width: 0;
            overflow-wrap: anywhere;
          }
          .partner-settlement-mobile-empty {
            border: 1px solid ${colors.borderHair};
            border-radius: 16px;
            color: ${colors.text2};
            font-size: 13px;
            line-height: 1.5;
            padding: 16px 12px;
            text-align: center;
          }
          .partner-bill-table-scroll {
            display: none !important;
          }
          .partner-bill-mobile-list {
            display: grid;
            gap: 10px;
          }
          .partner-bill-mobile-card {
            width: 100%;
            min-width: 0;
            border: 1px solid ${colors.borderHair};
            border-radius: 14px;
            background: ${colors.surface2};
            color: ${colors.text};
            cursor: pointer;
            display: grid;
            gap: 10px;
            font-family: inherit;
            padding: 12px;
            text-align: left;
          }
          .partner-bill-mobile-card.active {
            border-color: ${colors.borderGold40};
            background: rgba(212, 178, 106, .12);
          }
          .partner-bill-mobile-head {
            align-items: center;
            display: grid;
            gap: 8px;
            grid-template-columns: auto minmax(0, 1fr) auto;
          }
          .partner-bill-mobile-index {
            align-items: center;
            background: rgba(212,178,106,.16);
            border: 1px solid ${colors.borderGold22};
            border-radius: 999px;
            color: ${colors.goldBright};
            display: inline-flex;
            font-size: 11px;
            font-weight: 900;
            height: 26px;
            justify-content: center;
            min-width: 34px;
            padding: 0 8px;
          }
          .partner-bill-mobile-code {
            color: ${colors.goldBright};
            font-size: 12px;
            font-weight: 900;
            line-height: 1.35;
            min-width: 0;
            overflow-wrap: anywhere;
          }
          .partner-bill-mobile-head .partner-status-pill {
            max-width: 112px;
            min-height: 24px !important;
            overflow: hidden;
            padding: 0 8px !important;
            text-overflow: ellipsis;
          }
          .partner-bill-mobile-store {
            color: ${colors.text};
            display: -webkit-box;
            font-size: 13px;
            font-weight: 900;
            line-height: 1.35;
            overflow: hidden;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
          }
          .partner-bill-mobile-grid {
            display: grid;
            gap: 8px;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          }
          .partner-bill-mobile-grid span {
            background: rgba(255,255,255,.035);
            border: 1px solid ${colors.borderSoft};
            border-radius: 12px;
            display: grid;
            gap: 4px;
            min-width: 0;
            padding: 9px 10px;
          }
          .partner-bill-mobile-grid small {
            color: ${colors.muted};
            font-size: 10px;
            font-weight: 800;
            line-height: 1.2;
          }
          .partner-bill-mobile-grid b {
            color: ${colors.goldPale};
            font-size: 12px;
            font-weight: 900;
            line-height: 1.3;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .partner-bill-mobile-booking {
            border-top: 1px solid ${colors.borderHair};
            color: ${colors.text2};
            font-size: 11.5px;
            font-weight: 700;
            line-height: 1.4;
            overflow-wrap: anywhere;
            padding-top: 10px;
          }
          .partner-bill-mobile-empty {
            border: 1px solid ${colors.borderHair};
            border-radius: 14px;
            color: ${colors.text2};
            font-size: 13px;
            padding: 16px 12px;
            text-align: center;
          }
          .partner-settlement-table {
            min-width: 760px !important;
          }
          .partner-listing-tabs {
            margin: 0 -4px 16px !important;
            padding-left: 4px;
            padding-right: 4px;
          }
          .partner-cast-table-wrap {
            display: none !important;
          }
          .partner-cast-mobile-list {
            display: grid;
            gap: 10px;
          }
          .partner-cast-pagination {
            align-items: stretch;
          }
          .partner-cast-pagination > div {
            width: 100%;
          }
          .partner-cast-pagination button {
            flex: 1 0 auto;
          }
          .partner-cast-mobile-card {
            border: 1px solid ${colors.borderHair};
            border-radius: 14px;
            background: ${colors.surface2};
            color: ${colors.text};
            display: grid;
            gap: 12px;
            min-width: 0;
            padding: 13px;
            text-align: left;
            width: 100%;
            font: inherit;
            cursor: pointer;
          }
          .partner-cast-mobile-card:focus-visible {
            outline: 2px solid ${colors.gold};
            outline-offset: 2px;
          }
          .partner-cast-mobile-head {
            display: grid;
            grid-template-columns: 46px minmax(0, 1fr) auto 20px;
            align-items: center;
            gap: 10px;
            min-width: 0;
          }
          .partner-cast-mobile-title {
            display: grid;
            gap: 3px;
            min-width: 0;
          }
          .partner-cast-mobile-index {
            color: ${colors.goldPale};
            font-size: 11px;
            font-weight: 900;
            line-height: 1.2;
          }
          .partner-cast-mobile-title strong {
            color: ${colors.text};
            display: block;
            font-size: 15px;
            font-weight: 900;
            line-height: 1.25;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .partner-cast-mobile-title small {
            color: ${colors.text2};
            display: block;
            font-size: 12px;
            line-height: 1.35;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .partner-cast-mobile-head .partner-status-pill {
            justify-self: end;
            max-width: 88px;
            overflow: hidden;
            padding: 0 8px !important;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .partner-cast-mobile-arrow {
            color: ${colors.gold};
            justify-self: end;
          }
          .partner-cast-mobile-details {
            display: grid;
            gap: 8px;
          }
          .partner-cast-mobile-details span {
            display: grid;
            grid-template-columns: 96px minmax(0, 1fr);
            gap: 10px;
            align-items: start;
            border-top: 1px solid ${colors.borderHair};
            padding-top: 8px;
          }
          .partner-cast-mobile-details small {
            color: ${colors.muted};
            font-size: 10.5px;
            font-weight: 900;
            line-height: 1.35;
          }
          .partner-cast-mobile-details b {
            color: ${colors.text2};
            font-size: 12px;
            font-weight: 800;
            line-height: 1.45;
            min-width: 0;
            overflow-wrap: anywhere;
          }
          .partner-staff-table-wrap {
            display: none !important;
          }
          .partner-staff-mobile-list {
            display: grid;
            gap: 10px;
          }
          .partner-staff-mobile-card {
            border: 1px solid ${colors.borderHair};
            border-radius: 14px;
            background: ${colors.surface2};
            color: ${colors.text};
            display: grid;
            gap: 12px;
            min-width: 0;
            padding: 13px;
          }
          .partner-staff-mobile-head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 10px;
            min-width: 0;
          }
          .partner-staff-mobile-head > div {
            min-width: 0;
          }
          .partner-staff-mobile-head strong {
            color: ${colors.text};
            display: block;
            font-size: 15px;
            font-weight: 900;
            line-height: 1.25;
            overflow-wrap: anywhere;
          }
          .partner-staff-mobile-head span {
            color: ${colors.text2};
            display: block;
            font-size: 12px;
            line-height: 1.35;
            margin-top: 4px;
            overflow-wrap: anywhere;
          }
          .partner-staff-mobile-status {
            border: 1px solid rgba(255,180,168,.24);
            border-radius: 999px;
            background: rgba(255,180,168,.08);
            color: ${colors.danger} !important;
            flex: 0 0 auto;
            font-size: 11px !important;
            font-weight: 900;
            min-height: 26px;
            padding: 4px 9px;
            white-space: nowrap;
          }
          .partner-staff-mobile-status.active {
            border-color: rgba(141,230,176,.26);
            background: rgba(141,230,176,.1);
            color: ${colors.success} !important;
          }
          .partner-staff-mobile-details {
            display: grid;
            gap: 9px;
            margin: 0;
          }
          .partner-staff-mobile-details > div {
            display: grid;
            grid-template-columns: 74px minmax(0, 1fr);
            gap: 10px;
            align-items: start;
          }
          .partner-staff-mobile-details dt {
            color: ${colors.muted};
            font-size: 11px;
            font-weight: 900;
            line-height: 1.35;
          }
          .partner-staff-mobile-details dd {
            color: ${colors.text2};
            font-size: 12px;
            line-height: 1.45;
            margin: 0;
            min-width: 0;
            overflow-wrap: anywhere;
          }
          .partner-staff-mobile-permissions {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }
          .partner-staff-mobile-permissions span {
            border: 1px solid ${colors.borderGold22};
            border-radius: 999px;
            background: rgba(212,178,106,.1);
            color: ${colors.goldPale};
            display: inline-flex;
            align-items: center;
            min-height: 24px;
            padding: 0 9px;
            font-size: 11px;
            font-weight: 800;
          }
          .partner-staff-mobile-delete {
            min-height: 38px;
            border-radius: 11px;
            border: 1px solid rgba(255,180,168,.3);
            background: rgba(255,180,168,.08);
            color: ${colors.danger};
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            font: inherit;
            font-size: 12px;
            font-weight: 900;
            cursor: pointer;
            width: 100%;
          }
          .partner-staff-mobile-empty {
            border: 1px dashed ${colors.borderGold32};
            border-radius: 14px;
            color: ${colors.text2};
            font-size: 13px;
            line-height: 1.5;
            padding: 16px 12px;
            text-align: center;
          }
          .partner-staff-mobile-skeleton {
            min-height: 16px;
            border-radius: 999px;
            background: rgba(255,255,255,.08);
          }
          .partner-staff-mobile-skeleton.short {
            width: 58%;
          }
          .partner-form-field input,
          .partner-form-field select,
          .partner-form-field textarea,
          .partner-scan-form input,
          .partner-quill-shell .ql-editor {
            font-size: 16px !important;
          }
          .partner-mobile-bottom-nav {
            height: calc(66px + env(safe-area-inset-bottom)) !important;
            box-sizing: border-box;
            max-width: 100vw;
            overflow: hidden;
            padding-bottom: env(safe-area-inset-bottom) !important;
            width: 100vw;
          }
          .partner-mobile-nav-btn {
            min-width: 0;
            padding: 0 2px;
          }
          .partner-mobile-nav-label {
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 9px !important;
            line-height: 1.1;
          }
        }
        @media (max-width: 360px) {
          .partner-metric-grid {
            grid-template-columns: 1fr !important;
          }
          .partner-metric-card {
            min-height: 0;
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
            height: '100dvh',
            minHeight: '100dvh',
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
              <div
                className="partner-notification-popover"
                style={{
                  display: isNotificationOpen ? 'block' : 'none',
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
                            padding: '12px 14px',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'start',
                            textAlign: 'left',
                            cursor: 'pointer',
                            marginTop: '4px',
                            position: 'relative',
                            boxShadow: notification.unread ? '0 4px 15px rgba(212,178,106,.05)' : undefined,
                          }}
                        >
                          <span
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '10px',
                              background: notification.unread
                                ? 'rgba(212,178,106,.12)'
                                : colors.surface3,
                              color: accent,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flex: '0 0 auto',
                            }}
                          >
                            <Icon size={15} />
                          </span>
                          <span style={{ minWidth: 0, flex: 1 }}>
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
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  color: accent,
                                  textTransform: 'uppercase',
                                  letterSpacing: '.5px',
                                }}
                              >
                                {notification.category}
                              </span>
                              {notification.unread ? (
                                <span
                                  style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: colors.neonPink,
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
