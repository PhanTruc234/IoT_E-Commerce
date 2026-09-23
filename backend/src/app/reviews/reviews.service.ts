import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ReviewModerationReason } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { buildMeta } from '../../core/utils/pagination.util';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewListQueryDto } from './dto/review-list-query.dto';

@Injectable()
export class ReviewsService {
    constructor(private readonly prisma: PrismaService) { }

    private purchased(userId: string, productId: string) {
        return this.prisma.order.count({ where: { userId, status: 'COMPLETED', items: { some: { productId } } } });
    }

    private async findPurchaseOrderId(userId: string, productId: string): Promise<string | null> {
        const order = await this.prisma.order.findFirst({
            where: { userId, status: 'COMPLETED', items: { some: { productId } } },
            orderBy: { createdAt: 'desc' },
            select: { id: true },
        });
        return order?.id ?? null;
    }

    async eligibility(userId: string, productId: string) {
        const [bought, existing] = await Promise.all([
            this.purchased(userId, productId),
            this.prisma.review.findUnique({ where: { productId_userId: { productId, userId } }, select: { status: true } }),
        ]);
        return {
            purchased: bought > 0,
            alreadyReviewed: !!existing,
            reviewStatus: existing?.status ?? null,
            canReview: bought > 0 && !existing,
        };
    }

    async create(userId: string, productId: string, dto: CreateReviewDto) {
        const p = await this.prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
        if (!p) throw new NotFoundException('Không tìm thấy sản phẩm');

        const orderId = await this.findPurchaseOrderId(userId, productId);
        if (!orderId) throw new BadRequestException('Chỉ đánh giá khi đã mua và nhận hàng sản phẩm này');

        const existing = await this.prisma.review.findUnique({ where: { productId_userId: { productId, userId } } });
        if (existing) throw new BadRequestException('Bạn đã đánh giá sản phẩm này');

        return this.prisma.review.create({
            data: { productId, userId, orderId, verifiedPurchase: true, rating: dto.rating, comment: dto.comment },
        });
    }

    async findPublic(productId: string) {
        const reviews = await this.prisma.review.findMany({
            where: { productId, status: 'APPROVED' },
            orderBy: { approvedAt: 'desc' },
            include: { user: { select: { fullName: true } } },
        });
        const count = reviews.length;
        const average = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
        return {
            count,
            average: Math.round(average * 10) / 10,
            items: reviews.map((r) => ({
                id: r.id, rating: r.rating, comment: r.comment, createdAt: r.createdAt,
                userName: r.user.fullName, verifiedPurchase: r.verifiedPurchase,
            })),
        };
    }
    async findAllAdmin(query: ReviewListQueryDto) {
        const { page, limit, search, status } = query;
        const where: Prisma.ReviewWhereInput = {
            ...(status ? { status } : {}),
            ...(search ? { comment: { contains: search, mode: 'insensitive' } } : {}),
        };
        const [data, total] = await this.prisma.$transaction([
            this.prisma.review.findMany({
                where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit,
                include: { product: { select: { name: true } }, user: { select: { fullName: true, email: true } } },
            }),
            this.prisma.review.count({ where }),
        ]);
        return { data, meta: buildMeta(total, page, limit) };
    }

    async setStatus(id: string, status: 'APPROVED' | 'REJECTED', reason?: ReviewModerationReason) {
        const r = await this.prisma.review.findUnique({ where: { id }, select: { id: true } });
        if (!r) {
            throw new NotFoundException('Không tìm thấy đánh giá');
        }
        if (status === 'REJECTED' && !reason) {
            throw new BadRequestException('Vui lòng chọn lý do từ chối');
        }
        return this.prisma.review.update({
            where: { id },
            data: {
                status,
                approvedAt: status === 'APPROVED' ? new Date() : null,
                moderationReason: status === 'REJECTED' ? reason : null,
            },
        });
    }

    async remove(id: string, reason?: ReviewModerationReason) {
        const r = await this.prisma.review.findUnique({ where: { id }, select: { id: true } });
        if (!r) {
            throw new NotFoundException('Không tìm thấy đánh giá');
        }
        if (!reason) {
            throw new BadRequestException('Vui lòng chọn lý do xoá');
        }
        await this.prisma.review.delete({ where: { id } });
        return { message: 'Đã xoá đánh giá' };
    }
}