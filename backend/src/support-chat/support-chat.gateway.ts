import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SupportChatService } from './support-chat.service';
import { SupportSenderType } from '@prisma/client';
// For simplicity in this plan, we will handle basic token verification manually or assume middleware.

@WebSocketGateway({ namespace: '/support', cors: true })
export class SupportChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Set to maintain online admins' socket IDs or user IDs
  private onlineAdmins: Set<string> = new Set();

  constructor(private readonly supportChatService: SupportChatService) {}

  handleConnection(client: Socket) {
    // Determine if connection is from an Admin
    const role = client.handshake.query.role as string;
    if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'STAFF' || role === 'OPERATOR') {
      this.onlineAdmins.add(client.id);
      // Optionally broadcast to other admins or log
    }

    const ticketId = client.handshake.query.ticketId as string;
    if (ticketId) {
      client.join(`ticket_${ticketId}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.onlineAdmins.delete(client.id);
  }

  @SubscribeMessage('check_status')
  handleCheckStatus(@ConnectedSocket() client: Socket) {
    const isOnline = this.onlineAdmins.size > 0;
    return { isOnline };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { ticketId?: string; content: string; guestSessionId?: string; userId?: string; isAdmin?: boolean }
  ) {
    try {
      const isOnline = this.onlineAdmins.size > 0;
      
      // Yêu cầu: Chỉ text, không xử lý file ở đây
      if (!data.content || data.content.trim() === '') return { error: 'Content is required' };

      let ticketId = data.ticketId;
      let ticket;

      if (!ticketId) {
        // Offline Flow check: Prevent creating ticket if no admin is online
        if (!isOnline) {
          client.emit('system_message', { content: 'Hiện tại chúng tôi đang ngoài giờ làm việc. Vui lòng liên hệ trực tiếp qua Hotline: 1900-xxxx' });
          return { error: 'Offline' };
        }
        ticket = await this.supportChatService.createOrGetTicket(data.guestSessionId, data.userId);
        ticketId = ticket.id;
        
        // Broadcast new ticket to all admins
        if (ticket.status === 'PENDING') {
          this.server.emit('new_ticket', ticket);
        }
      }

      // Always ensure the sender is in the room so they receive their own broadcast (or rather, for future broadcasts)
      client.join(`ticket_${ticketId}`);

      const isAdminSender = this.onlineAdmins.has(client.id);
      const senderType = isAdminSender ? SupportSenderType.ADMIN : (data.userId ? SupportSenderType.USER : SupportSenderType.GUEST);
      
      const message = await this.supportChatService.sendMessage(ticketId as string, senderType, data.content, data.userId || undefined);

      // Broadcast to the room (excluding sender to prevent duplicate in optimistic UI)
      client.broadcast.to(`ticket_${ticketId}`).emit('receive_message', message);
      return message;
    } catch (error) {
      console.error('[SupportChat] Error sending message:', error);
      return { error: 'Internal error' };
    }
  }

  @SubscribeMessage('rejoin_ticket')
  handleRejoinTicket(@ConnectedSocket() client: Socket, @MessageBody() data: { ticketId: string }) {
    if (data.ticketId) {
      client.join(`ticket_${data.ticketId}`);
    }
  }

  @SubscribeMessage('claim_ticket')
  async handleClaimTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { ticketId: string; adminId: string }
  ) {
    try {
      const ticket = await this.supportChatService.claimTicket(data.ticketId, data.adminId);
      
      // Phương án 2: Broadcast to disable UI for other admins
      this.server.emit('ticket_claimed', { ticketId: data.ticketId, adminId: data.adminId });
      
      client.join(`ticket_${data.ticketId}`);
      return { success: true, ticket };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('close_ticket')
  async handleCloseTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { ticketId: string }
  ) {
    try {
      const ticket = await this.supportChatService.closeTicket(data.ticketId);
      this.server.to(`ticket_${data.ticketId}`).emit('ticket_closed', { ticketId: data.ticketId });
      return { success: true, ticket };
    } catch (error) {
      console.error('[SupportChat] Error closing ticket:', error);
      return { success: false, error: 'Internal error' };
    }
  }
}
