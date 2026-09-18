-- AlterTable
ALTER TABLE "serials" ADD COLUMN     "orderId" TEXT;

-- AddForeignKey
ALTER TABLE "serials" ADD CONSTRAINT "serials_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
