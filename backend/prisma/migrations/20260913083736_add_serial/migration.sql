-- CreateEnum
CREATE TYPE "SerialStatus" AS ENUM ('IN_STOCK', 'ACTIVATED');

-- CreateTable
CREATE TABLE "serials" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "status" "SerialStatus" NOT NULL DEFAULT 'IN_STOCK',
    "warrantyMonths" INTEGER NOT NULL DEFAULT 12,
    "activatedAt" TIMESTAMP(3),
    "warrantyEndAt" TIMESTAMP(3),
    "ownerName" TEXT,
    "ownerPhone" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "serials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "serials_code_key" ON "serials"("code");

-- CreateIndex
CREATE INDEX "serials_productId_idx" ON "serials"("productId");

-- AddForeignKey
ALTER TABLE "serials" ADD CONSTRAINT "serials_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serials" ADD CONSTRAINT "serials_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
