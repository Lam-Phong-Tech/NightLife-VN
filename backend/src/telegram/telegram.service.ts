import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf, Markup } from 'telegraf';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly chatId: string;

  constructor(
    @InjectBot() private bot: Telegraf,
    private configService: ConfigService,
  ) {
    this.chatId = this.configService.get<string>('TELEGRAM_CHAT_ID') || this.configService.get<string>('TELEGRAM_OPS_CHAT_ID') || '';
  }

  async notifyNewBooking(booking: any) {
    if (!this.chatId) {
      this.logger.warn('TELEGRAM_CHAT_ID is not configured');
      return;
    }

    try {
      const storeName = booking.store?.name || 'Unknown Store';
      const customerName = booking.user?.displayName || booking.guest?.displayName || 'Unknown Customer';
      const phone = booking.user?.phone || booking.guest?.phone || 'No phone';
      const time = new Date(booking.scheduledAt).toLocaleString('vi-VN');
      const partySize = booking.partySize;

      const message = `🔔 *Yêu cầu đặt bàn mới*\n\n` +
        `🏪 *Quán:* ${storeName}\n` +
        `👤 *Khách hàng:* ${customerName}\n` +
        `📞 *Số điện thoại:* ${phone}\n` +
        `⏰ *Thời gian:* ${time}\n` +
        `👥 *Số lượng khách:* ${partySize} người\n\n` +
        `Vui lòng xác nhận yêu cầu đặt bàn này.`;

      await this.bot.telegram.sendMessage(this.chatId, message, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          Markup.button.callback('✅ Xác nhận', `accept_booking_${booking.id}`),
        ]),
      });
      this.logger.log(`Booking ${booking.id} notification sent to Telegram.`);
    } catch (error) {
      this.logger.error(`Failed to send Telegram notification: ${(error as any).message}`, (error as any).stack);
    }
  }
}
