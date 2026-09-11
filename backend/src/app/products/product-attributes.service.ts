import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AttributeDto } from './dto/set-attributes.dto';

@Injectable()
export class ProductAttributesService {
    constructor(private readonly prisma: PrismaService) { }

    private async ensureProduct(productId: string) {
        const p = await this.prisma.product.findUnique({
            where: {
                id: productId
            },
            select: { id: true }
        });
        if (!p) {
            throw new NotFoundException('Không tìm thấy sản phẩm');
        }
    }

    async findAll(productId: string) {
        await this.ensureProduct(productId);
        return this.prisma.productAttribute.findMany({
            where: { productId },
            orderBy: { sortOrder: 'asc' },
            include: { options: { orderBy: { sortOrder: 'asc' } } },
        });
    }

    async replace(productId: string, attributes: AttributeDto[]) {
        await this.ensureProduct(productId);

        const names = attributes.map((a) => a.name.trim().toLowerCase());
        if (new Set(names).size !== names.length) {
            throw new BadRequestException('Tên thuộc tính bị trùng');
        }
        for (const a of attributes) {
            const vals = a.options.map((o) => o.value.trim().toLowerCase());
            if (new Set(vals).size !== vals.length) {
                throw new BadRequestException(`Giá trị trùng trong thuộc tính "${a.name}"`);
            }
        }

        await this.prisma.$transaction(async (tx) => {
            await tx.productVariant.deleteMany({ where: { productId } });
            await tx.productAttribute.deleteMany({ where: { productId } });

            for (let i = 0; i < attributes.length; i++) {
                const a = attributes[i];
                await tx.productAttribute.create({
                    data: {
                        productId,
                        name: a.name,
                        isVariant: a.isVariant,
                        sortOrder: i,
                        options: { create: a.options.map((o, j) => ({ value: o.value, sortOrder: j })) },
                    },
                });
            }

            const prod = await tx.product.findUnique({
                where: {
                    id: productId
                },
                select: { type: true }
            });
            if (prod?.type === 'VARIABLE') {
                await tx.product.update({ where: { id: productId }, data: { type: 'SIMPLE' } });
            }
        });

        return this.findAll(productId);
    }
}