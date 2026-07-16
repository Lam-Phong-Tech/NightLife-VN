# BRIEFING — 2026-07-16T09:32:27+07:00

## Mission
Analyze backend partner request state machine and frontend AdminConsole UI for partner request reviews and diffing.

## 🔒 My Identity
- Archetype: explorer
- Roles: Explorer 1 - Backend & Frontend Partner Request Analysis
- Working directory: d:/laragon/www/NightLife-VN/.agents/teamwork_preview_explorer_m5_1/
- Original parent: 0f70e5e8-075b-4673-815e-ff91f8cb5e31
- Milestone: m5_1

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- CODE_ONLY network mode: no external requests, no curl/wget/etc.

## Current Parent
- Conversation ID: 0f70e5e8-075b-4673-815e-ff91f8cb5e31
- Updated: 2026-07-16T09:33:00Z

## Investigation State
- **Explored paths**:
  - `backend/src/nightlife-data/nightlife-data.service.ts`: State machine code, selection mapping queries, onboarding flows, reject flows.
  - `frontend/apps/web/src/app/admin/AdminConsole.tsx`: Partner request rendering, layout tabs, review panel, and dialog overlay hooks.
- **Key findings**:
  - Unconditional onboarding during partner request review causes issues for existing stores (`LISTING-` updates).
  - Backend needs conditional checks to isolate onboarding and status updates (not reverting modifying stores to `DRAFT` on rejection).
  - Selected and mapped fields were enhanced with original store detail fields (`description`, `address`, `city`, `district`, `phone`, `openingHours`, and `pricingInfo.menuSummary`) to facilitate comparisons.
  - Designed frontend UI modifications including separate tabs, a custom "Xem thay đổi" button, and a side-by-side comparison modal that highlights changed fields.
- **Unexplored areas**: None.

## Key Decisions Made
- Designed separate patch files for backend (`backend.patch`) and frontend (`frontend.patch`) to allow clean application of the proposed changes.
- Modeled the diff highlighting rules using standard styles to fit existing color palettes without relying on native UI components or alerts.

## Artifact Index
- d:/laragon/www/NightLife-VN/.agents/teamwork_preview_explorer_m5_1/handoff.md — Analysis and Proposed Changes
- d:/laragon/www/NightLife-VN/.agents/teamwork_preview_explorer_m5_1/backend.patch — Backend Changes Patch
- d:/laragon/www/NightLife-VN/.agents/teamwork_preview_explorer_m5_1/frontend.patch — Frontend Changes Patch
