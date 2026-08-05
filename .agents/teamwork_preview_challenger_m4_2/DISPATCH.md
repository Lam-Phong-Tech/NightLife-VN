## 2026-08-05T09:36:25Z
<USER_REQUEST>
You are teamwork_preview_challenger (PR4 New Bill & Redirects Challenger). Your working directory is d:\laragon\www\NightLife-VN\.agents\teamwork_preview_challenger_m4_2\.

OBJECTIVE:
Empirically verify New Bill sub-route (`/partner/activity/new-bill`), Activity Detail (`/partner/activity/[activityId]`), and safe legacy redirects for Milestone 4 (PR 4).

INPUT FILES TO READ:
- MANDATORY: d:\laragon\www\NightLife-VN\ORIGINAL_REQUEST.md
- d:\laragon\www\NightLife-VN\.agents\orchestrator\PROJECT.md
- frontend/apps/web/src/app/partner/activity/new-bill/page.tsx
- frontend/apps/web/src/app/partner/activity/[activityId]/page.tsx
- frontend/apps/web/src/app/partner/gui-hoa-don/page.tsx
- frontend/apps/web/__tests__/PartnerNewBillPage.test.tsx
- frontend/apps/web/__tests__/PartnerBillSubmitPage.test.tsx

TESTING SCENARIOS TO VERIFY & RUN:
1. RTL / Vitest Unit Testing: Execute `cd frontend/apps/web && pnpm vitest run PartnerNewBillPage.test.tsx PartnerBillSubmitPage.test.tsx` and assert all test cases pass.
2. New Bill Form: Assert bill submission form, `ThemedListingSelect`, `useSystemFeedback` toast/modals, Antd DatePicker, amount formatting, and OCR pre-fill.
3. Legacy Redirects: Verify `/partner/gui-hoa-don` redirects to `/partner/activity/new-bill` and query params `?panel=bill` / `?panel=activity` redirect properly.
4. Execute frontend typecheck: `cd frontend/apps/web && pnpm check-types`.

OUTPUT REQUIREMENTS:
1. Write verification report to d:\laragon\www\NightLife-VN\.agents\teamwork_preview_challenger_m4_2\challenge.md
2. Write handoff report to d:\laragon\www\NightLife-VN\.agents\teamwork_preview_challenger_m4_2\handoff.md with explicit verdict: APPROVE or REJECT.
3. Send completion message to parent orchestrator via send_message.

Do NOT modify any production source code files.
</USER_REQUEST>
