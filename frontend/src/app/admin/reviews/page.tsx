'use client';
import { useState } from 'react';
import { Check, Search, Star, Trash2, X } from 'lucide-react';
import { PageHeader } from '@/shared/components/admin/page-header';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Spinner } from '@/shared/ui/spinner';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { Stars } from '@/features/reviews/components/stars';
import { useAdminReviews, useSetReviewStatus, useDeleteReview } from '@/features/reviews/hooks/use-reviews';
import type { AdminReview, ReviewStatus } from '@/features/reviews/types';

const STATUS: Record<ReviewStatus, { label: string; color: 'amber' | 'green' | 'red' }> = {
    PENDING: { label: 'Chờ duyệt', color: 'amber' },
    APPROVED: { label: 'Đã duyệt', color: 'green' },
    REJECTED: { label: 'Từ chối', color: 'red' },
};

export default function AdminReviewsPage() {
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [deleting, setDeleting] = useState<AdminReview | null>(null);

    const { data, isLoading, isError, error, isFetching } = useAdminReviews({ page, limit: 15, search: search || undefined, status: status || undefined });
    const setReview = useSetReviewStatus();
    const del = useDeleteReview();

    return (
        <div>
            <PageHeader title="Đánh giá" description="Kiểm duyệt đánh giá của khách hàng." />

            <div className="mb-4 flex flex-wrap gap-2">
                <form onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(searchInput.trim()); }} className="relative w-full max-w-xs">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Tìm nội dung…" className="pl-9" />
                </form>
                <Select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }} className="w-44">
                    <option value="">Tất cả</option>
                    <option value="PENDING">Chờ duyệt</option>
                    <option value="APPROVED">Đã duyệt</option>
                    <option value="REJECTED">Từ chối</option>
                </Select>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                {isLoading ? <div className="flex justify-center py-16"><Spinner /></div>
                    : isError ? <div className="p-6 text-sm text-red-600">{getApiErrorMessage(error)}</div>
                        : (
                            <ul className="divide-y divide-gray-100">
                                {data!.data.length === 0 && (
                                    <li className="px-4 py-12 text-center text-gray-400"><Star className="mx-auto mb-2 h-8 w-8 text-gray-300" />Chưa có đánh giá.</li>
                                )}
                                {data!.data.map((r) => (
                                    <li key={r.id} className="p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-1 flex items-center gap-2">
                                                    <span className="text-xs font-medium text-gray-500">{r.product.name}</span>
                                                    <Badge color={STATUS[r.status].color}>{STATUS[r.status].label}</Badge>
                                                </div>
                                                <Stars value={r.rating} size={14} />
                                                {r.comment && <p className="mt-1 text-sm text-gray-800">{r.comment}</p>}
                                                <p className="mt-0.5 text-xs text-gray-400">{r.user.fullName} · {new Date(r.createdAt).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                            <div className="flex shrink-0 gap-1">
                                                {r.status !== 'APPROVED' && (
                                                    <button onClick={() => setReview.mutate({ id: r.id, status: 'APPROVED' })} title="Duyệt" className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-green-50 hover:text-green-600"><Check className="h-4 w-4" /></button>
                                                )}
                                                {r.status !== 'REJECTED' && (
                                                    <button onClick={() => setReview.mutate({ id: r.id, status: 'REJECTED' })} title="Từ chối" className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"><X className="h-4 w-4" /></button>
                                                )}
                                                <button onClick={() => setDeleting(r)} title="Xoá" className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
            </div>

            {data && data.meta.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span>Trang {data.meta.page}/{data.meta.totalPages} — {data.meta.total} đánh giá</span>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" disabled={page <= 1 || isFetching} onClick={() => setPage((p) => p - 1)}>Trước</Button>
                        <Button variant="secondary" size="sm" disabled={page >= data.meta.totalPages || isFetching} onClick={() => setPage((p) => p + 1)}>Sau</Button>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={deleting !== null}
                title="Xoá đánh giá"
                message="Xoá đánh giá này?"
                confirmText="Xoá"
                error={del.isError ? getApiErrorMessage(del.error) : undefined}
                loading={del.isPending}
                onClose={() => { setDeleting(null); del.reset(); }}
                onConfirm={() => { if (deleting) del.mutate(deleting.id, { onSuccess: () => setDeleting(null) }); }}
            />
        </div>
    );
}