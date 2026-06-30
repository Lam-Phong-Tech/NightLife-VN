import { apiClient } from "./client";

export type BookingStatus =
  | "REQUESTED"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type BookingStatusGroup = "Mới" | "Hoàn tất" | "Đã hủy";

export type BookingRecord = {
  id: string;
  storeId?: string;
  castId?: string | null;
  status: BookingStatus;
  scheduledAt: string;
  partySize: number;
  subtotalVnd?: number;
  discountVnd?: number;
  totalVnd?: number;
  note?: string | null;
  createdAt?: string;
  cancelledAt?: string | null;
  store?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  cast?: {
    id: string;
    slug: string;
    stageName: string;
    publicAlias?: string | null;
  } | null;
  guest?: {
    id: string;
    displayName?: string | null;
    phone?: string | null;
  } | null;
  user?: {
    id: string;
    displayName?: string | null;
    tier?: string | null;
  } | null;
  coupon?: {
    id: string;
    code: string;
    name: string;
  } | null;
};

export type CreateBookingPayload = {
  storeId?: string;
  storeSlug?: string;
  castId?: string;
  castSlug?: string;
  displayName: string;
  phone: string;
  scheduledAt: string;
  partySize: number;
  note?: string;
};

const bookingCancelCutoffMs = 60 * 60 * 1000;
const lastBookingKey = "nightlife_last_booking";
const guestBookingsKey = "nightlife_guest_bookings";
const maxStoredBookings = 20;

export const bookingStatusGroup = (status: string): BookingStatusGroup => {
  if (status === "COMPLETED" || status === "CHECKED_IN") return "Hoàn tất";
  if (status === "CANCELLED" || status === "NO_SHOW") return "Đã hủy";
  return "Mới";
};

export const bookingStatusLabel = bookingStatusGroup;

export const canCancelBooking = (booking: Pick<BookingRecord, "status" | "scheduledAt">) => {
  if (booking.status !== "REQUESTED" && booking.status !== "CONFIRMED") {
    return false;
  }

  const scheduledAt = new Date(booking.scheduledAt).getTime();
  return Number.isFinite(scheduledAt) && scheduledAt - Date.now() >= bookingCancelCutoffMs;
};

const bookingTimeValue = (booking: BookingRecord) => {
  const value = booking.createdAt ?? booking.scheduledAt;
  const time = value ? new Date(value).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
};

export const mergeBookingHistories = (...sources: BookingRecord[][]) => {
  const bookingsById = new Map<string, BookingRecord>();

  for (const source of sources) {
    for (const booking of source) {
      if (!booking?.id || bookingsById.has(booking.id)) {
        continue;
      }

      bookingsById.set(booking.id, booking);
    }
  }

  return Array.from(bookingsById.values())
    .sort((a, b) => bookingTimeValue(b) - bookingTimeValue(a))
    .slice(0, maxStoredBookings);
};

const readStoredBookings = () => {
  if (typeof window === "undefined") {
    return [] as BookingRecord[];
  }

  try {
    const raw = window.localStorage.getItem(guestBookingsKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as BookingRecord[]) : [];
  } catch {
    window.localStorage.removeItem(guestBookingsKey);
    return [];
  }
};

const writeStoredBookings = (bookings: BookingRecord[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    guestBookingsKey,
    JSON.stringify(bookings.slice(0, maxStoredBookings)),
  );
};

export const rememberLastBooking = (
  booking: BookingRecord,
  options?: { guestHistory?: boolean; history?: boolean },
) => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(lastBookingKey, JSON.stringify(booking));

  if (options?.guestHistory || options?.history) {
    writeStoredBookings(mergeBookingHistories([booking], readStoredBookings()));
  }
};

export const getLastBooking = (bookingId?: string | null) => {
  if (typeof window === "undefined") {
    return null;
  }

  let lastBooking: BookingRecord | null = null;

  try {
    const raw = window.sessionStorage.getItem(lastBookingKey);
    lastBooking = raw ? (JSON.parse(raw) as BookingRecord) : null;
  } catch {
    window.sessionStorage.removeItem(lastBookingKey);
  }

  if (!bookingId || lastBooking?.id === bookingId) {
    return lastBooking;
  }

  return readStoredBookings().find((booking) => booking.id === bookingId) ?? lastBooking;
};

export const getGuestBookingHistory = readStoredBookings;

export const bookingApi = {
  createGuestBooking: (payload: CreateBookingPayload) =>
    apiClient<BookingRecord>("/bookings", { data: payload }),
  createMemberBooking: (payload: CreateBookingPayload) =>
    apiClient<BookingRecord>("/member/bookings", { data: payload }),
  cancelMemberBooking: (bookingId: string, reason?: string) =>
    apiClient<BookingRecord>(`/member/bookings/${encodeURIComponent(bookingId)}/cancel`, {
      method: "PATCH",
      data: reason ? { reason } : {},
    }),
  listMemberBookings: () => apiClient<BookingRecord[]>("/member/bookings"),
};
