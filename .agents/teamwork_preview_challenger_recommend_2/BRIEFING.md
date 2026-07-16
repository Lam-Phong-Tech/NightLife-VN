# BRIEFING — 2026-07-16T13:45:00+07:00

## Mission
Empirically verify the frontend Admin content page UI for recommend-home.

## 🔒 My Identity
- Archetype: empirical challenger
- Roles: critic, specialist
- Working directory: d:\laragon\www\NightLife-VN\agents\teamwork_preview_challenger_recommend_2
- Original parent: 90b6113f-c0e3-40ee-961b-7290542d5de3
- Milestone: Pinned/Recommend Home Admin verification
- Instance: 1 of 1

## 🔒 Key Constraints
- Review-only — do NOT modify implementation code

## Current Parent
- Conversation ID: 90b6113f-c0e3-40ee-961b-7290542d5de3
- Updated: not yet

## Review Scope
- **Files to review**: `frontend/apps/web/src/app/admin/content/page.tsx`
- **Interface contracts**: `frontend/apps/web/src/lib/api/admin-rankings.ts`
- **Review criteria**:
  1. Search operates across all stores in all cities (no city filtering).
  2. Pinned limit of 8 stores is correctly blocked on 9th store with a custom modal feedback dialog.
  3. Reordering via Up/Down buttons works correctly and updates rankings in backend.
  4. Deletion works and prompts with a custom confirmation modal.

## Key Decisions Made
- Wrote integration test `frontend/apps/web/__tests__/AdminRecommendHome.test.tsx` to verify all 4 criteria automatically.

## Artifact Index
- `frontend/apps/web/__tests__/AdminRecommendHome.test.tsx` — Custom test suite.

## Attack Surface
- **Hypotheses tested**:
  - Pinned stores limit check behaves correctly at boundary (exactly 8 allowed, 9th rejected).
  - Up/Down ordering logic updates both ranks properly.
  - Search calls are not restricted to specific cities.
- **Vulnerabilities found**: None.
- **Untested angles**: None.

## Loaded Skills
- None.
