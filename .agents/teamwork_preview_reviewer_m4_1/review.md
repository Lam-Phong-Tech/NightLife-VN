# Milestone 4 Precision Code Review Report

**Reviewer**: `teamwork_preview_reviewer` (PR4 Precision Reviewer)  
**Date**: 2026-08-05  
**Target Milestone**: Milestone 4 — Activity Core, New Bill Route & Safe Legacy Redirects  
**Verdict**: **APPROVE**  

---

## 1. Executive Summary

A comprehensive, precision code review and adversarial challenge was performed on the Milestone 4 work product delivered by `teamwork_preview_worker_m4_1`. 

All core criteria have been rigorously evaluated:
- Typed API client helpers and cancellation support in `partner-portal.ts`
- Cursor-based state machine and scope synchronization in `usePartnerActivity.ts`
- Activity feed UI, status badges, filters, and pagination in `/partner/activity/page.tsx`
- Standalone bill creation flow in `/partner/activity/new-bill/page.tsx`
- Activity detail view in `/partner/activity/[activityId]/page.tsx`
- Legacy route redirects in `/partner/gui-hoa-don/page.tsx` and `/partner/page.tsx`
- Strict compliance with user rules (No native `<select>`, No native `alert/confirm`, No native datepicker)
- Verification via `pnpm check-types` (0 errors) and `pnpm test` (15/15 passing tests)

---

## 2. Detailed Criteria Review

### Criterion 1: API Client (`frontend/apps/web/src/lib/api/partner-portal.ts`)
- **Status**: **PASS**
- **Interface Definitions**:
  - `PartnerActivityType`: `"ALL" | "COUPON_USAGE" | "BILL_PAYMENT" | "BOOKING_CHECKIN"`
  - `PartnerActivityQueryParams`: Properly models `limit`, `cursor`, `type`, `startDate`, `endDate`, `search`, `storeId`.
  - `PartnerActivityItem`: Full domain entity typed with store, customer, status, amounts, snapshots, and linked entity details.
  - `PartnerActivityResponse` & `PartnerHomeOverview`: Correctly structured response payloads.
- **Endpoints & Cancellation**:
  - `fetchPartnerHome(storeId?, signal?)`
  - `fetchPartnerActivities(params?, signal?)`
  - `fetchPartnerActivityDetail(activityId, storeId?, signal?)`
  - `partnerPortalApi` bundle object exported for mockability in tests.
  - Passes `AbortSignal` directly down to `apiClient<T>()`.

### Criterion 2: Custom React Hook (`frontend/apps/web/src/hooks/usePartnerActivity.ts`)
- **Status**: **PASS**
- **State Machine & Cursor Pagination**:
  - Manages `items`, `data`, `nextCursor`, `hasMore`, `loading`, `loadingMore`, `error`.
  - Exposes `fetchNextPage()`, `refresh()`, `refetch()`, `setType()`, `setStartDate()`, `setEndDate()`, `setSearch()`, `setFilters()`.
  - Appends unique items during `fetchNextPage()` using `Set` ID deduplication to prevent duplicate key keying errors in React lists.
- **Store Scope Sync & Resilience**:
  - Safely extracts `selectedStoreId` from `usePartnerStoreScope()` inside a try-catch block, ensuring unit tests can run outside `PartnerStoreScopeProvider` without throwing context errors.
- **Race Condition & Cancellation Control**:
  - Uses `abortControllerRef` to abort pending requests on filter/store change.
  - Uses `requestIdRef` sequence tracking to ignore out-of-order responses from stale network requests.

### Criterion 3: Activity Feed Page (`frontend/apps/web/src/app/partner/activity/page.tsx`)
- **Status**: **PASS**
- **UI Components & Filter Bar**:
  - Tab filters (`ALL`, `BILL_PAYMENT`, `COUPON_USAGE`, `BOOKING_CHECKIN`) with active gold highlights.
  - Controlled search input with icon prefix.
  - Antd `RangePicker` wrapped inside `ConfigProvider` styled to match the dark luxury gold theme.
- **Card Rendering & Status Pills**:
  - Renders customer tier, formatted dates, gross amounts, and discount amounts.
  - Renders status pills with appropriate color tones (`success`, `warning`, `danger`, `info`).
  - Renders "Tải thêm" pagination button disabled during `loadingMoreState`.

### Criterion 4: User Rules Compliance
- **Status**: **PASS**
- **No Native Browser `<Select>`**:
  - Evaluated `/partner/activity/new-bill/page.tsx` — uses `ThemedListingSelect` for both Store select and Booking select.
- **No Native Browser `alert() / confirm() / prompt()`**:
  - Uses `useSystemFeedback()` (`feedback.showToast()`) for all system messages, validation errors, OCR notifications, and clipboard feedback.
- **No Native Browser Datepickers**:
  - Uses Antd `DatePicker` and `RangePicker` wrapped in Antd `ConfigProvider`.

### Criterion 5: Automated Verification
- **Status**: **PASS**
- **TypeScript Compilation**:
  - Command: `pnpm check-types` in `frontend/apps/web`
  - Output: Exit code 0 (zero errors).
- **Vitest Unit Test Suites**:
  - Command: `pnpm test __tests__/usePartnerActivity.test.tsx __tests__/PartnerActivityPage.test.tsx __tests__/PartnerNewBillPage.test.tsx __tests__/PartnerBillSubmitPage.test.tsx`
  - Output: 4 test files passed, 15 unit tests passed (0 failures).

---

## 3. Adversarial Analysis & Integrity Verification

- **Integrity Check**:
  - Code was inspected for hardcoded outputs, fake mocks, or facade stubs. All API helpers perform actual HTTP calls via `apiClient`, and tests verify actual hook states and DOM updates.
- **Edge Cases Tested**:
  - *Out-of-order network responses*: Verified that `requestIdRef` prevents race conditions.
  - *Unmount during fetch*: Verified `AbortController` terminates in-flight request.
  - *Empty/Null responses*: Verified `data || items || []` fallback handling.
  - *Special characters in Activity ID*: Verified `encodeURIComponent(activityId)` usage.

---

## 4. Final Review Verdict

**APPROVE** — Milestone 4 implementation is robust, fully compliant with project standards and user rules, thoroughly tested, and ready for commit & push.
