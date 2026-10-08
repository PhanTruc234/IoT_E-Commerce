'use client';
import { formatVnd } from '@/shared/lib/format';
import { useActivePromotions } from '../hooks/use-promotions';
import { effectivePrice, discountBadge, type PriceInput } from '../lib/pricing';

export function ProductPrice({ product, size = 'md' }: { product: PriceInput; size?: 'sm' | 'md' | 'lg' }) {
    const { data: rules } = useActivePromotions();
    const { original, final, hasDiscount } = effectivePrice(rules ?? [], product);
    const saleCls = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-base';

    return (
        <div className="flex flex-wrap items-baseline gap-2">
            <span className={`font-bold text-red-600 ${saleCls}`}>{formatVnd(final)}</span>
            {hasDiscount && <span className="text-xs text-gray-400 line-through">{formatVnd(original)}</span>}
            {hasDiscount && <span className="rounded bg-red-500 px-1.5 py-0.5 text-[11px] font-semibold text-white">{discountBadge(original, final)}</span>}
        </div>
    );
}