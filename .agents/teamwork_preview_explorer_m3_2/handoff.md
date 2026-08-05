# Handoff Report: Milestone 3 Sub-routes & Code-Splitting Explorer

## 1. Observation
- **File `frontend/apps/web/src/app/partner/page.tsx`**:
  - Monolithic component exceeding 11,100 lines (416 KB).
  - Line 40: `import jsQR from 'jsqr';` (static import of ~150KB QR code library included in root `/partner` bundle).
  - Lines 683–765: `readQrFromVideoFrame` and `readQrFromImageFile` helper functions invoke `jsQR(imageData.data, width, height, ...)` directly.
  - Line 172: `const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false, loading: ... })`.
  - Line 5: `import 'react-quill-new/dist/quill.snow.css';` (static import of Quill stylesheet at top level).
  - Lines 6092–7637: `renderScanPanel()` renders QR scanner UI and verification buttons.
  - Lines 7638–8370: `renderListingPanel()` renders store listing form with `isViewingLive` toggle and `ReactQuill`.
  - Lines 8373–8476: `renderSettingsPanel()` upper half renders Change Password form.
  - Lines 8478–8650: `renderSettingsPanel()` lower half renders Staff Management with `ThemedListingSelect` (line 52 import) and `useSystemFeedback` (line 53 import).
- **File `frontend/apps/web/src/app/partner/layout.tsx`**:
  - Server Layout component currently serving as root layout for `/partner/*` sub-routes.

## 2. Logic Chain
1. **Observation**: Monolith `page.tsx` loads `jsQR` statically on line 40 and `quill.snow.css` on line 5 for all portal visits.
   - **Reasoning**: Any user opening the Partner Portal (e.g., viewing settings or overview) downloads ~450KB+ of unused QR decoding and rich-text editing code/styles.
   - **Step**: Extract `/partner/scan` to `frontend/apps/web/src/app/partner/scan/page.tsx` and dynamically import `jsQR` (either via `const jsQR = (await import('jsqr')).default` or `next/dynamic` wrapper component).
   - **Step**: Extract `/partner/listing` to `frontend/apps/web/src/app/partner/listing/page.tsx` and move `quill.snow.css` & `ReactQuill` dynamic import into the listing module.

2. **Observation**: Monolith `page.tsx` manages store state (`activeStoreId`, `stores`), permissions, and notifications inside top-level component state.
   - **Reasoning**: Navigating between separate sub-routes (`/partner/scan` -> `/partner/settings`) in Next.js App Router would reset component state if state were stored inside each page component.
   - **Step**: Wrap sub-routes in `PartnerProviders` (`PartnerStoreScopeProvider` and `SystemFeedbackProvider`) inside `app/partner/layout.tsx`. Because parent layouts stay mounted during client navigation, store selection and feedback toasts persist continuously across route transitions.

3. **Observation**: `renderSettingsPanel()` contains both password change logic (for all users) and staff management logic (only for `PARTNER` role).
   - **Reasoning**: Splitting into `/partner/settings/page.tsx` and `/partner/settings/staff/page.tsx` creates clean separation of concerns and role-based access control.
   - **Step**: `/partner/settings/page.tsx` renders the change password form, while `/partner/settings/staff/page.tsx` renders staff table with `ThemedListingSelect` and deletion confirmation via `useSystemFeedback`.

## 3. Caveats
- **Read-Only Scope**: No source code files in `frontend/apps/web` were modified during this investigation.
- **Dependency Co-existence**: The orchestrator and implementer agents must coordinate the creation of `PartnerProviders.tsx` and `PartnerShellClient.tsx` so that `app/partner/layout.tsx` properly mounts the providers before sub-routes are extracted.

## 4. Conclusion
Extracting sub-routes from `frontend/apps/web/src/app/partner/page.tsx` into `/partner/scan`, `/partner/listing`, `/partner/settings`, and `/partner/settings/staff` is fully feasible and structured. Dynamic code-splitting of `jsQR` and `ReactQuill` will reduce initial bundle size significantly, while `PartnerStoreScopeProvider` in `app/partner/layout.tsx` guarantees seamless state preservation across all sub-routes.

## 5. Verification Method
To verify implementation after sub-route extraction:
1. **TypeScript Typecheck**:
   ```powershell
   cd frontend/apps/web
   pnpm run typecheck
   ```
2. **Next.js Production Build Bundle Verification**:
   ```powershell
   cd frontend/apps/web
   pnpm run build
   ```
   Check build output table:
   - `/partner/scan` chunk contains `jsQR` dynamic chunk.
   - `/partner/listing` chunk contains `react-quill-new` dynamic chunk.
   - Initial `/partner` route JS bundle size is reduced.
3. **Manual Route & State Verification**:
   - Navigate from `/partner` to `/partner/scan`, `/partner/listing`, `/partner/settings`, and `/partner/settings/staff`.
   - Verify store selected in header switcher remains active across all sub-routes.
   - Verify staff deletion modal uses custom `useSystemFeedback` confirmation dialog.
