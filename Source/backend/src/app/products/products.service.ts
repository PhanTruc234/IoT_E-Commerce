import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { buildMeta } from '../../core/utils/pagination.util';
import { createSlug } from '../../core/utils/slug.util';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductListQueryDto, ProductSort } from './dto/product-list-query.dto';
import { buildSku } from 'src/core/utils/sku.util';

const LIST_INCLUDE = {
    category: {
        select: {
            id: true,
            name: true,
            slug: true
        }
    },
    brand: {
        select: {
            id: true,
            name: true,
            slug: true
        }
    },
    images: {
        where: {
            isPrimary: true
        },
        take: 1, select: {
            imageUrl: true
        }
    },
} satisfies Prisma.ProductInclude;

const DETAIL_INCLUDE = {
    category: {
        select: {
            id: true,
            name: true,
            slug: true
        }
    },
    brand: {
        select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true
        }
    },
    images: {
        orderBy: [{
            isPrimary: 'desc'
        }, { sortOrder: 'asc' }]
    },
    specifications: {
        include: {
            specification: true
        }
    },
    attributes: {
        orderBy: { sortOrder: 'asc' },
        include: {
            options: {
                orderBy: {
                    sortOrder: 'asc'
                }
            }
        },
    },
    variants: {
        where: {
            isActive: true
        },
        include: {
            options: {
                include: {
                    option: {
                        include: { attribute: true }
                    }
                }
            }
        },
    },
    comboItems: {
        include: {
            component: {
                select: {
                    id: true, name: true, slug: true, price: true, salePrice: true,
                    images: { where: { isPrimary: true }, take: 1, select: { imageUrl: true } },
                },
            },
        },
    },
} satisfies Prisma.ProductInclude;

@Injectable()
export class ProductsService {
    constructor(private readonly prisma: PrismaService) { }

    private async buildSlug(name: string, excludeId?: string): Promise<string> {
        const slug = createSlug(name) || 'san-pham';
        const existing = await this.prisma.product.findUnique({ where: { slug } });
        if (existing && existing.id !== excludeId) {
            throw new ConflictException(`Sản phẩm với slug "${slug}" đã tồn tại`);
        }
        return slug;
    }

    private async ensureSkuUnique(sku: string, excludeId?: string) {
        const existing = await this.prisma.product.findUnique({ where: { sku } });
        if (existing && existing.id !== excludeId) {
            throw new ConflictException(`SKU "${sku}" đã tồn tại`);
        }
    }
    private async generateUniqueSku(parts: Array<string | null | undefined>, excludeId?: string): Promise<string> {
        const base = buildSku(parts) || 'SP';
        let sku = base;
        let counter = 1;
        for (; ;) {
            const existing = await this.prisma.product.findUnique({ where: { sku } });
            if (!existing || existing.id === excludeId) return sku;
            counter += 1;
            sku = `${base}-${counter}`;
        }
    }
    private async validateRefs(categoryId?: string, brandId?: string) {
        let brandName: string | undefined;
        if (categoryId) {
            const cat = await this.prisma.category.findUnique({ where: { id: categoryId } });
            if (!cat) {
                throw new NotFoundException('Không tìm thấy danh mục');
            }
            const childCount = await this.prisma.category.count({ where: { parentId: categoryId } });
            if (childCount > 0) {
                throw new BadRequestException('Chỉ được gán danh mục không có danh mục con');
            }
        }
        if (brandId) {
            const brand = await this.prisma.brand.findUnique({ where: { id: brandId } });
            if (!brand) {
                throw new NotFoundException('Không tìm thấy thương hiệu');
            }
            brandName = brand.name;
        }
        return brandName
    }

    private orderBy(sort?: ProductSort): Prisma.ProductOrderByWithRelationInput {
        switch (sort) {
            case ProductSort.PRICE_ASC: return { price: 'asc' };
            case ProductSort.PRICE_DESC: return { price: 'desc' };
            case ProductSort.BEST_SELLING: return { soldCount: 'desc' };
            default: return { createdAt: 'desc' };
        }
    }

    private buildWhere(query: ProductListQueryDto, publicOnly: boolean): Prisma.ProductWhereInput {
        const { search, categoryId, brandId, status, minPrice, maxPrice } = query;
        const where: Prisma.ProductWhereInput = {};
        if (publicOnly) {
            where.status = ProductStatus.ACTIVE;
        }
        else if (status) {
            where.status = status;
        }
        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (brandId) {
            where.brandId = brandId;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (minPrice != null || maxPrice != null) {
            where.price = {
                ...(minPrice != null ? { gte: minPrice } : {}),
                ...(maxPrice != null ? { lte: maxPrice } : {}),
            };
        }
        return where;
    }

    private normalizeImages(images?: CreateProductDto['images']) {
        if (!images?.length) return [];
        const result = images.map((img, i) => ({
            imageUrl: img.imageUrl,
            sortOrder: img.sortOrder ?? i,
            isPrimary: false,
        }));
        const primaryIdx = images.findIndex((img) => img.isPrimary);
        result[primaryIdx >= 0 ? primaryIdx : 0].isPrimary = true;
        return result;
    }

    async create(dto: CreateProductDto) {
        const result = await this.validateRefs(dto.categoryId, dto.brandId);
        if (dto.salePrice != null && dto.salePrice > dto.price) {
            throw new BadRequestException('Giá khuyến mãi phải ≤ giá gốc');
        }
        const sku = await this.generateUniqueSku([result, dto.name]);
        const slug = await this.buildSlug(dto.name);
        const images = this.normalizeImages(dto.images);

        return this.prisma.product.create({
            data: {
                categoryId: dto.categoryId,
                brandId: dto.brandId ?? null,
                sku,
                name: dto.name,
                slug,
                description: dto.description,
                price: dto.price,
                salePrice: dto.salePrice ?? null,
                stockQuantity: dto.stockQuantity ?? 0,
                status: dto.status,
                type: dto.type,
                images: images.length ? { create: images } : undefined,
            },
            include: {
                images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
            },
        });
    }

    async update(id: string, dto: UpdateProductDto) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) {
            throw new NotFoundException('Không tìm thấy sản phẩm');
        }

        const result = await this.validateRefs(dto.categoryId, dto.brandId);

        const price = dto.price ?? product.price;
        const salePrice = dto.salePrice !== undefined ? dto.salePrice : product.salePrice;
        if (salePrice != null && salePrice > price) {
            throw new BadRequestException('Giá khuyến mãi phải ≤ giá gốc');
        }

        const data: Prisma.ProductUpdateInput = {
            description: dto.description,
            price: dto.price,
            salePrice: dto.salePrice,
            stockQuantity: dto.stockQuantity,
            status: dto.status,
            type: dto.type,
        };
        if (dto.categoryId) {
            data.category = { connect: { id: dto.categoryId } };
        }
        if (dto.brandId) {
            data.brand = { connect: { id: dto.brandId } };
        }
        const nameChanged = !!dto.name && dto.name !== product.name;
        const brandChanged = dto.brandId !== undefined && dto.brandId !== product.brandId;

        if (dto.name && dto.name !== product.name) {
            data.name = dto.name;
            data.slug = await this.buildSlug(dto.name, id);
        }
        if (nameChanged || brandChanged) {
            const brandId = dto.brandId !== undefined ? dto.brandId : product.brandId;
            let brandName: string | undefined;
            if (brandId) {
                const brand = await this.prisma.brand.findUnique({ where: { id: brandId } });
                brandName = brand?.name;
            }
            const newName = dto.name ?? product.name;
            data.sku = await this.generateUniqueSku([brandName, newName], id);
        }
        return this.prisma.product.update({ where: { id }, data });
    }

    async compare(idsRaw?: string) {
        const ids = [...new Set((idsRaw ?? '').split(',').map((s) => s.trim()).filter(Boolean))];
        if (ids.length < 2) throw new BadRequestException('Cần ít nhất 2 sản phẩm để so sánh');
        if (ids.length > 4) throw new BadRequestException('Chỉ so sánh tối đa 4 sản phẩm');

        const products = await this.prisma.product.findMany({
            where: { id: { in: ids }, status: { not: ProductStatus.INACTIVE } },
            include: {
                brand: { select: { name: true } },
                images: { where: { isPrimary: true }, take: 1, select: { imageUrl: true } },
                specifications: { include: { specification: true } },
            },
        });

        const byId = new Map(products.map((p) => [p.id, p]));
        const ordered = ids
            .map((id) => byId.get(id))
            .filter((p): p is (typeof products)[number] => !!p);
        if (ordered.length < 2) {
            throw new BadRequestException('Không đủ sản phẩm hợp lệ để so sánh');
        }
        const categoryIds = new Set(ordered.map((p) => p.categoryId));
        if (categoryIds.size > 1) {
            throw new BadRequestException('Chỉ so sánh các sản phẩm trong cùng danh mục');
        }
        const specMap = new Map<
            string,
            { specificationId: string; name: string; unit: string | null; values: Record<string, string> }
        >();
        for (const p of ordered) {
            for (const ps of p.specifications) {
                const s = ps.specification;
                if (!specMap.has(s.id)) {
                    specMap.set(s.id, { specificationId: s.id, name: s.name, unit: s.unit, values: {} });
                }
                specMap.get(s.id)!.values[p.id] = ps.value;
            }
        }
        const specs = [...specMap.values()].sort((a, b) => a.name.localeCompare(b.name, 'vi'));

        return {
            products: ordered.map((p) => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                price: p.price,
                salePrice: p.salePrice,
                brand: p.brand?.name ?? null,
                image: p.images[0]?.imageUrl ?? null,
            })),
            specs,
        };
    }

    async remove(id: string) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
        await this.prisma.product.update({
            where: { id },
            data: { status: ProductStatus.INACTIVE },
        });
        return { message: 'Đã ẩn sản phẩm' };
    }

    async findPublic(query: ProductListQueryDto) {
        return this.paginate(this.buildWhere(query, true), query);
    }

    async findAllAdmin(query: ProductListQueryDto) {
        return this.paginate(this.buildWhere(query, false), query);
    }

    private async paginate(where: Prisma.ProductWhereInput, query: ProductListQueryDto) {
        const { page, limit } = query;
        const [data, total] = await this.prisma.$transaction([
            this.prisma.product.findMany({
                where,
                include: LIST_INCLUDE,
                orderBy: this.orderBy(query.sort),
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.product.count({ where }),
        ]);
        return { data, meta: buildMeta(total, page, limit) };
    }

    async findOne(id: string) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: DETAIL_INCLUDE,
        });
        if (!product) {
            throw new NotFoundException('Không tìm thấy sản phẩm');
        }
        return product;
    }

    async findBySlug(slug: string) {
        const product = await this.prisma.product.findFirst({
            where: { slug, status: { not: ProductStatus.INACTIVE } },
            include: DETAIL_INCLUDE,
        });
        if (!product) {
            throw new NotFoundException('Không tìm thấy sản phẩm');
        }
        void this.prisma.product
            .update({ where: { id: product.id }, data: { viewCount: { increment: 1 } } })
            .catch(() => null);
        return product;
    }
}