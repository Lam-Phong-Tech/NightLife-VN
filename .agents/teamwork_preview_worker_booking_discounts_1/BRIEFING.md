# BRIEFING — 2026-07-16T00:07:19+07:00

## Mission
Implement backend booking and discount flows integration.

## 🔒 My Identity
- Archetype: implementer
- Roles: implementer, qa, specialist
- Working directory: d:/laragon/www/NightLife-VN/.agents/teamwork_preview_worker_booking_discounts_1/
- Original parent: 4b069fa6-a06b-4feb-a697-de8361cb8cad
- Milestone: backend-booking-discount-flows-integration

## 🔒 Key Constraints
- Automatically find and link default tier-based coupon (GUEST5, MEMBER8, VIP10) on normal bookings (no coupon specified). Generate and link CouponIssue, store snapshot, and bypass store-ownership validation checks.
- Preserve original campaign rates and do not apply default tier discounts if a campaign/coupon is explicitly specified.
- Implement claiming endpoints for Admin Coupons (Member and Guest claims). Validate tier eligibility (targetAudiences) and store eligibility (targetStores). Save admin coupon issue details in snapshots, transition status to USED on bill approval, and increment AdminCoupon.usedCount.
- Do not cheat: no hardcoding of test results or facade implementations.
- Execute git commit and git push.

## Current Parent
- Conversation ID: 4b069fa6-a06b-4feb-a697-de8361cb8cad
- Updated: not yet

## Task Summary
- **What to build**: Backend booking & discount flows.
- **Success criteria**: All automated tests pass (build, test, test:e2e), proper implementation of automatic tier discounts, proper admin coupon claims, state transitions.
- **Interface contracts**: [TBD]
- **Code layout**: Backend directory `d:/laragon/www/NightLife-VN/backend`

## Key Decisions Made
- Use generic JSON columns `discountSnapshot` and `discountRuleSnapshot` to bypass DB schema changes.
- Automatically find and assign defaults if no coupons are supplied.
- Typecast NestJS app getHttpServer call to unknown/any to avoid type safety check failures.

## Artifact Index
- `backend/src/nightlife-data/nightlife-data.service.ts` — Main backend logic.
- `backend/src/nightlife-data/nightlife-data.controller.ts` — Controller claim routes.
- `backend/src/nightlife-data/dto/create-booking.dto.ts` — Added DTO parameters.
- `backend/test/admin-coupon.e2e-spec.ts` — End-to-end integration tests.

## Change Tracker
- **Files modified**:
  - `backend/src/nightlife-data/dto/create-booking.dto.ts`
  - `backend/src/nightlife-data/nightlife-data.service.ts`
  - `backend/src/nightlife-data/nightlife-data.controller.ts`
  - `backend/src/nightlife-data/nightlife-data.service.spec.ts`
  - `backend/test/admin-coupon.e2e-spec.ts` (created)
- **Build status**: Pass
- **Pending issues**: None

## Quality Status
- **Build/test result**: Pass (171 unit tests, 66 E2E tests)
- **Lint status**: 0 errors on modified files
- **Tests added/modified**: Added E2E tests for admin global coupon claims; added unit tests for VIP auto-resolution.
