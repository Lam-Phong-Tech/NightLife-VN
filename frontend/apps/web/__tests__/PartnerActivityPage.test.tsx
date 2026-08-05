import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PartnerActivityPage from '../src/app/partner/activity/page';
import { SystemFeedbackProvider } from '../src/components/ui/SystemFeedback';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/partner/activity',
}));

vi.mock('@/lib/auth/session', () => ({
  getAuthUser: () => ({ role: 'PARTNER', displayName: 'Demo Partner' }),
}));

vi.mock('@/hooks/usePartnerActivity', () => ({
  usePartnerActivity: vi.fn(),
}));

vi.mock('../src/app/partner/PartnerProviders', () => ({
  usePartnerStoreScope: () => ({
    activeStore: { id: 'store-neon', name: 'Neon Club' },
    selectedStoreId: 'store-neon',
    stores: [{ id: 'store-neon', name: 'Neon Club' }],
  }),
}));

import { usePartnerActivity } from '../src/hooks/usePartnerActivity';

describe('PartnerActivityPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('1. Renders activity feed items, search bar, and filter tabs', async () => {
    (usePartnerActivity as any).mockReturnValue({
      items: [
        {
          id: 'act-1',
          sourceType: 'BILL',
          activityType: 'BILL_PAYMENT',
          totalVnd: 1500000,
          status: 'VERIFIED',
          summary: 'Hóa đơn #BILL-001',
          title: 'Hóa đơn #BILL-001',
          activityAt: '2026-08-05T10:00:00Z',
        },
        {
          id: 'act-2',
          sourceType: 'BOOKING',
          activityType: 'BOOKING_CHECKIN',
          status: 'CHECKED_IN',
          summary: 'Đặt bàn Nguyễn Văn A',
          title: 'Đặt bàn Nguyễn Văn A',
          activityAt: '2026-08-05T11:00:00Z',
        },
      ],
      data: [
        {
          id: 'act-1',
          sourceType: 'BILL',
          activityType: 'BILL_PAYMENT',
          totalVnd: 1500000,
          status: 'VERIFIED',
          summary: 'Hóa đơn #BILL-001',
          title: 'Hóa đơn #BILL-001',
          activityAt: '2026-08-05T10:00:00Z',
        },
        {
          id: 'act-2',
          sourceType: 'BOOKING',
          activityType: 'BOOKING_CHECKIN',
          status: 'CHECKED_IN',
          summary: 'Đặt bàn Nguyễn Văn A',
          title: 'Đặt bàn Nguyễn Văn A',
          activityAt: '2026-08-05T11:00:00Z',
        },
      ],
      hasMore: false,
      loading: false,
      isLoading: false,
      error: null,
      type: 'ALL',
      search: '',
      setType: vi.fn(),
      setSearch: vi.fn(),
      setStartDate: vi.fn(),
      setEndDate: vi.fn(),
      fetchNextPage: vi.fn(),
    });

    render(
      <SystemFeedbackProvider>
        <PartnerActivityPage />
      </SystemFeedbackProvider>,
    );

    expect(screen.getByText('Hóa đơn #BILL-001')).toBeInTheDocument();
    expect(screen.getByText('Đặt bàn Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tìm kiếm hoạt động/i)).toBeInTheDocument();
    expect(screen.getByText('Thanh toán hóa đơn')).toBeInTheDocument();
  }, 15000);

  it('2. Navigates to activity detail on item click', async () => {
    (usePartnerActivity as any).mockReturnValue({
      items: [{ id: 'act-123', sourceType: 'BILL', summary: 'Hóa đơn #BILL-123', title: 'Hóa đơn #BILL-123' }],
      data: [{ id: 'act-123', sourceType: 'BILL', summary: 'Hóa đơn #BILL-123', title: 'Hóa đơn #BILL-123' }],
      hasMore: false,
      loading: false,
      isLoading: false,
      error: null,
      type: 'ALL',
      search: '',
      setType: vi.fn(),
      setSearch: vi.fn(),
      setStartDate: vi.fn(),
      setEndDate: vi.fn(),
      fetchNextPage: vi.fn(),
    });

    render(
      <SystemFeedbackProvider>
        <PartnerActivityPage />
      </SystemFeedbackProvider>,
    );

    fireEvent.click(screen.getByText('Hóa đơn #BILL-123'));
    expect(mockPush).toHaveBeenCalledWith('/partner/activity/act-123');
  });

  it('3. Triggers fetchNextPage when clicking "Tải thêm"', async () => {
    const mockFetchNext = vi.fn();
    (usePartnerActivity as any).mockReturnValue({
      items: [{ id: 'act-1', sourceType: 'BILL', summary: 'Item 1', title: 'Item 1' }],
      data: [{ id: 'act-1', sourceType: 'BILL', summary: 'Item 1', title: 'Item 1' }],
      hasMore: true,
      loading: false,
      isLoading: false,
      loadingMore: false,
      isFetchingNextPage: false,
      error: null,
      type: 'ALL',
      search: '',
      setType: vi.fn(),
      setSearch: vi.fn(),
      setStartDate: vi.fn(),
      setEndDate: vi.fn(),
      fetchNextPage: mockFetchNext,
    });

    render(
      <SystemFeedbackProvider>
        <PartnerActivityPage />
      </SystemFeedbackProvider>,
    );

    const loadMoreBtn = screen.getByRole('button', { name: /Tải thêm/i });
    fireEvent.click(loadMoreBtn);
    expect(mockFetchNext).toHaveBeenCalledTimes(1);
  });

  it('4. Displays empty state when no activities exist', () => {
    (usePartnerActivity as any).mockReturnValue({
      items: [],
      data: [],
      hasMore: false,
      loading: false,
      isLoading: false,
      error: null,
      type: 'ALL',
      search: '',
      setType: vi.fn(),
      setSearch: vi.fn(),
      setStartDate: vi.fn(),
      setEndDate: vi.fn(),
      fetchNextPage: vi.fn(),
    });

    render(
      <SystemFeedbackProvider>
        <PartnerActivityPage />
      </SystemFeedbackProvider>,
    );

    expect(screen.getByText(/Chưa có hoạt động nào/i)).toBeInTheDocument();
  });
});
