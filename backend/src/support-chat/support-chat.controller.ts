import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { SupportChatService } from './support-chat.service';

// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Assume this exists

@Controller('api/support')
export class SupportChatController {
  constructor(private readonly supportChatService: SupportChatService) {}

  @Get('history')
  async getHistory(
    @Query('ticketId') ticketId: string,
    @Query('limit') limit?: string,
    @Query('beforeMessageId') beforeMessageId?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.supportChatService.getHistory(ticketId, limitNum, beforeMessageId);
  }

  @Get('pending')
  // @UseGuards(JwtAuthGuard) // Only admins should see this
  async getPendingTickets() {
    return this.supportChatService.getPendingTickets();
  }

  @Post('merge')
  // @UseGuards(JwtAuthGuard) // User must be logged in to merge
  async mergeSession(
    @Body() body: { guestSessionId: string },
    @Req() req: any
  ) {
    // Assuming req.user contains the authenticated user
    const userId = req.user?.id || body['userId']; // fallback for testing without guard
    if (!userId || !body.guestSessionId) {
      return { success: false, message: 'Missing userId or guestSessionId' };
    }

    const activeTicket = await this.supportChatService.mergeSession(body.guestSessionId, userId);
    return { success: true, ticket: activeTicket };
  }
}
