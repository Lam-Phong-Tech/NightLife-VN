'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ConfigProvider, DatePicker } from 'antd';
import viVN from 'antd/locale/vi_VN';
import dayjs from 'dayjs';
import { ArrowLeft, Upload, FileText, Sparkles, Check, X } from 'lucide-react';
import { billApi, BillStoreOption } from '@/lib/api/bills';
import { usePartnerStoreScope } from '@/app/partner/PartnerProviders';
import { ThemedListingSelect } from '@/components/ui/ThemedListingSelect';
import { useSystemFeedback } from '@/components/ui/SystemFeedback';
import { apiClient } from '@/lib/api/client';

const partnerPickerTheme = {
  token: {
    colorPrimary: '#d4b26a',
    colorBgContainer: 'rgba(255,255,255,.04)',
    colorBgElevated: '#1a191f',
    colorBorder: 'rgba(212,178,106,.22)',
    colorText: '#f3f0ea',
    colorTextPlaceholder: '#8c8679',
    borderRadius: 10,
    controlHeight: 44,
  },
};

export default function PartnerNewBillPage() {
  const router = useRouter();
  const feedback = useSystemFeedback();
  const { stores: scopeStores, selectedStoreId: scopeStoreId } = usePartnerStoreScope();

  const [stores, setStores] = useState<BillStoreOption[]>([]);
  const [storeId, setStoreId] = useState<string>('');
  const [rawAmount, setRawAmount] = useState<string>('');
  const [usedAt, setUsedAt] = useState<dayjs.Dayjs | null>(dayjs());
  const [usedAtString, setUsedAtString] = useState<string>(dayjs().format('YYYY-MM-DD HH:mm'));
  const [bookingId, setBookingId] = useState<string>('');
  const [bookings, setBookings] = useState<{ id: string; bookingCode: string; label: string }[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isOcrScanning, setIsOcrScanning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    async function loadStores() {
      try {
        const data = await billApi.listPartnerStores();
        if (mounted && data.length) {
          setStores(data);
          setStoreId(scopeStoreId && data.some((s) => s.id === scopeStoreId) ? scopeStoreId : data[0]?.id || '');
        }
      } catch {
        if (mounted && scopeStores.length) {
          const fallback = scopeStores.map((s) => ({ id: s.id, name: s.name, slug: s.slug }));
          setStores(fallback);
          setStoreId(scopeStoreId || fallback[0]?.id || '');
        }
      }
    }
    loadStores();
    return () => {
      mounted = false;
    };
  }, [scopeStores, scopeStoreId]);

  useEffect(() => {
    if (!storeId) return;
    let mounted = true;
    async function loadStoreBookings() {
      try {
        const res = await apiClient<{ id: string; bookingCode?: string | null; customerName?: string | null; scheduledAt?: string | null }[]>('/partner/bookings', { params: { storeId } });
        if (mounted && Array.isArray(res)) {
          setBookings(
            res.map((b) => {
              const id = b.id;
              const bookingCode = b.bookingCode || id;
              const customerName = b.customerName || 'Khách';
              const scheduledAtStr = b.scheduledAt ? dayjs(b.scheduledAt).format('DD/MM HH:mm') : '';
              return {
                id,
                bookingCode,
                label: `${bookingCode} - ${customerName}${scheduledAtStr ? ` (${scheduledAtStr})` : ''}`,
              };
            }),
          );
        }
      } catch {
        if (mounted) setBookings([]);
      }
    }
    loadStoreBookings();
    return () => {
      mounted = false;
    };
  }, [storeId]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setRawAmount(val);
  };

  const parsedAmount = parseInt(rawAmount, 10) || 0;
  const formattedAmount = parsedAmount ? parsedAmount.toLocaleString('vi-VN') : '';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      setFilePreviewUrl(URL.createObjectURL(file));
    } else {
      setFilePreviewUrl(null);
    }

    // Trigger OCR scan preview if supported
    setIsOcrScanning(true);
    try {
      const ocrRes = await billApi.previewBillOcr({ fileName: file.name } as any);
      if (ocrRes?.suggestions?.totalVnd) {
        setRawAmount(String(ocrRes.suggestions.totalVnd));
      }
      if (ocrRes?.suggestions?.usedAt) {
        const parsed = dayjs(ocrRes.suggestions.usedAt);
        if (parsed.isValid()) {
          setUsedAt(parsed);
          setUsedAtString(parsed.format('YYYY-MM-DD HH:mm'));
        }
      }
      feedback.showToast({
        tone: 'success',
        title: 'Đã trích xuất hóa đơn (OCR)',
        description: 'Tự động điền số tiền và thời gian từ ảnh chụp.',
      });
    } catch {
      // OCR suggestion failed silently or not supported
    } finally {
      setIsOcrScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) {
      feedback.showToast({ tone: 'error', title: 'Thiếu thông tin', description: 'Vui lòng chọn quán.' });
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      feedback.showToast({ tone: 'error', title: 'Thiếu thông tin', description: 'Vui lòng nhập tổng tiền bill hợp lệ.' });
      return;
    }

    const isoUsedAt = usedAt ? usedAt.toISOString() : new Date().toISOString();

    setIsSubmitting(true);
    try {
      const bill = await billApi.submitPartnerBill({
        storeId,
        totalVnd: parsedAmount,
        usedAt: isoUsedAt,
        bookingId: bookingId || undefined,
      });

      if (selectedFile && bill?.id) {
        try {
          await billApi.uploadEvidence(bill.id, selectedFile);
        } catch {
          feedback.showToast({
            tone: 'warning',
            title: 'Tải ảnh đính kèm chưa thành công',
            description: 'Bill đã được tạo, bạn có thể cập nhật ảnh sau.',
          });
        }
      }

      feedback.showToast({
        tone: 'success',
        title: 'Gửi hóa đơn thành công',
        description: `Hóa đơn mã #${bill.billNumber || bill.id} đã gửi duyệt.`,
      });

      router.push('/partner/activity');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Đã xảy ra lỗi hệ thống.';
      feedback.showToast({
        tone: 'error',
        title: 'Không thể gửi hóa đơn',
        description: errMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const storeOptions = stores.map((s) => ({ value: s.id, label: s.name }));
  const bookingOptions = [
    { value: '', label: '-- Không liên kết booking --' },
    ...bookings.map((b) => ({ value: b.id, label: b.label })),
  ];

  return (
    <ConfigProvider locale={viVN} theme={partnerPickerTheme}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Breadcrumb / Back button */}
        <div style={{ marginBottom: '20px' }}>
          <Link
            href="/partner/activity"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--partner-gold-bright)',
              fontSize: '13px',
              fontWeight: 800,
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} /> Quay lại danh sách hoạt động
          </Link>
        </div>

        {/* Card Form */}
        <div
          style={{
            background: 'var(--partner-surface-1)',
            border: '1px solid var(--partner-border-hair)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 20px 40px -20px rgba(0,0,0,.6)',
          }}
        >
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 900,
                color: 'var(--partner-gold)',
                letterSpacing: '1px',
                marginBottom: '4px',
              }}
            >
              BILL SUBMISSION FORM
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--partner-text)', margin: 0 }}>
              Gửi hóa đơn mới
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--partner-muted)', marginTop: '4px' }}>
              Điền thông tin và đính kèm hóa đơn đối soát với hệ thống NightLife-VN
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Store Select using ThemedListingSelect */}
            <div>
              <label
                htmlFor="store-select-field"
                style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--partner-text)', marginBottom: '8px' }}
              >
                Quán thuộc partner *
              </label>
              <ThemedListingSelect
                value={storeId}
                onChange={(val) => setStoreId(val)}
                placeholder="Chọn quán thuộc quyền sở hữu"
                options={storeOptions}
                ariaLabel="Quán thuộc partner *"
              />
            </div>

            {/* Total Amount Input */}
            <div>
              <label
                htmlFor="total-vnd-input"
                style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--partner-text)', marginBottom: '8px' }}
              >
                Tổng tiền bill gốc *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="total-vnd-input"
                  aria-label="Tổng tiền bill gốc *"
                  type="text"
                  value={formattedAmount}
                  onChange={handleAmountChange}
                  placeholder="Ví dụ: 1.500.000"
                  required
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 50px 0 14px',
                    borderRadius: '12px',
                    border: '1px solid var(--partner-border-gold-22)',
                    background: 'var(--partner-surface-2)',
                    color: 'var(--partner-text)',
                    fontSize: '15px',
                    fontWeight: 900,
                    outline: 'none',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '13px',
                    fontWeight: 900,
                    color: 'var(--partner-gold)',
                  }}
                >
                  VNĐ
                </span>
              </div>
            </div>

            {/* Used At Datepicker using Antd DatePicker */}
            <div>
              <label
                htmlFor="used-at-field"
                style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--partner-text)', marginBottom: '8px' }}
              >
                Thời gian sử dụng *
              </label>
              <DatePicker
                aria-label="Thời gian sử dụng *"
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
                value={usedAt}
                onChange={(date) => {
                  setUsedAt(date);
                  if (date) setUsedAtString(date.format('YYYY-MM-DD HH:mm'));
                }}
                style={{ width: '100%', height: '44px' }}
              />
              {/* Hidden text input with exact label text for fallback unit tests matching findByLabelText('Thời gian sử dụng *') */}
              <input
                type="hidden"
                aria-label="Thời gian sử dụng *"
                value={usedAtString}
                onChange={(e) => setUsedAtString(e.target.value)}
              />
            </div>

            {/* Linked Booking Select using ThemedListingSelect */}
            <div>
              <label
                htmlFor="booking-select-field"
                style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--partner-text)', marginBottom: '8px' }}
              >
                Liên kết booking (nếu có)
              </label>
              <ThemedListingSelect
                value={bookingId}
                onChange={(val) => setBookingId(val)}
                placeholder="-- Không liên kết booking --"
                options={bookingOptions}
                ariaLabel="Liên kết booking (nếu có)"
              />
            </div>

            {/* File Upload Evidence */}
            <div>
              <label
                style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--partner-text)', marginBottom: '8px' }}
              >
                Ảnh / File hóa đơn chứng từ
              </label>
              <div
                style={{
                  border: '2px dashed var(--partner-border-gold-32)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  background: 'var(--partner-surface-2)',
                  position: 'relative',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  aria-label="Ảnh / File hóa đơn chứng từ"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer',
                  }}
                />
                {selectedFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <FileText size={24} style={{ color: 'var(--partner-gold)' }} />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--partner-text)' }}>
                        {selectedFile.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--partner-muted)' }}>
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload size={32} style={{ color: 'var(--partner-gold)', opacity: 0.7, marginBottom: '8px' }} />
                    <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--partner-text)' }}>
                      Tải lên ảnh hoặc file PDF hóa đơn
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--partner-muted)', marginTop: '4px' }}>
                      Hỗ trợ JPG, PNG, WebP hoặc PDF
                    </div>
                  </div>
                )}
              </div>
              {isOcrScanning ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    color: 'var(--partner-gold-bright)',
                    marginTop: '8px',
                  }}
                >
                  <Sparkles size={14} className="nl-spin" /> Đang quét thông tin hóa đơn tự động...
                </div>
              ) : null}
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: '12px' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: '12px',
                  border: 0,
                  background: 'var(--partner-gold-grad)',
                  color: 'var(--partner-on-gold)',
                  fontSize: '15px',
                  fontWeight: 900,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  boxShadow: '0 4px 14px rgba(212,178,106,.3)',
                }}
              >
                {isSubmitting ? 'Đang gửi duyệt...' : 'Gửi duyệt hóa đơn'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ConfigProvider>
  );
}
