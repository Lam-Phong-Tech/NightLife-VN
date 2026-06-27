import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

type JwtPayload = {
  sub: string;
  email: string;
  role: string;
  tier?: string;
  jti?: string;
  exp?: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService
      .findByIdOrThrow(payload.sub)
      .catch(() => {
        throw new UnauthorizedException('Account is not active');
      });

    if (user.deletedAt || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    if (payload.jti) {
      const revokedToken = await this.prisma.tokenBlacklist.findUnique({
        where: { jti: payload.jti },
        select: { expiresAt: true },
      });

      if (revokedToken && revokedToken.expiresAt > new Date()) {
        throw new UnauthorizedException('Token has been revoked');
      }
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      tier: user.tier,
      status: user.status,
      jti: payload.jti,
      exp: payload.exp,
    };
  }
}
