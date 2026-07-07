# Ranking P1/P2 Roadmap

## P1 Active Scope

- Public data source: `GET /rankings`.
- Admin CMS control: `GET /admin/rankings`, `POST /admin/rankings`, `PATCH /admin/rankings/:rankingId`, `DELETE /admin/rankings/:rankingId`.
- Admin target picker: `GET /admin/rankings/options?targetType=CAST|STORE&city=all|hn|hcm&category=...`.
- Manual ranking fields: `targetType`, `targetId`, `cityCode`, `areaId`, `category`, `scope`, `pinRank`, `manualScore`, `sponsored`, `startsAt`, `endsAt`, `status`.
- Duplicate pin protection: partial unique indexes on non-deleted pinned configs:
  - `targetType + cityCode + scope + pinRank` when category is null.
  - `targetType + cityCode + category + scope + pinRank` when category is set.
- Frontend tracking event: `ranking_click` with `rankingSlot`, `targetType`, `targetId`, `targetSlug`, `category`, `city`, `selectedCategory`, `sponsored`, `pinRank`, `manualScore`, and `experimentVariant`.

## P2 Deferred Design

P2 should not change current P1 ordering until PM enables a new ranking mode.

- Automatic ranking: add a separate scoring job/table for view, like, rating, booking, and bill conversion signals. Keep `RankingConfig` manual pins as an override layer.
- Sponsored A/B testing: use `experimentKey = ranking_sponsored_v1` and `experimentVariant` from the frontend tracking payload before introducing weighted sponsored ranking.
- BI conversion by position: join `ranking_click.rankingSlot` with downstream profile, call, booking, coupon, and bill events.
- Personalized recommendation: layer a recommendation candidate set by member tier, language, city/area, and recent browsing history; keep public `/rankings` deterministic unless a member-authenticated endpoint is introduced.
