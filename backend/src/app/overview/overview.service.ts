import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

function dayKey(d: Date): string {
    const p = (n: number) => String(n).padStart(2, '0');
    return `${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

@Injectable()
export class OverviewService {
    constructor(private readonly prisma: PrismaService) { }

    async getOverview() {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const from = new Date();
        from.setHours(0, 0, 0, 0);
        from.setDate(from.getDate() - 13);

        const [
            revenueAgg,
            revenueMonthAgg,
            ordersTotal,
            ordersPending,
            customers,
            products,
            reviewsPending,
            questionsUnanswered,
            statusRows,
            topProducts,
            lowStock,
            recentOrders,
            completedOrders,
        ] = await Promise.all([
            this.prisma.order.aggregate({ _sum: { total: true }, where: { status: 'COMPLETED' } }),
            this.prisma.order.aggregate({ _sum: { total: true }, where: { status: 'COMPLETED', createdAt: { gte: startOfMonth } } }),
            this.prisma.order.count(),
            this.prisma.order.count({ where: { status: 'PENDING' } }),
            this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
            this.prisma.product.count({ where: { status: 'ACTIVE' } }),
            this.prisma.review.count({ where: { status: 'PENDING' } }),
            this.prisma.question.count({ where: { answer: null } }),
            this.prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
            this.prisma.product.findMany({
                where: { soldCount: { gt: 0 } },
                orderBy: { soldCount: 'desc' },
                take: 5,
                select: {
                    id: true, name: true, soldCount: true, price: true, salePrice: true,
                    images: { where: { isPrimary: true }, take: 1, select: { imageUrl: true } },
                },
            }),
            this.prisma.product.findMany({
                where: { status: 'ACTIVE', stockQuantity: { lte: 5 } },
                orderBy: { stockQuantity: 'asc' },
                take: 5,
                select: {
                    id: true, name: true, stockQuantity: true,
                    images: { where: { isPrimary: true }, take: 1, select: { imageUrl: true } },
                },
            }),
            this.prisma.order.findMany({
                orderBy: { createdAt: 'desc' },
                take: 6,
                select: { id: true, code: true, recipientName: true, total: true, status: true, createdAt: true },
            }),
            this.prisma.order.findMany({
                where: { status: 'COMPLETED', createdAt: { gte: from } },
                select: { createdAt: true, total: true },
            }),
        ]);

        const trendMap = new Map<string, number>();
        for (let i = 0; i < 14; i++) {
            const d = new Date(from);
            d.setDate(from.getDate() + i);
            trendMap.set(dayKey(d), 0);
        }
        for (const o of completedOrders) {
            const k = dayKey(new Date(o.createdAt));
            if (trendMap.has(k)) {
                trendMap.set(k, (trendMap.get(k) ?? 0) + o.total);
            }
        }

        return {
            kpis: {
                revenueTotal: revenueAgg._sum.total ?? 0,
                revenueMonth: revenueMonthAgg._sum.total ?? 0,
                ordersTotal,
                ordersPending,
                customers,
                products,
            },
            moderation: { reviewsPending, questionsUnanswered, ordersPending },
            statusBreakdown: statusRows.map((r) => ({ status: r.status, count: r._count._all })),
            revenueTrend: [...trendMap.entries()].map(([date, revenue]) => ({ date, revenue })),
            topProducts: topProducts.map((p) => ({
                id: p.id, name: p.name, soldCount: p.soldCount,
                price: p.salePrice ?? p.price, image: p.images[0]?.imageUrl ?? null,
            })),
            lowStock: lowStock.map((p) => ({ id: p.id, name: p.name, stockQuantity: p.stockQuantity, image: p.images[0]?.imageUrl ?? null })),
            recentOrders,
        };
    }
}
