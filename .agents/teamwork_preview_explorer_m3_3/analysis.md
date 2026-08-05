# Milestone 3 Frontend Verification & Testing Strategy Analysis

## Executive Summary
This analysis details the frontend testing architecture, unit test requirements, and verification pipeline for Milestone 3 (PR 3: Partner Shell, Strangler Pattern & Sub-routes).
Existing tests in `frontend/apps/web/__tests__/` utilize Vitest, React Testing Library, and JSDOM. The verification commands (`check-types` and `build`) pass cleanly (0 type errors, 61 static/dynamic pages compiled). For test execution (`vitest`), target unit tests pass when run individually; when executing the entire suite across 57 files concurrently, 11 test files encounter JSDOM timeout/concurrency limits. `pnpm lint` identifies pre-existing ESLint rule violations in legacy codebase components; PR 3 implementers must ensure zero *new* lint errors are introduced in the partner portal sub-routes.

---

## 1. Existing Frontend Test Setup Analysis (`frontend/apps/web/__tests__/`)

### Framework & Execution Engine
- **Test Runner**: Vitest `v4.1.9` with `@vitejs/plugin-react` (`v6.0.3`).
- **DOM Environment**: JSDOM (`v29.1.1`).
- **Configuration File**: `frontend/apps/web/vitest.config.ts`.
  - `globals: true` (enables implicit imports for `describe`, `it`, `expect`, `vi`).
  - Path alias: `@` mapped to `src/`.
  - Excluded paths: `node_modules`, `.next`, `.next.bak-*`, `e2e/**`, `playwright-report/**`, `test-results/**`.
- **Global Setup (`frontend/apps/web/vitest.setup.ts`)**:
  - Extends `expect` with `@testing-library/jest-dom/vitest`.
  - Mocks `next/image` to standard HTML `<img>`.
  - Mocks `next/link` to standard HTML `<a>`.
  - Polyfills `window.localStorage` and `window.sessionStorage` in JSDOM memory.

### Existing Partner Test Patterns & Utilities
- **Navigation Mocking**:
  ```tsx
  vi.mock("next/navigation", () => ({
    useSearchParams: () => new URLSearchParams(mocks.searchParams),
    usePathname: () => "/partner",
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  }));
  ```
- **Auth Session Mocking**:
  ```tsx
  vi.mock("@/lib/auth/session", () => ({
    clearAuthSession: vi.fn(),
    getAuthUser: () => ({ role: "PARTNER", displayName: "Partner Demo" }),
  }));
  ```
- **API Client & API Mocking**:
  ```tsx
  vi.mock("@/lib/api/client", () => ({
    apiClient: mocks.apiClient,
    ApiError: class ApiError extends Error { ... },
    getAuthToken: vi.fn(() => "mock-token"),
  }));
  ```
- **Heavy Dynamic Component Mocking**:
  - `react-quill-new` mocked to simple `<div>` container in `PartnerBillSubmitPage.test.tsx` & `PartnerSettlementMoney.test.tsx`.
- **Provider Wrapper**:
  - `<SystemFeedbackProvider>` used in component rendering tests.

### Current Suite Inventory
- **Total Test Files**: 57 files across web app (48 in `__tests__/`)
- **Total Test Cases**: 275 unit tests
- **Key Existing Partner Test Files**:
  1. `PartnerSettlementMoney.test.tsx`: Validates `discountVnd === null` rendering fallback (*"Giảm giá: Chưa xác định"*) and verifies total is never formatted as negative discount.
  2. `PartnerLiteDashboard.test.tsx`: Validates aggregate metric rendering for `/partner/dashboard-lite` without fetching detailed customer info.
  3. `PartnerBillSubmitPage.test.tsx`: Validates partner bill submission, store scope selection, and draft vs live listing description toggle.
  4. `PartnerOfflineScanQueue.test.tsx`: Validates offline queueing of signed QR tokens and replay upon re-establishing connection.

---

## 2. Unit Testing Strategy for PR 3 Components

Milestone 3 introduces `PartnerShellClient.tsx`, `PartnerProviders.tsx` (`PartnerStoreScopeProvider`), `app/partner/layout.tsx`, and modular sub-routes (`/partner/scan`, `/partner/listing`, `/partner/settings`, `/partner/settings/staff`).

### A. New Test Suite: `PartnerShellClient.test.tsx`
Location: `frontend/apps/web/__tests__/PartnerShellClient.test.tsx`

#### Test Requirements & Scenarios:
1. **Header & Navigation Rendering**:
   - Verify top header renders logo, user profile, store scope indicator, and store switcher (`ThemedListingSelect` / custom dropdown).
   - Verify desktop navigation bar and mobile bottom navigation render navigation items:
     - Home (`/partner`)
     - Quét QR (`/partner/scan`)
     - Listing (`/partner/listing`)
     - Cài đặt (`/partner/settings`)
     - Hoạt động (`/partner/activity`)
2. **Active Tab Highlighting**:
   - Mock `usePathname()` returning `/partner`, `/partner/scan`, `/partner/settings`.
   - Assert corresponding nav link has active visual state (`text-amber-400`, `bg-zinc-800/80` or active border class).
   - Assert sub-route `/partner/settings/staff` keeps `/partner/settings` parent active or highlights sub-navigation.
3. **Strangler Pattern / Single Shell Enforcement**:
   - Render dummy child route inside `<PartnerShellClient>`.
   - Assert `screen.getAllByRole('header')` or `<header>` count is exactly 1.
   - Assert sub-route does NOT mount duplicate top header, bottom nav, or store switcher.
4. **Store Scope Context & Propagation (`PartnerStoreScopeProvider`)**:
   - Mock API endpoint `GET /partner/stores` returning 2 stores (`Neon Club`, `Velvet Club`).
   - Verify initial selection defaults to first store (`Neon Club`).
   - Fire change event on Store Switcher select. Assert `selectedStoreId` updates in context and triggers subscriber component updates.
   - Test single-store vs multi-store state display ("2 quán trong scope").

### B. Sub-route Unit Test Suites
1. **`PartnerScanPage.test.tsx`** (`frontend/apps/web/__tests__/PartnerScanPage.test.tsx`):
   - Mock dynamic `jsQR` import (`next/dynamic`).
   - Test camera toggle / canvas scanner mounting.
   - Test handling coupon QR vs booking QR payloads.
   - Test offline queue trigger when `navigator.onLine === false`.
2. **`PartnerListingPage.test.tsx`** (`frontend/apps/web/__tests__/PartnerListingPage.test.tsx`):
   - Mock dynamic `react-quill-new` editor.
   - Test `isViewingLive` toggle state:
     - When `isViewingLive === false`: draft content in editor, inputs enabled, save/submit buttons active.
     - When `isViewingLive === true`: live content displayed in readonly container, inputs disabled, save/submit buttons hidden.
3. **`PartnerSettingsPage.test.tsx` & `PartnerStaffSettings.test.tsx`**:
   - Test password change form validation (min 8 chars, password match) and API submission (`POST /users/change-password`).
   - Test staff list table rendering (`GET /partner/staff`).
   - Test staff creation form with store dropdown (`ThemedListingSelect`).
   - Test staff deletion confirmation modal using `useSystemFeedback` hook.

---

## 3. Verification Procedures & Pipelines

Verification commands executed in `frontend/apps/web/`:

```bash
# 1. Type Check
pnpm --filter web check-types
# Executes: tsc --noEmit
# Status: PASSED (Exit code 0, 0 TypeScript errors).

# 2. Production Build
pnpm --filter web build
# Executes: next build
# Status: PASSED (Compiled successfully, 61 static/dynamic routes generated cleanly).

# 3. Targeted Unit Tests
pnpm --filter web test __tests__/PartnerSettlementMoney.test.tsx
# Executes: vitest run for targeted suite
# Status: PASSED

# 4. Monorepo Full Test & Lint Notes
# - Full vitest run across 57 files: 46 passed, 11 files encountered JSDOM concurrency timeouts (e.g. 5000ms default timeout). Recommended execution with --testTimeout=15000 or targeted path patterns.
# - Full eslint run: Pre-existing rules in legacy files outside /partner. PR 3 scope requirement: introduce zero new lint issues.
```

---

## 4. Recommendations for Implementers
1. When refactoring `partner/page.tsx` into sub-routes, export `PartnerStoreScopeProvider` from `PartnerProviders.tsx` so all sub-routes can consume `usePartnerStoreScope()`.
2. Co-locate new unit tests in `frontend/apps/web/__tests__/` following established naming conventions (`PartnerShellClient.test.tsx`, `PartnerScanPage.test.tsx`, etc.).
3. Set test timeouts explicitly (e.g., `15000ms` or `20000ms`) on async DOM waitFor tests in Vitest to prevent JSDOM timeout under heavy CPU load.
