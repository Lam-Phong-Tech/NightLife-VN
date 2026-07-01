-- CreateEnum
CREATE TYPE "BookingChangeRequestType" AS ENUM ('RESCHEDULE');

-- CreateEnum
CREATE TYPE "BookingChangeRequestStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BookingChatSenderType" AS ENUM ('GUEST', 'MEMBER', 'ADMIN', 'OPERATOR', 'SYSTEM');

-- CreateEnum
CREATE TYPE "BookingChatTopic" AS ENUM ('GENERAL', 'RESCHEDULE', 'CANCEL');

-- AlterTable
ALTER TABLE "stores"
ADD COLUMN "booking_cancel_cutoff_minutes" INTEGER NOT NULL DEFAULT 60;

-- CreateTable
CREATE TABLE "booking_change_requests" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "store_id" UUID NOT NULL,
    "cast_id" UUID,
    "requested_by_id" UUID,
    "guest_id" UUID,
    "reviewed_by_id" UUID,
    "type" "BookingChangeRequestType" NOT NULL DEFAULT 'RESCHEDULE',
    "status" "BookingChangeRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "current_scheduled_at" TIMESTAMP(3) NOT NULL,
    "requested_scheduled_at" TIMESTAMP(3),
    "reason" TEXT,
    "admin_note" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_change_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_chat_messages" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "change_request_id" UUID,
    "store_id" UUID NOT NULL,
    "sender_user_id" UUID,
    "guest_id" UUID,
    "sender_type" "BookingChatSenderType" NOT NULL,
    "topic" "BookingChatTopic" NOT NULL DEFAULT 'GENERAL',
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "booking_change_requests_booking_id_idx" ON "booking_change_requests"("booking_id");

-- CreateIndex
CREATE INDEX "booking_change_requests_store_id_idx" ON "booking_change_requests"("store_id");

-- CreateIndex
CREATE INDEX "booking_change_requests_cast_id_idx" ON "booking_change_requests"("cast_id");

-- CreateIndex
CREATE INDEX "booking_change_requests_requested_by_id_idx" ON "booking_change_requests"("requested_by_id");

-- CreateIndex
CREATE INDEX "booking_change_requests_guest_id_idx" ON "booking_change_requests"("guest_id");

-- CreateIndex
CREATE INDEX "booking_change_requests_reviewed_by_id_idx" ON "booking_change_requests"("reviewed_by_id");

-- CreateIndex
CREATE INDEX "booking_change_requests_status_idx" ON "booking_change_requests"("status");

-- CreateIndex
CREATE INDEX "booking_change_requests_type_idx" ON "booking_change_requests"("type");

-- CreateIndex
CREATE INDEX "booking_change_requests_created_at_idx" ON "booking_change_requests"("created_at");

-- CreateIndex
CREATE INDEX "booking_chat_messages_booking_id_idx" ON "booking_chat_messages"("booking_id");

-- CreateIndex
CREATE INDEX "booking_chat_messages_change_request_id_idx" ON "booking_chat_messages"("change_request_id");

-- CreateIndex
CREATE INDEX "booking_chat_messages_store_id_idx" ON "booking_chat_messages"("store_id");

-- CreateIndex
CREATE INDEX "booking_chat_messages_sender_user_id_idx" ON "booking_chat_messages"("sender_user_id");

-- CreateIndex
CREATE INDEX "booking_chat_messages_guest_id_idx" ON "booking_chat_messages"("guest_id");

-- CreateIndex
CREATE INDEX "booking_chat_messages_topic_idx" ON "booking_chat_messages"("topic");

-- CreateIndex
CREATE INDEX "booking_chat_messages_created_at_idx" ON "booking_chat_messages"("created_at");

-- AddForeignKey
ALTER TABLE "booking_change_requests" ADD CONSTRAINT "booking_change_requests_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_change_requests" ADD CONSTRAINT "booking_change_requests_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_change_requests" ADD CONSTRAINT "booking_change_requests_cast_id_fkey" FOREIGN KEY ("cast_id") REFERENCES "casts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_change_requests" ADD CONSTRAINT "booking_change_requests_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_change_requests" ADD CONSTRAINT "booking_change_requests_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_change_requests" ADD CONSTRAINT "booking_change_requests_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_chat_messages" ADD CONSTRAINT "booking_chat_messages_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_chat_messages" ADD CONSTRAINT "booking_chat_messages_change_request_id_fkey" FOREIGN KEY ("change_request_id") REFERENCES "booking_change_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_chat_messages" ADD CONSTRAINT "booking_chat_messages_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_chat_messages" ADD CONSTRAINT "booking_chat_messages_sender_user_id_fkey" FOREIGN KEY ("sender_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_chat_messages" ADD CONSTRAINT "booking_chat_messages_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
