import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WishlistService {
    constructor(private readonly prisma: PrismaService) { }

    async list(userId: string) {
        const rows = await this.prisma.wishlist.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                createdAt: true,
                product: {
                    select: {
                        id: true, name: true, slug: true, price: true, salePrice: true, status: true, stockQuantity: true,
                        images: { where: { isPrimary: true }, take: 1, select: { imageUrl: true } },
                    },
                },
            },
        });
        return rows.map((r) => ({
            addedAt: r.createdAt,
            id: r.product.id,
            name: r.product.name,
            slug: r.product.slug,
            price: r.product.price,
            salePrice: r.product.salePrice,
            status: r.product.status,
            stockQuantity: r.product.stockQuantity,
            image: r.product.images[0]?.imageUrl ?? null,
        }));
    }

    async ids(userId: string) {
        const rows = await this.prisma.wishlist.findMany({ where: { userId }, select: { productId: true } });
        return rows.map((r) => r.productId);
    }

    async add(userId: string, productId: string) {
        const product = await this.prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
        if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
        await this.prisma.wishlist.upsert({
            where: { userId_productId: { userId, productId } },
            create: { userId, productId },
            update: {},
        });
        return { added: true };
    }

    async remove(userId: string, productId: string) {
        await this.prisma.wishlist.deleteMany({ where: { userId, productId } });
        return { removed: true };
    }
}
