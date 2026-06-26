"use client";

import Link from "next/link";
import React, { useState } from "react";
import { CalendarCheck, Clock, MapPin, Phone, TicketCheck, UsersRound } from "lucide-react";

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
  goldGrad: "linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)",
};

const tabs = ["Tất cả", "Mới", "Hoàn tất", "Đã hủy"] as const;

const bookings = [
  {
    title: "Club Lumière",
    area: "Tây Hồ, Hà Nội",
    date: "21/06",
    time: "21:00",
    guests: "4 người",
    status: "Mới",
    code: "NL-BK-7K2A91",
    phone: "0912 345 678",
    image:
      "url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=240&q=70') center/cover",
  },
  {
    title: "Cast: Michi @ Club Lumière",
    area: "Tây Hồ, Hà Nội",
    date: "22/06",
    time: "20:00",
    guests: "2 người",
    status: "Mới",
    code: "NL-BK-8M4C22",
    phone: "0912 345 678",
    image:
      "url('https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=240&q=70') center/cover",
  },
  {
    title: "KTV Hoàng Gia",
    area: "Kim Mã, Hà Nội",
    date: "18/06",
    time: "22:00",
    guests: "6 người",
    status: "Hoàn tất",
    code: "NL-BK-6KTV18",
    phone: "0912 345 678",
    image:
      "url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=240&q=70') center/cover",
  },
  {
    title: "Sakura Lounge",
    area: "Trúc Bạch, Hà Nội",
    date: "15/06",
    time: "21:30",
    guests: "3 người",
    status: "Đã hủy",
    code: "NL-BK-5SKR15",
    phone: "0912 345 678",
    image:
      "url('https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=240&q=70') center/cover",
  },
];

export default function Page() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Tất cả");
  const visibleBookings =
    activeTab === "Tất cả" ? bookings : bookings.filter((booking) => booking.status === activeTab);

  return (
    <main style={{ minHeight: "100vh", background: colors.bg, color: colors.text }}>
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "24px 18px 48px" }}>
        <div className="nl-member-page-head">
          <div>
            <p style={{ color: colors.gold, fontSize: 12, fontWeight: 900, letterSpacing: ".16em" }}>
              MEMBER BOOKING
            </p>
            <h1 style={{ marginTop: 8, fontSize: "clamp(26px,4vw,40px)", lineHeight: 1.05, fontWeight: 950 }}>
              Đặt chỗ của tôi
            </h1>
            <p style={{ marginTop: 10, color: colors.muted, fontSize: 14, lineHeight: 1.6 }}>
              Theo dõi trạng thái giữ bàn, mã đặt chỗ và thông tin liên hệ xác nhận.
            </p>
          </div>
          <Link href="/dat-cho" style={primaryButtonStyle}>
            Đặt chỗ mới
          </Link>
        </div>

        <div className="hscroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginTop: 22 }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                border: `1px solid ${activeTab === tab ? colors.gold : colors.border}`,
                background: activeTab === tab ? colors.goldGrad : colors.panel,
                color: activeTab === tab ? colors.onGold : colors.muted,
                borderRadius: 999,
                padding: "10px 16px",
                fontSize: 13,
                fontWeight: 900,
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
          {visibleBookings.map((booking) => (
            <article
              key={booking.code}
              className="nl-booking-history-card"
              style={{
                display: "grid",
                gridTemplateColumns: "72px minmax(0,1fr) auto",
                gap: 16,
                alignItems: "center",
                border: `1px solid ${colors.border}`,
                borderRadius: 18,
                background: colors.panel,
                padding: 14,
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 16,
                  background: booking.image,
                  border: `1px solid ${colors.borderStrong}`,
                }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: 16, fontWeight: 900 }}>{booking.title}</h2>
                  <StatusBadge status={booking.status} />
                </div>
                <div className="nl-booking-meta-grid">
                  <Meta icon={<MapPin size={15} />} text={booking.area} />
                  <Meta icon={<Clock size={15} />} text={`${booking.date} · ${booking.time}`} />
                  <Meta icon={<UsersRound size={15} />} text={booking.guests} />
                  <Meta icon={<Phone size={15} />} text={booking.phone} />
                </div>
                <div style={{ marginTop: 10, color: colors.goldPale, fontSize: 12, fontWeight: 900 }}>
                  Mã đặt chỗ: {booking.code}
                </div>
              </div>
              <div className="nl-booking-actions" style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Link href="/xac-nhan" style={secondaryButtonStyle}>
                  Chi tiết
                </Link>
                {booking.status === "Mới" ? (
                  <button type="button" style={dangerButtonStyle}>
                    Hủy
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        {visibleBookings.length === 0 ? (
          <div style={{ marginTop: 28, border: `1px solid ${colors.border}`, borderRadius: 18, background: colors.panel, padding: 28, textAlign: "center", color: colors.muted }}>
            Chưa có đặt chỗ ở trạng thái này.
          </div>
        ) : null}
      </section>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "Hoàn tất" ? colors.success : status === "Đã hủy" ? colors.danger : colors.goldPale;

  return (
    <span style={{ borderRadius: 999, padding: "5px 9px", background: "rgba(255,255,255,.06)", color, fontSize: 11, fontWeight: 900 }}>
      {status}
    </span>
  );
}

function Meta({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: colors.muted, fontSize: 12.5 }}>
      <span style={{ color: colors.gold }}>{icon}</span>
      {text}
    </span>
  );
}

const primaryButtonStyle: React.CSSProperties = {
  alignSelf: "start",
  borderRadius: 999,
  background: colors.goldGrad,
  color: colors.onGold,
  padding: "12px 18px",
  fontSize: 13,
  fontWeight: 950,
  textDecoration: "none",
};

const secondaryButtonStyle: React.CSSProperties = {
  borderRadius: 12,
  border: `1px solid ${colors.border}`,
  background: colors.panelStrong,
  color: colors.goldPale,
  padding: "10px 13px",
  fontSize: 12,
  fontWeight: 900,
  textDecoration: "none",
  whiteSpace: "nowrap",
};

const dangerButtonStyle: React.CSSProperties = {
  ...secondaryButtonStyle,
  color: colors.danger,
  cursor: "pointer",
};
