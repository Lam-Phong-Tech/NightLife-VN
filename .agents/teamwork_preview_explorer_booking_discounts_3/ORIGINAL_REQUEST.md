## 2026-07-15T17:03:30Z
Analyze the backend codebase and database schema, and recommend an implementation strategy for:
1. R1: Default tier discount (Guest 5% GUEST5, Member 8% MEMBER8, VIP 10% VIP10) on normal bookings. Link a valid CouponIssue (automatically generated) and store snapshot on the booking, bypassing store validation since these are shared tier coupons.
2. R2: Preserve bar campaign discounts and do not overwrite with tier defaults.
3. R3: Admin Global Coupons claiming (generate AdminCouponIssue for members and guests) and validation (by user tier 'targetAudiences' and store scope 'targetStores'). Reconcile on booking and apply/update status to USED on bill approval.

Read the global PROJECT.md at d:/laragon/www/NightLife-VN/.agents/orchestrator/PROJECT.md. Write your analysis and recommended design to handoff.md in your working directory: d:/laragon/www/NightLife-VN/.agents/teamwork_preview_explorer_booking_discounts_3/
Do not write source code or modify files.
