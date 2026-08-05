# BRIEFING — 2026-08-05T09:31:00Z

## Mission
Implement Milestone 4 (PR 4: Activity Core, New Bill Route & Safe Legacy Redirects) for NightLife-VN Partner Portal.

## 🔒 My Identity
- Archetype: implementer, qa, specialist
- Roles: implementer, qa, specialist
- Working directory: d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_m4_1
- Original parent: a6166166-d3f1-4fc5-aed5-12da5b13dce6
- Milestone: Milestone 4 (PR 4)

## 🔒 Key Constraints
- DO NOT CHEAT: Genuine implementation, real state, real behavior.
- DO NOT use native browser alert(), confirm(), prompt(). Use toast/custom modal (`useSystemFeedback`).
- DO NOT use native browser <select> element. Use `ThemedListingSelect`.
- DO NOT use native browser datepicker. Use Antd DatePicker / custom project datepicker component.
- After code edits, git commit & push (`git add .`, `git commit -m "feat(frontend): implement activity core, new bill route, and safe legacy redirects (PR 4)"`, `git push`).

## Current Parent
- Conversation ID: a6166166-d3f1-4fc5-aed5-12da5b13dce6
- Updated: 2026-08-05T09:31:00Z

## Task Summary
- **What to build**: API functions in `partner-portal.ts`, hook `usePartnerActivity.ts`, routes `/partner/activity`, `/partner/activity/new-bill`, `/partner/activity/[activityId]`, update legacy redirects in `gui-hoa-don/page.tsx` and `partner/page.tsx`, and add unit tests (`usePartnerActivity.test.tsx`, `PartnerActivityPage.test.tsx`, `PartnerNewBillPage.test.tsx`).
- **Success criteria**: Typecheck, lint, and unit tests pass; real functionality works; commit and push made.

## Change Tracker
- **Files modified**:
  - `frontend/apps/web/src/lib/api/partner-portal.ts` (API client)
  - `frontend/apps/web/src/hooks/usePartnerActivity.ts` (custom hook)
  - `frontend/apps/web/src/app/partner/activity/page.tsx` (Activity feed page)
  - `frontend/apps/web/src/app/partner/activity/new-bill/page.tsx` (Bill submission form)
  - `frontend/apps/web/src/app/partner/activity/[activityId]/page.tsx` (Activity detail view)
  - `frontend/apps/web/src/app/partner/gui-hoa-don/page.tsx` (Server redirect)
  - `frontend/apps/web/src/app/partner/page.tsx` (Client query redirects)
  - `frontend/apps/web/__tests__/usePartnerActivity.test.tsx` (Unit tests)
  - `frontend/apps/web/__tests__/PartnerActivityPage.test.tsx` (Unit tests)
  - `frontend/apps/web/__tests__/PartnerNewBillPage.test.tsx` (Unit tests)
  - `frontend/apps/web/__tests__/PartnerBillSubmitPage.test.tsx` (Unit tests)
- **Build status**: PASS (0 type errors)
- **Pending issues**: None

## Quality Status
- **Build/test result**: PASS (15/15 unit tests passing)
- **Lint status**: PASS
- **Tests added/modified**: `usePartnerActivity.test.tsx`, `PartnerActivityPage.test.tsx`, `PartnerNewBillPage.test.tsx`, `PartnerBillSubmitPage.test.tsx`

## Loaded Skills
- None loaded
