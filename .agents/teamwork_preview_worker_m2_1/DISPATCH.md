## 2026-08-05T14:26:47Z
Implement Milestone 2 (PR 2: Backend Activity Contracts & Stable Pagination)

Step 1. Create `backend/src/nightlife-data/dto/partner-activity-query.dto.ts`:
- Define `PartnerActivityQueryDto` using `class-validator` and `class-transformer`.
- Properties: `limit?: number` (default 20, max 50), `cursor?: string` (base64 opaque token `<activityAt_iso>_<id>`), `type?: string` (ALL, COUPON_USAGE, BILL_PAYMENT, BOOKING_CHECKIN), `startDate?: string`, `endDate?: string`, `search?: string`, `storeId?: string`.

Step 2. Implement Controller Endpoints in `backend/src/nightlife-data/nightlife-data.controller.ts`:
- `GET /partner/home`: Decorated with `@Roles('PARTNER', 'ADMIN')` & `@UseGuards(JwtAuthGuard, RolesGuard)` (Staff roles return HTTP 403 Forbidden).
- `GET /partner/activity`: Decorated with `@Roles('PARTNER', 'ADMIN')` & `@UseGuards(JwtAuthGuard, RolesGuard)`, accepts `@Query() dto: PartnerActivityQueryDto`.
- `GET /partner/activity/:activityId`: Decorated with `@Roles('PARTNER', 'ADMIN')` & `@UseGuards(JwtAuthGuard, RolesGuard)`, accepts `@Param('activityId') activityId: string`, `@Query('storeId') storeId?: string`.

Step 3. Implement Service Logic in `backend/src/nightlife-data/nightlife-data.service.ts`:
- `getPartnerHome(user: UserSession, storeId?: string)`
- `getPartnerActivities(user: UserSession, dto: PartnerActivityQueryDto)`
- `getPartnerActivityDetail(user: UserSession, activityId: string, storeId?: string)`

Step 4. Implement Unit Tests in `backend/src/nightlife-data/nightlife-data.service.spec.ts`.

Step 5. Build & Test Verification.

Step 6. Git Commit & Push.

Step 7. Report Completion.
