import { Injectable } from '@nestjs/common';
import { PromoRule, PromotionsService } from './promotions.service';

export type PriceSource = 'NONE' | 'SALE' | 'PROMOTION';

/** Kết quả tính giá — dùng chung cho API sản phẩm, giỏ hàng, đơn hàng (giá ở mọi nơi phải bằng nhau). */
export interface PriceQuote {
    /** Giá niêm yết (giá gốc) */
    listPrice: number;
    /** Giá khách trả */
    finalPrice: number;
    discountPercent: number;
    source: PriceSource;
    promotion: { id: string; name: string } | null;
}

export interface PriceTarget {
    productId: string;
    categoryId: string | null;
    price: number;
    salePrice: number | null;
}

function promoPrice(r: PromoRule, list: number) {
    let cand = r.discountType === 'PERCENT' ? list - Math.floor((list * r.value) / 100) : list - r.value;
    if (r.discountType === 'PERCENT' && r.maxDiscount != null) cand = Math.max(cand, list - r.maxDiscount);
    return Math.max(0, cand);
}

export function ruleMatches(r: PromoRule, t: Pick<PriceTarget, 'productId' | 'categoryId'>) {
    if (r.excludedProductIds.includes(t.productId)) return false;
    return r.scope === 'ALL'
        || (r.scope === 'PRODUCT' && r.productIds.includes(t.productId))
        || (r.scope === 'CATEGORY' && !!t.categoryId && r.categoryIds.includes(t.categoryId));
}

/**
 * Hàm tính giá DUY NHẤT của hệ thống. Ưu đãi không cộng dồn: giảm giá riêng của sản phẩm (salePrice)
 * và mỗi chiến dịch đều tính trên giá gốc.
 *  1. Có chiến dịch hợp lệ bật "Ưu tiên bắt buộc" → áp chiến dịch đó dù giá không thấp nhất;
 *     nhiều chiến dịch cùng bật → chọn priority cao nhất (bằng nhau thì lấy giá thấp hơn).
 *  2. Không có → chọn giá thấp nhất giữa giảm riêng và các chiến dịch (bằng giá thì ưu tiên chiến dịch priority cao).
 * Chiến dịch không áp cho sản phẩm nằm trong danh sách loại trừ của nó.
 */
export function quotePrice(rules: PromoRule[], t: PriceTarget): PriceQuote {
    const list = t.price;
    type Cand = { price: number; source: PriceSource; promotion: PriceQuote['promotion']; priority: number; forced: boolean };
    const cands: Cand[] = [];
    if (t.salePrice != null && t.salePrice < list) {
        cands.push({ price: t.salePrice, source: 'SALE', promotion: null, priority: -Infinity, forced: false });
    }
    for (const r of rules) {
        if (!ruleMatches(r, t)) continue;
        cands.push({ price: promoPrice(r, list), source: 'PROMOTION', promotion: { id: r.id, name: r.name }, priority: r.priority, forced: r.forcePriority });
    }
    const forced = cands.filter((c) => c.forced);
    const pool = forced.length ? forced : cands;
    const pick = [...pool].sort((a, b) => (forced.length
        ? b.priority - a.priority || a.price - b.price
        : a.price - b.price || b.priority - a.priority))[0];
    const best = pick && pick.price < list
        ? pick
        : { price: list, source: 'NONE' as const, promotion: null };
    return {
        listPrice: list,
        finalPrice: best.price,
        discountPercent: list > 0 ? Math.round((1 - best.price / list) * 100) : 0,
        source: best.source,
        promotion: best.promotion,
    };
}

type Priced = { id: string; categoryId: string | null; price: number; salePrice: number | null };

@Injectable()
export class PricingService {
    constructor(private readonly promotions: PromotionsService) { }

    /** Luật khuyến mại đang chạy — lấy 1 lần cho cả request rồi truyền vào quote(). */
    rules() {
        return this.promotions.getActiveRules();
    }

    quote(rules: PromoRule[], t: PriceTarget) {
        return quotePrice(rules, t);
    }

    /** Gắn `pricing` cho sản phẩm (và từng phân loại nếu có) để trả về client. */
    attach<P extends Priced & { variants?: { price: number; salePrice: number | null }[] }>(rules: PromoRule[], p: P) {
        const base = { productId: p.id, categoryId: p.categoryId };
        return {
            ...p,
            pricing: quotePrice(rules, { ...base, price: p.price, salePrice: p.salePrice }),
            ...(p.variants
                ? { variants: p.variants.map((v) => ({ ...v, pricing: quotePrice(rules, { ...base, price: v.price, salePrice: v.salePrice }) })) }
                : {}),
        };
    }
}
