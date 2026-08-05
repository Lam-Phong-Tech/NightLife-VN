# Review Report — Milestone 4 (PR 4: Activity Core, New Bill Route & Safe Legacy Redirects)

## Review Summary

**Verdict**: APPROVE

The implementation of Milestone 4 (PR 4) delivers a modular, decoupled Activity Core architecture with standalone sub-routes (`/partner/activity`, `/partner/activity/new-bill`, `/partner/activity/[activityId]`), safe legacy redirects (`/partner/gui-hoa-don` -> `/partner/activity/new-bill`, `?panel=bill` -> `/partner/activity/new-bill`, `?panel=activity` -> `/partner/activity`), and robust API client/hook implementations (`partner-portal.ts`, `usePartnerActivity.ts`). All user rules regarding UI components (no native `<select>`, no native date picker, no native `alert`/`confirm`) are strictly respected. Type check (`pnpm check-types`) passes with 0 errors and all 15 M4 unit tests pass cleanly.

---

## Detailed Evaluation by Review Criteria

### 1. New Bill Sub-route (`/partner/activity/new-bill`)
- **Monolith Extraction**: Extracted bill submission form into a clean, standalone Next.js App Router client page.
- **Dropdown Compliance**: Uses `ThemedListingSelect` for both Partner Store selection and Linked Booking selection. Zero native `<select>` elements used.
- **Date Picker Compliance**: Uses Antd `DatePicker` (with custom theme `partnerPickerTheme`). Zero native date picker inputs (`<input type="date">`) used.
- **Feedback & Notifications**: Uses `useSystemFeedback` toast notifications (`showToast`) for form errors, OCR completion, and submission success/warning. Zero browser native `alert()` or `confirm()` calls.
- **Currency & Formatting**: Real-time non-digit stripping, thousands grouping via `toLocaleString('vi-VN')`, and explicit `VNĐ` suffix label.
- **OCR Pre-fill**: Triggers `billApi.previewBillOcr` upon file selection, auto-populating `rawAmount` and `usedAt` dayjs date when available.

### 2. Activity Detail Sub-route (`/partner/activity/[activityId]`)
- **Data Fetching**: Calls `GET /partner/activity/:activityId` via `fetchPartnerActivityDetail(activityId, selectedStoreId, signal)` with full `AbortController` signal support.
- **Data Rendering**: Displays store information, customer name/phone, member tier, status pill, financial breakdown (gross total, discount VND with `null` fallback as "Chưa xác định", coupon code, bill number, booking code).
- **Share & Rejection Action**: Includes link copying to clipboard with toast feedback and a rejection banner with direct resubmission link (`/partner/activity/new-bill`) when status is `REJECTED`.

### 3. Safe Legacy Redirects
- Server-side redirect in `frontend/apps/web/src/app/partner/gui-hoa-don/page.tsx` redirecting to `/partner/activity/new-bill`.
- Client-side redirect in `frontend/apps/web/src/app/partner/page.tsx` (`useEffect`) handling legacy `?panel=bill` -> `/partner/activity/new-bill` and `?panel=activity` -> `/partner/activity`.

### 4. Verification & Testing
- `pnpm check-types` in `frontend/apps/web` executed with exit code 0.
- `pnpm test` for M4 test suite (`usePartnerActivity.test.tsx`, `PartnerActivityPage.test.tsx`, `PartnerNewBillPage.test.tsx`, `PartnerBillSubmitPage.test.tsx`) passed 15/15 unit tests.

---

## Findings

### [Minor] Finding 1: Blob Object URL Memory Cleanup
- **Where**: `frontend/apps/web/src/app/partner/activity/new-bill/page.tsx` (lines 113–117)
- **Why**: `URL.createObjectURL(file)` is called without invoking `URL.revokeObjectURL(oldUrl)` when user selects a new file or when component unmounts.
- **Suggestion**: Add a cleanup `useEffect` or revoke previous blob URL before creating a new one to optimize memory usage during repeated file selection.

---

## Verified Claims

- `pnpm check-types` in `frontend/apps/web` → verified via command execution → **PASS (0 errors)**
- `pnpm test` (M4 suite) in `frontend/apps/web` → verified via `run_command` → **PASS (15/15 tests)**
- User Rules Compliance (no native `<select>`, datepicker, alert/confirm) → verified via code inspection → **PASS**

---

## Stress Test & Adversarial Challenge Results

| Scenario | Attack Vector / Edge Case | Result | Assessment |
|---|---|---|---|
| **Rapid Filter Switching** | User toggles tabs ('ALL', 'BILL_PAYMENT', 'COUPON_USAGE') rapidly | **PASS** | Pending in-flight requests are cancelled via `AbortController` and out-of-order responses discarded via `requestIdRef`. |
| **Duplicate Cursor Items** | Backend returns duplicate activity IDs across paginated requests | **PASS** | `usePartnerActivity.ts` filters out existing IDs using a `Set` before updating state. |
| **Financial Null Discount** | `discountVnd` is `null` | **PASS** | Correctly displays *"Giảm giá: Chưa xác định"* without showing negative amounts or NaN. |
| **Missing Store Scope** | `usePartnerActivity` executed outside `PartnerStoreScopeProvider` | **PASS** | Exception caught gracefully in `try-catch` fallback to empty string store ID. |

---

## Coverage Gaps

- None. All requirements, routes, custom hooks, client APIs, and legacy redirects specified in M4 were fully reviewed and verified.
