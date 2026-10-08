import type { MetadataRoute } from 'next';
import { env } from '@/shared/config/env';

interface ProductRow {
    slug: string;
    createdAt: string;
}

async function fetchProducts(): Promise<ProductRow[]> {
    try {
        // Timeout 8s để không treo build khi backend ngủ / chưa sẵn sàng
        const res = await fetch(`${env.apiUrl}/products?limit=100&sort=newest`, {
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) {
            return [];
        }
        const data = await res.json();
        return (data.data ?? []) as ProductRow[];
    } catch {
        return [];
    }
}

// Sitemap tái tạo mỗi giờ (ISR) — khi backend thức sẽ tự thêm đủ sản phẩm
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const base = env.siteUrl;

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: `${base}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${base}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${base}/compare`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
        { url: `${base}/warranty`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    ];

    const products = await fetchProducts();
    const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
        url: `${base}/products/${p.slug}`,
        lastModified: p.createdAt ? new Date(p.createdAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    return [...staticRoutes, ...productRoutes];
}
