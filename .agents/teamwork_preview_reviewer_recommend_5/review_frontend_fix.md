# Frontend Test Fix Review - AdminRecommendHome.test.tsx

## Quality Review

**Verdict**: APPROVE

### Findings

- **No critical or major findings found.** The implementation perfectly satisfies the requested requirements.
- **Minor Finding 1**: The test file contains multiple warnings regarding state updates not wrapped in `act(...)` during deletion test (Test 4):
  - *Where*: `frontend/apps/web/__tests__/AdminRecommendHome.test.tsx` line 236.
  - *Why*: State transitions occurring asynchronously when the modal confirms are not wrapped in `act(...)`.
  - *Suggestion*: In a future maintenance round, the confirmation click and wait logic can be wrapped in `act(...)` or verified using `await screen.findByText` to ensure state updates have fully propagated.

### Verified Claims

1. **adminList stubs are added to categoriesApi and campaignsApi mocks**
   - *Method*: Inspected `frontend/apps/web/__tests__/AdminRecommendHome.test.tsx` at lines 81 and 94.
   - *Result*: PASS. `adminList` is mocked as `vi.fn().mockResolvedValue([])` for both APIs.
2. **Reordering test (Test 3) asserts mockUpdate correctly using waitFor and 3 expected calls**
   - *Method*: Inspected `frontend/apps/web/__tests__/AdminRecommendHome.test.tsx` lines 222-233 and ran the test suite using Vitest.
   - *Result*: PASS. The assertion uses `await waitFor(() => { expect(mockUpdate).toHaveBeenCalledTimes(3); });` followed by checking the 3 calls in correct sequence.
3. **All tests pass**
   - *Method*: Ran `pnpm test __tests__/AdminRecommendHome.test.tsx` in `frontend/apps/web`.
   - *Result*: PASS. 4 tests passed, 0 failed.

---

## Adversarial Review (Challenge Report)

**Overall risk assessment**: LOW

### Challenges

#### [Medium] Challenge 1: Lack of Race Condition and Latency Simulation in Reordering Tests
- **Assumption challenged**: The test assumes that database rank updates complete instantaneously and sequentially in the exact order requested (`mockUpdate` resolves instantly).
- **Attack scenario**: In a real network environment, the 3 sequential API requests triggered by reordering may arrive out of order at the backend, or some requests might fail. Because the UI has no optimistic UI rollback mechanism or loading lock, this could result in corrupted ordering state in the DB or inconsistent UI.
- **Blast radius**: Low-to-medium. An admin clicking rapid reordering buttons could see items jump around or the final ordering order get scrambled.
- **Mitigation**: Implement transaction-based ordering or single-request bulk update for ranking list on the backend, or add UI loading state locks to prevent multiple rapid clicks during reordering.

#### [Low] Challenge 2: Test relies on exact DOM CSS selectors for SVGs
- **Assumption challenged**: The test queries Up/Down and Delete buttons using direct SVGs `innerHTML` and `M18 15l-6-6-6 6` paths.
- **Attack scenario**: If the icon library, UI library, or specific SVG icons are updated or replaced, these tests will break immediately even if the logic is correct.
- **Blast radius**: Low. Will break build pipelines on UI style updates.
- **Mitigation**: Add explicit `data-testid` attributes (e.g. `data-testid="move-up-btn"`, `data-testid="delete-btn"`) on the elements to decouple testing logic from SVG paths.

---

## Coverage Gaps
- **Unexplored area**: Verification of actual visual layout / CSS styled components.
- **Risk level**: Low.
- **Recommendation**: Accept risk. Functional tests cover the behavior sufficiently.
