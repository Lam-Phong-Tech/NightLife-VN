# Progress Log

Last visited: 2026-08-05T08:52:00Z

- Created `frontend/apps/web/src/lib/api/partner-portal.ts` with typed endpoints and AbortSignal support.
- Created `frontend/apps/web/src/hooks/usePartnerActivity.ts` with stable cursor pagination and store scope integration.
- Created `/partner/activity/page.tsx` (Activity Feed), `/partner/activity/new-bill/page.tsx` (New Bill submission form), `/partner/activity/[activityId]/page.tsx` (Activity Detail).
- Updated legacy redirects in `gui-hoa-don/page.tsx` and `partner/page.tsx`.
- Created unit tests `usePartnerActivity.test.tsx`, `PartnerActivityPage.test.tsx`, `PartnerNewBillPage.test.tsx`.
- Running `pnpm check-types` in `frontend/apps/web`.
