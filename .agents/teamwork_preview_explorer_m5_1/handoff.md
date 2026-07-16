# Handoff Report - Explorer 1 - Backend & Frontend Partner Request Analysis

## 1. Observation

### Backend State Machine & Queries (`nightlife-data.service.ts`):
1. State transitions and `ensurePartnerOnboarding` calls occur inside the transaction within `reviewPartnerRequest(adminId, requestId, dto)` (lines 6842-6968):
   - Line 6881-6883:
     ```typescript
     const onboarding = dto.approve
       ? await this.ensurePartnerOnboarding(tx, request)
       : null;
     ```
   - Line 6890-6898:
     ```typescript
     await tx.store.update({
       where: { id: request.store.id },
       data: {
         ...listingStoreUpdate,
         status: 'ACTIVE',
         ownerId: onboarding?.userId,
         partnerAccountId: onboarding?.partnerAccountId,
       },
       select: { id: true },
     });
     ```
   - Line 6917-6922 (Reject case):
     ```typescript
     } else {
       await tx.store.update({
         where: { id: request.store.id },
         data: { status: 'DRAFT' },
         select: { id: true },
       });
     ```
2. The `partnerRequestSelect()` method (lines 16010-16060) defines the prisma selection. The nested `store` selection currently only queries a limited set of fields:
   - Line 16041-16050:
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
3. The `mapPartnerRequestRecord(request)` method (lines 16214-16255) maps these queried fields to the record returned to the client, but lacks detailed store description, address, city, district, phone, and openingHours:
   - Line 16229-16232:
     ```typescript
     draftStoreId: request.store.id,
     draftStoreName: request.store.name,
     draftStoreSlug: request.store.slug,
     draftStoreCategory: request.store.category,
     ```

### Frontend Review Panel (`AdminConsole.tsx`):
1. The partner request rendering is done in `renderPartners()` (line 3908), which renders the filter panel and `partnerTable()`:
   - Line 3922:
     ```typescript
     {partnerTable()}
     ```
2. The `partnerTable()` (line 3278) displays the list of requests in a table layout and does not differentiate between new registration vs listing modification requests, nor does it allow side-by-side diffing of modified fields:
   - Line 3301:
     ```typescript
     {orderedPartnerRequests.slice(0, activeView === "partners" ? 12 : 6).map((request) => (
     ```
3. The buttons under `partnerTable()` only support direct approve and reject actions:
   - Line 3377-3393:
     ```typescript
     <button
       type="button"
       disabled={request.status !== "PENDING_REVIEW" || reviewingPartnerRequestId === request.id}
       onClick={() => void reviewPartnerRequest(request.id, true)}
       style={buttonStyle("primary")}
     >
       Duyệt
     </button>
     ```

---

## 2. Logic Chain

1. **State Machine Adjustments**:
   - Observations show that `ensurePartnerOnboarding` is called unconditionally on approval (Line 6881).
   - Since onboarding is only necessary for new partner registrations (which have IDs starting with `"PARTNER-"`), we should check if the ID starts with `"PARTNER-"` before calling onboarding. If it does not (e.g. starts with `"LISTING-"`), we can skip onboarding.
   - On approval (Line 6890), the Store's `ownerId` and `partnerAccountId` are populated from the onboarding result. If onboarding is skipped, these should not be modified, so we should build the data update object conditionally.
   - On rejection (Line 6920), the store status is forced to `DRAFT`. This is correct for new registrations (`"PARTNER-"`), but for listing modifications (`"LISTING-"`), the store already exists and might be active. Forcing it to `DRAFT` breaks the live store. We should only update the Store status to `DRAFT` if it is a `"PARTNER-"` request.

2. **Loading Original Store Details**:
   - To support side-by-side diffing in the frontend, the original store's metadata (description, address, city, district, phone, opening hours, pricing info) must be returned from the backend.
   - We must update the `PartnerRequestCmsRecord` type declaration (line 503) and the nested selection block of `partnerRequestSelect()` (line 16041) to fetch these fields.
   - In `mapPartnerRequestRecord()`, we should map these fields into prefix-matched properties (e.g., `draftStoreDescription`, `draftStoreAddress`, etc.) and map `pricingInfo.menuSummary` to `draftStoreMenuSummary` so they can be consumed by the frontend.

3. **Frontend Tabs & Diff View Modal**:
   - Separating Registration and Modification requests is achieved by introducing a new state variable `partnerRequestTab` ("registration" | "modification") and mapping the lists accordingly.
   - For listing modification requests, we add a "Xem thay đổi" button. Clicking this sets `diffPartnerRequest` state and opens a modal.
   - Inside the modal, we display a side-by-side table comparing the original values (`draftStore...`) against the proposed values (`businessName`, `businessType`, `storeDescription`, etc.). Any difference will trigger styling classes/inline styles (such as changing the border/text color to a golden hue and highlighting the row background) to draw the reviewer's attention to the modified field.
   - A reason text field and approve/reject buttons are placed inside the modal to allow reviewers to make decisions directly within the diff view context.

---

## 3. Caveats

- We assume that `request.id` always starts with `"PARTNER-"` for registration requests and `"LISTING-"` for listing modifications. This is standard for the project prefixing convention.
- The `pricingInfo` JSON structure is assumed to contain a `menuSummary` string field as seen in the schema parsing. If the structure varies, the UI fallback handles it gracefully as `Trống` (Empty).

---

## 4. Conclusion

The proposed patches solve the backend state machine bugs (by skipping onboarding and keeping the current store status for `"LISTING-"` requests) and build a feature-rich side-by-side diffing tool in the admin panel frontend using clean, custom-styled modals that respect the project guidelines (no browser native select, datepicker, or alerts).

All proposed edits have been written to patch files:
- Backend: `d:/laragon/www/NightLife-VN/.agents/teamwork_preview_explorer_m5_1/backend.patch`
- Frontend: `d:/laragon/www/NightLife-VN/.agents/teamwork_preview_explorer_m5_1/frontend.patch`

---

## 5. Verification Method

### Backend Verification:
1. Compile backend code:
   `npm run build` inside `backend/` directory.
2. Run NestJS tests:
   `npm run test` or `npm run test:e2e` in `backend/` to verify that partner request endpoints behave as expected.

### Frontend Verification:
1. Verify types compilation:
   `pnpm check-types` inside `frontend/apps/web/` to ensure no typescript mapping errors occur in the newly added properties on `AdminPartnerRequest`.
2. Build the production bundle:
   `pnpm build` inside `frontend/apps/web/` to verify that the components render correctly and bundle without errors.
