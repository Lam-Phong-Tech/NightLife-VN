import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  const user = {
    id: 'user-1',
    email: 'partner@nightlife.vn',
    displayName: 'Partner',
    phone: null,
    role: 'PARTNER',
    tier: 'PREMIUM',
    status: 'ACTIVE',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  const usersService = {
    createUser: jest.fn(),
    createGoogleMember: jest.fn(),
    findByEmail: jest.fn(),
    validateCredentials: jest.fn(),
    findByIdOrThrow: jest.fn(),
    toPublicUser: jest.fn((value) => ({
      id: value.id,
      email: value.email,
      role: value.role,
      tier: value.tier,
      status: value.status,
    })),
  } as unknown as jest.Mocked<UsersService>;

  const jwtService = {
    sign: jest.fn(() => 'jwt-token'),
  } as unknown as jest.Mocked<JwtService>;

  const configService = {
    get: jest.fn((key: string, defaultValue?: string) => {
      if (key === 'GOOGLE_CLIENT_ID') {
        return 'google-client-id';
      }

      if (key === 'JWT_EXPIRES_IN') {
        return defaultValue ?? '1d';
      }

      return defaultValue;
    }),
  } as unknown as jest.Mocked<ConfigService>;

  const prisma = {
    tokenBlacklist: {
      upsert: jest.fn(),
    },
    userSession: {
      create: jest.fn(),
      updateMany: jest.fn(),
    },
  } as unknown as jest.Mocked<PrismaService>;

  let service: AuthService;
  const originalFetch = global.fetch;

  const mockGoogleTokenInfo = (body: unknown, ok = true) => {
    global.fetch = jest.fn().mockResolvedValue({
      ok,
      json: jest.fn().mockResolvedValue(body),
    } as unknown as Response);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(configService, jwtService, usersService, prisma);
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('registers a user and returns a JWT auth response', async () => {
    usersService.createUser.mockResolvedValue(user as never);

    await expect(
      service.register({
        email: user.email,
        password: 'Str0ngPass!',
        displayName: user.displayName,
      }),
    ).resolves.toEqual({
      accessToken: 'jwt-token',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tier: user.tier,
        status: user.status,
      },
    });
    expect(usersService.createUser).toHaveBeenCalledWith({
      email: user.email,
      password: 'Str0ngPass!',
      displayName: user.displayName,
    });
    expect(prisma.userSession.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: user.id,
        jti: expect.any(String),
        expiresAt: expect.any(Date),
      }),
    });
  });

  it('logs in with validated credentials', async () => {
    usersService.validateCredentials.mockResolvedValue(user as never);

    await service.login({
      email: user.email,
      password: 'Str0ngPass!',
    });

    expect(usersService.validateCredentials).toHaveBeenCalledWith(
      user.email,
      'Str0ngPass!',
    );
    expect(jwtService.sign).toHaveBeenCalledWith(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        tier: user.tier,
      },
      { jwtid: expect.any(String) },
    );
    expect(prisma.userSession.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: user.id,
        jti: expect.any(String),
        expiresAt: expect.any(Date),
      }),
    });
  });

  it('logs in through a role-specific portal only when the role matches', async () => {
    usersService.validateCredentials.mockResolvedValue(user as never);

    await expect(
      service.loginAs('PARTNER', {
        email: user.email,
        password: 'Str0ngPass!',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        accessToken: 'jwt-token',
      }),
    );

    await expect(
      service.loginAs('ADMIN', {
        email: user.email,
        password: 'Str0ngPass!',
      }),
    ).rejects.toThrow('This account is not a ADMIN account');
  });

  it('logs in operator accounts through the operator role portal', async () => {
    usersService.validateCredentials.mockResolvedValue({
      ...user,
      role: 'OPERATOR',
    } as never);

    await expect(
      service.loginAs('OPERATOR', {
        email: 'operator@nightlife.vn',
        password: 'Str0ngPass!',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        accessToken: 'jwt-token',
      }),
    );
  });

  it('logs in an existing member with a verified Google credential', async () => {
    const member = {
      ...user,
      id: 'member-1',
      email: 'google@nightlife.vn',
      displayName: 'Google Member',
      role: 'USER',
      tier: 'FREE',
      deletedAt: null,
    };
    mockGoogleTokenInfo({
      aud: 'google-client-id',
      email: 'Google@Nightlife.vn',
      email_verified: 'true',
      name: 'Google Member',
      sub: 'google-sub',
    });
    usersService.findByEmail.mockResolvedValue(member as never);

    await expect(
      service.loginGoogleMember({
        credential: 'google-id-token',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        accessToken: 'jwt-token',
      }),
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'https://oauth2.googleapis.com/tokeninfo?id_token=google-id-token',
    );
    expect(usersService.findByEmail).toHaveBeenCalledWith(
      'google@nightlife.vn',
    );
    expect(usersService.createGoogleMember).not.toHaveBeenCalled();
    expect(prisma.userSession.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: member.id,
      }),
    });
  });

  it('creates a member when Google credential email is new', async () => {
    const member = {
      ...user,
      id: 'member-2',
      email: 'new-google@nightlife.vn',
      displayName: 'New Google Member',
      role: 'USER',
      tier: 'FREE',
    };
    mockGoogleTokenInfo({
      aud: 'google-client-id',
      email: 'New-Google@Nightlife.vn',
      email_verified: true,
      name: 'New Google Member',
      sub: 'google-sub-new',
    });
    usersService.findByEmail.mockResolvedValue(null as never);
    usersService.createGoogleMember.mockResolvedValue(member as never);

    await expect(
      service.loginGoogleMember({
        credential: 'google-id-token',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        accessToken: 'jwt-token',
      }),
    );

    expect(usersService.createGoogleMember).toHaveBeenCalledWith({
      email: 'new-google@nightlife.vn',
      displayName: 'New Google Member',
    });
  });

  it('revokes the current token on logout', async () => {
    prisma.tokenBlacklist.upsert.mockResolvedValue({ id: 'token-1' } as never);
    prisma.userSession.updateMany.mockResolvedValue({ count: 1 } as never);

    await expect(
      service.logout({
        id: 'user-1',
        jti: 'token-id',
        exp: 1780000000,
      }),
    ).resolves.toEqual({ revoked: true });

    expect(prisma.tokenBlacklist.upsert).toHaveBeenCalledWith({
      where: { jti: 'token-id' },
      update: {
        reason: 'logout',
        expiresAt: new Date(1780000000 * 1000),
      },
      create: {
        jti: 'token-id',
        userId: 'user-1',
        reason: 'logout',
        expiresAt: new Date(1780000000 * 1000),
      },
    });
    expect(prisma.userSession.updateMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        jti: 'token-id',
      },
      data: {
        status: 'REVOKED',
        revokedAt: expect.any(Date),
        lastSeenAt: expect.any(Date),
      },
    });
  });
});
