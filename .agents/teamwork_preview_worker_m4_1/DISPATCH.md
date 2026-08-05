## 2026-08-05T08:49:37Z
You are teamwork_preview_worker (PR4 Implementation Worker). Your working directory is d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_m4_1\.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

USER RULES TO STRICTLY OBEY:
- DO NOT use native browser alert(), confirm(), prompt(). Use toast or custom project modal (`useSystemFeedback`).
- DO NOT use native browser <select> element. Use custom component `ThemedListingSelect`.
- DO NOT use native browser datepicker (e.g. <input type="date"> or <input type="datetime-local">). Use Antd DatePicker or project custom datepicker component.
- After finishing code edits, create a git commit and push (`git add .`, `git commit -m "..."`, `git push`).

INPUT SPECIFICATION & ANALYSIS FILES TO READ FIRST:
- MANDATORY: d:\laragon\www\NightLife-VN\ORIGINAL_REQUEST.md
- d:\laragon\www\NightLife-VN\.agents\orchestrator\PROJECT.md
- d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_m4_1\analysis.md
- d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_m4_2\analysis.md
- d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_m4_3\analysis.md

ASSIGNED TASK: Implement Milestone 4 (PR 4: Activity Core, New Bill Route & Safe Legacy Redirects)

Step 1. Create `frontend/apps/web/src/lib/api/partner-portal.ts`:
- Define TypeScript interfaces: `PartnerHomeOverview`, `PartnerActivityItem`, `PartnerActivityResponse`, `PartnerActivityQueryParams`.
- Implement `fetchPartnerHome(storeId?: string)`, `fetchPartnerActivities(params: PartnerActivityQueryParams)`, `fetchPartnerActivityDetail(activityId: string, storeId?: string)`.
- Use `apiClient<T>` with `AbortSignal` request cancellation support and `translateApiMessage` error handling.

Step 2. Create `frontend/apps/web/src/hooks/usePartnerActivity.ts`:
- Custom React hook managing stable cursor pagination state (`items`, `nextCursor`, `hasMore`, `loading`, `loadingMore`, `error`, `fetchNextPage()`, `refresh()`).
- Accepts parameters `{ storeId, limit, type, startDate, endDate, search }`.
- Synchronizes with `usePartnerStoreScope()` and cancels pending requests on filter/store changes using `AbortController`.

Step 3. Implement Sub-routes:
- `/partner/activity` -> `frontend/apps/web/src/app/partner/activity/page.tsx`: Paginated Activity Feed with type filter tabs (`ALL`, `BILL_PAYMENT`, `COUPON_USAGE`, `BOOKING_CHECKIN`), search bar, date range picker (Antd DatePicker, NO native date picker), "Tải thêm" button, activity card list, and detail modal/drawer.
- `/partner/activity/new-bill` -> `frontend/apps/web/src/app/partner/activity/new-bill/page.tsx`: Bill submission form extracted from monolith lines 7785-8300. Uses `ThemedListingSelect`, `useSystemFeedback`, and Antd DatePicker.
- `/partner/activity/[activityId]` -> `frontend/apps/web/src/app/partner/activity/[activityId]/page.tsx`: Standalone activity detail view page.

Step 4. Update Legacy Redirects:
- `frontend/apps/web/src/app/partner/gui-hoa-don/page.tsx`: Update legacy redirect to `/partner/activity/new-bill`.
- `frontend/apps/web/src/app/partner/page.tsx`: Handle legacy query parameters (`?panel=bill` -> `/partner/activity/new-bill`, `?panel=activity` -> `/partner/activity`).

Step 5. Unit Tests Addition & Verification:
- Create `frontend/apps/web/__tests__/usePartnerActivity.test.tsx` testing hook pagination & filter state.
- Create `frontend/apps/web/__tests__/PartnerActivityPage.test.tsx` testing activity feed UI & tabs.
- Create `frontend/apps/web/__tests__/PartnerNewBillPage.test.tsx` testing bill submission form.
- Run typecheck: `cd frontend/apps/web && pnpm check-types`
- Run lint: `cd frontend/apps/web && pnpm lint`
- Run tests: `cd frontend/apps/web && pnpm test`

Step 6. Git Commit & Push:
- Run `git add .`
- Run `git commit -m "feat(frontend): implement activity core, new bill route, and safe legacy redirects (PR 4)"`
- Run `git push`

Step 7. Report Completion:
- Write `changes.md` and `handoff.md` in `d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_m4_1\`.
- Send completion message to parent orchestrator via send_message.
