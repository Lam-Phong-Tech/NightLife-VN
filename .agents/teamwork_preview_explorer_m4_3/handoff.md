# Handoff Report: PR4 Legacy Redirects & Test Strategy Explorer

## 1. Observation
- **Legacy Bill Route (`gui-hoa-don/page.tsx`)**:
  File: `frontend/apps/web/src/app/partner/gui-hoa-don/page.tsx:4`
  ```tsx
  redirect('/partner?panel=bill');
  ```
  Observed legacy redirect sending traffic to monolith query parameter `/partner?panel=bill`.
- **Legacy Monolith Query Params (`partner/page.tsx`)**:
  File: `frontend/apps/web/src/app/partner/page.tsx:1730`
  ```tsx
  const requestedPanel = searchParams.get('panel');
  ```
  Observed query parameter parsing for legacy monolith panels (`bill`, `scan`, `listing`, `settings`, `overview`).
- **Existing Test Setup**:
  File: `frontend/apps/web/__tests__/PartnerBillSubmitPage.test.tsx:16`
  ```tsx
  searchParams: "panel=bill",
  ```
  Observed existing test suite testing legacy `/partner?panel=bill` monolith behavior.
- **Milestone 4 Strategy Requirements**:
  Target file: `d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_m4_3\analysis.md`
  Detailed design specs created for `usePartnerActivity.test.tsx`, `PartnerActivityPage.test.tsx`, and `PartnerNewBillPage.test.tsx`.

---

## 2. Logic Chain
1. **Observation 1 & 2**: `gui-hoa-don/page.tsx` currently redirects to `/partner?panel=bill`, and `partner/page.tsx` reads `searchParams.get('panel')`.
2. **Logic Step A**: In PR 4, partner activity and bill creation are refactored into dedicated sub-routes (`/partner/activity` and `/partner/activity/new-bill`).
3. **Logic Step B**: Updating `gui-hoa-don/page.tsx` to call `redirect('/partner/activity/new-bill')` eliminates intermediate redirects to `/partner?panel=bill` and directly routes users to the new sub-route.
4. **Logic Step C**: Handling `?panel=bill` and `?panel=activity` inside `partner/page.tsx` via `router.replace()` ensures backwards compatibility for legacy bookmarks/links.
5. **Observation 3 & 4**: Existing tests (e.g. `PartnerBillSubmitPage.test.tsx`) mock `panel=bill`. New sub-routes need comprehensive Vitest test coverage for hooks, feed UI, and bill creation form.
6. **Logic Step D**: The test designs in `analysis.md` provide unit & component level test patterns covering data fetching, pagination, error handling, input formatting, OCR integration, and role permissions.

---

## 3. Caveats
- **Read-Only Scope**: Source code files were not modified during this exploration phase (as per read-only role instructions).
- **Dependency Assumption**: Test suites assume the implementation of `partnerPortalApi` client and `usePartnerActivity` custom hook as outlined in PR 4 specs.

---

## 4. Conclusion
The legacy redirect migration plan and frontend test suite strategy for Milestone 4 (PR 4) are fully analyzed, specified, and ready for implementation.
- `gui-hoa-don/page.tsx` will redirect directly to `/partner/activity/new-bill`.
- `partner/page.tsx` will handle legacy query params (`?panel=bill` -> `/partner/activity/new-bill`, `?panel=activity` -> `/partner/activity`).
- Vitest test specs for `usePartnerActivity.test.tsx`, `PartnerActivityPage.test.tsx`, and `PartnerNewBillPage.test.tsx` are documented with complete test cases in `analysis.md`.

---

## 5. Verification Method
1. **File Inspection**:
   - Inspect `d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_m4_3\analysis.md` for full implementation and test code designs.
2. **Execution Verification (Post-Implementation)**:
   - Run Vitest suite:
     ```bash
     cd frontend/apps/web && pnpm vitest run __tests__/usePartnerActivity.test.tsx __tests__/PartnerActivityPage.test.tsx __tests__/PartnerNewBillPage.test.tsx
     ```
3. **Invalidation Conditions**:
   - If `/partner/activity/new-bill` sub-route structure is altered or renamed.
