'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ImageIcon, Layers, Search } from 'lucide-react';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Field } from '@/shared/ui/field';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { formatVnd } from '@/shared/lib/format';
import { usePublicCategoryLeaves } from '@/features/products/hooks/use-storefront';
import { useProducts } from '@/features/products/hooks/use-products';
import { productVariantsApi } from '@/features/products/api/product-variants.api';
import { useCreateSerials, useGenerateSerials, useSerialSummary } from '../hooks/use-serials';
import type { ProductListItem, ProductVariant } from '@/features/products/types';

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
                <button key={v.id} type="button" onClick={() => onPick(v, variantLabelOf(v))}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-left text-sm hover:border-blue-400 hover:bg-blue-50">
                    <span className="font-medium text-gray-800">{variantLabelOf(v)}</span>
                    <span className="shrink-0 text-xs text-gray-500">{formatVnd(v.salePrice ?? v.price)} · Tồn {v.stockQuantity}</span>
                </button>
            ))}
        </div>
    );
}

interface Selected {
    id: string;
    name: string;
    variantId: string | null;
    variantLabel: string | null;
}

export function AddSerialsModal({ onClose }: { onClose: () => void }) {
    const [selected, setSelected] = useState<Selected | null>(null);
    const [mode, setMode] = useState<'auto' | 'manual'>('auto');
    const [months, setMonths] = useState('12');
    const [qty, setQty] = useState('1');
    const [codesText, setCodesText] = useState('');
    const [formError, setFormError] = useState<string | null>(null);

    const create = useCreateSerials();
    const generate = useGenerateSerials();
    const summary = useSerialSummary(selected?.id, selected?.variantId ?? undefined);

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
    const list = (products.data?.data ?? []).filter((p) => p.type !== 'COMBO');

    useEffect(() => {
        if (summary.data && summary.data.suggested > 0) setQty(String(summary.data.suggested));
    }, [summary.data?.suggested]);

    const pickSimple = (p: ProductListItem) => setSelected({ id: p.id, name: p.name, variantId: null, variantLabel: null });
    const pickVariant = (p: ProductListItem, v: ProductVariant, label: string) => {
        setSelected({ id: p.id, name: p.name, variantId: v.id, variantLabel: label });
        setExpanded(null);
    };

    const submit = () => {
        setFormError(null);
        if (!selected) { setFormError('Vui lòng chọn sản phẩm'); return; }

        if (mode === 'auto') {
            const n = Number(qty) || 0;
            if (n < 1) { setFormError('Số lượng cần sinh phải ≥ 1'); return; }
            generate.mutate(
                { productId: selected.id, variantId: selected.variantId ?? undefined, quantity: n, warrantyMonths: Number(months) || 12 },
                { onSuccess: onClose },
            );
        } else {
            const codes = codesText.split(/[\n,]/).map((c) => c.trim()).filter(Boolean);
            if (codes.length === 0) { setFormError('Vui lòng nhập ít nhất 1 mã serial'); return; }
            create.mutate(
                { productId: selected.id, variantId: selected.variantId ?? undefined, warrantyMonths: Number(months) || 12, codes },
                { onSuccess: onClose },
            );
        }
    };

    const pending = create.isPending || generate.isPending;

    return (
        <Modal
            open
            onClose={onClose}
            title="Thêm serial"
            size="xl"
            footer={<>
                <Button variant="secondary" type="button" onClick={onClose}>Hủy</Button>
                <Button type="button" onClick={submit} disabled={!selected || pending}>
                    {pending ? 'Đang lưu…' : 'Thêm'}
                </Button>
            </>}
        >
            {!selected ? (
                <div>
                    <div className="mb-3 flex items-center gap-2 rounded-lg border border-gray-200 px-3">
                        <Search className="h-4 w-4 text-gray-400" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm nhanh theo tên/SKU…" className="w-full py-2 text-sm outline-none" />
                    </div>

                    <div className="flex flex-col gap-4 md:flex-row">
                        <div className="md:w-52 md:shrink-0">
                            <p className="mb-2 text-xs font-semibold uppercase text-gray-400">Danh mục</p>
                            <div className="flex gap-1 overflow-x-auto md:max-h-80 md:flex-col md:overflow-y-auto">
                                <button type="button" onClick={() => setCategoryId(undefined)}
                                    className={`shrink-0 cursor-pointer rounded-lg px-2 py-1.5 text-left text-sm ${!categoryId ? 'bg-blue-50 font-medium text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                                    Tất cả
                                </button>
                                {cats.data?.map((c) => (
                                    <button key={c.id} type="button" onClick={() => setCategoryId(c.id)}
                                        className={`shrink-0 cursor-pointer whitespace-nowrap rounded-lg px-2 py-1.5 text-left text-sm md:whitespace-normal ${categoryId === c.id ? 'bg-blue-50 font-medium text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
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
                                        const isVar = p.type === 'VARIABLE';
                                        return (
                                            <li key={p.id}>
                                                <div className="flex items-center gap-3 px-3 py-2">
                                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded border border-gray-100 bg-gray-50">
                                                        {p.images[0]?.imageUrl ? (
                                                            <Image src={p.images[0].imageUrl} alt="" width={40} height={40} className="h-full w-full object-contain" />
                                                        ) : <ImageIcon className="h-4 w-4 text-gray-300" />}
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <span className="flex items-center gap-1.5 truncate text-sm text-gray-800">
                                                            {p.name}
                                                            {isVar && <span className="inline-flex items-center gap-0.5 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600"><Layers className="h-3 w-3" />biến thể</span>}
                                                        </span>
                                                        <span className="block text-xs text-gray-400">{p.sku} · {formatVnd(p.salePrice ?? p.price)} · Tồn {p.stockQuantity}</span>
                                                    </span>
                                                    {isVar ? (
                                                        <button type="button" onClick={() => setExpanded((x) => (x === p.id ? null : p.id))}
                                                            className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:border-blue-400 hover:text-blue-600">
                                                            Chọn biến thể <ChevronDown className={`h-4 w-4 transition ${expanded === p.id ? 'rotate-180' : ''}`} />
                                                        </button>
                                                    ) : (
                                                        <button type="button" onClick={() => pickSimple(p)}
                                                            className="shrink-0 cursor-pointer rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
                                                            Chọn
                                                        </button>
                                                    )}
                                                </div>
                                                {isVar && expanded === p.id && (
                                                    <VariantRows productId={p.id} onPick={(v, label) => pickVariant(p, v, label)} />
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <Field label="Sản phẩm">
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm">
                            <span>
                                {selected.name}
                                {selected.variantLabel && <span className="ml-1 text-xs text-indigo-600">({selected.variantLabel})</span>}
                            </span>
                            <button type="button" onClick={() => { setSelected(null); setFormError(null); }} className="cursor-pointer text-xs text-gray-400 hover:text-blue-600">Đổi sản phẩm</button>
                        </div>
                    </Field>

                    <div className="flex gap-2">
                        <button type="button" onClick={() => setMode('auto')}
                            className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm ${mode === 'auto' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600'}`}>
                            Sinh tự động
                        </button>
                        <button type="button" onClick={() => setMode('manual')}
                            className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm ${mode === 'manual' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600'}`}>
                            Nhập tay
                        </button>
                    </div>

                    <Field label="Thời hạn bảo hành (tháng)">
                        <Input type="number" min={0} value={months} onChange={(e) => setMonths(e.target.value)} className="w-32" />
                    </Field>

                    {mode === 'auto' ? (
                        <>
                            {summary.data && (
                                <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-50 p-3 text-center text-sm">
                                    <div><p className="text-xs text-gray-500">Tồn kho</p><p className="font-semibold text-gray-800">{summary.data.stock}</p></div>
                                    <div><p className="text-xs text-gray-500">Đã có serial</p><p className="font-semibold text-gray-800">{summary.data.existing}</p></div>
                                    <div><p className="text-xs text-gray-500">Nên sinh thêm</p><p className="font-semibold text-blue-600">{summary.data.suggested}</p></div>
                                </div>
                            )}
                            <Field label="Số lượng cần sinh">
                                <Input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} className="w-32" />
                            </Field>
                            <p className="text-xs text-gray-400">Mã tự tạo theo SKU, đánh số tăng dần (VD: SKU-00001, SKU-00002…).</p>
                        </>
                    ) : (
                        <Field label="Danh sách serial (mỗi dòng 1 mã)">
                            <textarea value={codesText} onChange={(e) => setCodesText(e.target.value)} rows={6}
                                placeholder={"LUMI-PHOTO-0001\nLUMI-PHOTO-0002"}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                        </Field>
                    )}

                    {formError && <p className="text-sm text-red-600">{formError}</p>}
                    {create.isError && <p className="text-sm text-red-600">{getApiErrorMessage(create.error)}</p>}
                    {generate.isError && <p className="text-sm text-red-600">{getApiErrorMessage(generate.error)}</p>}
                </div>
            )}
        </Modal>
    );
}