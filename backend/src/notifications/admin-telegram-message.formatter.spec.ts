import { formatBookingRequestTelegramMessage } from './admin-telegram-message.formatter';

describe('admin telegram message formatter', () => {
  it('formats booking requests like the Telegram admin sample', () => {
    expect(
      formatBookingRequestTelegramMessage({
        storeName: 'ネオン・クラブ — Neon Club',
        customerName: 'hiep',
        contact: '0868786867',
        scheduledAt: '2026-06-30T14:00:00.000Z',
        partySize: 4,
        timeZone: 'Asia/Bangkok',
      }),
    ).toBe(
      [
        '🔔 Yêu cầu đặt bàn mới',
        '',
        '🏪 Quán: ネオン・クラブ — Neon Club',
        '👤 Khách hàng: hiep',
        '📞 Số điện thoại: 0868786867',
        '⏰ Thời gian: 21:00:00 30/6/2026',
        '👥 Số khách: 4 pax',
        '',
        'Vui lòng kiểm tra yêu cầu này trong Admin.',
      ].join('\n'),
    );
  });
});
