# Project: Partner Portal Settings & Staff Management

## Architecture
### 1. Backend Changes (NestJS, Prisma, PostgreSQL)
- **Change Password API (`POST /users/change-password`)**:
  - Request body: `oldPassword`, `newPassword`
  - Validates authenticated user (both Partner and Staff).
  - Checks if `oldPassword` matches the current hashed password in database.
  - Hashing using appropriate password utility (e.g. bcrypt).
  - Returns 200/201 on success, 400 on invalid input (e.g. short password), 401 on incorrect current password.
- **Staff Management APIs (`/partner/staff`)**:
  - `GET /partner/staff`: Returns lists of staff members belonging to stores owned by the authenticated Partner.
  - `POST /partner/staff`: Creates a new staff user (`name`, `email`, `password`, `storeId`).
    - Verifies that `storeId` is owned by the current partner (return 403 Forbidden if not).
    - Creates User with role `STAFF`.
    - Creates a `StorePermission` linking the new staff member to the designated `storeId` with permissions `['coupon.scan', 'checkin.confirm']`.
  - `DELETE /partner/staff/:id`: Removes `StorePermission` of the staff and marks the staff user status as `INACTIVE`.
    - Verifies that the staff's store is owned by the current partner (return 403 Forbidden if not).

### 2. Frontend Changes (Next.js, Tailwind, React)
- **Sidebar Navigation**:
  - Add "Cài đặt" tab to Partner Portal Sidebar with gear icon, title "Cấu hình và cài đặt", subtitle "PARTNER SETTINGS".
- **Change Password UI**:
  - Password change form with fields: Current Password, New Password, Confirm New Password.
  - Validation: New password length >= 8, confirmation match.
  - Integration with `useSystemFeedback` toast for success/error alerts.
- **Staff Management UI (Partner Only)**:
  - Form to create staff: Name, Email, Password, Store Select.
  - Must use `ThemedListingSelect` for Store selection.
  - List of staff in tabular format: Name, Email, Managed Store, Status, Actions.
  - Delete button displays custom confirm popup using `useSystemFeedback` (no native `confirm` or `alert`).

### 3. Testing Suites
- `partner-staff.controller.spec.ts`: Tests list retrieval, creation success, creation permission failures (non-owned store), and deletion.
- `users.controller.spec.ts`: Tests password changes (success, invalid password, incorrect old password).

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| 1 | Explore & Design | Locate codebase files, schemas, and UI components | None | PLANNED |
| 2 | Backend Implementation | Implement change password, staff management controller/service APIs, permissions | M1 | PLANNED |
| 3 | Frontend Implementation | Add Settings tab to Sidebar, create settings page with password and staff UI | M2 | PLANNED |
| 4 | Write Tests | Implement controller unit and integration tests | M2 | PLANNED |
| 5 | Verification & Audit | Run NestJS builds/tests, run Forensic Integrity Audit | M3, M4 | PLANNED |
| 6 | Commit & Push | Commit and push final codebase to GitHub | M5 | PLANNED |

## Code Layout
- Backend Users/Auth controllers: `backend/src/users/` or `backend/src/auth/`
- Backend Partner controllers: `backend/src/partner/` or `backend/src/nightlife-data/`
- Prisma Schema: `backend/prisma/schema.prisma`
- Frontend Sidebar: `frontend/apps/web/src/components/` or `frontend/apps/web/src/app/partner/`
- Frontend Settings Page: `frontend/apps/web/src/app/partner/settings/`
