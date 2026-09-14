import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicProduct } from '@/features/products/api/get-product.server';
import { ProductDetailView } from '@/features/products/components/product-detail-view';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const product = await getPublicProduct(slug);
    if (!product) return { title: 'Không tìm thấy sản phẩm' };
    const desc =
        product.description?.replace(/\s+/g, ' ').trim().slice(0, 160) || `Mua ${product.name} chính hãng tại IoT Store.`;
    const img = product.images[0]?.imageUrl;
    return {
        title: product.name,
        description: desc,
        alternates: { canonical: `/products/${product.slug}` },
        openGraph: {
            type: 'website',
            title: product.name,
            description: desc,
            url: `/products/${product.slug}`,
            images: img ? [img] : [],
        },
    };
}

export default async function ProductDetailPage({ params }: Props) {
    const { slug } = await params;
    const product = await getPublicProduct(slug);
    if (!product) notFound();

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.images.map((i) => i.imageUrl),
        description: product.description ?? undefined,
        sku: product.sku,
        brand: product.brand ? { '@type': 'Brand', name: product.brand.name } : undefined,
        offers: {
            '@type': 'Offer',
            priceCurrency: 'VND',
            price: product.salePrice ?? product.price,
            availability: product.stockQuantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        },
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <ProductDetailView product={product} />
        </>
    );
}