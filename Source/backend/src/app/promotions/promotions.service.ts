import { Injectable, NotFoundException } from '@nestjs/common';
import { DiscountType, PromotionScope } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

export interface PromoRule {
    id: string; name: string; discountType: DiscountType; value: number;
    maxDiscount: number | null; scope: PromotionScope;
    productIds: string[]; categoryIds: string[];
}

export function applyPromotions(rules: PromoRule[], productId: string, categoryId: string | null, base: number): number {
    let best = base;
    for (const r of rules) {
        const match = r.scope === 'ALL'
            || (r.scope === 'PRODUCT' && r.productIds.includes(productId))
            || (r.scope === 'CATEGORY' && !!categoryId && r.categoryIds.includes(categoryId));
        if (!match) continue;
        let cand = r.discountType === 'PERCENT' ? base - Math.floor((base * r.value) / 100) : base - r.value;
        if (r.discountType === 'PERCENT' && r.maxDiscount != null) cand = Math.max(cand, base - r.maxDiscount);
        cand = Math.max(0, cand);
        if (cand < best) best = cand;
    }
    return best;
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
            include: { products: { select: { productId: true } }, categories: { select: { categoryId: true } } },
        });
        return promos.map((p) => ({
            id: p.id, name: p.name, description: p.description, bannerImage: p.bannerImage, linkUrl: p.linkUrl,
            discountType: p.discountType, value: p.value, maxDiscount: p.maxDiscount, scope: p.scope,
            priority: p.priority, endAt: p.endAt,
            productIds: p.products.map((x) => x.productId),
            categoryIds: p.categories.map((x) => x.categoryId),
        }));
    }

    async getActiveRules(): Promise<PromoRule[]> {
        const promos = await this.getActive();
        return promos.map((p) => ({
            id: p.id, name: p.name, discountType: p.discountType, value: p.value,
            maxDiscount: p.maxDiscount, scope: p.scope, productIds: p.productIds, categoryIds: p.categoryIds,
        }));
    }

    async adminList() {
        const rows = await this.prisma.promotion.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { products: true, categories: true } },
                products: { select: { productId: true } },
                categories: { select: { categoryId: true } },
            },
        });
        return rows.map((p) => ({
            ...p,
            productIds: p.products.map((x) => x.productId),
            categoryIds: p.categories.map((x) => x.categoryId),
        }));
    }

    async adminCreate(dto: CreatePromotionDto) {
        const { productIds, categoryIds, startAt, endAt, ...rest } = dto;
        return this.prisma.promotion.create({
            data: {
                ...rest,
                startAt: startAt ? new Date(startAt) : undefined,
                endAt: endAt ? new Date(endAt) : undefined,
                products: productIds?.length ? { create: productIds.map((productId) => ({ productId })) } : undefined,
                categories: categoryIds?.length ? { create: categoryIds.map((categoryId) => ({ categoryId })) } : undefined,
            },
        });
    }

    async adminUpdate(id: string, dto: UpdatePromotionDto) {
        const p = await this.prisma.promotion.findUnique({ where: { id } });
        if (!p) throw new NotFoundException('Không tìm thấy chương trình');
        const { productIds, categoryIds, startAt, endAt, ...rest } = dto;
        return this.prisma.$transaction(async (tx) => {
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