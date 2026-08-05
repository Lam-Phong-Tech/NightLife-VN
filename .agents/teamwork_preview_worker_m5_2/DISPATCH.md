## 2026-08-05T11:05:53Z

You are teamwork_preview_worker (PR5 Iteration 2 Remediation Worker). Your working directory is d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_m5_2\.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

USER RULES TO STRICTLY OBEY:
- DO NOT use native browser alert(), confirm(), prompt(). Use toast or custom project modal (`useSystemFeedback`).
- DO NOT use native browser <select> element. Use custom component `ThemedListingSelect`.
- DO NOT use native browser datepicker. Use Antd DatePicker or project custom datepicker component.
- After finishing code edits, create a git commit and push (`git add .`, `git commit -m "..."`, `git push`).

INPUT SPECIFICATION & ANALYSIS FILES TO READ FIRST:
- MANDATORY: d:\laragon\www\NightLife-VN\ORIGINAL_REQUEST.md
- d:\laragon\www\NightLife-VN\.agents\orchestrator\PROJECT.md
- d:\laragon\www\NightLife-VN\.agents\teamwork_preview_reviewer_m5_2\handoff.md
- d:\laragon\www\NightLife-VN\.agents\teamwork_preview_challenger_m5_2\handoff.md

ASSIGNED REMEDIATION TASKS:

Step 1. Fix `frontend/apps/web/src/app/partner/page.tsx`:
- Add `'staff': '/partner/settings/staff'` to `panelMap` dictionary so legacy query parameter `?panel=staff` redirects to `/partner/settings/staff`.
- In `loadHomeData`, handle `AbortError` cleanly: if `err instanceof Error && err.name === 'AbortError'`, return early without calling `setLoading(false)` or `setError()`.

Step 2. Update Legacy Test Files:
- `frontend/apps/web/__tests__/PartnerSettlementMoney.test.tsx`: Update test file to test settlement money formatting/calculations directly or mock `fetchPartnerHome` without expecting legacy inline monolithic page elements.
- `frontend/apps/web/__tests__/PartnerShellClient.edge-cases.test.tsx`: Update `useRouter` mocks and store switcher element querying to align with `PartnerShellClient`.
- `frontend/apps/web/__tests__/PartnerLiteDashboard.test.tsx`: Ensure `useRouter` mock is properly defined.

Step 3. Execute Automated Verification:
- Run typecheck: `cd frontend/apps/web && pnpm check-types`
- Run ALL Partner Portal test files: `cd frontend/apps/web && pnpm vitest run __tests__/Partner*` (ensure ALL partner test files pass cleanly!).
- Run production build: `cd frontend/apps/web && pnpm build` (ensure 100% clean compilation with exit code 0).

Step 4. Git Commit & Push:
- Run `git add .`
- Run `git commit -m "fix(frontend): remediate partner home redirects, loading state, and legacy tests (PR 5)"`
- Run `git push`

Step 5. Report Completion:
- Write `changes.md` and `handoff.md` in `d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_m5_2\`.
- Send completion message to parent orchestrator via send_message.
