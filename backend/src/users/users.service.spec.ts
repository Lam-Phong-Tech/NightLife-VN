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
    $transaction: jest.fn(),
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    partnerAccount: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    store: {
      updateMany: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    storePermission: {
      updateMany: jest.fn(),
      upsert: jest.fn(),
    },
  } as unknown as jest.Mocked<PrismaService>;

  const passwordService = {
    hash: jest.fn(),
    verify: jest.fn(),
  } as unknown as jest.Mocked<PasswordService>;

  let service: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation((callback) => callback(prisma));
    service = new UsersService(prisma, passwordService);
  });

  it('returns the active user when the password matches', async () => {
    prisma.user.findUnique.mockResolvedValue(activeUser);
    passwordService.verify.mockResolvedValue(true);

    await expect(
      service.validateCredentials(activeUser.email, 'Str0ngPass!'),
    ).resolves.toEqual(activeUser);
  });

  it('returns unauthorized instead of leaking password verification failures', async () => {
    prisma.user.findUnique.mockResolvedValue(activeUser);
    passwordService.verify.mockRejectedValue(new Error('Invalid scrypt hash'));

    await expect(
      service.validateCredentials(activeUser.email, "' OR 1=1 --"),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('creates regular member accounts with the MEMBER tier', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    passwordService.hash.mockResolvedValue('hashed-password');
    prisma.user.create.mockResolvedValue({
      ...activeUser,
      email: 'new-member@nightlife.vn',
      tier: 'MEMBER',
    });

    await service.createUser({
      email: ' New-Member@Nightlife.vn ',
      password: 'Str0ngPass1',
      displayName: ' New Member ',
    });

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'new-member@nightlife.vn',
        displayName: 'New Member',
        passwordHash: 'hashed-password',
        role: 'USER',
        tier: 'MEMBER',
      }),
    });
  });

  it('updates a user password with a hashed value', async () => {
    passwordService.hash.mockResolvedValue('new-hashed-password');
    prisma.user.update.mockResolvedValue({
      ...activeUser,
      passwordHash: 'new-hashed-password',
    });

    await service.updatePassword(activeUser.id, 'NewStr0ngPass!');

    expect(passwordService.hash).toHaveBeenCalledWith('NewStr0ngPass!');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: activeUser.id },
      data: { passwordHash: 'new-hashed-password' },
    });
  });

  it('updates profile and links store for PARTNER user', async () => {
    const partnerUser = {
      ...activeUser,
      id: 'partner-user-1',
      role: 'PARTNER',
    };
    prisma.user.findUnique.mockResolvedValue(partnerUser);
    prisma.user.update.mockResolvedValue(partnerUser);
    prisma.partnerAccount.findFirst.mockResolvedValue({ id: 'pa-1', userId: 'partner-user-1' });
    prisma.store.findMany.mockResolvedValue([]);
    prisma.store.updateMany.mockResolvedValue({ count: 0 });
    prisma.store.update.mockResolvedValue({});
    prisma.storePermission.upsert.mockResolvedValue({});

    await service.updateProfile('partner-user-1', {
      displayName: 'New Partner Name',
      email: 'partner@nightlife.vn',
      storeId: 'store-1',
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'partner-user-1' },
      data: {
        email: 'partner@nightlife.vn',
        displayName: 'New Partner Name',
        phone: null,
      },
    });

    expect(prisma.partnerAccount.findFirst).toHaveBeenCalledWith({
      where: { userId: 'partner-user-1', deletedAt: null },
    });

    expect(prisma.store.update).toHaveBeenCalledWith({
      where: { id: 'store-1' },
      data: { partnerAccountId: 'pa-1', ownerId: 'partner-user-1' },
    });
  });
});
