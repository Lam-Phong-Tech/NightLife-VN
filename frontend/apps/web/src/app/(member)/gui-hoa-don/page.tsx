"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Clock3,
  ImagePlus,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";

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
  goldGrad: "linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)",
};

const filters = ["Tất cả", "Chờ duyệt", "Đã duyệt", "Bị từ chối"] as const;

const invoices = [
  {
    venue: "Club Lumière",
    date: "21/06",
    amount: "2.400.000đ",
    status: "Đã duyệt",
    note: "+24 điểm đã cộng",
    tone: "success",
    image: "linear-gradient(140deg,#d6336c,#7b2d6b)",
  },
  {
    venue: "KTV Hoàng Gia",
    date: "18/06",
    amount: "1.800.000đ",
    status: "Chờ duyệt",
    note: "Đang chờ Admin duyệt",
    tone: "pending",
    image: "linear-gradient(140deg,#3a8fb0,#2d5fae)",
  },
  {
    venue: "Diamond Bar",
    date: "08/06",
    amount: "1.200.000đ",
    status: "Bị từ chối",
    note: "Lý do: ảnh bill mờ, vui lòng gửi lại.",
    tone: "danger",
    image: "linear-gradient(140deg,#e0a23a,#c0782d)",
  },
  {
    venue: "Sakura Lounge",
    date: "12/06",
    amount: "3.500.000đ",
    status: "Đã duyệt",
    note: "+35 điểm đã cộng",
    tone: "success",
    image: "linear-gradient(140deg,#8a6ad0,#5d3da8)",
  },
] as const;

type Invoice = (typeof invoices)[number];

export default function Page() {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("Tất cả");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const visibleInvoices =
    activeFilter === "Tất cả" ? invoices : invoices.filter((invoice) => invoice.status === activeFilter);

  const openInvoiceForm = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    window.requestAnimationFrame(() => {
      document.getElementById("invoice-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <main style={{ minHeight: "100vh", background: colors.bg, color: colors.text }}>
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "24px 18px 54px" }}>
        <Link href="/tai-khoan" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: colors.muted, fontSize: 13, fontWeight: 800 }}>
          <ChevronLeft size={17} />
          Tài khoản
        </Link>

        <div className="nl-member-page-head" style={{ marginTop: 18 }}>
          <div>
            <h1 style={{ marginTop: 0, fontSize: "clamp(26px,4vw,40px)", lineHeight: 1.05, fontWeight: 950 }}>
              Gửi hóa đơn
            </h1>
            <p style={{ marginTop: 10, color: colors.muted, fontSize: 14, lineHeight: 1.6, maxWidth: 620 }}>
              Gửi tổng tiền hóa đơn để Admin đối soát và cộng điểm thành viên.
            </p>
          </div>
          <div style={{ border: `1px solid ${colors.border}`, borderRadius: 14, background: colors.panel, padding: "11px 14px", color: colors.goldPale, fontSize: 13, fontWeight: 900 }}>
            1.000.000đ = 10 điểm
          </div>
        </div>

        <div className="nl-invoice-layout" style={{ display: "grid", gap: 18, marginTop: 22 }}>
          {selectedInvoice ? (
            <section id="invoice-form" style={{ border: `1px solid ${colors.border}`, borderRadius: 18, background: colors.panel, padding: 18, height: "fit-content" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: colors.goldPale, fontWeight: 950 }}>
                  <Sparkles size={18} />
                  Thông tin hóa đơn
                </div>
                <button type="button" onClick={() => setSelectedInvoice(null)} style={secondaryButtonStyle}>
                  Ẩn form
                </button>
              </div>

              <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
                <SelectField label="Quán" required value={`${selectedInvoice.venue} · Tây Hồ`} />
                <div className="nl-invoice-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <InputField label="Số tiền" required defaultValue={selectedInvoice.amount} />
                  <InputField label="Thời gian" required defaultValue={`${selectedInvoice.date} · 21:00`} />
                </div>
                <InputField label="Cơ sở / chi nhánh" optional placeholder="VD: cơ sở Quảng An" />
                <SelectField label="Liên kết đặt chỗ / mã" optional value="Booking #BK-2041" />
                <UploadBox />
              </div>

              <div style={{ marginTop: 14, border: `1px solid ${colors.border}`, borderRadius: 12, background: "rgba(212,178,106,.09)", padding: "11px 13px", color: colors.goldPale, fontSize: 12.5, lineHeight: 1.6 }}>
                Gửi trong vòng <strong>10 ngày</strong> kể từ ngày dùng dịch vụ. Chỉ ghi <strong>tổng tiền</strong>, không nhập chi tiết món.
              </div>

              <button type="button" style={primaryButtonStyle}>
                Gửi hóa đơn
              </button>
            </section>
          ) : null}

          <section style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
              <h2 style={{ fontSize: 20, fontWeight: 950 }}>Lịch sử hóa đơn</h2>
              <span style={{ color: colors.muted, fontSize: 13 }}>
                Đã tích: <strong style={{ color: colors.goldPale }}>156 điểm</strong>
              </span>
            </div>

            <div className="hscroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginTop: 14 }}>
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  style={{
                    border: `1px solid ${activeFilter === filter ? colors.gold : colors.border}`,
                    background: activeFilter === filter ? colors.goldGrad : colors.panel,
                    color: activeFilter === filter ? colors.onGold : colors.muted,
                    minHeight: 40,
                    borderRadius: 999,
                    padding: "9px 14px",
                    fontSize: 12.5,
                    fontWeight: 900,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gap: 12, marginTop: 10 }}>
              {visibleInvoices.map((invoice) => (
                <InvoiceCard key={`${invoice.venue}-${invoice.date}`} invoice={invoice} onOpen={() => openInvoiceForm(invoice)} />
              ))}
            </div>

            {visibleInvoices.length === 0 ? (
              <div style={{ marginTop: 18, border: `1px solid ${colors.border}`, borderRadius: 18, background: colors.panel, padding: 24, textAlign: "center", color: colors.muted }}>
                Chưa có hóa đơn ở trạng thái này.
              </div>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}

function Label({ children, required, optional }: { children: React.ReactNode; required?: boolean; optional?: boolean }) {
  return (
    <label style={{ color: colors.muted, fontSize: 12.5, fontWeight: 900 }}>
      {children} {required ? <span style={{ color: colors.danger }}>*</span> : null}
      {optional ? <span style={{ color: colors.dim, fontWeight: 700 }}>(tùy chọn)</span> : null}
    </label>
  );
}

function InputField({ label, defaultValue, placeholder, required, optional }: { label: string; defaultValue?: string; placeholder?: string; required?: boolean; optional?: boolean }) {
  return (
    <div>
      <Label required={required} optional={optional}>
        {label}
      </Label>
      <input defaultValue={defaultValue} placeholder={placeholder} style={inputStyle} />
    </div>
  );
}

function SelectField({ label, value, required, optional }: { label: string; value: string; required?: boolean; optional?: boolean }) {
  return (
    <div>
      <Label required={required} optional={optional}>
        {label}
      </Label>
      <button type="button" style={selectStyle}>
        <span>{value}</span>
        <ChevronDown size={16} color={colors.muted} />
      </button>
    </div>
  );
}

function UploadBox() {
  return (
    <div>
      <Label optional>Ảnh chứng từ</Label>
      <button type="button" style={uploadStyle}>
        <span style={{ width: 38, height: 38, borderRadius: 12, display: "grid", placeItems: "center", background: "rgba(212,178,106,.12)", color: colors.gold }}>
          <ImagePlus size={20} />
        </span>
        <span style={{ minWidth: 0 }}>
          <strong style={{ display: "block", color: colors.goldPale, fontSize: 13.5 }}>Chọn ảnh bill</strong>
          <small style={{ display: "block", color: colors.muted, fontSize: 12, marginTop: 3 }}>Nên gửi để Admin đối chiếu nhanh hơn</small>
        </span>
      </button>
    </div>
  );
}

function InvoiceCard({ invoice, onOpen }: { invoice: Invoice; onOpen: () => void }) {
  return (
    <article
      className="nl-invoice-history-card"
      style={{
        display: "grid",
        gridTemplateColumns: "48px minmax(0,1fr)",
        gap: 13,
        alignItems: "start",
        border: `1px solid ${colors.border}`,
        borderRadius: 18,
        background: colors.panel,
        padding: 12,
      }}
    >
      <span style={{ width: 48, height: 48, borderRadius: 14, background: invoice.image, border: `1px solid ${colors.borderStrong}` }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: 14.5, fontWeight: 950, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{invoice.venue}</h3>
            <div style={{ marginTop: 3, color: colors.muted, fontSize: 12 }}>
              {invoice.date} · {invoice.amount}
            </div>
          </div>
          <StatusBadge status={invoice.status} tone={invoice.tone} />
        </div>

        <div
          className="nl-invoice-card-footer"
          style={{ marginTop: 11, paddingTop: 10, borderTop: `1px solid ${colors.border}`, display: "grid", gap: 10 }}
        >
          <span style={{ color: toneColor(invoice.tone), fontSize: 12.5, lineHeight: 1.5 }}>{invoice.note}</span>
          <span className="nl-invoice-actions" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, width: "100%", flexWrap: "wrap" }}>
            <button type="button" onClick={onOpen} style={detailButtonStyle}>
              Chi tiết hóa đơn
            </button>
            {invoice.tone === "danger" ? (
              <button type="button" onClick={onOpen} style={retryButtonStyle}>
                <RotateCcw size={13} />
                Gửi lại
              </button>
            ) : null}
          </span>
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ status, tone }: { status: string; tone: string }) {
  const Icon = tone === "success" ? CheckCircle2 : tone === "danger" ? XCircle : Clock3;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 999, padding: "5px 9px", background: "rgba(255,255,255,.06)", color: toneColor(tone), fontSize: 11, fontWeight: 900, whiteSpace: "nowrap" }}>
      <Icon size={13} />
      {status}
    </span>
  );
}

function toneColor(tone: string) {
  if (tone === "success") return colors.success;
  if (tone === "danger") return colors.danger;
  return colors.warning;
}

const fieldBaseStyle: React.CSSProperties = {
  marginTop: 7,
  width: "100%",
  minHeight: 48,
  border: `1px solid ${colors.border}`,
  borderRadius: 12,
  background: colors.panelStrong,
  color: colors.text,
  padding: "0 14px",
  fontSize: 14,
  outline: "none",
  boxShadow: "inset 0 0 0 1px rgba(255,255,255,.02)",
};

const inputStyle: React.CSSProperties = {
  ...fieldBaseStyle,
};

const selectStyle: React.CSSProperties = {
  ...fieldBaseStyle,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  cursor: "pointer",
  textAlign: "left",
};

const uploadStyle: React.CSSProperties = {
  marginTop: 7,
  width: "100%",
  minHeight: 86,
  border: `1px dashed ${colors.borderStrong}`,
  borderRadius: 12,
  background: colors.panelStrong,
  color: colors.text,
  padding: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  textAlign: "left",
  cursor: "pointer",
};

const primaryButtonStyle: React.CSSProperties = {
  marginTop: 14,
  width: "100%",
  minHeight: 50,
  border: 0,
  borderRadius: 14,
  background: colors.goldGrad,
  color: colors.onGold,
  padding: "14px 18px",
  fontWeight: 950,
  fontSize: 15,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  minHeight: 42,
  border: `1px solid ${colors.border}`,
  borderRadius: 12,
  background: colors.panelStrong,
  color: colors.goldPale,
  padding: "0 12px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  fontSize: 12,
  fontWeight: 900,
  cursor: "pointer",
};

const detailButtonStyle: React.CSSProperties = {
  ...secondaryButtonStyle,
  minWidth: 132,
};

const retryButtonStyle: React.CSSProperties = {
  ...secondaryButtonStyle,
  minWidth: 86,
};
