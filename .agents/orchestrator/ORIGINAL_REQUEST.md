# Original User Request

## 2026-07-15T23:59:00+07:00
You are the Project Orchestrator (role: teamwork_preview_orchestrator) for the NightLife-VN booking & discount flows backend integration.
Working directory: d:/laragon/www/NightLife-VN/.agents/orchestrator/
Your task is to coordinate the backend integration of booking and discount flows matching the specifications in ORIGINAL_REQUEST.md.

Specifically:
- R1. Default tier-based discount (Guest 5%, Member 8%, VIP 10%) on normal bookings. Link valid CouponIssue, store snapshot, apply correctly on bill approval.
- R2. Bar campaign discounts (keep original campaign rates, do not overwrite with tier discounts).
- R3. Admin Global Coupon (validate tier, scope of specific/all bars, apply discount on bill approval, mark coupon issue as USED).

Please read ORIGINAL_REQUEST.md at the workspace root, analyze the codebase, write plan.md and progress.md in your working directory, and dispatch tasks to specialists to implement the solution. Do not write implementation code directly, use specialists. Update progress.md with your progress and milestone updates.

## 2026-07-16T09:31:49+07:00
You are the teamwork_preview_orchestrator.
Your working directory is d:/laragon/www/NightLife-VN/.agents/orchestrator.
Your mission is to orchestrate and complete the requirements in d:/laragon/www/NightLife-VN/ORIGINAL_REQUEST.md:
1. Fix backend partner request state machine logic in nightlife-data.service.ts (ensurePartnerOnboarding logic and DRAFT state vs ACTIVE status on rejection, plus loading detailed store fields).
2. Improve AdminConsole.tsx frontend to show separate tabs for registration and modification, a 'View Changes' button, and a side-by-side Diff View comparison modal highlighting changed fields and allowing Approve/Reject.
3. Ensure git add, commit, and push are run after modifying files as per AGENTS.md rules.

## 2026-07-16T09:35:00+07:00
The user has added a new requirement (R2/partner form toggle):
1. **Backend**: In `nightlife-data.service.ts`, update the `getPartnerListingDraft` method to return an additional `live` object containing the original, current Store data from the database, formatted in the same schema/structure as the `draft` object.
2. **Frontend (Partner)**: In `page.tsx` (partner dashboard/form, located at `frontend/apps/web/src/app/partner/page.tsx`), add an `isViewingLive` state (boolean, default `false`). Show a Toggle Switch or small tabs next to the Status Pill: `[Xem bản đang Go Live]` and `[Xem bản chỉnh sửa]`.
- When `isViewingLive === true`: populate the form with the `live` data, set all inputs to `disabled={true}`, and hide or disable the "Lưu bản nháp" and "Gửi duyệt" buttons.
- When `isViewingLive === false` (default): populate the form with `listingDraft` and permit normal editing, saving, and submitting.

## 2026-07-16T09:50:04+07:00
We have a new user request to design and implement the Settings page (password change and staff management) for the Partner Portal. Please analyze the requirements in ORIGINAL_REQUEST.md, create a plan, coordinate specialized subagents (explorers, workers, reviewers, and challengers), perform forensic integrity audits, verify the implementation with unit and integration tests, and commit/push the final changes to GitHub. Run in the workspace directory: d:\laragon\www\NightLife-VN.

