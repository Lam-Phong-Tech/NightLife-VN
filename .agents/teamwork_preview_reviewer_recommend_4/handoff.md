# Handoff Report — Reviewer 4 (Frontend Review)

## 1. Observation
We ran the frontend integration tests using the command:
`pnpm test __tests__/AdminRecommendHome.test.tsx`
in the `frontend/apps/web` workspace directory. The test suite failed with the following error:

```
 FAIL  __tests__/AdminRecommendHome.test.tsx > Admin Recommend Home content page UI verification > 3. Reordering via Up/Down buttons works correctly and updates rankings in backend
AssertionError: expected "vi.fn()" to be called 2 times, but got 1 times
 ❯ __tests__/AdminRecommendHome.test.tsx:220:24
    218|     // swapRank for currentItem (Club Two, index 1) will be 1 (Lounge …
    219|     // currentRank for swapItem (Lounge One, index 0) will be 2 (Club …
    220|     expect(mockUpdate).toHaveBeenCalledTimes(2);
       |                        ^
    221|     expect(mockUpdate).toHaveBeenCalledWith('rec-2', expect.objectCont…
    222|       targetId: 'store-2',
```

In `frontend/apps/web/src/app/admin/content/page.tsx` (lines 400-442), `handleMoveRecommend` is defined as follows:
```typescript
  const handleMoveRecommend = async (index: number, direction: 'up' | 'down') => {
    ...
    try {
      // Step 1: Update swapItem to pinRank: null first
      await adminRankingsApi.update(swapItem.id, { ... });

      // Step 2: Update currentItem to swapRank
      await adminRankingsApi.update(currentItem.id, { ... });

      // Step 3: Update swapItem to currentRank
      await adminRankingsApi.update(swapItem.id, { ... });
      ...
```

## 2. Logic Chain
1. The test triggers the reordering functionality by firing a click event `fireEvent.click(upButtons[1]!)`, which triggers `handleMoveRecommend(1, 'up')`.
2. Unlike the featured services reordering (which uses `Promise.all` for two parallel updates), the recommend reordering performs three sequential updates with `await` statements (first setting the target's pinRank to `null` to avoid DB unique constraint conflicts, then updating the current item's rank, then updating the target's new rank).
3. The test asserts `expect(mockUpdate).toHaveBeenCalledTimes(2)` synchronously immediately after clicking, without awaiting the completion of the asynchronous update chain (e.g. using `waitFor`).
4. At the synchronous moment of assertion, only the first update call (Step 1) has been executed. Hence, the mock function has been called only 1 time, causing the assertion to fail.
5. Additionally, the test asserts that `mockUpdate` was called 2 times, which is incorrect because `handleMoveRecommend` executes exactly 3 updates.
6. Thus, the test code has a bug and needs to be updated to wait for the async execution and assert 3 calls instead of 2.

## 3. Caveats
- We did not modify any source code or test code to fix the failure, in strict accordance with the "Review-only" constraint.
- The unique constraints and ordering logic on the backend were assumed to match the expectations of the frontend's sequential call implementation.

## 4. Conclusion
- **Verdict**: **FAIL** / **REQUEST_CHANGES**
- **Explanation**: The frontend implementation code conforms to the specifications and all project-scoped rules in `.agents/AGENTS.md` (it successfully avoids native browser alerts, native selects, and native date pickers, instead using custom modal components, tab pickers, and Ant Design's RangePicker). However, the test code in `__tests__/AdminRecommendHome.test.tsx` is broken and fails to pass. The test must be modified to properly await the async execution and assert 3 mock calls.

## 5. Verification Method
- Navigate to: `frontend/apps/web`
- Command: `pnpm test __tests__/AdminRecommendHome.test.tsx`
- Invalidation condition: The test suite fails on Case 3 (Reordering). Once the test code is corrected, all tests should pass.
