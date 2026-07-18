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
  hours: string;
};

export type TourDepartureSchedule = Record<TourWeekdayKey, TourDepartureDay>;

const departureTimePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
const departureRangePattern = /^(\d{1,2}):(\d{2})\s*[-–—]\s*(\d{1,2}):(\d{2})$/;
const minutesPerDay = 24 * 60;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const formatMinutes = (minutes: number, preserveEndOfDay = false) => {
  if (preserveEndOfDay && minutes === minutesPerDay) return '24:00';
  const normalized =
    ((minutes % minutesPerDay) + minutesPerDay) % minutesPerDay;
  return `${String(Math.floor(normalized / 60)).padStart(2, '0')}:${String(
    normalized % 60,
  ).padStart(2, '0')}`;
};

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

const parseTourDepartureRange = (value: string) => {
  const match = value.trim().match(departureRangePattern);
  if (!match) return null;

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
    return null;
  }

  const start = startHour * 60 + startMinute;
  let end = endHour * 60 + endMinute;
  if (start === 0 && end === 0) {
    end = minutesPerDay;
  } else if (end <= start) {
    return null;
  }

  return {
    start,
    end,
    normalized: `${String(startHour).padStart(2, '0')}:${match[2]} - ${String(
      endHour,
    ).padStart(2, '0')}:${match[4]}`,
  };
};

const departureHoursFromLegacyTimes = (value: unknown) => {
  const minuteValues = normalizeTourDepartureTimes(value)
    .map((time) => {
      const [hour = 0, minute = 0] = time.split(':').map(Number);
      return hour * 60 + minute;
    })
    .sort((first, second) => first - second);
  if (!minuteValues.length) return '';

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
    .map(
      ({ start, end }) =>
        `${formatMinutes(start)} - ${formatMinutes(end, true)}`,
    )
    .join(', ');
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
  const fallbackHours = departureHoursFromLegacyTimes(fallbackTimes);
  const hasSchedule = hasTourDepartureSchedule(value);
  const scheduleRecord = hasSchedule ? value : {};

  return Object.fromEntries(
    TOUR_WEEKDAY_KEYS.map((weekday) => {
      const rawDay = isRecord(scheduleRecord[weekday])
        ? scheduleRecord[weekday]
        : null;
      const isOff = rawDay ? rawDay.isOff === true : !fallbackHours;
      const rawHours =
        rawDay && typeof rawDay.hours === 'string' ? rawDay.hours : '';
      const hours =
        rawHours || (rawDay ? departureHoursFromLegacyTimes(rawDay.times) : '');

      return [weekday, { isOff, hours: isOff ? '' : hours || fallbackHours }];
    }),
  ) as TourDepartureSchedule;
};

const departureTimesFromHours = (hours: string) => {
  const times = new Set<string>();
  hours
    .split(',')
    .map(parseTourDepartureRange)
    .forEach((range) => {
      if (!range) return;
      for (let minutes = range.start; minutes < range.end; minutes += 60) {
        times.add(formatMinutes(minutes));
      }
    });

  return Array.from(times).sort();
};

export const collectTourDepartureTimes = (schedule: TourDepartureSchedule) =>
  Array.from(
    new Set(
      TOUR_WEEKDAY_KEYS.flatMap((weekday) => {
        const day = schedule[weekday];
        return day.isOff ? [] : departureTimesFromHours(day.hours);
      }),
    ),
  ).sort();

export const tourDepartureScheduleError = (schedule: TourDepartureSchedule) => {
  const activeDays = TOUR_WEEKDAY_KEYS.filter(
    (weekday) => !schedule[weekday].isOff,
  );
  if (!activeDays.length) return 'Tour must have at least one departure day.';

  for (const weekday of activeDays) {
    const slots = schedule[weekday].hours.split(',').map((slot) => slot.trim());
    const intervals: Array<{ start: number; end: number }> = [];
    for (const slot of slots) {
      const range = parseTourDepartureRange(slot);
      if (!range) {
        return `${weekday} has an invalid departure time range.`;
      }
      if (
        intervals.some(
          (current) =>
            Math.max(current.start, range.start) <
            Math.min(current.end, range.end),
        )
      ) {
        return `${weekday} has overlapping departure time ranges.`;
      }
      intervals.push(range);
    }
  }

  return '';
};

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
      allowedTimes: day.isOff ? [] : departureTimesFromHours(day.hours),
    };
  }

  return {
    configured: legacyTimes.length > 0,
    weekday,
    time,
    allowedTimes: legacyTimes,
  };
};
