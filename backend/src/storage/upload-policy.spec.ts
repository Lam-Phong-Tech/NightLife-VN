import {
  getUploadPolicy,
  humanReadableUploadSize,
  MAX_APPEARANCE_ICON_SIZE_BYTES,
  MAX_APPEARANCE_LOGO_SIZE_BYTES,
  MAX_VIDEO_UPLOAD_SIZE_BYTES,
} from './upload-policy';

describe('appearance logo upload policy', () => {
  it('allows appearance logos up to 5MB', () => {
    expect(MAX_APPEARANCE_LOGO_SIZE_BYTES).toBe(5 * 1024 * 1024);
    expect(getUploadPolicy('APPEARANCE_LOGO')?.maxSizeBytes).toBe(
      MAX_APPEARANCE_LOGO_SIZE_BYTES,
    );
    expect(humanReadableUploadSize(MAX_APPEARANCE_LOGO_SIZE_BYTES)).toBe(
      '5MB',
    );
  });

  it('allows JPG uploads for appearance logos', () => {
    expect(getUploadPolicy('APPEARANCE_LOGO')?.allowedMimeTypes).toContain(
      'image/jpeg',
    );
  });
});

describe('video and appearance icon upload policies', () => {
  it('allows videos up to 100MB', () => {
    expect(MAX_VIDEO_UPLOAD_SIZE_BYTES).toBe(100 * 1024 * 1024);
    expect(getUploadPolicy('STORE_VIDEO')?.maxSizeBytes).toBe(
      MAX_VIDEO_UPLOAD_SIZE_BYTES,
    );
    expect(humanReadableUploadSize(MAX_VIDEO_UPLOAD_SIZE_BYTES)).toBe(
      '100MB',
    );
  });

  it('allows appearance icons up to 512KB', () => {
    expect(MAX_APPEARANCE_ICON_SIZE_BYTES).toBe(512 * 1024);
    expect(getUploadPolicy('APPEARANCE_ICON')?.maxSizeBytes).toBe(
      MAX_APPEARANCE_ICON_SIZE_BYTES,
    );
    expect(humanReadableUploadSize(MAX_APPEARANCE_ICON_SIZE_BYTES)).toBe(
      '512KB',
    );
  });

  it('allows JPG uploads for appearance icons', () => {
    expect(getUploadPolicy('APPEARANCE_ICON')?.allowedMimeTypes).toContain(
      'image/jpeg',
    );
  });
});
