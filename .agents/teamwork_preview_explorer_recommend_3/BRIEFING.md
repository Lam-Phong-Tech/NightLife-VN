# BRIEFING — 2026-07-16T13:42:00+07:00

## Mission
Explore how homepage fetches and displays recommendations, verify correctness, front-end filters, and plan testing for the manual configuration recommend-home feature.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigator, explorer, synthesizer
- Working directory: d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_recommend_3
- Original parent: 90b6113f-c0e3-40ee-961b-7290542d5de3
- Milestone: Recommend Home investigation

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Code-only network mode (no external APIs/web search)

## Current Parent
- Conversation ID: 90b6113f-c0e3-40ee-961b-7290542d5de3
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `frontend/apps/web/src/app/page.tsx`
  - `frontend/apps/web/src/lib/api/content.ts`
  - `backend/src/nightlife-data/nightlife-data.service.ts`
  - `backend/src/nightlife-data/dto/admin-ranking.dto.ts`
  - `frontend/apps/web/__tests__/Home.test.tsx`
  - `backend/test/public-discovery.e2e-spec.ts`
  - `frontend/apps/web/src/app/admin/ranking/page.tsx`
- **Key findings**:
  - Homepage fetches recommendations using `contentApi.recommendations` on mount.
  - Results are rendered in sequence via `HomeCardCarousel`, maintaining ordering.
  - No interactive frontend filters exist for recommendations (fixed limit of 8 and cityCode "all").
  - Backend currently limits `pinRank` to 5 in DTOs; needs relax to 8 for the new `recommend-home` scope.
  - No backend tests exist for the recommendations endpoint.
- **Unexplored areas**: None.

## Key Decisions Made
- Formulated testing plan spanning backend unit tests, E2E tests, and frontend page/admin-panel unit tests.

## Artifact Index
- d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_recommend_3\handoff.md — Investigation and test plan report.
