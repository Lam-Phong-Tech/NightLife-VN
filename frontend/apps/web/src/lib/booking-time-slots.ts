import type { StoreOpeningHour } from "@/lib/api/store-detail";

export const fallbackBookingTimeSlots = ["20:00", "21:00", "22:00", "23:00"];

const weekdayKeys = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

type WeekdayKey = (typeof weekdayKeys)[number];
export type OpeningHoursInput = Record<string, unknown> | null | undefined;
type BuildBookingTimeSlotsOptions = {
  fallback?: "default" | "empty";
};

type OpeningTimeRange = { openMinutes: number; closeMinutes: number };
type OpeningRanges = { status: "open"; ranges: OpeningTimeRange[] } | { status: "closed" };
export type BookingTimeSlotPeriod = "morning" | "evening";
export type BookingTimeSlotGroup = {
  key: BookingTimeSlotPeriod;
  label: string;
  slots: string[];
};

const minutesPerDay = 24 * 60;
const morningShiftStartMinutes = 8 * 60;
const eveningShiftStartMinutes = 14 * 60;
const maxEveningShiftSlotMinutes = minutesPerDay;
const bookingTimeSlotGroupLabels: Record<BookingTimeSlotPeriod, string> = {
  morning: "Sáng",
  evening: "Tối",
};

const emptyBookingTimeSlotGroups = (): BookingTimeSlotGroup[] => [
  { key: "morning", label: bookingTimeSlotGroupLabels.morning, slots: [] },
  { key: "evening", label: bookingTimeSlotGroupLabels.evening, slots: [] },
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const parseTimeToMinutes = (value: unknown) => {
  if (typeof value !== "string") return null;

  const match = value.trim().match(/^(\d{1,2})(?::(\d{2}))?/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2] ?? "0");

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  if (hours === 24) return minutes === 0 ? minutesPerDay : null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return hours * 60 + minutes;
};

const formatSlot = (minutes: number, options: { preserveEndOfDay?: boolean } = {}) => {
  if (options.preserveEndOfDay && minutes === minutesPerDay) return "24:00";

  const normalized = ((minutes % minutesPerDay) + minutesPerDay) % minutesPerDay;
  const hours = Math.floor(normalized / 60);
  const minute = normalized % 60;

  return `${String(hours).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const parseTimeRanges = (value: unknown): OpeningTimeRange[] => {
  if (typeof value !== "string") return [];

  const ranges: OpeningTimeRange[] = [];
  const matches = value.matchAll(/(\d{1,2})(?::(\d{2}))?\s*[^0-9:]+\s*(\d{1,2})(?::(\d{2}))?/g);

  Array.from(matches).forEach((match) => {
    const open = parseTimeToMinutes(`${match[1]}:${match[2] ?? "00"}`);
    const close = parseTimeToMinutes(`${match[3]}:${match[4] ?? "00"}`);

    if (open !== null && close !== null) {
      ranges.push({ openMinutes: open, closeMinutes: close });
    }
  });

  return ranges;
};

const formatTimeRanges = (ranges: OpeningTimeRange[]) =>
  ranges
    .map(
      (range) =>
        `${formatSlot(range.openMinutes)} - ${formatSlot(range.closeMinutes, {
          preserveEndOfDay: true,
        })}`,
    )
    .join(", ");

const normalizeWeekdayKey = (key: string): WeekdayKey | null => {
  const normalized = normalizeText(key);

  if (normalized === "cn" || normalized.includes("sunday") || normalized.includes("chu nhat")) {
    return "sunday";
  }

  if (normalized.includes("monday") || normalized === "mon") return "monday";
  if (normalized.includes("tuesday") || normalized === "tue") return "tuesday";
  if (normalized.includes("wednesday") || normalized === "wed") return "wednesday";
  if (normalized.includes("thursday") || normalized === "thu") return "thursday";
  if (normalized.includes("friday") || normalized === "fri") return "friday";
  if (normalized.includes("saturday") || normalized === "sat") return "saturday";

  const dayNumber = normalized.match(/[2-7]/)?.[0];
  if (dayNumber === "2") return "monday";
  if (dayNumber === "3") return "tuesday";
  if (dayNumber === "4") return "wednesday";
  if (dayNumber === "5") return "thursday";
  if (dayNumber === "6") return "friday";
  if (dayNumber === "7") return "saturday";

  return null;
};

const isClosedText = (value: unknown) => {
  if (typeof value !== "string") return false;
  const normalized = normalizeText(value);
  return normalized === "nghi" || normalized === "off" || normalized === "closed";
};

const normalizeOpeningSlot = (value: unknown): StoreOpeningHour | null => {
  if (typeof value === "string") {
    if (isClosedText(value)) return { closed: true };

    const ranges = parseTimeRanges(value);
    if (ranges.length === 1) {
      const range = ranges[0]!;
      return {
        open: formatSlot(range.openMinutes),
        close: formatSlot(range.closeMinutes, { preserveEndOfDay: true }),
      };
    }
    if (ranges.length > 1) return { note: formatTimeRanges(ranges) };

    return value.trim() ? { note: value.trim() } : null;
  }

  if (!isRecord(value)) return null;

  if (
    value.closed === true ||
    value.isOff === true ||
    isClosedText(value.hours) ||
    isClosedText(value.note)
  ) {
    return { closed: true };
  }

  const open = parseTimeToMinutes(value.open);
  const close = parseTimeToMinutes(value.close);
  if (open !== null && close !== null) {
    return { open: formatSlot(open), close: formatSlot(close, { preserveEndOfDay: true }) };
  }

  const ranges = parseTimeRanges(value.hours);
  const noteRanges = ranges.length ? ranges : parseTimeRanges(value.note);
  if (noteRanges.length === 1) {
    const range = noteRanges[0]!;
    return {
      open: formatSlot(range.openMinutes),
      close: formatSlot(range.closeMinutes, { preserveEndOfDay: true }),
    };
  }
  if (noteRanges.length > 1) return { note: formatTimeRanges(noteRanges) };

  if (typeof value.note === "string" && value.note.trim()) {
    return { note: value.note.trim() };
  }

  return null;
};

export const normalizeStoreOpeningHours = (
  openingHours: OpeningHoursInput,
): Record<string, StoreOpeningHour> | null => {
  if (!openingHours || !isRecord(openingHours)) return null;

  const normalized: Partial<Record<WeekdayKey, StoreOpeningHour>> = {};

  Object.entries(openingHours).forEach(([key, value]) => {
    const weekday = normalizeWeekdayKey(key);
    if (!weekday) return;

    const slot = normalizeOpeningSlot(value);
    if (slot) normalized[weekday] = slot;
  });

  return Object.keys(normalized).length ? (normalized as Record<string, StoreOpeningHour>) : null;
};

const dayKeyFromIsoDate = (dateIso: string) => {
  const date = new Date(`${dateIso}T12:00:00`);
  const day = Number.isFinite(date.getTime()) ? date.getDay() : new Date().getDay();

  return weekdayKeys[day] ?? "monday";
};

const rangesFromOpeningSlot = (slot?: StoreOpeningHour | null): OpeningTimeRange[] => {
  if (!slot || slot.closed) return [];

  const open = parseTimeToMinutes(slot.open);
  const close = parseTimeToMinutes(slot.close);
  if (open !== null && close !== null) {
    return [{ openMinutes: open, closeMinutes: close }];
  }

  return parseTimeRanges(slot.note);
};

const openingRangesForDate = (
  openingHours: OpeningHoursInput,
  dateIso: string,
): OpeningRanges | null => {
  if (!openingHours || !isRecord(openingHours)) return null;

  const normalizedHours = normalizeStoreOpeningHours(openingHours);
  const daySlot = normalizedHours?.[dayKeyFromIsoDate(dateIso)];

  if (daySlot) {
    if (daySlot.closed) return { status: "closed" };

    const ranges = rangesFromOpeningSlot(daySlot);
    if (ranges.length) return { status: "open", ranges };
  }

  const summaryRanges = parseTimeRanges(openingHours.summary);
  if (summaryRanges.length) return { status: "open", ranges: summaryRanges };

  return null;
};

const isSlotInRange = (slotMinutes: number, range: OpeningTimeRange) => {
  const crossesMidnight = range.closeMinutes <= range.openMinutes;
  let closeMinutes = range.closeMinutes;
  if (crossesMidnight) closeMinutes += minutesPerDay;

  const candidateMinutes =
    crossesMidnight && slotMinutes < range.openMinutes ? slotMinutes + minutesPerDay : slotMinutes;
  const lastSlot = closeMinutes - 60;

  return (
    candidateMinutes >= range.openMinutes &&
    candidateMinutes <= lastSlot &&
    (candidateMinutes - range.openMinutes) % 60 === 0
  );
};

const slotPeriodFromCandidateMinutes = (candidateMinutes: number): BookingTimeSlotPeriod | null => {
  if (
    candidateMinutes >= morningShiftStartMinutes &&
    candidateMinutes < eveningShiftStartMinutes
  ) {
    return "morning";
  }

  if (
    candidateMinutes >= eveningShiftStartMinutes &&
    candidateMinutes <= maxEveningShiftSlotMinutes
  ) {
    return "evening";
  }

  return null;
};

const slotPeriodFromDisplayTime = (slotMinutes: number): BookingTimeSlotPeriod | null => {
  const candidateMinutes = slotMinutes === 0 ? minutesPerDay : slotMinutes;
  return slotPeriodFromCandidateMinutes(candidateMinutes);
};

export const groupBookingTimeSlots = (timeSlots: string[]): BookingTimeSlotGroup[] => {
  const groups = emptyBookingTimeSlotGroups();

  timeSlots.forEach((time) => {
    const slotMinutes = parseTimeToMinutes(time);
    const period = slotMinutes !== null ? slotPeriodFromDisplayTime(slotMinutes) : null;
    if (!period) return;

    const group = groups.find((item) => item.key === period);
    if (group && !group.slots.includes(time)) {
      group.slots.push(time);
    }
  });

  return groups;
};

export const buildBookingTimeSlotGroups = (
  openingHours: OpeningHoursInput,
  dateIso: string,
  options: BuildBookingTimeSlotsOptions = {},
) => {
  const opening = openingRangesForDate(openingHours, dateIso);

  if (!opening) {
    return options.fallback === "empty"
      ? emptyBookingTimeSlotGroups()
      : groupBookingTimeSlots(fallbackBookingTimeSlots);
  }

  if (opening.status === "closed") return emptyBookingTimeSlotGroups();

  const groups = emptyBookingTimeSlotGroups();
  const seenSlots = new Set<string>();

  opening.ranges.forEach((range) => {
    let closeMinutes = range.closeMinutes;
    if (closeMinutes <= range.openMinutes) {
      closeMinutes += minutesPerDay;
    }

    const firstSlot = range.openMinutes;
    const lastSlot = closeMinutes - 60;
    if (firstSlot > lastSlot) return;

    for (let minutes = firstSlot; minutes <= lastSlot && seenSlots.size < 48; minutes += 60) {
      const period = slotPeriodFromCandidateMinutes(minutes);
      if (!period) continue;

      const slot = formatSlot(minutes);
      if (seenSlots.has(slot)) continue;

      const group = groups.find((item) => item.key === period);
      if (group) {
        group.slots.push(slot);
        seenSlots.add(slot);
      }
    }
  });

  return groups;
};

export const buildBookingTimeSlots = (
  openingHours: OpeningHoursInput,
  dateIso: string,
  options: BuildBookingTimeSlotsOptions = {},
) => buildBookingTimeSlotGroups(openingHours, dateIso, options).flatMap((group) => group.slots);

export const buildScheduledAtFromBookingSlot = (
  dateIso: string,
  time: string,
  openingHours?: OpeningHoursInput,
) => {
  const slotMinutes = parseTimeToMinutes(time);
  const [hours = "21", minutes = "00"] = time.split(":");
  const scheduledAt = new Date(
    `${dateIso}T${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00`,
  );

  if (slotMinutes === null) return scheduledAt.toISOString();

  const opening = openingRangesForDate(openingHours, dateIso);
  const belongsToNextDayOvernightSlot =
    opening?.status === "open" &&
    opening.ranges.some(
      (range) =>
        range.closeMinutes <= range.openMinutes &&
        slotMinutes < range.openMinutes &&
        isSlotInRange(slotMinutes, range),
    );

  if (belongsToNextDayOvernightSlot) {
    scheduledAt.setDate(scheduledAt.getDate() + 1);
  }

  return scheduledAt.toISOString();
};
