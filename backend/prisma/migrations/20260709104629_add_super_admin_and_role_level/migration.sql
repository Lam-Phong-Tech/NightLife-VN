-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';

-- DropForeignKey
ALTER TABLE "admin_coupon_scans" DROP CONSTRAINT "admin_coupon_scans_scanned_by_user_id_fkey";

-- DropForeignKey
ALTER TABLE "admin_coupon_scans" DROP CONSTRAINT "admin_coupon_scans_store_id_fkey";

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "system_configs" (
    "key" VARCHAR(50) NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("key")
);
