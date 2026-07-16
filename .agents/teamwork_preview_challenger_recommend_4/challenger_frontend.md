# Frontend UI Verification Report - "Đề xuất tối nay"

## 1. Executive Summary

- **Overall Status**: **FAILED** (with specific mock and timing bugs in the test suite, while the page component logic handles edge cases and sequential updates correctly).
- **Core Findings**:
  1. **Limit of 8 Pinned Stores**: Successfully enforced. If a user attempts to add a 9th store, a warning modal with title `"Giới hạn đề xuất"` is displayed, preventing the API call.
  2. **Search Functionality**: Successfully queries `/admin/stores` globally across all cities without region filters, allowing cross-city lookups.
  3. **Reordering**: Up/Down ranking updates are sequentially handled to avoid database constraint violations (`pinRank` is cleared to `null` first for the swapped item, then `currentItem` is updated, then `swapItem` is updated).
  4. **Test Suite Regressions**:
     - The reordering test fails with `AssertionError: expected "vi.fn()" to be called 2 times, but got 1 times`. This occurs because the mock assertions are synchronous and do not await the new sequential update sequence, and also because the new sequential sequence makes 3 calls to `mockUpdate` instead of the old 2 calls.
     - Console error logs show `TypeError: categoriesApi.adminList is not a function` and `TypeError: campaignsApi.adminList is not a function` during test rendering. This is caused by incomplete/outdated mock declarations in `AdminRecommendHome.test.tsx`.
     - React `act(...)` warning console logs are printed for state updates in tests.

---

## 2. Detailed Verification Results

### A. Pinned Stores Limit of 8 (Boundary Test)
- **Code Inspected**: `frontend/apps/web/src/app/admin/content/page.tsx` (lines 340–348):
  ```typescript
  if (recommendItems.length >= 8) {
    feedback.showModal({
      title: 'Giới hạn đề xuất',
      description: 'Mục "Đề xuất tối nay" chỉ hiển thị tối đa 8 quán trên trang chủ. Vui lòng gỡ bớt quán khác trước khi thêm quán này.',
      tone: 'warning',
      primaryLabel: 'Đã hiểu'
    });
    return;
  }
  ```
- **Behavior**: Clicking `+ Ghim đề xuất` when 8 stores are already pinned immediately returns early. It blocks `adminRankingsApi.create` from firing and renders the system feedback modal correctly.
- **Test Coverage**: Test 2 (`2. Pinned limit of 8 stores is correctly blocked on 9th store with a custom modal`) executes and passes successfully.

### B. Search Functionality (Cross-City Querying)
- **Code Inspected**: `frontend/apps/web/src/app/admin/content/page.tsx` (lines 310–325):
  ```typescript
  const res = await apiClient<{ data: SearchStoreItem[] }>('/admin/stores', { params: { search: q, limit: 10 } });
  ```
- **Behavior**: Only `search` and `limit` params are supplied, with no city filtering. The backend Prisma query inside `listAdminStores` likewise allows matching any city.
- **Test Coverage**: Test 1 (`1. Search operates across all stores in all cities (no city filtering)`) executes and passes successfully, rendering results from both Hà Nội and Hồ Chí Minh.

### C. Reordering (Up/Down Swapping)
- **Code Inspected**: `frontend/apps/web/src/app/admin/content/page.tsx` (lines 400–442):
  ```typescript
  // Step 1: Update swapItem to pinRank: null first
  await adminRankingsApi.update(swapItem.id, { ...pinRank: null });
  // Step 2: Update currentItem to swapRank
  await adminRankingsApi.update(currentItem.id, { ...pinRank: swapRank });
  // Step 3: Update swapItem to currentRank
  await adminRankingsApi.update(swapItem.id, { ...pinRank: currentRank });
  ```
- **Behavior**: Sequential calls ensure that the database's unique ranking constraints are not violated during swaps.
- **Test Coverage**: Test 3 (`3. Reordering via Up/Down buttons works correctly and updates rankings in backend`) **FAILS**.

---

## 3. Test Failures & Console Errors

### A. Reordering Test Failure
- **Error Snippet**:
  ```
  FAIL  __tests__/AdminRecommendHome.test.tsx > Admin Recommend Home content page UI verification > 3. Reordering via Up/Down buttons works correctly and updates rankings in backend
  AssertionError: expected "vi.fn()" to be called 2 times, but got 1 times
   ❯ __tests__/AdminRecommendHome.test.tsx:220:24
  ```
- **Root Cause**:
  1. **Timing (Race Condition)**: The test triggers `fireEvent.click(upButtons[1]!)` and synchronously asserts `expect(mockUpdate).toHaveBeenCalledTimes(2)`. However, `handleMoveRecommend` is an `async` function. Once it hits the first `await` (Step 1), it yields control, and the test assertions run before the next updates are fired.
  2. **Assertion Value Mismatch**: Under the new sequential update strategy, `mockUpdate` is called **3 times** instead of 2 times. The test assertions are outdated and need to be wrapped inside `await waitFor(...)` to check for 3 calls:
     ```typescript
     await waitFor(() => {
       expect(mockUpdate).toHaveBeenCalledTimes(3);
     });
     ```

### B. Incomplete Mock TypeErrors (Console Errors during Test Run)
- **Error Snippets**:
  ```
  Failed to fetch banner tags: TypeError: __vite_ssr_import_5__.categoriesApi.adminList is not a function
      at fetchBannerTags (D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/admin/content/page.tsx:619:40)
  ```
  ```
  Failed to fetch campaigns: TypeError: __vite_ssr_import_8__.campaignsApi.adminList is not a function
      at fetchCampaigns (D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/admin/content/page.tsx:544:39)
  ```
- **Root Cause**:
  The component triggers `fetchBannerTags` and `fetchCampaigns` inside `useEffect`. In `AdminRecommendHome.test.tsx`, these APIs are mocked as:
  ```typescript
  vi.mock("@/lib/api/categories", () => ({
    categoriesApi: {
      list: vi.fn().mockResolvedValue([]),
      listBannerTags: vi.fn().mockResolvedValue([]),
    },
  }));
  vi.mock("@/lib/api/campaigns", () => ({
    campaignsApi: {
      list: vi.fn().mockResolvedValue([]),
    },
  }));
  ```
  Since the real implementation in `src/lib/api/categories.ts` and `src/lib/api/campaigns.ts` exposes `adminList` instead of `list`, the test fails to stub the correct methods.

---

## 4. Recommendations & Mitigations
1. **Fix Test Mocks**: Update the mock stubs in `__tests__/AdminRecommendHome.test.tsx` to align with the actual method signatures (`adminList`).
2. **Make Test Assertions Async**: Wrap the reordering assertions in `await waitFor(...)` and verify that `mockUpdate` is called 3 times (the first with `null`, and the other two with the correct swapped ranks).
