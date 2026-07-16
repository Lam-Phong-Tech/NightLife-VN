## Review Summary

**Verdict**: REQUEST_CHANGES

## Findings

### [Critical] Finding 1: Frontend Test Failure (Reordering)

- What: The test "3. Reordering via Up/Down buttons works correctly and updates rankings in backend" fails.
- Where: `frontend/apps/web/__tests__/AdminRecommendHome.test.tsx` (lines 187-229)
- Why:
  1. `handleMoveRecommend` in `src/app/admin/content/page.tsx` performs 3 sequential `adminRankingsApi.update` calls (to avoid unique constraint violations in the backend by setting `pinRank` to `null` first).
  2. The test asserts `expect(mockUpdate).toHaveBeenCalledTimes(2)` synchronously immediately after clicking the reorder button. At the moment of assertion, only the first call has been initiated, meaning `mockUpdate` has only been called 1 time.
  3. Furthermore, since there are 3 updates in `handleMoveRecommend`, the expectation of `2` calls is incorrect and should be updated to `3` calls.
- Suggestion:
  1. Wrap the click inside `act()` or await the async operation using `waitFor` to allow all sequential API calls to execute:
     ```typescript
     await waitFor(() => {
       expect(mockUpdate).toHaveBeenCalledTimes(3);
     });
     ```
  2. Update the assertions to check for all three calls.

### [Minor] Finding 2: Unhandled Search API Errors in UI

- What: When searching for stores to recommend, any API failures are caught with `console.error(err)` but not communicated to the user.
- Where: `frontend/apps/web/src/app/admin/content/page.tsx` (lines 330-334)
- Why: The admin may be left with a stuck "Đang tìm..." state or empty results without knowing the request failed.
- Suggestion: Use `feedback.showToast` to notify the user of search errors.

## Verified Claims

- Default browser alerts/confirms/prompts avoided → verified via static code analysis (grep) → PASS
- Native browser select dropdowns avoided → verified via static code analysis (grep) → PASS
- Native browser date pickers avoided → verified via static code analysis (grep) → PASS
- Max 8 pinned stores limit working on frontend → verified via integration test case 2 → PASS
- Custom confirmation modal on store deletion → verified via integration test case 4 → PASS

## Coverage Gaps

- Transaction safety of reordering: The reordering process executes three separate HTTP PUT calls. If one fails midway, the database's pin order will be in an inconsistent state.
  - Risk level: Medium
  - Recommendation: Accept risk for now, but design a bulk reorder backend endpoint `/admin/rankings/reorder` in future phases.

## Unverified Items

- None.
