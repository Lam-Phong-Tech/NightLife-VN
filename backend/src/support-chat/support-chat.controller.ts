import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { SupportChatService } from './support-chat.service';
import { SupportChatGateway } from './support-chat.gateway';
import { SocketGateway } from '../notifications/socket.gateway';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

type SupportRequest = Request & {
  user?: {
    id?: string;
  };
};

@Controller('api/support')
export class SupportChatController {
  constructor(
    private readonly supportChatService: SupportChatService,
    private readonly supportChatGateway: SupportChatGateway,
    private readonly socketGateway: SocketGateway,
  ) {}

  @Get('history')
  async getHistory(
    @Query('ticketId') ticketId?: string,
    @Query('guestSessionId') guestSessionId?: string,
    @Query('userId') userId?: string,
    @Query('limit') limit?: string,
    @Query('beforeMessageId') beforeMessageId?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    if (ticketId) {
      return this.supportChatService.getHistory(
        ticketId,
        limitNum,
        beforeMessageId,
      );
    }

    if (!guestSessionId && !userId) {
      throw new BadRequestException('Ticket ID or session is required');
    }

    return this.supportChatService.getSessionHistory(
      guestSessionId,
      userId,
      limitNum,
      beforeMessageId,
    );
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard) // Only admins should see this
  async getPendingTickets(@Req() req: SupportRequest) {
    const adminId = req.user?.id;
    if (!adminId) return [];
    return this.supportChatService.getAdminTickets(adminId);
  }

  @Post('messages')
  @UseGuards(OptionalJwtAuthGuard)
  async createMessage(
    @Body()
    body: {
      ticketId?: string;
      content: string;
      guestSessionId?: string;
    },
    @Req() req: SupportRequest,
  ) {
    const { ticket, ticketId, message } =
      await this.supportChatService.createCustomerMessage({
        ticketId: body.ticketId,
        content: body.content,
        guestSessionId: body.guestSessionId,
        userId: req.user?.id,
      });

    if (ticket?.status === 'PENDING') {
      this.supportChatGateway.server.to('support_admins').emit('new_ticket', {
        ...ticket,
        messages: [message],
        latestMessage: message.content,
      });
    } else {
      this.supportChatGateway.server
        .to('support_admins')
        .emit('receive_message', message);
    }

    try {
      const notification =
        await this.supportChatService.createAdminCustomerMessageNotification({
          ticketId,
          messageId: message.id,
          content: message.content,
        });
      this.socketGateway.notifyAdminSupportChatMessage({
        id: notification.id,
        ticketId,
        createdAt: notification.createdAt.toISOString(),
      });
    } catch (notificationError) {
      console.error(
        '[SupportChat] Could not create in-app notification:',
        notificationError,
      );
    }

    return { ...message, ticketId };
  }

  @Post('tickets/read')
  @UseGuards(JwtAuthGuard)
  async markTicketRead(@Body() body: { ticketId?: string }) {
    if (!body.ticketId) {
      throw new BadRequestException('Ticket ID is required');
    }

    const result = await this.supportChatService.markTicketReadByAdmin(
      body.ticketId,
    );

    return { success: true, ticketId: body.ticketId, count: result.count };
  }

  @Post('merge')
  @UseGuards(JwtAuthGuard)
  async mergeSession(
    @Body() body: { guestSessionId: string },
    @Req() req: SupportRequest,
  ) {
    const userId = req.user?.id;
    if (!userId || !body.guestSessionId) {
      return { success: false, message: 'Missing userId or guestSessionId' };
    }

    const result = await this.supportChatService.mergeSession(
      body.guestSessionId,
      userId,
    );
    if (result) {
      // Broadcast merge event to Admin
      this.supportChatGateway.server
        .to(`ticket_${result.ticket.id}`)
        .emit('session_merged', {
          ticketId: result.ticket.id,
          user: result.ticket.user,
        });
      // Broadcast system message
      this.supportChatGateway.server
        .to(`ticket_${result.ticket.id}`)
        .emit('receive_message', result.message);
    }
    return { success: true, ticket: result?.ticket };
  }
}
