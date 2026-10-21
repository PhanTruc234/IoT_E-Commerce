import { formatVnd } from '@/shared/lib/format';

/** Giá do backend tính (hàm tính giá chung) — frontend chỉ hiển thị, không tự tính lại. */
export interface PriceQuote {
    listPrice: number;
    finalPrice: number;
    discountPercent: number;
    source: 'NONE' | 'SALE' | 'PROMOTION';
    promotion: { id: string; name: string } | null;
}

export function discountBadge(original: number, final: number): string {
    const pct = Math.round((1 - final / original) * 100);
    const amount = original - final;
    return original < 100000 ? `-${pct}%` : `-${formatVnd(amount)}`;
}
