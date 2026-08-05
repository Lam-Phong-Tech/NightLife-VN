# Challenge Report — Milestone 5 (PR 5) Verification

## Challenge Summary

**Overall risk assessment**: HIGH (2 test suite failures out of 9 partner portal test suites, exit code 1 in `vitest run`).

## Challenges

### [High] Challenge 1: Stale Legacy Monolith Unit Tests Failing in Vitest Pipeline
- **Assumption challenged**: All Partner Portal test suites pass seamlessly after M5 monolith refactoring.
- **Attack scenario**: Running the mandatory full Partner test suite via `pnpm vitest run PartnerHomePage.test.tsx PartnerShellClient.test.tsx PartnerSettlementMoney.test.tsx PartnerActivityPage.test.tsx PartnerNewBillPage.test.tsx usePartnerActivity.test.tsx PartnerLiteDashboard.test.tsx PartnerBillSubmitPage.test.tsx PartnerOfflineScanQueue.test.tsx`.
- **Blast radius**: CI/CD pipeline failure (exit code 1).
- **Failure Details**:
  1. `PartnerLiteDashboard.test.tsx`: Fails at line 121 (`expect(apiClient).toHaveBeenCalledWith(expect.stringContaining("/partner/dashboard-lite"))`). M5 `PartnerHomePage` fetches `/partner/home` instead of `/partner/dashboard-lite`.
  2. `PartnerSettlementMoney.test.tsx`: Fails at line 170 (`expect(screen.getAllByText("BILL-NULL-001").length).toBeGreaterThan(0)`). M5 `PartnerHomePage` no longer renders inline bill settlement lists for `?panel=settlement`.
- **Mitigation**: Update `PartnerLiteDashboard.test.tsx` and `PartnerSettlementMoney.test.tsx` to match M5 `PartnerHomePage` architecture (`fetchPartnerHome` / `/partner/home` endpoint) and sub-route navigation model.

### [Medium] Challenge 2: Unhandled Legacy Query Parameter `?panel=settlement`
- **Assumption challenged**: All legacy `?panel=*` query parameters seamlessly redirect to sub-routes.
- **Attack scenario**: A user or bookmark accesses `/partner?panel=settlement`.
- **Blast radius**: `panelMap` in `src/app/partner/page.tsx` defines mappings for `scan`, `listing`, `settings`, `bill`, `activity`, but omits `settlement`. As a result, navigating to `?panel=settlement` stays on the home dashboard instead of redirecting to `/partner/activity`.
- **Mitigation**: Add `settlement: '/partner/activity'` to `panelMap` in `src/app/partner/page.tsx`.

## Stress Test Results

1. **Frontend Typecheck (`pnpm check-types`)**:
   - Expected: 0 TypeScript errors.
   - Actual: 0 TypeScript errors (`tsc --noEmit` exited with code 0).
   - Verdict: **PASS**.

2. **Next.js Production Build (`pnpm build`)**:
   - Expected: Next.js Turbopack build compiles all 61+ routes and 9 `/partner/*` sub-routes with exit code 0.
   - Actual: 125 total routes compiled cleanly in 48s with exit code 0.
   - Sub-routes verified: `/partner`, `/partner/activity`, `/partner/activity/[activityId]`, `/partner/activity/new-bill`, `/partner/gui-hoa-don`, `/partner/listing`, `/partner/scan`, `/partner/settings`, `/partner/settings/staff`.
   - Verdict: **PASS**.

3. **Full Partner Test Suite (9 Test Files)**:
   - Expected: All 9 test files pass.
   - Actual: 7 test files passed (31 tests), 2 test files failed (2 tests), exit code 1.
   - Passing files: `PartnerHomePage.test.tsx`, `PartnerShellClient.test.tsx`, `PartnerActivityPage.test.tsx`, `PartnerNewBillPage.test.tsx`, `usePartnerActivity.test.tsx`, `PartnerBillSubmitPage.test.tsx`, `PartnerOfflineScanQueue.test.tsx`.
   - Failing files: `PartnerLiteDashboard.test.tsx`, `PartnerSettlementMoney.test.tsx`.
   - Verdict: **FAIL**.

## Unchallenged Areas

- Production build compilation and static route generation — fully verified with `pnpm build`.
- Typescript static safety — fully verified with `pnpm check-types`.
