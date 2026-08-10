CREATE TYPE "LegalPageKey" AS ENUM ('PRIVACY_POLICY', 'TERMS_OF_USE', 'OPERATING_POLICY');

CREATE TABLE "legal_pages" (
    "id" UUID NOT NULL,
    "key" "LegalPageKey" NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "sections" JSONB NOT NULL,
    "noindex" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updated_by_id" UUID,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "legal_pages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "legal_pages_key_key" ON "legal_pages"("key");
CREATE UNIQUE INDEX "legal_pages_slug_key" ON "legal_pages"("slug");
CREATE INDEX "legal_pages_slug_idx" ON "legal_pages"("slug");
