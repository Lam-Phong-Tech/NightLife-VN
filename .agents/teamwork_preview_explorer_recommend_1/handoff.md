# Handoff Report - Pinned Recommendation Home Analysis

## 1. Observation
We explored and analyzed the following backend files:
- **`backend/src/nightlife-data/dto/admin-ranking.dto.ts`**
  - Found `pinRank` validation decorator `@Max(5)` on lines 83-84:
    ```typescript
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(5, { message: 'Ranking P0 chỉ hỗ trợ Top 1-5' })
    pinRank?: number | null;
    ```
  - Found the same decorator in class `UpdateAdminRankingConfigDto` on lines 144-145:
    ```typescript
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(5, { message: 'Ranking P0 chỉ hỗ trợ Top 1-5' })
    pinRank?: number | null;
    ```
- **`backend/src/nightlife-data/nightlife-data.service.ts`**
  - Found `listPublicHomeRecommendations` definition on lines 20519-20708:
    ```typescript
    async listPublicHomeRecommendations(query: PublicHomeContentQueryDto = {}) {
      const cityCode = this.normalizeHotVideoCityCode(query.cityCode ?? 'all');
      const limit = this.resolvePublicHomeLimit(query.limit, 8, 16);
      const preferredCategories = this.parsePublicHomeCategories(
        query.categories,
      );
      ...
    ```
  - Found method `buildPublicRankingConfigCityWhere` on line 14997 which maps `cityCode` to appropriate Prisma filters:
    ```typescript
    private buildPublicRankingConfigCityWhere(
      cityCode?: string,
    ): Prisma.RankingConfigWhereInput {
      if (cityCode) {
        return { cityCode };
      }

      return { cityCode: 'all' };
    }
    ```

## 2. Logic Chain
1. To relax `pinRank` validation to 8, we must update the `@Max(5, ...)` validation constraints in both DTO classes `CreateAdminRankingConfigDto` and `UpdateAdminRankingConfigDto` to `@Max(8, ...)` and adjust the error messages accordingly.
2. In `listPublicHomeRecommendations`, the current implementation only queries stores using a fallback personalization heuristic based on view count and booking count.
3. To introduce pinned recommendation support, we must query `rankingConfig` for `'recommend-home'` scope target store IDs matching the current `cityCode` (leveraging `buildPublicRankingConfigCityWhere` helper).
4. Since the retrieved stores must be active and not deleted, we will fetch corresponding `Store` records checking `deletedAt: null` and `status: 'ACTIVE'`.
5. Pinned recommendations should be sorted according to their `pinRank` (followed by `manualScore` descending and `updatedAt` descending).
6. If the resulting pinned stores list is empty, we must return the result of the original personalized recommendation logic, acting as a fallback mechanism.

## 3. Caveats
- The changes proposed in the `.patch` file assume standard NestJS decorator validation with `class-validator` and `class-transformer` are active (which they are, as seen in package.json and controllers).
- In memory sorting uses `Infinity` for fallbacks if a `pinRank` is missing or null, which is standard practice.

## 4. Conclusion
We propose relaxing the validation limit of `pinRank` from 5 to 8 and introducing a database query for `'recommend-home'` scope store rankings at the beginning of `listPublicHomeRecommendations`. If found and active, they are sorted and returned. Otherwise, the method falls back to existing personalized logic.
A complete, machine-applicable patch file has been written to:
`.agents/teamwork_preview_explorer_recommend_1/recommendation-home.patch`

## 5. Verification Method
1. Apply the patch using git:
   ```powershell
   git apply .agents/teamwork_preview_explorer_recommend_1/recommendation-home.patch
   ```
2. Verify class-validator DTO constraint updates by testing creation/updates of ranking configurations with `pinRank` up to 8.
3. Run the backend unit tests to ensure no regressions:
   ```powershell
   npm run test -- src/nightlife-data/nightlife-data.service.spec.ts
   ```
