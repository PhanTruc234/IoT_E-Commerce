-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "announcedAt" TIMESTAMP(3),
ADD COLUMN     "claimEndAt" TIMESTAMP(3),
ADD COLUMN     "claimLimit" INTEGER,
ADD COLUMN     "claimStartAt" TIMESTAMP(3),
ADD COLUMN     "claimedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isFlashSale" BOOLEAN NOT NULL DEFAULT false;
