import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersService } from './orders.service';
import { PaymentsService, UNPAID_CANCEL_MIN } from './payments.service';

@Injectable()
export class PaymentsCron {
    private readonly logger = new Logger(PaymentsCron.name);
    private running = false;

    constructor(
        private readonly prisma: PrismaService,
        private readonly payments: PaymentsService,
        private readonly orders: OrdersService,
    ) { }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async reconcile() {
        if (this.running) return;
        this.running = true;
        try {
            await this.run();
        } catch (e) {
            this.logger.error(`Đối soát VNPAY lỗi: ${(e as Error).message}`);
        } finally {
            this.running = false;
        }
    }

    async run(now = new Date()) {
        const stale = await this.prisma.paymentTransaction.findMany({
            where: { status: 'PENDING', expiresAt: { lt: new Date(now.getTime() - 60_000) } },
            orderBy: [{ checkedAt: { sort: 'asc', nulls: 'first' } }, { expiresAt: 'asc' }],
            take: 50,
        });
        let checked = 0;
        for (const t of stale) {
            try {
                if ((await this.payments.reconcileOrExpire(t)) !== 'UNVERIFIED') checked++;
            } catch (e) {
                this.logger.warn(`Đối soát ${t.txnRef}: ${(e as Error).message}`);
            }
        }

        const cutoff = new Date(now.getTime() - UNPAID_CANCEL_MIN * 60_000);
        const unpaid = await this.prisma.order.findMany({
            where: {
                paymentMethod: 'VNPAY',
                status: 'PENDING',
                paymentStatus: { not: 'PAID' },
                createdAt: { lt: cutoff },
                payments: { none: { OR: [{ status: 'PENDING' }, { expiresAt: { gt: cutoff } }] } },
            },
            select: { id: true, code: true },
            take: 50,
        });
        let cancelled = 0;
        for (const o of unpaid) {
            try {
                if (await this.orders.cancelUnpaid(o.id)) cancelled++;
            } catch (e) {
                this.logger.warn(`Huỷ đơn chưa thanh toán ${o.code}: ${(e as Error).message}`);
            }
        }
        if (checked || cancelled) this.logger.log(`Đối soát VNPAY: kiểm tra ${checked}/${stale.length} giao dịch, huỷ ${cancelled} đơn`);
        return { stale: stale.length, checked, cancelled };
    }
}
