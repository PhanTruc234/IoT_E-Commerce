import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { buildMeta } from '../../core/utils/pagination.util';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryListQueryDto } from './dto/category-list-query.dto';
import { createSlug } from 'src/core/utils/slug.util';

const MAX_LEVEL = 3;

@Injectable()
export class CategoriesService {
    constructor(private readonly prisma: PrismaService) { }

    private async generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
        const slug = createSlug(name) || 'danh-muc';
        const existing = await this.prisma.category.findUnique({ where: { slug } });
        if (existing && existing.id !== excludeId) {
            throw new ConflictException(`Danh mục "${name}" (slug: ${slug}) đã tồn tại`);
        }
        return slug;
    }

    async create(dto: CreateCategoryDto) {
        let level = 1;

        if (dto.parentId) {
            const parent = await this.prisma.category.findUnique({ where: { id: dto.parentId } });
            if (!parent) {
                throw new NotFoundException('Không tìm thấy danh mục cha');
            }
            level = parent.level + 1;
            if (level > MAX_LEVEL) {
                throw new BadRequestException(`Danh mục chỉ hỗ trợ tối đa ${MAX_LEVEL} cấp`);
            }
        }

        if (level === 1 && dto.icon) {
            throw new BadRequestException('Icon chỉ được gán cho danh mục cấp 2 và cấp 3');
        }

        const slug = await this.generateUniqueSlug(dto.name);

        return this.prisma.category.create({
            data: {
                name: dto.name,
                slug,
                description: dto.description,
                icon: level === 1 ? null : dto.icon,
                parentId: dto.parentId ?? null,
                level,
                sortOrder: dto.sortOrder ?? 0,
            },
        });
    }

    async update(id: string, dto: UpdateCategoryDto) {
        const category = await this.prisma.category.findUnique({ where: { id } });
        if (!category) {
            throw new NotFoundException('Không tìm thấy danh mục');
        }

        if (category.level === 1 && dto.icon) {
            throw new BadRequestException('Icon chỉ được gán cho danh mục cấp 2 và cấp 3');
        }

        const data: Prisma.CategoryUpdateInput = {
            description: dto.description,
            icon: category.level === 1 ? undefined : dto.icon,
            sortOrder: dto.sortOrder,
            isActive: dto.isActive,
        };

        if (dto.name && dto.name !== category.name) {
            data.name = dto.name;
            data.slug = await this.generateUniqueSlug(dto.name, id);
        }

        return this.prisma.category.update({ where: { id }, data });
    }

    async remove(id: string) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: { _count: { select: { children: true } } },
        });
        if (!category) {
            throw new NotFoundException('Không tìm thấy danh mục');
        }
        if (category._count.children > 0) {
            throw new ConflictException('Không thể xóa: danh mục còn chứa danh mục con');
        }
        await this.prisma.category.delete({ where: { id } });
        return { message: 'Đã xóa danh mục' };
    }

    async findOne(id: string) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: { parent: { select: { id: true, name: true } } },
        });
        if (!category) {
            throw new NotFoundException('Không tìm thấy danh mục');
        }
        return category;
    }

    async findBySlug(slug: string) {
        const category = await this.prisma.category.findFirst({
            where: { slug, isActive: true },
            include: {
                parent: { select: { id: true, name: true, slug: true } },
                children: {
                    where: { isActive: true },
                    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
                },
            },
        });
        if (!category) {
            throw new NotFoundException('Không tìm thấy danh mục');
        }
        return category;
    }
    async findAllFlat(query: CategoryListQueryDto) {
        const { page, limit, search } = query;
        const where: Prisma.CategoryWhereInput = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { slug: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {};

        const [data, total] = await this.prisma.$transaction([
            this.prisma.category.findMany({
                where,
                include: {
                    parent: { select: { id: true, name: true } },
                    _count: { select: { children: true } },
                },
                orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.category.count({ where }),
        ]);

        return { data, meta: buildMeta(total, page, limit) };
    }
    async getTree(includeInactive = false) {
        const categories = await this.prisma.category.findMany({
            where: includeInactive ? {} : { isActive: true },
            orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
        });

        type Node = (typeof categories)[number] & { children: Node[] };
        const map = new Map<string, Node>();
        const roots: Node[] = [];

        for (const c of categories) map.set(c.id, { ...c, children: [] });
        for (const c of categories) {
            const node = map.get(c.id)!;
            if (c.parentId && map.has(c.parentId)) {
                map.get(c.parentId)!.children.push(node);
            } else {
                roots.push(node);
            }
        }
        return roots;
    }
}