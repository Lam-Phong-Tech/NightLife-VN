# Backend Verification Report - Tonight's Recommendations (Đề xuất tối nay)

This report details the empirical verification of correctness, edge case handling, and performance of the backend query implementation for the "Đề xuất tối nay" feature.

---

## 1. Verified Core Service Method
- **Method**: `listPublicHomeRecommendations` in `NightlifeDataService`
- **Location**: `backend/src/nightlife-data/nightlife-data.service.ts` (lines 20502-20854)
- **Controller Endpoint**: `GET /api/nightlife-data/content/recommendations` in `NightlifeDataController`

---

## 2. Empirical Correctness & Edge Case Verification

We wrote and executed a dedicated unit/stress test suite (`backend/src/nightlife-data/recommendations.spec.ts`) targeting the edge cases and constraints:

### A. Empty Configuration / Pinned Config Failure
- **Behavior**: When there are no active configurations in the `RankingConfig` table (or all configurations point to inactive/deleted stores), the service successfully falls back to the personalized recommendation logic.
- **Empirical Proof**: Verified in test case `"should fallback to personalized recommendations when no ranking configurations are active"` and `"should fallback to personalization when ranking configurations return targetIds, but stores are not found or inactive"`. Both pass successfully.

### B. Active vs Inactive/Deleted Stores Filtering
- **Behavior**:
  - For **pinned recommendations**: The service filters the configuration target IDs against the `Store` table with `status: 'ACTIVE'` and `deletedAt: null`. Inactive or deleted stores configured in `RankingConfig` are correctly omitted.
  - For **personalized recommendations**: The fallback query builds a store query using `buildPublicStoreWhere` which explicitly filters `status: 'ACTIVE'` and `deletedAt: null`.
- **Empirical Proof**: Verified in test case `"should only return active, non-deleted pinned stores"`. The test validates that the backend query explicitly filters out deleted/inactive records at the database query level.

### C. Maximum Limits & Validation
- **Behavior**:
  - The API DTO `PublicHomeContentQueryDto` enforces query validation limits: `@Min(1)`, `@Max(24)` with `@IsInt()`.
  - The backend service method resolves the query limit via `resolvePublicHomeLimit(query.limit, 8, 16)`.
  - This results in a hard limit cap: requested limits above `16` (e.g. `24` which is allowed by the DTO validation) are capped to `16` at the service level. Requested limits that are undefined, negative, or invalid default to `8`.
- **Empirical Proof**: Verified in test cases under `"Validation & Maximum Limits"`. Setting exactly 8 stores works perfectly. Requesting 24 returns exactly 16 stores (capped).

### D. Personalization Scoring Algorithm
- **Behavior**: The fallback personalization assigns scores using:
  - Base score: `100 - index` (favoring newer stores from the raw database query).
  - Category match boost: `+36` if the store category matches user's preferred categories/views.
  - Area match boost: `+24` if the store is in user's preferred areas.
  - Active coupon boost: `+18` if the store has active coupons.
  - View signal boost: `+Math.min(viewCount, 20)`.
  - Booking signal boost: `+Math.min(bookingCount * 2, 24)`.
- **Empirical Proof**: Verified in test case `"should apply personalized score boosts correctly and sort stores by score in descending order"`. The test validates the score math and confirms stores are sorted correctly.

---

## 3. Query Efficiency & Performance Under Load

The recommendations feature executes 4 database queries:
1. `RankingConfig.findMany` (Pinned configurations query)
2. `Store.findMany` (Resolve store profiles + media + active coupons)
3. `AuditLog.groupBy` (View count aggregator for the past 30 days)
4. `Booking.groupBy` (Booking count aggregator for the past 30 days)

### Query Analysis & Index Efficiency:

| Query | Table | Filters | Index Status | Performance Assessment |
| --- | --- | --- | --- | --- |
| **Pinned configs** | `RankingConfig` | `targetType`, `cityCode`, `scope`, `status`, `deletedAt` | Partially Indexed: `@@index([targetType, cityCode, category, scope, pinRank])` | **Good**. Since `category` is missing from the query where clause, the index is scanned up to `cityCode`. Because configuration tables are tiny (typically <1000 items), this has negligible overhead. |
| **Store Details** | `Store` | `id: { in: targetStoreIds }`, `deletedAt: null`, `status: 'ACTIVE'` | **Optimal**. Primary key lookup on `id` (Clustered Index). O(1) query per store. |
| **View Count** | `AuditLog` | `action`, `targetType`, `targetId: { in: storeIds }`, `createdAt: { gte: since }` | Partially Indexed: `@@index([targetType, targetId])`, `@@index([action])` | **Risky under load**. If `audit_logs` has millions of records, filtering on `action` and `createdAt` without a compound index on all query filters will scan many index leaf pages. |
| **Booking Count** | `Booking` | `storeId: { in: storeIds }`, `deletedAt: null`, `createdAt: { gte: since }` | Partially Indexed: `@@index([storeId])` | **Moderate**. Fast lookup via `storeId` index, but filters on `deletedAt` and `createdAt` are executed in-memory/post-index search. |

### Recommendations for Optimization under Simulated Load:

1. **Optimize AuditLog Query**:
   Create a compound index on `AuditLog` to cover the aggregation query completely:
   ```prisma
   @@index([targetType, action, targetId, createdAt])
   ```
   This will allow PostgreSQL to perform an Index-Only Scan for the view group counts.

2. **Optimize Booking Query**:
   Create a compound index on `Booking` to optimize booking count retrieval:
   ```prisma
   @@index([storeId, deletedAt, createdAt])
   ```

3. **Caching Strategy**:
   The "Đề xuất tối nay" public recommendations (especially the pinned results) are identical for all users visiting the homepage within the same city. Aggregating views and bookings on every homepage request will quickly exhaust database resources under high traffic.
   *Recommendation*: Implement Redis or memory caching (e.g. 5 to 10 minutes cache TTL) for `listPublicHomeRecommendations` output, keyed by `cityCode` and `limit`.
