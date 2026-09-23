'use client';
import { useState } from 'react';
import { Boxes, Loader2, Save, Trash2, Wand2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useProductAttributes } from '../hooks/use-product-attributes';
import {
    useDeleteVariant,
    useGenerateVariants,
    useProductVariants,
    useUpdateVariant,
} from '../hooks/use-product-variants';
import type { ProductAttribute, ProductVariant } from '../types';

function optionValue(variant: ProductVariant, attributeId: string): string {
    return variant.options.find((o) => o.option.attribute.id === attributeId)?.option.value ?? '—';
}

function VariantRow({
    productId, variant, variantAttrs, onDelete,
}: { productId: string; variant: ProductVariant; variantAttrs: ProductAttribute[]; onDelete: () => void }) {
    const update = useUpdateVariant(productId);
    const [price, setPrice] = useState(String(variant.price));
    const [salePrice, setSalePrice] = useState(variant.salePrice != null ? String(variant.salePrice) : '');
    const [stock, setStock] = useState(String(variant.stockQuantity));

    const dirty =
        price !== String(variant.price) ||
        salePrice !== (variant.salePrice != null ? String(variant.salePrice) : '') ||
        stock !== String(variant.stockQuantity);

    const save = () =>
        update.mutate({
            variantId: variant.id,
            data: {
                price: Number(price) || 0,
                salePrice: salePrice.trim() === '' ? undefined : Number(salePrice),
                stockQuantity: Number(stock) || 0,
            },
        });

    return (
        <tr className="hover:bg-gray-50">
            {variantAttrs.map((a) => (
                <td key={a.id} className="px-3 py-2 font-medium text-gray-700">{optionValue(variant, a.id)}</td>
            ))}
            <td className="px-3 py-2 text-xs text-gray-400">{variant.sku}</td>
            <td className="px-3 py-2"><Input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} className="w-28" /></td>
            <td className="px-3 py-2"><Input type="number" min={0} value={salePrice} onChange={(e) => setSalePrice(e.target.value)} className="w-28" placeholder="—" /></td>
            <td className="px-3 py-2"><Input type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} className="w-20" /></td>
            <td className="px-3 py-2">
                <input
                    type="checkbox"
                    checked={variant.isActive}
                    onChange={(e) => update.mutate({ variantId: variant.id, data: { isActive: e.target.checked } })}
                    className="h-4 w-4 cursor-pointer rounded"
                />
            </td>
            <td className="px-3 py-2">
                <div className="flex items-center justify-end gap-1">
                    <button type="button" onClick={save} disabled={!dirty || update.isPending} className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600 disabled:opacity-30" title="Lưu">
                        <Save className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={onDelete} className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600" title="Xóa">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
}

export function VariantManager({ productId }: { productId: string }) {
    const attrs = useProductAttributes(productId);
    const variants = useProductVariants(productId);
    const generate = useGenerateVariants(productId);
    const del = useDeleteVariant(productId);
    const [target, setTarget] = useState<ProductVariant | null>(null);

    const variantAttrs = (attrs.data ?? []).filter((a) => a.isVariant);

    if (variantAttrs.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white py-12 text-center text-sm text-gray-500">
                Chưa có thuộc tính “tạo biến thể”. Hãy thêm thuộc tính, tick “Tạo biến thể” và bấm “Lưu thuộc tính” ở trên.
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h3 className="font-semibold text-gray-900">Biến thể</h3>
                    <p className="text-xs text-gray-500">Sinh tổ hợp từ thuộc tính, rồi chỉnh giá/kho từng biến thể.</p>
                </div>
                <Button type="button" size="sm" onClick={() => generate.mutate()} disabled={generate.isPending}>
                    {generate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    Sinh biến thể
                </Button>
            </div>
            {generate.isSuccess && <p className="mb-3 text-sm text-green-600">Đã sinh {generate.data.created} biến thể mới.</p>}
            {generate.isError && <p className="mb-3 text-sm text-red-600">{getApiErrorMessage(generate.error)}</p>}

            {variants.isLoading ? (
                <p className="py-6 text-center text-sm text-gray-400">Đang tải…</p>
            ) : (variants.data?.length ?? 0) === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 py-10 text-center">
                    <Boxes className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                    <p className="text-sm text-gray-500">Chưa có biến thể. Bấm “Sinh biến thể”.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase text-gray-500">
                            <tr>
                                {variantAttrs.map((a) => <th key={a.id} className="px-3 py-2">{a.name}</th>)}
                                <th className="px-3 py-2">SKU</th>
                                <th className="px-3 py-2">Giá</th>
                                <th className="px-3 py-2">Giá khuyến mãi</th>
                                <th className="px-3 py-2">Tồn</th>
                                <th className="px-3 py-2">Hiện</th>
                                <th className="px-3 py-2 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {variants.data!.map((v) => (
                                <VariantRow key={v.id} productId={productId} variant={v} variantAttrs={variantAttrs} onDelete={() => setTarget(v)} />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmDialog
                open={target !== null}
                title="Xóa biến thể"
                message={`Xóa biến thể "${target?.sku}"?`}
                error={del.isError ? getApiErrorMessage(del.error) : undefined}
                loading={del.isPending}
                onClose={() => { setTarget(null); del.reset(); }}
                onConfirm={() => { if (target) del.mutate(target.id, { onSuccess: () => setTarget(null) }); }}
            />
        </div>
    );
}