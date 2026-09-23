import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { buildMeta } from '../../core/utils/pagination.util';
import { QuestionListQueryDto } from './dto/question-list-query.dto';

@Injectable()
export class QuestionsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(userId: string, productId: string, content: string) {
        const p = await this.prisma.product.findUnique({ where: { id: productId }, select: { id: true, status: true } });
        if (!p || p.status === 'INACTIVE') throw new NotFoundException('Không tìm thấy sản phẩm');
        return this.prisma.question.create({ data: { productId, userId, content } });
    }

    async findPublic(productId: string) {
        const rows = await this.prisma.question.findMany({
            where: { productId, answer: { not: null } },
            orderBy: { answeredAt: 'desc' },
            include: { user: { select: { fullName: true } } },
        });
        return rows.map((q) => ({
            id: q.id, content: q.content, answer: q.answer, answeredAt: q.answeredAt, createdAt: q.createdAt,
            askerName: q.user.fullName,
        }));
    }

    async findAllAdmin(query: QuestionListQueryDto) {
        const { page, limit, search, answered } = query;
        const where: Prisma.QuestionWhereInput = {
            ...(search ? { content: { contains: search, mode: 'insensitive' } } : {}),
            ...(answered === 'true' ? { answer: { not: null } } : answered === 'false' ? { answer: null } : {}),
        };
        const [data, total] = await this.prisma.$transaction([
            this.prisma.question.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: { product: { select: { name: true } }, user: { select: { fullName: true, email: true } } },
            }),
            this.prisma.question.count({ where }),
        ]);
        return { data, meta: buildMeta(total, page, limit) };
    }

    async answer(id: string, answer: string) {
        const q = await this.prisma.question.findUnique({ where: { id }, select: { id: true } });
        if (!q) throw new NotFoundException('Không tìm thấy câu hỏi');
        return this.prisma.question.update({ where: { id }, data: { answer, answeredAt: new Date() } });
    }

    async remove(id: string) {
        const q = await this.prisma.question.findUnique({ where: { id }, select: { id: true } });
        if (!q) throw new NotFoundException('Không tìm thấy câu hỏi');
        await this.prisma.question.delete({ where: { id } });
        return { message: 'Đã xoá câu hỏi' };
    }
}