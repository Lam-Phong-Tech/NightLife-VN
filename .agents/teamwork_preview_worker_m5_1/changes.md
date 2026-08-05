# Milestone 5 (PR 5: Home Redesign & Monolith Cleanup) Changes Report

## Summary of Changes

### 1. Home Dashboard Redesign (`frontend/apps/web/src/app/partner/page.tsx`)
- Refactored 8,752 lines of legacy monolithic code into a clean, 196-line Home Dashboard component.
- Consumed `fetchPartnerHome(selectedStoreId)` from `@/lib/api/partner-portal`.
- Integrated `usePartnerStoreScope()` for `selectedStoreId`, `activeStore`, and `isStaffAccount`.
- Rendered 4 Overview KPI Cards:
  - **Tổng doanh thu**: Formatted VND with `discountVnd === null` rendered as *"Giảm giá: Chưa xác định"*. Never renders negative values.
  - **Số lượng hóa đơn**: Total bill count.
  - **Lượt đặt bàn**: Total booking count.
  - **Ưu đãi đang chạy**: Active coupons count.
- Rendered Quick Action Navigation Tiles:
  - Nạp Hóa Đơn Mới -> `/partner/activity/new-bill`
  - Quét Mã QR -> `/partner/scan`
  - Quản lý Danh mục -> `/partner/listing` (Hidden for staff)
  - Cấu hình Cửa hàng -> `/partner/settings` (Hidden for staff)
  - Quản lý Nhân viên -> `/partner/settings/staff` (Hidden for staff)
- Rendered Recent Activities Feed Preview: Top 5 items with status pills (`badgeTone`, `statusLabel`), customer info (`customerName`, `customerPhone`), formatted money (`totalVnd`, `discountVnd`), and detail navigation.
- Handled legacy URL query parameter redirects (`?panel=scan`, `?panel=listing`, `?panel=settings`, `?panel=bill`, `?panel=activity`) via `router.replace()`.
- Obeyed all User Rules (0 native browser `<select>`, 0 native browser `alert/confirm/prompt`, 0 native browser datepicker).

### 2. Test Mocks Update
- Updated `PartnerLiteDashboard.test.tsx`, `PartnerOfflineScanQueue.test.tsx`, and `PartnerBillSubmitPage.test.tsx` to supply `useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() })` in `vi.mock('next/navigation')`.
- Refactored `PartnerOfflineScanQueue.test.tsx` to test the extracted `PartnerScanClient` component.

### 3. Unit Test Suite (`frontend/apps/web/__tests__/PartnerHomePage.test.tsx`)
- Created comprehensive test suite verifying:
  - Overview KPI rendering.
  - Quick action navigation links.
  - Recent activity feed preview rendering & empty fallback state.
  - Legacy query parameter redirects (`?panel=bill`, `?panel=activity`, `?panel=scan`).
  - Zero monolith regressions.

### 4. Code Quality & Syntax Fixes
- Fixed syntax error in `ThemedListingSelect.tsx` empty options branch.
