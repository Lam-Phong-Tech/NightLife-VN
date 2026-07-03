"use client";

import Link from "next/link";
import React, { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  ImagePlus,
  Loader2,
  ReceiptText,
  Store,
  UploadCloud,
  UserRound,
  X,
} from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { billApi, type BillRecord } from "@/lib/api/bills";
import { bookingApi, type BookingRecord } from "@/lib/api/bookings";
import { couponApi, type CouponIssue } from "@/lib/api/coupons";
import { discoveryApi, type PublicStore } from "@/lib/api/discovery";

const colors = {
  bg: "#0c0c0f",
  panel: "rgba(255,255,255,.045)",
  panelStrong: "rgba(255,255,255,.07)",
  border: "rgba(212,178,106,.22)",
  borderStrong: "rgba(212,178,106,.34)",
  text: "#f3f0ea",
  muted: "#b6b1a6",
  dim: "#8c8679",
  gold: "#d4b26a",
  goldPale: "#f0dda8",
  onGold: "#241a0a",
  danger: "#ff6b8b",
  success: "#81d89d",
  warning: "#f0dda8",
};

const tenDaysMs = 10 * 24 * 60 * 60 * 1000;

type SubmitMode = "member" | "partner";

type FormNotice =
  | { tone: "success"; message: string; bill?: BillRecord }
  | { tone: "warning" | "danger"; message: string };

const moneyVnd = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

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
      return "Bạn cần đăng nhập bằng tài khoản khách hoặc chủ quán trước khi gửi bill.";
    }

    if (Array.isArray(error.message)) {
      return error.message.join(", ");
    }

    return error.message;
  }

  return "Chưa gửi được bill. Vui lòng thử lại.";
};

export default function Page() {
  const [mode, setMode] = useState<SubmitMode>("member");
  const [stores, setStores] = useState<PublicStore[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [couponIssues, setCouponIssues] = useState<CouponIssue[]>([]);
  const [storeSlug, setStoreSlug] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [couponIssueId, setCouponIssueId] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [usedAt, setUsedAt] = useState(() => toDatetimeLocalValue(new Date()));
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [notice, setNotice] = useState<FormNotice | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedBills, setSubmittedBills] = useState<BillRecord[]>([]);
  const [timeWindow, setTimeWindow] = useState({
    nowMs: 0,
  });

  useEffect(() => {
    let active = true;

    const loadOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const [storeItems, bookingItems, couponIssueItems] = await Promise.all([
          discoveryApi.listStores({ city: "all", limit: 80 }),
          bookingApi.listMemberBookings().catch(() => [] as BookingRecord[]),
          couponApi.listMemberCouponIssues().catch(() => [] as CouponIssue[]),
        ]);

        if (!active) return;
        setStores(storeItems);
        setBookings(bookingItems);
        setCouponIssues(couponIssueItems.filter(canAttachCouponIssueToBill));
        setStoreSlug((current) => current || storeItems[0]?.slug || "");
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
      return stores.find((storeItem) => storeItem.slug === selectedCouponIssue.coupon.store?.slug) ?? null;
    }

    return stores.find((storeItem) => storeItem.slug === storeSlug) ?? null;
  }, [selectedBooking, selectedCouponIssue, storeSlug, stores]);

  const amount = useMemo(() => parseMoneyInput(amountInput), [amountInput]);
  const usedAtDate = useMemo(() => new Date(usedAt), [usedAt]);
  const isUsedAtInvalid = Number.isNaN(usedAtDate.getTime());
  const isFutureUsage =
    Boolean(timeWindow.nowMs) && !isUsedAtInvalid && usedAtDate.getTime() > timeWindow.nowMs;
  const isPastDeadline =
    Boolean(timeWindow.nowMs) &&
    !isUsedAtInvalid &&
    timeWindow.nowMs - usedAtDate.getTime() > tenDaysMs;
  const canSubmit =
    !isSubmitting &&
    Boolean(timeWindow.nowMs) &&
    amount > 0 &&
    Boolean(usedAt) &&
    !isUsedAtInvalid &&
    !isFutureUsage &&
    !isPastDeadline &&
    Boolean(bookingId || storeSlug);

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

    if (!canSubmit) {
      setNotice({
        tone: "danger",
        message: "Kiểm tra lại quán, tổng tiền bill gốc và thời gian sử dụng.",
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
      const bill =
        mode === "partner"
          ? await billApi.submitPartnerBill(payload)
          : await billApi.submitMemberBill(payload);

      let uploadWarning = "";
      if (evidenceFile) {
        try {
          await billApi.uploadEvidence(bill.id, evidenceFile);
        } catch {
          uploadWarning = " Bill đã được gửi, nhưng ảnh/chứng từ chưa upload được.";
        }
      }

      setSubmittedBills((current) => [bill, ...current].slice(0, 5));
      setNotice({
        tone: uploadWarning ? "warning" : "success",
        message: `Đã gửi bill ${bill.billNumber ?? bill.id.slice(0, 8)} để Admin duyệt.${uploadWarning}`,
        bill,
      });
      setAmountInput("");
      setBookingId("");
      setCouponIssueId("");
      setEvidenceFile(null);
      setUsedAt(toDatetimeLocalValue(new Date()));
    } catch (error) {
      setNotice({ tone: "danger", message: cleanApiMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: colors.bg, color: colors.text }}>
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "24px 18px 64px" }}>
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
          <ChevronLeft size={17} />
          Tài khoản
        </Link>

        <div className="nl-bill-head">
          <div>
            <h1>Gửi hóa đơn</h1>
            <p>Gửi bill gốc để Admin đối soát điểm, ưu đãi và công nợ với quán.</p>
          </div>
          <div className="nl-bill-rule">
            <Clock3 size={17} />
            Trong 10 ngày
          </div>
        </div>

        <div className="nl-bill-layout">
          <form className="nl-bill-form" onSubmit={handleSubmit}>
            <div className="nl-segmented" aria-label="Vai trò gửi bill">
              <button
                type="button"
                className={mode === "member" ? "active" : ""}
                onClick={() => setMode("member")}
              >
                <UserRound size={16} />
                Khách
              </button>
              <button
                type="button"
                className={mode === "partner" ? "active" : ""}
                onClick={() => setMode("partner")}
              >
                <Building2 size={16} />
                Chủ quán
              </button>
            </div>

            <div className="nl-field">
              <label htmlFor="bill-store">Quán / cơ sở *</label>
              <div className="nl-input-icon">
                <Store size={17} />
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
            </div>

            {mode === "member" && bookings.length ? (
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

            {mode === "member" && !selectedBooking && couponIssues.length ? (
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
                <div className="nl-input-icon">
                  <ReceiptText size={17} />
                  <input
                    id="bill-total"
                    inputMode="numeric"
                    placeholder="VD: 1.800.000"
                    value={amountInput}
                    onChange={(event) => handleAmountChange(event.target.value)}
                  />
                </div>
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
                  <ImagePlus size={18} />
                  <span>{evidenceFile ? "Đổi file" : "Chọn file"}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(event) => setEvidenceFile(event.target.files?.[0] ?? null)}
                  />
                </label>
                {evidenceFile ? (
                  <span className="nl-file-pill">
                    <UploadCloud size={15} />
                    {evidenceFile.name}
                    <button
                      type="button"
                      aria-label="Bỏ file"
                      onClick={() => setEvidenceFile(null)}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ) : (
                  <span className="nl-hint">Khuyến khích gửi kèm để duyệt nhanh hơn.</span>
                )}
              </div>
            </div>

            <div className={isPastDeadline || isFutureUsage ? "nl-rule danger" : "nl-rule"}>
              <AlertTriangle size={17} />
              <span>
                Chỉ nhập tổng tiền bill gốc, không nhập chi tiết món/dịch vụ. Bill quá 10 ngày sẽ
                không được nhận.
              </span>
            </div>

            {notice ? (
              <div className={`nl-notice ${notice.tone}`}>
                {notice.tone === "success" ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertTriangle size={18} />
                )}
                <span>{notice.message}</span>
              </div>
            ) : null}

            <button type="submit" className="nl-submit" disabled={!canSubmit}>
              {isSubmitting ? <Loader2 size={18} className="spin" /> : <ReceiptText size={18} />}
              Gửi bill
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
              <h2>Bill vừa gửi</h2>
              {submittedBills.length ? (
                submittedBills.map((bill) => (
                  <article key={bill.id}>
                    <strong>{bill.billNumber ?? bill.id.slice(0, 8)}</strong>
                    <span>{bill.store?.name ?? selectedStore?.name ?? "Quán"}</span>
                    <em>
                      {moneyVnd(bill.totalVnd)} - {formatDateTime(bill.usedAt)}
                    </em>
                  </article>
                ))
              ) : (
                <p>Chưa có bill mới trong phiên này.</p>
              )}
            </div>
          </aside>
        </div>
      </section>

      <style jsx>{`
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
        }

        .nl-bill-form,
        .nl-bill-side {
          border: 1px solid ${colors.border};
          border-radius: 8px;
          background: ${colors.panel};
          padding: 16px;
        }

        .nl-segmented {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 16px;
        }

        .nl-segmented button,
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

        .nl-segmented button.active,
        .nl-submit {
          background: ${colors.gold};
          color: ${colors.onGold};
          border-color: ${colors.gold};
        }

        .nl-field {
          display: grid;
          gap: 7px;
          margin-top: 14px;
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
        }

        .nl-input-icon {
          position: relative;
        }

        .nl-input-icon svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: ${colors.goldPale};
          pointer-events: none;
        }

        input,
        select {
          width: 100%;
          min-height: 48px;
          border: 1px solid ${colors.border};
          border-radius: 8px;
          background: ${colors.panelStrong};
          color: ${colors.text};
          padding: 0 12px;
          font-size: 14px;
          outline: none;
        }

        .nl-input-icon input,
        .nl-input-icon select {
          padding-left: 40px;
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
        }

        .nl-upload-button input {
          display: none;
        }

        .nl-file-pill {
          min-width: 0;
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
        }

        .nl-file-pill button {
          width: 24px;
          min-height: 24px;
          padding: 0;
          color: ${colors.success};
        }

        .nl-hint {
          color: ${colors.muted};
          font-size: 12.5px;
        }

        .nl-rule {
          width: 100%;
          margin-top: 14px;
          align-items: flex-start;
          line-height: 1.5;
        }

        .nl-rule.danger,
        .nl-notice.danger {
          color: ${colors.danger};
          border-color: rgba(255, 107, 139, 0.36);
          background: rgba(255, 107, 139, 0.09);
        }

        .nl-notice {
          width: 100%;
          margin-top: 14px;
          justify-content: flex-start;
          line-height: 1.45;
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
          border: 1px solid ${colors.border};
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.035);
          padding: 10px;
        }

        .nl-recent article span,
        .nl-recent p {
          color: ${colors.muted};
          font-size: 12.5px;
          margin: 0;
        }

        .nl-recent article em {
          color: ${colors.goldPale};
          font-size: 12px;
          font-style: normal;
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
          .nl-form-grid,
          .nl-segmented {
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
