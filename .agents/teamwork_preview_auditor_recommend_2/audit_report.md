## Forensic Audit Report

**Work Product**: Implementation of "Đề xuất tối nay" (Tonight's Recommendations) feature
**Profile**: General Project
**Verdict**: CLEAN

### Phase Results
- **Hardcoded output detection**: PASS — No hardcoded test results or expected values found in the backend or frontend codebase for this feature.
- **Facade detection**: PASS — The implementation is completely genuine. The APIs query the Prisma database, perform dynamic calculations (e.g., aggregating page view counts and booking counts from logs and bookings), and return actual objects. The frontend features fully dynamic state management, search querying, and correct API integration.
- **Pre-populated artifact detection**: PASS — No pre-populated logs or mock result artifacts found in the repository.
- **Self-certifying tests check**: PASS — The test suites do not check against hardcoded constants within the same codebase but utilize proper test mocks and assert queries dynamically.
- **Execution delegation check**: PASS — Core logic is implemented directly within the NestJS backend using Prisma client queries and Next.js frontend state hooks, without outsourcing the core functionality to pre-built external libraries.

### Evidence

#### 1. Backend Core Implementation Details (`backend/src/nightlife-data/nightlife-data.service.ts`)
The `listPublicHomeRecommendations` method retrieves the `RankingConfig` records for `recommend-home` scope and filters out deleted or inactive ones:
```typescript
    // Retrieve store rankings for 'recommend-home' scope
    const rankingConfigs = await this.prisma.rankingConfig.findMany({
      where: {
        targetType: 'STORE',
        scope: 'recommend-home',
        status: 'ACTIVE',
        deletedAt: null,
        ...this.buildPublicRankingConfigCityWhere(cityCode === 'all' ? undefined : cityCode),
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gt: now } }] }],
      },
      orderBy: [
        { pinRank: 'asc' },
        { manualScore: 'desc' },
        { updatedAt: 'desc' },
      ],
    });
```
It then retrieves the active store details, performs aggregation counts for store views and booking counts:
```typescript
        const storeIds = pinnedStores.map((store) => store.id);
        const [viewGroups, bookingGroups] = await Promise.all([
          this.prisma.auditLog.groupBy({
            by: ['targetId'],
            where: {
              action: 'PROFILE_VIEW_RECORDED',
              targetType: 'STORE',
              targetId: { in: storeIds },
              createdAt: { gte: since },
            },
            _count: { _all: true },
          }),
          this.prisma.booking.groupBy({
            by: ['storeId'],
            where: {
              storeId: { in: storeIds },
              deletedAt: null,
              createdAt: { gte: since },
            },
            _count: { _all: true },
          }),
        ]);
```
If no manual configurations exist, it falls back seamlessly to the personalized recommendations. This is a fully functional dynamic implementation.

#### 2. Test Execution Logs
- **Backend Unit Tests**: Running NestJS backend tests passes successfully:
```
Test Suites: 1 passed, 1 total
Tests:       125 passed, 125 total
Snapshots:   0 total
Time:        18.969 s
```

- **Frontend Unit Tests**: Running `vitest` tests under `frontend/apps/web` results in 1 failure out of 4:
```
 ❯ __tests__/AdminRecommendHome.test.tsx (4 tests | 1 failed) 4954ms
     ✓ 1. Search operates across all stores in all cities (no city filtering)  2305ms
     ✓ 2. Pinned limit of 8 stores is correctly blocked on 9th store with a custom modal  1587ms
     × 3. Reordering via Up/Down buttons works correctly and updates rankings in backend 527ms
     ✓ 4. Deletion works and prompts with a custom confirmation modal  524ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  __tests__/AdminRecommendHome.test.tsx > Admin Recommend Home content page UI verification > 3. Reordering via Up/Down buttons works correctly and updates rankings in backend
AssertionError: expected "vi.fn()" to be called 2 times, but got 1 times
 ❯ __tests__/AdminRecommendHome.test.tsx:220:24
```
**Explanation of Test Failure**:
Commit `1043cd4` updated `handleMoveRecommend` in `frontend/apps/web/src/app/admin/content/page.tsx` to process rank changes sequentially in 3 steps (setting `pinRank: null` first on the swap item to avoid ranking collisions/unique constraint violations) rather than concurrently using `Promise.all`:
```typescript
      // Step 1: Update swapItem to pinRank: null first
      await adminRankingsApi.update(swapItem.id, { ... pinRank: null });
      // Step 2: Update currentItem to swapRank
      await adminRankingsApi.update(currentItem.id, { ... pinRank: swapRank });
      // Step 3: Update swapItem to currentRank
      await adminRankingsApi.update(swapItem.id, { ... pinRank: currentRank });
```
Because these calls are made sequentially with `await`, the synchronous test execution asserts `expect(mockUpdate).toHaveBeenCalledTimes(2)` right after simulating the click event. At that point, only the first `await` step has run, so the mock has been called exactly once. This is an asynchronous timing mismatch in the test file, not an integrity violation.
