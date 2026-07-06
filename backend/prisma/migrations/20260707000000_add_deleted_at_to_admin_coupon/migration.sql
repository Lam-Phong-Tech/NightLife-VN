-- AlterTable
ALTER TABLE "admin_coupons" ADD COLUMN "deleted_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "admin_coupons_deleted_at_idx" ON "admin_coupons"("deleted_at");
