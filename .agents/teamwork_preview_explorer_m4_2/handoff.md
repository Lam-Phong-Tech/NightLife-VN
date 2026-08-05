# Handoff Report: Sub-routes & Monolith Extraction (Milestone 4 / PR 4)

**Agent**: `teamwork_preview_explorer` (PR4 Sub-routes & Monolith Extraction Explorer)  
**Target Recipient**: Parent Orchestrator / Implementer Agent  
**Date**: 2026-08-05  
**Working Directory**: `d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_m4_2\`

---

## 1. Observation

1. **Monolith Extraction Source**:
   - Monolith file: `frontend/apps/web/src/app/partner/page.tsx` (8,741 total lines).
   - Legacy `renderBillPanel()` function located at lines 7785–8300.
   - Legacy `submitPartnerBill` handler located at lines 3562–3620.
   - Legacy hidden native `<select id="bill-store-select-hidden">` at lines 8040–8052.
   - Legacy hidden native `<input type="datetime-local">` at lines 8105–8111.
2. **Backend API Contracts**:
   - Backend controller: `backend/src/nightlife-data/nightlife-data.controller.ts` lines 677 & 688 (`GET /partner/activity` and `GET /partner/activity/:activityId`).
   - Query DTO: `backend/src/nightlife-data/dto/partner-activity-query.dto.ts` supporting `limit`, `cursor`, `type`, `startDate`, `endDate`, `search`, and `storeId`.
   - Cursor encoding: Base64 opaque token (`<activityAt_iso>_<id>`).
3. **Project UI Components**:
   - `ThemedListingSelect`: `frontend/apps/web/src/components/ui/ThemedListingSelect.tsx` for custom dropdown selectors.
   - `useSystemFeedback`: `frontend/apps/web/src/components/ui/SystemFeedback.tsx` for custom toast and modal confirmations.
   - `BookingDateTimeFields`: `frontend/apps/web/src/components/ui/BookingDateTimeFields.tsx` utilizing Ant Design `DatePicker` with custom gold theme tokens (`var(--vy-gold)`).
4. **Shell Navigation & Layout**:
   - `frontend/apps/web/src/app/partner/PartnerShellClient.tsx` already contains nav item for `activity` pointing to `/partner/activity`.

---

## 2. Logic Chain

1. **From Monolith Analysis to Sub-route Architecture**:
   - `page.tsx` is over 8,700 lines long, embedding bill forms, bill listing tables, and activity notifications inline.
   - Extracting `/partner/activity/page.tsx`, `/partner/activity/new-bill/page.tsx`, and `/partner/activity/[activityId]/page.tsx` provides clean modularity, improved code maintenance, and standard Next.js App Router performance.
2. **From User Rules to Component Selection**:
   - User Rule #3 explicitly forbids native browser `<select>`: Replaced with `ThemedListingSelect`.
   - User Rule #2 explicitly forbids native browser `alert()`/`confirm()`: Replaced with `useSystemFeedback()` hook.
   - User Rule #4 explicitly forbids native browser datepickers: Replaced with Ant Design `DatePicker` / `BookingDateTimeFields`.
3. **From Backend Contracts to Client API/Hook**:
   - Creating `lib/api/partner-portal.ts` and `hooks/usePartnerActivity.ts` cleanly isolates data fetching and cursor pagination from UI presentation.

---

## 3. Caveats

- **Read-Only Scope**: As an explorer agent, no source code files were created or modified during this investigation.
- **Backend Dependency**: `usePartnerActivity()` depends on backend endpoints `GET /partner/activity` and `GET /partner/activity/:activityId` implemented in Milestone 2.
- **Form State Compatibility**: When submitting a new bill linked to a booking, `billDiscountLabel` relies on `discount_rule_snapshot` data from the selected booking.

---

## 4. Conclusion

The technical blueprint for Milestone 4 (PR 4) sub-routes and monolith extraction is complete, self-contained, and verified against project requirements and User Rules:
1. `/partner/activity/page.tsx`: Paginated activity feed with filter tabs, debounced search, custom date range picker, load-more trigger, and quick detail drawer.
2. `/partner/activity/new-bill/page.tsx`: Standalone bill submission form adhering to all User Rules (no native `<select>`, no native alerts, no native datepicker).
3. `/partner/activity/[activityId]/page.tsx`: Standalone activity detail view with full customer and financial breakdown.
4. Legacy redirects: `?panel=bill` -> `/partner/activity`, `/partner/gui-hoa-don` -> `/partner/activity/new-bill`.

---

## 5. Verification Method

To independently verify the planned implementation once built:

1. **Type & Code Integrity**:
   - Run Next.js build check: `cd frontend/apps/web && pnpm run build` or `npm run build`.
   - Verify TypeScript compilation without errors: `pnpm run typecheck` or `npx tsc --noEmit`.
2. **Sub-route Inspection**:
   - Inspect newly created files:
     - `frontend/apps/web/src/lib/api/partner-portal.ts`
     - `frontend/apps/web/src/hooks/usePartnerActivity.ts`
     - `frontend/apps/web/src/app/partner/activity/page.tsx`
     - `frontend/apps/web/src/app/partner/activity/new-bill/page.tsx`
     - `frontend/apps/web/src/app/partner/activity/[activityId]/page.tsx`
3. **User Rules Compliance Audit**:
   - Grep for forbidden elements in sub-routes:
     - `grep -rn "<select" frontend/apps/web/src/app/partner/activity/` (Should return 0 matches).
     - `grep -rn "alert(" frontend/apps/web/src/app/partner/activity/` (Should return 0 matches).
     - `grep -rn 'type="date"' frontend/apps/web/src/app/partner/activity/` (Should return 0 matches).
     - `grep -rn 'type="datetime-local"' frontend/apps/web/src/app/partner/activity/` (Should return 0 matches).
