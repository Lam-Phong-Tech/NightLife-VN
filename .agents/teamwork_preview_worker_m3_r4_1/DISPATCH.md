## 2026-08-05T09:19:02Z
You are Worker 4 (Remediation Worker) for Milestone 3 (PR 3: Partner Shell, Strangler Pattern & Sub-routes).
Working directory: d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_m3_r4_1\

Task:
Remediate the unit test failure in `frontend/apps/web/__tests__/PartnerSettlementMoney.test.tsx`.

Failure Context:
Running `pnpm test -- PartnerSettlementMoney.test.tsx` fails with:
`Error: [vitest] No "useRouter" export is defined on the "next/navigation" mock. Did you forget to return it from "vi.mock"?`

Target File to Fix:
`frontend/apps/web/__tests__/PartnerSettlementMoney.test.tsx` (around line 27):
- `vi.mock('next/navigation', ...)` needs `useRouter` added to the mock return object:
  ```typescript
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  ```

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Verification Commands to Run:
1. `cd frontend/apps/web && pnpm check-types` (MUST pass cleanly with exit code 0)
2. `cd frontend/apps/web && pnpm test -- PartnerShellClient.test.tsx` (MUST pass 5/5)
3. `cd frontend/apps/web && pnpm test -- PartnerShellClient.edge-cases.test.tsx` (MUST pass 11/11)
4. `cd frontend/apps/web && pnpm test -- PartnerSettlementMoney.test.tsx` (MUST pass 1/1)
5. Git commit: After all 4 verification commands pass cleanly, execute `git add`, `git commit -m "fix(partner-test): add useRouter mock export to PartnerSettlementMoney.test.tsx"` and `git push`.

Output Requirements:
1. Create `progress.md` with step-by-step remediation log.
2. Create `handoff.md` in your working directory (`d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_m3_r4_1\handoff.md`) with verification evidence (including commit hash).
3. Send a message to parent (`6c6f2bdb-7ba6-40c7-91bb-949d4ed343c9`).
