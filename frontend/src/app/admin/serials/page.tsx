'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, Plus, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { PageHeader } from '@/shared/components/admin/page-header';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Spinner } from '@/shared/ui/spinner';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useProducts } from '@/features/products/hooks/use-products';
import { productVariantsApi } from '@/features/products/api/product-variants.api';
import { useSerials, useDeleteSerial } from '@/features/serials/hooks/use-serials';
import { SERIAL_STATUS, WARRANTY_STATE } from '@/features/serials/constants';
import type { SerialRow } from '@/features/serials/types';
import { AddSerialsModal } from '@/features/serials/components/add-serials-modal';
import { ActivateSerialModal } from '@/features/serials/components/activate-serial-modal';
import { SerialDetailModal } from '@/features/serials/components/serial-detail-modal';

export default function AdminSerialsPage() {
    const [page, setPage] = useState(1);
    const [productId, setProductId] = useState('');
    const [variantId, setVariantId] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');

    const [adding, setAdding] = useState(false);
    const [activating, setActivating] = useState<SerialRow | null>(null);
    const [detail, setDetail] = useState<SerialRow | null>(null);
    const [deleting, setDeleting] = useState<SerialRow | null>(null);

    const productOpts = useProducts({ limit: 100 });
    const selectedProduct = productOpts.data?.data.find((p) => p.id === productId);
    const variantOpts = useQuery({
        queryKey: ['admin', 'product-variants', productId],
        queryFn: () => productVariantsApi.list(productId),
        enabled: !!productId && selectedProduct?.type === 'VARIABLE',
    });

    const { data, isLoading, isError, error, isFetching } = useSerials({
        page, limit: 15,
        search: search || undefined,
        productId: productId || undefined,
        variantId: variantId || undefined,
        status: status || undefined,
    });
    const del = useDeleteSerial();

    return (
        <div>
            <PageHeader title="Quản lý kho → Serial Number" description="Quản lý số serial và bảo hành."
                action={<Button onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> Thêm serial</Button>} />

            <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">Sản phẩm</label>
                        <Select value={productId} onChange={(e) => { setPage(1); setProductId(e.target.value); setVariantId(''); }}>
                            <option value="">Tất cả sản phẩm</option>
                            {productOpts.data?.data.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </Select>
                    </div>
                    {selectedProduct?.type === 'VARIABLE' && (
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-500">Biến thể</label>
                            <Select value={variantId} onChange={(e) => { setPage(1); setVariantId(e.target.value); }}>
                                <option value="">Tất cả biến thể</option>
                                {(variantOpts.data ?? []).map((v) => (
                                    <option key={v.id} value={v.id}>{v.options.map((o) => o.option.value).join(' / ')}</option>
                                ))}
                            </Select>
                        </div>
                    )}
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">Tìm serial</label>
                        <form onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(searchInput.trim()); }} className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="SN000…" className="pl-9" />
                        </form>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">Trạng thái</label>
                        <Select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
                            <option value="">Tất cả</option>
                            <option value="IN_STOCK">Trong kho</option>
                            <option value="ACTIVATED">Đã bán</option>
                        </Select>
                    </div>
                </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                {isLoading ? <div className="flex justify-center py-16"><Spinner /></div>
                    : isError ? <div className="p-6 text-sm text-red-600">{getApiErrorMessage(error)}</div>
                        : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase text-gray-500">
                                        <tr>
                                            <th className="px-4 py-3">Serial</th>
                                            <th className="px-4 py-3">Sản phẩm</th>
                                            <th className="px-4 py-3">SKU</th>
                                            <th className="px-4 py-3">Trạng thái</th>
                                            <th className="px-4 py-3">Đơn hàng</th>
                                            <th className="px-4 py-3">Bảo hành</th>
                                            <th className="px-4 py-3 text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {data!.data.length === 0 && (
                                            <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400"><ShieldCheck className="mx-auto mb-2 h-8 w-8 text-gray-300" />Chưa có serial.</td></tr>
                                        )}
                                        {data!.data.map((s) => (
                                            <tr key={s.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-800">{s.code}</td>
                                                <td className="px-4 py-3">
                                                    <p className="text-gray-800">{s.productName}</p>
                                                    {s.variantLabel && <p className="text-xs text-indigo-600">{s.variantLabel}</p>}
                                                </td>
                                                <td className="px-4 py-3 text-gray-500">{s.sku}</td>
                                                <td className="px-4 py-3"><Badge color={SERIAL_STATUS[s.status].color}>{SERIAL_STATUS[s.status].label}</Badge></td>
                                                <td className="px-4 py-3 text-gray-600">{s.orderCode ?? '—'}</td>
                                                <td className="px-4 py-3">
                                                    {s.warrantyEndAt ? (
                                                        <div>
                                                            <Badge color={WARRANTY_STATE[s.state].color}>{WARRANTY_STATE[s.state].label}</Badge>
                                                            <span className="mt-0.5 block text-xs text-gray-400">HSD: {new Date(s.warrantyEndAt).toLocaleDateString('vi-VN')}</span>
                                                        </div>
                                                    ) : <span className="text-gray-400">—</span>}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-1">
                                                        <button onClick={() => setDetail(s)} title="Chi tiết" className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600"><Eye className="h-4 w-4" /></button>
                                                        {s.status === 'IN_STOCK' && (
                                                            <button onClick={() => setActivating(s)} className="cursor-pointer rounded-lg px-2 py-1 text-xs text-blue-600 hover:bg-blue-50">Kích hoạt</button>
                                                        )}
                                                        <button onClick={() => setDeleting(s)} title="Xoá" className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
            </div>

            {data && data.meta.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span>Trang {data.meta.page}/{data.meta.totalPages} — {data.meta.total} serial</span>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" disabled={page <= 1 || isFetching} onClick={() => setPage((p) => p - 1)}>Trước</Button>
                        <Button variant="secondary" size="sm" disabled={page >= data.meta.totalPages || isFetching} onClick={() => setPage((p) => p + 1)}>Sau</Button>
                    </div>
                </div>
            )}

            {adding && <AddSerialsModal onClose={() => setAdding(false)} />}
            {activating && <ActivateSerialModal serial={activating} onClose={() => setActivating(null)} />}
            {detail && <SerialDetailModal serial={detail} onClose={() => setDetail(null)} />}

            <ConfirmDialog
                open={deleting !== null}
                title="Xoá serial"
                message={`Xoá serial "${deleting?.code}"?`}
                confirmText="Xoá"
                error={del.isError ? getApiErrorMessage(del.error) : undefined}
                loading={del.isPending}
                onClose={() => { setDeleting(null); del.reset(); }}
                onConfirm={() => { if (deleting) del.mutate(deleting.id, { onSuccess: () => setDeleting(null) }); }}
            />
        </div>
    );
}