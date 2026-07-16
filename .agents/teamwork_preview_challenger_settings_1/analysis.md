# System Verification Analysis - Settings & Staff Scenarios

## 1. Password Change Validation & Authentication
- **Endpoint**: `POST /users/change-password`
- **Controller**: `UsersController.changePassword` (in `backend/src/users/users.controller.ts`)
- **Service**: `UsersService.changePassword` (in `backend/src/users/users.service.ts`)
- **DTO**: `ChangePasswordDto` (in `backend/src/users/dto/change-password.dto.ts`)

### Findings:
- **Empty inputs validation**: Handled by NestJS global `ValidationPipe` leveraging `class-validator`'s `@IsNotEmpty()` and `@IsString()` annotations on `oldPassword` and `newPassword`. When empty strings are sent, the server automatically rejects with `400 Bad Request`.
- **Short passwords (less than 8 chars)**: Regulated by `@MinLength(8)` in `ChangePasswordDto` for `newPassword`. The API successfully rejects short passwords with `400 Bad Request`.
- **Incorrect old password**: Inside `UsersService.changePassword`, `passwordService.verify(dto.oldPassword, user.passwordHash)` checks correctness. If mismatch, it throws a `UnauthorizedException` returning `401 Unauthorized` with Vietnamese message "Mật khẩu cũ không chính xác".

---

## 2. Staff Management Creation Authorization
- **Endpoint**: `POST /partner/staff`
- **Controller**: `PartnerStaffController.createStaff` (in `backend/src/partner-staff/partner-staff.controller.ts`)
- **Service**: `PartnerStaffService.assignStaffToStore` (in `backend/src/partner-staff/partner-staff.service.ts`)

### Findings:
- **Scoping Check**: Before assignment, the controller executes `await this.accessService.ensureStoreAccess(req.user, dto.storeId)`.
- **Authorization & Multi-Tenancy**: `accessService.ensureStoreAccess` verifies store membership. If a Partner attempts to create a staff member for a store they do not own or are not delegated to, the query returns an empty list, throwing a `ForbiddenException('You cannot access data for this store')`, returning `403 Forbidden`.

---

## 3. Staff Deletion Scopes & Validation
- **Endpoint**: `DELETE /partner/staff/:userId`
- **Controller**: `PartnerStaffController.deleteStaff` (in `backend/src/partner-staff/partner-staff.controller.ts`)
- **Service**: `PartnerStaffService.removeStaffFromStore` (in `backend/src/partner-staff/partner-staff.service.ts`)

### Findings:
- **Missing storeId validation**: The controller enforces the query parameter explicitly:
  ```typescript
  if (!storeId) {
    throw new BadRequestException('storeId query parameter is required');
  }
  ```
  This immediately triggers a `400 Bad Request` if `storeId` is missing.
- **Unauthorized Deletion Prevention**: After validating `storeId` presence, `await this.accessService.ensureStoreAccess(req.user, storeId)` ensures the actor possesses administrative/ownership rights over the specified store. If unauthorized, it throws `ForbiddenException`, returning `403 Forbidden`.
