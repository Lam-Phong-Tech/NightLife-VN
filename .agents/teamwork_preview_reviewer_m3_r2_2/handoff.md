# Handoff Report — Reviewer 2 (Edge Case, Performance & Compliance Re-Review)

## 1. Observation

### Command Verification Results
1. `cd frontend/apps/web && pnpm check-types`
   - Result: Exit code 0, 0 TypeScript errors.
2. `cd frontend/apps/web && pnpm test -- PartnerShellClient.test.tsx`
   - Result: 5/5 tests passed in 23.43s.
3. `cd frontend/apps/web && pnpm test -- PartnerShellClient.edge-cases.test.tsx`
   - Result: 6/6 tests passed in 22.54s. Total test count across both suites: 11/11 passed.

### Focus Area 1: Strangler Pattern & Double Shell Prevention
- `frontend/apps/web/src/app/partner/layout.tsx`: `PartnerLayout` wraps `{children}` inside `<PartnerProviders>` and `<PartnerShellClient>`.
- `frontend/apps/web/src/app/partner/PartnerShellClient.tsx`: Renders the single outer `<main className="partner-main">` containing `<aside className="partner-sidebar">` and `<header className="partner-header">`.
- Sub-routes inspected:
  - `src/app/partner/scan/page.tsx`
  - `src/app/partner/listing/page.tsx`
  - `src/app/partner/settings/page.tsx`
  - `src/app/partner/settings/staff/page.tsx`
  - `src/app/partner/gui-hoa-don/page.tsx`
- None of the sub-routes import or duplicate `PartnerShellClient` or render secondary shells.

### Focus Area 2: SSR & Hydration Safety
- `frontend/apps/web/src/app/partner/scan/page.tsx` dynamically imports `PartnerScanClient` with `{ ssr: false }`.
- `frontend/apps/web/src/app/partner/scan/PartnerScanClient.tsx` imports `jsQR` via dynamic `await import('jsqr')` inside client event handlers (`readQrFromVideoFrame` line 151, `readQrFromImageFile` line 228).
- `frontend/apps/web/src/app/partner/listing/page.tsx` dynamically imports `PartnerListingClient` with `{ ssr: false }`.
- `frontend/apps/web/src/app/partner/listing/PartnerListingClient.tsx` dynamically imports `ReactQuill` via `dynamic(() => import('react-quill-new'), { ssr: false })`.

### Focus Area 3: User Rules & UI Compliance
- Native Alert/Confirm/Prompt: 0 occurrences in `src/app/partner`. All user notifications and dialogs use `useSystemFeedback()` (toast & modal).
- Native Select (`<select>`): 0 occurrences in `src/app/partner`. All store pickers and dropdowns use `ThemedListingSelect`.
- Native Date Picker (`<input type="date">` / `type="datetime-local"`):
  - **FOUND IN**: `frontend/apps/web/src/app/partner/page.tsx`
    - Line 6568: `<input value={settlementFilters.fromDate} onChange={(event) => updateSettlementFilter('fromDate', event.target.value)} type="date" style={inputStyle} />`
    - Line 6576: `<input value={settlementFilters.toDate} onChange={(event) => updateSettlementFilter('toDate', event.target.value)} type="date" style={inputStyle} />`
  - Violation of project rule in `.agents/AGENTS.md`: *"Tuyệt đối không sử dụng thư viện DatePicker/DateTimePicker mặc định của trình duyệt (còn gọi là native browser date picker), hãy sử dụng custom date-picker component tự dựng của dự án."*

### Focus Area 4: Legacy Key Fallback
- `frontend/apps/web/src/app/partner/PartnerProviders.tsx` (Lines 220–223):
  ```typescript
  storedId =
    window.sessionStorage.getItem('vy-partner-selected-store-id') ||
    window.sessionStorage.getItem('partner_active_store_id');
  ```
- Correctly checks `vy-partner-selected-store-id` with fallback to `partner_active_store_id`.

---

## 2. Logic Chain

1. Executed `pnpm check-types` and both Vitest test suites (`PartnerShellClient.test.tsx`, `PartnerShellClient.edge-cases.test.tsx`). All 11 tests passed with 0 compilation errors.
2. Verified Strangler Pattern implementation in `PartnerShellClient.tsx` and all child sub-routes (`/partner/scan`, `/partner/listing`, `/partner/settings`, `/partner/settings/staff`, `/partner/gui-hoa-don`). Sub-routes strictly render page-specific client content inside `{children}` without duplicating shell header/sidebar markup.
3. Verified SSR and hydration safety for `jsQR` and `ReactQuill`. Both libraries are completely isolated from SSR using `next/dynamic` with `ssr: false` and dynamic `await import('jsqr')` calls inside client event listeners, avoiding DOM/canvas SSR errors.
4. Conducted code search for User Rule compliance across `src/app/partner/`:
   - `alert()`, `confirm()`, `prompt()` -> 0 matches.
   - `<select>` -> 0 matches.
   - Native Date Pickers -> Discovered 2 visible instances of `<input type="date">` in `frontend/apps/web/src/app/partner/page.tsx` at lines 6568 and 6576.
5. The presence of native `<input type="date">` elements violates the strict project rule forbidding native browser date pickers.
6. Therefore, while Strangler Pattern, SSR safety, type-checking, and test suites are all fully compliant, the work cannot be approved until native date pickers in `src/app/partner/page.tsx` are replaced with project-approved custom date pickers.

---

## 3. Caveats

No caveats. All findings are verified by static code analysis, automated type checking, and unit test execution.

---

## 4. Conclusion

**Verdict**: `REQUEST_CHANGES`

### Findings Table

| Severity | Category | Location | Issue Summary | Recommendation |
|---|---|---|---|---|
| **Major / Rule Violation** | UI Compliance | `frontend/apps/web/src/app/partner/page.tsx:6568,6576` | Native browser date pickers (`<input type="date">`) used for settlement filters "Từ ngày" and "Đến ngày". Violates project-scoped rule in `.agents/AGENTS.md`. | Replace native `<input type="date">` with custom project date picker component (e.g. Ant Design DatePicker wrapper or custom styled date picker). |

---

## 5. Verification Method

To independently verify this review assessment:

1. **Run TypeScript Check**:
   ```bash
   cd frontend/apps/web && pnpm check-types
   ```
   *Expected result*: Exit code 0, 0 errors.

2. **Run Partner Shell Unit & Edge Case Tests**:
   ```bash
   cd frontend/apps/web && pnpm test -- PartnerShellClient.test.tsx
   cd frontend/apps/web && pnpm test -- PartnerShellClient.edge-cases.test.tsx
   ```
   *Expected result*: 11/11 tests pass.

3. **Inspect Native Date Inputs**:
   Inspect lines 6568 and 6576 of `frontend/apps/web/src/app/partner/page.tsx`.
   *Expected finding*: Confirmation of `type="date"` on `<input>` elements.
