"use client";

import { AlertCircle, Check, Clock3, Download, Headphones } from "lucide-react";
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
    bookingCode(booking),
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

  const isConfirmed = booking ? confirmedStatuses.has(booking.status) : false;
  const isCancelled = booking ? cancelledStatuses.has(booking.status) : false;
  const hasCouponQr = booking ? Boolean(couponIssueQrPayload(booking)) : false;
  const canShowQr = booking ? !isCancelled && hasCouponQr : false;
  const qrImageUrl = booking && hasCouponQr ? bookingQrImageUrl(booking) : "";
  const title = bookingTitle(booking);
  const heroTitle = !booking
    ? "Chưa tìm thấy booking"
    : isCancelled
      ? "Đặt chỗ đã hủy"
      : isConfirmed
        ? "Đặt chỗ đã xác nhận"
        : "Đã gửi yêu cầu đặt bàn";
  const heroText = !booking
    ? "Booking vừa tạo không còn trong phiên này. Bạn có thể quay lại lịch sử hoặc đặt lại yêu cầu mới."
    : isCancelled
      ? "Booking này đã hủy. NightLife không thu cọc, nên bạn có thể đặt lại khi cần đổi lịch."
      : isConfirmed
        ? hasCouponQr
          ? "Admin đã xác nhận với quán. Mã QR giảm giá đã sẵn sàng để dùng khi tới nơi."
          : "Admin đã xác nhận với quán. Booking này không kèm mã giảm giá để quét tại quán."
        : hasCouponQr
          ? "Yêu cầu đã gửi thành công. Mã QR giảm giá đã sẵn sàng, bạn có thể lưu lại để đưa nhân viên quán quét khi tới nơi."
          : "Yêu cầu đã gửi thành công. Booking này không kèm mã giảm giá để quét tại quán.";
  const statusText = !booking
    ? "Không có dữ liệu"
    : isCancelled
      ? "Đã hủy"
      : isConfirmed
        ? hasCouponQr
          ? "Đã xác nhận · QR đã cấp"
          : "Đã xác nhận"
        : hasCouponQr
          ? "Mới · QR đã cấp"
          : "Mới";

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
              Trạng thái: {statusText}
            </span>
          </div>

          {booking ? (
            <section className={styles.summaryCard} aria-label="Tóm tắt đặt chỗ">
              <SummaryRow
                label="Mã đặt chỗ"
                value={<span className={styles.bookingCode}>{bookingCode(booking)}</span>}
              />
              <SummaryRow label="Quán" value={title} />
              <SummaryRow label="Thời gian" value={formatDateTime(booking.scheduledAt)} />
              <SummaryRow label="Số người" value={`${booking.partySize} người`} />
              <SummaryRow label="Người đặt" value={guestLabel(booking)} />
              {booking.couponIssue ? (
                <SummaryRow
                  label="Mã ưu đãi"
                  value={<span className={styles.bookingCode}>{booking.couponIssue.code}</span>}
                />
              ) : null}
            </section>
          ) : (
            <div className={styles.emptyCard}>Chưa tìm thấy booking vừa tạo trong phiên này.</div>
          )}

          {booking && canShowQr ? (
            <section className={styles.qrPanel} aria-label="Mã QR đặt chỗ">
              <div className={styles.qrBox}>
                <Image
                  src={qrImageUrl}
                  alt={`QR đặt chỗ ${bookingCode(booking)}`}
                  width={156}
                  height={156}
                  unoptimized
                />
              </div>
              <div className={styles.qrCopy}>
                <strong>QR giảm giá của bạn</strong>
                <p>
                  Đưa mã này cho nhân viên quán quét khi tới nơi. QR được gắn với booking và chỉ
                  dùng một lần.
                </p>
                <button type="button" className={styles.qrDownloadButton} onClick={saveQrImage}>
                  <Download size={15} />
                  Lưu ảnh QR
                </button>
              </div>
            </section>
          ) : null}

          <div className={`${styles.infoNote} ${styles.confirmNote}`}>
            <Clock3 size={15} />
            <span>
              {canShowQr
                ? "Mã QR gắn với đúng booking này và dùng một lần tại quán. Nếu cần đổi thông tin, hãy hủy booking cũ và đặt lại."
                : "Không thu cọc. Nếu booking không kèm mã ưu đãi, nhân viên quán sẽ không cần quét QR giảm giá."}
            </span>
          </div>

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

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className={styles.summaryRow}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
