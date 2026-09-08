'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Ban, ImageOff, Package, Pencil, Plus, Search } from 'lucide-react';
import { PageHeader } from '@/shared/components/admin/page-header';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Spinner } from '@/shared/ui/spinner';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { formatVnd } from '@/shared/lib/format';
import { useDeleteProduct, useProducts } from '@/features/products/hooks/use-products';
import type { ProductListItem, ProductSortKey, ProductStatus } from '@/features/products/types';

const STATUS_BADGE: Record<ProductStatus, { color: 'green' | 'gray' | 'red'; label: string }> = {
    ACTIVE: { color: 'green', label: 'Đang bán' },
    INACTIVE: { color: 'gray', label: 'Ẩn' },
    OUT_OF_STOCK: { color: 'red', label: 'Hết hàng' },
};

export default function AdminProductsPage() {
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<ProductStatus | ''>('');
    const [sort, setSort] = useState<ProductSortKey>('newest');
    const [target, setTarget] = useState<ProductListItem | null>(null);

    const { data, isLoading, isError, error, isFetching } = useProducts({
        page,
        limit: 10,
        search: search || undefined,
        status: status || undefined,
        sort,
    });
    const del = useDeleteProduct();

    return (
        <div>
            <PageHeader
                title="Sản phẩm"
                description="Quản lý sản phẩm, biến thể, combo."
                action={
                    <Link href="/admin/products/create">
                        <Button><Plus className="h-4 w-4" /> Thêm sản phẩm</Button>
                    </Link>
                }
            />

            <div className="mb-4 flex flex-wrap gap-2">
                <form
                    onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(searchInput.trim()); }}
                    className="relative w-full max-w-xs"
                >
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Tìm tên / SKU…" className="pl-9" />
                </form>
                <Select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value as ProductStatus | ''); }} className="w-40">
                    <option value="">Mọi trạng thái</option>
                    <option value="ACTIVE">Đang bán</option>
                    <option value="INACTIVE">Ẩn</option>
                    <option value="OUT_OF_STOCK">Hết hàng</option>
                </Select>
                <Select value={sort} onChange={(e) => setSort(e.target.value as ProductSortKey)} className="w-44">
                    <option value="newest">Mới nhất</option>
                    <option value="price_asc">Giá tăng dần</option>
                    <option value="price_desc">Giá giảm dần</option>
                    <option value="best_selling">Bán chạy</option>
                </Select>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                {isLoading ? (
                    <div className="flex justify-center py-16"><Spinner /></div>
                ) : isError ? (
                    <div className="p-6 text-sm text-red-600">{getApiErrorMessage(error)}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-4 py-3">Sản phẩm</th>
                                    <th className="px-4 py-3">Danh mục</th>
                                    <th className="px-4 py-3">Giá</th>
                                    <th className="px-4 py-3">Kho</th>
                                    <th className="px-4 py-3">Trạng thái</th>
                                    <th className="px-4 py-3 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data!.data.length === 0 && (
                                    <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                                        <Package className="mx-auto mb-2 h-8 w-8 text-gray-300" />Chưa có sản phẩm.
                                    </td></tr>
                                )}
                                {data!.data.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                                                    {p.images[0]?.imageUrl ? (
                                                        <Image src={p.images[0].imageUrl} alt={p.name} width={44} height={44} className="h-full w-full object-contain" />
                                                    ) : (
                                                        <ImageOff className="h-4 w-4 text-gray-300" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium text-gray-800">{p.name}</p>
                                                    <p className="text-xs text-gray-400">{p.sku}
                                                        {p.type !== 'SIMPLE' && (
                                                            <span className="ml-2 rounded bg-blue-50 px-1.5 text-blue-600">
                                                                {p.type === 'VARIABLE' ? 'Biến thể' : 'Combo'}
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{p.category?.name ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            {p.salePrice != null ? (
                                                <div>
                                                    <span className="font-medium text-red-600">{formatVnd(p.salePrice)}</span>
                                                    <span className="ml-1 text-xs text-gray-400 line-through">
                                                        {formatVnd(p.price)}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="font-medium text-gray-800">{formatVnd(p.price)}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{p.stockQuantity}</td>
                                        <td className="px-4 py-3">
                                            <Badge color={STATUS_BADGE[p.status].color}>{STATUS_BADGE[p.status].label}</Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                <Link href={`/admin/products/${p.id}`} title="Sửa" className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600">
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                                {p.status !== 'INACTIVE' && (
                                                    <button onClick={() => setTarget(p)} title="Ẩn" className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600">
                                                        <Ban />
                                                    </button>
                                                )}
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
                    <span>Trang {data.meta.page}/{data.meta.totalPages} — {data.meta.total} sản phẩm</span>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" disabled={page <= 1 || isFetching} onClick={() => setPage((p) => p - 1)}>Trước</Button>
                        <Button variant="secondary" size="sm" disabled={page >= data.meta.totalPages || isFetching} onClick={() => setPage((p) => p + 1)}>Sau</Button>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={target !== null}
                title="Ẩn sản phẩm"
                message={`Ẩn "${target?.name}"? Sản phẩm sẽ chuyển sang trạng thái không hoạt động.`}
                confirmText="Ẩn"
                error={del.isError ? getApiErrorMessage(del.error) : undefined}
                loading={del.isPending}
                onClose={() => { setTarget(null); del.reset(); }}
                onConfirm={() => { if (target) del.mutate(target.id, { onSuccess: () => setTarget(null) }); }}
            />
        </div>
    );
}