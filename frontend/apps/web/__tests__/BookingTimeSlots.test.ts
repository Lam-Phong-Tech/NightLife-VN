import { describe, expect, it } from "vitest";

import {
  bookingTimeSlotDate,
  buildBookingTimeSlotGroups,
  buildBookingTimeSlots,
  formatBookingTimeSlotLabel,
  formatBusinessOpeningHours,
  normalizeStoreOpeningHours,
} from "@/lib/booking-time-slots";

describe("booking time slots", () => {
  it("builds booking slots from admin opening hours", () => {
    expect(
      buildBookingTimeSlots({ thursday: { open: "11:00", close: "23:00" } }, "2026-07-09", {
        fallback: "empty",
      }),
    ).toEqual([
      "11:00",
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

  it("keeps admin closing boundary at 24:00 and builds real slots", () => {
    const normalized = normalizeStoreOpeningHours({
      thursday: { isOff: false, hours: "08:00 - 24:00" },
    });

    expect(normalized?.thursday).toEqual({ open: "08:00", close: "24:00" });
    expect(
      buildBookingTimeSlots(normalized, "2026-07-09", {
        fallback: "empty",
      }),
    ).toEqual([
      "08:00",
      "09:00",
      "10:00",
      "11:00",
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
      "23:00",
    ]);
  });

  it("keeps separate admin opening windows instead of merging the gap", () => {
    expect(
      buildBookingTimeSlots({ thursday: { hours: "08:00 - 12:00, 18:00 - 22:00" } }, "2026-07-09", {
        fallback: "empty",
      }),
    ).toEqual(["08:00", "09:00", "10:00", "11:00", "18:00", "19:00", "20:00", "21:00"]);
  });

  it("groups separated admin windows into morning and evening choices", () => {
    expect(
      buildBookingTimeSlotGroups(
        { thursday: { hours: "08:00 - 12:00, 18:00 - 22:00" } },
        "2026-07-09",
        { fallback: "empty" },
      ),
    ).toEqual([
      { key: "morning", label: "Sáng", slots: ["08:00", "09:00", "10:00", "11:00"] },
      { key: "evening", label: "Tối", slots: ["18:00", "19:00", "20:00", "21:00"] },
    ]);
  });

  it("splits one continuous admin window by booking shifts", () => {
    expect(
      buildBookingTimeSlotGroups(
        { thursday: { hours: "11:00 - 23:00" } },
        "2026-07-09",
        { fallback: "empty" },
      ),
    ).toEqual([
      {
        key: "morning",
        label: "Sáng",
        slots: [
          "11:00",
          "12:00",
          "13:00",
        ],
      },
      {
        key: "evening",
        label: "Tối",
        slots: [
          "14:00",
          "15:00",
          "16:00",
          "17:00",
          "18:00",
          "19:00",
          "20:00",
          "21:00",
          "22:00",
        ],
      },
    ]);
  });

  it("clips morning slots to the 08:00 shift start and 14:00 shift boundary", () => {
    expect(
      buildBookingTimeSlotGroups(
        { thursday: { hours: "06:00 - 15:00" } },
        "2026-07-09",
        { fallback: "empty" },
      ),
    ).toEqual([
      {
        key: "morning",
        label: "Sáng",
        slots: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00"],
      },
      { key: "evening", label: "Tối", slots: ["14:00"] },
    ]);
  });

  it("does not show hard-coded slots when admin hours are missing in strict mode", () => {
    expect(buildBookingTimeSlots(null, "2026-07-09", { fallback: "empty" })).toEqual([]);
  });

  it("keeps every hourly slot before an overnight closing boundary", () => {
    expect(
      buildBookingTimeSlots({ summary: "18:00 - 02:00" }, "2026-07-09", {
        fallback: "empty",
      }),
    ).toEqual(["18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00", "01:00"]);
  });

  it("keeps after-midnight slots in the evening group for overnight ranges", () => {
    expect(
      buildBookingTimeSlotGroups({ summary: "18:00 - 02:00" }, "2026-07-09", {
        fallback: "empty",
      }),
    ).toEqual([
      { key: "morning", label: "Sáng", slots: [] },
      {
        key: "evening",
        label: "Tối",
        slots: ["18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00", "01:00"],
      },
    ]);
  });

  it("joins an end-of-day range to the next calendar day's early range", () => {
    const openingHours = {
      monday: { hours: "19:00 - 24:00" },
      tuesday: { hours: "00:00 - 02:00, 19:00 - 24:00" },
      wednesday: { hours: "00:00 - 02:00" },
    };

    expect(buildBookingTimeSlots(openingHours, "2026-07-06", { fallback: "empty" }))
      .toEqual(["19:00", "20:00", "21:00", "22:00", "23:00", "00:00", "01:00"]);
    expect(buildBookingTimeSlots(openingHours, "2026-07-07", { fallback: "empty" }))
      .toEqual(["19:00", "20:00", "21:00", "22:00", "23:00", "00:00", "01:00"]);
  });

  it("does not reuse the early continuation as a slot of the next business day", () => {
    const openingHours = {
      monday: { hours: "19:00 - 24:00" },
      tuesday: { hours: "00:00 - 02:00" },
    };

    expect(buildBookingTimeSlots(openingHours, "2026-07-07", { fallback: "empty" })).toEqual([]);
  });

  it("labels after-midnight slots with the next calendar date", () => {
    const openingHours = {
      monday: { hours: "19:00 - 24:00" },
      tuesday: { hours: "00:00 - 02:00" },
    };

    expect(bookingTimeSlotDate("2026-07-27", "00:00", openingHours)).toBe("2026-07-28");
    expect(formatBookingTimeSlotLabel("00:00", "2026-07-27", openingHours))
      .toBe("00:00 (28/7)");
    expect(formatBookingTimeSlotLabel("19:00", "2026-07-27", openingHours)).toBe("19:00");
    expect(bookingTimeSlotDate("2026-07-27", "01:00", openingHours)).toBe("2026-07-28");
  });

  it("includes the year when an overnight slot crosses into a new year", () => {
    const openingHours = {
      thursday: { hours: "19:00 - 24:00" },
      friday: { hours: "00:00 - 02:00" },
    };

    expect(formatBookingTimeSlotLabel("00:00", "2026-12-31", openingHours))
      .toBe("00:00 (1/1/2027)");
  });

  it("formats split calendar ranges as one customer-facing overnight range", () => {
    const openingHours = {
      monday: { hours: "19:00 - 24:00" },
      tuesday: { hours: "00:00 - 02:00, 19:00 - 24:00" },
      wednesday: { hours: "00:00 - 02:00" },
    };

    expect(formatBusinessOpeningHours(openingHours, "monday"))
      .toBe("19:00 - 02:00 (hôm sau)");
    expect(formatBusinessOpeningHours(openingHours, "tuesday"))
      .toBe("19:00 - 02:00 (hôm sau)");
  });
});
