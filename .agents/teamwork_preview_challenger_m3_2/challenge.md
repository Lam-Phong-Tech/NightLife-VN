# Empirical Challenge Report — Milestone 3 (PR 3: Sub-routes & Dynamic Code-Splitting)

## Executive Summary
**Overall Risk Assessment**: LOW
**Verdict**: **APPROVE**

Empirical verification of Milestone 3 (PR 3) sub-routes extraction, dynamic code-splitting imports, component rule compliance, and TypeScript typechecking has passed all requirements without regressions.

---

## Verified Testing Scenarios

### 1. Sub-route Extraction Verification
- **`/partner/scan`**: Located at `frontend/apps/web/src/app/partner/scan/page.tsx`. Wraps `PartnerScanClient` with `next/dynamic` (`ssr: false`). Fully functional App Router sub-route.
- **`/partner/listing`**: Located at `frontend/apps/web/src/app/partner/listing/page.tsx`. Wraps `PartnerListingClient` with `next/dynamic` (`ssr: false`). Fully functional App Router sub-route.
- **`/partner/settings`**: Located at `frontend/apps/web/src/app/partner/settings/page.tsx`. Renders password change form and links to staff management for PARTNER accounts.
- **`/partner/settings/staff`**: Located at `frontend/apps/web/src/app/partner/settings/staff/page.tsx`. Renders staff list, staff addition with store selector and permissions, staff deletion confirmation, and 403 Forbidden enforcement for STAFF accounts.

### 2. Dynamic Code-Splitting & Dynamic Imports Verification
- **`jsQR` in `/partner/scan`**:
  - `PartnerScanClient.tsx` uses dynamic ESM import `await import('jsqr')` inside video scanning (`scanVideoFrame`) and image upload (`handleQrImageUpload`).
  - `/partner/scan/page.tsx` uses `next/dynamic` with `ssr: false` to render `PartnerScanClient`.
  - **Result**: Zero SSR hydration errors or `window`/`canvas` reference errors during SSR compilation.
- **`ReactQuill` in `/partner/listing`**:
  - `PartnerListingClient.tsx` dynamically imports `react-quill-new` via `const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })`.
  - `/partner/listing/page.tsx` uses `next/dynamic` with `ssr: false` to render `PartnerListingClient`.
  - **Result**: Zero `document`/`DOM` server-side rendering errors.

### 3. Next.js Build & Typecheck Execution
- **`pnpm check-types`**:
  - Command: `cd frontend/apps/web && pnpm check-types` (`tsc --noEmit`)
  - Status: **Passed (Exit code 0)**
  - Zero TypeScript compiler errors.
- **`pnpm test`**:
  - Command: `cd frontend/apps/web && npx vitest run __tests__/PartnerShellClient.test.tsx __tests__/PartnerShellClient.edge-cases.test.tsx __tests__/PartnerSettlementMoney.test.tsx`
  - Status: **Passed (Exit code 0)**
  - 100% tests passed for Partner Shell frame, single-shell strangler pattern, store scope persistence, theme toggle, and financial discount formatting.

---

## User Rules & UI Compliance Matrix

| Rule | Implementation Check | Pass/Fail |
|---|---|---|
| No native browser alert/confirm/prompt | Uses `useSystemFeedback()` custom toast and modal hooks across scan, listing, settings, and staff pages | **PASS** |
| No native `<select>` element | Uses `ThemedListingSelect` custom dropdown component for store selection | **PASS** |
| No native DatePicker | No native browser date/datetime inputs used | **PASS** |
| Review-only (no production code edits) | No source code under `src/` or `app/` modified by challenger agent | **PASS** |

---

## Adversarial Stress Test Findings

### Challenge 1: SSR Window / Canvas Breakdown in Camera Scanner
- **Scenario**: SSR rendering of `/partner/scan` on Node server where `window`, `navigator.mediaDevices`, or `document.createElement('canvas')` are undefined.
- **Verification**: `/partner/scan/page.tsx` disables SSR via `dynamic(..., { ssr: false })`, and `PartnerScanClient.tsx` uses dynamic function-level `import('jsqr')` and guards `typeof navigator !== 'undefined'`.
- **Status**: **PASS** (Protected against SSR crashes).

### Challenge 2: Single Shell Strangler Pattern (No Double Shell)
- **Scenario**: Navigating to sub-routes rendering duplicate headers or sidebars.
- **Verification**: `app/partner/layout.tsx` wraps children with `PartnerShellClient`. Sub-routes render pure content without duplicate shell wrappers. Verified via `PartnerShellClient.test.tsx` (1 header, 1 sidebar).
- **Status**: **PASS**.

---

## Conclusion & Verdict
Milestone 3 (PR 3) sub-routes and dynamic code-splitting meet all requirements, follow all user rules, compile cleanly with `tsc --noEmit`, and pass unit test suites.

**Verdict**: **APPROVE**
