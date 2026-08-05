## 2026-08-05T08:47:51Z
You are teamwork_preview_explorer (PR4 Legacy Redirects & Test Strategy Explorer). Your working directory is d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_m4_3\.

OBJECTIVE:
Investigate legacy route redirection and frontend test strategy for Milestone 4 (PR 4).

Specifically analyze:
1. Legacy Redirects:
   - `frontend/apps/web/src/app/partner/gui-hoa-don/page.tsx`: Update legacy redirect from `/partner?panel=bill` to `/partner/activity/new-bill`.
   - `frontend/apps/web/src/app/partner/page.tsx`: Legacy query parameter handling (`?panel=bill` -> redirect to `/partner/activity/new-bill`, `?panel=activity` -> redirect to `/partner/activity`).
2. Vitest Test Specifications:
   - Design test cases for `usePartnerActivity` hook (`__tests__/usePartnerActivity.test.tsx`).
   - Design test cases for Activity Feed sub-route (`__tests__/PartnerActivityPage.test.tsx`).
   - Design test cases for New Bill sub-route (`__tests__/PartnerNewBillPage.test.tsx`).

INPUT FILES TO READ:
- MANDATORY: d:\laragon\www\NightLife-VN\ORIGINAL_REQUEST.md
- d:\laragon\www\NightLife-VN\.agents\orchestrator\PROJECT.md
- frontend/apps/web/src/app/partner/gui-hoa-don/page.tsx
- frontend/apps/web/__tests__/PartnerBillSubmitPage.test.tsx

OUTPUT REQUIREMENTS:
1. Write analysis report to d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_m4_3\analysis.md
2. Write handoff report to d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_m4_3\handoff.md
3. Send completion message to parent orchestrator via send_message.

Do NOT modify any source code files. You are a read-only explorer.
