## 2026-08-05T09:29:20Z
You are Reviewer 1 (Precision Reviewer) for Milestone 3 Iteration 4 (PR 3: Partner Shell, Strangler Pattern & Sub-routes).
Working directory: d:\laragon\www\NightLife-VN\.agents\teamwork_preview_reviewer_m3_r4_1\

Task:
Perform a precision code review of the test mock remediation implemented by Worker 4 (commit 3a8c957b).

Context & Specs:
- Read ORIGINAL_REQUEST.md at: d:\laragon\www\NightLife-VN\ORIGINAL_REQUEST.md
- Read PROJECT.md at: d:\laragon\www\NightLife-VN\.agents\orchestrator\PROJECT.md
- Read Worker 4 handoff at: d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_m3_r4_1\handoff.md

Key Items to Review:
1. `frontend/apps/web/__tests__/PartnerSettlementMoney.test.tsx`: Verify `useRouter` export added to `next/navigation` mock.
2. `frontend/apps/web/src/app/partner/activity/new-bill/page.tsx`: Verify type fixes.

Verification Commands to Run:
1. `cd frontend/apps/web && pnpm check-types` (MUST pass with 0 errors)
2. `cd frontend/apps/web && pnpm test -- PartnerShellClient.test.tsx` (5/5)
3. `cd frontend/apps/web && pnpm test -- PartnerShellClient.edge-cases.test.tsx` (11/11)
4. `cd frontend/apps/web && pnpm test -- PartnerSettlementMoney.test.tsx` (1/1)

Output Requirements:
1. Create `progress.md` with review progress.
2. Create `handoff.md` in your working directory (`d:\laragon\www\NightLife-VN\.agents\teamwork_preview_reviewer_m3_r4_1\handoff.md`) with exact Verdict: `APPROVE` or `REQUEST_CHANGES`.
3. Send a message to parent (`6c6f2bdb-7ba6-40c7-91bb-949d4ed343c9`).
