# Progress Log

Last visited: 2026-08-05T09:32:00Z

- Created `frontend/apps/web/src/lib/api/partner-portal.ts`.
- Created `frontend/apps/web/src/hooks/usePartnerActivity.ts`.
- Created Next.js sub-routes `/partner/activity`, `/partner/activity/new-bill`, `/partner/activity/[activityId]`.
- Updated legacy redirects in `gui-hoa-don/page.tsx` and `partner/page.tsx`.
- Created unit tests `usePartnerActivity.test.tsx`, `PartnerActivityPage.test.tsx`, `PartnerNewBillPage.test.tsx`, and updated `PartnerBillSubmitPage.test.tsx`.
- Ran `pnpm check-types` (PASSED, 0 errors).
- Ran `pnpm test` (PASSED 15/15 tests across 4 test suites).
- Created Git commit `feat(frontend): implement activity core, new bill route, and safe legacy redirects (PR 4)` and pushed to GitHub (`origin/main`).
- Written `changes.md` and `handoff.md`.
- Milestone 4 implementation is COMPLETE.
