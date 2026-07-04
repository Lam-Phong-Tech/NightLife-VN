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
];

type OpeningHoursInput = Record<string, StoreOpeningHour | string> | null | undefined;

type OpeningRange =
  | { status: "open"; openMinutes: number; closeMinutes: number }
  | { status: "closed" };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

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
    /(\d{1,2})(?::(\d{2}))?\s*(?:-|to|den)\s*(\d{1,2})(?::(\d{2}))?/i,
  );

  if (!match) return null;

  const open = parseTimeToMinutes(`${match[1]}:${match[2] ?? "00"}`);
  const close = parseTimeToMinutes(`${match[3]}:${match[4] ?? "00"}`);

  if (open === null || close === null) return null;
  return { openMinutes: open, closeMinutes: close };
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

  const daySlot = openingHours[dayKeyFromIsoDate(dateIso)];

  if (isRecord(daySlot)) {
    if (daySlot.closed === true) return { status: "closed" };

    const open = parseTimeToMinutes(daySlot.open);
    const close = parseTimeToMinutes(daySlot.close);

    if (open !== null && close !== null) {
      return { status: "open", openMinutes: open, closeMinutes: close };
    }

    const noteRange = parseTimeRange(daySlot.note);
    if (noteRange) return { status: "open", ...noteRange };
  }

  if (typeof daySlot === "string") {
    const textRange = parseTimeRange(daySlot);
    if (textRange) return { status: "open", ...textRange };
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
