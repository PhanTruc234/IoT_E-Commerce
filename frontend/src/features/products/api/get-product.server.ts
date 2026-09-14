import { env } from '@/shared/config/env';
import type { PublicProductDetail } from '../types';

export async function getPublicProduct(slug: string): Promise<PublicProductDetail | null> {
    const res = await fetch(`${env.apiUrl}/products/slug/${encodeURIComponent(slug)}`, {
        next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
}