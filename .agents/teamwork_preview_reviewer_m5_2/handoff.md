# Milestone 5 (PR 5: Home Redesign & Monolith Cleanup) Handoff Report

## 1. Observation
- `pnpm check-types` in `frontend/apps/web` exited with code 0 (0 TypeScript errors).
- `pnpm build` in `frontend/apps/web` exited with code 0, successfully compiling Next.js 16 build with 125 static pages and 9 `/partner/*` sub-routes (`/partner`, `/partner/scan`, `/partner/listing`, `/partner/settings`, `/partner/settings/staff`, `/partner/activity`, `/partner/activity/new-bill`, `/partner/activity/[activityId]`, `/partner/gui-hoa-don`).
- `pnpm test __tests__/PartnerHomePage.test.tsx` passed 8/8 tests.
- Running `pnpm test __tests__/Partner*` across all 9 partner test files resulted in 2 test file failures:
  1. `frontend/apps/web/__tests__/PartnerSettlementMoney.test.tsx:170` failed with: `Error: expect(received).toBeGreaterThan(expected) ... Received: 0`. Cause: Test imports `src/app/partner/page.tsx` expecting legacy `panel=settlement` UI which is no longer rendered inline on `PartnerHomePage`.
  2. `frontend/apps/web/__tests__/PartnerShellClient.edge-cases.test.tsx:107` failed with: `TestingLibraryElementError: Unable to find an accessible element with the role "button" and name "Chọn quán hoạt động"`.
- Inspection of `frontend/apps/web/src/app/partner/page.tsx` lines 26-32 revealed `panelMap` maps `scan`, `listing`, `settings`, `bill`, `activity`, but omits `staff` (`?panel=staff` -> `/partner/settings/staff`).
- Inspection of `frontend/apps/web/src/app/partner/page.tsx` lines 44-46 showed `finally { setLoading(false); }` runs on `AbortError`, causing loading state flicker when `selectedStoreId` changes quickly.

## 2. Logic Chain
1. Monolith refactoring in `page.tsx` successfully reduced file size from 8,752 lines to 236 lines (~97.3% reduction) and removed static heavy imports (`jsQR`, `ReactQuill`, `quill.snow.css`) from root `/partner`.
2. Both typecheck and production build compile cleanly.
3. However, legacy test suite audit was incomplete: `PartnerSettlementMoney.test.tsx` was not updated to reflect the new architecture, causing test failure when running the partner test suite. Additionally, `PartnerShellClient.edge-cases.test.tsx` regressed on store switcher querying.
4. Legacy URL parameter `?panel=staff` was omitted from `panelMap` in `page.tsx`, failing Review Criteria 2 requirement for `?panel=staff` -> `/partner/settings/staff`.
5. Because 2 test files fail and 1 legacy redirect route is missing, the implementation cannot be approved in its current state.

## 3. Caveats
- Production build compilation and TypeScript checks are 100% clean.
- The new `PartnerHomePage.test.tsx` test suite passes 100% (8/8 tests).
- Issues are isolated to legacy test file updates and one dictionary mapping key (`staff`).

## 4. Conclusion
**Verdict**: **REQUEST_CHANGES**

Rejection Rationale:
1. Critical: Test failures in `PartnerSettlementMoney.test.tsx` and `PartnerShellClient.edge-cases.test.tsx`.
2. Major: Missing legacy parameter redirect `?panel=staff` -> `/partner/settings/staff` in `page.tsx`.
3. Minor: Premature `setLoading(false)` on aborted fetches during fast store switching.

## 5. Verification Method
Run the following commands in `frontend/apps/web`:
1. `pnpm check-types` (verifies TypeScript types pass).
2. `pnpm build` (verifies Next.js production build succeeds).
3. `pnpm test __tests__/Partner*` (verifies all 9 Partner Portal test files pass cleanly).
