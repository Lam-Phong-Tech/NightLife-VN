"use client";

import Link from 'next/link';
import { BarChart3, Bell, Camera, CheckCircle2, FileClock, Home, LogOut, QrCode, TicketCheck, UsersRound } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError, apiClient } from '@/lib/api/client';
import { clearAuthSession } from '@/lib/auth/session';

const colors = {
  bg: '#0c0c0f',
  surface1: 'rgba(255,255,255,.035)',
  surface2: 'rgba(255,255,255,.04)',
  surface3: 'rgba(255,255,255,.05)',
  navBg: 'rgba(8,8,11,.9)',
  borderSoft: 'rgba(255,255,255,.06)',
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
  goldGrad: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)',
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
  user?: { id: string; displayName?: string | null; tier?: string | null } | null;
  guest?: { id: string; displayName?: string | null } | null;
  coupon?: {
    id: string;
    code: string;
    name: string;
    store?: { id: string; name: string; slug: string } | null;
  } | null;
};

const offlineScanQueueKey = 'nightlife:offline-coupon-scans';

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

const rows = [
  ['NL-HH30-7K2A', 'Happy Hour -30% · Bàn thường', '21:42 · hôm nay', '-720.000đ'],
  ['NL-VIP21-9X4B', 'Combo VIP 2+1 · Phòng VIP', '20:15 · hôm nay', '-500.000đ'],
  ['NL-MB08-5K2E', 'Member -8% · Phòng VIP', '21:05 · hôm qua', '-480.000đ'],
];

export default function PartnerPage() {
  const searchParams = useSearchParams();
  const [stores, setStores] = useState<PartnerStore[]>([]);
  const [coupons, setCoupons] = useState<PartnerCoupon[]>([]);
  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [bills, setBills] = useState<PartnerBill[]>([]);
  const [statusMessage, setStatusMessage] = useState('Dang tai du lieu phan quyen theo store...');
  const [scanPayload, setScanPayload] = useState('');
  const [scanIssue, setScanIssue] = useState<PartnerScanIssue | null>(null);
  const [scanMessage, setScanMessage] = useState('San sang quet signed QR hoac deep link.');
  const [isScanning, setIsScanning] = useState(false);
  const [isConfirmingScan, setIsConfirmingScan] = useState(false);
  const [offlineScanQueue, setOfflineScanQueue] = useState<string[]>([]);

  const queueOfflineScan = useCallback((payload: string) => {
    setOfflineScanQueue((current) => {
      const next = current.includes(payload) ? current : [...current, payload];
      writeOfflineScanQueue(next);
      return next;
    });
    setScanMessage('Dang offline, da luu QR vao hang doi de gui lai.');
  }, []);

  const scanCouponPayload = useCallback(
    async (payload: string, options: { fromQueue?: boolean } = {}) => {
      const trimmedPayload = payload.trim();
      if (!trimmedPayload) {
        setScanMessage('Can token hoac URL QR de quet.');
        return false;
      }

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        queueOfflineScan(trimmedPayload);
        return false;
      }

      setIsScanning(true);
      setScanMessage(options.fromQueue ? 'Dang gui lai QR offline...' : 'Dang xac thuc QR...');

      try {
        const issue = await apiClient<PartnerScanIssue>('/partner/coupon-issues/scan', {
          data: {
            payload: trimmedPayload,
            offline: Boolean(options.fromQueue),
          },
        });

        setScanIssue(issue);
        setScanMessage(`${issue.statusLabel ?? issue.status} - ${issue.code}`);
        return true;
      } catch (error) {
        if (!(error instanceof ApiError) && typeof navigator !== 'undefined' && !navigator.onLine) {
          queueOfflineScan(trimmedPayload);
          return false;
        }

        setScanMessage(error instanceof ApiError ? error.message : 'Khong quet duoc QR. Thu lai sau.');
        return false;
      } finally {
        setIsScanning(false);
      }
    },
    [queueOfflineScan],
  );

  const replayOfflineScans = useCallback(async () => {
    const queuedItems = readOfflineScanQueue();
    if (!queuedItems.length) {
      setOfflineScanQueue([]);
      setScanMessage('Khong co QR offline nao dang cho.');
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
      setScanMessage('Da gui het QR offline dang cho.');
    }
  }, [scanCouponPayload]);

  const confirmScannedIssue = async () => {
    if (!scanIssue) {
      return;
    }

    setIsConfirmingScan(true);
    setScanMessage('Dang xac nhan su dung coupon...');
    try {
      const nextIssue = await apiClient<PartnerScanIssue>(
        `/partner/coupon-issues/${encodeURIComponent(scanIssue.id)}/confirm-check-in`,
        { data: {} },
      );
      setScanIssue(nextIssue);
      setScanMessage(`${nextIssue.statusLabel ?? nextIssue.status} - khong the dung lai.`);
    } catch (error) {
      setScanMessage(error instanceof ApiError ? error.message : 'Khong xac nhan duoc coupon.');
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
        setStatusMessage('Du lieu dang hien thi theo store scope cua token PARTNER.');
      } catch (error) {
        if (!isMounted) return;

        if (error instanceof ApiError && [401, 403].includes(error.status)) {
          clearAuthSession();
          window.location.href = '/dang-nhap-doi-tac?redirect=/partner';
          return;
        }

        setStatusMessage('Chua ket noi duoc backend. Kiem tra backend/NEXT_PUBLIC_API_URL.');
      }
    };

    loadPartnerData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setOfflineScanQueue(readOfflineScanQueue());
    const token = searchParams.get('scanToken') ?? searchParams.get('token');
    if (!token) {
      return;
    }

    setScanPayload(token);
    void scanCouponPayload(token);
  }, [scanCouponPayload, searchParams]);

  const storeName = stores[0]?.name ?? 'Partner store';
  const scopedRows = bills.length
    ? bills.slice(0, 4).map((bill) => [
        bill.billNumber ?? bill.id.slice(0, 8),
        `${bill.coupon?.name ?? 'Hoa don'} · ${bill.store.name}`,
        bill.submittedAt ? new Date(bill.submittedAt).toLocaleString('vi-VN') : bill.status,
        `${(bill.discountVnd ?? bill.totalVnd ?? 0).toLocaleString('vi-VN')}đ`,
      ])
    : rows;

  const metrics = useMemo(
    () => [
      { label: 'Dat cho trong scope', value: String(bookings.length), sub: `${stores.length} quan duoc phep truy cap`, icon: TicketCheck },
      { label: 'Coupon cua quan', value: String(coupons.length), sub: `${coupons.reduce((sum, item) => sum + item.usedCount, 0)} luot da dung`, icon: BarChart3 },
      { label: 'Bill doi soat', value: String(bills.length), sub: 'Lay tu endpoint partner/bills', icon: UsersRound },
    ],
    [bills.length, bookings.length, coupons, stores.length],
  );

  const logout = () => {
    clearAuthSession();
    window.location.href = '/dang-nhap-doi-tac';
  };

  return (
    <main style={{ minHeight: '100vh', background: colors.bg, color: colors.text, fontFamily: "var(--nl-font-sans)" }}>
      <div style={{ display: 'grid', gridTemplateColumns: '250px minmax(0,1fr)', minHeight: '100vh' }}>
        <aside
          style={{
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

          {[
            { icon: Home, label: 'Tổng quan', active: true },
            { icon: QrCode, label: 'Quét mã QR' },
            { icon: FileClock, label: 'Đối soát' },
            { icon: Camera, label: 'Đăng thông tin' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                style={{
                  minHeight: '44px',
                  borderRadius: '12px',
                  padding: '0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '11px',
                  color: item.active ? colors.onGold : colors.text2,
                  background: item.active ? colors.goldGrad : 'transparent',
                  fontSize: '13px',
                  fontWeight: item.active ? 800 : 600,
                  marginBottom: '4px',
                }}
              >
                <Icon size={18} />
                {item.label}
              </div>
            );
          })}

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
              }}
            />
            <span>
              <span style={{ display: 'block', fontSize: '13px', fontWeight: 700 }}>{storeName}</span>
              <span style={{ display: 'block', marginTop: '2px', fontSize: '11px', color: colors.muted }}>Đối tác test</span>
            </span>
          </div>
        </aside>

        <section style={{ minWidth: 0 }}>
          <header
            style={{
              minHeight: '78px',
              borderBottom: `1px solid ${colors.borderGold12}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 30px',
            }}
          >
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.7px', color: colors.gold }}>TỔNG QUAN ĐỐI TÁC</div>
              <h1 style={{ margin: '5px 0 0', fontSize: '24px', fontWeight: 700 }}>{storeName}</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                Đã đăng nhập bằng tài khoản test
              </span>
              <span
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
                }}
              >
                <Bell size={17} />
              </span>
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
                Dang xuat
              </button>            </div>
          </header>

          <div style={{ padding: '26px 30px 34px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
              {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <article
                    key={metric.label}
                    style={{
                      border: `1px solid ${colors.borderGold22}`,
                      borderRadius: '16px',
                      background: colors.surface1,
                      padding: '18px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.muted, fontSize: '12px' }}>
                      <Icon size={18} color={colors.gold} />
                      {metric.label}
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '32px', fontWeight: 800, color: colors.text }}>{metric.value}</div>
                    <div style={{ marginTop: '4px', color: colors.goldBright, fontSize: '11.5px' }}>{metric.sub}</div>
                  </article>
                );
              })}
            </div>

            <article style={{ border: `1px solid ${colors.borderGold22}`, borderRadius: '16px', background: colors.surface1, padding: '20px', marginTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ margin: 0, color: colors.text, fontSize: '21px', fontWeight: 600 }}>Coupon QR scanner</h2>
                  <div style={{ marginTop: '4px', fontSize: '9px', fontWeight: 600, letterSpacing: '1.6px', color: colors.muted }}>
                    SIGNED PAYLOAD / OFFLINE QUEUE
                  </div>
                </div>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(212,178,106,.45), transparent)' }} />
                <span style={{ color: offlineScanQueue.length ? colors.goldBright : colors.muted, fontSize: '12px', fontWeight: 800 }}>
                  {offlineScanQueue.length} offline
                </span>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void scanCouponPayload(scanPayload);
                }}
                style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto auto', gap: '10px' }}
              >
                <input
                  value={scanPayload}
                  onChange={(event) => setScanPayload(event.target.value)}
                  placeholder="Dan scanToken hoac URL tu QR"
                  style={{
                    minHeight: '42px',
                    borderRadius: '11px',
                    border: `1px solid ${colors.borderGold22}`,
                    background: colors.surface2,
                    color: colors.text,
                    padding: '0 12px',
                    outline: 'none',
                  }}
                />
                <button
                  disabled={isScanning}
                  type="submit"
                  style={{
                    minHeight: '42px',
                    border: 0,
                    borderRadius: '11px',
                    background: colors.goldGrad,
                    color: colors.onGold,
                    padding: '0 16px',
                    fontWeight: 800,
                    cursor: isScanning ? 'wait' : 'pointer',
                  }}
                >
                  {isScanning ? 'Dang quet' : 'Quet QR'}
                </button>
                <button
                  disabled={isScanning || !offlineScanQueue.length}
                  onClick={() => void replayOfflineScans()}
                  type="button"
                  style={{
                    minHeight: '42px',
                    borderRadius: '11px',
                    border: `1px solid ${colors.borderGold22}`,
                    background: colors.surface2,
                    color: offlineScanQueue.length ? colors.gold : colors.muted,
                    padding: '0 14px',
                    fontWeight: 800,
                    cursor: offlineScanQueue.length ? 'pointer' : 'not-allowed',
                  }}
                >
                  Gui offline
                </button>
              </form>

              <div style={{ marginTop: '12px', color: colors.text2, fontSize: '12px', lineHeight: 1.6 }}>
                {scanMessage}
              </div>

              {scanIssue ? (
                <div
                  style={{
                    marginTop: '14px',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0,1fr) auto',
                    gap: '12px',
                    alignItems: 'center',
                    border: `1px solid ${colors.borderSoft}`,
                    borderRadius: '13px',
                    background: colors.surface2,
                    padding: '14px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ color: colors.gold, fontWeight: 800 }}>{scanIssue.code}</span>
                      <span
                        style={{
                          borderRadius: '999px',
                          padding: '4px 9px',
                          background: scanIssue.status === 'ISSUED' ? 'rgba(212,178,106,.14)' : 'rgba(255,255,255,.05)',
                          color: scanIssue.status === 'USED' ? colors.muted : colors.goldBright,
                          fontSize: '11px',
                          fontWeight: 800,
                        }}
                      >
                        {scanIssue.statusLabel ?? scanIssue.status}
                      </span>
                    </div>
                    <div style={{ marginTop: '6px', color: colors.text, fontSize: '13px' }}>
                      {scanIssue.coupon?.name ?? 'Coupon'} - {scanIssue.coupon?.store?.name ?? storeName}
                    </div>
                    <div style={{ marginTop: '4px', color: colors.muted, fontSize: '12px' }}>
                      {scanIssue.user?.displayName ?? scanIssue.guest?.displayName ?? 'Guest'} - HSD {scanIssue.expiresAt ? new Date(scanIssue.expiresAt).toLocaleString('vi-VN') : 'khong gioi han'}
                    </div>
                  </div>
                  <button
                    disabled={scanIssue.status !== 'ISSUED' || isConfirmingScan}
                    onClick={confirmScannedIssue}
                    type="button"
                    style={{
                      minHeight: '40px',
                      border: 0,
                      borderRadius: '11px',
                      background: scanIssue.status === 'ISSUED' ? colors.goldGrad : colors.surface3,
                      color: scanIssue.status === 'ISSUED' ? colors.onGold : colors.muted,
                      padding: '0 14px',
                      fontWeight: 800,
                      cursor: scanIssue.status === 'ISSUED' ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {scanIssue.status === 'USED' ? 'Da su dung' : isConfirmingScan ? 'Dang xac nhan' : 'Xac nhan USED'}
                  </button>
                </div>
              ) : null}
            </article>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(360px,.7fr)', gap: '14px', marginTop: '14px' }}>
              <article style={{ border: `1px solid ${colors.borderGold22}`, borderRadius: '16px', background: colors.surface1, padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                  <div>
                    <h2 style={{ margin: 0, color: colors.text, fontSize: '21px', fontWeight: 600 }}>Lượt đặt chỗ 7 ngày</h2>
                    <div style={{ marginTop: '4px', fontSize: '9px', fontWeight: 600, letterSpacing: '1.6px', color: colors.muted }}>
                      WEEKLY BOOKINGS
                    </div>
                  </div>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(212,178,106,.45), transparent)' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px', height: '220px' }}>
                  {[45, 62, 48, 78, 100, 92, 60].map((height, index) => (
                    <div
                      key={index}
                      style={{
                        flex: 1,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: `${height}%`,
                          borderRadius: '8px 8px 0 0',
                          background: index === 4 ? colors.goldGrad : 'rgba(212,178,106,.22)',
                        }}
                      />
                      <span style={{ color: colors.muted, fontSize: '11px' }}>{['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][index]}</span>
                    </div>
                  ))}
                </div>
              </article>

              <article style={{ border: `1px solid ${colors.borderGold22}`, borderRadius: '16px', background: colors.surface1, padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ margin: 0, color: colors.text, fontSize: '21px', fontWeight: 600 }}>Đối soát gần đây</h2>
                    <div style={{ marginTop: '4px', fontSize: '9px', fontWeight: 600, letterSpacing: '1.6px', color: colors.muted }}>
                      RECENT REDEMPTIONS
                    </div>
                  </div>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(212,178,106,.45), transparent)' }} />
                </div>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {scopedRows.map(([code, service, time, value]) => (
                    <div
                      key={code}
                      style={{
                        border: `1px solid ${colors.borderSoft}`,
                        borderRadius: '13px',
                        background: colors.surface2,
                        padding: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                        <span style={{ color: colors.gold, fontFamily: "var(--nl-font-sans)", fontSize: '12px', fontWeight: 700 }}>{code}</span>
                        <span style={{ color: colors.goldBright, fontSize: '12px', fontWeight: 800 }}>{value}</span>
                      </div>
                      <div style={{ marginTop: '6px', color: colors.text, fontSize: '12.5px' }}>{service}</div>
                      <div style={{ marginTop: '4px', color: colors.muted, fontSize: '11px' }}>{time}</div>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <div
              style={{
                marginTop: '14px',
                border: `1px solid ${colors.borderGold22}`,
                borderRadius: '14px',
                background: 'rgba(212,178,106,.08)',
                color: colors.text2,
                padding: '13px 16px',
                fontSize: '12px',
                lineHeight: 1.6,
              }}
            >
              Đối tác chỉ xem dữ liệu tổng hợp của riêng quán. Thông tin khách chi tiết không hiển thị trên cổng đối tác.
              <br />
              {statusMessage}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
