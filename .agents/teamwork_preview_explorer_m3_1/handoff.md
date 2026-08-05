# Handoff Report: Milestone 3 Layout & Strangler Pattern Investigation

## 1. Observation
- **File Paths Inspected**:
  - `frontend/apps/web/src/app/partner/layout.tsx` (Lines 1–13):
    ```tsx
    export const metadata: Metadata = createNoindexMetadata(
      "Khu vực đối tác",
      "Khu vực làm việc dành cho đối tác Vietyoru.",
    );

    export default function PartnerLayout({ children }: { children: ReactNode }) {
      return children;
    }
    ```
  - `frontend/apps/web/src/app/partner/page.tsx` (Lines 1731–1810, 8735–8744, 10523–11102):
    - `page.tsx` is an 11,106-line client component monolith.
    - Lines 1731–1810: Defines local state for `partnerTheme`, `stores`, `selectedStoreId`, `dashboard`, `coupons`, `bills`, `bookings`, `partnerNotifications`, and `readNotificationIds`.
    - Lines 10523–10658: Renders `<aside className="partner-sidebar">` with desktop navigation buttons operating via `setActivePanel()`.
    - Lines 10661–10812: Renders `<header className="partner-header">` with page titles, store status pill, theme toggle button, notification trigger button, notification popover panel, and logout button.
    - Lines 11079–11101: Renders `<nav className="partner-mobile-bottom-nav">` with mobile navigation buttons.
  - `frontend/apps/web/src/components/layout/SiteChrome.tsx` (Lines 96–98, 1660–1666):
    ```tsx
    const hiddenChromePaths = [
      ...
      "/partner",
      ...
    ];
    ...
    const hideChrome =
      hostKind === "admin" ||
      hostKind === "partner" ||
      hostKind === "auth" ||
      hiddenChromePaths.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`),
      );
    ```
  - `frontend/apps/web/src/app/partner/gui-hoa-don/page.tsx` (Lines 1–7):
    - Legacy redirect to `/partner?panel=bill`.

## 2. Logic Chain
1. **Observation 1 (`layout.tsx`)** demonstrates that `layout.tsx` is currently a bare wrapper returning `children`. In Next.js App Router, `layout.tsx` runs on the server (preserving SEO metadata like `createNoindexMetadata`), but can wrap client children in client context providers and a client shell component.
2. **Observation 2 (`page.tsx`)** shows that store selection (`stores`, `selectedStoreId`), theme state, and notification state are embedded inside a single monolithic component. Navigating across sub-routes (`/partner/scan`, `/partner/listing`, `/partner/settings`) would re-fetch store data and lose context unless lifted into `PartnerProviders.tsx` (`PartnerStoreScopeProvider`, `PartnerThemeProvider`, `PartnerNotificationProvider`).
3. **Observation 2 (`page.tsx`)** also shows that `page.tsx` currently renders its own outer shell (`aside.partner-sidebar`, `header.partner-header`, `nav.partner-mobile-bottom-nav`). If `layout.tsx` renders `PartnerShellClient`, and `page.tsx` (or sub-routes) ALSO render their own shell elements, a "Double Shell" visual glitch will occur.
4. **Observation 3 (`SiteChrome.tsx`)** proves that customer-facing public site chrome is already suppressed for all `/partner/*` paths via `hiddenChromePaths` and `hostKind === "partner"`. Therefore, public chrome will not conflict with the partner shell.
5. **Conclusion from steps 1–4**: To implement PR 3 cleanly and prevent "Double Shell", `app/partner/layout.tsx` must wrap children in `PartnerProviders` and `PartnerShellClient`. The shell components (`aside`, `header`, `mobile-bottom-nav`) must be consolidated into `PartnerShellClient.tsx`, while `page.tsx` and all sub-routes must render ONLY their page body/panel content.

## 3. Caveats
- Code-splitting with `next/dynamic` for heavy client modules (`jsQR` in `/partner/scan` and `ReactQuill` in `/partner/listing`) must use `{ ssr: false }` to avoid hydration mismatches.
- `PartnerStoreScopeProvider` must handle cases where a partner account has 0 assigned stores or where a staff account has restricted store permissions gracefully (displaying warning status messages without crashing).

## 4. Conclusion
The frontend architecture for Milestone 3 (PR 3) is fully defined and ready for implementation by the implementer agent:
1. `layout.tsx` (Server Component) wraps all sub-routes in `PartnerProviders` and `PartnerShellClient`.
2. `PartnerProviders.tsx` provides `PartnerStoreScopeProvider`, `PartnerThemeProvider`, and `PartnerNotificationProvider`.
3. `PartnerShellClient.tsx` provides the single Header, Sidebar, Bottom Nav, Store Switcher, and Theme Provider wrapper across all `/partner` sub-routes using Next.js `usePathname()`.
4. `page.tsx` is refactored into the Home Dashboard, stripping duplicate shell elements to guarantee zero "Double Shell" issues.

## 5. Verification Method
1. **File Inspection**:
   - Inspect `frontend/apps/web/src/app/partner/layout.tsx` to verify `PartnerProviders` and `PartnerShellClient` wrap `{children}`.
   - Inspect `frontend/apps/web/src/app/partner/PartnerShellClient.tsx` to confirm Sidebar, Header, and Bottom Nav are rendered here and nowhere else.
   - Inspect `frontend/apps/web/src/app/partner/PartnerProviders.tsx` to confirm `PartnerStoreScopeProvider` exports `usePartnerStoreScope()`.
2. **Type Check & Lint**:
   - Run `pnpm --filter web check-types` in `frontend/apps/web` to confirm no TypeScript errors.
3. **Double Shell DOM Verification**:
   - Navigate to `/partner`, `/partner/scan`, `/partner/listing`, `/partner/settings` in browser dev tools.
   - In DOM tree, verify there is exactly ONE element matching `.partner-header`, ONE element matching `.partner-sidebar`, and ONE element matching `.partner-mobile-bottom-nav`.
