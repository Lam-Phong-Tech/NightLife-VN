# Handoff Report - Challenger Frontend UI Verification for "Đề xuất tối nay"

## 1. Observation
- **Target UI File**: `frontend/apps/web/src/app/admin/content/page.tsx`
  - Reordering handler `handleMoveRecommend` (lines 400–442) uses 3 sequential updates:
    ```typescript
    await adminRankingsApi.update(swapItem.id, { ... pinRank: null });
    await adminRankingsApi.update(currentItem.id, { ... pinRank: swapRank });
    await adminRankingsApi.update(swapItem.id, { ... pinRank: currentRank });
    ```
  - Limit checker handles 8 maximum pinned stores (lines 340–348) and shows a custom `feedback.showModal`.
  - Search queries `/admin/stores` globally (line 310) using only query `q` and `limit: 10`.

- **Test Suite File**: `frontend/apps/web/__tests__/AdminRecommendHome.test.tsx`
  - Runs with `pnpm test __tests__/AdminRecommendHome.test.tsx` in `frontend/apps/web`.
  - Test 3 (`3. Reordering via Up/Down buttons works correctly and updates rankings in backend`) fails with:
    ```
    FAIL  __tests__/AdminRecommendHome.test.tsx > Admin Recommend Home content page UI verification > 3. Reordering via Up/Down buttons works correctly and updates rankings in backend
    AssertionError: expected "vi.fn()" to be called 2 times, but got 1 times
     ❯ __tests__/AdminRecommendHome.test.tsx:220:24
        220|     expect(mockUpdate).toHaveBeenCalledTimes(2);
    ```
  - Console outputs show standard React Testing Library `act(...)` update warnings and unhandled TypeErrors:
    ```
    Failed to fetch banner tags: TypeError: __vite_ssr_import_5__.categoriesApi.adminList is not a function
    Failed to fetch campaigns: TypeError: __vite_ssr_import_8__.campaignsApi.adminList is not a function
    ```
  - The stubs mock `categoriesApi.list` (instead of `adminList`) and `campaignsApi.list` (instead of `adminList`).

- **Frontend Compilation & Lint**:
  - `pnpm check-types` completes with no compilation/type issues.
  - `pnpm lint` highlights pre-existing lint issues on other components, but the target `page.tsx` itself contains 49 errors due to React effect hoisting guidelines (variables/methods declared lower down accessed before declaration inside `useEffect`).

---

## 2. Logic Chain
- **Limit of 8 Pinned Stores**:
  - Verified by observing line 340 `if (recommendItems.length >= 8)` returns early and fires `feedback.showModal` with title `"Giới hạn đề xuất"`.
  - Verified that Test 2 successfully triggers this warning and prevents addition of a 9th store.
- **Search Cross-City**:
  - Verified that the page queries `/admin/stores` without filtering by city/region code. Test 1 successfully returns both Hà Nội and Hồ Chí Minh stores.
- **Reordering Test Failure**:
  - The page component was updated in a previous worker iteration to execute three sequential `adminRankingsApi.update` calls (to avoid database unique constraints/collision errors).
  - The test suite triggers the up arrow click via `fireEvent.click` and synchronously asserts `expect(mockUpdate).toHaveBeenCalledTimes(2)`.
  - Because `handleMoveRecommend` is an `async` function, control is yielded back to the test runner at the first `await` (Step 1). The assertions are evaluated immediately, at which point `mockUpdate` has only been called once.
  - Furthermore, since the sequential logic uses three calls in total, expecting exactly 2 calls is incorrect. The test must be modified to use `await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(3))` to wait for all microtask ticks.
- **Console TypeErrors**:
  - The test stubs mock `list` methods for `categoriesApi` and `campaignsApi`. However, the real page component calls `categoriesApi.adminList` and `campaignsApi.adminList`. Since the mock stubs do not provide these `adminList` methods, they resolve to undefined and throw `TypeError` during test execution.

---

## 3. Caveats
- Checked type definitions and ESLint checks across the whole `web` application. Pre-existing warnings in other components (e.g., Support Chat, BookingDateTimeFields) were ignored as per the minimal change principle.
- Verification only occurred within mocked/stubbed environments using Vitest; we did not spin up the actual database/backend for this frontend test.

---

## 4. Conclusion
- The actual frontend logic for "Đề xuất tối nay" is correct, prevents exceeding the 8-store limit with a custom warning modal, performs cross-city store lookup, and implements database-safe sequential rank updates.
- However, the frontend test suite has regressions:
  - Test 3 (Reordering) fails due to synchronous assertions and an outdated call-count expectation (expects 2 calls instead of 3).
  - Outdated stubs for `categoriesApi` and `campaignsApi` cause TypeErrors on render.

---

## 5. Verification Method
1. Navigate to the frontend web workspace:
   ```bash
   cd frontend/apps/web
   ```
2. Execute the test command for the recommend feature:
   ```bash
   pnpm test __tests__/AdminRecommendHome.test.tsx
   ```
3. Observe that 3 out of 4 tests pass, and Test 3 fails with the assertion call count error. Check the console output for the `adminList` TypeErrors.
