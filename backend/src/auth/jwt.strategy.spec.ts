import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy privileged session policy', () => {
  const findByIdOrThrowMock = jest.fn();
  const usersService = {
    findByIdOrThrow: findByIdOrThrowMock,
  } as unknown as UsersService;

  const tokenBlacklistFindUniqueMock = jest.fn();
  const userSessionFindUniqueMock = jest.fn();
  const userSessionUpdateMock = jest.fn();
  const prisma = {
    tokenBlacklist: {
      findUnique: tokenBlacklistFindUniqueMock,
    },
    userSession: {
      findUnique: userSessionFindUniqueMock,
      update: userSessionUpdateMock,
    },
  } as unknown as PrismaService;

  const configService = {
    getOrThrow: jest.fn(() => 'test-jwt-secret'),
  } as unknown as ConfigService;

  let strategy: JwtStrategy;

  const activeSession = {
    userId: 'user-1',
    status: 'ACTIVE',
    expiresAt: new Date(Date.now() + 60_000),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    tokenBlacklistFindUniqueMock.mockResolvedValue(null);
    userSessionFindUniqueMock.mockResolvedValue(activeSession);
    userSessionUpdateMock.mockResolvedValue({});
    strategy = new JwtStrategy(configService, usersService, prisma);
  });

  it('accepts the newest privileged session', async () => {
    findByIdOrThrowMock.mockResolvedValue({
      id: 'user-1',
      email: 'admin@nightlife.vn',
      role: 'ADMIN',
      tier: 'VIP',
      status: 'ACTIVE',
      deletedAt: null,
      activePrivilegedJti: 'current-jti',
    });

    await expect(
      strategy.validate({
        sub: 'user-1',
        email: 'admin@nightlife.vn',
        role: 'ADMIN',
        jti: 'current-jti',
        exp: Math.floor(Date.now() / 1000) + 60,
      }),
    ).resolves.toMatchObject({
      id: 'user-1',
      role: 'ADMIN',
      jti: 'current-jti',
    });
  });

  it('rejects an older privileged session after another browser logs in', async () => {
    findByIdOrThrowMock.mockResolvedValue({
      id: 'user-1',
      email: 'admin@nightlife.vn',
      role: 'ADMIN',
      tier: 'VIP',
      status: 'ACTIVE',
      deletedAt: null,
      activePrivilegedJti: 'new-browser-jti',
    });

    let rejection: unknown;
    try {
      await strategy.validate({
        sub: 'user-1',
        email: 'admin@nightlife.vn',
        role: 'ADMIN',
        jti: 'old-browser-jti',
        exp: Math.floor(Date.now() / 1000) + 60,
      });
    } catch (error: unknown) {
      rejection = error;
    }

    expect(rejection).toBeInstanceOf(UnauthorizedException);
    expect((rejection as UnauthorizedException).getResponse()).toMatchObject({
      code: 'SESSION_REPLACED',
    });
    expect(userSessionUpdateMock).not.toHaveBeenCalled();
  });

  it('reports a logged-out privileged token as revoked, not session replaced', async () => {
    findByIdOrThrowMock.mockResolvedValue({
      id: 'user-1',
      email: 'partner@nightlife.vn',
      role: 'PARTNER',
      tier: 'PREMIUM',
      status: 'ACTIVE',
      deletedAt: null,
      activePrivilegedJti: null,
    });
    tokenBlacklistFindUniqueMock.mockResolvedValue({
      expiresAt: new Date(Date.now() + 60_000),
    });

    let rejection: unknown;
    try {
      await strategy.validate({
        sub: 'user-1',
        email: 'partner@nightlife.vn',
        role: 'PARTNER',
        jti: 'logged-out-jti',
        exp: Math.floor(Date.now() / 1000) + 60,
      });
    } catch (error: unknown) {
      rejection = error;
    }

    expect(rejection).toBeInstanceOf(UnauthorizedException);
    expect((rejection as UnauthorizedException).getResponse()).toMatchObject({
      message: 'Token has been revoked',
    });
    expect(userSessionFindUniqueMock).not.toHaveBeenCalled();
    expect(userSessionUpdateMock).not.toHaveBeenCalled();
  });

  it('allows USER accounts to keep multiple active sessions', async () => {
    findByIdOrThrowMock.mockResolvedValue({
      id: 'user-1',
      email: 'member@nightlife.vn',
      role: 'USER',
      tier: 'FREE',
      status: 'ACTIVE',
      deletedAt: null,
      activePrivilegedJti: null,
    });

    await expect(
      strategy.validate({
        sub: 'user-1',
        email: 'member@nightlife.vn',
        role: 'USER',
        jti: 'member-device-2',
        exp: Math.floor(Date.now() / 1000) + 60,
      }),
    ).resolves.toMatchObject({
      id: 'user-1',
      role: 'USER',
      jti: 'member-device-2',
    });
  });

  it('requires a fresh login after the account role changes', async () => {
    findByIdOrThrowMock.mockResolvedValue({
      id: 'user-1',
      email: 'member@nightlife.vn',
      role: 'ADMIN',
      tier: 'VIP',
      status: 'ACTIVE',
      deletedAt: null,
      activePrivilegedJti: null,
    });

    let rejection: unknown;
    try {
      await strategy.validate({
        sub: 'user-1',
        email: 'member@nightlife.vn',
        role: 'USER',
        jti: 'old-member-jti',
        exp: Math.floor(Date.now() / 1000) + 60,
      });
    } catch (error: unknown) {
      rejection = error;
    }

    expect(rejection).toBeInstanceOf(UnauthorizedException);
    expect((rejection as UnauthorizedException).getResponse()).toMatchObject({
      code: 'SESSION_ROLE_CHANGED',
    });
  });
});
