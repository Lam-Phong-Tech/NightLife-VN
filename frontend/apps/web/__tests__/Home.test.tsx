import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Page from '../src/app/page';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  contentHotVideosMock,
  contentListMock,
  contentRecommendationsMock,
  contentToursMock,
  trackHotVideoLikeMock,
  trackHotVideoViewMock,
  claimGuestCouponMock,
  claimMemberCouponMock,
  listPublicCouponsMock,
  listStoresStrictMock,
  rankingsListMock,
} = vi.hoisted(() => ({
  contentHotVideosMock: vi.fn(),
  contentListMock: vi.fn(),
  contentRecommendationsMock: vi.fn(),
  contentToursMock: vi.fn(),
  trackHotVideoLikeMock: vi.fn(),
  trackHotVideoViewMock: vi.fn(),
  claimGuestCouponMock: vi.fn(),
  claimMemberCouponMock: vi.fn(),
  listPublicCouponsMock: vi.fn(),
  listStoresStrictMock: vi.fn(),
  rankingsListMock: vi.fn(),
}));

// Need to mock next/image and next/link since they have special behavior
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const imageProps = props as React.ImgHTMLAttributes<HTMLImageElement>;
    return React.createElement('img', { alt: '', ...imageProps });
  },
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
}));

vi.mock('@/lib/api/discovery', () => ({
  discoveryApi: {
    listStoresStrict: listStoresStrictMock,
  },
}));

vi.mock('@/lib/api/content', () => ({
  contentApi: {
    list: contentListMock,
    hotVideos: contentHotVideosMock,
    recommendations: contentRecommendationsMock,
    tours: contentToursMock,
    trackHotVideoLike: trackHotVideoLikeMock,
    trackHotVideoView: trackHotVideoViewMock,
  },
}));

vi.mock('@/lib/api/coupons', () => ({
  couponApi: {
    claimGuestCoupon: claimGuestCouponMock,
    claimMemberCoupon: claimMemberCouponMock,
    listPublicCoupons: listPublicCouponsMock,
  },
}));

vi.mock('@/lib/api/rankings', () => ({
  rankingsApi: {
    list: rankingsListMock,
  },
}));

const now = '2026-07-05T00:00:00.000Z';

const rankingMeta = {
  city: 'all',
  limit: 10,
  total: 1,
};

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    delete process.env.NEXT_PUBLIC_ENABLE_HOME_HOT_VIDEOS;

    listStoresStrictMock.mockResolvedValue([
      {
        id: 'store-api-1',
        name: 'API Neon Lounge',
        slug: 'api-neon-lounge',
        category: 'LOUNGE',
        city: 'Ha Noi',
        cityCode: 'hn',
        district: 'Tay Ho',
        area: { id: 'area-1', code: 'hn-tay-ho', name: 'Tay Ho', city: 'Ha Noi', cityCode: 'hn' },
        thumbnailUrl: 'https://example.com/api-neon.jpg',
      },
      {
        id: 'store-api-2',
        name: 'API Sakura Restaurant',
        slug: 'api-sakura-restaurant',
        category: 'RESTAURANT',
        city: 'TP.HCM',
        cityCode: 'hcm',
        district: 'Quan 1',
        area: { id: 'area-2', code: 'hcm-q1', name: 'Quan 1', city: 'TP.HCM', cityCode: 'hcm' },
        thumbnailUrl: 'https://example.com/api-sakura.jpg',
      },
    ]);

    contentListMock.mockImplementation((params?: { type?: string }) => {
      if (params?.type === 'BANNER') {
        return Promise.resolve({
          data: [
            {
              id: 'banner-api-1',
              title: 'API Night Banner',
              slug: 'api-night-banner',
              type: 'BANNER',
              status: 'PUBLISHED',
              excerpt: 'API banner excerpt',
              metadata: {
                description: 'API banner description',
                tag: 'API CTA',
                link: '/stores/api-neon-lounge',
                imageUrl: 'https://example.com/banner.jpg',
              },
              createdAt: now,
              updatedAt: now,
            },
          ],
        });
      }

      if (params?.type === 'BLOG') {
        return Promise.resolve({
          data: [
            {
              id: 'blog-api-1',
              title: 'API Blog Guide',
              slug: 'api-blog-guide',
              type: 'BLOG',
              status: 'PUBLISHED',
              excerpt: 'API blog excerpt',
              metadata: null,
              createdAt: now,
              updatedAt: now,
            },
          ],
        });
      }

      return Promise.resolve({ data: [] });
    });

    listPublicCouponsMock.mockResolvedValue([
      {
        id: 'coupon-api-1',
        code: 'API10',
        name: 'API Coupon',
        discountType: 'PERCENT',
        discountValue: 10,
        startsAt: now,
        store: {
          id: 'store-api-1',
          name: 'API Neon Lounge',
          slug: 'api-neon-lounge',
          category: 'LOUNGE',
          city: 'Ha Noi',
          district: 'Tay Ho',
          media: [{ url: 'https://example.com/coupon.jpg' }],
        },
      },
    ]);

    rankingsListMock.mockImplementation((params?: { targetType?: string; scope?: string; category?: string; city?: string }) => {
      if (params?.scope === 'featured_home') {
        return Promise.resolve({
          data: [
            {
              rank: 1,
              targetType: 'STORE',
              targetId: 'store-api-featured',
              name: 'API Featured Service',
              slug: 'api-featured-service',
              image: 'https://example.com/featured.jpg',
              area: 'Quan 1',
              city: 'TP.HCM',
              cityCode: 'hcm',
              category: params.category === 'MASSAGE_SPA' ? 'MASSAGE_SPA' : 'RESTAURANT',
              sponsored: true,
              pinRank: 1,
              manualScore: 100,
              href: '/stores/api-featured-service',
            },
          ],
          meta: { ...rankingMeta, targetType: 'STORE', scope: 'featured-home' },
        });
      }

      if (params?.targetType === 'CAST') {
        return Promise.resolve({
          data: [
            {
              rank: 1,
              targetType: 'CAST',
              targetId: 'cast-api-1',
              name: 'API Cast',
              slug: 'api-cast',
              image: 'https://example.com/cast.jpg',
              area: 'Tay Ho',
              city: 'Ha Noi',
              cityCode: 'hn',
              category: 'CLUB',
              sponsored: false,
              pinRank: 1,
              manualScore: 90,
              href: '/casts/api-cast',
            },
          ],
          meta: { ...rankingMeta, targetType: 'CAST' },
        });
      }

      return Promise.resolve({
        data: [
          {
            rank: 1,
            targetType: 'STORE',
            targetId: 'store-api-1',
            name: 'API Neon Lounge',
            slug: 'api-neon-lounge',
            image: 'https://example.com/api-neon.jpg',
            area: 'Tay Ho',
            city: 'Ha Noi',
            cityCode: 'hn',
            category: 'LOUNGE',
            sponsored: false,
            pinRank: 1,
            manualScore: 80,
            href: '/stores/api-neon-lounge',
          },
        ],
        meta: { ...rankingMeta, targetType: 'STORE' },
      });
    });

    contentHotVideosMock.mockResolvedValue([
      {
        id: 'video-api-1',
        url: 'https://example.com/video.mp4',
        title: 'API Hot Video',
        storeName: null,
        storeSlug: 'api-neon-lounge',
        href: '/stores/api-neon-lounge',
        createdAt: now,
        viewCount: 7,
        likeCount: 2,
      },
    ]);
    contentRecommendationsMock.mockResolvedValue([
      {
        id: 'store-api-1',
        name: 'API Neon Lounge',
        slug: 'api-neon-lounge',
        category: 'LOUNGE',
        city: 'Ha Noi',
        cityCode: 'hn',
        district: 'Tay Ho',
        area: { id: 'area-1', code: 'hn-tay-ho', name: 'Tay Ho', city: 'Ha Noi', cityCode: 'hn' },
        thumbnailUrl: 'https://example.com/api-neon.jpg',
        href: '/stores/api-neon-lounge',
        score: 120,
        reason: 'Theo loai hinh ban hay xem',
        signals: { viewCount: 3, bookingCount: 1, hasActiveCoupon: true },
        activeCoupon: null,
      },
    ]);
    contentToursMock.mockResolvedValue([
      {
        id: 'tour-api-1',
        title: 'API Tour Night',
        subtitle: 'API tour subtitle',
        cityCode: 'hn',
        area: 'Ha Noi',
        durationHours: 4,
        priceFromVnd: 1200000,
        href: '/tour',
        thumbnailUrl: 'https://example.com/tour.jpg',
        stops: [
          {
            order: 1,
            id: 'store-api-1',
            name: 'API Neon Lounge',
            slug: 'api-neon-lounge',
            category: 'LOUNGE',
            city: 'Ha Noi',
            district: 'Tay Ho',
            area: { id: 'area-1', code: 'hn-tay-ho', name: 'Tay Ho', city: 'Ha Noi', cityCode: 'hn' },
            thumbnailUrl: 'https://example.com/api-neon.jpg',
            href: '/stores/api-neon-lounge',
            activeCouponName: null,
          },
        ],
      },
    ]);
    trackHotVideoViewMock.mockResolvedValue({ recorded: true, mediaId: 'video-api-1', viewCount: 8, likeCount: 2 });
    trackHotVideoLikeMock.mockResolvedValue({ recorded: true, mediaId: 'video-api-1', viewCount: 8, likeCount: 3 });
  });

  it('renders featured event content from the backend CMS API', async () => {
    render(<Page />);

    expect(await screen.findAllByText(/API Night Banner/i)).not.toHaveLength(0);
  });

  it('places the search panel before the advertising banner', async () => {
    render(<Page />);
    await screen.findAllByText(/API Night Banner/i);

    const searchPanels = screen.getAllByTestId('home-search-panel');
    const adBanners = screen.getAllByTestId('home-ad-banner');

    expect(searchPanels).toHaveLength(adBanners.length);
    searchPanels.forEach((searchPanel, index) => {
      expect(searchPanel.compareDocumentPosition(adBanners[index]!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });
  });

  it('hides venue rating and price on home recommendation cards', async () => {
    render(<Page />);
    await screen.findAllByText(/API Night Banner/i);

    expect(screen.queryByText('★ 4.9')).not.toBeInTheDocument();
    expect(screen.queryByText('1.2tr')).not.toBeInTheDocument();
  });

  it('loads home sections from backend APIs', async () => {
    render(<Page />);

    await waitFor(() => {
      expect(listStoresStrictMock).toHaveBeenCalledWith({ city: 'all', limit: 24, sort: 'priority' });
    });

    expect(contentListMock).toHaveBeenCalledWith({ type: 'BANNER', limit: 50 });
    expect(listPublicCouponsMock).toHaveBeenCalled();
    expect(rankingsListMock).toHaveBeenCalledWith({ targetType: 'CAST', city: 'hn', limit: 10 });
    expect(rankingsListMock).toHaveBeenCalledWith({ targetType: 'STORE', city: 'hn', limit: 10 });
    expect(rankingsListMock).toHaveBeenCalledWith({
      targetType: 'STORE',
      city: 'hn',
      category: 'RESTAURANT',
      scope: 'featured_home',
      limit: 8,
    });
    expect(contentHotVideosMock).toHaveBeenCalledWith('all');

    expect(await screen.findAllByText('API Neon Lounge')).not.toHaveLength(0);
    expect(await screen.findAllByText('API Coupon')).not.toHaveLength(0);
    expect(await screen.findAllByText('API Cast')).not.toHaveLength(0);
    expect(await screen.findAllByText('API Featured Service')).not.toHaveLength(0);
    expect(await screen.findAllByText(/API Hot Video/i)).not.toHaveLength(0);
    expect(await screen.findAllByText('API Blog Guide')).not.toHaveLength(0);
    expect(screen.getAllByRole('link', { name: /API Neon Lounge/i })[0]).toHaveAttribute(
      'href',
      '/stores/api-neon-lounge',
    );
    expect(document.body.textContent ?? '').not.toMatch(
      /Ã‚Â·|NhÃƒ|HÃƒ|NÃ¡Â»|tÃ¡Â»|Ã„â€˜|ChÃ†|Ã¡Âº|Ã¡Â»|Ä|Æ¯/,
    );
  });

  it('keeps the mobile home block order stable', async () => {
    render(<Page />);
    await screen.findAllByText(/API Night Banner/i);

    const mobileShell = screen.getByTestId('home-mobile-shell');
    const blockIds = [
      'home-mobile-header',
      'home-mobile-search',
      'home-mobile-hero',
      'home-mobile-categories',
      'home-mobile-recommendations',
      'home-mobile-coupons',
      'home-mobile-ranking',
      'home-mobile-featured',
      'home-mobile-guide',
      'home-mobile-video',
    ];

    const blocks = blockIds.map((id) => {
      const block = mobileShell.querySelector(`[data-testid="${id}"]`);
      expect(block, id).not.toBeNull();
      return block as HTMLElement;
    });

    blocks.slice(0, -1).forEach((block, index) => {
      expect(block.compareDocumentPosition(blocks[index + 1]!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });
  });

  it('routes coupon CTAs into the store/booking flow without claiming a standalone code', async () => {
    render(<Page />);
    await screen.findAllByText('API Coupon');

    const couponCta = screen.getAllByTestId('home-coupon-cta')[0] as HTMLAnchorElement;
    expect(couponCta).toHaveTextContent('Xem ưu đãi');
    expect(couponCta).toHaveAttribute('href', '/stores/api-neon-lounge');

    fireEvent.click(couponCta);

    expect(claimGuestCouponMock).not.toHaveBeenCalled();
    expect(claimMemberCouponMock).not.toHaveBeenCalled();
  });

  it('does not call the Video Hot API while the homepage video flag is off', async () => {
    process.env.NEXT_PUBLIC_ENABLE_HOME_HOT_VIDEOS = 'false';

    render(<Page />);
    await screen.findAllByText(/API Night Banner/i);

    expect(contentHotVideosMock).not.toHaveBeenCalled();
    expect(await screen.findAllByText('Video Hot đang được chuẩn bị.')).not.toHaveLength(0);
  });

  it('loads Video Hot from the API when the homepage video flag is enabled', async () => {
    process.env.NEXT_PUBLIC_ENABLE_HOME_HOT_VIDEOS = 'true';

    render(<Page />);

    await waitFor(() => {
      expect(contentHotVideosMock).toHaveBeenCalledWith('all');
    });
    expect(await screen.findAllByText(/API Hot Video/i)).not.toHaveLength(0);
  });
});
