"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { ApiError, translateApiMessage } from "@/lib/api/client";
import {
  billApi,
  type BillOcrPreview,
  type BillRecord,
  type BillStoreOption,
} from "@/lib/api/bills";
import { bookingApi, type BookingRecord } from "@/lib/api/bookings";
import { couponApi, type CouponIssue } from "@/lib/api/coupons";
import { discoveryApi } from "@/lib/api/discovery";

const colors = {
  bg: "var(--vy-bg)",
  panel: "var(--vy-surface-2)",
  panelStrong: "var(--vy-surface-3)",
  border: "var(--vy-border-gold-22)",
  borderStrong: "var(--vy-border-gold-32)",
  text: "var(--vy-text)",
  muted: "var(--vy-muted)",
  dim: "var(--vy-faint)",
  gold: "var(--vy-gold)",
  goldPale: "var(--vy-gold-pale)",
  onGold: "var(--vy-on-gold)",
  danger: "var(--vy-error)",
  success: "var(--vy-success)",
  warning: "var(--vy-warn)",
};

const tenDaysMs = 10 * 24 * 60 * 60 * 1000;
const maxBillTotalVnd = 1_000_000_000;
const maxEvidenceSizeBytes = 25 * 1024 * 1024;
const allowedEvidenceMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);
const allowedEvidenceExtension = /\.(jpe?g|png|webp|gif|pdf)$/i;

type FormNotice =
  | { tone: "success"; message: string; bill?: BillRecord }
  | { tone: "warning" | "danger"; message: string };

const moneyVnd = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

const billStatusLabel = (status?: string | null) => {
  switch (status) {
    case "VERIFIED":
      return "Đã duyệt";
    case "REJECTED":
      return "Từ chối";
    case "SUBMITTED":
      return "Chờ duyệt";
    case "PAID":
      return "Đã thanh toán";
    case "VOIDED":
      return "Đã hủy";
    default:
      return "Member";
  }
};

const toDatetimeLocalValue = (date: Date) => {
  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localTime.toISOString().slice(0, 16);
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "Chưa có";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const parseMoneyInput = (value: string) => Number(value.replace(/[^\d]/g, ""));

const validateEvidenceFile = (file: File | null) => {
  if (!file) return "";

  const hasAllowedMime = allowedEvidenceMimeTypes.has(file.type);
  const hasAllowedExtension = allowedEvidenceExtension.test(file.name);

  if (!hasAllowedMime && !hasAllowedExtension) {
    return "Ảnh/chứng từ chỉ hỗ trợ JPG, PNG, WEBP, GIF hoặc PDF.";
  }

  if (file.size > maxEvidenceSizeBytes) {
    return "Ảnh/chứng từ không được vượt quá 25MB.";
  }

  return "";
};

const validateBillForm = ({
  isLoadingOptions,
  hasStore,
  amountInput,
  amount,
  usedAt,
  isUsedAtInvalid,
  isFutureUsage,
  isPastDeadline,
  evidenceFile,
  timeReady,
}: {
  isLoadingOptions: boolean;
  hasStore: boolean;
  amountInput: string;
  amount: number;
  usedAt: string;
  isUsedAtInvalid: boolean;
  isFutureUsage: boolean;
  isPastDeadline: boolean;
  evidenceFile: File | null;
  timeReady: boolean;
}) => {
  if (isLoadingOptions) {
    return "Đang tải danh sách quán, vui lòng thử lại sau vài giây.";
  }

  if (!hasStore) {
    return "Vui lòng chọn quán/cơ sở.";
  }

  if (!amountInput.trim()) {
    return "Vui lòng nhập tổng tiền bill gốc.";
  }

  if (!Number.isSafeInteger(amount) || amount < 1) {
    return "Tổng tiền bill gốc phải là số nguyên lớn hơn 0.";
  }

  if (amount > maxBillTotalVnd) {
    return "Tổng tiền bill gốc không được vượt quá 1.000.000.000đ.";
  }

  if (!usedAt.trim()) {
    return "Vui lòng chọn thời gian sử dụng.";
  }

  if (isUsedAtInvalid) {
    return "Thời gian sử dụng không hợp lệ.";
  }

  if (!timeReady) {
    return "Đang đồng bộ thời gian, vui lòng thử lại sau vài giây.";
  }

  if (isFutureUsage) {
    return "Thời gian sử dụng không được ở tương lai.";
  }

  if (isPastDeadline) {
    return "Bill quá 10 ngày sẽ không được nhận.";
  }

  return validateEvidenceFile(evidenceFile);
};

const canAttachCouponIssueToBill = (issue: CouponIssue) =>
  issue.status === "ISSUED" || issue.status === "USED";

const couponIssueOptionLabel = (issue: CouponIssue) => {
  const storeName = issue.coupon.store?.name ?? "Coupon";
  const status = issue.statusLabel ?? issue.status;
  return `${issue.coupon.name} - ${storeName} - ${status}`;
};

const cleanApiMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "Guest chưa đăng nhập không gửi bill trong MVP; vui lòng đăng nhập/đăng ký Member.";
    }

    return translateApiMessage(error.message, error.status);
  }

  return translateApiMessage(
    error instanceof Error ? error.message : undefined,
    undefined,
    "Chưa gửi được bill. Vui lòng thử lại.",
  );
};

export default function Page() {
  const searchParams = useSearchParams();
  const focusedBillId = searchParams.get("billId") || "";
  const [stores, setStores] = useState<BillStoreOption[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [couponIssues, setCouponIssues] = useState<CouponIssue[]>([]);
  const [storeSlug, setStoreSlug] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [couponIssueId, setCouponIssueId] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [usedAt, setUsedAt] = useState(() => toDatetimeLocalValue(new Date()));
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [ocrPreview, setOcrPreview] = useState<BillOcrPreview | null>(null);
  const [notice, setNotice] = useState<FormNotice | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadingEvidence, setIsReadingEvidence] = useState(false);
  const [submittedBills, setSubmittedBills] = useState<BillRecord[]>([]);
  const [timeWindow, setTimeWindow] = useState({
    nowMs: 0,
  });

  const handleEvidenceFileChange = (input: HTMLInputElement) => {
    const file = input.files?.[0] ?? null;
    const fileError = validateEvidenceFile(file);
    if (fileError) {
      input.value = "";
      setEvidenceFile(null);
      setOcrPreview(null);
      setNotice({ tone: "danger", message: fileError });
      return;
    }

    setNotice(null);
    setEvidenceFile(file);
    setOcrPreview(null);
  };

  const readEvidenceText = async (file: File) => {
    if (
      file.type.startsWith("text/") ||
      file.type === "application/pdf" ||
      /\.(txt|csv|pdf)$/i.test(file.name)
    ) {
      try {
        return (await file.text()).slice(0, 8000);
      } catch {
        return "";
      }
    }

    return "";
  };

  const handleReadEvidence = async () => {
    if (!evidenceFile) return;
    const fileError = validateEvidenceFile(evidenceFile);
    if (fileError) {
      setNotice({ tone: "danger", message: fileError });
      return;
    }

    setIsReadingEvidence(true);
    setNotice(null);
    try {
      const preview = await billApi.previewBillOcr({
        fileName: evidenceFile.name,
        text: await readEvidenceText(evidenceFile),
      });
      setOcrPreview(preview);
      if (preview.suggestions.totalVnd) {
        setAmountInput(preview.suggestions.totalVnd.toLocaleString("vi-VN"));
      }
      if (preview.suggestions.usedAt) {
        setUsedAt(toDatetimeLocalValue(new Date(preview.suggestions.usedAt)));
      }
      setNotice({
        tone: preview.requiresManualReview ? "warning" : "success",
        message: preview.requiresManualReview
          ? "AI đọc bill đã gợi ý dữ liệu, vui lòng kiểm tra lại trước khi gửi."
          : "AI đọc bill đã điền tổng tiền và thời gian sử dụng.",
      });
    } catch (error) {
      setNotice({ tone: "danger", message: cleanApiMessage(error) });
    } finally {
      setIsReadingEvidence(false);
    }
  };

  useEffect(() => {
    let active = true;

    const loadOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const [storeItems, bookingItems, couponIssueItems, billItems] = await Promise.all([
          discoveryApi.listStores({ city: "all", limit: 80 }),
          bookingApi.listMemberBookings().catch(() => [] as BookingRecord[]),
          couponApi.listMemberCouponIssues().catch(() => [] as CouponIssue[]),
          billApi.listMemberBills().catch(() => [] as BillRecord[]),
        ]);

        if (!active) return;
        setStores(storeItems);
        setBookings(bookingItems);
        setCouponIssues(couponIssueItems.filter(canAttachCouponIssueToBill));
        setSubmittedBills(billItems);
        setStoreSlug((current) =>
          current && storeItems.some((storeItem) => storeItem.slug === current)
            ? current
            : storeItems[0]?.slug || "",
        );
      } catch (error) {
        if (!active) return;
        setStores([]);
        setBookings([]);
        setCouponIssues([]);
        setSubmittedBills([]);
        setStoreSlug("");
        setNotice({ tone: "danger", message: cleanApiMessage(error) });
      } finally {
        if (active) {
          setIsLoadingOptions(false);
        }
      }
    };

    void loadOptions();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const refreshWindow = () => {
      const now = new Date();
      setTimeWindow({
        nowMs: now.getTime(),
      });
    };

    refreshWindow();
    const interval = window.setInterval(refreshWindow, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const selectedBooking = useMemo(
    () => bookings.find((booking) => booking.id === bookingId) ?? null,
    [bookingId, bookings],
  );

  const selectedCouponIssue = useMemo(
    () => couponIssues.find((issue) => issue.id === couponIssueId) ?? null,
    [couponIssueId, couponIssues],
  );

  const selectedStore = useMemo(() => {
    if (selectedBooking?.store?.slug) {
      return stores.find((storeItem) => storeItem.slug === selectedBooking.store?.slug) ?? null;
    }

    if (selectedCouponIssue?.coupon.store?.slug) {
      return (
        stores.find((storeItem) => storeItem.slug === selectedCouponIssue.coupon.store?.slug) ??
        null
      );
    }

    return stores.find((storeItem) => storeItem.slug === storeSlug) ?? null;
  }, [selectedBooking, selectedCouponIssue, storeSlug, stores]);

  const amount = useMemo(() => parseMoneyInput(amountInput), [amountInput]);
  const visibleSubmittedBills = useMemo(() => {
    const topBills = submittedBills.slice(0, 5);
    if (!focusedBillId || topBills.some((bill) => bill.id === focusedBillId)) {
      return topBills;
    }

    const focusedBill = submittedBills.find((bill) => bill.id === focusedBillId);
    return focusedBill ? [focusedBill, ...topBills].slice(0, 6) : topBills;
  }, [focusedBillId, submittedBills]);
  const usedAtDate = useMemo(() => new Date(usedAt), [usedAt]);
  const isUsedAtInvalid = Number.isNaN(usedAtDate.getTime());
  const isFutureUsage =
    Boolean(timeWindow.nowMs) && !isUsedAtInvalid && usedAtDate.getTime() > timeWindow.nowMs;
  const isPastDeadline =
    Boolean(timeWindow.nowMs) &&
    !isUsedAtInvalid &&
    timeWindow.nowMs - usedAtDate.getTime() > tenDaysMs;
  const billValidationMessage = useMemo(
    () =>
      validateBillForm({
        isLoadingOptions,
        hasStore: Boolean(bookingId || storeSlug),
        amountInput,
        amount,
        usedAt,
        isUsedAtInvalid,
        isFutureUsage,
        isPastDeadline,
        evidenceFile,
        timeReady: Boolean(timeWindow.nowMs),
      }),
    [
      amount,
      amountInput,
      bookingId,
      evidenceFile,
      isFutureUsage,
      isLoadingOptions,
      isPastDeadline,
      isUsedAtInvalid,
      storeSlug,
      timeWindow.nowMs,
      usedAt,
    ],
  );
  const canSubmit =
    !isSubmitting &&
    !billValidationMessage;

  const handleBookingChange = (value: string) => {
    setBookingId(value);
    if (value) {
      setCouponIssueId("");
    }
    const booking = bookings.find((item) => item.id === value);
    if (booking?.store?.slug) {
      setStoreSlug(booking.store.slug);
    }
  };

  const handleCouponIssueChange = (value: string) => {
    setCouponIssueId(value);
    const issue = couponIssues.find((item) => item.id === value);
    if (issue?.coupon.store?.slug) {
      setStoreSlug(issue.coupon.store.slug);
    }
  };

  const handleAmountChange = (value: string) => {
    const parsed = parseMoneyInput(value);
    setAmountInput(parsed ? parsed.toLocaleString("vi-VN") : "");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);

    if (billValidationMessage) {
      setNotice({
        tone: "danger",
        message: billValidationMessage,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...(bookingId
          ? { bookingId }
          : {
              storeSlug,
              ...(selectedCouponIssue
                ? {
                    couponId: selectedCouponIssue.coupon.id,
                    couponIssueId: selectedCouponIssue.id,
                  }
                : {}),
            }),
        totalVnd: amount,
        usedAt: usedAtDate.toISOString(),
      };
      const bill = await billApi.submitMemberBill(payload);

      let uploadWarning = "";
      if (evidenceFile) {
        try {
          await billApi.uploadEvidence(bill.id, evidenceFile);
        } catch {
          uploadWarning = " Bill đã được gửi, nhưng ảnh/chứng từ chưa upload được.";
        }
      }

      setSubmittedBills((current) => [bill, ...current]);
      setNotice({
        tone: uploadWarning ? "warning" : "success",
        message: `Đã gửi bill ${bill.billNumber ?? bill.id.slice(0, 8)} để Admin duyệt.${uploadWarning}`,
        bill,
      });
      setAmountInput("");
      setBookingId("");
      setCouponIssueId("");
      setEvidenceFile(null);
      setOcrPreview(null);
      setUsedAt(toDatetimeLocalValue(new Date()));
    } catch (error) {
      setNotice({ tone: "danger", message: cleanApiMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="nl-bill-page" style={{ minHeight: "100vh", background: colors.bg, color: colors.text }}>
      <section className="nl-bill-shell">
        <Link
          href="/tai-khoan"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: colors.muted,
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          Tài khoản
        </Link>

        <div className="nl-bill-head">
          <div>
            <h1>Gửi hóa đơn</h1>
            <p>Gửi bill gốc để Admin đối soát điểm, ưu đãi và công nợ với quán.</p>
          </div>
          <div className="nl-bill-rule">Trong 10 ngày</div>
        </div>

        <div className="nl-bill-layout">
          <form className="nl-bill-form" noValidate onSubmit={handleSubmit}>
            <div className="nl-field">
              <label htmlFor="bill-store">Quán / cơ sở *</label>
              <select
                id="bill-store"
                value={storeSlug}
                onChange={(event) => setStoreSlug(event.target.value)}
                disabled={isLoadingOptions || Boolean(selectedBooking || selectedCouponIssue)}
              >
                {stores.map((storeItem) => (
                  <option key={storeItem.id} value={storeItem.slug}>
                    {storeItem.name}
                    {storeItem.district ? ` - ${storeItem.district}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {bookings.length ? (
              <div className="nl-field">
                <label htmlFor="bill-booking">Liên kết booking</label>
                <select
                  id="bill-booking"
                  value={bookingId}
                  onChange={(event) => handleBookingChange(event.target.value)}
                >
                  <option value="">Không liên kết booking</option>
                  {bookings.map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      {booking.store?.name ?? "Booking"} - {formatDateTime(booking.scheduledAt)}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {!selectedBooking && couponIssues.length ? (
              <div className="nl-field">
                <label htmlFor="bill-coupon-issue">Coupon link</label>
                <select
                  id="bill-coupon-issue"
                  value={couponIssueId}
                  onChange={(event) => handleCouponIssueChange(event.target.value)}
                >
                  <option value="">Khong lien ket coupon</option>
                  {couponIssues.map((issue) => (
                    <option key={issue.id} value={issue.id}>
                      {couponIssueOptionLabel(issue)}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="nl-form-grid">
              <div className="nl-field">
                <label htmlFor="bill-total">Tổng tiền bill gốc *</label>
                <input
                  id="bill-total"
                  inputMode="numeric"
                  placeholder="VD: 1.800.000"
                  value={amountInput}
                  onChange={(event) => handleAmountChange(event.target.value)}
                />
              </div>

              <div className="nl-field">
                <label htmlFor="bill-used-at">Thời gian sử dụng *</label>
                <input
                  id="bill-used-at"
                  type="datetime-local"
                  value={usedAt}
                  onInput={(event) => setUsedAt(event.currentTarget.value)}
                  onChange={(event) => setUsedAt(event.target.value)}
                />
              </div>
            </div>

            <div className="nl-field">
              <label>Ảnh / chứng từ</label>
              <div className="nl-upload-row">
                <label className="nl-upload-button">
                  <span>{evidenceFile ? "Đổi file" : "Chọn file"}</span>
                  <input
                    className="nl-upload-input"
                    type="file"
                    accept="image/*,.pdf"
                    onInput={(event) => handleEvidenceFileChange(event.currentTarget)}
                    onChange={(event) => handleEvidenceFileChange(event.currentTarget)}
                  />
                </label>
                {evidenceFile ? (
                  <span className="nl-file-pill">
                    {evidenceFile.name}
                    <button
                      type="button"
                      aria-label="Bỏ file"
                      onClick={() => {
                        setEvidenceFile(null);
                        setOcrPreview(null);
                      }}
                    >
                      Bá»
                    </button>
                  </span>
                ) : (
                  <span className="nl-hint">Khuyến khích gửi kèm để duyệt nhanh hơn.</span>
                )}
                {evidenceFile ? (
                  <button
                    type="button"
                    className="nl-ocr-button"
                    disabled={isReadingEvidence}
                    onClick={handleReadEvidence}
                  >
                    {isReadingEvidence ? "Đang đọc..." : "AI đọc bill"}
                  </button>
                ) : null}
              </div>
              {ocrPreview ? (
                <div className="nl-ocr-preview">
                  <strong>Độ tin cậy {Math.round(ocrPreview.confidence * 100)}%</strong>
                  <span>
                    Tổng tiền:{" "}
                    {ocrPreview.suggestions.totalVnd
                      ? moneyVnd(ocrPreview.suggestions.totalVnd)
                      : "cần nhập tay"}
                  </span>
                  <span>
                    Thời gian:{" "}
                    {ocrPreview.suggestions.usedAt
                      ? formatDateTime(ocrPreview.suggestions.usedAt)
                      : "cần nhập tay"}
                  </span>
                  {ocrPreview.warnings.length ? (
                    <em>{ocrPreview.warnings.slice(0, 2).join(" ")}</em>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className={isPastDeadline || isFutureUsage ? "nl-rule danger" : "nl-rule"}>
              <span>
                Chỉ nhập tổng tiền bill gốc, không nhập chi tiết món/dịch vụ. Bill quá 10 ngày sẽ
                không được nhận.
              </span>
            </div>

            {notice ? (
              <div className={`nl-notice ${notice.tone}`}>
                <span>{notice.message}</span>
              </div>
            ) : null}

            <button type="submit" className="nl-submit" disabled={!canSubmit}>
              {isSubmitting ? "Đang gửi bill..." : "Gửi bill"}
            </button>
          </form>

          <aside className="nl-bill-side">
            <div className="nl-side-row">
              <span>Quán</span>
              <strong>{selectedStore?.name ?? "Chọn quán"}</strong>
            </div>
            <div className="nl-side-row">
              <span>Coupon link</span>
              <strong>
                {selectedBooking?.coupon?.name ??
                  selectedBooking?.couponIssue?.code ??
                  selectedCouponIssue?.coupon.name ??
                  "Khong lien ket"}
              </strong>
            </div>
            <div className="nl-side-row">
              <span>Tổng tiền</span>
              <strong>{amount > 0 ? moneyVnd(amount) : "Chưa nhập"}</strong>
            </div>
            <div className="nl-side-row">
              <span>Thời gian sử dụng</span>
              <strong>
                {isUsedAtInvalid ? "Chưa có" : formatDateTime(usedAtDate.toISOString())}
              </strong>
            </div>
            <div className="nl-side-row">
              <span>Trạng thái deadline</span>
              <strong
                style={{ color: isPastDeadline || isFutureUsage ? colors.danger : colors.success }}
              >
                {isFutureUsage ? "Sai thời gian" : isPastDeadline ? "Quá hạn" : "Hợp lệ"}
              </strong>
            </div>

            <div className="nl-recent">
              <h2>Lịch sử bill</h2>
              {visibleSubmittedBills.length ? (
                visibleSubmittedBills.map((bill) => (
                  <article
                    key={bill.id}
                    className={bill.id === focusedBillId ? "active" : undefined}
                  >
                    <strong>{bill.billNumber ?? bill.id.slice(0, 8)}</strong>
                    <span>{bill.store?.name ?? selectedStore?.name ?? "Quán"}</span>
                    <em>
                      {moneyVnd(bill.totalVnd)} - {formatDateTime(bill.usedAt)}
                    </em>
                    <small>{billStatusLabel(bill.status)}</small>
                  </article>
                ))
              ) : (
                <p>Chưa có bill trong phạm vi này.</p>
              )}
            </div>
          </aside>
        </div>
      </section>

      <style jsx>{`
        .nl-bill-page {
          width: 100%;
          overflow-x: hidden;
        }

        .nl-bill-shell {
          width: min(100%, 1120px);
          max-width: 100%;
          box-sizing: border-box;
          margin: 0 auto;
          padding: 24px 18px 64px;
        }

        .nl-bill-page *,
        .nl-bill-page *::before,
        .nl-bill-page *::after {
          box-sizing: border-box;
        }

        .nl-bill-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-top: 18px;
        }

        .nl-bill-head h1 {
          margin: 0;
          font-size: clamp(26px, 4vw, 40px);
          line-height: 1.05;
          font-weight: 950;
          letter-spacing: 0;
        }

        .nl-bill-head p {
          max-width: 620px;
          margin: 10px 0 0;
          color: ${colors.muted};
          font-size: 14px;
          line-height: 1.6;
        }

        .nl-bill-rule,
        .nl-rule,
        .nl-notice {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid ${colors.border};
          border-radius: 8px;
          background: ${colors.panel};
          color: ${colors.goldPale};
          padding: 10px 12px;
          font-size: 12.5px;
          font-weight: 850;
        }

        .nl-bill-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: 18px;
          margin-top: 22px;
          align-items: start;
          min-width: 0;
        }

        .nl-bill-form,
        .nl-bill-side {
          min-width: 0;
          border: 1px solid ${colors.border};
          border-radius: 8px;
          background: ${colors.panel};
          padding: 16px;
          overflow: hidden;
        }

        .nl-submit,
        .nl-upload-button,
        .nl-file-pill button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid ${colors.border};
          border-radius: 8px;
          background: ${colors.panelStrong};
          color: ${colors.text};
          min-height: 44px;
          padding: 0 12px;
          font-weight: 900;
          cursor: pointer;
        }

        .nl-upload-button {
          position: relative;
          overflow: hidden;
        }

        .nl-submit {
          background: ${colors.gold};
          color: ${colors.onGold};
          border-color: ${colors.gold};
        }

        .nl-field {
          display: grid;
          gap: 7px;
          margin-top: 14px;
          min-width: 0;
        }

        .nl-field label {
          color: ${colors.muted};
          font-size: 12.5px;
          font-weight: 900;
        }

        .nl-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          min-width: 0;
        }

        .nl-form-grid > * {
          min-width: 0;
        }

        input,
        select {
          width: 100%;
          min-width: 0;
          max-width: 100%;
          min-height: 48px;
          border: 1px solid ${colors.border};
          border-radius: 8px;
          background: ${colors.panelStrong};
          color: ${colors.text};
          padding: 0 12px;
          font-size: 14px;
          outline: none;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        select option {
          background: #17171b;
          color: ${colors.text};
        }

        input:focus,
        select:focus {
          border-color: ${colors.borderStrong};
          box-shadow: 0 0 0 3px rgba(212, 178, 106, 0.12);
        }

        .nl-upload-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          min-width: 0;
        }

        .nl-upload-row > * {
          max-width: 100%;
        }

        .nl-upload-button input {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .nl-ocr-button {
          min-height: 38px;
          border: 1px solid ${colors.border};
          border-radius: 8px;
          background: rgba(212, 178, 106, 0.12);
          color: ${colors.goldPale};
          padding: 0 12px;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
        }

        .nl-ocr-button:disabled {
          cursor: wait;
          opacity: 0.7;
        }

        .nl-ocr-preview {
          display: grid;
          gap: 5px;
          margin-top: 10px;
          border: 1px solid rgba(129, 216, 157, 0.26);
          border-radius: 8px;
          background: rgba(129, 216, 157, 0.08);
          color: ${colors.text};
          padding: 10px;
          font-size: 12px;
          line-height: 1.45;
        }

        .nl-ocr-preview strong {
          color: ${colors.success};
          font-size: 12.5px;
        }

        .nl-ocr-preview em {
          color: ${colors.warning};
          font-style: normal;
        }

        .nl-file-pill {
          min-width: 0;
          flex: 1 1 180px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 1px solid ${colors.border};
          border-radius: 8px;
          background: rgba(129, 216, 157, 0.1);
          color: ${colors.success};
          padding: 9px 10px;
          font-size: 12.5px;
          font-weight: 850;
          max-width: 100%;
          white-space: normal;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .nl-file-pill button {
          flex: none;
          min-height: 28px;
          padding: 0 9px;
          color: ${colors.success};
        }

        .nl-hint {
          min-width: 0;
          color: ${colors.muted};
          font-size: 12.5px;
          overflow-wrap: anywhere;
        }

        .nl-rule {
          width: 100%;
          min-width: 0;
          margin-top: 14px;
          align-items: flex-start;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .nl-rule.danger,
        .nl-notice.danger {
          color: ${colors.danger};
          border-color: rgba(255, 107, 139, 0.36);
          background: rgba(255, 107, 139, 0.09);
        }

        .nl-notice {
          width: 100%;
          min-width: 0;
          margin-top: 14px;
          justify-content: flex-start;
          line-height: 1.45;
          overflow-wrap: anywhere;
        }

        .nl-notice.success {
          color: ${colors.success};
          border-color: rgba(129, 216, 157, 0.36);
          background: rgba(129, 216, 157, 0.09);
        }

        .nl-notice.warning {
          color: ${colors.warning};
          background: rgba(212, 178, 106, 0.1);
        }

        .nl-submit {
          width: 100%;
          margin-top: 14px;
          min-height: 50px;
          font-size: 15px;
        }

        .nl-submit:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .spin {
          animation: spin 0.8s linear infinite;
        }

        .nl-bill-side {
          display: grid;
          gap: 12px;
        }

        .nl-side-row {
          display: grid;
          gap: 4px;
          min-width: 0;
          border-bottom: 1px solid ${colors.border};
          padding-bottom: 11px;
        }

        .nl-side-row span {
          color: ${colors.muted};
          font-size: 12px;
          font-weight: 800;
        }

        .nl-side-row strong {
          color: ${colors.goldPale};
          font-size: 14px;
          line-height: 1.35;
          min-width: 0;
          overflow-wrap: anywhere;
        }

        .nl-recent {
          display: grid;
          gap: 10px;
          margin-top: 4px;
        }

        .nl-recent h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 950;
        }

        .nl-recent article {
          display: grid;
          gap: 4px;
          min-width: 0;
          border: 1px solid ${colors.border};
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.035);
          padding: 10px;
        }

        .nl-recent article.active {
          border-color: ${colors.gold};
          background: rgba(212, 178, 106, 0.12);
          box-shadow: 0 0 0 3px rgba(212, 178, 106, 0.08);
        }

        .nl-recent article span,
        .nl-recent p {
          color: ${colors.muted};
          font-size: 12.5px;
          margin: 0;
          min-width: 0;
          overflow-wrap: anywhere;
        }

        .nl-recent article em {
          color: ${colors.goldPale};
          font-size: 12px;
          font-style: normal;
          min-width: 0;
          overflow-wrap: anywhere;
        }

        .nl-recent article small {
          width: fit-content;
          color: ${colors.success};
          border: 1px solid rgba(129, 216, 157, 0.28);
          border-radius: 999px;
          padding: 3px 8px;
          font-size: 11px;
          font-weight: 900;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 860px) {
          .nl-bill-head {
            display: grid;
          }

          .nl-bill-layout {
            grid-template-columns: 1fr;
          }

          .nl-bill-side {
            order: -1;
          }
        }

        @media (max-width: 620px) {
          .nl-bill-shell {
            padding: 14px 10px calc(92px + env(safe-area-inset-bottom));
          }

          .nl-bill-form,
          .nl-bill-side {
            padding: 12px;
          }

          .nl-form-grid {
            grid-template-columns: 1fr;
          }

          .nl-bill-rule {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </main>
  );
}
