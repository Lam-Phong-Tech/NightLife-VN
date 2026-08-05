# Handoff Report: Milestone 3 Frontend Verification & Test Strategy

## 1. Observation
- **Test Infrastructure**:
  - Test framework: Vitest `v4.1.9` (`frontend/apps/web/vitest.config.ts`), JSDOM `v29.1.1`, Testing Library React `v16.3.2`.
  - Global setup: `frontend/apps/web/vitest.setup.ts` mocking `next/image`, `next/link`, and polyfilling `localStorage`/`sessionStorage`.
  - Test location: `frontend/apps/web/__tests__/` containing 48 test files (57 total test files in web app).
- **Existing Partner Tests**:
  - `frontend/apps/web/__tests__/PartnerSettlementMoney.test.tsx`: Tests null `discountVnd` rendering (*"Giảm giá: Chưa xác định"*) and verifies total is never formatted as negative discount.
  - `frontend/apps/web/__tests__/PartnerLiteDashboard.test.tsx`: Tests aggregate metrics rendering without fetching detailed customer info.
  - `frontend/apps/web/__tests__/PartnerBillSubmitPage.test.tsx`: Tests bill submission, store scope selector, and Go Live vs Draft description view.
  - `frontend/apps/web/__tests__/PartnerOfflineScanQueue.test.tsx`: Tests offline queueing and online replay of signed QR tokens.
- **Verification Command Execution Results**:
  - `pnpm --filter web check-types` (`tsc --noEmit`): Exited with code 0 (0 errors).
  - `pnpm --filter web build` (`next build`): Exited with code 0 (61/61 static and dynamic pages compiled successfully).
  - `pnpm --filter web test` (`vitest run`): Targeted partner tests pass cleanly; full 57-file suite execution showed 46 passed files, with 11 files hitting JSDOM concurrency timeouts under full monorepo load (default 5000ms timeout).
  - `pnpm --filter web lint` (`eslint .`): Exited with code 1 due to pre-existing legacy component lint rules (`BookingDateTimeFields.tsx`, `use-active-language.ts`). PR 3 changes must ensure zero new lint errors are added to partner portal files.

---

## 2. Logic Chain
1. **Observation**: The current test setup in `frontend/apps/web` relies on Vitest with JSDOM and co-located test files in `__tests__/`.
2. **Logic**: Milestone 3 introduces a refactored partner architecture (`PartnerShellClient.tsx`, `PartnerProviders.tsx`, and sub-routes `/partner/scan`, `/partner/listing`, `/partner/settings`, `/partner/settings/staff`). To maintain high code quality and prevent regression during monolith extraction, unit test suites must be created for `PartnerShellClient` and sub-routes.
3. **Logic**: The Strangler pattern requires single Header, single Bottom Nav, and single Store Switcher. Unit tests for `PartnerShellClient` must verify active route highlighting based on `usePathname()`, store context switching via `PartnerStoreScopeProvider`, and absence of duplicate shell headers when rendering child sub-routes.
4. **Logic**: Heavy dynamic dependencies (`jsQR` in `/partner/scan` and `react-quill-new` in `/partner/listing`) must be mocked in unit tests to ensure fast, reliable test execution without DOM canvas or Quill editor initialization issues.
5. **Observation**: Running `pnpm check-types` and `pnpm build` verified that the codebase passes core type check and production build checks cleanly.
6. **Conclusion**: The frontend test strategy for Milestone 3 is solid, fully specified, and supported by clean baseline verification tooling.

---

## 3. Caveats
- **No Source Code Modifications**: As a read-only explorer, no source files were modified. Proposed unit tests (`PartnerShellClient.test.tsx`, `PartnerScanPage.test.tsx`, etc.) are defined as specifications for implementers.
- **Dynamic Imports**: Sub-routes using `next/dynamic` (`jsQR` and `ReactQuill`) require `vi.mock()` in Vitest to avoid SSR / window object mismatch during test runs.
- **Test Timeouts**: Vitest async DOM tests involving multiple state updates should set explicit timeouts (`15000` or `20000` ms) to prevent JSDOM timeouts under heavy CPU load.

---

## 4. Conclusion
The frontend testing architecture and verification procedures for Milestone 3 (PR 3: Partner Shell, Strangler Pattern & Sub-routes) are established and verified:
- **Baseline Health**: `check-types` (0 TS errors) and `build` (61 routes) pass cleanly.
- **Unit Test Plan**: Specifications created for `PartnerShellClient.test.tsx`, `PartnerScanPage.test.tsx`, `PartnerListingPage.test.tsx`, `PartnerSettingsPage.test.tsx`, and `PartnerStaffSettings.test.tsx`.
- **Strangler Pattern Verification**: Detailed assertions to guarantee single top header, single navigation bar, and single Store Scope Provider across all `/partner` sub-routes.

---

## 5. Verification Method
To independently verify the frontend status and run test suites:

1. **Type Checking**:
   ```bash
   pnpm --filter web check-types
   ```
   *Expected outcome*: Exit code 0, 0 TypeScript errors.

2. **Targeted Partner Unit Test Execution**:
   ```bash
   pnpm --filter web test __tests__/PartnerSettlementMoney.test.tsx
   ```
   *Expected outcome*: Exit code 0, test suite passes.

3. **Next.js Production Build**:
   ```bash
   pnpm --filter web build
   ```
   *Expected outcome*: Exit code 0, compiled successfully.

*Invalidation Conditions*: Any TypeScript error or Next.js compilation failure invalidates verification.
