"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  Clock,
  Headphones,
  MessageCircle,
  QrCode,
  RotateCcw,
  Star,
  XCircle,
} from "lucide-react";
import { getAuthUser } from "@/lib/auth/session";
import {
  bookingApi,
  bookingStatusGroup,
  bookingStatusLabel,
  canCancelBooking,
  getGuestBookingHistory,
  mergeBookingHistories,
  rememberLastBooking,
  type BookingRecord,
  type BookingStatusGroup,
} from "@/lib/api/bookings";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import styles from "../booking-flow.module.css";

const tabs = ["Tất cả", "Mới", "Hoàn tất", "Đã hủy"] as const;
const confirmedStatuses = new Set(["CONFIRMED", "CHECKED_IN", "COMPLETED"]);

const thumbnails = {
  "Mới": "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=180&q=72')",
  "Hoàn tất": "url('https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=180&q=72')",
  "Đã hủy": "url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=180&q=72')",
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const toDateInputValue = (date: Date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const getTomorrowDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return toDateInputValue(date);
};

const bookingCode = (booking: BookingRecord) => `#BK-${booking.id.slice(0, 8).toUpperCase()}`;

const bookingTitle = (booking: BookingRecord) => {
  const storeName = booking.store?.name ?? "NightLife";
  if (!booking.cast) return storeName;
  return `${booking.cast.publicAlias ?? booking.cast.stageName} @ ${storeName}`;
};

const bookingTimeValue = (value: string) => {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "21:00";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const rebookHref = (booking: BookingRecord) => {
  const params = new URLSearchParams({
    ...(booking.store?.slug ? { storeSlug: booking.store.slug } : {}),
    ...(booking.store?.name ? { storeName: booking.store.name } : {}),
    ...(booking.cast?.slug ? { castSlug: booking.cast.slug } : {}),
    ...(booking.cast ? { castName: booking.cast.publicAlias ?? booking.cast.stageName } : {}),
    guests: String(booking.partySize || 4),
    date: getTomorrowDate(),
    time: bookingTimeValue(booking.scheduledAt),
  });

  return `/dat-cho?${params.toString()}`;
};

const statusMeta = (booking: BookingRecord, group: BookingStatusGroup) => {
  if (group === "Hoàn tất") {
    return "Hoàn tất · gắn điểm/hoá đơn khi đối soát";
  }

  if (group === "Đã hủy") {
    return "Đã hủy trước giờ hẹn · không thu cọc";
  }

  return confirmedStatuses.has(booking.status)
    ? `${bookingCode(booking)} · QR đã cấp`
    : `${bookingCode(booking)} · Admin đang điều phối`;
};

export default function Page() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Tất cả");
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let alive = true;

    const loadBookings = async () => {
      const authUser = getAuthUser();
      const isMemberAccount = authUser?.role?.toUpperCase() === "USER";
      if (alive) setIsMember(isMemberAccount);

      try {
        if (isMemberAccount) {
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
        : bookings.filter((booking) => bookingStatusGroup(booking.status) === activeTab),
    [activeTab, bookings],
  );

  const handleCancelBooking = async (booking: BookingRecord) => {
    if (!canCancelBooking(booking)) {
      setMessage(
        "Chỉ có thể hủy booking trước giờ hẹn ít nhất 1 giờ. Nếu cần đổi thông tin sát giờ, vui lòng liên hệ Admin.",
      );
      return;
    }

    if (!window.confirm("Hủy booking này? Nếu cần đổi thông tin, bạn hãy đặt lại sau khi hủy.")) {
      return;
    }

    setCancelingId(booking.id);
    setMessage("");

    try {
      const cancelledBooking = await bookingApi.cancelMemberBooking(
        booking.id,
        "Customer cancelled from booking history",
      );
      const mergedBooking = { ...booking, ...cancelledBooking };
      setBookings((current) =>
        current.map((item) => (item.id === booking.id ? mergedBooking : item)),
      );
      rememberLastBooking(mergedBooking, { history: true });
      setMessage("Đã hủy booking. Admin đã nhận thông báo.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không hủy được booking.");
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <main className={styles.bookingPage}>
      <section className={`${styles.bookingViewport} ${styles.historyViewport}`}>
        <div className={`${styles.bookingFrame} ${styles.historyFrame} ${styles.wideFrame}`}>
          <header className={styles.bookingHeader}>
            <Link href="/tai-khoan" className={styles.backButton} aria-label="Quay lại tài khoản">
              <ChevronLeft size={18} />
            </Link>
            <div className={styles.headerCopy}>
              <h1 className={styles.headerTitle}>Đặt chỗ của tôi</h1>
              <p className={styles.headerSubtitle}>Lịch sử & trạng thái đặt bàn</p>
            </div>
          </header>

          <div className={styles.filterChips} role="tablist" aria-label="Lọc đặt chỗ">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`${styles.filterChip} ${activeTab === tab ? styles.selectedFilter : ""}`}
                aria-selected={activeTab === tab}
              >
                {tab}
              </button>
            ))}
          </div>

          {message ? (
            <div style={{ padding: "6px 16px 0" }}>
              <div className={styles.toastMessage}>{message}</div>
            </div>
          ) : null}

          <div className={styles.historyList}>
            {isLoading ? <LoadingSkeleton rows={3} /> : null}

            {!isLoading
              ? visibleBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    isMember={isMember}
                    cancelingId={cancelingId}
                    onCancel={handleCancelBooking}
                  />
                ))
              : null}
          </div>

          {!isLoading && visibleBookings.length === 0 ? (
            <div className={styles.emptyCard}>
              <EmptyState
                variant="bookings"
                title={
                  activeTab === tabs[0] ? "Chưa có đặt chỗ nào" : "Chưa có đặt chỗ ở trạng thái này"
                }
                description="Khi bạn đặt bàn hoặc đặt cast, lịch sử sẽ hiển thị tại đây."
                ctaLabel="Khám phá quán"
                ctaHref="/danh-sach-quan"
                compact
              />
            </div>
          ) : null}

          <div className={styles.historyFooter}>
            <div className={styles.infoNote}>
              <Clock size={15} />
              <span>
                Không sửa trực tiếp đặt chỗ cũ. Mỗi thay đổi tạo bản ghi mới - hủy trước 1 giờ rồi đặt lại hoặc liên hệ hỗ trợ.
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function BookingCard({
  booking,
  isMember,
  cancelingId,
  onCancel,
}: {
  booking: BookingRecord;
  isMember: boolean;
  cancelingId: string | null;
  onCancel: (booking: BookingRecord) => void;
}) {
  const group = bookingStatusGroup(booking.status);
  const isOpenBooking = group === "Mới";
  const hasQr = confirmedStatuses.has(booking.status);
  const cancelAllowed = isMember && canCancelBooking(booking);
  const cancelDisabled = cancelingId === booking.id || !cancelAllowed;
  const itemClass =
    group === "Mới"
      ? `${styles.historyItem} ${styles.historyItemOpen}`
      : group === "Đã hủy"
        ? `${styles.historyItem} ${styles.historyItemMuted}`
        : styles.historyItem;

  return (
    <article className={itemClass}>
      <div className={styles.historyMain}>
        <span
          className={styles.historyThumb}
          style={{
            backgroundImage: thumbnails[group],
            filter: group === "Đã hủy" ? "grayscale(.4)" : undefined,
          }}
        />
        <div className={styles.historyCopy}>
          <div className={styles.historyHead}>
            <h2 className={styles.historyTitle}>{bookingTitle(booking)}</h2>
            <StatusBadge status={booking.status} />
          </div>
          <div className={styles.historyMeta}>
            {formatDateTime(booking.scheduledAt)} · {booking.partySize} người
          </div>
          <div className={`${styles.historySubMeta} ${group === "Hoàn tất" ? styles.historySubMetaGold : ""}`}>
            {statusMeta(booking, group)}
          </div>
        </div>
      </div>

      <div className={styles.historyActions}>
        {isOpenBooking ? (
          <>
            {hasQr ? (
              <Link
                href={`/xac-nhan?bookingId=${booking.id}`}
                onClick={() => rememberLastBooking(booking, { history: true })}
                className={styles.secondaryCta}
              >
                <QrCode size={14} />
                Xem QR
              </Link>
            ) : isMember ? (
              <button
                type="button"
                onClick={() => onCancel(booking)}
                disabled={cancelDisabled}
                title={
                  cancelAllowed
                    ? "Hủy đặt chỗ"
                    : "Chỉ hủy được trước giờ hẹn ít nhất 1 giờ"
                }
                className={`${styles.dangerCta} ${cancelDisabled ? styles.disabledCta : ""}`}
              >
                <XCircle size={14} />
                {cancelingId === booking.id ? "Đang hủy" : cancelAllowed ? "Hủy đặt chỗ" : "Quá giờ"}
              </button>
            ) : (
              <Link
                href={`/xac-nhan?bookingId=${booking.id}`}
                onClick={() => rememberLastBooking(booking, { history: true })}
                className={styles.ghostCta}
              >
                <MessageCircle size={14} />
                Chi tiết
              </Link>
            )}
            <Link href="/huong-dan" className={styles.secondaryCta}>
              <Headphones size={14} />
              Hỗ trợ
            </Link>
          </>
        ) : group === "Hoàn tất" ? (
          <>
            <Link
              href={booking.store?.slug ? `/stores/${booking.store.slug}` : "/danh-sach-quan"}
              className={styles.ghostCta}
            >
              <Star size={14} />
              Đánh giá
            </Link>
            <Link href={rebookHref(booking)} className={styles.primaryCta}>
              <strong>Đặt lại</strong>
            </Link>
          </>
        ) : (
          <Link href={rebookHref(booking)} className={styles.secondaryCta}>
            <RotateCcw size={14} />
            Đặt lại
          </Link>
        )}
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  const group = bookingStatusGroup(status);
  const className =
    group === "Hoàn tất"
      ? `${styles.historyBadge} ${styles.historyBadgeDone}`
      : group === "Đã hủy"
        ? `${styles.historyBadge} ${styles.historyBadgeMuted}`
        : styles.historyBadge;

  return (
    <span className={className}>
      {group === "Hoàn tất" ? <Check size={9} /> : group === "Mới" ? <span className={styles.statusDot} /> : null}
      {bookingStatusLabel(status)}
    </span>
  );
}
