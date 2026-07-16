## 2026-07-16T06:26:57Z
You are teamwork_preview_worker_recommend_1. Working directory: d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_recommend_1.
Your task is to implement the "Đề xuất tối nay" (Recommend Home) manual configuration feature spanning both Backend and Frontend.

Here is the exact layout of the files you need to modify:
1. **Backend DTO Validation**:
   - Path: `backend/src/nightlife-data/dto/admin-ranking.dto.ts`
   - Relax `@Max(5)` on `pinRank` to `@Max(8, { message: 'Ranking P0 chỉ hỗ trợ Top 1-8' })` in both `CreateAdminRankingConfigDto` and `UpdateAdminRankingConfigDto`.

2. **Backend Recommendations Service**:
   - Path: `backend/src/nightlife-data/nightlife-data.service.ts`
   - Modify the `listPublicHomeRecommendations` method to support manual configurations under scope `recommend-home` as outlined in `d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_recommend_1\handoff.md` and the patch `d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_recommend_1\recommendation-home.patch`.
   - Ensure it fetches configurations with scope `recommend-home`, filters inactive/deleted stores, sorts in memory by `pinRank`, and falls back to original personalized recommendations logic if the pinned list is empty.

3. **Frontend Content Administration Tab**:
   - Path: `frontend/apps/web/src/app/admin/content/page.tsx`
   - Modify this file to implement the new "Đề xuất tối nay" tab as detailed in `d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_recommend_2\handoff.md`.
   - Ensure:
     - The new tab is correctly rendered in activeTab state ('recommend').
     - Pinned stores list displays Up/Down buttons to reorder, and a delete button.
     - Moving Up/Down correctly swaps the ranks and calls `adminRankingsApi.update` for both stores concurrently via `Promise.all`.
     - Removal prompts for custom confirmation via `feedback.showModal()` before calling `adminRankingsApi.delete`.
     - Adding a store is limited to 8 items. If exceeded, show a warning modal using `feedback.showModal()` (never use native alert).
     - Store searching uses the `/admin/stores` endpoint to search all active stores (avoiding `/admin/rankings/options` which filters out Hanoi/HCM when no city is active).

4. **Testing & Verification**:
   - Write unit tests verifying your changes in the backend service and verify that all tests pass.
   - Run the frontend build and linter to make sure there are no compiler or styling errors.
   - Document all verification commands and outcomes in your handoff report.

5. **MANDATORY INTEGRITY WARNING**:
   DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Once completed, write your handoff report to `handoff.md` in your working directory.
