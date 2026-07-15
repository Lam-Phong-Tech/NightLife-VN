import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SupportChatService } from './support-chat.service';
import { SupportChatGateway } from './support-chat.gateway';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/support')
export class SupportChatController {
  constructor(
    private readonly supportChatService: SupportChatService,
    private readonly supportChatGateway: SupportChatGateway,
  ) {}

  @Get('history')
  async getHistory(
    @Query('ticketId') ticketId: string,
    @Query('limit') limit?: string,
    @Query('beforeMessageId') beforeMessageId?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.supportChatService.getHistory(
      ticketId,
      limitNum,
      beforeMessageId,
    );
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard) // Only admins should see this
  async getPendingTickets(@Req() req: any) {
    const adminId = req.user?.id;
    if (!adminId) return [];
    return this.supportChatService.getAdminTickets(adminId);
  }

  @Post('merge')
  // @UseGuards(JwtAuthGuard) // User must be logged in to merge
  async mergeSession(
    @Body() body: { guestSessionId: string },
    @Req() req: any,
  ) {
    // Assuming req.user contains the authenticated user
    const userId = req.user?.id || body['userId']; // fallback for testing without guard
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
