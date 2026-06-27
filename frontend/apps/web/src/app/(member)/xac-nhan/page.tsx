"use client";

import { Check, Clock3, MapPin, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { PlaceholderMedia } from "@/components/ui/MediaPlaceholder";
import { getAuthUser } from "@/lib/auth/session";

const colors = {
  bg: "#0c0c0f",
  panel: "#151518",
  panelSoft: "rgba(255,255,255,.045)",
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

const booking = {
  venueName: "Club Lumière",
  area: "Tây Hồ",
  category: "Bar Lounge",
  date: "T6 - 21/06",
  time: "21:00",
  guests: 4,
  guestName: "Khách lẻ",
  phone: "—",
  coupon: "Happy Hour -30%",
  countdown: "22:13:56",
  bookingCode: "NL-BK-7K2A91",
  couponCode: "NL-HH30-7K2A",
  image:
    "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=720&q=75",
};

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showScreenshotHint, setShowScreenshotHint] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(getAuthUser()));
  }, []);

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
            <div style={{ color: "#a7f3d0", fontSize: 15, fontWeight: 950 }}>Đã gửi yêu cầu đặt chỗ!</div>
            <div style={{ marginTop: 3, color: colors.text2, fontSize: 13, lineHeight: 1.45 }}>
              Admin sẽ liên hệ xác nhận sớm.
            </div>
          </div>
        </div>

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
              src={booking.image}
              alt={booking.venueName}
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
              <div style={{ color: colors.text, fontSize: 18, fontWeight: 950 }}>{booking.venueName}</div>
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
                {booking.area}, Hà Nội · {booking.category}
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
              Mới
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
              value={<span style={{ fontFamily: "monospace", letterSpacing: ".04em" }}>{booking.bookingCode}</span>}
            />
            <DetailLine label="Khách" value={`${booking.guests} người`} />
            <DetailLine label="Lúc" value={`${booking.date} · ${booking.time}`} />
            <DetailLine label="Người đặt" value={`${booking.guestName} · ${booking.phone}`} />
          </div>
        </article>

        <aside
          style={{
            marginTop: 16,
            borderRadius: 18,
            border: `1px solid ${colors.border}`,
            background: "#141416",
            overflow: "hidden",
          }}
        >
          <div style={{ minHeight: 92, padding: 18, color: "#fff", position: "relative", overflow: "hidden" }}>
            <PlaceholderMedia src={booking.image} alt={booking.venueName} label="Ảnh ưu đãi" style={{ position: "absolute", inset: 0 }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(83,24,82,.78),rgba(16,16,20,.56))" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  color: colors.goldPale,
                  fontSize: 11,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  fontWeight: 950,
                }}
              >
                <Sparkles size={14} />
                Mã ưu đãi
              </div>
              <div style={{ marginTop: 8, fontSize: 22, lineHeight: 1.1, fontWeight: 950 }}>{booking.coupon}</div>
            </div>
          </div>

          <div style={{ padding: "20px 18px 18px", textAlign: "center" }}>
            <div
              style={{
                width: 158,
                height: 158,
                margin: "0 auto",
                border: `1px solid ${colors.borderStrong}`,
                borderRadius: 18,
                background: "rgba(244,238,222,.96)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Image
                width={132}
                height={132}
                src="https://img.icons8.com/ios/300/000000/qr-code.png"
                style={{ width: 132, height: 132, display: "block" }}
                alt="QR"
              />
            </div>
            <div
              style={{
                marginTop: 14,
                color: colors.text,
                fontFamily: "monospace",
                fontSize: 14,
                letterSpacing: ".16em",
                fontWeight: 950,
              }}
            >
              {booking.couponCode}
            </div>
            <div
              style={{
                marginTop: 11,
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                borderRadius: 999,
                padding: "7px 12px",
                background: "rgba(255,255,255,.055)",
                color: colors.goldPale,
                fontSize: 12,
                fontWeight: 850,
              }}
            >
              <Clock3 size={14} />
              Còn {booking.countdown}
            </div>
          </div>
        </aside>

        {isLoggedIn ? (
          <Link
            href="/vi-uu-dai"
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
            Chuyển tới ví của bạn
          </Link>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setShowScreenshotHint(true)}
              style={{
                marginTop: 14,
                width: "100%",
                minHeight: 54,
                border: 0,
                borderRadius: 16,
                background: colors.goldGrad,
                color: colors.onGold,
                fontWeight: 950,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Vui lòng nhấn nút để chụp màn hình
            </button>
            {showScreenshotHint ? (
              <div style={{ marginTop: 8, color: colors.muted, fontSize: 12.5, lineHeight: 1.5, textAlign: "center" }}>
                Hãy chụp màn hình mã QR và mã đặt chỗ để đưa cho nhân viên khi tới quán.
              </div>
            ) : null}
          </>
        )}

        <Link
          href="/"
          style={{
            marginTop: 10,
            minHeight: 52,
            borderRadius: 16,
            border: `1px solid ${colors.borderStrong}`,
            background: "rgba(255,255,255,.025)",
            color: colors.goldPale,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            textDecoration: "none",
            fontWeight: 900,
            fontSize: 15,
          }}
        >
          Về trang chủ
        </Link>
      </section>

      <style jsx>{`
        @media (min-width: 768px) {
          main {
            padding-top: 38px !important;
            padding-bottom: 68px !important;
          }
        }

        @media (max-width: 420px) {
          .confirm-shell {
            max-width: 100% !important;
          }
        }
      `}</style>
    </main>
  );
}
