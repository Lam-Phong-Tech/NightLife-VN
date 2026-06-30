"use client";

import { Check, Clock3, MapPin, QrCode, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { PlaceholderMedia } from "@/components/ui/MediaPlaceholder";
import { getAuthUser } from "@/lib/auth/session";
import { getLastBooking, type BookingRecord } from "@/lib/api/bookings";

const colors = {
  bg: "#0c0c0f",
  border: "rgba(212,178,106,.24)",
  borderStrong: "rgba(212,178,106,.36)",
  text: "#f7f2e8",
  text2: "#d8d1c1",
  muted: "#9b9488",
  gold: "#d4b26a",
  goldPale: "#f2dfaa",
  onGold: "#241a0a",
  success: "#24b56a",
  goldGrad: "linear-gradient(135deg,#fff1bf 0%,#e4bf63 52%,#c09035 100%)",
};

const fallbackImage =
  "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=720&q=75";

const statusLabel = (status?: string) => {
  if (status === "REQUESTED") return "Mới";
  if (status === "CONFIRMED") return "Đã xác nhận";
  if (status === "CHECKED_IN") return "Đã check-in";
  if (status === "COMPLETED") return "Hoàn tất";
  if (status === "CANCELLED") return "Đã hủy";
  if (status === "NO_SHOW") return "Không đến";
  return status ?? "Mới";
};

const formatDateTime = (value?: string) => {
  if (!value) return "Chưa có thời gian";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const bookingCode = (booking: BookingRecord) =>
  `NL-BK-${booking.id.slice(0, 8).toUpperCase()}`;

const bookingQrPayload = (booking: BookingRecord) =>
  [
    "NLBOOKING",
    booking.id,
    bookingCode(booking),
    booking.store?.slug ?? "nightlife",
    booking.scheduledAt,
  ].join("|");

const bookingQrImageUrl = (booking: BookingRecord) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(
    bookingQrPayload(booking),
  )}`;

function DetailLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ color: colors.muted, fontSize: 12, lineHeight: 1.4 }}>{label}</div>
      <div style={{ marginTop: 5, color: colors.text, fontSize: 14, fontWeight: 850, lineHeight: 1.35 }}>
        {value}
      </div>
    </div>
  );
}

export default function Page() {
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const bookingId = new URLSearchParams(window.location.search).get("bookingId");
      setBooking(getLastBooking(bookingId));
      setIsLoggedIn(Boolean(getAuthUser()));
    });
  }, []);

  const title = booking?.cast
    ? `${booking.cast.publicAlias ?? booking.cast.stageName} @ ${booking.store?.name ?? "NightLife"}`
    : booking?.store?.name ?? "Booking NightLife";

  return (
    <main
      style={{
        minHeight: "calc(100vh - 82px)",
        background:
          "radial-gradient(circle at 82% 2%,rgba(212,178,106,.12),transparent 34%), linear-gradient(180deg,#121216 0%,#0c0c0f 100%)",
        color: colors.text,
        fontFamily: "var(--nl-font-sans)",
        padding: "24px 16px calc(118px + env(safe-area-inset-bottom))",
      }}
    >
      <section className="confirm-shell" style={{ width: "100%", maxWidth: 560, margin: "0 auto" }}>
        <h1 style={{ margin: 0, color: colors.text, fontSize: "clamp(24px,4vw,34px)", lineHeight: 1.08, fontWeight: 950 }}>
          Đặt chỗ của tôi
        </h1>

        <div
          style={{
            marginTop: 18,
            borderRadius: 18,
            border: "1px solid rgba(34,197,94,.34)",
            background: "linear-gradient(135deg,rgba(34,197,94,.2),rgba(16,185,129,.08))",
            padding: "15px 16px",
            display: "flex",
            alignItems: "center",
            gap: 13,
          }}
        >
          <span
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: colors.success,
              color: "#fff",
              display: "grid",
              placeItems: "center",
              flex: "none",
            }}
          >
            <Check size={24} strokeWidth={3} />
          </span>
          <div>
            <div style={{ color: "#a7f3d0", fontSize: 15, fontWeight: 950 }}>Đã gửi yêu cầu đặt chỗ</div>
            <div style={{ marginTop: 3, color: colors.text2, fontSize: 13, lineHeight: 1.45 }}>
              Trạng thái hiện tại: {statusLabel(booking?.status)}.
            </div>
          </div>
        </div>

        {booking ? (
          <article
            style={{
              marginTop: 16,
              borderRadius: 18,
              border: `1px solid ${colors.border}`,
              background: "linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.018)), #141416",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: 16, display: "flex", gap: 13, alignItems: "center" }}>
              <PlaceholderMedia
                src={fallbackImage}
                alt={title}
                label=""
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 13,
                  flex: "none",
                  border: `1px solid ${colors.borderStrong}`,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: colors.text, fontSize: 18, fontWeight: 950 }}>{title}</div>
                <div
                  style={{
                    marginTop: 5,
                    color: colors.text2,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <MapPin size={14} color={colors.gold} />
                  {booking.store?.slug ?? "nightlife"}
                </div>
              </div>
              <span
                style={{
                  borderRadius: 999,
                  padding: "6px 10px",
                  background: "rgba(212,178,106,.13)",
                  border: `1px solid ${colors.border}`,
                  color: colors.goldPale,
                  fontSize: 11,
                  fontWeight: 900,
                  whiteSpace: "nowrap",
                }}
              >
                {statusLabel(booking.status)}
              </span>
            </div>

            <div style={{ height: 1, background: colors.border }} />

            <div
              style={{
                padding: "15px 16px 17px",
                display: "grid",
                gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                gap: "14px 22px",
              }}
            >
              <DetailLine
                label="Mã"
                value={<span style={{ fontFamily: "var(--nl-font-sans)", letterSpacing: ".04em" }}>{bookingCode(booking)}</span>}
              />
              <DetailLine label="Khách" value={<span><UsersRound size={14} /> {booking.partySize} người</span>} />
              <DetailLine label="Lúc" value={<span><Clock3 size={14} /> {formatDateTime(booking.scheduledAt)}</span>} />
              <DetailLine
                label="Người đặt"
                value={`${booking.guest?.displayName ?? booking.user?.displayName ?? "Khách"} · ${booking.guest?.phone ?? "SĐT đã lưu"}`}
              />
            </div>

            <div style={{ height: 1, background: colors.border }} />

            <div
              style={{
                padding: 16,
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 148,
                  height: 148,
                  borderRadius: 16,
                  background: "#fff",
                  border: `1px solid ${colors.borderStrong}`,
                  display: "grid",
                  placeItems: "center",
                  flex: "none",
                }}
              >
                <Image
                  src={bookingQrImageUrl(booking)}
                  alt={`QR đặt chỗ ${bookingCode(booking)}`}
                  width={124}
                  height={124}
                  unoptimized
                  style={{ width: 124, height: 124, display: "block" }}
                />
              </div>
              <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                <div
                  style={{
                    color: colors.goldPale,
                    fontSize: 15,
                    fontWeight: 950,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <QrCode size={18} color={colors.gold} />
                  QR check-in tại quán
                </div>
                <p style={{ marginTop: 8, marginBottom: 0, color: colors.text2, fontSize: 13, lineHeight: 1.55 }}>
                  Đưa mã QR này cho nhân viên quán quét khi tới nơi. Mã gắn với đúng booking và dùng để đối chiếu lúc check-in.
                </p>
                <div
                  style={{
                    marginTop: 12,
                    borderRadius: 12,
                    border: `1px solid ${colors.border}`,
                    background: "rgba(212,178,106,.1)",
                    color: colors.goldPale,
                    padding: "10px 12px",
                    fontFamily: "var(--nl-font-sans)",
                    fontSize: 13,
                    fontWeight: 950,
                    letterSpacing: ".08em",
                    overflowWrap: "anywhere",
                  }}
                >
                  {bookingCode(booking)}
                </div>
              </div>
            </div>
          </article>
        ) : (
          <div style={{ marginTop: 16, borderRadius: 18, border: `1px solid ${colors.border}`, background: "#141416", padding: 20, color: colors.muted, lineHeight: 1.6 }}>
            Chưa tìm thấy booking vừa tạo trong phiên này.
          </div>
        )}

        <Link
          href={isLoggedIn ? "/lich-su-dat-cho" : "/"}
          style={{
            marginTop: 14,
            minHeight: 54,
            borderRadius: 16,
            background: colors.goldGrad,
            color: colors.onGold,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            textDecoration: "none",
            fontWeight: 950,
            fontSize: 15,
          }}
        >
          {isLoggedIn ? "Xem lịch sử đặt chỗ" : "Về trang chủ"}
        </Link>
      </section>
    </main>
  );
}
