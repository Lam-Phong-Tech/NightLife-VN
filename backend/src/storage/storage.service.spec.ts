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
    service = new StorageService(configService, prisma, accessService as never);
  });

  it('stores local media metadata with relation ids and public access', async () => {
    prisma.media.create.mockResolvedValue({ id: 'media-1' });

    await service.saveLocalFile(file, {
      ownerId: 'owner-1',
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

    await service.saveLocalFile(file, {
      ownerId: 'member-1',
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
