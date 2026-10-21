import { Injectable, NotFoundException } from '@nestjs/common';
import { DiscountType, PromotionScope } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

export interface PromoRule {
    id: string; name: string; discountType: DiscountType; value: number;
    maxDiscount: number | null; scope: PromotionScope;
    productIds: string[]; categoryIds: string[];
    priority: number;
    /** Ưu tiên bắt buộc: áp dù giá không thấp nhất */
    forcePriority: boolean;
    excludedProductIds: string[];
}

@Injectable()
export class PromotionsService {
    constructor(private readonly prisma: PrismaService) { }

    async getActive() {
        const now = new Date();
        const promos = await this.prisma.promotion.findMany({
            where: {
                isActive: true,
                AND: [
                    { OR: [{ startAt: null }, { startAt: { lte: now } }] },
                    { OR: [{ endAt: null }, { endAt: { gte: now } }] },
                ],
            },
            orderBy: { priority: 'desc' },
            include: {
                products: { select: { productId: true } },
                categories: { select: { categoryId: true, category: { select: { name: true } } } },
                excludedProducts: { select: { productId: true } },
            },
        });
        return promos.map((p) => ({
            id: p.id, name: p.name, description: p.description, bannerImage: p.bannerImage, linkUrl: p.linkUrl,
            discountType: p.discountType, value: p.value, maxDiscount: p.maxDiscount, scope: p.scope,
            priority: p.priority, forcePriority: p.forcePriority, startAt: p.startAt, endAt: p.endAt,
            productIds: p.products.map((x) => x.productId),
            excludedProductIds: p.excludedProducts.map((x) => x.productId),
            categoryIds: p.categories.map((x) => x.categoryId),
            // Tên danh mục để banner trang chủ ghi "Áp dụng: ..."
            categories: p.categories.map((x) => ({ id: x.categoryId, name: x.category.name })),
        }));
    }

    async getActiveRules(): Promise<PromoRule[]> {
        const promos = await this.getActive();
        return promos.map((p) => ({
            id: p.id, name: p.name, discountType: p.discountType, value: p.value,
            maxDiscount: p.maxDiscount, scope: p.scope, productIds: p.productIds, categoryIds: p.categoryIds,
            priority: p.priority, forcePriority: p.forcePriority, excludedProductIds: p.excludedProductIds,
        }));
    }

    async adminList() {
        const rows = await this.prisma.promotion.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { products: true, categories: true } },
                products: { select: { productId: true } },
                categories: { select: { categoryId: true } },
                excludedProducts: { select: { productId: true, product: { select: { name: true } } } },
            },
        });
        return rows.map((p) => ({
            ...p,
            productIds: p.products.map((x) => x.productId),
            categoryIds: p.categories.map((x) => x.categoryId),
            excludedProductIds: p.excludedProducts.map((x) => x.productId),
            excludedProducts: p.excludedProducts.map((x) => ({ id: x.productId, name: x.product.name })),
        }));
    }

    async adminCreate(dto: CreatePromotionDto) {
        const { productIds, categoryIds, excludedProductIds, startAt, endAt, ...rest } = dto;
        return this.prisma.promotion.create({
            data: {
                ...rest,
                startAt: startAt ? new Date(startAt) : undefined,
                endAt: endAt ? new Date(endAt) : undefined,
                products: productIds?.length ? { create: productIds.map((productId) => ({ productId })) } : undefined,
                categories: categoryIds?.length ? { create: categoryIds.map((categoryId) => ({ categoryId })) } : undefined,
                excludedProducts: excludedProductIds?.length ? { create: excludedProductIds.map((productId) => ({ productId })) } : undefined,
            },
        });
    }

    async adminUpdate(id: string, dto: UpdatePromotionDto) {
        const p = await this.prisma.promotion.findUnique({ where: { id } });
        if (!p) throw new NotFoundException('Không tìm thấy chương trình');
        const { productIds, categoryIds, excludedProductIds, startAt, endAt, ...rest } = dto;
        return this.prisma.$transaction(async (tx) => {
            if (excludedProductIds) {
                await tx.promotionExcludedProduct.deleteMany({ where: { promotionId: id } });
                if (excludedProductIds.length) {
                    await tx.promotionExcludedProduct.createMany({ data: excludedProductIds.map((productId) => ({ promotionId: id, productId })) });
                }
            }
            if (productIds) {
                await tx.promotionProduct.deleteMany({ where: { promotionId: id } });
                if (productIds.length) await tx.promotionProduct.createMany({ data: productIds.map((productId) => ({ promotionId: id, productId })) });
            }
            if (categoryIds) {
                await tx.promotionCategory.deleteMany({ where: { promotionId: id } });
                if (categoryIds.length) await tx.promotionCategory.createMany({ data: categoryIds.map((categoryId) => ({ promotionId: id, categoryId })) });
            }
            return tx.promotion.update({
                where: { id },
                data: { ...rest, startAt: startAt ? new Date(startAt) : undefined, endAt: endAt ? new Date(endAt) : undefined },
            });
        });
    }

    async adminRemove(id: string) {
        await this.prisma.promotion.delete({ where: { id } });
        return { deleted: true };
    }
}