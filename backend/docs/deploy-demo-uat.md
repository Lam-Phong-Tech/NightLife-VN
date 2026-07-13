# NightLife Demo/UAT Deploy Release Note

This note is the release checklist for the demo/UAT environment. The GitHub
deploy workflow writes the runtime evidence file on the VPS for every backend
deploy:

```text
/var/www/api.demonightlight.test9.io.vn/deploy-evidence/nightlife-<YYYYMMDD-HHMMSS>-release.txt
```

That runtime evidence file contains the actual deploy timestamp, commit SHA,
backup files, smoke-test results, and rollback command for the deploy run.

## Environment Profile

| Item | Demo/UAT value |
| --- | --- |
| Frontend URL | `https://demonightlight.test9.io.vn` |
| Backend URL | `https://demonightlight.test9.io.vn/api/backend` |
| Backend deploy path | `/var/www/api.demonightlight.test9.io.vn` |
| Frontend deploy path | `/var/www/demonightlight.test9.io.vn` |
| Backend PM2 process | `app-api.demonightlight.test9.io.vn` |
| Frontend PM2 process | `app-demonightlight.test9.io.vn` |
| Backend internal port | `3012` |
| Frontend internal port | `3009` |
| Backup root | `/var/backups/nightlife/demo-uat` |
| Backend rsync snapshot root | `/var/www/releases/api.demonightlight.test9.io.vn` |

Demo/UAT and production must use separate `.env` files, database URLs, ports,
PM2 process names, and deploy paths. Production values must not reuse the
demo/UAT `DATABASE_URL`, `PORT`, or PM2 process names.

## Required Env Checklist

Do not paste real secret values into Jira or Git. Confirm only present/missing.

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Demo/UAT DB URL, separate from production. |
| `JWT_SECRET` | Yes | Secret value only in VPS `.env`. |
| `JWT_EXPIRES_IN` | Yes | Token TTL, for example `1d`. |
| `PORT` | Yes | Workflow exports backend runtime port `3012`. |
| `STORAGE_LOCAL_DIR` | Yes | Defaults to `uploads`; backup archives this path. |
| `PUBLIC_BASE_URL` | Yes | Backend public base URL. |
| `WEB_BASE_URL` | Yes | Frontend public URL. |
| `CMS_BASE_URL` | Yes | Admin/CMS base URL. |
| `CORS_ORIGINS` | Yes | Frontend origin allowlist. |
| `GOOGLE_CLIENT_ID` | If Google login enabled | Must match frontend client ID. |
| `LINE_CHANNEL_ID` | If LINE login enabled | LINE auth config. |
| `LINE_CHANNEL_SECRET` | If LINE login enabled | Secret value only in VPS `.env`. |
| `LINE_CALLBACK_URL` | If LINE login enabled | Demo callback URL. |
| `TELEGRAM_BOT_TOKEN` | If Telegram enabled | Secret value only in VPS `.env`. |
| `TELEGRAM_ADMIN_CHAT_ID` | If Telegram enabled | Admin notification target. |
| `TELEGRAM_ADMIN_THREAD_ID` | Optional | Topic/thread target. |
| `TELEGRAM_NOTIFICATION_TIME_ZONE` | Optional | Defaults to `Asia/Bangkok`. |
| `COUPON_QR_SECRET` | If coupon QR enabled | Must be set outside Git. |
| `COUPON_QR_PARTNER_URL` | If partner QR scan enabled | Partner scan URL. |

## Automated Deploy Safety

The backend deploy workflow now gates schema changes as follows:

1. Create a backend deploy snapshot before `rsync`.
2. Preserve `.env`, `uploads`, and `public/uploads` during `rsync`.
3. Read `DATABASE_URL` from VPS `.env` without sourcing or executing the file.
4. Verify the configured demo/UAT database has NightLife data in `users` and
   `stores`. If it is empty, the workflow checks the known previous demo DB
   `backend_db`; when that DB is reachable and populated, it backs up `.env` and
   rewrites only the database name in `DATABASE_URL` to `backend_db`.
5. If the configured database is already the default demo/UAT DB `backend_db`
   and the core tables are reachable but empty, the workflow runs a guarded
   migrate + seed bootstrap and verifies `users` and `stores` are populated
   before restart.
6. If neither the configured DB nor `backend_db` has the required data, the
   workflow stops before backup/migration. It must not create an empty DB for
   UAT evidence.
7. Run `backend/scripts/backup-uat.sh` against the verified DB.
8. If the legacy DB was previously managed with `prisma db push` and has
   incomplete `_prisma_migrations` history, run a guarded migration baseline
   only after backup. The workflow first runs `prisma migrate diff` from the
   live DB to `prisma/schema.prisma`; it marks missing/failed migrations as
   applied only when that diff is empty.
9. Print backup evidence to the GitHub Actions log:
   - `nightlife-*-manifest.txt`
   - `nightlife-*-sha256.txt`
   - DB `.dump` size
   - `pg_restore --list` output
   - storage `.tgz` size or `.skipped` reason
10. Run `pnpm exec prisma migrate deploy`.
11. If the DB was the empty default demo/UAT DB, run the seed bootstrap.
12. Restart backend PM2 process.
13. Run backend, frontend, admin, and partner smoke checks.
14. Write the deploy evidence file under `deploy-evidence/`.

`npx prisma db push --accept-data-loss` is no longer used by the VPS deploy
workflow.

## Backup Evidence To Attach

After the GitHub deploy run finishes, attach or paste the following from the
workflow log or VPS `deploy-evidence` file:

| Evidence | Source |
| --- | --- |
| Manifest | `/var/backups/nightlife/demo-uat/nightlife-<timestamp>-manifest.txt` |
| Checksum | `/var/backups/nightlife/demo-uat/nightlife-<timestamp>-sha256.txt` |
| DB dump size | `database_backup_bytes` in manifest plus `ls -lh` output |
| Restore list | `/var/backups/nightlife/demo-uat/nightlife-db-<timestamp>.dump.list` |
| Storage archive | `/var/backups/nightlife/demo-uat/nightlife-storage-<timestamp>.tgz` |
| Storage skipped reason | `/var/backups/nightlife/demo-uat/nightlife-storage-<timestamp>.skipped` |
| Release note | `/var/www/api.demonightlight.test9.io.vn/deploy-evidence/nightlife-<timestamp>-release.txt` |
| DB repoint proof | `database_name`, `database_repointed`, and `database_data_counts_users_stores_areas` in the release note |
| DB bootstrap proof | `database_bootstrap_applied`, `database_bootstrap_reason`, and refreshed `database_data_counts_users_stores_areas` in the release note |
| Migration baseline proof | `migration_baseline_applied`, `migration_baseline_reason`, and `migration_baseline_marked` in the release note |

## Smoke Checks

The backend deploy workflow checks these endpoints after PM2 restart:

| Check | URL |
| --- | --- |
| Backend local areas | `http://127.0.0.1:3012/areas` |
| Backend public areas | `https://demonightlight.test9.io.vn/api/backend/areas` |
| Booking validation | `POST http://127.0.0.1:3012/bookings` expects `400` for `{}` |
| Frontend local homepage | `http://127.0.0.1:3009/` |
| Frontend local admin | `http://127.0.0.1:3009/admin` |
| Frontend local partner | `http://127.0.0.1:3009/partner` |
| Frontend public homepage | `https://demonightlight.test9.io.vn/` |
| Frontend public admin | `https://demonightlight.test9.io.vn/admin` |
| Frontend public partner | `https://demonightlight.test9.io.vn/partner` |

Attach screenshots for:

| Screenshot | URL |
| --- | --- |
| Public homepage | `https://demonightlight.test9.io.vn/` |
| Admin route | `https://demonightlight.test9.io.vn/admin` |
| Partner route | `https://demonightlight.test9.io.vn/partner` |

Each screenshot should include the system clock or be paired with the deploy
evidence timestamp from the workflow log.

## Manual Backup Fallback

Use this only if the workflow is not used. Assign an owner and paste the
timestamp/output into the ticket before any schema change.

```bash
cd /var/www/api.demonightlight.test9.io.vn
set -a
. ./.env
set +a
BACKUP_ROOT=/var/backups/nightlife/demo-uat \
STORAGE_PATHS="uploads public/uploads" \
./scripts/backup-uat.sh
```

The manual fallback is not the normal path. The normal path is the GitHub deploy
workflow, which runs backup automatically before `prisma migrate deploy`.

## Rollback Plan

The deploy workflow creates a backend snapshot before `rsync`:

```text
/var/www/releases/api.demonightlight.test9.io.vn/backend-<timestamp>.tgz
```

Application rollback:

```bash
cd /var/www/api.demonightlight.test9.io.vn
tar -xzf /var/www/releases/api.demonightlight.test9.io.vn/backend-<timestamp>.tgz -C /var/www/api.demonightlight.test9.io.vn
pnpm install --prod --no-frozen-lockfile
PORT=3012 pm2 restart app-api.demonightlight.test9.io.vn --update-env
pm2 save
```

Database rollback, only when data/schema rollback is explicitly approved:

```bash
pg_restore --clean --if-exists --no-owner --no-privileges \
  --dbname "<postgres-url-without-prisma-query-params>" \
  /var/backups/nightlife/demo-uat/nightlife-db-<timestamp>.dump
```

## P2 Follow-up

- Scheduled backup with retention enforcement outside deploy time.
- Offsite or S3-compatible backup copy.
- Regular restore drill with recorded result.
- Monitoring and alerts for uptime, disk, DB size, and backup failure.
