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
    service = new StorageService(configService, prisma);
  });

  it('stores local media metadata with relation ids and public access', async () => {
    prisma.media.create.mockResolvedValue({ id: 'media-1' } as never);

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

  it('blocks protected media for another user', async () => {
    prisma.media.findUnique.mockResolvedValue({
      access: MediaAccess.PROTECTED,
      ownerId: 'owner-1',
      mimeType: 'image/png',
      storageKey: 'stored-image',
    } as never);

    await expect(
      service.resolveProtectedLocalFile('stored-image', {
        id: 'other-user',
        role: 'USER',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
