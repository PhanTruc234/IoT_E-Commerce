import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { buildMeta } from '../../core/utils/pagination.util';
import { CreateSpecificationDto } from './dto/create-specification.dto';
import { UpdateSpecificationDto } from './dto/update-specification.dto';
import { SpecificationListQueryDto } from './dto/specification-list-query.dto';

@Injectable()
export class SpecificationsService {
    constructor(private readonly prisma: PrismaService) { }

    private async ensureNameUnique(name: string, excludeId?: string) {
        const existing = await this.prisma.specification.findUnique({ where: { name } });
        if (existing && existing.id !== excludeId) {
            throw new ConflictException(`Thông số "${name}" đã tồn tại`);
        }
    }

    async create(dto: CreateSpecificationDto) {
        await this.ensureNameUnique(dto.name);
        return this.prisma.specification.create({
            data: { name: dto.name, unit: dto.unit, dataType: dto.dataType },
        });
    }

    async update(id: string, dto: UpdateSpecificationDto) {
        const spec = await this.prisma.specification.findUnique({ where: { id } });
        if (!spec) {
            throw new NotFoundException('Không tìm thấy thông số');
        }
        if (dto.name && dto.name !== spec.name) {
            await this.ensureNameUnique(dto.name, id);
        }
        return this.prisma.specification.update({ where: { id }, data: dto });
    }

    async remove(id: string) {
        const spec = await this.prisma.specification.findUnique({
            where: { id },
            include: { _count: { select: { productValues: true } } },
        });
        if (!spec) {
            throw new NotFoundException('Không tìm thấy thông số');
        }
        if (spec._count.productValues > 0) {
            throw new ConflictException('Không thể xóa: thông số đang được dùng ở sản phẩm');
        }
        await this.prisma.specification.delete({ where: { id } });
        return { message: 'Đã xóa thông số' };
    }

    async findAll(query: SpecificationListQueryDto) {
        const { page, limit, search } = query;
        const where: Prisma.SpecificationWhereInput = search
            ? { name: { contains: search, mode: 'insensitive' } }
            : {};
        const [data, total] = await this.prisma.$transaction([
            this.prisma.specification.findMany({
                where,
                orderBy: { name: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.specification.count({ where }),
        ]);
        return { data, meta: buildMeta(total, page, limit) };
    }
}