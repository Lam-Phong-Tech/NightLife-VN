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
