# Handoff Report — PR 5 (Build & Monolith Cleanup Verification)

## 1. Observation

### Command 1: `cd frontend/apps/web && pnpm check-types`
- **Result**: Exit code 0.
- **Output**:
  ```
  > web@0.0.0 check-types D:\laragon\www\NightLife-VN\frontend\apps\web
  > tsc --noEmit
  ```

### Command 2: `cd frontend/apps/web && pnpm build`
- **Result**: Exit code 0.
- **Output Summary**:
  ```
  ▲ Next.js 16.2.9 (Turbopack)
  ✓ Compiled successfully in 48s
  ✓ Generating static pages using 3 workers (125/125) in 2.9s
  All 9 /partner/* routes compiled:
  - /partner
  - /partner/activity
  - /partner/activity/[activityId]
  - /partner/activity/new-bill
  - /partner/gui-hoa-don
  - /partner/listing
  - /partner/scan
  - /partner/settings
  - /partner/settings/staff
  ```

### Command 3: Full Partner Vitest Suite
- **Command**: `cd frontend/apps/web && pnpm vitest run PartnerHomePage.test.tsx PartnerShellClient.test.tsx PartnerSettlementMoney.test.tsx PartnerActivityPage.test.tsx PartnerNewBillPage.test.tsx usePartnerActivity.test.tsx PartnerLiteDashboard.test.tsx PartnerBillSubmitPage.test.tsx PartnerOfflineScanQueue.test.tsx`
- **Result**: Exit code 1.
- **Summary**: 7 passed, 2 failed (31 passed, 2 failed).
- **Verbatim Error 1** (`PartnerLiteDashboard.test.tsx`):
  ```
  FAIL __tests__/PartnerLiteDashboard.test.tsx > Partner lite dashboard > renders aggregate-only partner metrics without loading detailed bookings
  AssertionError: expected spy to be called with arguments matching [ '/partner/dashboard-lite' ]
  ```
- **Verbatim Error 2** (`PartnerSettlementMoney.test.tsx`):
  ```
  FAIL __tests__/PartnerSettlementMoney.test.tsx > PartnerSettlementMoney > renders 'Giảm giá: Chưa xác định' when discountVnd is null and does not render -totalVnd
  TestingLibraryElementError: Unable to find an element with the text: BILL-NULL-001.
  ```

---

## 2. Logic Chain

1. `pnpm check-types` passed with exit code 0, confirming zero TypeScript errors across the codebase.
2. `pnpm build` passed with exit code 0, confirming that Next.js Turbopack correctly compiles all 125 static and dynamic routes including all 9 sub-routes of `/partner/*`.
3. When running the mandatory 9 Partner Portal test suites, 7 files (31 unit tests) pass cleanly.
4. However, 2 test files (`PartnerLiteDashboard.test.tsx` and `PartnerSettlementMoney.test.tsx`) failed because they were written for the pre-M5 monolith `src/app/partner/page.tsx` component.
   - `PartnerLiteDashboard.test.tsx` expects `page.tsx` to query `/partner/dashboard-lite`, whereas M5 `PartnerHomePage` queries `/partner/home`.
   - `PartnerSettlementMoney.test.tsx` expects `page.tsx` to render inline settlement bill components when passed `?panel=settlement`, whereas M5 `PartnerHomePage` is a dedicated overview dashboard that delegates activity/bill feeds to `/partner/activity`.
5. Because `vitest run` fails with exit code 1, the test suite criteria is not fully met until these two legacy unit tests are refactored to align with M5 architecture.

---

## 3. Caveats

- The failure is isolated to test alignment in `PartnerLiteDashboard.test.tsx` and `PartnerSettlementMoney.test.tsx`. The production build compilation (`pnpm build`) and type checking (`pnpm check-types`) are 100% clean and passing.
- `src/app/partner/page.tsx` handles legacy query redirects for `scan`, `listing`, `settings`, `bill`, `activity`, but omits `settlement` in `panelMap`.

---

## 4. Conclusion

**VERDICT: REJECT**

- **Reason**: Vitest run for the Partner Portal test suite failed with exit code 1 due to 2 stale legacy unit test files (`PartnerLiteDashboard.test.tsx` and `PartnerSettlementMoney.test.tsx`).
- **Required Remediation**:
  1. Update `PartnerLiteDashboard.test.tsx` to mock and assert `fetchPartnerHome` (`/partner/home`) instead of `/partner/dashboard-lite`.
  2. Update `PartnerSettlementMoney.test.tsx` to render `PartnerActivityPage` or update `PartnerHomePage` redirect/route testing.
  3. Optionally add `settlement: '/partner/activity'` to `panelMap` in `src/app/partner/page.tsx`.

---

## 5. Verification Method

To independently verify after remediation:

1. Typecheck:
   `cd frontend/apps/web && pnpm check-types` (Expect exit code 0)
2. Production build:
   `cd frontend/apps/web && pnpm build` (Expect exit code 0, 125 routes compiled)
3. Test suite:
   `cd frontend/apps/web && pnpm vitest run PartnerHomePage.test.tsx PartnerShellClient.test.tsx PartnerSettlementMoney.test.tsx PartnerActivityPage.test.tsx PartnerNewBillPage.test.tsx usePartnerActivity.test.tsx PartnerLiteDashboard.test.tsx PartnerBillSubmitPage.test.tsx PartnerOfflineScanQueue.test.tsx` (Expect exit code 0, all 9 test suites passing)
