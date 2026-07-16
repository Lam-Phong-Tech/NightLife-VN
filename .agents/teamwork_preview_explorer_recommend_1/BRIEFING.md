# BRIEFING — 2026-07-16T06:24:20Z

## Mission
Explore backend files to analyze pinRank validation for admin rankings and listPublicHomeRecommendations logic, proposing changes.

## 🔒 My Identity
- Archetype: explorer
- Roles: Explorer
- Working directory: d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_recommend_1
- Original parent: 90b6113f-c0e3-40ee-961b-7290542d5de3
- Milestone: Recommend Home

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Network mode: CODE_ONLY (No external web access)

## Current Parent
- Conversation ID: 90b6113f-c0e3-40ee-961b-7290542d5de3
- Updated: 2026-07-16T06:25:55Z

## Investigation State
- **Explored paths**:
  - backend/src/nightlife-data/dto/admin-ranking.dto.ts
  - backend/src/nightlife-data/nightlife-data.service.ts
  - backend/src/nightlife-data/nightlife-data.controller.ts
- **Key findings**:
  - pinRank validation resides in DTOs `@Max(5)`. Propose relaxing to `@Max(8)`.
  - Pinned home recommendations should fetch rankingConfig with scope 'recommend-home' and targetType 'STORE', filter by active status/dates/city, fetch corresponding stores (ensuring active/not-deleted), sort in memory by pinRank, and fallback to original logic if empty.
- **Unexplored areas**: None.

## Key Decisions Made
- Wrote proposed changes into a `.patch` file at `.agents/teamwork_preview_explorer_recommend_1/recommendation-home.patch`.

## Artifact Index
- ORIGINAL_REQUEST.md — Record of original request
- BRIEFING.md — Current status and context
- recommendation-home.patch — Proposed backend changes
- handoff.md — structured handoff report
