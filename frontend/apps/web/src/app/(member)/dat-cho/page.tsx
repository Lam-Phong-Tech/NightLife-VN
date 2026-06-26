"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { CalendarDays, ChevronLeft, Clock, Minus, Plus, Sparkles, UsersRound } from "lucide-react";

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
  goldGrad: "linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)",
};

const couponItems = ["Happy Hour -30%", "Combo VIP 2+1", "Welcome -8%", "Không dùng mã"] as const;

export default function Page() {
  const router = useRouter();
  const [mode, setMode] = useState<"guest" | "member">("guest");
  const [guests, setGuests] = useState(4);
  const [coupon, setCoupon] = useState<(typeof couponItems)[number]>(couponItems[0]);

  const submit = () => router.push("/xac-nhan");

  return (
    <main style={{ minHeight: "100vh", background: colors.bg, color: colors.text }}>
      <section style={{ maxWidth: "1120px", margin: "0 auto", padding: "26px 22px 54px" }}>
        <Link href="/stores/club-lumiere" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: colors.muted, fontSize: 13, fontWeight: 700 }}>
          <ChevronLeft size={17} />
          Club Lumiere
        </Link>

        <div className="nl-booking-layout" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: 22, marginTop: 18 }}>
          <div style={{ border: `1px solid ${colors.border}`, background: colors.panel, borderRadius: 18, overflow: "hidden" }}>
            <div
              style={{
                minHeight: 178,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                background:
                  "linear-gradient(180deg,rgba(12,12,15,.12),rgba(12,12,15,.9)),url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=80') center/cover",
              }}
            >
              <span style={{ color: colors.goldPale, fontSize: 12, fontWeight: 800, letterSpacing: ".16em" }}>YEU CAU DAT CHO</span>
              <h1 style={{ marginTop: 8, fontSize: 34, lineHeight: 1.08, fontWeight: 900 }}>Đặt bàn tại Club Lumiere</h1>
              <p style={{ marginTop: 10, color: colors.muted, maxWidth: 620, fontSize: 14, lineHeight: 1.6 }}>
                Gửi yêu cầu cho admin xác nhận với quán. Không thu cọc, không thanh toán online.
              </p>
            </div>

            <div style={{ padding: 22, display: "grid", gap: 18 }}>
              <div style={{ display: "flex", gap: 8, background: colors.panelStrong, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 5, maxWidth: 420 }}>
                {[
                  ["guest", "Đặt nhanh"],
                  ["member", "Hội viên"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMode(value as "guest" | "member")}
                    style={{
                      flex: 1,
                      border: 0,
                      borderRadius: 10,
                      padding: "11px 14px",
                      background: mode === value ? colors.goldGrad : "transparent",
                      color: mode === value ? colors.onGold : colors.muted,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div style={{ color: colors.goldPale, background: "rgba(212,178,106,.09)", border: `1px solid ${colors.border}`, borderRadius: 12, padding: "11px 13px", fontSize: 13 }}>
                {mode === "guest" ? "Guest: giữ mã 24 giờ, admin xác nhận qua điện thoại." : "Hội viên: lưu lịch đặt chỗ và nhận ưu đãi tốt hơn."}
              </div>

              <div className="nl-booking-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Họ tên" placeholder="Nguyễn Văn A" />
                <Field label="Số điện thoại" placeholder="0912 345 678" />
                <ReadOnlyField icon={<CalendarDays size={16} />} label="Ngày" value="T6 - 21/06" />
                <ReadOnlyField icon={<Clock size={16} />} label="Giờ" value="21:00" />
              </div>

              <div className="nl-booking-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <Label>Số khách</Label>
                  <div style={{ marginTop: 7, height: 48, border: `1px solid ${colors.border}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", background: colors.panelStrong }}>
                    <button type="button" onClick={() => setGuests((value) => Math.max(1, value - 1))} style={stepButtonStyle}><Minus size={15} /></button>
                    <span style={{ fontWeight: 800 }}>{guests} người</span>
                    <button type="button" onClick={() => setGuests((value) => value + 1)} style={{ ...stepButtonStyle, background: colors.gold, color: colors.onGold }}><Plus size={15} /></button>
                  </div>
                </div>
                <ReadOnlyField icon={<UsersRound size={16} />} label="Cast tham chiếu" value="Rina - 21" />
              </div>

              <div>
                <Label>Mã ưu đãi</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {couponItems.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCoupon(item)}
                      style={{
                        border: `1px solid ${coupon === item ? colors.gold : colors.border}`,
                        background: coupon === item ? colors.goldGrad : colors.panelStrong,
                        color: coupon === item ? colors.onGold : colors.muted,
                        borderRadius: 999,
                        padding: "8px 12px",
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Ghi chú</Label>
                <textarea
                  placeholder="Yêu cầu phòng VIP, nhân viên nói tiếng Nhật..."
                  style={{ marginTop: 7, width: "100%", minHeight: 86, resize: "vertical", border: `1px solid ${colors.border}`, borderRadius: 12, background: colors.panelStrong, color: colors.text, padding: "13px 14px", fontSize: 14, outline: "none" }}
                />
              </div>

              <button type="button" onClick={submit} style={{ border: 0, borderRadius: 14, background: colors.goldGrad, color: colors.onGold, padding: "15px 18px", fontWeight: 900, fontSize: 15, cursor: "pointer" }}>
                Gửi yêu cầu đặt chỗ
              </button>
            </div>
          </div>

          <aside style={{ border: `1px solid ${colors.border}`, background: colors.panel, borderRadius: 18, padding: 20, height: "fit-content", position: "sticky", top: 104 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: colors.goldPale, fontWeight: 900 }}>
              <Sparkles size={18} />
              Tóm tắt
            </div>
            <Summary label="Quán" value="Club Lumiere" />
            <Summary label="Khu vực" value="Tây Hồ" />
            <Summary label="Thời gian" value="T6 - 21/06 · 21:00" />
            <Summary label="Số khách" value={`${guests} người`} />
            <Summary label="Ưu đãi" value={coupon} />
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${colors.border}`, color: colors.muted, fontSize: 12.5, lineHeight: 1.6 }}>
              Admin sẽ liên hệ xác nhận sau khi bạn gửi yêu cầu.
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label style={{ color: colors.muted, fontSize: 12.5, fontWeight: 800 }}>{children}</label>;
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <input placeholder={placeholder} style={{ marginTop: 7, width: "100%", height: 48, border: `1px solid ${colors.border}`, borderRadius: 12, background: colors.panelStrong, color: colors.text, padding: "0 14px", fontSize: 14, outline: "none" }} />
    </div>
  );
}

function ReadOnlyField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <div style={{ marginTop: 7, height: 48, border: `1px solid ${colors.border}`, borderRadius: 12, background: colors.panelStrong, color: colors.text, padding: "0 14px", display: "flex", alignItems: "center", gap: 9, fontSize: 14, fontWeight: 700 }}>
        <span style={{ color: colors.gold }}>{icon}</span>
        {value}
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 15, color: colors.text, fontSize: 13 }}>
      <span style={{ color: colors.muted }}>{label}</span>
      <span style={{ fontWeight: 800, textAlign: "right" }}>{value}</span>
    </div>
  );
}

const stepButtonStyle: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 9,
  border: 0,
  background: "rgba(255,255,255,.08)",
  color: colors.text,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};
