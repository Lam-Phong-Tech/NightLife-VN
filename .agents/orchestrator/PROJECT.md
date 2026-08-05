# Project: NightLife-VN Partner Portal Refactoring & Upgrade

## Architecture
- **Monolith Refactoring & Strangler Pattern**:
  - Modularize `frontend/apps/web/src/app/partner/page.tsx` (>10,800 lines) into clean sub-routes (`/partner/scan`, `/partner/listing`, `/partner/settings`, `/partner/settings/staff`, `/partner/activity`, `/partner/activity/new-bill`, `/partner/activity/[activityId]`).
  - Introduce `app/partner/layout.tsx` (Server Component), `PartnerShellClient.tsx`, and `PartnerProviders.tsx` (`PartnerStoreScopeProvider`).
  - Apply Strangler Pattern to prevent "Double Shell" (single Header, single Bottom Nav, single Store Switcher, single Theme Provider).
- **Financial Data & Type Definitions Fixes**:
  - Update `bills.ts` (`PENDING_PM_BA` status, `discountVnd?: number | null`, `subtotalVnd?: number | null`, `paidAt?: string | null`).
  - Render fix in `page.tsx`: remove trend % hardcode, display *"Giảm giá: Chưa xác định"* when `discountVnd === null`, never render `-totalVnd`.
  - Fix backend timezone & date boundaries (`Asia/Ho_Chi_Minh`) in `nightlife-data.service.ts`.
- **Backend Activity Contracts & Stable Pagination**:
  - Implement `GET /partner/home`, `GET /partner/activity`, `GET /partner/activity/:activityId`.
  - DTO `partner-activity-query.dto.ts` with stable cursor (`activityAt DESC, id DESC`), deduplication of used coupons with bills, StoreScope & RoleGuard (Staff 403).
- **Client API & Code-Splitting**:
  - `lib/api/partner-portal.ts` & `usePartnerActivity()` custom hook with AbortController and error handling.
  - Code-splitting with `next/dynamic` for `jsQR` (in `/partner/scan`) and `ReactQuill` (in `/partner/listing`).
- **Safe Legacy Redirects**:
  - Redirect `?panel=bill` -> `/partner/activity`, `/partner/gui-hoa-don` -> `/partner/activity/new-bill`.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Financial Fixes & Types | P0 financial type updates, rendering fix, unit test, Asia/Ho_Chi_Minh timezone fix | M1 (R1) | ORIGINAL_REQUEST §R1 |
| 2 | Backend Activity Contracts | GET /partner/home, /partner/activity, /partner/activity/:activityId, stable cursor, deduplication | M2 (R2) | ORIGINAL_REQUEST §R2 |
| 3 | Partner Shell & Sub-routes | Server layout, PartnerShellClient, PartnerProviders, Strangler pattern, sub-routes /scan, /listing, /settings, /settings/staff | M3 (R3) | ORIGINAL_REQUEST §R3 |
| 4 | Activity Core & Redirects | lib/api/partner-portal.ts, usePartnerActivity(), /partner/activity, /partner/activity/new-bill, /partner/activity/[activityId], legacy redirects | M4 (R4) | ORIGINAL_REQUEST §R4 |
| 5 | Home Redesign & Monolith Cleanup | Simplify partner/page.tsx to clean Home Dashboard, remove legacy monolith code | M5 (R5) | ORIGINAL_REQUEST §R5 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| 0 | Survey & Technical Reconnaissance | Probe frontend & backend files, types, endpoints, and test suites | None | DONE |
| 1 | PR 1: P0 Financial Data & Types | frontend/apps/web/src/lib/api/bills.ts, page.tsx rendering, PartnerSettlementMoney.test.tsx, nightlife-data.service.ts timezone | M0 | DONE |
| 2 | PR 2: Backend Activity Contracts | GET /partner/home, GET /partner/activity, GET /partner/activity/:activityId, partner-activity-query.dto.ts, StoreScope/RoleGuard | M1 | IN_PROGRESS |
| 3 | PR 3: Shell & Sub-routes Strangler | app/partner/layout.tsx, PartnerShellClient, PartnerProviders, /partner/scan (jsQR), /partner/listing (ReactQuill), /partner/settings | M2 | PLANNED |
| 4 | PR 4: Activity Core & Redirects | lib/api/partner-portal.ts, usePartnerActivity(), /partner/activity sub-routes, legacy redirects | M3 | PLANNED |
| 5 | PR 5: Home Redesign & Cleanup | Simplify partner/page.tsx into Home Dashboard, monolith cleanup | M4 | PLANNED |
| 6 | Final Verification & Sentinel Handover | Full frontend/backend typecheck, lint, test, build verification and Sentinel notification | M5 | PLANNED |

## Code Layout
- Frontend Root: `frontend/apps/web/`
  - Partner Page (Monolith): `frontend/apps/web/src/app/partner/page.tsx`
  - Partner Layout: `frontend/apps/web/src/app/partner/layout.tsx`
  - Partner Shell Client: `frontend/apps/web/src/app/partner/PartnerShellClient.tsx`
  - Partner Providers: `frontend/apps/web/src/app/partner/PartnerProviders.tsx`
  - Bill API types: `frontend/apps/web/src/lib/api/bills.ts`
  - Partner Portal API client: `frontend/apps/web/src/lib/api/partner-portal.ts`
  - Partner Activity hook: `frontend/apps/web/src/hooks/usePartnerActivity.ts`
  - Unit tests: `frontend/apps/web/__tests__/PartnerSettlementMoney.test.tsx`
  - Sub-routes:
    - `/partner/scan`: `frontend/apps/web/src/app/partner/scan/page.tsx`
    - `/partner/listing`: `frontend/apps/web/src/app/partner/listing/page.tsx`
    - `/partner/settings`: `frontend/apps/web/src/app/partner/settings/page.tsx`
    - `/partner/settings/staff`: `frontend/apps/web/src/app/partner/settings/staff/page.tsx`
    - `/partner/activity`: `frontend/apps/web/src/app/partner/activity/page.tsx`
    - `/partner/activity/new-bill`: `frontend/apps/web/src/app/partner/activity/new-bill/page.tsx`
    - `/partner/activity/[activityId]`: `frontend/apps/web/src/app/partner/activity/[activityId]/page.tsx`
- Backend Root: `backend/`
  - Data Controller: `backend/src/nightlife-data/nightlife-data.controller.ts`
  - Data Service: `backend/src/nightlife-data/nightlife-data.service.ts`
  - Activity DTO: `backend/src/nightlife-data/dto/partner-activity-query.dto.ts`
  - Unit Test: `backend/src/nightlife-data/nightlife-data.service.spec.ts`
