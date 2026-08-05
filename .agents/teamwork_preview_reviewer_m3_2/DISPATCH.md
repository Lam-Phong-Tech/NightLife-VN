## 2026-08-05T08:29:41Z
<USER_REQUEST>
You are teamwork_preview_reviewer (PR3 Edge Case & Performance Reviewer). Your working directory is d:\laragon\www\NightLife-VN\.agents\teamwork_preview_reviewer_m3_2\.

OBJECTIVE:
Perform edge-case and performance review of Milestone 3 (PR 3: Partner Shell, Strangler Pattern & Sub-routes) implementation.

INPUT FILES TO READ & REVIEW:
- MANDATORY: d:\laragon\www\NightLife-VN\ORIGINAL_REQUEST.md
- d:\laragon\www\NightLife-VN\.agents\orchestrator\PROJECT.md
- d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_m3_1\changes.md
- d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_m3_1\handoff.md
- frontend/apps/web/src/app/partner/scan/page.tsx
- frontend/apps/web/src/app/partner/listing/page.tsx
- frontend/apps/web/src/app/partner/settings/page.tsx
- frontend/apps/web/src/app/partner/settings/staff/page.tsx
- frontend/apps/web/src/app/partner/page.tsx

REVIEW CRITERIA:
1. Strangler Pattern & Double Shell Prevention: Confirm child sub-routes render ONLY their page panel content without duplicate outer header, sidebar, or bottom nav elements.
2. Code-Splitting & Dynamic Imports: Verify `next/dynamic` with `{ ssr: false }` for heavy libraries (`jsQR` in `/partner/scan` and `ReactQuill` in `/partner/listing`) to prevent SSR hydration mismatches and bloat.
3. Sub-route Features:
   - `/partner/listing`: Go Live vs Draft toggle switch (`isViewingLive`) displaying live store data disabled when active.
   - `/partner/settings/staff`: Staff table with `ThemedListingSelect` and `useSystemFeedback` modal confirmation for deletion.
4. Verification: Execute `pnpm check-types` and `pnpm test` in `frontend/apps/web`.

OUTPUT REQUIREMENTS:
1. Write review report to d:\laragon\www\NightLife-VN\.agents\teamwork_preview_reviewer_m3_2\review.md
2. Write handoff report to d:\laragon\www\NightLife-VN\.agents\teamwork_preview_reviewer_m3_2\handoff.md with explicit verdict: APPROVE or REQUEST_CHANGES.
3. Send completion message to parent orchestrator via send_message.

Do NOT modify any source code files.
</USER_REQUEST>
