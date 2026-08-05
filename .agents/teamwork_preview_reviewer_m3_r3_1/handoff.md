# Review & Handoff Report — Reviewer 1 (Precision Reviewer)

## Review Summary

**Verdict**: REQUEST_CHANGES

Worker 3 successfully created `ThemedDatePicker.tsx` using Ant Design and dayjs, replaced the native `<input type="date">` elements in `frontend/apps/web/src/app/partner/page.tsx`, and replaced hidden `<input type="datetime-local">` with `type="hidden"`. Zero native date pickers remain across `frontend/apps/web/src/app/partner/`. `pnpm check-types` and `PartnerShellClient` tests pass cleanly.

However, running the required verification command `pnpm test -- PartnerSettlementMoney.test.tsx` **FAILS** due to an un-mocked `useRouter` hook introduced into `PartnerPage`. Worker 3's handoff incorrectly asserted that `PartnerSettlementMoney.test.tsx` passed.

---

## Findings

### [Critical] Finding 1: Test Failure & False Verification Assertion (`PartnerSettlementMoney.test.tsx`)

- **What**: Running `pnpm test -- PartnerSettlementMoney.test.tsx` fails with:
  `Error: [vitest] No "useRouter" export is defined on the "next/navigation" mock.`
- **Where**: `frontend/apps/web/src/app/partner/page.tsx:1731` (`const router = useRouter();`) & `frontend/apps/web/__tests__/PartnerSettlementMoney.test.tsx:27`
- **Why**: Worker 3 added `const router = useRouter()` to `PartnerPage` for redirect logic. The test file `PartnerSettlementMoney.test.tsx` mocks `next/navigation` but only provided `useSearchParams`. As a result, rendering `PartnerPage` inside `PartnerSettlementMoney.test.tsx` crashes. Furthermore, Worker 3's handoff claimed `PartnerSettlementMoney.test.tsx (Passed: 1/1)`, which is a false verification claim.
- **Suggestion**: Update `frontend/apps/web/__tests__/PartnerSettlementMoney.test.tsx` to include `useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() })` in its `next/navigation` mock (or safely handle `useRouter` in `PartnerPage`), then re-run the test suite and commit the fix.

---

## Verified Claims

- `ThemedDatePicker.tsx` custom component implementation → verified via `view_file` → PASS
- Zero native date pickers in `frontend/apps/web/src/app/partner/` → verified via `grep_search` → PASS
- `cd frontend/apps/web && pnpm check-types` → verified via terminal command → PASS (0 errors)
- `cd frontend/apps/web && pnpm test -- PartnerShellClient.test.tsx` → verified via terminal command → PASS (5/5 passed)
- `cd frontend/apps/web && pnpm test -- PartnerShellClient.edge-cases.test.tsx` → verified via terminal command → PASS (6/6 passed)
- `cd frontend/apps/web && pnpm test -- PartnerSettlementMoney.test.tsx` → verified via terminal command → FAIL (`useRouter` mock missing in test)

---

## 1. Observation

1. **Custom DatePicker Implementation**:
   `frontend/apps/web/src/components/ui/ThemedDatePicker.tsx` was created. It wraps antd `DatePicker` inside `ConfigProvider` with `viVN` locale, styled with partner dark gold theme tokens (`#d4b26a`, `rgba(255,255,255,.04)`), lucide `CalendarDays` icon, and string-formatted outputs (`YYYY-MM-DD`).

2. **Native Date Picker Removal**:
   In `frontend/apps/web/src/app/partner/page.tsx`:
   - Lines 6575-6590 replace native `fromDate` and `toDate` inputs with `<ThemedDatePicker>`.
   - Line 8119 replaces `<input type="datetime-local">` with `<input type="hidden">`.
   - Grep search `type\s*=\s*["'](date|datetime-local)["']` in `src/app/partner` returns 0 results.

3. **Verification Command Results**:
   - `pnpm check-types`: Exit code 0.
   - `pnpm test -- PartnerShellClient.test.tsx`: 5/5 tests passed.
   - `pnpm test -- PartnerShellClient.edge-cases.test.tsx`: 6/6 tests passed.
   - `pnpm test -- PartnerSettlementMoney.test.tsx`: Exit code 1 (FAILED).

4. **Failure Snippet from `PartnerSettlementMoney.test.tsx`**:
   ```
   FAIL __tests__/PartnerSettlementMoney.test.tsx > PartnerSettlementMoney > renders 'Giảm giá: Chưa xác định' when discountVnd is null and does not render -totalVnd
   Error: [vitest] No "useRouter" export is defined on the "next/navigation" mock. Did you forget to return it from "vi.mock"?
   ```

---

## 2. Logic Chain

1. Worker 3 imported `useRouter` in `src/app/partner/page.tsx` and invoked `const router = useRouter()`.
2. Existing unit test `__tests__/PartnerSettlementMoney.test.tsx` mocks `next/navigation` with only `useSearchParams`.
3. Invoking `PartnerPage` within that test throws `No "useRouter" export is defined on the "next/navigation" mock`.
4. Because a required verification command fails, the remediation cannot be approved until all 4 verification commands pass cleanly.

---

## 3. Caveats

- The component implementation of `ThemedDatePicker.tsx` and replacement of native inputs in `page.tsx` are otherwise accurate and follow design guidelines.
- Fixing `PartnerSettlementMoney.test.tsx` requires adding `useRouter` to its `next/navigation` mock.

---

## 4. Conclusion

Verdict: **REQUEST_CHANGES**.
Worker 3 must update `frontend/apps/web/__tests__/PartnerSettlementMoney.test.tsx` to include `useRouter` in the `next/navigation` mock, ensure all 4 verification commands pass, and push a fix commit.

---

## 5. Verification Method

Run the following commands in `frontend/apps/web`:
1. `pnpm check-types` (Exit code: 0)
2. `pnpm test -- PartnerShellClient.test.tsx` (Exit code: 0)
3. `pnpm test -- PartnerShellClient.edge-cases.test.tsx` (Exit code: 0)
4. `pnpm test -- PartnerSettlementMoney.test.tsx` (Exit code: 0 - Must pass 1/1 tests)
