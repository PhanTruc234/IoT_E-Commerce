-- AlterTable
ALTER TABLE "combo_items" ADD COLUMN     "variantId" TEXT;

-- AddForeignKey
ALTER TABLE "combo_items" ADD CONSTRAINT "combo_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
