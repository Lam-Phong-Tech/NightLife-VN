# Forensic Audit & Handoff Report

**Work Product**: Pinned Recommendations for Home ("Đề xuất tối nay" / `recommend-home`) in Backend & Frontend (Commit `a2607ce0840d51b32546edce6b21b6517ebf277d`)
**Profile**: General Project
**Verdict**: CLEAN

---

## 1. Observation

- **Modified Files**:
  - `backend/src/nightlife-data/dto/admin-ranking.dto.ts` (lines 80-84, 141-145)
  - `backend/src/nightlife-data/nightlife-data.service.spec.ts` (lines 8231-8442)
  - `backend/src/nightlife-data/nightlife-data.service.ts` (lines 20519-20730)
  - `frontend/apps/web/src/app/admin/content/page.tsx` (lines 8-12, 17-21, 26-31, 59-221, 277-384)

- **Source Code Verification**:
  - `backend/src/nightlife-data/nightlife-data.service.ts`:
    - `listPublicHomeRecommendations` queries `prisma.rankingConfig` matching scope `recommend-home`, sorts by `pinRank (asc)`, `manualScore (desc)`, `updatedAt (desc)`.
    - Fetches the pinned stores from `prisma.store`.
    - Sorts the stores based on the database ranking configuration.
    - Groups view logs (`prisma.auditLog.groupBy`) and bookings (`prisma.booking.groupBy`) within the last 30 days to extract analytics signals.
    - Slices recommendations by the `limit` parameter and maps active coupons.
  - `frontend/apps/web/src/app/admin/content/page.tsx`:
    - Integrates the new `"Đề xuất tối nay"` tab.
    - Leverages standard `adminRankingsApi` (`list`, `create`, `delete`, `update`) to manage ranking configs.
    - Enforces the 8-item cap on frontend via `feedback.showModal`.
    - Swaps ranks correctly using `Promise.all` with multiple API calls.
    - Complies with user constraints: calls `feedback.showModal` and `feedback.showToast` instead of native `alert` or `confirm`. No native select elements or browser datepickers are introduced.

- **Build and Test Results**:
  - Backend build command (`pnpm run build` in `backend`) succeeded.
  - Backend unit tests ran via `npx jest src/nightlife-data/nightlife-data.service.spec.ts --no-cache`. Output:
    ```
    Test Suites: 1 passed, 1 total
    Tests:       125 passed, 125 total
    Snapshots:   0 total
    Time:        27.325 s
    Ran all test suites matching src/nightlife-data/nightlife-data.service.spec.ts.
    ```
  - Frontend build command (`pnpm run build` in `frontend`) succeeded:
    ```
    web:build: ▲ Next.js 16.2.9 (Turbopack)
    web:build: ✓ Compiled successfully in 2.1min
    web:build: ✓ Generating static pages using 3 workers (61/61) in 6.8s
    web:build:  Tasks:    1 successful, 1 total
    ```

---

## 2. Logic Chain

- **Premise 1**: Genuine logic requires the code to implement functional database querying, sorting, mapping, and API coordination, rather than returning static dummy variables.
  - *Observation Support*: `listPublicHomeRecommendations` fetches rankings, stores, maps coupons, groups log analytics, and returns formatted objects dynamically. Frontend handles search, insertion, position swaps, and deletions using actual API invocations.
- **Premise 2**: A lack of hardcoded test results means the unit tests must verify dynamic behaviors (such as sorting orders, fallbacks, and parameter filtering) and check database mocks without bypass keys.
  - *Observation Support*: The Jest tests mock the Prisma calls returning distinct objects and check that service results reflect correct sorting behavior (`store-1` -> `store-3` -> `store-2`) and proper SQL query parameter assembly.
- **Premise 3**: Clean project behavior means all builds and tests compile and run properly.
  - *Observation Support*: Backend built correctly, Nest tests passed, and frontend built without any Next.js/Turbopack errors.

**Conclusion**: The changes represent authentic, clean logic without bypasses, facades, or hardcoded results.

---

## 3. Caveats

- We did not test real-time Socket.io connections as it is outside the scope of the manual content config, though the API routes were built successfully.
- We did not connect to a live PostgreSQL database; database logic was verified via standard unit mocks and prisma client generation checks.

---

## 4. Phase Results

- **Hardcoded output detection**: PASS — No hardcoded test bypass strings or results found.
- **Facade detection**: PASS — Service methods and frontend functions contain complete implementations.
- **Pre-populated artifact detection**: PASS — No unexpected pre-populated logs or database exports exist.
- **Build and Run**: PASS — Both NestJS backend and Next.js frontend built and tested successfully.
- **Dependency Audit**: PASS — Used standard libraries/interfaces already available in the monorepo workspace.
- **Vietnam unit / User constraints compliance**: PASS — Handled modal/toasts using project UI patterns, translated Vietnamese instructions accurately.

---

## 5. Verification Method

- Run the backend test suite:
  ```bash
  cd backend
  npx jest src/nightlife-data/nightlife-data.service.spec.ts --no-cache
  ```
- Build the project:
  - Backend: `cd backend && pnpm build`
  - Frontend: `cd frontend && pnpm build`
