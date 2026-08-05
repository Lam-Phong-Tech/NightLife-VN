# Verification & Challenge Report — M2 Iteration 2 (Timezone & Auth)

## Challenge Summary

**Overall risk assessment**: LOW

All testing scenarios for Milestone 2 Iteration 2 (Vietnam Timezone Date Boundaries, RoleGuard & StoreScope authorization controls, backend unit test suite execution, and frontend typecheck) have been empirically verified and passed without issues.

---

## Testing Scenarios & Results

### 1. Vietnam Timezone Date Boundaries
- **Requirement**: Assert that events occurring at 01:00 AM VN time (`UTC+7`) on a target date are correctly included when querying that date.
- **Implementation Checked**: `parseVietnamDateBoundary` in `backend/src/nightlife-data/nightlife-data.service.ts`:
  - `startDate` (e.g. `'2026-08-05'`) -> `2026-08-05T00:00:00.000+07:00` (`2026-08-04T17:00:00.000Z`)
  - `endDate` (e.g. `'2026-08-05'`) -> `2026-08-05T23:59:59.999+07:00` (`2026-08-05T16:59:59.999Z`)
  - An event occurring at `01:00 AM VN time` on `2026-08-05` translates to `2026-08-04T18:00:00.000Z`.
  - Condition `2026-08-04T17:00:00.000Z <= 2026-08-04T18:00:00.000Z <= 2026-08-05T16:59:59.999Z` evaluates to `true`.
- **Empirical Execution**: Executed `verify_tz.js` test harness confirming `01:00 AM VN time` event inclusion (`Included: true`), `23:59 PM VN time` inclusion (`Included: true`), and `00:01 AM VN time` next day exclusion (`Included: false`). Unit test `normalizes YYYY-MM-DD date range inputs to Asia/Ho_Chi_Minh (+07:00) day boundaries` passed.
- **Status**: PASSED

### 2. RoleGuard & StoreScope Authorization Controls
- **Requirement**: Re-verify that Staff users receive `403 Forbidden` on partner activity endpoints.
- **Implementation Checked**: `backend/src/nightlife-data/nightlife-data.controller.ts`:
  - `@Get('partner/home')`: Decorated with `@Roles('PARTNER', 'ADMIN')` and `@UseGuards(JwtAuthGuard, RolesGuard)`.
  - `@Get('partner/activity')`: Decorated with `@Roles('PARTNER', 'ADMIN')` and `@UseGuards(JwtAuthGuard, RolesGuard)`.
  - `@Get('partner/activity/:activityId')`: Decorated with `@Roles('PARTNER', 'ADMIN')` and `@UseGuards(JwtAuthGuard, RolesGuard)`.
  - `STAFF` users are excluded from allowed roles and are rejected at the guard level with HTTP 403 `ForbiddenException`.
  - Store scope protection via `accessService.ensureStoreAccess(user, storeId)` throws `ForbiddenException` when attempting to access unauthorized store IDs. Unit test `throws ForbiddenException if activity store is outside accessible scope` passed.
- **Status**: PASSED

### 3. Backend Unit Tests Execution
- **Command**: `cd backend && npm test -- nightlife-data.service.spec.ts`
- **Result**: 
  - Test Suites: 1 passed, 1 total
  - Tests: 187 passed, 187 total
  - Time: 55.495 s
- **Status**: PASSED

### 4. Frontend Typecheck Execution
- **Command**: `cd frontend/apps/web && pnpm check-types`
- **Result**: `tsc --noEmit` completed with 0 errors (exit code 0).
- **Status**: PASSED

---

## Stress Test Results Matrix

| Scenario | Expected Behavior | Actual Behavior | Result |
|---|---|---|---|
| 01:00 AM VN event on target date | Included in date filter (`gte: 00:00:00+07:00`, `lte: 23:59:59.999+07:00`) | Included (`2026-08-04T18:00:00.000Z` falls within bounds) | PASS |
| Staff user accessing `/partner/activity` | Blocked by RolesGuard (`PARTNER`, `ADMIN` required) | HTTP 403 ForbiddenException | PASS |
| Staff user accessing `/partner/home` | Blocked by RolesGuard (`PARTNER`, `ADMIN` required) | HTTP 403 ForbiddenException | PASS |
| Partner user accessing unauthorized `storeId` | Blocked by `ensureStoreAccess` | HTTP 403 ForbiddenException | PASS |
| Backend unit tests execution | 100% test pass rate on `nightlife-data.service.spec.ts` | 187/187 tests passed | PASS |
| Frontend typecheck execution | Clean typecheck without TypeScript compiler errors | `tsc --noEmit` exited 0 | PASS |

---

## Unchallenged Areas

- Non-activity endpoints (e.g. public store discovery, admin audit endpoints) — out of scope for M2 Iteration 2 activity contracts challenge.
