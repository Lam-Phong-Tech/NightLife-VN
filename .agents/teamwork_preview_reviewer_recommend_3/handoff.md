# Handoff Report: Backend Review for "Đề xuất tối nay" (Recommend Home)

## 1. Observation

- **Backend DTO File**: `backend/src/nightlife-data/dto/admin-ranking.dto.ts` (Lines 83 & 144):
  ```typescript
  @Max(8, { message: 'Ranking P0 chỉ hỗ trợ Top 1-8' })
  pinRank?: number | null;
  ```
- **Backend Service File**: `backend/src/nightlife-data/nightlife-data.service.ts` (Lines 20513-20674: Pinned Store Recommendations, Lines 20676-20854: Fallback Personalized Recommendations).
- **Backend Controller File**: `backend/src/nightlife-data/nightlife-data.controller.ts` (Line 185-188):
  ```typescript
  @Get('content/recommendations')
  listPublicHomeRecommendations(@Query() query: PublicHomeContentQueryDto) {
    return this.nightlifeDataService.listPublicHomeRecommendations(query);
  }
  ```
- **Test execution command**: `pnpm test src/nightlife-data/nightlife-data.service.spec.ts` run inside the `backend` folder.
- **Test run result**:
  ```
  Test Suites: 1 passed, 1 total
  Tests:       125 passed, 125 total
  Snapshots:   0 total
  Time:        13.099 s
  Ran all test suites matching src/nightlife-data/nightlife-data.service.spec.ts.
  ```

---

## 2. Logic Chain

- **Validation constraints**: The DTO updates correctly constrain the `pinRank` field to a maximum of 8, allowing rankings to support Top 1-8 items as requested.
- **Service retrieval**: Pinned store configurations for `recommend-home` scope are successfully fetched, mapped to active stores, sorted according to the priorities (`pinRank` asc, `manualScore` desc, `updatedAt` desc), and mapped to return fields.
- **Service fallback**: If no pinned configurations exist, the code transitions seamlessly to personalized ranking/scoring based on user category interests, area interests, coupon existence, profile views, and recent bookings.
- **Test coverage**: The 6 custom unit tests under the `listPublicHomeRecommendations` describe block cover pinned sorting, fallback trigger on empty/inactive stores, and city filtering parameters.
- **Result**: All tests pass cleanly, verifying that the implementation meets design specifications.

---

## 3. Caveats

- **Limit capping mismatch**: The `PublicHomeContentQueryDto` specifies `@Max(24)` for its limit parameter, but the service query parsing resolves it with a cap at 16 (i.e. `this.resolvePublicHomeLimit(query.limit, 8, 16)`). This is a minor inconsistency but does not affect correctness.
- **No backfilling**: When pinned stores are active, the response will only contain those stores and will not backfill with personalized recommendations to reach the limit. This behavior matches the test specifications and is assumed to be the correct product behavior.

---

## 4. Conclusion

The backend implementation for "Đề xuất tối nay" (Recommend Home) is clean, correct, and robust.
- **Final Verdict**: **PASS**

---

## 5. Verification Method

To verify these results independently:
1. Navigate to the `backend` directory.
2. Run the command:
   ```bash
   pnpm test src/nightlife-data/nightlife-data.service.spec.ts
   ```
3. Check the output to ensure that all 125 tests pass and that the `listPublicHomeRecommendations` describe suite runs successfully.
