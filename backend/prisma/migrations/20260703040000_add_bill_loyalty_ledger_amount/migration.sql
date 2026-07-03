-- AlterTable
ALTER TABLE "point_ledgers" ADD COLUMN "amount_vnd" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "point_ledgers_bill_id_type_key" ON "point_ledgers"("bill_id", "type");
