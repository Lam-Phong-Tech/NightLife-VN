import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { EmailNotificationService } from '../notifications/email-notification.service';
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
    createLineMember: jest.fn(),
    findByEmail: jest.fn(),
    validateCredentials: jest.fn(),
    findByIdOrThrow: jest.fn(),
    updatePassword: jest.fn(),
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
    passwordResetToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    userSession: {
      create: jest.fn(),
      updateMany: jest.fn(),
    },
  } as unknown as jest.Mocked<PrismaService>;

  const emailNotificationService = {
    sendPasswordResetCodeEmail: jest.fn(),
  } as unknown as jest.Mocked<EmailNotificationService>;

  let service: AuthService;
  const originalFetch = global.fetch;

  const mockGoogleTokenInfo = (body: unknown, ok = true) => {
    global.fetch = jest.fn().mockResolvedValue({
      ok,
      json: jest.fn().mockResolvedValue(body),
    });
  };

  const useDefaultConfig = () => {
    configService.get.mockImplementation(
      (key: string, defaultValue?: string) => {
        if (key === 'GOOGLE_CLIENT_ID') {
          return 'google-client-id';
        }

        if (key === 'JWT_EXPIRES_IN') {
          return defaultValue ?? '1d';
        }

        return defaultValue;
      },
    );
  };

  const useLineConfig = () => {
    configService.get.mockImplementation(
      (key: string, defaultValue?: string) => {
        if (key === 'LINE_CHANNEL_ID') {
          return '2010552841';
        }

        if (key === 'LINE_CHANNEL_SECRET') {
          return 'line-channel-secret';
        }

        if (key === 'LINE_CALLBACK_URL') {
          return 'https://demonightlight.test9.io.vn/api/backend/auth/line/callback';
        }

        if (key === 'WEB_BASE_URL') {
          return 'https://demonightlight.test9.io.vn';
        }

        if (key === 'GOOGLE_CLIENT_ID') {
          return 'google-client-id';
        }

        if (key === 'JWT_EXPIRES_IN') {
          return defaultValue ?? '1d';
        }

        return defaultValue;
      },
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useDefaultConfig();
    service = new AuthService(
      configService,
      jwtService,
      usersService,
      prisma,
      emailNotificationService,
    );
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('registers a user and returns a JWT auth response', async () => {
    usersService.createUser.mockResolvedValue(user as never);

    await expect(
      service.register({
        email: user.email,
        password: ' Str0ngPass! ',
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
      password: ' Str0ngPass! ',
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
    usersService.findByEmail.mockResolvedValue(null);
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

  it('creates a member with a verified Google access token from the popup flow', async () => {
    const member = {
      ...user,
      id: 'member-3',
      email: 'access-google@nightlife.vn',
      displayName: 'Access Google Member',
      role: 'USER',
      tier: 'FREE',
    };
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          audience: 'google-client-id',
          email: 'Access-Google@Nightlife.vn',
          verified_email: true,
          user_id: 'google-access-sub',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          email: 'Access-Google@Nightlife.vn',
          name: 'Access Google Member',
          sub: 'google-access-sub',
        }),
      });
    usersService.findByEmail.mockResolvedValue(null);
    usersService.createGoogleMember.mockResolvedValue(member as never);

    await expect(
      service.loginGoogleMember({
        accessToken: 'google-access-token',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        accessToken: 'jwt-token',
      }),
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'https://oauth2.googleapis.com/tokeninfo?access_token=google-access-token',
    );
    expect(global.fetch).toHaveBeenCalledWith(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: {
          Authorization: 'Bearer google-access-token',
        },
      },
    );
    expect(usersService.createGoogleMember).toHaveBeenCalledWith({
      email: 'access-google@nightlife.vn',
      displayName: 'Access Google Member',
    });
  });

  it('exposes the public Google client id for runtime frontend config', () => {
    expect(service.googleLoginConfig()).toEqual({
      configured: true,
      clientId: 'google-client-id',
    });
  });

  it('exposes LINE login configuration readiness', () => {
    expect(service.lineLoginConfig()).toEqual({
      configured: false,
    });

    useLineConfig();

    expect(service.lineLoginConfig()).toEqual({
      configured: true,
    });
  });

  it('starts LINE OAuth with email scope and web login fallback', () => {
    useLineConfig();

    const response = {
      cookie: jest.fn(),
      redirect: jest.fn(),
    } as unknown as jest.Mocked<Response>;

    service.redirectToLineLogin('/tai-khoan', response);

    const redirectUrl = new URL(response.redirect.mock.calls[0][0]);
    expect(redirectUrl.origin).toBe('https://access.line.me');
    expect(redirectUrl.pathname).toBe('/oauth2/v2.1/authorize');
    expect(redirectUrl.searchParams.get('client_id')).toBe('2010552841');
    expect(redirectUrl.searchParams.get('redirect_uri')).toBe(
      'https://demonightlight.test9.io.vn/api/backend/auth/line/callback',
    );
    expect(redirectUrl.searchParams.get('scope')).toBe('profile openid email');
    expect(redirectUrl.searchParams.get('disable_auto_login')).toBe('true');
    expect(response.cookie).toHaveBeenCalledWith(
      'line_oauth_redirect',
      '/tai-khoan',
      expect.objectContaining({
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: true,
      }),
    );
  });

  it('creates a LINE member with a stable fallback email when LINE does not return email yet', async () => {
    useLineConfig();
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          id_token: 'line-id-token',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          aud: '2010552841',
          sub: 'Ue611b37ac7eea14388f71e7eef27b835',
          nonce: 'nonce-1',
          name: 'LINE Member',
        }),
      });
    const member = {
      ...user,
      id: 'line-member-1',
      email: 'line-ue611b37ac7eea14388f71e7eef27b835@line.vietyoru.local',
      displayName: 'LINE Member',
      role: 'USER',
      tier: 'FREE',
      deletedAt: null,
    };
    usersService.findByEmail.mockResolvedValue(null);
    usersService.createLineMember.mockResolvedValue(member);

    const response = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      redirect: jest.fn(),
    } as unknown as jest.Mocked<Response>;

    await service.handleLineCallback(
      {
        code: 'line-code',
        state: 'state-1',
      },
      {
        headers: {
          cookie:
            'line_oauth_state=state-1; line_oauth_nonce=nonce-1; line_oauth_redirect=%2Ftai-khoan',
        },
      } as never,
      response,
    );

    expect(usersService.findByEmail).toHaveBeenCalledWith(
      'line-ue611b37ac7eea14388f71e7eef27b835@line.vietyoru.local',
    );
    expect(usersService.createLineMember).toHaveBeenCalledWith({
      email: 'line-ue611b37ac7eea14388f71e7eef27b835@line.vietyoru.local',
      displayName: 'LINE Member',
    });
    expect(response.cookie).toHaveBeenCalledWith(
      'auth_token',
      'jwt-token',
      expect.objectContaining({
        path: '/',
        sameSite: 'lax',
        secure: true,
      }),
    );
    expect(response.redirect).toHaveBeenCalledWith(
      'https://demonightlight.test9.io.vn/tai-khoan',
    );
  });

  it('revokes the current token on logout', async () => {
    prisma.tokenBlacklist.upsert.mockResolvedValue({ id: 'token-1' });
    prisma.userSession.updateMany.mockResolvedValue({ count: 1 });

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

  it('sends, verifies, and completes a password reset within 15 minutes', async () => {
    const member = {
      ...user,
      id: 'member-reset-1',
      email: 'member@nightlife.vn',
      displayName: 'Reset Member',
      role: 'USER',
      tier: 'FREE',
      status: 'ACTIVE',
      deletedAt: null,
    };
    const tokenRecord = {
      id: 'reset-token-1',
      userId: member.id,
      email: member.email,
      codeHash: '',
      resetTokenHash: null,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      verifiedAt: null,
      usedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: member,
    };

    usersService.findByEmail.mockResolvedValue(member as never);
    prisma.passwordResetToken.create.mockImplementation(async (args) => {
      tokenRecord.codeHash = String(args.data.codeHash);
      tokenRecord.expiresAt = args.data.expiresAt as Date;
      return tokenRecord as never;
    });
    prisma.passwordResetToken.updateMany.mockResolvedValue({ count: 1 });
    prisma.passwordResetToken.update.mockImplementation(async (args) => {
      if (args.data.resetTokenHash) {
        tokenRecord.resetTokenHash = String(args.data.resetTokenHash);
        tokenRecord.verifiedAt = args.data.verifiedAt as Date;
      }

      return tokenRecord as never;
    });
    emailNotificationService.sendPasswordResetCodeEmail.mockResolvedValue({
      messageId: 'mail-1',
    });

    await expect(
      service.requestPasswordReset({ email: ' Member@Nightlife.vn ' }),
    ).resolves.toEqual({
      message:
        'Nếu email tồn tại, mã xác nhận đã được gửi và có hiệu lực trong 15 phút.',
      expiresInMinutes: 15,
    });

    const resetCode =
      emailNotificationService.sendPasswordResetCodeEmail.mock.calls[0][0].code;
    expect(resetCode).toMatch(/^\d{6}$/);
    expect(prisma.passwordResetToken.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: member.id,
        email: member.email,
        codeHash: expect.any(String),
        expiresAt: expect.any(Date),
      }),
    });

    prisma.passwordResetToken.findFirst.mockResolvedValue(tokenRecord as never);
    const verifyResponse = await service.verifyPasswordResetCode({
      email: member.email,
      code: resetCode,
    });
    expect(verifyResponse.resetToken).toMatch(/^[a-f0-9]{64}$/);
    expect(tokenRecord.resetTokenHash).toEqual(expect.any(String));

    usersService.updatePassword.mockResolvedValue(member as never);
    prisma.userSession.updateMany.mockResolvedValue({ count: 2 });

    await expect(
      service.resetPassword({
        email: member.email,
        resetToken: verifyResponse.resetToken,
        password: ' NewStr0ngPass! ',
        confirmPassword: ' NewStr0ngPass! ',
      }),
    ).resolves.toEqual({ updated: true });
    expect(usersService.updatePassword).toHaveBeenCalledWith(
      member.id,
      'NewStr0ngPass!',
    );
    expect(prisma.passwordResetToken.updateMany).toHaveBeenCalledWith({
      where: {
        userId: member.id,
        usedAt: null,
      },
      data: { usedAt: expect.any(Date) },
    });
    expect(prisma.userSession.updateMany).toHaveBeenCalledWith({
      where: {
        userId: member.id,
        status: 'ACTIVE',
      },
      data: {
        status: 'REVOKED',
        revokedAt: expect.any(Date),
        lastSeenAt: expect.any(Date),
      },
    });
  });
});
