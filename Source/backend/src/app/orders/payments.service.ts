import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PaymentTransaction, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { VnpayQueryError, VnpayService, type QueryDrStatus } from './vnpay.service';

/** Link VNPAY hết hạn sau ... phút (vnp_ExpireDate) */
export const PAYMENT_TTL_MIN = 15;
/** Đơn VNPAY tự huỷ khi lần thanh toán cuối đã hết hạn quá ... phút */
export const UNPAID_CANCEL_MIN = 30;
/** Link còn dưới ngần này thì không đưa lại cho khách nữa */
const REUSE_MARGIN_MS = 2 * 60 * 1000;
/** Không hỏi được VNPAY: link đã hết hạn quá ngần này thì coi như hết hạn (tiền về muộn vẫn được applyResult nhận) */
const UNVERIFIED_GRACE_MS = 15 * 60 * 1000;

type ApplyInput = {
    txnRef: string;
    amount: number;
    success: boolean;
    responseCode: string | null;
    transactionNo: string | null;
    bankCode: string | null;
    source: 'IPN' | 'RETURN' | 'QUERYDR';
    raw: Record<string, string>;
};
export type ApplyOutcome = 'OK' | 'ALREADY' | 'NOT_FOUND' | 'AMOUNT_MISMATCH';
type PendingTxn = Pick<PaymentTransaction, 'id' | 'txnRef' | 'createDate' | 'amount' | 'expiresAt'>;

const isUniqueViolation = (e: unknown) => e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly vnpay: VnpayService,
    ) { }

    /** Mở 1 lần thanh toán mới — luôn gọi trong transaction tạo đơn / thanh toán lại. */
    async createAttempt(tx: Prisma.TransactionClient, order: { id: string; code: string; total: number }, ip: string, attemptNo: number) {
        const createdAt = new Date();
        const expiresAt = new Date(createdAt.getTime() + PAYMENT_TTL_MIN * 60 * 1000);
        const txnRef = `${order.code}-${attemptNo}`;
        const { url, createDate } = this.vnpay.buildPaymentUrl({
            txnRef, amount: order.total, ip, orderInfo: `Thanh toan don ${order.code}`, createdAt, expiresAt,
        });
        await tx.paymentTransaction.create({
            data: { orderId: order.id, txnRef, amount: order.total, paymentUrl: url, createDate, expiresAt },
        });
        return url;
    }

    /**
     * Ghi nhận kết quả 1 giao dịch (IPN, Return URL hay QueryDR đều đi qua đây).
     * Idempotent theo txnRef: gọi lại bao nhiêu lần cũng chỉ có 1 lần đổi trạng thái.
     */
    async applyResult(input: ApplyInput): Promise<{ outcome: ApplyOutcome; orderId?: string; refund?: boolean }> {
        const txn = await this.prisma.paymentTransaction.findUnique({ where: { txnRef: input.txnRef } });
        if (!txn) return { outcome: 'NOT_FOUND' };
        const orderId = txn.orderId;
        if (input.amount !== txn.amount) {
            this.logger.warn(`VNPAY ${input.source} ${input.txnRef}: số tiền ${input.amount} khác ${txn.amount}`);
            return { outcome: 'AMOUNT_MISMATCH', orderId };
        }
        // Thành công thì nhận cả khi trước đó đã FAILED/EXPIRED (tiền đã vào là phải ghi nhận); thất bại chỉ áp lên PENDING
        if (txn.status === 'SUCCESS' || (!input.success && txn.status !== 'PENDING')) {
            return { outcome: 'ALREADY', orderId, refund: txn.needsRefund };
        }

        return this.prisma.$transaction(async (tx) => {
            const now = new Date();
            const common = {
                responseCode: input.responseCode,
                providerTxnNo: input.transactionNo,
                bankCode: input.bankCode,
                checkedAt: now,
                raw: { source: input.source, params: input.raw },
            };
            const claimed = await tx.paymentTransaction.updateMany({
                where: { id: txn.id, status: input.success ? { not: 'SUCCESS' } : 'PENDING' },
                data: input.success ? { ...common, status: 'SUCCESS', paidAt: now } : { ...common, status: 'FAILED' },
            });
            if (!claimed.count) return { outcome: 'ALREADY' as const, orderId };

            if (!input.success) {
                // Chỉ lần thanh toán mới nhất mới được đổi đơn sang "thất bại"
                const latest = await tx.paymentTransaction.findFirst({ where: { orderId }, orderBy: { createdAt: 'desc' }, select: { id: true } });
                if (latest?.id === txn.id) {
                    await tx.order.updateMany({ where: { id: orderId, paymentStatus: 'PENDING' }, data: { paymentStatus: 'FAILED' } });
                }
                return { outcome: 'OK' as const, orderId };
            }

            const confirmed = await tx.order.updateMany({
                where: { id: orderId, status: 'PENDING', paymentStatus: { not: 'PAID' } },
                data: { paymentStatus: 'PAID', paidAt: now, status: 'CONFIRMED' },
            });
            if (confirmed.count) {
                await tx.orderStatusHistory.create({
                    data: {
                        orderId,
                        status: 'CONFIRMED',
                        changedBy: 'Hệ thống',
                        note: `Thanh toán VNPAY thành công (GD ${input.transactionNo ?? input.txnRef})`,
                    },
                });
                return { outcome: 'OK' as const, orderId };
            }

            // Tiền đã vào nhưng đơn không còn chờ thanh toán (đã huỷ / đã trả bằng lần khác) → giữ nguyên đơn, đánh dấu hoàn tiền
            const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, select: { code: true, userId: true, status: true, paymentStatus: true } });
            await tx.paymentTransaction.update({ where: { id: txn.id }, data: { needsRefund: true } });
            if (order.paymentStatus !== 'PAID') {
                await tx.order.update({ where: { id: orderId }, data: { paymentStatus: 'PAID', paidAt: now } });
            }
            const reason = order.status === 'CANCELLED' ? 'đơn đã bị huỷ' : 'đơn đã được thanh toán trước đó';
            const amount = txn.amount.toLocaleString('vi-VN');
            await tx.orderStatusHistory.create({
                data: {
                    orderId,
                    status: order.status,
                    changedBy: 'Hệ thống',
                    note: `Nhận ${amount}đ qua VNPAY (GD ${input.transactionNo ?? input.txnRef}) nhưng ${reason} · cần hoàn tiền cho khách`,
                },
            });
            await tx.notification.create({
                data: {
                    title: `Đơn ${order.code}: IoTech sẽ hoàn tiền cho bạn`,
                    body: `Chúng tôi đã nhận ${amount}đ qua VNPAY nhưng ${reason}. Khoản tiền này sẽ được hoàn lại cho bạn.`,
                    type: 'ORDER',
                    audience: 'USER',
                    userId: order.userId,
                    linkUrl: `/orders/${orderId}`,
                },
            });
            return { outcome: 'OK' as const, orderId, refund: true };
        });
    }

    /** Hỏi VNPAY trạng thái thật rồi ghi nhận. Ném VnpayQueryError khi không hỏi được. */
    async reconcile(txn: PendingTxn): Promise<QueryDrStatus | 'EXPIRED'> {
        const r = await this.vnpay.queryDr({ txnRef: txn.txnRef, createDate: txn.createDate });
        if (r.status === 'PAID' || r.status === 'FAILED') {
            await this.applyResult({
                txnRef: txn.txnRef,
                amount: r.amount ?? txn.amount,
                success: r.status === 'PAID',
                responseCode: r.responseCode,
                transactionNo: r.transactionNo,
                bankCode: r.bankCode,
                source: 'QUERYDR',
                raw: r.raw,
            });
            return r.status;
        }
        const now = new Date();
        // Link đã hết hạn mà VNPAY vẫn chưa có tiền → không thể trả được nữa (07 = VNPAY đang xét gian lận, chờ tiếp)
        if (txn.expiresAt.getTime() < now.getTime() && r.responseCode !== '07') {
            await this.prisma.paymentTransaction.updateMany({
                where: { id: txn.id, status: 'PENDING' },
                data: { status: 'EXPIRED', checkedAt: now, responseCode: r.responseCode },
            });
            return 'EXPIRED';
        }
        await this.prisma.paymentTransaction.update({ where: { id: txn.id }, data: { checkedAt: now } });
        return r.status;
    }

    /** Cron dùng: hỏi VNPAY; không hỏi được thì chỉ cho hết hạn khi link đã chết đủ lâu. */
    async reconcileOrExpire(txn: PendingTxn): Promise<QueryDrStatus | 'EXPIRED' | 'UNVERIFIED'> {
        try {
            return await this.reconcile(txn);
        } catch (e) {
            if (!(e instanceof VnpayQueryError)) throw e;
            const now = new Date();
            if (txn.expiresAt.getTime() + UNVERIFIED_GRACE_MS < now.getTime()) {
                await this.prisma.paymentTransaction.updateMany({ where: { id: txn.id, status: 'PENDING' }, data: { status: 'EXPIRED', checkedAt: now } });
                return 'EXPIRED';
            }
            await this.prisma.paymentTransaction.update({ where: { id: txn.id }, data: { checkedAt: now } });
            return 'UNVERIFIED';
        }
    }

    async orderIdOf(txnRef: string) {
        const t = await this.prisma.paymentTransaction.findUnique({ where: { txnRef }, select: { orderId: true } });
        return t?.orderId ?? null;
    }

    private pendingOf(orderId: string) {
        return this.prisma.paymentTransaction.findMany({ where: { orderId, status: 'PENDING' }, orderBy: { createdAt: 'asc' } });
    }

    /**
     * Trước khi huỷ đơn VNPAY: chốt các giao dịch đang treo với VNPAY để không huỷ nhầm đơn khách vừa trả tiền.
     * Không hỏi được VNPAY thì vẫn cho huỷ — nếu tiền về sau đó, applyResult giữ đơn đã huỷ và đánh dấu hoàn tiền.
     */
    async settleBeforeCancel(orderId: string) {
        for (const t of await this.pendingOf(orderId)) {
            try {
                await this.reconcile(t);
            } catch (e) {
                if (!(e instanceof VnpayQueryError)) throw e;
                this.logger.warn(`Huỷ đơn khi chưa chốt được ${t.txnRef}: ${e.message}`);
            }
        }
    }

    async repay(userId: string, orderId: string, ip: string) {
        const load = () => this.prisma.order.findFirst({
            where: { id: orderId, userId },
            select: { id: true, code: true, total: true, status: true, paymentMethod: true, paymentStatus: true },
        });
        const order = await load();
        if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
        if (order.paymentMethod !== 'VNPAY') throw new BadRequestException('Đơn này không dùng VNPAY');
        if (order.paymentStatus === 'PAID') throw new BadRequestException('Đơn đã được thanh toán');
        if (order.status !== 'PENDING') throw new BadRequestException('Đơn không thể thanh toán lại');

        const pending = await this.pendingOf(orderId);
        const reusable = pending.at(-1);
        if (reusable?.paymentUrl && reusable.expiresAt.getTime() - Date.now() > REUSE_MARGIN_MS) {
            return { paymentUrl: reusable.paymentUrl };
        }
        // Có lần thanh toán đang treo → hỏi VNPAY trước, tránh khách trả lần 2 khi lần trước thật ra đã thành công.
        // Không hỏi được thì vẫn mở lần mới: link cũ sắp/đã hết hạn, nếu cả 2 lần đều có tiền thì lần sau bị đánh dấu hoàn tiền.
        for (const t of pending) {
            try {
                if ((await this.reconcile(t)) === 'PAID') throw new BadRequestException('Đơn đã được thanh toán thành công trước đó');
            } catch (e) {
                if (!(e instanceof VnpayQueryError)) throw e;
                this.logger.warn(`Thanh toán lại khi chưa chốt được ${t.txnRef}: ${e.message}`);
            }
        }

        const fresh = await load();
        if (!fresh || fresh.paymentStatus === 'PAID') throw new BadRequestException('Đơn đã được thanh toán');
        if (fresh.status !== 'PENDING') throw new BadRequestException('Đơn không thể thanh toán lại');

        try {
            return await this.prisma.$transaction(async (tx) => {
                // Khoá dòng đơn: 2 lần bấm "Thanh toán lại" cùng lúc phải xếp hàng, lần sau thấy link lần trước vừa tạo
                await tx.$queryRaw`SELECT id FROM orders WHERE id = ${orderId} FOR UPDATE`;
                const live = await tx.paymentTransaction.findFirst({
                    where: { orderId, status: 'PENDING', expiresAt: { gt: new Date(Date.now() + REUSE_MARGIN_MS) } },
                    orderBy: { createdAt: 'desc' },
                });
                if (live?.paymentUrl) return { paymentUrl: live.paymentUrl };
                const attemptNo = (await tx.paymentTransaction.count({ where: { orderId } })) + 1;
                const paymentUrl = await this.createAttempt(tx, fresh, ip, attemptNo);
                await tx.order.updateMany({
                    where: { id: orderId, status: 'PENDING', paymentStatus: { not: 'PAID' } },
                    data: { paymentStatus: 'PENDING' },
                });
                return { paymentUrl };
            });
        } catch (e) {
            // Bấm "Thanh toán lại" 2 lần cùng lúc → cùng số lần thử → trùng txnRef: trả link của request thắng
            if (!isUniqueViolation(e)) throw e;
            const latest = await this.prisma.paymentTransaction.findFirst({
                where: { orderId, status: 'PENDING' },
                orderBy: { createdAt: 'desc' },
            });
            if (!latest?.paymentUrl) throw e;
            return { paymentUrl: latest.paymentUrl };
        }
    }
}
