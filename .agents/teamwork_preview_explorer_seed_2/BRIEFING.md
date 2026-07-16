# BRIEFING — 2026-07-16T17:20:00+07:00

## Mission
Explore and plan the prisma seeding of Tours (Tour, TourStop) and Admin Coupons & Campaigns (AdminCoupon, AdminCouponScan, AdminCouponIssue, Campaign).

## 🔒 My Identity
- Archetype: Teamwork explorer
- Roles: Explorer, Analyst
- Working directory: d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_seed_2
- Original parent: 61ffbece-f8cc-4657-9e67-aa9b98e6c241
- Milestone: Seed exploration and planning

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Analyze schema.prisma to propose mock data structure, upsert keys, and relationships

## Current Parent
- Conversation ID: 61ffbece-f8cc-4657-9e67-aa9b98e6c241
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `backend/prisma/schema.prisma`
  - `backend/prisma/seed/` (specifically `00-roles.ts`, `01-users.ts`, `04-stores.ts`, `07-coupons.ts`, `12-bookings-bills.ts`, `shared.ts`, `index.ts`, `verify.ts`)
- **Key findings**:
  - `Tour` has no unique identifier other than `id`. Resolved via deterministic UUID generation using `seedUuid('tour-' + tourSlug)`.
  - `TourStop` has a compound unique constraint on `[tourId, storeId]`. Resolved via compound key upsert.
  - `AdminCoupon` and `AdminCouponIssue` have unique `code` and `qrPayloadHash` fields. Resolved via `code` check and deterministic SHA-256 payload hashing (`seedHash`).
  - `AdminCouponScan` has only `id` which can be generated deterministically as `seedUuid('admin-coupon-scan-' + scanKey)`.
  - `Campaign` has only `id`, which can be seeded using `seedUuid('campaign-' + campaignSlug)`.
- **Unexplored areas**: None.

## Key Decisions Made
- Chose deterministic ID generation via `seedUuid()` and `seedHash()` for all entities lacking natural unique database keys.
- Drafted exact blueprints and code structures for both `16-tours.ts` and `17-admin-coupons-campaigns.ts` inside `analysis.md`.
- Planned adjustments to index orchestrator (`index.ts`) and validation scripts (`verify.ts`).

## Artifact Index
- d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_seed_2\ORIGINAL_REQUEST.md — Original request description
- d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_seed_2\analysis.md — Main findings and blueprint design code snippets
- d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_seed_2\progress.md — Tasks progress tracking
