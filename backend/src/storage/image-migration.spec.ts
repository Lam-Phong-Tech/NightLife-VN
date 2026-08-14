import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import {
  imageContentHash,
  inspectImageFile,
  optimizedImageBaseKey,
  storedVariantsAreValid,
  withMigratedContentImageUrl,
} from './image-migration';

describe('image migration helpers', () => {
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'nightlife-image-migration-'));
  });

  afterEach(async () => {
    try {
      await rm(directory, {
        recursive: true,
        force: true,
        maxRetries: 5,
        retryDelay: 100,
      });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EBUSY') throw error;
    }
  }, 15_000);

  it('detects a PNG even when the file is named .webp', async () => {
    const filePath = join(directory, 'fake.webp');
    await sharp({
      create: {
        width: 32,
        height: 16,
        channels: 4,
        background: '#ff00ff',
      },
    })
      .png()
      .toFile(filePath);

    await expect(inspectImageFile(filePath)).resolves.toMatchObject({
      format: 'png',
      width: 32,
      height: 16,
    });
    expect(
      optimizedImageBaseKey('media-id', await imageContentHash(filePath)),
    ).toMatch(/^media-id-opt-[a-f0-9]{12}$/);
  });

  it('validates real WebP and AVIF variant bytes and dimensions', async () => {
    const webpKey = 'image-40.webp';
    const avifKey = 'image-40.avif';
    const input = {
      create: {
        width: 40,
        height: 20,
        channels: 4 as const,
        background: '#000000',
      },
    };
    const [webp, avif] = await Promise.all([
      sharp(input).webp().toBuffer(),
      sharp(input).avif().toBuffer(),
    ]);
    await Promise.all([
      writeFile(join(directory, webpKey), webp),
      writeFile(join(directory, avifKey), avif),
    ]);

    await expect(
      storedVariantsAreValid(directory, [
        {
          width: 40,
          webpKey,
          avifKey,
          webpSizeBytes: 1,
          avifSizeBytes: 1,
        },
      ]),
    ).resolves.toBe(true);
  });

  it('updates only content that references the migrated media id', () => {
    expect(
      withMigratedContentImageUrl(
        { imageMediaId: 'media-1', imageUrl: '/old.png', order: 1 },
        'media-1',
        '/new.webp',
      ),
    ).toEqual({ imageMediaId: 'media-1', imageUrl: '/new.webp', order: 1 });
    expect(
      withMigratedContentImageUrl(
        { imageMediaId: 'other' },
        'media-1',
        '/new.webp',
      ),
    ).toEqual({ imageMediaId: 'other' });
  });
});
