'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronDown, ImageIcon, Layers, Search } from 'lucide-react';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { formatVnd } from '@/shared/lib/format';
import { usePublicCategoryLeaves } from '../hooks/use-storefront';
import { useProducts } from '../hooks/use-products';
import { productVariantsApi } from '../api/product-variants.api';
import type { ProductListItem, ProductVariant } from '../types';

function variantLabelOf(v: ProductVariant): string {
    return v.options.map((o) => `${o.option.attribute.name}: ${o.option.value}`).join(', ');
}

function VariantRows({ productId, onPick }: { productId: string; onPick: (v: ProductVariant, label: string) => void }) {
    const q = useQuery({ queryKey: ['admin', 'product-variants', productId], queryFn: () => productVariantsApi.list(productId) });
    const variants = (q.data ?? []).filter((v) => v.isActive);
    if (q.isLoading) return <p className="px-3 py-2 text-xs text-gray-400">Đang tải biến thể…</p>;
    if (variants.length === 0) return <p className="px-3 py-2 text-xs text-gray-500">SP này chưa có biến thể hoạt động.</p>;
    return (
        <div className="space-y-1 bg-gray-50 p-2">
            {variants.map((v) => (
                <button
                    key={v.id}
                    type="button"
                    onClick={() => onPick(v, variantLabelOf(v))}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-left text-sm hover:border-blue-400 hover:bg-blue-50"
                >
                    <span className="font-medium text-gray-800">{variantLabelOf(v)}</span>
                    <span className="shrink-0 text-xs text-gray-500">{formatVnd(v.salePrice ?? v.price)} · Tồn {v.stockQuantity}</span>
                </button>
            ))}
        </div>
    );
}

interface Props {
    selfId: string;
    selectedIds: string[];
    onAddSimple: (p: ProductListItem) => void;
    onAddVariant: (p: ProductListItem, v: ProductVariant, label: string) => void;
    onRemove: (productId: string) => void;
    onClose: () => void;
}

export function ComboProductPicker({ selfId, selectedIds, onAddSimple, onAddVariant, onRemove, onClose }: Props) {
    const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState<string | null>(null);

    const cats = usePublicCategoryLeaves();
    const products = useProducts({
        status: 'ACTIVE',
        limit: 50,
        ...(categoryId ? { categoryId } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
    });
    const list = (products.data?.data ?? []).filter((p) => p.type !== 'COMBO' && p.id !== selfId);

    return (
        <Modal
            open
            onClose={onClose}
            title="Chọn sản phẩm cho combo"
            size="xl"
            footer={<Button type="button" onClick={onClose}>Xong ({selectedIds.length})</Button>}
        >
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-gray-200 px-3">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm nhanh theo tên/SKU…"
                    className="w-full py-2 text-sm outline-none"
                />
            </div>

            <div className="flex flex-col gap-4 md:flex-row">
                <div className="md:w-52 md:shrink-0">
                    <p className="mb-2 text-xs font-semibold uppercase text-gray-400">Danh mục</p>
                    <div className="flex gap-1 overflow-x-auto md:max-h-80 md:flex-col md:overflow-y-auto">
                        <button
                            type="button"
                            onClick={() => setCategoryId(undefined)}
                            className={`shrink-0 cursor-pointer rounded-lg px-2 py-1.5 text-left text-sm ${!categoryId ? 'bg-blue-50 font-medium text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            Tất cả
                        </button>
                        {cats.data?.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => setCategoryId(c.id)}
                                className={`shrink-0 cursor-pointer whitespace-nowrap rounded-lg px-2 py-1.5 text-left text-sm md:whitespace-normal ${categoryId === c.id ? 'bg-blue-50 font-medium text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex-1">
                    {products.isLoading ? (
                        <p className="py-10 text-center text-sm text-gray-400">Đang tải…</p>
                    ) : list.length === 0 ? (
                        <p className="py-10 text-center text-sm text-gray-500">Không có sản phẩm phù hợp.</p>
                    ) : (
                        <ul className="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-100">
                            {list.map((p) => {
                                const selected = selectedIds.includes(p.id);
                                const isVar = p.type === 'VARIABLE';
                                return (
                                    <li key={p.id}>
                                        <div className="flex items-center gap-3 px-3 py-2">
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded border border-gray-100 bg-gray-50">
                                                {p.images[0]?.imageUrl ? (
                                                    <Image src={p.images[0].imageUrl} alt="" width={40} height={40} className="h-full w-full object-contain" />
                                                ) : (
                                                    <ImageIcon className="h-4 w-4 text-gray-300" />
                                                )}
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="flex items-center gap-1.5 truncate text-sm text-gray-800">
                                                    {p.name}
                                                    {isVar && (
                                                        <span className="inline-flex items-center gap-0.5 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600">
                                                            <Layers className="h-3 w-3" /> biến thể
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="block text-xs text-gray-400">{p.sku} · {formatVnd(p.salePrice ?? p.price)} · Tồn {p.stockQuantity}</span>
                                            </span>
                                            {selected ? (
                                                <button
                                                    type="button"
                                                    onClick={() => onRemove(p.id)}
                                                    className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-100"
                                                >
                                                    <Check className="h-4 w-4" /> Đã thêm
                                                </button>
                                            ) : isVar ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setExpanded((x) => (x === p.id ? null : p.id))}
                                                    className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:border-blue-400 hover:text-blue-600"
                                                >
                                                    Chọn biến thể <ChevronDown className={`h-4 w-4 transition ${expanded === p.id ? 'rotate-180' : ''}`} />
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => onAddSimple(p)}
                                                    className="shrink-0 cursor-pointer rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                                                >
                                                    Thêm
                                                </button>
                                            )}
                                        </div>
                                        {isVar && expanded === p.id && !selected && (
                                            <VariantRows productId={p.id} onPick={(v, label) => { onAddVariant(p, v, label); setExpanded(null); }} />
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </Modal>
    );
}