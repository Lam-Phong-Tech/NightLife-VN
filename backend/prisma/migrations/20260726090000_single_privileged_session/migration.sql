ALTER TABLE "users"
ADD COLUMN "active_privileged_jti" TEXT;

ALTER TABLE "user_sessions"
ADD COLUMN "revoked_reason" TEXT;

CREATE INDEX "users_active_privileged_jti_idx"
ON "users"("active_privileged_jti");

-- Preserve only the newest valid session for every privileged account when
-- this migration is deployed. USER accounts intentionally keep all sessions.
WITH latest_privileged_session AS (
  SELECT DISTINCT ON (session."user_id")
    session."user_id",
    session."jti"
  FROM "user_sessions" AS session
  INNER JOIN "users" AS account ON account."id" = session."user_id"
  WHERE account."role" IN (
    'SUPER_ADMIN'::"UserRole",
    'ADMIN'::"UserRole",
    'OPERATOR'::"UserRole",
    'PARTNER'::"UserRole",
    'STAFF'::"UserRole"
  )
    AND session."status" = 'ACTIVE'::"SessionStatus"
    AND session."expires_at" > CURRENT_TIMESTAMP
  ORDER BY
    session."user_id",
    session."created_at" DESC,
    session."id" DESC
)
UPDATE "users" AS account
SET "active_privileged_jti" = latest."jti"
FROM latest_privileged_session AS latest
WHERE account."id" = latest."user_id";

UPDATE "user_sessions" AS session
SET
  "status" = 'REVOKED'::"SessionStatus",
  "revoked_at" = CURRENT_TIMESTAMP,
  "revoked_reason" = 'SINGLE_SESSION_MIGRATION'
FROM "users" AS account
WHERE account."id" = session."user_id"
  AND account."role" IN (
    'SUPER_ADMIN'::"UserRole",
    'ADMIN'::"UserRole",
    'OPERATOR'::"UserRole",
    'PARTNER'::"UserRole",
    'STAFF'::"UserRole"
  )
  AND session."status" = 'ACTIVE'::"SessionStatus"
  AND (
    account."active_privileged_jti" IS NULL
    OR session."jti" <> account."active_privileged_jti"
  );
