import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';

type CartLineOut = {
    id: string;
    productId: string;
    variantId: string | null;
    quantity: number;
    name: string;
    slug: string;
    image: string | null;
    unitPrice: number;
    variantLabel: string | null;
    stock: number;
    lineTotal: number;
    available: boolean;
};
@Injectable()
export class CartService {
    constructor(private readonly prisma: PrismaService) { }

    // upsert theo userId (unique) → 2 request đầu tiên cùng lúc không tạo 2 giỏ / không lỗi 500
    private getOrCreate(userId: string) {
        return this.prisma.cart.upsert({ where: { userId }, create: { userId }, update: {}, select: { id: true } });
    }

    /**
     * Cộng số lượng vào dòng giỏ, tạo dòng nếu chưa có. Bấm "Thêm vào giỏ" 2 lần cùng lúc: request tạo sau
     * nhận P2002 (unique NULLS NOT DISTINCT) rồi cộng vào dòng vừa tạo, không sinh dòng trùng.
     */
    private async addQuantity(key: { cartId: string; productId: string; variantId: string | null }, qty: number, stock: number) {
        let item = await this.prisma.cartItem.findFirst({ where: key, select: { id: true } });
        if (!item) {
            try {
                await this.prisma.cartItem.create({ data: { ...key, quantity: Math.min(qty, stock) } });
                return;
            } catch (e) {
                if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')) throw e;
                item = await this.prisma.cartItem.findFirstOrThrow({ where: key, select: { id: true } });
            }
        }
        // Cộng ngay trong câu UPDATE (không đọc-rồi-ghi) → 2 lần thêm cùng lúc không mất lượt nào; vượt tồn kho thì kéo về
        const updated = await this.prisma.cartItem.update({ where: { id: item.id }, data: { quantity: { increment: qty } }, select: { quantity: true } });
        if (updated.quantity > stock) {
            await this.prisma.cartItem.updateMany({ where: { id: item.id, quantity: { gt: stock } }, data: { quantity: stock } });
        }
    }

    private async comboAvailableStock(comboId: string): Promise<number> {
        const items = await this.prisma.comboItem.findMany({
            where: { comboId },
            select: {
                quantity: true,
                component: { select: { stockQuantity: true } },
                variant: { select: { stockQuantity: true } },
            },
        });
        if (!items.length) return 0;
        return Math.min(...items.map((i) => Math.floor((i.variant?.stockQuantity ?? i.component.stockQuantity) / i.quantity)));
    }

    async getCart(userId: string) {
        const cart = await this.getOrCreate(userId);
        const items = await this.prisma.cartItem.findMany({
            where: { cartId: cart.id },
            orderBy: { createdAt: 'asc' },
            include: {
                product: {
                    select: {
                        id: true, name: true, slug: true, price: true, salePrice: true,
                        stockQuantity: true, status: true, type: true,
                        images: { where: { isPrimary: true }, take: 1, select: { imageUrl: true } },
                    },
                },
                variant: {
                    select: {
                        id: true, price: true, salePrice: true, stockQuantity: true, imageUrl: true, isActive: true,
                        options: { select: { option: { select: { value: true, attribute: { select: { name: true } } } } } },
                    },
                },
            },
        });

        const lines: CartLineOut[] = [];
        for (const it of items) {
            const v = it.variant;
            const unitPrice = v ? (v.salePrice ?? v.price) : (it.product.salePrice ?? it.product.price);
            let stock: number;
            if (v) {
                stock = v.stockQuantity;
            } else if (it.product.type === 'COMBO') {
                stock = await this.comboAvailableStock(it.product.id);
            }
            else stock = it.product.stockQuantity;
            const variantLabel = v
                ? v.options.map((o) => `${o.option.attribute.name}: ${o.option.value}`).join(', ')
                : null;
            lines.push({
                id: it.id,
                productId: it.productId,
                variantId: it.variantId,
                quantity: it.quantity,
                name: it.product.name,
                slug: it.product.slug,
                image: v?.imageUrl ?? it.product.images[0]?.imageUrl ?? null,
                unitPrice,
                variantLabel,
                stock,
                lineTotal: unitPrice * it.quantity,
                available: it.product.status === 'ACTIVE' && stock > 0,
            });
        }

        return {
            id: cart.id,
            items: lines,
            itemCount: lines.reduce((s, l) => s + l.quantity, 0),
            subtotal: lines.reduce((s, l) => s + l.lineTotal, 0),
        };
    }

    async addItem(userId: string, dto: AddCartItemDto) {
        const cart = await this.getOrCreate(userId);
        const product = await this.prisma.product.findUnique({
            where: { id: dto.productId },
            select: { id: true, type: true, status: true, stockQuantity: true },
        });
        if (!product || product.status !== 'ACTIVE') {
            throw new BadRequestException('Sản phẩm không khả dụng');
        }

        let variantId = dto.variantId ?? null;
        let stock: number;
        if (product.type === 'VARIABLE') {
            if (!variantId) {
                throw new BadRequestException('Vui lòng chọn phân loại sản phẩm');
            }
            const v = await this.prisma.productVariant.findFirst({
                where: { id: variantId, productId: product.id, isActive: true },
                select: { stockQuantity: true },
            });
            if (!v) {
                throw new BadRequestException('Phân loại không hợp lệ');
            }
            stock = v.stockQuantity;
        } else {
            if (variantId) {
                throw new BadRequestException('Sản phẩm này không có phân loại');
            }
            variantId = null;
            stock = product.type === 'COMBO' ? await this.comboAvailableStock(product.id) : product.stockQuantity;
        }
        if (stock <= 0) throw new BadRequestException('Sản phẩm đã hết hàng');

        await this.addQuantity({ cartId: cart.id, productId: product.id, variantId }, dto.quantity, stock);
        return this.getCart(userId);
    }

    async updateItem(userId: string, itemId: string, quantity: number) {
        const cart = await this.getOrCreate(userId);
        const item = await this.prisma.cartItem.findFirst({
            where: { id: itemId, cartId: cart.id },
            include: { product: { select: { type: true, stockQuantity: true } }, variant: { select: { stockQuantity: true } } },
        });
        if (!item) throw new NotFoundException('Không tìm thấy mục giỏ hàng');

        const stock = item.variant
            ? item.variant.stockQuantity
            : item.product.type === 'COMBO'
                ? await this.comboAvailableStock(item.productId)
                : item.product.stockQuantity;
        const q = Math.max(1, Math.min(quantity, Math.max(1, stock)));

        await this.prisma.cartItem.update({ where: { id: itemId }, data: { quantity: q } });
        return this.getCart(userId);
    }

    async removeItem(userId: string, itemId: string) {
        const cart = await this.getOrCreate(userId);
        await this.prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
        return this.getCart(userId);
    }

    async clear(userId: string) {
        const cart = await this.getOrCreate(userId);
        await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        return this.getCart(userId);
    }
}