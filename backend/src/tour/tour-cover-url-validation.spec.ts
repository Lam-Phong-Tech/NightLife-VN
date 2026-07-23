import {
  getTourCoverStorageKey,
  getTourCoverUrlValidationError,
  isSupportedStoredTourCover,
} from './tour-cover-url-validation';

describe('tour cover URL validation', () => {
  it.each([
    'https://images.example.com/tour-cover.jpg',
    'https://images.unsplash.com/photo-123',
    '/storage/public/image-key',
    'data:image/png;base64,iVBORw0KGgo=',
  ])('accepts image-compatible URL %s', (url) => {
    expect(getTourCoverUrlValidationError(url)).toBeNull();
  });

  it.each([
    'https://cdn.example.com/tour.mp4',
    'https://cdn.example.com/tour.WEBM?version=1',
    'https://youtu.be/example',
    'https://vimeo.com/123456',
    'data:video/mp4;base64,AAAA',
  ])('rejects video URL %s', (url) => {
    expect(getTourCoverUrlValidationError(url)).not.toBeNull();
  });

  it('rejects video bytes disguised as an image data URL', () => {
    expect(
      getTourCoverUrlValidationError('data:image/jpeg;base64,AAAAIGZ0eXBpc29t'),
    ).toContain('không hợp lệ');
  });

  it('extracts storage keys so stored media types can be checked', () => {
    expect(
      getTourCoverStorageKey(
        'https://nightlife.vn/api/backend/storage/public/media-key',
      ),
    ).toBe('media-key');
    expect(getTourCoverStorageKey('/images/cover.jpg')).toBeNull();
  });

  it('accepts only supported stored image media', () => {
    expect(
      isSupportedStoredTourCover({
        type: 'IMAGE',
        mimeType: 'image/webp',
      }),
    ).toBe(true);
    expect(
      isSupportedStoredTourCover({
        type: 'VIDEO',
        mimeType: 'video/mp4',
      }),
    ).toBe(false);
    expect(
      isSupportedStoredTourCover({
        type: 'IMAGE',
        mimeType: 'image/svg+xml',
      }),
    ).toBe(false);
  });
});
