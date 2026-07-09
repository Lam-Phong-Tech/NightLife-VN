import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserTier } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from '../common/password.service';

type UserTierInput = UserTier | 'FREE' | 'PREMIUM';

const normalizeDisplayName = (value?: string | null) =>
  value?.trim().replace(/\s+/g, ' ') || undefined;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  findByEmail(email: string) {
    const normalizedEmail = email.trim().toLowerCase();

    return this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
  }

  async findByIdOrThrow(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(
    id: string,
    input: { displayName: string; email: string; phone?: string | null },
  ) {
    const currentUser = await this.findByIdOrThrow(id);
    const email = input.email.trim().toLowerCase();
    const displayName = normalizeDisplayName(input.displayName);
    const phone = input.phone?.trim() || null;

    if (currentUser.email !== email) {
      const existingUser = await this.findByEmail(email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email is already registered');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        email,
        displayName,
        phone,
      },
    });
  }

  async updatePassword(id: string, password: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        passwordHash: await this.passwordService.hash(password),
      },
    });
  }

  async createUser(input: {
    email: string;
    password: string;
    displayName?: string;
    phone?: string;
    role?: 'USER' | 'PARTNER' | 'OPERATOR' | 'STAFF' | 'ADMIN';
    tier?: UserTierInput;
  }) {
    const email = input.email.trim().toLowerCase();
    const displayName = normalizeDisplayName(input.displayName);
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    return this.prisma.user.create({
      data: {
        email,
        passwordHash: await this.passwordService.hash(input.password),
        displayName: displayName || undefined,
        phone: input.phone?.trim() || undefined,
        role: input.role ?? 'USER',
        tier: this.normalizeTier(input.tier),
      },
    });
  }

  async createGoogleMember(input: { email: string; displayName?: string }) {
    const email = input.email.trim().toLowerCase();
    const displayName = input.displayName?.trim();
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    return this.prisma.user.create({
      data: {
        email,
        passwordHash: await this.passwordService.hash(`google:${randomUUID()}`),
        displayName: displayName || undefined,
        role: 'USER',
        tier: UserTier.FREE,
      },
    });
  }

  async createLineMember(input: { email: string; displayName?: string }) {
    const email = input.email.trim().toLowerCase();
    const displayName = input.displayName?.trim();
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    return this.prisma.user.create({
      data: {
        email,
        passwordHash: await this.passwordService.hash(`line:${randomUUID()}`),
        displayName: displayName || undefined,
        role: 'USER',
        tier: UserTier.FREE,
      },
    });
  }

  private normalizeTier(tier?: UserTierInput) {
    if (tier === UserTier.VIP) {
      return UserTier.VIP;
    }

    if (tier === UserTier.PREMIUM) {
      return UserTier.PREMIUM;
    }

    return UserTier.FREE;
  }

  async validateCredentials(email: string, password: string) {
    const user = await this.findByEmail(email);
    let passwordMatches = false;

    if (user && !user.deletedAt && user.status === 'ACTIVE') {
      try {
        passwordMatches = await this.passwordService.verify(
          password,
          user.passwordHash,
        );
      } catch {
        passwordMatches = false;
      }
    }

    if (
      !user ||
      user.deletedAt ||
      user.status !== 'ACTIVE' ||
      !passwordMatches
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  toPublicUser(user: {
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
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      phone: user.phone,
      role: user.role,
      tier: user.tier,
      status: user.status,
      createdAt: user.createdAt,
    };
  }

  async assignRole(assignerId: string, targetUserId: string, roleId: string) {
    const assignerAssignments = await this.prisma.userRoleAssignment.findMany({
      where: { userId: assignerId },
      include: { role: true },
    });
    const assignerMaxLevel = Math.max(...assignerAssignments.map(a => a.role.level), 0);

    const roleToAssign = await this.prisma.role.findUnique({
      where: { id: roleId },
    });
    if (!roleToAssign) throw new NotFoundException('Role not found');

    if (roleToAssign.level >= assignerMaxLevel) {
      throw new UnauthorizedException('You cannot assign a role with a level equal to or higher than your own.');
    }

    const targetAssignments = await this.prisma.userRoleAssignment.findMany({
      where: { userId: targetUserId },
      include: { role: true },
    });
    const targetMaxLevel = Math.max(...targetAssignments.map(a => a.role.level), 0);

    if (targetMaxLevel >= assignerMaxLevel) {
       throw new UnauthorizedException('You cannot modify roles of a user with a level equal to or higher than your own.');
    }

    return this.prisma.userRoleAssignment.create({
      data: {
        userId: targetUserId,
        roleId: roleId,
      },
    });
  }

  async softDeleteUser(targetUserId: string) {
    await this.findByIdOrThrow(targetUserId);
    return this.prisma.user.update({
      where: { id: targetUserId },
      data: { deletedAt: new Date(), status: 'DELETED' },
    });
  }

  async hardDeleteUser(targetUserId: string) {
    return this.prisma.user.delete({
      where: { id: targetUserId },
    });
  }
}
