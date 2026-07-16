## 2026-07-16T02:36:49Z

You are teamwork_preview_worker.
Your identity: Worker 1 - Partner Request and Form Toggle Implementation.
Your working directory is: d:/laragon/www/NightLife-VN/.agents/teamwork_preview_worker_m6_7_1/
Your task is to implement the backend and frontend changes to complete the requirements of the project.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Here is the exact implementation detail:

1. Backend edits in `backend/src/nightlife-data/nightlife-data.service.ts`:
   - Extend `PartnerRequestCmsRecord` type to include detailed store fields (description, address, city, district, phone, openingHours, pricingInfo, tags, and media as `{ url: string }[]`).
   - Extend `partnerRequestSelect` to query these fields.
   - Extend `mapPartnerRequestRecord` to compile these queried fields into an `originalStore` object and prefix-matched fields (such as `draftStoreCategory`, `draftStoreAddress`, `draftStoreMenuSummary`, `draftStoreMediaUrls`, etc.).
   - In `reviewPartnerRequest`:
     - Set `const isPartnerRegistration = request.id.startsWith('PARTNER-')`.
     - Only execute `ensurePartnerOnboarding` if `approve` is true AND `isPartnerRegistration` is true.
     - On approval, conditionally update `ownerId` and `partnerAccountId` only if `onboarding` is present (for new registrations). Preserve original values for updates (`LISTING-`).
     - On rejection, only set the store status to `DRAFT` if `isPartnerRegistration` is true. For listing updates, leave store status untouched.
   - Update `partnerListingDraftResponse` to include a `live` property:
     `live: this.normalizePartnerListingDraft({}, store),`
     which formats the original, current Store data from the database into the exact same schema structure as the `draft` object.

2. Frontend edits in `frontend/apps/web/src/app/admin/AdminConsole.tsx`:
   - Update the `AdminPartnerRequest` type declaration to include `originalStore` and additional fields.
   - Add state variables: `partnerRequestTab` ("registration" | "modification"), `selectedRequestForDiff` (`AdminPartnerRequest | null`), `diffModalReason` (`string`), and `statusDropdownOpen` (`boolean`).
   - Replace the native HTML `<select>` status filter dropdown with a custom dropdown button and popup list to comply with project constraints (no default select).
   - Divide Partner Requests into separate tabs ("Yêu cầu Đăng ký mới" and "Yêu cầu Sửa đổi") using `partnerRequestTab` state.
   - Render a "Xem thay đổi" button for modification requests (`LISTING-` prefix) in the actions panel.
   - Render a side-by-side Diff View comparison modal (supporting text fields and media image lists) comparing current vs proposed values, highlighting changed fields (with golden borders/text/background).
   - Integrate feedback/reason text field and inline Approve/Reject action buttons that send the reason to `reviewPartnerRequest` inside the modal.

3. Frontend edits in `frontend/apps/web/src/app/partner/page.tsx`:
   - Add state: `isViewingLive` (boolean, default `false`) and `liveData` (`PartnerListingDraft | null`, default `null`).
   - Render small tabs or Toggle Switch next to the Status Pill in the SectionHeading action block:
     - `[Xem bản đang Go Live]` and `[Xem bản chỉnh sửa]` buttons.
     - Style the active button with colors.goldBright and bold text.
   - Update `applyListingDraftResponse` to check for `response.live`. Extract the draft normalization logic into a helper function `parseDraft = (d: any) => ...`, then set `listingDraft` using `parseDraft(response.draft)` and `liveData` using `parseDraft(response.live)` if present (else `null`).
   - Rename the react state variable `listingDraft` to `draftState` (so `const [draftState, setListingDraft] = useState(...)`) and define a helper variable:
     `const listingDraft = isViewingLive && liveData ? liveData : draftState;`
     (This ensures all sub-renderers and inputs bind automatically to the correct data without changing `listingDraft.xxx` in hundreds of places).
   - Disable/Hide form controls when `isViewingLive === true`:
     - Wrap the `store` tab form container (`partner-listing-form` div) in `style={isViewingLive ? { pointerEvents: 'none', opacity: 0.8 } : undefined}`.
     - In the `cast` tab:
       - Hide "Thêm cast" button: `{!isViewingLive && <PrimaryButton onClick={addCastProfile}>...`
       - In `renderCastProfileForm`, wrap the form body in `<div style={isViewingLive ? { pointerEvents: 'none', opacity: 0.8 } : undefined}>` but keep the back arrow button clickable (`closeCastProfileForm`). Hide "Xóa cast" and "Lưu cast" buttons.
     - Hide the bottom "Lưu nháp" and "Gửi duyệt" buttons:
       `{!isViewingLive && ( ... buttons ... )}`

4. Compile and verify your changes:
   - Run `npm run build` in the `backend/` directory to ensure backend builds cleanly.
   - Run `pnpm run check-types` and `pnpm run build` in the `frontend/apps/web/` directory to ensure frontend builds cleanly.
   - Verify that tests pass.

5. Perform Git Operations:
   - Run `git add` for the modified files.
   - Run `git commit -m "..."` with a clear message describing the partner request state machine fixes and frontend diff UI / form live toggle improvements.
   - Run `git push` to push the changes.

Provide your handoff report in `d:/laragon/www/NightLife-VN/.agents/teamwork_preview_worker_m6_7_1/handoff.md` summarizing the changes, the build output, and the git commit/push success.
