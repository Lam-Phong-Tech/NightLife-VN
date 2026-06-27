import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from '../common/password.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
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

  async createUser(input: {
    email: string;
    password: string;
    displayName?: string;
    phone?: string;
    role?: 'USER' | 'PARTNER' | 'OPERATOR' | 'STAFF' | 'ADMIN';
    tier?: 'FREE' | 'PREMIUM' | 'VIP';
  }) {
    const email = input.email.toLowerCase();
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    return this.prisma.user.create({
      data: {
        email,
        passwordHash: await this.passwordService.hash(input.password),
        displayName: input.displayName,
        phone: input.phone,
        role: input.role ?? 'USER',
        tier: input.tier ?? 'FREE',
      },
    });
  }

  async validateCredentials(email: string, password: string) {
    const user = await this.findByEmail(email);

    if (
      !user ||
      user.deletedAt ||
      user.status !== 'ACTIVE' ||
      !(await this.passwordService.verify(password, user.passwordHash))
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
}
