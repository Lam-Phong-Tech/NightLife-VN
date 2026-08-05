# Milestone 5 (PR 5: Home Redesign & Monolith Cleanup) Handoff Report

## 1. Observation
- Monolithic `frontend/apps/web/src/app/partner/page.tsx` (>8,700 lines) was refactored into a clean 196-line Home Dashboard component.
- Consumes `fetchPartnerHome(selectedStoreId)` from `@/lib/api/partner-portal` and store scope from `usePartnerStoreScope()`.
- Renders 4 KPI cards (`totalRevenueVnd`, `billCount`, `bookingCount`, `activeCouponsCount`), 5 quick action tiles (`/partner/activity/new-bill`, `/partner/scan`, `/partner/listing`, `/partner/settings`, `/partner/settings/staff`), and recent activity feed preview with top 5 items.
- Legacy test files (`PartnerLiteDashboard.test.tsx`, `PartnerOfflineScanQueue.test.tsx`, `PartnerBillSubmitPage.test.tsx`) updated to include `useRouter` mock.
- `PartnerHomePage.test.tsx` created and passed 8/8 tests.
- Typecheck (`pnpm check-types`) PASSED with Exit Code 0.
- Production build (`pnpm build`) PASSED with Exit Code 0 compiling 125 static pages and all 9 `/partner/*` sub-routes.

## 2. Logic Chain
- Monolith extraction into sub-routes in PR 3 & PR 4 paved the way for replacing `page.tsx` with a high-level executive dashboard.
- `fetchPartnerHome` provides pre-aggregated metrics and top 5 recent activities in a single GET call `/partner/home`, optimizing client load time and reducing bandwidth.
- Supplying `useRouter` in `vi.mock('next/navigation')` prevents `TypeError: Cannot read properties of undefined (reading 'replace')` in legacy tests rendering components that trigger navigation redirects.

## 3. Caveats
- Legacy admin/user vitest files outside the scope of PR 5 have pre-existing mock mismatches; however, 100% of Partner Portal test suites (`PartnerHomePage`, `PartnerSettlementMoney`, `PartnerShellClient`, `PartnerActivityPage`, `PartnerNewBillPage`, `usePartnerActivity`, `PartnerLiteDashboard`, `PartnerBillSubmitPage`, `PartnerOfflineScanQueue`, `PartnerShellClient.edge-cases`) pass cleanly.

## 4. Conclusion
Milestone 5 (PR 5: Home Redesign & Monolith Cleanup) implementation is complete, fully tested, and verified against production build compilation.

## 5. Verification Method
Run the following commands from `frontend/apps/web/`:
1. `pnpm check-types` (confirms 0 TypeScript errors).
2. `pnpm test __tests__/PartnerHomePage.test.tsx` (confirms 8/8 home dashboard unit tests pass).
3. `pnpm build` (confirms clean Next.js 16 build compilation).
