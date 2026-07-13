-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN "changed_fields" TEXT[] DEFAULT ARRAY[]::TEXT[];
