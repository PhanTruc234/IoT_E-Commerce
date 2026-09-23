'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePublicCategoryLeaves } from '../hooks/use-storefront';
import { CategoryIcon } from '@/features/categories/components/category-icon';

const PER_PAGE = 8;

export function FeaturedCategories() {
    const { data } = usePublicCategoryLeaves();
    const [page, setPage] = useState(0);

    const cats = data ?? [];
    if (cats.length === 0) {
        return null;
    }
    const totalPages = Math.ceil(cats.length / PER_PAGE);
    const shown = cats.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

    return (
        <section className="mx-auto max-w-7xl px-4 py-6">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Danh mục nổi bật</h2>
                {totalPages > 1 && (
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="cursor-pointer rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="cursor-pointer rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
                {shown.map((c) => (
                    <Link
                        key={c.id}
                        href={`/products?categoryId=${c.id}`}
                        className="group flex flex-col items-center gap-3 rounded-xl border border-gray-100 p-4 text-center transition hover:border-blue-200 hover:shadow-sm"
                    >
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                            <CategoryIcon name={c.icon} className="h-6 w-6" />
                        </span>
                        <span className="line-clamp-2 text-xs font-medium text-gray-700">{c.name}</span>
                    </Link>
                ))}
            </div>
        </section>
    );
}
