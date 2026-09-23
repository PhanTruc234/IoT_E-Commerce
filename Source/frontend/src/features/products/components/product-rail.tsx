'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { usePublicProducts } from '../hooks/use-storefront';
import { ProductCard } from './product-card';
import type { ProductSortKey } from '../types';

export function ProductRail({ title, sort, viewAllHref }: { title: string; sort: ProductSortKey; viewAllHref: string }) {
    const { data, isLoading } = usePublicProducts({ limit: 10, sort });
    const items = data?.data ?? [];

    return (
        <section className="mx-auto max-w-7xl px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                <Link href={viewAllHref} className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
                    Xem tất cả <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-xl bg-gray-100" />)}
                </div>
            ) : items.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">Chưa có sản phẩm.</p>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {items.slice(0, 10).map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
            )}
        </section>
    );
}
