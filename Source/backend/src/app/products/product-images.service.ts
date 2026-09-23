import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ProductImage } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../core/storage/storage.service';

@Injectable()
export class ProductImagesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly storage: StorageService,
    ) { }

    private async ensureProduct(productId: string) {
        const p = await this.prisma.product.findUnique({
            where: { id: productId },
            select: { id: true },
        });
        if (!p) {
            throw new NotFoundException('Không tìm thấy sản phẩm');
        }
    }

    async findAll(productId: string) {
        await this.ensureProduct(productId);
        return this.prisma.productImage.findMany({
            where: { productId },
            orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        });
    }
    async attach(productId: string, imageUrls: string[]) {
        await this.ensureProduct(productId);
        let count = await this.prisma.productImage.count({ where: { productId } });
        const created: ProductImage[] = [];
        for (const url of imageUrls) {
            const img = await this.prisma.productImage.create({
                data: {
                    productId,
                    imageUrl: url,
                    sortOrder: count,
                    isPrimary: count === 0,
                },
            });
            created.push(img);
            count += 1;
        }
        return created;
    }

    async remove(productId: string, imageId: string) {
        const image = await this.prisma.productImage.findFirst({
            where: { id: imageId, productId },
        });
        if (!image) {
            throw new NotFoundException('Không tìm thấy ảnh');
        }

        await this.prisma.productImage.delete({ where: { id: imageId } });
        await this.storage.safeDeleteByUrl(image.imageUrl);
        if (image.isPrimary) {
            const next = await this.prisma.productImage.findFirst({
                where: { productId },
                orderBy: { sortOrder: 'asc' },
            });
            if (next) {
                await this.prisma.productImage.update({
                    where: { id: next.id },
                    data: { isPrimary: true },
                });
            }
        }
        return { message: 'Đã xóa ảnh' };
    }

    async setPrimary(productId: string, imageId: string) {
        const image = await this.prisma.productImage.findFirst({
            where: { id: imageId, productId },
        });
        if (!image) {
            throw new NotFoundException('Không tìm thấy ảnh');
        }

        await this.prisma.$transaction([
            this.prisma.productImage.updateMany({
                where: { productId },
                data: { isPrimary: false },
            }),
            this.prisma.productImage.update({
                where: { id: imageId },
                data: { isPrimary: true },
            }),
        ]);
        return { message: 'Đã đặt ảnh chính' };
    }

    async reorder(productId: string, imageIds: string[]) {
        const images = await this.prisma.productImage.findMany({
            where: { productId },
            select: { id: true },
        });
        const ownIds = new Set(images.map((i) => i.id));
        if (imageIds.length !== images.length || !imageIds.every((id) => ownIds.has(id))) {
            throw new BadRequestException('Danh sách ảnh không khớp với sản phẩm');
        }
        await this.prisma.$transaction(
            imageIds.map((id, index) =>
                this.prisma.productImage.update({ where: { id }, data: { sortOrder: index } }),
            ),
        );
        return this.findAll(productId);
    }
}