import type { MetadataRoute } from 'next';
import { env } from '@/shared/config/env';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin', '/checkout', '/account', '/orders', '/cart', '/login', '/register'],
            },
        ],
        sitemap: `${env.siteUrl}/sitemap.xml`,
        host: env.siteUrl,
    };
}
