'use client';
import { useState } from 'react';
import Link from 'next/link';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useProductReviews, useReviewEligibility, useCreateReview } from '../hooks/use-reviews';
import { Stars, StarInput } from './stars';
import { BadgeCheck } from 'lucide-react';

export function ProductReviews({ productId }: { productId: string }) {
    const authStatus = useAuthStore((s) => s.status);
    const { data, isLoading } = useProductReviews(productId);
    const eligibility = useReviewEligibility(productId);
    const create = useCreateReview(productId);

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const submit = () => {
        if (rating < 1) return;
        create.mutate({ rating, comment: comment.trim() || undefined }, { onSuccess: () => setComment('') });
    };

    const renderForm = () => {
        if (authStatus !== 'authenticated') {
            return <p className="text-sm text-gray-500"><Link href="/login" className="font-medium text-blue-600 hover:underline">Đăng nhập</Link> để đánh giá.</p>;
        }
        const e = eligibility.data;
        if (!e) return null;
        if (e.alreadyReviewed) {
            return <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                Bạn đã đánh giá sản phẩm này{e.reviewStatus === 'PENDING' ? ' — đang chờ duyệt.' : e.reviewStatus === 'REJECTED' ? ' — đánh giá không được duyệt.' : '.'}
            </p>;
        }
        if (!e.canReview) {
            return <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">Chỉ đánh giá được khi bạn đã mua và nhận hàng sản phẩm này.</p>;
        }
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="mb-2 text-sm font-medium text-gray-700">Đánh giá của bạn</p>
                <StarInput value={rating} onChange={setRating} />
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Chia sẻ cảm nhận của bạn…"
                    className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                <div className="mt-2 flex items-center justify-between">
                    {create.isSuccess ? <span className="text-sm text-green-600">Đã gửi! Đánh giá sẽ hiển thị sau khi được duyệt.</span>
                        : create.isError ? <span className="text-sm text-red-600">{getApiErrorMessage(create.error)}</span>
                            : <span />}
                    <button type="button" onClick={submit} disabled={create.isPending}
                        className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                        {create.isPending ? 'Đang gửi…' : 'Gửi đánh giá'}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <section className="mt-12">
            <div className="mb-4 flex items-center gap-3">
                <h2 className="text-lg font-bold text-gray-900">Đánh giá sản phẩm</h2>
                {data && data.count > 0 && (
                    <span className="flex items-center gap-2 text-sm text-gray-600">
                        <Stars value={data.average} /> <b className="text-gray-900">{data.average}</b>/5 · {data.count} đánh giá
                    </span>
                )}
            </div>

            <div className="mb-6">{renderForm()}</div>

            {isLoading ? (
                <p className="text-sm text-gray-400">Đang tải…</p>
            ) : (data?.items.length ?? 0) === 0 ? (
                <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">Chưa có đánh giá nào được duyệt.</p>
            ) : (
                <ul className="space-y-4">
                    {data!.items.map((r) => (
                        <li key={r.id} className="rounded-xl border border-gray-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
                                    {r.userName}
                                    {r.verifiedPurchase && (
                                        <span className="inline-flex items-center gap-0.5 rounded-full bg-green-50 px-1.5 py-0.5 text-[11px] font-medium text-green-600">
                                            <BadgeCheck className="h-3 w-3" /> Đã mua
                                        </span>
                                    )}
                                </span>
                                <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <Stars value={r.rating} size={14} />
                            {r.comment && <p className="mt-2 text-sm text-gray-700">{r.comment}</p>}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}