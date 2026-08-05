# Milestone 5 (PR 5: Home Redesign & Monolith Cleanup) Review Report

## Review Summary

**Verdict**: REQUEST_CHANGES

The Milestone 5 (PR 5) implementation successfully refactored the monolithic `frontend/apps/web/src/app/partner/page.tsx` file from over 8,700 lines down to 236 lines (a ~97.3% reduction), eliminating heavy static dependencies (`jsQR`, `ReactQuill`, `quill.snow.css`) from the root `/partner` bundle. The production build (`pnpm build`) and TypeScript check (`pnpm check-types`) both pass with Exit Code 0. Furthermore, `PartnerHomePage.test.tsx` passes all 8 unit tests.

However, **REQUEST_CHANGES** is issued due to 2 failing test files in the Partner Portal test suite (`PartnerSettlementMoney.test.tsx` and `PartnerShellClient.edge-cases.test.tsx`), a missing legacy URL redirect mapping (`?panel=staff`), and a state race condition during store switching.

---

## Findings

### 1. [Critical] Test Suite Regressions in Partner Portal Tests
- **What**: Running `pnpm test __tests__/Partner*` results in 2 failed test files out of 9 (32 passed, 2 failed).
- **Where**:
  - `frontend/apps/web/__tests__/PartnerSettlementMoney.test.tsx:170`
  - `frontend/apps/web/__tests__/PartnerShellClient.edge-cases.test.tsx:107`
- **Why**:
  1. `PartnerSettlementMoney.test.tsx` imports `src/app/partner/page.tsx` expecting the legacy monolith `panel=settlement` to render `BILL-NULL-001`. Since `page.tsx` was simplified to `PartnerHomePage`, `panel=settlement` is no longer rendered inline, breaking the test.
  2. `PartnerShellClient.edge-cases.test.tsx:107` attempts to query a button with accessible name `'Chọn quán hoạt động'`, but that accessible name is attached to the hidden `<select>` element, causing `getByRole('button', { name: 'Chọn quán hoạt động' })` to fail.
- **Suggestion**:
  - Audit and update `PartnerSettlementMoney.test.tsx` to target the appropriate sub-route component (`/partner/activity` or `/partner/activity/new-bill`) or mock the sub-route.
  - Update `PartnerShellClient.edge-cases.test.tsx` to match the current store switcher button structure or role.

### 2. [Major] Missing Legacy Query Parameter Redirect for `?panel=staff`
- **What**: Legacy URL fallback parameter `?panel=staff` is missing from `panelMap` in `page.tsx`.
- **Where**: `frontend/apps/web/src/app/partner/page.tsx`, lines 26-32.
- **Why**: Review Criterion 2 specifically requires client-side `useEffect` fallback handling for legacy URLs including `?panel=staff` -> `/partner/settings/staff`. Currently `panelMap` only contains `scan`, `listing`, `settings`, `bill`, `activity`. Navigating to `/partner?panel=staff` leaves the user on the home dashboard without redirecting.
- **Suggestion**: Add `staff: '/partner/settings/staff'` to `panelMap` in `page.tsx`.

### 3. [Minor] State Race Condition in `loadHomeData` with `AbortController`
- **What**: `finally { setLoading(false); }` executes on aborted network requests, causing loading indicator to turn off prematurely.
- **Where**: `frontend/apps/web/src/app/partner/page.tsx`, lines 44-46.
- **Why**: When switching `selectedStoreId` rapidly, the cleanup function aborts the in-flight fetch. The aborted request's `finally` block runs and calls `setLoading(false)` before the newly triggered fetch completes. The UI temporarily shows default `0 đ` metrics while the new store data is still loading.
- **Suggestion**: Guard `setLoading(false)` or check signal cancellation status before ending loading state.

---

## Verified Claims

- **Monolith Bundle & Line Reduction**: `page.tsx` line count reduced from 8,752 to 236 lines. Heavy imports (`jsQR`, `quill.snow.css`) removed from root bundle -> **PASS**
- **Typecheck (`pnpm check-types`)**: Zero TypeScript errors -> **PASS**
- **Production Build (`pnpm build`)**: Compiled 125 static pages and 9 `/partner/*` sub-routes cleanly -> **PASS**
- **PartnerHomePage Unit Tests (`PartnerHomePage.test.tsx`)**: 8/8 tests pass -> **PASS**
- **Full Partner Test Suite (`pnpm test __tests__/Partner*`)**: 2/9 test files failed -> **FAIL**

---

## Coverage Gaps & Risk Assessment

- **Legacy Test Suite Audit**: The worker updated 3 test files (`PartnerLiteDashboard.test.tsx`, `PartnerOfflineScanQueue.test.tsx`, `PartnerBillSubmitPage.test.tsx`), but missed `PartnerSettlementMoney.test.tsx` and `PartnerShellClient.edge-cases.test.tsx`.
- **Legacy URL Coverage**: `?panel=staff` URL redirect missing in `page.tsx`.

---

## Unverified Items
None. All verification commands (`check-types`, `build`, `vitest`) were executed directly.
