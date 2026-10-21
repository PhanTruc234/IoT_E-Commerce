'use client';
import { useEffect, useState } from 'react';
import { Search, Star } from 'lucide-react';
import { usePublicBrands, usePublicCategoryLeaves } from '../hooks/use-storefront';
import { CategoryIcon } from '@/features/categories/components/category-icon';
import { PriceRangeSlider } from './price-range-slider';

export interface FilterValue {
    categoryId?: string;
    brandId?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
}
interface Props {
    value: FilterValue;
    search?: string;
    /** Giá thực trả thấp/cao nhất của các SP đang hiển thị — hai đầu thanh kéo */
    priceRange?: { min: number; max: number } | null;
    onChange: (patch: Partial<Record<keyof FilterValue, string | undefined>>) => void;
    onSearch: (term: string) => void;
    onClear: () => void;
}

function Stars({ n }: { n: number }) {
    return (
        <span className="inline-flex">
            {[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`h-3.5 w-3.5 ${i <= n ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />)}
        </span>
    );
}

export function ProductFilters({ value, search, priceRange, onChange, onSearch, onClear }: Props) {
    const leaves = usePublicCategoryLeaves();
    const brands = usePublicBrands();
    const [term, setTerm] = useState(search ?? '');
    useEffect(() => {
        setTerm(search ?? '');
    }, [search]);

    const hasFilter = value.categoryId || value.brandId || value.minPrice || value.maxPrice || value.minRating || search;

    return (
        <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Bộ lọc</h2>
                {hasFilter && (
                    <button type="button" onClick={onClear} className="cursor-pointer text-xs text-gray-400 hover:text-red-600">Xoá lọc</button>
                )}
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onSearch(term.trim());
                }}
                className="relative"
            >
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="Tìm sản phẩm…"
                    className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
                />
            </form>

            <div>
                <p className="mb-2 text-xs font-semibold uppercase text-gray-400">Danh mục</p>
                <button
                    type="button"
                    onClick={() => onChange({ categoryId: undefined })}
                    className={`mb-1 block w-full cursor-pointer rounded px-2 py-1 text-left text-sm ${!value.categoryId ? 'bg-blue-50 font-medium text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    Tất cả
                </button>
                <ul className="max-h-72 space-y-0.5 overflow-y-auto">
                    {leaves.data?.map((c) => (
                        <li key={c.id}>
                            <button
                                type="button"
                                onClick={() => onChange({ categoryId: c.id })}
                                className={`block w-full cursor-pointer rounded px-2 py-1 text-left text-sm ${value.categoryId === c.id ? 'bg-blue-50 font-medium text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <div className='flex items-center gap-2'>
                                    <CategoryIcon name={c.icon} className="h-4 w-4 shrink-0 text-blue-600" />
                                    {c.name}
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <p className="mb-2 text-xs font-semibold uppercase text-gray-400">Thương hiệu</p>
                <select
                    value={value.brandId ?? ''}
                    onChange={(e) => onChange({ brandId: e.target.value || undefined })}
                    className="w-full cursor-pointer rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-blue-500"
                >
                    <option value="">Tất cả</option>
                    {brands.data?.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
            </div>

            <div>
                <p className="mb-1 text-xs font-semibold uppercase text-gray-400">Khoảng giá</p>
                {priceRange ? (
                    <PriceRangeSlider
                        key={`${priceRange.min}-${priceRange.max}-${value.minPrice ?? ''}-${value.maxPrice ?? ''}`}
                        min={priceRange.min}
                        max={priceRange.max}
                        value={{ min: value.minPrice ? Number(value.minPrice) : undefined, max: value.maxPrice ? Number(value.maxPrice) : undefined }}
                        onCommit={(v) => onChange({ minPrice: v.min != null ? String(v.min) : undefined, maxPrice: v.max != null ? String(v.max) : undefined })}
                    />
                ) : (
                    <p className="text-xs text-gray-400">Không có sản phẩm để lọc giá.</p>
                )}
            </div>

            <div>
                <p className="mb-2 text-xs font-semibold uppercase text-gray-400">Đánh giá</p>
                <ul className="space-y-0.5">
                    {[5, 4, 3, 2, 1].map((n) => {
                        const active = value.minRating === String(n);
                        return (
                            <li key={n}>
                                <button
                                    type="button"
                                    aria-pressed={active}
                                    onClick={() => onChange({ minRating: active ? undefined : String(n) })}
                                    className={`flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1 text-left text-sm ${active ? 'bg-amber-50 font-medium text-amber-700' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Stars n={n} />
                                    {n < 5 && <span>trở lên</span>}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}