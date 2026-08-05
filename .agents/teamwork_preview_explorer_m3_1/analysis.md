# Milestone 3 Analysis Report: Partner Shell, Strangler Pattern & Sub-routes Architecture

## Executive Summary
This report analyzes the frontend architecture for Milestone 3 (PR 3) of the NightLife-VN Partner Portal refactoring. The primary goal of PR 3 is to modularize the existing 11,106-line monolith (`frontend/apps/web/src/app/partner/page.tsx`) by introducing a dedicated Server Layout (`layout.tsx`), a unified Client Shell (`PartnerShellClient.tsx`), and top-level Context Providers (`PartnerProviders.tsx` featuring `PartnerStoreScopeProvider`). Furthermore, it defines the Strangler Pattern strategy to prevent "Double Shell" rendering across all `/partner` routes while enabling clean sub-route navigation.

---

## 1. Server Component Layout Architecture (`frontend/apps/web/src/app/partner/layout.tsx`)

### Current State
`frontend/apps/web/src/app/partner/layout.tsx` currently functions as a minimal pass-through component (13 lines):
```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createNoindexMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = createNoindexMetadata(
  "Khu vực đối tác",
  "Khu vực làm việc dành cho đối tác Vietyoru.",
);

export default function PartnerLayout({ children }: { children: ReactNode }) {
  return children;
}
```

### Architectural Requirements for M3
- **Server Component Guarantee**: Must remain a Next.js App Router Server Component so `export const metadata` (SEO/noindex headers) can be statically generated.
- **Provider & Shell Injection**: Must wrap `{children}` inside `<PartnerProviders>` (for global client contexts) and `<PartnerShellClient>` (for unified UI frame).
- **Sub-route Scope**: App Router layouts persist across sub-route transitions (`/partner`, `/partner/scan`, `/partner/listing`, `/partner/settings`, etc.). Wrapping children at the layout level ensures state continuity (store scope, theme, notifications) without re-mounting or flicker during navigation.

### Proposed Code Blueprint for `layout.tsx`
```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createNoindexMetadata } from "@/lib/seo/page-metadata";
import { PartnerProviders } from "./PartnerProviders";
import { PartnerShellClient } from "./PartnerShellClient";

export const metadata: Metadata = createNoindexMetadata(
  "Khu vực đối tác",
  "Khu vực làm việc dành cho đối tác Vietyoru.",
);

export default function PartnerLayout({ children }: { children: ReactNode }) {
  return (
    <PartnerProviders>
      <PartnerShellClient>{children}</PartnerShellClient>
    </PartnerProviders>
  );
}
```

---

## 2. Client Shell Component Architecture (`frontend/apps/web/src/app/partner/PartnerShellClient.tsx`)

### Objective & Role
`PartnerShellClient.tsx` is a Client Component (`'use client'`) responsible for rendering the entire visual frame (Sidebar, Header, Content Wrapper, Mobile Bottom Nav) and managing responsive UI interactions.

### Detailed UI Frame Components

1. **Theme & Root Container (`<main className="partner-main">`)**:
   - Consumes `usePartnerTheme()` from `PartnerProviders`.
   - Dynamically injects theme variables (`partnerDarkThemeVariables` / `partnerLightThemeVariables`) into inline `style`.
   - Injects layout CSS definitions for `.partner-shell`, `.partner-sidebar`, `.partner-header`, `.partner-content`, and `.partner-mobile-bottom-nav`.

2. **Desktop Sidebar (`<aside className="partner-sidebar">`)**:
   - Fixed left sidebar (`width: 252px`, `height: 100dvh`).
   - Branding: "Vietyoru PARTNER PORTAL" linking to `/`.
   - Navigation links powered by Next.js `Link` and active pathname matching (`usePathname()`):
     - Dashboard / Overview: `/partner`
     - Quét mã QR / Đặt chỗ: `/partner/scan`
     - Cấu hình thông tin: `/partner/listing`
     - Cài đặt & Nhân viên: `/partner/settings`
     - Hoạt động & Hóa đơn: `/partner/activity` (or panel route during transition)
   - RoleGuard filter: Automatically filters out non-staff routes if `isStaffAccount === true`.
   - Sidebar Footer: Displays active store name and role badge (`accountScopeLabel`).

3. **Top Header (`<header className="partner-header">`)**:
   - Sticky top header (`height: 78px`, backdrop blur).
   - Dynamic Title & Eyebrow: Resolves page title based on `usePathname()` (or page title context).
   - Actions Cluster:
     - **Store Switcher**: Integrates `ThemedListingSelect` when partner has multiple stores. Calls `setSelectedStoreId(storeId)` from `PartnerStoreScopeContext`.
     - **Store Status Pill**: Shows `activeStoreStatus` (`ACTIVE`, `DRAFT`, etc.) with color-coded dot indicator.
     - **Theme Toggle Button**: Sun / Moon icon button calling `toggleTheme()`.
     - **Notification Bell & Popover**: Bell icon with unread counter badge and dropdown popover displaying `PartnerNotification[]`.
     - **Logout Button**: Executes `logoutBrowserProfile()`.

4. **Main Content Container (`<div className="partner-content">{children}</div>`)**:
   - Receives page children from layout.
   - Contains responsive container styling (`padding: 26px 30px 34px`).

5. **Mobile Bottom Navigation (`<nav className="partner-mobile-bottom-nav">`)**:
   - Rendered at the bottom on mobile viewports (`@media (max-width: 768px)`).
   - Contains touch-friendly tab buttons linking to primary partner sub-routes.

---

## 3. Context Providers Architecture (`frontend/apps/web/src/app/partner/PartnerProviders.tsx`)

### Need for Centralized Context
Currently in `page.tsx` (lines 1731–1810), theme, store selection (`stores`, `selectedStoreId`), notifications, and account roles are maintained in local state inside a single monolithic component. When breaking `page.tsx` into independent sub-routes (`/partner/scan/page.tsx`, `/partner/listing/page.tsx`, etc.), page state would be lost upon navigation unless lifted into unified Context Providers.

### Key Context Providers in `PartnerProviders.tsx`

#### A. `PartnerStoreScopeProvider`
- **Context Value**:
  - `stores`: `PartnerStore[]` — List of stores owned by or assigned to the user.
  - `selectedStoreId`: `string` — ID of the currently selected store.
  - `setSelectedStoreId`: `(id: string) => void` — Function to switch active store.
  - `activeStore`: `PartnerStore | null` — Currently active store object.
  - `storeName`: `string` — Active store display name.
  - `activeStoreStatus`: `string` — Store status string (`ACTIVE`, `DRAFT`, etc.).
  - `isStaffAccount`: `boolean` — True if current `AuthUser.role === 'STAFF'`.
  - `isPartnerAccount`: `boolean` — True if current `AuthUser.role === 'PARTNER'`.
  - `currentUser`: `AuthUser | null` — Current logged-in user profile.
  - `isLoadingStores`: `boolean` — Loading state for store permissions.
  - `refreshStores`: `() => Promise<void>` — Trigger re-fetch of store list.
- **Behavior**:
  - Fetches `/partner/stores` on mount.
  - Automatically selects `storeData[0]?.id` if `selectedStoreId` is unset.
  - Persists `selectedStoreId` in `sessionStorage` or state across route transitions.

#### B. `PartnerThemeProvider`
- **Context Value**:
  - `partnerTheme`: `'dark' | 'light'`
  - `togglePartnerTheme`: `() => void`
  - `partnerThemeVariables`: `PartnerThemeVariables`
- **Behavior**:
  - Reads `localStorage.getItem('vy-user-theme')` on initialization.
  - Updates `localStorage` and `document.documentElement` class list upon toggle.

#### C. `PartnerNotificationProvider`
- **Context Value**:
  - `partnerNotifications`: `PartnerNotification[]`
  - `unreadNotificationCount`: `number`
  - `isNotificationOpen`: `boolean`
  - `setIsNotificationOpen`: `React.Dispatch<React.SetStateAction<boolean>>`
  - `markAllNotificationsRead`: `() => void`
  - `openPartnerNotification`: `(notification: PartnerNotification) => void`
- **Behavior**:
  - Loads `/partner/notifications` and connects to notification events.

#### Unified Provider Export
```tsx
export function PartnerProviders({ children }: { children: ReactNode }) {
  return (
    <PartnerThemeProvider>
      <PartnerStoreScopeProvider>
        <PartnerNotificationProvider>
          {children}
        </PartnerNotificationProvider>
      </PartnerStoreScopeProvider>
    </PartnerThemeProvider>
  );
}
```

---

## 4. Strangler Pattern Strategy & Prevention of "Double Shell"

### The "Double Shell" Risk
1. **Public Site Chrome vs Partner Shell**:
   - `frontend/apps/web/src/components/layout/SiteChrome.tsx` renders the customer-facing header, footer, and bottom nav.
   - **Verification**: In `SiteChrome.tsx` (lines 96–98, 1660–1666), `hiddenChromePaths` includes `"/partner"` and `hostKind === "partner"` disables `SiteChrome` rendering. Customer chrome is already properly suppressed for all `/partner/*` sub-routes.
2. **Layout Shell vs Sub-route Page Shell**:
   - If `layout.tsx` renders `PartnerShellClient` (Header, Sidebar, Bottom Nav), and sub-route pages (`/partner/page.tsx`, `/partner/scan/page.tsx`, etc.) ALSO render `<div className="partner-shell">`, `<header className="partner-header">`, `<aside className="partner-sidebar">`, or `<nav className="partner-mobile-bottom-nav">`, the UI will render duplicate headers, sidebars, store switchers, and bottom navs ("Double Shell").

### Strangler Pattern Rules & Architectural Solution
1. **Single Source of Shell Frame**:
   - `PartnerShellClient.tsx` (mounted in `app/partner/layout.tsx`) is the **ONLY** place in the `/partner` route tree where the outer frame (`<div className="partner-shell">`, `<aside className="partner-sidebar">`, `<header className="partner-header">`, `<nav className="partner-mobile-bottom-nav">`) is rendered.
2. **Clean Page Component Scope**:
   - Every page component inside `/partner` (`page.tsx`, `scan/page.tsx`, `listing/page.tsx`, `settings/page.tsx`, `settings/staff/page.tsx`) MUST render ONLY its specific page body/panel content inside `<div className="partner-content">`.
   - Page components MUST NOT render outer layout wrappers or repeat `PartnerProviders`.
3. **Refactoring `frontend/apps/web/src/app/partner/page.tsx`**:
   - Currently, `page.tsx` returns a `<main style={...}>` containing `<div className="partner-shell">`, `<aside>`, `<header>`, `<nav>`, and calls `renderActivePanel()`.
   - In PR 3, `page.tsx` will be refactored to consume `usePartnerStoreScope()` and return **ONLY** the Overview Dashboard panel markup (metric cards, quick action links, status overview). The outer shell and providers are removed from `page.tsx` because they are provided by `layout.tsx`.

---

## 5. Sub-route Integration Roadmap (PR 3 Scope)

| Route Path | Component File | Description | Dyn Imports / Optimization |
|---|---|---|---|
| `/partner` | `app/partner/page.tsx` | Partner Home Dashboard (Overview Panel) | Lite dashboard queries, metric cards |
| `/partner/scan` | `app/partner/scan/page.tsx` | QR Scanner & Coupon Check-in | `next/dynamic` for `jsQR` library |
| `/partner/listing` | `app/partner/listing/page.tsx` | Store Information & Cast Management | `next/dynamic` for `ReactQuill` editor |
| `/partner/settings` | `app/partner/settings/page.tsx` | Partner Account & Password Settings | Password change form |
| `/partner/settings/staff` | `app/partner/settings/staff/page.tsx` | Staff Management & Store Permissions | Staff table, `ThemedListingSelect` |

---

## Summary of Verification Guidelines
- **Type Checking**: Run `pnpm --filter web check-types` to ensure zero TypeScript errors in `layout.tsx`, `PartnerShellClient.tsx`, `PartnerProviders.tsx`, and all sub-routes.
- **Component Tests**: Verify store scope switching and theme provider via `vitest run`.
- **Double Shell Check**: Inspect DOM tree in browser dev tools on `/partner`, `/partner/scan`, `/partner/listing`, `/partner/settings` to verify exactly 1 `.partner-header`, 1 `.partner-sidebar`, 1 `.partner-mobile-bottom-nav` exists.
