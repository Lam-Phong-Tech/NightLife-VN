## 2026-08-05T08:47:50Z
You are teamwork_preview_explorer (PR4 API Client & Hook Explorer). Your working directory is d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_m4_1\.

OBJECTIVE:
Investigate frontend API client design and React custom hook implementation for Milestone 4 (PR 4: Activity Core, New Bill Route & Safe Legacy Redirects).

Specifically analyze:
1. API Client (`frontend/apps/web/src/lib/api/partner-portal.ts`):
   - Design TypeScript interfaces matching PR2 backend endpoints (`PartnerHomeOverview`, `PartnerActivityItem`, `PartnerActivityResponse`, `PartnerActivityQueryParams`).
   - Implement `fetchPartnerHome(storeId?: string)`.
   - Implement `fetchPartnerActivities(params: PartnerActivityQueryParams)`.
   - Implement `fetchPartnerActivityDetail(activityId: string, storeId?: string)`.
2. React Hook (`frontend/apps/web/src/hooks/usePartnerActivity.ts`):
   - Hook managing stable cursor pagination state (`items`, `nextCursor`, `hasMore`, `loading`, `error`, `fetchNextPage()`, `refresh()`).
   - Filter handling (`type`, `startDate`, `endDate`, `search`, `storeId`).
   - Integration with `usePartnerStoreScope()`.

INPUT FILES TO READ:
- MANDATORY: d:\laragon\www\NightLife-VN\ORIGINAL_REQUEST.md
- d:\laragon\www\NightLife-VN\.agents\orchestrator\PROJECT.md
- backend/src/nightlife-data/dto/partner-activity-query.dto.ts
- backend/src/nightlife-data/nightlife-data.contract.ts
- frontend/apps/web/src/lib/api/bills.ts

OUTPUT REQUIREMENTS:
1. Write analysis report to d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_m4_1\analysis.md
2. Write handoff report to d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_m4_1\handoff.md
3. Send completion message to parent orchestrator via send_message.

Do NOT modify any source code files. You are a read-only explorer.
