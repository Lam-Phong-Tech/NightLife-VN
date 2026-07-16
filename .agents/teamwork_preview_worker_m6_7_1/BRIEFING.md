# BRIEFING — 2026-07-16T09:44:00+07:00

## Mission
Implement backend changes for partner request and form toggle in NightLife-VN, and frontend changes for AdminConsole diff comparisons, custom dropdown, and viewing live data.

## 🔒 My Identity
- Archetype: teamwork_preview_worker
- Roles: implementer, qa, specialist
- Working directory: d:/laragon/www/NightLife-VN/.agents/teamwork_preview_worker_m6_7_1/
- Original parent: 0f70e5e8-075b-4673-815e-ff91f8cb5e31
- Milestone: m6_7_1

## 🔒 Key Constraints
- Avoid native `<select>` dropdowns; use custom dropdown/picker.
- Avoid native date pickers.
- Avoid browser `alert()`, `confirm()`, `prompt()`; use project custom toasts or modals.
- Create git commit and push when done.

## Current Parent
- Conversation ID: 0f70e5e8-075b-4673-815e-ff91f8cb5e31
- Updated: yes

## Task Summary
- **What to build**: Extend `PartnerRequestCmsRecord`, `partnerRequestSelect`, and `mapPartnerRequestRecord` to support full store fields. Adjust `reviewPartnerRequest` logic. Format/add `live` property to draft response. Upgrade `AdminConsole.tsx` with tabs, custom dropdown status filter, diff modal comparing current vs draft fields, and approval/rejection reason. Upgrade `partner/page.tsx` with live/draft toggle, state rename/handling, and pointer-events/read-only disable rules when viewing live.
- **Success criteria**: Backend compiles, frontend check-types and build succeed, and git commit is pushed.
- **Interface contracts**: backend/src/nightlife-data/nightlife-data.service.ts, frontend/apps/web/src/app/admin/AdminConsole.tsx, frontend/apps/web/src/app/partner/page.tsx.
- **Code layout**: Standard monorepo layout.

## Key Decisions Made
- Chose `colors.shell` as dropdown popover background instead of `colors.bgPanel` since `bgPanel` was missing.
- Resolved merge conflict in `partner/page.tsx` during pull --rebase.
- Stretched type validation for `PartnerBill` and `med.url` match statement to make `check-types` compile correctly.

## Change Tracker
- **Files modified**:
  - `backend/src/nightlife-data/nightlife-data.service.ts`
  - `frontend/apps/web/src/app/admin/AdminConsole.tsx`
  - `frontend/apps/web/src/app/partner/page.tsx`
- **Build status**: Pass
- **Pending issues**: None

## Quality Status
- **Build/test result**: Pass (all 198 tests passed)
- **Lint status**: Clean check-types
- **Tests added/modified**: None

## Loaded Skills
- None

## Artifact Index
- d:/laragon/www/NightLife-VN/.agents/teamwork_preview_worker_m6_7_1/ORIGINAL_REQUEST.md — Original request instructions.
