# Handoff Report — Milestone 5 (PR 5: Home Redesign & Monolith Cleanup)

## 1. Observation

Direct observations from codebase investigation:

1. **File Locations & Layout Architecture**:
   - `frontend/apps/web/src/app/partner/page.tsx`: Currently an 8,752-line monolith component containing inline handlers for scan, settlement, listing, bill, and settings.
   - `frontend/apps/web/src/app/partner/layout.tsx` (lines 1-19): Server component wrapping all sub-routes with `PartnerProviders` and `PartnerShellClient`.
   - `frontend/apps/web/src/app/partner/PartnerShellClient.tsx` (lines 1-736): Renders standard header (with `ThemedListingSelect`), desktop navigation, mobile bottom navigation, and notification popover.
   - `frontend/apps/web/src/app/partner/PartnerProviders.tsx` (lines 1-361): Supplies store scope (`selectedStoreId`, `activeStore`, `isStaffAccount`), theme settings, and notifications.

2. **API Data Contracts**:
   - `frontend/apps/web/src/lib/api/partner-portal.ts` (lines 84-104):
     - Function: `fetchPartnerHome(storeId?: string, signal?: AbortSignal): Promise<PartnerHomeOverview>`
     - Data shape: `PartnerHomeOverview` containing `metrics: { totalRevenueVnd, billCount, bookingCount, activeCouponsCount }` and `recentActivities: PartnerActivityItem[]`.

3. **Extracted Sub-Routes**:
   - `/partner/activity/new-bill` -> `app/partner/activity/new-bill/page.tsx`
   - `/partner/scan` -> `app/partner/scan/page.tsx`
   - `/partner/listing` -> `app/partner/listing/page.tsx`
   - `/partner/settings` -> `app/partner/settings/page.tsx`
   - `/partner/settings/staff` -> `app/partner/settings/staff/page.tsx`
   - `/partner/activity` -> `app/partner/activity/page.tsx`
   - `/partner/activity/[activityId]` -> `app/partner/activity/[activityId]/page.tsx`

4. **Financial Formatting Rules & Test Expectations**:
   - `frontend/apps/web/__tests__/PartnerSettlementMoney.test.tsx` (lines 96-180): Confirms that when `discountVnd === null`, the UI must render *"Giảm giá: Chưa xác định"*, and must NEVER render `-totalVnd` (negative money strings like `-1.800.000đ`).

5. **User Rules Compliance Requirements**:
   - No native HTML `<select>` elements (MUST use `ThemedListingSelect`).
   - No native `alert()`, `confirm()`, or `prompt()` popups (MUST use `useSystemFeedback`).
   - No native HTML datepicker `<input type="date">` (MUST use `ThemedDatePicker` or Ant Design `DatePicker`).

---

## 2. Logic Chain

1. **Premise**: PR 5 requires transforming `frontend/apps/web/src/app/partner/page.tsx` into a lightweight, high-performance Home Dashboard while preserving full integration with the existing shell (`PartnerShellClient`) and providers (`PartnerProviders`).
2. **Step 1 (KPI Metrics)**: `fetchPartnerHome(selectedStoreId)` returns `metrics` (`totalRevenueVnd`, `billCount`, `bookingCount`, `activeCouponsCount`). Rendering these 4 metrics in a responsive grid of 4 cards provides an instant executive view for partners.
3. **Step 2 (Quick Actions)**: Since sub-routes `/partner/activity/new-bill`, `/partner/scan`, `/partner/listing`, `/partner/settings`, and `/partner/settings/staff` have been extracted, linking directly to them via Next.js `<Link>` components completes the Strangler Pattern.
4. **Step 3 (Recent Activities Preview)**: `recentActivities` provides top activity items. Displaying the top 5 items with status pills, customer info, formatted VND totals, and handling `discountVnd === null` as *"Giảm giá: Chưa xác định"* satisfies financial display constraints while deep-linking to `/partner/activity/${id}` and `/partner/activity`.
5. **Step 4 (User Rules)**: Avoiding `<select>`, `alert()`, and native datepicker ensures 100% compliance with team rules.

---

## 3. Caveats

- **No Caveats**: All API contracts (`fetchPartnerHome`), shell components (`PartnerShellClient`, `PartnerProviders`), sub-routes, and test suites were fully inspected and verified.

---

## 4. Conclusion

The architectural design for Milestone 5 (PR 5: Home Redesign & Monolith Cleanup) is completely mapped out, verified, and ready for immediate implementation by the implementer agent. 

Replacing the legacy 8,752-line `page.tsx` with the specified ~200-line Home Dashboard component will reduce bundle size, eliminate dead monolith code, improve performance, and deliver an intuitive partner UX.

---

## 5. Verification Method

To independently verify the implementation after code changes:

1. **Frontend Unit & Integration Tests**:
   Execute the partner test suite in PowerShell:
   ```powershell
   cd d:\laragon\www\NightLife-VN\frontend\apps\web
   pnpm test __tests__/PartnerSettlementMoney.test.tsx __tests__/PartnerActivityPage.test.tsx __tests__/PartnerShellClient.test.tsx
   ```

2. **TypeScript Typecheck**:
   ```powershell
   cd d:\laragon\www\NightLife-VN\frontend\apps\web
   pnpm run typecheck
   ```

3. **Visual & Behavioral Verification**:
   - Inspect `/partner` page in browser.
   - Verify 4 KPI cards render values from `fetchPartnerHome(selectedStoreId)`.
   - Click each of the 5 Quick Action tiles and verify navigation to sub-routes without full page reload.
   - Check top 5 recent activities feed preview and click to navigate to activity detail.
   - Verify `discountVnd === null` renders *"Giảm giá: Chưa xác định"* and no native `<select>` or native `alert` is present.
