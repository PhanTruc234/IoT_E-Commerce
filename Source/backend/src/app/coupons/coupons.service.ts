import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Coupon, CouponType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PricingService } from '../promotions/pricing.service';
import { TaxService } from '../tax/tax.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

/** Dòng hàng đã tính giá — `discounted` = đang được giảm riêng / khuyến mại */
export interface CouponLine { lineTotal: number; discounted: boolean }

export interface CouponBreakdown {
    productCoupon: Coupon | null;
    shippingCoupon: Coupon | null;
    discountAmount: number;
    shippingDiscount: number;
    errors: { product?: string; shipping?: string };
}

@Injectable()
export class CouponsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly pricing: PricingService,
        private readonly tax: TaxService,
    ) { }

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
    /**
     * `lines` (nếu có): mã bật "không áp cho SP đang giảm" chỉ tính trên các dòng không được giảm —
     * cả điều kiện đơn tối thiểu lẫn số tiền giảm.
     */
    async resolve(userId: string, subtotal: number, shippingFee: number, productCode?: string, shippingCode?: string, lines?: CouponLine[]): Promise<CouponBreakdown> {
        const res: CouponBreakdown = { productCoupon: null, shippingCoupon: null, discountAmount: 0, shippingDiscount: 0, errors: {} };

        if (productCode) {
            const c = await this.prisma.coupon.findUnique({ where: { code: this.norm(productCode) } });
            const base = c?.excludeDiscounted && lines ? lines.filter((l) => !l.discounted).reduce((s, l) => s + l.lineTotal, 0) : subtotal;
            const err = c?.excludeDiscounted && lines && base === 0
                ? 'Mã không áp dụng cho sản phẩm đang được giảm giá'
                : await this.validate(c, 'PRODUCT_DISCOUNT', base, userId);
            if (err) res.errors.product = err;
            else { res.productCoupon = c; res.discountAmount = this.calcProductDiscount(c!, base); }
        }
        if (shippingCode) {
            const c = await this.prisma.coupon.findUnique({ where: { code: this.norm(shippingCode) } });
            const err = await this.validate(c, 'FREE_SHIPPING', subtotal, userId);
            if (err) res.errors.shipping = err;
            else { res.shippingCoupon = c; res.shippingDiscount = this.calcShippingDiscount(c!, shippingFee); }
        }
        return res;
    }

    /** Tính giá các dòng hàng client gửi lên bằng hàm tính giá chung (không tin giá từ client). */
    private async linesOf(items: { productId: string; variantId?: string; quantity: number }[]): Promise<CouponLine[]> {
        const [products, variants, rules] = await Promise.all([
            this.prisma.product.findMany({ where: { id: { in: items.map((i) => i.productId) } }, select: { id: true, categoryId: true, price: true, salePrice: true } }),
            this.prisma.productVariant.findMany({ where: { id: { in: items.flatMap((i) => (i.variantId ? [i.variantId] : [])) } }, select: { id: true, price: true, salePrice: true } }),
            this.pricing.rules(),
        ]);
        const pm = new Map(products.map((p) => [p.id, p]));
        const vm = new Map(variants.map((v) => [v.id, v]));
        return items.flatMap((i) => {
            const p = pm.get(i.productId);
            if (!p) return [];
            const v = i.variantId ? vm.get(i.variantId) : undefined;
            const q = this.pricing.quote(rules, { productId: p.id, categoryId: p.categoryId, price: v?.price ?? p.price, salePrice: v ? v.salePrice : p.salePrice });
            return [{ lineTotal: q.finalPrice * i.quantity, discounted: q.source !== 'NONE' }];
        });
    }

    async quote(userId: string, subtotal: number, shippingFee: number, productCode?: string, shippingCode?: string, items?: { productId: string; variantId?: string; quantity: number }[]) {
        const lines = items?.length ? await this.linesOf(items) : undefined;
        const r = await this.resolve(userId, subtotal, shippingFee, productCode, shippingCode, lines);
        // Cùng công thức với lúc tạo đơn: VAT tính trên tiền hàng sau giảm + phí ship sau giảm
        const vat = await this.tax.compute(Math.max(0, subtotal - r.discountAmount + (shippingFee - r.shippingDiscount)));
        return {
            discountAmount: r.discountAmount,
            shippingDiscount: r.shippingDiscount,
            total: vat.total,
            taxRate: vat.taxRate,
            taxAmount: vat.taxAmount,
            pricesIncludeTax: vat.pricesIncludeTax,
            errors: r.errors,
            productCode: r.productCoupon?.code ?? null,
            shippingCode: r.shippingCoupon?.code ?? null,
        };
    }

    /**
     * Đánh dấu đã dùng — gọi trong transaction đặt hàng.
     * Cập nhật có điều kiện: 2 đơn đặt cùng lúc với 1 mã thì đơn sau bị rollback thay vì vượt lượt dùng.
     */
    async markUsed(tx: Prisma.TransactionClient, couponId: string, userId: string, orderId: string) {
        const c = await tx.coupon.findUniqueOrThrow({ where: { id: couponId }, select: { code: true, usageLimit: true } });
        const taken = await tx.coupon.updateMany({
            where: { id: couponId, ...(c.usageLimit != null ? { usedCount: { lt: c.usageLimit } } : {}) },
            data: { usedCount: { increment: 1 } },
        });
        if (!taken.count) throw new ConflictException(`Mã ${c.code} vừa hết lượt sử dụng`);

        const usedAt = new Date();
        const claimed = await tx.userCoupon.updateMany({ where: { userId, couponId, usedAt: null }, data: { usedAt, orderId } });
        if (claimed.count) return;
        try {
            await tx.userCoupon.create({ data: { userId, couponId, usedAt, orderId } });
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                throw new ConflictException(`Bạn đã dùng mã ${c.code} rồi`);
            }
            throw e;
        }
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
                minOrder: c.minOrder, endAt: c.endAt, status, excludeDiscounted: c.excludeDiscounted,
            };
        });
    }

    // ----- Flash sale (săn mã theo khung giờ) -----
    async flashList(userId?: string) {
        const now = new Date();
        const coupons = await this.prisma.coupon.findMany({
            where: { isFlashSale: true, isActive: true, OR: [{ claimEndAt: null }, { claimEndAt: { gte: now } }] },
            orderBy: { claimStartAt: 'asc' },
        });
        // Khách chưa đăng nhập: không có mã nào "đã lấy"
        const mine = userId
            ? await this.prisma.userCoupon.findMany({
                where: { userId, couponId: { in: coupons.map((c) => c.id) } },
                select: { couponId: true },
            })
            : [];
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
                excludeDiscounted: c.excludeDiscounted,
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