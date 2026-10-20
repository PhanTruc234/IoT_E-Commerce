import { BadRequestException, Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IdempotencyRecord, Prisma } from '@prisma/client';
import { createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

/** Key được giữ ... giờ — đủ cho mọi lần gửi lại do mạng/timeout */
const TTL_MS = 24 * 60 * 60 * 1000;
const KEY_PATTERN = /^[A-Za-z0-9_-]{8,100}$/;

export interface IdempotencyContext {
    userId: string;
    scope: string;
    key: string;
    requestHash: string;
}

function canonical(v: unknown): unknown {
    if (Array.isArray(v)) return v.map(canonical);
    if (v && typeof v === 'object') {
        return Object.fromEntries(Object.keys(v).sort().filter((k) => (v as Record<string, unknown>)[k] !== undefined)
            .map((k) => [k, canonical((v as Record<string, unknown>)[k])]));
    }
    return v;
}

/**
 * Idempotency cho các request "tạo mới" không có định danh tự nhiên (client gửi header Idempotency-Key).
 * Cách dùng: begin() → nếu có record thì trả lại kết quả cũ; không thì chạy nghiệp vụ, gọi claim() ĐẦU TIÊN
 * trong transaction và attach() trước khi commit; lỗi thì gọi recover() để xem request song song đã thắng chưa.
 */
@Injectable()
export class IdempotencyService {
    private readonly logger = new Logger(IdempotencyService.name);

    constructor(private readonly prisma: PrismaService) { }

    /** Header không gửi → null (client cũ vẫn chạy như trước); gửi sai định dạng → 400. */
    context(userId: string, scope: string, rawKey: string | undefined, body: unknown): IdempotencyContext | null {
        if (rawKey === undefined || rawKey === '') return null;
        if (!KEY_PATTERN.test(rawKey)) throw new BadRequestException('Idempotency-Key không hợp lệ');
        const requestHash = createHash('sha256').update(JSON.stringify(canonical(body))).digest('hex');
        return { userId, scope, key: rawKey, requestHash };
    }

    /** Record đã có (request trước đã thành công) → trả về để dựng lại kết quả; khác nội dung → 422. */
    async find(ctx: IdempotencyContext): Promise<IdempotencyRecord | null> {
        const rec = await this.prisma.idempotencyRecord.findUnique({
            where: { userId_scope_key: { userId: ctx.userId, scope: ctx.scope, key: ctx.key } },
        });
        if (rec && rec.requestHash !== ctx.requestHash) {
            throw new UnprocessableEntityException('Mã yêu cầu này đã được dùng cho một đơn khác, vui lòng tải lại trang');
        }
        return rec;
    }

    /**
     * Giữ key — gọi đầu tiên trong transaction. Request song song cùng key sẽ chờ ở đây tới khi request kia
     * commit rồi nhận P2002, nên không kịp trừ kho/dùng coupon/xoá giỏ.
     */
    async claim(tx: Prisma.TransactionClient, ctx: IdempotencyContext) {
        const rec = await tx.idempotencyRecord.create({
            data: { ...ctx, expiresAt: new Date(Date.now() + TTL_MS) },
            select: { id: true },
        });
        return rec.id;
    }

    attach(tx: Prisma.TransactionClient, id: string, resourceId: string) {
        return tx.idempotencyRecord.update({ where: { id }, data: { resourceId } });
    }

    /** Request lỗi (kể cả P2002, "giỏ trống", "hết hàng"): nếu request cùng key đã thành công thì trả record đó. */
    async recover(ctx: IdempotencyContext | null, error: unknown): Promise<IdempotencyRecord> {
        if (!ctx) throw error;
        const rec = await this.find(ctx);
        if (!rec?.resourceId) throw error;
        return rec;
    }

    @Cron(CronExpression.EVERY_DAY_AT_4AM)
    async cleanup() {
        const { count } = await this.prisma.idempotencyRecord.deleteMany({ where: { expiresAt: { lt: new Date() } } });
        if (count) this.logger.log(`Xoá ${count} idempotency key hết hạn`);
    }
}
