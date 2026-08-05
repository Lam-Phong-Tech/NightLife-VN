# Empirical Test Execution & Progress Log — Challenger 1 (Shell & Context Challenger)

**Last visited**: 2026-08-05T09:17:30Z

## Verification Summary

| Verification Target | Command | Result | Details |
|---|---|---|---|
| 1. Shell Client Core Unit Tests | `pnpm test -- PartnerShellClient.test.tsx` | **PASS (5/5)** | All 5 test scenarios passed in 2.85s |
| 2. Shell Client Edge Cases Suite | `pnpm test -- PartnerShellClient.edge-cases.test.tsx` | **PASS (6/6)** | All 6 stress-test edge case scenarios passed in 3.15s |
| 3. Partner Settlement Money Test | `pnpm test -- PartnerSettlementMoney.test.tsx` | **FAIL (0/1)** | Error: `No "useRouter" export is defined on the "next/navigation" mock` |
| 4. Type Checking | `pnpm check-types` | **PASS (0 errors)** | `tsc --noEmit` exited with 0 errors |

## Detailed Logs

### 1. `PartnerShellClient.test.tsx`
```
 ✓ __tests__/PartnerShellClient.test.tsx (5 tests) 2851ms
     ✓ renders outer shell frame, header, sidebar, branding, and content children  1898ms
     ✓ enforces single shell (strangler pattern) with exactly 1 header and 1 sidebar  346ms
     ✓ highlights active navigation link based on usePathname()
     ✓ populates store scope from API and supports switching store
     ✓ filters navigation items for staff role accounts

 Test Files  1 passed (1)
      Tests  5 passed (5)
```

### 2. `PartnerShellClient.edge-cases.test.tsx`
```
 ✓ __tests__/PartnerShellClient.edge-cases.test.tsx (6 tests) 3151ms
     ✓ 1. Store switcher changes store ID and persists to sessionStorage  1800ms
     ✓ 2. Theme toggle switches light/dark mode cleanly without errors  534ms
     ✓ 3. Notifications popover toggle & interaction work cleanly  503ms
     ✓ 4. Mobile bottom navigation highlights active tab based on current pathname
     ✓ 5a. PartnerStoreScopeProvider fallback behavior when invalid store ID in sessionStorage
     ✓ 5b. PartnerStoreScopeProvider fallback behavior when API returns empty store list

 Test Files  1 passed (1)
      Tests  6 passed (6)
```

### 3. `PartnerSettlementMoney.test.tsx` (FAIL)
```
 FAIL  __tests__/PartnerSettlementMoney.test.tsx > PartnerSettlementMoney > renders 'Giảm giá: Chưa xác định' when discountVnd is null and does not render -totalVnd
Error: [vitest] No "useRouter" export is defined on the "next/navigation" mock. Did you forget to return it from "vi.mock"?

 ❯ PartnerPage src/app/partner/page.tsx:1731:18
    1729| export default function PartnerPage() {
    1730|   const searchParams = useSearchParams();
    1731|   const router = useRouter();
       |                  ^
```

### 4. `pnpm check-types`
```
> web@0.0.0 check-types D:\laragon\www\NightLife-VN\frontend\apps\web
> tsc --noEmit

Exit code: 0
```
