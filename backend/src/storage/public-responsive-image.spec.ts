import { toPublicResponsiveImage } from './public-responsive-image';

describe('toPublicResponsiveImage', () => {
  it('builds public URLs without exposing storage keys', () => {
    expect(
      toPublicResponsiveImage({
        id: 'media-1',
        url: 'https://example.test/storage/public/image-800.webp',
        metadata: {
          originalWidth: 1920,
          originalHeight: 720,
          variants: [
            {
              width: 800,
              webpKey: 'private-800.webp',
              avifKey: 'private-800.avif',
            },
            {
              width: 400,
              webpKey: 'private-400.webp',
              avifKey: 'private-400.avif',
            },
          ],
        },
      }),
    ).toEqual({
      src: 'https://example.test/storage/public/image-800.webp',
      width: 1920,
      height: 720,
      variants: [
        {
          width: 400,
          webpUrl:
            'https://example.test/storage/public/image-800.webp?width=400&format=webp',
          avifUrl:
            'https://example.test/storage/public/image-800.webp?width=400&format=avif',
        },
        {
          width: 800,
          webpUrl:
            'https://example.test/storage/public/image-800.webp?width=800&format=webp',
          avifUrl:
            'https://example.test/storage/public/image-800.webp?width=800&format=avif',
        },
      ],
    });
  });

  it('returns null for legacy media without valid variants', () => {
    expect(
      toPublicResponsiveImage({
        id: 'legacy',
        url: '/storage/public/legacy.png',
        metadata: null,
      }),
    ).toBeNull();
  });
});
