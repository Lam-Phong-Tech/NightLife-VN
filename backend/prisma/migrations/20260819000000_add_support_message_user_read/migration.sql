-- Track unread Admin replies separately from the existing Admin-side read state.
ALTER TABLE "support_messages"
ADD COLUMN "is_read_by_user" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "support_messages_ticket_user_read_idx"
ON "support_messages"("ticket_id", "is_read_by_user", "sender_type");
