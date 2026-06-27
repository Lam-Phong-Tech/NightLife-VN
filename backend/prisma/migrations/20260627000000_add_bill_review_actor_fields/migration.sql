ALTER TABLE "bills"
ADD COLUMN "reviewed_by_id" UUID,
ADD COLUMN "verified_by_id" UUID,
ADD COLUMN "rejected_by_id" UUID,
ADD COLUMN "reviewed_at" TIMESTAMP(3);

CREATE INDEX "bills_reviewed_by_id_idx" ON "bills"("reviewed_by_id");
CREATE INDEX "bills_verified_by_id_idx" ON "bills"("verified_by_id");
CREATE INDEX "bills_rejected_by_id_idx" ON "bills"("rejected_by_id");

ALTER TABLE "bills"
ADD CONSTRAINT "bills_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
ADD CONSTRAINT "bills_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
ADD CONSTRAINT "bills_rejected_by_id_fkey" FOREIGN KEY ("rejected_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
