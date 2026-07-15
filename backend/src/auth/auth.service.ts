import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  createHmac,
  randomBytes,
  randomInt,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto';
import type { Request, Response } from 'express';
import { EmailNotificationService } from '../notifications/email-notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { LoginDto } from './dto/login.dto';
import {
  RequestPasswordResetDto,
  ResetPasswordDto,
  VerifyPasswordResetCodeDto,
} from './dto/password-reset.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

const DEFAULT_JWT_TTL_MS = 24 * 60 * 60 * 1000;

export type LoginRole =
  | 'USER'
  | 'PARTNER'
  | 'OPERATOR'
  | 'STAFF'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export type SessionContext = {
  userAgent?: string;
  ipAddress?: string;
};

type GoogleTokenInfoResponse = {
  aud?: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  sub?: string;
  error?: string;
  error_description?: string;
};

type GoogleAccessTokenInfoResponse = {
  aud?: string;
  audience?: string;
  issued_to?: string;
  email?: string;
  email_verified?: boolean | string;
  verified_email?: boolean | string;
  sub?: string;
  user_id?: string;
  error?: string;
  error_description?: string;
};

type GoogleUserInfoResponse = {
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  sub?: string;
};

type LineTokenResponse = {
  access_token?: string;
  expires_in?: number;
  id_token?: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

type LineIdTokenVerifyResponse = {
  iss?: string;
  sub?: string;
  aud?: string;
  exp?: number;
  iat?: number;
  nonce?: string;
  name?: string;
  picture?: string;
  email?: string;
  error?: string;
  error_description?: string;
};

type LineCallbackQuery = {
  code?: string;
  state?: string;
  error?: string;
  errorDescription?: string;
};

type LineAccount = {
  sub: string;
  email: string;
  displayName?: string;
};

type AuthCookiePayload = {
  accessToken: string;
  user: {
    email: string;
    displayName?: string | null;
    role: string;
  };
};

const lineStateCookie = 'line_oauth_state';
const lineNonceCookie = 'line_oauth_nonce';
const lineRedirectCookie = 'line_oauth_redirect';
const lineFallbackEmailDomain = 'line.vietyoru.local';
const authCookieMaxAgeMs = 24 * 60 * 60 * 1000;
const oauthCookieMaxAgeMs = 10 * 60 * 1000;
const passwordResetTtlMs = 15 * 60 * 1000;
const passwordResetTtlMinutes = 15;
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly emailNotificationService: EmailNotificationService,
  ) {}

  async register(dto: RegisterDto, sessionContext?: SessionContext) {
    const user = await this.usersService.createUser({
      email: dto.email,
      password: dto.password.trim(),
      displayName: dto.displayName,
    });

    return this.toAuthResponse(user, sessionContext);
  }

  async login(dto: LoginDto, sessionContext?: SessionContext) {
    const user = await this.usersService.validateCredentials(
      dto.email,
      dto.password.trim(),
    );

    return this.toAuthResponse(user, sessionContext);
  }

  async loginAs(
    role: LoginRole,
    dto: LoginDto,
    sessionContext?: SessionContext,
  ) {
    const user = await this.usersService.validateCredentials(
      dto.email,
      dto.password.trim(),
    );

    const isSuperAdminFallback =
      role === 'ADMIN' && user.role === 'SUPER_ADMIN';
    if (!isSuperAdminFallback && user.role !== role) {
      throw new ForbiddenException(`This account is not a ${role} account`);
    }

    return this.toAuthResponse(user, sessionContext);
  }

  async loginGoogleMember(dto: GoogleAuthDto, sessionContext?: SessionContext) {
    const googleAccount = await this.verifyGoogleAccount(dto);
    const existingUser = await this.usersService.findByEmail(
      googleAccount.email,
    );

    if (existingUser) {
      if (existingUser.deletedAt || existingUser.status !== 'ACTIVE') {
        throw new UnauthorizedException('Google account is not active');
      }

      if (existingUser.role !== 'USER') {
        throw new ForbiddenException(
          'This Google account is not a member account',
        );
      }

      return this.toAuthResponse(existingUser, sessionContext);
    }

    const user = await this.usersService.createGoogleMember({
      email: googleAccount.email,
      displayName: googleAccount.displayName,
    });

    return this.toAuthResponse(user, sessionContext);
  }

  googleLoginConfig() {
    const clientId = this.getGoogleClientId();

    return {
      configured: Boolean(clientId),
      clientId: clientId || null,
    };
  }

  lineLoginConfig() {
    return {
      configured: Boolean(
        this.configService.get<string>('LINE_CHANNEL_ID')?.trim() &&
        this.configService.get<string>('LINE_CHANNEL_SECRET')?.trim() &&
        this.configService.get<string>('LINE_CALLBACK_URL')?.trim(),
      ),
    };
  }

  redirectToLineLogin(redirect: string | undefined, response: Response) {
    const channelId = this.configService.get<string>('LINE_CHANNEL_ID');
    const callbackUrl = this.configService.get<string>('LINE_CALLBACK_URL');

    if (!channelId || !callbackUrl) {
      throw new ServiceUnavailableException('LINE login is not configured');
    }

    const state = randomUUID();
    const nonce = randomUUID();
    const redirectPath = this.normalizeRedirectPath(redirect);
    const cookieOptions = this.oauthCookieOptions();

    response.cookie(lineStateCookie, state, cookieOptions);
    response.cookie(lineNonceCookie, nonce, cookieOptions);
    response.cookie(lineRedirectCookie, redirectPath, cookieOptions);

    const authorizationUrl = new URL(
      'https://access.line.me/oauth2/v2.1/authorize',
    );
    authorizationUrl.searchParams.set('response_type', 'code');
    authorizationUrl.searchParams.set('client_id', channelId);
    authorizationUrl.searchParams.set('redirect_uri', callbackUrl);
    authorizationUrl.searchParams.set('state', state);
    authorizationUrl.searchParams.set('scope', 'profile openid email');
    authorizationUrl.searchParams.set('nonce', nonce);
    authorizationUrl.searchParams.set('disable_auto_login', 'true');

    return response.redirect(authorizationUrl.toString());
  }

  async handleLineCallback(
    query: LineCallbackQuery,
    request: Request,
    response: Response,
    sessionContext?: SessionContext,
  ) {
    const cookies = this.parseCookieHeader(request.headers.cookie);
    const redirectPath = this.normalizeRedirectPath(
      cookies[lineRedirectCookie],
    );

    if (query.error) {
      this.clearLineOAuthCookies(response);
      return this.redirectLineLoginError(
        response,
        redirectPath,
        query.errorDescription || query.error,
      );
    }

    if (
      !query.code ||
      !query.state ||
      query.state !== cookies[lineStateCookie]
    ) {
      this.clearLineOAuthCookies(response);
      return this.redirectLineLoginError(
        response,
        redirectPath,
        'LINE login state is invalid. Please try again.',
      );
    }

    let lineAccount: LineAccount;

    try {
      lineAccount = await this.verifyLineAuthorizationCode(
        query.code,
        cookies[lineNonceCookie],
      );
    } catch (error) {
      this.clearLineOAuthCookies(response);
      return this.redirectLineLoginError(
        response,
        redirectPath,
        error instanceof ServiceUnavailableException
          ? 'LINE login is not configured.'
          : 'LINE did not return a verified email address. Please approve email permission and try again.',
      );
    }

    const existingUser = await this.usersService.findByEmail(lineAccount.email);

    if (existingUser) {
      if (existingUser.deletedAt || existingUser.status !== 'ACTIVE') {
        this.clearLineOAuthCookies(response);
        return this.redirectLineLoginError(
          response,
          redirectPath,
          'LINE account is not active.',
        );
      }

      if (existingUser.role !== 'USER') {
        this.clearLineOAuthCookies(response);
        return this.redirectLineLoginError(
          response,
          redirectPath,
          'This LINE account is not a member account.',
        );
      }

      const authResponse = await this.toAuthResponse(
        existingUser,
        sessionContext,
      );
      this.setAuthCookies(response, authResponse);
      this.clearLineOAuthCookies(response);
      return response.redirect(this.webRedirectUrl(redirectPath));
    }

    const user = await this.usersService.createLineMember({
      email: lineAccount.email,
      displayName: lineAccount.displayName,
    });
    const authResponse = await this.toAuthResponse(user, sessionContext);
    this.setAuthCookies(response, authResponse);
    this.clearLineOAuthCookies(response);

    return response.redirect(this.webRedirectUrl(redirectPath));
  }

  async me(userId: string) {
    const user = await this.usersService.findByIdOrThrow(userId);

    return this.usersService.toPublicUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.usersService.updateProfile(userId, {
      displayName: dto.displayName,
      email: dto.email,
      phone: dto.phone,
    });

    return this.usersService.toPublicUser(user);
  }

  async requestPasswordReset(dto: RequestPasswordResetDto) {
    const email = dto.email.trim().toLowerCase();
    const expiresAt = new Date(Date.now() + passwordResetTtlMs);
    const user = await this.usersService.findByEmail(email);
    const response = {
      message:
        'Mã xác nhận đã được gửi tới email và có hiệu lực trong 15 phút.',
      expiresInMinutes: passwordResetTtlMinutes,
    };

    if (!user || user.deletedAt || user.status !== 'ACTIVE') {
      throw new NotFoundException('Password reset account not found');
    }

    const code = this.generatePasswordResetCode();
    const now = new Date();
    const token = await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        email: user.email.toLowerCase(),
        codeHash: this.hashPasswordResetValue(user.email, code),
        expiresAt,
      },
    });

    try {
      await this.emailNotificationService.sendPasswordResetCodeEmail({
        to: user.email,
        displayName: user.displayName,
        code,
        expiresAt,
      });
    } catch (error) {
      await this.prisma.passwordResetToken.update({
        where: { id: token.id },
        data: { usedAt: now },
      });
      this.logger.error(
        `Password reset email failed for ${this.maskEmailForLog(user.email)}: ${this.errorMessage(error)}`,
      );
      throw new ServiceUnavailableException(
        'Password reset email could not be sent',
      );
    }

    await this.prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        id: { not: token.id },
        usedAt: null,
      },
      data: { usedAt: now },
    });

    return response;
  }

  async verifyPasswordResetCode(dto: VerifyPasswordResetCodeDto) {
    const email = dto.email.trim().toLowerCase();
    const token = await this.findActivePasswordResetToken(email);

    if (
      !token ||
      !this.passwordResetHashMatches(token.codeHash, email, dto.code.trim())
    ) {
      throw new BadRequestException('Invalid or expired password reset code');
    }

    const resetToken = randomBytes(32).toString('hex');
    const updatedToken = await this.prisma.passwordResetToken.update({
      where: { id: token.id },
      data: {
        resetTokenHash: this.hashPasswordResetValue(email, resetToken),
        verifiedAt: new Date(),
      },
    });

    return {
      resetToken,
      expiresAt: updatedToken.expiresAt.toISOString(),
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const password = dto.password.trim();
    const confirmPassword = dto.confirmPassword.trim();

    if (password !== confirmPassword) {
      throw new BadRequestException('Password confirmation does not match');
    }

    const email = dto.email.trim().toLowerCase();
    const token = await this.findActivePasswordResetToken(email);

    if (
      !token?.resetTokenHash ||
      !token.verifiedAt ||
      !this.passwordResetHashMatches(
        token.resetTokenHash,
        email,
        dto.resetToken.trim(),
      )
    ) {
      throw new BadRequestException(
        'Invalid or expired password reset session',
      );
    }

    if (token.user.deletedAt || token.user.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Invalid or expired password reset session',
      );
    }

    const now = new Date();
    await this.usersService.updatePassword(token.userId, password);
    await this.prisma.passwordResetToken.updateMany({
      where: {
        userId: token.userId,
        usedAt: null,
      },
      data: { usedAt: now },
    });
    await this.prisma.userSession.updateMany({
      where: {
        userId: token.userId,
        status: 'ACTIVE',
      },
      data: {
        status: 'REVOKED',
        revokedAt: now,
        lastSeenAt: now,
      },
    });

    return { updated: true };
  }

  async logout(user: { id: string; jti?: string; exp?: number }) {
    if (!user.jti || !user.exp) {
      return { revoked: false };
    }

    await this.prisma.tokenBlacklist.upsert({
      where: { jti: user.jti },
      update: {
        reason: 'logout',
        expiresAt: new Date(user.exp * 1000),
      },
      create: {
        jti: user.jti,
        userId: user.id,
        reason: 'logout',
        expiresAt: new Date(user.exp * 1000),
      },
    });

    await this.prisma.userSession.updateMany({
      where: {
        userId: user.id,
        jti: user.jti,
      },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
        lastSeenAt: new Date(),
      },
    });

    return { revoked: true };
  }

  clearAuthCookies(response: Response) {
    const options = {
      path: '/',
      sameSite: 'lax' as const,
      secure: this.shouldUseSecureCookies(),
    };

    const cookieNames = ['auth_token', 'user_role', 'user_email', 'user_name'];
    const prefixes = ['', 'admin_', 'partner_'];

    for (const prefix of prefixes) {
      for (const name of cookieNames) {
        response.clearCookie(`${prefix}${name}`, options);
      }
    }
  }

  private async toAuthResponse(
    user: {
      id: string;
      email: string;
      displayName: string | null;
      phone: string | null;
      role: string;
      tier: string;
      status: string;
      createdAt: Date;
    },
    sessionContext?: SessionContext,
  ) {
    const jti = randomUUID();
    const expiresAt = this.resolveJwtExpiresAt();

    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        jti,
        userAgent: sessionContext?.userAgent,
        ipAddress: sessionContext?.ipAddress,
        expiresAt,
      },
    });

    return {
      accessToken: this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
          tier: user.tier,
        },
        { jwtid: jti },
      ),
      user: this.usersService.toPublicUser(user),
    };
  }

  private async verifyGoogleAccount(dto: GoogleAuthDto) {
    if (dto.credential) {
      return this.verifyGoogleCredential(dto.credential);
    }

    if (dto.accessToken) {
      return this.verifyGoogleAccessToken(dto.accessToken);
    }

    throw new BadRequestException('Google credential or access token required');
  }

  private async verifyGoogleCredential(credential: string) {
    const clientId = this.getGoogleClientId();

    if (!clientId) {
      throw new ServiceUnavailableException('Google login is not configured');
    }

    let tokenInfo: GoogleTokenInfoResponse;

    try {
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
          credential,
        )}`,
      );

      if (!response.ok) {
        throw new UnauthorizedException('Invalid Google credential');
      }

      tokenInfo = (await response.json()) as GoogleTokenInfoResponse;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid Google credential');
    }

    const emailVerified =
      tokenInfo.email_verified === true || tokenInfo.email_verified === 'true';

    if (
      tokenInfo.error ||
      tokenInfo.aud !== clientId ||
      !tokenInfo.email ||
      !emailVerified
    ) {
      throw new UnauthorizedException('Invalid Google credential');
    }

    return {
      sub: tokenInfo.sub,
      email: tokenInfo.email.toLowerCase(),
      displayName: tokenInfo.name?.trim() || undefined,
    };
  }

  private async verifyGoogleAccessToken(accessToken: string) {
    const clientId = this.getGoogleClientId();

    if (!clientId) {
      throw new ServiceUnavailableException('Google login is not configured');
    }

    let tokenInfo: GoogleAccessTokenInfoResponse;

    try {
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(
          accessToken,
        )}`,
      );

      if (!response.ok) {
        throw new UnauthorizedException('Invalid Google access token');
      }

      tokenInfo = (await response.json()) as GoogleAccessTokenInfoResponse;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid Google access token');
    }

    const audience = tokenInfo.aud || tokenInfo.audience || tokenInfo.issued_to;
    const emailVerified =
      tokenInfo.email_verified === true ||
      tokenInfo.email_verified === 'true' ||
      tokenInfo.verified_email === true ||
      tokenInfo.verified_email === 'true';

    if (
      tokenInfo.error ||
      audience !== clientId ||
      !tokenInfo.email ||
      !emailVerified
    ) {
      throw new UnauthorizedException('Invalid Google access token');
    }

    const userInfo = await this.fetchGoogleUserInfo(accessToken);
    const tokenEmail = tokenInfo.email.toLowerCase();
    const userInfoEmail = userInfo?.email?.toLowerCase();

    return {
      sub: tokenInfo.sub || tokenInfo.user_id || userInfo?.sub,
      email: tokenEmail,
      displayName:
        userInfoEmail === tokenEmail
          ? userInfo?.name?.trim() || undefined
          : undefined,
    };
  }

  private async fetchGoogleUserInfo(accessToken: string) {
    try {
      const response = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        return undefined;
      }

      return (await response.json()) as GoogleUserInfoResponse;
    } catch {
      return undefined;
    }
  }

  private getGoogleClientId() {
    return (
      this.configService.get<string>('GOOGLE_CLIENT_ID') ||
      this.configService.get<string>('NEXT_PUBLIC_GOOGLE_CLIENT_ID') ||
      ''
    ).trim();
  }

  private async verifyLineAuthorizationCode(
    code: string,
    expectedNonce?: string,
  ) {
    const channelId = this.configService.get<string>('LINE_CHANNEL_ID');
    const channelSecret = this.configService.get<string>('LINE_CHANNEL_SECRET');
    const callbackUrl = this.configService.get<string>('LINE_CALLBACK_URL');

    if (!channelId || !channelSecret || !callbackUrl) {
      throw new ServiceUnavailableException('LINE login is not configured');
    }

    let tokenResponse: LineTokenResponse;

    try {
      const response = await fetch('https://api.line.me/oauth2/v2.1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: callbackUrl,
          client_id: channelId,
          client_secret: channelSecret,
        }),
      });

      tokenResponse = (await response.json()) as LineTokenResponse;

      if (!response.ok || !tokenResponse.id_token) {
        throw new UnauthorizedException('Invalid LINE authorization code');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid LINE authorization code');
    }

    let idTokenInfo: LineIdTokenVerifyResponse;

    try {
      const response = await fetch('https://api.line.me/oauth2/v2.1/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          id_token: tokenResponse.id_token,
          client_id: channelId,
        }),
      });

      idTokenInfo = (await response.json()) as LineIdTokenVerifyResponse;

      if (!response.ok) {
        throw new UnauthorizedException('Invalid LINE ID token');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid LINE ID token');
    }

    if (
      idTokenInfo.error ||
      idTokenInfo.aud !== channelId ||
      (expectedNonce && idTokenInfo.nonce !== expectedNonce) ||
      !idTokenInfo.sub
    ) {
      throw new UnauthorizedException('Invalid LINE ID token');
    }

    return {
      sub: idTokenInfo.sub,
      email:
        idTokenInfo.email?.toLowerCase() ||
        this.toLineFallbackEmail(idTokenInfo.sub),
      displayName: idTokenInfo.name?.trim() || undefined,
    };
  }

  private toLineFallbackEmail(lineSubject: string) {
    const normalizedSubject =
      lineSubject.toLowerCase().replace(/[^a-z0-9._-]/g, '-') || 'unknown';

    return `line-${normalizedSubject}@${lineFallbackEmailDomain}`;
  }

  private findActivePasswordResetToken(email: string) {
    return this.prisma.passwordResetToken.findFirst({
      where: {
        email,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  private generatePasswordResetCode() {
    return String(randomInt(100000, 1000000));
  }

  private hashPasswordResetValue(email: string, value: string) {
    return createHmac('sha256', this.passwordResetSecret())
      .update(email.trim().toLowerCase())
      .update(':')
      .update(value)
      .digest('hex');
  }

  private passwordResetHashMatches(hash: string, email: string, value: string) {
    const expectedHash = this.hashPasswordResetValue(email, value);
    const expected = Buffer.from(expectedHash, 'hex');
    const received = Buffer.from(hash, 'hex');

    return (
      expected.length === received.length && timingSafeEqual(expected, received)
    );
  }

  private passwordResetSecret() {
    return (
      this.configService.get<string>('PASSWORD_RESET_SECRET') ||
      this.configService.get<string>('JWT_SECRET') ||
      'nightlife-password-reset-local-secret'
    );
  }

  private errorMessage(error: unknown) {
    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }

  private maskEmailForLog(email: string) {
    const [name = '', domain = ''] = email.split('@');
    if (!domain) {
      return '***';
    }

    const visibleName =
      name.length <= 2 ? `${name[0] ?? '*'}***` : `${name.slice(0, 2)}***`;

    return `${visibleName}@${domain}`;
  }

  private setAuthCookies(response: Response, authResponse: AuthCookiePayload) {
    const cookieOptions = {
      maxAge: authCookieMaxAgeMs,
      path: '/',
      sameSite: 'lax' as const,
      secure: this.shouldUseSecureCookies(),
    };

    response.cookie('auth_token', authResponse.accessToken, cookieOptions);
    response.cookie('user_role', authResponse.user.role, cookieOptions);
    response.cookie('user_email', authResponse.user.email, cookieOptions);
    response.cookie(
      'user_name',
      authResponse.user.displayName ?? authResponse.user.email,
      cookieOptions,
    );
  }

  private oauthCookieOptions() {
    return {
      httpOnly: true,
      maxAge: oauthCookieMaxAgeMs,
      path: '/',
      sameSite: 'lax' as const,
      secure: this.shouldUseSecureCookies(),
    };
  }

  private clearLineOAuthCookies(response: Response) {
    const options = {
      path: '/',
      sameSite: 'lax' as const,
      secure: this.shouldUseSecureCookies(),
    };

    response.clearCookie(lineStateCookie, options);
    response.clearCookie(lineNonceCookie, options);
    response.clearCookie(lineRedirectCookie, options);
  }

  private redirectLineLoginError(
    response: Response,
    redirectPath: string,
    message: string,
  ) {
    const loginUrl = this.webRedirectUrl('/dang-nhap');
    const url = new URL(loginUrl);
    url.searchParams.set('redirect', redirectPath);
    url.searchParams.set('line_error', message);

    return response.redirect(url.toString());
  }

  private normalizeRedirectPath(value: string | undefined) {
    if (!value || !value.startsWith('/') || value.startsWith('//')) {
      return '/tai-khoan';
    }

    return value;
  }

  private webRedirectUrl(path: string) {
    const baseUrl = this.configService.get<string>(
      'WEB_BASE_URL',
      'http://localhost:3000',
    );
    const normalizedBaseUrl = baseUrl.replace(/\/$/, '');

    return `${normalizedBaseUrl}${this.normalizeRedirectPath(path)}`;
  }

  private shouldUseSecureCookies() {
    const webBaseUrl = this.configService.get<string>('WEB_BASE_URL', '');
    const callbackUrl = this.configService.get<string>('LINE_CALLBACK_URL', '');

    return (
      this.configService.get<string>('NODE_ENV') === 'production' ||
      webBaseUrl.startsWith('https://') ||
      callbackUrl.startsWith('https://')
    );
  }

  private parseCookieHeader(cookieHeader: string | undefined) {
    if (!cookieHeader) {
      return {};
    }

    return cookieHeader
      .split(';')
      .reduce<Record<string, string>>((cookies, entry) => {
        const [rawName, ...rawValueParts] = entry.trim().split('=');
        if (!rawName || rawValueParts.length === 0) {
          return cookies;
        }

        const rawValue = rawValueParts.join('=');
        try {
          cookies[rawName] = decodeURIComponent(rawValue);
        } catch {
          cookies[rawName] = rawValue;
        }

        return cookies;
      }, {});
  }

  private resolveJwtExpiresAt() {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '1d');
    return new Date(Date.now() + this.parseDurationMs(expiresIn));
  }

  private parseDurationMs(value: string) {
    const match = value.trim().match(/^(\d+)(ms|s|m|h|d)?$/i);
    if (!match) {
      return DEFAULT_JWT_TTL_MS;
    }

    const amount = Number(match[1]);
    const unit = match[2]?.toLowerCase() ?? 's';
    const multipliers: Record<string, number> = {
      ms: 1,
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: DEFAULT_JWT_TTL_MS,
    };

    return amount * (multipliers[unit] ?? DEFAULT_JWT_TTL_MS);
  }
}
