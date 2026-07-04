import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Page from '../src/app/page';
import { beforeEach, describe, it, expect, vi } from 'vitest';

const { listStoresStrictMock } = vi.hoisted(() => ({
  listStoresStrictMock: vi.fn(),
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
    return <a href={href} {...props}>{children}</a>;
  },
}));

vi.mock('@/lib/api/discovery', () => ({
  discoveryApi: {
    listStoresStrict: listStoresStrictMock,
  },
}));

describe('Home Page', () => {
  beforeEach(() => {
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
  });

  it('renders featured event content', () => {
    render(<Page />);
    expect(screen.getAllByText(/Đêm Nhạc DJ SODA/i).length).toBeGreaterThan(0);
  });

  it('places the search panel before the advertising banner', () => {
    render(<Page />);

    const searchPanels = screen.getAllByTestId('home-search-panel');
    const adBanners = screen.getAllByTestId('home-ad-banner');

    expect(searchPanels).toHaveLength(adBanners.length);
    searchPanels.forEach((searchPanel, index) => {
      expect(searchPanel.compareDocumentPosition(adBanners[index]!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });
  });

  it('hides venue rating and price on home recommendation cards', () => {
    render(<Page />);

    expect(screen.queryByText('★ 4.9')).not.toBeInTheDocument();
    expect(screen.queryByText('1.2tr')).not.toBeInTheDocument();
  });

  it('loads home venue cards from the backend stores API', async () => {
    render(<Page />);

    await waitFor(() => {
      expect(listStoresStrictMock).toHaveBeenCalledWith({ city: 'all', limit: 24, sort: 'priority' });
    });

    expect(await screen.findAllByText('API Neon Lounge')).not.toHaveLength(0);
    expect(screen.getAllByRole('link', { name: /API Neon Lounge/i })[0]).toHaveAttribute(
      'href',
      '/stores/api-neon-lounge',
    );
  });
});
