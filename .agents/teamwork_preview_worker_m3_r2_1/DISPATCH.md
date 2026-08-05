## 2026-08-05T08:29:31Z
You are Worker 2 (Remediation Worker) for Milestone 3 (PR 3: Partner Shell, Strangler Pattern & Sub-routes).
Working directory: d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_m3_r2_1\

Task:
Perform targeted remediation fixes to resolve TypeScript check errors and minor recommendations identified during Milestone 3 Gate Verification.

Context & Files to Fix:
1. `frontend/apps/web/__tests__/PartnerShellClient.test.tsx` (Line 144):
   Fix `error TS2532: Object is possibly 'undefined'`.
   Current code: `screen.getAllByText('Quét QR & Đặt chỗ')[0]?.closest('a')`
   Remediation: Safely assert/check the element exists before calling `.closest('a')`, e.g.:
   ```typescript
   const scanEl = screen.getAllByText('Quét QR & Đặt chỗ')[0];
   expect(scanEl).toBeDefined();
   const scanLink = scanEl!.closest('a');
   ```

2. `frontend/apps/web/__tests__/PartnerShellClient.edge-cases.test.tsx` (Line 115):
   Fix `error TS2345: Argument of type 'HTMLElement | undefined' is not assignable to parameter of type 'Element | Document | Node | Window'`.
   Current code: `fireEvent.click(betaOption);`
   Remediation: Safely assert/check before clicking:
   ```typescript
   if (betaOption) fireEvent.click(betaOption);
   ```

3. `frontend/apps/web/src/app/partner/PartnerProviders.tsx` (Line 220):
   Add fallback for legacy sessionStorage key:
   ```typescript
   storedId = window.sessionStorage.getItem('vy-partner-selected-store-id') || window.sessionStorage.getItem('partner_active_store_id');
   ```

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Verification Commands to Run:
1. `cd frontend/apps/web && pnpm check-types` (MUST pass cleanly with exit code 0)
2. `cd frontend/apps/web && pnpm test -- PartnerShellClient.test.tsx` (MUST pass 5/5)
3. `cd frontend/apps/web && pnpm test -- PartnerShellClient.edge-cases.test.tsx` (MUST pass 11/11)
4. Git commit: After verification passes, execute `git add`, `git commit -m "fix(partner): resolve test suite TS compilation errors and add legacy session key fallback"` and `git push`.

Output Requirements:
1. Create `progress.md` with step-by-step remediation log and verification outputs.
2. Create `handoff.md` in your working directory (`d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_m3_r2_1\handoff.md`) with verification evidence (including commit hash).
3. Send a message to parent (`6c6f2bdb-7ba6-40c7-91bb-949d4ed343c9`).
