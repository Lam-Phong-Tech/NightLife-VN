import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PartnerProviders, usePartnerStoreScope, usePartnerTheme } from '../src/app/partner/PartnerProviders';
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
    className,
    style,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} className={className} style={style} {...props}>
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
  getAuthUser: () => ({ role: mocks.authUserRole, displayName: 'Partner Edge Tester' }),
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

describe('PartnerShellClient & PartnerProviders Edge Cases Stress Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
    document.documentElement.classList.remove('vy-light');
    mocks.pathname = '/partner';
    mocks.authUserRole = 'PARTNER';

    mocks.apiClient.mockImplementation((url: string) => {
      if (url === '/partner/stores') {
        return Promise.resolve([
          { id: 'store-alpha', name: 'Alpha Bar', slug: 'alpha-bar', status: 'ACTIVE' },
          { id: 'store-beta', name: 'Beta Pub', slug: 'beta-pub', status: 'ACTIVE' },
        ]);
      }
      if (url === '/partner/notifications') {
        return Promise.resolve([
          { id: 'notif-1', title: 'Thông báo mới', message: 'Bạn có đơn mới', read: false, unread: true },
        ]);
      }
      return Promise.resolve([]);
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('1. Store switcher changes store ID and persists to sessionStorage', async () => {
    render(
      <SystemFeedbackProvider>
        <PartnerProviders>
          <PartnerShellClient>
            <div>Store Switcher Test</div>
          </PartnerShellClient>
        </PartnerProviders>
      </SystemFeedbackProvider>,
    );

    // Wait for store loading (appears in sidebar and mobile header)
    await waitFor(() => {
      expect(screen.getAllByText('Alpha Bar')[0]).toBeInTheDocument();
    });

    // ThemedListingSelect toggle button
    const selectTrigger = screen.getByRole('button', { name: 'Chọn quán hoạt động' });
    expect(selectTrigger).toBeInTheDocument();

    // Click select trigger to expand options
    fireEvent.click(selectTrigger);

    // Click option "Beta Pub"
    const betaOption = screen.getAllByText('Beta Pub')[0];
    if (betaOption) fireEvent.click(betaOption);

    // Verify state and sessionStorage persistence
    await waitFor(() => {
      expect(sessionStorage.getItem('vy-partner-selected-store-id')).toBe('store-beta');
      expect(screen.getAllByText('Beta Pub')[0]).toBeInTheDocument();
    });
  });

  it('2. Theme toggle switches light/dark mode cleanly without errors', async () => {
    function ThemeTestInspector() {
      const { partnerTheme } = usePartnerTheme();
      return <div data-testid="current-theme">{partnerTheme}</div>;
    }

    render(
      <SystemFeedbackProvider>
        <PartnerProviders>
          <PartnerShellClient>
            <ThemeTestInspector />
          </PartnerShellClient>
        </PartnerProviders>
      </SystemFeedbackProvider>,
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('vy-light')).toBe(false);

    const themeToggleBtn = screen.getByRole('button', { name: 'Chuyển giao diện sáng/tối' });
    
    // Switch to light mode
    fireEvent.click(themeToggleBtn);

    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      expect(localStorage.getItem('vy-user-theme')).toBe('light');
      expect(document.documentElement.classList.contains('vy-light')).toBe(true);
    });

    // Switch back to dark mode
    fireEvent.click(themeToggleBtn);

    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      expect(localStorage.getItem('vy-user-theme')).toBe('dark');
      expect(document.documentElement.classList.contains('vy-light')).toBe(false);
    });
  });

  it('3. Notifications popover toggle & interaction work cleanly', async () => {
    render(
      <SystemFeedbackProvider>
        <PartnerProviders>
          <PartnerShellClient>
            <div>Notifications Test</div>
          </PartnerShellClient>
        </PartnerProviders>
      </SystemFeedbackProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument(); // Notification badge count
    });

    const notifBtn = screen.getByRole('button', { name: /Thông báo đối tác/i });
    expect(notifBtn).toHaveAttribute('aria-expanded', 'false');

    // Open notifications popover
    fireEvent.click(notifBtn);
    expect(notifBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Thông báo mới')).toBeInTheDocument();
    expect(screen.getByText('Bạn có đơn mới')).toBeInTheDocument();

    // Click notification item to open/read and close popover
    const notifItemBtn = screen.getByText('Thông báo mới').closest('button');
    expect(notifItemBtn).toBeInTheDocument();
    if (notifItemBtn) fireEvent.click(notifItemBtn);

    await waitFor(() => {
      expect(notifBtn).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('4. Mobile bottom navigation highlights active tab based on current pathname', async () => {
    mocks.pathname = '/partner/scan';

    const { container } = render(
      <SystemFeedbackProvider>
        <PartnerProviders>
          <PartnerShellClient>
            <div>Mobile Nav Test</div>
          </PartnerShellClient>
        </PartnerProviders>
      </SystemFeedbackProvider>,
    );

    const mobileNav = container.querySelector('nav.partner-mobile-bottom-nav');
    expect(mobileNav).toBeInTheDocument();

    const activeNavBtn = mobileNav?.querySelector('.partner-mobile-nav-btn.active');
    expect(activeNavBtn).toBeInTheDocument();
    expect(activeNavBtn).toHaveAttribute('href', '/partner/scan');
    expect(activeNavBtn).toHaveAttribute('aria-current', 'page');
  });

  it('5a. PartnerStoreScopeProvider fallback behavior when invalid store ID in sessionStorage', async () => {
    // Scenario 5a: sessionStorage contains invalid store ID
    sessionStorage.setItem('vy-partner-selected-store-id', 'non-existent-store-999');

    function FallbackInspector() {
      const { selectedStoreId, storeName, stores } = usePartnerStoreScope();
      return (
        <div>
          <span data-testid="fallback-store-id">{selectedStoreId}</span>
          <span data-testid="fallback-store-name">{storeName}</span>
          <span data-testid="fallback-stores-len">{stores.length}</span>
        </div>
      );
    }

    render(
      <SystemFeedbackProvider>
        <PartnerProviders>
          <FallbackInspector />
        </PartnerProviders>
      </SystemFeedbackProvider>,
    );

    // Should fall back to first store 'store-alpha' ("Alpha Bar")
    await waitFor(() => {
      expect(screen.getByTestId('fallback-stores-len')).toHaveTextContent('2');
      expect(screen.getByTestId('fallback-store-id')).toHaveTextContent('store-alpha');
      expect(screen.getByTestId('fallback-store-name')).toHaveTextContent('Alpha Bar');
    });
  });

  it('5b. PartnerStoreScopeProvider fallback behavior when API returns empty store list', async () => {
    mocks.apiClient.mockImplementation((url: string) => {
      if (url === '/partner/stores') {
        return Promise.resolve([]);
      }
      return Promise.resolve([]);
    });

    function EmptyStoresInspector() {
      const { selectedStoreId, storeName, activeStore } = usePartnerStoreScope();
      return (
        <div>
          <span data-testid="empty-store-id">{selectedStoreId}</span>
          <span data-testid="empty-store-name">{storeName}</span>
          <span data-testid="empty-active-store">{activeStore ? 'has-store' : 'null-store'}</span>
        </div>
      );
    }

    render(
      <SystemFeedbackProvider>
        <PartnerProviders>
          <EmptyStoresInspector />
        </PartnerProviders>
      </SystemFeedbackProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('empty-store-id')).toHaveTextContent('');
      expect(screen.getByTestId('empty-store-name')).toHaveTextContent('Tất cả quán');
      expect(screen.getByTestId('empty-active-store')).toHaveTextContent('null-store');
    });
  });
});
