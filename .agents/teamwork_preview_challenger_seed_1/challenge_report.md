## Challenge Summary

**Overall risk assessment**: LOW

The seeding scripts are resilient once the environment is properly configured. However, there were critical environment setup issues (missing database process, pending migrations/out of sync database schema) that initially caused failure. Once these were resolved, all seeds ran successfully.

## Challenges

### [Medium] Database Schema Out-Of-Sync

- **Assumption challenged**: Assumed the database schema matches `schema.prisma`.
- **Attack scenario**: If the schema is not updated with migrations/db-push, upsert statements targeting fields like `booking_code` or `password_hash` will fail due to column missing errors.
- **Blast radius**: Complete failure of the seeding process.
- **Mitigation**: Run `prisma migrate deploy` and/or `prisma db push` prior to seeding.

### [Low] Database Offline

- **Assumption challenged**: Assumed local PostgreSQL server is always running on `localhost:5432`.
- **Attack scenario**: If the developer/VPS stops Laragon PostgreSQL, connection will fail with `ECONNREFUSED`.
- **Blast radius**: Immediate termination of seed command.
- **Mitigation**: Wrap the script with a connection check/retry or document database startup instructions.

## Stress Test Results

- Database Offline → Seed script should report connection error → Fails with `ECONNREFUSED` (Passes validation test)
- Missing Migrations → Seed script should fail on database insertion → Fails with `P2022: Column not found` (Passes validation test)
- Valid Database with full profile → Checks 42 models and verifies non-zero counts → Succeeds with `42/42 required models` (Passes validation test)
- Valid Database with demo profile → Checks 39 models and verifies non-zero counts → Succeeds with `39/39 required models` (Passes validation test)

## Unchallenged Areas

- Seeding under concurrent load / active transactions — Not challenged as seeding is intended for fresh database initialization.
