import { afterEach, describe, expect, it, vi } from "vitest";
import {
  bookingRecordStatusGroup,
  bookingRecordStatusLabel,
  sortBookingHistories,
  type BookingRecord,
} from "../src/lib/api/bookings";

const baseBooking = (overrides: Partial<BookingRecord>): BookingRecord => ({
  id: overrides.id ?? "booking-1",
  bookingCode: overrides.bookingCode ?? "BK-X7B9K2",
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

  it("sorts active booking history by newest creation time before booking time", () => {
    const regularBookingCreatedEarlier = baseBooking({
      id: "regular-booking",
      scheduledAt: "2030-07-10T16:00:00.000Z",
      createdAt: "2030-07-09T04:00:00.000Z",
    });
    const castBookingCreatedLater = baseBooking({
      id: "cast-booking",
      castId: "cast-1",
      scheduledAt: "2030-07-09T14:00:00.000Z",
      createdAt: "2030-07-09T06:00:00.000Z",
    });

    expect(
      sortBookingHistories([regularBookingCreatedEarlier, castBookingCreatedLater]).map(
        (booking) => booking.id,
      ),
    ).toEqual(["cast-booking", "regular-booking"]);
  });

  it("pins the just-created booking above active bookings with later schedules", () => {
    const laterScheduledBooking = baseBooking({
      id: "later-schedule",
      scheduledAt: "2030-07-10T23:00:00.000Z",
      createdAt: "2030-07-09T04:00:00.000Z",
    });
    const justCreatedBooking = baseBooking({
      id: "just-created",
      scheduledAt: "2030-07-09T21:00:00.000Z",
    });

    expect(
      sortBookingHistories([laterScheduledBooking, justCreatedBooking], Date.now(), [
        "just-created",
      ]).map((booking) => booking.id),
    ).toEqual(["just-created", "later-schedule"]);
  });

  it("pushes overdue and cancelled bookings below active and completed bookings", () => {
    const nowMs = new Date("2026-07-09T12:00:00.000Z").getTime();
    const activeBooking = baseBooking({
      id: "active",
      scheduledAt: "2026-07-09T14:00:00.000Z",
      createdAt: "2026-07-09T06:00:00.000Z",
    });
    const completedBooking = baseBooking({
      id: "completed",
      status: "COMPLETED",
      scheduledAt: "2026-07-08T14:00:00.000Z",
      createdAt: "2026-07-09T05:00:00.000Z",
    });
    const overdueBooking = baseBooking({
      id: "overdue",
      scheduledAt: "2026-07-09T10:00:00.000Z",
      createdAt: "2026-07-09T08:00:00.000Z",
    });
    const cancelledBooking = baseBooking({
      id: "cancelled",
      status: "CANCELLED",
      scheduledAt: "2026-07-12T15:00:00.000Z",
      createdAt: "2026-07-09T07:00:00.000Z",
    });

    expect(
      sortBookingHistories(
        [cancelledBooking, overdueBooking, completedBooking, activeBooking],
        nowMs,
      ).map((booking) => booking.id),
    ).toEqual(["active", "completed", "overdue", "cancelled"]);
  });
});
