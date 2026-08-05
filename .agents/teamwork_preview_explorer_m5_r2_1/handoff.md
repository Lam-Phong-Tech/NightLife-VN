# Milestone 5 Iteration 2 (PR 5: Home Redesign & Monolith Cleanup) Remediation Handoff Report

## 1. Observation

### System & Test Status Observation
- **TypeScript & Build Integrity**: `pnpm check-types` passes with 0 errors and `pnpm build` cleanly compiles all 125 static/dynamic routes including all 9 `/partner/*` sub-routes.
- **Partner Portal Vitest Suite Execution**:
  Running the 10 Partner test suites (`pnpm vitest run PartnerHomePage.test.tsx PartnerShellClient.test.tsx PartnerSettlementMoney.test.tsx PartnerActivityPage.test.tsx PartnerNewBillPage.test.tsx usePartnerActivity.test.tsx PartnerLiteDashboard.test.tsx PartnerBillSubmitPage.test.tsx PartnerOfflineScanQueue.test.tsx PartnerShellClient.edge-cases.test.tsx`) revealed test failures and regressions from pre-M5 monolith assumptions.

### File-Specific Observations

1. **`frontend/apps/web/src/app/partner/page.tsx` (Panel Map & Abort Handling)**:
   - **Lines 26–34**: `panelMap` maps legacy query params:
     ```typescript
     const panelMap: Record<string, string> = {
       scan: '/partner/scan',
       listing: '/partner/listing',
       settings: '/partner/settings',
       staff: '/partner/settings/staff',
       bill: '/partner/activity/new-bill',
       activity: '/partner/activity',
       settlement: '/partner/activity',
     };
     ```
     `staff: '/partner/settings/staff'` and `settlement: '/partner/activity'` must be maintained to support legacy links (`?panel=staff` and `?panel=settlement`).
   - **Lines 38–53 (`loadHomeData`)**:
     ```typescript
     const loadHomeData = useCallback(async (signal?: AbortSignal) => {
       setLoading(true);
       setError(null);
       try {
         const res = await fetchPartnerHome(selectedStoreId, signal);
         setData(res);
         setLoading(false);
       } catch (err: any) {
         if ((err instanceof Error && err.name === 'AbortError') || err?.name === 'AbortError') {
           return;
         }
         setError(err?.message || 'Không thể tải dữ liệu tổng quan');
         setLoading(false);
       }
     }, [selectedStoreId]);
     ```
     When fast store switching occurs, `loadHomeData` is called with a new `AbortSignal` while the previous request is aborted via `controller.abort()`. If `finally` or asynchronous resolution runs `setLoading(false)` without checking `signal.aborted`, it clears the loading indicator for the newly initiated store fetch.

2. **`frontend/apps/web/__tests__/PartnerSettlementMoney.test.tsx` (Stale Monolith Test)**:
   - **Lines 119–162 & 164–180**: Test renders `<PartnerPage />` with `mocks.searchParams = "panel=settlement"`, expecting inline settlement bill rows (`BILL-NULL-001`) from pre-M5 monolith.
   - In M5 architecture, `PartnerPage` is an overview dashboard (`PartnerHomePage`) that delegates activity/settlement feeds to `/partner/activity` and queries `/partner/home` for recent activities.
   - `mocks.apiClient` in `PartnerSettlementMoney.test.tsx` handles `/partner/bills` and `/partner/dashboard-lite`, but returns `Promise.resolve([])` for unhandled endpoints like `/partner/home`. Thus `recentActivities` returns empty, causing `expect(screen.getAllByText("BILL-NULL-001").length).toBeGreaterThan(0)` to fail.

3. **`frontend/apps/web/__tests__/PartnerLiteDashboard.test.tsx` (Stale Endpoint Mock)**:
   - **Lines 69–105 & 121–123**: Test asserts `expect(apiClient).toHaveBeenCalledWith(expect.stringContaining("/partner/dashboard-lite"))`.
   - In M5 architecture, `PartnerHomePage` queries `/partner/home` via `fetchPartnerHome(selectedStoreId, signal)`. Because `page.tsx` no longer calls `/partner/dashboard-lite`, the spy assertion fails with `AssertionError: expected spy to be called with arguments matching [ '/partner/dashboard-lite' ]`.

4. **`frontend/apps/web/__tests__/PartnerShellClient.edge-cases.test.tsx` & `ThemedListingSelect.tsx` (Store Switcher Query)**:
   - **Test Line 107**: `const selectTrigger = screen.getByRole('button', { name: 'Chọn quán hoạt động' });`
   - **Error**: `TestingLibraryElementError: Unable to find an accessible element with the role "button" and name "Chọn quán hoạt động"`.
   - **`ThemedListingSelect.tsx` Lines 72–105 & 167–189**: The custom `<button>` element did not receive `aria-label={ariaLabel ?? placeholder}` (the `ariaLabel` prop was only passed to the hidden `<select>` tag). The `<button>`'s accessible name was derived solely from its child text node (`selectedOption?.label`), which is "Alpha Bar", causing Testing Library's `getByRole('button', { name: 'Chọn quán hoạt động' })` query to fail.

---

## 2. Logic Chain

1. **Panel Map Verification**:
   - `panelMap` in `page.tsx` guarantees reverse compatibility for legacy bookmark URLs (`?panel=staff` -> `/partner/settings/staff` and `?panel=settlement` -> `/partner/activity`).

2. **Abort Signal & Loading State Integrity**:
   - In async React data fetching, when `selectedStoreId` changes quickly, the active effect cleanup invokes `controller.abort()`.
   - If `setLoading(false)` is invoked when `signal?.aborted` is `true`, it mutates state for an invalidated request lifecycle.
   - Refactoring `loadHomeData` with `try ... catch ... finally` where `finally { if (!signal?.aborted) setLoading(false); }` and checking `if (!signal?.aborted)` before `setData(res)` ensures rock-solid state hygiene during rapid store switching.

3. **Legacy Test Suite Modernization**:
   - `PartnerSettlementMoney.test.tsx` was expecting inline bill rendering on `/partner?panel=settlement`. To test settlement formatting without relying on monolith inline rendering:
     - Mock `/partner/home` response to return `recentActivities` containing the `mockBillWithNullDiscount` item.
     - Assert that `PartnerHomePage` displays `BILL-NULL-001`, displays `"Giảm giá: Chưa xác định"`, and refrains from rendering negative subtotal strings like `"-1.800.000đ"`.
   - `PartnerLiteDashboard.test.tsx` was expecting calls to `/partner/dashboard-lite`. Updating the endpoint mock and assertions to `/partner/home` aligns the test suite with M5 `PartnerHomePage` schema (`totalRevenueVnd`, `billCount`, `bookingCount`, `activeCouponsCount`).
   - `ThemedListingSelect.tsx` needs `aria-label={ariaLabel ?? placeholder}` on the trigger `<button>` so that accessible screen reader tools and Testing Library queries (`screen.getByRole('button', { name: 'Chọn quán hoạt động' })`) correctly match the control button.

---

## 3. Caveats

- **Read-Only Scope**: This report defines exact code fixes. Source files were inspected read-only and must be applied by the implementer agent.
- **Production Build & Types**: `pnpm check-types` and `pnpm build` are already 100% clean. The fixes focus on runtime state resilience during aborts and unit test suite alignment.

---

## 4. Conclusion & Actionable Diffs

### Remediation Action 1: `frontend/apps/web/src/app/partner/page.tsx`
Fix `loadHomeData` to prevent loading state flicker on abort and ensure `panelMap` includes `staff` and `settlement`.

```typescript
// Location: frontend/apps/web/src/app/partner/page.tsx (lines 23-53)

  // Legacy URL query parameter fallbacks
  useEffect(() => {
    const panel = searchParams?.get('panel');
    if (!panel) return;
    const panelMap: Record<string, string> = {
      scan: '/partner/scan',
      listing: '/partner/listing',
      settings: '/partner/settings',
      staff: '/partner/settings/staff',
      bill: '/partner/activity/new-bill',
      activity: '/partner/activity',
      settlement: '/partner/activity',
    };
    if (panelMap[panel]) router.replace(panelMap[panel]);
  }, [searchParams, router]);

  const loadHomeData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPartnerHome(selectedStoreId, signal);
      if (!signal?.aborted) {
        setData(res);
      }
    } catch (err: any) {
      if ((err instanceof Error && err.name === 'AbortError') || err?.name === 'AbortError' || signal?.aborted) {
        return;
      }
      setError(err?.message || 'Không thể tải dữ liệu tổng quan');
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [selectedStoreId]);
```

### Remediation Action 2: `frontend/apps/web/src/components/ui/ThemedListingSelect.tsx`
Add `aria-label` to the trigger button in `ThemedListingSelect`.

```typescript
// Location: frontend/apps/web/src/components/ui/ThemedListingSelect.tsx (lines 72-77)

      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel ?? placeholder}
        onClick={() => setIsOpen((current) => (disabled ? false : !current))}
        aria-expanded={isOpen}
```

### Remediation Action 3: `frontend/apps/web/__tests__/PartnerSettlementMoney.test.tsx`
Update mock router/api endpoints to supply `/partner/home` data with null discount bill item.

```typescript
// Location: frontend/apps/web/__tests__/PartnerSettlementMoney.test.tsx (lines 119-163)

      mocks.apiClient.mockImplementation((endpoint: string) => {
        if (endpoint === "/partner/stores") {
          return Promise.resolve([{ id: "store-1", name: "Neon Club", slug: "neon-club" }]);
        }
        if (endpoint.startsWith("/partner/home")) {
          return Promise.resolve({
            metrics: { totalRevenueVnd: 1800000, billCount: 1, bookingCount: 0, activeCouponsCount: 0 },
            recentActivities: [
              {
                id: "bill-null-discount-12345",
                rawId: "bill-null-discount-12345",
                sourceType: "BILL",
                activityType: "BILL_PAYMENT",
                title: "BILL-NULL-001",
                summary: "BILL-NULL-001",
                status: "SUBMITTED",
                statusLabel: "Đã gửi",
                badgeTone: "warning",
                totalVnd: 1800000,
                discountVnd: null,
                activityAt: "2026-07-03T15:00:00.000Z",
              },
            ],
          });
        }
        return Promise.resolve([]);
      });
```

### Remediation Action 4: `frontend/apps/web/__tests__/PartnerLiteDashboard.test.tsx`
Update endpoint spy assertion from `/partner/dashboard-lite` to `/partner/home`.

```typescript
// Location: frontend/apps/web/__tests__/PartnerLiteDashboard.test.tsx

      if (endpoint.startsWith("/partner/home")) {
        return Promise.resolve({
          metrics: {
            totalRevenueVnd: 15000000,
            billCount: 6,
            bookingCount: 17,
            activeCouponsCount: 2,
          },
          recentActivities: [],
        });
      }

    // In assertion:
    await waitFor(() => {
      expect(apiClient).toHaveBeenCalledWith(expect.stringContaining("/partner/home"));
    });
```

### Remediation Action 5: `frontend/apps/web/__tests__/PartnerShellClient.edge-cases.test.tsx`
With Remediation Action 2 applied to `ThemedListingSelect.tsx`, `screen.getByRole('button', { name: 'Chọn quán hoạt động' })` will find the select trigger button cleanly without test changes.

---

## 5. Verification Method

To independently verify after code application:

1. **TypeScript Typecheck**:
   `cd frontend/apps/web && pnpm check-types` (Must return exit code 0)

2. **Next.js Production Build**:
   `cd frontend/apps/web && pnpm build` (Must compile 125 static/dynamic routes cleanly with 0 errors)

3. **Vitest Test Suite Run**:
   `cd frontend/apps/web && pnpm vitest run PartnerHomePage.test.tsx PartnerShellClient.test.tsx PartnerSettlementMoney.test.tsx PartnerActivityPage.test.tsx PartnerNewBillPage.test.tsx usePartnerActivity.test.tsx PartnerLiteDashboard.test.tsx PartnerBillSubmitPage.test.tsx PartnerOfflineScanQueue.test.tsx PartnerShellClient.edge-cases.test.tsx`
   (All 10 test suites must pass cleanly with 0 failed tests)
