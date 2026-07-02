import { Logger } from '@nestjs/common';
import { Action, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { LineService } from '../notifications/line.service';
import { SocketGateway } from '../notifications/socket.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { appendTelegramConfirmation } from '../notifications/admin-telegram-message.formatter';

@Update()
export class TelegramUpdate {
  private readonly logger = new Logger(TelegramUpdate.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly socketGateway: SocketGateway,
    private readonly lineService: LineService,
  ) {}

  @Action(/^accept_booking_(.+)$/)
  async onAcceptBooking(@Ctx() ctx: Context) {
    try {
      const callbackQuery = ctx.callbackQuery as
        | { data?: string; from?: { first_name?: string }; message?: unknown }
        | undefined;
      const data = callbackQuery?.data ?? '';
      const bookingId = data.replace('accept_booking_', '');
      const adminName = callbackQuery?.from?.first_name || 'Admin';

      const booking = await this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' },
        include: { user: true, guest: true, store: true },
      });

      if (ctx.callbackQuery?.message) {
        const message = ctx.callbackQuery.message as {
          chat: { id: number | string };
          message_id: number;
          text?: string;
        };
        const newText = appendTelegramConfirmation(
          message.text ?? '',
          adminName,
        );

        await ctx.telegram.editMessageText(
          message.chat.id,
          message.message_id,
          undefined,
          newText,
        );
      }

      await ctx.answerCbQuery('Đã xác nhận đặt bàn!');

      if (booking.userId) {
        this.socketGateway.notifyBookingStatusUpdate(booking.userId, booking);
      } else if (booking.guestId) {
        const phoneOrId = booking.guest?.phone || booking.guestId;
        await this.lineService.sendBookingConfirmation(phoneOrId, booking);
      }

      this.logger.log(`Booking ${bookingId} confirmed by Telegram Admin`);
    } catch (error) {
      this.logger.error(
        `Error handling accept_booking: ${(error as Error).message}`,
        (error as Error).stack,
      );
      await ctx.answerCbQuery('Không xác nhận được booking.');
    }
  }
}
