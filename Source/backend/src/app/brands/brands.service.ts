import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { buildMeta } from '../../core/utils/pagination.util';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandListQueryDto } from './dto/brand-list-query.dto';
import { createSlug } from 'src/core/utils/slug.util';
import { StorageService } from 'src/core/storage/storage.service';

@Injectable()
export class BrandsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly storage: StorageService,
    ) { }

    private async generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
        const slug = createSlug(name) || 'thuong-hieu';
        const existing = await this.prisma.brand.findUnique({ where: { slug } });
        if (existing && existing.id !== excludeId) {
            throw new ConflictException(`Thương hiệu "${name}" (slug: ${slug}) đã tồn tại`);
        }
        return slug;
    }

    async create(dto: CreateBrandDto) {
        const slug = await this.generateUniqueSlug(dto.name);
        return this.prisma.brand.create({
            data: {
                name: dto.name,
                slug,
                logoUrl: dto.logoUrl,
                isActive: dto.isActive ?? true,
            },
        });
    }

    async update(id: string, dto: UpdateBrandDto) {
        const brand = await this.prisma.brand.findUnique({ where: { id } });
        if (!brand) {
            throw new NotFoundException('Không tìm thấy thương hiệu');
        }

        const data: Prisma.BrandUpdateInput = { isActive: dto.isActive };

        if (dto.name && dto.name !== brand.name) {
            data.name = dto.name;
            data.slug = await this.generateUniqueSlug(dto.name, id);
        }
        if (dto.logoUrl !== undefined) {
            data.logoUrl = dto.logoUrl;
        }

        const updated = await this.prisma.brand.update({ where: { id }, data });
        if (dto.logoUrl !== undefined && dto.logoUrl !== brand.logoUrl) {
            await this.storage.safeDeleteByUrl(brand.logoUrl);
        }
        return updated;
    }

    async remove(id: string) {
        const brand = await this.prisma.brand.findUnique({ where: { id } });
        if (!brand) {
            throw new NotFoundException('Không tìm thấy thương hiệu');
        }
        await this.prisma.brand.delete({ where: { id } });
        await this.storage.safeDeleteByUrl(brand.logoUrl);
        return { message: 'Đã xóa thương hiệu' };
    }

    async findOne(id: string) {
        const brand = await this.prisma.brand.findUnique({ where: { id } });
        if (!brand) {
            throw new NotFoundException('Không tìm thấy thương hiệu');
        }
        return brand;
    }

    async findAll(query: BrandListQueryDto) {
        const { page, limit, search, includeInactive } = query;
        const where: Prisma.BrandWhereInput = {
            ...(includeInactive ? {} : { isActive: true }),
            ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
        };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.brand.findMany({
                where,
                orderBy: { name: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.brand.count({ where }),
        ]);

        return { data, meta: buildMeta(total, page, limit) };
    }
}