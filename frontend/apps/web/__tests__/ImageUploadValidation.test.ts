import { describe, expect, it } from 'vitest';

import {
  getAdminVideoValidationError,
  getAppearanceImageValidationError,
  getContentImageValidationError,
  getStoreImageValidationError,
  getTourCoverImageValidationError,
  MAX_TOUR_COVER_IMAGE_SIZE_BYTES,
  MAX_STORE_IMAGE_SIZE_BYTES,
} from '../src/lib/media/image-upload-validation';

const mediaFile = (name: string, type: string, size = 1) =>
  new File([new Uint8Array(size)], name, { type });

describe('store image upload validation', () => {
  it.each([
    ['cover.jpg', 'image/jpeg'],
    ['cover.png', 'image/png'],
    ['cover.webp', 'image/webp'],
    ['cover.gif', 'image/gif'],
  ])('accepts supported raster image %s', (name, type) => {
    expect(getStoreImageValidationError(mediaFile(name, type))).toBeNull();
  });

  it('accepts a missing file name when MIME is available for backend fallback', () => {
    expect(
      getStoreImageValidationError(mediaFile('', 'image/png')),
    ).toBeNull();
  });

  it('uses the extension when the browser does not provide a MIME type', () => {
    expect(
      getStoreImageValidationError(mediaFile('cover.JPEG', '')),
    ).toBeNull();
    expect(
      getStoreImageValidationError(
        mediaFile('cover.png', 'application/octet-stream'),
      ),
    ).toBeNull();
  });

  it('rejects SVG and unsupported image formats', () => {
    expect(
      getStoreImageValidationError(mediaFile('cover.svg', 'image/svg+xml')),
    ).toContain('không đúng định dạng');
    expect(
      getStoreImageValidationError(mediaFile('cover.heic', 'image/heic')),
    ).toContain('JPG, JPEG, PNG, WebP hoặc GIF');
  });

  it('rejects a name whose extension disagrees with MIME', () => {
    expect(
      getStoreImageValidationError(mediaFile('cover.jpg', 'image/png')),
    ).toContain('không khớp');
  });

  it('rejects empty and oversized images', () => {
    expect(
      getStoreImageValidationError(mediaFile('empty.png', 'image/png', 0)),
    ).toContain('file rỗng');
    expect(
      getStoreImageValidationError({
        name: 'large.png',
        type: 'image/png',
        size: MAX_STORE_IMAGE_SIZE_BYTES + 1,
      } as File),
    ).toContain('15MB');
  });
});

describe('tour cover image upload validation', () => {
  it('accepts supported raster image formats', () => {
    expect(
      getTourCoverImageValidationError(
        mediaFile('cover.webp', 'image/webp'),
      ),
    ).toBeNull();
  });

  it('rejects video MIME types and video extensions', () => {
    expect(
      getTourCoverImageValidationError(mediaFile('cover.mp4', 'video/mp4')),
    ).toContain('không chấp nhận video');
    expect(
      getTourCoverImageValidationError(mediaFile('cover.mp4', 'image/jpeg')),
    ).toContain('không chấp nhận video');
  });

  it('rejects empty and oversized files', () => {
    expect(
      getTourCoverImageValidationError(
        mediaFile('cover.jpg', 'image/jpeg', 0),
      ),
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

describe('other admin media validation', () => {
  it('accepts MP4 and WebM but rejects MOV', () => {
    expect(
      getAdminVideoValidationError(mediaFile('video.mp4', 'video/mp4')),
    ).toBeNull();
    expect(
      getAdminVideoValidationError(mediaFile('video.webm', 'video/webm')),
    ).toBeNull();
    expect(
      getAdminVideoValidationError(mediaFile('video.mov', 'video/quicktime')),
    ).toContain('MP4 hoặc WebM');
  });

  it('only accepts JPG and PNG for CMS content images', () => {
    expect(
      getContentImageValidationError(mediaFile('banner.jpg', 'image/jpeg')),
    ).toBeNull();
    expect(
      getContentImageValidationError(mediaFile('banner.webp', 'image/webp')),
    ).toContain('JPG, JPEG hoặc PNG');
  });

  it('accepts PNG and SVG for appearance with purpose-specific limits', () => {
    expect(
      getAppearanceImageValidationError(
        mediaFile('icon.svg', 'image/svg+xml'),
        'icon',
      ),
    ).toBeNull();
    expect(
      getAppearanceImageValidationError(
        mediaFile('logo.png', 'image/png'),
        'logo',
      ),
    ).toBeNull();
  });
});
