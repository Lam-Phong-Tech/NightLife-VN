"use client";

import { AlertCircle, Check, Clock3, Download, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSystemFeedback } from "@/components/ui/SystemFeedback";
import { bookingApi, getLastBooking, rememberLastBooking, type BookingRecord } from "@/lib/api/bookings";
import {
  buildBookingConfirmationPageFeedback,
  writeBookingConfirmationFlashToast,
  type BookingConfirmationFlashKind,
  type BookingConfirmationPageFeedback,
} from "@/lib/booking-confirmation-flash";
import { translateText } from "@/lib/i18n/client-translations";
import { intlLocaleByLanguage, useActiveLanguage, type LanguageCode } from "@/lib/i18n/use-active-language";
import styles from "../booking-flow.module.css";

const confirmedStatuses = new Set(["CONFIRMED", "CHECKED_IN", "COMPLETED"]);
const cancelledStatuses = new Set(["CANCELLED", "NO_SHOW"]);
const bookingRefreshMs = 3500;
const bookingRedirectDelayMs = 1500;

type BookingLookup = {
  bookingId: string;
  email: string;
  phone: string;
};

type BookingResolutionKind = BookingConfirmationFlashKind;
type BookingResolutionFeedback = BookingConfirmationPageFeedback;

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
  (booking.tour ? booking.qr?.payload?.trim() : "") ||
  couponIssueQrPayload(booking) ||
  ["NLBOOKING", booking.id, booking.bookingCode, booking.store?.slug ?? "nightlife", booking.scheduledAt].join("|");

const bookingQrImageUrl = (booking: BookingRecord) => {
  const issueQrImage = booking.couponIssue?.qrImageDataUrl || booking.couponIssue?.qrImageUrl;
  if (!booking.tour && issueQrImage) return issueQrImage;

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

const normalizeBookingLookupToken = (value?: string | null) =>
  (value ?? "").trim().replace(/^#?BK[-_]?/i, "").replace(/-/g, "").toLowerCase();

const bookingMatchesLookup = (booking: BookingRecord, lookup?: string | null) => {
  const token = normalizeBookingLookupToken(lookup);
  if (!token) return false;

  return [booking.id, booking.tourBookingId, booking.bookingCode].some((value) =>
    normalizeBookingLookupToken(value).startsWith(token),
  );
};

const resolveBookingByLookup = async ({ bookingId, email, phone }: BookingLookup) => {
  let resolvedBooking: BookingRecord | null = null;

  try {
    const memberBookings = await bookingApi.listMemberBookings();
    const memberBooking = memberBookings.find((item) => bookingMatchesLookup(item, bookingId));
    if (memberBooking) {
      resolvedBooking = memberBooking;
    }
  } catch {
    // Guests and signed-out users continue to code/email lookup below.
  }

  if (!resolvedBooking && (email || phone)) {
    try {
      resolvedBooking = await bookingApi.getGuestBookingByCode(bookingId, { email, phone });
    } catch {
      // The caller keeps the current booking snapshot when lookup is unavailable.
    }
  }

  return resolvedBooking;
};

const hasPartnerApprovalEvidence = (booking: BookingRecord | null) => {
  if (!booking) return false;

  const qrStatus = booking.qr?.status?.toUpperCase();
  const issueStatus = booking.couponIssue?.status?.toUpperCase();
  const hasTourStopCheckIn = booking.tour?.stops.some((stop) => {
    const stopStatus = stop.status?.toUpperCase();
    const stopIssueStatus = stop.couponIssue?.status?.toUpperCase();
    return (
      stopStatus === "CHECKED_IN" ||
      Boolean(stop.checkedInAt) ||
      stopIssueStatus === "USED" ||
      Boolean(stop.couponIssue?.usedAt)
    );
  });

  return (
    booking.status === "CHECKED_IN" ||
    qrStatus === "USED" ||
    Boolean(booking.qr?.usedAt) ||
    issueStatus === "USED" ||
    Boolean(booking.couponIssue?.usedAt) ||
    Boolean(hasTourStopCheckIn)
  );
};

const bookingResolutionFingerprint = (kind: BookingResolutionKind, booking: BookingRecord) =>
  [
    kind,
    booking.id,
    booking.status,
    booking.confirmedAt ?? "",
    booking.qr?.usedAt ?? "",
    booking.couponIssue?.usedAt ?? "",
    ...(booking.tour?.stops.map((stop) =>
      [stop.bookingId ?? stop.storeId, stop.status ?? "", stop.checkedInAt ?? "", stop.couponIssue?.usedAt ?? ""].join(":"),
    ) ?? []),
  ].join("|");

const bookingResolutionKind = (
  previousBooking: BookingRecord | null,
  nextBooking: BookingRecord,
): BookingResolutionKind | null => {
  const previousStatus = previousBooking?.status;

  if (!cancelledStatuses.has(previousStatus ?? "") && cancelledStatuses.has(nextBooking.status)) {
    return "cancelled";
  }

  if (!hasPartnerApprovalEvidence(previousBooking) && hasPartnerApprovalEvidence(nextBooking)) {
    return "partner";
  }

  if (!confirmedStatuses.has(previousStatus ?? "") && confirmedStatuses.has(nextBooking.status)) {
    return "admin";
  }

  return null;
};

const bookingResolutionFeedback = (
  kind: BookingResolutionKind,
  booking: BookingRecord,
  language: LanguageCode,
): BookingResolutionFeedback => {
  return buildBookingConfirmationPageFeedback(
    {
      kind,
      bookingTitle: bookingTitle(booking),
      isTourBooking: Boolean(booking.tour),
    },
    language,
  );
};

const guestLabel = (booking: BookingRecord, language: LanguageCode) =>
  `${booking.guest?.displayName ?? booking.user?.displayName ?? translateText("Khách", language)} · ${
    booking.guest?.email ?? booking.guest?.phone ?? translateText("Email đã lưu", language)
  }`;

type BookingDiscountInfo = {
  type: string;
  value: number;
};

const bookingDiscountText = (booking: BookingRecord): BookingDiscountInfo | null => {
  const issue = booking.couponIssue;
  const issueMetadata = issue?.metadata;

  const toNumber = (value: unknown) => {
    const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
    return Number.isFinite(parsed) ? parsed : null;
  };

  const percentValue = (value: unknown) => {
    const parsed = toNumber(value);
    if (parsed === null || parsed <= 0) return null;
    return parsed > 0 && parsed <= 1 ? parsed * 100 : parsed;
  };

  const recordValue = (value: unknown) =>
    value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;

  const discountFromSnapshot = (snapshot: unknown): BookingDiscountInfo | null => {
    const record = recordValue(snapshot);
    if (!record) return null;

    const rawType = record.discountType ?? record.type ?? "PERCENT";
    const type = typeof rawType === "string" ? rawType : "PERCENT";
    const value = record.discountPercent ?? record.value ?? record.discountValue;

    if (type === "PERCENT") {
      const p = percentValue(value);
      return p !== null ? { type, value: p } : null;
    }
    const val = toNumber(value);
    return val !== null && val > 0 ? { type, value: val } : null;
  };

  if (issue) {
    const issueRecord = recordValue(issue);
    const p = percentValue(issueRecord?.discountPercent);
    if (p !== null) return { type: "PERCENT", value: p };

    const snap = discountFromSnapshot(issueRecord?.discountRuleSnapshot);
    if (snap) return snap;
  }

  if (issueMetadata) {
    const issueMetadataRecord = recordValue(issueMetadata);
    const p = percentValue(issueMetadataRecord?.discountPercent);
    if (p !== null) return { type: "PERCENT", value: p };

    const snap = discountFromSnapshot(issueMetadataRecord?.discountRuleSnapshot);
    if (snap) return snap;
  }

  if (booking.discountSnapshot) {
    const snap = discountFromSnapshot(booking.discountSnapshot);
    if (snap) return snap;
  }

  if (booking.coupon) {
    const type = booking.coupon.discountType ?? "PERCENT";
    const value = booking.coupon.discountValue;
    if (type === "PERCENT") {
      const p = percentValue(value);
      if (p !== null) return { type, value: p };
    } else {
      const val = toNumber(value);
      if (val !== null && val > 0) return { type, value: val };
    }
  }

  return null;
};

const formatDiscountText = (discount: BookingDiscountInfo | null, language: LanguageCode) => {
  if (!discount) return null;

  if (discount.type === "PERCENT") {
    const rounded = Math.round(discount.value * 100) / 100;
    const formatted = new Intl.NumberFormat(intlLocaleByLanguage[language], {
      maximumFractionDigits: Number.isInteger(rounded) ? 0 : 2,
    }).format(rounded);
    return `-${formatted}%`;
  }

  if (discount.type === "FIXED_AMOUNT") {
    return `-${discount.value.toLocaleString(language === "vi" ? "vi-VN" : "en-US")} VND`;
  }

  return null;
};

type TourConfirmCopy = {
  adminWillContact: string;
  cancelledTitle: string;
  confirmedText: string;
  confirmedTitle: string;
  emailSentPrefix: string;
  guestEmailFallback: string;
  itineraryLabel: string;
  noCast: string;
  pendingText: string;
  pendingTitle: string;
  qrDescription: string;
  qrNote: string;
  qrTitle: string;
  reservationCode: string;
  statusCancelled: string;
  statusConfirmed: string;
  statusLabel: string;
  statusPending: string;
  summaryAria: string;
  timeLabel: string;
  tourLabel: string;
  viewMyTour: string;
  bookerLabel: string;
  partySizeLabel: string;
};

const tourConfirmCopy: Record<LanguageCode, TourConfirmCopy> = {
  vi: {
    adminWillContact: "Admin sẽ liên hệ lại để chốt lịch trình và từng điểm dừng.",
    cancelledTitle: "Đặt tour đã hủy",
    confirmedText: "Admin đã xác nhận yêu cầu tour. Lịch trình sẽ được điều phối theo từng điểm dừng.",
    confirmedTitle: "Đặt tour đã xác nhận",
    emailSentPrefix: "Thông tin đặt tour và mã QR đã được gửi về",
    guestEmailFallback: "email của bạn",
    itineraryLabel: "Lịch trình tour",
    noCast: "Không chọn cast",
    pendingText: "Yêu cầu đặt tour đã gửi thành công. Admin sẽ kiểm tra quán và cast theo từng điểm trong hành trình.",
    pendingTitle: "Đã gửi yêu cầu đặt tour",
    qrDescription: "Dùng cùng mã QR này tại từng điểm dừng trong tour. Mỗi quán chỉ có thể xác nhận điểm dừng của chính mình một lần.",
    qrNote: "Mã QR tour được dùng xuyên suốt hành trình; mỗi quán chỉ check-in được điểm dừng được gán cho quán đó. Mã hết hiệu lực khi tất cả điểm dừng hoàn tất.",
    qrTitle: "QR tour của bạn",
    reservationCode: "Mã đặt tour",
    statusCancelled: "Đã hủy",
    statusConfirmed: "Đã xác nhận tour · QR đã cấp",
    statusLabel: "Trạng thái",
    statusPending: "Mới · chờ điều phối tour · QR đã cấp",
    summaryAria: "Tóm tắt đặt tour",
    timeLabel: "Thời gian",
    tourLabel: "Tour",
    viewMyTour: "Xem đơn tour của tôi",
    bookerLabel: "Người đặt",
    partySizeLabel: "Số người",
  },
  en: {
    adminWillContact: "Admin will contact you to confirm the itinerary and each stop.",
    cancelledTitle: "Tour request cancelled",
    confirmedText: "Admin has confirmed your tour request. The itinerary will be coordinated stop by stop.",
    confirmedTitle: "Tour request confirmed",
    emailSentPrefix: "Tour details and QR code have been sent to",
    guestEmailFallback: "your email",
    itineraryLabel: "Tour itinerary",
    noCast: "No cast selected",
    pendingText: "Your tour request was sent successfully. Admin will check the venues and cast for each stop.",
    pendingTitle: "Tour request sent",
    qrDescription: "Use this same QR at every stop in the tour. Each venue can confirm only its assigned stop once.",
    qrNote: "The tour QR is used throughout the itinerary. Each venue can check in only its assigned stop, and the QR expires after every stop is completed.",
    qrTitle: "Your tour QR",
    reservationCode: "Tour code",
    statusCancelled: "Cancelled",
    statusConfirmed: "Tour confirmed · QR issued",
    statusLabel: "Status",
    statusPending: "New · tour coordination pending · QR issued",
    summaryAria: "Tour booking summary",
    timeLabel: "Time",
    tourLabel: "Tour",
    viewMyTour: "View my tour request",
    bookerLabel: "Guest",
    partySizeLabel: "Guests",
  },
  ja: {
    adminWillContact: "管理者が行程と各立ち寄り先を確認するために連絡します。",
    cancelledTitle: "ツアー予約はキャンセルされました",
    confirmedText: "ツアー予約は確認済みです。行程は各立ち寄り先ごとに調整されます。",
    confirmedTitle: "ツアー予約が確認されました",
    emailSentPrefix: "ツアー情報とQRコードを送信しました:",
    guestEmailFallback: "登録メール",
    itineraryLabel: "ツアー行程",
    noCast: "キャスト未選択",
    pendingText: "ツアー予約リクエストを送信しました。管理者が各立ち寄り先の店舗とキャストを確認します。",
    pendingTitle: "ツアー予約リクエストを送信しました",
    qrDescription: "このQRをツアーの各立ち寄り先で使用します。各店舗は割り当てられた立ち寄り先を1回だけ確認できます。",
    qrNote: "ツアーQRは行程全体で使用します。各店舗は割り当てられた立ち寄り先のみチェックインでき、全て完了すると無効になります。",
    qrTitle: "ツアーQR",
    reservationCode: "ツアー予約コード",
    statusCancelled: "キャンセル済み",
    statusConfirmed: "ツアー確認済み · QR発行済み",
    statusLabel: "ステータス",
    statusPending: "新規 · ツアー調整待ち · QR発行済み",
    summaryAria: "ツアー予約概要",
    timeLabel: "時間",
    tourLabel: "ツアー",
    viewMyTour: "ツアー予約を確認",
    bookerLabel: "予約者",
    partySizeLabel: "人数",
  },
  ko: {
    adminWillContact: "관리자가 일정과 각 방문 지점을 확정하기 위해 연락드립니다.",
    cancelledTitle: "투어 예약이 취소되었습니다",
    confirmedText: "투어 요청이 확인되었습니다. 일정은 각 방문 지점별로 조율됩니다.",
    confirmedTitle: "투어 예약이 확인되었습니다",
    emailSentPrefix: "투어 정보와 QR 코드가 다음 이메일로 전송되었습니다:",
    guestEmailFallback: "등록 이메일",
    itineraryLabel: "투어 일정",
    noCast: "캐스트 미선택",
    pendingText: "투어 예약 요청이 전송되었습니다. 관리자가 각 지점의 매장과 캐스트를 확인합니다.",
    pendingTitle: "투어 예약 요청 전송 완료",
    qrDescription: "이 QR을 투어의 각 방문 지점에서 사용합니다. 각 매장은 배정된 지점만 한 번 확인할 수 있습니다.",
    qrNote: "투어 QR은 전체 일정에서 사용됩니다. 각 매장은 배정된 지점만 체크인할 수 있으며 모든 지점 완료 후 만료됩니다.",
    qrTitle: "내 투어 QR",
    reservationCode: "투어 예약 코드",
    statusCancelled: "취소됨",
    statusConfirmed: "투어 확인됨 · QR 발급됨",
    statusLabel: "상태",
    statusPending: "신규 · 투어 조율 대기 · QR 발급됨",
    summaryAria: "투어 예약 요약",
    timeLabel: "시간",
    tourLabel: "투어",
    viewMyTour: "내 투어 예약 보기",
    bookerLabel: "예약자",
    partySizeLabel: "인원",
  },
  zh: {
    adminWillContact: "管理员会联系你确认行程和每个停靠点。",
    cancelledTitle: "行程预约已取消",
    confirmedText: "行程预约已确认。行程会按每个停靠点进行协调。",
    confirmedTitle: "行程预约已确认",
    emailSentPrefix: "行程信息和 QR 码已发送至",
    guestEmailFallback: "你的邮箱",
    itineraryLabel: "行程路线",
    noCast: "未选择 Cast",
    pendingText: "行程预约请求已成功发送。管理员会检查每个停靠点的店铺和 Cast。",
    pendingTitle: "行程预约请求已发送",
    qrDescription: "此 QR 码可在行程的每个停靠点使用。每家店只能确认一次分配给自己的停靠点。",
    qrNote: "行程 QR 将贯穿整个路线使用。每家店只能为分配给自己的停靠点签到，所有停靠点完成后失效。",
    qrTitle: "你的行程 QR",
    reservationCode: "行程预约码",
    statusCancelled: "已取消",
    statusConfirmed: "行程已确认 · QR 已发放",
    statusLabel: "状态",
    statusPending: "新建 · 行程协调中 · QR 已发放",
    summaryAria: "行程预约摘要",
    timeLabel: "时间",
    tourLabel: "行程",
    viewMyTour: "查看我的行程预约",
    bookerLabel: "预约人",
    partySizeLabel: "人数",
  },
};

const getTourConfirmCopy = (language: LanguageCode) =>
  tourConfirmCopy[language] ?? tourConfirmCopy.vi;

const formatPartySize = (count: number, language: LanguageCode) => {
  if (language === "ja" || language === "zh") return `${count}名`;
  if (language === "ko") return `${count}명`;
  if (language === "en") return `${count} ${count === 1 ? "guest" : "guests"}`;
  return `${count} người`;
};

const formatTourStopCount = (count: number, language: LanguageCode) => {
  if (language === "ja") return `${count}件`;
  if (language === "ko") return `${count}개 지점`;
  if (language === "zh") return `${count}个停靠点`;
  if (language === "en") return `${count} ${count === 1 ? "stop" : "stops"}`;
  return `${count} điểm dừng`;
};

export default function Page() {
  const activeLanguage = useActiveLanguage();
  const feedback = useSystemFeedback();
  const tourCopy = getTourConfirmCopy(activeLanguage);
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [bookingLookup, setBookingLookup] = useState<BookingLookup | null>(null);
  const [isBookingLoading, setIsBookingLoading] = useState(true);
  const [redirectFeedback, setRedirectFeedback] = useState<BookingResolutionFeedback | null>(null);
  const latestBookingRef = useRef<BookingRecord | null>(null);
  const handledResolutionRef = useRef<string | null>(null);
  const redirectTimerRef = useRef<number | null>(null);

  useEffect(() => {
    latestBookingRef.current = booking;
  }, [booking]);

  useEffect(
    () => () => {
      if (redirectTimerRef.current) {
        window.clearTimeout(redirectTimerRef.current);
      }
    },
    [],
  );

  const handleBookingResolution = useCallback(
    (previousBooking: BookingRecord | null, nextBooking: BookingRecord) => {
      const kind = bookingResolutionKind(previousBooking, nextBooking);
      if (!kind) return;

      const fingerprint = bookingResolutionFingerprint(kind, nextBooking);
      if (handledResolutionRef.current === fingerprint) return;
      handledResolutionRef.current = fingerprint;

      const nextFeedback = bookingResolutionFeedback(kind, nextBooking, activeLanguage);
      setRedirectFeedback(nextFeedback);
      writeBookingConfirmationFlashToast({
        kind,
        bookingTitle: bookingTitle(nextBooking),
        isTourBooking: Boolean(nextBooking.tour),
        durationMs: 5200,
      });
      feedback.showToast({
        tone: nextFeedback.tone,
        title: nextFeedback.toastTitle,
        description: nextFeedback.toastDescription,
        durationMs: 4200,
      });

      if (redirectTimerRef.current) {
        window.clearTimeout(redirectTimerRef.current);
      }
      redirectTimerRef.current = window.setTimeout(() => {
        window.location.assign("/");
      }, bookingRedirectDelayMs);
    },
    [activeLanguage, feedback],
  );

  useEffect(() => {
    let alive = true;

    const resolveBooking = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const bookingId = searchParams.get("bookingId")?.trim() ?? "";
      const email = searchParams.get("email")?.trim() ?? "";
      const phone = searchParams.get("phone")?.trim() ?? "";
      const lookup = bookingId ? { bookingId, email, phone } : null;
      const rememberedBooking = getLastBooking(bookingId);

      if (alive) {
        setBookingLookup(lookup);
      }

      if (rememberedBooking) {
        if (alive) {
          setBooking(rememberedBooking);
          setIsBookingLoading(false);
        }
      }

      if (lookup) {
        const resolvedBooking = await resolveBookingByLookup(lookup);

        if (resolvedBooking) {
          rememberLastBooking(resolvedBooking, { history: true });
          if (alive) {
            setBooking(resolvedBooking);
            setIsBookingLoading(false);
            handleBookingResolution(rememberedBooking, resolvedBooking);
          }
          return;
        }
      }

      if (alive) {
        if (!rememberedBooking) {
          setBooking(null);
        }
        setIsBookingLoading(false);
      }
    };

    queueMicrotask(() => {
      void resolveBooking();
    });

    return () => {
      alive = false;
    };
  }, [handleBookingResolution]);

  const isPartnerApproved = hasPartnerApprovalEvidence(booking);

  useEffect(() => {
    if (!bookingLookup || !booking || redirectFeedback || cancelledStatuses.has(booking.status) || isPartnerApproved) {
      return;
    }

    let alive = true;

    const refreshBooking = async () => {
      const nextBooking = await resolveBookingByLookup(bookingLookup);
      if (!alive || !nextBooking) return;

      const previousBooking = latestBookingRef.current;
      rememberLastBooking(nextBooking, { history: true });
      setBooking(nextBooking);
      handleBookingResolution(previousBooking, nextBooking);
    };

    const firstRefresh = window.setTimeout(() => {
      void refreshBooking();
    }, 1200);
    const refreshTimer = window.setInterval(() => {
      void refreshBooking();
    }, bookingRefreshMs);

    return () => {
      alive = false;
      window.clearTimeout(firstRefresh);
      window.clearInterval(refreshTimer);
    };
  }, [booking?.id, booking?.status, bookingLookup, handleBookingResolution, isPartnerApproved, redirectFeedback]);

  const isConfirmed = booking ? confirmedStatuses.has(booking.status) || isPartnerApproved : false;
  const isCancelled = booking ? cancelledStatuses.has(booking.status) : false;
  const title = bookingTitle(booking);
  const isTourBooking = Boolean(booking?.tour);
  const canShowQr = booking ? !isCancelled : false;
  const qrImageUrl = booking && canShowQr ? bookingQrImageUrl(booking) : "";
  const isGuestBooking = Boolean(booking && !booking.user?.id);
  const discountInfo = booking ? bookingDiscountText(booking) : null;
  const discountLabelText = formatDiscountText(discountInfo, activeLanguage);
  const guestEmailLabel = booking?.guest?.email ?? (isTourBooking ? tourCopy.guestEmailFallback : translateText("email của bạn", activeLanguage));
  const guestConfirmationMessage = isTourBooking
    ? `${tourCopy.emailSentPrefix} ${guestEmailLabel}. ${tourCopy.adminWillContact}`
    : `${translateText(
        "Thông tin đặt chỗ và mã QR đã được gửi về",
        activeLanguage,
      )} ${guestEmailLabel}. ${translateText("Vui lòng kiểm tra email trước khi tới quán.", activeLanguage)}`;
  const heroTitle = isTourBooking
    ? isCancelled
      ? tourCopy.cancelledTitle
      : isConfirmed
        ? tourCopy.confirmedTitle
        : tourCopy.pendingTitle
    : translateText(
        !booking
          ? "Chưa tìm thấy booking"
          : isCancelled
            ? "Đặt chỗ đã hủy"
            : isConfirmed
              ? "Đặt chỗ đã xác nhận"
              : "Đã gửi yêu cầu đặt bàn",
        activeLanguage,
      );
  const heroText = isTourBooking
    ? isCancelled
      ? translateText("Booking này đã hủy. NightLife không thu cọc, nên bạn có thể đặt lại khi cần đổi lịch.", activeLanguage)
      : isConfirmed
        ? tourCopy.confirmedText
        : tourCopy.pendingText
    : translateText(
        !booking
          ? "Booking vừa tạo không còn trong phiên này. Bạn có thể quay lại lịch sử hoặc đặt lại yêu cầu mới."
          : isCancelled
            ? "Booking này đã hủy. NightLife không thu cọc, nên bạn có thể đặt lại khi cần đổi lịch."
            : isConfirmed
              ? "Admin đã xác nhận với quán. Mã QR giảm giá đã sẵn sàng để dùng khi tới nơi."
              : "Yêu cầu đã gửi thành công. Mã QR giảm giá đã sẵn sàng, bạn có thể lưu lại để đưa nhân viên quán quét khi tới nơi.",
        activeLanguage,
      );
  const statusText = isTourBooking
    ? isCancelled
      ? tourCopy.statusCancelled
      : isPartnerApproved
        ? translateText("Đã check-in điểm dừng · QR đã dùng", activeLanguage)
        : isConfirmed
        ? tourCopy.statusConfirmed
        : tourCopy.statusPending
    : translateText(
        !booking
          ? "Không có dữ liệu"
          : isCancelled
            ? "Đã hủy"
            : isPartnerApproved
              ? "Đã xác nhận tại quán · QR đã dùng"
              : isConfirmed
              ? "Đã xác nhận · QR đã cấp"
              : "Mới · QR đã cấp",
        activeLanguage,
      );
  const displayedHeroTitle = isBookingLoading
    ? translateText("Đang tải booking", activeLanguage)
    : heroTitle;
  const displayedHeroText = isBookingLoading
    ? translateText("Đang kiểm tra dữ liệu booking vừa tạo.", activeLanguage)
    : heroText;
  const displayedStatusText = isBookingLoading ? translateText("Đang tải", activeLanguage) : statusText;
  const emptyBookingMessage = isBookingLoading
    ? translateText("Đang kiểm tra dữ liệu booking vừa tạo.", activeLanguage)
    : translateText("Chưa tìm thấy booking vừa tạo trong phiên này.", activeLanguage);

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
    <main className={`${styles.bookingPage} ${styles.confirmPage}`}>
      {redirectFeedback ? (
        <div className={styles.confirmRedirectOverlay} role="status" aria-live="assertive">
          <div className={styles.confirmRedirectCard}>
            <span className={styles.confirmRedirectIcon}>
              <Loader2 size={30} />
            </span>
            <strong>{redirectFeedback.redirectTitle}</strong>
            <p>{redirectFeedback.redirectDescription}</p>
          </div>
        </div>
      ) : null}
      <section className={`${styles.bookingViewport} ${styles.confirmViewport}`}>
        <div className={`${styles.bookingFrame} ${styles.confirmFrame}`}>
          <div className={styles.confirmHero}>
            <span className={styles.heroMark}>
              {isBookingLoading ? (
                <Clock3 size={34} />
              ) : isCancelled || !booking ? (
                <AlertCircle size={34} />
              ) : (
                <Check size={34} />
              )}
            </span>
            <h1 className={styles.confirmTitle}>{displayedHeroTitle}</h1>
            <p className={styles.confirmText}>{displayedHeroText}</p>
            <span className={styles.statusBadge}>
              <span className={styles.statusDot} />
              {isTourBooking ? tourCopy.statusLabel : translateText("Trạng thái", activeLanguage)}: {displayedStatusText}
            </span>
          </div>

          {booking ? (
            <section
              className={styles.summaryCard}
              aria-label={isTourBooking ? tourCopy.summaryAria : translateText("Tóm tắt đặt chỗ", activeLanguage)}
            >
              <SummaryRow
                label={isTourBooking ? tourCopy.reservationCode : translateText("Mã đặt chỗ", activeLanguage)}
                value={<span className={styles.bookingCode}>{booking.bookingCode}</span>}
              />
              {booking.tour ? (
                <>
                  <SummaryRow label={tourCopy.tourLabel} value={title} />
                  <TourVenueSummary booking={booking} language={activeLanguage} />
                </>
              ) : (
                <SummaryRow label={translateText("Quán", activeLanguage)} value={title} />
              )}
              <SummaryRow
                label={isTourBooking ? tourCopy.timeLabel : translateText("Thời gian", activeLanguage)}
                value={formatDateTime(booking.scheduledAt, activeLanguage)}
              />
              <SummaryRow
                label={isTourBooking ? tourCopy.partySizeLabel : translateText("Số người", activeLanguage)}
                value={isTourBooking ? formatPartySize(booking.partySize, activeLanguage) : translateText(`${booking.partySize} người`, activeLanguage)}
              />
              <SummaryRow
                label={isTourBooking ? tourCopy.bookerLabel : translateText("Người đặt", activeLanguage)}
                value={guestLabel(booking, activeLanguage)}
              />
              {booking.couponIssue ? (
                <>
                  <SummaryRow
                    label={translateText("Mã ưu đãi", activeLanguage)}
                    value={<span className={styles.bookingCode}>{booking.couponIssue.code}</span>}
                  />
                  {discountLabelText !== null ? (
                    <SummaryRow
                      label={translateText("Mức giảm", activeLanguage)}
                      value={<span className={styles.discountValue}>{discountLabelText}</span>}
                    />
                  ) : null}
                </>
              ) : null}
            </section>
          ) : (
            <div className={styles.emptyCard}>
              {emptyBookingMessage}
            </div>
          )}

          {booking && canShowQr ? (
            <section className={styles.qrPanel} aria-label={isTourBooking ? tourCopy.qrTitle : translateText("Mã QR đặt chỗ", activeLanguage)}>
              <div className={styles.qrBox}>
                <Image
                  src={qrImageUrl}
                  alt={`${isTourBooking ? tourCopy.qrTitle : translateText("Mã QR đặt chỗ", activeLanguage)} ${booking.bookingCode}`}
                  width={156}
                  height={156}
                  unoptimized
                />
              </div>
              <div className={styles.qrCopy}>
                <strong>{isTourBooking ? tourCopy.qrTitle : translateText("QR giảm giá của bạn", activeLanguage)}</strong>
                <p>
                  {isTourBooking
                    ? tourCopy.qrDescription
                    : translateText(
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
              {isTourBooking
                ? canShowQr ? tourCopy.qrNote : tourCopy.adminWillContact
                : translateText(
                    canShowQr
                      ? "Mã QR gắn với đúng booking này và dùng một lần tại quán. Nếu cần đổi thông tin, hãy hủy booking cũ và đặt lại."
                      : "Không thu cọc. Có thể hủy trước giờ hẹn tối thiểu 1 giờ. Muốn đổi giờ hoặc số người: hủy và đặt lại hoặc liên hệ hỗ trợ.",
                    activeLanguage,
                  )}
            </span>
          </div>

          <div className={styles.bottomActions}>
            {isBookingLoading && !booking ? null : booking && isGuestBooking ? (
              <div className={styles.guestConfirmNotice}>
                <Check size={16} />
                <span>{guestConfirmationMessage}</span>
              </div>
            ) : (
              <Link href="/lich-su-dat-cho" className={styles.primaryCta}>
                <strong>
                  {isTourBooking ? tourCopy.viewMyTour : translateText("Xem đặt chỗ của tôi", activeLanguage)}
                </strong>
              </Link>
            )}
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

function TourVenueSummary({ booking, language }: { booking: BookingRecord; language: LanguageCode }) {
  const stops = booking.tour?.stops ?? [];
  const copy = getTourConfirmCopy(language);

  if (!stops.length) {
    return (
      <div className={styles.tourVenueSection}>
        <div className={styles.tourVenueHeader}>
          <span>{copy.itineraryLabel}</span>
        </div>
        <strong className={styles.tourVenueFallback}>{bookingTitle(booking)}</strong>
      </div>
    );
  }

  return (
    <div className={styles.tourVenueSection}>
      <div className={styles.tourVenueHeader}>
        <span>{copy.itineraryLabel}</span>
        <strong>{formatTourStopCount(stops.length, language)}</strong>
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
                  <span className={styles.tourCastEmpty}>{copy.noCast}</span>
                )}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
