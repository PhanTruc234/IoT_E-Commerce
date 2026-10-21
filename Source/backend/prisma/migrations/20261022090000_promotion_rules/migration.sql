-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "excludeDiscounted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "listPrice" INTEGER,
ADD COLUMN     "priceSource" TEXT,
ADD COLUMN     "promotionId" TEXT,
ADD COLUMN     "promotionName" TEXT;

-- AlterTable
ALTER TABLE "promotions" ADD COLUMN     "forcePriority" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "promotion_excluded_products" (
    "promotionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "promotion_excluded_products_pkey" PRIMARY KEY ("promotionId","productId")
);

-- CreateIndex
CREATE INDEX "promotion_excluded_products_productId_idx" ON "promotion_excluded_products"("productId");

-- AddForeignKey
ALTER TABLE "promotion_excluded_products" ADD CONSTRAINT "promotion_excluded_products_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_excluded_products" ADD CONSTRAINT "promotion_excluded_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

