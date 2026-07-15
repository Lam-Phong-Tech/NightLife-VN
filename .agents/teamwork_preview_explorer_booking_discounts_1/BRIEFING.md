# BRIEFING — 2026-07-15T17:03:29Z

## Mission
Analyze backend codebase & database schema, and design an implementation strategy for booking discounts (tier defaults, campaign overrides, and global admin coupons).

## 🔒 My Identity
- Archetype: Teamwork explorer
- Roles: Read-only investigator
- Working directory: d:/laragon/www/NightLife-VN/.agents/teamwork_preview_explorer_booking_discounts_1/
- Original parent: 4b069fa6-a06b-4feb-a697-de8361cb8cad
- Milestone: Booking Discounts Investigation

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- CODE_ONLY network mode: no external accesses
- Use files for content delivery (handoff.md), send_message to report back to parent.

## Current Parent
- Conversation ID: 4b069fa6-a06b-4feb-a697-de8361cb8cad
- Updated: 2026-07-15T17:07:34Z

## Investigation State
- **Explored paths**:
  - `backend/prisma/schema.prisma`
  - `backend/src/nightlife-data/nightlife-data.service.ts`
  - `backend/src/nightlife-data/nightlife-data.controller.ts`
  - `backend/src/nightlife-data/nightlife-data.contract.ts`
  - `backend/src/campaigns/campaigns.service.ts`
  - `backend/src/campaigns/public-campaigns.controller.ts`
- **Key findings**:
  - Verified UserTier definitions and how Guest/Member/VIP default tier coupons should bypass store checks.
  - Formulated campaign verification logic to prevent overwriting store-level campaigns with tier defaults.
  - Designed the admin global coupon claiming flow, validation rules, reconciliation on booking via JSON metadata snapshots, and status update to `USED` on bill approval.
- **Unexplored areas**: None.

## Key Decisions Made
- Chose to use `discountSnapshot` JSON field on bookings and bills for admin coupon reconciliation to bypass schema change limitations.
- Leveraged pre-existing discount calculation methods in `buildBillRevenueApprovalSnapshot` by mocking standard coupon parameters.

## Artifact Index
- d:/laragon/www/NightLife-VN/.agents/teamwork_preview_explorer_booking_discounts_1/handoff.md — Analysis and implementation design (Complete)
