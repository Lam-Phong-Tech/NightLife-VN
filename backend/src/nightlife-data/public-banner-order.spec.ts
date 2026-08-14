import { comparePublicBanners } from './nightlife-data.service';

describe('comparePublicBanners', () => {
  it('sorts by position, metadata order, creation date, then id', () => {
    const banners = [
      {
        id: 'c',
        createdAt: '2026-01-03T00:00:00.000Z',
        metadata: { position: 'Trang chủ #1', order: 3 },
      },
      {
        id: 'b',
        createdAt: '2026-01-02T00:00:00.000Z',
        metadata: { position: 'Trang chủ #2', order: 1 },
      },
      {
        id: 'a',
        createdAt: '2026-01-01T00:00:00.000Z',
        metadata: { position: 'Trang chủ #1', order: 1 },
      },
    ];

    expect(
      banners.sort(comparePublicBanners).map((banner) => banner.id),
    ).toEqual(['a', 'c', 'b']);
  });
});
