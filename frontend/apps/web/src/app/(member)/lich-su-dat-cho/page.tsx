"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  ChevronLeft,
  Clock,
  MessageCircle,
  QrCode,
  ReceiptText,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { getAuthUser } from "@/lib/auth/session";
import { useSocket } from "@/components/providers/SocketProvider";
import { BookingDateTimeFields } from "@/components/ui/BookingDateTimeFields";
import {
  bookingApi,
  bookingRecordStatusGroup,
  bookingRecordStatusLabel,
  canCancelBooking,
  getGuestBookingHistory,
  getLastBooking,
  isBookingPastDue,
  mergeBookingHistories,
  rememberLastBooking,
  sortBookingHistories,
  type BookingRecord,
  type BookingStatusGroup,
} from "@/lib/api/bookings";
import { getStoreDetail } from "@/lib/api/store-detail";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import {
  buildBookingTimeSlots,
  buildScheduledAtFromBookingSlot,
  type OpeningHoursInput,
} from "@/lib/booking-time-slots";
import {
  bookingValidationLimits,
  validateBookingDate,
  validateBookingTime,
} from "@/lib/booking-validation";
import {
  getBookingDateAfterDays,
  getTodayBookingDate,
  toBookingDateInputValue,
} from "@/lib/booking-date";
import {
  intlLocaleByLanguage,
  useActiveLanguage,
  type LanguageCode,
} from "@/lib/i18n/use-active-language";
import { translateText } from "@/lib/i18n/client-translations";
import { useUserActionFeedback, userActionErrorMessage } from "@/lib/user-action-feedback";
import styles from "../booking-flow.module.css";

const tabs = ["Tất cả", "Mới", "Hoàn tất", "Đã hủy"] as const;
const historyPageSize = 5;
const { bookingDateWindowDays } = bookingValidationLimits;
const confirmedStatuses = new Set(["CONFIRMED", "CHECKED_IN", "COMPLETED"]);
const isConfirmedStatus = (status: string) => confirmedStatuses.has(status.trim().toUpperCase());
const supportCancelMessage =
  "Chỉ có thể hủy booking trước giờ hẹn ít nhất 1 giờ. Nếu cần đổi thông tin hoặc hủy sát giờ, vui lòng liên hệ Admin qua Mail.";
const missingGuestCancelIdentityMessage =
  "Booking guest thiếu số điện thoại xác thực. Vui lòng liên hệ Admin qua Mail để hủy hoặc đổi thông tin.";
const missingGuestRescheduleIdentityMessage =
  "Booking guest thiếu số điện thoại xác thực. Vui lòng liên hệ Admin qua Mail để đổi lịch.";
const maxRescheduleReasonLength = 300;
const minRescheduleReasonLength = 5;
const reasonContentPattern = /[\p{L}\p{N}]/u;
const hasOpeningHours = (openingHours: OpeningHoursInput) =>
  Boolean(
    openingHours &&
    typeof openingHours === "object" &&
    !Array.isArray(openingHours) &&
    Object.keys(openingHours).length,
  );

const thumbnails = {
  Mới: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=180&q=72')",
  "Hoàn tất":
    "url('https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=180&q=72')",
  "Đã hủy":
    "url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=180&q=72')",
};

const formatDateTime = (value: string, language: LanguageCode) =>
  new Intl.DateTimeFormat(intlLocaleByLanguage[language], {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));

const formatGuestCount = (count: number, language: LanguageCode) => {
  switch (language) {
    case "en":
      return `${count} ${count === 1 ? "guest" : "guests"}`;
    case "ja":
      return `${count}名`;
    case "ko":
      return `${count}명`;
    case "zh":
      return `${count}人`;
    default:
      return `${count} người`;
  }
};

const formatHistoryPagination = (
  start: number,
  end: number,
  total: number,
  language: LanguageCode,
) => {
  switch (language) {
    case "en":
      return `Showing ${start}-${end} / ${total} reservations`;
    case "ja":
      return `${start}-${end} / ${total} 件の予約を表示`;
    case "ko":
      return `예약 ${total}개 중 ${start}-${end} 표시`;
    case "zh":
      return `显示 ${start}-${end} / ${total} 个预约`;
    default:
      return `Hiển thị ${start}-${end} / ${total} lịch`;
  }
};

const toDateInputValue = toBookingDateInputValue;

const getTodayDate = getTodayBookingDate;

const getMaxBookingDate = () => getBookingDateAfterDays(bookingDateWindowDays);

const clampBookingDate = (value?: string | null) => {
  const today = getTodayDate();
  const maxDate = getMaxBookingDate();

  if (!value) return today;
  if (value < today) return today;
  if (value > maxDate) return maxDate;
  return value;
};

const getTomorrowDate = () => getBookingDateAfterDays(1);

const isTourBooking = (booking: BookingRecord) => Boolean(booking.tour);

const bookingTitle = (booking: BookingRecord) => {
  if (booking.tour) return booking.tour.title;
  const storeName = booking.store?.name ?? "NightLife";
  if (!booking.cast) return storeName;
  return `${booking.cast.publicAlias ?? booking.cast.stageName} @ ${storeName}`;
};

const tourStopCountText = (booking: BookingRecord, language: LanguageCode) => {
  const count = booking.tour?.stops.length ?? 0;
  if (!count) return translateText("Tour", language);
  return translateText(`${count} điểm dừng`, language);
};

const tourStopsPreview = (booking: BookingRecord, language: LanguageCode) => {
  const stops = booking.tour?.stops ?? [];
  if (!stops.length) return translateText("Admin đang điều phối lịch trình tour", language);

  const names = stops.map((stop) => stop.storeName).filter(Boolean);
  return names.length
    ? `${tourStopCountText(booking, language)} · ${names.slice(0, 3).join(" > ")}`
    : tourStopCountText(booking, language);
};

const bookingTimeValue = (value: string) => {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "21:00";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const normalizeRescheduleReason = (value: string) => value.trim().replace(/\s+/g, " ");

const validateRescheduleRequest = ({
  booking,
  availableTimes,
  openingHours,
  rescheduleDate,
  rescheduleTime,
  reason,
}: {
  booking: BookingRecord;
  availableTimes: string[];
  openingHours: OpeningHoursInput;
  rescheduleDate: string;
  rescheduleTime: string;
  reason: string;
}) => {
  const normalizedReason = normalizeRescheduleReason(reason);

  const scheduledAt = buildScheduledAtFromBookingSlot(rescheduleDate, rescheduleTime, openingHours);
  const scheduledDate = new Date(scheduledAt);

  const dateError = validateBookingDate({
    bookingDate: rescheduleDate,
    maxDate: getMaxBookingDate(),
    todayDate: getTodayDate(),
  });
  if (dateError) {
    return dateError;
  }

  const timeError = validateBookingTime({
    availableTimes,
    bookingTime: rescheduleTime,
    scheduledAt,
  });
  if (timeError) {
    return timeError;
  }

  if (
    Number.isFinite(scheduledDate.getTime()) &&
    Math.abs(scheduledDate.getTime() - new Date(booking.scheduledAt).getTime()) < 1000
  ) {
    return "Ngày giờ mới phải khác lịch đặt hiện tại.";
  }

  if (!canCancelBooking(booking)) {
    return supportCancelMessage;
  }

  if (!normalizedReason) {
    return "Vui lòng nhập lý do đổi lịch.";
  }

  if (normalizedReason.length < minRescheduleReasonLength) {
    return `Lý do đổi lịch tối thiểu ${minRescheduleReasonLength} ký tự.`;
  }

  if (normalizedReason.length > maxRescheduleReasonLength) {
    return `Lý do đổi lịch tối đa ${maxRescheduleReasonLength} ký tự.`;
  }

  if (!reasonContentPattern.test(normalizedReason)) {
    return "Lý do đổi lịch cần có chữ hoặc số.";
  }

  if (/[<>]/.test(normalizedReason)) {
    return "Lý do đổi lịch không được chứa ký tự < hoặc >.";
  }

  return "";
};

const rebookHref = (booking: BookingRecord) => {
  if (booking.tour) return tourDetailHref(booking);

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

const tourDetailHref = (booking: BookingRecord) => {
  const tourId = booking.tour?.id;
  return tourId && !tourId.startsWith("note-tour-")
    ? `/tour/${encodeURIComponent(tourId)}`
    : "/tour";
};

const billSubmitHref = (booking: BookingRecord) => {
  const params = new URLSearchParams({
    bookingId: booking.id,
    ...(booking.store?.slug ? { storeSlug: booking.store.slug } : {}),
    ...(booking.couponIssue?.id ? { couponIssueId: booking.couponIssue.id } : {}),
  });

  return `/gui-hoa-don?${params.toString()}`;
};

const bookingConfirmHref = (booking: BookingRecord) =>
  `/xac-nhan?bookingId=${encodeURIComponent(booking.id)}`;

const statusMeta = (booking: BookingRecord, group: BookingStatusGroup, language: LanguageCode) => {
  if (booking.tour) {
    if (isBookingPastDue(booking)) {
      return `${booking.bookingCode} · ${translateText("Đã qua giờ tour, vui lòng liên hệ Admin nếu cần điều phối lại.", language)}`;
    }

    if (group === "Hoàn tất") {
      return translateText("Hoàn tất tour · admin đối soát theo lịch trình", language);
    }

    if (group === "Đã hủy") {
      return translateText("Đã hủy yêu cầu tour · không thu cọc", language);
    }

    return `${booking.bookingCode} · ${translateText("Admin đang điều phối tour", language)}`;
  }

  if (isBookingPastDue(booking)) {
    return `${booking.bookingCode} · ${translateText("Đã qua giờ đặt, bạn có thể đặt lại nếu cần.", language)}`;
  }

  if (group === "Hoàn tất") {
    return translateText("Hoàn tất · gắn điểm/hoá đơn khi đối soát", language);
  }

  if (group === "Đã hủy") {
    return translateText("Đã hủy trước giờ hẹn · không thu cọc", language);
  }

  return isConfirmedStatus(booking.status)
    ? `${booking.bookingCode} · ${translateText("QR đã cấp", language)}`
    : `${booking.bookingCode} · ${translateText("Admin đang điều phối", language)}`;
};

const bookingThumbnail = (booking: BookingRecord, group: BookingStatusGroup) => {
  const image = booking.store?.media?.[0]?.url ?? booking.cast?.media?.[0]?.url;
  return image ? `url(${JSON.stringify(image)})` : thumbnails[group];
};

export default function Page() {
  const router = useRouter();
  const { socket } = useSocket();
  const activeLanguage = useActiveLanguage();
  const userFeedback = useUserActionFeedback();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Tất cả");
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [memberUserId, setMemberUserId] = useState("");
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [pendingCancelBooking, setPendingCancelBooking] = useState<BookingRecord | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [pendingRescheduleBooking, setPendingRescheduleBooking] = useState<BookingRecord | null>(
    null,
  );
  const [rescheduleDate, setRescheduleDate] = useState(getTodayDate);
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [rescheduleError, setRescheduleError] = useState("");
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [isRescheduleHoursLoading, setRescheduleHoursLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [currentHistoryPage, setCurrentHistoryPage] = useState(1);
  const [dialogPortalTarget, setDialogPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setDialogPortalTarget(document.body);
  }, []);

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
          // URL bookingId can be stale; the session booking is the one just created in this tab.
          const lastBooking = getLastBooking();
          const resolvedMemberUserId =
            authUser?.id || items.find((booking) => booking.user?.id)?.user?.id || "";
          const currentMemberUser = authUser
            ? {
                id: resolvedMemberUserId || "current-member",
                displayName: authUser.displayName,
                tier: authUser.tier ?? null,
              }
            : undefined;
          const attachCurrentMemberUser = (booking: BookingRecord): BookingRecord => {
            const hasGuestIdentity = Boolean(booking.guest?.id || booking.guest?.phone?.trim());
            if (booking.user?.id || hasGuestIdentity || !currentMemberUser) {
              return booking;
            }

            return {
              ...booking,
              user: currentMemberUser,
            };
          };
          const memberBookings = items.map(attachCurrentMemberUser);
          const localHistory = getGuestBookingHistory().map(attachCurrentMemberUser);
          const localBookingById = new Map(
            localHistory
              .filter((booking) => booking.id)
              .map((booking) => [booking.id, booking] as const),
          );
          const enrichedMemberBookings = memberBookings.map((booking) => {
            const localBooking = localBookingById.get(booking.id);
            return localBooking
              ? (mergeBookingHistories([booking], [localBooking])[0] ?? booking)
              : booking;
          });
          const normalizedLastBooking = lastBooking ? attachCurrentMemberUser(lastBooking) : null;
          if (alive) {
            const mergedBookings = mergeBookingHistories(
              enrichedMemberBookings,
              localHistory,
              normalizedLastBooking ? [normalizedLastBooking] : [],
            );
            setMemberUserId(resolvedMemberUserId);
            setBookings(sortBookingHistories(mergedBookings, Date.now()));
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

        return sortBookingHistories(
          current.map((booking) =>
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
          ),
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
        : bookings.filter((booking) => bookingRecordStatusGroup(booking) === activeTab),
    [activeTab, bookings],
  );
  const historyTotalPages = Math.max(1, Math.ceil(visibleBookings.length / historyPageSize));
  const safeHistoryPage = Math.min(currentHistoryPage, historyTotalPages);
  const historyPageStart = visibleBookings.length ? (safeHistoryPage - 1) * historyPageSize + 1 : 0;
  const historyPageEnd = Math.min(visibleBookings.length, safeHistoryPage * historyPageSize);
  const paginatedBookings = useMemo(() => {
    const startIndex = (safeHistoryPage - 1) * historyPageSize;
    return visibleBookings.slice(startIndex, startIndex + historyPageSize);
  }, [safeHistoryPage, visibleBookings]);
  const historyPageNumbers = useMemo(() => {
    const visibleButtonCount = 5;
    const halfWindow = Math.floor(visibleButtonCount / 2);
    const start = Math.max(
      1,
      Math.min(safeHistoryPage - halfWindow, historyTotalPages - visibleButtonCount + 1),
    );
    const end = Math.min(historyTotalPages, start + visibleButtonCount - 1);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [historyTotalPages, safeHistoryPage]);
  const rescheduleOpeningHours = pendingRescheduleBooking?.store?.openingHours ?? null;
  const rescheduleTimeOptions = useMemo(() => {
    if (!pendingRescheduleBooking) {
      return [];
    }

    return buildBookingTimeSlots(rescheduleOpeningHours, rescheduleDate, {
      fallback: "empty",
    });
  }, [pendingRescheduleBooking, rescheduleDate, rescheduleOpeningHours]);
  const pendingRescheduleStoreSlug = pendingRescheduleBooking?.store?.slug ?? "";
  const pendingRescheduleStoreHasOpeningHours = hasOpeningHours(rescheduleOpeningHours);

  useEffect(() => {
    const booking = pendingRescheduleBooking;
    if (!booking) {
      queueMicrotask(() => setRescheduleHoursLoading(false));
      return;
    }

    if (pendingRescheduleStoreHasOpeningHours || !pendingRescheduleStoreSlug) {
      queueMicrotask(() => setRescheduleHoursLoading(false));
      return;
    }

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setRescheduleHoursLoading(true);
      }
    });

    getStoreDetail(pendingRescheduleStoreSlug)
      .then((store) => {
        if (cancelled) return;

        const openingHours = store.openingHours ?? null;
        const slots = buildBookingTimeSlots(openingHours, rescheduleDate, {
          fallback: "empty",
        });

        setPendingRescheduleBooking((current) => {
          if (!current || current.id !== booking.id || !current.store) {
            return current;
          }

          return {
            ...current,
            store: {
              ...current.store,
              openingHours,
            },
          };
        });
        setRescheduleTime((current) => (slots.includes(current) ? current : (slots[0] ?? "")));

        if (!hasOpeningHours(openingHours)) {
          setRescheduleError("Quán chưa có cấu hình khung giờ đặt bàn trên admin.");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRescheduleError("Chưa tải được khung giờ của quán. Vui lòng thử lại.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setRescheduleHoursLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    pendingRescheduleBooking,
    pendingRescheduleStoreHasOpeningHours,
    pendingRescheduleStoreSlug,
    rescheduleDate,
  ]);

  const shouldUseMemberBookingApi = (booking: BookingRecord) => {
    if (!isMember || !booking.user?.id) {
      return false;
    }

    return !memberUserId || booking.user.id === memberUserId;
  };

  useEffect(() => {
    queueMicrotask(() => setCurrentHistoryPage(1));
  }, [activeTab]);

  useEffect(() => {
    if (currentHistoryPage > historyTotalPages) {
      queueMicrotask(() => setCurrentHistoryPage(historyTotalPages));
    }
  }, [currentHistoryPage, historyTotalPages]);

  const handleCancelBooking = (booking: BookingRecord) => {
    if (!canCancelBooking(booking)) {
      setMessage(supportCancelMessage);
      userFeedback.warning({
        title: "Không thể hủy booking",
        description: supportCancelMessage,
      });
      return;
    }

    const useMemberApi = shouldUseMemberBookingApi(booking);
    const guestPhone = booking.guest?.phone?.trim() ?? "";
    if (!useMemberApi && !guestPhone) {
      setMessage(missingGuestCancelIdentityMessage);
      userFeedback.warning({
        title: "Không thể hủy booking",
        description: missingGuestCancelIdentityMessage,
      });
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
      userFeedback.warning({
        title: "Không thể hủy booking",
        description: missingGuestCancelIdentityMessage,
      });
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
        sortBookingHistories(
          current.map((item) => (item.id === booking.id ? mergedBooking : item)),
        ),
      );
      rememberLastBooking(mergedBooking);
      setPendingCancelBooking(null);
      setCancelReason("");
      userFeedback.success({
        title: "Đã hủy booking",
        description: "Admin đã nhận thông báo.",
      });
      setMessage("Đã hủy booking. Admin đã nhận thông báo.");
    } catch (error) {
      const message = userActionErrorMessage(error, "Không hủy được booking.");
      setMessage(message);
      userFeedback.error({
        title: "Hủy booking thất bại",
        description: message,
      });
    } finally {
      setCancelingId(null);
    }
  };

  const handleRescheduleBooking = (booking: BookingRecord) => {
    if (!canCancelBooking(booking)) {
      setMessage(supportCancelMessage);
      userFeedback.warning({
        title: "Không thể đổi lịch",
        description: supportCancelMessage,
      });
      return;
    }

    const useMemberApi = shouldUseMemberBookingApi(booking);
    const guestPhone = booking.guest?.phone?.trim() ?? "";
    if (!useMemberApi && !guestPhone) {
      setMessage(missingGuestRescheduleIdentityMessage);
      userFeedback.warning({
        title: "Không thể đổi lịch",
        description: missingGuestRescheduleIdentityMessage,
      });
      return;
    }

    const nextDate = clampBookingDate(toDateInputValue(new Date(booking.scheduledAt)));
    const storeOpeningHours = booking.store?.openingHours ?? null;
    const slots = buildBookingTimeSlots(storeOpeningHours, nextDate, { fallback: "empty" });
    const currentTime = bookingTimeValue(booking.scheduledAt);
    const nextTime = slots.includes(currentTime) ? currentTime : (slots[0] ?? "");

    setMessage("");
    setPendingRescheduleBooking(booking);
    setRescheduleDate(nextDate);
    setRescheduleTime(nextTime);
    setRescheduleReason("");
    setRescheduleError("");
    setRescheduleHoursLoading(!hasOpeningHours(storeOpeningHours) && Boolean(booking.store?.slug));
  };

  const closeRescheduleDialog = () => {
    if (reschedulingId) {
      return;
    }

    setPendingRescheduleBooking(null);
    setRescheduleDate(getTodayDate());
    setRescheduleTime("");
    setRescheduleReason("");
    setRescheduleError("");
    setRescheduleHoursLoading(false);
  };

  const submitRescheduleRequest = async () => {
    const booking = pendingRescheduleBooking;
    if (!booking) {
      return;
    }

    const guestPhone = booking.guest?.phone?.trim() ?? "";
    const useMemberApi = shouldUseMemberBookingApi(booking);

    if (isRescheduleHoursLoading) {
      setRescheduleError("Đang tải khung giờ của quán, vui lòng chờ một chút.");
      userFeedback.warning({
        title: "Chưa thể đổi lịch",
        description: "Đang tải khung giờ của quán, vui lòng chờ một chút.",
      });
      return;
    }

    const validationError = validateRescheduleRequest({
      booking,
      availableTimes: rescheduleTimeOptions,
      openingHours: rescheduleOpeningHours,
      rescheduleDate,
      rescheduleTime,
      reason: rescheduleReason,
    });

    if (validationError) {
      setRescheduleError(validationError);
      userFeedback.warning({
        title: "Chưa thể đổi lịch",
        description: validationError,
      });
      return;
    }

    if (!useMemberApi && !guestPhone) {
      setRescheduleError(missingGuestRescheduleIdentityMessage);
      setMessage(missingGuestRescheduleIdentityMessage);
      userFeedback.warning({
        title: "Không thể đổi lịch",
        description: missingGuestRescheduleIdentityMessage,
      });
      return;
    }

    const normalizedReason = normalizeRescheduleReason(rescheduleReason);
    const scheduledAt = buildScheduledAtFromBookingSlot(
      rescheduleDate,
      rescheduleTime,
      rescheduleOpeningHours,
    );
    setReschedulingId(booking.id);
    setRescheduleError("");
    setMessage("");

    try {
      const payload = {
        scheduledAt,
        reason: normalizedReason,
      };
      const rescheduledBooking = await (useMemberApi
        ? bookingApi.requestMemberReschedule(booking.id, payload)
        : bookingApi.requestGuestReschedule(booking.id, { ...payload, phone: guestPhone }));
      const updatedBooking: BookingRecord = {
        ...booking,
        ...rescheduledBooking,
        store: rescheduledBooking.store ?? booking.store,
        cast: rescheduledBooking.cast ?? booking.cast,
        guest: rescheduledBooking.guest ?? booking.guest,
        user: rescheduledBooking.user ?? booking.user,
        coupon: rescheduledBooking.coupon ?? booking.coupon,
        couponIssue: rescheduledBooking.couponIssue ?? booking.couponIssue,
      };
      setBookings((current) =>
        sortBookingHistories(
          current.map((item) => (item.id === booking.id ? updatedBooking : item)),
        ),
      );
      rememberLastBooking(updatedBooking);
      setPendingRescheduleBooking(null);
      setRescheduleDate(getTodayDate());
      setRescheduleTime("");
      setRescheduleReason("");
      setRescheduleError("");
      setMessage("Đã đổi lịch booking. Lịch mới đã được cập nhật.");
      userFeedback.success({
        title: "Đã đổi lịch booking",
        description: "Lịch mới đã được cập nhật.",
      });
    } catch (error) {
      const message = userActionErrorMessage(error, "Không gửi được yêu cầu đổi lịch.");
      setRescheduleError(message);
      userFeedback.error({
        title: "Đổi lịch thất bại",
        description: message,
      });
    } finally {
      setReschedulingId(null);
    }
  };

  const openBookingChat = (booking: BookingRecord) => {
    let draftText = "";
    switch (activeLanguage) {
      case "vi":
        draftText = `Tôi cần hỗ trợ về booking ${booking.bookingCode}`;
        break;
      case "ja":
        draftText = `予約 ${booking.bookingCode} についてサポートが必要です`;
        break;
      case "ko":
        draftText = `예약 ${booking.bookingCode}에 대한 지원이 필요합니다`;
        break;
      case "zh":
        draftText = `我需要关于订单 ${booking.bookingCode} 的支持`;
        break;
      default:
        draftText = `I need support with booking ${booking.bookingCode}`;
        break;
    }
    window.dispatchEvent(
      new CustomEvent("nightlife:support-chat:open", {
        detail: { draft: draftText },
      }),
    );
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
              <p className={styles.headerSubtitle}>Lịch sử đặt bàn & tour</p>
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
                {translateText(tab, activeLanguage)}
              </button>
            ))}
          </div>

          {message ? (
            <div style={{ padding: "6px 16px 0" }}>
              <div className={styles.toastMessage}>{translateText(message, activeLanguage)}</div>
            </div>
          ) : null}

          <div className={styles.historyList}>
            {isLoading ? <LoadingSkeleton rows={3} /> : null}

            {!isLoading
              ? paginatedBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    isMember={isMember}
                    memberUserId={memberUserId}
                    cancelingId={cancelingId}
                    activeLanguage={activeLanguage}
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
                title={translateText(
                  activeTab === tabs[0]
                    ? "Chưa có đặt chỗ nào"
                    : "Chưa có đặt chỗ ở trạng thái này",
                  activeLanguage,
                )}
                description={translateText(
                  "Khi bạn đặt bàn, đặt cast hoặc đặt tour, lịch sử sẽ hiển thị tại đây.",
                  activeLanguage,
                )}
                ctaLabel={translateText("Khám phá quán", activeLanguage)}
                ctaHref="/danh-sach-quan"
                compact
              />
            </div>
          ) : null}

          {!isLoading && visibleBookings.length > historyPageSize ? (
            <nav
              className={styles.historyPagination}
              aria-label={translateText("Phân trang lịch sử đặt chỗ", activeLanguage)}
            >
              <span className={styles.historyPaginationSummary}>
                {formatHistoryPagination(
                  historyPageStart,
                  historyPageEnd,
                  visibleBookings.length,
                  activeLanguage,
                )}
              </span>
              <div className={styles.historyPaginationActions}>
                <button
                  type="button"
                  className={styles.historyPageButton}
                  onClick={() => setCurrentHistoryPage((page) => Math.max(1, page - 1))}
                  disabled={safeHistoryPage <= 1}
                >
                  {translateText("Trước", activeLanguage)}
                </button>
                {historyPageNumbers.map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`${styles.historyPageButton} ${
                      page === safeHistoryPage ? styles.historyPageButtonActive : ""
                    }`}
                    onClick={() => setCurrentHistoryPage(page)}
                    aria-current={page === safeHistoryPage ? "page" : undefined}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  className={styles.historyPageButton}
                  onClick={() =>
                    setCurrentHistoryPage((page) => Math.min(historyTotalPages, page + 1))
                  }
                  disabled={safeHistoryPage >= historyTotalPages}
                >
                  {translateText("Sau", activeLanguage)}
                </button>
              </div>
            </nav>
          ) : null}

          <div className={styles.historyFooter}>
            <div className={styles.infoNote}>
              <Clock size={15} />
              <span>
                Có thể đổi lịch hoặc hủy đặt chỗ trước giờ hẹn tối thiểu 1 tiếng. Trường hợp sát
                giờ, vui lòng liên hệ Admin qua Mail.
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
              Trường hợp sát giờ, vui lòng liên hệ Admin qua Mail.
            </p>
            <label className={styles.dialogField}>
              <span>Lý do hủy</span>
              <textarea
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                placeholder="Ví dụ: đổi lịch, nhầm thời gian, không thể đến..."
                maxLength={300}
                rows={4}
                autoComplete="off"
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
      {pendingRescheduleBooking && dialogPortalTarget
        ? createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reschedule-booking-title"
            className={styles.dialogOverlay}
          >
            <div className={styles.dialogPanel}>
            <h2 id="reschedule-booking-title">Đổi lịch booking</h2>
            <p>
              Bạn có thể đổi lịch trước giờ hẹn tối thiểu 1 tiếng. Lịch mới sẽ được cập nhật ngay
              sau khi gửi.
            </p>
            <BookingDateTimeFields
              dateLabel="Ngày mới"
              timeLabel="Khung giờ mới"
              dateValue={rescheduleDate}
              timeValue={rescheduleTime}
              timeOptions={rescheduleTimeOptions}
              minDate={getTodayDate()}
              maxDate={getMaxBookingDate()}
              loadingTimes={isRescheduleHoursLoading}
              onDateChange={(value) => {
                const nextDate = clampBookingDate(value);
                const nextSlots = buildBookingTimeSlots(rescheduleOpeningHours, nextDate, {
                  fallback: "empty",
                });
                setRescheduleDate(nextDate);
                setRescheduleTime((current) =>
                  nextSlots.includes(current) ? current : (nextSlots[0] ?? ""),
                );
                setRescheduleError("");
              }}
              onTimeChange={(time) => {
                setRescheduleTime(time);
                setRescheduleError("");
              }}
              emptyMessage="Quán không có khung giờ đặt bàn trong ngày này."
              fieldClassName={styles.dialogField}
              layout="stack"
            />
            <label className={styles.dialogField}>
              <span>Lý do đổi lịch</span>
              <textarea
                value={rescheduleReason}
                onChange={(event) => {
                  setRescheduleReason(event.target.value);
                  setRescheduleError("");
                }}
                placeholder="Ví dụ: đổi ngày đi, muốn khung giờ muộn hơn..."
                maxLength={maxRescheduleReasonLength}
                rows={4}
                aria-invalid={Boolean(rescheduleError)}
                autoComplete="off"
                className={styles.dialogTextArea}
              />
            </label>
            {rescheduleError ? (
              <div className={`${styles.errorMessage} ${styles.dialogError}`}>
                {rescheduleError}
              </div>
            ) : null}
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
                disabled={Boolean(reschedulingId) || isRescheduleHoursLoading || !rescheduleTime}
              >
                {reschedulingId ? "Đang cập nhật" : "Cập nhật lịch"}
              </button>
            </div>
            </div>
          </div>,
          dialogPortalTarget,
        )
        : null}
    </main>
  );
}

function BookingCard({
  booking,
  isMember,
  memberUserId,
  cancelingId,
  activeLanguage,
  onCancel,
  onReschedule,
  onChat,
}: {
  booking: BookingRecord;
  isMember: boolean;
  memberUserId: string;
  cancelingId: string | null;
  activeLanguage: LanguageCode;
  onCancel: (booking: BookingRecord) => void;
  onReschedule: (booking: BookingRecord) => void;
  onChat: (booking: BookingRecord) => void;
}) {
  const group = bookingRecordStatusGroup(booking);
  const isOpenBooking = group === "Mới";
  const tourBooking = isTourBooking(booking);
  const hasQr = isConfirmedStatus(booking.status);
  const isMemberActionBooking =
    isMember && Boolean(booking.user?.id) && (!memberUserId || booking.user?.id === memberUserId);
  const hasCancelIdentity = isMemberActionBooking || Boolean(booking.guest?.phone?.trim());
  const cancelAllowed = isOpenBooking && canCancelBooking(booking) && hasCancelIdentity;
  const cancelDisabled = cancelingId === booking.id || !cancelAllowed;
  const canSubmitBill =
    isMemberActionBooking &&
    group === "Hoàn tất" &&
    !["CANCELLED", "NO_SHOW"].includes(booking.status.trim().toUpperCase());
  const canReschedule = !tourBooking && cancelAllowed;
  const itemClass =
    group === "Mới"
      ? `${styles.historyItem} ${styles.historyItemOpen} ${tourBooking ? styles.historyItemTour : ""}`
      : group === "Đã hủy"
        ? `${styles.historyItem} ${styles.historyItemMuted} ${tourBooking ? styles.historyItemTour : ""}`
        : `${styles.historyItem} ${tourBooking ? styles.historyItemTour : ""}`;
  const mainClass = tourBooking ? `${styles.historyMain} ${styles.historyMainTour}` : styles.historyMain;
  const actionsClass = tourBooking
    ? `${styles.historyActions} ${styles.historyActionsTour}`
    : styles.historyActions;
  const thumbnailStyle = {
    backgroundImage: bookingThumbnail(booking, group),
    filter: group === "Đã hủy" ? "grayscale(.4)" : undefined,
  };
  const subMetaClass = `${styles.historySubMeta} ${
    group === "Hoàn tất" ? styles.historySubMetaGold : ""
  }`;

  return (
    <article className={itemClass}>
      <Link
        href={bookingConfirmHref(booking)}
        onClick={() => rememberLastBooking(booking)}
        className={mainClass}
        aria-label={`${translateText("Chi tiết", activeLanguage)} ${bookingTitle(booking)}`}
      >
        {tourBooking ? (
          <>
            <div className={styles.historyTourHeader}>
              <span className={styles.historyThumb} style={thumbnailStyle} />
              <div className={styles.historyCopy}>
                <div className={styles.historyHead}>
                  <h2 className={styles.historyTitle}>{bookingTitle(booking)}</h2>
                  {group !== "Đã hủy" ? (
                    <StatusBadge booking={booking} activeLanguage={activeLanguage} />
                  ) : null}
                </div>
                <div className={styles.historyMeta}>
                  <span className={styles.historyTypePill}>Tour</span>
                  {formatDateTime(booking.scheduledAt, activeLanguage)} ·{" "}
                  {formatGuestCount(booking.partySize, activeLanguage)}
                </div>
                <div className={styles.historyTourMeta}>
                  {tourStopsPreview(booking, activeLanguage)}
                </div>
              </div>
            </div>
            <TourStopsPreview booking={booking} activeLanguage={activeLanguage} />
            <div className={subMetaClass}>{statusMeta(booking, group, activeLanguage)}</div>
          </>
        ) : (
          <>
            <span className={styles.historyThumb} style={thumbnailStyle} />
            <div className={styles.historyCopy}>
              <div className={styles.historyHead}>
                <h2 className={styles.historyTitle}>{bookingTitle(booking)}</h2>
                {group !== "Đã hủy" ? (
                  <StatusBadge booking={booking} activeLanguage={activeLanguage} />
                ) : null}
              </div>
              <div className={styles.historyMeta}>
                {formatDateTime(booking.scheduledAt, activeLanguage)} ·{" "}
                {formatGuestCount(booking.partySize, activeLanguage)}
              </div>
              <div className={subMetaClass}>{statusMeta(booking, group, activeLanguage)}</div>
            </div>
          </>
        )}
      </Link>

      <div className={actionsClass}>
        {isOpenBooking ? (
          <>
            <button type="button" onClick={() => onChat(booking)} className={styles.secondaryCta}>
              <MessageCircle size={14} />
              Chat Admin
            </button>
            {canReschedule ? (
              <button
                type="button"
                onClick={() => onReschedule(booking)}
                className={styles.ghostCta}
              >
                <Clock size={14} />
                Đổi lịch
              </button>
            ) : null}
            {!tourBooking && hasQr ? (
              <Link
                href={bookingConfirmHref(booking)}
                onClick={() => rememberLastBooking(booking)}
                className={styles.secondaryCta}
              >
                <QrCode size={14} />
                Xem QR
              </Link>
            ) : !tourBooking && !cancelAllowed ? (
              <Link
                href={bookingConfirmHref(booking)}
                onClick={() => rememberLastBooking(booking)}
                className={styles.ghostCta}
              >
                <MessageCircle size={14} />
                Chi tiết
              </Link>
            ) : null}
            {tourBooking ? (
              <Link
                href={bookingConfirmHref(booking)}
                onClick={() => rememberLastBooking(booking)}
                className={styles.ghostCta}
              >
                <ReceiptText size={14} />
                Chi tiết tour
              </Link>
            ) : null}
            {cancelAllowed ? (
              <button
                type="button"
                onClick={() => onCancel(booking)}
                disabled={cancelDisabled}
                title={
                  cancelAllowed
                    ? tourBooking
                      ? "Hủy tour"
                      : "Hủy đặt chỗ"
                    : "Chỉ hủy được trước giờ hẹn ít nhất 1 giờ"
                }
                className={`${styles.dangerCta} ${cancelDisabled ? styles.disabledCta : ""}`}
              >
                <XCircle size={14} />
                {cancelingId === booking.id
                  ? "Đang hủy"
                  : cancelAllowed
                    ? tourBooking
                      ? "Hủy tour"
                      : "Hủy đặt chỗ"
                    : "Quá giờ"}
              </button>
            ) : null}
          </>
        ) : group === "Hoàn tất" ? (
          <>
            {canSubmitBill ? (
              <Link
                href={billSubmitHref(booking)}
                onClick={() => rememberLastBooking(booking)}
                className={styles.primaryCta}
              >
                <ReceiptText size={14} />
                <strong>{translateText("Gửi hóa đơn", activeLanguage)}</strong>
              </Link>
            ) : null}
            <Link
              href={rebookHref(booking)}
              className={canSubmitBill ? styles.secondaryCta : styles.primaryCta}
            >
              <strong>
                {translateText(tourBooking ? "Đặt lại tour" : "Đặt lại", activeLanguage)}
              </strong>
            </Link>
          </>
        ) : (
          <>
            <StatusBadge booking={booking} activeLanguage={activeLanguage} />
            <Link href={rebookHref(booking)} className={styles.secondaryCta}>
              <RotateCcw size={14} />
              {translateText(tourBooking ? "Đặt lại tour" : "Đặt lại", activeLanguage)}
            </Link>
          </>
        )}
      </div>
    </article>
  );
}

function TourStopsPreview({
  booking,
  activeLanguage,
}: {
  booking: BookingRecord;
  activeLanguage: LanguageCode;
}) {
  const stops = booking.tour?.stops ?? [];
  if (!stops.length) return null;

  return (
    <div
      className={styles.historyTourStops}
      aria-label={translateText("Lịch trình tour", activeLanguage)}
    >
      {stops.slice(0, 4).map((stop, index) => (
        <div key={`${stop.storeId}-${stop.order}-${index}`} className={styles.historyTourStop}>
          <span className={styles.historyTourStopIndex}>{stop.order || index + 1}</span>
          <span className={styles.historyTourStopCopy}>
            <strong>{stop.storeName}</strong>
            <small>
              {stop.casts.length
                ? stop.casts.map((cast) => cast.name).join(" · ")
                : translateText("Admin chọn cast theo từng điểm", activeLanguage)}
            </small>
          </span>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({
  booking,
  activeLanguage,
}: {
  booking: BookingRecord;
  activeLanguage: LanguageCode;
}) {
  const group = bookingRecordStatusGroup(booking);
  const isPastDue = isBookingPastDue(booking);
  const className = isPastDue
    ? `${styles.historyBadge} ${styles.historyBadgeOverdue}`
    : group === "Hoàn tất"
      ? `${styles.historyBadge} ${styles.historyBadgeDone}`
      : group === "Đã hủy"
        ? `${styles.historyBadge} ${styles.historyBadgeMuted}`
        : styles.historyBadge;

  return (
    <span className={className}>
      {isPastDue ? (
        <Clock size={9} />
      ) : group === "Hoàn tất" ? (
        <Check size={9} />
      ) : group === "Mới" ? (
        <span className={styles.statusDot} />
      ) : null}
      {translateText(bookingRecordStatusLabel(booking), activeLanguage)}
    </span>
  );
}
