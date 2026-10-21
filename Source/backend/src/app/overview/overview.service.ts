import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { addDays, daysBetween, vnDayKey, vnDayStart, vnToday } from '../../core/utils/vn-time.util';
import { OverviewQueryDto } from './dto/overview-query.dto';

const MAX_DAYS = 366;
/** Đơn COD chờ xác nhận quá lâu */
const STALE_PENDING_H = 24;
/** Đơn đã xác nhận mà chưa giao cho GHN quá lâu */
const STALE_CONFIRMED_H = 48;
/** SP còn hàng nhưng không bán được trong ngần này ngày = tồn lâu */
const SLOW_MOVER_DAYS = 60;
const LOW_STOCK = 5;
const SHIPPING_PROBLEMS = ['delivery_fail', 'waiting_to_return', 'return', 'return_transporting', 'return_sorting', 'returning', 'return_fail', 'exception', 'lost', 'damage'];

/**
 * Đơn "đã chốt" — dùng cho mọi số liệu doanh thu: không bị huỷ, và nếu trả VNPAY thì đã thanh toán
 * (đơn VNPAY chưa trả có thể tự huỷ nên chưa tính là doanh thu).
 */
const SETTLED: Prisma.OrderWhereInput = {
    status: { not: 'CANCELLED' },
    OR: [{ paymentMethod: 'COD' }, { paymentStatus: 'PAID' }],
};

const ORDER_SELECT = {
    id: true, userId: true, createdAt: true, total: true, subtotal: true, discountAmount: true, shippingFee: true,
    shippingDiscount: true, taxAmount: true, pricesIncludeTax: true, paymentMethod: true, carrierFee: true,
    productCouponCode: true, shippingCouponCode: true,
    items: { select: { productId: true, quantity: true, lineTotal: true, unitPrice: true, listPrice: true, priceSource: true, promotionName: true } },
} satisfies Prisma.OrderSelect;
type SettledOrder = Prisma.OrderGetPayload<{ select: typeof ORDER_SELECT }>;

/**
 * Doanh thu thuần của 1 đơn = tiền hàng sau giảm giá (subtotal − voucher), KHÔNG gồm phí ship, CHƯA gồm VAT.
 * Giá đã gồm VAT thì VAT của đơn được tính trên (tiền hàng + ship) → trừ phần VAT ứng với tiền hàng theo tỉ lệ.
 */
function netRevenue(o: Pick<SettledOrder, 'subtotal' | 'discountAmount' | 'shippingFee' | 'shippingDiscount' | 'taxAmount' | 'pricesIncludeTax'>) {
    const goods = Math.max(0, o.subtotal - o.discountAmount);
    const ship = Math.max(0, o.shippingFee - o.shippingDiscount);
    const goodsVat = o.pricesIncludeTax && o.taxAmount > 0 && goods + ship > 0 ? Math.round((o.taxAmount * goods) / (goods + ship)) : 0;
    return goods - goodsVat;
}

const sum = <T>(rows: T[], f: (r: T) => number) => rows.reduce((s, r) => s + f(r), 0);
const ratio = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);
const pair = (cur: number, prev: number) => ({ cur, prev });

@Injectable()
export class OverviewService {
    constructor(private readonly prisma: PrismaService) { }

    private range(q: OverviewQueryDto) {
        const to = q.to ?? vnToday();
        const from = q.from ?? addDays(to, -29);
        const days = daysBetween(from, to);
        if (days < 1) throw new BadRequestException('Ngày bắt đầu phải trước hoặc bằng ngày kết thúc');
        if (days > MAX_DAYS) throw new BadRequestException(`Chỉ xem tối đa ${MAX_DAYS} ngày một lần`);
        // Kỳ trước: cùng số ngày, ngay trước kỳ đang xem
        const prevTo = addDays(from, -1);
        const prevFrom = addDays(prevTo, -(days - 1));
        return {
            from, to, days, prevFrom, prevTo,
            start: vnDayStart(from), end: vnDayStart(addDays(to, 1)),
            prevStart: vnDayStart(prevFrom), prevEnd: vnDayStart(from),
        };
    }

    private settledOrders(start: Date, end: Date) {
        return this.prisma.order.findMany({ where: { ...SETTLED, createdAt: { gte: start, lt: end } }, select: ORDER_SELECT });
    }

    private discounts(orders: SettledOrder[]) {
        let sale = 0;
        let promotion = 0;
        for (const o of orders) {
            for (const it of o.items) {
                if (it.listPrice == null || it.listPrice <= it.unitPrice) continue;
                const d = (it.listPrice - it.unitPrice) * it.quantity;
                if (it.priceSource === 'PROMOTION') promotion += d;
                else sale += d;
            }
        }
        const productVoucher = sum(orders, (o) => o.discountAmount);
        const shippingVoucher = sum(orders, (o) => o.shippingDiscount);
        return { sale, promotion, productVoucher, shippingVoucher, total: sale + promotion + productVoucher + shippingVoucher };
    }

    private async funnel(start: Date, end: Date, orders: number) {
        const rows = await this.prisma.userEvent.groupBy({
            by: ['type'],
            where: { createdAt: { gte: start, lt: end } },
            _count: { _all: true },
        });
        const n = (t: string) => rows.find((r) => r.type === t)?._count._all ?? 0;
        const views = n('VIEW_PRODUCT');
        const addToCart = n('ADD_TO_CART');
        return { views, addToCart, searches: n('SEARCH'), orders, viewToCart: ratio(addToCart, views), cartToOrder: ratio(orders, addToCart) };
    }

    async getOverview(q: OverviewQueryDto) {
        const r = this.range(q);
        const now = Date.now();
        const inRange = { gte: r.start, lt: r.end };
        const inPrev = { gte: r.prevStart, lt: r.prevEnd };

        const [
            cur, prev, statusRows, prevStatusRows,
            stalePending, staleConfirmed, vnpayUnpaid, needsRefund,
            inTransit, problemOrders, activePromos,
            invoicesPending, newCustomers, prevNewCustomers,
            lowStockCount, lowStock,
            reviewsPending, questionsUnanswered, ticketsOpen, warrantyOpen,
            searchRows,
        ] = await Promise.all([
            this.settledOrders(r.start, r.end),
            this.settledOrders(r.prevStart, r.prevEnd),
            this.prisma.order.groupBy({ by: ['status'], where: { createdAt: inRange }, _count: { _all: true } }),
            this.prisma.order.groupBy({ by: ['status'], where: { createdAt: inPrev }, _count: { _all: true } }),
            // "Việc tồn" tính theo thời điểm hiện tại, không theo kỳ
            this.prisma.order.count({
                where: { status: 'PENDING', createdAt: { lt: new Date(now - STALE_PENDING_H * 3600_000) }, OR: [{ paymentMethod: 'COD' }, { paymentStatus: 'PAID' }] },
            }),
            this.prisma.order.count({ where: { status: 'CONFIRMED', createdAt: { lt: new Date(now - STALE_CONFIRMED_H * 3600_000) } } }),
            this.prisma.order.count({ where: { paymentMethod: 'VNPAY', status: 'PENDING', paymentStatus: { not: 'PAID' } } }),
            this.prisma.paymentTransaction.count({ where: { needsRefund: true } }),
            this.prisma.order.count({ where: { status: 'SHIPPING' } }),
            this.prisma.order.findMany({
                where: { shippingStatus: { in: SHIPPING_PROBLEMS }, status: { notIn: ['COMPLETED', 'CANCELLED'] } },
                orderBy: { updatedAt: 'desc' },
                select: { id: true, code: true, shippingStatus: true, updatedAt: true },
            }),
            this.prisma.promotion.findMany({
                where: {
                    isActive: true,
                    AND: [
                        { OR: [{ startAt: null }, { startAt: { lte: new Date(now) } }] },
                        { OR: [{ endAt: null }, { endAt: { gte: new Date(now) } }] },
                    ],
                },
                orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
                select: { id: true, name: true, endAt: true, forcePriority: true },
            }),
            this.prisma.invoiceRequest.count({ where: { status: 'PENDING' } }),
            this.prisma.user.count({ where: { role: 'CUSTOMER', createdAt: inRange } }),
            this.prisma.user.count({ where: { role: 'CUSTOMER', createdAt: inPrev } }),
            this.prisma.product.count({ where: { status: 'ACTIVE', stockQuantity: { lte: LOW_STOCK }, type: { not: 'COMBO' } } }),
            this.prisma.product.findMany({
                where: { status: 'ACTIVE', stockQuantity: { lte: LOW_STOCK }, type: { not: 'COMBO' } },
                orderBy: { stockQuantity: 'asc' },
                take: 5,
                select: { id: true, name: true, stockQuantity: true },
            }),
            this.prisma.review.count({ where: { status: 'PENDING' } }),
            this.prisma.question.count({ where: { answer: null } }),
            this.prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] }, type: { not: 'WARRANTY' } } }),
            this.prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] }, type: 'WARRANTY' } }),
            this.prisma.userEvent.findMany({ where: { type: 'SEARCH', keyword: { not: null }, createdAt: inRange }, select: { keyword: true } }),
        ]);

        // ---------- Bán hàng ----------
        const net = sum(cur, netRevenue);
        const prevNet = sum(prev, netRevenue);
        const daily = new Map<string, { net: number; orders: number }>();
        for (let i = 0; i < r.days; i++) daily.set(addDays(r.from, i), { net: 0, orders: 0 });
        for (const o of cur) {
            const d = daily.get(vnDayKey(o.createdAt));
            if (d) { d.net += netRevenue(o); d.orders++; }
        }
        const byPayment = (['COD', 'VNPAY'] as const).map((method) => {
            const rows = cur.filter((o) => o.paymentMethod === method);
            return { method, orders: rows.length, net: sum(rows, netRevenue) };
        });

        // SP liên quan: tên, danh mục cho biểu đồ theo danh mục + top SP theo doanh thu
        const productRevenue = new Map<string, { qty: number; revenue: number }>();
        for (const o of cur) for (const it of o.items) {
            const p = productRevenue.get(it.productId) ?? { qty: 0, revenue: 0 };
            p.qty += it.quantity;
            p.revenue += it.lineTotal;
            productRevenue.set(it.productId, p);
        }
        const soldProducts = productRevenue.size
            ? await this.prisma.product.findMany({
                where: { id: { in: [...productRevenue.keys()] } },
                select: { id: true, name: true, category: { select: { id: true, name: true } } },
            })
            : [];
        const pInfo = new Map(soldProducts.map((p) => [p.id, p]));
        const byCategoryMap = new Map<string, { id: string; name: string; amount: number }>();
        for (const [pid, v] of productRevenue) {
            const c = pInfo.get(pid)?.category ?? { id: '-', name: '(không rõ)' };
            const row = byCategoryMap.get(c.id) ?? { id: c.id, name: c.name, amount: 0 };
            row.amount += v.revenue;
            byCategoryMap.set(c.id, row);
        }

        // ---------- Đơn hàng ----------
        const statusTotal = sum(statusRows, (s) => s._count._all);
        const cancelled = statusRows.find((s) => s.status === 'CANCELLED')?._count._all ?? 0;
        const prevStatusTotal = sum(prevStatusRows, (s) => s._count._all);
        const prevCancelled = prevStatusRows.find((s) => s.status === 'CANCELLED')?._count._all ?? 0;

        // ---------- Vận chuyển GHN ----------
        const shipped = cur.filter((o) => o.carrierFee != null);
        const shipCharged = (o: SettledOrder) => Math.max(0, o.shippingFee - o.shippingDiscount);
        const charged = sum(shipped, shipCharged);
        const carrierFee = sum(shipped, (o) => o.carrierFee ?? 0);
        // Cộng phần shop bù của TỪNG đơn — đơn thu dư phí ship không được bù trừ vào đơn shop phải bù
        const subsidy = sum(shipped, (o) => Math.max(0, (o.carrierFee ?? 0) - shipCharged(o)));

        // ---------- Khuyến mại & voucher ----------
        const disc = this.discounts(cur);
        const prevDisc = this.discounts(prev);
        const vouchers = new Map<string, { code: string; kind: 'PRODUCT' | 'SHIPPING'; uses: number; amount: number }>();
        const tally = (code: string | null, kind: 'PRODUCT' | 'SHIPPING', amount: number) => {
            if (!code) return;
            const v = vouchers.get(code) ?? { code, kind, uses: 0, amount: 0 };
            v.uses++;
            v.amount += amount;
            vouchers.set(code, v);
        };
        for (const o of cur) {
            tally(o.productCouponCode, 'PRODUCT', o.discountAmount);
            tally(o.shippingCouponCode, 'SHIPPING', o.shippingDiscount);
        }

        // ---------- Sản phẩm tồn lâu ----------
        const slowCutoff = new Date(now - SLOW_MOVER_DAYS * 86_400_000);
        const slowWhere: Prisma.ProductWhereInput = {
            status: 'ACTIVE',
            stockQuantity: { gt: 0 },
            type: { not: 'COMBO' },
            createdAt: { lt: slowCutoff },
            orderItems: { none: { order: { status: { not: 'CANCELLED' }, createdAt: { gte: slowCutoff } } } },
        };
        const [slowCount, slowRows] = await Promise.all([
            this.prisma.product.count({ where: slowWhere }),
            this.prisma.product.findMany({ where: slowWhere, select: { id: true, name: true, stockQuantity: true, price: true } }),
        ]);
        const slowMovers = slowRows
            .map((p) => ({ id: p.id, name: p.name, stock: p.stockQuantity, value: p.stockQuantity * p.price }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        // ---------- Khách hàng ----------
        const spend = new Map<string, { orders: number; spent: number }>();
        for (const o of cur) {
            const s = spend.get(o.userId) ?? { orders: 0, spent: 0 };
            s.orders++;
            s.spent += o.total;
            spend.set(o.userId, s);
        }
        const buyerIds = [...spend.keys()];
        const [returningRows, topUsers] = await Promise.all([
            buyerIds.length
                ? this.prisma.order.findMany({
                    where: { ...SETTLED, userId: { in: buyerIds }, createdAt: { lt: r.start } },
                    distinct: ['userId'],
                    select: { userId: true },
                })
                : [],
            this.prisma.user.findMany({
                where: { id: { in: [...spend.entries()].sort((a, b) => b[1].spent - a[1].spent).slice(0, 5).map(([id]) => id) } },
                select: { id: true, fullName: true, email: true },
            }),
        ]);
        const topCustomers = topUsers
            .map((u) => ({ id: u.id, name: u.fullName, email: u.email, ...spend.get(u.id)! }))
            .sort((a, b) => b.spent - a.spent);

        // ---------- Hành vi ----------
        const [behavior, prevBehavior] = await Promise.all([this.funnel(r.start, r.end, cur.length), this.funnel(r.prevStart, r.prevEnd, prev.length)]);
        const keywords = new Map<string, number>();
        for (const s of searchRows) {
            const k = s.keyword!.trim().toLowerCase();
            if (k) keywords.set(k, (keywords.get(k) ?? 0) + 1);
        }

        return {
            range: { from: r.from, to: r.to, days: r.days, prevFrom: r.prevFrom, prevTo: r.prevTo, timezone: 'Asia/Ho_Chi_Minh' },
            sales: {
                netRevenue: pair(net, prevNet),
                orders: pair(cur.length, prev.length),
                aov: pair(cur.length ? Math.round(net / cur.length) : 0, prev.length ? Math.round(prevNet / prev.length) : 0),
                gross: sum(cur, (o) => o.total),
                shippingCollected: sum(cur, (o) => Math.max(0, o.shippingFee - o.shippingDiscount)),
                daily: [...daily.entries()].map(([date, v]) => ({ date, ...v })),
                byCategory: [...byCategoryMap.values()].sort((a, b) => b.amount - a.amount),
                byPayment,
            },
            orders: {
                total: statusTotal,
                statusBreakdown: statusRows.map((s) => ({ status: s.status, count: s._count._all })),
                cancelRate: pair(ratio(cancelled, statusTotal), ratio(prevCancelled, prevStatusTotal)),
                stalePending, staleConfirmed, vnpayUnpaid, needsRefund,
                staleHours: { pending: STALE_PENDING_H, confirmed: STALE_CONFIRMED_H },
            },
            shipping: {
                inTransit,
                problems: { count: problemOrders.length, items: problemOrders.slice(0, 5) },
                shipments: shipped.length,
                carrierFee,
                charged,
                subsidy,
            },
            promotions: {
                active: { count: activePromos.length, items: activePromos.slice(0, 5) },
                discount: pair(disc.total, prevDisc.total),
                breakdown: disc,
                topVouchers: [...vouchers.values()].sort((a, b) => b.uses - a.uses || b.amount - a.amount).slice(0, 5),
            },
            tax: {
                vat: pair(sum(cur, (o) => o.taxAmount), sum(prev, (o) => o.taxAmount)),
                invoicesPending,
            },
            products: {
                lowStock: { count: lowStockCount, threshold: LOW_STOCK, items: lowStock },
                slowMovers: { count: slowCount, days: SLOW_MOVER_DAYS, items: slowMovers },
                topRevenue: [...productRevenue.entries()]
                    .map(([id, v]) => ({ id, name: pInfo.get(id)?.name ?? '(đã xoá)', ...v }))
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5),
            },
            customers: {
                newCustomers: pair(newCustomers, prevNewCustomers),
                buyers: buyerIds.length,
                returning: returningRows.length,
                firstTime: buyerIds.length - returningRows.length,
                top: topCustomers,
            },
            behavior: {
                ...behavior,
                viewToCart: pair(behavior.viewToCart, prevBehavior.viewToCart),
                cartToOrder: pair(behavior.cartToOrder, prevBehavior.cartToOrder),
                topSearches: [...keywords.entries()].map(([keyword, count]) => ({ keyword, count })).sort((a, b) => b.count - a.count).slice(0, 8),
            },
            todo: { reviewsPending, questionsUnanswered, ticketsOpen, warrantyOpen, invoicesPending },
        };
    }
}
