import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ComboItemInputDto } from './dto/set-combo-items.dto';

@Injectable()
export class ComboItemsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(comboId: string) {
        const combo = await this.prisma.product.findUnique({
            where: { id: comboId },
            select: { id: true, price: true, salePrice: true },
        });
        if (!combo) throw new NotFoundException('Không tìm thấy sản phẩm');

        const items = await this.prisma.comboItem.findMany({
            where: { comboId },
            orderBy: { id: 'asc' },
            include: {
                component: {
                    select: {
                        id: true, name: true, slug: true, price: true, salePrice: true,
                        stockQuantity: true, status: true, type: true,
                        images: { where: { isPrimary: true }, take: 1, select: { imageUrl: true } },
                    },
                },
                variant: {
                    select: {
                        id: true, price: true, salePrice: true, stockQuantity: true, imageUrl: true,
                        options: {
                            select: { option: { select: { value: true, attribute: { select: { name: true } } } } },
                        },
                    },
                },
            },
        });

        const lines = items.map((i) => {
            const v = i.variant;
            const unitPrice = v ? (v.salePrice ?? v.price) : (i.component.salePrice ?? i.component.price);
            const stock = v ? v.stockQuantity : i.component.stockQuantity;
            const image = v?.imageUrl ?? i.component.images[0]?.imageUrl ?? null;
            const variantLabel = v
                ? v.options.map((o) => `${o.option.attribute.name}: ${o.option.value}`).join(', ')
                : null;
            return { i, unitPrice, stock, image, variantLabel };
        });

        const availableStock = lines.length
            ? Math.min(...lines.map((l) => Math.floor(l.stock / l.i.quantity)))
            : 0;
        const originalPrice = lines.reduce((sum, l) => sum + l.unitPrice * l.i.quantity, 0);
        const comboPrice = combo.salePrice ?? combo.price;

        return {
            comboPrice,
            originalPrice,
            saving: Math.max(0, originalPrice - comboPrice),
            availableStock,
            items: lines.map((l) => ({
                id: l.i.id,
                quantity: l.i.quantity,
                unitPrice: l.unitPrice,
                stock: l.stock,
                variantId: l.i.variantId,
                variantLabel: l.variantLabel,
                product: {
                    id: l.i.component.id,
                    name: l.i.component.name,
                    slug: l.i.component.slug,
                    image: l.image,
                },
            })),
        };
    }

    async replace(comboId: string, items: ComboItemInputDto[]) {
        const combo = await this.prisma.product.findUnique({
            where: { id: comboId },
            select: { id: true },
        });
        if (!combo) throw new NotFoundException('Không tìm thấy sản phẩm');

        const ids = items.map((i) => i.productId);
        if (ids.includes(comboId)) {
            throw new BadRequestException('Combo không thể chứa chính nó');
        }
        if (new Set(ids).size !== ids.length) {
            throw new BadRequestException('Sản phẩm thành phần bị trùng');
        }

        if (ids.length) {
            const variantCount = await this.prisma.productVariant.count({ where: { productId: comboId } });
            if (variantCount > 0) {
                throw new BadRequestException('Sản phẩm đang có biến thể, không thể đặt làm combo');
            }
            const comps = await this.prisma.product.findMany({
                where: { id: { in: ids } },
                select: { id: true, type: true, name: true },
            });
            if (comps.length !== ids.length) {
                throw new BadRequestException('Có sản phẩm thành phần không tồn tại');
            }
            const compMap = new Map(comps.map((c) => [c.id, c]));

            for (const it of items) {
                const c = compMap.get(it.productId)!;
                if (c.type === 'COMBO') {
                    throw new BadRequestException(`"${c.name}" là combo, không thể làm thành phần`);
                }
                if (c.type === 'VARIABLE') {
                    if (!it.variantId) {
                        throw new BadRequestException(`"${c.name}" có biến thể — cần chọn 1 biến thể cụ thể`);
                    }
                    const v = await this.prisma.productVariant.findFirst({
                        where: { id: it.variantId, productId: it.productId, isActive: true },
                        select: { id: true },
                    });
                    if (!v) {
                        throw new BadRequestException(`Biến thể của "${c.name}" không hợp lệ`);
                    }
                } else if (it.variantId) {
                    throw new BadRequestException(`"${c.name}" là sản phẩm đơn, không có biến thể`);
                }
            }
        }

        await this.prisma.$transaction([
            this.prisma.comboItem.deleteMany({ where: { comboId } }),
            ...(items.length
                ? [
                    this.prisma.comboItem.createMany({
                        data: items.map((i) => ({
                            comboId,
                            productId: i.productId,
                            variantId: i.variantId ?? null,
                            quantity: i.quantity,
                        })),
                    }),
                ]
                : []),
            this.prisma.product.update({
                where: { id: comboId },
                data: { type: items.length ? 'COMBO' : 'SIMPLE' },
            }),
        ]);

        return this.findAll(comboId);
    }
}