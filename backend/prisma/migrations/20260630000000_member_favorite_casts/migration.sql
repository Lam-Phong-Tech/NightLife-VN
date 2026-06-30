-- CreateTable
CREATE TABLE "member_favorite_casts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "cast_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_favorite_casts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "member_favorite_casts_user_id_cast_id_key" ON "member_favorite_casts"("user_id", "cast_id");

-- CreateIndex
CREATE INDEX "member_favorite_casts_user_id_idx" ON "member_favorite_casts"("user_id");

-- CreateIndex
CREATE INDEX "member_favorite_casts_cast_id_idx" ON "member_favorite_casts"("cast_id");

-- AddForeignKey
ALTER TABLE "member_favorite_casts" ADD CONSTRAINT "member_favorite_casts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_favorite_casts" ADD CONSTRAINT "member_favorite_casts_cast_id_fkey" FOREIGN KEY ("cast_id") REFERENCES "casts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
