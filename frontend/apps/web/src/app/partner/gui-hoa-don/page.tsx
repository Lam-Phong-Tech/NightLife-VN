"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  FileText,
  ImagePlus,
  ReceiptText,
  RefreshCcw,
  Send,
} from "lucide-react";
import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { ApiError, translateApiMessage } from "@/lib/api/client";
import { billApi, type BillOcrPreview, type BillRecord, type BillStoreOption } from "@/lib/api/bills";

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
  danger: "#ff8da1",
  success: "#81d89d",
  warning: "#f0dda8",
};

const tenDaysMs = 10 * 24 * 60 * 60 * 1000;

type FormNotice =
  | { tone: "success"; message: string; bill?: BillRecord }
  | { tone: "warning" | "danger"; message: string };

const moneyVnd = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

const toDatetimeLocalValue = (date: Date) => {
  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localTime.toISOString().slice(0, 16);
};

const parseMoneyInput = (value: string) => Number(value.replace(/[^\d]/g, ""));

const formatDateTime = (value?: string | Date | null) => {
  if (!value) return "Chưa có";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const cleanApiMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "Chủ quán cần đăng nhập Partner để gửi bill.";
    }

    if (error.status === 403) {
      return "Bạn không có quyền gửi bill cho quán này.";
    }

    return translateApiMessage(error.message, error.status);
  }

  return translateApiMessage(
    error instanceof Error ? error.message : undefined,
    undefined,
    "Chưa gửi được bill. Vui lòng thử lại.",
  );
};

export default function PartnerBillSubmitPage() {
  const [stores, setStores] = useState<BillStoreOption[]>([]);
  const [storeSlug, setStoreSlug] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [usedAt, setUsedAt] = useState(() => toDatetimeLocalValue(new Date()));
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [ocrPreview, setOcrPreview] = useState<BillOcrPreview | null>(null);
  const [submittedBills, setSubmittedBills] = useState<BillRecord[]>([]);
  const [notice, setNotice] = useState<FormNotice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadingEvidence, setIsReadingEvidence] = useState(false);
  const [nowMs, setNowMs] = useState(0);

  useEffect(() => {
    let active = true;

    const loadPartnerBillScope = async () => {
      setIsLoading(true);
      try {
        const [storeItems, billItems] = await Promise.all([
          billApi.listPartnerStores(),
          billApi.listPartnerBills().catch(() => [] as BillRecord[]),
        ]);

        if (!active) return;
        setStores(storeItems);
        setSubmittedBills(billItems);
        setStoreSlug((current) =>
          current && storeItems.some((storeItem) => storeItem.slug === current)
            ? current
            : storeItems[0]?.slug || "",
        );
      } catch (error) {
        if (!active) return;
        setStores([]);
        setSubmittedBills([]);
        setStoreSlug("");
        setNotice({ tone: "danger", message: cleanApiMessage(error) });
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadPartnerBillScope();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const refreshWindow = () => setNowMs(Date.now());

    refreshWindow();
    const interval = window.setInterval(refreshWindow, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const selectedStore = useMemo(
    () => stores.find((storeItem) => storeItem.slug === storeSlug) ?? null,
    [storeSlug, stores],
  );
  const amount = useMemo(() => parseMoneyInput(amountInput), [amountInput]);
  const usedAtDate = useMemo(() => new Date(usedAt), [usedAt]);
  const isUsedAtInvalid = Number.isNaN(usedAtDate.getTime());
  const isFutureUsage = Boolean(nowMs) && !isUsedAtInvalid && usedAtDate.getTime() > nowMs;
  const isPastDeadline =
    Boolean(nowMs) && !isUsedAtInvalid && nowMs - usedAtDate.getTime() > tenDaysMs;
  const scopedHistory = useMemo(
    () =>
      selectedStore
        ? submittedBills.filter((bill) => bill.storeId === selectedStore.id || bill.store?.id === selectedStore.id)
        : submittedBills,
    [selectedStore, submittedBills],
  );
  const canSubmit =
    !isSubmitting &&
    !isLoading &&
    Boolean(nowMs) &&
    Boolean(storeSlug) &&
    amount > 0 &&
    Boolean(usedAt) &&
    !isUsedAtInvalid &&
    !isFutureUsage &&
    !isPastDeadline;

  const handleAmountChange = (value: string) => {
    const parsed = parseMoneyInput(value);
    setAmountInput(parsed ? parsed.toLocaleString("vi-VN") : "");
  };

  const handleEvidenceFileChange = (input: HTMLInputElement) => {
    setEvidenceFile(input.files?.[0] ?? null);
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

  const refreshPartnerHistory = async (fallbackBill: BillRecord) => {
    try {
      const billItems = await billApi.listPartnerBills();
      setSubmittedBills(billItems);
    } catch {
      setSubmittedBills((current) => [fallbackBill, ...current].slice(0, 12));
    }
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
      const bill = await billApi.submitPartnerBill({
        storeSlug,
        totalVnd: amount,
        usedAt: usedAtDate.toISOString(),
      });

      let uploadWarning = "";
      if (evidenceFile) {
        try {
          await billApi.uploadEvidence(bill.id, evidenceFile);
        } catch {
          uploadWarning = " Bill đã được gửi, nhưng ảnh/chứng từ chưa upload được.";
        }
      }

      await refreshPartnerHistory({
        ...bill,
        store: bill.store ?? selectedStore,
        storeId: bill.storeId || selectedStore?.id || bill.storeId,
      });
      setNotice({
        tone: uploadWarning ? "warning" : "success",
        message: `Đã gửi bill ${bill.billNumber ?? bill.id.slice(0, 8)} để Admin duyệt.${uploadWarning}`,
        bill,
      });
      setAmountInput("");
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
    <main className="partner-bill-page">
      <section className="partner-bill-shell">
        <Link className="partner-bill-back" href="/partner">
          <ArrowLeft size={16} />
          Partner portal
        </Link>

        <div className="partner-bill-head">
          <div>
            <span className="partner-bill-eyebrow">Partner Bill</span>
            <h1>Gửi hóa đơn cho chủ quán</h1>
            <p>
              Chủ quán chỉ chọn được các quán thuộc tài khoản của mình, gửi bill gốc và chứng từ để Admin duyệt.
            </p>
          </div>
          <div className="partner-bill-scope">
            <ReceiptText size={18} />
            <span>{stores.length ? `${stores.length} quán thuộc partner` : "Đang tải phạm vi"}</span>
          </div>
        </div>

        <div className="partner-bill-layout">
          <form className="partner-bill-form" noValidate onSubmit={handleSubmit}>
            <div className="partner-field">
              <label htmlFor="partner-bill-store">Quán thuộc partner *</label>
              <select
                id="partner-bill-store"
                value={storeSlug}
                disabled={isLoading || !stores.length}
                onChange={(event) => setStoreSlug(event.target.value)}
              >
                {stores.map((storeItem) => (
                  <option key={storeItem.id} value={storeItem.slug}>
                    {storeItem.name}
                    {storeItem.district ? ` - ${storeItem.district}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="partner-form-grid">
              <div className="partner-field">
                <label htmlFor="partner-bill-total">Tổng tiền bill gốc *</label>
                <input
                  id="partner-bill-total"
                  inputMode="numeric"
                  placeholder="VD: 1.800.000"
                  value={amountInput}
                  onChange={(event) => handleAmountChange(event.target.value)}
                />
              </div>
              <div className="partner-field">
                <label htmlFor="partner-bill-used-at">Thời gian sử dụng *</label>
                <input
                  id="partner-bill-used-at"
                  type="datetime-local"
                  value={usedAt}
                  onInput={(event) => setUsedAt(event.currentTarget.value)}
                  onChange={(event) => setUsedAt(event.target.value)}
                />
              </div>
            </div>

            <div className="partner-field">
              <label>Ảnh / chứng từ</label>
              <div className="partner-upload-row">
                <label className="partner-upload-button">
                  <ImagePlus size={16} />
                  <span>{evidenceFile ? "Đổi file" : "Chọn file"}</span>
                  <input
                    className="partner-upload-input"
                    type="file"
                    accept="image/*,.pdf"
                    onInput={(event) => handleEvidenceFileChange(event.currentTarget)}
                    onChange={(event) => handleEvidenceFileChange(event.currentTarget)}
                  />
                </label>
                {evidenceFile ? (
                  <>
                    <span className="partner-file-pill">
                      <FileText size={14} />
                      {evidenceFile.name}
                    </span>
                    <button
                      className="partner-ocr-button"
                      type="button"
                      disabled={isReadingEvidence}
                      onClick={handleReadEvidence}
                    >
                      <Bot size={16} />
                      {isReadingEvidence ? "Đang đọc" : "AI đọc bill"}
                    </button>
                  </>
                ) : (
                  <span className="partner-hint">Upload chứng từ sau khi bill tạo sẽ gắn media PROTECTED.</span>
                )}
              </div>

              {ocrPreview ? (
                <div className="partner-ocr-preview">
                  <strong>Độ tin cậy {Math.round(ocrPreview.confidence * 100)}%</strong>
                  <span>
                    Tổng tiền:{" "}
                    {ocrPreview.suggestions.totalVnd ? moneyVnd(ocrPreview.suggestions.totalVnd) : "cần nhập tay"}
                  </span>
                  <span>
                    Thời gian:{" "}
                    {ocrPreview.suggestions.usedAt ? formatDateTime(ocrPreview.suggestions.usedAt) : "cần nhập tay"}
                  </span>
                  {ocrPreview.warnings.length ? <em>{ocrPreview.warnings.slice(0, 2).join(" ")}</em> : null}
                </div>
              ) : null}
            </div>

            <div className={isPastDeadline || isFutureUsage ? "partner-rule danger" : "partner-rule"}>
              <AlertTriangle size={16} />
              <span>
                Chỉ nhập tổng tiền bill gốc. Bill quá 10 ngày hoặc thời gian tương lai sẽ không được nhận.
              </span>
            </div>

            {notice ? (
              <div className={`partner-notice ${notice.tone}`}>
                <span>{notice.message}</span>
              </div>
            ) : null}

            <button className="partner-submit" type="submit" disabled={!canSubmit}>
              {isSubmitting ? <RefreshCcw size={16} /> : <Send size={16} />}
              {isSubmitting ? "Đang gửi bill" : "Gửi bill Partner"}
            </button>
          </form>

          <aside className="partner-bill-side">
            <div className="partner-side-card">
              <h2>Phạm vi gửi bill</h2>
              <div className="partner-side-row">
                <span>Quán đang chọn</span>
                <strong>{selectedStore?.name ?? "Chưa có quán"}</strong>
              </div>
              <div className="partner-side-row">
                <span>Phạm vi quán</span>
                <strong>Thuộc tài khoản</strong>
              </div>
              <div className="partner-side-row">
                <span>Người gửi</span>
                <strong>Chủ quán</strong>
              </div>
              <div className="partner-side-row">
                <span>Trạng thái</span>
                <strong style={{ color: isPastDeadline || isFutureUsage ? colors.danger : colors.success }}>
                  {isFutureUsage ? "Sai thời gian" : isPastDeadline ? "Quá hạn" : "Hợp lệ"}
                </strong>
              </div>
            </div>

            <div className="partner-history">
              <h2>Lịch sử bill theo quán</h2>
              <p>Danh sách chỉ hiển thị bill trong phạm vi quán của tài khoản Partner.</p>
              {scopedHistory.length ? (
                scopedHistory.slice(0, 8).map((bill) => (
                  <article key={bill.id}>
                    <span>
                      <strong>{bill.billNumber ?? bill.id.slice(0, 8)}</strong>
                      <small>{bill.submitterType === "PARTNER" ? "Chủ quán" : bill.submitterType ?? "Partner"}</small>
                    </span>
                    <em>{bill.store?.name ?? selectedStore?.name ?? "Quán"}</em>
                    <b>{moneyVnd(bill.totalVnd)}</b>
                    <small>
                      {bill.status} · {formatDateTime(bill.usedAt ?? bill.submittedAt)}
                    </small>
                    {bill.media?.length ? <small>Chứng từ {bill.media.length}</small> : null}
                  </article>
                ))
              ) : (
                <div className="partner-empty">
                  <CheckCircle2 size={18} />
                  Chưa có bill trong quán đang chọn.
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      <style jsx>{`
        .partner-bill-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 20% 0%, rgba(212, 178, 106, 0.14), transparent 30%),
            ${colors.bg};
          color: ${colors.text};
        }

        .partner-bill-shell {
          width: min(1160px, calc(100% - 32px));
          margin: 0 auto;
          padding: 28px 0 72px;
        }

        .partner-bill-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: ${colors.muted};
          text-decoration: none;
          font-size: 13px;
          font-weight: 800;
        }

        .partner-bill-head {
          margin-top: 18px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
        }

        .partner-bill-eyebrow {
          color: ${colors.gold};
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.6px;
          text-transform: uppercase;
        }

        .partner-bill-head h1 {
          margin: 7px 0 0;
          font-size: clamp(28px, 5vw, 46px);
          line-height: 1.05;
          font-weight: 950;
          letter-spacing: 0;
        }

        .partner-bill-head p {
          max-width: 680px;
          margin: 12px 0 0;
          color: ${colors.muted};
          line-height: 1.65;
          font-size: 14px;
        }

        .partner-bill-scope {
          min-height: 42px;
          border: 1px solid ${colors.borderStrong};
          border-radius: 8px;
          padding: 0 14px;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: ${colors.goldPale};
          background: rgba(212, 178, 106, 0.08);
          font-size: 13px;
          font-weight: 850;
          white-space: nowrap;
        }

        .partner-bill-layout {
          margin-top: 24px;
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
          gap: 18px;
          align-items: start;
        }

        .partner-bill-form,
        .partner-side-card,
        .partner-history {
          border: 1px solid ${colors.border};
          border-radius: 8px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.025));
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.24);
        }

        .partner-bill-form {
          padding: 20px;
          display: grid;
          gap: 16px;
        }

        .partner-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .partner-field {
          display: grid;
          gap: 8px;
        }

        .partner-field label {
          color: ${colors.goldPale};
          font-size: 13px;
          font-weight: 900;
        }

        .partner-field input,
        .partner-field select {
          width: 100%;
          min-height: 48px;
          border: 1px solid ${colors.borderStrong};
          border-radius: 8px;
          padding: 0 13px;
          background: rgba(255, 255, 255, 0.06);
          color: ${colors.text};
          font-size: 15px;
          font-weight: 750;
          outline: none;
        }

        .partner-field select option {
          background: #171719;
          color: ${colors.text};
        }

        .partner-upload-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
        }

        .partner-upload-button,
        .partner-ocr-button {
          min-height: 42px;
          border: 1px solid ${colors.borderStrong};
          border-radius: 8px;
          padding: 0 13px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.055);
          color: ${colors.text};
          font-weight: 850;
          cursor: pointer;
        }

        .partner-upload-input {
          display: none;
        }

        .partner-file-pill {
          min-height: 42px;
          max-width: min(100%, 280px);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 8px;
          padding: 0 12px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: ${colors.muted};
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .partner-hint {
          color: ${colors.dim};
          font-size: 12px;
          line-height: 1.55;
        }

        .partner-ocr-preview,
        .partner-rule,
        .partner-notice,
        .partner-empty {
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.045);
        }

        .partner-ocr-preview {
          margin-top: 10px;
          padding: 12px;
          display: grid;
          gap: 5px;
          color: ${colors.text};
          font-size: 12px;
        }

        .partner-ocr-preview span,
        .partner-ocr-preview em {
          color: ${colors.muted};
        }

        .partner-rule {
          padding: 12px;
          display: flex;
          gap: 10px;
          color: ${colors.warning};
          font-size: 12px;
          line-height: 1.55;
          font-weight: 750;
        }

        .partner-rule.danger {
          border-color: rgba(255, 141, 161, 0.45);
          color: ${colors.danger};
        }

        .partner-notice {
          padding: 12px;
          font-size: 13px;
          line-height: 1.55;
          font-weight: 800;
        }

        .partner-notice.success {
          border-color: rgba(129, 216, 157, 0.38);
          color: ${colors.success};
        }

        .partner-notice.warning {
          border-color: rgba(240, 221, 168, 0.44);
          color: ${colors.warning};
        }

        .partner-notice.danger {
          border-color: rgba(255, 141, 161, 0.42);
          color: ${colors.danger};
        }

        .partner-submit {
          min-height: 52px;
          border: 0;
          border-radius: 8px;
          background: linear-gradient(135deg, #f4e3b4, #d4b26a 56%, #b6924a);
          color: ${colors.onGold};
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 950;
          cursor: pointer;
        }

        .partner-submit:disabled {
          opacity: 0.52;
          cursor: not-allowed;
        }

        .partner-bill-side {
          display: grid;
          gap: 14px;
        }

        .partner-side-card,
        .partner-history {
          padding: 17px;
        }

        .partner-side-card h2,
        .partner-history h2 {
          margin: 0;
          font-size: 17px;
          letter-spacing: 0;
        }

        .partner-side-row {
          min-height: 44px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          color: ${colors.muted};
          font-size: 12px;
        }

        .partner-side-row strong {
          color: ${colors.text};
          text-align: right;
        }

        .partner-history p {
          margin: 8px 0 12px;
          color: ${colors.muted};
          font-size: 12px;
          line-height: 1.55;
        }

        .partner-history article {
          border-top: 1px solid rgba(255, 255, 255, 0.07);
          padding: 12px 0;
          display: grid;
          gap: 5px;
        }

        .partner-history article span {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .partner-history article strong {
          color: ${colors.text};
        }

        .partner-history article em,
        .partner-history article small {
          color: ${colors.muted};
          font-size: 12px;
          font-style: normal;
        }

        .partner-history article b {
          color: ${colors.goldPale};
        }

        .partner-empty {
          min-height: 78px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px;
          color: ${colors.muted};
          font-size: 13px;
        }

        @media (max-width: 860px) {
          .partner-bill-head,
          .partner-bill-layout {
            grid-template-columns: 1fr;
          }

          .partner-bill-head {
            display: grid;
          }

          .partner-bill-scope {
            width: fit-content;
          }

          .partner-form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
