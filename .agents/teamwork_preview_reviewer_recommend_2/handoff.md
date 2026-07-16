# Handoff Report — Đề xuất tối nay Frontend Review

## 1. Observation

I inspected the codebase and ran the frontend compilation, typecheck, linting, and testing suites. Below are the key direct observations:

*   **File under review**: `frontend/apps/web/src/app/admin/content/page.tsx`
*   **Verification Commands and Output**:
    *   **TypeScript Validation (`pnpm check-types`)**:
        Successfully compiled without TypeScript type errors:
        ```
        Tasks:    1 successful, 1 total
        Cached:    0 cached, 1 total
        Time:    1m17.754s
        ```
    *   **ESLint Validation (`pnpm lint`)**:
        Failed with ESLint errors in the target file `frontend/apps/web/src/app/admin/content/page.tsx`:
        1.  **Unescaped entities in JSX (`react/no-unescaped-entities`)**:
            *   Line 1257: `Khối "Dịch vụ nổi bật" ...`
            *   Line 1346: `Khối "Đề xuất tối nay" ...`
            *   Line 1456: `Khối "Video Hot" ...`
            Error message: ``web:lint:   1346:52   error    `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`   react/no-unescaped-entities``
        2.  **Usage before declaration (`react-hooks/immutability` / block scoping)**:
            *   Line 142: `fetchStoreVideos(searchVideoQuery, searchVideoPage, videoRegion);` called inside `useEffect` before its definition at line 465.
            *   Line 150: `fetchFeaturedItems();` called inside `useEffect` before its definition at line 164.
            *   Line 157: `searchFeaturedStore(searchFeaturedQuery);` called inside `useEffect` before its definition at line 181.
        3.  **Unexpected `any` casting (`@typescript-eslint/no-explicit-any`)**:
            *   Line 1325: `(store.area as any).name`
            *   Line 1427: `(store.area as any).name`
        4.  **Missing useEffect dependencies (`react-hooks/exhaustive-deps`)**:
            *   Line 152 & 161: Missing `fetchFeaturedItems` and `searchFeaturedStore`.
        5.  **State update within effect body (`react-hooks/set-state-in-effect`)**:
            *   Line 805: `setBannerOrder(maxOrder + 1);` in `useEffect`.
    *   **Unit/Integration Tests (`pnpm test` / Vitest)**:
        The recommend home tests in `__tests__/AdminRecommendHome.test.tsx` passed successfully:
        ```
        ✓ __tests__/AdminRecommendHome.test.tsx (4 tests) 3783ms
            ✓ 1. Search operates across all stores in all cities (no city filtering)  1792ms
            ✓ 2. Pinned limit of 8 stores is correctly blocked on 9th store with a custom modal  1167ms
            ✓ 3. Reordering via Up/Down buttons works correctly and updates rankings in backend  399ms
            ✓ 4. Deletion works and prompts with a custom confirmation modal  417ms
        ```
    *   **Production Build (`pnpm build`)**:
        Next.js optimized build completed successfully because it is configured to skip typescript/eslint validations at build time:
        ```
        web:build: ✓ Compiled successfully in 88s
        web:build:   Skipping validation of types
        ```

*   **Implementation Rules Check**:
    *   **Alert Rule**: Verified using regex/substring search. No browser-native `alert()`, `confirm()`, or `prompt()` are used. The application uses the custom context modals (`feedback.showModal`) and toast notifications (`feedback.showToast`).
    *   **Select Component Rule**: Verified. No native `<select>` tags are used. Custom buttons and options lists are used instead.
    *   **DatePicker Rule**: Verified. No browser-native date pickers are used; the application wraps Ant Design's `<DatePicker.RangePicker>` in a `<ConfigProvider>` to style the layout.

## 2. Logic Chain

1.  **Correctness**: The "Đề xuất tối nay" manual configuration handles additions, reordering (Up/Down), and removals via standard APIs (under `adminRankingsApi`).
2.  **Safety & UI Constraints**: The logic ensures that a maximum of 8 stores can be pinned by querying current active items and blocking addition of the 9th item using a custom styled dialog. This is verified by the unit test suite where the 9th pin request correctly outputs a "Giới hạn đề xuất" warning modal and avoids making API calls.
3.  **Visual Alignment**: Layout relies on modern CSS grid (`repeat(2, 1fr)`) and flexbox, ensuring responsiveness. List elements use relative positioning, specific dimensions for images (`92px` by `76px`), and text truncation to avoid layout shifts.
4.  **Linting Failures**: While Next.js successfully compiles the code because workspace settings bypass validation during build, running `pnpm lint` yields critical ESLint errors in the target file (`page.tsx`). Specifically, unescaped raw quotes inside JSX, variable hoisting, using `any`, and missing dependencies will cause the code quality tool checks to fail.

## 3. Caveats

*   I did not run the full Cypress/Playwright End-to-End tests as the focus was on unit testing, linting, typechecks, and code logic.
*   I assumed that the `@typescript-eslint` rules and `react-hooks/set-state-in-effect` are strict constraints required for workspace quality compliance.

## 4. Conclusion

The feature is **correctly implemented** and meets all user UX constraints (no native selects, no native dialogs, no native date pickers). It functions correctly in tests and compiles under production builds. However, it **contains several ESLint errors** that prevent clean linting checks.
Therefore, the verdict is **REQUEST_CHANGES** until the ESLint violations in `frontend/apps/web/src/app/admin/content/page.tsx` are resolved.

## 5. Verification Method

*   To run the target tests:
    ```bash
    cd frontend/apps/web
    pnpm test __tests__/AdminRecommendHome.test.tsx
    ```
*   To run typechecks:
    ```bash
    cd frontend
    pnpm check-types
    ```
*   To run ESLint:
    ```bash
    cd frontend/apps/web
    pnpm lint
    ```
