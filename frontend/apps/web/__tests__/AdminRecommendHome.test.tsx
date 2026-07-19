import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminContentPage from '../src/app/admin/content/page';
import { SystemFeedbackProvider } from '../src/components/ui/SystemFeedback';

const { rankingListMock, rankingOptionsMock } = vi.hoisted(() => ({
  rankingListMock: vi.fn().mockResolvedValue([]),
  rankingOptionsMock: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/lib/api/client', () => ({
  apiFormDataClient: vi.fn(),
  apiClient: vi.fn().mockResolvedValue([]),
  resolveClientUrl: (url: string) => url,
}));

vi.mock('@/lib/api/admin-rankings', () => ({
  adminRankingsApi: {
    list: rankingListMock,
    options: rankingOptionsMock,
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

describe('Admin tonight recommendations', () => {
  it('renders selected recommendations in a three-column video-sized grid', async () => {
    rankingListMock.mockImplementation((query: { scope?: string }) => (
      query.scope === 'recommend-home'
        ? Promise.resolve([{
            id: 'rec-1',
            targetId: 'store-1',
            targetName: 'Lounge One',
            targetCategory: 'LOUNGE',
            targetCity: 'Hồ Chí Minh',
            targetArea: 'Quận 1',
            targetImage: '/lounge-one.jpg',
            pinRank: 1,
            cityCode: 'hcm',
            targetType: 'STORE',
            status: 'ACTIVE',
          }])
        : Promise.resolve([])
    ));

    render(
      <SystemFeedbackProvider>
        <AdminContentPage />
      </SystemFeedbackProvider>,
    );

    fireEvent.click(screen.getByText('Đề xuất tối nay'));

    await waitFor(() => {
      expect(rankingListMock).toHaveBeenCalledWith(
        expect.objectContaining({ scope: 'recommend-home' }),
      );
    });
    expect(await screen.findByText('Lounge One')).toBeInTheDocument();
    expect(screen.getByTestId('admin-recommend-card-grid')).toHaveStyle({
      gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
    });
    expect(screen.getByTestId('admin-recommend-card').firstElementChild).toHaveStyle({
      aspectRatio: '16 / 9',
    });
    expect(screen.queryByText(/Ghim tối đa 8 quán đang hoạt động nổi bật/)).not.toBeInTheDocument();
  });

  it('renders featured stores as video-sized cards and hides selected stores from search', async () => {
    rankingListMock.mockImplementation((query: { scope?: string }) => (
      query.scope === 'featured_home'
        ? Promise.resolve([{
            id: 'featured-1',
            targetId: 'store-selected',
            targetName: 'Selected Restaurant',
            targetCategory: 'RESTAURANT',
            targetCity: 'Hà Nội',
            targetArea: 'Tây Hồ',
            targetImage: '/selected.jpg',
            pinRank: 1,
            cityCode: 'hn',
            targetType: 'STORE',
            status: 'ACTIVE',
          }])
        : Promise.resolve([])
    ));
    rankingOptionsMock.mockResolvedValue([
      {
        id: 'store-selected',
        targetType: 'STORE',
        name: 'Selected Restaurant',
        category: 'RESTAURANT',
        city: 'Hà Nội',
      },
      {
        id: 'store-available',
        targetType: 'STORE',
        name: 'Available Restaurant',
        category: 'RESTAURANT',
        city: 'Hà Nội',
      },
    ]);

    render(
      <SystemFeedbackProvider>
        <AdminContentPage />
      </SystemFeedbackProvider>,
    );

    fireEvent.click(screen.getByText('Dịch vụ nổi bật'));

    expect(await screen.findByText('Selected Restaurant')).toBeInTheDocument();
    expect(screen.getByTestId('admin-featured-card-grid')).toHaveStyle({
      gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
    });
    expect(screen.getByTestId('admin-featured-card').firstElementChild).toHaveStyle({
      aspectRatio: '16 / 9',
    });

    const searchResults = screen.getByTestId('admin-featured-search-results');
    expect(within(searchResults).queryByText('Available Restaurant')).not.toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Tìm quán để thêm vào mục nổi bật…'), {
      target: { value: 'Restaurant' },
    });
    expect(await within(searchResults).findByText('Available Restaurant')).toBeInTheDocument();
    expect(within(searchResults).queryByText('Selected Restaurant')).not.toBeInTheDocument();
    expect(within(searchResults).queryByText('Đã thêm')).not.toBeInTheDocument();
  });
});
