# BRIEFING — 2026-07-16T00:03:30+07:00

## Mission
Analyze backend booking discounts (R1: tier defaults, R2: preserve campaign, R3: admin global coupons) and design implementation.

## 🔒 My Identity
- Archetype: explorer
- Roles: Read-only investigator
- Working directory: d:/laragon/www/NightLife-VN/agents/teamwork_preview_explorer_booking_discounts_2/
- Original parent: 4b069fa6-a06b-4feb-a697-de8361cb8cad
- Milestone: booking_discounts_investigation

## 🔒 Key Constraints
- Read-only investigation — do NOT implement/modify source files.
- Deliver analysis and recommended design to handoff.md in working directory.

## Current Parent
- Conversation ID: 4b069fa6-a06b-4feb-a697-de8361cb8cad
- Updated: 2026-07-16T00:03:30+07:00

## Investigation State
- **Explored paths**:
  - `backend/prisma/schema.prisma` for models: `User`, `Guest`, `Booking`, `Coupon`, `CouponIssue`, `AdminCoupon`, `AdminCouponIssue`, `Bill`.
  - `backend/src/nightlife-data/nightlife-data.service.ts` for booking creation, coupon linking, bill submission, and bill review logic.
  - `backend/src/nightlife-data/nightlife-data.controller.ts` for admin/global coupons and bill review endpoints.
  - `backend/src/nightlife-data/dto/create-booking.dto.ts` and `claim-guest-coupon.dto.ts` for request validation structures.
- **Key findings**:
  - Default tier coupons (`GUEST5`, `MEMBER8`, `VIP10`) are seeded under specific stores but need to be treated as shared across all stores by bypassing store-ownership checks.
  - Bookings and Bills do not have direct foreign keys to `AdminCoupon`/`AdminCouponIssue` tables, but they can be reconciled and snapshotted using the JSON fields `discountSnapshot` and `discountRuleSnapshot`.
  - Bill approval transaction (`reviewSensitiveBill`) is the correct hook point to transition `AdminCouponIssue` status to `USED` and increment the global `AdminCoupon.usedCount`.
- **Unexplored areas**:
  - Direct integration testing (Jest mock runs) as implementation has not yet occurred.

## Key Decisions Made
- Use JSON snapshots (`discountSnapshot` on booking and `discountRuleSnapshot` on bill) to propagate Admin Global Coupon state without schema migrations.
- Extend `resolveBookingCouponLink` and `resolveBillCouponLink` to dynamically handle both standard and Admin coupon issues.

## Artifact Index
- d:/laragon/www/NightLife-VN/.agents/teamwork_preview_explorer_booking_discounts_2/handoff.md — Analysis and recommendation report.
