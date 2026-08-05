## 2026-08-05T08:29:42Z
You are teamwork_preview_challenger (PR3 Shell & Context Challenger). Your working directory is d:\laragon\www\NightLife-VN\.agents\teamwork_preview_challenger_m3_1\.

OBJECTIVE:
Empirically verify and stress-test `PartnerShellClient`, `PartnerProviders`, and navigation context for Milestone 3 (PR 3).

INPUT FILES TO READ:
- MANDATORY: d:\laragon\www\NightLife-VN\ORIGINAL_REQUEST.md
- d:\laragon\www\NightLife-VN\.agents\orchestrator\PROJECT.md
- frontend/apps/web/src/app/partner/PartnerProviders.tsx
- frontend/apps/web/src/app/partner/PartnerShellClient.tsx
- frontend/apps/web/__tests__/PartnerShellClient.test.tsx

TESTING SCENARIOS TO VERIFY & RUN:
1. RTL / Vitest Unit Testing: Execute `cd frontend/apps/web && pnpm vitest run PartnerShellClient.test.tsx` and assert all test cases pass.
2. Context State & Navigation: Assert active route highlighting based on `usePathname()`, store switcher context propagation, and role-filtering of nav items for `STAFF` vs `PARTNER`.
3. Execute frontend typecheck: `cd frontend/apps/web && pnpm check-types`.

OUTPUT REQUIREMENTS:
1. Write verification report to d:\laragon\www\NightLife-VN\.agents\teamwork_preview_challenger_m3_1\challenge.md
2. Write handoff report to d:\laragon\www\NightLife-VN\.agents\teamwork_preview_challenger_m3_1\handoff.md with explicit verdict: APPROVE or REJECT.
3. Send completion message to parent orchestrator via send_message.

Do NOT modify any production source code files.
