"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { Clock, MapPin, Phone, QrCode, UsersRound } from "lucide-react";
import { getAuthUser } from "@/lib/auth/session";
import {
  bookingApi,
  getGuestBookingHistory,
  mergeBookingHistories,
  rememberLastBooking,
  type BookingRecord,
} from "@/lib/api/bookings";

const colors = {
  bg: "#0c0c0f",
  panel: "rgba(255,255,255,.045)",
  panelStrong: "rgba(255,255,255,.07)",
  border: "rgba(212,178,106,.22)",
  borderStrong: "rgba(212,178,106,.34)",
  text: "#f3f0ea",
  muted: "#b6b1a6",
  gold: "#d4b26a",
  goldPale: "#f0dda8",
  onGold: "#241a0a",
  danger: "#ff6b8b",
  success: "#81d89d",
  goldGrad: "linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)",
};

const tabs = ["Tất cả", "Mới", "Hoàn tất", "Đã hủy"] as const;

const statusGroup = (status: string) => {
  if (status === "REQUESTED" || status === "CONFIRMED") return "Mới";
  if (status === "COMPLETED" || status === "CHECKED_IN") return "Hoàn tất";
  if (status === "CANCELLED" || status === "NO_SHOW") return "Đã hủy";
  return "Mới";
};

const statusLabel = (status: string) => {
  if (status === "REQUESTED") return "Mới";
  if (status === "CONFIRMED") return "Đã xác nhận";
  if (status === "CHECKED_IN") return "Đã check-in";
  if (status === "COMPLETED") return "Hoàn tất";
  if (status === "CANCELLED") return "Đã hủy";
  if (status === "NO_SHOW") return "Không đến";
  return status;
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const bookingCode = (booking: BookingRecord) =>
  `NL-BK-${booking.id.slice(0, 8).toUpperCase()}`;

const bookingTitle = (booking: BookingRecord) => {
  const storeName = booking.store?.name ?? "NightLife";
  if (!booking.cast) return storeName;
  return `${booking.cast.publicAlias ?? booking.cast.stageName} @ ${storeName}`;
};

export default function Page() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Tất cả");
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let alive = true;

    const loadBookings = async () => {
      const authUser = getAuthUser();
      try {
        if (authUser?.role?.toUpperCase() === "USER") {
          const items = await bookingApi.listMemberBookings();
          if (alive) setBookings(mergeBookingHistories(items, getGuestBookingHistory()));
          return;
        }

        if (alive) setBookings(getGuestBookingHistory());
      } catch (error) {
        if (alive) {
          setBookings(getGuestBookingHistory());
          setMessage(error instanceof Error ? error.message : "Không tải được lịch sử đặt chỗ.");
        }
      } finally {
        if (alive) setIsLoading(false);
      }
    };

    loadBookings();

    return () => {
      alive = false;
    };
  }, []);

  const visibleBookings = useMemo(
    () =>
      activeTab === "Tất cả"
        ? bookings
        : bookings.filter((booking) => statusGroup(booking.status) === activeTab),
    [activeTab, bookings],
  );

  return (
    <main style={{ minHeight: "100vh", background: colors.bg, color: colors.text }}>
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "24px 18px 48px" }}>
        <div className="nl-member-page-head">
          <div>
            <h1 style={{ marginTop: 0, fontSize: "clamp(26px,4vw,40px)", lineHeight: 1.05, fontWeight: 950 }}>
              Đơn đặt chỗ
            </h1>
            <p style={{ marginTop: 10, color: colors.muted, fontSize: 14, lineHeight: 1.6 }}>
              {isLoading ? "Đang tải lịch sử đặt chỗ..." : `${bookings.length} yêu cầu đặt chỗ đã lưu.`}
            </p>
          </div>
          <Link href="/danh-sach-quan" style={primaryButtonStyle}>
            Tìm quán để đặt
          </Link>
        </div>

        {message ? (
          <div style={{ marginTop: 16, border: `1px solid ${colors.border}`, borderRadius: 14, background: colors.panel, padding: 14, color: colors.goldPale, fontSize: 13 }}>
            {message}
          </div>
        ) : null}

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
                minHeight: 42,
                borderRadius: 999,
                padding: "10px 16px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 900,
                lineHeight: 1,
                textAlign: "center",
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
              key={booking.id}
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
                  background:
                    "url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=240&q=70') center/cover",
                  border: `1px solid ${colors.borderStrong}`,
                }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: 16, fontWeight: 900 }}>{bookingTitle(booking)}</h2>
                  <StatusBadge status={booking.status} />
                </div>
                <div className="nl-booking-meta-grid">
                  <Meta icon={<MapPin size={15} />} text={booking.store?.slug ?? "nightlife"} />
                  <Meta icon={<Clock size={15} />} text={formatDateTime(booking.scheduledAt)} />
                  <Meta icon={<UsersRound size={15} />} text={`${booking.partySize} người`} />
                  <Meta icon={<Phone size={15} />} text={booking.guest?.phone ?? "SĐT đã lưu"} />
                </div>
                <div style={{ marginTop: 10, color: colors.goldPale, fontSize: 12, fontWeight: 900 }}>
                  Mã đặt chỗ: {bookingCode(booking)}
                </div>
              </div>
              <div className="nl-booking-actions" style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Link
                  href={`/xac-nhan?bookingId=${booking.id}`}
                  onClick={() => rememberLastBooking(booking, { history: true })}
                  style={secondaryButtonStyle}
                >
                  <QrCode size={14} />
                  QR
                </Link>
                <Link href={booking.store?.slug ? `/stores/${booking.store.slug}` : "/danh-sach-quan"} style={secondaryButtonStyle}>
                  Quán
                </Link>
              </div>
            </article>
          ))}
        </div>

        {!isLoading && visibleBookings.length === 0 ? (
          <div style={{ marginTop: 28, border: `1px solid ${colors.border}`, borderRadius: 18, background: colors.panel, padding: 28, textAlign: "center", color: colors.muted }}>
            Chưa có đặt chỗ ở trạng thái này.
          </div>
        ) : null}
      </section>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const group = statusGroup(status);
  const color =
    group === "Hoàn tất" ? colors.success : group === "Đã hủy" ? colors.danger : colors.goldPale;

  return (
    <span style={{ borderRadius: 999, padding: "5px 9px", background: "rgba(255,255,255,.06)", color, fontSize: 11, fontWeight: 900 }}>
      {statusLabel(status)}
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
  minHeight: 44,
  borderRadius: 999,
  background: colors.goldGrad,
  color: colors.onGold,
  padding: "12px 18px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 13,
  fontWeight: 950,
  lineHeight: 1,
  textAlign: "center",
  textDecoration: "none",
};

const secondaryButtonStyle: React.CSSProperties = {
  minHeight: 44,
  borderRadius: 12,
  border: `1px solid ${colors.border}`,
  background: colors.panelStrong,
  color: colors.goldPale,
  padding: "10px 13px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  fontSize: 12,
  fontWeight: 900,
  textDecoration: "none",
};
