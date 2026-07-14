CREATE TABLE "member_favorite_stores" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "store_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_favorite_stores_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "member_favorite_stores_user_id_store_id_key" ON "member_favorite_stores"("user_id", "store_id");

CREATE INDEX "member_favorite_stores_user_id_idx" ON "member_favorite_stores"("user_id");

CREATE INDEX "member_favorite_stores_store_id_idx" ON "member_favorite_stores"("store_id");

ALTER TABLE "member_favorite_stores" ADD CONSTRAINT "member_favorite_stores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "member_favorite_stores" ADD CONSTRAINT "member_favorite_stores_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
