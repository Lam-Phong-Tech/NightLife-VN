## 2026-08-05T08:48:41Z
You are Worker 3 (Remediation Worker) for Milestone 3 (PR 3: Partner Shell, Strangler Pattern & Sub-routes).
Working directory: d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_m3_r3_1\

Task:
Remediate the project-scoped user rule violation identified in `frontend/apps/web/src/app/partner/page.tsx`.

Rule Violation Context:
Project Rule in `.agents/AGENTS.md`:
"Tuyệt đối không sử dụng thư viện DatePicker/DateTimePicker mặc định của trình duyệt (còn gọi là 'native browser date picker'), hãy sử dụng custom date-picker component tự dựng của dự án."

Target File to Fix:
`frontend/apps/web/src/app/partner/page.tsx` (Lines 6568 & 6576)
- Currently uses: `<input value={settlementFilters.fromDate} onChange={(event) => updateSettlementFilter('fromDate', event.target.value)} type="date" style={inputStyle} />`
- Currently uses: `<input value={settlementFilters.toDate} onChange={(event) => updateSettlementFilter('toDate', event.target.value)} type="date" style={inputStyle} />`

Remediation Instructions:
1. Search the codebase for existing custom date picker components used in `frontend/apps/web/src/` (e.g. custom date input / date picker component or custom dropdown/modal date selector).
2. Replace both native `<input type="date">` elements in `src/app/partner/page.tsx` with the project's custom date picker component (or a custom styled date input component that does NOT use browser native `type="date"` / `type="datetime-local"`).
3. Ensure settlement date filter functionality (`fromDate`, `toDate`) continues to work seamlessly.

Verification Commands to Run:
1. `cd frontend/apps/web && pnpm check-types` (MUST pass cleanly with exit code 0)
2. `cd frontend/apps/web && pnpm test -- PartnerShellClient.test.tsx` (MUST pass)
3. `cd frontend/apps/web && pnpm test -- PartnerShellClient.edge-cases.test.tsx` (MUST pass)
4. Git commit: After verification passes, execute `git add`, `git commit -m "fix(partner): replace native date picker inputs with custom date picker per project rules"` and `git push`.

Output Requirements:
1. Create `progress.md` with step-by-step remediation log.
2. Create `handoff.md` in your working directory (`d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_m3_r3_1\handoff.md`) with verification evidence (including commit hash).
3. Send a message to parent (`6c6f2bdb-7ba6-40c7-91bb-949d4ed343c9`).
