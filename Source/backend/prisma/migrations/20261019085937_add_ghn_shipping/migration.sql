/*
  Warnings:

  - A unique constraint covering the columns `[trackingCode]` on the table `orders` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "carrierFee" INTEGER,
ADD COLUMN     "expectedDeliveryAt" TIMESTAMP(3),
ADD COLUMN     "provinceId" INTEGER,
ADD COLUMN     "shippingStatus" TEXT,
ADD COLUMN     "street" TEXT,
ADD COLUMN     "trackingCode" TEXT,
ADD COLUMN     "wardId" INTEGER,
ADD COLUMN     "wardName" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "weightGram" INTEGER NOT NULL DEFAULT 300;

-- CreateTable
CREATE TABLE "shipment_events" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reason" TEXT,
    "warehouse" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipment_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shipment_events_orderId_occurredAt_idx" ON "shipment_events"("orderId", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "shipment_events_orderId_type_status_occurredAt_key" ON "shipment_events"("orderId", "type", "status", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "orders_trackingCode_key" ON "orders"("trackingCode");

-- AddForeignKey
ALTER TABLE "shipment_events" ADD CONSTRAINT "shipment_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
