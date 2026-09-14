'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu } from 'lucide-react';
import { usePublicCategoryLeaves } from '@/features/products/hooks/use-storefront';
import { CategoryIcon } from '@/features/categories/components/category-icon';

export function CategoryMenu() {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const { data } = usePublicCategoryLeaves();
    useEffect(() => {
        const onDoc = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, []);
    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-t-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
                <Menu className="h-4 w-4" /> Danh mục
                <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute left-0 top-full z-50 max-h-[70vh] w-72 overflow-y-auto rounded-b-lg border border-gray-200 bg-white py-1 shadow-xl">
                    {(data?.length ?? 0) === 0 ? (
                        <p className="px-4 py-3 text-sm text-gray-400">Chưa có danh mục.</p>
                    ) : (
                        data!.map((c) => (
                            <Link
                                key={c.id}
                                href={`/products?categoryId=${c.id}`}
                                onClick={() => setOpen(false)}
                                className="block px-4 py-2.5 text-sm text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
                            >
                                <div className='flex items-center gap-2'>
                                    <CategoryIcon name={c.icon} className="h-4 w-4 shrink-0 text-blue-600" />
                                    {c.name}
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}