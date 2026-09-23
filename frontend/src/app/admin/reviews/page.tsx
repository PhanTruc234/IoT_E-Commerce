'use client';
import { useState } from 'react';
import { Check, Search, Star, Trash2, X } from 'lucide-react';
import { PageHeader } from '@/shared/components/admin/page-header';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Spinner } from '@/shared/ui/spinner';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { Modal } from '@/shared/ui/modal';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { Stars } from '@/features/reviews/components/stars';
import { useAdminReviews, useSetReviewStatus, useDeleteReview } from '@/features/reviews/hooks/use-reviews';
import { REVIEW_MODERATION_REASON } from '@/features/reviews/types';
import type { AdminReview, ReviewModerationReason, ReviewStatus } from '@/features/reviews/types';

const STATUS: Record<ReviewStatus, { label: string; color: 'amber' | 'green' | 'red' }> = {
    PENDING: { label: 'Chờ duyệt', color: 'amber' },
    APPROVED: { label: 'Đã duyệt', color: 'green' },
    REJECTED: { label: 'Từ chối', color: 'red' },
};

type Moderating = { review: AdminReview; action: 'REJECT' | 'DELETE' };

export default function AdminReviewsPage() {
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [moderating, setModerating] = useState<Moderating | null>(null);

    const { data, isLoading, isError, error, isFetching } = useAdminReviews({ page, limit: 15, search: search || undefined, status: status || undefined });
    const setReview = useSetReviewStatus();

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
                                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                                    <span className="text-xs font-medium text-gray-500">{r.product.name}</span>
                                                    <Badge color={STATUS[r.status].color}>{STATUS[r.status].label}</Badge>
                                                    {r.verifiedPurchase && <Badge color="green">✓ Đã mua</Badge>}
                                                </div>
                                                <Stars value={r.rating} size={14} />
                                                {r.comment && <p className="mt-1 text-sm text-gray-800">{r.comment}</p>}
                                                <p className="mt-0.5 text-xs text-gray-400">{r.user.fullName} · {new Date(r.createdAt).toLocaleDateString('vi-VN')}</p>
                                                {r.status === 'REJECTED' && r.moderationReason && (
                                                    <p className="mt-1 text-xs text-red-500">Lý do từ chối: {REVIEW_MODERATION_REASON[r.moderationReason]}</p>
                                                )}
                                            </div>
                                            <div className="flex shrink-0 gap-1">
                                                {r.status !== 'APPROVED' && (
                                                    <button onClick={() => setReview.mutate({ id: r.id, status: 'APPROVED' })} title="Duyệt" className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-green-50 hover:text-green-600"><Check className="h-4 w-4" /></button>
                                                )}
                                                {r.status !== 'REJECTED' && (
                                                    <button onClick={() => setModerating({ review: r, action: 'REJECT' })} title="Từ chối" className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"><X className="h-4 w-4" /></button>
                                                )}
                                                <button onClick={() => setModerating({ review: r, action: 'DELETE' })} title="Xoá" className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
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

            {moderating && <ModerationModal item={moderating} onClose={() => setModerating(null)} />}
        </div>
    );
}

function ModerationModal({ item, onClose }: { item: Moderating; onClose: () => void }) {
    const isDelete = item.action === 'DELETE';
    const setReview = useSetReviewStatus();
    const del = useDeleteReview();
    const [reason, setReason] = useState<ReviewModerationReason>('SPAM');
    const pending = setReview.isPending || del.isPending;
    const errorMsg = setReview.isError ? getApiErrorMessage(setReview.error) : del.isError ? getApiErrorMessage(del.error) : null;

    const submit = () => {
        if (isDelete) del.mutate({ id: item.review.id, reason }, { onSuccess: onClose });
        else setReview.mutate({ id: item.review.id, status: 'REJECTED', reason }, { onSuccess: onClose });
    };

    return (
        <Modal open onClose={onClose} title={isDelete ? 'Xoá đánh giá' : 'Từ chối đánh giá'}
            footer={<>
                <Button variant="secondary" type="button" onClick={onClose}>Hủy</Button>
                <Button variant="danger" type="button" onClick={submit} disabled={pending}>
                    {pending ? 'Đang xử lý…' : isDelete ? 'Xoá đánh giá' : 'Từ chối'}
                </Button>
            </>}>
            <div className="space-y-3">
                <div className="rounded-lg bg-gray-50 p-3 text-sm">
                    <p className="text-xs text-gray-400">{item.review.product.name} · {item.review.user.fullName}</p>
                    {item.review.comment && <p className="mt-1 text-gray-800">{item.review.comment}</p>}
                </div>
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Lý do <span className="text-red-500">*</span></label>
                    <Select value={reason} onChange={(e) => setReason(e.target.value as ReviewModerationReason)}>
                        {Object.entries(REVIEW_MODERATION_REASON).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </Select>
                    <p className="mt-1 text-xs text-gray-400">Lý do được lưu vào nhật ký kiểm duyệt (audit log).</p>
                </div>
                {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
            </div>
        </Modal>
    );
}