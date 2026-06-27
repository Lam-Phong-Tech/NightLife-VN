CREATE TABLE "token_blacklist" (
    "id" UUID NOT NULL,
    "jti" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "reason" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_blacklist_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "token_blacklist_jti_key" ON "token_blacklist"("jti");
CREATE INDEX "token_blacklist_user_id_idx" ON "token_blacklist"("user_id");
CREATE INDEX "token_blacklist_expires_at_idx" ON "token_blacklist"("expires_at");

ALTER TABLE "token_blacklist"
ADD CONSTRAINT "token_blacklist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
