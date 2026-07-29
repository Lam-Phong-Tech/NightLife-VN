import {
  getUploadPolicy,
  humanReadableUploadSize,
  MAX_APPEARANCE_LOGO_SIZE_BYTES,
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
});
