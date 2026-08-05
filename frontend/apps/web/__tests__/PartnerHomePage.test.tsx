import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PartnerHomePage from '../src/app/partner/page';
import { PartnerProviders } from '../src/app/partner/PartnerProviders';
import { SystemFeedbackProvider } from '../src/components/ui/SystemFeedback';
import * as partnerPortalApi from '../src/lib/api/partner-portal';

const mocks = vi.hoisted(() => ({
  apiClient: vi.fn(),
  replace: vi.fn(),
  push: vi.fn(),
  searchParams: new URLSearchParams(),
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => mocks.searchParams,
  usePathname: () => '/partner',
  useRouter: () => ({
    push: mocks.push,
    replace: mocks.replace,
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock('@/lib/auth/session', () => ({
  __esModule: true,
  clearAuthSession: vi.fn(),
  getAuthUser: () => ({ role: 'PARTNER', displayName: 'Partner Manager' }),
}));

vi.mock('@/lib/api/client', () => {
  class ApiError extends Error {
    constructor(
      public status: number,
      message: string,
    ) {
      super(message);
      this.name = 'ApiError';
    }
  }

  return {
    apiClient: mocks.apiClient,
    apiFormDataClient: vi.fn(),
    getAuthToken: vi.fn(() => 'mock-token'),
    resolveClientUrl: vi.fn((url: string) => url),
    ApiError,
    translateApiMessage: vi.fn((message?: string, _status?: number, fallback?: string) => message ?? fallback ?? ''),
  };
});

vi.mock('@/lib/api/partner-portal', async (importOriginal) => {
  const actual = await importOriginal<typeof partnerPortalApi>();
  return {
    ...actual,
    fetchPartnerHome: vi.fn(),
    fetchPartnerActivities: vi.fn(),
  };
});

describe('PartnerHomePage (Home Dashboard & Monolith Cleanup)', () => {
  const mockHomeOverview: partnerPortalApi.PartnerHomeOverview = {
    metrics: {
      totalRevenueVnd: 45000000,
      billCount: 28,
      bookingCount: 14,
      activeCouponsCount: 6,
    },
    recentActivities: [
      {
        id: 'act-101',
        rawId: 'bill-101',
        sourceType: 'BILL',
        activityType: 'BILL_PAYMENT',
        activityAt: '2026-08-05T14:30:00.000Z',
        storeId: 'store-1',
        storeName: 'Neon Club',
        customerName: 'Nguyen Van A',
        customerPhone: '0901234567',
        summary: 'Thanh toán hóa đơn BILL-101',
        totalVnd: 3500000,
        discountVnd: 350000,
        billNumber: 'BILL-101',
        status: 'VERIFIED',
        statusLabel: 'Đã duyệt',
        badgeTone: 'success',
      },
      {
        id: 'act-102',
        rawId: 'issue-102',
        sourceType: 'COUPON_ISSUE',
        activityType: 'COUPON_USAGE',
        activityAt: '2026-08-05T12:15:00.000Z',
        storeId: 'store-1',
        storeName: 'Neon Club',
        customerName: 'Tran Thi B',
        customerPhone: '0912345678',
        summary: 'Quét mã ưu đãi VIP10',
        couponCode: 'VIP10',
        totalVnd: 1200000,
        discountVnd: null,
        status: 'USED',
        statusLabel: 'Đã dùng',
        badgeTone: 'info',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.searchParams = new URLSearchParams();

    mocks.apiClient.mockImplementation((endpoint: string) => {
      if (endpoint === '/partner/stores') {
        return Promise.resolve([
          { id: 'store-1', name: 'Neon Club', slug: 'neon-club', status: 'ACTIVE' },
        ]);
      }
      if (endpoint === '/partner/notifications') {
        return Promise.resolve([]);
      }
      if (endpoint === '/partner/home') {
        return Promise.resolve(mockHomeOverview);
      }
      return Promise.resolve([]);
    });

    vi.mocked(partnerPortalApi.fetchPartnerHome).mockResolvedValue(mockHomeOverview);
  });

  afterEach(() => {
    cleanup();
  });

  describe('1. Overview KPI Rendering', () => {
    it('renders revenue, bookings, active coupons, and bill counts accurately', async () => {
      render(
        <SystemFeedbackProvider>
          <PartnerProviders>
            <PartnerHomePage />
          </PartnerProviders>
        </SystemFeedbackProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Tổng quan kinh doanh')).toBeInTheDocument();
      });

      // Verify KPI metrics display
      expect(screen.getByText(/45\.000\.000/i)).toBeInTheDocument();
      expect(screen.getByText('14')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('28')).toBeInTheDocument();
    });

    it('renders "Giảm giá: Chưa xác định" when discountVnd is null on recent activities', async () => {
      render(
        <SystemFeedbackProvider>
          <PartnerProviders>
            <PartnerHomePage />
          </PartnerProviders>
        </SystemFeedbackProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Giảm giá: Chưa xác định')).toBeInTheDocument();
      });
    });
  });

  describe('2. Quick Action Navigation Links', () => {
    it('provides quick links to all sub-routes without rendering inline monolith panels', async () => {
      render(
        <SystemFeedbackProvider>
          <PartnerProviders>
            <PartnerHomePage />
          </PartnerProviders>
        </SystemFeedbackProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Quét Mã QR')).toBeInTheDocument();
      });

      // Verify sub-route link destinations
      const scanLink = screen.getByRole('link', { name: /Quét Mã QR/i });
      expect(scanLink).toHaveAttribute('href', '/partner/scan');

      const listingLink = screen.getByRole('link', { name: /Quản lý Danh mục/i });
      expect(listingLink).toHaveAttribute('href', '/partner/listing');

      const settingsLink = screen.getByRole('link', { name: /Cấu hình Cửa hàng/i });
      expect(settingsLink).toHaveAttribute('href', '/partner/settings');

      const staffLink = screen.getByRole('link', { name: /Quản lý Nhân viên/i });
      expect(staffLink).toHaveAttribute('href', '/partner/settings/staff');

      const newBillLink = screen.getByRole('link', { name: /Nạp Hóa Đơn Mới/i });
      expect(newBillLink).toHaveAttribute('href', '/partner/activity/new-bill');
    });
  });

  describe('3. Recent Activity List & Fallback State', () => {
    it('renders recent activity items when available', async () => {
      render(
        <SystemFeedbackProvider>
          <PartnerProviders>
            <PartnerHomePage />
          </PartnerProviders>
        </SystemFeedbackProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Thanh toán hóa đơn BILL-101')).toBeInTheDocument();
      });

      expect(screen.getByText(/Nguyen Van A/i)).toBeInTheDocument();
      expect(screen.getByText('Quét mã ưu đãi VIP10')).toBeInTheDocument();
      expect(screen.getByText(/Tran Thi B/i)).toBeInTheDocument();
    });

    it('renders empty fallback card when recentActivities is empty', async () => {
      vi.mocked(partnerPortalApi.fetchPartnerHome).mockResolvedValue({
        metrics: { totalRevenueVnd: 0, billCount: 0, bookingCount: 0, activeCouponsCount: 0 },
        recentActivities: [],
      });

      render(
        <SystemFeedbackProvider>
          <PartnerProviders>
            <PartnerHomePage />
          </PartnerProviders>
        </SystemFeedbackProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText(/Chưa có hoạt động gần đây nào/i)).toBeInTheDocument();
      });
    });
  });

  describe('4. Zero Monolith Regressions & Legacy Redirects', () => {
    it('redirects legacy ?panel=bill query parameter to /partner/activity/new-bill', async () => {
      mocks.searchParams = new URLSearchParams('panel=bill');

      render(
        <SystemFeedbackProvider>
          <PartnerProviders>
            <PartnerHomePage />
          </PartnerProviders>
        </SystemFeedbackProvider>,
      );

      await waitFor(() => {
        expect(mocks.replace).toHaveBeenCalledWith('/partner/activity/new-bill');
      });
    });

    it('redirects legacy ?panel=activity query parameter to /partner/activity', async () => {
      mocks.searchParams = new URLSearchParams('panel=activity');

      render(
        <SystemFeedbackProvider>
          <PartnerProviders>
            <PartnerHomePage />
          </PartnerProviders>
        </SystemFeedbackProvider>,
      );

      await waitFor(() => {
        expect(mocks.replace).toHaveBeenCalledWith('/partner/activity');
      });
    });

    it('redirects legacy ?panel=scan query parameter to /partner/scan', async () => {
      mocks.searchParams = new URLSearchParams('panel=scan');

      render(
        <SystemFeedbackProvider>
          <PartnerProviders>
            <PartnerHomePage />
          </PartnerProviders>
        </SystemFeedbackProvider>,
      );

      await waitFor(() => {
        expect(mocks.replace).toHaveBeenCalledWith('/partner/scan');
      });
    });
  });
});
