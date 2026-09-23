-- CreateEnum
CREATE TYPE "UserEventType" AS ENUM ('VIEW_PRODUCT', 'SEARCH', 'ADD_TO_CART', 'VIEW_CATEGORY');

-- CreateTable
CREATE TABLE "user_events" (
    "id" TEXT NOT NULL,
    "type" "UserEventType" NOT NULL,
    "userId" TEXT,
    "productId" TEXT,
    "categoryId" TEXT,
    "keyword" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_events_type_createdAt_idx" ON "user_events"("type", "createdAt");

-- CreateIndex
CREATE INDEX "user_events_createdAt_idx" ON "user_events"("createdAt");
