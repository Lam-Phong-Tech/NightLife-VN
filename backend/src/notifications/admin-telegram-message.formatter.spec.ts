import {
  formatBookingCancelledTelegramMessage,
  formatBookingRequestTelegramMessage,
} from './admin-telegram-message.formatter';

describe('admin telegram message formatter', () => {
  it('formats booking requests like the Telegram admin sample', () => {
    expect(
      formatBookingRequestTelegramMessage({
        bookingCode: 'BK-000123',
        customerName: 'Nguyễn A',
        customerEmail: 'a@example.com',
        customerType: 'Guest',
        storeName: 'Store X',
        castName: 'Cast Y',
        scheduledAt: '2026-07-05T13:00:00.000Z',
        partySize: 4,
        note: 'Sinh nhật nhỏ',
        status: 'REQUESTED',
        timeZone: 'Asia/Bangkok',
      }),
    ).toBe(
      [
        '🆕 [BOOKING MỚI]',
        '',
        '🧾 Mã booking: BK-000123',
        '👤 Khách: Nguyễn A',
        '📧 Email: a@example.com',
        '🏷️ Loại khách: Guest',
        '🎟️ Mức giảm: 5%',
        '🏪 Quán: Store X',
        '👑 Cast mong muốn: Cast Y',
        '🗓️ Ngày giờ đến: 20:00 - 05/07/2026',
        '👥 Số người: 4',
        '💬 Ghi chú: Sinh nhật nhỏ',
        '🔳 QR: Đã cấp - Còn hiệu lực',
        '📌 Trạng thái booking: Mới',
        '⚠️ Lưu ý: Cast mong muốn chưa phải xác nhận giữ lịch cast. Admin cần điều phối offline với quán.',
      ].join('\n'),
    );
  });

  it('formats cancelled bookings with the same admin booking form', () => {
    expect(
      formatBookingCancelledTelegramMessage({
        bookingCode: 'BK-000999',
        customerName: 'Quang Hiệp Nguyễn',
        customerEmail: 'hiep@example.com',
        customerType: 'Member',
        discountLabel: '8%',
        storeName: 'Neon Club',
        castName: 'Không có',
        scheduledAt: '2026-07-09T14:00:00.000Z',
        partySize: 28,
        note: 'Khách đổi kế hoạch',
        status: 'CANCELLED',
        reason: 'Khách hủy từ app',
        timeZone: 'Asia/Bangkok',
      }),
    ).toBe(
      [
        '⚠️ [BOOKING ĐÃ HỦY]',
        '',
        '🧾 Mã booking: BK-000999',
        '👤 Khách: Quang Hiệp Nguyễn',
        '📧 Email: hiep@example.com',
        '🏷️ Loại khách: Member',
        '🎟️ Mức giảm: 8%',
        '🏪 Quán: Neon Club',
        '👑 Cast mong muốn: Không có',
        '🗓️ Ngày giờ đến: 21:00 - 09/07/2026',
        '👥 Số người: 28',
        '💬 Ghi chú: Khách đổi kế hoạch',
        '🔳 QR: Đã cấp - Còn hiệu lực',
        '📌 Trạng thái booking: Đã hủy',
        '📝 Lý do hủy: Khách hủy từ app',
        '⚠️ Lưu ý: Booking đã hủy. Admin kiểm tra lại điều phối và lịch quán/cast.',
      ].join('\n'),
    );
  });
});
