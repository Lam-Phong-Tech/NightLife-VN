import {
  validateBookingDate,
  validateBookingDisplayName,
  validateBookingEmail,
  validateBookingGuestCount,
  validateBookingNote,
  validateBookingTime,
} from "@/lib/booking-validation";

export const bookingValidationFieldKeys = [
  "guestName",
  "email",
  "guestCount",
  "bookingDate",
  "bookingTime",
  "note",
] as const;

export type BookingValidationField = (typeof bookingValidationFieldKeys)[number];
export type BookingFieldErrors = Partial<Record<BookingValidationField, string>>;
export type BookingTouchedFields = Partial<Record<BookingValidationField, boolean>>;

type BuildBookingFieldErrorsInput = {
  availableTimes: string[];
  bookingDate: string;
  bookingTime: string;
  displayName: string;
  email: string;
  guestCount: number;
  loadingTimes?: boolean;
  maxDate: string;
  note: string;
  scheduledAt: string;
  todayDate: string;
};

export const touchAllBookingFields = (): BookingTouchedFields =>
  Object.fromEntries(bookingValidationFieldKeys.map((field) => [field, true])) as BookingTouchedFields;

export const firstBookingFieldError = (errors: BookingFieldErrors) =>
  bookingValidationFieldKeys.map((field) => errors[field]).find(Boolean) ?? "";

export const firstBookingFieldErrorKey = (errors: BookingFieldErrors) =>
  bookingValidationFieldKeys.find((field) => Boolean(errors[field])) ?? null;

export function buildBookingFieldErrors({
  availableTimes,
  bookingDate,
  bookingTime,
  displayName,
  email,
  guestCount,
  loadingTimes = false,
  maxDate,
  note,
  scheduledAt,
  todayDate,
}: BuildBookingFieldErrorsInput): BookingFieldErrors {
  const timeError = loadingTimes
    ? "Đang tải khung giờ của quán. Vui lòng thử lại sau vài giây."
    : !availableTimes.length
      ? "Quán không có khung giờ đặt bàn trong ngày này."
      : validateBookingTime({ availableTimes, bookingTime, scheduledAt });

  return {
    guestName: validateBookingDisplayName(displayName),
    email: validateBookingEmail(email),
    guestCount: validateBookingGuestCount(guestCount),
    bookingDate: validateBookingDate({ bookingDate, maxDate, todayDate }),
    bookingTime: timeError,
    note: validateBookingNote(note),
  };
}

export const visibleBookingFieldErrors = (
  errors: BookingFieldErrors,
  touchedFields: BookingTouchedFields,
  submitted: boolean,
): BookingFieldErrors =>
  Object.fromEntries(
    bookingValidationFieldKeys.map((field) => [
      field,
      submitted || touchedFields[field] ? errors[field] ?? "" : "",
    ]),
  ) as BookingFieldErrors;
