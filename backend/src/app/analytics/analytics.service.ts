import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class AnalyticsService {
    constructor(private readonly prisma: PrismaService) { }

    log(dto: CreateEventDto) {
        return this.prisma.userEvent.create({
            data: { type: dto.type, productId: dto.productId ?? null, categoryId: dto.categoryId ?? null, keyword: dto.keyword ?? null },
        });
    }

    async getAnalytics(days = 14) {
        const from = new Date();
        from.setHours(0, 0, 0, 0);
        from.setDate(from.getDate() - (days - 1));

        const [views, searches, addToCart, orders] = await Promise.all([
            this.prisma.userEvent.count({ where: { type: 'VIEW_PRODUCT', createdAt: { gte: from } } }),
            this.prisma.userEvent.count({ where: { type: 'SEARCH', createdAt: { gte: from } } }),
            this.prisma.userEvent.count({ where: { type: 'ADD_TO_CART', createdAt: { gte: from } } }),
            this.prisma.order.count({ where: { createdAt: { gte: from } } }),
        ]);

        const topViewRows = await this.prisma.userEvent.groupBy({
            by: ['productId'],
            where: { type: 'VIEW_PRODUCT', productId: { not: null }, createdAt: { gte: from } },
            _count: { productId: true },
            orderBy: { _count: { productId: 'desc' } },
            take: 10,
        });
        const products = await this.prisma.product.findMany({ where: { id: { in: topViewRows.map((r) => r.productId!) } }, select: { id: true, name: true } });
        const pMap = new Map(products.map((p) => [p.id, p.name]));
        const topProducts = topViewRows.map((r) => ({ productId: r.productId, name: pMap.get(r.productId!) ?? '(đã xoá)', views: r._count.productId }));

        const topSearchRows = await this.prisma.userEvent.groupBy({
            by: ['keyword'],
            where: { type: 'SEARCH', keyword: { not: null }, createdAt: { gte: from } },
            _count: { keyword: true },
            orderBy: { _count: { keyword: 'desc' } },
            take: 10,
        });
        const topSearches = topSearchRows.map((r) => ({ keyword: r.keyword, count: r._count.keyword }));

        const topCatRows = await this.prisma.userEvent.groupBy({
            by: ['categoryId'],
            where: { type: 'VIEW_CATEGORY', categoryId: { not: null }, createdAt: { gte: from } },
            _count: { categoryId: true },
            orderBy: { _count: { categoryId: 'desc' } },
            take: 10,
        });
        const cats = await this.prisma.category.findMany({ where: { id: { in: topCatRows.map((r) => r.categoryId!) } }, select: { id: true, name: true } });
        const cMap = new Map(cats.map((c) => [c.id, c.name]));
        const topCategories = topCatRows.map((r) => ({ categoryId: r.categoryId, name: cMap.get(r.categoryId!) ?? '(đã xoá)', views: r._count.categoryId }));

        const [viewEvents, orderRows] = await Promise.all([
            this.prisma.userEvent.findMany({ where: { type: 'VIEW_PRODUCT', createdAt: { gte: from } }, select: { createdAt: true } }),
            this.prisma.order.findMany({ where: { createdAt: { gte: from } }, select: { createdAt: true } }),
        ]);
        const key = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const map = new Map<string, { views: number; orders: number }>();
        for (let i = 0; i < days; i++) {
            const d = new Date(from); d.setDate(from.getDate() + i);
            map.set(key(d), { views: 0, orders: 0 });
        }
        for (const e of viewEvents) { const t = map.get(key(new Date(e.createdAt))); if (t) t.views++; }
        for (const o of orderRows) { const t = map.get(key(new Date(o.createdAt))); if (t) t.orders++; }
        const trend = [...map.entries()].map(([date, v]) => ({ date, ...v }));

        const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);
        return {
            days,
            totals: { views, searches, addToCart, orders },
            funnel: { views, addToCart, orders, viewToCart: pct(addToCart, views), cartToOrder: pct(orders, addToCart) },
            topProducts, topSearches, topCategories, trend,
        };
    }
}