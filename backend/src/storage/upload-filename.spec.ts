import { normalizeUploadFileName } from './upload-filename';

describe('normalizeUploadFileName', () => {
  it('keeps a safe matching file name', () => {
    expect(
      normalizeUploadFileName('night-life.JPG', 'image/jpeg', 'stored-key'),
    ).toEqual({
      originalName: 'night-life.jpg',
      error: null,
    });
  });

  it.each(['', '   ', '\u200b\u200e'])(
    'generates a fallback for an empty or invisible name',
    (name) => {
      expect(
        normalizeUploadFileName(name, 'image/png', '1234567890abcdef'),
      ).toEqual({
        originalName: 'media-1234567890ab.png',
        error: null,
      });
    },
  );

  it('adds the detected extension when the name has no extension', () => {
    expect(
      normalizeUploadFileName('anh bia', 'image/webp', 'stored-key'),
    ).toEqual({
      originalName: 'anh bia.webp',
      error: null,
    });
  });

  it('rejects an extension that disagrees with the detected content', () => {
    expect(
      normalizeUploadFileName('video.jpg', 'video/mp4', 'stored-key').error,
    ).toContain('không khớp');
  });

  it('removes paths and unsafe filename characters', () => {
    expect(
      normalizeUploadFileName(
        '../folder/anh:<bia>.png',
        'image/png',
        'stored-key',
      ).originalName,
    ).toBe('anh--bia-.png');
  });
});
