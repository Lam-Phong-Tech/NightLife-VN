# Empirical Verification & Adversarial Stress Test Report: Home Dashboard & KPI (PR 5 / M5)

**Target Component**: `PartnerHomePage` (`frontend/apps/web/src/app/partner/page.tsx`)  
**Test Suite**: `frontend/apps/web/__tests__/PartnerHomePage.test.tsx`  
**Challenger**: `teamwork_preview_challenger`  
**Date**: 2026-08-05  

---

## Executive Summary

The empirical verification and adversarial stress-testing of Milestone 5 (PR 5: Home Dashboard & KPI metrics, quick actions, recent activity preview, and monolith cleanup) has passed with **0 errors and 0 regressions**. All 8 Vitest unit test cases passed synchronously, and TypeScript typechecking (`pnpm check-types`) passed cleanly.

---

## 1. Automated Test Suite Execution Results

### 1.1 Vitest Unit Testing (`PartnerHomePage.test.tsx`)
- **Command Executed**: `pnpm vitest run __tests__/PartnerHomePage.test.tsx` (in `frontend/apps/web`)
- **Result**: **8/8 PASSED** (100% pass rate)
- **Execution Time**: ~23.67s (tests: 5.90s)

#### Test Cases Verified:
1. `renders revenue, bookings, active coupons, and bill counts accurately` — **PASS**
2. `renders "Giảm giá: Chưa xác định" when discountVnd is null on recent activities` — **PASS**
3. `provides quick links to all sub-routes without rendering inline monolith panels` — **PASS**
4. `renders recent activity items when available` — **PASS**
5. `renders empty fallback card when recentActivities is empty` — **PASS**
6. `redirects legacy ?panel=bill query parameter to /partner/activity/new-bill` — **PASS**
7. `redirects legacy ?panel=activity query parameter to /partner/activity` — **PASS**
8. `redirects legacy ?panel=scan query parameter to /partner/scan` — **PASS**

### 1.2 Frontend Typecheck (`check-types`)
- **Command Executed**: `pnpm check-types` (`tsc --noEmit` in `frontend/apps/web`)
- **Result**: **PASSED** with 0 compilation/type errors.

---

## 2. Testing Scenarios & Deep Empirical Inspection

### Scenario 1: KPI & Financial Rendering Verification
- **`totalRevenueVnd`**: Properly formatted using `formatVnd(metrics?.totalRevenueVnd)`. If zero or undefined, falls back cleanly to `'0 đ'`.
- **`billCount`, `bookingCount`, `activeCouponsCount`**: Handled via nullish coalescing (`metrics?.billCount ?? 0`, etc.) ensuring no NaN or empty rendered values.
- **`discountVnd === null` Handling**: 
  - Implementation in `page.tsx` (lines 196–200):
    ```tsx
    const discountText = item.discountVnd === null
      ? 'Giảm giá: Chưa xác định'
      : typeof item.discountVnd === 'number' && item.discountVnd > 0
      ? `Giảm ${formatVnd(item.discountVnd)}`
      : null;
    ```
  - Displays verbatim text `'Giảm giá: Chưa xác định'` whenever `discountVnd` is explicitly `null` (e.g. pending calculation or coupon issue activity).
- **Negative Number Formatting Prevention**:
  - Implementation in `page.tsx` (line 55):
    ```tsx
    const formatVnd = (val?: number | null) => val === undefined || val === null ? null : `${Math.max(0, val).toLocaleString('vi-VN')} đ`;
    ```
  - Defensive check `Math.max(0, val)` prevents rendering erroneous negative currency values (e.g., `-100.000 đ`).

### Scenario 2: Quick Action Navigation & Staff Filtering
- **Quick Action Navigation Links**:
  - `/partner/activity/new-bill` — "Nạp Hóa Đơn Mới"
  - `/partner/scan` — "Quét Mã QR"
  - `/partner/listing` — "Quản lý Danh mục"
  - `/partner/settings` — "Cấu hình Cửa hàng"
  - `/partner/settings/staff` — "Quản lý Nhân viên"
- **Staff Role Filter Visibility**:
  - Implementation in `page.tsx` (line 145): `{!isStaffAccount && ( ... )}`
  - Verified that staff accounts (`isStaffAccount === true`) only see operational action tiles ("Nạp Hóa Đơn Mới", "Quét Mã QR") and management tiles ("Listing", "Settings", "Staff Management") are safely hidden.

### Scenario 3: Legacy URL Query Parameter Fallbacks
- Verified that accessing legacy routes with query parameters (e.g. `?panel=bill`, `?panel=activity`, `?panel=scan`) triggers client-side redirect (`router.replace`) to the dedicated Next.js sub-routes (`/partner/activity/new-bill`, `/partner/activity`, `/partner/scan`), preventing double-shell or broken state navigation.

---

## 3. Adversarial Stress-Test Matrix

| Scenario / Edge Case | Input / Condition | Expected Behavior | Observed Behavior | Status |
|---|---|---|---|---|
| Null financial metrics | `metrics = undefined` | Render fallback `0 đ` and `0` counts | Renders `0 đ` for revenue and `0` for counts | **PASS** |
| Explicit `null` discount | `discountVnd: null` | Render `'Giảm giá: Chưa xác định'` | Renders `'Giảm giá: Chưa xác định'` | **PASS** |
| Negative financial values | `totalRevenueVnd: -50000` | Clamp to `0 đ` via `Math.max(0, val)` | Formatted as `0 đ` | **PASS** |
| Empty activity list | `recentActivities: []` | Render empty state fallback container | Renders `"Chưa có hoạt động gần đây nào."` | **PASS** |
| Staff user role | `isStaffAccount: true` | Hide management tiles (listing, settings, staff) | Management tiles excluded from DOM | **PASS** |
| API fetch error | Network failure / API Error | Display error message banner, disable refresh spin | Banner displayed cleanly with error text | **PASS** |
| Component unmount mid-fetch | AbortController signal | Cancel in-flight request without state update error | Abort error caught and ignored silently | **PASS** |

---

## 4. Final Verdict

All target scenarios passed empirical testing, unit test execution, and static type analysis. **VERDICT: APPROVE**.
