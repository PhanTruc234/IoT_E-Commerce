-- CreateEnum
CREATE TYPE "InvoiceBuyerType" AS ENUM ('PERSONAL', 'COMPANY');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'ISSUED', 'REJECTED');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "pricesIncludeTax" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "taxAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "taxRate" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "tax_settings" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "rate" DOUBLE PRECISION NOT NULL DEFAULT 8,
    "pricesIncludeTax" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_requests" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "buyerType" "InvoiceBuyerType" NOT NULL DEFAULT 'PERSONAL',
    "buyerName" TEXT NOT NULL,
    "taxCode" TEXT,
    "address" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "note" TEXT,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "invoiceNumber" TEXT,
    "adminNote" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invoice_requests_orderId_key" ON "invoice_requests"("orderId");

-- CreateIndex
CREATE INDEX "invoice_requests_status_createdAt_idx" ON "invoice_requests"("status", "createdAt");

-- CreateIndex
CREATE INDEX "invoice_requests_userId_idx" ON "invoice_requests"("userId");

-- AddForeignKey
ALTER TABLE "invoice_requests" ADD CONSTRAINT "invoice_requests_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_requests" ADD CONSTRAINT "invoice_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Cài đặt mặc định: bật VAT 8%, giá đã gồm VAT (admin sửa được trong trang Thuế)
INSERT INTO "tax_settings" ("id", "enabled", "rate", "pricesIncludeTax", "updatedAt")
VALUES (gen_random_uuid()::text, true, 8, true, CURRENT_TIMESTAMP);
