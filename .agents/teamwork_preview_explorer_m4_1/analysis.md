# Frontend API Client & Custom Hook Analysis (Milestone 4 / PR 4)

## Executive Summary
This report presents the architectural design and investigation results for the frontend API Client (`partner-portal.ts`) and React Custom Hook (`usePartnerActivity.ts`) for **Milestone 4 (PR 4: Activity Core, New Bill Route & Safe Legacy Redirects)**.

The investigation mapped backend NestJS contracts from PR 2 (`PartnerActivityQueryDto`, `PartnerActivityItem`, `PartnerActivityResponse`, `getPartnerHome`, `getPartnerActivities`, `getPartnerActivityDetail`) to clean, typed, and resilient frontend constructs in `frontend/apps/web/src/lib/api/partner-portal.ts` and `frontend/apps/web/src/hooks/usePartnerActivity.ts`.

---

## 1. API Client Design (`frontend/apps/web/src/lib/api/partner-portal.ts`)

### 1.1 Backend Endpoint Alignment
| Endpoint | Method | Backend Method / DTO | Purpose |
|---|---|---|---|
| `/partner/home` | `GET` | `getPartnerHome(user, storeId)` | Dashboard overview metrics (`revenue`, `billCount`, `bookingCount`, `activeCoupons`) & top 5 recent activities |
| `/partner/activity` | `GET` | `getPartnerActivities(user, dto)` | Paginated activity stream sorted by `(activityAt DESC, id DESC)` with cursor token |
| `/partner/activity/:activityId` | `GET` | `getPartnerActivityDetail(user, activityId, storeId)` | Full activity item detail (`BILL`, `COUPON_ISSUE`, or `BOOKING`) |

### 1.2 TypeScript Interfaces
The interfaces strictly mirror backend definitions in `backend/src/nightlife-data/dto/partner-activity-query.dto.ts` and `nightlife-data.service.ts`:

```typescript
import { apiClient } from './client';

export type PartnerActivityType = 'ALL' | 'COUPON_USAGE' | 'BILL_PAYMENT' | 'BOOKING_CHECKIN';

export interface PartnerActivityQueryParams {
  limit?: number;
  cursor?: string;
  type?: PartnerActivityType;
  startDate?: string;
  endDate?: string;
  search?: string;
  storeId?: string;
}

export interface PartnerActivityLinkedEntities {
  bookingId?: string | null;
  couponIssueId?: string | null;
  billId?: string | null;
}

export interface PartnerActivityItem {
  id: string; // e.g. "bill:clx123", "coupon:clx456", "booking:clx789"
  rawId: string;
  sourceType: 'BILL' | 'COUPON_ISSUE' | 'BOOKING';
  activityType: 'COUPON_USAGE' | 'BILL_PAYMENT' | 'BOOKING_CHECKIN';
  activityAt: string; // ISO 8601 string
  storeId: string;
  storeName: string;
  storeAddress?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customerTier?: string | null;
  summary: string;
  totalVnd?: number | null;
  discountVnd?: number | null;
  couponCode?: string | null;
  billNumber?: string | null;
  bookingCode?: string | null;
  status: string;
  statusLabel?: string;
  badgeTone?: 'success' | 'warning' | 'danger' | 'info';
  linkedEntities?: PartnerActivityLinkedEntities;
  
  // Detailed properties from getPartnerActivityDetail
  subtotalVnd?: number | null;
  serviceChargeVnd?: number | null;
  taxVnd?: number | null;
  paidVnd?: number | null;
  partySize?: number | null;
  discountRuleSnapshot?: any;
  booking?: {
    id: string;
    bookingCode: string;
    scheduledAt: string;
    partySize?: number | null;
  } | null;
  bill?: {
    id: string;
    billNumber?: string | null;
    totalVnd?: number | null;
  } | null;
  reviewedBy?: { id: string; name: string } | null;
  scannedBy?: { id: string; name: string } | null;
}

export interface PartnerActivityResponse {
  data: PartnerActivityItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface PartnerHomeMetrics {
  totalRevenueVnd: number;
  billCount: number;
  bookingCount: number;
  activeCouponsCount: number;
}

export interface PartnerHomeOverview {
  metrics: PartnerHomeMetrics;
  recentActivities: PartnerActivityItem[];
}
```

### 1.3 Client API Implementation
Using the centralized `apiClient` helper (`frontend/apps/web/src/lib/api/client.ts`), methods are implemented with `AbortSignal` support for request cancellation:

```typescript
export async function fetchPartnerHome(
  storeId?: string,
  signal?: AbortSignal,
): Promise<PartnerHomeOverview> {
  return apiClient<PartnerHomeOverview>('/partner/home', {
    params: { storeId: storeId || undefined },
    signal,
  });
}

export async function fetchPartnerActivities(
  params: PartnerActivityQueryParams = {},
  signal?: AbortSignal,
): Promise<PartnerActivityResponse> {
  return apiClient<PartnerActivityResponse>('/partner/activity', {
    params: {
      limit: params.limit,
      cursor: params.cursor,
      type: params.type && params.type !== 'ALL' ? params.type : undefined,
      startDate: params.startDate,
      endDate: params.endDate,
      search: params.search,
      storeId: params.storeId || undefined,
    },
    signal,
  });
}

export async function fetchPartnerActivityDetail(
  activityId: string,
  storeId?: string,
  signal?: AbortSignal,
): Promise<PartnerActivityItem> {
  return apiClient<PartnerActivityItem>(
    `/partner/activity/${encodeURIComponent(activityId)}`,
    {
      params: { storeId: storeId || undefined },
      signal,
    },
  );
}

export const partnerPortalApi = {
  fetchPartnerHome,
  fetchPartnerActivities,
  fetchPartnerActivityDetail,
};
```

---

## 2. React Custom Hook Design (`frontend/apps/web/src/hooks/usePartnerActivity.ts`)

### 2.1 Context Integration & Store Scope Awareness
`usePartnerActivity` leverages `usePartnerStoreScope()` from `@/app/partner/PartnerProviders` to automatically synchronize with the active store selected in the top shell switcher (`selectedStoreId`).

- **Default Behavior**: If `overrideStoreId` is not specified, `selectedStoreId` from `usePartnerStoreScope()` is automatically used.
- **Store Switch Reaction**: Whenever `selectedStoreId` changes, the hook automatically resets pagination state (`items: []`, `nextCursor: null`, `hasMore: true`) and fetches page 1 for the new store scope.

### 2.2 Stable Cursor Pagination State Machine
Cursor pagination avoids duplicates and offset drift:
- `items`: Accumulated array of unique `PartnerActivityItem`s.
- `nextCursor`: Base64 cursor token returned from backend for fetching the subsequent page.
- `hasMore`: Boolean indicator returned from backend.
- `loading`: True during initial fetch or filter change reset.
- `loadingMore`: True during `fetchNextPage()` calls.
- `error`: User-friendly Vietnamese error string translated by `ApiError`.

### 2.3 Filter Management
Supported filter dimensions:
1. `type`: `'ALL' | 'COUPON_USAGE' | 'BILL_PAYMENT' | 'BOOKING_CHECKIN'`
2. `startDate` & `endDate`: ISO date boundary strings (e.g. `'2026-08-01'`)
3. `search`: Query string searching bill numbers, booking codes, coupon codes, customer names/phones
4. `storeId`: Automatically defaulted or overridden

Updating any filter resets `items`, resets `cursor`, cancels inflight requests, and triggers page 1 reload.

### 2.4 Race Condition Prevention & Cancellation
- An `AbortController` ref is maintained to abort stale inflight network requests when filters or store scope change.
- A `requestId` sequence counter ensures out-of-order async responses are discarded.

### 2.5 Complete Proposed Implementation Code

```typescript
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePartnerStoreScope } from '@/app/partner/PartnerProviders';
import {
  fetchPartnerActivities,
  PartnerActivityItem,
  PartnerActivityQueryParams,
  PartnerActivityType,
} from '@/lib/api/partner-portal';

export interface UsePartnerActivityOptions {
  initialType?: PartnerActivityType;
  initialStartDate?: string;
  initialEndDate?: string;
  initialSearch?: string;
  overrideStoreId?: string;
  limit?: number;
}

export interface UsePartnerActivityReturn {
  items: PartnerActivityItem[];
  nextCursor: string | null;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
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
}

export function usePartnerActivity(
  options: UsePartnerActivityOptions = {},
): UsePartnerActivityReturn {
  const { selectedStoreId } = usePartnerStoreScope();
  const effectiveStoreId = options.overrideStoreId ?? selectedStoreId ?? '';

  const [type, setType] = useState<PartnerActivityType>(options.initialType || 'ALL');
  const [startDate, setStartDate] = useState<string>(options.initialStartDate || '');
  const [endDate, setEndDate] = useState<string>(options.initialEndDate || '');
  const [search, setSearch] = useState<string>(options.initialSearch || '');

  const [items, setItems] = useState<PartnerActivityItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
      const res = await fetchPartnerActivities(
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
        setItems(res.data);
        setNextCursor(res.nextCursor);
        setHasMore(res.hasMore);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      if (currentReqId === requestIdRef.current) {
        setError(err?.message || 'Không thể tải danh sách hoạt động.');
      }
    } finally {
      if (currentReqId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [type, startDate, endDate, search, effectiveStoreId, options.limit]);

  useEffect(() => {
    loadInitialPage();
    return () => {
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
      const res = await fetchPartnerActivities(
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
        setItems((prev) => {
          const existingIds = new Set(prev.map((i) => i.id));
          const newItems = res.data.filter((i) => !existingIds.has(i.id));
          return [...prev, ...newItems];
        });
        setNextCursor(res.nextCursor);
        setHasMore(res.hasMore);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      if (currentReqId === requestIdRef.current) {
        setError(err?.message || 'Không thể tải thêm hoạt động.');
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
    nextCursor,
    hasMore,
    loading,
    loadingMore,
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
  };
}
```

---

## 3. Project Rules Compliance
When implementing `usePartnerActivity.ts` and consuming components:
1. **No Browser Native Select**: UI consumers MUST use custom dropdown pickers for type filter options.
2. **No Browser Native DatePicker**: UI consumers MUST use custom project date pickers for `startDate` / `endDate`.
3. **No Native Browser Alert**: Error presentation must use toasts or custom feedback modals via `useSystemFeedback`.
