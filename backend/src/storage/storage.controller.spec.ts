import { BadRequestException, NotFoundException } from '@nestjs/common';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  parseRequestedImageFormat,
  parseRequestedImageWidth,
  selectImageVariant,
  StorageController,
} from './storage.controller';

describe('StorageController responsive image helpers', () => {
  const metadata = {
    variants: [
      { width: 1200, webpKey: 'image-1200.webp', avifKey: 'image-1200.avif' },
      { width: 400, webpKey: 'image-400.webp', avifKey: 'image-400.avif' },
      { width: 800, webpKey: 'image-800.webp', avifKey: 'image-800.avif' },
    ],
  };

  it('selects the smallest variant that satisfies the requested width', () => {
    expect(selectImageVariant(metadata, 401)?.width).toBe(800);
    expect(selectImageVariant(metadata, 800)?.width).toBe(800);
    expect(selectImageVariant(metadata, 1600)?.width).toBe(1200);
  });

  it.each(['0', '-1', '400.5', '4097', 'not-a-number'])(
    'rejects invalid width %s',
    (value) => {
      expect(() => parseRequestedImageWidth(value)).toThrow(
        BadRequestException,
      );
    },
  );

  it('accepts only supported formats', () => {
    expect(parseRequestedImageFormat()).toBe('auto');
    expect(parseRequestedImageFormat('AVIF')).toBe('avif');
    expect(() => parseRequestedImageFormat('png')).toThrow(BadRequestException);
  });
});

describe('StorageController public responsive files', () => {
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'nightlife-storage-controller-'));
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  function responseMock() {
    return {
      set: jest.fn(),
      type: jest.fn(),
      sendFile: jest.fn((path: string) => path),
    };
  }

  it('serves the nearest AVIF width with immutable caching', async () => {
    const defaultPath = join(directory, 'image-800.webp');
    await Promise.all([
      writeFile(defaultPath, Buffer.from('webp')),
      writeFile(join(directory, 'image-800.avif'), Buffer.from('avif')),
    ]);
    const storageService = {
      isR2Enabled: jest.fn().mockReturnValue(false),
      resolvePublicLocalFile: jest.fn().mockResolvedValue({
        path: defaultPath,
        storageKey: 'image-800.webp',
        mimeType: 'image/webp',
        mediaFile: {
          storageKey: 'image-800.webp',
          mimeType: 'image/webp',
          metadata: {
            variants: [
              {
                width: 800,
                webpKey: 'image-800.webp',
                avifKey: 'image-800.avif',
              },
            ],
          },
        },
      }),
    };
    const response = responseMock();
    const controller = new StorageController(storageService as never);

    await controller.getPublicFile(
      'image-800.webp',
      'image/avif,image/webp',
      '401',
      'auto',
      response as never,
    );

    expect(response.type).toHaveBeenCalledWith('image/avif');
    expect(response.sendFile).toHaveBeenCalledWith(
      join(directory, 'image-800.avif'),
    );
    expect(response.set).toHaveBeenCalledWith(
      'Cache-Control',
      'public, max-age=31536000, immutable',
    );
  });

  it.each([
    ['avif', 'image/avif'],
    ['webp', 'image/webp'],
  ] as const)(
    'returns 404 when a forced %s variant is unavailable',
    async (format, accept) => {
      const defaultPath = join(directory, 'legacy.png');
      await writeFile(defaultPath, Buffer.from('png'));
      const controller = new StorageController({
        isR2Enabled: jest.fn().mockReturnValue(false),
        resolvePublicLocalFile: jest.fn().mockResolvedValue({
          path: defaultPath,
          storageKey: 'legacy.png',
          mimeType: 'image/png',
          mediaFile: {
            storageKey: 'legacy.png',
            mimeType: 'image/png',
            metadata: null,
          },
        }),
      } as never);

      await expect(
        controller.getPublicFile(
          'legacy.png',
          accept,
          undefined,
          format,
          responseMock() as never,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
    },
  );
});
