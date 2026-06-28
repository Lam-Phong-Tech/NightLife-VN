import { apiClient } from "./client";

export type BookingStatus =
  | "REQUESTED"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

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

const lastBookingKey = "nightlife_last_booking";
const guestBookingsKey = "nightlife_guest_bookings";

const readStoredBookings = () => {
  if (typeof window === "undefined") {
    return [] as BookingRecord[];
  }

  try {
    const raw = window.localStorage.getItem(guestBookingsKey);
    return raw ? (JSON.parse(raw) as BookingRecord[]) : [];
  } catch {
    window.localStorage.removeItem(guestBookingsKey);
    return [];
  }
};

export const rememberLastBooking = (booking: BookingRecord, options?: { guestHistory?: boolean }) => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(lastBookingKey, JSON.stringify(booking));

  if (options?.guestHistory) {
    const existing = readStoredBookings().filter((item) => item.id !== booking.id);
    window.localStorage.setItem(guestBookingsKey, JSON.stringify([booking, ...existing].slice(0, 20)));
  }
};

export const getLastBooking = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(lastBookingKey);
    return raw ? (JSON.parse(raw) as BookingRecord) : null;
  } catch {
    window.sessionStorage.removeItem(lastBookingKey);
    return null;
  }
};

export const getGuestBookingHistory = readStoredBookings;

export const bookingApi = {
  createGuestBooking: (payload: CreateBookingPayload) =>
    apiClient<BookingRecord>("/bookings", { data: payload }),
  createMemberBooking: (payload: CreateBookingPayload) =>
    apiClient<BookingRecord>("/member/bookings", { data: payload }),
  listMemberBookings: () => apiClient<BookingRecord[]>("/member/bookings"),
};
