# Handoff Report

## 1. Observation
- Located the core backend service method `listPublicHomeRecommendations` in file `backend/src/nightlife-data/nightlife-data.service.ts` at line `20502` to `20675`.
- Verified database models in `backend/prisma/schema.prisma` at lines `1173` to `1201` for `RankingConfig`.
- Inspected the admin panel interface for ghimming/reordering recommendations in `frontend/apps/web/src/app/admin/content/page.tsx` at lines `287` to `450` and the UI template rendering at lines `1352` to `1458`.
- Ran backend unit tests using `npm run test -- src/nightlife-data/nightlife-data.service.spec.ts` in `backend` directory. The test output showed:
  ```
  Test Suites: 1 passed, 1 total
  Tests:       125 passed, 125 total
  Snapshots:   0 total
  Time:        18.969 s
  ```
- Ran frontend unit tests using `pnpm --filter web test -- __tests__/AdminRecommendHome.test.tsx` in `frontend` directory. The test output showed:
  ```
   ❯ __tests__/AdminRecommendHome.test.tsx (4 tests | 1 failed) 4954ms
       ✓ 1. Search operates across all stores in all cities (no city filtering)  2305ms
       ✓ 2. Pinned limit of 8 stores is correctly blocked on 9th store with a custom modal  1587ms
       × 3. Reordering via Up/Down buttons works correctly and updates rankings in backend 527ms
       ✓ 4. Deletion works and prompts with a custom confirmation modal  524ms
  
  AssertionError: expected "vi.fn()" to be called 2 times, but got 1 times
  ```
- Analyzed the source difference between commits `a2607ce` and `1043cd4`. `handleMoveRecommend` in `page.tsx` was modified to execute 3 sequential API updates to resolve key collisions instead of using a concurrent `Promise.all`:
  ```typescript
  // Step 1: Update swapItem to pinRank: null first
  await adminRankingsApi.update(swapItem.id, { ... pinRank: null });
  // Step 2: Update currentItem to swapRank
  await adminRankingsApi.update(currentItem.id, { ... pinRank: swapRank });
  // Step 3: Update swapItem to currentRank
  await adminRankingsApi.update(swapItem.id, { ... pinRank: currentRank });
  ```

## 2. Logic Chain
- **Step 1**: The backend code in `nightlife-data.service.ts` queries real database entries via Prisma, dynamically maps active stores configured with `recommend-home` scope, filters out deleted/inactive stores, and aggregates page views and bookings counts from audit logs.
- **Step 2**: The frontend code in `page.tsx` implements searching across all active stores, applies custom alerts/modals via `feedback.showModal` when pinning more than 8 stores or deleting a pinned store, and implements drag/reordering operations via API calls.
- **Step 3**: The observed backend tests pass successfully.
- **Step 4**: The frontend unit test failure is caused by an asynchronous testing race condition. Because `handleMoveRecommend` runs three sequential `await` steps, the synchronous test assertion `expect(mockUpdate).toHaveBeenCalledTimes(2)` evaluates after the first microtask (only 1 update has completed).
- **Step 5**: Since the code implementation contains genuine calculations, real query operations, proper error handling via custom feedback modals, and has no hardcoded bypasses or facade mechanisms, there are no integrity violations under the development mode rules.
- **Step 6**: The audit verdict is CLEAN.

## 3. Caveats
- The frontend test suite is currently failing due to the asynchronous execution of `handleMoveRecommend`. The test file must be updated to wait asynchronously (e.g. using `waitFor`) for all 3 backend update calls.
- Static code scanning was limited to files modified in recent commits relating to the `recommend-home` (Đề xuất tối nay) scope.

## 4. Conclusion
- **Verdict**: **CLEAN**
- The "Đề xuất tối nay" feature is authentically implemented with complete business logic on both the backend and frontend. There are no facade components, hardcoded test results, or circumvented constraints.

## 5. Verification Method
1. To run backend tests:
   ```bash
   cd backend
   npm run test -- src/nightlife-data/nightlife-data.service.spec.ts
   ```
2. To run frontend tests:
   ```bash
   cd frontend
   pnpm --filter web test -- __tests__/AdminRecommendHome.test.tsx
   ```
   (Note: Test 3 will fail due to the asynchronous sequential update logic implemented in `page.tsx`).
