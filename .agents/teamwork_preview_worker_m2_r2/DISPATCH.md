## 2026-08-05T07:35:32Z
<USER_REQUEST>
You are teamwork_preview_worker (PR2 Remediation Worker). Your working directory is d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_m2_r2\.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

INPUT SPECIFICATION & ANALYSIS FILES TO READ FIRST:
- MANDATORY: d:\laragon\www\NightLife-VN\ORIGINAL_REQUEST.md
- d:\laragon\www\NightLife-VN\.agents\orchestrator\PROJECT.md
- d:\laragon\www\NightLife-VN\.agents\teamwork_preview_reviewer_m2_2\review.md
- d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_m2_r2_1\analysis.md

ASSIGNED TASK: Implement Milestone 2 Iteration 2 Remediation Fixes

Fix 1. Keyset Cursor Database-Level Filtering in `getPartnerActivities()` (`backend/src/nightlife-data/nightlife-data.service.ts`):
- Update Prisma `findMany` queries for `Bill`, `CouponIssue`, and `Booking` to pass database-level cursor conditions in `where.AND` when `decodedCursor` is present:
  - Extract `cursorTime = new Date(decodedCursor.activityAt)` and `cursorId = decodedCursor.id`.
  - For `Bill`: filter where `submittedAt < cursorTime` OR (`submittedAt = cursorTime` AND `id < rawBillId`).
  - For `CouponIssue`: filter where `usedAt < cursorTime` OR (`usedAt = cursorTime` AND `id < rawCouponId`).
  - For `Booking`: filter where `scheduledAt < cursorTime` OR (`scheduledAt = cursorTime` AND `id < rawBookingId`).
- This ensures database queries fetch the next page of items instead of offset 0, fixing deep pagination truncation beyond 60 items.

Fix 2. Asia/Ho_Chi_Minh Timezone Date Normalization:
- Implement `parseVietnamDateBoundary(dateStr: string, isEnd: boolean): Date` helper in `nightlife-data.service.ts`.
- Convert YYYY-MM-DD input strings to exact `Asia/Ho_Chi_Minh` start-of-day (`00:00:00.000+07:00` -> UTC `17:00:00.000Z` of previous day) and end-of-day (`23:59:59.999+07:00` -> UTC `16:59:59.999Z` of target day).
- Apply this normalization to `dto.startDate` and `dto.endDate` before constructing Prisma `where` date filters.

Fix 3. Unit Tests Addition (`backend/src/nightlife-data/nightlife-data.service.spec.ts`):
- Add unit test verifying deep pagination past 60 items across multiple pages.
- Add unit test verifying `Asia/Ho_Chi_Minh` date boundary filtering.

Fix 4. Verification & Git Delivery:
- Run backend tests: `cd backend && npm test -- nightlife-data.service.spec.ts`
- Run frontend typecheck: `cd frontend/apps/web && pnpm check-types`
- Run `git add .`
- Run `git commit -m "fix(backend): remediate PR 2 deep cursor pagination and timezone boundaries"`
- Run `git push`

Fix 5. Report Completion:
- Write `changes.md` and `handoff.md` in `d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_m2_r2\`.
- Send completion message to parent orchestrator via send_message.
</USER_REQUEST>
