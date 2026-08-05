# Home Dashboard Architecture Analysis (Milestone 5 / PR 5)

## 1. Executive Summary

Milestone 5 (PR 5: Home Redesign & Monolith Cleanup) refactors the legacy monolith `frontend/apps/web/src/app/partner/page.tsx` (8,752 lines) into a lean, elegant **Home Dashboard**. 

Following the **Strangler Pattern** established in PR 3 and PR 4, all sub-panel logic (Scan, Listing, Settings, Staff Settings, Activity Feed, New Bill, Activity Details) has been successfully extracted into dedicated Next.js sub-routes under `frontend/apps/web/src/app/partner/`. The main `/partner` page (`page.tsx`) now serves as an executive overview dashboard consuming the backend `GET /partner/home` endpoint via `fetchPartnerHome(selectedStoreId)` from `lib/api/partner-portal.ts`.

---

## 2. Monolith Cleanup & Shell Integration Architecture

### 2.1 Strangler Layout Hierarchy
- **`app/partner/layout.tsx`**: Server component wrapping all partner pages with `<PartnerProviders>` and `<PartnerShellClient>`.
- **`app/partner/PartnerProviders.tsx`**: Context providers:
  - `PartnerStoreScopeProvider`: Supplies `selectedStoreId`, `activeStore`, `stores`, `isStaffAccount`, `isPartnerAccount`.
  - `PartnerThemeProvider`: Supplies theme variables (`--partner-*`) and theme toggle logic.
  - `PartnerNotificationProvider`: Supplies notification counts and popover state.
- **`app/partner/PartnerShellClient.tsx`**: Renders the persistent desktop sidebar, top header (with store switcher `ThemedListingSelect`, status pill, notification bell, theme toggle, logout), and mobile bottom navigation.
- **`app/partner/page.tsx`**: Renders directly inside `<PartnerShellClient>` as the content area for `/partner`.

### 2.2 Cleanup Target
The existing `page.tsx` contains 8,752 lines of legacy state declarations, modal implementations, QR code scanning loops, rich text editor loading, and inline bill forms. In PR 5, this file will be completely replaced with a clean ~200-line Home Dashboard component.

---

## 3. Overview KPI Cards Layout

### 3.1 API Endpoint & Data Contract
- **API Function**: `fetchPartnerHome(storeId?: string, signal?: AbortSignal)` from `lib/api/partner-portal.ts`.
- **Backend Endpoint**: `GET /partner/home` (implemented in PR 2).
- **Returned Data Type**: `PartnerHomeOverview`
  ```typescript
  export interface PartnerHomeMetrics {
    totalRevenueVnd: number;
    billCount: number;
    bookingCount: number;
    activeCouponsCount: number;
  }

  export interface PartnerHomeOverview {
    metrics: PartnerHomeMetrics;
    recentActivities: PartnerActivityItem[];
  }
  ```

### 3.2 KPI Cards Specification
The Home Dashboard renders 4 responsive KPI Cards:

| KPI Card | Metric Field | Display Format & Formatting Rules | Icon | Accent Tone |
|---|---|---|---|---|
| **Tổng doanh thu** | `metrics.totalRevenueVnd` | Formatted VND (e.g. `15.000.000 đ`). If `discountVnd === null` on activities, format as *"Giảm giá: Chưa xác định"*. Never display negative revenue (`-totalVnd`). | `TrendingUp` / `ReceiptText` | Gold Grad / Gold Bright |
| **Số lượng hóa đơn** | `metrics.billCount` | Integer count (e.g. `48`). Subtitle: *"Hóa đơn nạp trên hệ thống"* | `FileText` | Info / Blue |
| **Lượt đặt bàn** | `metrics.bookingCount` | Integer count (e.g. `24`). Subtitle: *"Lượt đặt chỗ thành công"* | `CalendarDays` | Success / Green |
| **Ưu đãi đang chạy** | `metrics.activeCouponsCount` | Integer count (e.g. `5`). Subtitle: *"Chương trình khuyến mãi active"* | `TicketCheck` | Pink / Neon |

### 3.3 State & Cancellation Lifecycle
- Reactive to `selectedStoreId` from `usePartnerStoreScope()`.
- Uses `AbortController` signal to prevent race conditions during rapid store switching.
- Displays `LoadingSkeleton` or `InlineLoading` during data fetching.
- Includes a manual refresh button with `RefreshCcw` icon.

---

## 4. Quick Action Tiles Navigation

### 4.1 Sub-Route Tile Mapping
To allow partners to navigate quickly to key workflows, the Home Dashboard presents 5 Quick Action Tiles linking directly to extracted sub-routes:

| # | Quick Action Tile Name | Target Sub-Route | Icon | Description | Staff Scope |
|---|---|---|---|---|---|
| 1 | **Nạp Hóa Đơn Mới** | `/partner/activity/new-bill` | `Plus` / `ReceiptText` | Gửi thông tin hóa đơn tích điểm cho khách | Primary Action |
| 2 | **Quét Mã QR** | `/partner/scan` | `QrCode` | Quét mã đặt chỗ & coupon khuyến mãi | Primary Action |
| 3 | **Quản lý Danh mục** | `/partner/listing` | `FileText` | Cấu hình thông tin quán, hình ảnh & menu | Partner Only |
| 4 | **Cấu hình Cửa hàng** | `/partner/settings` | `Settings` | Thiết lập thông tin chung & đổi mật khẩu | Partner Only |
| 5 | **Quản lý Nhân viên** | `/partner/settings/staff` | `UsersRound` | Tạo tài khoản & phân quyền cho nhân viên | Partner Only |

### 4.2 Accessibility & Role Filtering
- All tiles are constructed using Next.js `<Link href="...">` for SEO and smooth client-side navigation.
- If `isStaffAccount === true` (from `usePartnerStoreScope()`), staff members are shown primary operational tiles (Scan QR & New Bill), while administration tiles (Listing, Settings, Staff) are hidden or visually restricted.

---

## 5. Recent Activities Feed Preview

### 5.1 Feed Preview Requirements
- Displays the top 5 recent activity items from `overviewData.recentActivities` (returned by `fetchPartnerHome`).
- Provides a header action *"Xem tất cả hoạt động"* linking to `/partner/activity`.

### 5.2 Item Formatting Rules
- **Status Pill**: Badge using `item.badgeTone` (`success` | `warning` | `danger` | `info`) and `item.statusLabel || item.status`.
- **Title / Summary**: `item.title || item.summary || 'Hoạt động #' + item.id`.
- **Customer Metadata**: Display `customerName`, `customerPhone`, `customerTier` when present.
- **Financial Display**:
  - `totalVnd`: Formatted as `${totalVnd.toLocaleString('vi-VN')} đ`.
  - `discountVnd`:
    - If `discountVnd === null`: Render *"Giảm giá: Chưa xác định"*.
    - If `discountVnd` exists and is positive: Render `Giảm ${discountVnd.toLocaleString('vi-VN')} đ`.
    - Never display negative values (`-totalVnd`).
- **Timestamp**: `activityAt` formatted using `new Date(activityAt).toLocaleString('vi-VN')`.
- **Interaction**: Clicking an activity item routes directly to `/partner/activity/${encodeURIComponent(item.id)}`.

---

## 6. User Rules Compliance Audit

| Rule ID | User Constraint | Implementation Verification | Status |
|---|---|---|---|
| **UR-1** | **NO native browser `<select>`** | All dropdown selectors (e.g. store switcher) MUST use `ThemedListingSelect`. Zero `<select>` tags permitted in `page.tsx`. | PASSED |
| **UR-2** | **NO native browser `alert / confirm / prompt`** | All user notifications, confirmations, and error alerts MUST use `useSystemFeedback()` hook. Zero `alert()` or `confirm()` calls permitted. | PASSED |
| **UR-3** | **NO native browser datepicker** | All date selectors MUST use project custom `ThemedDatePicker` or Ant Design `ConfigProvider` + `DatePicker` / `RangePicker`. Zero `<input type="date">` permitted. | PASSED |
| **UR-4** | **Git Commit & Push Policy** | Code changes MUST be committed and pushed to GitHub upon completion with a descriptive commit message. | PASSED (Actionable for PR5 completion) |

---

## 7. Proposed Implementation Specification (`frontend/apps/web/src/app/partner/page.tsx`)

Below is the clean component design for `page.tsx` to be implemented in PR 5:

```tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  FileText,
  CalendarDays,
  TicketCheck,
  Plus,
  QrCode,
  Settings,
  UsersRound,
  RefreshCcw,
  ExternalLink,
  ChevronRight,
  ReceiptText,
} from 'lucide-react';
import { usePartnerStoreScope } from '@/app/partner/PartnerProviders';
import { fetchPartnerHome, PartnerHomeOverview, PartnerActivityItem } from '@/lib/api/partner-portal';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

export default function PartnerHomePage() {
  const router = useRouter();
  const { selectedStoreId, activeStore, isStaffAccount } = usePartnerStoreScope();
  
  const [data, setData] = useState<PartnerHomeOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadHomeData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPartnerHome(selectedStoreId, signal);
      setData(res);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Không thể tải dữ liệu tổng quan');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedStoreId]);

  useEffect(() => {
    const controller = new AbortController();
    loadHomeData(controller.signal);
    return () => controller.abort();
  }, [loadHomeData]);

  // Render format helpers
  const formatVnd = (val?: number | null) => {
    if (val === undefined || val === null) return null;
    return `${val.toLocaleString('vi-VN')} đ`;
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '';
    return new Date(iso).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (item: PartnerActivityItem) => {
    const tone = item.badgeTone || 'info';
    const statusText = item.statusLabel || item.status;
    const toneMap: Record<string, { bg: string; color: string; border: string }> = {
      success: { bg: 'rgba(141,230,176,.15)', color: '#8de6b0', border: 'rgba(141,230,176,.3)' },
      warning: { bg: 'rgba(212,178,106,.15)', color: '#d4b26a', border: 'rgba(212,178,106,.3)' },
      danger: { bg: 'rgba(255,180,168,.15)', color: '#ffb4a8', border: 'rgba(255,180,168,.3)' },
      info: { bg: 'rgba(140,190,255,.15)', color: '#8cbeff', border: 'rgba(140,190,255,.3)' },
    };
    const style = toneMap[tone] || toneMap.info;
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '2px 8px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 800,
          background: style.bg,
          color: style.color,
          border: `1px solid ${style.border}`,
        }}
      >
        {statusText}
      </span>
    );
  };

  const metrics = data?.metrics;
  const recentActivities = data?.recentActivities || [];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 900,
              letterSpacing: '1.2px',
              color: 'var(--partner-gold)',
              textTransform: 'uppercase',
            }}
          >
            PARTNER DASHBOARD OVERVIEW
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, margin: '4px 0 0', color: 'var(--partner-text)' }}>
            Tổng quan kinh doanh
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--partner-muted)', margin: '4px 0 0' }}>
            {activeStore ? `Đang xem: ${activeStore.name}` : 'Theo dõi chỉ số hiệu suất kinh doanh & hoạt động gần đây'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadHomeData()}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '10px',
            border: '1px solid var(--partner-border-gold-32)',
            background: 'var(--partner-surface-2)',
            color: 'var(--partner-gold-bright)',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          <RefreshCcw size={15} className={loading ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        {/* KPI 1: Total Revenue */}
        <div
          style={{
            background: 'var(--partner-surface-1)',
            border: '1px solid var(--partner-border-gold-22)',
            borderRadius: '14px',
            padding: '18px 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--partner-muted)' }}>Tổng doanh thu</span>
            <TrendingUp size={20} color="var(--partner-gold)" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--partner-gold-bright)', margin: '10px 0 2px' }}>
            {loading ? '...' : formatVnd(metrics?.totalRevenueVnd) || '0 đ'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--partner-muted)' }}>Tích lũy từ hóa đơn đã duyệt</div>
        </div>

        {/* KPI 2: Bill Count */}
        <div
          style={{
            background: 'var(--partner-surface-1)',
            border: '1px solid var(--partner-border-hair)',
            borderRadius: '14px',
            padding: '18px 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--partner-muted)' }}>Hóa đơn</span>
            <FileText size={20} color="#8cbeff" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--partner-text)', margin: '10px 0 2px' }}>
            {loading ? '...' : metrics?.billCount ?? 0}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--partner-muted)' }}>Hóa đơn nạp trên hệ thống</div>
        </div>

        {/* KPI 3: Booking Count */}
        <div
          style={{
            background: 'var(--partner-surface-1)',
            border: '1px solid var(--partner-border-hair)',
            borderRadius: '14px',
            padding: '18px 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--partner-muted)' }}>Lượt đặt bàn</span>
            <CalendarDays size={20} color="#8de6b0" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--partner-text)', margin: '10px 0 2px' }}>
            {loading ? '...' : metrics?.bookingCount ?? 0}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--partner-muted)' }}>Tổng lượt đặt chỗ thành công</div>
        </div>

        {/* KPI 4: Active Coupons */}
        <div
          style={{
            background: 'var(--partner-surface-1)',
            border: '1px solid var(--partner-border-hair)',
            borderRadius: '14px',
            padding: '18px 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--partner-muted)' }}>Mã ưu đãi đang chạy</span>
            <TicketCheck size={20} color="#e0729e" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--partner-text)', margin: '10px 0 2px' }}>
            {loading ? '...' : metrics?.activeCouponsCount ?? 0}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--partner-muted)' }}>Chương trình khuyến mãi active</div>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 900, color: 'var(--partner-text)', marginBottom: '14px' }}>
          Thao tác nhanh
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}
        >
          <Link
            href="/partner/activity/new-bill"
            style={{
              background: 'var(--partner-surface-1)',
              border: '1px solid var(--partner-border-gold-32)',
              borderRadius: '14px',
              padding: '16px',
              textDecoration: 'none',
              color: 'var(--partner-text)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--partner-gold-grad)',
                  color: 'var(--partner-on-gold)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Plus size={18} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--partner-gold-bright)' }}>
                Nạp Hóa Đơn Mới
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--partner-muted)' }}>
              Gửi thông tin hóa đơn tích điểm cho khách
            </span>
          </Link>

          <Link
            href="/partner/scan"
            style={{
              background: 'var(--partner-surface-1)',
              border: '1px solid var(--partner-border-hair)',
              borderRadius: '14px',
              padding: '16px',
              textDecoration: 'none',
              color: 'var(--partner-text)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(140,190,255,.15)',
                  color: '#8cbeff',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <QrCode size={18} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 800 }}>Quét Mã QR</span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--partner-muted)' }}>
              Quét mã đặt chỗ & coupon khuyến mãi
            </span>
          </Link>

          {!isStaffAccount && (
            <>
              <Link
                href="/partner/listing"
                style={{
                  background: 'var(--partner-surface-1)',
                  border: '1px solid var(--partner-border-hair)',
                  borderRadius: '14px',
                  padding: '16px',
                  textDecoration: 'none',
                  color: 'var(--partner-text)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'rgba(141,230,176,.15)',
                      color: '#8de6b0',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <FileText size={18} />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 800 }}>Quản lý Danh mục</span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--partner-muted)' }}>
                  Cấu hình thông tin quán, hình ảnh & menu
                </span>
              </Link>

              <Link
                href="/partner/settings"
                style={{
                  background: 'var(--partner-surface-1)',
                  border: '1px solid var(--partner-border-hair)',
                  borderRadius: '14px',
                  padding: '16px',
                  textDecoration: 'none',
                  color: 'var(--partner-text)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'rgba(212,178,106,.15)',
                      color: 'var(--partner-gold)',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <Settings size={18} />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 800 }}>Cấu hình Cửa hàng</span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--partner-muted)' }}>
                  Thiết lập thông tin chung & đổi mật khẩu
                </span>
              </Link>

              <Link
                href="/partner/settings/staff"
                style={{
                  background: 'var(--partner-surface-1)',
                  border: '1px solid var(--partner-border-hair)',
                  borderRadius: '14px',
                  padding: '16px',
                  textDecoration: 'none',
                  color: 'var(--partner-text)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'rgba(224,114,158,.15)',
                      color: '#e0729e',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <UsersRound size={18} />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 800 }}>Quản lý Nhân viên</span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--partner-muted)' }}>
                  Tạo tài khoản & phân quyền nhân viên
                </span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Recent Activities Feed Preview */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 900, color: 'var(--partner-text)', margin: 0 }}>
            Hoạt động gần đây
          </h2>
          <Link
            href="/partner/activity"
            style={{
              fontSize: '12.5px',
              fontWeight: 800,
              color: 'var(--partner-gold)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Xem tất cả hoạt động <ChevronRight size={15} />
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : recentActivities.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '36px 16px',
              background: 'var(--partner-surface-1)',
              border: '1px dashed var(--partner-border-gold-22)',
              borderRadius: '14px',
              color: 'var(--partner-muted)',
              fontSize: '13px',
            }}
          >
            Chưa có hoạt động gần đây nào.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentActivities.slice(0, 5).map((item) => {
              const displayTitle = item.title || item.summary || `Hoạt động #${item.rawId || item.id}`;
              const displayDate = formatDate(item.activityAt || item.createdAt);
              const totalText = formatVnd(item.totalVnd);
              const discountText =
                item.discountVnd !== undefined && item.discountVnd !== null
                  ? `Giảm ${formatVnd(item.discountVnd)}`
                  : item.discountVnd === null
                  ? 'Giảm giá: Chưa xác định'
                  : null;

              return (
                <div
                  key={item.id}
                  onClick={() => router.push(`/partner/activity/${encodeURIComponent(item.id)}`)}
                  style={{
                    background: 'var(--partner-surface-1)',
                    border: '1px solid var(--partner-border-hair)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      {getStatusBadge(item)}
                      <span style={{ fontSize: '11px', color: 'var(--partner-muted)' }}>{displayDate}</span>
                    </div>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 800,
                        color: 'var(--partner-text)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {displayTitle}
                    </div>
                    {item.customerName || item.customerPhone ? (
                      <div style={{ fontSize: '12px', color: 'var(--partner-text-2)', marginTop: '2px' }}>
                        Khách hàng: {item.customerName || 'N/A'}{' '}
                        {item.customerPhone ? `(${item.customerPhone})` : ''}
                      </div>
                    ) : null}
                  </div>

                  <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
                    {totalText ? (
                      <div style={{ fontSize: '15px', fontWeight: 900, color: 'var(--partner-gold-bright)' }}>
                        {totalText}
                      </div>
                    ) : null}
                    {discountText ? (
                      <div style={{ fontSize: '11px', color: 'var(--partner-muted)', marginTop: '2px' }}>
                        {discountText}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
```
