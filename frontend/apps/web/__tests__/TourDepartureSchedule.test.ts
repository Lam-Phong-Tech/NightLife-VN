import { describe, expect, it } from "vitest";
import {
  collectTourDepartureTimes,
  normalizeTourDepartureSchedule,
  tourDepartureTimesForDate,
  validateTourDepartureSchedule,
} from "@/lib/tour-departure-schedule";

describe("tour departure schedule", () => {
  it("uses legacy times for every day when a schedule has not been saved yet", () => {
    const schedule = normalizeTourDepartureSchedule(null, ["20:30", "19:00", "20:30"]);

    expect(schedule.monday).toEqual({
      isOff: false,
      hours: "19:00 - 20:00, 20:30 - 21:30",
    });
    expect(schedule.sunday).toEqual(schedule.monday);
    expect(collectTourDepartureTimes(schedule)).toEqual(["19:00", "20:30"]);
  });

  it("returns times for the selected date and none for an off day", () => {
    const schedule = normalizeTourDepartureSchedule({
      monday: { isOff: false, hours: "19:00 - 22:00" },
      tuesday: { isOff: true, hours: "" },
      wednesday: { isOff: true, hours: "" },
      thursday: { isOff: true, hours: "" },
      friday: { isOff: true, hours: "" },
      saturday: { isOff: true, hours: "" },
      sunday: { isOff: false, hours: "18:00 - 20:00" },
    });

    expect(tourDepartureTimesForDate(schedule, "2026-07-20")).toEqual(["19:00", "20:00", "21:00"]);
    expect(tourDepartureTimesForDate(schedule, "2026-07-21")).toEqual([]);
    expect(tourDepartureTimesForDate(schedule, "2026-07-26")).toEqual(["18:00", "19:00"]);
  });

  it("validates that active ranges do not overlap", () => {
    const schedule = normalizeTourDepartureSchedule({
      monday: { isOff: false, hours: "19:00 - 22:00, 21:00 - 24:00" },
      tuesday: { isOff: true, hours: "" },
      wednesday: { isOff: true, hours: "" },
      thursday: { isOff: true, hours: "" },
      friday: { isOff: true, hours: "" },
      saturday: { isOff: true, hours: "" },
      sunday: { isOff: true, hours: "" },
    });

    expect(validateTourDepartureSchedule(schedule)).toBe("Thứ 2: Khung giờ bị trùng lặp.");
  });

  it("keeps reading the previously deployed discrete-time schedule", () => {
    const schedule = normalizeTourDepartureSchedule({
      monday: { isOff: false, times: ["19:00", "20:00", "21:00"] },
    });

    expect(schedule.monday.hours).toBe("19:00 - 22:00");
  });
});
