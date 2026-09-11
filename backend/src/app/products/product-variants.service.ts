import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { buildSku } from '../../core/utils/sku.util';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

const VARIANT_INCLUDE = {
    options: { include: { option: { include: { attribute: true } } } },
} satisfies Prisma.ProductVariantInclude;

@Injectable()
export class ProductVariantsService {
    constructor(private readonly prisma: PrismaService) { }

    private async getProduct(productId: string) {
        const p = await this.prisma.product.findUnique({ where: { id: productId } });
        if (!p) {
            throw new NotFoundException('Không tìm thấy sản phẩm');
        }
        return p;
    }

    async findAll(productId: string) {
        await this.getProduct(productId);
        return this.prisma.productVariant.findMany({
            where: { productId },
            orderBy: { createdAt: 'asc' },
            include: VARIANT_INCLUDE,
        });
    }

    private async getVariantAttributes(productId: string) {
        return this.prisma.productAttribute.findMany({
            where: { productId, isVariant: true },
            orderBy: { sortOrder: 'asc' },
            include: {
                options:
                {
                    orderBy: {
                        sortOrder: 'asc'
                    }
                }
            },
        });
    }

    private async buildVariantSku(baseSku: string, orderedValues: string[], excludeId?: string) {
        const sku = buildSku([baseSku, ...orderedValues]) || baseSku;
        const existing = await this.prisma.productVariant.findUnique({ where: { sku } });
        if (existing && existing.id !== excludeId) {
            throw new BadRequestException("SKU đã tồn tại")
        }
        return sku
    }

    private cartesian<T>(arrays: T[][]): T[][] {
        return arrays.reduce<T[][]>(
            (acc, curr) => acc.flatMap((combo) => curr.map((item) => [...combo, item])),
            [[]],
        );
    }
    async generate(productId: string) {
        const product = await this.getProduct(productId);
        const attrs = await this.getVariantAttributes(productId);
        if (attrs.length === 0) {
            throw new BadRequestException('Chưa có thuộc tính nào được đánh dấu tạo biến thể');
        }
        if (attrs.some((a) => a.options.length === 0)) {
            throw new BadRequestException('Có thuộc tính chưa có giá trị');
        }

        const combos = this.cartesian(attrs.map((a) => a.options));

        const existing = await this.prisma.productVariant.findMany({
            where: { productId },
            include: {
                options: {
                    select: {
                        optionId: true
                    }
                }
            },
        });
        const existingSig = new Set(
            existing.map((v) => v.options.map((o) => o.optionId).sort().join('|')),
        );

        let created = 0;
        for (const combo of combos) {
            const sig = combo.map((o) => o.id).sort().join('|');
            if (existingSig.has(sig)) {
                continue;
            }
            const values = combo.map((o) => o.value);
            const sku = await this.buildVariantSku(product.sku, values);
            await this.prisma.productVariant.create({
                data: {
                    productId,
                    sku,
                    price: product.price,
                    salePrice: product.salePrice,
                    stockQuantity: 0,
                    options: { create: combo.map((o) => ({ optionId: o.id })) },
                },
            });
            created += 1;
        }

        if (product.type !== 'VARIABLE') {
            await this.prisma.product.update({ where: { id: productId }, data: { type: 'VARIABLE' } });
        }
        return { created, variants: await this.findAll(productId) };
    }

    async create(productId: string, dto: CreateVariantDto) {
        const product = await this.getProduct(productId);
        const attrs = await this.getVariantAttributes(productId);
        if (attrs.length === 0) {
            throw new BadRequestException('Sản phẩm chưa có thuộc tính biến thể');
        }

        const optionsById = new Map<string, { attributeId: string; value: string; sortAttr: number }>();
        attrs.forEach((a, ai) =>
            a.options.forEach((o) => optionsById.set(o.id, { attributeId: a.id, value: o.value, sortAttr: ai })),
        );

        const chosen = dto.optionIds.map((id) => {
            const info = optionsById.get(id);
            if (!info) {
                throw new BadRequestException('Option không hợp lệ hoặc không thuộc SP');
            }
            return { id, ...info };
        });

        const attrSet = new Set(chosen.map((c) => c.attributeId));
        if (attrSet.size !== chosen.length) {
            throw new BadRequestException('Mỗi thuộc tính chỉ được chọn 1 giá trị');
        }
        if (attrSet.size !== attrs.length) {
            throw new BadRequestException('Phải chọn đủ giá trị cho tất cả thuộc tính biến thể');
        }

        const sig = chosen.map((c) => c.id).sort().join('|');
        const existing = await this.prisma.productVariant.findMany({
            where: { productId },
            include: {
                options: {
                    select: {
                        optionId: true
                    }
                }
            },
        });
        if (existing.some((v) => v.options.map((o) => o.optionId).sort().join('|') === sig)) {
            throw new BadRequestException('Tổ hợp biến thể này đã tồn tại');
        }

        if (dto.salePrice != null) {
            const price = dto.price ?? product.price;
            if (dto.salePrice > price) {
                throw new BadRequestException('Giá khuyến mãi phải ≤ giá');
            }
        }

        const orderedValues = [...chosen].sort((a, b) => a.sortAttr - b.sortAttr).map((c) => c.value);
        const sku = await this.buildVariantSku(product.sku, orderedValues);

        const variant = await this.prisma.productVariant.create({
            data: {
                productId,
                sku,
                price: dto.price ?? product.price,
                salePrice: dto.salePrice,
                stockQuantity: dto.stockQuantity ?? 0,
                imageUrl: dto.imageUrl,
                options: { create: chosen.map((c) => ({ optionId: c.id })) },
            },
            include: VARIANT_INCLUDE,
        });

        if (product.type !== 'VARIABLE') {
            await this.prisma.product.update({ where: { id: productId }, data: { type: 'VARIABLE' } });
        }
        return variant;
    }

    async update(productId: string, variantId: string, dto: UpdateVariantDto) {
        const variant = await this.prisma.productVariant.findFirst({ where: { id: variantId, productId } });
        if (!variant) {
            throw new NotFoundException('Không tìm thấy biến thể');
        }

        const price = dto.price ?? variant.price;
        const salePrice = dto.salePrice !== undefined ? dto.salePrice : variant.salePrice;
        if (salePrice != null && salePrice > price) {
            throw new BadRequestException('Giá khuyến mãi phải ≤ giá');
        }

        return this.prisma.productVariant.update({
            where: { id: variantId },
            data: {
                price: dto.price,
                salePrice: dto.salePrice,
                stockQuantity: dto.stockQuantity,
                imageUrl: dto.imageUrl,
                isActive: dto.isActive,
            },
            include: VARIANT_INCLUDE,
        });
    }

    async remove(productId: string, variantId: string) {
        const variant = await this.prisma.productVariant.findFirst({ where: { id: variantId, productId } });
        if (!variant) {
            throw new NotFoundException('Không tìm thấy biến thể');
        }
        await this.prisma.productVariant.delete({ where: { id: variantId } });

        const remaining = await this.prisma.productVariant.count({ where: { productId } });
        if (remaining === 0) {
            await this.prisma.product.update({ where: { id: productId }, data: { type: 'SIMPLE' } });
        }
        return { message: 'Đã xóa biến thể' };
    }
}