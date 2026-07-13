-- AlterTable
ALTER TABLE "audit_logs" 
ADD COLUMN "actor_type" TEXT,
ADD COLUMN "actor_name" TEXT,
ADD COLUMN "actor_role" TEXT,
ADD COLUMN "module" TEXT,
ADD COLUMN "entity_display_code" TEXT,
ADD COLUMN "change_summary" TEXT,
ADD COLUMN "reason" TEXT,
ADD COLUMN "result" TEXT DEFAULT 'SUCCESS',
ADD COLUMN "ip_address" TEXT,
ADD COLUMN "user_agent" TEXT,
ADD COLUMN "request_id" TEXT,
ADD COLUMN "batch_id" TEXT;
