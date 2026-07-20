import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { SupportChatService } from './support-chat.service';
import { SupportSenderType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type SupportJwtPayload = {
  sub?: string;
  role?: string;
  jti?: string;
  exp?: number;
};

type SupportSocketUser = {
  id: string;
  role: string;
};

type SupportSocketData = {
  supportUser?: SupportSocketUser;
};

const supportAdminRoles = new Set([
  'ADMIN',
  'SUPER_ADMIN',
  'STAFF',
  'OPERATOR',
]);

const productionOrigins = [
  'https://demonightlight.test9.io.vn',
  'https://www.demonightlight.test9.io.vn',
  'https://partner.demonightlight.test9.io.vn',
  'https://admin.demonightlight.test9.io.vn',
  'https://auth.demonightlight.test9.io.vn',
  'https://demonightlight.test9io.vn',
  'https://www.demonightlight.test9io.vn',
  'https://nightlife.lptech.info.vn',
  'https://vietoru.com',
  'https://www.vietoru.com',
];

const configuredOrigins = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

@WebSocketGateway({
  namespace: '/support',
  cors: {
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      ...productionOrigins,
      ...configuredOrigins,
    ],
    credentials: true,
  },
})
export class SupportChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Set to maintain online admins' socket IDs or user IDs
  private onlineAdmins: Set<string> = new Set();

  constructor(
    private readonly supportChatService: SupportChatService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  afterInit(server: Server) {
    server.use((client, next) => {
      const token =
        typeof client.handshake.auth?.token === 'string'
          ? client.handshake.auth.token.trim()
          : '';

      if (!token) {
        next();
        return;
      }

      void this.authenticateSocket(token)
        .then((supportUser) => {
          (client.data as SupportSocketData).supportUser = supportUser;
          next();
        })
        .catch(() => {
          next(new Error('UNAUTHORIZED'));
        });
    });
  }

  handleConnection(client: Socket) {
    const supportUser = this.getSocketUser(client);
    const isAdmin = Boolean(
      supportUser && supportAdminRoles.has(supportUser.role),
    );
    console.log(
      `[SupportChat] Client connected: ${client.id}, role: ${supportUser?.role ?? 'GUEST'}, adminId: ${isAdmin ? supportUser?.id : ''}`,
    );

    if (isAdmin) {
      this.onlineAdmins.add(client.id);
      void client.join('support_admins');
      console.log(
        `[SupportChat] Admin added to onlineAdmins. Total online admins: ${this.onlineAdmins.size}`,
      );
    }

    const ticketId = client.handshake.query.ticketId as string;
    if (ticketId) {
      void client.join(`ticket_${ticketId}`);
    }
  }

  handleDisconnect(client: Socket) {
    const wasAdmin = this.onlineAdmins.delete(client.id);
    console.log(
      `[SupportChat] Client disconnected: ${client.id}. Was admin: ${wasAdmin}. Total online admins: ${this.onlineAdmins.size}`,
    );
  }

  @SubscribeMessage('check_status')
  handleCheckStatus() {
    const isOnline = this.onlineAdmins.size > 0;
    return { isOnline };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      ticketId?: string;
      content: string;
      guestSessionId?: string;
    },
  ) {
    try {
      const isOnline = this.onlineAdmins.size > 0;
      console.log(
        `[SupportChat] Handling send_message from client ${client.id}. isOnline: ${isOnline}, onlineAdmins size: ${this.onlineAdmins.size}`,
      );

      // Yêu cầu: Chỉ text, không xử lý file ở đây
      if (!data.content || data.content.trim() === '')
        return { error: 'Content is required' };

      const socketUser = this.getSocketUser(client);
      const isAdminSender = this.isAdminSocket(client);
      if (isAdminSender && !data.ticketId) {
        return { error: 'Ticket ID is required' };
      }

      const { ticket, ticketId, message } = isAdminSender
        ? {
            ticket: null,
            ticketId: data.ticketId,
            message: await this.supportChatService.sendMessage(
              data.ticketId as string,
              SupportSenderType.ADMIN,
              data.content.trim(),
              socketUser?.id,
            ),
          }
        : await this.supportChatService.createCustomerMessage({
            ...data,
            userId: socketUser?.id,
          });

      // Always ensure the sender is in the room so they receive future broadcasts.
      void client.join(`ticket_${ticketId}`);

      if (ticket?.status === 'PENDING') {
        this.server.to('support_admins').emit('new_ticket', {
          ...ticket,
          messages: [message],
          latestMessage: message.content,
        });
      }

      if (!isOnline && !isAdminSender) {
        client.emit('system_message', {
          id: `queued-${message.id}`,
          content:
            'Tin nhắn đã được ghi nhận. Admin sẽ phản hồi ngay khi trực tuyến.',
          createdAt: new Date().toISOString(),
        });
      }

      // Broadcast to the room (excluding sender to prevent duplicate in optimistic UI).
      // User messages also go to the admin room so the first message is not lost
      // while the admin dashboard is joining the ticket room.
      const target = client.broadcast.to(`ticket_${ticketId}`);
      if (isAdminSender) {
        target.emit('receive_message', message);
      } else {
        target.to('support_admins').emit('receive_message', message);
      }
      return message;
    } catch (error) {
      console.error('[SupportChat] Error sending message:', error);
      return { error: 'Internal error' };
    }
  }

  @SubscribeMessage('rejoin_ticket')
  handleRejoinTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { ticketId: string },
  ) {
    if (data.ticketId) {
      void client.join(`ticket_${data.ticketId}`);
    }
  }

  @SubscribeMessage('claim_ticket')
  async handleClaimTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { ticketId: string },
  ) {
    try {
      const admin = this.requireAdmin(client);
      const ticket = await this.supportChatService.claimTicket(
        data.ticketId,
        admin.id,
      );

      // Phương án 2: Broadcast to disable UI for other admins
      this.server.emit('ticket_claimed', {
        ticketId: data.ticketId,
        adminId: admin.id,
      });

      void client.join(`ticket_${data.ticketId}`);
      return { success: true, ticket };
    } catch (error) {
      if (!this.isExpectedActionError(error)) {
        console.error('[SupportChat] Error claiming ticket:', error);
      }
      return {
        success: false,
        error: this.getPublicActionError(
          error,
          'Không thể tiếp nhận đoạn chat. Vui lòng thử lại.',
        ),
      };
    }
  }

  @SubscribeMessage('close_ticket')
  async handleCloseTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { ticketId: string },
  ) {
    try {
      this.requireAdmin(client);
      const ticket = await this.supportChatService.closeTicket(data.ticketId);
      this.server
        .to(`ticket_${data.ticketId}`)
        .emit('ticket_closed', { ticketId: data.ticketId });
      return { success: true, ticket };
    } catch (error) {
      console.error('[SupportChat] Error closing ticket:', error);
      return { success: false, error: 'Internal error' };
    }
  }

  private getSocketUser(client: Socket): SupportSocketUser | undefined {
    return (client.data as SupportSocketData).supportUser;
  }

  private isAdminSocket(client: Socket) {
    const user = this.getSocketUser(client);
    return Boolean(user && supportAdminRoles.has(user.role));
  }

  private requireAdmin(client: Socket) {
    const user = this.getSocketUser(client);
    if (!user || !supportAdminRoles.has(user.role)) {
      throw new Error('UNAUTHORIZED');
    }
    return user;
  }

  private async authenticateSocket(token: string): Promise<SupportSocketUser> {
    const payload = await this.jwtService.verifyAsync<SupportJwtPayload>(token);
    if (!payload.sub || !payload.jti) {
      throw new Error('Invalid token payload');
    }

    const [user, revokedToken, session] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          role: true,
          status: true,
          deletedAt: true,
        },
      }),
      this.prisma.tokenBlacklist.findUnique({
        where: { jti: payload.jti },
        select: { expiresAt: true },
      }),
      this.prisma.userSession.findUnique({
        where: { jti: payload.jti },
        select: {
          userId: true,
          status: true,
          expiresAt: true,
        },
      }),
    ]);

    const now = new Date();
    if (
      !user ||
      user.deletedAt ||
      user.status !== 'ACTIVE' ||
      (revokedToken && revokedToken.expiresAt > now) ||
      !session ||
      session.userId !== user.id ||
      session.status !== 'ACTIVE' ||
      session.expiresAt <= now
    ) {
      throw new Error('Inactive socket session');
    }

    return {
      id: user.id,
      role: String(user.role).toUpperCase(),
    };
  }

  private getPublicActionError(error: unknown, fallback: string) {
    if (!(error instanceof Error)) return fallback;
    if (error.message === 'UNAUTHORIZED') {
      return 'Phiên đăng nhập quản trị không hợp lệ. Vui lòng đăng nhập lại.';
    }
    if (error.message.includes('Ticket đã được tiếp nhận')) {
      return error.message;
    }
    return fallback;
  }

  private isExpectedActionError(error: unknown) {
    return (
      error instanceof Error &&
      (error.message === 'UNAUTHORIZED' ||
        error.message.includes('Ticket đã được tiếp nhận'))
    );
  }
}
