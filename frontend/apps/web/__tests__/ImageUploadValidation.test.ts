import { describe, expect, it } from 'vitest';

import {
  getTourCoverImageValidationError,
  getStoreImageValidationError,
  MAX_TOUR_COVER_IMAGE_SIZE_BYTES,
  MAX_STORE_IMAGE_SIZE_BYTES,
} from '../src/lib/media/image-upload-validation';

const imageFile = (name: string, type: string, size = 1) =>
  new File([new Uint8Array(size)], name, { type });

describe('store image upload validation', () => {
  it.each([
    ['cover.jpg', 'image/jpeg'],
    ['cover.png', 'image/png'],
    ['cover.webp', 'image/webp'],
    ['cover.gif', 'image/gif'],
    ['cover.svg', 'image/svg+xml'],
  ])('accepts supported image %s', (name, type) => {
    expect(getStoreImageValidationError(imageFile(name, type))).toBeNull();
  });

  it('uses the extension when the browser does not provide a MIME type', () => {
    expect(getStoreImageValidationError(imageFile('cover.JPEG', ''))).toBeNull();
  });

  it('reports the file name and accepted formats for an unsupported image', () => {
    expect(getStoreImageValidationError(imageFile('cover.heic', 'image/heic'))).toBe(
      'Ảnh "cover.heic" không đúng định dạng. Chỉ chấp nhận JPG, JPEG, PNG, WebP, GIF hoặc SVG.',
    );
  });

  it('reports the file name and size limit for an oversized image', () => {
    const file = {
      name: 'large.png',
      type: 'image/png',
      size: MAX_STORE_IMAGE_SIZE_BYTES + 1,
    } as File;

    expect(getStoreImageValidationError(file)).toBe(
      'Ảnh "large.png" vượt quá dung lượng 15MB.',
    );
  });
});

describe('tour cover image upload validation', () => {
  it('accepts supported raster image formats', () => {
    expect(
      getTourCoverImageValidationError(imageFile('cover.webp', 'image/webp')),
    ).toBeNull();
  });

  it('rejects video MIME types and video extensions', () => {
    expect(
      getTourCoverImageValidationError(imageFile('cover.mp4', 'video/mp4')),
    ).toContain('không chấp nhận video');
    expect(
      getTourCoverImageValidationError(imageFile('cover.mp4', 'image/jpeg')),
    ).toContain('không chấp nhận video');
  });

  it('rejects empty and oversized files', () => {
    expect(
      getTourCoverImageValidationError(imageFile('cover.jpg', 'image/jpeg', 0)),
    ).toContain('file rỗng');
    expect(
      getTourCoverImageValidationError({
        name: 'cover.jpg',
        type: 'image/jpeg',
        size: MAX_TOUR_COVER_IMAGE_SIZE_BYTES + 1,
      } as File),
    ).toContain('15MB');
  });
});
