export const bookingDateTimeZone = "Asia/Ho_Chi_Minh";

const bookingDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: bookingDateTimeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const padDatePart = (value: number) => String(value).padStart(2, "0");

const getBookingDateParts = (date: Date) => {
  const parts = bookingDateFormatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  return { year, month, day };
};

export const toBookingDateInputValue = (date = new Date()) => {
  const { year, month, day } = getBookingDateParts(date);
  return `${year}-${padDatePart(month)}-${padDatePart(day)}`;
};

export const getTodayBookingDate = () => toBookingDateInputValue(new Date());

export const getBookingDateAfterDays = (days: number, from = new Date()) => {
  const { year, month, day } = getBookingDateParts(from);
  const nextDate = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0));

  return toBookingDateInputValue(nextDate);
};

export const parseBookingDateInput = (value: string) => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
};
