# Adversarial Challenge Report — Milestone 4 (PR 4: New Bill & Redirects)

## Challenge Summary

- **Target Subsystem**: Partner Portal Activity New Bill Sub-route (`/partner/activity/new-bill`), Activity Detail (`/partner/activity/[activityId]`), and Safe Legacy Redirects (`/partner/gui-hoa-don`, `?panel=bill`, `?panel=activity`).
- **Overall Risk Assessment**: LOW
- **Empirical Test Verdict**: PASSED (6/6 unit tests passed, typecheck 0 errors)
- **Final Verdict**: APPROVE

---

## Empirical Verification Results

### 1. RTL / Vitest Unit Testing
- **Command Executed**: `pnpm vitest run PartnerNewBillPage.test.tsx PartnerBillSubmitPage.test.tsx` inside `frontend/apps/web`.
- **Results**:
  - `PartnerBillSubmitPage.test.tsx`: 3 passed out of 3.
    - Legacy `/partner/gui-hoa-don` route redirects to `/partner/activity/new-bill`.
    - Partner page with `?panel=bill` replaces route with `/partner/activity/new-bill`.
    - Partner page with `?panel=activity` replaces route with `/partner/activity`.
  - `PartnerNewBillPage.test.tsx`: 3 passed out of 3.
    - Formats amount input with thousands separators (e.g., `2.000.000` VNĐ).
    - Triggers OCR scan preview (`billApi.previewBillOcr`) and populates form fields.
    - Submits form (`billApi.submitPartnerBill`), uploads evidence (`billApi.uploadEvidence`), and redirects to activity feed.
- **Pass Rate**: 100% (6/6 tests passed).

### 2. Frontend Typecheck
- **Command Executed**: `pnpm check-types` inside `frontend/apps/web`.
- **Result**: `tsc --noEmit` completed with exit code 0. Zero TypeScript errors found.

### 3. Component & UX Compliance
- **ThemedListingSelect**:
  - Utilized for Store selection (`Quán thuộc partner *`) and Linked Booking selection (`Liên kết booking (nếu có)`).
  - Browser native `<select>` element is strictly NOT used.
- **useSystemFeedback**:
  - Utilized for all notification toasts and error feedback (e.g. OCR extraction success, empty store error, invalid total amount error, upload warning, success toast).
  - Browser native `alert()`, `confirm()`, or `prompt()` are strictly NOT used.
- **Antd DatePicker**:
  - Utilized for `Thời gian sử dụng *` with `ConfigProvider` viVN locale and custom dark gold theme tokens.
  - Browser native date/time pickers are strictly NOT used.
- **Amount Formatting & OCR Pre-fill**:
  - Dynamic thousand separators in VND formatted input.
  - OCR extraction populates total amount and parsed date seamlessly upon image/PDF upload.

---

## Stress Test Scenarios & Failure Mode Analysis

| Scenario / Attack Vector | Expected Behavior | Actual Behavior | Pass / Fail |
|---|---|---|---|
| **Empty or zero bill amount submission** | Block submit and display feedback error toast | Form validates `parsedAmount > 0` and presents error toast via `useSystemFeedback` | PASS |
| **Missing store selection on submit** | Block submit and display feedback error toast | Form validates `storeId` and presents error toast via `useSystemFeedback` | PASS |
| **Media evidence upload failure** | Gracefully notify user without breaking bill creation | Catches upload failure, displays warning toast that bill is created, and redirects cleanly | PASS |
| **Legacy URL `/partner/gui-hoa-don` access** | Redirect to `/partner/activity/new-bill` | Next.js server-side `redirect('/partner/activity/new-bill')` invoked | PASS |
| **Legacy URL `?panel=bill` query parameter** | Redirect to `/partner/activity/new-bill` | Client-side `router.replace('/partner/activity/new-bill')` invoked | PASS |
| **Legacy URL `?panel=activity` query parameter** | Redirect to `/partner/activity` | Client-side `router.replace('/partner/activity')` invoked | PASS |
| **Browser Native Controls Rule Check** | Zero use of native `<select>`, native datepicker, or `alert()` | All controls replaced with `ThemedListingSelect`, Antd `DatePicker`, and `useSystemFeedback` | PASS |

---

## Unchallenged / Out of Scope Areas

- Real backend server file handling for uploaded media (verified via API mock contracts in unit testing).
