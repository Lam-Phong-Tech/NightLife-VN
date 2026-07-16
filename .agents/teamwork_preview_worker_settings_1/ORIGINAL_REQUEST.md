## 2026-07-16T09:58:00Z
You are teamwork_preview_worker.
Your identity: Worker 1 - Settings Page & Staff Management.
Your working directory is: d:/laragon/www/NightLife-VN/.agents/teamwork_preview_worker_settings_1/
Your task is to implement the backend APIs, unit/integration tests, and frontend UI components for the Partner Settings and Staff Management feature.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Here is the exact implementation detail:

1. Backend Change Password API:
   - In `backend/src/users/users.controller.ts`, add a `changePassword` endpoint (`POST /users/change-password`) guarded by `JwtAuthGuard`. It should receive `ChangePasswordDto` (`oldPassword`, `newPassword`).
   - In `backend/src/users/users.service.ts`, implement `changePassword(userId, dto)`:
     - Load user. Validate `oldPassword` matches the database `passwordHash` using `passwordService.verify`. If incorrect, throw `UnauthorizedException('Mật khẩu cũ không chính xác')`.
     - Update password to `newPassword` using `updatePassword` method (which hashes and updates).
   - Create `backend/src/users/dto/change-password.dto.ts` with class-validator `@MinLength(6)` (or 8) validations.

2. Backend Staff Management APIs:
   - Create a new module `partner-staff` inside `backend/src/partner-staff/`:
     - `partner-staff.module.ts`: Import `PrismaModule`, `CommonModule`, `AccessModule`, and declare the controller and service.
     - `partner-staff.controller.ts`:
       - `GET /partner/staff?storeId=...`: Lists store staff.
       - `POST /partner/staff`: Assigns/creates a staff member. Request body: `CreateStaffDto`.
       - `DELETE /partner/staff/:userId?storeId=...`: Removes staff permissions (sets deletedAt and status INACTIVE).
       - Controller guarded by `JwtAuthGuard` and `RolesGuard` with `@Roles('PARTNER', 'ADMIN')`.
       - For all endpoints, validate store access: `await this.accessService.ensureStoreAccess(req.user, storeId)`.
     - `partner-staff.service.ts`:
       - `getStaffByStore(storeId)`: Find active `StorePermission` records for storeId where user role is `STAFF`. Return fields: `userId`, `email`, `displayName`, `phone`, `status`, `permissions`, `createdAt`.
       - `assignStaffToStore(dto)`:
         - Normalize email (lower case, trim).
         - Check if user exists. If user exists:
           - Validate role is `STAFF` (else throw ConflictException).
           - Check if active permission exists (else throw ConflictException).
           - Upsert/update `StorePermission` to status `ACTIVE` and deletedAt `null`.
         - If user does not exist:
           - In a transaction, create User with role `STAFF`, hash password.
           - Create `StorePermission` for the store with permissions `['coupon.scan', 'checkin.confirm']`.
       - `removeStaffFromStore(userId, storeId)`:
         - Mark `StorePermission` status as `INACTIVE` and set `deletedAt: new Date()`.
     - DTO: `backend/src/partner-staff/dto/create-staff.dto.ts` containing validations.

3. Frontend Shared Custom Dropdown:
   - Extract `ThemedListingSelect` from `frontend/apps/web/src/app/partner/page.tsx` and move it to a shared reusable component in `frontend/apps/web/src/components/ui/ThemedListingSelect.tsx` (fully exported).
   - Update `partner/page.tsx` to import the extracted select.

4. Frontend Settings & Staff Page UI:
   - In `frontend/apps/web/src/app/partner/page.tsx`:
     - Add `settings` key to `panelKeys`, `navItems` (Sidebar) with Settings icon, and `panelTitles` ("Cài đặt tài khoản").
     - Build `renderSettingsPanel` showing:
       - Change Password Form (Old, New, Confirm inputs) calling `/users/change-password` and utilizing `useSystemFeedback` toast.
       - Staff Management Panel (only for PARTNER role):
         - Form to create staff: Name, Email, Password, Store Select (using `ThemedListingSelect`), and Permissions list.
         - Table listing existing staff (Name, Email, Managed Store, Status, Delete action).
         - When deleting a staff user, trigger `useSystemFeedback`'s `showModal` warning/destructive confirmation popup first, then call `DELETE /partner/staff/:userId?storeId=...`.

5. Unit Tests:
   - Create `backend/src/users/users.controller.spec.ts` to test password change success, old password mismatch, etc.
   - Create `backend/src/partner-staff/partner-staff.controller.spec.ts` to test staff listing, creation, permission checks, and deletions.

6. Compilation & Git Operations:
   - Compile backend (`npm run build` in `backend/`) and frontend (`pnpm run check-types` and `pnpm run build` in `frontend/apps/web/`).
   - Run tests (`npm run test` in `backend/`).
   - Stage all modified files, commit with a descriptive message, and push to origin.
