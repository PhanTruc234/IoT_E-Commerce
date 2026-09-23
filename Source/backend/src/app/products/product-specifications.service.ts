import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductSpecItemDto } from './dto/set-product-specifications.dto';

@Injectable()
export class ProductSpecificationsService {
    constructor(private readonly prisma: PrismaService) { }

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
        return this.prisma.productSpecification.findMany({
            where: { productId },
            include: { specification: true },
            orderBy: { specification: { name: 'asc' } },
        });
    }
    async replace(productId: string, items: ProductSpecItemDto[]) {
        await this.ensureProduct(productId);

        const ids = items.map((i) => i.specificationId);
        if (new Set(ids).size !== ids.length) {
            throw new BadRequestException('Trùng thông số trong danh sách');
        }
        if (ids.length) {
            const count = await this.prisma.specification.count({ where: { id: { in: ids } } });
            if (count !== ids.length) {
                throw new BadRequestException('Có thông số không tồn tại');
            }
        }

        await this.prisma.$transaction([
            this.prisma.productSpecification.deleteMany({ where: { productId } }),
            ...(items.length
                ? [
                    this.prisma.productSpecification.createMany({
                        data: items.map((i) => ({
                            productId,
                            specificationId: i.specificationId,
                            value: i.value,
                        })),
                    }),
                ]
                : []),
        ]);
        return this.findAll(productId);
    }
}