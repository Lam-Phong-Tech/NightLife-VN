# Handoff Report — Challenger Verification (Milestone 1, PR 1 Iteration 2)

## Verdict: REQUEST_CHANGES

---

## 1. Observation

### Command 1: TypeScript Check
- **Command**: `pnpm check-types` in `frontend/apps/web/`
- **Result**: PASSED (Exit code 0, 0 TypeScript errors).
- **Log**:
  ```text
  > web@0.0.0 check-types D:\laragon\www\NightLife-VN\frontend\apps\web
  > tsc --noEmit
  ```

### Command 2: PartnerSettlementMoney Test
- **Command**: `pnpm test PartnerSettlementMoney.test.tsx` in `frontend/apps/web/`
- **Result**: FAILED (Exit code 1, 0/1 passed).
- **Verbatim Error**:
  ```text
  FAIL __tests__/PartnerSettlementMoney.test.tsx > PartnerSettlementMoney > renders 'Giảm giá: Chưa xác định' when discountVnd is null and does not render -totalVnd
  TestingLibraryElementError: Found multiple elements with the text: BILL-NULL-001

  Here are the matching elements:

  Ignored nodes: comments, script, style
  <td style="padding: 14px 12px; color: var(--partner-gold, #d4b26a); font-size: 12px; font-weight: 900; border-bottom: 1px solid var(--partner-border-hair, rgba(255,255,255,.08));">
    BILL-NULL-001
  </td>

  Ignored nodes: comments, script, style
  <strong class="partner-settlement-mobile-code">
    BILL-NULL-001
  </strong>

  (If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).
  ```

### Command 3: BillSubmitPage Test
- **Command**: `pnpm test BillSubmitPage.test.tsx` in `frontend/apps/web/`
- **Result**: FAILED (Exit code 1).
  - `__tests__/BillSubmitPage.test.tsx`: PASSED (5/5 passed).
  - `__tests__/PartnerBillSubmitPage.test.tsx` (matched by Vitest file pattern): FAILED (2/3 failed).
- **Verbatim Errors in `PartnerBillSubmitPage.test.tsx`**:
  - Test 1: `Unable to find an element with the text: 2 quán trong scope`
  - Test 2: `Found multiple elements with the text: BILL-NEON` (matching both `<td>BILL-NEON</td>` and `<span class="partner-bill-mobile-code">BILL-NEON</span>`).

---

## 2. Logic Chain

1. **`pnpm check-types`**:
   - Compiles all TypeScript files without emission using `tsc --noEmit`. Exited with 0 errors, confirming all type definitions and syntax are valid.

2. **`PartnerSettlementMoney.test.tsx` Failure**:
   - The UI layout for partner settlement rendering was updated to support responsive desktop (table `<td>`) and mobile card views (`<strong class="partner-settlement-mobile-code">`).
   - `PartnerSettlementMoney.test.tsx:164` uses `screen.getByText("BILL-NULL-001")`, which expects exactly one matching element in DOM.
   - Because both desktop table cell and mobile card element exist simultaneously in testing-library's JS-DOM render, `screen.getByText` throws a `TestingLibraryElementError`.
   - Test assertion needs to be updated to `screen.getAllByText("BILL-NULL-001")[0]` or `screen.findAllByText(...)`.

3. **`PartnerBillSubmitPage.test.tsx` Failure**:
   - `PartnerBillSubmitPage.test.tsx` failed due to missing text node `"2 quán trong scope"` and duplicate elements for `"BILL-NEON"` across table and mobile view elements.

---

## 3. Caveats

- `BillSubmitPage.test.tsx` itself passed 5/5 tests cleanly. However, running `pnpm test BillSubmitPage.test.tsx` triggers Vitest's pattern matcher, which also executes `PartnerBillSubmitPage.test.tsx` and fails with exit code 1.
- No business logic or type errors were found; failures are mock/query assertions in test files caused by duplicate DOM nodes between desktop table view and mobile card view.

---

## 4. Conclusion

- **Verdict**: **REQUEST_CHANGES**
- **Action Required**:
  1. Fix `frontend/apps/web/__tests__/PartnerSettlementMoney.test.tsx` line 164 to handle multiple text elements (e.g., using `screen.getAllByText("BILL-NULL-001")[0]`).
  2. Fix `frontend/apps/web/__tests__/PartnerBillSubmitPage.test.tsx` to handle duplicate bill text elements and missing `"2 quán trong scope"` assertion.

---

## 5. Verification Method

Execute the following commands from `frontend/apps/web/`:

```bash
cd d:\laragon\www\NightLife-VN\frontend\apps\web
pnpm check-types
pnpm test PartnerSettlementMoney.test.tsx
pnpm test BillSubmitPage.test.tsx
```

All three must pass cleanly with exit code 0.
