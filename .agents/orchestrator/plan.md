# Implementation Plan: "Đề xuất tối nay" (Recommend Home) Manual Configuration

This plan details the steps to build the manual configuration feature and home page display of up to 8 pinned stores for the "Đề xuất tối nay" section, including backend APIs and frontend administration tabs and logic.

## 1. Backend Changes (NestJS, Prisma)

### A. DTO Validation Relaxation
- In `backend/src/nightlife-data/dto/admin-ranking.dto.ts`:
  - Relax the `@Max(5)` constraint on `pinRank` for both `CreateAdminRankingConfigDto` and `UpdateAdminRankingConfigDto` to `@Max(8)` (or dynamically support up to 8 when `scope === 'recommend-home'`). Since `@Max(8)` is backward-compatible with 5, we can just change the decorator to:
    `@Max(8, { message: 'Ranking chỉ hỗ trợ Top 1-8' })`

### B. Home Page Recommendation Logic Update
- In `backend/src/nightlife-data/nightlife-data.service.ts` -> `listPublicHomeRecommendations`:
  - Query manual store rankings under `scope: 'recommend-home'`, `status: 'ACTIVE'`, `targetType: 'STORE'`.
  - Check if these manual rankings are configured.
  - If they are, load the associated stores, preserving the order defined by `pinRank`.
  - Filter out any stores that are inactive (`status !== 'ACTIVE'`) or deleted (`deletedAt !== null`).
  - If the manual rankings configuration is empty (0 active stores found), fall back to the existing personalized recommendations score-based logic.

## 2. Frontend Changes (Next.js, Tailwind, React)

### A. Admin Content Panel Tab addition
- In `frontend/apps/web/src/app/admin/content/page.tsx`:
  - Add a new tab: `'recommend-home'` ("Đề xuất tối nay") alongside campaign, banner, etc.
  - Render a management layout when the tab is active:
    - Search bar allowing searching all active stores in the system (using `apiClient('/admin/rankings/options', { params: { targetType: 'STORE', q: searchStoreQuery } })` or a custom store query).
    - A list of currently pinned stores (maximum 8) showing their names, city/district, category, and order index.
    - Add button to pin a store. If the count is already 8, prevent addition and display an error toast/modal (no browser `alert()`).
    - Up / Down buttons next to each pinned store. Clicking them reorders them in the list and updates their `pinRank` in the database directly.
    - Delete button next to each pinned store to remove them from the pinned rankings (calls DELETE API).

### B. Homepage Rendering and Mapping
- Verify that frontend homepage (`frontend/apps/web/src/app/page.tsx`) correctly fetches recommendations and maps them to home cards. Since `listPublicHomeRecommendations` handles the fallback and ordering at the API level, the frontend home page should seamlessly display the configured stores in order.

## 3. Testing and Verification

- **Unit/Integration Tests**:
  - Add test scenarios to verify:
    - Creating and saving rankings under scope `recommend-home`.
    - Pinned stores are returned in order on `/content/recommendations` API.
    - Inactive or deleted stores are automatically filtered.
    - Empty scope falls back to personalized recommendation logic.
- **Auditing**:
  - Run Forensic Integrity Audit.
- **Git Push**:
  - Perform `git add`, `git commit`, and `git push` once successfully verified.
