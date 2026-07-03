-- CreateEnum
CREATE TYPE "PartnerRequestStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "partner_requests" (
    "id" TEXT NOT NULL,
    "store_id" UUID NOT NULL,
    "partner_user_id" UUID,
    "partner_account_id" UUID,
    "reviewed_by_id" UUID,
    "notification_log_id" UUID,
    "status" "PartnerRequestStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "business_name" TEXT NOT NULL,
    "business_type" TEXT,
    "area" TEXT,
    "contact_name" TEXT NOT NULL,
    "contact_phone" TEXT NOT NULL,
    "contact_email" TEXT,
    "note" TEXT,
    "store_description" TEXT,
    "store_address" TEXT,
    "store_city" TEXT,
    "store_district" TEXT,
    "opening_hours" TEXT,
    "menu_summary" TEXT,
    "media_urls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "cast_profiles" JSONB,
    "draft_cast_ids" UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
    "draft_media_ids" UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
    "draft_content_ids" UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
    "review_reason" TEXT,
    "public_state" TEXT NOT NULL DEFAULT 'HIDDEN',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "partner_requests_store_id_idx" ON "partner_requests"("store_id");

-- CreateIndex
CREATE INDEX "partner_requests_partner_user_id_idx" ON "partner_requests"("partner_user_id");

-- CreateIndex
CREATE INDEX "partner_requests_partner_account_id_idx" ON "partner_requests"("partner_account_id");

-- CreateIndex
CREATE INDEX "partner_requests_reviewed_by_id_idx" ON "partner_requests"("reviewed_by_id");

-- CreateIndex
CREATE INDEX "partner_requests_notification_log_id_idx" ON "partner_requests"("notification_log_id");

-- CreateIndex
CREATE INDEX "partner_requests_status_submitted_at_idx" ON "partner_requests"("status", "submitted_at");

-- CreateIndex
CREATE INDEX "partner_requests_contact_email_idx" ON "partner_requests"("contact_email");

-- AddForeignKey
ALTER TABLE "partner_requests" ADD CONSTRAINT "partner_requests_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_requests" ADD CONSTRAINT "partner_requests_partner_user_id_fkey" FOREIGN KEY ("partner_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_requests" ADD CONSTRAINT "partner_requests_partner_account_id_fkey" FOREIGN KEY ("partner_account_id") REFERENCES "partner_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_requests" ADD CONSTRAINT "partner_requests_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_requests" ADD CONSTRAINT "partner_requests_notification_log_id_fkey" FOREIGN KEY ("notification_log_id") REFERENCES "notification_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
