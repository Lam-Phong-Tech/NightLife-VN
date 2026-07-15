"use client";

import { AlertCircle, Check, Clock3, Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { getLastBooking, type BookingRecord } from "@/lib/api/bookings";
import { translateText } from "@/lib/i18n/client-translations";
import {
  intlLocaleByLanguage,
  useActiveLanguage,
  type LanguageCode,
} from "@/lib/i18n/use-active-language";
import styles from "../booking-flow.module.css";

const confirmedStatuses = new Set(["CONFIRMED", "CHECKED_IN", "COMPLETED"]);
const cancelledStatuses = new Set(["CANCELLED", "NO_SHOW"]);

const formatDateTime = (value: string | undefined, language: LanguageCode) => {
  if (!value) return translateText("Chưa có thời gian", language);
  return new Intl.DateTimeFormat(intlLocaleByLanguage[language], {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};


const bookingQrFileName = (booking: BookingRecord) =>
  `nightlife-booking-${booking.id.slice(0, 8).toLowerCase()}-qr.png`;

const couponIssueQrPayload = (booking: BookingRecord) => {
  const issue = booking.couponIssue;
  if (!issue) return "";

  const metadataPayload =
    issue.metadata && typeof issue.metadata.qrPayload === "string" ? issue.metadata.qrPayload.trim() : "";

  return issue.qrPayload?.trim() || metadataPayload || issue.code?.trim() || "";
};

const bookingQrPayload = (booking: BookingRecord) =>
  couponIssueQrPayload(booking) ||
  [
    "NLBOOKING",
    booking.id,
    booking.bookingCode,
    booking.store?.slug ?? "nightlife",
    booking.scheduledAt,
  ].join("|");

const bookingQrImageUrl = (booking: BookingRecord) => {
  const issueQrImage = booking.couponIssue?.qrImageDataUrl || booking.couponIssue?.qrImageUrl;
  if (issueQrImage) return issueQrImage;

  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(
    bookingQrPayload(booking),
  )}`;
};

const bookingTitle = (booking: BookingRecord | null) => {
  if (!booking) return "Booking NightLife";
  if (booking.tour) return booking.tour.title;
  if (booking.cast) {
    return `${booking.cast.publicAlias ?? booking.cast.stageName} @ ${booking.store?.name ?? "NightLife"}`;
  }
  return booking.store?.name ?? "Booking NightLife";
};

const guestLabel = (booking: BookingRecord, language: LanguageCode) =>
  `${booking.guest?.displayName ?? booking.user?.displayName ?? translateText("Khách", language)} · ${
    booking.guest?.email ?? booking.guest?.phone ?? translateText("Email đã lưu", language)
  }`;

export default function Page() {
  const activeLanguage = useActiveLanguage();
  const [booking, setBooking] = useState<BookingRecord | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const bookingId = new URLSearchParams(window.location.search).get("bookingId");
      setBooking(getLastBooking(bookingId));
    });
  }, []);

  const isConfirmed = booking ? confirmedStatuses.has(booking.status) : false;
  const isCancelled = booking ? cancelledStatuses.has(booking.status) : false;
  const canShowQr = booking ? !isCancelled : false;
  const qrImageUrl = booking ? bookingQrImageUrl(booking) : "";
  const title = bookingTitle(booking);
  const isTourBooking = Boolean(booking?.tour);
  const heroTitle = translateText(
    !booking
      ? "Chưa tìm thấy booking"
      : isCancelled
        ? "Đặt chỗ đã hủy"
        : isConfirmed
          ? isTourBooking
            ? "Đặt tour đã xác nhận"
            : "Đặt chỗ đã xác nhận"
          : isTourBooking
            ? "Đã gửi yêu cầu đặt tour"
            : "Đã gửi yêu cầu đặt bàn",
    activeLanguage,
  );
  const heroText = translateText(
    !booking
      ? "Booking vừa tạo không còn trong phiên này. Bạn có thể quay lại lịch sử hoặc đặt lại yêu cầu mới."
      : isCancelled
        ? "Booking này đã hủy. NightLife không thu cọc, nên bạn có thể đặt lại khi cần đổi lịch."
        : isConfirmed
          ? "Admin đã xác nhận với quán. Mã QR giảm giá đã sẵn sàng để dùng khi tới nơi."
          : isTourBooking
            ? "Yêu cầu đặt tour đã gửi thành công. Admin sẽ kiểm tra quán và cast theo từng điểm trong hành trình."
            : "Yêu cầu đã gửi thành công. Mã QR giảm giá đã sẵn sàng, bạn có thể lưu lại để đưa nhân viên quán quét khi tới nơi.",
    activeLanguage,
  );
  const statusText = translateText(
    !booking
      ? "Không có dữ liệu"
      : isCancelled
        ? "Đã hủy"
        : isConfirmed
          ? "Đã xác nhận · QR đã cấp"
          : "Mới · QR đã cấp",
    activeLanguage,
  );

  const saveQrImage = async () => {
    if (!booking || !qrImageUrl) {
      return;
    }

    const fileName = bookingQrFileName(booking);

    try {
      const response = await fetch(qrImageUrl);
      if (!response.ok) {
        throw new Error("Cannot fetch QR image");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 250);
    } catch {
      const link = document.createElement("a");
      link.href = qrImageUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  return (
    <main className={styles.bookingPage}>
      <section className={styles.bookingViewport}>
        <div className={`${styles.bookingFrame} ${styles.confirmFrame}`}>
          <div className={styles.confirmHero}>
            <span className={styles.heroMark}>
              {isCancelled || !booking ? <AlertCircle size={34} /> : <Check size={34} />}
            </span>
            <h1 className={styles.confirmTitle}>{heroTitle}</h1>
            <p className={styles.confirmText}>{heroText}</p>
            <span className={styles.statusBadge}>
              <span className={styles.statusDot} />
              {translateText("Trạng thái", activeLanguage)}: {statusText}
            </span>
          </div>

          {booking ? (
            <section
              className={styles.summaryCard}
              aria-label={translateText("Tóm tắt đặt chỗ", activeLanguage)}
            >
              <SummaryRow
                label={translateText("Mã đặt chỗ", activeLanguage)}
                value={<span className={styles.bookingCode}>{booking.bookingCode}</span>}
              />
              {booking.tour ? (
                <TourVenueSummary booking={booking} language={activeLanguage} />
              ) : (
                <SummaryRow label={translateText("Quán", activeLanguage)} value={title} />
              )}
              <SummaryRow
                label={translateText("Thời gian", activeLanguage)}
                value={formatDateTime(booking.scheduledAt, activeLanguage)}
              />
              <SummaryRow
                label={translateText("Số người", activeLanguage)}
                value={translateText(`${booking.partySize} người`, activeLanguage)}
              />
              <SummaryRow
                label={translateText("Người đặt", activeLanguage)}
                value={guestLabel(booking, activeLanguage)}
              />
              {booking.couponIssue ? (
                <SummaryRow
                  label={translateText("Mã ưu đãi", activeLanguage)}
                  value={<span className={styles.bookingCode}>{booking.couponIssue.code}</span>}
                />
              ) : null}
            </section>
          ) : (
            <div className={styles.emptyCard}>
              {translateText("Chưa tìm thấy booking vừa tạo trong phiên này.", activeLanguage)}
            </div>
          )}

          {booking && canShowQr ? (
            <section className={styles.qrPanel} aria-label={translateText("Mã QR đặt chỗ", activeLanguage)}>
              <div className={styles.qrBox}>
                <Image
                  src={qrImageUrl}
                  alt={`${translateText("Mã QR đặt chỗ", activeLanguage)} ${booking.bookingCode}`}
                  width={156}
                  height={156}
                  unoptimized
                />
              </div>
              <div className={styles.qrCopy}>
                <strong>{translateText("QR giảm giá của bạn", activeLanguage)}</strong>
                <p>
                  {translateText(
                    "Đưa mã này cho nhân viên quán quét khi tới nơi. QR được gắn với booking và chỉ dùng một lần.",
                    activeLanguage,
                  )}
                </p>
                <button type="button" className={styles.qrDownloadButton} onClick={saveQrImage}>
                  <Download size={15} />
                  {translateText("Lưu ảnh QR", activeLanguage)}
                </button>
              </div>
            </section>
          ) : null}

          <div className={`${styles.infoNote} ${styles.confirmNote}`}>
            <Clock3 size={15} />
            <span>
              {translateText(
                canShowQr
                  ? "Mã QR gắn với đúng booking này và dùng một lần tại quán. Nếu cần đổi thông tin, hãy hủy booking cũ và đặt lại."
                  : "Không thu cọc. Có thể hủy trước giờ hẹn tối thiểu 1 giờ. Muốn đổi giờ hoặc số người: hủy và đặt lại hoặc liên hệ hỗ trợ.",
                activeLanguage,
              )}
            </span>
          </div>

          <div className={styles.bottomActions}>
            <Link href="/lich-su-dat-cho" className={styles.primaryCta}>
              <strong>{translateText("Xem đặt chỗ của tôi", activeLanguage)}</strong>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className={styles.summaryRow}>
      <span className={styles.summaryLabel}>{label}</span>
      <span className={styles.summaryValue}>{value}</span>
    </div>
  );
}

function TourVenueSummary({
  booking,
  language,
}: {
  booking: BookingRecord;
  language: LanguageCode;
}) {
  const stops = booking.tour?.stops ?? [];

  if (!stops.length) {
    return (
      <div className={styles.tourVenueSection}>
        <div className={styles.tourVenueHeader}>
          <span>{translateText("Quán", language)}</span>
        </div>
        <strong className={styles.tourVenueFallback}>{bookingTitle(booking)}</strong>
      </div>
    );
  }

  return (
    <div className={styles.tourVenueSection}>
      <div className={styles.tourVenueHeader}>
        <span>{translateText("Quán", language)}</span>
        <strong>{translateText(`${stops.length} điểm dừng`, language)}</strong>
      </div>
      <div className={styles.tourVenueSummary}>
        {stops.map((stop, index) => (
          <div key={`${stop.storeId}-${stop.order}`} className={styles.tourVenueItem}>
            <span className={styles.tourVenueIndex}>{stop.order || index + 1}</span>
            <span className={styles.tourVenueCopy}>
              <strong>{stop.storeName}</strong>
              <span className={styles.tourVenueCasts}>
                {stop.casts.length ? (
                  stop.casts.map((cast) => (
                    <span key={cast.id} className={styles.tourCastChip}>
                      {cast.name}
                    </span>
                  ))
                ) : (
                  <span className={styles.tourCastEmpty}>
                    {translateText("Không chọn cast", language)}
                  </span>
                )}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
