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
  times: string[];
};

export type TourDepartureSchedule = Record<TourWeekdayKey, TourDepartureDay>;

export const tourWeekdayLabels: Record<TourWeekdayKey, string> = {
  monday: "Thứ 2",
  tuesday: "Thứ 3",
  wednesday: "Thứ 4",
  thursday: "Thứ 5",
  friday: "Thứ 6",
  saturday: "Thứ 7",
  sunday: "CN",
};

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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

export const normalizeTourDepartureTime = (value: unknown) => {
  if (typeof value !== "string") return "";

  const match = value.trim().match(timePattern);
  return match ? `${match[1]}:${match[2]}` : "";
};

export const normalizeTourDepartureTimes = (value: unknown) => {
  if (!Array.isArray(value)) return [];

  return Array.from(new Set(value.map(normalizeTourDepartureTime).filter(Boolean))).sort();
};

export const hasTourDepartureSchedule = (value: unknown) =>
  isRecord(value) && tourWeekdayKeys.some((weekday) => isRecord(value[weekday]));

export const createDefaultTourDepartureSchedule = (
  times: string[] = ["19:00", "20:00", "21:00", "22:00"],
): TourDepartureSchedule =>
  Object.fromEntries(
    tourWeekdayKeys.map((weekday) => [
      weekday,
      {
        isOff: times.length === 0,
        times: normalizeTourDepartureTimes(times),
      },
    ]),
  ) as TourDepartureSchedule;

export const normalizeTourDepartureSchedule = (
  value: unknown,
  fallbackTimes: unknown = [],
): TourDepartureSchedule => {
  const fallback = normalizeTourDepartureTimes(fallbackTimes);
  if (!hasTourDepartureSchedule(value)) {
    return createDefaultTourDepartureSchedule(fallback);
  }

  return Object.fromEntries(
    tourWeekdayKeys.map((weekday) => {
      const rawDay = isRecord(value) && isRecord(value[weekday]) ? value[weekday] : null;
      const isOff = rawDay ? rawDay.isOff === true : true;
      const times = rawDay ? normalizeTourDepartureTimes(rawDay.times) : [];

      return [weekday, { isOff, times: isOff ? [] : times }];
    }),
  ) as TourDepartureSchedule;
};

export const collectTourDepartureTimes = (schedule: TourDepartureSchedule) =>
  Array.from(
    new Set(
      tourWeekdayKeys.flatMap((weekday) => {
        const day = schedule[weekday];
        return day.isOff ? [] : day.times;
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
  const weekday = weekdayKeysByDateIndex[
    Number.isFinite(date.getTime()) ? date.getDay() : 1
  ] ?? "monday";
  const schedule = normalizeTourDepartureSchedule(scheduleValue);
  const day = schedule[weekday];

  return day.isOff ? [] : day.times;
};

export const validateTourDepartureSchedule = (schedule: TourDepartureSchedule) => {
  const activeDays = tourWeekdayKeys.filter((weekday) => !schedule[weekday].isOff);
  if (activeDays.length === 0) {
    return "Tour cần có ít nhất một ngày khởi hành.";
  }

  const emptyDay = activeDays.find((weekday) => schedule[weekday].times.length === 0);
  if (emptyDay) {
    return `${tourWeekdayLabels[emptyDay]} đang chạy nhưng chưa có giờ khởi hành.`;
  }

  return "";
};
