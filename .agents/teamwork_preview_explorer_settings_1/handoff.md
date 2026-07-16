# Handoff Report - Settings & Staff/User Management Exploration

## 1. Observation
*   **Prisma Database Schema**: In `backend/prisma/schema.prisma`, models for `User` (lines 277-330), `Store` (lines 478-536), and `StorePermission` (lines 1154-1170) already exist, linking staff members to store IDs with permissions array keys (`permissions String[]`).
*   **Permissions Engine**: In `backend/src/access/access.service.ts` (lines 281-344), helper methods such as `getAccessibleStoreIds` and `ensureStoreAccess` are implemented to support granular store scopes for `PARTNER` and `STAFF` roles.
*   **Frontend Monolithic Partner Page**: In `frontend/apps/web/src/app/partner/page.tsx` (lines 1383-1510), the `ThemedListingSelect` component is defined locally as a private, un-exported helper function.
*   **System Feedback Integration**: `frontend/apps/web/src/components/ui/SystemFeedback.tsx` (lines 146-152) exposes `useSystemFeedback()` hook which outputs standard custom toast and confirmation modal capabilities matching brand styles.
*   **Unit Tests Layout**: Unit tests are co-located in the feature folders, such as `backend/src/users/users.service.spec.ts` matching NestJS structure.

## 2. Logic Chain
1.  **Change-Password API Implementation**: Since `UsersService` has `updatePassword` but lacks verification of old passwords inside a dedicated method, we must expose a custom `changePassword` endpoint that verifies old hashed passwords (using `passwordService.verify`) before calling the update.
2.  **Partner Staff Management Isolation**: Creating a new NestJS module `partner-staff` next to `users` prevents directory clutter and provides clear separation for testing `/partner/staff` endpoints.
3.  **Strict Store Security Scope**: By mapping all operations in `PartnerStaffController` to check `accessService.ensureStoreAccess(req.user, storeId)`, we guarantee that a partner can only manipulate staff associated with their own authorized stores.
4.  **Extracting Selector Component**: Moving `ThemedListingSelect` to a shared file `frontend/apps/web/src/components/ui/ThemedListingSelect.tsx` is required because the project-scoped rules forbid default browser selects, and this enables dropdown reusability across the Settings panel.
5.  **Feedback & Confirmation Compliance**: Invoking `useSystemFeedback`'s `showModal` before deleting a staff member satisfies the rule against standard browser `confirm()` popups.

## 3. Caveats
*   **User Multi-Role Limitation**: We assume a staff member (`role: STAFF`) only operates under assigned permissions of `StorePermission`. If they are upgraded/registered with other roles, they will be blocked from staff mapping to prevent configuration leakage.
*   **External API Province Dependency**: The address retrieval within the partner page makes calls to `provinces.open-api.vn`. If offline or in production, we assume this service remains highly available.

## 4. Conclusion
The database schema and access logic already fully support the requested settings and user/staff operations. Implementing the new APIs requires a new isolated `partner-staff` module in the backend, a change-password route in `users`, and integrating a `settings` tab in the frontend partner portal with custom-extracted selectors, toast alerts, and modal dialogs.

## 5. Verification Method
*   **Backend Verification**:
    *   Inspect `backend/src/users/users.controller.spec.ts` and `backend/src/partner-staff/partner-staff.controller.spec.ts` files to verify correct testing declarations.
    *   Run test command: `npm run test` or `npm run test:cov` inside the `backend` directory.
*   **Frontend Verification**:
    *   Verify the URL `http://localhost:3000/partner?panel=settings` navigates directly to the settings tab.
    *   Inspect browser console logs and ensure no native `select` or `confirm` alerts are being triggered during staff creation/deletion.
