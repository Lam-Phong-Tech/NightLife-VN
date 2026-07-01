"use client";

import Link from 'next/link';
import {
  Bell,
  CalendarDays,
  Camera,
  CheckCircle2,
  Eye,
  FileClock,
  Home,
  ImagePlus,
  LogOut,
  QrCode,
  Save,
  Send,
  Settings,
  ShieldCheck,
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
import { ApiError, apiClient } from '@/lib/api/client';
import { clearAuthSession } from '@/lib/auth/session';

const colors = {
  bg: '#0c0c0f',
  surface1: 'rgba(255,255,255,.035)',
  surface2: 'rgba(255,255,255,.04)',
  surface3: 'rgba(255,255,255,.05)',
  navBg: 'rgba(8,8,11,.9)',
  borderSoft: 'rgba(255,255,255,.06)',
  borderHair: 'rgba(255,255,255,.08)',
  borderGold12: 'rgba(212,178,106,.18)',
  borderGold22: 'rgba(212,178,106,.22)',
  borderGold32: 'rgba(212,178,106,.32)',
  borderGold40: 'rgba(212,178,106,.4)',
  text: '#f3f0ea',
  text2: '#c5c0b6',
  muted: '#8c8679',
  onGold: '#241a0a',
  gold: '#d4b26a',
  goldBright: '#e3c27e',
  goldPale: '#f0dda8',
  goldGrad: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)',
  danger: '#ffb4a8',
  success: '#8de6b0',
  neonPink: '#e0729e',
};

type PartnerStore = {
  id: string;
  name: string;
  slug: string;
  status: string;
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
  store: { name: string };
};

type PartnerBill = {
  id: string;
  billNumber: string | null;
  status: string;
  totalVnd: number | null;
  discountVnd: number | null;
  submittedAt: string | null;
  store: { name: string };
  coupon?: { code: string; name: string } | null;
};

type PartnerScanIssue = {
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
    store?: { id: string; name: string; slug: string } | null;
  } | null;
};

type BarcodeDetectorResult = { rawValue?: string };
type BarcodeDetectorInstance = {
  detect(source: HTMLVideoElement): Promise<BarcodeDetectorResult[]>;
};
type BarcodeDetectorConstructor = new (options: { formats: string[] }) => BarcodeDetectorInstance;
type BarcodeDetectorWindow = Window & { BarcodeDetector?: BarcodeDetectorConstructor };
type PanelKey = 'overview' | 'scan' | 'settlement' | 'listing' | 'settings';
type ListingTabKey = 'store' | 'cast' | 'pricing' | 'media';
type PeriodKey = 'today' | 'seven' | 'thirty';

const offlineScanQueueKey = 'nightlife:offline-coupon-scans';
const signedQrTokenPattern = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

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
  return jsQR(imageData.data, width, height, { inversionAttempts: 'attemptBoth' })?.data.trim() ?? null;
};

const readOfflineScanQueue = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(offlineScanQueueKey);
    const parsed = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

const writeOfflineScanQueue = (items: string[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(offlineScanQueueKey, JSON.stringify(items));
};

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

const fallbackSettlementRows = [
  {
    code: 'NL-HH30-7K2A',
    service: 'Happy Hour -30% · Bàn thường',
    time: '21:42 · hôm nay',
    amount: 720000,
    status: 'Đã ghi log',
  },
  {
    code: 'NL-VIP21-9X4B',
    service: 'Combo VIP 2+1 · Phòng VIP',
    time: '20:15 · hôm nay',
    amount: 500000,
    status: 'Chờ đối soát',
  },
  {
    code: 'NL-MB08-5K2E',
    service: 'Member -8% · Phòng VIP',
    time: '21:05 · hôm qua',
    amount: 480000,
    status: 'Đã ghi log',
  },
];

const chartBars = [
  { label: 'T2', value: 45 },
  { label: 'T3', value: 62 },
  { label: 'T4', value: 48 },
  { label: 'T5', value: 78 },
  { label: 'T6', value: 100 },
  { label: 'T7', value: 92 },
  { label: 'CN', value: 60 },
];

const listingFields = [
  { label: 'Tên quán', value: 'Vietyoru Lounge' },
  { label: 'Loại hình', value: 'Lounge · Bar · Karaoke' },
  { label: 'Khu vực', value: 'Quận 1, TP. Hồ Chí Minh' },
  { label: 'Địa chỉ', value: '12 Nguyễn Huệ, Bến Nghé' },
  { label: 'Giờ mở cửa', value: '18:00 - 02:00' },
  { label: 'Khoảng giá', value: '500.000đ - 3.000.000đ' },
];

const contentTabs: { key: ListingTabKey; label: string }[] = [
  { key: 'store', label: 'Thông tin quán' },
  { key: 'cast', label: 'Cast' },
  { key: 'pricing', label: 'Bảng giá' },
  { key: 'media', label: 'Ảnh / Video' },
];

const navItems: { key: PanelKey; label: string; sub: string; icon: LucideIcon }[] = [
  { key: 'overview', label: 'Tổng quan', sub: 'Dashboard', icon: Home },
  { key: 'scan', label: 'Quét mã QR', sub: 'Redeem coupon', icon: QrCode },
  { key: 'settlement', label: 'Đối soát', sub: 'Usage log', icon: FileClock },
  { key: 'listing', label: 'Đăng thông tin', sub: 'Store CMS', icon: Camera },
  { key: 'settings', label: 'Cài đặt', sub: 'Quyền truy cập', icon: Settings },
];

const periodItems: { key: PeriodKey; label: string }[] = [
  { key: 'today', label: 'Hôm nay' },
  { key: 'seven', label: '7 ngày' },
  { key: 'thirty', label: '30 ngày' },
];

const panelTitles: Record<PanelKey, { eyebrow: string; title: string }> = {
  overview: { eyebrow: 'PARTNER DASHBOARD', title: 'Tổng quan đối tác' },
  scan: { eyebrow: 'STORE-SCOPED REDEEM', title: 'Quét mã giảm giá' },
  settlement: { eyebrow: 'COUPON USAGE LOG', title: 'Đối soát coupon' },
  listing: { eyebrow: 'STORE CONTENT', title: 'Đăng thông tin quán' },
  settings: { eyebrow: 'ACCESS CONTROL', title: 'Cài đặt đối tác' },
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
  borderRadius: '11px',
  border: `1px solid ${colors.borderGold22}`,
  background: colors.surface2,
  color: colors.text,
  padding: '0 12px',
  outline: 'none',
  font: 'inherit',
};

function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
      <div>
        <h2 style={{ margin: 0, color: colors.text, fontSize: '21px', fontWeight: 600 }}>{title}</h2>
        <div style={{ marginTop: '4px', fontSize: '9px', fontWeight: 600, letterSpacing: '1.6px', color: colors.muted }}>
          {eyebrow}
        </div>
      </div>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(212,178,106,.45), transparent)' }} />
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
    tone === 'success' ? colors.success : tone === 'danger' ? colors.danger : tone === 'gold' ? colors.goldBright : colors.text2;

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
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
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
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
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
      }}
    >
      {children}
    </button>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: 'grid', gap: '7px', color: colors.text2, fontSize: '12px', fontWeight: 700 }}>
      {label}
      {children}
    </label>
  );
}

export default function PartnerPage() {
  const searchParams = useSearchParams();
  const [stores, setStores] = useState<PartnerStore[]>([]);
  const [coupons, setCoupons] = useState<PartnerCoupon[]>([]);
  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [bills, setBills] = useState<PartnerBill[]>([]);
  const [activePanel, setActivePanel] = useState<PanelKey>('overview');
  const [listingTab, setListingTab] = useState<ListingTabKey>('store');
  const [period, setPeriod] = useState<PeriodKey>('seven');
  const [statusMessage, setStatusMessage] = useState('Đang tải dữ liệu phân quyền theo store...');
  const [scanPayload, setScanPayload] = useState('');
  const [scanIssue, setScanIssue] = useState<PartnerScanIssue | null>(null);
  const [scanMessage, setScanMessage] = useState('Sẵn sàng quét QR, dán link hoặc nhập mã coupon.');
  const [isScanning, setIsScanning] = useState(false);
  const [isConfirmingScan, setIsConfirmingScan] = useState(false);
  const [offlineScanQueue, setOfflineScanQueue] = useState<string[]>(() => readOfflineScanQueue());
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'starting' | 'active' | 'unsupported' | 'error'>('idle');
  const [cameraMessage, setCameraMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const cameraLoopRef = useRef<number | null>(null);
  const lastCameraPayloadRef = useRef('');

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
      const next = current.includes(payload) ? current : [...current, payload];
      writeOfflineScanQueue(next);
      return next;
    });
    setScanMessage('Đang offline, đã lưu mã vào hàng đợi để gửi lại.');
  }, []);

  const scanCouponPayload = useCallback(
    async (payload: string, options: { fromQueue?: boolean } = {}) => {
      const trimmedPayload = payload.trim();
      if (!trimmedPayload) {
        setScanMessage('Cần scanToken, link QR hoặc mã coupon để kiểm tra.');
        return false;
      }

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        queueOfflineScan(trimmedPayload);
        return false;
      }

      setIsScanning(true);
      setScanMessage(options.fromQueue ? 'Đang gửi lại mã offline...' : 'Đang xác thực mã tại quán...');

      try {
        const issue = isSignedQrPayload(trimmedPayload)
          ? await apiClient<PartnerScanIssue>('/partner/coupon-issues/scan', {
              data: {
                payload: trimmedPayload,
                offline: Boolean(options.fromQueue),
              },
            })
          : await apiClient<PartnerScanIssue>(
              `/partner/coupon-issues/${encodeURIComponent(trimmedPayload)}/scan`,
              { data: {} },
            );

        setScanIssue(issue);
        setScanMessage(`${issue.statusLabel ?? issue.status} - hợp lệ tại ${issue.coupon?.store?.name ?? 'quán được phân quyền'}.`);
        return true;
      } catch (error) {
        if (!(error instanceof ApiError) && typeof navigator !== 'undefined' && !navigator.onLine) {
          queueOfflineScan(trimmedPayload);
          return false;
        }

        setScanMessage(error instanceof ApiError ? error.message : 'Không kiểm tra được mã. Thử lại sau.');
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
      setCameraMessage('Trình duyệt hiện tại chưa cho phép mở camera. Vẫn có thể dán link hoặc nhập mã.');
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
            void scanCouponPayload(rawValue).then((ok) => {
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
      setCameraMessage('Không mở được camera. Kiểm tra quyền camera rồi thử lại, hoặc nhập mã thủ công.');
    }
  }, [scanCouponPayload, stopCameraScan]);

  const replayOfflineScans = useCallback(async () => {
    const queuedItems = readOfflineScanQueue();
    if (!queuedItems.length) {
      setOfflineScanQueue([]);
      setScanMessage('Không có mã offline nào đang chờ.');
      return;
    }

    const remaining: string[] = [];
    for (const payload of queuedItems) {
      const sent = await scanCouponPayload(payload, { fromQueue: true });
      if (!sent) {
        remaining.push(payload);
      }
    }

    writeOfflineScanQueue(remaining);
    setOfflineScanQueue(remaining);
    if (!remaining.length) {
      setScanMessage('Đã gửi hết mã offline đang chờ.');
    }
  }, [scanCouponPayload]);

  const confirmScannedIssue = async () => {
    if (!scanIssue) {
      return;
    }

    setIsConfirmingScan(true);
    setScanMessage('Đang xác nhận sử dụng coupon...');
    try {
      const nextIssue = await apiClient<PartnerScanIssue>(
        `/partner/coupon-issues/${encodeURIComponent(scanIssue.id)}/confirm-check-in`,
        { data: {} },
      );
      setScanIssue(nextIssue);
      if (scanIssue.status !== 'USED' && nextIssue.status === 'USED' && nextIssue.coupon?.id) {
        setCoupons((current) =>
          current.map((coupon) =>
            coupon.id === nextIssue.coupon?.id
              ? { ...coupon, usedCount: coupon.usedCount + 1 }
              : coupon,
          ),
        );
      }
      setScanMessage(`${nextIssue.statusLabel ?? nextIssue.status} - mã này không thể dùng lại.`);
    } catch (error) {
      setScanMessage(error instanceof ApiError ? error.message : 'Không xác nhận được coupon.');
    } finally {
      setIsConfirmingScan(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadPartnerData = async () => {
      try {
        const [storeData, couponData, bookingData, billData] = await Promise.all([
          apiClient<PartnerStore[]>('/partner/stores'),
          apiClient<PartnerCoupon[]>('/partner/coupons'),
          apiClient<PartnerBooking[]>('/partner/bookings'),
          apiClient<PartnerBill[]>('/partner/bills'),
        ]);

        if (!isMounted) return;

        setStores(storeData);
        setCoupons(couponData);
        setBookings(bookingData);
        setBills(billData);
        setStatusMessage('Dữ liệu đang hiển thị theo phạm vi quán của tài khoản Partner.');
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
  }, []);

  useEffect(() => {
    return () => {
      if (cameraLoopRef.current) {
        window.clearTimeout(cameraLoopRef.current);
      }
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    const token = searchParams.get('scanToken') ?? searchParams.get('token');
    if (!token) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActivePanel('scan');
      setScanPayload(token);
      void scanCouponPayload(token);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [scanCouponPayload, searchParams]);

  const storeName = stores[0]?.name ?? 'Vietyoru Partner';
  const activeStoreStatus = stores[0]?.status ?? 'READY';
  const usedCouponCount = coupons.reduce((sum, item) => sum + item.usedCount, 0);
  const activeCoupons = coupons.filter((coupon) => coupon.status === 'ACTIVE').length;
  const totalDiscount = bills.reduce((sum, bill) => sum + (bill.discountVnd ?? 0), 0);
  const completedBookings = bookings.filter((booking) => ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'].includes(booking.status)).length;
  const estimatedViews = stores.length ? Math.max(usedCouponCount * 24 + bookings.length * 16 + coupons.length * 120, 186) : 0;
  const scannedCustomerLabel = scanIssue?.customer?.label ?? 'Khách đã ẩn';
  const scannedExpiryLabel = scanIssue?.expiresAt ? new Date(scanIssue.expiresAt).toLocaleString('vi-VN') : 'Không giới hạn';
  const scannedBookingLabel = scanIssue?.booking?.scheduledAt
    ? `Booking ${scanIssue.booking.status} · ${new Date(scanIssue.booking.scheduledAt).toLocaleString('vi-VN')}`
    : scanIssue?.booking?.status
      ? `Booking ${scanIssue.booking.status}`
      : 'Không kèm dữ liệu booking chi tiết';
  const canConfirmScan = scanIssue?.status === 'ISSUED';
  const cameraActive = cameraStatus === 'active' || cameraStatus === 'starting';

  const settlementRows = bills.length
    ? bills.slice(0, 8).map((bill) => ({
        code: bill.billNumber ?? bill.id.slice(0, 8),
        service: `${bill.coupon?.name ?? 'Hóa đơn'} · ${bill.store.name}`,
        time: formatDateTime(bill.submittedAt),
        amount: bill.discountVnd ?? bill.totalVnd ?? 0,
        status: bill.status,
      }))
    : fallbackSettlementRows;

  const metrics = useMemo(
    () => [
      {
        label: 'Đặt chỗ tại quán',
        value: String(bookings.length),
        sub: `${completedBookings} lượt đã xác nhận`,
        trend: '+12% tuần này',
        icon: TicketCheck,
      },
      {
        label: 'Lượt xem trang',
        value: estimatedViews.toLocaleString('vi-VN'),
        sub: 'Ước tính từ hoạt động partner',
        trend: stores.length ? '+8% so với kỳ trước' : 'Chờ dữ liệu',
        icon: Eye,
      },
      {
        label: 'Số khách đến',
        value: String(usedCouponCount),
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
    [activeCoupons, bills.length, bookings.length, completedBookings, coupons.length, estimatedViews, stores.length, totalDiscount, usedCouponCount],
  );

  const rejectScanResult = () => {
    setScanIssue(null);
    setScanPayload('');
    setScanMessage('Đã hủy kết quả quét. Partner có thể kiểm tra mã khác.');
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
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
              <div style={{ marginTop: '16px', color: colors.muted, fontSize: '12px', fontWeight: 700 }}>{metric.label}</div>
              <div style={{ marginTop: '8px', color: colors.text, fontSize: '32px', fontWeight: 800, lineHeight: 1 }}>{metric.value}</div>
              <div style={{ marginTop: '8px', color: colors.goldBright, fontSize: '12px' }}>{metric.sub}</div>
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
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px', height: '235px' }}>
            {chartBars.map((bar, index) => (
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
                    height: `${bar.value}%`,
                    borderRadius: '8px 8px 0 0',
                    background: index === 4 ? colors.goldGrad : 'rgba(212,178,106,.22)',
                    boxShadow: index === 4 ? '0 14px 26px -18px rgba(212,178,106,.85)' : 'none',
                  }}
                />
                <span style={{ color: colors.muted, fontSize: '11px' }}>{bar.label}</span>
              </div>
            ))}
          </div>
        </PanelCard>

        <PanelCard>
          <SectionHeading eyebrow="RECENT REDEMPTIONS" title="Đối soát gần đây" />
          <div style={{ display: 'grid', gap: '10px' }}>
            {settlementRows.slice(0, 4).map((row) => (
              <div key={row.code} style={{ ...softCardStyle, padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }}>
                  <span style={{ color: colors.gold, fontSize: '12px', fontWeight: 800 }}>{row.code}</span>
                  <span style={{ color: colors.goldBright, fontSize: '12px', fontWeight: 800 }}>-{moneyVnd(row.amount)}</span>
                </div>
                <div style={{ marginTop: '6px', color: colors.text, fontSize: '12.5px', lineHeight: 1.45 }}>{row.service}</div>
                <div style={{ marginTop: '5px', display: 'flex', justifyContent: 'space-between', gap: '8px', color: colors.muted, fontSize: '11px' }}>
                  <span>{row.time}</span>
                  <span>Khách đã ẩn</span>
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>

      <PanelCard style={{ marginTop: '14px', background: 'rgba(212,178,106,.08)' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <ShieldCheck size={20} color={colors.gold} />
          <div style={{ color: colors.text2, fontSize: '12px', lineHeight: 1.65 }}>
            Đối tác chỉ xem dữ liệu tổng hợp của riêng quán. Bảng đối soát không hiển thị hồ sơ khách chi tiết, chỉ giữ mã giao dịch và usage log phục vụ xác nhận coupon.
            <br />
            {statusMessage}
          </div>
        </div>
      </PanelCard>
    </>
  );

  const renderScanPanel = () => (
    <div className="partner-scan-grid">
      <PanelCard>
        <SectionHeading
          eyebrow="SCAN OR ENTER CODE"
          title="Quét / nhập mã QR"
          action={<StatusPill tone={offlineScanQueue.length ? 'gold' : 'neutral'}>{offlineScanQueue.length} offline</StatusPill>}
        />

        <div
          style={{
            minHeight: '320px',
            borderRadius: '16px',
            border: `1px solid ${cameraStatus === 'active' ? colors.borderGold40 : colors.borderGold22}`,
            background:
              cameraActive
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
              <div style={{ color: colors.text, fontSize: '15px', fontWeight: 800 }}>Đưa QR vào khung xác thực tại quán</div>
              <div style={{ marginTop: '8px', color: colors.muted, fontSize: '12px' }}>Có thể dán link hoặc nhập mã thủ công ở bên dưới.</div>
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
          <PrimaryButton disabled={cameraStatus === 'starting'} onClick={cameraActive ? stopCameraScan : () => void startCameraScan()}>
            <Camera size={16} />
            {cameraStatus === 'active' ? 'Tắt camera' : cameraStatus === 'starting' ? 'Đang mở' : 'Mở camera'}
          </PrimaryButton>
          <GhostButton disabled={isScanning || !offlineScanQueue.length} onClick={() => void replayOfflineScans()}>
            <Upload size={16} />
            Gửi offline
          </GhostButton>
        </div>

        {cameraMessage ? (
          <div
            style={{
              marginTop: '12px',
              color: cameraStatus === 'error' || cameraStatus === 'unsupported' ? colors.danger : colors.goldBright,
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
          style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: '10px' }}
        >
          <input
            value={scanPayload}
            onChange={(event) => setScanPayload(event.target.value)}
            placeholder="Dán scanToken / link QR hoặc nhập mã coupon"
            style={inputStyle}
          />
          <PrimaryButton disabled={isScanning} type="submit">
            <QrCode size={16} />
            {isScanning ? 'Đang kiểm tra' : 'Kiểm tra mã'}
          </PrimaryButton>
        </form>

        <div style={{ marginTop: '12px', color: colors.text2, fontSize: '12px', lineHeight: 1.6 }}>{scanMessage}</div>
      </PanelCard>

      <PanelCard>
        <SectionHeading eyebrow="VALIDATION RESULT" title="Kết quả xác thực" />
        {scanIssue ? (
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ ...softCardStyle, padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: colors.gold, fontSize: '18px', fontWeight: 900 }}>{scanIssue.code}</div>
                  <div style={{ marginTop: '6px', color: colors.text, fontSize: '14px', fontWeight: 800 }}>
                    {scanIssue.coupon?.name ?? 'Coupon'} · {scanIssue.coupon?.store?.name ?? storeName}
                  </div>
                </div>
                <StatusPill tone={scanIssue.status === 'ISSUED' ? 'success' : 'neutral'}>{scanIssue.statusLabel ?? scanIssue.status}</StatusPill>
              </div>
            </div>

            {[
              ['Quán áp dụng', scanIssue.coupon?.store?.name ?? storeName],
              ['Trạng thái', scanIssue.statusLabel ?? scanIssue.status],
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
                <span style={{ color: colors.text, textAlign: 'right', fontWeight: 700 }}>{value}</span>
              </div>
            ))}

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
              <PrimaryButton disabled={!canConfirmScan || isConfirmingScan} onClick={confirmScannedIssue}>
                <CheckCircle2 size={16} />
                {scanIssue.status === 'USED' ? 'Đã sử dụng' : isConfirmingScan ? 'Đang xác nhận' : 'Xác nhận USED'}
              </PrimaryButton>
              <GhostButton onClick={rejectScanResult}>
                <XCircle size={16} />
                Từ chối
              </GhostButton>
            </div>
          </div>
        ) : (
          <div style={{ ...softCardStyle, padding: '18px', color: colors.text2, fontSize: '13px', lineHeight: 1.7 }}>
            Chưa có mã nào được kiểm tra trong phiên này. Khi partner quét QR, màn này chỉ hiển thị dữ liệu cần để xác nhận: mã, quán áp dụng, hạn dùng, trạng thái và nhãn khách đã ẩn.
          </div>
        )}
      </PanelCard>
    </div>
  );

  const renderSettlementPanel = () => (
    <>
      <PanelCard style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
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
            ['Tổng giảm giá', totalDiscount ? moneyVnd(totalDiscount) : moneyVnd(fallbackSettlementRows.reduce((sum, row) => sum + row.amount, 0)), 'Theo bill trong scope'],
            ['Bill chờ soát', String(bills.length), 'Không lộ dữ liệu khách chi tiết'],
          ].map(([label, value, sub]) => (
            <div key={label} style={{ ...softCardStyle, padding: '15px' }}>
              <div style={{ color: colors.muted, fontSize: '12px', fontWeight: 700 }}>{label}</div>
              <div style={{ marginTop: '8px', color: colors.goldBright, fontSize: '24px', fontWeight: 900 }}>{value}</div>
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

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
            <thead>
              <tr>
                {['Mã giao dịch', 'Dịch vụ / Coupon', 'Thời gian', 'Khách', 'Giảm giá', 'Trạng thái'].map((heading) => (
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
              {settlementRows.map((row) => (
                <tr key={row.code}>
                  <td style={{ padding: '14px 12px', color: colors.gold, fontSize: '12px', fontWeight: 900, borderBottom: `1px solid ${colors.borderHair}` }}>
                    {row.code}
                  </td>
                  <td style={{ padding: '14px 12px', color: colors.text, fontSize: '12.5px', borderBottom: `1px solid ${colors.borderHair}` }}>
                    {row.service}
                  </td>
                  <td style={{ padding: '14px 12px', color: colors.text2, fontSize: '12px', borderBottom: `1px solid ${colors.borderHair}` }}>
                    {row.time}
                  </td>
                  <td style={{ padding: '14px 12px', color: colors.muted, fontSize: '12px', borderBottom: `1px solid ${colors.borderHair}` }}>
                    Đã ẩn
                  </td>
                  <td style={{ padding: '14px 12px', color: colors.goldBright, fontSize: '12px', fontWeight: 900, borderBottom: `1px solid ${colors.borderHair}` }}>
                    -{moneyVnd(row.amount)}
                  </td>
                  <td style={{ padding: '14px 12px', borderBottom: `1px solid ${colors.borderHair}` }}>
                    <StatusPill tone="gold">{row.status}</StatusPill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </>
  );

  const renderListingTab = () => {
    if (listingTab === 'cast') {
      return (
        <div className="partner-listing-grid">
          {['Minh Anh', 'Yuki', 'Linh Chi'].map((name, index) => (
            <div key={name} style={{ ...softCardStyle, padding: '14px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span
                style={{
                  width: '58px',
                  height: '58px',
                  borderRadius: '14px',
                  border: `1px solid ${index === 0 ? colors.borderGold40 : colors.borderGold12}`,
                  background:
                    "linear-gradient(180deg,rgba(12,12,15,.08),rgba(12,12,15,.65)), url('https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=70') center/cover",
                }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ color: colors.text, fontSize: '14px', fontWeight: 800 }}>{name}</div>
                <div style={{ marginTop: '4px', color: colors.muted, fontSize: '12px' }}>{index === 0 ? 'Đang duyệt hồ sơ nổi bật' : 'Hiển thị trong trang quán'}</div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (listingTab === 'pricing') {
      return (
        <div style={{ display: 'grid', gap: '10px' }}>
          {[
            ['Bàn thường', '500.000đ - 1.200.000đ', 'Có thể gắn coupon Happy Hour'],
            ['Phòng VIP', '2.500.000đ - 6.000.000đ', 'Ưu tiên khách VIP'],
            ['Combo sinh nhật', '3.000.000đ+', 'Cần duyệt nội dung trước khi đăng'],
          ].map(([label, value, sub]) => (
            <div key={label} style={{ ...softCardStyle, padding: '14px', display: 'flex', justifyContent: 'space-between', gap: '14px' }}>
              <div>
                <div style={{ color: colors.text, fontSize: '13.5px', fontWeight: 800 }}>{label}</div>
                <div style={{ marginTop: '4px', color: colors.muted, fontSize: '12px' }}>{sub}</div>
              </div>
              <div style={{ color: colors.goldBright, fontSize: '13px', fontWeight: 900, whiteSpace: 'nowrap' }}>{value}</div>
            </div>
          ))}
        </div>
      );
    }

    if (listingTab === 'media') {
      return (
        <div className="partner-media-grid">
          {[1, 2, 3, 4].map((item) => (
            <button
              key={item}
              type="button"
              style={{
                minHeight: '132px',
                borderRadius: '14px',
                border: `1px dashed ${colors.borderGold32}`,
                background: item === 1
                  ? "linear-gradient(180deg,rgba(12,12,15,.08),rgba(12,12,15,.75)), url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=500&q=70') center/cover"
                  : colors.surface2,
                color: item === 1 ? colors.goldPale : colors.gold,
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
              }}
            >
              <span style={{ display: 'grid', gap: '8px', justifyItems: 'center', fontSize: '12px', fontWeight: 800 }}>
                <ImagePlus size={22} />
                {item === 1 ? 'Ảnh cover' : 'Thêm ảnh'}
              </span>
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className="partner-listing-grid">
        {listingFields.map((field) => (
          <FormField key={field.label} label={field.label}>
            <input defaultValue={field.value} style={inputStyle} />
          </FormField>
        ))}
        <FormField label="Mô tả ngắn">
          <textarea
            defaultValue="Không gian lounge cao cấp, phù hợp đặt bàn tối và sự kiện riêng. Nội dung gửi duyệt trước khi hiển thị công khai."
            style={{ ...inputStyle, minHeight: '104px', resize: 'vertical', padding: '12px' }}
          />
        </FormField>
      </div>
    );
  };

  const renderListingPanel = () => (
    <PanelCard>
      <SectionHeading
        eyebrow="DRAFT & APPROVAL"
        title="Thông tin hiển thị trên trang quán"
        action={<StatusPill tone="gold">Bản nháp chờ duyệt</StatusPill>}
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
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {renderListingTab()}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginTop: '18px' }}>
        <GhostButton>
          <Save size={16} />
          Lưu nháp
        </GhostButton>
        <PrimaryButton>
          <Send size={16} />
          Gửi duyệt
        </PrimaryButton>
      </div>
    </PanelCard>
  );

  const renderSettingsPanel = () => (
    <div className="partner-settings-grid">
      <PanelCard>
        <SectionHeading eyebrow="STORE ACCESS" title="Quán trong phạm vi" />
        <div style={{ display: 'grid', gap: '10px' }}>
          {(stores.length ? stores : [{ id: 'fallback-store', name: storeName, slug: 'partner-store', status: activeStoreStatus }]).map((store) => (
            <div key={store.id} style={{ ...softCardStyle, padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ color: colors.text, fontSize: '14px', fontWeight: 800 }}>{store.name}</div>
                <div style={{ marginTop: '4px', color: colors.muted, fontSize: '12px' }}>/{store.slug}</div>
              </div>
              <StatusPill tone="gold">{store.status}</StatusPill>
            </div>
          ))}
        </div>
      </PanelCard>

      <PanelCard>
        <SectionHeading eyebrow="PRIVACY" title="Quy tắc dữ liệu" />
        <div style={{ display: 'grid', gap: '10px' }}>
          {[
            'Partner chỉ thấy dữ liệu theo quán được cấp quyền.',
            'Coupon scan kiểm tra đúng quán, còn hạn và chưa USED trước khi xác nhận.',
            'Usage log được ghi khi mã chuyển USED.',
            'Thông tin khách chi tiết không hiển thị trên portal partner.',
          ].map((item) => (
            <div key={item} style={{ display: 'flex', gap: '10px', color: colors.text2, fontSize: '12.5px', lineHeight: 1.6 }}>
              <CheckCircle2 size={16} color={colors.gold} style={{ marginTop: '2px', flex: '0 0 auto' }} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </PanelCard>
    </div>
  );

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
    if (activePanel === 'settings') {
      return renderSettingsPanel();
    }
    return renderOverviewPanel();
  };

  return (
    <main style={{ minHeight: '100vh', background: colors.bg, color: colors.text, fontFamily: 'var(--nl-font-sans)' }}>
      <style>{`
        .partner-shell {
          display: grid;
          grid-template-columns: 252px minmax(0, 1fr);
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
        .partner-settings-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.28fr) minmax(340px, .72fr);
          gap: 14px;
          margin-top: 14px;
        }
        .partner-settlement-summary,
        .partner-listing-grid,
        .partner-media-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        .partner-media-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        @media (max-width: 1180px) {
          .partner-metric-grid,
          .partner-settlement-summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .partner-overview-grid,
          .partner-scan-grid,
          .partner-settings-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 860px) {
          .partner-shell {
            grid-template-columns: 1fr;
          }
          .partner-sidebar {
            position: static !important;
            min-height: auto !important;
            border-right: 0 !important;
            border-bottom: 1px solid ${colors.borderGold12};
          }
          .partner-nav {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            display: grid !important;
          }
          .partner-content {
            padding: 20px 18px 28px;
          }
          .partner-header {
            padding: 16px 18px !important;
            min-height: auto !important;
            align-items: flex-start !important;
            flex-direction: column !important;
          }
          .partner-metric-grid,
          .partner-settlement-summary,
          .partner-listing-grid,
          .partner-media-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="partner-shell">
        <aside
          className="partner-sidebar"
          style={{
            position: 'sticky',
            top: 0,
            alignSelf: 'start',
            minHeight: '100vh',
            borderRight: `1px solid ${colors.borderGold12}`,
            background: colors.navBg,
            padding: '22px 16px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Link href="/" style={{ display: 'inline-flex', flexDirection: 'column', textDecoration: 'none', margin: '0 6px 26px' }}>
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
            <span style={{ marginTop: '4px', fontSize: '8.5px', letterSpacing: '3.2px', color: colors.muted }}>
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
                    <span style={{ display: 'block', marginTop: '2px', color: active ? 'rgba(36,26,10,.72)' : colors.muted, fontSize: '10.5px' }}>
                      {item.sub}
                    </span>
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
              <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {storeName}
              </span>
              <span style={{ display: 'block', marginTop: '2px', fontSize: '11px', color: colors.muted }}>Đối tác đang hoạt động</span>
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
              background: 'rgba(12,12,15,.72)',
              backdropFilter: 'blur(14px)',
            }}
          >
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.7px', color: colors.gold }}>
                {panelTitles[activePanel].eyebrow}
              </div>
              <h1 style={{ margin: '5px 0 0', fontSize: '24px', fontWeight: 700 }}>{panelTitles[activePanel].title}</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span
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
                  position: 'relative',
                }}
                aria-label="Thông báo"
              >
                <Bell size={17} />
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '8px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: colors.neonPink,
                  }}
                />
              </button>
              <button
                type="button"
                onClick={logout}
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
                Đăng xuất
              </button>
            </div>
          </header>

          <div className="partner-content">
            <PanelCard
              style={{
                marginBottom: '14px',
                padding: '16px 18px',
                background:
                  "linear-gradient(90deg,rgba(212,178,106,.13),rgba(255,255,255,.025)), linear-gradient(180deg,rgba(12,12,15,.18),rgba(12,12,15,.72)), url('https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1400&q=72') center/cover",
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ color: colors.gold, fontSize: '10px', fontWeight: 800, letterSpacing: '1.6px' }}>LIVE STORE SCOPE</div>
                  <div style={{ marginTop: '6px', color: colors.text, fontSize: '18px', fontWeight: 800 }}>{storeName}</div>
                  <div style={{ marginTop: '5px', color: colors.text2, fontSize: '12px' }}>
                    Dashboard, quét QR, đối soát và đăng tin theo cấu trúc wireframe partner.
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
      </div>
    </main>
  );
}
