# Handoff Report — PR4 API Client & Custom Hook Explorer (`teamwork_preview_explorer_m4_1`)

## 1. Observation
- **Backend Endpoints & DTOs**:
  - Investigated `backend/src/nightlife-data/dto/partner-activity-query.dto.ts` (lines 13-139). Observed `PartnerActivityQueryDto`, `PartnerActivityItem`, `PartnerActivityResponse`, and cursor helpers `encodeCursor`/`decodeCursor`.
  - Investigated `backend/src/nightlife-data/nightlife-data.contract.ts` (lines 2620-2692). Observed `PartnerHomeContract`, `PartnerActivitiesContract`, and `PartnerActivityDetailContract`.
  - Investigated `backend/src/nightlife-data/nightlife-data.service.ts` (lines 3893-4492). Verified return structures of `getPartnerHome`, `getPartnerActivities`, and `getPartnerActivityDetail`.
- **Existing Frontend API Architecture**:
  - Investigated `frontend/apps/web/src/lib/api/bills.ts` (lines 1-177) and `frontend/apps/web/src/lib/api/client.ts` (lines 1-615). Verified `apiClient` pattern, `ApiError` status mapping, and `translateApiMessage` Vietnamese localization.
  - Inspected `frontend/apps/web/src/app/partner/PartnerProviders.tsx` (lines 240-271). Verified `usePartnerStoreScope()` signature returning `selectedStoreId`, `stores`, `isStaffAccount`, `isPartnerAccount`.
  - Confirmed `frontend/apps/web/src/lib/api/partner-portal.ts` and `frontend/apps/web/src/hooks/usePartnerActivity.ts` do not exist yet and are ready for creation in PR4.

## 2. Logic Chain
1. **Mapping Backend to Client Types**: The backend endpoint `GET /partner/activity` receives `PartnerActivityQueryDto` and returns `PartnerActivityResponse` containing `PartnerActivityItem[]`, `nextCursor`, and `hasMore`. Creating TypeScript interfaces in `partner-portal.ts` matching these fields provides full type safety for frontend UI components.
2. **Encapsulating API Calls**: Wrapping calls using `apiClient<T>` with optional `AbortSignal` parameters ensures automatic token inclusion, Vietnamese error message translation via `ApiError`, and clean request cancellation capabilities.
3. **Reactive State via Custom Hook**: `usePartnerActivity` bridges the global store scope (`usePartnerStoreScope()`) with the paginated API client (`fetchPartnerActivities`). By maintaining `items`, `nextCursor`, `hasMore`, `loading`, `loadingMore`, and `error`, UI components get a clean, declarative interface (`fetchNextPage()`, `refresh()`, filter setters).
4. **Resiliency & Fault Tolerance**: Combining `AbortController` abort signals with request ID counters (`requestIdRef`) guarantees that rapid filter adjustments or store switches do not produce race conditions or duplicate entries.

## 3. Caveats
- **Scope Boundary**: As a read-only explorer, no source files were created or modified. Implementation should be carried out by implementer agents or human developers according to the code contracts specified in `analysis.md`.
- **UI Sub-route Integration**: Sub-route page components (`/partner/activity`, `/partner/activity/new-bill`, `/partner/activity/[activityId]`) will consume `usePartnerActivity` and `partnerPortalApi`. Their layout & presentation will be analyzed/implemented by peer sub-routes agents.

## 4. Conclusion
The frontend API client (`partner-portal.ts`) and custom React hook (`usePartnerActivity.ts`) are fully designed and ready for implementation. The design satisfies all PR4 requirement criteria, maintains store scope context synchronization, avoids race conditions, and adheres to project rules (no browser native alerts, select inputs, or date pickers).

## 5. Verification Method
To verify the implementation once created:
1. **Type Check**:
   ```bash
   cd frontend/apps/web && pnpm run typecheck
   ```
2. **Hook Unit & Component Test**:
   Verify `usePartnerActivity()` initializes with `loading: true`, switches store scopes when `selectedStoreId` updates in `PartnerStoreScopeProvider`, appends new items on `fetchNextPage()`, and resets state on `refresh()`.
3. **Network Call Verification**:
   Inspect Browser Developer Tools > Network tab when switching tabs (`ALL`, `COUPON_USAGE`, `BILL_PAYMENT`, `BOOKING_CHECKIN`) or updating search parameters to ensure params `type`, `startDate`, `endDate`, `search`, `storeId`, and `cursor` are correctly encoded.
