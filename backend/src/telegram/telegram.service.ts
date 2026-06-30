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

      const message = `🔔 *New Booking Request*\n\n` +
        `🏪 *Store:* ${storeName}\n` +
        `👤 *Customer:* ${customerName}\n` +
        `📞 *Phone:* ${phone}\n` +
        `⏰ *Time:* ${time}\n` +
        `👥 *Party Size:* ${partySize} pax\n\n` +
        `Please accept or reject this booking.`;

      await this.bot.telegram.sendMessage(this.chatId, message, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          Markup.button.callback('✅ Accept', `accept_booking_${booking.id}`),
        ]),
      });
      this.logger.log(`Booking ${booking.id} notification sent to Telegram.`);
    } catch (error) {
      this.logger.error(`Failed to send Telegram notification: ${(error as any).message}`, (error as any).stack);
    }
  }
}
