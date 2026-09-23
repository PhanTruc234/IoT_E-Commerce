'use client';
import { useState } from 'react';
import { ImageOff, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { PageHeader } from '@/shared/components/admin/page-header';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Spinner } from '@/shared/ui/spinner';
import { Input } from '@/shared/ui/input';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useBrands, useDeleteBrand } from '@/features/brands/hooks/use-brand';
import { BrandFormModal } from '@/features/brands/components/brand-form-modal';
import type { Brand } from '@/features/brands/types';
import Image from 'next/image';

export default function AdminBrandsPage() {
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Brand | undefined>();
    const [target, setTarget] = useState<Brand | null>(null);

    const { data, isLoading, isError, error, isFetching } = useBrands({
        page, limit: 10, search: search || undefined, includeInactive: true,
    });
    const del = useDeleteBrand();

    return (
        <div>
            <PageHeader
                title="Thương hiệu"
                description="Quản lý thương hiệu & logo."
                action={<Button onClick={() => { setEditing(undefined); setModalOpen(true); }}><Plus className="h-4 w-4" /> Thêm thương hiệu</Button>}
            />

            <form onSubmit={(e) => {
                e.preventDefault();
                setPage(1);
                setSearch(searchInput.trim());
            }} className="mb-4 flex max-w-sm gap-2">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Tìm theo tên…" className="pl-9" />
                </div>
                <Button variant="secondary" type="submit">Tìm</Button>
            </form>

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
                                    <th className="px-4 py-3">Logo</th>
                                    <th className="px-4 py-3">Tên</th>
                                    <th className="px-4 py-3">Slug</th>
                                    <th className="px-4 py-3">Trạng thái</th>
                                    <th className="px-4 py-3 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data!.data.length === 0 && (
                                    <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">Không có thương hiệu.</td></tr>
                                )}
                                {data!.data.map((b) => (
                                    <tr key={b.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                                                {b.logoUrl ? (
                                                    <Image src={b.logoUrl} alt={b.name} width={40} height={40} className="h-full w-full object-contain" />
                                                ) : (
                                                    <ImageOff className="h-4 w-4 text-gray-300" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{b.name}</td>
                                        <td className="px-4 py-3 text-gray-400">{b.slug}</td>
                                        <td className="px-4 py-3"><Badge color={b.isActive ? 'green' : 'gray'}>{b.isActive ? 'Hiển thị' : 'Ẩn'}</Badge></td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                <button onClick={() => { setEditing(b); setModalOpen(true); }} title="Sửa" className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600">
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => setTarget(b)} title="Xóa" className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
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
                    <span>Trang {data.meta.page}/{data.meta.totalPages} — {data.meta.total} thương hiệu</span>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" disabled={page <= 1 || isFetching} onClick={() => setPage((p) => p - 1)}>Trước</Button>
                        <Button variant="secondary" size="sm" disabled={page >= data.meta.totalPages || isFetching} onClick={() => setPage((p) => p + 1)}>Sau</Button>
                    </div>
                </div>
            )}

            <BrandFormModal open={modalOpen} onClose={() => setModalOpen(false)} brand={editing} />
            <ConfirmDialog
                open={target !== null}
                title="Xóa thương hiệu"
                message={`Xóa "${target?.name}"? Logo trên R2 cũng sẽ bị xóa.`}
                error={del.isError ? getApiErrorMessage(del.error) : undefined}
                loading={del.isPending}
                onClose={() => { setTarget(null); del.reset(); }}
                onConfirm={() => { if (target) del.mutate(target.id, { onSuccess: () => setTarget(null) }); }}
            />
        </div>
    );
}