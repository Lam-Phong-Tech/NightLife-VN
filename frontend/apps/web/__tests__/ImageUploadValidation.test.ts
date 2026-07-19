import { describe, expect, it } from 'vitest';

import {
  getStoreImageValidationError,
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
