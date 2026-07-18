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
      times: ["19:00", "20:30"],
    });
    expect(schedule.sunday).toEqual(schedule.monday);
    expect(collectTourDepartureTimes(schedule)).toEqual(["19:00", "20:30"]);
  });

  it("returns times for the selected date and none for an off day", () => {
    const schedule = normalizeTourDepartureSchedule({
      monday: { isOff: false, times: ["19:00", "20:30"] },
      tuesday: { isOff: true, times: [] },
      wednesday: { isOff: true, times: [] },
      thursday: { isOff: true, times: [] },
      friday: { isOff: true, times: [] },
      saturday: { isOff: true, times: [] },
      sunday: { isOff: false, times: ["18:00"] },
    });

    expect(tourDepartureTimesForDate(schedule, "2026-07-20")).toEqual(["19:00", "20:30"]);
    expect(tourDepartureTimesForDate(schedule, "2026-07-21")).toEqual([]);
    expect(tourDepartureTimesForDate(schedule, "2026-07-26")).toEqual(["18:00"]);
  });

  it("validates that an active day has at least one departure time", () => {
    const schedule = normalizeTourDepartureSchedule({
      monday: { isOff: false, times: [] },
      tuesday: { isOff: true, times: [] },
      wednesday: { isOff: true, times: [] },
      thursday: { isOff: true, times: [] },
      friday: { isOff: true, times: [] },
      saturday: { isOff: true, times: [] },
      sunday: { isOff: true, times: [] },
    });

    expect(validateTourDepartureSchedule(schedule)).toBe(
      "Thứ 2 đang chạy nhưng chưa có giờ khởi hành.",
    );
  });
});
