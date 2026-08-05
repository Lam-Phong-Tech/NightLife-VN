## 2026-08-05T14:18:08+07:00
You are Worker 3 for Milestone 1 (PR 1 Remediation Iteration 3).
Your working directory is: d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_m1_r3\
Original request file: d:\laragon\www\NightLife-VN\ORIGINAL_REQUEST.md
Reviewer 1 report file: d:\laragon\www\NightLife-VN\.agents\teamwork_preview_reviewer_m1_r2_1\handoff.md

MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Task Scope & Detailed Instructions:
1. Open `frontend/apps/web/__tests__/PartnerSettlementMoney.test.tsx`.
2. Locate line 164 where `screen.getByText("BILL-NULL-001")` is called.
3. Change line 164 to use `expect(screen.getAllByText("BILL-NULL-001").length).toBeGreaterThan(0)` (or `expect(screen.getAllByText("BILL-NULL-001")[0]).toBeInTheDocument()`) because `BILL-NULL-001` is rendered twice in `PartnerPage` (once in the desktop table `<td>` and once in the mobile card `<strong className="partner-settlement-mobile-code">`).
4. Run verification:
   - Run `pnpm check-types` in `frontend/apps/web` (MUST pass with exit code 0).
   - Run `pnpm exec vitest run __tests__/PartnerSettlementMoney.test.tsx` in `frontend/apps/web` (MUST pass with exit code 0, 1/1 passed).
   - Run `pnpm exec vitest run __tests__/BillSubmitPage.test.tsx __tests__/SeoHighPriority.test.ts` in `frontend/apps/web` (MUST pass with exit code 0).
   - Run `pnpm exec jest nightlife-data.service.spec.ts --runInBand` in `backend/` (MUST pass with exit code 0, 175/175 passed).
5. Commit and push:
   - Execute `git add`, `git commit -m "fix(web): use getAllByText for settlement bill code test assertion"`, and `git push`.
6. Write handoff report to `d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_m1_r3\handoff.md` and send_message to parent.
