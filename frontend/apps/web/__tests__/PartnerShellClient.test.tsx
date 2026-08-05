import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PartnerLayout from '../src/app/partner/layout';
import { PartnerProviders, usePartnerStoreScope } from '../src/app/partner/PartnerProviders';
import { PartnerShellClient } from '../src/app/partner/PartnerShellClient';
import { SystemFeedbackProvider } from '../src/components/ui/SystemFeedback';

const mocks = vi.hoisted(() => ({
  apiClient: vi.fn(),
  pathname: '/partner',
  authUserRole: 'PARTNER',
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
  usePathname: () => mocks.pathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/auth/session', () => ({
  __esModule: true,
  clearAuthSession: vi.fn(),
  getAuthUser: () => ({ role: mocks.authUserRole, displayName: 'Partner Demo' }),
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

describe('PartnerShellClient & PartnerProviders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.pathname = '/partner';
    mocks.authUserRole = 'PARTNER';

    mocks.apiClient.mockImplementation((url: string) => {
      if (url === '/partner/stores') {
        return Promise.resolve([
          { id: 'store-1', name: 'Neon Club', slug: 'neon-club', status: 'ACTIVE' },
          { id: 'store-2', name: 'Velvet Lounge', slug: 'velvet-lounge', status: 'ACTIVE' },
        ]);
      }
      if (url === '/partner/notifications') {
        return Promise.resolve([
          { id: 'notif-1', title: 'Booking mới', message: 'Bạn có lượt đặt bàn mới', read: false },
        ]);
      }
      return Promise.resolve([]);
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders outer shell frame, header, sidebar, branding, and content children', async () => {
    render(
      <SystemFeedbackProvider>
        <PartnerProviders>
          <PartnerShellClient>
            <div data-testid="test-child-content">Sub-route Page Body</div>
          </PartnerShellClient>
        </PartnerProviders>
      </SystemFeedbackProvider>,
    );

    // Check branding logo
    expect(screen.getByText('Vietyoru')).toBeInTheDocument();
    expect(screen.getByText('PARTNER PORTAL')).toBeInTheDocument();

    // Check child content rendered inside shell
    expect(screen.getByTestId('test-child-content')).toHaveTextContent('Sub-route Page Body');

    // Check sidebar navigation links
    expect(screen.getAllByText('Tổng quan')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Quét QR & Đặt chỗ')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Đăng tin & Nhân sự')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Cài đặt & Nhân viên')[0]).toBeInTheDocument();

    // Check header status pill & theme toggle
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('Đăng xuất')).toBeInTheDocument();
  });

  it('enforces single shell (strangler pattern) with exactly 1 header and 1 sidebar', async () => {
    const { container } = render(
      <SystemFeedbackProvider>
        <PartnerLayout>
          <div>Child View</div>
        </PartnerLayout>
      </SystemFeedbackProvider>,
    );

    const headers = container.querySelectorAll('header.partner-header');
    const sidebars = container.querySelectorAll('aside.partner-sidebar');

    expect(headers.length).toBe(1);
    expect(sidebars.length).toBe(1);
  });

  it('highlights active navigation link based on usePathname()', async () => {
    mocks.pathname = '/partner/scan';

    render(
      <SystemFeedbackProvider>
        <PartnerProviders>
          <PartnerShellClient>
            <div>Scan View</div>
          </PartnerShellClient>
        </PartnerProviders>
      </SystemFeedbackProvider>,
    );

    const scanEl = screen.getAllByText('Quét QR & Đặt chỗ')[0];
    expect(scanEl).toBeDefined();
    const scanLink = scanEl!.closest('a');
    expect(scanLink).toHaveAttribute('aria-current', 'page');
  });

  it('populates store scope from API and supports switching store', async () => {
    function StoreScopeInspector() {
      const { stores, selectedStoreId, storeName, setSelectedStoreId } = usePartnerStoreScope();
      return (
        <div>
          <span data-testid="store-count">{stores.length}</span>
          <span data-testid="selected-id">{selectedStoreId}</span>
          <span data-testid="store-name">{storeName}</span>
          <button data-testid="switch-btn" onClick={() => setSelectedStoreId('store-2')}>
            Switch Store
          </button>
        </div>
      );
    }

    render(
      <SystemFeedbackProvider>
        <PartnerProviders>
          <StoreScopeInspector />
        </PartnerProviders>
      </SystemFeedbackProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('store-count')).toHaveTextContent('2');
      expect(screen.getByTestId('store-name')).toHaveTextContent('Neon Club');
    });

    fireEvent.click(screen.getByTestId('switch-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('selected-id')).toHaveTextContent('store-2');
      expect(screen.getByTestId('store-name')).toHaveTextContent('Velvet Lounge');
    });
  });

  it('filters navigation items for staff role accounts', async () => {
    mocks.authUserRole = 'STAFF';

    render(
      <SystemFeedbackProvider>
        <PartnerProviders>
          <PartnerShellClient>
            <div>Staff View</div>
          </PartnerShellClient>
        </PartnerProviders>
      </SystemFeedbackProvider>,
    );

    // Staff accounts only see allowed items (Tổng quan & Quét QR)
    expect(screen.getAllByText('Tổng quan')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Quét QR & Đặt chỗ')[0]).toBeInTheDocument();
    expect(screen.queryByText('Đăng tin & Nhân sự')).not.toBeInTheDocument();
    expect(screen.queryByText('Cài đặt & Nhân viên')).not.toBeInTheDocument();
  });
});
