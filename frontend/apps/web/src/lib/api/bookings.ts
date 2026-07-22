import { apiClient } from "./client";

export type BookingStatus = "REQUESTED" | "CONFIRMED" | "CHECKED_IN" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export type BookingStatusGroup = "Mới" | "Hoàn tất" | "Đã hủy";

type BookingDiscountSnapshot = {
  type?: "PERCENT" | "FIXED_AMOUNT" | string;
  value?: number | null;
  discountType?: "PERCENT" | "FIXED_AMOUNT" | string | null;
  discountValue?: number | null;
  discountPercent?: number | null;
  sourceValue?: number | null;
  [key: string]: unknown;
};

export type BookingRecord = {
  id: string;
  bookingCode: string;
  tourBookingId?: string;
  storeId?: string;
  castId?: string | null;
  status: BookingStatus;
  scheduledAt: string;
  partySize: number;
  subtotalVnd?: number;
  discountVnd?: number;
  totalVnd?: number;
  discountSnapshot?: BookingDiscountSnapshot | null;
  note?: string | null;
  createdAt?: string;
  updatedAt?: string;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  store?: {
    id: string;
    name: string;
    slug: string;
    address?: string | null;
    bookingCancelCutoffMinutes?: number | null;
    openingHours?: Record<string, unknown> | null;
    media?: Array<{ url: string }>;
  } | null;
  cast?: {
    id: string;
    slug: string;
    stageName: string;
    publicAlias?: string | null;
    media?: Array<{ url: string }>;
  } | null;
  guest?: {
    id: string;
    displayName?: string | null;
    phone?: string | null;
    email?: string | null;
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
    discountType?: "PERCENT" | "FIXED_AMOUNT" | string;
    discountValue?: number;
    maxDiscountVnd?: number | null;
    minSpendVnd?: number | null;
  } | null;
  couponIssue?: {
    id: string;
    code: string;
    status: string;
    usedAt?: string | null;
    qrPayload?: string | null;
    qrImageUrl?: string | null;
    qrImageDataUrl?: string | null;
    discountPercent?: number | null;
    discountRuleSnapshot?: BookingDiscountSnapshot | null;
    metadata?: {
      qrPayload?: string | null;
      discountPercent?: number | null;
      discountRuleSnapshot?: BookingDiscountSnapshot | null;
    } | null;
    bill?: {
      id: string;
      billNumber?: string | null;
      status: string;
      submittedAt?: string | null;
      reviewedAt?: string | null;
      verifiedAt?: string | null;
      rejectedAt?: string | null;
    } | null;
  } | null;
  qr?: {
    id: string;
    code: string;
    status: string;
    usedAt?: string | null;
    expiresAt?: string | null;
    payload?: string | null;
  } | null;
  bill?: {
    id: string;
    billNumber?: string | null;
    status: string;
    submittedAt?: string | null;
    reviewedAt?: string | null;
    verifiedAt?: string | null;
    rejectedAt?: string | null;
  } | null;
  tour?: {
    id: string;
    title: string;
    status?: string;
    progress?: {
      checkedIn: number;
      total: number;
    };
    stops: Array<{
      order: number;
      bookingId?: string;
      storeId: string;
      storeSlug: string;
      storeName: string;
      status?: BookingStatus;
      checkedInAt?: string | null;
      casts: Array<{
        id: string;
        slug: string;
        name: string;
      }>;
      coupon?: BookingRecord["coupon"];
      couponIssue?: BookingRecord["couponIssue"];
    }>;
  };
};

const parseTourMetadataFromNote = (booking: BookingRecord): BookingRecord["tour"] | null => {
  const note = booking.note?.trim();
  if (!note || !/^Tour:/i.test(note)) return null;

  const title = note.match(/(?:^|\|)\s*Tour:\s*([^|]+)/i)?.[1]?.trim();
  if (!title) return null;

  const stopsText = note.match(/(?:^|\|)\s*Diem dung:\s*([^|]+)/i)?.[1]?.trim() ?? "";
  const parsedStops = stopsText
    .split(">")
    .map((name) => name.trim())
    .filter(Boolean);
  const fallbackStoreName = booking.store?.name?.trim();
  const storeNames = parsedStops.length ? parsedStops : fallbackStoreName ? [fallbackStoreName] : [];

  return {
    id: `note-tour-${booking.id}`,
    title,
    stops: storeNames.map((storeName, index) => ({
      order: index + 1,
      storeId: index === 0 && booking.store?.id ? booking.store.id : `tour-stop-${booking.id}-${index + 1}`,
      storeSlug: index === 0 && booking.store?.slug ? booking.store.slug : "",
      storeName,
      casts: [],
    })),
  };
};

const normalizeBookingRecord = (booking: BookingRecord): BookingRecord => {
  if (booking.tour) return booking;

  const tour = parseTourMetadataFromNote(booking);
  return tour ? { ...booking, tour } : booking;
};

const mergeBookingStore = (
  current?: BookingRecord["store"],
  next?: BookingRecord["store"],
): BookingRecord["store"] => {
  if (!current) return next ?? null;
  if (!next) return current;

  const currentAddress = current.address?.trim() ? current.address : null;
  const nextAddress = next.address?.trim() ? next.address : null;

  return {
    ...next,
    ...current,
    address: currentAddress ?? nextAddress,
  };
};

const mergeBookingRecord = (base: BookingRecord, incoming: BookingRecord): BookingRecord => {
  const current = normalizeBookingRecord(base);
  const next = normalizeBookingRecord(incoming);

  return {
    ...next,
    ...current,
    store: mergeBookingStore(current.store, next.store),
    cast: current.cast ?? next.cast,
    guest: current.guest ?? next.guest,
    user: current.user ?? next.user,
    coupon: current.coupon ?? next.coupon,
    couponIssue: current.couponIssue ?? next.couponIssue,
    qr: current.qr ?? next.qr,
    bill: current.bill ?? next.bill,
    discountSnapshot: current.discountSnapshot ?? next.discountSnapshot,
    tour: current.tour ?? next.tour,
  };
};

export type CreateBookingPayload = {
  storeId?: string;
  storeSlug?: string;
  castId?: string;
  castSlug?: string;
  couponId?: string;
  couponIssueId?: string;
  displayName: string;
  email: string;
  phone?: string;
  scheduledAt: string;
  partySize: number;
  note?: string;
};

export type CreateTourBookingPayload = {
  displayName: string;
  email: string;
  phone?: string;
  scheduledAt: string;
  partySize: number;
  note?: string;
  castSelections?: Array<{
    storeId: string;
    castIds: string[];
  }>;
};

export type CancelGuestBookingPayload = {
  phone: string;
  reason?: string;
};

export type BookingReschedulePayload = {
  scheduledAt: string;
  reason?: string;
};

export type GuestBookingReschedulePayload = BookingReschedulePayload & {
  phone: string;
};

export type BookingChangeRequest = {
  id: string;
  bookingId: string;
  storeId: string;
  castId?: string | null;
  requestedById?: string | null;
  guestId?: string | null;
  reviewedById?: string | null;
  type: "RESCHEDULE";
  status: "REQUESTED" | "APPROVED" | "REJECTED" | "CANCELLED" | "EXPIRED";
  currentScheduledAt: string;
  requestedScheduledAt?: string | null;
  reason?: string | null;
  adminNote?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  booking?: BookingRecord | null;
  store?: { id: string; name: string; slug: string } | null;
  cast?: {
    id: string;
    slug: string;
    stageName: string;
    publicAlias?: string | null;
  } | null;
  requestedBy?: { id: string; displayName?: string | null } | null;
  guest?: {
    id: string;
    displayName?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
  reviewedBy?: { id: string; displayName?: string | null } | null;
};

export type BookingChatMessage = {
  id: string;
  bookingId: string;
  changeRequestId?: string | null;
  storeId: string;
  senderUserId?: string | null;
  guestId?: string | null;
  senderType: "GUEST" | "MEMBER" | "ADMIN" | "OPERATOR" | "SYSTEM";
  topic: "GENERAL" | "RESCHEDULE" | "CANCEL";
  body: string;
  createdAt: string;
  senderUser?: { id: string; displayName?: string | null; role?: string } | null;
  guest?: {
    id: string;
    displayName?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
};

export type BookingChatPayload = {
  message: string;
  topic?: "GENERAL" | "RESCHEDULE" | "CANCEL";
  changeRequestId?: string;
};

export type GuestBookingChatPayload = BookingChatPayload & {
  phone: string;
};

export type BookingCancelAnalytics = {
  meta: {
    from: string;
    to: string;
    days: number;
    totalBookings: number;
    cancelledBookings: number;
    cancelRate: number;
  };
  byStore: Array<{
    storeId: string;
    storeName: string;
    storeSlug: string;
    cancelCutoffMinutes: number;
    totalBookings: number;
    cancelledBookings: number;
    cancelRate: number;
  }>;
  byCast: Array<{
    castId: string | null;
    castName: string;
    castSlug: string | null;
    storeId: string | null;
    totalBookings: number;
    cancelledBookings: number;
    cancelRate: number;
  }>;
  byChannel: Array<{
    channel: "MEMBER" | "GUEST";
    totalBookings: number;
    cancelledBookings: number;
    cancelRate: number;
  }>;
};

const defaultBookingCancelCutoffMinutes = 60;
const lastBookingKey = "nightlife_last_booking";
const guestBookingsKey = "nightlife_guest_bookings";
const maxStoredBookings = 20;

const toApiParams = (params?: Record<string, string | number | undefined>) => {
  if (!params) return undefined;
  return Object.fromEntries(
    Object.entries(params)
      .filter((entry): entry is [string, string | number] => entry[1] !== undefined && entry[1] !== "")
      .map(([key, value]) => [key, String(value)]),
  );
};

const openBookingStatuses = new Set(["REQUESTED", "CONFIRMED"]);
const completedBookingStatuses = new Set(["COMPLETED", "CHECKED_IN"]);
const cancelledBookingStatuses = new Set(["CANCELLED", "NO_SHOW"]);

const toBookingTimestamp = (value?: string | null) => {
  const time = value ? new Date(value).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
};

export const isBookingPastDue = (booking: Pick<BookingRecord, "status" | "scheduledAt">) => {
  const normalizedStatus = booking.status.trim().toUpperCase();
  if (!openBookingStatuses.has(normalizedStatus)) {
    return false;
  }

  const scheduledAt = toBookingTimestamp(booking.scheduledAt);
  return scheduledAt > 0 && scheduledAt < Date.now();
};

export const bookingStatusGroup = (status: string, scheduledAt?: string): BookingStatusGroup => {
  const normalizedStatus = status.trim().toUpperCase();
  if (completedBookingStatuses.has(normalizedStatus)) return "Hoàn tất";
  if (cancelledBookingStatuses.has(normalizedStatus)) return "Đã hủy";
  const scheduledTime = toBookingTimestamp(scheduledAt);
  if (openBookingStatuses.has(normalizedStatus) && scheduledTime > 0 && scheduledTime < Date.now()) {
    return "Hoàn tất";
  }
  return "Mới";
};

export const bookingStatusLabel = (status: string, scheduledAt?: string) => {
  const normalizedStatus = status.trim().toUpperCase();
  const scheduledTime = toBookingTimestamp(scheduledAt);
  if (openBookingStatuses.has(normalizedStatus) && scheduledTime > 0 && scheduledTime < Date.now()) {
    return "Đã qua giờ";
  }

  const labels: Record<string, string> = {
    REQUESTED: "Mới",
    CONFIRMED: "Đã xác nhận",
    CHECKED_IN: "Đã check-in",
    COMPLETED: "Hoàn tất",
    CANCELLED: "Đã hủy",
    NO_SHOW: "Không đến",
  };

  return labels[normalizedStatus] ?? status;
};

export const bookingRecordStatusGroup = (booking: Pick<BookingRecord, "status" | "scheduledAt">) =>
  bookingStatusGroup(booking.status, booking.scheduledAt);

export const bookingRecordStatusLabel = (booking: Pick<BookingRecord, "status" | "scheduledAt">) =>
  bookingStatusLabel(booking.status, booking.scheduledAt);

export const canCancelBooking = (booking: Pick<BookingRecord, "status" | "scheduledAt" | "store">) => {
  const normalizedStatus = booking.status.trim().toUpperCase();
  if (normalizedStatus !== "REQUESTED" && normalizedStatus !== "CONFIRMED") {
    return false;
  }

  const cutoffMinutes = booking.store?.bookingCancelCutoffMinutes ?? defaultBookingCancelCutoffMinutes;
  const scheduledAt = new Date(booking.scheduledAt).getTime();
  return Number.isFinite(scheduledAt) && scheduledAt - Date.now() >= cutoffMinutes * 60 * 1000;
};

const bookingCreatedTimeValue = (booking: BookingRecord) =>
  toBookingTimestamp(booking.createdAt) || toBookingTimestamp(booking.scheduledAt);

const bookingScheduledTimeValue = (booking: BookingRecord) => toBookingTimestamp(booking.scheduledAt);

const bookingHistoryRank = (booking: BookingRecord, nowMs: number, pinnedBookingIds: Set<string>) => {
  const normalizedStatus = booking.status.trim().toUpperCase();
  if (pinnedBookingIds.has(booking.id) && openBookingStatuses.has(normalizedStatus)) return -1;
  if (cancelledBookingStatuses.has(normalizedStatus)) return 3;
  if (
    openBookingStatuses.has(normalizedStatus) &&
    bookingScheduledTimeValue(booking) > 0 &&
    bookingScheduledTimeValue(booking) < nowMs
  ) {
    return 2;
  }
  if (completedBookingStatuses.has(normalizedStatus)) return 1;
  return 0;
};

export const sortBookingHistories = (
  bookings: BookingRecord[],
  nowMs = Date.now(),
  pinnedBookingIds: string[] = [],
) => {
  const pinnedIds = new Set(pinnedBookingIds.filter(Boolean));

  return [...bookings].sort((a, b) => {
    const rankDiff = bookingHistoryRank(a, nowMs, pinnedIds) - bookingHistoryRank(b, nowMs, pinnedIds);
    if (rankDiff !== 0) return rankDiff;

    if (pinnedIds.size) {
      const pinnedDiff = Number(pinnedIds.has(b.id)) - Number(pinnedIds.has(a.id));
      if (pinnedDiff !== 0) return pinnedDiff;
    }

    const createdDiff = bookingCreatedTimeValue(b) - bookingCreatedTimeValue(a);
    if (createdDiff !== 0) return createdDiff;

    const scheduledDiff = bookingScheduledTimeValue(b) - bookingScheduledTimeValue(a);
    if (scheduledDiff !== 0) return scheduledDiff;

    return a.id.localeCompare(b.id);
  });
};

export const mergeBookingHistories = (...sources: BookingRecord[][]) => {
  const bookingsById = new Map<string, BookingRecord>();

  for (const source of sources) {
    for (const booking of source) {
      if (!booking?.id) {
        continue;
      }

      const existing = bookingsById.get(booking.id);
      bookingsById.set(booking.id, existing ? mergeBookingRecord(existing, booking) : normalizeBookingRecord(booking));
    }
  }

  return sortBookingHistories(Array.from(bookingsById.values())).slice(0, maxStoredBookings);
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
    try {
      window.localStorage.removeItem(guestBookingsKey);
    } catch {
      // Ignore storage failures so a private/quota-limited browser cannot break booking confirmation.
    }
    return [];
  }
};

const writeStoredBookings = (bookings: BookingRecord[]) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(guestBookingsKey, JSON.stringify(bookings.slice(0, maxStoredBookings)));
  } catch {
    // Local history is a convenience cache; the API remains the source of truth.
  }
};

export const rememberLastBooking = (
  booking: BookingRecord,
  options?: { guestHistory?: boolean; history?: boolean },
) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(lastBookingKey, JSON.stringify(booking));
  } catch {
    // The confirmation page can recover from the API when this tab cache is unavailable.
  }

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
    try {
      window.sessionStorage.removeItem(lastBookingKey);
    } catch {
      // Ignore storage cleanup failures.
    }
  }

  if (!bookingId || lastBooking?.id === bookingId) {
    return lastBooking;
  }

  return readStoredBookings().find((booking) => booking.id === bookingId) ?? null;
};

export const getGuestBookingHistory = readStoredBookings;

type GuestBookingLookup = {
  email?: string | null;
  phone?: string | null;
};

const buildGuestBookingLookupQuery = (lookup: string | GuestBookingLookup) => {
  const params = new URLSearchParams();

  if (typeof lookup === "string") {
    params.set("phone", lookup);
  } else {
    if (lookup.phone) params.set("phone", lookup.phone);
    if (lookup.email) params.set("email", lookup.email);
  }

  return params.toString();
};

export const bookingApi = {
  createGuestBooking: (payload: CreateBookingPayload) => apiClient<BookingRecord>("/bookings", { data: payload }),
  createMemberBooking: (payload: CreateBookingPayload) =>
    apiClient<BookingRecord>("/member/bookings", { data: payload }),
  createGuestTourBooking: (tourId: string, payload: CreateTourBookingPayload) =>
    apiClient<BookingRecord>(`/tours/${encodeURIComponent(tourId)}/bookings`, { data: payload }),
  createMemberTourBooking: (tourId: string, payload: CreateTourBookingPayload) =>
    apiClient<BookingRecord>(`/member/tours/${encodeURIComponent(tourId)}/bookings`, {
      data: payload,
    }),
  getGuestBookingByCode: (bookingCode: string, lookup: string | GuestBookingLookup) => {
    const query = buildGuestBookingLookupQuery(lookup);
    return apiClient<BookingRecord>(
      `/bookings/${encodeURIComponent(bookingCode)}${query ? `?${query}` : ""}`,
    );
  },
  cancelGuestBooking: (bookingId: string, payload: CancelGuestBookingPayload) =>
    apiClient<BookingRecord>(`/bookings/${encodeURIComponent(bookingId)}/cancel`, {
      method: "PATCH",
      data: payload,
    }),
  cancelMemberBooking: (bookingId: string, reason?: string) =>
    apiClient<BookingRecord>(`/member/bookings/${encodeURIComponent(bookingId)}/cancel`, {
      method: "PATCH",
      data: reason ? { reason } : {},
    }),
  requestMemberReschedule: (bookingId: string, payload: BookingReschedulePayload) =>
    apiClient<BookingRecord>(`/member/bookings/${encodeURIComponent(bookingId)}/reschedule`, {
      data: payload,
    }),
  requestGuestReschedule: (bookingId: string, payload: GuestBookingReschedulePayload) =>
    apiClient<BookingRecord>(`/bookings/${encodeURIComponent(bookingId)}/reschedule`, {
      data: payload,
    }),
  listMemberBookingMessages: (bookingId: string) =>
    apiClient<BookingChatMessage[]>(`/member/bookings/${encodeURIComponent(bookingId)}/messages`),
  sendMemberBookingMessage: (bookingId: string, payload: BookingChatPayload) =>
    apiClient<BookingChatMessage>(`/member/bookings/${encodeURIComponent(bookingId)}/messages`, {
      data: payload,
    }),
  listGuestBookingMessages: (bookingId: string, phone: string) =>
    apiClient<BookingChatMessage[]>(
      `/bookings/${encodeURIComponent(bookingId)}/messages?${new URLSearchParams({ phone }).toString()}`,
    ),
  sendGuestBookingMessage: (bookingId: string, payload: GuestBookingChatPayload) =>
    apiClient<BookingChatMessage>(`/bookings/${encodeURIComponent(bookingId)}/messages`, {
      data: payload,
    }),
  listAdminBookingChangeRequests: (params?: { status?: string; storeId?: string }) =>
    apiClient<BookingChangeRequest[]>("/admin/booking-change-requests", {
      params: toApiParams(params),
    }),
  reviewAdminBookingChangeRequest: (requestId: string, payload: { approve: boolean; note?: string }) =>
    apiClient<BookingChangeRequest>(`/admin/booking-change-requests/${encodeURIComponent(requestId)}/review`, {
      method: "PATCH",
      data: payload,
    }),
  listAdminBookingMessages: (bookingId: string) =>
    apiClient<BookingChatMessage[]>(`/admin/bookings/${encodeURIComponent(bookingId)}/messages`),
  sendAdminBookingMessage: (bookingId: string, payload: BookingChatPayload) =>
    apiClient<BookingChatMessage>(`/admin/bookings/${encodeURIComponent(bookingId)}/messages`, {
      data: payload,
    }),
  getAdminCancelAnalytics: (days = 30) =>
    apiClient<BookingCancelAnalytics>("/admin/bookings/cancel-analytics", {
      params: toApiParams({ days }),
    }),
  updateAdminStoreBookingPolicy: (storeId: string, cancelCutoffMinutes: 30 | 60 | 120) =>
    apiClient<{ id: string; name: string; slug: string; bookingCancelCutoffMinutes: number }>(
      `/admin/stores/${encodeURIComponent(storeId)}/booking-policy`,
      {
        method: "PATCH",
        data: { cancelCutoffMinutes },
      },
    ),
  listMemberBookings: () => apiClient<BookingRecord[]>("/member/bookings"),
};
