# Milestone 3 Analysis: Sub-route Extraction & Code-Splitting

## Executive Summary
This report analyzes the extraction of modular sub-routes from the monolithic `frontend/apps/web/src/app/partner/page.tsx` (>10,800 lines) into dedicated Next.js App Router route handlers for **Milestone 3 (PR 3: Partner Shell, Strangler Pattern & Sub-routes)**.

The sub-routes analyzed are:
1. `/partner/scan` — QR scanning & check-in verification (code-split heavy `jsQR` library).
2. `/partner/listing` — Store listing draft & live editor (code-split heavy `ReactQuill` editor & snow CSS).
3. `/partner/settings` — Account & password configuration.
4. `/partner/settings/staff` — Store staff management (role-restricted to `PARTNER`).

Additionally, this report outlines the **State & Props Preservation Architecture** using `PartnerStoreScopeProvider` in `app/partner/layout.tsx` to maintain active store selection, user permissions, and layout state during route transitions and dynamic import loading.

---

## 1. Sub-route Extraction Details

### 1.1 `/partner/scan` (`frontend/apps/web/src/app/partner/scan/page.tsx`)
- **Monolith Origin**: Extracted from `renderScanPanel()` (lines 6092–7637 in `page.tsx`) and scanning utility functions (`readQrFromVideoFrame`, `readQrFromImageFile` at lines 683–765).
- **Core Functionality**:
  - WebRTC live camera feed scanning & static image QR upload.
  - Manual coupon/booking token entry.
  - Offline scan queueing (`offlineScanQueueKey = 'nightlife:offline-coupon-scans'`).
  - Scan verification against backend APIs:
    - `POST /partner/booking-qrs/scan`
    - `POST /partner/tour-booking-qrs/scan`
    - `POST /partner/coupon-issues/scan`
    - `POST /partner/coupon-issues/:id/scan`
    - `POST /partner/checkin/confirm`
  - Permission check: Restricted for `STAFF` users lacking `coupon.scan` or `checkin.confirm` permissions.
- **Code-Splitting heavy `jsQR`**:
  - *Current issue*: `import jsQR from 'jsqr';` on line 40 of monolith `page.tsx` includes ~150KB QR engine in the initial bundle for all partner portal pages.
  - *Target approach*:
    1. In `/partner/scan/page.tsx`, lazy-load `jsQR` via dynamic import:
       ```typescript
       const getJsQr = async () => (await import('jsqr')).default;
       ```
       Or wrap the camera/image scanning view component using `next/dynamic`:
       ```typescript
       const PartnerScanCamera = dynamic(() => import('./components/PartnerScanCamera'), {
         ssr: false,
         loading: () => <ScanCameraSkeleton />,
       });
       ```
    2. *Benefit*: `jsQR` JS chunk is downloaded **only** when the user accesses `/partner/scan`, reducing initial payload size by ~150KB for all other pages.

---

### 1.2 `/partner/listing` (`frontend/apps/web/src/app/partner/listing/page.tsx`)
- **Monolith Origin**: Extracted from `renderListingPanel()` (lines 7638–8370 in `page.tsx`).
- **Core Functionality**:
  - Store listing form: Store name, Vietnam phone validation, address, operating hours, drink menu categories, cast listing.
  - **Go Live vs Draft Toggle** (Follow-up R1/R2 requirement): `isViewingLive` state toggles between `live` store data (read-only) and `draft` store data (editable).
  - Draft save (`POST /partner/listing/draft`) and submission for admin approval (`POST /partner/listing/submit`).
- **Code-Splitting heavy `ReactQuill`**:
  - *Current state*: Line 172 of monolith `page.tsx` uses `const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false, loading: ... })`, but line 5 imports `import 'react-quill-new/dist/quill.snow.css';` globally.
  - *Target approach*:
    1. Isolate both `react-quill-new` and `quill.snow.css` into `/partner/listing/page.tsx` or a dedicated sub-component `PartnerListingDescriptionEditor.tsx`.
    2. Use `next/dynamic` for the editor component with a customized skeleton loader matching the 158px min-height Quill container.
    3. *Benefit*: Prevents loading rich-text editor styles and core JS bundle (~300KB) on non-listing pages.

---

### 1.3 `/partner/settings` (`frontend/apps/web/src/app/partner/settings/page.tsx`)
- **Monolith Origin**: Extracted from upper section of `renderSettingsPanel()` (lines 8373–8476 in `page.tsx`).
- **Core Functionality**:
  - Change Password form (`POST /users/change-password`).
  - Form validation: Old password validation, new password length (min 8 chars), confirm password match.
  - Eye/EyeOff show/hide password toggles.
  - Navigation card linking to Staff Management (`/partner/settings/staff`) when `currentUser.role === 'PARTNER'`.

---

### 1.4 `/partner/settings/staff` (`frontend/apps/web/src/app/partner/settings/staff/page.tsx`)
- **Monolith Origin**: Extracted from lower section of `renderSettingsPanel()` (lines 8478–8650 in `page.tsx`).
- **Core Functionality**:
  - Staff listing table (`GET /partner/staff`).
  - Add staff form (`POST /partner/staff`): Name, email, password, store picker (`ThemedListingSelect`), permission checkboxes (`coupon.scan`, `checkin.confirm`).
  - Delete staff operation (`DELETE /partner/staff/:id`).
  - **Compliance Requirements**:
    - Store selection MUST use custom `ThemedListingSelect` component (NO native browser `<select>`).
    - Staff deletion confirmation MUST use `useSystemFeedback()` modal (NO native browser `confirm()` or `alert()`).
    - Access restricted: Only users with `PARTNER` role can access staff management (Staff accounts get redirected or shown 403 error).

---

## 2. Preserving State and Props Across Sub-routes

### 2.1 State Preservation Architecture
In Next.js App Router, `app/partner/layout.tsx` wraps all sub-routes under `/partner/*`. Layout components remain **mounted** during client-side navigation between sub-routes (`Link` navigation or `router.push`).

```
                                +---------------------------------------------+
                                |            app/partner/layout.tsx           |
                                |  (Server Layout & PartnerProviders Client)  |
                                +----------------------+----------------------+
                                                       |
                                        +--------------+--------------+
                                        |                             |
                       +----------------+---------------+     +-------+-------+
                       | PartnerStoreScopeProvider      |     | SystemFeedback|
                       |  - activeStoreId, stores       |     | Provider      |
                       |  - userRole, storePermissions  |     +---------------+
                       +----------------+---------------+
                                        |
               +------------------------+------------------------+
               |                        |                        |
     +---------+---------+    +---------+---------+    +---------+---------+
     |   /partner/scan   |    | /partner/listing  |    | /partner/settings |
     | (jsQR dynamic)    |    | (ReactQuill dyn)  |    +---------+---------+
     +-------------------+    +-------------------+              |
                                                       +---------+---------+
                                                       | /settings/staff   |
                                                       +-------------------+
```

### 2.2 Shared Contexts in `PartnerProviders.tsx`
1. **`PartnerStoreScopeProvider`**:
   - Holds persistent state: `activeStoreId`, `stores`, `activeStore`, `isStaffAccount`, `storePermissions`, `setStoreId`.
   - Prevents store re-fetching or selection resets when navigating between `/partner/scan`, `/partner/listing`, `/partner/settings`, etc.
2. **`SystemFeedbackProvider`**:
   - Holds toast notifications and custom modal dialogs.
   - Allows background tasks or cross-route actions (e.g. scan success toast) to persist across route transitions.
3. **Theme & User Session**:
   - Managed at the layout shell level, preserving `vy-user-theme` without FOUC (Flash of Unstyled Content).

### 2.3 Dynamic Import Loading Experience
- When a user navigates to `/partner/scan` or `/partner/listing` for the first time in a session:
  1. The outer Shell (Header, Navigation, Store Switcher) remains fully rendered and interactive instantly.
  2. Next.js displays the route loading UI (`loading.tsx` or `next/dynamic` skeleton fallback) **only** inside the content viewport area.
  3. Context state (`activeStoreId`) is already populated, so dynamic components mount with full props ready immediately upon load.

---

## 3. Recommended Implementation Layout

```
frontend/apps/web/src/app/partner/
├── layout.tsx                        # Server Component (Metadata & Shell wrapper)
├── PartnerShellClient.tsx            # Client Shell (Header, Nav, Switcher, Theme)
├── PartnerProviders.tsx              # Contexts (StoreScope, SystemFeedback, Theme)
├── page.tsx                          # Home Dashboard (Milestone 5 monolith cleanup)
├── scan/
│   └── page.tsx                      # Sub-route /partner/scan (dynamic jsQR)
├── listing/
│   └── page.tsx                      # Sub-route /partner/listing (dynamic ReactQuill)
└── settings/
    ├── page.tsx                      # Sub-route /partner/settings (Change password)
    └── staff/
        └── page.tsx                  # Sub-route /partner/settings/staff (Staff Management)
```

---

## 4. Verification Checklist

1. **Sub-route Isolation**:
   - [ ] `/partner/scan` renders standalone scan interface.
   - [ ] `/partner/listing` renders draft/live listing editor with `ReactQuill`.
   - [ ] `/partner/settings` renders password change form.
   - [ ] `/partner/settings/staff` renders staff table with `ThemedListingSelect` and `useSystemFeedback`.
2. **Code-Splitting Verification**:
   - [ ] Build bundle analysis confirms `jsQR` is not present in initial `/partner` JS chunk.
   - [ ] `react-quill-new` and `quill.snow.css` loaded only on `/partner/listing`.
3. **State Preservation Verification**:
   - [ ] Switching store in header switcher on `/partner/scan` maintains active store when navigating to `/partner/settings/staff`.
   - [ ] Toast notification triggers on one route remain visible across route navigations.
4. **User Rule Compliance**:
   - [ ] NO native `<select>` used; `ThemedListingSelect` used for staff store picker.
   - [ ] NO native `confirm()` or `alert()` used; `useSystemFeedback` used for staff deletion popup.
