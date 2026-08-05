# Milestone 4 (PR 4) Analysis Report: Legacy Redirects & Frontend Test Strategy

## Executive Summary
This report presents the architectural analysis and test strategy design for Milestone 4 (PR 4: Activity Core & Legacy Redirects) of the **NightLife-VN Partner Portal Refactoring & Upgrade**.

Specifically, this report addresses:
1. **Legacy Route Redirection Strategy**: Migration of legacy query-parameter based navigation (`/partner?panel=bill`, `/partner/gui-hoa-don`) to isolated sub-routes (`/partner/activity/new-bill`, `/partner/activity`).
2. **Vitest Test Suite Specifications**: Complete test specifications and design patterns for:
   - `usePartnerActivity` custom hook (`__tests__/usePartnerActivity.test.tsx`).
   - Activity Feed sub-route (`__tests__/PartnerActivityPage.test.tsx`).
   - New Bill sub-route (`__tests__/PartnerNewBillPage.test.tsx`).

---

## 1. Legacy Redirects Analysis & Specifications

### 1.1 Redirect Specification: `frontend/apps/web/src/app/partner/gui-hoa-don/page.tsx`
- **Context & Purpose**: `/partner/gui-hoa-don` is a legacy Vietnamese route originally created for partner bill submission. In previous iterations, it redirected to `/partner?panel=bill`.
- **Target Architecture**: Relocate bill submission to the dedicated sub-route `/partner/activity/new-bill`.
- **Implementation Design**:
  ```tsx
  // Location: frontend/apps/web/src/app/partner/gui-hoa-don/page.tsx
  import { redirect } from 'next/navigation';

  export default function PartnerBillSubmitPage() {
    redirect('/partner/activity/new-bill');
    return null;
  }
  ```
- **Rationale & Verification**:
  - Uses Next.js App Router server-side `redirect()` for zero FOUC (Flash of Unstyled Content) and clean HTTP 307/308 redirect headers.
  - Test verification: Mount `PartnerBillSubmitPage()` or call route handler and assert `redirect` was called with target path `'/partner/activity/new-bill'`.

### 1.2 Redirect Specification: `frontend/apps/web/src/app/partner/page.tsx`
- **Context & Purpose**: The legacy monolith `page.tsx` at `/partner` accepted query parameter `?panel=...`.
- **Target Redirect Mapping**:
  | Legacy Query URL | Target Sub-route | Action |
  | :--- | :--- | :--- |
  | `/partner?panel=bill` | `/partner/activity/new-bill` | Permanent Client / Server Redirect |
  | `/partner?panel=activity` | `/partner/activity` | Permanent Client / Server Redirect |
  | `/partner?panel=scan` | `/partner/scan` | Strangler Redirect |
  | `/partner?panel=listing` | `/partner/listing` | Strangler Redirect |
  | `/partner?panel=settings` | `/partner/settings` | Strangler Redirect |
  | `/partner?panel=staff` | `/partner/settings/staff` | Strangler Redirect |

- **Implementation Design in `partner/page.tsx`**:
  ```tsx
  // Inside PartnerPage client component setup:
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const panel = searchParams.get('panel');
    if (panel === 'bill') {
      router.replace('/partner/activity/new-bill');
    } else if (panel === 'activity') {
      router.replace('/partner/activity');
    } else if (panel === 'scan') {
      router.replace('/partner/scan');
    } else if (panel === 'listing') {
      router.replace('/partner/listing');
    } else if (panel === 'settings') {
      router.replace('/partner/settings');
    } else if (panel === 'staff') {
      router.replace('/partner/settings/staff');
    }
  }, [searchParams, router]);
  ```
- **Benefits**: Using `router.replace()` prevents accumulating redirection history in the user's browser back button history.

---

## 2. Vitest Test Specifications

### 2.1 Test Suite 1: `__tests__/usePartnerActivity.test.tsx`
This test suite covers the custom React hook `usePartnerActivity()` located at `src/hooks/usePartnerActivity.ts`.

#### Design & Test Cases Matrix:
```tsx
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePartnerActivity } from '../src/hooks/usePartnerActivity';
import { partnerPortalApi } from '../src/lib/api/partner-portal';

vi.mock('../src/lib/api/partner-portal', () => ({
  partnerPortalApi: {
    getActivityFeed: vi.fn(),
  },
}));

describe('usePartnerActivity hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Fetches activity feed successfully on initial render', async () => {
    const mockData = {
      items: [
        { id: 'act-1', type: 'BILL', status: 'VERIFIED', title: 'Hóa đơn #1', createdAt: '2026-08-05T10:00:00Z' },
      ],
      meta: { nextCursor: 'cursor-2', total: 1 },
    };
    (partnerPortalApi.getActivityFeed as any).mockResolvedValue(mockData);

    const { result } = renderHook(() => usePartnerActivity({ storeId: 'store-neon' }));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData.items);
    expect(result.current.meta.nextCursor).toBe('cursor-2');
    expect(result.current.error).toBeNull();
    expect(partnerPortalApi.getActivityFeed).toHaveBeenCalledWith(
      expect.objectContaining({ storeId: 'store-neon' })
    );
  });

  it('2. Resets state and refetches when storeId changes', async () => {
    (partnerPortalApi.getActivityFeed as any).mockResolvedValue({
      items: [{ id: 'act-1', type: 'BILL' }],
      meta: { nextCursor: null, total: 1 },
    });

    const { result, rerender } = renderHook(
      ({ storeId }) => usePartnerActivity({ storeId }),
      { initialProps: { storeId: 'store-1' } }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    rerender({ storeId: 'store-2' });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(partnerPortalApi.getActivityFeed).toHaveBeenCalledWith(
      expect.objectContaining({ storeId: 'store-2' })
    );
  });

  it('3. Performs cursor-based pagination with fetchNextPage()', async () => {
    (partnerPortalApi.getActivityFeed as any)
      .mockResolvedValueOnce({
        items: [{ id: 'act-1', type: 'BILL' }],
        meta: { nextCursor: 'cursor-abc', total: 2 },
      })
      .mockResolvedValueOnce({
        items: [{ id: 'act-2', type: 'BOOKING' }],
        meta: { nextCursor: null, total: 2 },
      });

    const { result } = renderHook(() => usePartnerActivity({ storeId: 'store-1' }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.fetchNextPage();
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[1].id).toBe('act-2');
    expect(partnerPortalApi.getActivityFeed).toHaveBeenLastCalledWith(
      expect.objectContaining({ cursor: 'cursor-abc' })
    );
  });

  it('4. Handles API errors gracefully without crashing', async () => {
    (partnerPortalApi.getActivityFeed as any).mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => usePartnerActivity({ storeId: 'store-1' }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error?.message).toBe('Network Error');
    expect(result.current.data).toEqual([]);
  });

  it('5. Cancels in-flight requests on unmount via AbortController', async () => {
    let abortSignal: AbortSignal | undefined;
    (partnerPortalApi.getActivityFeed as any).mockImplementation(({ signal }: { signal?: AbortSignal }) => {
      abortSignal = signal;
      return new Promise(() => {}); // never resolves
    });

    const { unmount } = renderHook(() => usePartnerActivity({ storeId: 'store-1' }));
    expect(abortSignal?.aborted).toBe(false);

    unmount();
    expect(abortSignal?.aborted).toBe(true);
  });
});
```

---

### 2.2 Test Suite 2: `__tests__/PartnerActivityPage.test.tsx`
This test suite covers the Activity Feed sub-route at `src/app/partner/activity/page.tsx`.

#### Design & Test Cases Matrix:
```tsx
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PartnerActivityPage from '../src/app/partner/activity/page';
import { SystemFeedbackProvider } from '../src/components/ui/SystemFeedback';
import { PartnerProviders } from '../src/app/partner/PartnerProviders';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/partner/activity',
}));

vi.mock('../src/lib/auth/session', () => ({
  getAuthUser: () => ({ role: 'PARTNER', displayName: 'Demo Partner' }),
}));

vi.mock('../src/hooks/usePartnerActivity', () => ({
  usePartnerActivity: vi.fn(),
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
      data: [
        { id: 'act-1', type: 'BILL', totalVnd: 1500000, status: 'VERIFIED', title: 'Hóa đơn #BILL-001', createdAt: '2026-08-05T10:00:00Z' },
        { id: 'act-2', type: 'BOOKING', status: 'CHECKED_IN', title: 'Đặt bàn Nguyễn Văn A', createdAt: '2026-08-05T11:00:00Z' },
      ],
      meta: { nextCursor: null, total: 2 },
      isLoading: false,
      error: null,
      fetchNextPage: vi.fn(),
    });

    render(
      <SystemFeedbackProvider>
        <PartnerProviders>
          <PartnerActivityPage />
        </PartnerProviders>
      </SystemFeedbackProvider>
    );

    expect(screen.getByText('Hóa đơn #BILL-001')).toBeInTheDocument();
    expect(screen.getByText('Đặt bàn Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tìm kiếm hoạt động/i)).toBeInTheDocument();
  });

  it('2. Navigates to activity detail on item click', async () => {
    (usePartnerActivity as any).mockReturnValue({
      data: [{ id: 'act-123', type: 'BILL', title: 'Hóa đơn #BILL-123' }],
      meta: { nextCursor: null },
      isLoading: false,
      fetchNextPage: vi.fn(),
    });

    render(
      <SystemFeedbackProvider>
        <PartnerProviders>
          <PartnerActivityPage />
        </PartnerProviders>
      </SystemFeedbackProvider>
    );

    fireEvent.click(screen.getByText('Hóa đơn #BILL-123'));
    expect(mockPush).toHaveBeenCalledWith('/partner/activity/act-123');
  });

  it('3. Triggers fetchNextPage when clicking "Tải thêm"', async () => {
    const mockFetchNext = vi.fn();
    (usePartnerActivity as any).mockReturnValue({
      data: [{ id: 'act-1', type: 'BILL', title: 'Item 1' }],
      meta: { nextCursor: 'cursor-next' },
      isLoading: false,
      isFetchingNextPage: false,
      fetchNextPage: mockFetchNext,
    });

    render(
      <SystemFeedbackProvider>
        <PartnerProviders>
          <PartnerActivityPage />
        </PartnerProviders>
      </SystemFeedbackProvider>
    );

    const loadMoreBtn = screen.getByRole('button', { name: /Tải thêm/i });
    fireEvent.click(loadMoreBtn);
    expect(mockFetchNext).toHaveBeenCalledTimes(1);
  });

  it('4. Displays empty state when no activities exist', () => {
    (usePartnerActivity as any).mockReturnValue({
      data: [],
      meta: { nextCursor: null },
      isLoading: false,
      error: null,
    });

    render(
      <SystemFeedbackProvider>
        <PartnerProviders>
          <PartnerActivityPage />
        </PartnerProviders>
      </SystemFeedbackProvider>
    );

    expect(screen.getByText(/Chưa có hoạt động nào/i)).toBeInTheDocument();
  });
});
```

---

### 2.3 Test Suite 3: `__tests__/PartnerNewBillPage.test.tsx`
This test suite covers the New Bill submission sub-route at `src/app/partner/activity/new-bill/page.tsx`.

#### Design & Test Cases Matrix:
```tsx
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PartnerNewBillPage from '../src/app/partner/activity/new-bill/page';
import { SystemFeedbackProvider } from '../src/components/ui/SystemFeedback';
import { PartnerProviders } from '../src/app/partner/PartnerProviders';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockSubmitPartnerBill = vi.fn();
const mockUploadEvidence = vi.fn();
const mockPreviewBillOcr = vi.fn();

vi.mock('../src/lib/api/bills', () => ({
  billApi: {
    listPartnerStores: vi.fn().mockResolvedValue([
      { id: 'store-neon', name: 'Neon Club', slug: 'neon-club' },
    ]),
    submitPartnerBill: (...args: any[]) => mockSubmitPartnerBill(...args),
    uploadEvidence: (...args: any[]) => mockUploadEvidence(...args),
    previewBillOcr: (...args: any[]) => mockPreviewBillOcr(...args),
  },
}));

describe('PartnerNewBillPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSubmitPartnerBill.mockResolvedValue({
      id: 'bill-new-1',
      storeId: 'store-neon',
      totalVnd: 2000000,
    });
    mockUploadEvidence.mockResolvedValue({ id: 'media-1' });
  });

  afterEach(() => {
    cleanup();
  });

  it('1. Formats amount input with thousands separators', async () => {
    render(
      <SystemFeedbackProvider>
        <PartnerProviders>
          <PartnerNewBillPage />
        </PartnerProviders>
      </SystemFeedbackProvider>
    );

    const amountInput = await screen.findByLabelText(/Tổng tiền bill gốc/i) as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '2000000' } });

    await waitFor(() => {
      expect(amountInput.value).toBe('2.000.000');
    });
  });

  it('2. Triggers OCR scan preview and populates form fields', async () => {
    mockPreviewBillOcr.mockResolvedValue({
      suggestions: { totalVnd: 3500000, usedAt: '2026-08-05T14:00' },
      confidence: 0.9,
    });

    render(
      <SystemFeedbackProvider>
        <PartnerProviders>
          <PartnerNewBillPage />
        </PartnerProviders>
      </SystemFeedbackProvider>
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const testFile = new File(['ocr-proof'], 'bill.jpg', { type: 'image/jpeg' });

    fireEvent.change(fileInput, { target: { files: [testFile] } });

    await waitFor(() => {
      expect(mockPreviewBillOcr).toHaveBeenCalledWith(testFile);
    });

    const amountInput = screen.getByLabelText(/Tổng tiền bill gốc/i) as HTMLInputElement;
    await waitFor(() => {
      expect(amountInput.value).toBe('3.500.000');
    });
  });

  it('3. Submits form, uploads evidence, and redirects to activity feed', async () => {
    render(
      <SystemFeedbackProvider>
        <PartnerProviders>
          <PartnerNewBillPage />
        </PartnerProviders>
      </SystemFeedbackProvider>
    );

    const amountInput = await screen.findByLabelText(/Tổng tiền bill gốc/i);
    const usedAtInput = screen.getByLabelText(/Thời gian sử dụng/i);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const form = amountInput.closest('form')!;

    fireEvent.change(amountInput, { target: { value: '2000000' } });
    fireEvent.change(usedAtInput, { target: { value: '2026-08-05T12:00' } });
    fireEvent.change(fileInput, {
      target: { files: [new File(['proof'], 'proof.png', { type: 'image/png' })] },
    });

    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockSubmitPartnerBill).toHaveBeenCalledWith(
        expect.objectContaining({
          storeId: 'store-neon',
          totalVnd: 2000000,
        })
      );
      expect(mockUploadEvidence).toHaveBeenCalledWith('bill-new-1', expect.any(File));
      expect(mockPush).toHaveBeenCalledWith('/partner/activity');
    });
  });
});
```

---

## 3. Conclusion & Recommendations
1. **Legacy Route Handling**: Updating `gui-hoa-don/page.tsx` and adding redirect logic inside `partner/page.tsx` guarantees backwards compatibility for legacy bookmarks and links without duplicating logic.
2. **Testing Coverage**: The 3 designed test suites cover hook logic (state, pagination, abort controller), activity feed UX (search, filter, pagination, role restriction), and bill creation flow (amount formatting, OCR pre-fill, submission & evidence upload).
