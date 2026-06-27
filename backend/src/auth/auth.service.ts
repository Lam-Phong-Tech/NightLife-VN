import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const DEFAULT_JWT_TTL_MS = 24 * 60 * 60 * 1000;

export type LoginRole = 'USER' | 'PARTNER' | 'OPERATOR' | 'STAFF' | 'ADMIN';

export type SessionContext = {
  userAgent?: string;
  ipAddress?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  async register(dto: RegisterDto, sessionContext?: SessionContext) {
    const user = await this.usersService.createUser({
      email: dto.email,
      password: dto.password,
      displayName: dto.displayName,
    });

    return this.toAuthResponse(user, sessionContext);
  }

  async login(dto: LoginDto, sessionContext?: SessionContext) {
    const user = await this.usersService.validateCredentials(
      dto.email,
      dto.password,
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
      dto.password,
    );

    if (user.role !== role) {
      throw new ForbiddenException(`This account is not a ${role} account`);
    }

    return this.toAuthResponse(user, sessionContext);
  }

  async me(userId: string) {
    const user = await this.usersService.findByIdOrThrow(userId);

    return this.usersService.toPublicUser(user);
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
