import { describe, expect, it } from "vitest";

import { buildBookingTimeSlots } from "@/lib/booking-time-slots";

describe("booking time slots", () => {
  it("builds booking slots from admin opening hours", () => {
    expect(
      buildBookingTimeSlots(
        { thursday: { open: "11:00", close: "23:00" } },
        "2026-07-09",
        { fallback: "empty" },
      ),
    ).toEqual([
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
      "19:00",
      "20:00",
      "21:00",
      "22:00",
    ]);
  });

  it("does not show hard-coded slots when admin hours are missing in strict mode", () => {
    expect(buildBookingTimeSlots(null, "2026-07-09", { fallback: "empty" })).toEqual([]);
  });

  it("keeps next-day booking slots for stores open past midnight", () => {
    expect(
      buildBookingTimeSlots({ summary: "18:00 - 02:00" }, "2026-07-09", {
        fallback: "empty",
      }),
    ).toEqual(["19:00", "20:00", "21:00", "22:00", "23:00", "00:00", "01:00"]);
  });
});
