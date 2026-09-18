import type { MetadataRoute } from 'next';
import { env } from '@/shared/config/env';

interface ProductRow {
    slug: string;
    createdAt: string;
}

async function fetchProducts(): Promise<ProductRow[]> {
    try {
        const res = await fetch(`${env.apiUrl}/products?limit=100&sort=newest`, { next: { revalidate: 3600 } });
        if (!res.ok) {
            return [];
        }
        const data = await res.json();
        return (data.data ?? []) as ProductRow[];
    } catch {
        return [];
    }
}

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
