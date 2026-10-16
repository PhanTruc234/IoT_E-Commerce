import { formatVnd } from '@/shared/lib/format';
import type { FlashCoupon } from '../api/coupons.api';

export function shortMoney(v: number) {
    if (v >= 1_000_000) return `${Number((v / 1_000_000).toFixed(1)).toLocaleString('vi-VN')}TR`;
    if (v >= 1000) return `${Number((v / 1000).toFixed(1)).toLocaleString('vi-VN')}K`;
    return `${v}đ`;
}

export function couponStub(c: FlashCoupon): { big: string; sub: string; freeship: boolean } {
    if (c.type === 'FREE_SHIPPING') return { big: 'FREESHIP', sub: c.value > 0 ? `Tối đa ${shortMoney(c.value)}` : '', freeship: true };
    if (c.discountType === 'PERCENT') {
        return { big: `${c.value}%`, sub: c.maxDiscount ? `Giảm tối đa ${shortMoney(c.maxDiscount)}` : 'Giảm ngay', freeship: false };
    }
    return { big: shortMoney(c.value), sub: 'Giảm ngay', freeship: false };
}

export function couponTitle(c: FlashCoupon) {
    if (c.type === 'FREE_SHIPPING') return c.value > 0 ? `Giảm ${formatVnd(c.value)} phí ship` : 'Miễn phí vận chuyển';
    return c.discountType === 'PERCENT' ? `Giảm ${c.value}%` : `Giảm ${formatVnd(c.value)}`;
}

export function couponMinOrder(c: FlashCoupon) {
    return c.minOrder > 0 ? `Đơn tối thiểu ${formatVnd(c.minOrder)}` : 'Áp dụng mọi đơn hàng';
}

export function couponScope(c: FlashCoupon) {
    return c.type === 'FREE_SHIPPING' ? 'Phí vận chuyển' : 'Tất cả sản phẩm';
}

export function couponClaimed(c: FlashCoupon) {
    return c.claimLimit != null ? `${c.claimedCount}/${c.claimLimit}` : `${c.claimedCount}`;
}

export function couponProgress(c: FlashCoupon) {
    return c.claimLimit ? Math.min(100, Math.round((c.claimedCount / c.claimLimit) * 100)) : 0;
}

export type CouponTheme = {
    gradient: string;
    soft: string;
    bar: string;
    shadow: string;
};

const THEMES: Record<'blue' | 'red' | 'orange' | 'purple' | 'gray', CouponTheme> = {
    blue: { gradient: 'from-[#3B7BFF] to-[#1D4ED8]', soft: 'bg-blue-50 text-blue-700', bar: 'from-[#3B7BFF] to-[#1D4ED8]', shadow: 'shadow-blue-600/30' },
    red: { gradient: 'from-[#FB4F6E] to-[#E11D48]', soft: 'bg-rose-50 text-rose-700', bar: 'from-[#FB4F6E] to-[#E11D48]', shadow: 'shadow-rose-600/30' },
    orange: { gradient: 'from-[#FDA34B] to-[#F97316]', soft: 'bg-orange-50 text-orange-700', bar: 'from-[#FDA34B] to-[#F97316]', shadow: 'shadow-orange-500/30' },
    purple: { gradient: 'from-[#B15CF7] to-[#7C3AED]', soft: 'bg-violet-50 text-violet-700', bar: 'from-[#B15CF7] to-[#7C3AED]', shadow: 'shadow-violet-600/30' },
    gray: { gradient: 'from-slate-300 to-slate-400', soft: 'bg-slate-100 text-slate-500', bar: 'from-slate-300 to-slate-400', shadow: 'shadow-slate-400/20' },
};

export function couponTheme(c: FlashCoupon, index: number): CouponTheme {
    if (c.status === 'SOLD_OUT') return THEMES.gray;
    if (c.type === 'FREE_SHIPPING') return THEMES.purple;
    return [THEMES.blue, THEMES.red, THEMES.orange][index % 3];
}
