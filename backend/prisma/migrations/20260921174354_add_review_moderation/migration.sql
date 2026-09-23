-- CreateEnum
CREATE TYPE "ReviewModerationReason" AS ENUM ('SPAM', 'OFFENSIVE', 'IRRELEVANT', 'FAKE', 'PERSONAL_INFO', 'OTHER');

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "moderationReason" "ReviewModerationReason",
ADD COLUMN     "orderId" TEXT,
ADD COLUMN     "verifiedPurchase" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
