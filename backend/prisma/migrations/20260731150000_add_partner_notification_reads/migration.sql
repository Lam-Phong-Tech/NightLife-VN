CREATE TABLE "partner_notification_reads" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "notification_key" TEXT NOT NULL,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_notification_reads_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "partner_notification_reads_user_id_notification_key_key"
ON "partner_notification_reads"("user_id", "notification_key");

CREATE INDEX "partner_notification_reads_user_id_read_at_idx"
ON "partner_notification_reads"("user_id", "read_at");

ALTER TABLE "partner_notification_reads"
ADD CONSTRAINT "partner_notification_reads_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
