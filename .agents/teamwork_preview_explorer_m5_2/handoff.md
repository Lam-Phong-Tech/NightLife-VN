# Handoff Report: PR 5 Monolith Refactoring & Cleanup Explorer

**Agent**: `teamwork_preview_explorer` (M5/PR5 Explorer)  
**Working Directory**: `d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_m5_2`  
**Target File**: `frontend/apps/web/src/app/partner/page.tsx`  
**Date**: 2026-08-05  

---

## 1. Observation

1. **Current File State**: `frontend/apps/web/src/app/partner/page.tsx` currently contains **8,751 lines (336 KB)** of monolithic code.
2. **Static Imports Bloat**:
   - `import 'react-quill-new/dist/quill.snow.css';` (Line 5)
   - `import jsQR from 'jsqr';` (Line 40)
   - Static imports of 25+ Lucide icons and legacy validation helpers (`validateStoreName`, `validateVietnamStorePhone`, `ADMIN_VIDEO_ACCEPT`, etc.).
3. **Extracted Monolith Sub-routes**:
   - `/partner/scan`: `frontend/apps/web/src/app/partner/scan/PartnerScanClient.tsx` (21,844 bytes, dynamic `jsQR`)
   - `/partner/listing`: `frontend/apps/web/src/app/partner/listing/PartnerListingClient.tsx` (14,088 bytes, dynamic `ReactQuill`)
   - `/partner/settings`: `frontend/apps/web/src/app/partner/settings/page.tsx` (10,552 bytes)
   - `/partner/settings/staff`: `frontend/apps/web/src/app/partner/settings/staff/page.tsx` (18,006 bytes)
   - `/partner/activity`: `frontend/apps/web/src/app/partner/activity/page.tsx` (16,405 bytes)
   - `/partner/activity/new-bill`: `frontend/apps/web/src/app/partner/activity/new-bill/page.tsx` (17,661 bytes)
   - `/partner/activity/[activityId]`: `frontend/apps/web/src/app/partner/activity/[activityId]/page.tsx` (12,781 bytes)
4. **Backend Contract & API Integration**:
   - Backend endpoint `GET /partner/home` implemented in `backend/src/nightlife-data/nightlife-data.controller.ts`.
   - API helper `fetchPartnerHome(storeId)` and `PartnerHomeOverview` interface exported in `frontend/apps/web/src/lib/api/partner-portal.ts`.

---

## 2. Logic Chain

1. **Premise**: In PR 3 and PR 4, all interactive monolith panels (`renderScanPanel`, `renderListingPanel`, `renderSettingsPanel`, `renderStaffPanel`, `renderBillForm`, `renderSettlementPanel`) were extracted into dedicated Next.js App Router sub-routes under `/partner/*`.
2. **Reasoning**:
   - Since sub-routes are fully operational and enclosed within `<PartnerShellClient>` layout, keeping panel rendering logic inside `frontend/apps/web/src/app/partner/page.tsx` creates duplicate maintenance overhead and inflates initial bundle size by ~180KB+.
   - By eliminating lines 6102–8730 of `page.tsx`, removing static imports of `jsQR` and `quill.snow.css`, and refactoring `page.tsx` into a lean **Home Dashboard**, the file size drops from 8,751 lines (336 KB) down to ~210 lines (9 KB) — a **97.6% reduction**.
   - Implementing a `useEffect` fallback hook using `useSearchParams` in `page.tsx` ensures that legacy bookmark URLs (such as `/partner?panel=scan` or `/partner?panel=listing`) safely redirect (`router.replace`) to their respective new sub-routes without breaking any user flows.

---

## 3. Caveats

1. **Read-Only Scope**: As `teamwork_preview_explorer`, no source code files were modified. The proposed refactored implementation in `analysis.md` is an executable blueprint for the Implementer agent.
2. **App Router Hydration**: `useSearchParams()` in Next.js 14/15 client components requires proper handling during client-side hydration. `app/partner/page.tsx` is wrapped by `PartnerProviders` in `layout.tsx`, ensuring smooth client rendering.
3. **Staff Account User Experience**: When logged in as a `STAFF` role account, `GET /partner/home` returns HTTP 403 (by design per backend security contracts). The home component handles this by showing a dedicated Staff Action Banner linking directly to `/partner/scan`.
4. **Vitest Mock for `next/navigation`**: Existing unit tests (`PartnerLiteDashboard.test.tsx`, `PartnerOfflineScanQueue.test.tsx`) mock `next/navigation`. Because `page.tsx` calls `const router = useRouter()`, test mocks must provide `useRouter: () => ({ replace: vi.fn(), push: vi.fn(), back: vi.fn() })`.


---

## 4. Conclusion

`frontend/apps/web/src/app/partner/page.tsx` is ready for PR 5 refactoring and dead code elimination. The complete blueprint provided in `analysis.md`:
- Reduces `page.tsx` to **<220 lines**.
- Completely removes static `jsQR` and `quill.snow.css` imports.
- Replaces legacy monolith panel switches with safe `useEffect` query parameter redirects (`?panel=scan` -> `/partner/scan`, `?panel=listing` -> `/partner/listing`, `?panel=settings` -> `/partner/settings`, `?panel=bill` -> `/partner/activity/new-bill`, `?panel=activity` -> `/partner/activity`).
- Renders a responsive Home Dashboard with backend overview data fetched via `fetchPartnerHome()`.

---

## 5. Verification Method

### Automated Commands for Implementer
1. **Type & Lint Check**:
   ```bash
   cd frontend/apps/web
   pnpm run lint
   ```
2. **Unit Tests**:
   ```bash
   cd frontend/apps/web
   pnpm run test
   ```
3. **Build Check**:
   ```bash
   cd frontend/apps/web
   pnpm run build
   ```

### Manual Inspection Checklist
1. Verify line count of `frontend/apps/web/src/app/partner/page.tsx` is <300 lines (target ~210 lines).
2. Confirm static imports `jsQR` and `quill.snow.css` are absent from `page.tsx`.
3. Confirm visiting `/partner?panel=scan` redirects to `/partner/scan`.
4. Confirm visiting `/partner?panel=listing` redirects to `/partner/listing`.
5. Confirm visiting `/partner?panel=settings` redirects to `/partner/settings`.
6. Confirm visiting `/partner?panel=bill` redirects to `/partner/activity/new-bill`.
7. Confirm visiting `/partner?panel=activity` redirects to `/partner/activity`.
