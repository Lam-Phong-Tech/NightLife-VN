import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { formatBookingRequestTelegramMessage } from '../notifications/admin-telegram-message.formatter';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly chatId: string;

  constructor(
    @InjectBot() private bot: Telegraf,
    private configService: ConfigService,
    private readonly prisma: PrismaService,
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
      const bookingSequenceCode = await this.bookingSequenceCode(booking);
      const message = formatBookingRequestTelegramMessage({
        bookingSequenceCode,
        bookingCode: booking.bookingCode,
        storeName: booking.store?.name,
        customerName: booking.user?.displayName ?? booking.guest?.displayName,
        customerEmail: booking.guest?.email ?? booking.user?.email,
        customerType: booking.user
          ? booking.user?.tier === 'VIP'
            ? 'VIP'
            : 'Member'
          : 'Guest',
        contact: booking.user?.phone ?? booking.guest?.phone,
        scheduledAt: booking.scheduledAt,
        partySize: booking.partySize,
        castName: booking.cast?.publicAlias ?? booking.cast?.stageName ?? null,
        note: booking.note,
        status: booking.status,
        timeZone:
          this.configService.get<string>('TELEGRAM_NOTIFICATION_TIME_ZONE') ??
          'Asia/Bangkok',
      });

      await this.bot.telegram.sendMessage(this.chatId, message);
      this.logger.log(`Booking ${booking.id} notification sent to Telegram.`);
    } catch (error) {
      this.logger.error(
        `Failed to send Telegram notification: ${error.message}`,
        error.stack,
      );
    }
  }

  private async bookingSequenceCode(booking: any) {
    try {
      const sequence = await this.bookingSequenceNumber(booking);
      return sequence ? `NLF-${sequence}` : null;
    } catch (error) {
      this.logger.warn(
        `Failed to resolve booking Telegram STT: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  private async bookingSequenceNumber(booking: any) {
    let anchorCreatedAt = this.toValidDate(booking?.createdAt);

    if (booking?.tourBookingId) {
      const tourBooking = await this.prisma.tourBooking.findUnique({
        where: { id: booking.tourBookingId },
        select: { createdAt: true },
      });
      anchorCreatedAt = tourBooking?.createdAt ?? anchorCreatedAt;
    }

    const createdAtWhere = anchorCreatedAt
      ? { createdAt: { lte: anchorCreatedAt } }
      : {};
    const [standaloneBookingCount, tourBookingCount] = await Promise.all([
      this.prisma.booking.count({
        where: {
          tourBookingId: null,
          ...createdAtWhere,
        },
      }),
      this.prisma.tourBooking.count({
        where: createdAtWhere,
      }),
    ]);

    return standaloneBookingCount + tourBookingCount;
  }

  private toValidDate(value?: Date | string | null) {
    if (!value) {
      return null;
    }

    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
}
