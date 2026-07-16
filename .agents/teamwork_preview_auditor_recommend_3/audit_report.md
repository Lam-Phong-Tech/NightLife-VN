## Forensic Audit Report

**Work Product**: "Đề xuất tối nay" (Tonight's Recommendations) feature implementation and frontend test fixes in `frontend/apps/web/__tests__/AdminRecommendHome.test.tsx`
**Profile**: General Project (Integrity Mode: development)
**Verdict**: CLEAN

### Phase Results
- **Hardcoded output detection**: PASS — No hardcoded test results, expected outputs, or bypass values exist in the codebase. Both backend (`nightlife-data.service.ts`) and frontend (`page.tsx`) perform live calculations and dynamic operations.
- **Facade detection**: PASS — Fully functional production code exists. Backend performs Prisma database lookups, dynamic view/booking aggregation, fallback resolution, and reordering constraint checks. Frontend uses proper hooks, event handlers, and API client routes.
- **Pre-populated artifact detection**: PASS — Checked the repository for pre-populated logs or test results. Only historical log artifacts exist under `backend/docs/`.
- **Self-certifying tests check**: PASS — Test assertions verify mocks against dynamic parameters (e.g., matching the specific `pinRank` sequence of `null`, `1`, `2`) rather than hardcoded results.
- **Execution delegation check**: PASS — Implementation is completely written from scratch using Next.js/NestJS/Prisma patterns and does not outsource core functionality to pre-built third-party recommendation packages.
- **Project-scoped rules check**: PASS — The UI uses custom themed modals/toast alerts via `feedback.showModal` / `feedback.showToast` (no native `alert`/`confirm` calls). No native `<select>` or native DatePicker elements are utilized.

### Evidence

#### 1. Frontend Test Run Output (`vitest`)
Running the test suite `AdminRecommendHome.test.tsx` inside the frontend directory `frontend/apps/web` completes successfully:
```
> web@0.0.0 test D:\laragon\www\NightLife-VN\frontend\apps\web
> vitest run "__tests__/AdminRecommendHome.test.tsx"

 RUN  v4.1.9 D:/laragon/www/NightLife-VN/frontend/apps/web

 ✓ __tests__/AdminRecommendHome.test.tsx (4 tests) 6577ms
     ✓ 1. Search operates across all stores in all cities (no city filtering)  3012ms
     ✓ 2. Pinned limit of 8 stores is correctly blocked on 9th store with a custom modal  1700ms
     ✓ 3. Reordering via Up/Down buttons works correctly and updates rankings in backend  1056ms
     ✓ 4. Deletion works and prompts with a custom confirmation modal  797ms

 Test Files  1 passed (1)
      Tests  4 passed (4)
   Start at  14:17:21
   Duration  38.02s
```

#### 2. Backend Test Run Output (`jest`)
Running the tests inside `backend` directory completes successfully:
- `nightlife-data.service.spec.ts` (125 tests passed):
  ```
  listPublicHomeRecommendations
    √ returns pinned stores sorted by pinRank, manualScore, and updatedAt (5 ms)
    √ falls back to personalized logic if no pinned stores are configured (6 ms)
    √ excludes inactive or deleted pinned stores from recommendation results (6 ms)
    √ falls back to personalized logic if all pinned stores are inactive or deleted (15 ms)
    √ verifies city filtering works as expected when cityCode is specified (2 ms)
    √ queries default cityCode as all when query.cityCode is not specified or is all (22 ms)
  ```
- `recommendations.spec.ts` (7 tests passed):
  ```
  NightlifeDataService - Tonight Recommendations (Đề xuất tối nay)
    Edge Case: Empty Configuration (Fallback to Personalization)
      √ should fallback to personalized recommendations when no ranking configurations are active (25 ms)
      √ should fallback to personalization when ranking configurations return targetIds, but stores are not found or inactive (4 ms)
    Edge Case: Active vs Inactive/Deleted Stores filtering
      √ should only return active, non-deleted pinned stores (5 ms)
    Validation & Maximum Limits
      √ should return exactly 8 stores when limit 8 is requested and enough stores exist (5 ms)
      √ should cap the recommendations limit at 16 even if a higher limit (e.g. 24) is passed (3 ms)
      √ should fallback to default limit of 8 when limit is undefined or invalid (6 ms)
    Personalization Scoring Algorithm & Ordering
      √ should apply personalized score boosts correctly and sort stores by score in descending order (10 ms)
  ```

#### 3. Core Database Constraint Mechanics
The backend checks for uniqueness using `assertNoPinnedRankingCollision`:
```typescript
  private async assertNoPinnedRankingCollision(input: {
    targetType: RankingTargetType;
    cityCode: string;
    category: StoreCategory | null;
    scope: string;
    pinRank: number | null;
    excludeId?: string;
  }) {
    if (input.pinRank === null || input.pinRank === undefined) {
      return;
    }

    const collision = await this.prisma.rankingConfig.findFirst({
      where: {
        targetType: input.targetType,
        cityCode: input.cityCode,
        category: input.category,
        scope: input.scope,
        pinRank: input.pinRank,
        status: 'ACTIVE',
        deletedAt: null,
        ...(input.excludeId ? { NOT: { id: input.excludeId } } : {}),
      },
    });

    if (collision) {
      throw new BadRequestException(
        `Ranking collision: Rank ${input.pinRank} is already pinned...`,
      );
    }
  }
```
In the frontend `handleMoveRecommend` (in `page.tsx`), the ranking swap is executed in three sequential steps to bypass database collisions during intermediate states:
1. Set the swap target's `pinRank` to `null`.
2. Update the current target's `pinRank` to the swap target's target rank.
3. Update the swap target's `pinRank` to the current target's old rank.
The test assertions correctly wait (`waitFor`) for all 3 operations to execute and check that the mock was updated 3 times.

### Adversarial Review

- **Assumption tested**: Does reordering block or crash when there is a collision?
  - Yes, a simultaneous concurrent update could have crashed due to `assertNoPinnedRankingCollision`. The sequential execution with step-by-step nullification of the swap target prevents this collision mode perfectly.
- **Edge cases checked**:
  - Fallback logic works correctly when `RankingConfig` is empty or target stores are deleted/inactive.
  - Sorting respects priority order: `pinRank` ascending, then `manualScore` descending, then `updatedAt` descending.
  - Input limits are capped at `16` at backend level, and user interface prevents pinning more than `8` stores.
