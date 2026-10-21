import { formatVnd } from '@/shared/lib/format';
import { discountBadge, type PriceQuote } from '../lib/pricing';

export function ProductPrice({ pricing, size = 'md', badge = true }: { pricing: PriceQuote; size?: 'sm' | 'md' | 'lg'; badge?: boolean }) {
    const { listPrice, finalPrice } = pricing;
    const hasDiscount = finalPrice < listPrice;
    const saleCls = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-base';

    return (
        <div className="flex flex-wrap items-baseline gap-2">
            <span className={`font-bold text-red-600 ${saleCls}`}>{formatVnd(finalPrice)}</span>
            {hasDiscount && <span className="text-xs text-gray-400 line-through">{formatVnd(listPrice)}</span>}
            {hasDiscount && badge && <span className="rounded bg-red-500 px-1.5 py-0.5 text-[11px] font-semibold text-white">{discountBadge(listPrice, finalPrice)}</span>}
            {hasDiscount && pricing.promotion && size === 'lg' && <span className="text-xs text-red-500">{pricing.promotion.name}</span>}
        </div>
    );
}
