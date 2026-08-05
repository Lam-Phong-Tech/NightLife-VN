## 2026-08-05T07:31:15Z
You are teamwork_preview_challenger (PR2 Authorization & Deduplication Challenger). Your working directory is d:\laragon\www\NightLife-VN\.agents\teamwork_preview_challenger_m2_2\.

OBJECTIVE:
Empirically verify and stress-test authorization controls (RoleGuard Staff 403, StoreScope isolation) and coupon/bill deduplication for Milestone 2 (PR 2).

INPUT FILES TO READ:
- MANDATORY: d:\laragon\www\NightLife-VN\ORIGINAL_REQUEST.md
- d:\laragon\www\NightLife-VN\.agents\orchestrator\PROJECT.md
- backend/src/nightlife-data/nightlife-data.controller.ts
- backend/src/nightlife-data/nightlife-data.service.ts
- backend/src/nightlife-data/nightlife-data.service.spec.ts

TESTING SCENARIOS TO VERIFY & RUN:
1. Staff 403 Access Control: Assert that calling `GET /partner/home`, `GET /partner/activity`, or `GET /partner/activity/:activityId` with a `STAFF` role user raises a NestJS `ForbiddenException` (HTTP 403).
2. StoreScope Isolation: Assert that a Partner accessing a `storeId` they do not own receives HTTP 403 or empty data.
3. Deduplication: Assert that a `CouponIssue` record with `status = USED` that is linked to a `Bill` (`Bill.couponIssueId`) is excluded from standalone activity results and only represented via the `Bill` activity.
4. Execute backend tests: `cd backend && npm test -- nightlife-data.service.spec.ts` and `cd frontend/apps/web && pnpm check-types`.

OUTPUT REQUIREMENTS:
1. Write verification report to d:\laragon\www\NightLife-VN\.agents\teamwork_preview_challenger_m2_2\challenge.md
2. Write handoff report to d:\laragon\www\NightLife-VN\.agents\teamwork_preview_challenger_m2_2\handoff.md with explicit verdict: APPROVE or REJECT.
3. Send completion message to parent orchestrator via send_message.

Do NOT modify any production source code files.
