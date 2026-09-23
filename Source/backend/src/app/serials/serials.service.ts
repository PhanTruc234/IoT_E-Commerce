import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { buildMeta } from '../../core/utils/pagination.util';
import { CreateSerialsDto } from './dto/create-serials.dto';
import { ActivateSerialDto } from './dto/activate-serial.dto';
import { SerialListQueryDto } from './dto/serial-list-query.dto';
import { GenerateSerialsDto } from './dto/generate-serials.dto';

type WarrantyState = 'INACTIVE' | 'ACTIVE' | 'EXPIRED';

function computeState(activatedAt: Date | null, warrantyEndAt: Date | null): { state: WarrantyState; daysRemaining: number | null } {
    if (!activatedAt || !warrantyEndAt) return { state: 'INACTIVE', daysRemaining: null };
    const now = Date.now();
    if (now <= warrantyEndAt.getTime()) {
        return { state: 'ACTIVE', daysRemaining: Math.ceil((warrantyEndAt.getTime() - now) / 86_400_000) };
    }
    return { state: 'EXPIRED', daysRemaining: 0 };
}

const VARIANT_INCLUDE = {
    options: { select: { option: { select: { value: true, attribute: { select: { name: true } } } } } },
};
function variantLabel(variant: { options: { option: { value: string; attribute: { name: string } } }[] } | null): string | null {
    if (!variant) return null;
    return variant.options.map((o) => `${o.option.attribute.name}: ${o.option.value}`).join(', ');
}

@Injectable()
export class SerialsService {
    constructor(private readonly prisma: PrismaService) { }

    async createBulk(dto: CreateSerialsDto) {
        const product = await this.prisma.product.findUnique({ where: { id: dto.productId }, select: { id: true } });
        if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
        if (dto.variantId) {
            const v = await this.prisma.productVariant.findFirst({ where: { id: dto.variantId, productId: dto.productId }, select: { id: true } });
            if (!v) throw new BadRequestException('Biến thể không thuộc sản phẩm này');
        }

        const codes = [...new Set(dto.codes.map((c) => c.trim()).filter(Boolean))];
        if (!codes.length) throw new BadRequestException('Danh sách serial trống');

        const existed = await this.prisma.serial.findMany({ where: { code: { in: codes } }, select: { code: true } });
        if (existed.length) {
            throw new ConflictException(`Serial đã tồn tại: ${existed.map((e) => e.code).join(', ')}`);
        }

        const warrantyMonths = dto.warrantyMonths ?? 12;
        await this.prisma.serial.createMany({
            data: codes.map((code) => ({ code, productId: dto.productId, variantId: dto.variantId ?? null, warrantyMonths })),
        });
        return { created: codes.length };
    }

    async findAllAdmin(query: SerialListQueryDto) {
        const { page, limit, search, productId, variantId, status } = query;
        const where: Prisma.SerialWhereInput = {
            ...(productId ? { productId } : {}),
            ...(variantId ? { variantId } : {}),
            ...(status ? { status } : {}),
            ...(search ? { code: { contains: search, mode: 'insensitive' } } : {}),
        };
        const [rows, total] = await this.prisma.$transaction([
            this.prisma.serial.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    product: { select: { name: true, sku: true } },
                    variant: { select: VARIANT_INCLUDE },
                    order: { select: { code: true } },
                },
            }),
            this.prisma.serial.count({ where }),
        ]);
        const data = rows.map((s) => ({
            id: s.id, code: s.code, productName: s.product.name, sku: s.product.sku,
            variantLabel: variantLabel(s.variant),
            status: s.status, warrantyMonths: s.warrantyMonths, activatedAt: s.activatedAt, warrantyEndAt: s.warrantyEndAt,
            ownerName: s.ownerName, ownerPhone: s.ownerPhone, orderId: s.orderId, orderCode: s.order?.code ?? null,
            createdAt: s.createdAt,
            ...computeState(s.activatedAt, s.warrantyEndAt),
        }));
        return { data, meta: buildMeta(total, page, limit) };
    }

    async activate(id: string, dto: ActivateSerialDto) {
        const serial = await this.prisma.serial.findUnique({ where: { id } });
        if (!serial) throw new NotFoundException('Không tìm thấy serial');
        const start = dto.activatedAt ? new Date(dto.activatedAt) : new Date();
        const end = new Date(start);
        end.setMonth(end.getMonth() + serial.warrantyMonths);
        return this.prisma.serial.update({
            where: { id },
            data: {
                status: 'ACTIVATED',
                activatedAt: start,
                warrantyEndAt: end,
                ownerName: dto.ownerName,
                ownerPhone: dto.ownerPhone,
                ownerUserId: dto.ownerUserId,
            },
        });
    }

    async remove(id: string) {
        const serial = await this.prisma.serial.findUnique({ where: { id }, select: { id: true } });
        if (!serial) throw new NotFoundException('Không tìm thấy serial');
        await this.prisma.serial.delete({ where: { id } });
        return { message: 'Đã xoá serial' };
    }

    async lookup(codeRaw?: string) {
        const code = (codeRaw ?? '').trim();
        if (!code) throw new BadRequestException('Vui lòng nhập số serial');
        const serial = await this.prisma.serial.findUnique({
            where: { code },
            include: {
                product: { select: { name: true, slug: true, images: { where: { isPrimary: true }, take: 1, select: { imageUrl: true } } } },
                variant: { select: { ...VARIANT_INCLUDE, imageUrl: true } },
            },
        });
        if (!serial) return { found: false as const };
        return {
            found: true as const,
            code: serial.code,
            product: { name: serial.product.name, slug: serial.product.slug, image: serial.variant?.imageUrl ?? serial.product.images[0]?.imageUrl ?? null },
            variantLabel: variantLabel(serial.variant),
            warrantyMonths: serial.warrantyMonths,
            activatedAt: serial.activatedAt,
            warrantyEndAt: serial.warrantyEndAt,
            ...computeState(serial.activatedAt, serial.warrantyEndAt),
        };
    }
    async summary(productId: string, variantId?: string) {
        const product = await this.prisma.product.findUnique({ where: { id: productId }, select: { stockQuantity: true } });
        if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
        let stock = product.stockQuantity;
        if (variantId) {
            const v = await this.prisma.productVariant.findFirst({ where: { id: variantId, productId }, select: { stockQuantity: true } });
            if (!v) throw new BadRequestException('Biến thể không thuộc sản phẩm này');
            stock = v.stockQuantity;
        }
        const existing = await this.prisma.serial.count({ where: { productId, variantId: variantId ?? null } });
        return { stock, existing, suggested: Math.max(0, stock - existing) };
    }

    async generate(dto: GenerateSerialsDto) {
        const product = await this.prisma.product.findUnique({ where: { id: dto.productId }, select: { sku: true } });
        if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');

        let base = product.sku;
        if (dto.variantId) {
            const v = await this.prisma.productVariant.findFirst({ where: { id: dto.variantId, productId: dto.productId }, select: { sku: true } });
            if (!v) throw new BadRequestException('Biến thể không thuộc sản phẩm này');
            base = v.sku;
        }
        base = base.toUpperCase();

        const used = await this.prisma.serial.findMany({ where: { code: { startsWith: `${base}-` } }, select: { code: true } });
        let max = 0;
        for (const s of used) {
            const n = parseInt(s.code.slice(base.length + 1), 10);
            if (!isNaN(n) && n > max) max = n;
        }

        const warrantyMonths = dto.warrantyMonths ?? 12;
        const data = Array.from({ length: dto.quantity }, (_, i) => ({
            code: `${base}-${String(max + i + 1).padStart(5, '0')}`,
            productId: dto.productId,
            variantId: dto.variantId ?? null,
            warrantyMonths,
        }));
        await this.prisma.serial.createMany({ data, skipDuplicates: true });
        return { created: data.length };
    }

}