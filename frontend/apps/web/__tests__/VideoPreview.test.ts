import { describe, expect, it, vi } from 'vitest';
import {
  getVideoPreviewUrl,
  getYoutubeThumbnailUrl,
  getYoutubeVideoId,
} from '../src/lib/media/video-preview';

vi.mock('@/lib/api/client', () => ({
  resolveClientUrl: (url?: string | null) => url || undefined,
}));

describe('video preview helpers', () => {
  it.each([
    ['https://www.youtube.com/watch?v=YJY8lIEdsNM', 'YJY8lIEdsNM'],
    ['https://youtu.be/YJY8lIEdsNM?si=example', 'YJY8lIEdsNM'],
    ['https://www.youtube.com/shorts/YJY8lIEdsNM', 'YJY8lIEdsNM'],
    ['https://www.youtube.com/embed/YJY8lIEdsNM', 'YJY8lIEdsNM'],
    ['https://www.youtube.com/live/YJY8lIEdsNM', 'YJY8lIEdsNM'],
  ])('extracts the YouTube id from %s', (url, expectedId) => {
    expect(getYoutubeVideoId(url)).toBe(expectedId);
  });

  it('creates a thumbnail for a youtu.be search result', () => {
    expect(getYoutubeThumbnailUrl('https://youtu.be/YJY8lIEdsNM?si=example', 'default'))
      .toBe('https://img.youtube.com/vi/YJY8lIEdsNM/default.jpg');
  });

  it('falls back to the store thumbnail for an uploaded video', () => {
    expect(getVideoPreviewUrl({
      url: '/uploads/store-video.mp4',
      storeThumbnailUrl: '/uploads/store-cover.jpg',
    })).toBe('/uploads/store-cover.jpg');
  });
});
