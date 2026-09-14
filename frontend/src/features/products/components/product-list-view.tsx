'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { usePublicProducts } from '../hooks/use-storefront';
import { ProductCard } from './product-card';
import { ProductFilters, type FilterValue } from './product-filters';
import type { ProductSortKey } from '../types';
import { track } from '@/features/analytics/api/events.api';

const SORTS: { key: ProductSortKey; label: string }[] = [
    { key: 'newest', label: 'Mới nhất' },
    { key: 'price_asc', label: 'Giá thấp → cao' },
    { key: 'price_desc', label: 'Giá cao → thấp' },
    { key: 'best_selling', label: 'Bán chạy' },
];
const LIMIT = 20;

export function ProductListView() {
    const router = useRouter();
    const sp = useSearchParams();

    const search = sp.get('search') ?? sp.get('q') ?? undefined;
    const categoryId = sp.get('categoryId') ?? undefined;
    const brandId = sp.get('brandId') ?? undefined;
    const minPrice = sp.get('minPrice') ?? undefined;
    const maxPrice = sp.get('maxPrice') ?? undefined;
    const sort = (sp.get('sort') as ProductSortKey) ?? 'newest';
    const page = Number(sp.get('page') ?? '1') || 1;

    const params = useMemo(
        () => ({
            page,
            limit: LIMIT,
            search,
            categoryId,
            brandId,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            sort,
        }),
        [page, search, categoryId, brandId, minPrice, maxPrice, sort],
    );

    const { data, isLoading, isError } = usePublicProducts(params);
    const lastTrackedCat = useRef<string | null>(null);
    useEffect(() => {
        if (categoryId && lastTrackedCat.current !== categoryId) {
            lastTrackedCat.current = categoryId;
            track({ type: 'VIEW_CATEGORY', categoryId });
        }
    }, [categoryId]);
    const setParams = (patch: Record<string, string | undefined>, resetPage = true) => {
        const next = new URLSearchParams(sp.toString());
        Object.entries(patch).forEach(([k, v]) => {
            if (v == null || v === '') {
                next.delete(k);
            }
            else {
                next.set(k, v);
            }
        });
        if (resetPage) {
            next.delete('page');
        }

        router.push(`/products?${next.toString()}`);
    };

    const filterValue: FilterValue = { categoryId, brandId, minPrice, maxPrice };
    const total = data?.meta.total ?? 0;
    const totalPages = data?.meta.totalPages ?? 1;

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900">Sản phẩm</h1>
            {search && <p className="mt-1 text-sm text-gray-500">Kết quả cho “{search}”</p>}

            <div className="mt-6 flex flex-col gap-6 lg:flex-row">
                <aside className="lg:w-64 lg:shrink-0">
                    <ProductFilters
                        value={filterValue}
                        search={search}
                        onChange={(patch) => setParams(patch)}
                        onSearch={(term) => setParams({ search: term || undefined })}
                        onClear={() => router.push('/products')} />
                </aside>

                <div className="flex-1">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <p className="text-sm text-gray-500">{isLoading ? 'Đang tải…' : `${total} sản phẩm`}</p>
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                            <SlidersHorizontal className="h-4 w-4 text-gray-400" />
                            <select
                                value={sort}
                                onChange={(e) => setParams({ sort: e.target.value })}
                                className="cursor-pointer rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-blue-500"
                            >
                                {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                            </select>
                        </label>
                    </div>

                    {isError ? (
                        <p className="py-16 text-center text-sm text-red-600">Không tải được danh sách sản phẩm.</p>
                    ) : isLoading ? (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-xl bg-gray-100" />)}
                        </div>
                    ) : (data?.data.length ?? 0) === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-500">
                            Không có sản phẩm phù hợp.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {data!.data.map((p) => <ProductCard key={p.id} product={p} />)}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="mt-8 flex items-center justify-center gap-4">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => setParams({ page: String(page - 1) }, false)}
                                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                            >
                                <ChevronLeft className="h-4 w-4" /> Trước
                            </button>
                            <span className="text-sm text-gray-500">Trang {page}/{totalPages}</span>
                            <button
                                type="button"
                                disabled={page >= totalPages}
                                onClick={() => setParams({ page: String(page + 1) }, false)}
                                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                            >
                                Sau <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}