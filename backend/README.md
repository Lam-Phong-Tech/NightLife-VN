# NightLife-VN Backend

NestJS API for the NightLife-VN P0 backend. The current baseline includes PostgreSQL, Prisma migrations, JWT auth, and local media storage.

## Requirements

- Node.js 22+
- pnpm
- Docker Desktop

## Environment

Copy the example file and adjust values when needed:

```bash
cp .env.example .env
```

Default local values:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nightlife?schema=public"
JWT_SECRET="change-me-in-production"
JWT_EXPIRES_IN="1d"
PORT=3001
STORAGE_LOCAL_DIR="uploads"
PUBLIC_BASE_URL="http://localhost:3001"
```

## Database

Start PostgreSQL from the repository root:

```bash
docker compose up -d postgres
```

Run migrations from `backend/`:

```bash
pnpm prisma migrate deploy
pnpm prisma migrate status
```

Generate Prisma client after schema changes:

```bash
pnpm prisma generate
```

## Run

```bash
pnpm install
pnpm start:dev
```

Swagger is available at:

```text
http://localhost:3001/api
```

## Auth

Implemented endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` with `Authorization: Bearer <token>`
- `GET /users/me` with `Authorization: Bearer <token>`

Users are created through `UsersService`, with email lookup, password hashing, default `role`, default `tier`, and public-user serialization. Passwords are hashed with Node.js `crypto.scrypt`. JWT settings come from `JWT_SECRET` and `JWT_EXPIRES_IN`.

## Storage

Implemented endpoints:

- `POST /storage/upload` with bearer token and multipart field `file`
- `GET /storage/files/:storageKey`

Uploaded files are saved under `STORAGE_LOCAL_DIR` and metadata is stored in `media_files`.
Allowed upload types are images, videos, and PDFs. The default upload limit is 25 MB.

## Core P0 Schema

The first migration creates:

- `users`
- `profiles`
- `roles`
- `user_role_assignments`
- `stores`
- `casts`
- `bookings`
- `coupons`
- `bills`
- `commission_configs`
- `point_ledgers`
- `media_files`
- `contents`
- `notification_logs`

Core enums include `UserRole`, `UserTier`, `UserStatus`, `StoreStatus`, `CastStatus`, `BookingStatus`, `BillStatus`, `MediaType`, and `MediaStatus`.

## Verification

Useful checks before handoff:

```bash
docker compose ps postgres
pnpm prisma migrate status
pnpm build
pnpm test
```

Manual Swagger smoke test:

1. Open `http://localhost:3001/api`.
2. Call `POST /auth/register`.
3. Copy `accessToken` into Swagger Authorize.
4. Call `GET /auth/me`.
5. Call `POST /storage/upload` with a small file.
