# M3 PR3 Shell & Context Empirical Challenge Report

**Date**: 2026-08-05
**Target**: `PartnerShellClient.tsx`, `PartnerProviders.tsx`, `PartnerShellClient.test.tsx`
**Challenger**: `teamwork_preview_challenger_m3_1` (PR3 Shell & Context Challenger)
**Overall Risk Assessment**: LOW (VERDICT: APPROVE)

---

## 1. Executive Summary & Verification Matrix

| Verification Dimension | Execution Command | Result | Findings |
|---|---|---|---|
| Vitest Unit Tests | `cd frontend/apps/web && pnpm vitest run PartnerShellClient.test.tsx` | PASS (5/5 tests passed) | All 5 test cases executed and passed cleanly in 6.72s. |
| TypeScript Typecheck | `cd frontend/apps/web && pnpm check-types` | PASS (0 errors) | `tsc --noEmit` completed with code 0. |
| Strangler Pattern (Single Shell) | Vitest assertion `container.querySelectorAll('header/aside')` | PASS (1 header, 1 sidebar) | No double-shell rendering in sub-routes. |
| Navigation Active Highlighting | `isRouteActive(pathname, href)` & `usePathname()` | PASS | Prefix matching correctly highlights parent tabs for sub-routes (`/partner/settings/staff`, `/partner/activity/new-bill`). |
| Store Switcher & Context Propagation | `PartnerStoreScopeProvider` & `ThemedListingSelect` | PASS | Dynamic store retrieval, session storage persistence, and custom picker usage (no native `<select>`). |
| Role-Based Filtering | `STAFF` vs `PARTNER` role check | PASS | Staff restricted to `['home', 'scan']`, suppressing administrative tabs. |

---

## 2. Challenge Dimensions & Adversarial Stress Tests

### Challenge 1: Empty or Single Store Edge Case in `PartnerStoreScopeProvider`
- **Assumption challenged**: Partner always has 1 or more stores returned from `/partner/stores`.
- **Attack Scenario**: New partner account with 0 approved stores or network failure when calling `/partner/stores`.
- **Stress Test Behavior**:
  - `stores` defaults to `[]`.
  - `activeStore` evaluates to `null`.
  - `storeName` defaults gracefully to `'Tất cả quán'`.
  - `activeStoreStatus` defaults gracefully to `'ACTIVE'`.
  - Store switcher `<ThemedListingSelect>` is omitted when `stores.length <= 1`, maintaining UI stability.
- **Blast Radius**: None — graceful fallback strings and conditional rendering prevent JS crashes or broken layouts.
- **Verdict**: PASS

### Challenge 2: Deep Sub-route Active Highlighting & Header Metadata
- **Assumption challenged**: Sub-routes like `/partner/settings/staff` or `/partner/activity/new-bill` might fail to highlight parent navigation links or display incorrect titles.
- **Attack Scenario**: Navigating deep into `/partner/settings/staff` or `/partner/activity/[activityId]`.
- **Stress Test Behavior**:
  - `isRouteActive('/partner/settings/staff', '/partner/settings')` uses `pathname.startsWith('/partner/settings')`, returning `true`.
  - `getPageTitleInfo('/partner/settings/staff')` returns `{ eyebrow: 'STAFF MANAGEMENT', title: 'Quản lý nhân viên' }`.
  - `isRouteActive('/partner/activity/new-bill', '/partner/activity')` returns `true`.
- **Blast Radius**: None — routes are highlighted accurately across all sub-navigation levels.
- **Verdict**: PASS

### Challenge 3: User Rule Compliance (Native Controls & UI Conventions)
- **Assumption challenged**: Custom store switcher might accidentally fall back to native `<select>` tag or browser `alert()`.
- **Attack Scenario**: Inspecting header store switcher component.
- **Verification**: `PartnerShellClient.tsx` line 21 imports `ThemedListingSelect` from `@/components/ui/ThemedListingSelect` and uses it on line 437. No native HTML `<select>` elements exist in the shell client.
- **Verdict**: PASS

### Challenge 4: React Hydration & Console Warnings (Minor Non-Blocking Observability)
- **Observation during test execution**:
  1. `styled-jsx` attribute warnings: `<style jsx global>` received boolean `true` in test DOM mock. (Standard Next.js styled-jsx behavior in Vitest JSDOM environment).
  2. Unwrapped `act(...)` warning during async initial state update in `PartnerProviders` (`useEffect` calling `refreshStores`).
- **Impact**: Zero runtime impact in production Next.js environment. Vitest tests pass 5/5.
- **Mitigation/Recommendation**: In future test refactoring, wrap store provider async initialization in `act()` or `waitFor()`.

---

## 3. Detailed Vitest Output Summary

```text
 ✓ __tests__/PartnerShellClient.test.tsx (5 tests)
     ✓ renders outer shell frame, header, sidebar, branding, and content children
     ✓ enforces single shell (strangler pattern) with exactly 1 header and 1 sidebar
     ✓ highlights active navigation link based on usePathname()
     ✓ populates store scope from API and supports switching store
     ✓ filters navigation items for staff role accounts

 Test Files  1 passed (1)
      Tests  5 passed (5)
```

---

## 4. Final Verdict

**VERDICT: APPROVE**

The implementation of `PartnerShellClient` and `PartnerProviders` fully satisfies all acceptance criteria for Milestone 3 (PR 3). It strictly enforces the Strangler pattern, complies with project UI rules (no native `<select>`), provides robust context state management, and passes all empirical test suites and type checks without errors.
