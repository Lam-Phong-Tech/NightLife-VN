export const bookingValidationLimits = {
  bookingDateWindowDays: 14,
  maxEmailLength: 254,
  maxGuests: 50,
  maxNameLength: 80,
  maxNoteLength: 300,
  minNameLength: 2,
} as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const emailDomainLabelPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
const displayNamePattern = /^[\p{L}\s]+$/u;
const dateInputPattern = /^\d{4}-\d{2}-\d{2}$/;

export const normalizeBookingDisplayName = (value: string) =>
  value.trim().replace(/\s+/g, " ");

export const sanitizeBookingDisplayNameInput = (value: string) =>
  value.replace(/[^\p{L}\s]/gu, "").replace(/\s{2,}/g, " ");

export const normalizeBookingEmail = (value: string) => value.trim().toLowerCase();

export const normalizeBookingNote = (value: string) => value.trim();

export function validateBookingDisplayName(value: string) {
  if (!value) {
    return "Vui lòng nhập họ tên.";
  }

  if (value.length < bookingValidationLimits.minNameLength) {
    return `Vui lòng nhập họ tên từ ${bookingValidationLimits.minNameLength} ký tự.`;
  }

  if (value.length > bookingValidationLimits.maxNameLength) {
    return `Họ tên tối đa ${bookingValidationLimits.maxNameLength} ký tự.`;
  }

  if (!displayNamePattern.test(value)) {
    return "Họ tên chỉ được nhập chữ cái và khoảng trắng.";
  }

  return "";
}

export function validateBookingEmail(value: string) {
  if (!value) {
    return "Vui lòng nhập email.";
  }

  if (value.length > bookingValidationLimits.maxEmailLength) {
    return `Email tối đa ${bookingValidationLimits.maxEmailLength} ký tự.`;
  }

  const atParts = value.split("@");
  if (atParts.length !== 2) {
    return "Email chưa đúng định dạng.";
  }

  const [localPart, domainPart] = atParts;

  if (!localPart) {
    return "Phần trước dấu @ không được để trống.";
  }

  if (localPart.length > 64) {
    return "Phần trước dấu @ không được vượt quá 64 ký tự.";
  }

  if (!domainPart) {
    return "Phần sau dấu @ không được để trống.";
  }

  if (domainPart.length > 253) {
    return "Phần sau dấu @ không được vượt quá 253 ký tự.";
  }

  const domainLabels = domainPart.split(".");

  if (domainLabels.length < 2 || domainLabels.some((label) => !label)) {
    return "Phần sau dấu @ phải là tên miền hợp lệ, ví dụ gmail.com.";
  }

  if (domainLabels.some((label) => label.length > 63)) {
    return "Mỗi phần của tên miền sau dấu @ không được vượt quá 63 ký tự.";
  }

  if (!domainLabels.every((label) => emailDomainLabelPattern.test(label))) {
    return "Tên miền sau dấu @ chỉ được gồm chữ, số, dấu gạch ngang và không bắt đầu/kết thúc bằng dấu gạch ngang.";
  }

  if (!emailPattern.test(value)) {
    return "Email chưa đúng định dạng.";
  }

  return "";
}

export function validateBookingGuestCount(guestCount: number) {
  if (
    !Number.isInteger(guestCount) ||
    guestCount < 1 ||
    guestCount > bookingValidationLimits.maxGuests
  ) {
    return `Số người chỉ được từ 1 đến ${bookingValidationLimits.maxGuests}.`;
  }

  return "";
}

export function validateBookingDate({
  bookingDate,
  maxDate,
  todayDate,
}: {
  bookingDate: string;
  maxDate: string;
  todayDate: string;
}) {
  if (
    !dateInputPattern.test(bookingDate) ||
    Number.isNaN(new Date(`${bookingDate}T00:00:00`).getTime())
  ) {
    return "Ngày đặt bàn không hợp lệ.";
  }

  if (bookingDate < todayDate || bookingDate > maxDate) {
    return `Ngày đặt bàn chỉ được chọn từ hôm nay đến ${bookingValidationLimits.bookingDateWindowDays} ngày tới.`;
  }

  return "";
}

export function validateBookingTime({
  availableTimes,
  bookingTime,
  scheduledAt,
}: {
  availableTimes: string[];
  bookingTime: string;
  scheduledAt: string;
}) {
  if (!bookingTime) {
    return "Vui lòng chọn khung giờ.";
  }

  if (!availableTimes.includes(bookingTime)) {
    return "Khung giờ đã chọn không còn khả dụng.";
  }

  const scheduledDate = new Date(scheduledAt);
  if (Number.isNaN(scheduledDate.getTime())) {
    return "Khung giờ đặt chỗ không hợp lệ.";
  }

  if (scheduledDate.getTime() <= Date.now()) {
    return "Khung giờ đặt chỗ phải ở tương lai.";
  }

  return "";
}

export function validateBookingNote(note: string) {
  if (note.length > bookingValidationLimits.maxNoteLength) {
    return `Ghi chú tối đa ${bookingValidationLimits.maxNoteLength} ký tự.`;
  }

  return "";
}

export function validateBookingFormFields({
  availableTimes,
  bookingDate,
  bookingTime,
  displayName,
  email,
  guestCount,
  maxDate,
  note,
  scheduledAt,
  todayDate,
}: {
  availableTimes: string[];
  bookingDate: string;
  bookingTime: string;
  displayName: string;
  email: string;
  guestCount: number;
  maxDate: string;
  note: string;
  scheduledAt: string;
  todayDate: string;
}) {
  return (
    validateBookingDisplayName(displayName) ||
    validateBookingEmail(email) ||
    validateBookingGuestCount(guestCount) ||
    validateBookingDate({ bookingDate, maxDate, todayDate }) ||
    validateBookingTime({ availableTimes, bookingTime, scheduledAt }) ||
    validateBookingNote(note)
  );
}
