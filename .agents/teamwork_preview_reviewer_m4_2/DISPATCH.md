## 2026-08-05T09:36:10Z
<USER_REQUEST>
You are teamwork_preview_reviewer (PR4 Edge Case & Performance Reviewer). Your working directory is d:\laragon\www\NightLife-VN\.agents\teamwork_preview_reviewer_m4_2\.

OBJECTIVE:
Perform edge-case and performance review of Milestone 4 (PR 4: Activity Core, New Bill Route & Safe Legacy Redirects) implementation.

INPUT FILES TO READ & REVIEW:
- MANDATORY: d:\laragon\www\NightLife-VN\ORIGINAL_REQUEST.md
- d:\laragon\www\NightLife-VN\.agents\orchestrator\PROJECT.md
- d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_m4_1\changes.md
- d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_m4_1\handoff.md
- frontend/apps/web/src/app/partner/activity/new-bill/page.tsx
- frontend/apps/web/src/app/partner/activity/[activityId]/page.tsx
- frontend/apps/web/src/app/partner/gui-hoa-don/page.tsx
- frontend/apps/web/src/app/partner/page.tsx

REVIEW CRITERIA:
1. New Bill Sub-route (`/partner/activity/new-bill`): Bill submission form extracted from monolith, using `ThemedListingSelect` (NO native `<select>`), Antd DatePicker (NO native date picker), `useSystemFeedback` toast/modals (NO native `alert`/`confirm`), currency formatting, and OCR pre-fill.
2. Activity Detail Sub-route (`/partner/activity/[activityId]`): Standalone activity detail view page fetching from `GET /partner/activity/:activityId`.
3. Safe Legacy Redirects: `/partner/gui-hoa-don` redirects to `/partner/activity/new-bill`; `?panel=bill` redirects to `/partner/activity/new-bill`; `?panel=activity` redirects to `/partner/activity`.
4. Verification: Execute `pnpm check-types` and `pnpm test` in `frontend/apps/web`.

OUTPUT REQUIREMENTS:
1. Write review report to d:\laragon\www\NightLife-VN\.agents\teamwork_preview_reviewer_m4_2\review.md
2. Write handoff report to d:\laragon\www\NightLife-VN\.agents\teamwork_preview_reviewer_m4_2\handoff.md with explicit verdict: APPROVE or REQUEST_CHANGES.
3. Send completion message to parent orchestrator via send_message.

Do NOT modify any source code files.
</USER_REQUEST>
