# Handoff Report - Homepage Recommendations & Test Planning

## 1. Observation

### Frontend Recommendation Fetching & Rendering
In `frontend/apps/web/src/app/page.tsx`, the homepage loads recommendations as follows:
- **API Call**: At lines 2593-2611, the `contentApi.recommendations` endpoint is invoked:
  ```typescript
  contentApi
    .recommendations({
      cityCode: "all",
      limit: 8,
      categories: behaviorSignals.categories.join(","),
      storeSlugs: behaviorSignals.storeSlugs.join(","),
    })
    .then((items) => {
      if (!cancelled) setHomeRecommendations(items.map(mapRecommendationToHomeCard));
    })
  ```
- **Fallback Logic**: At line 2478, if the personalized recommendations array is empty, it falls back to the default list of priority stores:
  ```typescript
  const recommendedCards = homeRecommendations.length ? homeRecommendations : homeStoreCards;
  ```
- **Rendering & Ordering**: At lines 2902-2927 (Mobile) and 3057-3080 (Desktop), the `recommendedCards` array is sliced to 8 elements and passed to `HomeCardCarousel`:
  ```typescript
  items={recommendedCards.slice(0, 8)}
  ```
  The order returned by the API is preserved through `items.map(...)` and `HomeCardCarousel` slide chunking (lines 1517-1599).
- **Front-end Filters**: No front-end interactive filters are bound to the homepage recommendation section; it statically renders based on the initial fetch.

### Backend Recommendations Logic
In `backend/src/nightlife-data/nightlife-data.service.ts`:
- **Method**: `listPublicHomeRecommendations(query: PublicHomeContentQueryDto)` at line 20519 handles `/content/recommendations`.
- **Query & Limits**: Queries stores based on local behavior history (`query.categories` and `query.storeSlugs`), calculates recommendation scores based on matching categories, area proximity, active coupons, and historical view/booking counts (lines 20641-20705).
- **Sorting**: The results are sorted by the calculated `score` in descending order:
  ```typescript
  .sort((left, right) => right.score - left.score)
  .slice(0, limit);
  ```

### Existing Tests
- **Frontend**: `frontend/apps/web/__tests__/Home.test.tsx` mocks homepage API endpoints. At lines 272-289, it mocks `contentRecommendationsMock` returning a test recommendation. At lines 349-382, it tests that API data is successfully loaded and rendered.
- **Backend**: There are **no existing unit or integration tests** for the homepage recommendations endpoint `/content/recommendations` on the backend. E2E tests are present for other public discovery endpoints under `backend/test/public-discovery.e2e-spec.ts`.

---

## 2. Logic Chain

1. **Ordering Correctness**: Since the frontend does not re-sort or filter the array after receiving it from the API, it preserves the backend's exact order. `Array.prototype.map` converts items to cards in order, and `HomeCardCarousel` displays them sequentially slide-by-slide.
2. **Filters**: The API arguments are fixed on mount, using `cityCode: "all"` and `limit: 8`. There are no dropdowns, search inputs, or category tabs that trigger a re-fetch of recommendations or filter them locally. Thus, no front-end filters exist for recommendations.
3. **Manual Pinning Testing Needs**: 
   - Since the backend DTO currently validates `pinRank` with `@Max(5)` (`backend/src/nightlife-data/dto/admin-ranking.dto.ts` at line 84 & 145), the backend DTO validation needs to support up to 8.
   - Pinned configurations will be saved under the `recommend-home` scope in `RankingConfig`.
   - The frontend admin rankings console page (`frontend/apps/web/src/app/admin/ranking/page.tsx` lines 315 & 334) must allow adding up to 8 stores (increasing the hard limit from 5).
   - Therefore, integration tests are required to cover both the backend fallback and order logic, and the frontend admin console management and homepage rendering.

---

## 3. Caveats

- We assumed that the backend database seeding and test database configuration support writing to the `RankingConfig` table.
- Since we are in `CODE_ONLY` network mode and have a read-only investigation constraint, we have only proposed the testing code patterns and commands but did not run them.
- Any manual configuration using `recommend-home` scope must handle cleanup of duplicate pin rankings (e.g. ensuring multiple stores do not get pinned at rank 1), which should be validated in the backend service or controller.

---

## 4. Conclusion

- The homepage successfully fetches recommendations from the backend `/content/recommendations` endpoint, matching the ordered backend results without applying any front-end filters.
- To test the new manual configurations under `recommend-home` scope, we must verify the relaxed DTO validator (accepting `pinRank` up to 8), check `listPublicHomeRecommendations` for correctly loading and sorting pinned stores, and test the frontend homepage display fallback and admin console UI interactions (Up/Down reordering and up to 8 items limitation).

---

## 5. Verification Method

### 1. Test Proposals

#### Proposed Backend Tests
Create or expand unit test cases in `backend/src/nightlife-data/nightlife-data.service.spec.ts` (or a dedicated `recommend-home.spec.ts`):
```typescript
describe('listPublicHomeRecommendations with recommend-home configurations', () => {
  it('should return behavior-based recommendations if no recommend-home config is present', async () => {
    prisma.rankingConfig.findMany.mockResolvedValue([]);
    const results = await service.listPublicHomeRecommendations();
    expect(results[0].reason).toBe('Theo loai hinh ban hay xem'); // behavior fallback
  });

  it('should return pinned stores sorted by pinRank ascending when recommend-home configurations are active', async () => {
    prisma.rankingConfig.findMany.mockResolvedValue([
      { targetId: 'store-2', pinRank: 2, status: 'ACTIVE', scope: 'recommend-home' },
      { targetId: 'store-1', pinRank: 1, status: 'ACTIVE', scope: 'recommend-home' },
    ]);
    prisma.store.findMany.mockResolvedValue([
      { id: 'store-1', name: 'Store A', slug: 'store-a', category: 'BAR' },
      { id: 'store-2', name: 'Store B', slug: 'store-b', category: 'CLUB' },
    ]);
    const results = await service.listPublicHomeRecommendations();
    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('store-1');
    expect(results[1].id).toBe('store-2');
  });
});
```

#### Proposed Frontend Tests
Create or expand homepage recommendations unit tests in `frontend/apps/web/__tests__/HomeRecommendations.test.tsx` (or inside `Home.test.tsx`):
```typescript
it('renders manually pinned recommend-home stores in exact backend order on the homepage', async () => {
  contentRecommendationsMock.mockResolvedValue([
    { id: 'store-1', name: 'Store Pinned 1', slug: 'store-1', category: 'BAR', score: 100 },
    { id: 'store-2', name: 'Store Pinned 2', slug: 'store-2', category: 'CLUB', score: 99 },
  ]);
  render(<Page />);
  await screen.findAllByText('Store Pinned 1');
  const cards = screen.getAllByTestId('venue-mini-card');
  expect(cards[0]).toHaveTextContent('Store Pinned 1');
  expect(cards[1]).toHaveTextContent('Store Pinned 2');
});
```

### 2. Verification Commands
- **Backend Tests**: Run Jest unit tests under the backend directory:
  ```powershell
  pnpm --filter backend test src/nightlife-data/nightlife-data.service.spec.ts
  ```
- **Frontend Tests**: Run Vitest unit tests under the frontend directory:
  ```powershell
  pnpm --filter web test apps/web/__tests__/Home.test.tsx
  ```
