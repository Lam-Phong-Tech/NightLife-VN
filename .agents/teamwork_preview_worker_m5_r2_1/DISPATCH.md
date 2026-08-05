## 2026-08-05T11:09:21Z
<USER_REQUEST>
You are teamwork_preview_worker assigned to implement Milestone 5 (PR 5: Home Redesign & Monolith Cleanup) Iteration 2 Remediation Fixes.
Your working directory is `d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_m5_r2_1\`.
Read `d:\laragon\www\NightLife-VN\ORIGINAL_REQUEST.md` and `d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_m5_r2_1\handoff.md` before starting.

## Scope of Work (Milestone 5 Iteration 2 Remediation)
Implement the exact 5 Remediation Actions specified in `d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_m5_r2_1\handoff.md`:
1. **`frontend/apps/web/src/app/partner/page.tsx`**:
   - Add `staff: '/partner/settings/staff'` and `settlement: '/partner/activity'` to `panelMap`.
   - In `loadHomeData`, check `if (!signal?.aborted)` before `setData(res)` and in `finally { if (!signal?.aborted) setLoading(false); }` to prevent loading state flicker during fast store switching.
2. **`frontend/apps/web/src/components/ui/ThemedListingSelect.tsx`**:
   - Add `aria-label={ariaLabel ?? placeholder}` to the trigger `<button>` so Testing Library queries find it.
3. **`frontend/apps/web/__tests__/PartnerSettlementMoney.test.tsx`**:
   - Update endpoint mock to handle `/partner/home` returning `metrics` and `recentActivities` containing `mockBillWithNullDiscount`.
4. **`frontend/apps/web/__tests__/PartnerLiteDashboard.test.tsx`**:
   - Update endpoint mock and assertion from `/partner/dashboard-lite` to `/partner/home`.
5. **Testing, Verification & Git Commit**:
   - Run `pnpm check-types` in `frontend/apps/web` (0 errors).
   - Run `pnpm vitest run PartnerHomePage.test.tsx PartnerShellClient.test.tsx PartnerSettlementMoney.test.tsx PartnerActivityPage.test.tsx PartnerNewBillPage.test.tsx usePartnerActivity.test.tsx PartnerLiteDashboard.test.tsx PartnerBillSubmitPage.test.tsx PartnerOfflineScanQueue.test.tsx PartnerShellClient.edge-cases.test.tsx` in `frontend/apps/web` (10/10 test suites passing).
   - Per project user rules (`.agents/AGENTS.md`), create a Git commit and push to Github (`git add`, `git commit -m "fix(partner): remediate panelMap, abort loading state, select aria-label, and legacy partner tests (PR 5)"`, `git push`).

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## User Rules (Strict Adherence Required)
- Sau khi hoàn thành việc chỉnh sửa mã nguồn, hãy tự động tạo một commit trên Github và push lên (`git add`, `git commit -m "..."` và `git push`). Báo cáo lại trong handoff.md sau khi commit thành công.
- Tuyệt đối không dùng alert mặc định của trình duyệt (`alert()`, `confirm()`, `prompt()`), hãy sử dụng toast hoặc modal tự dựng (`useSystemFeedback`).
- Tuyệt đối không sử dụng giao diện thẻ `<select>` mặc định của trình duyệt, hãy sử dụng `ThemedListingSelect` hoặc custom dropdown component.
- Tuyệt đối không sử dụng thư viện DatePicker/DateTimePicker mặc định của trình duyệt (`<input type="date">`), hãy sử dụng Antd `DatePicker`/`RangePicker` custom component.

When finished, write a complete handoff report to `d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_m5_r2_1\handoff.md` and send a message back to parent.
</USER_REQUEST>
