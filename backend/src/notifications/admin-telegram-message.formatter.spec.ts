import { formatBookingRequestTelegramMessage } from './admin-telegram-message.formatter';

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
        '[BOOKING MỚI]',
        'Mã booking: BK-000123',
        'Khách: Nguyễn A',
        'Email: a@example.com',
        'Loại khách: Guest',
        'Mức giảm: 5%',
        'Quán: Store X',
        'Cast mong muốn: Cast Y',
        'Ngày giờ đến: 20:00 - 05/07/2026',
        'Số người: 4',
        'Ghi chú: Sinh nhật nhỏ',
        'QR: Đã cấp - Còn hiệu lực',
        'Trạng thái booking: Mới',
        'Lưu ý: Cast mong muốn chưa phải xác nhận giữ lịch cast. Admin cần điều phối offline với quán.',
      ].join('\n'),
    );
  });
});
