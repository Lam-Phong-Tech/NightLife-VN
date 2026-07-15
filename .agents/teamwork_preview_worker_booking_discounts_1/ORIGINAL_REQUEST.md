## 2026-07-16T00:07:19+07:00

Implement the backend booking and discount flows integration according to ORIGINAL_REQUEST.md and the explorer's design in d:/laragon/www/NightLife-VN/.agents/teamwork_preview_explorer_booking_discounts_2/handoff.md.

Specifically:
1. R1. Automatically find and link the default tier-based coupon (Guest 5% - GUEST5, Member 8% - MEMBER8, VIP 10% - VIP10) on normal bookings (no coupon specified). Generate and link CouponIssue, store snapshot, and bypass store-ownership validation checks for these default coupon codes.
2. R2. Preserve original campaign rates and do not apply default tier discounts if a campaign/coupon is explicitly specified.
3. R3. Implement claiming endpoints for Admin Coupons (Member and Guest claims). Validate user tier eligibility (targetAudiences) and store eligibility (targetStores). Save the admin coupon issue details in the booking/bill discount snapshots, and on bill approval, transition its status to USED and set usedAt, incrementing the AdminCoupon.usedCount.
4. Run npm run build, npm run test, and npm run test:e2e inside the backend directory to verify correctness.
5. Create a git commit and push the changes: `git add .`, `git commit -m "feat(backend): integrate booking and discount flows matching BA specs"`, `git push`.
6. Write a completion summary including test logs to handoff.md in your working directory: d:/laragon/www/NightLife-VN/.agents/teamwork_preview_worker_booking_discounts_1/

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
