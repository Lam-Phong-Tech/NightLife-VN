export const TOUR_WEEKDAY_KEYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export type TourWeekdayKey = (typeof TOUR_WEEKDAY_KEYS)[number];

export type TourDepartureDay = {
  isOff: boolean;
  times: string[];
};

export type TourDepartureSchedule = Record<TourWeekdayKey, TourDepartureDay>;

const departureTimePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const normalizeTourDepartureTime = (value: unknown) => {
  if (typeof value !== 'string') return '';

  const match = value.trim().match(departureTimePattern);
  if (!match) return '';

  return `${match[1]}:${match[2]}`;
};

export const normalizeTourDepartureTimes = (value: unknown) => {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(value.map(normalizeTourDepartureTime).filter(Boolean)),
  ).sort();
};

export const hasTourDepartureSchedule = (
  value: unknown,
): value is Record<string, unknown> =>
  isRecord(value) &&
  TOUR_WEEKDAY_KEYS.some((weekday) => isRecord(value[weekday]));

export const normalizeTourDepartureSchedule = (
  value: unknown,
  fallbackTimes: unknown = [],
): TourDepartureSchedule => {
  const normalizedFallbackTimes = normalizeTourDepartureTimes(fallbackTimes);
  const hasSchedule = hasTourDepartureSchedule(value);
  const scheduleRecord = hasSchedule ? value : {};

  return Object.fromEntries(
    TOUR_WEEKDAY_KEYS.map((weekday) => {
      const rawDay = isRecord(scheduleRecord[weekday])
        ? scheduleRecord[weekday]
        : null;
      const isOff = rawDay
        ? rawDay.isOff === true
        : normalizedFallbackTimes.length === 0;
      const times = rawDay
        ? normalizeTourDepartureTimes(rawDay.times)
        : normalizedFallbackTimes;

      return [weekday, { isOff, times: isOff ? [] : times }];
    }),
  ) as TourDepartureSchedule;
};

export const collectTourDepartureTimes = (schedule: TourDepartureSchedule) =>
  Array.from(
    new Set(
      TOUR_WEEKDAY_KEYS.flatMap((weekday) => {
        const day = schedule[weekday];
        return day.isOff ? [] : day.times;
      }),
    ),
  ).sort();

const weekdayByEnglishLabel: Record<string, TourWeekdayKey> = {
  Monday: 'monday',
  Tuesday: 'tuesday',
  Wednesday: 'wednesday',
  Thursday: 'thursday',
  Friday: 'friday',
  Saturday: 'saturday',
  Sunday: 'sunday',
};

export const tourDepartureSlotForInstant = (input: {
  departureSchedule: unknown;
  departureTimes: unknown;
  scheduledAt: Date;
  timeZone?: string;
}) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: input.timeZone ?? 'Asia/Ho_Chi_Minh',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const parts = formatter.formatToParts(input.scheduledAt);
  const weekdayLabel = parts.find((part) => part.type === 'weekday')?.value;
  const weekday = weekdayLabel
    ? weekdayByEnglishLabel[weekdayLabel]
    : undefined;
  const hour = parts.find((part) => part.type === 'hour')?.value ?? '';
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '';
  const time = normalizeTourDepartureTime(`${hour}:${minute}`);
  const hasSchedule = hasTourDepartureSchedule(input.departureSchedule);
  const legacyTimes = normalizeTourDepartureTimes(input.departureTimes);

  if (hasSchedule && weekday) {
    const schedule = normalizeTourDepartureSchedule(input.departureSchedule);
    const day = schedule[weekday];
    return {
      configured: true,
      weekday,
      time,
      allowedTimes: day.isOff ? [] : day.times,
    };
  }

  return {
    configured: legacyTimes.length > 0,
    weekday,
    time,
    allowedTimes: legacyTimes,
  };
};
