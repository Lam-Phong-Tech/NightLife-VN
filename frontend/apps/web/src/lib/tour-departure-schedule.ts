export const tourWeekdayKeys = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type TourWeekdayKey = (typeof tourWeekdayKeys)[number];

export type TourDepartureDay = {
  isOff: boolean;
  hours: string;
};

export type TourDepartureSchedule = Record<TourWeekdayKey, TourDepartureDay>;
export type TourDepartureScheduleErrors = Partial<Record<TourWeekdayKey, Record<number, string>>>;

export const tourWeekdayLabels: Record<TourWeekdayKey, string> = {
  monday: "Thứ 2",
  tuesday: "Thứ 3",
  wednesday: "Thứ 4",
  thursday: "Thứ 5",
  friday: "Thứ 6",
  saturday: "Thứ 7",
  sunday: "CN",
};

export const defaultTourDepartureSlot = "19:00 - 24:00";

const weekdayKeysByDateIndex: TourWeekdayKey[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
const timeRangePattern = /^(\d{1,2}):(\d{2})\s*[-–—]\s*(\d{1,2}):(\d{2})$/;
const minutesPerDay = 24 * 60;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const padHour = (value: number) => String(value).padStart(2, "0");

const formatMinutes = (minutes: number, preserveEndOfDay = false) => {
  if (preserveEndOfDay && minutes === minutesPerDay) return "24:00";
  const normalized = ((minutes % minutesPerDay) + minutesPerDay) % minutesPerDay;
  return `${padHour(Math.floor(normalized / 60))}:${String(normalized % 60).padStart(2, "0")}`;
};

export const normalizeTourDepartureTime = (value: unknown) => {
  if (typeof value !== "string") return "";

  const match = value.trim().match(timePattern);
  return match ? `${match[1]}:${match[2]}` : "";
};

export const normalizeTourDepartureTimes = (value: unknown) => {
  if (!Array.isArray(value)) return [];

  return Array.from(new Set(value.map(normalizeTourDepartureTime).filter(Boolean))).sort();
};

export const parseTourDepartureSlot = (slot: string) => {
  const value = slot.trim();
  const match = value.match(timeRangePattern);
  if (!match) {
    return {
      error: "Chọn đúng giờ bắt đầu và giờ kết thúc.",
      normalized: value,
      startMinutes: null,
      endMinutes: null,
    };
  }

  const startHour = Number(match[1]);
  const startMinute = Number(match[2]);
  const endHour = Number(match[3]);
  const endMinute = Number(match[4]);
  if (
    startHour > 23 ||
    startMinute > 59 ||
    endHour > 24 ||
    endMinute > 59 ||
    (endHour === 24 && endMinute > 0)
  ) {
    return {
      error: "Giờ kết thúc phải lớn hơn giờ bắt đầu và tối đa là 24:00.",
      normalized: value,
      startMinutes: null,
      endMinutes: null,
    };
  }

  const startMinutes = startHour * 60 + startMinute;
  let endMinutes = endHour * 60 + endMinute;
  if (startMinutes === 0 && endMinutes === 0) {
    endMinutes = minutesPerDay;
  } else if (endMinutes <= startMinutes) {
    return {
      error: "Giờ kết thúc phải lớn hơn giờ bắt đầu.",
      normalized: value,
      startMinutes,
      endMinutes,
    };
  }

  return {
    error: "",
    normalized: `${padHour(startHour)}:${match[2]} - ${padHour(endHour)}:${match[4]}`,
    startMinutes,
    endMinutes,
  };
};

export const splitTourDepartureSlot = (slot: string) => {
  const match = slot.trim().match(timeRangePattern);
  if (!match) return { start: "", end: "" };

  return {
    start: `${padHour(Number(match[1]))}:${match[2]}`,
    end: `${padHour(Number(match[3]))}:${match[4]}`,
  };
};

const departureHoursFromLegacyTimes = (value: unknown) => {
  const minuteValues = normalizeTourDepartureTimes(value)
    .map((time) => {
      const [hour, minute] = time.split(":").map(Number);
      return (hour ?? 0) * 60 + (minute ?? 0);
    })
    .sort((first, second) => first - second);
  if (!minuteValues.length) return "";

  const ranges: Array<{ start: number; end: number }> = [];
  minuteValues.forEach((minutes) => {
    const current = ranges[ranges.length - 1];
    const slotEnd = Math.min(minutes + 60, minutesPerDay);
    if (current && current.end === minutes) {
      current.end = slotEnd;
    } else {
      ranges.push({ start: minutes, end: slotEnd });
    }
  });

  return ranges
    .map(({ start, end }) => `${formatMinutes(start)} - ${formatMinutes(end, true)}`)
    .join(", ");
};

export const hasTourDepartureSchedule = (value: unknown) =>
  isRecord(value) && tourWeekdayKeys.some((weekday) => isRecord(value[weekday]));

export const createDefaultTourDepartureSchedule = (
  hours = defaultTourDepartureSlot,
): TourDepartureSchedule =>
  Object.fromEntries(
    tourWeekdayKeys.map((weekday) => [
      weekday,
      {
        isOff: !hours,
        hours,
      },
    ]),
  ) as TourDepartureSchedule;

export const normalizeTourDepartureSchedule = (
  value: unknown,
  fallbackTimes: unknown = [],
): TourDepartureSchedule => {
  const fallbackHours = departureHoursFromLegacyTimes(fallbackTimes);
  if (!hasTourDepartureSchedule(value)) {
    return createDefaultTourDepartureSchedule(fallbackHours);
  }

  return Object.fromEntries(
    tourWeekdayKeys.map((weekday) => {
      const rawDay = isRecord(value) && isRecord(value[weekday]) ? value[weekday] : null;
      const isOff = rawDay ? rawDay.isOff === true : true;
      const rawHours = rawDay && typeof rawDay.hours === "string" ? rawDay.hours : "";
      const hours = rawHours || (rawDay ? departureHoursFromLegacyTimes(rawDay.times) : "");

      return [weekday, { isOff, hours: isOff ? "" : hours }];
    }),
  ) as TourDepartureSchedule;
};

export const getTourDepartureScheduleErrors = (
  schedule: TourDepartureSchedule,
): TourDepartureScheduleErrors => {
  const errors: TourDepartureScheduleErrors = {};

  tourWeekdayKeys.forEach((weekday) => {
    const day = schedule[weekday];
    if (day.isOff) return;

    const slots = day.hours.split(",").map((slot) => slot.trim());
    const intervals: Array<{ start: number; end: number; index: number }> = [];
    slots.forEach((slot, index) => {
      if (!slot) {
        errors[weekday] = {
          ...(errors[weekday] ?? {}),
          [index]: "Ngày đang chạy cần có khung giờ.",
        };
        return;
      }

      const parsed = parseTourDepartureSlot(slot);
      if (parsed.error || parsed.startMinutes === null || parsed.endMinutes === null) {
        errors[weekday] = {
          ...(errors[weekday] ?? {}),
          [index]: parsed.error,
        };
        return;
      }
      intervals.push({
        start: parsed.startMinutes,
        end: parsed.endMinutes,
        index,
      });
    });

    intervals.forEach((first, firstIndex) => {
      intervals.slice(firstIndex + 1).forEach((second) => {
        if (Math.max(first.start, second.start) < Math.min(first.end, second.end)) {
          errors[weekday] = {
            ...(errors[weekday] ?? {}),
            [second.index]: "Khung giờ bị trùng lặp.",
          };
        }
      });
    });
  });

  return errors;
};

const departureTimesFromHours = (hours: string) => {
  const times = new Set<string>();
  hours
    .split(",")
    .map((slot) => parseTourDepartureSlot(slot))
    .forEach((slot) => {
      if (slot.error || slot.startMinutes === null || slot.endMinutes === null) return;
      for (let minutes = slot.startMinutes; minutes < slot.endMinutes; minutes += 60) {
        times.add(formatMinutes(minutes));
      }
    });

  return Array.from(times).sort();
};

export const collectTourDepartureTimes = (schedule: TourDepartureSchedule) =>
  Array.from(
    new Set(
      tourWeekdayKeys.flatMap((weekday) => {
        const day = schedule[weekday];
        return day.isOff ? [] : departureTimesFromHours(day.hours);
      }),
    ),
  ).sort();

export const tourDepartureTimesForDate = (
  scheduleValue: unknown,
  dateIso: string,
  fallbackTimes: unknown = [],
) => {
  if (!hasTourDepartureSchedule(scheduleValue)) {
    return normalizeTourDepartureTimes(fallbackTimes);
  }

  const date = new Date(`${dateIso}T12:00:00`);
  const weekday =
    weekdayKeysByDateIndex[Number.isFinite(date.getTime()) ? date.getDay() : 1] ?? "monday";
  const schedule = normalizeTourDepartureSchedule(scheduleValue);
  const day = schedule[weekday];

  return day.isOff ? [] : departureTimesFromHours(day.hours);
};

export const validateTourDepartureSchedule = (schedule: TourDepartureSchedule) => {
  const activeDays = tourWeekdayKeys.filter((weekday) => !schedule[weekday].isOff);
  if (activeDays.length === 0) {
    return "Tour cần có ít nhất một ngày khởi hành.";
  }

  const errors = getTourDepartureScheduleErrors(schedule);
  const firstErrorDay = tourWeekdayKeys.find((weekday) => errors[weekday]);
  if (firstErrorDay) {
    return `${tourWeekdayLabels[firstErrorDay]}: ${Object.values(errors[firstErrorDay]!)[0]}`;
  }

  return "";
};
