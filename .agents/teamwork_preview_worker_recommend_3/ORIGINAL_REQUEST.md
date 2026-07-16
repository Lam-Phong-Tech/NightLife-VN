## 2026-07-16T07:12:10Z
You are Worker 3 (archetype: teamwork_preview_worker).
Your working directory is d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_recommend_3.
Your role is to update the frontend test file and verify that the frontend tests pass.

Scope of work:
1. File to modify: `frontend/apps/web/__tests__/AdminRecommendHome.test.tsx`
2. Mocks to add:
   - Add `adminList: vi.fn().mockResolvedValue([]),` to both `categoriesApi` and `campaignsApi` mocks.
3. Test 3 (`3. Reordering via Up/Down buttons works correctly and updates rankings in backend`) fix:
   - Wrap the update assertion in a `waitFor` call.
   - Expect `mockUpdate` to have been called 3 times.
   - Use `expect(mockUpdate).toHaveBeenNthCalledWith(...)` or similar to assert the 3 sequential calls:
     - 1st call: ID 'rec-1', pinRank: null.
     - 2nd call: ID 'rec-2', pinRank: 1.
     - 3rd call: ID 'rec-1', pinRank: 2.
4. Run frontend tests in `frontend/apps/web` using the command `pnpm test __tests__/AdminRecommendHome.test.tsx` (or whatever the test runner is, make sure it passes).
5. Once all tests pass, run git add, commit, and push per the project-scoped rules in AGENTS.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Handoff criteria:
- Write a handoff.md report summarizing the changes made, test output, and git push confirmation.
