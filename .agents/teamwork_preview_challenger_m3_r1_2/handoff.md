# Handoff Report — Challenger 2 (Sub-routes & Dynamic Code-Splitting Challenger)

**Verdict**: `APPROVE`

---

## 1. Observation
- **Dynamic Imports & SSR Safety (`jsQR` & `ReactQuill`)**:
  - `/partner/scan/page.tsx` dynamically imports `PartnerScanClient` with `{ ssr: false }`. In `PartnerScanClient.tsx`, `jsQR` is dynamically loaded via `await import('jsqr')` inside camera scanning (`scanVideoFrame`) and image upload (`handleQrImageUpload`) event handlers. All `window`/`localStorage` accesses are safely guarded (`typeof window !== 'undefined'`).
  - `/partner/listing/page.tsx` dynamically imports `PartnerListingClient` with `{ ssr: false }`. In `PartnerListingClient.tsx`, `ReactQuill` is dynamically imported via `dynamic(() => import('react-quill-new'), { ssr: false })`.
  - Next.js production compilation (`pnpm build`) compiled all routes cleanly without any window/document reference or SSR hydration errors.

- **Staff Sub-route (`/partner/settings/staff`)**:
  - Store selector dropdown uses the project's custom `ThemedListingSelect` component (`src/components/ui/ThemedListingSelect.tsx`). No native HTML `<select>` elements are used anywhere in the sub-route.
  - Staff deletion confirmation uses `useSystemFeedback().showModal(...)`. No native browser `alert()` or `confirm()` functions are called.
  - Staff role protection is enforced: accessing `/partner/settings/staff` with a `STAFF` role user renders a 403 Forbidden alert container.

- **Listing Sub-route & Live vs Draft Toggle (`/partner/listing`)**:
  - Manages `isViewingLive` state toggle (boolean, default `false`).
  - Contains toggle switch buttons for `[Bản chỉnh sửa]` (`isViewingLive === false`) and `[Bản đang Go Live]` (`isViewingLive === true`).
  - When `isViewingLive === true`: form input fields are disabled (`disabled={isViewingLive || isStaffAccount}`), description is rendered via read-only HTML block (`dangerouslySetInnerHTML`), and action buttons ("Lưu bản nháp", "Gửi duyệt lên Admin") are hidden.
  - When `isViewingLive === false`: input fields and `ReactQuill` rich text editor are editable, and "Lưu bản nháp" and "Gửi duyệt lên Admin" actions are accessible.

- **TypeScript Verification**:
  - Executed `cd frontend/apps/web && pnpm check-types`.
  - Output: `web@0.0.0 check-types` (`tsc --noEmit`) completed with exit code `0` (zero errors).

- **Next.js Production Build Verification**:
  - Executed `cd frontend/apps/web && pnpm build`.
  - Output: Compiled successfully in 79s with 123 static pages generated. Routes `/partner`, `/partner/scan`, `/partner/listing`, `/partner/settings`, and `/partner/settings/staff` are cleanly produced as dynamic server-rendered routes without errors.

- **Unit Test Execution**:
  - Executed `cd frontend/apps/web && pnpm vitest run __tests__/PartnerShellClient.test.tsx`.
  - Output: 5/5 unit tests PASSED.

---

## 2. Logic Chain
1. **Hypothesis 1**: Heavy third-party libraries (`jsQR` and `ReactQuill`) might cause `window`/`document` undefined errors during Next.js SSR build or initial render if not properly code-split.
   - **Verification**: Verified dynamic imports with `{ ssr: false }` in `page.tsx` wrappers for `/partner/scan` and `/partner/listing`. Ran Next.js production build (`pnpm build`). The build succeeded with 0 errors, confirming SSR safety.
2. **Hypothesis 2**: The staff management sub-route `/partner/settings/staff` might violate project UX rules by using native `<select>` dropdowns or browser native popups (`confirm`/`alert`).
   - **Verification**: Code search and inspection confirmed zero `<select>`, `confirm(`, or `alert(` usages in `/partner/settings/staff`. The sub-route strictly uses `ThemedListingSelect` for store selection and `useSystemFeedback` modal for staff deletion.
3. **Hypothesis 3**: The `/partner/listing` page might fail to properly separate Go Live read-only mode from Draft edit mode.
   - **Verification**: State tracing in `PartnerListingClient.tsx` confirmed `isViewingLive` toggle dynamically switches data binding between `liveData` (disabled inputs, read-only HTML view, hidden buttons) and `draftState` (editable inputs, ReactQuill, active save/submit buttons).
4. **Hypothesis 4**: Modularization of partner shell and sub-routes might break TypeScript types or Next.js build compilation.
   - **Verification**: Executed `pnpm check-types` (PASSED 0 errors) and `pnpm build` (PASSED 0 errors, exit code 0).

---

## 3. Caveats
- Legacy monolith page `app/partner/page.tsx` retains compatibility redirect logic and active panel rendering when accessed via `/partner?panel=...`.
- In `app/partner/page.tsx` line 8040 (legacy bill form), a hidden `<select id="bill-store-select-hidden">` exists solely for hidden accessibility binding, while all visible dropdowns use `ThemedListingSelect`.

---

## 4. Conclusion
All sub-routes (`/partner/scan`, `/partner/listing`, `/partner/settings`, `/partner/settings/staff`), dynamic code-splitting (`jsQR`, `ReactQuill`), UI/UX rules (custom selects, custom feedback modals), TypeScript types, and Next.js production compilation have been empirically verified and pass all criteria.

**Verdict: `APPROVE`**

---

## 5. Verification Method
To independently verify this evaluation, run the following commands in `frontend/apps/web`:

```bash
# 1. Verify TypeScript types
pnpm check-types

# 2. Verify unit tests
pnpm vitest run __tests__/PartnerShellClient.test.tsx

# 3. Verify Next.js production compilation & dynamic code-splitting
pnpm build
```
