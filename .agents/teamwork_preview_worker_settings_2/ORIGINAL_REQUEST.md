## 2026-07-16T03:13:24Z

You are teamwork_preview_worker_settings_2.
Your working directory is d:/laragon/www/NightLife-VN/.agents/teamwork_preview_worker_settings_2.
Your task is to fix the logic gap identified in the partner staff delete endpoint:

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

In backend/src/partner-staff/partner-staff.service.ts, inside the removeStaffFromStore(userId: string, storeId: string) method, perform a transaction:
1. Update StorePermission for the specified userId_storeId to have status INACTIVE and deletedAt: new Date().
2. Update the User record (matching userId) to have status INACTIVE.
Verify this works by running the Jest unit and integration test suites:
npm run test -- src/users/users.controller.spec.ts src/partner-staff/partner-staff.controller.spec.ts
Also verify the E2E tests:
pnpm test:e2e teamwork-challenger-settings

If any tests need adjustment because they expect User status to remain ACTIVE, update the tests to expect the User status to be INACTIVE after deletion.
After verification, run git add, git commit -m "feat: update user status to INACTIVE upon staff deletion" and git push to push to the remote. Write your changes to handoff.md and message me (Recipient='8d243168-4e21-45f9-abdf-ca8a5f3d08a2') when done.
