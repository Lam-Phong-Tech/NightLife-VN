# BRIEFING — 2026-08-05T14:27:00Z

## Mission
Implement Milestone 2 (PR 2: Backend Activity Contracts & Stable Pagination) for NightLife-VN.

## 🔒 My Identity
- Archetype: implementer, qa
- Roles: implementer, qa, specialist
- Working directory: d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_m2_1
- Original parent: a6166166-d3f1-4fc5-aed5-12da5b13dce6
- Milestone: PR 2 (Backend Activity Contracts & Stable Pagination)

## 🔒 Key Constraints
- Follow minimal change principle.
- No dummy/facade implementations or hardcoded values.
- Must run build and tests to verify.
- Git commit & push after completion.
- Must not use browser native alert/select/datepicker in frontend (not editing frontend UI here, but obey rules).

## Current Parent
- Conversation ID: a6166166-d3f1-4fc5-aed5-12da5b13dce6
- Updated: 2026-08-05T14:27:00Z

## Task Summary
- **What to build**:
  - DTO `PartnerActivityQueryDto` in `backend/src/nightlife-data/dto/partner-activity-query.dto.ts`
  - Endpoints `GET /partner/home`, `GET /partner/activity`, `GET /partner/activity/:activityId` in `backend/src/nightlife-data/nightlife-data.controller.ts`
  - Service methods `getPartnerHome`, `getPartnerActivities`, `getPartnerActivityDetail` in `backend/src/nightlife-data/nightlife-data.service.ts`
  - Unit tests in `backend/src/nightlife-data/nightlife-data.service.spec.ts`
- **Success criteria**:
  - Stable keyset cursor pagination `<activityAt_iso>_<id>` ordered by `(activityAt DESC, id DESC)`
  - Standalone `CouponIssue` deduplication (`status = USED` and `bill: { is: null }`)
  - Multi-tenant StoreScope enforcement via `accessService`
  - `@Roles('PARTNER', 'ADMIN')` returning 403 for `STAFF`
  - Passing tests in `nightlife-data.service.spec.ts` and `pnpm check-types`
  - Git commit and push

## Change Tracker
- **Files modified**: TBD
- **Build status**: TBD
- **Pending issues**: None

## Quality Status
- **Build/test result**: TBD
- **Lint status**: TBD
- **Tests added/modified**: TBD

## Loaded Skills
- None loaded yet.
