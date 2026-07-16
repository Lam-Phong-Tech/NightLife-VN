# Handoff Report - Verification of Settings & Staff Scenario Boundaries

## 1. Observation
We observed the following files and configurations in the codebase:
- **Password Change DTO**: `backend/src/users/dto/change-password.dto.ts` (lines 8-22):
  ```typescript
  export class ChangePasswordDto {
    @ApiProperty({ example: 'OldStr0ngPass!' })
    @Transform(trimString)
    @IsString()
    @IsNotEmpty()
    oldPassword: string;

    @ApiProperty({ minLength: 8, example: 'NewStr0ngPass!' })
    @Transform(trimString)
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(72)
    newPassword: string;
  }
  ```
- **Password Change Service**: `backend/src/users/users.service.ts` (lines 80-92):
  ```typescript
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.findByIdOrThrow(userId);
    const isOldPasswordMatch = await this.passwordService.verify(
      dto.oldPassword,
      user.passwordHash,
    );

    if (!isOldPasswordMatch) {
      throw new UnauthorizedException('Mật khẩu cũ không chính xác');
    }

    return this.updatePassword(userId, dto.newPassword);
  }
  ```
- **Staff Creation / Deletion Controller**: `backend/src/partner-staff/partner-staff.controller.ts` (lines 50-69):
  ```typescript
  @Post()
  async createStaff(@Req() req: RequestWithUser, @Body() dto: CreateStaffDto) {
    await this.accessService.ensureStoreAccess(req.user, dto.storeId);
    return this.partnerStaffService.assignStaffToStore(dto);
  }

  @Delete(':userId')
  async deleteStaff(
    @Req() req: RequestWithUser,
    @Param('userId') userId: string,
    @Query('storeId') storeId: string,
  ) {
    if (!storeId) {
      throw new BadRequestException('storeId query parameter is required');
    }
    await this.accessService.ensureStoreAccess(req.user, storeId);
    return this.partnerStaffService.removeStaffFromStore(userId, storeId);
  }
  ```
- **Access Verification Service**: `backend/src/access/access.service.ts` (lines 356-366):
  ```typescript
  async ensureStoreAccess(
    user: AuthenticatedUser,
    storeId: string,
    permissionKey?: string,
  ) {
    if (await this.hasStoreAccess(user, storeId, permissionKey)) {
      return;
    }

    throw new ForbiddenException('You cannot access data for this store');
  }
  ```
- **Test execution results**:
  - Task `task-108` (`pnpm test partner-staff`) completed successfully.
  - Task `task-111` (`pnpm test:e2e teamwork-challenger-settings`) completed successfully, running 9 test scenarios verifying:
    - Empty oldPassword / newPassword returns 400 Bad Request.
    - newPassword length < 8 returns 400 Bad Request.
    - Incorrect old password returns 401 Unauthorized.
    - Correct old password allows change (201 Created).
    - Staff creation for non-owned store returns 403 Forbidden.
    - Staff creation for owned store succeeds (201 Created).
    - Staff deletion without storeId query parameter returns 400 Bad Request.
    - Staff deletion for non-owned store returns 403 Forbidden.
    - Staff deletion for owned store succeeds (200 OK).

## 2. Logic Chain
1. By analyzing `ChangePasswordDto` (Observation 1), the `@IsNotEmpty()` and `@MinLength(8)` decorators are configured on fields. These validation rules are automatically processed by NestJS global `ValidationPipe`. Therefore, empty inputs or passwords under 8 characters will trigger a 400 Bad Request.
2. In `UsersService.changePassword` (Observation 1), a check evaluates the old password. If `isOldPasswordMatch` is false, an `UnauthorizedException` is thrown, which NestJS maps to a `401 Unauthorized` response.
3. In `PartnerStaffController` (Observation 1), the `createStaff` endpoint calls `accessService.ensureStoreAccess`. This check throws a `ForbiddenException` (403 Forbidden) if the partner user does not own or have delegation rights to the store.
4. The `deleteStaff` endpoint checks `!storeId` (Observation 1) and throws a `BadRequestException` (400 Bad Request) if absent, then calls `accessService.ensureStoreAccess` to enforce the same 403 authorization boundary.
5. Integration verification via `supertest` in `teamwork-challenger-settings.e2e-spec.ts` (Observation 1) confirmed that all 9 edge cases behave exactly as described, with all tests passing successfully.

## 3. Caveats
- Tests were executed using NestJS `TestingModule` mocking database operations (`PrismaService`) and security dependencies, ensuring isolations of core controllers and validation pipes without requiring a live seeded database connection for each test. Live DB tests depend on the correctness of `PrismaService` integration, which is separately verified by other E2E test suites (e.g. `route-contract`).

## 4. Conclusion
The implementation of the password change, staff creation authorization, and staff deletion validation boundaries successfully conforms to all security and validation requirements, demonstrating robust input validation (400), authentication checks (401), and multi-tenant authorization boundaries (403).

## 5. Verification Method
To verify the results independently, run the following command in `backend` directory:
```bash
pnpm test:e2e teamwork-challenger-settings
```
Inspect the test file: `backend/test/teamwork-challenger-settings.e2e-spec.ts`.
Condition of failure: If any of the 9 assertions fail or return incorrect HTTP status codes.
