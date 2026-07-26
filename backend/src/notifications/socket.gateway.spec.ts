import { JwtService } from '@nestjs/jwt';
import type { Server, Socket } from 'socket.io';
import { SocketGateway } from './socket.gateway';

type SocketMiddleware = (
  client: Socket,
  next: (error?: Error) => void,
) => void;

describe('SocketGateway', () => {
  const jwtService = {
    verifyAsync: jest.fn(),
  } as unknown as jest.Mocked<JwtService>;

  let gateway: SocketGateway;

  const captureMiddleware = () => {
    let middleware: SocketMiddleware | undefined;
    gateway.afterInit({
      use: jest.fn<void, [SocketMiddleware]>((handler) => {
        middleware = handler;
      }),
    } as unknown as Server);
    return middleware;
  };

  const runMiddleware = async (
    middleware: SocketMiddleware | undefined,
    client: Socket,
  ) => {
    const next = jest.fn();
    await new Promise<void>((resolve) => {
      middleware?.(client, (error) => {
        next(error);
        resolve();
      });
    });
    return next;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    gateway = new SocketGateway(jwtService);
  });

  it('joins the session room for a socket with a valid token', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'user-1',
      role: 'ADMIN',
      jti: 'session-1',
    } as never);

    const middleware = captureMiddleware();
    const clientData: { authUser?: { id: string; role?: string; jti: string } } =
      {};
    const join = jest.fn();
    const client = {
      id: 'socket-1',
      data: clientData,
      handshake: { auth: { token: 'valid-token' } },
      join,
    } as unknown as Socket;

    const next = await runMiddleware(middleware, client);

    expect(next).toHaveBeenCalledWith(undefined);
    expect(clientData.authUser).toEqual({
      id: 'user-1',
      role: 'ADMIN',
      jti: 'session-1',
    });

    gateway.handleConnection(client);
    expect(join).toHaveBeenCalledWith('session_session-1');
  });

  it('falls back to a guest connection when the token is invalid', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

    const middleware = captureMiddleware();
    const clientData: { authUser?: unknown } = {};
    const join = jest.fn();
    const client = {
      id: 'socket-2',
      data: clientData,
      handshake: { auth: { token: 'expired-token' } },
      join,
    } as unknown as Socket;

    const next = await runMiddleware(middleware, client);

    expect(next).toHaveBeenCalledWith(undefined);
    expect(clientData.authUser).toBeUndefined();

    gateway.handleConnection(client);
    expect(join).not.toHaveBeenCalled();
  });

  it('connects sockets without a token as guests', async () => {
    const middleware = captureMiddleware();
    const clientData: { authUser?: unknown } = {};
    const join = jest.fn();
    const client = {
      id: 'socket-3',
      data: clientData,
      handshake: { auth: {} },
      join,
    } as unknown as Socket;

    const next = await runMiddleware(middleware, client);

    expect(next).toHaveBeenCalledWith(undefined);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    expect(clientData.authUser).toBeUndefined();

    gateway.handleConnection(client);
    expect(join).not.toHaveBeenCalled();
  });

  it('emits session_replaced to each replaced session room', () => {
    const emit = jest.fn();
    const to = jest.fn(() => ({ emit }));
    gateway.server = { to } as unknown as Server;

    const payload = {
      reason: 'LOGIN_FROM_ANOTHER_BROWSER' as const,
      role: 'PARTNER',
      newDevice: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0',
        ipAddress: '203.113.131.xxx',
        at: '2026-07-26T08:04:00.000Z',
      },
    };

    gateway.notifySessionReplaced(['jti-1', 'jti-2'], payload);

    expect(to).toHaveBeenCalledWith('session_jti-1');
    expect(to).toHaveBeenCalledWith('session_jti-2');
    expect(emit).toHaveBeenCalledTimes(2);
    expect(emit).toHaveBeenCalledWith('session_replaced', payload);
  });

  it('keeps join_room limited to user and booking rooms', () => {
    const join = jest.fn();
    const client = {
      id: 'socket-4',
      data: {},
      join,
    } as unknown as Socket;

    gateway.handleJoinRoom(client, {
      userId: 'user-9',
      bookingId: 'booking-3',
    });

    expect(join).toHaveBeenCalledWith('user_user-9');
    expect(join).toHaveBeenCalledWith('booking_booking-3');
    expect(join).toHaveBeenCalledTimes(2);
  });
});
