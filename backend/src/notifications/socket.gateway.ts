import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

type AuthSocketUser = {
  id: string;
  role?: string;
  jti: string;
};

type AuthSocketData = {
  authUser?: AuthSocketUser;
};

const adminNotificationRoles = new Set([
  'ADMIN',
  'SUPER_ADMIN',
  'STAFF',
  'OPERATOR',
]);

export type SessionReplacedPayload = {
  reason: 'LOGIN_FROM_ANOTHER_BROWSER';
  role: string;
  newDevice: {
    userAgent: string | null;
    ipAddress: string | null;
    at: string;
  };
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SocketGateway.name);

  constructor(private readonly jwtService: JwtService) {}

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

      // The session room is only used to address pushes, never to authorize
      // actions, so signature + expiry verification is enough here.
      void this.jwtService
        .verifyAsync<{ sub?: string; role?: string; jti?: string }>(token)
        .then((payload) => {
          if (payload?.sub && payload?.jti) {
            (client.data as AuthSocketData).authUser = {
              id: payload.sub,
              role: payload.role,
              jti: payload.jti,
            };
          }
          next();
        })
        .catch(() => {
          // Invalid or expired token: fall back to a guest connection.
          next();
        });
    });
  }

  handleConnection(client: Socket) {
    const authUser = (client.data as AuthSocketData).authUser;
    if (authUser) {
      void client.join(`session_${authUser.jti}`);
      if (
        authUser.role &&
        adminNotificationRoles.has(authUser.role.toUpperCase())
      ) {
        void client.join('admin_notifications');
      }
    }
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId?: string; bookingId?: string },
  ) {
    if (payload.userId) {
      client.join(`user_${payload.userId}`);
      this.logger.log(`Client ${client.id} joined room user_${payload.userId}`);
    }

    if (payload.bookingId) {
      client.join(`booking_${payload.bookingId}`);
      this.logger.log(
        `Client ${client.id} joined room booking_${payload.bookingId}`,
      );
    }
  }

  notifySessionReplaced(
    replacedJtis: string[],
    payload: SessionReplacedPayload,
  ) {
    for (const jti of replacedJtis) {
      this.server.to(`session_${jti}`).emit('session_replaced', payload);
    }
    this.logger.log(
      `Emitted session_replaced to ${replacedJtis.length} replaced session(s)`,
    );
  }

  notifyBookingStatusUpdate(userId: string, booking: any) {
    this.server.to(`user_${userId}`).emit('booking_status_updated', booking);
    this.logger.log(
      `Emitted booking_status_updated to user_${userId} for booking ${booking.id}`,
    );
  }

  notifyMemberNotificationCreated(userId: string, notification: any) {
    this.server
      .to(`user_${userId}`)
      .emit('member_notification_created', notification);
    this.logger.log(
      `Emitted member_notification_created to user_${userId} for notification ${notification.id}`,
    );
  }

  notifyAdminSupportChatMessage(notification: any) {
    this.server
      .to('admin_notifications')
      .emit('admin_support_chat_notification_created', notification);
    this.logger.log(
      `Emitted admin_support_chat_notification_created for ticket ${notification.ticketId}`,
    );
  }

  notifyBookingChatMessage(bookingId: string, message: any) {
    this.server
      .to(`booking_${bookingId}`)
      .emit('booking_chat_message_created', message);
    this.logger.log(
      `Emitted booking_chat_message_created to booking_${bookingId}`,
    );
  }
}
