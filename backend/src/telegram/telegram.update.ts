import { Logger } from '@nestjs/common';
import { Action, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { PrismaService } from '../prisma/prisma.service';
import { SocketGateway } from '../notifications/socket.gateway';
import { LineService } from '../notifications/line.service';

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
      const callbackQuery = ctx.callbackQuery as any;
      const data = callbackQuery.data;
      const bookingId = data.replace('accept_booking_', '');
      
      const adminName = callbackQuery.from?.first_name || 'Admin';

      // 1. Update DB
      const booking = await this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' },
        include: { user: true, guest: true, store: true },
      });

      // 2. Update Telegram Message
      if (ctx.callbackQuery?.message) {
        const message = ctx.callbackQuery.message as any;
        const newText = message.text + `\n\n✅ *Accepted by ${adminName}*`;
        
        await ctx.telegram.editMessageText(
          message.chat.id,
          message.message_id,
          undefined,
          newText,
          { parse_mode: 'Markdown' } // Remove the inline keyboard
        );
      }

      await ctx.answerCbQuery('Booking accepted!');

      // 3. Notify Customer
      if (booking.userId) {
        this.socketGateway.notifyBookingStatusUpdate(booking.userId, booking);
      } else if (booking.guestId) {
        const phoneOrId = booking.guest?.phone || booking.guestId;
        await this.lineService.sendBookingConfirmation(phoneOrId, booking);
      }

      this.logger.log(`Booking ${bookingId} confirmed by Telegram Admin`);
    } catch (error) {
      this.logger.error(`Error handling accept_booking: ${(error as any).message}`, (error as any).stack);
      await ctx.answerCbQuery('Error accepting booking.');
    }
  }
}
