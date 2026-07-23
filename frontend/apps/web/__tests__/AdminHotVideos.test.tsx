import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdminContentPage from '../src/app/admin/content/page';
import { SystemFeedbackProvider } from '../src/components/ui/SystemFeedback';

const { apiClientMock } = vi.hoisted(() => ({
  apiClientMock: vi.fn(),
}));

vi.mock('@/lib/api/client', () => ({
  apiFormDataClient: vi.fn(),
  apiClient: apiClientMock,
  resolveClientUrl: (url?: string | null) => url || undefined,
}));

vi.mock('@/lib/api/admin-rankings', () => ({
  adminRankingsApi: {
    list: vi.fn().mockResolvedValue([]),
    options: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('@/lib/api/categories', () => ({
  categoriesApi: {
    list: vi.fn().mockResolvedValue([]),
    listBannerTags: vi.fn().mockResolvedValue([]),
    adminList: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('@/lib/api/content', () => ({
  contentApi: {
    adminList: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('@/lib/api/campaigns', () => ({
  campaignsApi: {
    list: vi.fn().mockResolvedValue([]),
    adminList: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => function MockDynamicComponent() {
    return <div data-testid="mock-dynamic">Quill Editor Mock</div>;
  },
}));

describe('Admin Video Hot search', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    apiClientMock.mockReset();
    apiClientMock.mockImplementation((url: string) => {
      if (url === '/admin/media/store-videos') {
        return Promise.resolve({
          items: [{
            id: 'video-1',
            url: 'https://youtu.be/YJY8lIEdsNM?si=example',
            title: 'Video giới thiệu',
            storeName: 'Hiệp restaurant',
          }],
          totalPages: 1,
        });
      }
      return Promise.resolve([]);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps results hidden while empty, then searches and shows a youtu.be thumbnail', async () => {
    render(
      <SystemFeedbackProvider>
        <AdminContentPage />
      </SystemFeedbackProvider>,
    );

    fireEvent.click(screen.getByText('Video Hot'));

    await act(async () => {
      vi.advanceTimersByTime(600);
      await Promise.resolve();
    });

    expect(screen.queryByTestId('admin-video-search-results')).not.toBeInTheDocument();
    expect(apiClientMock).not.toHaveBeenCalledWith(
      '/admin/media/store-videos',
      expect.anything(),
    );

    const searchInput = document.getElementById('video-search-input');
    expect(searchInput).toBeInstanceOf(HTMLInputElement);
    fireEvent.change(searchInput as HTMLInputElement, { target: { value: 'Hiệp' } });

    await act(async () => {
      vi.advanceTimersByTime(600);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(apiClientMock).toHaveBeenCalledWith(
      '/admin/media/store-videos',
      expect.objectContaining({
        params: expect.objectContaining({ search: 'Hiệp' }),
      }),
    );
    expect(screen.getByText('Hiệp restaurant')).toBeInTheDocument();
    expect(screen.getByAltText('Thumbnail Hiệp restaurant')).toHaveAttribute(
      'src',
      'https://img.youtube.com/vi/YJY8lIEdsNM/default.jpg',
    );
  });
});
