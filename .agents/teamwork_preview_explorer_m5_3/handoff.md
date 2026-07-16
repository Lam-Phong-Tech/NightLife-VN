# Handoff Report: Partner Request State Machine Fixes & Frontend Diff View Design

## 1. Observation
- **Backend state machine location**:
  The function `reviewPartnerRequest` is defined in `d:/laragon/www/NightLife-VN/backend/src/nightlife-data/nightlife-data.service.ts` at lines 6842–7039. It currently performs unconditional onboarding via `ensurePartnerOnboarding` (line 6882) and sets the Store status to `DRAFT` on rejection (line 6920):
  ```typescript
  const onboarding = dto.approve
    ? await this.ensurePartnerOnboarding(tx, request)
    : null;
  ...
  } else {
    await tx.store.update({
      where: { id: request.store.id },
      data: { status: 'DRAFT' },
      select: { id: true },
    });
  ```
- **Prisma Schema definition for Store**:
  The `Store` model in `d:/laragon/www/NightLife-VN/backend/prisma/schema.prisma` at lines 478–527 contains properties:
  ```prisma
  model Store {
    id                         String                 @id @default(uuid()) @db.Uuid
    ownerId                    String?                @map("owner_id") @db.Uuid
    partnerAccountId           String?                @map("partner_account_id") @db.Uuid
    ...
    name                       String
    slug                       String                 @unique
    category                   StoreCategory
    description                String?
    address                    String?
    city                       String                 @default("Ho Chi Minh City")
    district                   String?
    phone                      String?
    openingHours               Json?                  @map("opening_hours")
    pricingInfo                Json?                  @map("pricing_info")
    mapUrl                     String?                @map("map_url")
    status                     StoreStatus            @default(DRAFT)
    tags                       String[]               @default([])
    media                      Media[]
    ...
  }
  ```
- **Backend Selection and Mapping**:
  `partnerRequestSelect()` currently does not load the detailed store fields `description`, `address`, `city`, `district`, `phone`, `openingHours`, `pricingInfo`, `tags`, or `media` relation (lines 16041–16050 in `nightlife-data.service.ts`):
  ```typescript
  store: {
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      category: true,
      mapUrl: true,
    },
  },
  ```
  Correspondingly, `mapPartnerRequestRecord()` only maps basic draftStore properties and lacks media urls of the current store (lines 16229–16232).

- **Frontend Review Trigger**:
  In `d:/laragon/www/NightLife-VN/frontend/apps/web/src/app/admin/AdminConsole.tsx` at line 2557:
  ```typescript
  const reviewPartnerRequest = async (requestId: string, approve: boolean) => {
    const reason =
      partnerReviewReasons[requestId]?.trim() ||
  ```
  In the previous patch implementation (from `explorer_m5_1`):
  ```typescript
  onClick={async () => {
    setPartnerReviewReasons(current => ({ ...current, [diffPartnerRequest.id]: diffReviewReason }));
    await reviewPartnerRequest(diffPartnerRequest.id, false);
    setDiffPartnerRequest(null);
  }}
  ```

- **Filter Panel Dropdown Select**:
  In `AdminConsole.tsx` at lines 3212–3222, a native browser `<select>` dropdown element is used to filter partner requests by status:
  ```tsx
  <select
    aria-label="Partner request status filter"
    value={partnerRequestFilterDraft.status}
    onChange={(event) => updatePartnerRequestFilterDraft("status", event.target.value)}
    style={inputStyle({ minHeight: 38 })}
  >
  ```

---

## 2. Logic Chain
- **Requirement 1**: Only trigger onboarding for new registrations (`PARTNER-`) and skip onboarding for listing updates (`LISTING-`). Update the Store directly for `LISTING-` updates.
  - *Logical step*: Check `request.id.startsWith("PARTNER-")`. Onboarding must be run conditional on `approve && isPartnerRegistration`.
  - *Logical step*: When updating the Store in Prisma upon approval, if `isPartnerRegistration` is true, associate the store with the newly onboarded partner credentials (`ownerId` and `partnerAccountId`). If it is false, do not modify `ownerId`/`partnerAccountId` of the existing Store record, but apply `listingStoreUpdate` directly.

- **Requirement 2**: Set Store status to `DRAFT` only on rejection of a registration (`PARTNER-`) request.
  - *Logical step*: Wrap the rejection `tx.store.update` block with `if (isPartnerRegistration)`. This prevents modifying the status of an already active store back to `DRAFT` on rejection of a modification request.

- **Requirement 3**: Expose original detailed Store fields to support frontend diff comparison.
  - *Logical step*: Add `description`, `address`, `city`, `district`, `phone`, `openingHours`, `pricingInfo`, `tags`, and `media` select mapping in `partnerRequestSelect()`.
  - *Logical step*: In `mapPartnerRequestRecord()`, assign these fields to properties like `draftStoreDescription`, `draftStoreAddress`, etc. and map the media URLs to `draftStoreMediaUrls`.

- **Requirement 4**: Solve frontend state synchronization race condition.
  - *Logical step*: Calling `setPartnerReviewReasons` is an asynchronous state operation in React. Calling `reviewPartnerRequest` immediately after triggers the request with the stale `partnerReviewReasons` state.
  - *Logical step*: To ensure the review reason typed in the Modal is correctly transmitted, modify the signature of `reviewPartnerRequest` to support an optional third parameter `overrideReason?: string` and pass `diffReviewReason` directly.

- **Requirement 5**: Support image media diffing.
  - *Logical step*: Display existing store images and proposed request images side-by-side. Highlight newly proposed images that do not exist in the original set with a custom green border (`colors.green`).

- **Requirement 6**: Strictly obey the project's `<select>` tag constraint in `AGENTS.md`.
  - *Logical step*: The native HTML `<select>` status filter dropdown violates this constraint. We must replace it with a custom react dropdown component built with styled `div` buttons toggled by state (`statusDropdownOpen`).

---

## 3. Caveats
- **Media file formats**: The logic assumes that media arrays only store URLs. If media assets undergo size checks or need transformation before rendering, standard image tag loading error handlers should be added to handle broken URLs gracefully.
- **Store category mappings**: This assumes `businessType` of the `PartnerRequest` is mapping directly against `StoreCategory` in Prisma.

---

## 4. Conclusion
The proposed changes located in `proposed_changes.diff` solve the state machine transition bugs, resolve the asynchronous race condition in the diff modal review workflow, introduce image diffing, and replace the native browser select element with a custom UI picker in complete alignment with the project rules.

---

## 5. Verification Method
1. **Apply the Patch**:
   Apply `proposed_changes.diff` to the codebase:
   ```powershell
   git apply .agents/teamwork_preview_explorer_m5_3/proposed_changes.diff
   ```
2. **Build and Type Checking**:
   Run build and lint checks inside both backend and frontend workspaces to verify no TypeScript compilation errors:
   - Backend:
     ```powershell
     cd backend
     pnpm run build
     pnpm run lint
     ```
   - Frontend:
     ```powershell
     cd frontend/apps/web
     pnpm run check-types
     pnpm run lint
     ```
3. **Execution of Tests**:
   - Run NestJS backend unit and E2E tests:
     ```powershell
     cd backend
     pnpm run test
     ```
   - Run Vitest frontend tests:
     ```powershell
     cd frontend/apps/web
     pnpm run test
     ```
