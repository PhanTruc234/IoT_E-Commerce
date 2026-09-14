import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProductListView } from '@/features/products/components/product-list-view';

export const metadata: Metadata = {
    title: 'Tất cả sản phẩm',
    description: 'Thiết bị IoT, module, cảm biến, Arduino/ESP32 và linh kiện điện tử chính hãng.',
    alternates: { canonical: '/products' },
};

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10 text-sm text-gray-400">Đang tải sản phẩm…</div>}>
            <ProductListView />
        </Suspense>
    );
}