import { afterEach, describe, expect, it, vi } from "vitest";
import {
  bookingRecordStatusGroup,
  bookingRecordStatusLabel,
  sortBookingHistories,
  type BookingRecord,
} from "../src/lib/api/bookings";

const baseBooking = (overrides: Partial<BookingRecord>): BookingRecord => ({
  id: overrides.id ?? "booking-1",
  status: overrides.status ?? "REQUESTED",
  scheduledAt: overrides.scheduledAt ?? "2026-07-09T14:00:00.000Z",
  partySize: overrides.partySize ?? 4,
  createdAt: overrides.createdAt,
});

describe("booking history status helpers", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("groups overdue open bookings outside of the New tab", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-09T16:00:00.000Z"));
    const overdueBooking = baseBooking({
      id: "overdue",
      status: "REQUESTED",
      scheduledAt: "2026-07-08T14:00:00.000Z",
    });

    expect(bookingRecordStatusGroup(overdueBooking)).toBe("Hoàn tất");
    expect(bookingRecordStatusLabel(overdueBooking)).toBe("Đã qua giờ");
  });

  it("sorts booking history by booking time before created time", () => {
    const olderBookingCreatedLater = baseBooking({
      id: "old-booking",
      scheduledAt: "2026-07-08T14:00:00.000Z",
      createdAt: "2026-07-09T18:00:00.000Z",
    });
    const newerBookingCreatedEarlier = baseBooking({
      id: "new-booking",
      scheduledAt: "2026-07-10T14:00:00.000Z",
      createdAt: "2026-07-08T18:00:00.000Z",
    });

    expect(sortBookingHistories([olderBookingCreatedLater, newerBookingCreatedEarlier]).map((booking) => booking.id)).toEqual([
      "new-booking",
      "old-booking",
    ]);
  });
});
