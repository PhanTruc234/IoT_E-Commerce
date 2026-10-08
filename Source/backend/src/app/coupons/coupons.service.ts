import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Coupon, CouponType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

export interface CouponBreakdown {
    productCoupon: Coupon | null;
    shippingCoupon: Coupon | null;
    discountAmount: number;
    shippingDiscount: number;
    errors: { product?: string; shipping?: string };
}

@Injectable()
export class CouponsService {
    constructor(private readonly prisma: PrismaService) { }

    private norm(code: string) { return code.trim().toUpperCase(); }

    private async validate(coupon: Coupon | null, expected: CouponType, subtotal: number, userId: string): Promise<string | null> {
        if (!coupon) return 'Mã không tồn tại';
        if (coupon.type !== expected)
            return expected === 'PRODUCT_DISCOUNT' ? 'Đây không phải mã giảm tiền hàng' : 'Đây không phải mã miễn phí vận chuyển';
        if (!coupon.isActive) return 'Mã đã ngừng áp dụng';
        const now = new Date();
        if (coupon.startAt && now < coupon.startAt) return 'Mã chưa tới thời gian áp dụng';
        if (coupon.endAt && now > coupon.endAt) return 'Mã đã hết hạn';
        if (subtotal < coupon.minOrder) return `Đơn tối thiểu ${coupon.minOrder.toLocaleString('vi-VN')}đ`;
        if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) return 'Mã đã hết lượt';
        // Flash sale: chỉ người đã săn (có UserCoupon) mới được dùng → đảm bảo đúng số lượng phát
        if (coupon.isFlashSale) {
            const owned = await this.prisma.userCoupon.findUnique({ where: { userId_couponId: { userId, couponId: coupon.id } } });
            if (!owned) return 'Mã này cần được săn trong khung giờ trước khi dùng';
        }
        const usedByUser = await this.prisma.userCoupon.count({ where: { userId, couponId: coupon.id, usedAt: { not: null } } });
        if (usedByUser >= coupon.perUserLimit) return 'Bạn đã dùng hết lượt cho mã này';
        return null;
    }

    private calcProductDiscount(c: Coupon, subtotal: number): number {
        let amount = c.discountType === 'PERCENT' ? Math.floor((subtotal * c.value) / 100) : c.value;
        if (c.discountType === 'PERCENT' && c.maxDiscount != null) amount = Math.min(amount, c.maxDiscount);
        return Math.min(amount, subtotal);
    }

    private calcShippingDiscount(c: Coupon, shippingFee: number): number {
        const d = c.value > 0 ? Math.min(c.value, shippingFee) : shippingFee;
        return Math.min(d, shippingFee);
    }
    async resolve(userId: string, subtotal: number, shippingFee: number, productCode?: string, shippingCode?: string): Promise<CouponBreakdown> {
        const res: CouponBreakdown = { productCoupon: null, shippingCoupon: null, discountAmount: 0, shippingDiscount: 0, errors: {} };

        if (productCode) {
            const c = await this.prisma.coupon.findUnique({ where: { code: this.norm(productCode) } });
            const err = await this.validate(c, 'PRODUCT_DISCOUNT', subtotal, userId);
            if (err) res.errors.product = err;
            else { res.productCoupon = c; res.discountAmount = this.calcProductDiscount(c!, subtotal); }
        }
        if (shippingCode) {
            const c = await this.prisma.coupon.findUnique({ where: { code: this.norm(shippingCode) } });
            const err = await this.validate(c, 'FREE_SHIPPING', subtotal, userId);
            if (err) res.errors.shipping = err;
            else { res.shippingCoupon = c; res.shippingDiscount = this.calcShippingDiscount(c!, shippingFee); }
        }
        return res;
    }

    async quote(userId: string, subtotal: number, shippingFee: number, productCode?: string, shippingCode?: string) {
        const r = await this.resolve(userId, subtotal, shippingFee, productCode, shippingCode);
        const total = Math.max(0, subtotal - r.discountAmount + (shippingFee - r.shippingDiscount));
        return {
            discountAmount: r.discountAmount,
            shippingDiscount: r.shippingDiscount,
            total,
            errors: r.errors,
            productCode: r.productCoupon?.code ?? null,
            shippingCode: r.shippingCoupon?.code ?? null,
        };
    }

    /** Đánh dấu đã dùng — gọi trong transaction đặt hàng. */
    async markUsed(tx: Prisma.TransactionClient, couponId: string, userId: string, orderId: string) {
        await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
        await tx.userCoupon.upsert({
            where: { userId_couponId: { userId, couponId } },
            create: { userId, couponId, usedAt: new Date(), orderId },
            update: { usedAt: new Date(), orderId },
        });
    }

    // ----- Ví mã (khách) -----
    async save(userId: string, code: string) {
        const c = await this.prisma.coupon.findUnique({ where: { code: this.norm(code) } });
        if (!c) throw new NotFoundException('Mã không tồn tại');
        if (!c.isActive) throw new BadRequestException('Mã đã ngừng áp dụng');
        if (c.isFlashSale) throw new BadRequestException('Mã săn giới hạn — vui lòng vào trang "Săn mã" để lấy');
        if (c.endAt && new Date() > c.endAt) throw new BadRequestException('Mã đã hết hạn');
        await this.prisma.userCoupon.upsert({
            where: { userId_couponId: { userId, couponId: c.id } },
            create: { userId, couponId: c.id },
            update: {},
        });
        return { saved: true };
    }

    async my(userId: string) {
        const rows = await this.prisma.userCoupon.findMany({
            where: { userId },
            include: { coupon: true },
            orderBy: { coupon: { endAt: 'asc' } },
        });
        const now = Date.now();
        return rows.map((r) => {
            const c = r.coupon;
            const expired = (!!c.endAt && new Date(c.endAt).getTime() < now) || !c.isActive;
            const status = r.usedAt ? 'USED' : expired ? 'EXPIRED' : 'ACTIVE';
            return {
                id: c.id, code: c.code, description: c.description, type: c.type,
                discountType: c.discountType, value: c.value, maxDiscount: c.maxDiscount,
                minOrder: c.minOrder, endAt: c.endAt, status,
            };
        });
    }

    // ----- Flash sale (săn mã theo khung giờ) -----
    async flashList(userId: string) {
        const now = new Date();
        const coupons = await this.prisma.coupon.findMany({
            where: { isFlashSale: true, isActive: true, OR: [{ claimEndAt: null }, { claimEndAt: { gte: now } }] },
            orderBy: { claimStartAt: 'asc' },
        });
        const mine = await this.prisma.userCoupon.findMany({
            where: { userId, couponId: { in: coupons.map((c) => c.id) } },
            select: { couponId: true },
        });
        const claimedSet = new Set(mine.map((m) => m.couponId));
        return coupons.map((c) => {
            const remaining = c.claimLimit != null ? Math.max(0, c.claimLimit - c.claimedCount) : null;
            let status: 'UPCOMING' | 'LIVE' | 'SOLD_OUT';
            if (c.claimStartAt && now < c.claimStartAt) status = 'UPCOMING';
            else if (remaining != null && remaining <= 0) status = 'SOLD_OUT';
            else status = 'LIVE';
            const mine = claimedSet.has(c.id);
            return {
                id: c.id, code: mine ? c.code : null, description: c.description, type: c.type,
                discountType: c.discountType, value: c.value, maxDiscount: c.maxDiscount, minOrder: c.minOrder,
                claimStartAt: c.claimStartAt, claimEndAt: c.claimEndAt, endAt: c.endAt,
                claimLimit: c.claimLimit, claimedCount: c.claimedCount, remaining,
                status, claimed: mine,
            };
        });
    }

    async claim(userId: string, couponId: string) {
        const c = await this.prisma.coupon.findUnique({ where: { id: couponId } });
        if (!c || !c.isFlashSale) throw new NotFoundException('Mã săn không tồn tại');
        if (!c.isActive) throw new BadRequestException('Mã đã ngừng áp dụng');
        const now = new Date();
        if (c.claimStartAt && now < c.claimStartAt) throw new BadRequestException('Chưa tới giờ săn mã');
        if (c.claimEndAt && now > c.claimEndAt) throw new BadRequestException('Đã hết giờ săn mã');

        const existing = await this.prisma.userCoupon.findUnique({ where: { userId_couponId: { userId, couponId } } });
        if (existing) throw new BadRequestException('Bạn đã lấy mã này rồi');

        try {
            await this.prisma.$transaction(async (tx) => {
                const upd = await tx.coupon.updateMany({
                    where: { id: couponId, ...(c.claimLimit != null ? { claimedCount: { lt: c.claimLimit } } : {}) },
                    data: { claimedCount: { increment: 1 } },
                });
                if (upd.count === 0) throw new BadRequestException('Mã đã được săn hết');
                await tx.userCoupon.create({ data: { userId, couponId } });
            });
        } catch (e) {
            if (e instanceof BadRequestException) throw e;
            if ((e as { code?: string })?.code === 'P2002') throw new BadRequestException('Bạn đã lấy mã này rồi');
            throw e;
        }
        return { claimed: true };
    }

    private toData(dto: CreateCouponDto | UpdateCouponDto) {
        return {
            ...dto,
            code: dto.code ? this.norm(dto.code) : undefined,
            startAt: dto.startAt ? new Date(dto.startAt) : undefined,
            endAt: dto.endAt ? new Date(dto.endAt) : undefined,
            claimStartAt: dto.claimStartAt ? new Date(dto.claimStartAt) : undefined,
            claimEndAt: dto.claimEndAt ? new Date(dto.claimEndAt) : undefined,
        } as any;
    }

    adminList() {
        return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    }

    async adminCreate(dto: CreateCouponDto) {
        const exists = await this.prisma.coupon.findUnique({ where: { code: this.norm(dto.code) } });
        if (exists) throw new BadRequestException('Mã đã tồn tại');
        return this.prisma.coupon.create({ data: this.toData(dto) });
    }

    async adminUpdate(id: string, dto: UpdateCouponDto) {
        const c = await this.prisma.coupon.findUnique({ where: { id } });
        if (!c) throw new NotFoundException('Không tìm thấy mã');
        return this.prisma.coupon.update({ where: { id }, data: this.toData(dto) });
    }

    async adminRemove(id: string) {
        await this.prisma.coupon.delete({ where: { id } });
        return { deleted: true };
    }
}