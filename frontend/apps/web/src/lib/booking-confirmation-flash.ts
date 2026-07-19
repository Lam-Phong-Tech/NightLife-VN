import type { LanguageCode } from "@/lib/i18n/use-active-language";

export type BookingConfirmationFlashTone = "success" | "info" | "warning" | "error" | "gold";
export type BookingConfirmationFlashKind = "partner" | "admin" | "cancelled";

export type BookingConfirmationFlashToast = {
  kind: BookingConfirmationFlashKind;
  bookingTitle: string;
  isTourBooking?: boolean;
  durationMs?: number;
};

type LegacyBookingConfirmationFlashToast = {
  tone?: BookingConfirmationFlashTone;
  title: string;
  description?: string;
  durationMs?: number;
};

export type BookingConfirmationFlashPayload =
  | BookingConfirmationFlashToast
  | LegacyBookingConfirmationFlashToast;

export type BookingConfirmationToastCopy = {
  tone: BookingConfirmationFlashTone;
  title: string;
  description?: string;
  durationMs?: number;
};

export type BookingConfirmationPageFeedback = {
  tone: BookingConfirmationFlashTone;
  toastTitle: string;
  toastDescription: string;
  homeTitle: string;
  homeDescription: string;
  redirectTitle: string;
  redirectDescription: string;
};

type BookingConfirmationCopy = {
  partnerToastTitle: (isTourBooking: boolean) => string;
  partnerToastDescription: (bookingTitle: string, isTourBooking: boolean) => string;
  partnerHomeTitle: (isTourBooking: boolean) => string;
  partnerHomeDescription: (bookingTitle: string, isTourBooking: boolean) => string;
  adminToastTitle: (isTourBooking: boolean) => string;
  adminToastDescription: (bookingTitle: string, isTourBooking: boolean) => string;
  adminHomeTitle: (isTourBooking: boolean) => string;
  adminHomeDescription: (bookingTitle: string, isTourBooking: boolean) => string;
  cancelledToastTitle: string;
  cancelledToastDescription: (bookingTitle: string) => string;
  cancelledHomeTitle: string;
  cancelledHomeDescription: (bookingTitle: string) => string;
  partnerRedirectTitle: string;
  partnerRedirectDescription: string;
  adminRedirectTitle: string;
  adminRedirectDescription: string;
  cancelledRedirectTitle: string;
  cancelledRedirectDescription: string;
};

const bookingConfirmationCopy: Record<LanguageCode, BookingConfirmationCopy> = {
  vi: {
    partnerToastTitle: (isTourBooking) =>
      isTourBooking ? "Quán đã xác nhận điểm dừng" : "Quán đã xác nhận QR",
    partnerToastDescription: (bookingTitle, isTourBooking) =>
      isTourBooking
        ? `Điểm dừng trong tour ${bookingTitle} đã được quán xác nhận. Đang chuyển bạn về trang chủ.`
        : `${bookingTitle} đã quét QR và xác nhận lượt sử dụng. Đang chuyển bạn về trang chủ.`,
    partnerHomeTitle: (isTourBooking) =>
      isTourBooking ? "Check-in tour thành công" : "Xác nhận tại quán thành công",
    partnerHomeDescription: (bookingTitle, isTourBooking) =>
      isTourBooking
        ? `Điểm dừng trong tour ${bookingTitle} đã được quán xác nhận thành công.`
        : `${bookingTitle} đã được quán xác nhận qua QR.`,
    adminToastTitle: (isTourBooking) => (isTourBooking ? "Admin đã duyệt tour" : "Admin đã duyệt đơn"),
    adminToastDescription: (bookingTitle, isTourBooking) =>
      isTourBooking
        ? `Tour ${bookingTitle} đã được Admin xác nhận. Đang chuyển bạn về trang chủ.`
        : `Đặt chỗ ${bookingTitle} đã được Admin xác nhận. Đang chuyển bạn về trang chủ.`,
    adminHomeTitle: (isTourBooking) => (isTourBooking ? "Tour đã được duyệt" : "Đặt chỗ đã được duyệt"),
    adminHomeDescription: (bookingTitle, isTourBooking) =>
      isTourBooking
        ? `Tour ${bookingTitle} đã được Admin xác nhận thành công.`
        : `Đặt chỗ ${bookingTitle} đã được Admin xác nhận thành công.`,
    cancelledToastTitle: "Xác nhận thất bại",
    cancelledToastDescription: (bookingTitle) =>
      `Lịch đặt ${bookingTitle} đã bị hủy hoặc không còn hiệu lực. Đang chuyển bạn về trang chủ.`,
    cancelledHomeTitle: "Xác nhận thất bại",
    cancelledHomeDescription: (bookingTitle) =>
      `Lịch đặt ${bookingTitle} đã bị hủy hoặc không còn hiệu lực.`,
    partnerRedirectTitle: "Đang chuyển về trang chủ",
    partnerRedirectDescription: "Trạng thái QR đã cập nhật xong.",
    adminRedirectTitle: "Đang chuyển về trang chủ",
    adminRedirectDescription: "Đơn đã được duyệt thành công.",
    cancelledRedirectTitle: "Đang quay về trang chủ",
    cancelledRedirectDescription: "Trạng thái lịch đặt không thể xác nhận.",
  },
  en: {
    partnerToastTitle: (isTourBooking) =>
      isTourBooking ? "Venue confirmed the stop" : "Venue confirmed the QR",
    partnerToastDescription: (bookingTitle, isTourBooking) =>
      isTourBooking
        ? `The stop in ${bookingTitle} has been confirmed by the venue. Taking you back home.`
        : `${bookingTitle} has scanned your QR and confirmed the visit. Taking you back home.`,
    partnerHomeTitle: (isTourBooking) =>
      isTourBooking ? "Tour check-in confirmed" : "Venue confirmation complete",
    partnerHomeDescription: (bookingTitle, isTourBooking) =>
      isTourBooking
        ? `The stop in ${bookingTitle} has been confirmed by the venue.`
        : `${bookingTitle} has been confirmed by the venue via QR.`,
    adminToastTitle: (isTourBooking) =>
      isTourBooking ? "Admin approved the tour" : "Admin approved the booking",
    adminToastDescription: (bookingTitle, isTourBooking) =>
      isTourBooking
        ? `Tour ${bookingTitle} has been confirmed by Admin. Taking you back home.`
        : `Booking ${bookingTitle} has been confirmed by Admin. Taking you back home.`,
    adminHomeTitle: (isTourBooking) =>
      isTourBooking ? "Tour approved" : "Booking approved",
    adminHomeDescription: (bookingTitle, isTourBooking) =>
      isTourBooking
        ? `Tour ${bookingTitle} has been confirmed by Admin.`
        : `Booking ${bookingTitle} has been confirmed by Admin.`,
    cancelledToastTitle: "Confirmation failed",
    cancelledToastDescription: (bookingTitle) =>
      `Booking ${bookingTitle} was cancelled or is no longer valid. Taking you back home.`,
    cancelledHomeTitle: "Confirmation failed",
    cancelledHomeDescription: (bookingTitle) =>
      `Booking ${bookingTitle} was cancelled or is no longer valid.`,
    partnerRedirectTitle: "Returning to home",
    partnerRedirectDescription: "The QR status has been updated.",
    adminRedirectTitle: "Returning to home",
    adminRedirectDescription: "The booking was approved successfully.",
    cancelledRedirectTitle: "Returning to home",
    cancelledRedirectDescription: "This booking status cannot be confirmed.",
  },
  ja: {
    partnerToastTitle: (isTourBooking) =>
      isTourBooking ? "店舗が立ち寄り先を確認しました" : "店舗がQRを確認しました",
    partnerToastDescription: (bookingTitle, isTourBooking) =>
      isTourBooking
        ? `ツアー「${bookingTitle}」の立ち寄り先が店舗により確認されました。ホームへ戻ります。`
        : `「${bookingTitle}」のQR利用が店舗により確認されました。ホームへ戻ります。`,
    partnerHomeTitle: (isTourBooking) =>
      isTourBooking ? "ツアーのチェックインが完了しました" : "店舗での確認が完了しました",
    partnerHomeDescription: (bookingTitle, isTourBooking) =>
      isTourBooking
        ? `ツアー「${bookingTitle}」の立ち寄り先が店舗により確認されました。`
        : `「${bookingTitle}」は店舗でQR確認済みです。`,
    adminToastTitle: (isTourBooking) =>
      isTourBooking ? "管理者がツアーを承認しました" : "管理者が予約を承認しました",
    adminToastDescription: (bookingTitle, isTourBooking) =>
      isTourBooking
        ? `ツアー「${bookingTitle}」が管理者により確認されました。ホームへ戻ります。`
        : `予約「${bookingTitle}」が管理者により確認されました。ホームへ戻ります。`,
    adminHomeTitle: (isTourBooking) => (isTourBooking ? "ツアーが承認されました" : "予約が承認されました"),
    adminHomeDescription: (bookingTitle, isTourBooking) =>
      isTourBooking
        ? `ツアー「${bookingTitle}」が管理者により確認されました。`
        : `予約「${bookingTitle}」が管理者により確認されました。`,
    cancelledToastTitle: "確認に失敗しました",
    cancelledToastDescription: (bookingTitle) =>
      `予約「${bookingTitle}」はキャンセル済み、または無効です。ホームへ戻ります。`,
    cancelledHomeTitle: "確認に失敗しました",
    cancelledHomeDescription: (bookingTitle) =>
      `予約「${bookingTitle}」はキャンセル済み、または無効です。`,
    partnerRedirectTitle: "ホームへ戻っています",
    partnerRedirectDescription: "QRの状態を更新しました。",
    adminRedirectTitle: "ホームへ戻っています",
    adminRedirectDescription: "予約が正常に承認されました。",
    cancelledRedirectTitle: "ホームへ戻っています",
    cancelledRedirectDescription: "この予約状態は確認できません。",
  },
  ko: {
    partnerToastTitle: (isTourBooking) =>
      isTourBooking ? "매장이 방문 지점을 확인했습니다" : "매장이 QR을 확인했습니다",
    partnerToastDescription: (bookingTitle, isTourBooking) =>
      isTourBooking
        ? `${bookingTitle} 투어의 방문 지점이 매장에서 확인되었습니다. 홈으로 이동합니다.`
        : `${bookingTitle}의 QR 사용이 매장에서 확인되었습니다. 홈으로 이동합니다.`,
    partnerHomeTitle: (isTourBooking) =>
      isTourBooking ? "투어 체크인이 완료되었습니다" : "매장 확인이 완료되었습니다",
    partnerHomeDescription: (bookingTitle, isTourBooking) =>
      isTourBooking
        ? `${bookingTitle} 투어의 방문 지점이 매장에서 확인되었습니다.`
        : `${bookingTitle}가 QR로 매장에서 확인되었습니다.`,
    adminToastTitle: (isTourBooking) =>
      isTourBooking ? "관리자가 투어를 승인했습니다" : "관리자가 예약을 승인했습니다",
    adminToastDescription: (bookingTitle, isTourBooking) =>
      isTourBooking
        ? `${bookingTitle} 투어가 관리자에 의해 확인되었습니다. 홈으로 이동합니다.`
        : `${bookingTitle} 예약이 관리자에 의해 확인되었습니다. 홈으로 이동합니다.`,
    adminHomeTitle: (isTourBooking) =>
      isTourBooking ? "투어가 승인되었습니다" : "예약이 승인되었습니다",
    adminHomeDescription: (bookingTitle, isTourBooking) =>
      isTourBooking
        ? `${bookingTitle} 투어가 관리자에 의해 확인되었습니다.`
        : `${bookingTitle} 예약이 관리자에 의해 확인되었습니다.`,
    cancelledToastTitle: "확인에 실패했습니다",
    cancelledToastDescription: (bookingTitle) =>
      `${bookingTitle} 예약이 취소되었거나 더 이상 유효하지 않습니다. 홈으로 이동합니다.`,
    cancelledHomeTitle: "확인에 실패했습니다",
    cancelledHomeDescription: (bookingTitle) =>
      `${bookingTitle} 예약이 취소되었거나 더 이상 유효하지 않습니다.`,
    partnerRedirectTitle: "홈으로 이동 중",
    partnerRedirectDescription: "QR 상태가 업데이트되었습니다.",
    adminRedirectTitle: "홈으로 이동 중",
    adminRedirectDescription: "예약이 정상적으로 승인되었습니다.",
    cancelledRedirectTitle: "홈으로 이동 중",
    cancelledRedirectDescription: "이 예약 상태는 확인할 수 없습니다.",
  },
  zh: {
    partnerToastTitle: (isTourBooking) =>
      isTourBooking ? "店铺已确认停靠点" : "店铺已确认 QR",
    partnerToastDescription: (bookingTitle, isTourBooking) =>
      isTourBooking
        ? `${bookingTitle} 行程中的停靠点已由店铺确认。正在返回首页。`
        : `${bookingTitle} 已由店铺扫码并确认使用。正在返回首页。`,
    partnerHomeTitle: (isTourBooking) =>
      isTourBooking ? "行程签到成功" : "店铺确认成功",
    partnerHomeDescription: (bookingTitle, isTourBooking) =>
      isTourBooking
        ? `${bookingTitle} 行程中的停靠点已由店铺确认。`
        : `${bookingTitle} 已通过 QR 由店铺确认。`,
    adminToastTitle: (isTourBooking) =>
      isTourBooking ? "管理员已批准行程" : "管理员已批准预约",
    adminToastDescription: (bookingTitle, isTourBooking) =>
      isTourBooking
        ? `${bookingTitle} 行程已由管理员确认。正在返回首页。`
        : `${bookingTitle} 预约已由管理员确认。正在返回首页。`,
    adminHomeTitle: (isTourBooking) =>
      isTourBooking ? "行程已批准" : "预约已批准",
    adminHomeDescription: (bookingTitle, isTourBooking) =>
      isTourBooking
        ? `${bookingTitle} 行程已由管理员确认。`
        : `${bookingTitle} 预约已由管理员确认。`,
    cancelledToastTitle: "确认失败",
    cancelledToastDescription: (bookingTitle) =>
      `${bookingTitle} 预约已取消或不再有效。正在返回首页。`,
    cancelledHomeTitle: "确认失败",
    cancelledHomeDescription: (bookingTitle) =>
      `${bookingTitle} 预约已取消或不再有效。`,
    partnerRedirectTitle: "正在返回首页",
    partnerRedirectDescription: "QR 状态已更新。",
    adminRedirectTitle: "正在返回首页",
    adminRedirectDescription: "预约已成功批准。",
    cancelledRedirectTitle: "正在返回首页",
    cancelledRedirectDescription: "无法确认此预约状态。",
  },
};

const bookingConfirmationFlashKey = "nightlife:booking-confirmation-flash";
const bookingConfirmationFlashKinds = new Set<BookingConfirmationFlashKind>([
  "partner",
  "admin",
  "cancelled",
]);
const bookingConfirmationFlashTones = new Set<BookingConfirmationFlashTone>([
  "success",
  "info",
  "warning",
  "error",
  "gold",
]);

const normalizeTone = (tone: unknown): BookingConfirmationFlashTone =>
  typeof tone === "string" && bookingConfirmationFlashTones.has(tone as BookingConfirmationFlashTone)
    ? (tone as BookingConfirmationFlashTone)
    : "success";

const getBookingConfirmationCopy = (language: LanguageCode) =>
  bookingConfirmationCopy[language] ?? bookingConfirmationCopy.vi;

const normalizedBookingTitle = (bookingTitle: string | undefined) =>
  bookingTitle?.trim() || "NightLife";

export const buildBookingConfirmationPageFeedback = (
  {
    kind,
    bookingTitle,
    isTourBooking = false,
  }: {
    kind: BookingConfirmationFlashKind;
    bookingTitle: string;
    isTourBooking?: boolean;
  },
  language: LanguageCode,
): BookingConfirmationPageFeedback => {
  const copy = getBookingConfirmationCopy(language);
  const title = normalizedBookingTitle(bookingTitle);

  if (kind === "partner") {
    return {
      tone: "success",
      toastTitle: copy.partnerToastTitle(isTourBooking),
      toastDescription: copy.partnerToastDescription(title, isTourBooking),
      homeTitle: copy.partnerHomeTitle(isTourBooking),
      homeDescription: copy.partnerHomeDescription(title, isTourBooking),
      redirectTitle: copy.partnerRedirectTitle,
      redirectDescription: copy.partnerRedirectDescription,
    };
  }

  if (kind === "admin") {
    return {
      tone: "success",
      toastTitle: copy.adminToastTitle(isTourBooking),
      toastDescription: copy.adminToastDescription(title, isTourBooking),
      homeTitle: copy.adminHomeTitle(isTourBooking),
      homeDescription: copy.adminHomeDescription(title, isTourBooking),
      redirectTitle: copy.adminRedirectTitle,
      redirectDescription: copy.adminRedirectDescription,
    };
  }

  return {
    tone: "error",
    toastTitle: copy.cancelledToastTitle,
    toastDescription: copy.cancelledToastDescription(title),
    homeTitle: copy.cancelledHomeTitle,
    homeDescription: copy.cancelledHomeDescription(title),
    redirectTitle: copy.cancelledRedirectTitle,
    redirectDescription: copy.cancelledRedirectDescription,
  };
};

export const buildBookingConfirmationFlashToast = (
  payload: BookingConfirmationFlashPayload,
  language: LanguageCode,
): BookingConfirmationToastCopy | null => {
  if ("kind" in payload) {
    const feedback = buildBookingConfirmationPageFeedback(
      {
        kind: payload.kind,
        bookingTitle: payload.bookingTitle,
        isTourBooking: payload.isTourBooking,
      },
      language,
    );
    return {
      tone: feedback.tone,
      title: feedback.homeTitle,
      description: feedback.homeDescription,
      durationMs: payload.durationMs,
    };
  }

  if (!payload.title.trim()) return null;

  return {
    tone: normalizeTone(payload.tone),
    title: payload.title,
    description: payload.description,
    durationMs: payload.durationMs,
  };
};

export const writeBookingConfirmationFlashToast = (toast: BookingConfirmationFlashToast) => {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(bookingConfirmationFlashKey, JSON.stringify(toast));
  } catch {
    // Flash toast is a convenience after redirect; failing storage must not block the flow.
  }
};

export const readBookingConfirmationFlashToast = (): BookingConfirmationFlashPayload | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(bookingConfirmationFlashKey);
    window.sessionStorage.removeItem(bookingConfirmationFlashKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<BookingConfirmationFlashToast & LegacyBookingConfirmationFlashToast>;

    if (
      parsed &&
      typeof parsed.kind === "string" &&
      bookingConfirmationFlashKinds.has(parsed.kind as BookingConfirmationFlashKind)
    ) {
      return {
        kind: parsed.kind as BookingConfirmationFlashKind,
        bookingTitle: typeof parsed.bookingTitle === "string" ? parsed.bookingTitle : "",
        isTourBooking: Boolean(parsed.isTourBooking),
        durationMs: typeof parsed.durationMs === "number" ? parsed.durationMs : undefined,
      };
    }

    if (!parsed || typeof parsed.title !== "string" || !parsed.title.trim()) return null;

    return {
      tone: normalizeTone(parsed.tone),
      title: parsed.title,
      description: typeof parsed.description === "string" ? parsed.description : undefined,
      durationMs: typeof parsed.durationMs === "number" ? parsed.durationMs : undefined,
    };
  } catch {
    try {
      window.sessionStorage.removeItem(bookingConfirmationFlashKey);
    } catch {
      // Ignore cleanup failures.
    }
    return null;
  }
};
