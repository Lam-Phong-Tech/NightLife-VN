'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, QrCode, Upload, Send, RefreshCcw, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { apiClient, ApiError } from '@/lib/api/client';
import { usePartnerStoreScope } from '../PartnerProviders';
import { useSystemFeedback } from '@/components/ui/SystemFeedback';
import { ThemedListingSelect } from '@/components/ui/ThemedListingSelect';

type PartnerScanIssue = {
  id?: string;
  code?: string;
  token?: string;
  status?: string;
  statusLabel?: string;
  title?: string;
  discountSummary?: string;
  customerName?: string;
  bookingTime?: string;
  guestCount?: number;
  type?: 'BOOKING' | 'COUPON' | 'TOUR';
  storeId?: string;
  storeName?: string;
  [key: string]: any;
};

type OfflineScanItem = {
  id: string;
  scannedAt: string;
  payload: string;
  storeId: string;
};

const OFFLINE_QUEUE_KEY = 'nightlife:offline-coupon-scans';

const readOfflineQueue = (): OfflineScanItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeOfflineQueue = (items: OfflineScanItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(items));
  } catch {}
};

export default function PartnerScanClient() {
  const { stores, selectedStoreId, setSelectedStoreId, activeStore, storePermissions, isStaffAccount } = usePartnerStoreScope();
  const feedback = useSystemFeedback();

  const [scanPayload, setScanPayload] = useState('');
  const [scanIssue, setScanIssue] = useState<PartnerScanIssue | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isConfirmingScan, setIsConfirmingScan] = useState(false);
  const [isReadingQrImage, setIsReadingQrImage] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'starting' | 'active' | 'error'>('idle');
  const [scanMessage, setScanMessage] = useState('Sẵn sàng quét QR, dán link hoặc nhập mã coupon.');
  const [offlineQueue, setOfflineQueue] = useState<OfflineScanItem[]>(() => readOfflineQueue());

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const qrImageInputRef = useRef<HTMLInputElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const activeStoreId = selectedStoreId || stores[0]?.id || '';

  const hasScanPermission = !isStaffAccount || storePermissions.includes('coupon.scan');
  const hasCheckinPermission = !isStaffAccount || storePermissions.includes('checkin.confirm');
  const canUseQrTools = hasScanPermission || hasCheckinPermission;

  // Process QR scan code using dynamic jsQR
  const handleProcessQrCode = useCallback(async (code: string) => {
    if (!code || isScanning) return;
    setIsScanning(true);
    setScanMessage('Đang kiểm tra thông tin mã QR...');

    try {
      // Check offline mode first
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        const item: OfflineScanItem = {
          id: `off-${Date.now()}`,
          scannedAt: new Date().toISOString(),
          payload: code,
          storeId: activeStoreId,
        };
        const nextQueue = [item, ...offlineQueue];
        setOfflineQueue(nextQueue);
        writeOfflineQueue(nextQueue);
        feedback.showToast({
          tone: 'warning',
          title: 'Đã lưu offline',
          description: 'Hệ thống đang mất mạng. Mã đã được lưu vào hàng đợi offline để đồng bộ sau.',
        });
        setScanMessage('Đã lưu mã vào hàng đợi offline.');
        setIsScanning(false);
        return;
      }

      // Online scan endpoint
      const result = await apiClient<PartnerScanIssue>('/partner/booking-qrs/scan', {
        method: 'POST',
        data: {
          token: code,
          storeId: activeStoreId,
        },
      }).catch(async () => {
        // Fallback endpoint for coupon scan
        return await apiClient<PartnerScanIssue>('/partner/coupon-issues/scan', {
          method: 'POST',
          data: {
            token: code,
            storeId: activeStoreId,
          },
        });
      });

      setScanIssue(result);
      setScanMessage(result.title ? `Tìm thấy: ${result.title}` : 'Đã tìm thấy thông tin mã.');
      feedback.showToast({
        tone: 'success',
        title: 'Quét thành công',
        description: result.title || 'Đã đọc thành công thông tin mã QR.',
      });
    } catch (err: any) {
      setScanMessage(err.message || 'Mã không hợp lệ hoặc không tồn tại trong hệ thống.');
      feedback.showToast({
        tone: 'error',
        title: 'Mã không hợp lệ',
        description: err.message || 'Không thể kiểm tra thông tin mã QR này.',
      });
    } finally {
      setIsScanning(false);
    }
  }, [activeStoreId, isScanning, offlineQueue, feedback]);

  // Read QR from frame using dynamically imported jsQR
  const scanVideoFrame = useCallback(async () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(() => void scanVideoFrame());
      return;
    }

    try {
      const jsQRModule = (await import('jsqr')).default;
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQRModule(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          stopCameraScan();
          setScanPayload(code.data);
          handleProcessQrCode(code.data);
          return;
        }
      }
    } catch {}

    animFrameRef.current = requestAnimationFrame(() => void scanVideoFrame());
  }, [handleProcessQrCode]);

  const startCameraScan = async () => {
    setCameraStatus('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        setCameraStatus('active');
        animFrameRef.current = requestAnimationFrame(() => void scanVideoFrame());
      }
    } catch (err: any) {
      setCameraStatus('error');
      feedback.showToast({
        tone: 'error',
        title: 'Lỗi Camera',
        description: 'Không thể truy cập camera thiết bị. Vui lòng cấp quyền camera hoặc tải ảnh QR.',
      });
    }
  };

  const stopCameraScan = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCameraStatus('idle');
  };

  useEffect(() => {
    return () => {
      stopCameraScan();
    };
  }, []);

  const handleQrImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsReadingQrImage(true);
    try {
      const jsQRModule = (await import('jsqr')).default;
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (event) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQRModule(imageData.data, imageData.width, imageData.height);
            if (code && code.data) {
              setScanPayload(code.data);
              handleProcessQrCode(code.data);
            } else {
              feedback.showToast({
                tone: 'error',
                title: 'Không đọc được QR',
                description: 'Ảnh tải lên không chứa mã QR hợp lệ.',
              });
            }
          }
          setIsReadingQrImage(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch {
      setIsReadingQrImage(false);
      feedback.showToast({
        tone: 'error',
        title: 'Lỗi tải ảnh',
        description: 'Không thể xử lý ảnh QR tải lên.',
      });
    }
  };

  const handleConfirmCheckin = async () => {
    if (!scanIssue || isConfirmingScan) return;
    setIsConfirmingScan(true);
    try {
      await apiClient('/partner/checkin/confirm', {
        method: 'POST',
        data: {
          token: scanIssue.token || scanPayload,
          issueId: scanIssue.id,
          storeId: activeStoreId,
        },
      });
      feedback.showToast({
        tone: 'success',
        title: 'Xác nhận thành công',
        description: 'Đã xác nhận check-in / dùng coupon thành công cho khách hàng.',
      });
      setScanIssue((prev) => (prev ? { ...prev, status: 'USED', statusLabel: 'Đã sử dụng' } : null));
    } catch (err: any) {
      feedback.showToast({
        tone: 'error',
        title: 'Lỗi xác nhận',
        description: err.message || 'Không thể xác nhận mã này.',
      });
    } finally {
      setIsConfirmingScan(false);
    }
  };

  const handleSyncOfflineQueue = async () => {
    if (!offlineQueue.length) return;
    try {
      for (const item of offlineQueue) {
        await apiClient('/partner/coupon-issues/scan', {
          method: 'POST',
          data: { token: item.payload, storeId: item.storeId },
        }).catch(() => {});
      }
      setOfflineQueue([]);
      writeOfflineQueue([]);
      feedback.showToast({
        tone: 'success',
        title: 'Đồng bộ xong',
        description: 'Tất cả mã offline đã được đồng bộ lên hệ thống.',
      });
    } catch {
      feedback.showToast({
        tone: 'error',
        title: 'Lỗi đồng bộ',
        description: 'Vẫn còn mã offline chưa đồng bộ thành công.',
      });
    }
  };

  const colors = {
    surface2: 'var(--partner-surface-2, rgba(255,255,255,.04))',
    borderGold12: 'var(--partner-border-gold-12, rgba(212,178,106,.18))',
    borderGold22: 'var(--partner-border-gold-22, rgba(212,178,106,.22))',
    borderGold32: 'var(--partner-border-gold-32, rgba(212,178,106,.32))',
    borderGold40: 'var(--partner-border-gold-40, rgba(212,178,106,.4))',
    text: 'var(--partner-text, #f3f0ea)',
    text2: 'var(--partner-text-2, #c5c0b6)',
    muted: 'var(--partner-muted, #8c8679)',
    gold: 'var(--partner-gold, #d4b26a)',
    goldBright: 'var(--partner-gold-bright, #e3c27e)',
    goldGrad: 'var(--partner-gold-grad, linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a))',
    success: 'var(--partner-success, #8de6b0)',
    danger: 'var(--partner-danger, #ffb4a8)',
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* Store selector if multiple */}
      {stores.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: colors.surface2, padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.borderGold12}` }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: colors.gold }}>Quán đang chọn:</span>
          <div style={{ minWidth: '220px' }}>
            <ThemedListingSelect
              value={activeStoreId}
              onChange={setSelectedStoreId}
              placeholder="Chọn quán..."
              options={stores.map((s) => ({ value: s.id, label: s.name }))}
              compact
            />
          </div>
        </div>
      )}

      {/* Offline sync banner if present */}
      {offlineQueue.length > 0 && (
        <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(212,178,106,.15)', border: `1px solid ${colors.borderGold32}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.goldBright, fontSize: '13px', fontWeight: 700 }}>
            <AlertTriangle size={18} />
            <span>Có {offlineQueue.length} mã đã quét offline chưa đồng bộ.</span>
          </div>
          <button
            type="button"
            onClick={handleSyncOfflineQueue}
            style={{ padding: '6px 14px', borderRadius: '8px', border: 0, background: colors.goldGrad, color: '#241a0a', fontWeight: 800, fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCcw size={14} /> Đồng bộ ngay
          </button>
        </div>
      )}

      {/* Main QR Scanner section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Camera / Upload view */}
        <div style={{ background: colors.surface2, borderRadius: '16px', border: `1px solid ${colors.borderGold22}`, padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: colors.text, margin: 0 }}>Quét / Tải mã QR</h2>

          <div
            style={{
              minHeight: '260px',
              borderRadius: '12px',
              border: `1px dashed ${cameraActive ? colors.borderGold40 : colors.borderGold22}`,
              background: '#000',
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
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: cameraActive ? 'block' : 'none' }}
            />
            {!cameraActive ? (
              <div style={{ textAlign: 'center', color: colors.text2, padding: '20px' }}>
                <QrCode size={48} color={colors.gold} style={{ margin: '0 auto 12px' }} />
                <div style={{ fontSize: '14px', fontWeight: 700, color: colors.text }}>Mở camera hoặc tải ảnh QR</div>
                <div style={{ fontSize: '12px', color: colors.muted, marginTop: '4px' }}>Hỗ trợ camera thiết bị & hình ảnh từ bộ nhớ</div>
              </div>
            ) : null}
          </div>

          {canUseQrTools ? (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={cameraActive ? stopCameraScan : startCameraScan}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: `1px solid ${colors.borderGold32}`,
                  background: colors.goldGrad,
                  color: '#241a0a',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Camera size={16} />
                {cameraActive ? 'Tắt Camera' : cameraStatus === 'starting' ? 'Đang mở...' : 'Mở Camera'}
              </button>

              <input
                ref={qrImageInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleQrImageUpload}
              />
              <button
                type="button"
                onClick={() => qrImageInputRef.current?.click()}
                disabled={isReadingQrImage}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: `1px solid ${colors.borderGold32}`,
                  background: colors.surface2,
                  color: colors.goldBright,
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Upload size={16} />
                {isReadingQrImage ? 'Đang đọc...' : 'Tải ảnh QR'}
              </button>
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: colors.danger, background: 'rgba(255,180,168,.1)', padding: '10px', borderRadius: '8px' }}>
              Tài khoản nhân viên chưa được cấp quyền `coupon.scan` hoặc `checkin.confirm`.
            </div>
          )}
        </div>

        {/* Manual Input & Result view */}
        <div style={{ background: colors.surface2, borderRadius: '16px', border: `1px solid ${colors.borderGold22}`, padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: colors.text, margin: 0 }}>Nhập thủ công & Kết quả</h2>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={scanPayload}
              onChange={(e) => setScanPayload(e.target.value)}
              placeholder="Dán link QR hoặc nhập mã code..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '10px',
                border: `1px solid ${colors.borderGold22}`,
                background: 'rgba(0,0,0,.3)',
                color: colors.text,
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => handleProcessQrCode(scanPayload)}
              disabled={isScanning || !scanPayload.trim()}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                border: 0,
                background: colors.goldGrad,
                color: '#241a0a',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Send size={15} /> Kiểm tra
            </button>
          </div>

          <div style={{ fontSize: '12px', color: colors.muted }}>{scanMessage}</div>

          {/* Scan result display */}
          {scanIssue ? (
            <div style={{ marginTop: '10px', padding: '16px', borderRadius: '12px', border: `1px solid ${colors.borderGold32}`, background: 'rgba(212,178,106,.08)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: colors.goldBright }}>{scanIssue.title || 'Mã ưu đãi'}</span>
                <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, background: scanIssue.status === 'USED' ? 'rgba(255,180,168,.15)' : 'rgba(141,230,176,.15)', color: scanIssue.status === 'USED' ? colors.danger : colors.success }}>
                  {scanIssue.statusLabel || scanIssue.status || 'HỢP LỆ'}
                </span>
              </div>

              {scanIssue.customerName && (
                <div style={{ fontSize: '13px', color: colors.text }}>Khách hàng: <strong>{scanIssue.customerName}</strong></div>
              )}
              {scanIssue.discountSummary && (
                <div style={{ fontSize: '13px', color: colors.text }}>Ưu đãi: <strong>{scanIssue.discountSummary}</strong></div>
              )}

              {scanIssue.status !== 'USED' && (
                <button
                  type="button"
                  onClick={handleConfirmCheckin}
                  disabled={isConfirmingScan || !hasCheckinPermission}
                  style={{
                    marginTop: '8px',
                    padding: '12px',
                    borderRadius: '10px',
                    border: 0,
                    background: colors.goldGrad,
                    color: '#241a0a',
                    fontWeight: 900,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <CheckCircle2 size={18} />
                  {isConfirmingScan ? 'Đang xác nhận...' : 'Xác nhận Check-in / Sử dụng'}
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
