# BRIEFING — 2026-07-16T13:27:00+07:00

## Mission
Analyze Admin Content Console tabs, ranking API clients, and propose UI changes for the 'recommend-home' (Đề xuất tối nay) tab on the frontend.

## 🔒 My Identity
- Archetype: explorer
- Roles: Read-only investigator, analyzer
- Working directory: d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_recommend_2
- Original parent: 90b6113f-c0e3-40ee-961b-7290542d5de3
- Milestone: Admin Content Console Tab Extension

## 🔒 Key Constraints
- Read-only investigation — do NOT implement changes directly in the source code.
- No default browser alerts (`alert()`, `confirm()`, `prompt()`) — use custom toast or modal.
- No native select elements `<select>` — use custom dropdown/picker.
- No native date picker — use custom date-picker component.
- All proposals must target the designated files and follow proper project structure.

## Current Parent
- Conversation ID: 90b6113f-c0e3-40ee-961b-7290542d5de3
- Updated: yes

## Investigation State
- **Explored paths**:
  * `frontend/apps/web/src/app/admin/content/page.tsx` (Admin Content tab logic, state management, UI, modal bindings)
  * `frontend/apps/web/src/lib/api/admin-rankings.ts` (Admin rankings client functions: list, options, create, update, delete)
  * `backend/src/nightlife-data/nightlife-data.service.ts` (List target options logic, option mapping, city normalizations)
  * `frontend/apps/web/src/components/ui/SystemFeedback.tsx` (System feedback APIs for toasts/modals)
  * `frontend/apps/web/package.json` (Frontend test command definitions)
- **Key findings**:
  * Frontend admin content tab uses an enum state `activeTab` to switch views.
  * Backend `/admin/rankings/options` endpoint excludes Hanoi and HCM stores when no specific city code is sent (a blank city code defaults to filtering out Hanoi/HCM).
  * Consequently, the search component in the new `recommend-home` tab must search all active stores via the `/admin/stores` API endpoint (which lists all stores globally) and map the fields into `AdminRankingTargetOption`.
  * The system provides a custom `useSystemFeedback()` hook with `showModal()` to alert user on limit exceeding, satisfying constraints of avoiding browser alert.
- **Unexplored areas**:
  * Integration of the home page landing recommendations display (to be investigated/designed by backend or implementer agents).

## Key Decisions Made
- Use `/admin/stores` for searching stores globally to prevent exclusion of Hanoi/HCM stores.
- Use `feedback.showModal()` with tone `"warning"` to notify the user of the 8-store pinning limit.
- Reuse `adminRankingsApi` list, create, update, and delete actions directly under scope `'recommend-home'`.

## Artifact Index
- d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_recommend_2\handoff.md — Analysis and proposed changes for frontend tabs and recommendation dashboard
