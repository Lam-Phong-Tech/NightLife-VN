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
type OpeningHoursInput = Record<string, unknown> | null | undefined;

type OpeningRange =
  | { status: "open"; openMinutes: number; closeMinutes: number }
  | { status: "closed" };

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
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return hours * 60 + minutes;
};

const formatSlot = (minutes: number) => {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minute = normalized % 60;

  return `${String(hours).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const parseTimeRange = (value: unknown) => {
  if (typeof value !== "string") return null;

  const match = value.match(
    /(\d{1,2})(?::(\d{2}))?\s*[^0-9:]+\s*(\d{1,2})(?::(\d{2}))?/,
  );

  if (!match) return null;

  const open = parseTimeToMinutes(`${match[1]}:${match[2] ?? "00"}`);
  const close = parseTimeToMinutes(`${match[3]}:${match[4] ?? "00"}`);

  if (open === null || close === null) return null;
  return { openMinutes: open, closeMinutes: close };
};

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

    const range = parseTimeRange(value);
    if (range) {
      return {
        open: formatSlot(range.openMinutes),
        close: formatSlot(range.closeMinutes),
      };
    }

    return value.trim() ? { note: value.trim() } : null;
  }

  if (!isRecord(value)) return null;

  if (value.closed === true || value.isOff === true || isClosedText(value.hours) || isClosedText(value.note)) {
    return { closed: true };
  }

  const open = parseTimeToMinutes(value.open);
  const close = parseTimeToMinutes(value.close);
  if (open !== null && close !== null) {
    return { open: formatSlot(open), close: formatSlot(close) };
  }

  const range = parseTimeRange(value.hours) ?? parseTimeRange(value.note);
  if (range) {
    return {
      open: formatSlot(range.openMinutes),
      close: formatSlot(range.closeMinutes),
    };
  }

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

  return Object.keys(normalized).length
    ? (normalized as Record<string, StoreOpeningHour>)
    : null;
};

const dayKeyFromIsoDate = (dateIso: string) => {
  const date = new Date(`${dateIso}T12:00:00`);
  const day = Number.isFinite(date.getTime()) ? date.getDay() : new Date().getDay();

  return weekdayKeys[day] ?? "monday";
};

const openingRangeForDate = (
  openingHours: OpeningHoursInput,
  dateIso: string,
): OpeningRange | null => {
  if (!openingHours || !isRecord(openingHours)) return null;

  const normalizedHours = normalizeStoreOpeningHours(openingHours);
  const daySlot = normalizedHours?.[dayKeyFromIsoDate(dateIso)];

  if (daySlot) {
    if (daySlot.closed) return { status: "closed" };

    const open = parseTimeToMinutes(daySlot.open);
    const close = parseTimeToMinutes(daySlot.close);

    if (open !== null && close !== null) {
      return { status: "open", openMinutes: open, closeMinutes: close };
    }

    const noteRange = parseTimeRange(daySlot.note);
    if (noteRange) return { status: "open", ...noteRange };
  }

  const summaryRange = parseTimeRange(openingHours.summary);
  if (summaryRange) return { status: "open", ...summaryRange };

  return null;
};

export const buildBookingTimeSlots = (openingHours: OpeningHoursInput, dateIso: string) => {
  const range = openingRangeForDate(openingHours, dateIso);

  if (!range) return fallbackBookingTimeSlots;
  if (range.status === "closed") return [];

  let closeMinutes = range.closeMinutes;
  if (closeMinutes <= range.openMinutes) {
    closeMinutes += 1440;
  }

  const firstSlot = range.openMinutes + 60;
  const lastSlot = closeMinutes - 60;

  if (firstSlot > lastSlot) return [];

  const slots: string[] = [];

  for (let minutes = firstSlot; minutes <= lastSlot; minutes += 60) {
    slots.push(formatSlot(minutes));
  }

  return slots;
};

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

  const range = openingRangeForDate(openingHours, dateIso);
  const crossesMidnight =
    range?.status === "open" && range.closeMinutes <= range.openMinutes;

  if (crossesMidnight && slotMinutes < range.openMinutes) {
    scheduledAt.setDate(scheduledAt.getDate() + 1);
  }

  return scheduledAt.toISOString();
};
