# Public Discovery Listing Roadmap

## Implemented in P1

- `GET /stores` and `GET /casts` support `hasActiveCoupon=true` to keep only records attached to stores with an active coupon window.
- `GET /stores` and `GET /casts` support `sort=newest`, `sort=nearest`, and `sort=priority`; `sort=ranking` is accepted as an alias for `priority`.
- `sort=nearest` requires both `lat` and `lng`.
- `limit`, `page`, and `offset` are supported. `offset` takes precedence over `page` when both are sent.
- Listing responses now return `{ data, meta }` with `total`, `page`, `limit`, `offset`, `hasMore`, and `sort`.
- Swagger exposes typed response DTOs for store and cast listings so frontend clients can generate against the response contract.

## Deferred / P2

- Cache or read replica should be added only when listing traffic or data volume justifies it.
- Dedicated search engine options remain Meilisearch, Typesense, or PostgreSQL full-text search.
- Geo ranking is still calculated in application memory for MVP/P1. Move to PostGIS when distance queries need database-level filtering, indexing, or pagination at larger scale.
- Personalization by tier, language, nationality, and behavior-based recommendations remains outside the public MVP/P1 listing contract.
