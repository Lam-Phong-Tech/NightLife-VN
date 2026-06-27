import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.createUser({
      email: dto.email,
      password: dto.password,
      displayName: dto.displayName,
    });

    return this.toAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.validateCredentials(
      dto.email,
      dto.password,
    );

    return this.toAuthResponse(user);
  }

  async loginAs(role: 'USER' | 'PARTNER' | 'STAFF' | 'ADMIN', dto: LoginDto) {
    const user = await this.usersService.validateCredentials(
      dto.email,
      dto.password,
    );

    if (user.role !== role) {
      throw new ForbiddenException(`This account is not a ${role} account`);
    }

    return this.toAuthResponse(user);
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

    return { revoked: true };
  }

  private toAuthResponse(user: {
    id: string;
    email: string;
    displayName: string | null;
    phone: string | null;
    role: string;
    tier: string;
    status: string;
    createdAt: Date;
  }) {
    return {
      accessToken: this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
          tier: user.tier,
        },
        { jwtid: randomUUID() },
      ),
      user: this.usersService.toPublicUser(user),
    };
  }
}
