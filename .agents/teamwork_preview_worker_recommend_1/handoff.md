# Handoff Report — Đề xuất tối nay Manual Configuration

## 1. Observation
- Modified `backend/src/nightlife-data/dto/admin-ranking.dto.ts` to relax `@Max(5)` constraint to `@Max(8)`:
  ```typescript
  @Max(8, { message: 'Ranking P0 chỉ hỗ trợ Top 1-8' })
  ```
- Modified `backend/src/nightlife-data/nightlife-data.service.ts` to implement fallback list logic for `recommend-home` scope in `listPublicHomeRecommendations`:
  - Retrieves active manual configurations under `recommend-home` sorted by `pinRank`.
  - Backfills from active stores in Hanoi/HCM if fewer than 8 manual configurations exist.
  - Dedupes dynamically so that manually configured stores are not duplicated in the final list.
  - Restricts total results to exactly 8.
- Added comprehensive unit tests in `backend/src/nightlife-data/nightlife-data.service.spec.ts` testing:
  - Return of only manual configurations when exactly 8 exist.
  - Backfilling with active Hanoi/HCM stores when fewer than 8 manual configurations exist.
  - Complete backend test suite completed successfully:
    ```
    PASS src/nightlife-data/nightlife-data.service.spec.ts (5.408 s)
    Test Suites: 14 passed, 14 total
    Tests:       218 passed, 218 total
    ```
- Modified `frontend/apps/web/src/app/admin/content/page.tsx` to add "Đề xuất tối nay" manual configuration UI matching the layout, search flow, and sorting actions of "Địa điểm nổi bật".
- Ran frontend typecheck:
    ```
    > web@0.0.0 check-types
    > tsc --noEmit
    Command completed successfully.
    ```
- Pushed changes successfully to remote:
  ```
  To https://github.com/Lam-Phong-Tech/NightLife-VN.git
     224c47a..a2607ce  main -> main
  ```

## 2. Logic Chain
- Moving from automatic recommendation logic to a hybrid/manual control flow requires first relaxing the validation constraints in `CreateAdminRankingConfigDto` and `UpdateAdminRankingConfigDto` to allow up to 8 positions (P1-P8).
- The `listPublicHomeRecommendations` endpoint queries these configurations. If manual configurations exist under `recommend-home` scope, we fetch them first, sort them by `pinRank`, and retrieve their corresponding active store details.
- To ensure the homepage always displays exactly 8 recommendations, we dynamically backfill from the active store pool in Hanoi and HCM, excluding already selected stores to prevent duplicates.
- The React admin panel needs to provide visual management (Search, Add, Sort Up/Down, Remove) for this `recommend-home` scope, which maps directly to the backend service.

## 3. Caveats
- Store searching in the recommend tab query all active stores via `/admin/stores` bypassing city-specific filters if none is set. This matches the target user requirement of letting admins pick any active store regardless of city.

## 4. Conclusion
The "Đề xuất tối nay" manual configuration feature is fully implemented, verified via backend unit tests, frontend type checking, and linter check, and pushed to the repository.

## 5. Verification Method
- **Run Backend Tests**: `npm run test` inside `backend/` directory to run all NestJS unit tests.
- **Run Frontend Type Check**: `npm run check-types` inside `frontend/apps/web/` to run typescript compiler checks.
