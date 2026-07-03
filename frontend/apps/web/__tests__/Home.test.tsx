import React from 'react';
import { render, screen } from '@testing-library/react';
import Page from '../src/app/page';
import { describe, it, expect, vi } from 'vitest';

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

describe('Home Page', () => {
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
});
