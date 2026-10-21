-- Sản phẩm không phân loại có variantId = NULL; mặc định Postgres coi các NULL là khác nhau nên unique cũ không chặn
-- được 2 dòng trùng khi bấm "Thêm vào giỏ" song song. Gộp các dòng trùng rồi tạo lại index với NULLS NOT DISTINCT (Postgres 15+).
WITH ranked AS (
    SELECT id,
           SUM(quantity) OVER (PARTITION BY "cartId", "productId", "variantId") AS total,
           ROW_NUMBER() OVER (PARTITION BY "cartId", "productId", "variantId" ORDER BY "createdAt", id) AS rn
    FROM "cart_items"
)
UPDATE "cart_items" c SET "quantity" = r.total FROM ranked r WHERE c.id = r.id AND r.rn = 1 AND c."quantity" <> r.total;

DELETE FROM "cart_items" c
USING (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY "cartId", "productId", "variantId" ORDER BY "createdAt", id) AS rn
    FROM "cart_items"
) d
WHERE c.id = d.id AND d.rn > 1;

DROP INDEX "cart_items_cartId_productId_variantId_key";
CREATE UNIQUE INDEX "cart_items_cartId_productId_variantId_key" ON "cart_items"("cartId", "productId", "variantId") NULLS NOT DISTINCT;
