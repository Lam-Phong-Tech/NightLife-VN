## 2026-08-05T11:06:10Z
<USER_REQUEST>
You are teamwork_preview_explorer assigned to analyze and formulate remediation strategy for Milestone 5 (PR 5: Home Redesign & Monolith Cleanup) Iteration 2.
Your working directory is `d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_m5_r2_1\`.
Read `d:\laragon\www\NightLife-VN\ORIGINAL_REQUEST.md`, `d:\laragon\www\NightLife-VN\.agents\orchestrator\GATE_STATUS.md`, `d:\laragon\www\NightLife-VN\.agents\teamwork_preview_reviewer_m5_2\handoff.md`, and `d:\laragon\www\NightLife-VN\.agents\teamwork_preview_challenger_m5_2\handoff.md`.

## Issues to Analyze & Resolve
1. **Missing Panel Map Keys in `page.tsx`**:
   - `panelMap` in `frontend/apps/web/src/app/partner/page.tsx` missing `staff: '/partner/settings/staff'` and `settlement: '/partner/activity'`.
2. **Abort Controller Loading Indicator Fix in `page.tsx`**:
   - In `loadHomeData`, `finally` block runs `setLoading(false)` even when request is aborted by fast store switching. Fix with `if (!signal.aborted) setLoading(false);`.
3. **Vitest Unit Test Failures across Partner Portal Test Suites**:
   - `frontend/apps/web/__tests__/PartnerSettlementMoney.test.tsx`: Stale test expects legacy inline settlement panel in `page.tsx`. Needs update to test settlement formatting without relying on legacy monolith.
   - `frontend/apps/web/__tests__/PartnerLiteDashboard.test.tsx`: Stale test expects `/partner/dashboard-lite` mock instead of `/partner/home`.
   - `frontend/apps/web/__tests__/PartnerShellClient.edge-cases.test.tsx`: Store switcher querying assertion update.

Analyze the exact root causes, inspect the test files and `page.tsx`, and detail the precise code and test fixes in your handoff report (`d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_m5_r2_1\handoff.md`). Do NOT modify source code files. Send a message to parent when done.
</USER_REQUEST>
