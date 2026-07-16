# Backend Review Report: "Đề xuất tối nay" (Recommend Home)

## Quality Review Summary

**Verdict**: APPROVE

All backend requirements are correctly implemented, clean, and robust. All 125 tests in the NestJS nightlife-data service test suite passed successfully.

---

## Findings

### [Minor] Inconsistent Max Limit Capping between DTO and Service

- **What**: The maximum limit query parameter in `PublicHomeContentQueryDto` allows up to `24`, but the service logic caps it at `16`.
- **Where**: 
  - `backend/src/nightlife-data/dto/admin-video.dto.ts` (Line 67-68)
  - `backend/src/nightlife-data/nightlife-data.service.ts` (Line 20504)
- **Why**: While not a critical bug, it creates an inconsistency. If a client queries the endpoint with `limit=20` (which is valid according to the DTO validation constraints), the service will silently cap it and return only up to 16 items.
- **Suggestion**: Align the maximum value in both files (e.g., raise service limit cap to 24, or reduce DTO validation `@Max()` to 16).

---

## Verified Claims

- **Validation changes allow up to 8 ranking items** → Verified via viewing code in `admin-ranking.dto.ts` lines 83 and 144, confirming `pinRank` validation is updated to `@Max(8)` with custom message → **PASS**
- **Ranking configurations sorted by pinRank, manualScore, and updatedAt** → Verified via viewing sorting logic in `nightlife-data.service.ts` lines 20590-20606 and unit test verification → **PASS**
- **Recommendation fallback logic applies personalization weights correctly** → Verified via viewing the dynamic scoring calculations (categories, area, coupons, views, bookings) in `nightlife-data.service.ts` lines 20788-20853 and running Jest tests → **PASS**
- **All backend service tests pass** → Verified via executing `pnpm test src/nightlife-data/nightlife-data.service.spec.ts` successfully → **PASS** (125/125 tests passed)

---

## Coverage Gaps

- **Controller/E2E API integration testing** — risk level: **LOW** — recommendation: **Accept risk** since the core business logic, query mappings, database filters, and fallbacks are heavily covered by the 125 unit/integration tests with Prisma mocking.

---

## Unverified Items

- None.

---

## Adversarial Review

### Overall Risk Assessment: LOW

### Challenges

#### [Low] Challenge 1: Lack of Backfilling for Pinned Recommendations

- **Assumption challenged**: The system assumes that when pinned stores are present, it is acceptable to return fewer items than the requested `limit` without backfilling from the personalized recommendation engine.
- **Attack scenario**: Admin pins 2 stores for `recommend-home`. A layout on the home screen requests `limit=8` and expects exactly 8 items. The API returns only 2 items, potentially causing layout gaps on the frontend.
- **Blast radius**: Frontend UI layout rendering issues if variable response sizes are not expected.
- **Mitigation**: Accept this design behavior as intentional (letting admins have strict curation control), or enhance the service logic to backfill organic personalized items if the pinned item count is lower than `limit`.

---

## Stress Test Results

- **Sort stability with missing config keys** → Pinned stores sorting handles missing/undefined configurations safely via nullish coalescing to `Number.POSITIVE_INFINITY` for `pinRank` and `0` for manual scores → **PASS**
- **Fallback logic handling under no-data scenarios** → Verified that if no views or bookings exist, default scores (100 - index) and fallback reasons are correctly returned → **PASS**
