import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { ImageProcessingService } from './image-processing.service';

describe('ImageProcessingService', () => {
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'nightlife-image-processing-'));
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it('automatically creates a 200px store hero variant for new uploads', async () => {
    const sourcePath = join(directory, 'source.png');
    await sharp({
      create: {
        width: 210,
        height: 140,
        channels: 4,
        background: '#251b37',
      },
    })
      .png()
      .toFile(sourcePath);

    const result = await new ImageProcessingService().processImage(
      sourcePath,
      'store-media',
      directory,
      'store-hero',
    );

    expect(result.variants.map((variant) => variant.width)).toEqual([200]);
    expect(result.variants[0]).toMatchObject({
      webpKey: 'store-media-200.webp',
      avifKey: 'store-media-200.avif',
    });
  });
});
