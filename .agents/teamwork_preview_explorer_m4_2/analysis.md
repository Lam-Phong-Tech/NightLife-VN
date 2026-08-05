# Technical Analysis: Sub-routes & Monolith Extraction (Milestone 4 / PR 4)

**Explorer**: `teamwork_preview_explorer` (PR4 Sub-routes & Monolith Extraction Explorer)  
**Date**: 2026-08-05  
**Target Milestone**: Milestone 4 (PR 4)  
**Working Directory**: `d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_m4_2\`

---

## Executive Summary

This report provides a technical specification and extraction plan for refactoring activity feed and bill submission functionalities from the legacy monolith `frontend/apps/web/src/app/partner/page.tsx` into modular Next.js sub-routes under `/partner/activity`:
1. `/partner/activity/page.tsx` (Paginated Activity Feed with filter tabs, search, custom date range, and quick detail drawer).
2. `/partner/activity/new-bill/page.tsx` (Standalone Bill Submission Form extracted from monolith lines 7785–8300 & 3560–3620).
3. `/partner/activity/[activityId]/page.tsx` (Standalone Activity Detail View for sharing and direct linking).

All sub-route designs strictly adhere to project-wide User Rules: **NO native browser `<select>`**, **NO native browser `alert/confirm/prompt`**, and **NO native datepicker**.

---

## 1. Sub-Routes & Client Modules Architecture

### 1.1 Target File Structure & Component Mapping
```
frontend/apps/web/src/
├── lib/
│   └── api/
│       └── partner-portal.ts          # API client for GET /partner/activity, GET /partner/activity/:id, POST /partner/bills
├── hooks/
│   └── usePartnerActivity.ts          # Custom hook for activity fetching, cursor pagination, and filtering
└── app/
    └── partner/
        ├── gui-hoa-don/
        │   └── page.tsx               # Legacy redirect -> /partner/activity/new-bill
        └── activity/
            ├── page.tsx               # Activity Feed sub-route
            ├── new-bill/
            │   └── page.tsx           # Bill Submission sub-route
            └── [activityId]/
                └── page.tsx           # Activity Detail sub-route
```

### 1.2 User Rules Compliance Matrix

| Feature Element | Monolith Implementation (`page.tsx`) | Sub-route Standardized Implementation | Rule Compliance |
|---|---|---|---|
| **Store Selector** | Hidden native `<select id="bill-store-select-hidden">` (lines 8040-8052) | `ThemedListingSelect` component (`@/components/ui/ThemedListingSelect`) | ✅ NO native `<select>` |
| **Booking Link Selector** | Custom `ThemedListingSelect` (lines 8141-8152) | Standardized `ThemedListingSelect` | ✅ NO native `<select>` |
| **Notifications & Dialogs** | Inline notice state / standard alert patterns | `useSystemFeedback()` hook (`@/components/ui/SystemFeedback`) with toast & modal API | ✅ NO native `alert/confirm` |
| **Usage Date/Time Picker** | Hidden native `<input type="datetime-local">` (lines 8105-8111) | Ant Design `DatePicker` (`BookingDateTimeFields`) with `viVN` locale & gold theme | ✅ NO native DatePicker |
| **Filter Date Range** | Non-existent in monolith bill tab | Custom Antd `DatePicker.RangePicker` styled with partner theme tokens | ✅ NO native DatePicker |

---

## 2. Analysis: `/partner/activity/page.tsx` (Paginated Activity Feed)

### 2.1 State Management & Hook API (`usePartnerActivity`)
- **Hook Inputs**:
  - `storeId`: string (Filter by current active store from `usePartnerStoreScope()`).
  - `type`: `'ALL' | 'BILL_PAYMENT' | 'COUPON_USAGE' | 'BOOKING_CHECKIN'`.
  - `search`: string (Debounced search query matching bill number, booking code, coupon code, customer name/phone).
  - `startDate`, `endDate`: string (ISO 8601 boundary strings).
  - `limit`: number (default `20`).
- **Hook Outputs**:
  - `activities`: `PartnerActivityItem[]`.
  - `hasMore`: boolean.
  - `isLoading`: boolean.
  - `isFetchingNextPage`: boolean.
  - `fetchNextPage`: `() => void` (Uses cursor opaque token).
  - `refetch`: `() => void`.

### 2.2 UI Layout Breakdown
1. **Header Bar**:
   - Eyebrow: `TRANSACTION & ACTIVITY FEED`
   - Title: `Lịch sử hoạt động`
   - Primary Action: Button linking to `/partner/activity/new-bill` (`<Plus size={14} /> Gửi hóa đơn mới`).
2. **Filter & Search Controls**:
   - **Filter Tabs**:
     - `Tất cả` (`ALL`)
     - `Thanh toán hóa đơn` (`BILL_PAYMENT`)
     - `Mã giảm giá` (`COUPON_USAGE`)
     - `Check-in đặt bàn` (`BOOKING_CHECKIN`)
   - **Search Field**: Integrated search input with clear icon and 300ms debounce.
   - **Custom Date Range Filter**: Antd RangePicker styled with `var(--partner-border-gold-22)` and `var(--partner-surface-2)`.
3. **Activity Card List & Responsive Presentation**:
   - **Desktop View**: Grid/Table showing STT, Mã giao dịch, Loại hoạt động, Khách hàng, Giá trị (Gross / Discount), Thời gian, and Status Pill (`VERIFIED`, `SUBMITTED`, `REJECTED`, `PAID`, `VOIDED`).
   - **Mobile View**: Touch-optimized stacked cards (`partner-bill-mobile-card` style) displaying type badge, store name, formatted VND amount, and date.
4. **Infinite Scroll / Load More Trigger**:
   - "Tải thêm hoạt động" button visible when `hasMore === true`.
   - Skeleton loader (`LoadingSkeleton` / `DataLoading`) during fetching.
5. **Quick Detail Drawer**:
   - Clicking an activity card opens `ActivityDetailDrawer` overlay with item summary and a link to `/partner/activity/[activityId]`.

---

## 3. Analysis: `/partner/activity/new-bill/page.tsx` (Bill Submission Form)

### 3.1 Extraction Mapping from Monolith
- **UI Source**: Monolith `page.tsx` lines 7785–8300 (`renderBillPanel()` form subview).
- **Handler Source**: Monolith `page.tsx` lines 3562–3620 (`submitPartnerBill`).

### 3.2 Component & Form Field Specifications
1. **Store Switcher Field**:
   - Replaces native `<select>` with `ThemedListingSelect`.
   - Options populated from `stores` array.
2. **Total Bill Amount (`totalVnd`)**:
   - Numeric input formatted live with `toLocaleString('vi-VN')`.
   - Custom VND suffix badge.
   - Parsing logic: strips non-numeric characters, calculates integer total.
3. **Usage Time Field (`usedAt`)**:
   - Antd DatePicker / TimePicker component formatted in local time (`YYYY-MM-DD HH:mm`).
   - Defaults to current timestamp or linked booking scheduled time.
4. **Linked Booking Field**:
   - Rendered using `ThemedListingSelect`.
   - Options list confirmed bookings for the selected store.
   - Auto-displays applied discount rule label (`billDiscountLabel`) when linked.
5. **Evidence Attachment Field**:
   - Styled file upload button (`<ImagePlus /> Chọn file`) accepting `image/*,.pdf`.
   - Image preview modal/box or PDF filename chip with remove button ("Xóa file").
6. **Form Submission & Feedback Flow**:
   - Submit handler triggers `billApi.submitPartnerBill` and optional `billApi.uploadEvidence`.
   - Replaces inline error message boxes with `feedback.showToast({ tone: 'success' | 'error', title, description })`.
   - On success, redirects to `/partner/activity`.

---

## 4. Analysis: `/partner/activity/[activityId]/page.tsx` (Standalone Detail Page)

### 4.1 Overview & Routing
- Route parameter: `params.activityId`.
- Fetches data from `GET /partner/activity/:activityId`.

### 4.2 Section Layout
1. **Breadcrumb & Header**:
   - `<Link href="/partner/activity">← Quay lại danh sách</Link>`
   - Share / Copy Link button with toast notification feedback.
2. **Activity Header Card**:
   - Activity Type icon & title (`THÁNH TOÁN HÓA ĐƠN`, `MÃ GIẢM GIÁ`, `CHECK-IN ĐẶT BÀN`).
   - Status Pill with tone (`VERIFIED`, `SUBMITTED`, `REJECTED`, etc.).
   - Activity timestamp (`activityAt`).
3. **Customer & Store Details Card**:
   - Store Name and Store ID.
   - Customer Name, Phone, and Tier (`VIP`, `Member`, `Guest`).
4. **Financial Breakdown Card**:
   - Gross Amount (`totalVnd`).
   - Discount Amount (`discountVnd`). Displays *"Giảm giá: Chưa xác định"* when `discountVnd === null`. Never displays `-totalVnd`.
   - Net Amount.
   - Applied Coupon Code & Rule Snapshot details.
   - Linked Booking Code & Bill Number.
5. **Rejection Alert & Resubmit Action**:
   - If status is `REJECTED`, displays alert banner with `rejectReason` and button "Gửi lại hóa đơn" (`/partner/activity/new-bill`).

---

## 5. Redirect Strategy

- **`?panel=bill`**: Handled in `PartnerShellClient.tsx` / `page.tsx` by detecting `panel === 'bill'` and performing `router.replace('/partner/activity')`.
- **`/partner/gui-hoa-don`**: `frontend/apps/web/src/app/partner/gui-hoa-don/page.tsx` calls `redirect('/partner/activity/new-bill')`.

---

## Conclusion & Next Steps

The sub-routes extraction strategy for Milestone 4 (PR 4) is fully designed and aligned with project constraints and User Rules. Implementation will cleanly decouple activity feed management and bill submissions from the monolith, preparing the codebase for Milestone 5 monolith cleanup.
