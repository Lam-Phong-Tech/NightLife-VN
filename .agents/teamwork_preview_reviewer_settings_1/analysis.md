# Analysis Report — Partner Settings & Staff Management

This report contains the objective quality review and adversarial stress-testing of the Change Password and Partner Staff Management features implemented in the backend and frontend.

## Quality Review

### 1. Correctness & Quality of Backend APIs
- **Change Password API (`POST /users/change-password`)**:
  - Implements secure credential rotation.
  - Correctly verifies the current password using `PasswordService.verify` against `user.passwordHash`.
  - Uses `class-validator` and `class-transformer` decorators in `ChangePasswordDto` to trim fields and validate string boundaries (minimum 8, maximum 72 characters).
  - Appropriately throws a `UnauthorizedException('Mật khẩu cũ không chính xác')` when the old password does not match, avoiding security leaks.
- **Partner Staff Management APIs (`GET/POST/DELETE /partner/staff`)**:
  - The controller endpoints are protected using `@UseGuards(JwtAuthGuard, RolesGuard)` and restricted to `PARTNER` or `ADMIN` roles.
  - Access control is strictly enforced on each endpoint via `AccessService.ensureStoreAccess(req.user, storeId)` (where `storeId` is retrieved from request body or query params). This guarantees multi-tenant store boundaries.
  - **Create/Link Staff (`POST`)**:
    - Validates email format and ensures password is at least 8 characters.
    - If user exists but is not of role `STAFF`, throws a `ConflictException`.
    - If user exists and is already linked to the store, throws a `ConflictException`.
    - If user exists and is inactive or lacks active store permissions, it updates/upserts the permission status to `ACTIVE` and maps permissions (defaulting to scanning and check-in confirmation).
    - If user does not exist, hashes the password and creates both user (role `STAFF`, status `ACTIVE`) and store permission in a Prisma transaction.
  - **Remove Staff (`DELETE`)**:
    - Updates the staff's `StorePermission` status to `INACTIVE` and sets `deletedAt` to the current date. This performs a correct soft-delete of the store relationship rather than hard-deleting the user account, keeping the database intact.
  - **Retrieve Staff (`GET`)**:
    - Fetches only active staff records (`status: 'ACTIVE'`, `deletedAt: null`, role `'STAFF'`) linked to the store.

### 2. Frontend Settings & Staff Integration
- **Extraction of `ThemedListingSelect` component**:
  - Extracted as a clientside wrapper (`'use client'`) around custom dropdown elements.
  - Avoids standard HTML `<select>` tag which violates project design directives.
  - Uses absolute positioning with high z-index and handles `onBlur` events properly to close itself when focus is lost.
- **Sidebar Integration**:
  - Successfully registers the `'settings'` tab in `navItems` with a custom `Settings` icon.
  - Configures titles and eyebrows properly in `panelTitles` (`PARTNER SETTINGS` / `Cài đặt tài khoản`).
- **Forms and Tables**:
  - Change password form tracks old/new/confirm passwords and validates them (checks minimum length, checks password match) before dispatching the POST request.
  - Staff creation form maps input state and sends permissions (`coupon.scan` and `checkin.confirm`).
  - Table properly lists staff name, email, store name, status (with distinct green/red badges), and action buttons.
  - Action buttons invoke `feedback.showModal(...)` with a custom warning pop-up, satisfying the project rule to avoid default browser alert or confirm elements.

---

## Adversarial Review

### 1. Assumption Stress-Testing
- **Assumption**: The `storeId` passed in query parameters or payload body is owned or accessible by the requesting partner.
  - *Attack scenario*: A partner calls `/partner/staff?storeId=another-partner-store-id` or deletes staff specifying a store ID they do not own.
  - *Verification*: Tested. The backend controller calls `AccessService.ensureStoreAccess(req.user, storeId)` before invoking the service layer. Since `ensureStoreAccess` fetches stores matching `ownerId: req.user.id` or matching active store permissions for that user, it throws `ForbiddenException('You cannot access data for this store')` for unauthorized stores.
- **Assumption**: `ThemedListingSelect` behaves correctly on blur events.
  - *Attack scenario*: In Safari or Chrome, clicking inside the dropdown options triggers blur on the container and closes it prematurely before the click registers.
  - *Verification*: The blur event handler validates `event.relatedTarget`. If the new focused element is a child of the select container (`event.currentTarget.contains(nextFocus as Node)`), it prevents closing, which ensures options click registers correctly.
- **Assumption**: Password changes are safe against dictionary or empty inputs.
  - *Attack scenario*: User inputs whitespace-only or extremely short inputs.
  - *Verification*: The DTO uses `@Transform(value => value.trim())` and `@MinLength(8)`. The frontend also checks length before sending, ensuring robustness.

### 2. Edge Case Mining
- **Staff Email Conflict**:
  - When trying to assign staff with an email that belongs to a user who is not a `STAFF` (e.g. another `PARTNER` or a regular `USER`), the service returns `ConflictException('Người dùng đã tồn tại nhưng không phải vai trò STAFF')`. This prevents accidental elevation or corrupting role scopes.

---

## Code Style & Type Safety
- **Type Safety**: Backend uses TypeScript types extensively (dtos, parameters, return types). Frontend compiles without errors.
- **Styling**: Standard Tailwind and inline React styling are consistent with the rest of the partner dashboard.
