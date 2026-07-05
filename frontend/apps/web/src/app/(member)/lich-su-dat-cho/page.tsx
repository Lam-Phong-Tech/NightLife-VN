"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  Clock,
  Mail,
  MessageCircle,
  QrCode,
  RotateCcw,
  Star,
  XCircle,
} from "lucide-react";
import { getAuthUser } from "@/lib/auth/session";
import { useSocket } from "@/components/providers/SocketProvider";
import {
  bookingApi,
  bookingStatusGroup,
  bookingStatusLabel,
  canCancelBooking,
  mergeBookingHistories,
  rememberLastBooking,
  type BookingChatMessage,
  type BookingRecord,
  type BookingStatusGroup,
} from "@/lib/api/bookings";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import styles from "../booking-flow.module.css";

const tabs = ["Tất cả", "Mới", "Hoàn tất", "Đã hủy"] as const;
const confirmedStatuses = new Set(["CONFIRMED", "CHECKED_IN", "COMPLETED"]);
const isConfirmedStatus = (status: string) => confirmedStatuses.has(status.trim().toUpperCase());
const supportLineUrl = process.env.NEXT_PUBLIC_LINE_OA_URL ?? "https://line.me/R/ti/p/@vietyoru";
const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@vietyoru.vn";
const supportMailHref = `mailto:${supportEmail}?subject=${encodeURIComponent("Vietyoru booking support")}`;
const supportCancelMessage =
  "Chỉ có thể hủy booking trước giờ hẹn ít nhất 1 giờ. Nếu cần đổi thông tin hoặc hủy sát giờ, vui lòng liên hệ Admin qua LINE OA hoặc Mail.";
const missingGuestCancelIdentityMessage =
  "Booking guest thiếu số điện thoại xác thực. Vui lòng liên hệ Admin qua LINE OA hoặc Mail để hủy hoặc đổi thông tin.";
const missingGuestRescheduleIdentityMessage =
  "Booking guest thiếu số điện thoại xác thực. Vui lòng liên hệ Admin qua LINE OA hoặc Mail để đổi lịch.";
const missingGuestContactIdentityMessage =
  "Booking guest thiếu số điện thoại xác thực. Vui lòng liên hệ Admin qua LINE OA hoặc Mail.";

const thumbnails = {
  Mới: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=180&q=72')",
  "Hoàn tất":
    "url('https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=180&q=72')",
  "Đã hủy":
    "url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=180&q=72')",
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

const toDateTimeInputValue = (value: string) => {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
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

  return isConfirmedStatus(booking.status)
    ? `${bookingCode(booking)} · QR đã cấp`
    : `${bookingCode(booking)} · Admin đang điều phối`;
};

export default function Page() {
  const router = useRouter();
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Tất cả");
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [memberUserId, setMemberUserId] = useState("");
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [pendingCancelBooking, setPendingCancelBooking] = useState<BookingRecord | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [pendingRescheduleBooking, setPendingRescheduleBooking] = useState<BookingRecord | null>(null);
  const [rescheduleAt, setRescheduleAt] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [chatBooking, setChatBooking] = useState<BookingRecord | null>(null);
  const [chatMessages, setChatMessages] = useState<BookingChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let alive = true;

    const loadBookings = async () => {
      const authUser = getAuthUser();
      const isMemberAccount = authUser?.role?.toUpperCase() === "USER";
      if (!isMemberAccount) {
        if (alive) {
          setIsMember(false);
          setMemberUserId("");
          setBookings([]);
          setIsLoading(false);
        }
        router.replace(`/dang-nhap?redirect=${encodeURIComponent("/lich-su-dat-cho")}`);
        return;
      }

      if (alive) {
        setIsMember(true);
        setMemberUserId(authUser?.id ?? "");
      }

      try {
        if (isMemberAccount) {
          const items = await bookingApi.listMemberBookings();
          const resolvedMemberUserId =
            authUser?.id || items.find((booking) => booking.user?.id)?.user?.id || "";
          const memberBookings = items.map((booking) => ({
            ...booking,
            user:
              booking.user ??
              (authUser
                ? {
                    id: resolvedMemberUserId || "current-member",
                    displayName: authUser.displayName,
                    tier: authUser.tier ?? null,
                  }
                : undefined),
          }));
          if (alive) {
            setMemberUserId(resolvedMemberUserId);
            setBookings(memberBookings);
          }
          return;
        }
      } catch (error) {
        if (alive) {
          setBookings([]);
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
  }, [router]);

  useEffect(() => {
    if (!socket || !chatBooking) {
      return;
    }

    socket.emit("join_room", { bookingId: chatBooking.id });
    const onMessage = (nextMessage: BookingChatMessage) => {
      if (nextMessage.bookingId !== chatBooking.id) {
        return;
      }

      setChatMessages((current) =>
        current.some((item) => item.id === nextMessage.id) ? current : [...current, nextMessage],
      );
    };
    socket.on("booking_chat_message_created", onMessage);

    return () => {
      socket.off("booking_chat_message_created", onMessage);
    };
  }, [chatBooking, socket]);

  useEffect(() => {
    if (!socket || !memberUserId) {
      return;
    }

    socket.emit("join_room", { userId: memberUserId });
    const onBookingStatusUpdated = (updatedBooking: BookingRecord) => {
      if (!updatedBooking?.id) {
        return;
      }

      setBookings((current) => {
        const currentIndex = current.findIndex((booking) => booking.id === updatedBooking.id);
        if (currentIndex === -1) {
          return mergeBookingHistories([updatedBooking], current);
        }

        return current.map((booking) =>
          booking.id === updatedBooking.id
            ? {
                ...booking,
                ...updatedBooking,
                store: updatedBooking.store ?? booking.store,
                cast: updatedBooking.cast ?? booking.cast,
                guest: updatedBooking.guest ?? booking.guest,
                user: updatedBooking.user ?? booking.user,
                coupon: updatedBooking.coupon ?? booking.coupon,
                couponIssue: updatedBooking.couponIssue ?? booking.couponIssue,
              }
            : booking,
        );
      });
    };

    socket.on("booking_status_updated", onBookingStatusUpdated);

    return () => {
      socket.off("booking_status_updated", onBookingStatusUpdated);
    };
  }, [memberUserId, socket]);

  const visibleBookings = useMemo(
    () =>
      activeTab === "Tất cả"
        ? bookings
        : bookings.filter((booking) => bookingStatusGroup(booking.status) === activeTab),
    [activeTab, bookings],
  );

  const shouldUseMemberBookingApi = (booking: BookingRecord) => {
    if (!isMember || !booking.user?.id) {
      return false;
    }

    return !memberUserId || booking.user.id === memberUserId;
  };

  const handleCancelBooking = (booking: BookingRecord) => {
    if (!canCancelBooking(booking)) {
      setMessage(supportCancelMessage);
      return;
    }

    const useMemberApi = shouldUseMemberBookingApi(booking);
    const guestPhone = booking.guest?.phone?.trim() ?? "";
    if (!useMemberApi && !guestPhone) {
      setMessage(missingGuestCancelIdentityMessage);
      return;
    }

    setMessage("");
    setCancelReason("");
    setPendingCancelBooking(booking);
  };

  const closeCancelDialog = () => {
    if (cancelingId) {
      return;
    }

    setPendingCancelBooking(null);
    setCancelReason("");
  };

  const submitCancelBooking = async () => {
    const booking = pendingCancelBooking;
    if (!booking) {
      return;
    }

    const guestPhone = booking.guest?.phone?.trim() ?? "";
    const useMemberApi = shouldUseMemberBookingApi(booking);
    if (!useMemberApi && !guestPhone) {
      setMessage(missingGuestCancelIdentityMessage);
      return;
    }

    try {
      setCancelingId(booking.id);
      setMessage("");
      const reason = cancelReason.trim();
      const cancelledBooking = useMemberApi
        ? await bookingApi.cancelMemberBooking(booking.id, reason || undefined)
        : await bookingApi.cancelGuestBooking(booking.id, {
            phone: guestPhone,
            ...(reason ? { reason } : {}),
          });
      const mergedBooking = { ...booking, ...cancelledBooking };
      setBookings((current) =>
        current.map((item) => (item.id === booking.id ? mergedBooking : item)),
      );
      rememberLastBooking(mergedBooking);
      setPendingCancelBooking(null);
      setCancelReason("");
      setMessage("Đã hủy booking. Admin đã nhận thông báo.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không hủy được booking.");
    } finally {
      setCancelingId(null);
    }
  };

  const handleRescheduleBooking = (booking: BookingRecord) => {
    if (!canCancelBooking(booking)) {
      setMessage(supportCancelMessage);
      return;
    }

    const useMemberApi = shouldUseMemberBookingApi(booking);
    const guestPhone = booking.guest?.phone?.trim() ?? "";
    if (!useMemberApi && !guestPhone) {
      setMessage(missingGuestRescheduleIdentityMessage);
      return;
    }

    setMessage("");
    setPendingRescheduleBooking(booking);
    setRescheduleAt(toDateTimeInputValue(booking.scheduledAt));
    setRescheduleReason("");
  };

  const closeRescheduleDialog = () => {
    if (reschedulingId) {
      return;
    }

    setPendingRescheduleBooking(null);
    setRescheduleAt("");
    setRescheduleReason("");
  };

  const submitRescheduleRequest = async () => {
    const booking = pendingRescheduleBooking;
    if (!booking) {
      return;
    }

    const guestPhone = booking.guest?.phone?.trim() ?? "";
    const useMemberApi = shouldUseMemberBookingApi(booking);
    const requestedDate = new Date(rescheduleAt);
    if (!Number.isFinite(requestedDate.getTime())) {
      setMessage("Chọn ngày giờ mới hợp lệ trước khi gửi yêu cầu.");
      return;
    }

    if (!useMemberApi && !guestPhone) {
      setMessage(missingGuestRescheduleIdentityMessage);
      return;
    }

    setReschedulingId(booking.id);
    setMessage("");

    try {
      const payload = {
        scheduledAt: requestedDate.toISOString(),
        ...(rescheduleReason.trim() ? { reason: rescheduleReason.trim() } : {}),
      };
      await (useMemberApi
        ? bookingApi.requestMemberReschedule(booking.id, payload)
        : bookingApi.requestGuestReschedule(booking.id, { ...payload, phone: guestPhone }));
      setPendingRescheduleBooking(null);
      setRescheduleAt("");
      setRescheduleReason("");
      setMessage("Đã gửi yêu cầu đổi lịch. Admin sẽ xác nhận trước khi cập nhật booking.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không gửi được yêu cầu đổi lịch.");
    } finally {
      setReschedulingId(null);
    }
  };

  const openBookingChat = async (booking: BookingRecord) => {
    const useMemberApi = shouldUseMemberBookingApi(booking);
    const guestPhone = booking.guest?.phone?.trim() ?? "";
    if (!useMemberApi && !guestPhone) {
      setMessage(missingGuestContactIdentityMessage);
      return;
    }

    setChatBooking(booking);
    setChatMessages([]);
    setChatInput("");
    setChatLoading(true);
    setMessage("");

    try {
      const messages = useMemberApi
        ? await bookingApi.listMemberBookingMessages(booking.id)
        : await bookingApi.listGuestBookingMessages(booking.id, guestPhone);
      setChatMessages(messages);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không tải được chat booking.");
    } finally {
      setChatLoading(false);
    }
  };

  const closeBookingChat = () => {
    if (chatSending) {
      return;
    }

    setChatBooking(null);
    setChatMessages([]);
    setChatInput("");
  };

  const submitChatMessage = async () => {
    const booking = chatBooking;
    const body = chatInput.trim();
    if (!booking || !body) {
      return;
    }

    const guestPhone = booking.guest?.phone?.trim() ?? "";
    const useMemberApi = shouldUseMemberBookingApi(booking);
    if (!useMemberApi && !guestPhone) {
      setMessage(missingGuestContactIdentityMessage);
      return;
    }

    setChatSending(true);

    try {
      const sentMessage = useMemberApi
        ? await bookingApi.sendMemberBookingMessage(booking.id, {
            message: body,
            topic: "GENERAL",
          })
        : await bookingApi.sendGuestBookingMessage(booking.id, {
            phone: guestPhone,
            message: body,
            topic: "GENERAL",
          });
      setChatMessages((current) =>
        current.some((item) => item.id === sentMessage.id) ? current : [...current, sentMessage],
      );
      setChatInput("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không gửi được tin nhắn.");
    } finally {
      setChatSending(false);
    }
  };

  return (
    <main className={`${styles.bookingPage} ${styles.historyPage}`}>
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
                role="tab"
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
                    memberUserId={memberUserId}
                    cancelingId={cancelingId}
                    onCancel={handleCancelBooking}
                    onReschedule={handleRescheduleBooking}
                    onChat={openBookingChat}
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
                Không sửa trực tiếp đặt chỗ cũ. Mỗi thay đổi tạo bản ghi mới - hủy trước 1 giờ rồi
                đặt lại hoặc liên hệ Admin qua LINE OA / Mail.
              </span>
            </div>
          </div>
        </div>
      </section>

      {pendingCancelBooking ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-booking-title"
          className={styles.dialogOverlay}
        >
          <div className={styles.dialogPanel}>
            <h2 id="cancel-booking-title">Hủy booking</h2>
            <p>
              Nếu cần đổi ngày, số khách hoặc thông tin liên hệ, hãy hủy booking này rồi đặt lại.
              Trường hợp sát giờ, vui lòng liên hệ Admin qua LINE OA hoặc Mail.
            </p>
            <label className={styles.dialogField}>
              <span>Lý do hủy</span>
              <textarea
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                placeholder="Ví dụ: đổi lịch, nhầm thời gian, không thể đến..."
                maxLength={300}
                rows={4}
                className={styles.dialogTextArea}
              />
            </label>
            <div className={styles.dialogActions}>
              <button
                type="button"
                className={styles.ghostCta}
                onClick={closeCancelDialog}
                disabled={Boolean(cancelingId)}
              >
                Quay lại
              </button>
              <button
                type="button"
                className={`${styles.dangerCta} ${cancelingId ? styles.disabledCta : ""}`}
                onClick={submitCancelBooking}
                disabled={Boolean(cancelingId)}
              >
                <XCircle size={14} />
                {cancelingId ? "Đang hủy" : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {pendingRescheduleBooking ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reschedule-booking-title"
          className={styles.dialogOverlay}
        >
          <div className={styles.dialogPanel}>
            <h2 id="reschedule-booking-title">Đổi lịch booking</h2>
            <p>
              Yêu cầu sẽ ở trạng thái chờ duyệt. Booking chỉ đổi giờ sau khi Admin xác nhận.
            </p>
            <label className={styles.dialogField}>
              <span>Ngày giờ mới</span>
              <input
                type="datetime-local"
                value={rescheduleAt}
                onChange={(event) => setRescheduleAt(event.target.value)}
                className={styles.dialogInput}
              />
            </label>
            <label className={styles.dialogField}>
              <span>Lý do đổi lịch</span>
              <textarea
                value={rescheduleReason}
                onChange={(event) => setRescheduleReason(event.target.value)}
                placeholder="Ví dụ: đổi ngày đi, muốn khung giờ muộn hơn..."
                maxLength={300}
                rows={4}
                className={styles.dialogTextArea}
              />
            </label>
            <div className={styles.dialogActions}>
              <button
                type="button"
                className={styles.ghostCta}
                onClick={closeRescheduleDialog}
                disabled={Boolean(reschedulingId)}
              >
                Quay lại
              </button>
              <button
                type="button"
                className={`${styles.primaryCta} ${reschedulingId ? styles.disabledCta : ""}`}
                onClick={submitRescheduleRequest}
                disabled={Boolean(reschedulingId)}
              >
                {reschedulingId ? "Đang gửi" : "Gửi yêu cầu"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {chatBooking ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-chat-title"
          className={styles.dialogOverlay}
        >
          <div className={styles.dialogPanel}>
            <h2 id="booking-chat-title">Chat với Admin</h2>
            <p>
              {bookingTitle(chatBooking)} · {bookingCode(chatBooking)}
            </p>
            <div className={styles.chatList}>
              {chatLoading ? <div className={styles.chatEmpty}>Đang tải tin nhắn...</div> : null}
              {!chatLoading && chatMessages.length === 0 ? (
                <div className={styles.chatEmpty}>Chưa có tin nhắn nào.</div>
              ) : null}
              {chatMessages.map((item) => {
                const fromCustomer = item.senderType === "GUEST" || item.senderType === "MEMBER";
                return (
                  <div
                    key={item.id}
                    className={`${styles.chatBubble} ${fromCustomer ? styles.chatBubbleMine : ""}`}
                  >
                    <span>{item.senderType}</span>
                    <p>{item.body}</p>
                  </div>
                );
              })}
            </div>
            <label className={styles.dialogField}>
              <span>Tin nhắn</span>
              <textarea
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Nhập nội dung cần đổi/hủy booking..."
                maxLength={800}
                rows={3}
                className={styles.dialogTextArea}
              />
            </label>
            <div className={styles.dialogActions}>
              <button
                type="button"
                className={styles.ghostCta}
                onClick={closeBookingChat}
                disabled={chatSending}
              >
                Đóng
              </button>
              <button
                type="button"
                className={`${styles.primaryCta} ${chatSending ? styles.disabledCta : ""}`}
                onClick={submitChatMessage}
                disabled={chatSending || !chatInput.trim()}
              >
                {chatSending ? "Đang gửi" : "Gửi tin"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function BookingCard({
  booking,
  isMember,
  memberUserId,
  cancelingId,
  onCancel,
  onReschedule,
  onChat,
}: {
  booking: BookingRecord;
  isMember: boolean;
  memberUserId: string;
  cancelingId: string | null;
  onCancel: (booking: BookingRecord) => void;
  onReschedule: (booking: BookingRecord) => void;
  onChat: (booking: BookingRecord) => void;
}) {
  const group = bookingStatusGroup(booking.status);
  const isOpenBooking = group === "Mới";
  const hasQr = isConfirmedStatus(booking.status);
  const isMemberActionBooking =
    isMember && Boolean(booking.user?.id) && (!memberUserId || booking.user?.id === memberUserId);
  const hasCancelIdentity = isMemberActionBooking || Boolean(booking.guest?.phone?.trim());
  const cancelAllowed = isOpenBooking && canCancelBooking(booking) && hasCancelIdentity;
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
          <div
            className={`${styles.historySubMeta} ${group === "Hoàn tất" ? styles.historySubMetaGold : ""}`}
          >
            {statusMeta(booking, group)}
          </div>
        </div>
      </div>

      <div className={styles.historyActions}>
        {isOpenBooking ? (
          <>
            <button type="button" onClick={() => onChat(booking)} className={styles.secondaryCta}>
              <MessageCircle size={14} />
              Chat Admin
            </button>
            {cancelAllowed ? (
              <button type="button" onClick={() => onReschedule(booking)} className={styles.ghostCta}>
                <Clock size={14} />
                Đổi lịch
              </button>
            ) : null}
            {hasQr ? (
              <Link
                href={`/xac-nhan?bookingId=${booking.id}`}
                onClick={() => rememberLastBooking(booking)}
                className={styles.secondaryCta}
              >
                <QrCode size={14} />
                Xem QR
              </Link>
            ) : !cancelAllowed ? (
              <Link
                href={`/xac-nhan?bookingId=${booking.id}`}
                onClick={() => rememberLastBooking(booking)}
                className={styles.ghostCta}
              >
                <MessageCircle size={14} />
                Chi tiết
              </Link>
            ) : null}
            {cancelAllowed ? (
              <button
                type="button"
                onClick={() => onCancel(booking)}
                disabled={cancelDisabled}
                title={cancelAllowed ? "Hủy đặt chỗ" : "Chỉ hủy được trước giờ hẹn ít nhất 1 giờ"}
                className={`${styles.dangerCta} ${cancelDisabled ? styles.disabledCta : ""}`}
              >
                <XCircle size={14} />
                {cancelingId === booking.id
                  ? "Đang hủy"
                  : cancelAllowed
                    ? "Hủy đặt chỗ"
                    : "Quá giờ"}
              </button>
            ) : (
              <>
                <a
                  href={supportLineUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.secondaryCta}
                >
                  <MessageCircle size={14} />
                  LINE OA
                </a>
                <a href={supportMailHref} className={styles.ghostCta}>
                  <Mail size={14} />
                  Mail Admin
                </a>
              </>
            )}
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
      {group === "Hoàn tất" ? (
        <Check size={9} />
      ) : group === "Mới" ? (
        <span className={styles.statusDot} />
      ) : null}
      {bookingStatusLabel(status)}
    </span>
  );
}
