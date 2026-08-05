'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePartnerStoreScope } from '@/app/partner/PartnerProviders';
import {
  fetchPartnerActivities,
  partnerPortalApi,
  PartnerActivityItem,
  PartnerActivityQueryParams,
  PartnerActivityType,
} from '@/lib/api/partner-portal';

export interface UsePartnerActivityOptions {
  initialType?: PartnerActivityType;
  initialStartDate?: string;
  initialEndDate?: string;
  initialSearch?: string;
  storeId?: string;
  overrideStoreId?: string;
  limit?: number;
}

export interface UsePartnerActivityReturn {
  items: PartnerActivityItem[];
  data: PartnerActivityItem[];
  nextCursor: string | null;
  meta: {
    nextCursor: string | null;
    total: number;
  };
  hasMore: boolean;
  loading: boolean;
  isLoading: boolean;
  loadingMore: boolean;
  isFetchingNextPage: boolean;
  error: Error | null;
  type: PartnerActivityType;
  startDate: string;
  endDate: string;
  search: string;
  storeId: string;
  setType: (type: PartnerActivityType) => void;
  setStartDate: (startDate: string) => void;
  setEndDate: (endDate: string) => void;
  setSearch: (search: string) => void;
  setFilters: (filters: Partial<PartnerActivityQueryParams>) => void;
  fetchNextPage: () => Promise<void>;
  refresh: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function usePartnerActivity(
  options: UsePartnerActivityOptions = {},
): UsePartnerActivityReturn {
  let contextStoreId = '';
  try {
    const scope = usePartnerStoreScope();
    contextStoreId = scope?.selectedStoreId || '';
  } catch {
    // If used outside PartnerStoreScopeProvider in tests
  }

  const effectiveStoreId = options.overrideStoreId ?? options.storeId ?? contextStoreId ?? '';

  const [type, setType] = useState<PartnerActivityType>(options.initialType || 'ALL');
  const [startDate, setStartDate] = useState<string>(options.initialStartDate || '');
  const [endDate, setEndDate] = useState<string>(options.initialEndDate || '');
  const [search, setSearch] = useState<string>(options.initialSearch || '');

  const [items, setItems] = useState<PartnerActivityItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef<number>(0);

  const loadInitialPage = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const currentReqId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    try {
      const fetchFn = partnerPortalApi.getActivityFeed || fetchPartnerActivities;
      const res = await fetchFn(
        {
          limit: options.limit || 20,
          type: type !== 'ALL' ? type : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          search: search.trim() || undefined,
          storeId: effectiveStoreId || undefined,
        },
        controller.signal,
      );

      if (currentReqId === requestIdRef.current) {
        const fetchedItems = res.data || res.items || [];
        const fetchedCursor = res.nextCursor ?? res.meta?.nextCursor ?? null;
        const fetchedHasMore = typeof res.hasMore === 'boolean' ? res.hasMore : Boolean(fetchedCursor);

        setItems(fetchedItems);
        setNextCursor(fetchedCursor);
        setHasMore(fetchedHasMore);
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'name' in err && err.name === 'AbortError') return;
      if (currentReqId === requestIdRef.current) {
        const errMsg = err instanceof Error ? err.message : 'Không thể tải danh sách hoạt động.';
        setError(err instanceof Error ? err : new Error(errMsg));
      }
    } finally {
      if (currentReqId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [type, startDate, endDate, search, effectiveStoreId, options.limit]);

  useEffect(() => {
    let isSubscribed = true;
    if (isSubscribed) {
      void loadInitialPage();
    }
    return () => {
      isSubscribed = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadInitialPage]);

  const fetchNextPage = useCallback(async () => {
    if (!hasMore || !nextCursor || loadingMore || loading) return;

    const controller = new AbortController();
    const currentReqId = requestIdRef.current;

    setLoadingMore(true);
    setError(null);

    try {
      const fetchFn = partnerPortalApi.getActivityFeed || fetchPartnerActivities;
      const res = await fetchFn(
        {
          limit: options.limit || 20,
          cursor: nextCursor,
          type: type !== 'ALL' ? type : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          search: search.trim() || undefined,
          storeId: effectiveStoreId || undefined,
        },
        controller.signal,
      );

      if (currentReqId === requestIdRef.current) {
        const fetchedItems = res.data || res.items || [];
        const fetchedCursor = res.nextCursor ?? res.meta?.nextCursor ?? null;
        const fetchedHasMore = typeof res.hasMore === 'boolean' ? res.hasMore : Boolean(fetchedCursor);

        setItems((prev) => {
          const existingIds = new Set(prev.map((i) => i.id));
          const newItems = fetchedItems.filter((i) => !existingIds.has(i.id));
          return [...prev, ...newItems];
        });
        setNextCursor(fetchedCursor);
        setHasMore(fetchedHasMore);
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'name' in err && err.name === 'AbortError') return;
      if (currentReqId === requestIdRef.current) {
        const errMsg = err instanceof Error ? err.message : 'Không thể tải thêm hoạt động.';
        setError(err instanceof Error ? err : new Error(errMsg));
      }
    } finally {
      if (currentReqId === requestIdRef.current) {
        setLoadingMore(false);
      }
    }
  }, [hasMore, nextCursor, loadingMore, loading, type, startDate, endDate, search, effectiveStoreId, options.limit]);

  const refresh = useCallback(async () => {
    await loadInitialPage();
  }, [loadInitialPage]);

  const setFilters = useCallback((filters: Partial<PartnerActivityQueryParams>) => {
    if (filters.type !== undefined) setType(filters.type);
    if (filters.startDate !== undefined) setStartDate(filters.startDate);
    if (filters.endDate !== undefined) setEndDate(filters.endDate);
    if (filters.search !== undefined) setSearch(filters.search);
  }, []);

  return {
    items,
    data: items,
    nextCursor,
    meta: {
      nextCursor,
      total: items.length,
    },
    hasMore,
    loading,
    isLoading: loading,
    loadingMore,
    isFetchingNextPage: loadingMore,
    error,
    type,
    startDate,
    endDate,
    search,
    storeId: effectiveStoreId,
    setType,
    setStartDate,
    setEndDate,
    setSearch,
    setFilters,
    fetchNextPage,
    refresh,
    refetch: refresh,
  };
}
