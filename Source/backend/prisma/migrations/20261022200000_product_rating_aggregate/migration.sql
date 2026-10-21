-- AlterTable
ALTER TABLE "products" ADD COLUMN     "ratingAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "ratingCount" INTEGER NOT NULL DEFAULT 0;


-- Điền sẵn từ các đánh giá đã duyệt hiện có
UPDATE "products" p
SET "ratingAvg" = ROUND(s.avg::numeric, 2)::double precision, "ratingCount" = s.cnt
FROM (
    SELECT "productId", AVG("rating") AS avg, COUNT(*)::int AS cnt
    FROM "reviews"
    WHERE "status" = 'APPROVED'
    GROUP BY "productId"
) s
WHERE p.id = s."productId";
