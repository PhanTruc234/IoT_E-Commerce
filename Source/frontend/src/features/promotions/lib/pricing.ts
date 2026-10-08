import { formatVnd } from '@/shared/lib/format';
import type { ActivePromotion } from '../api/promotions.api';

export interface PriceInput { id: string; price: number; salePrice?: number | null; categoryId?: string | null }

export function effectivePrice(rules: ActivePromotion[], p: PriceInput): { original: number; final: number; hasDiscount: boolean } {
    let best = p.salePrice != null && p.salePrice < p.price ? p.salePrice : p.price;
    for (const r of rules) {
        const match = r.scope === 'ALL'
            || (r.scope === 'PRODUCT' && r.productIds.includes(p.id))
            || (r.scope === 'CATEGORY' && !!p.categoryId && r.categoryIds.includes(p.categoryId));
        if (!match) continue;
        let cand = r.discountType === 'PERCENT' ? p.price - Math.floor((p.price * r.value) / 100) : p.price - r.value;
        if (r.discountType === 'PERCENT' && r.maxDiscount != null) cand = Math.max(cand, p.price - r.maxDiscount);
        cand = Math.max(0, cand);
        if (cand < best) best = cand;
    }
    return { original: p.price, final: best, hasDiscount: best < p.price };
}

export function discountBadge(original: number, final: number): string {
    const pct = Math.round((1 - final / original) * 100);
    const amount = original - final;
    return original < 100000 ? `-${pct}%` : `-${formatVnd(amount)}`;
}