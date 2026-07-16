# BRIEFING — 2026-07-16T10:06:00+07:00

## Mission
Implement the Settings page (password change and staff management) for the Partner Portal across NestJS backend and Next.js frontend.

## 🔒 My Identity
- Archetype: Fullstack Implementer & QA
- Roles: implementer, qa, specialist
- Working directory: d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_settings_1
- Original parent: 8d243168-4e21-45f9-abdf-ca8a5f3d08a2
- Milestone: Partner Portal Settings & Staff Management

## 🔒 Key Constraints
- Network: CODE_ONLY (no external web/service access, no curl/wget/etc.).
- DO NOT CHEAT: All implementations must be genuine. No hardcoding or dummy implementations.
- Project Rules (AGENTS.md):
  - Automatically create git commit and push after editing source code. Report to user.
  - Never use native browser alert(), confirm(), prompt(). Use toast/modal.
  - Never use native browser <select> elements; use custom dropdown/picker.
  - Never use native browser date pickers; use project custom date-picker component.

## Current Parent
- Conversation ID: 8d243168-4e21-45f9-abdf-ca8a5f3d08a2
- Updated: 2026-07-16T10:06:00+07:00

## Task Summary
- **What to build**: ChangePasswordDto, changePassword logic in UsersService/UsersController. PartnerStaff module with CRUD endpoints (store permission + user link/creation). Frontend Settings Panel in Partner page with Change Password form, Staff management form/table utilizing custom ThemedListingSelect, and showModal confirmation.
- **Success criteria**: Backend changes compilable, covered by new units/integration tests; frontend works without native widgets and handles API integrations correctly.
- **Interface contracts**: NestJS backend structure, Next.js page hierarchy.
- **Code layout**: NestJS modules in backend/src/, Next.js apps/web/src/ in frontend/apps/web/src/.

## Key Decisions Made
- Extracted ThemedListingSelect into a separate reusable component in components/ui.
- Configured settings panel to show both password change and staff management based on user role (only PARTNER can see staff management).
- Used the existing useSystemFeedback context hook to integrate custom modals and toasts.
- Created CommonModule to export PasswordService and clean up dependencies.

## Artifact Index
- None.

## Change Tracker
- **Files modified**:
  - `backend/src/users/dto/change-password.dto.ts`
  - `backend/src/users/users.service.ts`
  - `backend/src/users/users.controller.ts`
  - `backend/src/users/users.controller.spec.ts`
  - `backend/prisma/schema.prisma`
  - `backend/src/partner-staff/dto/create-staff.dto.ts`
  - `backend/src/partner-staff/partner-staff.service.ts`
  - `backend/src/partner-staff/partner-staff.controller.ts`
  - `backend/src/partner-staff/partner-staff.controller.spec.ts`
  - `backend/src/partner-staff/partner-staff.module.ts`
  - `backend/src/app.module.ts`
  - `backend/src/common/common.module.ts`
  - `frontend/apps/web/src/components/ui/ThemedListingSelect.tsx`
  - `frontend/apps/web/src/app/partner/page.tsx`
- **Build status**: Backend and Frontend builds fully pass.
- **Pending issues**: None.

## Quality Status
- **Build/test result**: 13 passed, 13 total suites in backend (205 tests).
- **Lint status**: Passed typechecking and lint rules.
- **Tests added/modified**: `users.controller.spec.ts`, `partner-staff.controller.spec.ts`.

## Loaded Skills
- None.
