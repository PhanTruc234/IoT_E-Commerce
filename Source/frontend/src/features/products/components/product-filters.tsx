'use client';
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { usePublicBrands, usePublicCategoryLeaves } from '../hooks/use-storefront';
import { CategoryIcon } from '@/features/categories/components/category-icon';

export interface FilterValue {
    categoryId?: string;
    brandId?: string;
    minPrice?: string;
    maxPrice?: string;
}
interface Props {
    value: FilterValue;
    search?: string;
    onChange: (patch: Partial<Record<keyof FilterValue, string | undefined>>) => void;
    onSearch: (term: string) => void;
    onClear: () => void;
}
export function ProductFilters({ value, search, onChange, onSearch, onClear }: Props) {
    const leaves = usePublicCategoryLeaves();
    const brands = usePublicBrands();
    const [min, setMin] = useState(value.minPrice ?? '');
    const [max, setMax] = useState(value.maxPrice ?? '');
    const [term, setTerm] = useState(search ?? '');
    useEffect(() => {
        setMin(value.minPrice ?? '');
        setMax(value.maxPrice ?? '');
    }, [value.minPrice, value.maxPrice]);
    useEffect(() => {
        setTerm(search ?? '');
    }, [search]);

    const hasFilter = value.categoryId || value.brandId || value.minPrice || value.maxPrice || search;

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
                <p className="mb-2 text-xs font-semibold uppercase text-gray-400">Khoảng giá (₫)</p>
                <div className="flex items-center gap-2">
                    <input type="number" min={0} value={min} onChange={(e) => setMin(e.target.value)} placeholder="Từ"
                        className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-blue-500" />
                    <span className="text-gray-400">–</span>
                    <input type="number" min={0} value={max} onChange={(e) => setMax(e.target.value)} placeholder="Đến"
                        className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-blue-500" />
                </div>
                <button
                    type="button"
                    onClick={() => onChange({ minPrice: min || undefined, maxPrice: max || undefined })}
                    className="mt-2 w-full cursor-pointer rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
                >
                    Áp dụng
                </button>
            </div>
        </div>
    );
}