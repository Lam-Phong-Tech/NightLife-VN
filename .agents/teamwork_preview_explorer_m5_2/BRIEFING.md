# BRIEFING — 2026-07-16T09:44:00+07:00

## Mission
Analyze backend state machine transitions for partner requests and design frontend improvements for request comparison/diffing in AdminConsole.tsx.

## 🔒 My Identity
- Archetype: Explorer
- Roles: Explorer 2 - Backend State Machine Detail Analyzer
- Working directory: d:/laragon/www/NightLife-VN/.agents/teamwork_preview_explorer_m5_2/
- Original parent: 0f70e5e8-075b-4673-815e-ff91f8cb5e31
- Milestone: m5_2

## 🔒 Key Constraints
- Read-only investigation — do NOT implement code changes.
- Focus on nightlife-data.service.ts and AdminConsole.tsx.
- Follow Project-Scoped Rules in AGENTS.md (specifically git commit/push rule, no browser alert/select/native datepicker) when analyzing/designing code.

## Current Parent
- Conversation ID: 0f70e5e8-075b-4673-815e-ff91f8cb5e31
- Updated: 2026-07-16T09:44:00+07:00

## Investigation State
- **Explored paths**:
  - `backend/src/nightlife-data/nightlife-data.service.ts`
  - `frontend/apps/web/src/app/admin/AdminConsole.tsx`
  - `backend/prisma/schema.prisma`
  - `backend/src/nightlife-data/nightlife-data.service.spec.ts`
- **Key findings**:
  - `ensurePartnerOnboarding` should only be called if `request.id` starts with `PARTNER-`.
  - When rejecting a modification request (`LISTING-`), the store status update to `DRAFT` must be skipped.
  - Adding fields to `partnerRequestSelect` and nested `originalStore` to `mapPartnerRequestRecord` exposes original store fields for diff check.
  - Separating partner requests into 'Registration' vs 'Modification' sub-tabs improves CMS layout.
  - Adding a custom Diff View comparison modal with side-by-side highlighting, a review reason textarea, and approve/reject actions ensures high-integrity admin reviews.
- **Unexplored areas**:
  - Unit tests configuration validation beyond service mocking.

## Key Decisions Made
- Sketched out full TypeScript and React implementations for backend service adjustments and AdminConsole tab/modal enhancements.
- Mapped exact fields (name, category, address, phone, description, opening hours, pricing/menu items) to compare.

## Artifact Index
- d:/laragon/www/NightLife-VN/.agents/teamwork_preview_explorer_m5_2/ORIGINAL_REQUEST.md — Original request.
- d:/laragon/www/NightLife-VN/.agents/teamwork_preview_explorer_m5_2/handoff.md — Final analysis report and code patches.
