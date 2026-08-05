## 2026-08-05T17:15:05+07:00
You are teamwork_preview_worker (PR5 Implementation Worker). Your working directory is d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_m5_1\.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

USER RULES TO STRICTLY OBEY:
- DO NOT use native browser alert(), confirm(), prompt(). Use toast or custom project modal (`useSystemFeedback`).
- DO NOT use native browser <select> element. Use custom component `ThemedListingSelect`.
- DO NOT use native browser datepicker. Use Antd DatePicker or project custom datepicker component.
- After finishing code edits, create a git commit and push (`git add .`, `git commit -m "..."`, `git push`).

INPUT SPECIFICATION & ANALYSIS FILES TO READ FIRST:
- MANDATORY: d:\laragon\www\NightLife-VN\ORIGINAL_REQUEST.md
- d:\laragon\www\NightLife-VN\.agents\orchestrator\PROJECT.md
- d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_m5_1\analysis.md
- d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_m5_3\analysis.md

ASSIGNED TASK: Implement Milestone 5 (PR 5: Home Redesign & Monolith Cleanup)

Step 1. Redesign `frontend/apps/web/src/app/partner/page.tsx` into a clean Home Dashboard (< 300 lines):
- Consume `fetchPartnerHome(selectedStoreId)` from `@/lib/api/partner-portal`.
- Render Overview KPI Cards: `totalRevenue` (formatted VND with `discountVnd === null` handled as *"Giảm giá: Chưa xác định"*), `billCount`, `bookingCount`, `activeCouponsCount`.
- Render Quick Action Navigation Tiles:
  - Nạp Hóa Đơn Mới -> `/partner/activity/new-bill`
  - Quét Mã QR -> `/partner/scan`
  - Quản lý Danh mục -> `/partner/listing`
  - Cấu hình Cửa hàng -> `/partner/settings`
  - Quản lý Nhân viên -> `/partner/settings/staff`
- Render Recent Activities Feed Preview: Top 5 items with status pills, customer info, formatted money, and link to `/partner/activity`.
- Handle legacy URL query parameter fallbacks (`?panel=scan` -> `/partner/scan`, `?panel=listing` -> `/partner/listing`, `?panel=settings` -> `/partner/settings`, `?panel=bill` -> `/partner/activity/new-bill`, `?panel=activity` -> `/partner/activity`) via `router.replace()`.

Step 2. Monolith Cleanup & Test Fixes:
- Remove 10,800+ lines of extracted legacy panels from `page.tsx`.
- Update legacy test files (`PartnerLiteDashboard.test.tsx`, `PartnerOfflineScanQueue.test.tsx`, `PartnerBillSubmitPage.test.tsx`) to supply `useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() })` in `vi.mock('next/navigation')`.

Step 3. Unit Tests & Full Suite Verification:
- Create `frontend/apps/web/__tests__/PartnerHomePage.test.tsx` testing Home Dashboard KPI rendering, quick action navigation links, recent activity list, and zero monolith code regressions.
- Run typecheck: `cd frontend/apps/web && pnpm check-types`
- Run unit tests: `cd frontend/apps/web && pnpm test`
- Run production build: `cd frontend/apps/web && pnpm build`

Step 4. Git Commit & Push:
- Run `git add .`
- Run `git commit -m "feat(frontend): redesign partner home dashboard and cleanup monolith (PR 5)"`
- Run `git push`

Step 5. Report Completion:
- Write `changes.md` and `handoff.md` in `d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_m5_1\`.
- Send completion message to parent orchestrator via send_message.
