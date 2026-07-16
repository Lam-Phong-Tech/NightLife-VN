## 2026-07-16T06:56:59Z
You are teamwork_preview_worker_recommend_2. Working directory: d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_recommend_2.
Your task is to remediate the backend and frontend findings raised by the verification reviewers:

1. **Backend DTO & Collision Checks**:
   - Path: `backend/src/nightlife-data/nightlife-data.service.ts`
   - Implement `assertNoPinnedRankingCollision` so that it queries the database for any active, non-deleted ranking config that shares the targetType, cityCode, category, scope, and pinRank, excluding the item with `excludeId` if provided. If a collision is found, throw a `BadRequestException` (or `ConflictException`).
   - Note: If `pinRank` is null or undefined, return early.

2. **Backend Target Options City Filtering Bug**:
   - Path: `backend/src/nightlife-data/nightlife-data.service.ts`
   - In `listAdminRankingTargetOptions`, check the cityCode logic:
     - When `cityCode` is falsy or not provided, do not apply any city/area filters (remove the `NOT: { OR: ... }` block that explicitly excludes Hanoi/HCM).
     - Do this for both the STORE query (around line 1332) and the CAST query (around line 1433).

3. **Frontend Reordering Swapping (Avoid Collisions)**:
   - Path: `frontend/apps/web/src/app/admin/content/page.tsx`
   - Update `handleMoveRecommend` to perform a 3-step sequential update instead of concurrent `Promise.all` to avoid colliding with active ranks:
     1. Update the swapItem to `pinRank: null` first.
     2. Update the currentItem to `swapRank`.
     3. Update the swapItem to `currentRank`.

4. **Frontend ESLint Errors Remediation**:
   - Path: `frontend/apps/web/src/app/admin/content/page.tsx`
   - Escape all unescaped quotes in JSX text. For example, change `"Đề xuất tối nay"` to `&quot;Đề xuất tối nay&quot;` (or search for unescaped double quotes in lines 1257, 1346, 1456, and others).
   - Resolve function hoisting inside React effects: Move the `useEffect` hooks below the declaration of the functions they call (like `fetchRecommendItems` and `searchRecommendStore`), or declare those functions before the hooks.
   - Replace explicit `any` casting in `(store.area as any).name` with a safe interface cast like `(store.area as { name: string }).name`.
   - Add missing hook dependencies in `useEffect` or add `// eslint-disable-next-line react-hooks/exhaustive-deps`.

5. **Verification**:
   - Run backend tests to ensure everything compiles and passes cleanly:
     `pnpm --filter backend test src/nightlife-data/nightlife-data.service.spec.ts`
   - Run frontend linter and typechecks to verify all ESLint errors are resolved:
     `pnpm --filter web lint`
     `pnpm --filter web check-types`
   - Once all checks pass, commit and push changes to GitHub.

6. **MANDATORY INTEGRITY WARNING**:
   DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write your findings and verification results to handoff.md in your working directory.
