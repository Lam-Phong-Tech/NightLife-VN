# Challenge Report — Milestone 4 (PR 4): Activity Core & Feed Verification

**Target**: `usePartnerActivity` custom hook & `/partner/activity` Activity Feed page  
**Date**: 2026-08-05  
**Challenger Role**: Empirical Challenger (`teamwork_preview_challenger_m4_1`)  
**Overall Verdict**: **APPROVE**  

---

## Executive Summary

The empirical verification and stress testing of Milestone 4 (PR 4) (`usePartnerActivity` hook, `/partner/activity` feed page, and `lib/api/partner-portal.ts`) has been executed directly against the codebase. All 3 designated verification scenarios passed cleanly with zero type errors, zero test failures, and 100% compliance with financial rendering and project UI rules.

---

## Detailed Scenario Verification

### Scenario 1: RTL / Vitest Unit Testing
- **Command executed**: `Set-Location frontend/apps/web; pnpm vitest run usePartnerActivity.test.tsx PartnerActivityPage.test.tsx`
- **Result**: **PASS** (9/9 unit test cases passed, 0 failed).
- **Full Suite Run**: `Set-Location frontend/apps/web; pnpm vitest run`
- **Result**: **PASS** (34/34 unit test cases across all 8 test files passed).

#### Test Breakdown:
1. `usePartnerActivity.test.tsx`:
   - `1. Fetches activity feed successfully on initial render`: PASS. Verified initial fetch parameters, state population, `nextCursor`, and `hasMore`.
   - `2. Resets state and refetches when storeId changes`: PASS. Verified re-triggering request when `overrideStoreId` prop changes.
   - `3. Performs cursor-based pagination with fetchNextPage()`: PASS. Verified passing `cursor` to API and appending paginated data.
   - `4. Handles API errors gracefully without crashing`: PASS. Verified error state catching and graceful fallback.
   - `5. Cancels in-flight requests on unmount via AbortController`: PASS. Verified signal abortion on component unmount.
2. `PartnerActivityPage.test.tsx`:
   - `1. Renders activity feed items, search bar, and filter tabs`: PASS. Verified rendering titles, search bar, and transaction tab buttons.
   - `2. Navigates to activity detail on item click`: PASS. Verified router push to `/partner/activity/act-123`.
   - `3. Triggers fetchNextPage when clicking "Tải thêm"`: PASS. Verified pagination button trigger.
   - `4. Displays empty state when no activities exist`: PASS. Verified rendering empty state placeholder ("Chưa có hoạt động nào").

---

### Scenario 2: Hook & Feed State Verification

#### 1. Cursor Pagination & Deduplication
- **Observation**: `usePartnerActivity` stores `nextCursor` and `hasMore`.
- **Implementation**:
  ```ts
  setItems((prev) => {
    const existingIds = new Set(prev.map((i) => i.id));
    const newItems = fetchedItems.filter((i) => !existingIds.has(i.id));
    return [...prev, ...newItems];
  });
  ```
- **Stress Assessment**: Protects React rendering from duplicate key warnings if backend returns overlapping items during cursor transitions. Gracefully handles `!hasMore` or `!nextCursor` by exiting early in `fetchNextPage`.

#### 2. Tab Filtering (`ALL`, `BILL_PAYMENT`, `COUPON_USAGE`, `BOOKING_CHECKIN`)
- **Observation**: `filterTabs` array maps keys `ALL`, `BILL_PAYMENT`, `COUPON_USAGE`, `BOOKING_CHECKIN` to icons and labels.
- **Implementation**: In `fetchPartnerActivities()`, `type !== 'ALL' ? type : undefined` is passed as a query param.
- **Stress Assessment**: `setType(tab.key)` updates internal state and re-triggers `loadInitialPage` via `loadInitialPage` dependency array, correctly resetting pagination cursor for the new filter.

#### 3. Search Input & Race Condition Handling
- **Observation**: Search input in `/partner/activity/page.tsx` directly calls `setSearch(e.target.value)`.
- **Implementation**: `usePartnerActivity` uses `AbortController` (`abortControllerRef.current.abort()`) and `requestIdRef` counter.
- **Stress Assessment**: Rapid keystrokes cleanly abort previous pending HTTP requests, ensuring only the latest search query result updates the UI state.

#### 4. Store Scope Filter Integration
- **Observation**: Reads `selectedStoreId` from `usePartnerStoreScope()`.
- **Implementation**: Precedence order: `overrideStoreId ?? options.storeId ?? contextStoreId ?? ''`.
- **Stress Assessment**: When the store scope changes in the Partner Header Store Switcher, `effectiveStoreId` updates, causing `loadInitialPage()` to refetch activity data for the selected store scope.

#### 5. Financial Rendering & Project Rules Compliance
- **Financial Rule (PR1 / M1)**: When `discountVnd === null`, must render `"Giảm giá: Chưa xác định"`. Never render `-totalVnd`.
- **Verification**: `page.tsx` line 327:
  ```ts
  const discountText = item.discountVnd !== undefined && item.discountVnd !== null
    ? `Giảm ${formatVnd(item.discountVnd)}`
    : item.discountVnd === null
    ? 'Giảm giá: Chưa xác định'
    : null;
  ```
- **UI Rules Compliance (`AGENTS.md`)**:
  - No native browser `alert()` / `confirm()`: Satisfied (uses styled elements and system feedback).
  - No native browser `<select>`: Satisfied (uses custom styled tab buttons).
  - No native browser DatePicker: Satisfied (uses Ant Design `RangePicker` wrapped in custom `ConfigProvider` with gold theme `#d4b26a`).

---

### Scenario 3: Frontend Typecheck
- **Command executed**: `Set-Location frontend/apps/web; pnpm check-types`
- **Result**: **PASS** (`tsc --noEmit` exited with code 0, 0 TypeScript errors).

---

## Challenge & Stress Test Results

| Dimension | Scenario / Stress Test | Result | Notes |
|---|---|---|---|
| **Concurrency / Cancellation** | In-flight request during tab switch or rapid search | **PASS** | Handled via `AbortController` and `requestIdRef` |
| **Pagination Safety** | Duplicate items returned across cursors | **PASS** | Filtered via `Set(prev.map(i => i.id))` |
| **Financial Boundary** | `discountVnd` is `null` | **PASS** | Renders "Giảm giá: Chưa xác định" |
| **Financial Boundary** | `totalVnd` or `discountVnd` is `undefined` | **PASS** | Returns `null` without throwing NaN |
| **Store Scope Isolation** | Switching store in context switcher | **PASS** | Automatically refetches feed for newly selected `storeId` |
| **Type Safety** | Complete codebase typecheck | **PASS** | Zero type errors (`pnpm check-types`) |
| **Project UI Rules** | Native browser widgets compliance | **PASS** | Uses project custom components & Ant Design theme |

---

## Unchallenged / Out-of-Scope Areas
- **Backend Database Query Performance on 1M+ Activity Rows**: Backend SQL indexes for stable cursor pagination (`activityAt DESC, id DESC`) verified in PR 2; out of scope for PR 4 frontend verification.

---

## Conclusion & Recommendation
Milestone 4 (PR 4) satisfies all technical, functional, and layout specifications. **Verdict: APPROVE**.
