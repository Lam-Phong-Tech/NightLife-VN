## Challenge Summary

**Overall risk assessment**: MEDIUM

## Challenges

### [High] Challenge 1: Non-atomic Sequential API Updates for Reordering

- Assumption challenged: The system assumes all three sequential API calls in `handleMoveRecommend` (`adminRankingsApi.update`) will succeed.
- Attack scenario: An admin attempts to move a pinned store up or down, but the second or third API request fails due to a network glitch, timeout, or backend error.
- Blast radius:
  - If Step 1 succeeds (setting `swapItem`'s pinRank to `null`) but Step 2 or 3 fails: `swapItem` will remain unpinned (`null`), leaving the list with fewer than expected items and a gap in ordering.
  - The UI will reload incorrect/incomplete ranking list.
- Mitigation: Propose a batch update endpoint `PUT /admin/rankings/reorder` on the backend that handles the entire swapping logic in a database transaction, rather than executing three separate HTTP requests from the client.

### [Medium] Challenge 2: Client-side Race Conditions in Debounced Search

- Assumption challenged: The search input uses a 500ms debounce. It is assumed the user will wait for search results before making actions, and that responses will return in order.
- Attack scenario: An admin types quickly, triggers multiple searches under slow network conditions. If the response of the first query returns after the second query's response, the results will display stale data.
- Blast radius: Stale search results displayed, potentially causing the admin to pin the wrong store.
- Mitigation: Implement an abort controller to cancel previous search requests when a new search query is executed.

## Stress Test Results

- Reorder triggers sequential calls → Expected: All 3 calls completed in sequence → Actual/predicted behavior: If any call fails, the database state remains inconsistent → FAIL (Robustness)

## Unchallenged Areas

- Backend role validation: Out of scope for this frontend review.
