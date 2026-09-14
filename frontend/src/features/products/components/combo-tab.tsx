'use client';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ImageIcon, Loader2, PackagePlus, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { formatVnd } from '@/shared/lib/format';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useComboItems, useReplaceComboItems } from '../hooks/use-combo-items';
import { ComboProductPicker } from './combo-product-picker';
import type { ProductListItem, ProductVariant } from '../types';

interface Row {
    productId: string;
    variantId: string | null;
    name: string;
    variantLabel: string | null;
    image: string | null;
    unitPrice: number;
    stock: number;
    quantity: number;
}

export function ComboTab({ productId }: { productId: string }) {
    const combo = useComboItems(productId);
    const save = useReplaceComboItems(productId);

    const [rows, setRows] = useState<Row[]>([]);
    const [pickerOpen, setPickerOpen] = useState(false);

    useEffect(() => {
        if (combo.data) {
            setRows(
                combo.data.items.map((i) => ({
                    productId: i.product.id,
                    variantId: i.variantId,
                    name: i.product.name,
                    variantLabel: i.variantLabel,
                    image: i.product.image,
                    unitPrice: i.unitPrice,
                    stock: i.stock,
                    quantity: i.quantity,
                })),
            );
        }
    }, [combo.data]);

    const addSimple = (p: ProductListItem) =>
        setRows((rs) => [
            ...rs,
            {
                productId: p.id, variantId: null, name: p.name, variantLabel: null,
                image: p.images[0]?.imageUrl ?? null, unitPrice: p.salePrice ?? p.price, stock: p.stockQuantity, quantity: 1,
            },
        ]);

    const addVariant = (p: ProductListItem, v: ProductVariant, label: string) =>
        setRows((rs) => [
            ...rs,
            {
                productId: p.id, variantId: v.id, name: p.name, variantLabel: label,
                image: v.imageUrl ?? p.images[0]?.imageUrl ?? null, unitPrice: v.salePrice ?? v.price, stock: v.stockQuantity, quantity: 1,
            },
        ]);

    const setQty = (id: string, qty: number) =>
        setRows((rs) => rs.map((r) => (r.productId === id ? { ...r, quantity: Math.max(1, qty) } : r)));
    const removeRow = (id: string) => setRows((rs) => rs.filter((r) => r.productId !== id));

    const comboPrice = combo.data?.comboPrice ?? 0;
    const originalPrice = useMemo(() => rows.reduce((s, r) => s + r.unitPrice * r.quantity, 0), [rows]);
    const saving = Math.max(0, originalPrice - comboPrice);
    const availableStock = rows.length ? Math.min(...rows.map((r) => Math.floor(r.stock / r.quantity))) : 0;

    if (combo.isLoading) return <p className="py-8 text-center text-sm text-gray-400">Đang tải…</p>;

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <h3 className="font-semibold text-gray-900">Thành phần combo</h3>
                        <p className="text-xs text-gray-500">
                            Duyệt theo danh mục và tick sản phẩm. SP có biến thể thì chọn 1 biến thể. Mỗi sản phẩm chỉ thêm 1 lần.
                        </p>
                    </div>
                    <Button type="button" size="sm" onClick={() => setPickerOpen(true)}>
                        <Plus className="h-4 w-4" /> Thêm sản phẩm
                    </Button>
                </div>

                {rows.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-200 py-10 text-center">
                        <PackagePlus className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                        <p className="text-sm text-gray-500">Chưa có thành phần. Bấm “Thêm sản phẩm”.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-3 py-2">Sản phẩm</th>
                                    <th className="px-3 py-2">Đơn giá</th>
                                    <th className="px-3 py-2">SL</th>
                                    <th className="px-3 py-2">Thành tiền</th>
                                    <th className="px-3 py-2">Tồn</th>
                                    <th className="px-3 py-2 text-right">Xóa</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {rows.map((r) => (
                                    <tr key={r.productId} className="hover:bg-gray-50">
                                        <td className="px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded border border-gray-100 bg-gray-50">
                                                    {r.image ? (
                                                        <Image src={r.image} alt="" width={36} height={36} className="h-full w-full object-contain" />
                                                    ) : (
                                                        <ImageIcon className="h-4 w-4 text-gray-300" />
                                                    )}
                                                </span>
                                                <span>
                                                    <span className="block text-gray-800">{r.name}</span>
                                                    {r.variantLabel && <span className="block text-xs text-indigo-600">{r.variantLabel}</span>}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-gray-600">{formatVnd(r.unitPrice)}</td>
                                        <td className="px-3 py-2">
                                            <Input type="number" min={1} value={r.quantity}
                                                onChange={(e) => setQty(r.productId, Number(e.target.value) || 1)} className="w-20" />
                                        </td>
                                        <td className="px-3 py-2 font-medium text-gray-800">{formatVnd(r.unitPrice * r.quantity)}</td>
                                        <td className="px-3 py-2 text-gray-500">{r.stock}</td>
                                        <td className="px-3 py-2 text-right">
                                            <button type="button" onClick={() => removeRow(r.productId)}
                                                className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600" title="Xóa">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Stat label="Giá combo" value={formatVnd(comboPrice)} hint="Sửa ở tab Thông tin" />
                    <Stat label="Giá mua rời" value={formatVnd(originalPrice)} />
                    <Stat label="Tiết kiệm" value={formatVnd(saving)} accent={saving > 0 ? 'text-green-600' : undefined} />
                    <Stat label="Combo bán được" value={`${availableStock}`} hint="theo tồn thành phần" />
                </div>
                {comboPrice > 0 && originalPrice > 0 && comboPrice >= originalPrice && (
                    <p className="mt-3 text-xs text-amber-600">
                        Giá combo đang ≥ giá mua rời — khách không tiết kiệm được gì. Cân nhắc giảm giá combo ở tab Thông tin.
                    </p>
                )}
                <div className="mt-4 flex items-center justify-end gap-3">
                    {save.isSuccess && <span className="text-sm text-green-600">Đã lưu combo.</span>}
                    <Button
                        type="button"
                        onClick={() => save.mutate(rows.map((r) => ({ productId: r.productId, variantId: r.variantId ?? undefined, quantity: r.quantity })))}
                        disabled={save.isPending}
                    >
                        {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Lưu combo
                    </Button>
                </div>
                {save.isError && <p className="mt-2 text-right text-sm text-red-600">{getApiErrorMessage(save.error)}</p>}
            </div>

            {pickerOpen && (
                <ComboProductPicker
                    selfId={productId}
                    selectedIds={rows.map((r) => r.productId)}
                    onAddSimple={addSimple}
                    onAddVariant={addVariant}
                    onRemove={removeRow}
                    onClose={() => setPickerOpen(false)}
                />
            )}
        </div>
    );
}

function Stat({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: string }) {
    return (
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`mt-1 text-lg font-semibold ${accent ?? 'text-gray-900'}`}>{value}</p>
            {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
        </div>
    );
}