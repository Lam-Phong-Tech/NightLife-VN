# Phase 2 Implementation Plan: Partner Request State Machine & Frontend Diff UI

This plan consolidates findings from Explorers 1, 2, and 3 to resolve the backend partner request state machine bugs and build the frontend side-by-side comparison Diff modal.

## Backend Changes (`nightlife-data.service.ts`)

1. **Type Definitions**:
   - Update `PartnerRequestCmsRecord` to include detailed store fields (`description`, `address`, `city`, `district`, `phone`, `openingHours`, `pricingInfo`, `tags`, and `media`).
2. **Select Block**:
   - Extend `partnerRequestSelect()` to query all relevant detailed store fields including the `media` URLs.
3. **Record Mapping**:
   - Update `mapPartnerRequestRecord()` to compile these queried fields into an `originalStore` object and prefix-matched fields (such as `draftStoreCategory`, `draftStoreAddress`, `draftStoreMenuSummary`, `draftStoreMediaUrls`, etc.).
4. **State Transitions (`reviewPartnerRequest`)**:
   - Check if request is a partner registration: `const isPartnerRegistration = request.id.startsWith('PARTNER-')`.
   - Call `ensurePartnerOnboarding` only if `approve` is true AND `isPartnerRegistration` is true.
   - On approval:
     - Set store status to `ACTIVE`.
     - Conditionally update `ownerId` and `partnerAccountId` only if `onboarding` is present (registration). For updates, preserve the store's current owner/account IDs.
   - On rejection:
     - Only set the store status to `DRAFT` if `isPartnerRegistration` is true. If it is a listing update (`LISTING-`), keep the store's current status intact.

## Frontend Changes (`AdminConsole.tsx`)

1. **Types**:
   - Extend `AdminPartnerRequest` type to define `originalStore` and additional fields.
2. **Custom Filter Dropdown**:
   - Replace the native HTML `<select>` status filter dropdown with a custom dropdown button and popup list to comply with `AGENTS.md` rules.
3. **Tab Filtering**:
   - Implement navigation tabs at the top of the "Hồ sơ đối tác" section: "Yêu cầu Đăng ký mới" (prefix `PARTNER-`) and "Yêu cầu Sửa đổi" (prefix `LISTING-`).
   - Group and count requests for each category.
4. **View Changes Button**:
   - Render a "Xem thay đổi" button next to pending `LISTING-` requests.
5. **Comparison Diff Modal**:
   - Render a side-by-side visual Diff View comparison modal when clicking "Xem thay đổi".
   - Highlight modified fields using custom golden background and text colors.
   - Support side-by-side comparison for text fields and image attachments.
   - Integrate a text area for approval/rejection feedback reasons.
   - Allow direct Approve and Reject actions from within the modal using the updated API handler.

## Git Operations
- Run `git add`, `git commit -m "..."`, and `git push` to push the changes after verification, adhering to the project rules.
