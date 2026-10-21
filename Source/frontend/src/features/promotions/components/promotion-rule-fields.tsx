'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { productsApi } from '@/features/products/api/products.api';
import type { PromotionInput } from '../api/promotions.api';

const input = 'w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500';

/**
 * Quy tắc áp dụng dùng chung cho form tạo / sửa chương trình: độ ưu tiên, "Ưu tiên bắt buộc"
 * và danh sách sản phẩm loại trừ.
 */
export function PromotionRuleFields({
    form,
    onChange,
    excludedNames = {},
}: {
    form: PromotionInput;
    onChange: (patch: Partial<PromotionInput>) => void;
    /** Tên các SP đã loại trừ sẵn (khi sửa chương trình) để hiện thành thẻ */
    excludedNames?: Record<string, string>;
}) {
    const [search, setSearch] = useState('');
    const [names, setNames] = useState<Record<string, string>>(excludedNames);
    const excluded = form.excludedProductIds ?? [];
    const { data: results } = useQuery({
        queryKey: ['promo', 'exclude-search', search],
        queryFn: () => productsApi.listAdmin({ search: search || undefined, limit: 10 }).then((r) => r.data),
        enabled: search.trim().length > 0,
    });

    const toggle = (id: string, name: string) => {
        setNames((n) => ({ ...n, [id]: name }));
        onChange({ excludedProductIds: excluded.includes(id) ? excluded.filter((x) => x !== id) : [...excluded, id] });
    };

    return (
        <div className="mt-4 grid gap-4 rounded-lg border border-gray-100 bg-gray-50/60 p-3 lg:grid-cols-2">
            <div className="space-y-3">
                <label className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">Độ ưu tiên <span className="text-gray-400">· số lớn hơn thắng khi nhiều chương trình cùng bật “Ưu tiên bắt buộc”</span></span>
                    <input className={input} type="number" value={form.priority ?? 0} onChange={(e) => onChange({ priority: Number(e.target.value) })} />
                </label>
                <label className="flex cursor-pointer items-start gap-2 text-sm text-gray-800">
                    <input type="checkbox" className="mt-0.5 h-4 w-4" checked={!!form.forcePriority} onChange={(e) => onChange({ forcePriority: e.target.checked })} />
                    <span>
                        <span className="font-medium">Ưu tiên bắt buộc</span>
                        <span className="block text-xs text-gray-500">Luôn áp chương trình này cho SP thuộc phạm vi, kể cả khi giảm giá riêng hoặc chương trình khác cho giá thấp hơn. Mặc định (tắt): khách luôn được giá thấp nhất.</span>
                    </span>
                </label>
            </div>
            {form.scope !== 'PRODUCT' && (
                <div>
                    <span className="mb-1 block text-xs font-medium text-gray-600">Sản phẩm loại trừ ({excluded.length}) <span className="text-gray-400">· không áp chương trình cho các SP này</span></span>
                    {excluded.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-1.5">
                            {excluded.map((id) => (
                                <span key={id} className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs text-gray-700 ring-1 ring-gray-200">
                                    {names[id] ?? id.slice(0, 8)}
                                    <button type="button" aria-label="Bỏ loại trừ" onClick={() => toggle(id, names[id] ?? '')} className="text-gray-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                                </span>
                            ))}
                        </div>
                    )}
                    <input className={input} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm SP để loại trừ…" />
                    {search.trim() && (
                        <div className="mt-1 max-h-48 space-y-0.5 overflow-y-auto rounded-lg border border-gray-100 bg-white p-1">
                            {results?.map((p) => {
                                const on = excluded.includes(p.id);
                                return (
                                    <button key={p.id} type="button" onClick={() => toggle(p.id, p.name)}
                                        className={`w-full truncate rounded px-2 py-1 text-left text-sm ${on ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'}`}>
                                        {on ? '✕ ' : ''}{p.name}
                                    </button>
                                );
                            })}
                            {results && results.length === 0 && <p className="px-2 py-2 text-center text-xs text-gray-400">Không có sản phẩm.</p>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
