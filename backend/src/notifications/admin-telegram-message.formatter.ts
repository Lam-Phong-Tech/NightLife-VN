type MaybeDate = Date | string | null | undefined;

export type BookingTelegramMessageInput = {
  storeName?: string | null;
  customerName?: string | null;
  contact?: string | null;
  scheduledAt?: MaybeDate;
  partySize?: number | null;
  castName?: string | null;
  note?: string | null;
  status?: string | null;
  reason?: string | null;
  timeZone?: string;
};

export type BillTelegramMessageInput = {
  title: string;
  storeName?: string | null;
  customerName?: string | null;
  total?: string | null;
  bookingId?: string | null;
  couponName?: string | null;
  submittedAt?: MaybeDate;
  reviewedAt?: MaybeDate;
  rejectReason?: string | null;
  timeZone?: string;
};

export type PartnerTelegramMessageInput = {
  businessName?: string | null;
  businessType?: string | null;
  area?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  submittedAt?: MaybeDate;
  note?: string | null;
  timeZone?: string;
};

const fallbackText = 'Chưa cập nhật';

export function formatBookingRequestTelegramMessage(
  input: BookingTelegramMessageInput,
) {
  return compactLines([
    '🔔 Yêu cầu đặt bàn mới',
    '',
    `🏪 Quán: ${valueOrFallback(input.storeName)}`,
    `👤 Khách hàng: ${valueOrFallback(input.customerName)}`,
    `📞 Số điện thoại: ${valueOrFallback(input.contact)}`,
    `⏰ Thời gian: ${formatTelegramDateTime(input.scheduledAt, input.timeZone)}`,
    `👥 Số khách: ${formatPartySize(input.partySize)}`,
    input.castName ? `💃 Cast: ${input.castName}` : null,
    input.note ? `📝 Ghi chú: ${input.note}` : null,
  ]);
}

export function formatBookingCancelledTelegramMessage(
  input: BookingTelegramMessageInput,
) {
  return compactLines([
    '⚠️ Booking đã hủy',
    '',
    `🏪 Quán: ${valueOrFallback(input.storeName)}`,
    `👤 Khách hàng: ${valueOrFallback(input.customerName)}`,
    `📞 Số điện thoại: ${valueOrFallback(input.contact)}`,
    `⏰ Thời gian: ${formatTelegramDateTime(input.scheduledAt, input.timeZone)}`,
    `👥 Số khách: ${formatPartySize(input.partySize)}`,
    input.status ? `📌 Trạng thái: ${input.status}` : null,
    input.reason ? `📝 Lý do: ${input.reason}` : null,
  ]);
}

export function formatBillTelegramMessage(input: BillTelegramMessageInput) {
  return compactLines([
    `🧾 ${input.title}`,
    '',
    `🏪 Quán: ${valueOrFallback(input.storeName)}`,
    `👤 Khách hàng: ${valueOrFallback(input.customerName)}`,
    `💰 Tổng tiền: ${valueOrFallback(input.total)}`,
    input.bookingId ? `📅 Booking: ${input.bookingId}` : null,
    input.couponName ? `🎟 Coupon: ${input.couponName}` : null,
    input.submittedAt
      ? `⏰ Gửi lúc: ${formatTelegramDateTime(input.submittedAt, input.timeZone)}`
      : null,
    input.reviewedAt
      ? `✅ Review lúc: ${formatTelegramDateTime(input.reviewedAt, input.timeZone)}`
      : null,
    input.rejectReason ? `📝 Lý do từ chối: ${input.rejectReason}` : null,
  ]);
}

export function formatPartnerRequestTelegramMessage(
  input: PartnerTelegramMessageInput,
) {
  return compactLines([
    '🤝 Yêu cầu đối tác mới',
    '',
    `🏪 Quán / cơ sở: ${valueOrFallback(input.businessName)}`,
    input.businessType ? `🏷 Loại hình: ${input.businessType}` : null,
    input.area ? `📍 Khu vực: ${input.area}` : null,
    `👤 Liên hệ: ${valueOrFallback(input.contactName)}`,
    `📞 Số điện thoại: ${valueOrFallback(input.contactPhone)}`,
    input.contactEmail ? `✉️ Email: ${input.contactEmail}` : null,
    `⏰ Gửi lúc: ${formatTelegramDateTime(input.submittedAt, input.timeZone)}`,
    input.note ? `📝 Ghi chú: ${input.note}` : null,
  ]);
}

export function formatTelegramDateTime(
  value: MaybeDate,
  timeZone = 'Asia/Bangkok',
) {
  if (!value) {
    return fallbackText;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const parts = new Intl.DateTimeFormat('vi-VN', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour12: false,
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return `${get('hour')}:${get('minute')}:${get('second')} ${get('day')}/${get('month')}/${get('year')}`;
}

function formatPartySize(value?: number | null) {
  if (value === undefined || value === null) {
    return fallbackText;
  }

  return `${value} pax`;
}

function valueOrFallback(value?: string | number | null) {
  if (value === undefined || value === null || value === '') {
    return fallbackText;
  }

  return String(value);
}

function compactLines(lines: Array<string | null>) {
  return lines.filter((line): line is string => line !== null).join('\n');
}
