import { UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from '../common/password.service';

describe('UsersService', () => {
  const activeUser = {
    id: 'user-1',
    email: 'member@nightlife.vn',
    passwordHash: 'legacy-password-hash',
    displayName: 'Member',
    phone: null,
    role: 'USER',
    tier: 'MEMBER',
    status: 'ACTIVE',
    deletedAt: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  const prisma = {
    user: {
      findUnique: jest.fn(),
    },
  } as unknown as jest.Mocked<PrismaService>;

  const passwordService = {
    hash: jest.fn(),
    verify: jest.fn(),
  } as unknown as jest.Mocked<PasswordService>;

  let service: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UsersService(prisma, passwordService);
  });

  it('returns the active user when the password matches', async () => {
    prisma.user.findUnique.mockResolvedValue(activeUser as never);
    passwordService.verify.mockResolvedValue(true);

    await expect(
      service.validateCredentials(activeUser.email, 'Str0ngPass!'),
    ).resolves.toEqual(activeUser);
  });

  it('returns unauthorized instead of leaking password verification failures', async () => {
    prisma.user.findUnique.mockResolvedValue(activeUser as never);
    passwordService.verify.mockRejectedValue(new Error('Invalid scrypt hash'));

    await expect(
      service.validateCredentials(activeUser.email, "' OR 1=1 --"),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
