"use client";

import { CalendarCheck2, Check, Clock3, MapPin, QrCode, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { PlaceholderMedia } from "@/components/ui/MediaPlaceholder";

const colors = {
  bg: "#0c0c0f",
  panel: "#151518",
  border: "rgba(212,178,106,.24)",
  borderStrong: "rgba(212,178,106,.36)",
  text: "#f7f2e8",
  text2: "#d8d1c1",
  muted: "#9b9488",
  gold: "#d4b26a",
  goldPale: "#f2dfaa",
  onGold: "#241a0a",
  goldGrad: "linear-gradient(135deg,#fff1bf 0%,#e4bf63 52%,#c09035 100%)",
};

const booking = {
  venueName: "Club Lumière",
  area: "Tây Hồ",
  category: "Bar Lounge",
  castName: "Rina - 21",
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

function DetailItem({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div>
      <div style={{ color: colors.muted, fontSize: "12px", lineHeight: 1.4 }}>{label}</div>
      <div
        style={{
          marginTop: "6px",
          color: accent ? colors.goldPale : colors.text,
          fontWeight: accent ? 800 : 700,
          fontSize: "15px",
          lineHeight: 1.35,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function Page() {
  const toggleSave = () => alert("Đã lưu mã ưu đãi!");

  return (
    <main
      style={{
        minHeight: "calc(100vh - 82px)",
        background:
          "radial-gradient(circle at 82% 2%,rgba(212,178,106,.12),transparent 34%), linear-gradient(180deg,#121216 0%,#0c0c0f 100%)",
        color: colors.text,
        fontFamily: "var(--nl-font-sans)",
        padding: "34px clamp(18px,3.2vw,48px) 58px",
      }}
    >
      <section style={{ width: "100%", maxWidth: "none", margin: "0 auto" }}>
        <div
          className="confirm-alert"
          style={{
            borderRadius: "20px",
            border: "1px solid rgba(34,197,94,.32)",
            background:
              "linear-gradient(135deg,rgba(34,197,94,.18),rgba(16,185,129,.08)), rgba(255,255,255,.03)",
            padding: "20px 22px",
            display: "flex",
            alignItems: "center",
            gap: "15px",
            boxShadow: "0 18px 48px rgba(0,0,0,.22)",
          }}
        >
          <span
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: "#1f8a52",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "none",
            }}
          >
            <Check size={27} strokeWidth={2.8} />
          </span>
          <div>
            <div style={{ color: "#a7f3d0", fontWeight: 900, fontSize: "18px" }}>
              Đã gửi yêu cầu đặt chỗ!
            </div>
            <div style={{ marginTop: "4px", color: colors.text2, fontSize: "14px", lineHeight: 1.55 }}>
              Admin sẽ liên hệ xác nhận sớm. Bạn có thể hủy trước giờ hẹn tối thiểu 1 giờ.
            </div>
          </div>
        </div>

        <div
          className="confirm-layout"
          style={{
            marginTop: "30px",
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(340px,400px)",
            gap: "30px",
            alignItems: "start",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: colors.goldPale,
                fontSize: "13px",
                fontWeight: 900,
                textTransform: "uppercase",
              }}
            >
              <CalendarCheck2 size={18} />
              Chi tiết yêu cầu
            </div>
            <h1 style={{ margin: "12px 0 0", fontSize: "clamp(28px,3vw,42px)", lineHeight: 1.08 }}>
              Thông tin đặt chỗ đã được ghi nhận
            </h1>

            <article
              style={{
                marginTop: "20px",
                borderRadius: "18px",
                border: `1px solid ${colors.border}`,
                background:
                  "linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.015)), #141416",
                overflow: "hidden",
                boxShadow: "0 20px 54px rgba(0,0,0,.24)",
              }}
            >
              <div
                className="confirm-venue-head"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "20px",
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                <PlaceholderMedia
                  src={booking.image}
                  alt={booking.venueName}
                  label=""
                  style={{
                    width: "66px",
                    height: "66px",
                    borderRadius: "14px",
                    flex: "none",
                    border: `1px solid ${colors.borderStrong}`,
                  }}
                />
                <div className="confirm-venue-info" style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: colors.text, fontSize: "20px", fontWeight: 900 }}>
                    {booking.venueName}
                  </div>
                  <div
                    style={{
                      marginTop: "6px",
                      color: colors.text2,
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                    }}
                  >
                    <MapPin size={15} color={colors.gold} />
                    {booking.area}, Hà Nội · {booking.category}
                  </div>
                </div>
                <span
                  className="confirm-status"
                  style={{
                    minHeight: "34px",
                    borderRadius: "17px",
                    padding: "0 14px",
                    display: "inline-flex",
                    alignItems: "center",
                    background: "rgba(212,178,106,.12)",
                    border: `1px solid ${colors.border}`,
                    color: colors.goldPale,
                    fontSize: "12px",
                    fontWeight: 900,
                    whiteSpace: "nowrap",
                  }}
                >
                  Mới · chờ xác nhận
                </span>
              </div>

              <div
                className="confirm-detail-grid"
                style={{
                  padding: "22px 20px",
                  display: "grid",
                  gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                  gap: "22px 34px",
                }}
              >
                <DetailItem
                  label="Mã đặt chỗ"
                  value={<span style={{ fontFamily: "monospace", letterSpacing: ".06em" }}>{booking.bookingCode}</span>}
                />
                <DetailItem label="Cast tham chiếu" value={booking.castName} />
                <DetailItem label="Thời gian" value={`${booking.date} · ${booking.time}`} />
                <DetailItem label="Số khách" value={`${booking.guests} người`} />
                <DetailItem label="Người đặt" value={`${booking.guestName} · ${booking.phone}`} />
                <DetailItem label="Ưu đãi áp dụng" value={booking.coupon} accent />
              </div>
            </article>

            <div
              className="confirm-note"
              style={{
                marginTop: "20px",
                background: "linear-gradient(135deg,rgba(212,178,106,.14),rgba(212,178,106,.055))",
                border: `1px solid ${colors.borderStrong}`,
                borderRadius: "16px",
                padding: "18px 20px",
                fontSize: "14px",
                color: colors.text2,
                lineHeight: 1.75,
                boxShadow: "0 16px 38px rgba(0,0,0,.16)",
              }}
            >
              <b style={{ color: colors.goldPale }}>Bước tiếp theo:</b> Giữ mã ưu đãi bên phải,
              đưa cho nhân viên quán quét khi tới nơi để được giảm giá. Theo dõi trạng thái trong
              mục <b style={{ color: colors.gold }}>Đặt chỗ</b>.
            </div>

            <div className="confirm-actions" style={{ display: "flex", gap: "14px", marginTop: "22px" }}>
              <Link
                href="/"
                style={{
                  flex: 1,
                  minHeight: "54px",
                  borderRadius: "16px",
                  background: colors.goldGrad,
                  color: colors.onGold,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  textDecoration: "none",
                  fontWeight: 900,
                  fontSize: "15px",
                }}
              >
                Về trang chủ
              </Link>
              <Link
                href="/danh-sach-quan"
                style={{
                  flex: 1,
                  minHeight: "54px",
                  borderRadius: "16px",
                  border: `1px solid ${colors.borderStrong}`,
                  background: "rgba(255,255,255,.025)",
                  color: colors.goldPale,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  textDecoration: "none",
                  fontWeight: 800,
                  fontSize: "15px",
                }}
              >
                Tìm quán khác
              </Link>
            </div>
          </div>

          <aside
            className="confirm-voucher"
            style={{
              borderRadius: "22px",
              border: `1px solid ${colors.border}`,
              background:
                "linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.015)), #141416",
              overflow: "hidden",
              boxShadow: "0 22px 58px rgba(0,0,0,.28)",
            }}
          >
            <div
              style={{
                minHeight: "150px",
                padding: "24px",
                color: "#fff",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <PlaceholderMedia
                src={booking.image}
                alt={booking.venueName}
                label="Ảnh ưu đãi"
                style={{ position: "absolute", inset: 0 }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(83,24,82,.82),rgba(16,16,20,.52))" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  color: colors.goldPale,
                  fontSize: "12px",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  fontWeight: 900,
                }}
              >
                <Sparkles size={15} />
                Mã ưu đãi
                </div>
                <div style={{ marginTop: "12px", fontSize: "28px", lineHeight: 1.1, fontWeight: 900 }}>
                  {booking.coupon}
                </div>
                <div style={{ marginTop: "8px", color: "#f4ead4", fontSize: "14px" }}>
                  {booking.venueName} · {booking.area}
                </div>
              </div>
            </div>

            <div style={{ padding: "26px", textAlign: "center" }}>
              <div
                style={{
                  width: "200px",
                  height: "200px",
                  margin: "0 auto",
                  border: `1px solid ${colors.borderStrong}`,
                  borderRadius: "18px",
                  background: "rgba(244,238,222,.96)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  width={170}
                  height={170}
                  src="https://img.icons8.com/ios/300/000000/qr-code.png"
                  style={{ width: "166px", height: "166px", display: "block" }}
                  alt="QR"
                />
              </div>
              <div
                style={{
                  marginTop: "16px",
                  color: colors.text,
                  fontFamily: "monospace",
                  fontSize: "16px",
                  letterSpacing: ".16em",
                  fontWeight: 900,
                }}
              >
                {booking.couponCode}
              </div>
              <div
                style={{
                  marginTop: "14px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  borderRadius: "18px",
                  padding: "8px 14px",
                  background: "rgba(255,255,255,.055)",
                  color: colors.goldPale,
                  fontSize: "13px",
                  fontWeight: 800,
                }}
              >
                <Clock3 size={15} />
                Còn {booking.countdown} · Đang giữ chỗ
              </div>
              <button
                type="button"
                onClick={toggleSave}
                style={{
                  marginTop: "18px",
                  width: "100%",
                  minHeight: "56px",
                  border: 0,
                  borderRadius: "16px",
                  background: colors.goldGrad,
                  color: colors.onGold,
                  fontWeight: 900,
                  fontSize: "15px",
                  cursor: "pointer",
                }}
              >
                Lưu vào ví ưu đãi
              </button>
            </div>
          </aside>
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 900px) {
          .confirm-layout {
            grid-template-columns: 1fr !important;
          }

          .confirm-actions {
            flex-direction: column;
          }
        }

        @media (max-width: 640px) {
          main {
            padding: 24px 18px calc(124px + env(safe-area-inset-bottom)) !important;
            overflow-x: hidden !important;
          }

          .confirm-alert {
            align-items: flex-start !important;
            border-radius: 18px !important;
            padding: 18px !important;
          }

          .confirm-layout {
            gap: 22px !important;
            margin-top: 24px !important;
          }

          .confirm-venue-head {
            align-items: flex-start !important;
            gap: 12px !important;
            padding: 16px !important;
            flex-wrap: wrap !important;
          }

          .confirm-venue-info {
            flex: 1 1 calc(100% - 82px) !important;
          }

          .confirm-status {
            width: 100% !important;
            justify-content: center !important;
          }

          .confirm-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 18px !important;
            padding: 18px 16px !important;
          }

          .confirm-note {
            padding: 16px !important;
            font-size: 13px !important;
            line-height: 1.65 !important;
          }

          .confirm-voucher {
            margin-bottom: 16px !important;
          }
        }
      `}</style>
    </main>
  );
}
