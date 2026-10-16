import { env } from '@/shared/config/env';
import type { ActivePromotion } from './promotions.api';
export async function getActivePromotions(): Promise<ActivePromotion[]> {
    try {
        const res = await fetch(`${env.apiUrl}/promotions/active`, {
            next: { revalidate: 60 },
            signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) return [];
        return (await res.json()) as ActivePromotion[];
    } catch {
        return [];
    }
}
