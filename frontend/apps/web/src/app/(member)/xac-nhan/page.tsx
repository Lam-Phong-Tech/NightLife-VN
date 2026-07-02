"use client";

import { AlertCircle, Check, Clock3, Headphones } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { getLastBooking, type BookingRecord } from "@/lib/api/bookings";
import styles from "../booking-flow.module.css";

const confirmedStatuses = new Set(["CONFIRMED", "CHECKED_IN", "COMPLETED"]);
const cancelledStatuses = new Set(["CANCELLED", "NO_SHOW"]);

const formatDateTime = (value?: string) => {
  if (!value) return "Chưa có thời gian";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const bookingCode = (booking: BookingRecord) => `#BK-${booking.id.slice(0, 8).toUpperCase()}`;

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

const bookingTitle = (booking: BookingRecord | null) => {
  if (!booking) return "Booking NightLife";
  if (booking.cast) {
    return `${booking.cast.publicAlias ?? booking.cast.stageName} @ ${booking.store?.name ?? "NightLife"}`;
  }
  return booking.store?.name ?? "Booking NightLife";
};

const guestLabel = (booking: BookingRecord) =>
  `${booking.guest?.displayName ?? booking.user?.displayName ?? "Khách"} · ${
    booking.guest?.email ?? booking.guest?.phone ?? "Email đã lưu"
  }`;

export default function Page() {
  const [booking, setBooking] = useState<BookingRecord | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const bookingId = new URLSearchParams(window.location.search).get("bookingId");
      setBooking(getLastBooking(bookingId));
    });
  }, []);

  const hasQr = booking ? confirmedStatuses.has(booking.status) : false;
  const isCancelled = booking ? cancelledStatuses.has(booking.status) : false;
  const title = bookingTitle(booking);
  const heroTitle = !booking
    ? "Chưa tìm thấy booking"
    : isCancelled
      ? "Đặt chỗ đã hủy"
      : hasQr
        ? "Đặt chỗ đã xác nhận"
        : "Đã gửi yêu cầu đặt bàn";
  const heroText = !booking
    ? "Booking vừa tạo không còn trong phiên này. Bạn có thể quay lại lịch sử hoặc đặt lại yêu cầu mới."
    : isCancelled
      ? "Booking này đã hủy. NightLife không thu cọc, nên bạn có thể đặt lại khi cần đổi lịch."
      : hasQr
        ? "Admin đã xác nhận với quán. Mã QR giảm giá đã sẵn sàng để dùng khi tới nơi."
        : "Khi quán xác nhận, bạn nhận thông báo và mã QR giảm giá qua LINE OA hoặc trong app nếu đã đăng nhập.";
  const statusText = !booking
    ? "Không có dữ liệu"
    : isCancelled
      ? "Đã hủy"
      : hasQr
        ? "Đã xác nhận · QR đã cấp"
        : "Mới · chờ xác nhận";

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
              Trạng thái: {statusText}
            </span>
          </div>

          {booking ? (
            <section className={styles.summaryCard} aria-label="Tóm tắt đặt chỗ">
              <SummaryRow label="Mã đặt chỗ" value={<span className={styles.bookingCode}>{bookingCode(booking)}</span>} />
              <SummaryRow label="Quán" value={title} />
              <SummaryRow label="Thời gian" value={formatDateTime(booking.scheduledAt)} />
              <SummaryRow label="Số người" value={`${booking.partySize} người`} />
              <SummaryRow label="Người đặt" value={guestLabel(booking)} />
            </section>
          ) : (
            <div className={styles.emptyCard}>Chưa tìm thấy booking vừa tạo trong phiên này.</div>
          )}

          <Timeline hasQr={hasQr} isCancelled={isCancelled} />

          <div className={`${styles.infoNote} ${styles.confirmNote}`}>
            <Clock3 size={15} />
            <span>
              {hasQr
                ? "Mã QR gắn với đúng booking này và dùng một lần tại quán. Nếu cần đổi thông tin, hãy hủy booking cũ và đặt lại."
                : "Không thu cọc. Có thể hủy trước giờ hẹn tối thiểu 1 giờ. Muốn đổi giờ hoặc số người: hủy và đặt lại hoặc liên hệ hỗ trợ."}
            </span>
          </div>

          {booking && hasQr ? (
            <section className={styles.qrPanel} aria-label="Mã QR đặt chỗ">
              <div className={styles.qrBox}>
                <Image
                  src={bookingQrImageUrl(booking)}
                  alt={`QR đặt chỗ ${bookingCode(booking)}`}
                  width={112}
                  height={112}
                  unoptimized
                />
              </div>
              <div className={styles.qrCopy}>
                <strong>QR giảm giá đã sẵn sàng</strong>
                <p>Đưa mã này cho nhân viên quán quét khi tới nơi. Coupon được gắn với booking và đối soát sau check-in.</p>
              </div>
            </section>
          ) : null}

          <div className={styles.bottomActions}>
            <Link href="/lich-su-dat-cho" className={styles.primaryCta}>
              <strong>Xem đặt chỗ của tôi</strong>
            </Link>
            <Link href="/huong-dan" className={styles.secondaryCta}>
              <Headphones size={15} />
              Liên hệ hỗ trợ (LINE OA)
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Timeline({ hasQr, isCancelled }: { hasQr: boolean; isCancelled: boolean }) {
  const adminDone = hasQr && !isCancelled;
  const qrDone = hasQr && !isCancelled;

  return (
    <div className={styles.timeline} aria-label="Tiến trình đặt chỗ">
      <TimelineStep done label="Đã gửi" icon={<Check size={13} />} />
      <span className={`${styles.timelineLine} ${adminDone ? styles.timelineLineDone : ""}`} />
      <TimelineStep done={adminDone} label="Admin xác nhận" fallback="2" />
      <span className={`${styles.timelineLine} ${qrDone ? styles.timelineLineDone : ""}`} />
      <TimelineStep done={qrDone} label="Nhận mã QR giảm giá" fallback="3" />
    </div>
  );
}

function TimelineStep({
  done,
  label,
  icon,
  fallback,
}: {
  done: boolean;
  label: string;
  icon?: React.ReactNode;
  fallback?: string;
}) {
  return (
    <div className={`${styles.timelineStep} ${done ? styles.timelineStepDone : ""}`}>
      <span className={`${styles.timelineIcon} ${done ? styles.timelineIconDone : ""}`}>
        {done ? (icon ?? <Check size={13} />) : fallback}
      </span>
      <div className={styles.timelineLabel}>{label}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className={styles.summaryRow}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
