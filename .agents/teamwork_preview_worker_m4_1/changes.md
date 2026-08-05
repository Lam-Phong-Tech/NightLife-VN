# Milestone 4 Implementation Summary (PR 4: Activity Core, New Bill Route & Safe Legacy Redirects)

## Code Changes & Sub-route Additions

1. **`frontend/apps/web/src/lib/api/partner-portal.ts`**:
   - Defined TypeScript interfaces: `PartnerActivityItem`, `PartnerActivityQueryParams`, `PartnerActivityResponse`, `PartnerHomeOverview`, `PartnerHomeMetrics`, `PartnerActivityType`, `PartnerActivityLinkedEntities`.
   - Implemented typed API client helpers using `apiClient<T>` with full `AbortSignal` cancellation support and error translation:
     - `fetchPartnerHome(storeId?: string, signal?: AbortSignal)`
     - `fetchPartnerActivities(params?: PartnerActivityQueryParams, signal?: AbortSignal)`
     - `fetchPartnerActivityDetail(activityId: string, storeId?: string, signal?: AbortSignal)`
   - Exported `partnerPortalApi` module containing `getActivityFeed`.

2. **`frontend/apps/web/src/hooks/usePartnerActivity.ts`**:
   - Implemented custom React hook managing stable cursor pagination state (`items`, `data`, `nextCursor`, `meta`, `hasMore`, `loading`, `isLoading`, `loadingMore`, `isFetchingNextPage`, `error`).
   - Integrated seamlessly with `usePartnerStoreScope()` to auto-sync active store filter.
   - Built abort controller ref and sequence ID handling to cancel pending in-flight requests on filter or store change.
   - Exposed state modifiers: `setType`, `setStartDate`, `setEndDate`, `setSearch`, `setFilters`, `fetchNextPage`, `refresh` / `refetch`.

3. **Sub-routes Implementation**:
   - `/partner/activity/page.tsx`:
     - Paginated Activity Feed with type filter tabs (`ALL`, `BILL_PAYMENT`, `COUPON_USAGE`, `BOOKING_CHECKIN`), debounced search bar, Antd RangePicker (NO native date picker), activity card list, status pills, and "Tải thêm" button.
   - `/partner/activity/new-bill/page.tsx`:
     - Standalone Bill Submission Form extracted from monolith.
     - Uses `ThemedListingSelect` (NO native `<select>`), Antd `DatePicker` (NO native datepicker), and `useSystemFeedback()` toast/modals (NO native `alert/confirm`).
     - Includes currency formatting, evidence file upload, and OCR preview pre-fill (`billApi.previewBillOcr`).
   - `/partner/activity/[activityId]/page.tsx`:
     - Standalone detail view for an activity record displaying store/customer details, financial breakdown, coupon/booking info, share button, and rejection resubmit banner.

4. **Legacy Redirects**:
   - `frontend/apps/web/src/app/partner/gui-hoa-don/page.tsx`: Updated server-side `redirect` to `/partner/activity/new-bill`.
   - `frontend/apps/web/src/app/partner/page.tsx`: Updated `useEffect` redirect for legacy query parameters `?panel=bill` -> `/partner/activity/new-bill` and `?panel=activity` -> `/partner/activity`.

5. **Unit Tests Added**:
   - `frontend/apps/web/__tests__/usePartnerActivity.test.tsx` (5/5 PASSED)
   - `frontend/apps/web/__tests__/PartnerActivityPage.test.tsx` (4/4 PASSED)
   - `frontend/apps/web/__tests__/PartnerNewBillPage.test.tsx` (3/3 PASSED)
   - `frontend/apps/web/__tests__/PartnerBillSubmitPage.test.tsx` (3/3 PASSED)
