# Milestone 3 (PR 3: Partner Shell, Strangler Pattern & Sub-routes) — Edge Case & Performance Review Report

**Reviewer**: `teamwork_preview_reviewer` (PR3 Edge Case & Performance Reviewer)  
**Date**: 2026-08-05  
**Verdict**: **APPROVE**  

---

## 1. Executive Summary

Milestone 3 extracts the legacy monolithic `app/partner/page.tsx` into a clean, modular architecture based on Next.js App Router patterns, centralized Context Providers (`PartnerProviders`), an outer Shell Frame (`PartnerShellClient`), and lazy code-split sub-routes (`/partner/scan`, `/partner/listing`, `/partner/settings`, `/partner/settings/staff`).

The implementation strictly satisfies all review criteria, enforces project UX/UI rules (no native browser popups/selects), prevents double-shell rendering, and handles edge cases such as offline QR scan queueing and Staff account role restrictions.

---

## 2. Review Criteria Verification & Assessment

### Criterion 1: Strangler Pattern & Double Shell Prevention
- **Implementation**: `app/partner/layout.tsx` (Server Component) wraps child pages in `<PartnerProviders><PartnerShellClient>{children}</PartnerShellClient></PartnerProviders>`. `PartnerShellClient` encapsulates the single desktop sidebar (`aside.partner-sidebar`), single header (`header.partner-header`), single mobile bottom nav (`nav.partner-mobile-bottom-nav`), and `.partner-content` container.
- **Sub-routes**: Sub-routes (`/partner/scan`, `/partner/listing`, `/partner/settings`, `/partner/settings/staff`, and `/partner/page.tsx` active dashboard) render **only** their internal panel content without replicating header/sidebar HTML.
- **Verification**: `PartnerShellClient.test.tsx` explicitly asserts `headers.length === 1` and `sidebars.length === 1` when rendering `PartnerLayout`.
- **Status**: **PASSED**

### Criterion 2: Code-Splitting & Dynamic Imports
- **`jsQR` in `/partner/scan`**:
  - `app/partner/scan/page.tsx` uses `next/dynamic` with `{ ssr: false }` to load `PartnerScanClient`.
  - Inside `PartnerScanClient.tsx`, `jsQR` is loaded on-demand via `await import('jsqr')` during video frame scanning and file upload processing.
- **`ReactQuill` in `/partner/listing`**:
  - `app/partner/listing/page.tsx` uses `next/dynamic` with `{ ssr: false }` to load `PartnerListingClient`.
  - Inside `PartnerListingClient.tsx`, `ReactQuill` is dynamically loaded with `{ ssr: false }` and a custom loading placeholder.
- **Performance Impact**: Eliminates SSR hydration mismatches (`window`/`document` undefined errors) and prevents including heavy libraries in initial bundle payloads.
- **Status**: **PASSED**

### Criterion 3: Sub-route Features & User Rules Compliance
- **`/partner/listing` (Go Live vs Draft Switch)**:
  - State `isViewingLive` toggles between draft data (`draftState`) and live store data (`liveData`).
  - When `isViewingLive === true`: inputs are `disabled={true}`, display opacity is dimmed (`opacity: 0.7`), and "Save Draft" / "Submit Review" buttons are hidden.
  - Form validation utilizes `validateStoreName` and `validateVietnamStorePhone`.
- **`/partner/settings/staff` (Staff Table & Modal Confirm)**:
  - Renders staff list table (DisplayName, Email, Store Name, Permissions, Status, Actions).
  - Store selection uses `ThemedListingSelect` (zero native browser `<select>` tags).
  - Deletion confirmation utilizes `useSystemFeedback().showModal` (zero native `confirm()` or `alert()` calls).
  - Role Guard: Accounts with `currentUser.role === 'STAFF'` are blocked with a 403 Forbidden error message.
- **Project Rule Compliance**:
  - No native browser `alert()`/`confirm()`: **COMPLIANT** (`useSystemFeedback` toast & modal used everywhere).
  - No native browser `<select>`: **COMPLIANT** (`ThemedListingSelect` used for all store pickers).
  - No native date pickers: **COMPLIANT**.
- **Status**: **PASSED**

### Criterion 4: Automated Verification Commands
- **TypeScript Typecheck**:
  - Command: `pnpm check-types` in `frontend/apps/web`
  - Result: **PASSED** (Exit code 0, 0 errors).
- **Unit Test Suite**:
  - Command: `pnpm vitest run PartnerShellClient.test.tsx` in `frontend/apps/web`
  - Result: **PASSED** (5/5 tests passed).

---

## 3. Adversarial Edge Case & Performance Analysis

| Attack / Edge Case Scenario | System Behavior | Mitigation / Quality Assessment | Status |
|-----------------------------|-----------------|--------------------------------|--------|
| **Double Shell Nesting** | Sub-routes rendered inside `PartnerLayout` | Outer shell rendered once in `layout.tsx`. Sub-pages return pure panel contents. | **ROBUST** |
| **SSR Hydration Failure (`jsQR` / `ReactQuill`)** | Client rendering without SSR | Bound to `{ ssr: false }` in dynamic imports; window/DOM references isolated to client execution. | **ROBUST** |
| **Offline Scan Attempt** | Device disconnected from network | `PartnerScanClient` catches `navigator.onLine === false`, stores item in `localStorage` (`nightlife:offline-coupon-scans`), and displays sync notice. | **ROBUST** |
| **Unauthorized Staff Access to Staff Management** | Staff user navigates directly to `/partner/settings/staff` | Renders a styled 403 Forbidden card and blocks staff creation/deletion APIs. | **ROBUST** |
| **Accidental Overwrite of Live Store Data** | User toggles `isViewingLive` and edits fields | Input fields are disabled and read-only when `isViewingLive === true`. Save buttons are hidden. | **ROBUST** |

---

## 4. Integrity Violation Audit

- **Hardcoded test outputs / dummy logic**: None detected. All state providers, custom hooks, and sub-routes integrate with real API clients and React hooks.
- **Bypassed requirements / facade code**: None detected.
- **Rule violations**: Zero browser native popups or native select tags found in modified codebase.

---

## 5. Final Verdict

**APPROVE** — Milestone 3 implementation is robust, complete, fully type-safe, and passes all edge-case and performance criteria.
