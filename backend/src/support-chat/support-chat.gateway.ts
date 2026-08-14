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
import { OnModuleDestroy } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { SupportChatService } from './support-chat.service';
import { SupportSenderType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SocketGateway } from '../notifications/socket.gateway';
import {
  requiresSinglePrivilegedSession,
  SESSION_REPLACED_ERROR,
} from '../auth/session-policy';

type SupportJwtPayload = {
  sub?: string;
  role?: string;
  jti?: string;
  exp?: number;
};

type SupportSocketUser = {
  id: string;
  role: string;
  jti: string;
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
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleDestroy
{
  @WebSocketServer()
  server: Server;

  // Set to maintain online admins' socket IDs or user IDs
  private onlineAdmins: Set<string> = new Set();
  private privilegedSessionSweep?: ReturnType<typeof setInterval>;
  private privilegedSessionSweepRunning = false;

  constructor(
    private readonly supportChatService: SupportChatService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly socketGateway: SocketGateway,
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

    if (server.sockets?.sockets) {
      this.privilegedSessionSweep = setInterval(() => {
        void this.disconnectReplacedPrivilegedSockets().catch((error) => {
          console.error(
            '[SupportChat] Privileged session sweep failed:',
            error,
          );
        });
      }, 15_000);
      this.privilegedSessionSweep.unref?.();
    }
  }

  onModuleDestroy() {
    if (this.privilegedSessionSweep) {
      clearInterval(this.privilegedSessionSweep);
    }
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

      let socketUser = this.getSocketUser(client);
      const isAdminSender = this.isAdminSocket(client);
      if (isAdminSender) {
        socketUser = await this.requireAdmin(client);
      }
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

      try {
        if (isAdminSender) {
          const notification =
            await this.supportChatService.createMemberReplyNotification({
              ticketId: ticketId as string,
              messageId: message.id,
              content: message.content,
            });
          if (notification) {
            this.socketGateway.notifyMemberNotificationCreated(
              notification.userId as string,
              {
                id: notification.id,
                templateKey: notification.templateKey,
                category: 'system',
                createdAt: notification.createdAt.toISOString(),
              },
            );
          }
        } else {
          const notification =
            await this.supportChatService.createAdminCustomerMessageNotification(
              {
                ticketId: ticketId as string,
                messageId: message.id,
                content: message.content,
              },
            );
          this.socketGateway.notifyAdminSupportChatMessage({
            id: notification.id,
            ticketId: ticketId as string,
            createdAt: notification.createdAt.toISOString(),
          });
        }
      } catch (notificationError) {
        console.error(
          '[SupportChat] Could not create in-app notification:',
          notificationError,
        );
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
  async handleRejoinTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { ticketId: string },
  ) {
    try {
      if (this.isAdminSocket(client)) {
        await this.requireAdmin(client);
      }
      if (data.ticketId) {
        void client.join(`ticket_${data.ticketId}`);
      }
    } catch {
      return { error: 'UNAUTHORIZED' };
    }
  }

  @SubscribeMessage('claim_ticket')
  async handleClaimTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { ticketId: string },
  ) {
    try {
      const admin = await this.requireAdmin(client);
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
      await this.requireAdmin(client);
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

  private async requireAdmin(client: Socket) {
    const user = this.getSocketUser(client);
    if (!user || !supportAdminRoles.has(user.role)) {
      throw new Error('UNAUTHORIZED');
    }

    if (!(await this.isStoredSocketSessionActive(user))) {
      this.onlineAdmins.delete(client.id);
      this.emitSessionReplaced(client);
      client.disconnect(true);
      throw new Error('UNAUTHORIZED');
    }

    return user;
  }

  private emitSessionReplaced(client: Socket) {
    client.emit('session_replaced', {
      code: SESSION_REPLACED_ERROR.code,
      message: SESSION_REPLACED_ERROR.message,
      occurredAt: new Date().toISOString(),
    });
  }

  private async isStoredSocketSessionActive(socketUser: SupportSocketUser) {
    const [user, revokedToken, session] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: socketUser.id },
        select: {
          id: true,
          role: true,
          status: true,
          deletedAt: true,
          activePrivilegedJti: true,
        },
      }),
      this.prisma.tokenBlacklist.findUnique({
        where: { jti: socketUser.jti },
        select: { expiresAt: true },
      }),
      this.prisma.userSession.findUnique({
        where: { jti: socketUser.jti },
        select: {
          userId: true,
          status: true,
          expiresAt: true,
        },
      }),
    ]);

    const now = new Date();
    return Boolean(
      user &&
      !user.deletedAt &&
      user.status === 'ACTIVE' &&
      String(user.role).toUpperCase() === socketUser.role &&
      requiresSinglePrivilegedSession(user.role) &&
      user.activePrivilegedJti === socketUser.jti &&
      (!revokedToken || revokedToken.expiresAt <= now) &&
      session &&
      session.userId === user.id &&
      session.status === 'ACTIVE' &&
      session.expiresAt > now,
    );
  }

  private async disconnectReplacedPrivilegedSockets() {
    if (this.privilegedSessionSweepRunning) return;
    this.privilegedSessionSweepRunning = true;

    try {
      const sockets = Array.from(this.server.sockets.sockets.values());
      await Promise.all(
        sockets.map(async (client) => {
          const user = this.getSocketUser(client);
          if (
            !user ||
            !supportAdminRoles.has(user.role) ||
            (await this.isStoredSocketSessionActive(user))
          ) {
            return;
          }

          this.onlineAdmins.delete(client.id);
          this.emitSessionReplaced(client);
          client.disconnect(true);
        }),
      );
    } finally {
      this.privilegedSessionSweepRunning = false;
    }
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
          activePrivilegedJti: true,
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
      session.expiresAt <= now ||
      String(payload.role).toUpperCase() !== String(user.role).toUpperCase() ||
      (requiresSinglePrivilegedSession(user.role) &&
        user.activePrivilegedJti !== payload.jti)
    ) {
      throw new Error('Inactive socket session');
    }

    return {
      id: user.id,
      role: String(user.role).toUpperCase(),
      jti: payload.jti,
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
