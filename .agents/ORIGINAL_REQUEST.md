# Original User Request

## 2026-07-16T10:17:06Z

Implement a comprehensive seed data sync to ensure 100% database schema coverage for the NightLife-VN project, covering 9 missing entities and providing VPS deployment scripts.

Working directory: d:\laragon\www\NightLife-VN
Integrity mode: development

## Requirements

### R1. Seed Missing Entities
Develop seed logic for the following 9 entities using Prisma upsert:
- SupportTicket and SupportMessage
- MemberFavoriteStore
- Tour and TourStop
- AdminCoupon, AdminCouponScan, AdminCouponIssue
- Campaign

### R2. Seed Implementation Structure
- Update 13-api-fixtures.ts for MemberFavoriteStore, SupportTicket, and SupportMessage.
- Create 16-tours.ts for Tour and TourStop.
- Create 17-admin-coupons-campaigns.ts for AdminCoupon and Campaign entities.
- Update index.ts to integrate the new modules and report summary logs.

### R3. Verification Coverage
Update verify.ts to include assertions and status checks for all 9 new entities to guarantee 100% schema coverage.

### R4. VPS Deployment Script
Create a Python script seed_vps_full.py using paramiko to deploy the new seed files and execute npx tsx prisma/seed/index.ts on the remote VPS (45.119.83.233).

## Acceptance Criteria

### Automated Tests
- [ ] pnpm run seed runs locally without encountering errors.
- [ ] pnpm run seed:check executes successfully, explicitly reporting that all new entities are covered.

### Deployment
- [ ] seed_vps_full.py successfully connects to the remote VPS and runs the seed process without syntax or runtime errors.

## Follow-up — 2026-07-16T13:03:00Z

The server restarted and all subagents/background tasks were interrupted. The user has requested to resume the process (`/teamwork-preview tiếp tục`). Please resume your work on Milestone 2 from where you left off, verify your progress, and continue until completion. Send me a progress update when you are back on track.

