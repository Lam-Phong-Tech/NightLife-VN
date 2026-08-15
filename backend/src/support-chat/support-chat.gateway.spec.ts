import { JwtService } from '@nestjs/jwt';
import type { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { SupportChatGateway } from './support-chat.gateway';
import { SupportChatService } from './support-chat.service';
import { SocketGateway } from '../notifications/socket.gateway';

describe('SupportChatGateway', () => {
  const claimTicketMock = jest.fn();
  const markTicketReadByAdminMock = jest.fn();
  const supportChatService = {
    claimTicket: claimTicketMock,
    markTicketReadByAdmin: markTicketReadByAdminMock,
  } as unknown as jest.Mocked<SupportChatService>;
  const jwtService = {
    verifyAsync: jest.fn(),
  } as unknown as jest.Mocked<JwtService>;
  const prisma = {
    user: { findUnique: jest.fn() },
    tokenBlacklist: { findUnique: jest.fn() },
    userSession: { findUnique: jest.fn() },
  } as unknown as jest.Mocked<PrismaService>;
  const socketGateway = {
    notifyMemberNotificationCreated: jest.fn(),
    notifyAdminSupportChatMessage: jest.fn(),
  } as unknown as jest.Mocked<SocketGateway>;

  let gateway: SupportChatGateway;

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'verified-admin-id',
      role: 'ADMIN',
      status: 'ACTIVE',
      deletedAt: null,
      activePrivilegedJti: 'session-id',
    });
    (prisma.tokenBlacklist.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.userSession.findUnique as jest.Mock).mockResolvedValue({
      userId: 'verified-admin-id',
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 60_000),
    });
    gateway = new SupportChatGateway(
      supportChatService,
      jwtService,
      prisma,
      socketGateway,
    );
    gateway.server = {
      emit: jest.fn(),
    } as unknown as Server;
  });

  it('authenticates the socket token and stores the verified user identity', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'verified-admin-id',
      role: 'ADMIN',
      jti: 'session-id',
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'verified-admin-id',
      role: 'ADMIN',
      status: 'ACTIVE',
      deletedAt: null,
      activePrivilegedJti: 'session-id',
    });
    (prisma.tokenBlacklist.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.userSession.findUnique as jest.Mock).mockResolvedValue({
      userId: 'verified-admin-id',
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 60_000),
    });

    type SocketMiddleware = (
      client: Socket,
      next: (error?: Error) => void,
    ) => void;
    let middleware: SocketMiddleware | undefined;
    gateway.afterInit({
      use: jest.fn<void, [SocketMiddleware]>((handler) => {
        middleware = handler;
      }),
    } as unknown as Server);
    const clientData: {
      supportUser?: { id: string; role: string; jti: string };
    } = {};
    const client = {
      data: clientData,
      handshake: { auth: { token: 'valid-token' } },
    } as unknown as Socket;
    const next = jest.fn();

    await new Promise<void>((resolve) => {
      middleware?.(client, (error) => {
        next(error);
        resolve();
      });
    });

    expect(next).toHaveBeenCalledWith(undefined);
    expect(clientData.supportUser).toEqual({
      id: 'verified-admin-id',
      role: 'ADMIN',
      jti: 'session-id',
    });
  });

  it('rejects a privileged socket after another browser replaces its session', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'verified-admin-id',
      role: 'ADMIN',
      jti: 'old-session-id',
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'verified-admin-id',
      role: 'ADMIN',
      status: 'ACTIVE',
      deletedAt: null,
      activePrivilegedJti: 'new-session-id',
    });
    (prisma.tokenBlacklist.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.userSession.findUnique as jest.Mock).mockResolvedValue({
      userId: 'verified-admin-id',
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 60_000),
    });

    type SocketMiddleware = (
      client: Socket,
      next: (error?: Error) => void,
    ) => void;
    let middleware: SocketMiddleware | undefined;
    gateway.afterInit({
      use: jest.fn<void, [SocketMiddleware]>((handler) => {
        middleware = handler;
      }),
    } as unknown as Server);
    const clientData: {
      supportUser?: { id: string; role: string; jti: string };
    } = {};
    const client = {
      data: clientData,
      handshake: { auth: { token: 'old-token' } },
    } as unknown as Socket;
    const next = jest.fn();

    await new Promise<void>((resolve) => {
      middleware?.(client, (error) => {
        next(error);
        resolve();
      });
    });

    expect(next).toHaveBeenCalledWith(new Error('UNAUTHORIZED'));
    expect(clientData.supportUser).toBeUndefined();
  });

  it('rejects an invalid authenticated socket before it connects', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

    type SocketMiddleware = (
      client: Socket,
      next: (error?: Error) => void,
    ) => void;
    let middleware: SocketMiddleware | undefined;
    gateway.afterInit({
      use: jest.fn<void, [SocketMiddleware]>((handler) => {
        middleware = handler;
      }),
    } as unknown as Server);
    const clientData: {
      supportUser?: { id: string; role: string; jti: string };
    } = {};
    const client = {
      data: clientData,
      handshake: { auth: { token: 'invalid-token' } },
    } as unknown as Socket;
    const next = jest.fn();

    await new Promise<void>((resolve) => {
      middleware?.(client, (error) => {
        next(error);
        resolve();
      });
    });

    expect(next).toHaveBeenCalledWith(new Error('UNAUTHORIZED'));
    expect(clientData.supportUser).toBeUndefined();
  });

  it('uses the verified socket identity when claiming a ticket', async () => {
    const ticket = { id: 'ticket-1' };
    claimTicketMock.mockResolvedValue(ticket);
    const client = {
      data: {
        supportUser: {
          id: 'verified-admin-id',
          role: 'ADMIN',
          jti: 'session-id',
        },
      },
      join: jest.fn(),
      disconnect: jest.fn(),
    } as unknown as Socket;

    await expect(
      gateway.handleClaimTicket(client, { ticketId: 'ticket-1' }),
    ).resolves.toEqual({ success: true, ticket });
    expect(claimTicketMock).toHaveBeenCalledWith(
      'ticket-1',
      'verified-admin-id',
    );
  });

  it('marks a support ticket as read from an authenticated admin socket', async () => {
    markTicketReadByAdminMock.mockResolvedValue({ count: 2 });
    const client = {
      data: {
        supportUser: {
          id: 'verified-admin-id',
          role: 'ADMIN',
          jti: 'session-id',
        },
      },
      join: jest.fn(),
      disconnect: jest.fn(),
    } as unknown as Socket;

    await expect(
      gateway.handleMarkTicketRead(client, { ticketId: 'ticket-1' }),
    ).resolves.toEqual({ success: true, count: 2 });

    expect(markTicketReadByAdminMock).toHaveBeenCalledWith('ticket-1');
    expect(socketGateway.notifyAdminSupportChatMessage).toHaveBeenCalledWith(
      expect.objectContaining({ ticketId: 'ticket-1', read: true }),
    );
  });

  it('rejects mark-read from an unauthenticated socket', async () => {
    const client = {
      data: {},
      join: jest.fn(),
    } as unknown as Socket;

    await expect(
      gateway.handleMarkTicketRead(client, { ticketId: 'ticket-1' }),
    ).resolves.toEqual({ success: false, error: 'UNAUTHORIZED' });
    expect(markTicketReadByAdminMock).not.toHaveBeenCalled();
  });

  it('disconnects an already-open admin socket after its session is replaced', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'verified-admin-id',
      role: 'ADMIN',
      status: 'ACTIVE',
      deletedAt: null,
      activePrivilegedJti: 'new-session-id',
    });
    const disconnect = jest.fn();
    const emit = jest.fn();
    const client = {
      id: 'old-admin-socket',
      data: {
        supportUser: {
          id: 'verified-admin-id',
          role: 'ADMIN',
          jti: 'old-session-id',
        },
      },
      join: jest.fn(),
      emit,
      disconnect,
    } as unknown as Socket;

    await expect(
      gateway.handleClaimTicket(client, { ticketId: 'ticket-1' }),
    ).resolves.toEqual({
      success: false,
      error: 'Phiên đăng nhập quản trị không hợp lệ. Vui lòng đăng nhập lại.',
    });

    expect(emit).toHaveBeenCalledWith(
      'session_replaced',
      expect.objectContaining({ code: 'SESSION_REPLACED' }),
    );
    expect(emit.mock.invocationCallOrder[0]).toBeLessThan(
      disconnect.mock.invocationCallOrder[0],
    );
    expect(disconnect).toHaveBeenCalledWith(true);
    expect(claimTicketMock).not.toHaveBeenCalled();
  });

  it('rejects ticket claims from an unauthenticated socket', async () => {
    const client = {
      data: {},
      join: jest.fn(),
    } as unknown as Socket;

    await expect(
      gateway.handleClaimTicket(client, { ticketId: 'ticket-1' }),
    ).resolves.toEqual({
      success: false,
      error: 'Phiên đăng nhập quản trị không hợp lệ. Vui lòng đăng nhập lại.',
    });
    expect(claimTicketMock).not.toHaveBeenCalled();
  });
});
