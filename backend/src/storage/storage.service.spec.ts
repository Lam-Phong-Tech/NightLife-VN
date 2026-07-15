import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MediaAccess } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  const prisma = {
    media: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    bill: {
      findFirst: jest.fn(),
    },
    booking: {
      findFirst: jest.fn(),
    },
    cast: {
      findUnique: jest.fn(),
    },
    content: {
      findFirst: jest.fn(),
    },
  } as unknown as jest.Mocked<PrismaService>;

  const configService = {
    get: jest.fn((key: string, fallback?: string) => {
      const values: Record<string, string> = {
        STORAGE_LOCAL_DIR: 'uploads-test',
        PUBLIC_BASE_URL: 'http://localhost:3001',
        PORT: '3001',
      };

      return values[key] ?? fallback;
    }),
  } as unknown as jest.Mocked<ConfigService>;
  const accessService = {
    ensureStoreAccess: jest.fn(),
  };

  const systemConfigService = {
    getStorageUsage: jest.fn().mockResolvedValue({
      limit: 5,
      usedBytes: 0,
    }),
  };

  const file = {
    filename: 'stored-image',
    originalname: 'image.png',
    mimetype: 'image/png',
    size: 128,
    path: 'uploads-test/stored-image',
  };

  let service: StorageService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new StorageService(
      configService,
      prisma,
      accessService as never,
      systemConfigService as never,
    );
  });

  it('stores local media metadata with relation ids and public access', async () => {
    prisma.media.create.mockResolvedValue({ id: 'media-1' });

    await service.saveLocalFile(file, {
      ownerId: 'owner-1',
      userRole: 'ADMIN',
      access: 'PUBLIC',
      storeId: 'store-1',
      castId: 'cast-1',
      billId: 'bill-1',
      contentId: 'content-1',
      purpose: 'store-cover',
    });

    expect(prisma.media.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ownerId: 'owner-1',
        storeId: 'store-1',
        castId: 'cast-1',
        billId: 'bill-1',
        contentId: 'content-1',
        access: MediaAccess.PUBLIC,
        mimeType: 'image/png',
        purpose: 'store-cover',
      }),
    });
  });

  it('rejects invalid access values', async () => {
    await expect(
      service.saveLocalFile(file, {
        ownerId: 'owner-1',
        access: 'PRIVATE' as never,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('stores bill evidence uploads as protected media linked to the bill', async () => {
    prisma.media.create.mockResolvedValue({ id: 'media-bill-1' });
    prisma.bill.findFirst.mockResolvedValue({
      userId: 'member-1',
      submittedByUserId: null,
    });

    await service.saveLocalFile(file, {
      ownerId: 'member-1',
      userRole: 'USER',
      billId: 'bill-1',
      purpose: 'bill-evidence',
      access: 'PROTECTED',
    });

    expect(prisma.media.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ownerId: 'member-1',
        billId: 'bill-1',
        purpose: 'bill-evidence',
        access: MediaAccess.PROTECTED,
        url: 'http://localhost:3001/storage/files/stored-image',
      }),
    });
  });

  it('rejects user public uploads', async () => {
    await expect(
      service.saveLocalFile(file, {
        ownerId: 'member-1',
        userRole: 'USER',
        access: 'PUBLIC',
        billId: 'bill-1',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.media.create).not.toHaveBeenCalled();
  });

  it('rejects user protected uploads without bill or booking scope', async () => {
    await expect(
      service.saveLocalFile(file, {
        ownerId: 'member-1',
        userRole: 'USER',
        access: 'PROTECTED',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.media.create).not.toHaveBeenCalled();
  });

  it('rejects user uploads for another user bill', async () => {
    prisma.bill.findFirst.mockResolvedValue({
      userId: 'member-2',
      submittedByUserId: null,
    });

    await expect(
      service.saveLocalFile(file, {
        ownerId: 'member-1',
        userRole: 'USER',
        access: 'PROTECTED',
        billId: 'bill-1',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows user protected uploads for an owned booking', async () => {
    prisma.media.create.mockResolvedValue({ id: 'media-booking-1' });
    prisma.booking.findFirst.mockResolvedValue({ userId: 'member-1' });

    await service.saveLocalFile(file, {
      ownerId: 'member-1',
      userRole: 'USER',
      access: 'PROTECTED',
      bookingId: 'booking-1',
    });

    expect(prisma.media.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ownerId: 'member-1',
        bookingId: 'booking-1',
        access: MediaAccess.PROTECTED,
      }),
    });
  });

  it('rejects partner public uploads without store, cast, or content scope', async () => {
    await expect(
      service.saveLocalFile(file, {
        ownerId: 'partner-1',
        userRole: 'PARTNER',
        access: 'PUBLIC',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.media.create).not.toHaveBeenCalled();
  });

  it('checks partner store uploads through AccessService', async () => {
    prisma.media.create.mockResolvedValue({ id: 'media-store-1' });

    await service.saveLocalFile(file, {
      ownerId: 'partner-1',
      userRole: 'PARTNER',
      access: 'PUBLIC',
      storeId: 'store-1',
    });

    expect(accessService.ensureStoreAccess).toHaveBeenCalledWith(
      { id: 'partner-1', role: 'PARTNER' },
      'store-1',
    );
  });

  it('rejects partner uploads for stores outside their scope', async () => {
    accessService.ensureStoreAccess.mockRejectedValueOnce(
      new ForbiddenException('You cannot access data for this store'),
    );

    await expect(
      service.saveLocalFile(file, {
        ownerId: 'partner-1',
        userRole: 'PARTNER',
        access: 'PUBLIC',
        storeId: 'store-2',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.media.create).not.toHaveBeenCalled();
  });

  it('resolves partner cast uploads to cast store scope', async () => {
    prisma.media.create.mockResolvedValue({ id: 'media-cast-1' });
    prisma.cast.findUnique.mockResolvedValue({ storeId: 'store-1' });

    await service.saveLocalFile(file, {
      ownerId: 'partner-1',
      userRole: 'PARTNER',
      access: 'PUBLIC',
      castId: 'cast-1',
    });

    expect(accessService.ensureStoreAccess).toHaveBeenCalledWith(
      { id: 'partner-1', role: 'PARTNER' },
      'store-1',
    );
  });

  it('resolves partner content uploads to content store scope', async () => {
    prisma.media.create.mockResolvedValue({ id: 'media-content-1' });
    prisma.content.findFirst.mockResolvedValue({ storeId: 'store-1' });

    await service.saveLocalFile(file, {
      ownerId: 'partner-1',
      userRole: 'PARTNER',
      access: 'PROTECTED',
      contentId: 'content-1',
    });

    expect(accessService.ensureStoreAccess).toHaveBeenCalledWith(
      { id: 'partner-1', role: 'PARTNER' },
      'store-1',
    );
  });

  it('rejects admin public orphan uploads', async () => {
    await expect(
      service.saveLocalFile(file, {
        ownerId: 'admin-1',
        userRole: 'ADMIN',
        access: 'PUBLIC',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.media.create).not.toHaveBeenCalled();
  });

  it('allows admin public uploads for allowed global banner purpose', async () => {
    prisma.media.create.mockResolvedValue({ id: 'media-banner-1' });

    await service.saveLocalFile(file, {
      ownerId: 'admin-1',
      userRole: 'ADMIN',
      access: 'PUBLIC',
      purpose: 'BANNER_GLOBAL',
    });

    expect(prisma.media.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ownerId: 'admin-1',
        access: MediaAccess.PUBLIC,
        purpose: 'BANNER_GLOBAL',
      }),
    });
  });

  it('allows admin public uploads for appearance icons', async () => {
    prisma.media.create.mockResolvedValue({ id: 'media-appearance-icon-1' });

    await service.saveLocalFile(file, {
      ownerId: 'admin-1',
      userRole: 'ADMIN',
      access: 'PUBLIC',
      purpose: 'APPEARANCE_ICON',
    });

    expect(prisma.media.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ownerId: 'admin-1',
        access: MediaAccess.PUBLIC,
        purpose: 'APPEARANCE_ICON',
      }),
    });
  });

  it('blocks protected media for another user', async () => {
    prisma.media.findUnique.mockResolvedValue({
      access: MediaAccess.PROTECTED,
      ownerId: 'owner-1',
      mimeType: 'image/png',
      storageKey: 'stored-image',
    });

    await expect(
      service.resolveProtectedLocalFile('stored-image', {
        id: 'other-user',
        role: 'USER',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows a partner to open protected media from an accessible store', async () => {
    prisma.media.findUnique.mockResolvedValue({
      access: MediaAccess.PROTECTED,
      ownerId: 'owner-1',
      storeId: 'store-1',
      mimeType: 'image/png',
      storageKey: 'stored-image',
    });

    await expect(
      service.resolveProtectedLocalFile('stored-image', {
        id: 'partner-1',
        role: 'PARTNER',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        mediaFile: expect.objectContaining({ storeId: 'store-1' }),
      }),
    );
    expect(accessService.ensureStoreAccess).toHaveBeenCalledWith(
      { id: 'partner-1', role: 'PARTNER' },
      'store-1',
    );
  });
});
