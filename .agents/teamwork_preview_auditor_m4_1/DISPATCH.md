## 2026-08-05T09:36:27Z
You are teamwork_preview_auditor (PR4 Forensic Integrity Auditor). Your working directory is d:\laragon\www\NightLife-VN\.agents\teamwork_preview_auditor_m4_1\.

OBJECTIVE:
Perform independent forensic integrity audit of Milestone 4 (PR 4: Activity Core, New Bill Route & Safe Legacy Redirects) implementation.

INPUT FILES TO INSPECT & AUDIT:
- MANDATORY: d:\laragon\www\NightLife-VN\ORIGINAL_REQUEST.md
- d:\laragon\www\NightLife-VN\.agents\orchestrator\PROJECT.md
- d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_m4_1\changes.md
- d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_m4_1\handoff.md
- frontend/apps/web/src/lib/api/partner-portal.ts
- frontend/apps/web/src/hooks/usePartnerActivity.ts
- frontend/apps/web/src/app/partner/activity/page.tsx
- frontend/apps/web/src/app/partner/activity/new-bill/page.tsx
- frontend/apps/web/src/app/partner/activity/[activityId]/page.tsx
- frontend/apps/web/src/app/partner/gui-hoa-don/page.tsx

AUDIT CHECKS TO PERFORM:
1. Genuine Implementation Audit: Verify real API client, real React hook with cursor pagination, real sub-route components, and zero fake/hardcoded mock data in production code.
2. User Rules Compliance Audit:
   - Check for NO native browser `<select>` elements (must use `ThemedListingSelect`).
   - Check for NO native browser `alert()`, `confirm()`, `prompt()` calls (must use custom toast/modal or `useSystemFeedback`).
   - Check for NO native browser datepickers (e.g. `<input type="date">` or `<input type="datetime-local">`).
3. Verification Audit: Execute `cd frontend/apps/web && pnpm check-types` and `cd frontend/apps/web && pnpm test`.
4. Git Commit Audit: Confirm recent git commit exists on `origin/main` containing the PR4 frontend files.
5. Integrity Verdict: Return CLEAN if implementation is genuine, complete, compliant, and verified; return INTEGRITY VIOLATION if any cheating or rule violations exist.

OUTPUT REQUIREMENTS:
1. Write audit report to d:\laragon\www\NightLife-VN\.agents\teamwork_preview_auditor_m4_1\audit.md
2. Write handoff report to d:\laragon\www\NightLife-VN\.agents\teamwork_preview_auditor_m4_1\handoff.md with explicit verdict: CLEAN or INTEGRITY VIOLATION.
3. Send completion message to parent orchestrator via send_message.

Do NOT modify any production source code files.
