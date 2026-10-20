-- CreateEnum
CREATE TYPE "PaymentTxnStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'EXPIRED');

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'VNPAY',
    "txnRef" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "PaymentTxnStatus" NOT NULL DEFAULT 'PENDING',
    "paymentUrl" TEXT NOT NULL DEFAULT '',
    "createDate" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "providerTxnNo" TEXT,
    "bankCode" TEXT,
    "responseCode" TEXT,
    "paidAt" TIMESTAMP(3),
    "needsRefund" BOOLEAN NOT NULL DEFAULT false,
    "checkedAt" TIMESTAMP(3),
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_txnRef_key" ON "payment_transactions"("txnRef");

-- CreateIndex
CREATE INDEX "payment_transactions_orderId_idx" ON "payment_transactions"("orderId");

-- CreateIndex
CREATE INDEX "payment_transactions_status_expiresAt_idx" ON "payment_transactions"("status", "expiresAt");

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Backfill: đơn VNPAY cũ dùng vnp_TxnRef = mã đơn → tạo 1 giao dịch tương ứng để IPN/QueryDR cũ vẫn khớp
INSERT INTO "payment_transactions" ("id", "orderId", "provider", "txnRef", "amount", "status", "createDate", "expiresAt", "paidAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    o."id",
    'VNPAY',
    o."code",
    o."total",
    CASE o."paymentStatus"
        WHEN 'PAID' THEN 'SUCCESS'::"PaymentTxnStatus"
        WHEN 'FAILED' THEN 'FAILED'::"PaymentTxnStatus"
        ELSE 'PENDING'::"PaymentTxnStatus"
    END,
    to_char(o."createdAt" + interval '7 hours', 'YYYYMMDDHH24MISS'),
    o."createdAt" + interval '15 minutes',
    o."paidAt",
    CURRENT_TIMESTAMP
FROM "orders" o
WHERE o."paymentMethod" = 'VNPAY';
