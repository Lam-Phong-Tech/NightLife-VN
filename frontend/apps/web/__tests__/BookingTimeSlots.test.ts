import { describe, expect, it } from "vitest";

import { buildBookingTimeSlotGroups, buildBookingTimeSlots } from "@/lib/booking-time-slots";

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

  it("caps next-day booking slots at midnight for stores open past midnight", () => {
    expect(
      buildBookingTimeSlots({ summary: "18:00 - 02:00" }, "2026-07-09", {
        fallback: "empty",
      }),
    ).toEqual(["18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00"]);
  });

  it("keeps only midnight in the evening group for overnight ranges", () => {
    expect(
      buildBookingTimeSlotGroups({ summary: "18:00 - 02:00" }, "2026-07-09", {
        fallback: "empty",
      }),
    ).toEqual([
      { key: "morning", label: "Sáng", slots: [] },
      {
        key: "evening",
        label: "Tối",
        slots: ["18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00"],
      },
    ]);
  });
});
