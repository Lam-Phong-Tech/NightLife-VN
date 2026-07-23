import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MediaAccess } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from './storage.service';
import { validateUploadedFile } from './upload-file-validation';

jest.mock('./upload-file-validation', () => ({
  validateUploadedFile: jest.fn(),
}));

describe('StorageService', () => {
  const prisma = {
    media: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
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
    jest.mocked(validateUploadedFile).mockResolvedValue({
      mimeType: 'image/png',
      originalName: 'image.png',
    });
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

  it('allows admin public uploads for appearance logos', async () => {
    prisma.media.create.mockResolvedValue({ id: 'media-appearance-logo-1' });

    await service.saveLocalFile(file, {
      ownerId: 'admin-1',
      userRole: 'ADMIN',
      access: 'PUBLIC',
      purpose: 'APPEARANCE_LOGO',
    });

    expect(prisma.media.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ownerId: 'admin-1',
        access: MediaAccess.PUBLIC,
        purpose: 'APPEARANCE_LOGO',
      }),
    });
  });

  it('normalizes a supported YouTube URL before storing it', async () => {
    prisma.media.create.mockResolvedValue({ id: 'media-video-1' });

    await service.saveExternalUrl('https://youtu.be/dQw4w9WgXcQ?t=42', {
      ownerId: 'admin-1',
      userRole: 'ADMIN',
      access: 'PUBLIC',
      purpose: 'STORE_VIDEO',
      storeId: 'store-1',
    });

    expect(prisma.media.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        originalName: 'YouTube dQw4w9WgXcQ',
        mimeType: 'video/youtube',
        purpose: 'STORE_VIDEO',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      }),
    });
  });

  it('rejects non-YouTube external media URLs', async () => {
    await expect(
      service.saveExternalUrl('https://example.com/video.mp4', {
        ownerId: 'admin-1',
        userRole: 'ADMIN',
        access: 'PUBLIC',
        purpose: 'STORE_VIDEO',
        storeId: 'store-1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.media.create).not.toHaveBeenCalled();
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

  it('marks media deleted when an admin removes a local upload', async () => {
    prisma.media.findUnique.mockResolvedValue({
      id: 'media-1',
      ownerId: 'owner-1',
      storeId: 'store-1',
      castId: null,
      contentId: null,
      bookingId: null,
      billId: null,
      storageKey: 'stored-image',
      deletedAt: null,
      cast: null,
      content: null,
      booking: null,
      bill: null,
    });
    prisma.media.update.mockResolvedValue({ id: 'media-1' });

    await expect(
      service.deleteMedia('media-1', {
        id: 'admin-1',
        role: 'ADMIN',
      }),
    ).resolves.toEqual({ id: 'media-1', deleted: true });

    expect(prisma.media.update).toHaveBeenCalledWith({
      where: { id: 'media-1' },
      data: {
        status: 'DELETED',
        deletedAt: expect.any(Date),
      },
    });
  });

  it('rejects media deletion by an unrelated user', async () => {
    prisma.media.findUnique.mockResolvedValue({
      id: 'media-1',
      ownerId: 'owner-1',
      storeId: null,
      castId: null,
      contentId: null,
      bookingId: null,
      billId: null,
      storageKey: 'stored-image',
      deletedAt: null,
      cast: null,
      content: null,
      booking: null,
      bill: null,
    });

    await expect(
      service.deleteMedia('media-1', {
        id: 'other-user',
        role: 'USER',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.media.update).not.toHaveBeenCalled();
  });
});
