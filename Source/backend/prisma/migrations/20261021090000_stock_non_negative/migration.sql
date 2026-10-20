-- Tồn kho không bao giờ được âm: lớp chặn cuối ở database (Prisma schema không biểu diễn được CHECK).
-- Dòng đã âm do bán vượt trước đây được đưa về 0 để thêm ràng buộc.
UPDATE "products" SET "stockQuantity" = 0 WHERE "stockQuantity" < 0;
UPDATE "product_variants" SET "stockQuantity" = 0 WHERE "stockQuantity" < 0;

ALTER TABLE "products" ADD CONSTRAINT "products_stockQuantity_non_negative" CHECK ("stockQuantity" >= 0);
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_stockQuantity_non_negative" CHECK ("stockQuantity" >= 0);
