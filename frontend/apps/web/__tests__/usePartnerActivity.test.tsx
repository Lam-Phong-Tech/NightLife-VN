import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePartnerActivity } from '../src/hooks/usePartnerActivity';
import { partnerPortalApi } from '../src/lib/api/partner-portal';

vi.mock('../src/lib/api/partner-portal', () => ({
  fetchPartnerActivities: vi.fn(),
  partnerPortalApi: {
    getActivityFeed: vi.fn(),
    fetchPartnerActivities: vi.fn(),
  },
}));

vi.mock('../src/app/partner/PartnerProviders', () => ({
  usePartnerStoreScope: () => ({
    selectedStoreId: 'store-neon',
    stores: [{ id: 'store-neon', name: 'Neon Club' }],
  }),
}));

describe('usePartnerActivity hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Fetches activity feed successfully on initial render', async () => {
    const mockData = {
      data: [
        {
          id: 'act-1',
          rawId: '1',
          sourceType: 'BILL',
          activityType: 'BILL_PAYMENT',
          activityAt: '2026-08-05T10:00:00Z',
          storeId: 'store-neon',
          storeName: 'Neon Club',
          summary: 'Hóa đơn #BILL-001',
          status: 'VERIFIED',
          totalVnd: 1500000,
        },
      ],
      nextCursor: 'cursor-2',
      hasMore: true,
    };

    (partnerPortalApi.getActivityFeed as any).mockResolvedValue(mockData);

    const { result } = renderHook(() => usePartnerActivity({ overrideStoreId: 'store-neon' }));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.items).toEqual(mockData.data);
    expect(result.current.nextCursor).toBe('cursor-2');
    expect(result.current.hasMore).toBe(true);
    expect(result.current.error).toBeNull();
    expect(partnerPortalApi.getActivityFeed).toHaveBeenCalledWith(
      expect.objectContaining({ storeId: 'store-neon' }),
      expect.any(AbortSignal),
    );
  });

  it('2. Resets state and refetches when storeId changes', async () => {
    (partnerPortalApi.getActivityFeed as any).mockResolvedValue({
      data: [{ id: 'act-1', sourceType: 'BILL', summary: 'Item 1' }],
      nextCursor: null,
      hasMore: false,
    });

    const { result, rerender } = renderHook(
      ({ storeId }) => usePartnerActivity({ overrideStoreId: storeId }),
      { initialProps: { storeId: 'store-1' } },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    rerender({ storeId: 'store-2' });

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(partnerPortalApi.getActivityFeed).toHaveBeenCalledWith(
      expect.objectContaining({ storeId: 'store-2' }),
      expect.any(AbortSignal),
    );
  });

  it('3. Performs cursor-based pagination with fetchNextPage()', async () => {
    (partnerPortalApi.getActivityFeed as any)
      .mockResolvedValueOnce({
        data: [{ id: 'act-1', sourceType: 'BILL', summary: 'Item 1' }],
        nextCursor: 'cursor-abc',
        hasMore: true,
      })
      .mockResolvedValueOnce({
        data: [{ id: 'act-2', sourceType: 'BOOKING', summary: 'Item 2' }],
        nextCursor: null,
        hasMore: false,
      });

    const { result } = renderHook(() => usePartnerActivity({ overrideStoreId: 'store-1' }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.fetchNextPage();
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[1]?.id).toBe('act-2');
    expect(partnerPortalApi.getActivityFeed).toHaveBeenLastCalledWith(
      expect.objectContaining({ cursor: 'cursor-abc' }),
      expect.any(AbortSignal),
    );
  });

  it('4. Handles API errors gracefully without crashing', async () => {
    (partnerPortalApi.getActivityFeed as any).mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => usePartnerActivity({ overrideStoreId: 'store-1' }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeDefined();
    expect(result.current.error!.message).toBe('Network Error');
    expect(result.current.items).toEqual([]);
  });

  it('5. Cancels in-flight requests on unmount via AbortController', async () => {
    let abortSignal: AbortSignal | undefined;
    (partnerPortalApi.getActivityFeed as any).mockImplementation((_params: any, signal?: AbortSignal) => {
      abortSignal = signal;
      return new Promise(() => {});
    });

    const { unmount } = renderHook(() => usePartnerActivity({ overrideStoreId: 'store-1' }));
    expect(abortSignal?.aborted).toBe(false);

    unmount();
    expect(abortSignal?.aborted).toBe(true);
  });
});
