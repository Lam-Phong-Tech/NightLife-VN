import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf, Markup } from 'telegraf';
import { formatBookingRequestTelegramMessage } from '../notifications/admin-telegram-message.formatter';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly chatId: string;

  constructor(
    @InjectBot() private bot: Telegraf,
    private configService: ConfigService,
  ) {
    this.chatId =
      this.configService.get<string>('TELEGRAM_CHAT_ID') ||
      this.configService.get<string>('TELEGRAM_OPS_CHAT_ID') ||
      '';
  }

  async notifyNewBooking(booking: any) {
    if (!this.chatId) {
      this.logger.warn('TELEGRAM_CHAT_ID is not configured');
      return;
    }

    try {
      const message = formatBookingRequestTelegramMessage({
        storeName: booking.store?.name,
        customerName: booking.user?.displayName ?? booking.guest?.displayName,
        contact: booking.user?.phone ?? booking.guest?.phone,
        scheduledAt: booking.scheduledAt,
        partySize: booking.partySize,
        castName: booking.cast?.publicAlias ?? booking.cast?.stageName ?? null,
        note: booking.note,
        timeZone:
          this.configService.get<string>('TELEGRAM_NOTIFICATION_TIME_ZONE') ??
          'Asia/Bangkok',
      });

      await this.bot.telegram.sendMessage(this.chatId, message, {
        ...Markup.inlineKeyboard([
          Markup.button.callback('✅ Xác nhận', `accept_booking_${booking.id}`),
        ]),
      });
      this.logger.log(`Booking ${booking.id} notification sent to Telegram.`);
    } catch (error) {
      this.logger.error(
        `Failed to send Telegram notification: ${(error as any).message}`,
        (error as any).stack,
      );
    }
  }
}
